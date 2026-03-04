// ═══════════════════════════════════════════════════════════════
// agency-isolation.js — Automatic per-agency data isolation
// Patches window.db AND window.supabaseClient after they initialize
// so every Supabase query is scoped to the logged-in agency_id.
// Loaded in portal/index.html ONLY — never on /app/
// ═══════════════════════════════════════════════════════════════
(function() {
'use strict';

var TENANT_TABLES = [
    'crm_contacts','contacts','activity_log','communications','tasks','approvals',
    'client_sites','sms_campaigns','sms_drip_queue','sms_replies','sms_suppression',
    'identified_visitors','visitor_page_views','retargeting_audiences',
    'retargeting_campaigns','retargeting_setups','geo_grid_scans',
    'push_campaigns','push_subscriptions','visitor_auto_emails','chat_logs',
    'clients','orders','invoices','proofs','projects','leads','meetings','submissions'
];

var NUI_ONLY_TABLES = [
    'agency_subaccounts','site_config','tenant_ai_assistants',
    'app_sync','holiday_drip_templates'
];

function _getAgencyId() {
    try {
        var raw = localStorage.getItem('nui_agency_session') ||
                  sessionStorage.getItem('nui_agency_session');
        if (!raw) return null;
        var sess = JSON.parse(raw);
        return (sess && sess.slug) ? sess.slug : null;
    } catch(e) { return null; }
}

function _patchClient(client, agencyId) {
    if (!client || !client.from) return false;
    if (client.__nuiIsolated === agencyId) return true; // already done

    var _orig = client.from.bind(client);

    client.from = function(table) {
        var q = _orig(table);

        // Pass through NUI system tables untouched
        if (NUI_ONLY_TABLES.indexOf(table) !== -1) return q;
        // Pass through unknown tables
        if (TENANT_TABLES.indexOf(table) === -1) return q;

        // ── SELECT: auto-filter by agency_id ──
        var _sel = q.select.bind(q);
        q.select = function() {
            return _sel.apply(this, arguments).eq('agency_id', agencyId);
        };

        // ── INSERT: auto-inject agency_id ──
        var _ins = q.insert.bind(q);
        q.insert = function(data) {
            if (Array.isArray(data)) {
                data = data.map(function(r){ return Object.assign({}, r, {agency_id: agencyId}); });
            } else if (data && typeof data === 'object') {
                data = Object.assign({}, data, {agency_id: agencyId});
            }
            return _ins.call(this, data);
        };

        // ── UPDATE: scope to agency ──
        var _upd = q.update.bind(q);
        q.update = function(data) {
            return _upd.call(this, data).eq('agency_id', agencyId);
        };

        // ── DELETE: scope to agency ──
        var _del = q.delete.bind(q);
        q.delete = function() {
            return _del.call(this).eq('agency_id', agencyId);
        };

        return q;
    };

    client.__nuiIsolated = agencyId;
    return true;
}

function _apply() {
    var agencyId = _getAgencyId();
    if (!agencyId) return false; // not a tenant session

    var patched = false;

    // Patch window.db (used by most admin JS files)
    if (window.db) {
        _patchClient(window.db, agencyId);
        patched = true;
    }

    // Patch window.supabaseClient (exported by supabase-client.js)
    if (window.supabaseClient) {
        _patchClient(window.supabaseClient, agencyId);
        patched = true;
    }

    // Make both point to the same patched object
    if (window.db && !window.supabaseClient) window.supabaseClient = window.db;
    if (window.supabaseClient && !window.db)  window.db = window.supabaseClient;

    if (patched) {
        console.log('[NUI Isolation] Active — agency_id:', agencyId);
        window._nuiAgencyId = agencyId;
    }

    return patched;
}

// ── Intercept supabase-client.js window.supabaseClient assignment ──
// This fires the moment the client is created, before any panel JS runs
var _desc = Object.getOwnPropertyDescriptor(window, 'supabaseClient');
if (!_desc || _desc.configurable !== false) {
    var _internalVal = window.supabaseClient || null;
    try {
        Object.defineProperty(window, 'supabaseClient', {
            configurable: true,
            get: function() { return _internalVal; },
            set: function(v) {
                _internalVal = v;
                // Client just got created — patch it immediately
                var id = _getAgencyId();
                if (id && v) {
                    _patchClient(v, id);
                    window.db = v; // keep db in sync
                    console.log('[NUI Isolation] Intercepted supabaseClient — agency_id:', id);
                }
            }
        });
    } catch(e) {}
}

// Also intercept window.db assignment
var _dbVal = window.db || null;
try {
    Object.defineProperty(window, 'db', {
        configurable: true,
        get: function() { return _dbVal; },
        set: function(v) {
            _dbVal = v;
            var id = _getAgencyId();
            if (id && v) {
                _patchClient(v, id);
                console.log('[NUI Isolation] Intercepted db — agency_id:', id);
            }
        }
    });
} catch(e) {}

// Retry loop as safety net (catches any edge cases)
var _attempts = 0;
var _interval = setInterval(function() {
    if (_apply()) {
        // Keep checking to catch late db init (deferred scripts)
    }
    if (++_attempts > 60) clearInterval(_interval); // stop after 15s
}, 250);

// Also apply on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() { _apply(); });

})();
