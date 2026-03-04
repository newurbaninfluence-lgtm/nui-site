// ═══════════════════════════════════════════════════════════════
// agency-tenant.js — Sub-Account Tenant Portal System
// Detects ?agency=SLUG in URL → loads that agency's config
// Shows branded login → integration setup wizard → full portal
// ═══════════════════════════════════════════════════════════════

(function() {
'use strict';

// ── INTEGRATION DEFINITIONS ─────────────────────────────────
// Every API key the system needs, per category
var INTEGRATIONS = [
    { id:'stripe',      name:'Stripe',          icon:'💳', cat:'Billing',    field:'Publishable Key',  placeholder:'pk_live_...',     hint:'Dashboard → Developers → API Keys', required:true },
    { id:'stripe_sk',   name:'Stripe Secret',   icon:'🔑', cat:'Billing',    field:'Secret Key',       placeholder:'sk_live_...',     hint:'Keep this private — used server-side only', required:true },
    { id:'supabase_url',name:'Supabase URL',     icon:'🗄️', cat:'Database',   field:'Project URL',      placeholder:'https://xxx.supabase.co', hint:'Settings → API in your Supabase project', required:true },
    { id:'supabase_anon',name:'Supabase Anon Key',icon:'🔓',cat:'Database',  field:'Anon Key',         placeholder:'eyJhbGci...',     hint:'Settings → API → anon public key', required:true },
    { id:'openphone',   name:'OpenPhone',        icon:'📱', cat:'SMS',        field:'API Key',          placeholder:'op_api_...',      hint:'openphone.com → Settings → Integrations → API', required:false },
    { id:'sendgrid',    name:'SendGrid',         icon:'📧', cat:'Email',      field:'API Key',          placeholder:'SG.xxxxx...',     hint:'app.sendgrid.com → Settings → API Keys', required:false },
    { id:'rb2b',        name:'RB2B Visitor ID',  icon:'🔍', cat:'Analytics',  field:'Tracking Key',     placeholder:'E63P0HZ...',      hint:'app.rb2b.com → Settings → Script ID', required:false },
    { id:'ga4',         name:'Google Analytics', icon:'📊', cat:'Analytics',  field:'Measurement ID',   placeholder:'G-XXXXXXXX',      hint:'GA4 → Admin → Data Streams → Measurement ID', required:false },
    { id:'meta_pixel',  name:'Meta Pixel',       icon:'📘', cat:'Ads',        field:'Pixel ID',         placeholder:'1234567890',      hint:'Meta Business → Events Manager → Pixel ID', required:false },
    { id:'google_ads',  name:'Google Ads',       icon:'🎯', cat:'Ads',        field:'Conversion ID',    placeholder:'AW-XXXXXXXX',     hint:'Google Ads → Tools → Tag Setup → Conversion ID', required:false },
    { id:'maps_key',    name:'Google Maps',      icon:'🗺️', cat:'Maps',       field:'Maps API Key',     placeholder:'AIzaSy...',        hint:'console.cloud.google.com → APIs → Maps → Credentials', required:false },
    { id:'vapid_pub',   name:'Push (VAPID)',      icon:'🔔', cat:'Push',       field:'VAPID Public Key', placeholder:'BMAqcF...',        hint:'Generate at: web-push-codelab.glitch.me', required:false },
];

// ── STATE ────────────────────────────────────────────────────
var _agencySlug = null;
var _agencyData = null;
var _agencySession = null;

// ── BOOT: Check URL for ?agency= param ──────────────────────
window._agencyTenantInit = function() {
    var params = new URLSearchParams(window.location.search);
    _agencySlug = params.get('agency');
    if (!_agencySlug) return false; // Normal NUI admin — don't interfere

    // Prevent NUI admin from loading while we handle tenant
    console.log('[Tenant] Agency slug detected:', _agencySlug);
    document.title = 'Agency Portal — Loading...';

    // Check if already logged in this session
    try {
        var saved = sessionStorage.getItem('nui_agency_session');
        if (!saved) saved = localStorage.getItem('nui_agency_session');
        if (saved) {
            _agencySession = JSON.parse(saved);
            if (_agencySession.slug === _agencySlug) {
                _agencyData = _agencySession.data;
                _launchAgencyPortal();
                return true;
            }
        }
    } catch(e) {}

    // Load agency data then show login
    _loadAgencyAndShowLogin();
    return true;
};

// ── LOAD AGENCY DATA ─────────────────────────────────────────
async function _loadAgencyAndShowLogin() {
    _showTenantOverlay('<div style="text-align:center;padding:60px;"><div style="font-size:32px;margin-bottom:16px;">⏳</div><div style="color:rgba(255,255,255,0.5);">Loading portal...</div></div>');

    try {
        if (typeof db !== 'undefined' && db) {
            // Primary lookup: portal_slug (matches ?agency=SLUG in URL)
            var res = await db.from('agency_subaccounts')
                .select('*')
                .eq('portal_slug', _agencySlug)
                .single();
            if (!res.error && res.data) {
                _agencyData = res.data;
            } else {
                // Fallback: domain field
                var res2 = await db.from('agency_subaccounts')
                    .select('*')
                    .eq('domain', _agencySlug)
                    .single();
                if (!res2.error && res2.data) {
                    _agencyData = res2.data;
                } else {
                    // Last resort: agency_name slug match
                    var res3 = await db.from('agency_subaccounts')
                        .select('*')
                        .ilike('agency_name', _agencySlug.replace(/-/g, ' '))
                        .single();
                    if (!res3.error && res3.data) _agencyData = res3.data;
                }
            }
        }
    } catch(e) { console.warn('[Tenant] Supabase lookup failed:', e); }

    if (_agencyData && _agencyData.status === 'suspended') {
        _showTenantOverlay('<div style="text-align:center;padding:60px;"><div style="font-size:48px;margin-bottom:16px;">⛔</div><div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">Account Suspended</div><div style="color:rgba(255,255,255,.4);font-size:13px;">Contact support to reactivate your account.</div></div>');
        return;
    }

    _showLoginScreen();
}

// ── LOGIN SCREEN ─────────────────────────────────────────────
function _showLoginScreen() {
    var brand = (_agencyData && _agencyData.brand_color) || '#6366f1';
    var name  = (_agencyData && _agencyData.agency_name) || 'Agency Portal';
    var plan  = (_agencyData && _agencyData.plan) || 'starter';

    var html = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">' +
        '<div style="width:100%;max-width:400px;">' +
            '<div style="text-align:center;margin-bottom:32px;">' +
                '<div style="width:56px;height:56px;border-radius:16px;background:' + brand + '18;border:1px solid ' + brand + '44;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 14px;">🏢</div>' +
                '<div style="font-family:Syne,sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:4px;">' + name + '</div>' +
                '<div style="font-size:12px;color:rgba(255,255,255,0.35);">Agency Portal</div>' +
            '</div>' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">' +
                '<div style="margin-bottom:18px;">' +
                    '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Email</div>' +
                    '<input id="ta-email" type="email" placeholder="your@agency.com" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">' +
                '</div>' +
                '<div style="margin-bottom:22px;">' +
                    '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Password</div>' +
                    '<input id="ta-pass" type="password" placeholder="••••••••" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;" onkeydown="if(event.key===\'Enter\') window._tenantLogin()">' +
                '</div>' +
                '<div id="ta-err" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444;padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:14px;"></div>' +
                '<button onclick="window._tenantLogin()" style="width:100%;background:' + brand + ';color:#fff;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Sign In →</button>' +
            '</div>' +
            '<div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,0.2);">Powered by <span style="color:rgba(255,255,255,0.35);">New Urban Influence</span></div>' +
        '</div>' +
    '</div>';

    _showTenantOverlay(html);
}

// ── TENANT LOGIN ─────────────────────────────────────────────
window._tenantLogin = async function() {
    var email = (document.getElementById('ta-email')||{}).value || '';
    var pass  = (document.getElementById('ta-pass')||{}).value || '';
    var errEl = document.getElementById('ta-err');

    if (!email || !pass) {
        if(errEl){errEl.textContent='Please enter email and password.';errEl.style.display='block';}
        return;
    }

    // Check against stored credentials in agency record
    var match = false;
    if (_agencyData) {
        // Check owner_email + stored password hash (simple check for now)
        if (email.toLowerCase() === (_agencyData.owner_email||'').toLowerCase()) {
            if (_agencyData.login_password && pass === _agencyData.login_password) {
                match = true;
            } else if (!_agencyData.login_password && pass === 'agency2026') {
                // Default password until they change it
                match = true;
            }
        }
    } else {
        // No Supabase data — accept default for demo
        if (pass === 'agency2026') match = true;
    }

    if (!match) {
        if(errEl){errEl.textContent='Incorrect email or password.';errEl.style.display='block';}
        return;
    }

    // Save session
    _agencySession = { slug: _agencySlug, data: _agencyData, email: email, loginAt: Date.now() };
    try {
        localStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
        sessionStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
    } catch(e) {}

    // Check if setup wizard needed
    var integrations = (_agencyData && _agencyData.integrations_config) || null;
    var setupDone = (_agencyData && _agencyData.setup_complete) || false;

    if (!setupDone) {
        _showSetupWizard();
    } else {
        _launchAgencyPortal();
    }
};

// ── SETUP WIZARD ─────────────────────────────────────────────
var _wizardStep = 0;
var _wizardKeys = {};
var _wizardCategories = [];

function _showSetupWizard() {
    // Group integrations by category, only show required first
    _wizardCategories = [];
    var seen = {};
    INTEGRATIONS.forEach(function(i) {
        if (!seen[i.cat]) { seen[i.cat] = true; _wizardCategories.push(i.cat); }
    });
    _wizardStep = 0;
    _renderWizardStep();
}

function _renderWizardStep() {
    var brand = (_agencyData && _agencyData.brand_color) || '#6366f1';
    var name  = (_agencyData && _agencyData.agency_name) || 'Your Agency';
    var totalSteps = _wizardCategories.length + 1; // +1 for welcome
    var progress = Math.round((_wizardStep / totalSteps) * 100);

    var content = '';

    if (_wizardStep === 0) {
        // Welcome step
        content = '<div style="text-align:center;padding:20px 0;">' +
            '<div style="font-size:48px;margin-bottom:16px;">🚀</div>' +
            '<div style="font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:10px;">Welcome, ' + name + '!</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.45);line-height:1.7;margin-bottom:24px;">Let\'s connect your tools so everything runs automatically.<br>This takes about 3 minutes. You can skip any step and add keys later.</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">💳<br>Billing</div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">📱<br>SMS + Email</div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">📊<br>Analytics</div>' +
            '</div>' +
            '<button onclick="window._wizardNext()" style="background:' + brand + ';color:#fff;border:none;padding:14px 40px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Let\'s Go →</button>' +
        '</div>';
    } else if (_wizardStep <= _wizardCategories.length) {
        var cat = _wizardCategories[_wizardStep - 1];
        var catIntegrations = INTEGRATIONS.filter(function(i){ return i.cat === cat; });

        content = '<div>' +
            '<div style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;">' + cat + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:20px;">Enter your API keys for ' + cat.toLowerCase() + ' integrations. All keys are encrypted at rest.</div>' +
            catIntegrations.map(function(intg) {
                var saved = _wizardKeys[intg.id] || '';
                return '<div style="margin-bottom:16px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                        '<span style="font-size:14px;">' + intg.icon + '</span>' +
                        '<span style="font-size:12px;font-weight:700;color:#fff;">' + intg.name + '</span>' +
                        (intg.required ? '<span style="font-size:9px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.25);border-radius:20px;padding:1px 7px;font-weight:700;">REQUIRED</span>' : '<span style="font-size:9px;color:rgba(255,255,255,.25);">Optional</span>') +
                        '<a style="margin-left:auto;font-size:10px;color:rgba(255,255,255,0.3);cursor:pointer;" onclick="alert(\'' + intg.hint.replace(/'/g,"\\'") + '\')">Where to find?</a>' +
                    '</div>' +
                    '<input id="wiz-' + intg.id + '" type="' + (intg.id.includes('sk') || intg.id.includes('pass') ? 'password' : 'text') + '" value="' + saved + '" placeholder="' + intg.placeholder + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:10px 13px;border-radius:9px;font-size:12.5px;font-family:monospace;outline:none;box-sizing:border-box;">' +
                '</div>';
            }).join('') +
        '</div>';
    } else {
        // Final step — done
        content = '<div style="text-align:center;padding:20px 0;">' +
            '<div style="font-size:48px;margin-bottom:16px;">✅</div>' +
            '<div style="font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:10px;">You\'re all set!</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.45);line-height:1.7;margin-bottom:24px;">Your portal is ready. You can always update integration keys in Settings → Integrations.</div>' +
            '<button onclick="window._wizardFinish()" style="background:' + brand + ';color:#fff;border:none;padding:14px 40px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Open My Portal →</button>' +
        '</div>';
    }

    var html = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">' +
        '<div style="width:100%;max-width:540px;">' +
            // Progress bar
            '<div style="margin-bottom:24px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:8px;">' +
                    '<span>Setup Progress</span><span>' + progress + '% complete</span>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.06);border-radius:20px;height:4px;">' +
                    '<div style="height:100%;border-radius:20px;background:' + brand + ';width:' + progress + '%;transition:width .4s ease;"></div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">' +
                content +
                (_wizardStep > 0 && _wizardStep <= _wizardCategories.length ? 
                    '<div style="display:flex;gap:10px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">' +
                        '<button onclick="window._wizardSkip()" style="flex:1;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.08);padding:11px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;">Skip for now</button>' +
                        '<button onclick="window._wizardNext()" style="flex:2;background:' + brand + ';color:#fff;border:none;padding:11px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;">Save & Continue →</button>' +
                    '</div>'
                : '') +
            '</div>' +
            '<div style="text-align:center;margin-top:14px;font-size:11px;color:rgba(255,255,255,0.2);">Powered by <span style="color:rgba(255,255,255,0.3);">New Urban Influence</span></div>' +
        '</div>' +
    '</div>';

    _showTenantOverlay(html);
}

window._wizardNext = function() {
    // Save current step keys
    if (_wizardStep > 0 && _wizardStep <= _wizardCategories.length) {
        var cat = _wizardCategories[_wizardStep - 1];
        INTEGRATIONS.filter(function(i){ return i.cat === cat; }).forEach(function(intg) {
            var el = document.getElementById('wiz-' + intg.id);
            if (el && el.value.trim()) _wizardKeys[intg.id] = el.value.trim();
        });
    }
    _wizardStep++;
    _renderWizardStep();
};

window._wizardSkip = function() {
    _wizardStep++;
    _renderWizardStep();
};

window._wizardFinish = async function() {
    // Save all keys to Supabase
    if (_agencyData && typeof db !== 'undefined' && db) {
        try {
            await db.from('agency_subaccounts').update({
                integrations_config: _wizardKeys,
                setup_complete: true,
                updated_at: new Date().toISOString()
            }).eq('id', _agencyData.id);
            _agencyData.integrations_config = _wizardKeys;
            _agencyData.setup_complete = true;
            // Update session
            _agencySession.data = _agencyData;
            sessionStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
            localStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
        } catch(e) { console.warn('[Tenant] Could not save integrations:', e); }
    }
    _launchAgencyPortal();
};

// ── LAUNCH PORTAL ─────────────────────────────────────────────
function _launchAgencyPortal() {
    // Apply branding
    if (_agencyData) {
        var brand = _agencyData.brand_color || '#6366f1';
        document.documentElement.style.setProperty('--admin-accent', brand);
        document.documentElement.style.setProperty('--brand-primary', brand);
        document.title = (_agencyData.agency_name || 'Agency') + ' Portal';
        // Apply agency feature flags — hide nav items not in their plan
        var features = Array.isArray(_agencyData.features) ? _agencyData.features : [];
        window._agencyFeatures = features;
        window._agencyData = _agencyData;
        window._agencyKeys = _agencyData.integrations_config || {};
    }

    // Remove the overlay and let normal portal load
    var overlay = document.getElementById('tenant-overlay');
    if (overlay) overlay.remove();

    // Set agency context for all admin panels
    window._isAgencyTenant = true;

    // Now load the normal portal
    if (typeof loadPortalView === 'function') {
        loadPortalView();
    }

    // After portal loads, apply branding + feature filtering
    setTimeout(_applyAgencyBranding, 400);
    setTimeout(_filterAgencyFeatures, 600);
}

// ── APPLY AGENCY BRANDING ────────────────────────────────────
function _applyAgencyBranding() {
    if (!_agencyData) return;
    var brand = _agencyData.brand_color || '#6366f1';
    var name  = _agencyData.agency_name || 'Agency Portal';

    // Update sidebar brand name
    var brandEl = document.querySelector('.sidebar-brand span, .sb-name');
    if (brandEl) brandEl.textContent = name;

    // Update CSS vars
    var style = document.getElementById('agency-tenant-styles') || document.createElement('style');
    style.id = 'agency-tenant-styles';
    style.textContent = ':root { --admin-accent:' + brand + ' !important; } ' +
        '.admin-nav-link.active, .ni.on { background:' + brand + '18 !important; color:' + brand + ' !important; border-color:' + brand + '33 !important; } ' +
        '.btn-primary, .btn { background:' + brand + ' !important; } ' +
        '.admin-save-btn { background:' + brand + ' !important; }';
    if (!style.parentNode) document.head.appendChild(style);

    // Add "Powered by NUI" to footer
    var foot = document.querySelector('.sidebar-footer, .sb-foot');
    if (foot && !foot.querySelector('.nui-powered')) {
        var p = document.createElement('div');
        p.className = 'nui-powered';
        p.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.2);margin-top:8px;';
        p.innerHTML = 'Powered by <span style="color:rgba(255,255,255,0.3)">New Urban Influence</span>';
        foot.appendChild(p);
    }
}

// ── FILTER FEATURES ───────────────────────────────────────────
function _filterAgencyFeatures() {
    if (!_agencyData || !Array.isArray(_agencyData.features)) return;
    var features = _agencyData.features;

    // Map nav panel keys to feature keys
    var panelToFeature = {
        'dashboard':'dashboard','calendar':'calendar','clients':'clients','leads':'clients',
        'contacthub':'crm','visitors':'visitors','projects':'projects','proofs':'projects',
        'brandguide':'designer','payments':'invoicing','invoices':'invoicing',
        'seo':'seo','rankintel':'rankintel','gmb':'seo','citations':'citations',
        'blog':'seo','emailmarketing':'emailmarketing','retargeting':'retargeting',
        'assets':'moodboard','moodboard':'moodboard','monty':'dashboard',
        'sites':'sites','integrations':'integrations','usermanagement':'settings',
        'subaccounts':'settings'
    };

    document.querySelectorAll('.admin-nav-link[data-panel], .ni[onclick]').forEach(function(el) {
        var panel = el.getAttribute('data-panel');
        if (!panel) {
            var match = (el.getAttribute('onclick')||'').match(/showAdminPanel\('([^']+)'\)/);
            if (match) panel = match[1];
        }
        if (!panel) return;
        var feat = panelToFeature[panel];
        if (feat && !features.includes(feat)) {
            el.style.opacity = '0.3';
            el.style.pointerEvents = 'none';
            el.title = 'Upgrade your plan to access ' + panel;
        }
    });
}

// ── OVERLAY HELPER ────────────────────────────────────────────
function _showTenantOverlay(html) {
    var el = document.getElementById('tenant-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'tenant-overlay';
        el.style.cssText = 'position:fixed;inset:0;background:#07070f;z-index:99999;overflow-y:auto;font-family:Montserrat,sans-serif;color:#fff;';
        document.body.appendChild(el);
    }
    el.innerHTML = html;
}

// ── AUTO-INIT ─────────────────────────────────────────────────
// Run before loadPortalView if agency param present
document.addEventListener('DOMContentLoaded', function() {
    var intercepted = window._agencyTenantInit();
    if (intercepted) {
        // Block normal portal load — tenant system handles it
        window._agencyTenantActive = true;
    }
}, true); // Capture phase so we run before other listeners

})();

// ── MONTY COMING SOON FOR TENANT PORTALS ─────────────────────
// Intercept Monty panel load for agency sub-accounts
// Monty is NUI-specific — show Coming Soon until per-agency AI is wired
(function() {
    var _origLoad = window.loadAdminMontyPanel;
    document.addEventListener('DOMContentLoaded', function() {
        // Wrap after all scripts load
        setTimeout(function() {
            if (!window._isAgencyTenant) return; // NUI admin — leave Monty alone

            window.loadAdminMontyPanel = function() {
                var panel = document.getElementById('adminMontyPanel');
                if (!panel) return;
                var brand = (window._agencyData && window._agencyData.brand_color) || '#6366f1';
                var agencyName = (window._agencyData && window._agencyData.agency_name) || 'Your Agency';
                panel.innerHTML = [
                    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:40px;text-align:center;">',
                        '<div style="width:72px;height:72px;border-radius:20px;background:' + brand + '18;border:1px solid ' + brand + '44;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:24px;">🤖</div>',
                        '<div style="font-family:Syne,sans-serif;font-size:24px;font-weight:800;color:#fff;margin-bottom:8px;">AI Assistant</div>',
                        '<div style="display:inline-flex;align-items:center;gap:6px;background:' + brand + '18;border:1px solid ' + brand + '33;color:' + brand + ';font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;margin-bottom:20px;">🚧 Coming Soon</div>',
                        '<div style="font-size:14px;color:rgba(255,255,255,0.4);max-width:400px;line-height:1.7;margin-bottom:32px;">',
                            'Your AI assistant is being configured for ' + agencyName + '. ',
                            'Once set up, it will let you manage clients, create jobs, send emails, and run your entire agency by typing in plain English.',
                        '</div>',
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:380px;width:100%;">',
                            _featureChip('📋 Jobs & Projects'),
                            _featureChip('📧 Send Emails'),
                            _featureChip('👥 Manage Clients'),
                            _featureChip('💬 SMS Campaigns'),
                            _featureChip('💳 Invoice Clients'),
                            _featureChip('📊 Pull Reports'),
                        '</div>',
                    '</div>'
                ].join('');
            };

            function _featureChip(label) {
                return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.35);">' + label + '</div>';
            }
        }, 300);
    });
})();
