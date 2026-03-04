// ═══════════════════════════════════════════════════════════════
// agency-isolation.js — Automatic data isolation for sub-accounts
// Wraps the Supabase client so every query is scoped to agency_id
// Loaded in portal/index.html ONLY — never on /app/ (NUI admin)
// ═══════════════════════════════════════════════════════════════
(function() {
'use strict';

// Tables that belong to NUI only — never filter these for tenants
var NUI_ONLY_TABLES = [
    'agency_subaccounts',
    'site_config',
    'tenant_ai_assistants',
    'app_sync',
    'holiday_drip_templates'
];

// Tables where agency owns the row — always filter
var TENANT_TABLES = [
    'crm_contacts','contacts','activity_log','communications','tasks','approvals',
    'client_sites','sms_campaigns','sms_drip_queue','sms_replies','sms_suppression',
    'identified_visitors','visitor_page_views','retargeting_audiences',
    'retargeting_campaigns','retargeting_setups','geo_grid_scans',
    'push_campaigns','push_subscriptions','visitor_auto_emails','chat_logs',
    'clients','orders','invoices','proofs','projects','leads','meetings','submissions'
];

// Wait until db (Supabase client) and agency session are both ready
function _applyIsolation() {
    var sess = null;
    try {
        var raw = localStorage.getItem('nui_agency_session') ||
                  sessionStorage.getItem('nui_agency_session');
        if (raw) sess = JSON.parse(raw);
    } catch(e) {}

    if (!sess || !sess.slug) return; // Not a tenant session — do nothing
    if (!window.db) return;           // Supabase client not ready yet

    var agencyId = sess.slug; // portal_slug is the agency_id key

    // Already patched this session
    if (window.db.__nuiIsolated === agencyId) return;

    var originalFrom = window.db.from.bind(window.db);

    window.db.from = function(table) {
        var query = originalFrom(table);

        // Skip NUI-only system tables
        if (NUI_ONLY_TABLES.indexOf(table) !== -1) return query;

        // Only patch tenant tables
        if (TENANT_TABLES.indexOf(table) === -1) return query;

        // Wrap select — auto-adds .eq('agency_id', agencyId)
        var originalSelect = query.select.bind(query);
        query.select = function() {
            return originalSelect.apply(this, arguments)
                .eq('agency_id', agencyId);
        };

        // Wrap insert — auto-injects agency_id into every record
        var originalInsert = query.insert.bind(query);
        query.insert = function(data) {
            if (Array.isArray(data)) {
                data = data.map(function(row) {
                    return Object.assign({}, row, { agency_id: agencyId });
                });
            } else if (data && typeof data === 'object') {
                data = Object.assign({}, data, { agency_id: agencyId });
            }
            return originalInsert.call(this, data);
        };

        // Wrap update — always scope to this agency
        var originalUpdate = query.update.bind(query);
        query.update = function(data) {
            return originalUpdate.call(this, data)
                .eq('agency_id', agencyId);
        };

        // Wrap delete — always scope to this agency
        var originalDelete = query.delete.bind(query);
        query.delete = function() {
            return originalDelete.call(this)
                .eq('agency_id', agencyId);
        };

        return query;
    };

    window.db.__nuiIsolated = agencyId;
    console.log('[NUI] Data isolation active — agency:', agencyId);

    // Expose for debugging
    window._nuiAgencyId = agencyId;
}

// Run immediately and also after DOM ready (db might not be set yet)
_applyIsolation();
document.addEventListener('DOMContentLoaded', function() {
    _applyIsolation();
    // Retry a few times in case db initializes late
    var attempts = 0;
    var interval = setInterval(function() {
        if (window.db && window.db.__nuiIsolated) {
            clearInterval(interval);
            return;
        }
        _applyIsolation();
        if (++attempts > 20) clearInterval(interval);
    }, 250);
});

})();
