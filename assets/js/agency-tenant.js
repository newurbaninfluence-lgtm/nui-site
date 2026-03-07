// ═══════════════════════════════════════════════════════════════
// agency-tenant.js — Sub-Account Tenant Portal System v2
// Role Picker: Admin | Designer | Client
// Zero NUI branding visible to sub-account users
// ═══════════════════════════════════════════════════════════════
(function() {
'use strict';

var _agencySlug   = null;
var _agencyData   = null;
var _agencyRole   = null; // 'admin' | 'designer' | 'client'
var _agencySession = null;
var _sb           = null; // private Supabase client — independent of global db

// Init own Supabase client — doesn't wait for supabase-client.js or defer scripts
function _getClient() {
    if (_sb) return _sb;
    // Wait for CDN library
    if (typeof supabase === 'undefined' || !supabase.createClient) return null;
    var url = 'https://jcgvkyizoimwbolhfpta.supabase.co';
    var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ3ZreWl6b2ltd2JvbGhmcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDMwMjQsImV4cCI6MjA4NTg3OTAyNH0.a8gjkPoUHQ1kgROa2Lqaq3252opqg5CPMm6vR3t1NOk';
    _sb = supabase.createClient(url, key);
    return _sb;
}

// ── BOOT ─────────────────────────────────────────────────────
window._agencyTenantInit = function() {
    var params = new URLSearchParams(window.location.search);
    var rawSlug = params.get('agency') || '';
    // Sanitize — strip anything that's not a-z, 0-9, hyphen
    _agencySlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!_agencySlug) return false;

    document.title = 'Portal — Loading...';
    _showOverlay(_html.loading());

    // Check URL token bypass (from Enter Portal button — cross-domain)
    var tokenParam = params.get('token');
    if (tokenParam) {
        try {
            var sess = JSON.parse(decodeURIComponent(escape(atob(tokenParam))));
            if (sess.slug == _agencySlug && sess.role && (sess.data || sess.agency)) {
                _agencySession = sess;
                _agencyData    = sess.data || sess.agency;
                _agencyRole    = sess.role;
                // Save to localStorage so future visits don't need token
                localStorage.setItem('nui_agency_session', JSON.stringify(sess));
                sessionStorage.setItem('nui_agency_session', JSON.stringify(sess));
                // Clean URL — remove token param
                var cleanUrl = window.location.pathname + '?agency=' + _agencySlug;
                history.replaceState(null, '', cleanUrl);
                _launchPortal();
                return true;
            }
        } catch(e) { console.warn('[Tenant] Token parse failed:', e); }
    }

    // Check saved session
    try {
        var saved = localStorage.getItem('nui_agency_session') ||
                    sessionStorage.getItem('nui_agency_session');
        if (saved) {
            var sess = JSON.parse(saved);
            var sessData = sess.data || sess.agency; // accept both field names
            // Use loose == for slug comparison (string vs number safety)
            if (sess.slug == _agencySlug && sess.role && sessData) {
                _agencySession = sess;
                _agencyData    = sessData;
                _agencyRole    = sess.role;
                _launchPortal();
                return true;
            } else {
                // Stale session for different agency — clear it
                localStorage.removeItem('nui_agency_session');
                sessionStorage.removeItem('nui_agency_session');
            }
        }
    } catch(e) {}

    _loadAgencyThenShowPicker();
    return true;
};

// ── LOAD AGENCY DATA ─────────────────────────────────────────
async function _loadAgencyThenShowPicker() {
    // Wait up to 5s for Supabase CDN to load
    var waited = 0;
    while (!_getClient() && waited < 5000) {
        await new Promise(function(r){ setTimeout(r, 100); });
        waited += 100;
    }
    try {
        var client = _getClient();
        if (client) {
            var res = await client.from('agency_subaccounts').select('*')
                .eq('portal_slug', _agencySlug).single();
            if (!res.error && res.data) {
                _agencyData = res.data;
            } else {
                var r2 = await client.from('agency_subaccounts').select('*')
                    .eq('domain', _agencySlug).single();
                if (!r2.error && r2.data) _agencyData = r2.data;
            }
        }
    } catch(e) { console.warn('[Tenant] DB lookup failed:', e); }

    if (_agencyData && _agencyData.status === 'suspended') {
        _showOverlay(_html.suspended());
        return;
    }
    if (!_agencyData) {
        _showOverlay(_html.notFound(_agencySlug));
        return;
    }

    document.title = _agencyData.agency_name + ' — Portal';
    _showRolePicker();
}

// ── ROLE PICKER ───────────────────────────────────────────────
function _showRolePicker() {
    var d     = _agencyData;
    var brand = d.brand_color || '#6366f1';
    var name  = d.agency_name || 'Agency Portal';
    var tag   = d.company_tagline || '';

    // Determine which roles are available based on features
    var features = Array.isArray(d.features) ? d.features : [];
    var hasDesigner = features.includes('designer') || features.includes('moodboard');

    var roles = [
        { id: 'admin',    icon: '⚡', title: 'Admin',    desc: 'Full dashboard — manage clients, projects, invoicing & more', always: true },
        { id: 'designer', icon: '🎨', title: 'Designer', desc: 'Projects, moodboard, brand guide, proofs & jobs board', always: false, enabled: hasDesigner },
        { id: 'client',   icon: '👤', title: 'Client',   desc: 'Brand portal, orders & invoices, proofs, moodboard & project status', always: true },
    ];

    var cards = roles.filter(function(r){ return r.always || r.enabled; }).map(function(r) {
        return '<div onclick="window._selectRole(\'' + r.id + '\')" style="' +
            'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);' +
            'border-radius:16px;padding:28px 24px;cursor:pointer;text-align:center;' +
            'transition:all .2s ease;flex:1;min-width:160px;max-width:220px;' +
            '" onmouseover="this.style.borderColor=\'' + brand + '44\';this.style.background=\'' + brand + '08\'" ' +
            'onmouseout="this.style.borderColor=\'rgba(255,255,255,0.08)\';this.style.background=\'rgba(255,255,255,0.03)\'">' +
            '<div style="font-size:36px;margin-bottom:14px;">' + r.icon + '</div>' +
            '<div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:8px;">' + r.title + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">' + r.desc + '</div>' +
            '<div style="margin-top:18px;display:inline-block;padding:7px 20px;background:' + brand + ';color:#fff;border-radius:8px;font-size:12px;font-weight:700;">Sign In →</div>' +
        '</div>';
    }).join('');

    _showOverlay(
        '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;">' +
            // Logo mark
            '<div style="margin-bottom:32px;text-align:center;">' +
                '<div style="display:inline-flex;align-items:center;justify-content:center;' +
                    'width:64px;height:64px;border-radius:18px;' +
                    'background:' + brand + ';margin-bottom:16px;">' +
                    '<span style="font-size:28px;font-weight:900;color:#fff;font-family:Inter,sans-serif;">' +
                        name.charAt(0).toUpperCase() +
                    '</span>' +
                '</div>' +
                '<div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">' + name + '</div>' +
                (tag ? '<div style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:4px;">' + tag + '</div>' : '') +
            '</div>' +
            // Role cards
            '<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:720px;width:100%;">' +
                cards +
            '</div>' +
        '</div>'
    );
}

window._selectRole = function(role) {
    _agencyRole = role;
    _showLoginScreen(role);
};

// ── LOGIN SCREEN ──────────────────────────────────────────────
function _showLoginScreen(role) {
    var d     = _agencyData;
    var brand = d.brand_color || '#6366f1';
    var name  = d.agency_name;

    var roleLabels = { admin: 'Admin Login', designer: 'Designer Login', client: 'Client Login' };
    var roleIcons  = { admin: '⚡', designer: '🎨', client: '👤' };

    _showOverlay(
        '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">' +
        '<div style="width:100%;max-width:400px;">' +
            '<div style="text-align:center;margin-bottom:28px;">' +
                '<div style="width:52px;height:52px;border-radius:14px;background:' + brand + ';' +
                    'display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 14px;">' +
                    roleIcons[role] +
                '</div>' +
                '<div style="font-size:20px;font-weight:800;color:#fff;">' + name + '</div>' +
                '<div style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:4px;">' + roleLabels[role] + '</div>' +
            '</div>' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">' +
                '<div style="margin-bottom:16px;">' +
                    '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Email</div>' +
                    '<input id="ta-email" type="email" placeholder="your@email.com" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                    '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);margin-bottom:6px;">Password</div>' +
                    '<input id="ta-pass" type="password" placeholder="••••••••" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:11px 14px;border-radius:10px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;" onkeydown="if(event.key===\'Enter\')window._tenantLogin()">' +
                '</div>' +
                '<div id="ta-err" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#ef4444;padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:14px;"></div>' +
                '<button onclick="window._tenantLogin()" style="width:100%;background:' + brand + ';color:#fff;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Sign In →</button>' +
            '</div>' +
            '<div style="text-align:center;margin-top:16px;">' +
                '<button onclick="window._showRolePickerAgain()" style="background:none;border:none;color:rgba(255,255,255,0.25);font-size:12px;cursor:pointer;font-family:inherit;">← Back to role selection</button>' +
            '</div>' +
        '</div>' +
        '</div>'
    );

    setTimeout(function(){ var el=document.getElementById('ta-email'); if(el) el.focus(); }, 100);
}

window._showRolePickerAgain = function() { _showRolePicker(); };

// ── LOGIN ─────────────────────────────────────────────────────
window._tenantLogin = async function() {
    var email = (document.getElementById('ta-email')||{}).value || '';
    var pass  = (document.getElementById('ta-pass')||{}).value || '';
    var errEl = document.getElementById('ta-err');

    if (!email || !pass) {
        if (errEl) { errEl.textContent='Please enter email and password.'; errEl.style.display='block'; }
        return;
    }

    var d = _agencyData;
    var match = false;
    var emailMatch = email.toLowerCase() === (d.owner_email||'').toLowerCase();

    if (_agencyRole === 'admin') {
        var adminPass = d.admin_password || d.login_password || 'agency2026';
        if (pass === adminPass) match = true;
    } else if (_agencyRole === 'designer') {
        var designerPass = d.designer_password || 'designer2026';
        if (pass === designerPass) match = true;
    } else if (_agencyRole === 'client') {
        var clientPass = d.client_password || 'client2026';
        if (pass === clientPass) match = true;
    }

    if (!match) {
        if (errEl) { errEl.textContent='Incorrect email or password.'; errEl.style.display='block'; }
        // Shake animation
        var btn = document.querySelector('button[onclick="window._tenantLogin()"]');
        if (btn) { btn.style.transform='translateX(-6px)'; setTimeout(function(){btn.style.transform='translateX(6px)';setTimeout(function(){btn.style.transform='';},100);},100); }
        return;
    }

    // Save session with role
    _agencySession = { slug: _agencySlug, data: d, email: email, role: _agencyRole, loginAt: Date.now() };
    try {
        localStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
        sessionStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
    } catch(e) {}

    // Check setup wizard for admin only
    if (_agencyRole === 'admin' && !d.setup_complete) {
        _showSetupWizard();
    } else {
        _launchPortal();
    }
};

// ── SETUP WIZARD (admin only) ─────────────────────────────────
var INTEGRATIONS = [
    { id:'stripe',            name:'Stripe Publishable Key', icon:'💳', cat:'Billing',   placeholder:'pk_live_...', required:true,  hint:'Dashboard → Developers → API Keys' },
    { id:'stripe_sk',         name:'Stripe Secret Key',      icon:'🔑', cat:'Billing',   placeholder:'sk_live_...', required:true,  hint:'Keep private — server-side only' },
    { id:'openphone',         name:'OpenPhone API Key',      icon:'📱', cat:'SMS',       placeholder:'op_api_...', required:false, hint:'openphone.com → Settings → Integrations' },
    { id:'openphone_number',  name:'OpenPhone Phone Number ID', icon:'📞', cat:'SMS',    placeholder:'PNxxxxxx...', required:false, hint:'openphone.com → Phone Numbers → click number → copy Resource ID' },
    { id:'email_provider',    name:'Email Provider',         icon:'📧', cat:'Email',     placeholder:'sendgrid', required:false, hint:'Choose: sendgrid, gmail, mailchimp, hostinger, smtp', type:'select', options:['sendgrid','gmail','hostinger','mailchimp','smtp'] },
    { id:'email_key',         name:'Email API Key or Password', icon:'🔑', cat:'Email',  placeholder:'SG.xxx / app password / API key', required:false, hint:'SendGrid: API key starting with SG. | Gmail: App Password (16 chars) | Hostinger: email password | SMTP: password' },
    { id:'email_from',        name:'Send-From Email Address', icon:'✉️', cat:'Email',    placeholder:'hello@yourdomain.com', required:false, hint:'The email address your clients will see' },
    { id:'ga4',               name:'Google Analytics',       icon:'📊', cat:'Analytics', placeholder:'G-XXXXXXXX', required:false, hint:'GA4 → Admin → Data Streams' },
    { id:'meta_pixel',        name:'Meta Pixel ID',          icon:'📘', cat:'Ads',       placeholder:'1234567890', required:false, hint:'Meta Business → Events Manager' },
];
var _wizStep = 0, _wizKeys = {};
var _wizCats = [];

function _showSetupWizard() {
    var seen = {};
    INTEGRATIONS.forEach(function(i){ if(!seen[i.cat]){seen[i.cat]=true;_wizCats.push(i.cat);} });
    _wizStep = 0;
    _renderWizStep();
}

function _renderWizStep() {
    var d     = _agencyData;
    var brand = d.brand_color || '#6366f1';
    var name  = d.agency_name;
    var total = _wizCats.length + 2;
    var pct   = Math.round((_wizStep / total) * 100);

    var body = '';
    if (_wizStep === 0) {
        body = '<div style="text-align:center;padding:16px 0;">' +
            '<div style="font-size:44px;margin-bottom:14px;">🚀</div>' +
            '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">Welcome to ' + name + ' Portal</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.7;margin-bottom:24px;">Let\'s connect your tools. Takes about 3 minutes.<br>You can skip anything and add keys later in Settings.</div>' +
            '<button onclick="window._wizNext()" style="background:' + brand + ';color:#fff;border:none;padding:13px 40px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Let\'s Go →</button>' +
        '</div>';
    } else if (_wizStep <= _wizCats.length) {
        var cat = _wizCats[_wizStep - 1];
        var items = INTEGRATIONS.filter(function(i){ return i.cat === cat; });
        body = '<div style="font-size:17px;font-weight:800;color:#fff;margin-bottom:4px;">' + cat + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:20px;">All keys are encrypted at rest.</div>' +
            items.map(function(it){
                return '<div style="margin-bottom:14px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">' +
                        '<span>' + it.icon + '</span>' +
                        '<span style="font-size:12px;font-weight:700;color:#fff;">' + it.name + '</span>' +
                        (it.required ? '<span style="font-size:9px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.25);border-radius:20px;padding:1px 7px;font-weight:700;">REQUIRED</span>' : '') +
                        '<span style="margin-left:auto;font-size:10px;color:rgba(255,255,255,0.2);" title="' + it.hint + '">ⓘ Where?</span>' +
                    '</div>' +
                    (it.type !== 'select' ?
                    '<input id="wiz-' + it.id + '" type="' + (it.id.includes('sk')||it.id.includes('key')||it.id.includes('password')?'password':'text') + '" value="' + (_wizKeys[it.id]||'') + '" placeholder="' + it.placeholder + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:10px 13px;border-radius:9px;font-size:12px;font-family:monospace;outline:none;box-sizing:border-box;">' :
                    '<select id="wiz-' + it.id + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:10px 13px;border-radius:9px;font-size:12px;outline:none;box-sizing:border-box;">' +
                        '<option value="">— Select —</option>' +
                        it.options.map(function(o){ return '<option value="' + o + '"' + (_wizKeys[it.id]===o?' selected':'') + '>' + o.charAt(0).toUpperCase() + o.slice(1) + '</option>'; }).join('') +
                    '</select>') +
                '</div>';
            }).join('');
    } else {
        body = '<div style="text-align:center;padding:16px 0;">' +
            '<div style="font-size:44px;margin-bottom:14px;">✅</div>' +
            '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">All set!</div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.7;margin-bottom:24px;">Update keys anytime in Settings → Integrations.</div>' +
            '<button onclick="window._wizFinish()" style="background:' + brand + ';color:#fff;border:none;padding:13px 40px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Open My Dashboard →</button>' +
        '</div>';
    }

    _showOverlay(
        '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">' +
        '<div style="width:100%;max-width:520px;">' +
            '<div style="margin-bottom:22px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:7px;">' +
                    '<span>' + name + ' Setup</span><span>' + pct + '%</span>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.06);border-radius:20px;height:3px;">' +
                    '<div style="height:100%;border-radius:20px;background:' + brand + ';width:' + pct + '%;transition:width .4s;"></div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">' +
                body +
                (_wizStep > 0 && _wizStep <= _wizCats.length ?
                    '<div style="display:flex;gap:10px;margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.06);">' +
                        '<button onclick="window._wizSkip()" style="flex:1;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.35);border:1px solid rgba(255,255,255,0.07);padding:10px;border-radius:9px;cursor:pointer;font-size:12px;font-family:inherit;">Skip</button>' +
                        '<button onclick="window._wizNext()" style="flex:2;background:' + brand + ';color:#fff;border:none;padding:10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;">Save & Continue →</button>' +
                    '</div>' : '') +
            '</div>' +
        '</div></div>'
    );
}

window._wizNext = function() {
    if (_wizStep > 0 && _wizStep <= _wizCats.length) {
        var cat = _wizCats[_wizStep-1];
        INTEGRATIONS.filter(function(i){return i.cat===cat;}).forEach(function(it){
            var el = document.getElementById('wiz-'+it.id);
            if (el && el.value.trim()) _wizKeys[it.id] = el.value.trim();
        });
    }
    _wizStep++;
    _renderWizStep();
};
window._wizSkip = function() { _wizStep++; _renderWizStep(); };
window._wizFinish = async function() {
    if (_agencyData && _getClient()) {
        try {
            await _getClient().from('agency_subaccounts').update({
                integrations_config: _wizKeys, setup_complete: true, updated_at: new Date().toISOString()
            }).eq('id', _agencyData.id);
            _agencyData.integrations_config = _wizKeys;
            _agencyData.setup_complete = true;
            _agencySession.data = _agencyData;
            localStorage.setItem('nui_agency_session', JSON.stringify(_agencySession));
        } catch(e) {}
    }
    _launchPortal();
};

// ── LAUNCH PORTAL ─────────────────────────────────────────────
function _launchPortal() {
    var d     = _agencyData;
    var role  = _agencyRole;
    var brand = d.brand_color || '#6366f1';
    var name  = d.agency_name;
    var isLight = (d.brand_theme === 'light' || d.brand_theme === 'white');

    // ── 1. POPULATE AGENCY_CONFIG — the existing config system handles everything
    if (typeof AGENCY_CONFIG !== 'undefined') {
        AGENCY_CONFIG.agency.id        = d.portal_slug || d.id;
        AGENCY_CONFIG.agency.name      = name;
        AGENCY_CONFIG.agency.shortName = name.split(' ')[0];
        AGENCY_CONFIG.agency.tagline   = d.company_tagline || '';
        AGENCY_CONFIG.agency.domain    = d.domain || '';
        AGENCY_CONFIG.agency.email     = d.owner_email || '';
        AGENCY_CONFIG.agency.phone     = d.owner_phone || '';
        // Brand colors
        AGENCY_CONFIG.brand.colors.primary      = brand;
        AGENCY_CONFIG.brand.colors.primaryHover  = brand;
        AGENCY_CONFIG.brand.colors.primaryLight  = brand + '18';
        if (isLight) {
            AGENCY_CONFIG.brand.colors.background = '#f5f5f5';
            AGENCY_CONFIG.brand.colors.surface    = '#ffffff';
            AGENCY_CONFIG.brand.colors.text       = '#0a0a0a';
            AGENCY_CONFIG.brand.colors.textMuted  = '#666666';
            AGENCY_CONFIG.brand.colors.textDim    = 'rgba(0,0,0,0.3)';
            AGENCY_CONFIG.brand.colors.border     = 'rgba(0,0,0,0.1)';
        }
        // Modules — map features array to module toggles
        var features = Array.isArray(d.features) ? d.features : [];
        Object.keys(AGENCY_CONFIG.modules).forEach(function(k) {
            AGENCY_CONFIG.modules[k] = features.includes(k);
        });
        AGENCY_CONFIG.modules.dashboard = true; // always on
        // Always hide these from tenants — NUI-only features
        AGENCY_CONFIG.modules.subaccounts = false;
        AGENCY_CONFIG.modules.monty = false;
    }

    // ── 2. Set globals
    document.title = name + ' — ' + (role.charAt(0).toUpperCase() + role.slice(1)) + ' Portal';
    window._isAgencyTenant = true;
    window._agencyRole     = role;
    window._agencyData     = d;
    window._agencyFeatures = Array.isArray(d.features) ? d.features : [];
    window._agencyKeys     = d.integrations_config || {};

    // ── 3. Stub for missing panel loader (admin-subaccounts.js not in portal)
    if (typeof loadAdminSubAccountsPanel === 'undefined') window.loadAdminSubAccountsPanel = function(){};

    // ── 3b. FORCE PATCH db isolation BEFORE any panel loads
    //    Try synchronously first. If db isn't ready, retry loop catches it later.
    var _dbPatched = false;
    function _patchDbNow() {
        var rawDb = window.db || window.supabaseClient;
        if (rawDb && rawDb.from && !rawDb.__nuiIsolated) {
            var origFrom = rawDb.from.bind(rawDb);
            var slug = _agencySlug;
            var TENANT_TABLES = ['clients','orders','invoices','proofs','projects','leads','services','meetings','submissions','crm_contacts','contacts','activity_log','communications','sms_campaigns','sms_drip_queue','identified_visitors','chat_logs','tasks','approvals','client_sites'];
            rawDb.from = function(table) {
                var q = origFrom(table);
                if (TENANT_TABLES.indexOf(table) === -1) return q;
                var _sel = q.select.bind(q);
                q.select = function() { return _sel.apply(this, arguments).eq('agency_id', slug); };
                var _ins = q.insert.bind(q);
                q.insert = function(data) {
                    if (Array.isArray(data)) data = data.map(function(r){ return Object.assign({}, r, {agency_id: slug}); });
                    else if (data && typeof data === 'object') data = Object.assign({}, data, {agency_id: slug});
                    return _ins.call(this, data);
                };
                var _upd = q.update.bind(q);
                q.update = function(data) { return _upd.call(this, data).eq('agency_id', slug); };
                var _del = q.delete.bind(q);
                q.delete = function() { return _del.call(this).eq('agency_id', slug); };
                return q;
            };
            rawDb.__nuiIsolated = slug;
            window.db = rawDb;
            window.supabaseClient = rawDb;
            _dbPatched = true;
            console.log('[Tenant] DB isolation patched — agency_id:', slug);
            return true;
        }
        return false;
    }
    _patchDbNow(); // try once synchronously

    // ── 3b. ISOLATE LOCALSTORAGE
    //    If portal is on same domain as /app/ (fallback), clear NUI data.
    //    On portal.newurbaninfluence.com this is a no-op (separate origin).
    if (window.location.hostname === 'newurbaninfluence.com') {
        var _nuiDataKeys = [
            'nui_clients','nui_orders','nui_invoices','nui_subscriptions',
            'nui_proofs','nui_projects','nui_leads','nui_services',
            'nui_meetings','nui_submissions','nui_crm','nui_comm_hub',
            'nui_designer_messages','nui_client_messages','nui_analytics',
            'nui_site_images','nui_about','nui_portfolio'
        ];
        _nuiDataKeys.forEach(function(k) {
            var existing = localStorage.getItem(k);
            if (existing) {
                localStorage.setItem('_nui_backup_' + k, existing);
                localStorage.removeItem(k);
            }
        });
    }
    // Set agency ID for isolation patch
    window._nuiAgencyId = _agencySlug;

    // Override client-side API keys with tenant's keys from wizard
    var tenantKeys = d.integrations_config || {};
    if (tenantKeys.stripe) window.STRIPE_PUBLISHABLE_KEY = tenantKeys.stripe;

    // ── 4. Render portal HTML (this resets currentUser to null)
    if (typeof loadPortalView === 'function') loadPortalView();

    // ── 5. Set currentUser AFTER loadPortalView reset
    currentUser = {
        type: 'admin',
        email: (_agencySession && _agencySession.email) || d.owner_email || '',
        name: name + ' ' + (role.charAt(0).toUpperCase() + role.slice(1)),
        isMasterAdmin: false,
        isAgencyTenant: true,
        tenantRole: role
    };
    window.currentUser = currentUser;

    // ── 6. Show dashboard, hide login — MUST be after loadPortalView's 10ms setTimeout
    //    portal.js line 377 queues setTimeout(10ms) to show login + hide dashboard
    //    We wait 50ms to override it. Cannot touch portal.js.
    setTimeout(function() {
        var loginEl = document.getElementById('portalLogin');
        var dashEl  = document.getElementById('adminDashboard');
        var clientEl = document.getElementById('clientPortal');
        if (loginEl)  loginEl.style.display = 'none';
        if (clientEl) clientEl.style.display = 'none';
        if (dashEl) { dashEl.style.display = 'block'; dashEl.style.visibility = 'visible'; dashEl.classList.remove('hidden'); }

        // Apply brand theme + filter nav + rebrand
        if (typeof applyBrandTheme === 'function') applyBrandTheme();
        if (typeof filterAdminNav === 'function') filterAdminNav();
        if (typeof rebrandPortal === 'function') rebrandPortal();

        // Header user info
        var userInfoEl = document.getElementById('adminUserInfo');
        if (userInfoEl) userInfoEl.textContent = name + ' · ' + (role.charAt(0).toUpperCase() + role.slice(1));

        // Header logo — replace NUI icon with brand initial
        var headerLogo = document.getElementById('adminHeaderLogo');
        if (headerLogo) {
            var mark = document.createElement('div');
            mark.style.cssText = 'width:32px;height:32px;border-radius:8px;background:' + brand + ';display:inline-flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;';
            mark.textContent = name.charAt(0).toUpperCase();
            if (headerLogo.parentNode) headerLogo.parentNode.replaceChild(mark, headerLogo);
        }
        // Header title
        var headerTitle = document.getElementById('adminHeaderTitle');
        if (headerTitle) headerTitle.textContent = name + ' Dashboard';

        // Sidebar brand — replace NUI icon + "NUI Admin" text
        document.querySelectorAll('.sidebar-brand img').forEach(function(img) {
            var mark = document.createElement('div');
            mark.style.cssText = 'width:28px;height:28px;border-radius:8px;background:' + brand + ';display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#fff;flex-shrink:0;';
            mark.textContent = name.charAt(0).toUpperCase();
            if (img.parentNode) img.parentNode.replaceChild(mark, img);
        });
        document.querySelectorAll('.sidebar-brand span').forEach(function(s) {
            s.textContent = name.split(' ')[0] + ' Admin';
        });

        // Portal nav logo (top bar before login)
        var navLogo = document.getElementById('mainNavLogo');
        if (navLogo) navLogo.style.display = 'none';

        // Remove overlay
        var overlay = document.getElementById('tenant-overlay');
        if (overlay) overlay.remove();

        // Light theme CSS overrides
        if (isLight) {
            var ls = document.getElementById('tenant-light-theme') || document.createElement('style');
            ls.id = 'tenant-light-theme';
            ls.textContent = 'body{background:#f5f5f5!important;color:#0a0a0a!important}.admin-sidebar{background:#fff!important;border-right-color:rgba(0,0,0,.08)!important}.admin-header{background:#fff!important;border-bottom-color:rgba(0,0,0,.08)!important}.admin-header span,.admin-header .sb-name,#adminHeaderTitle{color:#0a0a0a!important}.admin-nav-label{color:rgba(0,0,0,.4)!important}.admin-nav-link{color:rgba(0,0,0,.5)!important}.admin-nav-link.active{color:'+brand+'!important;background:'+brand+'0a!important}.admin-card-dark,.admin-card-dark-sm,.admin-card-dark-center,.admin-card-glass{background:#fff!important;border-color:rgba(0,0,0,.08)!important;color:#0a0a0a!important}.admin-input,.admin-input-dark,.admin-select,.admin-textarea{background:#fff!important;color:#0a0a0a!important;border-color:rgba(0,0,0,.15)!important}.admin-main h1,.admin-main h2,.admin-main h3,.stat-num-lg,.stat-num-xl{color:#0a0a0a!important}.admin-heading-sm,.admin-heading-xs,.admin-label-xs,.admin-field-label,#adminUserInfo{color:#666!important}';
            if (!ls.parentNode) document.head.appendChild(ls);
        }
    }, 50);

    // ── 9. Load landing panel — WAITS for db patch before loading any data
    var landingPanel = (role === 'designer') ? 'projects' : 'dashboard';
    var _panelLoadAttempts = 0;
    var _panelLoadTimer = setInterval(function() {
        _panelLoadAttempts++;
        if (!_dbPatched) _patchDbNow(); // keep trying
        if (_dbPatched || _panelLoadAttempts > 40) { // patched or 2s timeout
            clearInterval(_panelLoadTimer);
            if (!_dbPatched) console.warn('[Tenant] DB patch timeout — loading panel without isolation');
            if (typeof showAdminPanel === 'function') showAdminPanel(landingPanel);
        // Role-based additional filtering (designer/client see fewer panels)
        if (role !== 'admin') {
            var roleAllowed = {
                designer: ['projects','orders','moodboard','brandguide','proofs','assets','designer'],
                client: ['dashboard','brandguide','moodboard','assets','orders','delivery','invoices','payments','proofs'],
            };
            var allowed = roleAllowed[role] || [];
            document.querySelectorAll('.admin-nav-link[data-panel]').forEach(function(el) {
                var panel = el.getAttribute('data-panel');
                if (!allowed.includes(panel)) el.style.display = 'none';
            });
            // Hide empty nav groups
            document.querySelectorAll('.admin-nav-group,.admin-nav-section').forEach(function(g) {
                var vis = g.querySelectorAll('.admin-nav-link:not([style*="display: none"]),.admin-nav-link:not([data-module-disabled])');
                var allHidden = true;
                vis.forEach(function(l) { if (l.style.display !== 'none' && !l.hasAttribute('data-module-disabled')) allHidden = false; });
                if (allHidden) g.style.display = 'none';
            });
        }
        }
    }, 50);

    // ── 10. Re-rebrand on panel switches — catch ALL NUI text in rendered content
    var mainEl = document.querySelector('.admin-main');
    if (mainEl) {
        var _brandName = name;
        var _brandShort = name.split(' ')[0];
        var _brandColor = brand;
        var _obsDebounce = null;
        var _obs = new MutationObserver(function() {
            clearTimeout(_obsDebounce);
            _obsDebounce = setTimeout(function() {
                // 1. Replace all text nodes containing NUI branding
                var walker = document.createTreeWalker(
                    document.querySelector('.admin-main'),
                    NodeFilter.SHOW_TEXT, null, false
                );
                var node;
                while (node = walker.nextNode()) {
                    if (node.nodeValue.indexOf('New Urban') !== -1 ||
                        node.nodeValue.indexOf('NUI Admin') !== -1 ||
                        node.nodeValue.indexOf('NUI') !== -1) {
                        node.nodeValue = node.nodeValue
                            .replace(/New Urban Influence/g, _brandName)
                            .replace(/NUI Admin/g, _brandName)
                            .replace(/NUI/g, _brandShort);
                    }
                }
                // 2. Replace red accent spans in dashboard banner
                document.querySelectorAll('.admin-panel span[style*="dc2626"], .admin-panel span[style*="#dc2626"]').forEach(function(s) {
                    s.style.color = _brandColor;
                });
                // 3. Replace NUI logos that sneak in
                document.querySelectorAll('.admin-panel img[src*="icon-192"], .admin-panel img[alt="NUI"]').forEach(function(img) {
                    var mark = document.createElement('div');
                    mark.style.cssText = 'width:28px;height:28px;border-radius:8px;background:' + _brandColor + ';display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#fff;';
                    mark.textContent = _brandName.charAt(0).toUpperCase();
                    if (img.parentNode) img.parentNode.replaceChild(mark, img);
                });
                // 4. Also rebrand sidebar/header if needed
                if (typeof rebrandPortal === 'function') rebrandPortal();
            }, 50);
        });
        _obs.observe(mainEl, { childList: true, subtree: true });
    }

    // ── 11. (MOVED to step 3b — db patch now happens before panel load)
}

// ── APPLY BRANDING ────────────────────────────────────────────
function _applyBranding() {
    var d       = _agencyData;
    var brand   = d.brand_color || '#6366f1';
    var name    = d.agency_name;
    var initials = name.charAt(0).toUpperCase();

    // 1. Replace ALL sidebar brand spans
    document.querySelectorAll('.sidebar-brand span,.sb-name,.admin-brand-name,#adminHeaderTitle').forEach(function(el) {
        el.textContent = name;
    });

    // 2. Replace ALL remaining NUI icon images
    document.querySelectorAll('img[src*="icon-192"],img[alt="NUI"],img[src*="logo"]').forEach(function(img) {
        if (img.closest('#tenant-overlay')) return; // skip overlay
        var mark = document.createElement('div');
        var sz = img.offsetHeight || 28;
        mark.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;border-radius:8px;background:' + brand + ';' +
            'display:inline-flex;align-items:center;justify-content:center;font-size:' + Math.round(sz*0.55) + 'px;font-weight:900;color:#fff;flex-shrink:0;';
        mark.textContent = initials;
        if (img.parentNode) img.parentNode.replaceChild(mark, img);
    });

    // 3. Walk text nodes — replace "New Urban Influence" & "NUI Admin" with agency name
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
        if (!node.parentElement) continue;
        var tag = node.parentElement.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') continue;
        if (node.nodeValue.indexOf('New Urban Influence') !== -1 ||
            node.nodeValue.indexOf('NUI Admin') !== -1) {
            node.nodeValue = node.nodeValue
                .replace(/New Urban Influence/g, name)
                .replace(/NUI Admin/g, name);
        }
    }

    // 4. Header user display
    var userInfoEl = document.getElementById('adminUserInfo');
    if (userInfoEl && _agencySession) {
        userInfoEl.textContent = name + ' · ' + (_agencyRole.charAt(0).toUpperCase() + _agencyRole.slice(1));
    }

    // 5. Subtle powered-by in sidebar footer only
    var foot = document.querySelector('.sidebar-footer,.sb-foot');
    if (foot && !foot.querySelector('.nui-powered')) {
        var p = document.createElement('div');
        p.className = 'nui-powered';
        p.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.1);margin-top:8px;text-align:center;letter-spacing:0.5px;';
        p.textContent = 'Powered by NUI';
        foot.appendChild(p);
    }
}

// ── FILTER BY ROLE + FEATURES ─────────────────────────────────
function _filterFeatures(role) {
    var d        = _agencyData;
    var features = Array.isArray(d.features) ? d.features : [];

    // Role-based panel visibility
    var roleAllowed = {
        admin:    null, // all features on their plan
        designer: ['projects','orders','moodboard','brandguide','proofs','assets','designer'],
        client:   ['dashboard','brandguide','moodboard','assets','orders','delivery','invoices','payments','proofs'],
    };

    var allowed = roleAllowed[role];

    // Panel → feature key map
    var panelToFeature = {
        'dashboard':'dashboard','calendar':'calendar','clients':'clients','leads':'clients',
        'contacthub':'crm','visitors':'visitors','projects':'projects','proofs':'projects',
        'brandguide':'designer','payments':'invoicing','invoices':'invoicing',
        'seo':'seo','rankintel':'rankintel','gmb':'seo','citations':'citations',
        'blog':'seo','emailmarketing':'emailmarketing','retargeting':'retargeting',
        'assets':'moodboard','moodboard':'moodboard','monty':'dashboard',
        'sites':'sites','integrations':'integrations','usermanagement':'settings',
        'subaccounts':'settings','designer':'designer'
    };

    document.querySelectorAll('.admin-nav-link[data-panel],.ni[onclick]').forEach(function(el) {
        var panel = el.getAttribute('data-panel');
        if (!panel) {
            var m = (el.getAttribute('onclick')||'').match(/showAdminPanel\('([^']+)'\)/);
            if (m) panel = m[1];
        }
        if (!panel) return;

        var feat = panelToFeature[panel];

        // Hide if not in role allowed list
        if (allowed && !allowed.includes(panel) && !allowed.includes(feat)) {
            el.style.display = 'none';
            return;
        }
        // HIDE if not in their plan features (admin only — designers/clients have fixed panels)
        if (role === 'admin' && feat && !features.includes(feat)) {
            el.style.display = 'none';
        }
    });

    // Always hide sub-accounts panel from tenants
    document.querySelectorAll('[data-panel="subaccounts"],[onclick*="subaccounts"]').forEach(function(el){
        el.style.display = 'none';
    });

    // Hide entire nav groups if ALL child links are hidden
    document.querySelectorAll('.admin-nav-group').forEach(function(group) {
        var links = group.querySelectorAll('.admin-nav-link');
        if (!links.length) return;
        var allHidden = true;
        links.forEach(function(l) { if (l.style.display !== 'none') allHidden = false; });
        if (allHidden) group.style.display = 'none';
    });
}

// ── API KEY GATE — Show setup prompt for panels that need keys ──
// Wraps panel loaders so tenants see "Set up your API" when keys are missing
// instead of broken panels or NUI data. Wizard saves keys to integrations_config.
(function() {
    // Map: panel name → which wizard key it needs
    var PANEL_KEY_REQUIREMENTS = {
        'contacthub':    { key: 'openphone',  label: 'OpenPhone API Key',  icon: '📱', desc: 'Connect your phone system to manage contacts, calls, and texts' },
        'sms':           { key: 'openphone',  label: 'OpenPhone API Key',  icon: '📱', desc: 'Send and receive SMS messages from your dashboard' },
        'communications':{ key: 'openphone',  label: 'OpenPhone API Key',  icon: '📱', desc: 'View all client communications in one place' },
        'emailmarketing':{ key: 'email_key',  label: 'Email API Key',      icon: '📧', desc: 'Send email campaigns and newsletters to your clients' },
        'stripe':        { key: 'stripe',     label: 'Stripe Publishable Key', icon: '💳', desc: 'Accept payments and manage subscriptions' },
        'payments':      { key: 'stripe',     label: 'Stripe Keys',        icon: '💳', desc: 'Process payments and view transaction history' }
    };

    function _setupPromptHtml(req, brand) {
        return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;padding:40px;text-align:center;">' +
            '<div style="width:72px;height:72px;border-radius:18px;background:' + (brand||'#6366f1') + '18;border:1px solid ' + (brand||'#6366f1') + '33;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px;">' + req.icon + '</div>' +
            '<h2 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;">Setup Required</h2>' +
            '<p style="color:rgba(255,255,255,0.5);font-size:14px;max-width:400px;line-height:1.7;margin:0 0 24px;">' + req.desc + '</p>' +
            '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 24px;margin-bottom:24px;">' +
                '<div style="color:rgba(255,255,255,0.3);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Required</div>' +
                '<div style="color:#fff;font-size:15px;font-weight:600;">' + req.label + '</div>' +
            '</div>' +
            '<button onclick="if(typeof _showSetupWizard===\'function\')_showSetupWizard();" style="padding:12px 32px;background:' + (brand||'#6366f1') + ';color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">⚙️ Open Setup Wizard</button>' +
            '<p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:16px;">You can also configure this in Settings → Integrations</p>' +
        '</div>';
    }

    // Override panel loaders after DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        // Only for tenants
        if (!window._isAgencyTenant) return;

        // Wait for panel loaders to be defined
        setTimeout(function() {
            var keys = window._agencyKeys || {};
            var brand = (window._agencyData && window._agencyData.brand_color) || '#6366f1';

            Object.keys(PANEL_KEY_REQUIREMENTS).forEach(function(panel) {
                var req = PANEL_KEY_REQUIREMENTS[panel];
                var hasKey = keys[req.key] && keys[req.key].trim().length > 0;
                if (hasKey) return; // Key exists, let the real panel load

                // Panel ID: adminContacthubPanel (lowercase)
                var panelId = 'admin' + panel.charAt(0).toUpperCase() + panel.slice(1) + 'Panel';

                // Loader function names have inconsistent casing — map explicitly
                var loaderMap = {
                    'contacthub': 'loadAdminContactHubPanel',
                    'sms': 'loadAdminSmsPanel',
                    'communications': 'loadAdminCommunicationsPanel',
                    'emailmarketing': 'loadAdminEmailMarketingPanel',
                    'stripe': 'loadAdminStripePanel',
                    'payments': 'loadAdminPaymentsPanel',
                    'monty': 'loadAdminMontyPanel'
                };
                var origFnName = loaderMap[panel];

                // Find and override the global function
                if (typeof window[origFnName] === 'function') {
                    var _orig = window[origFnName];
                    window[origFnName] = function() {
                        // Re-check keys in case wizard was completed during session
                        var currentKeys = window._agencyKeys || {};
                        if (currentKeys[req.key] && currentKeys[req.key].trim().length > 0) {
                            return _orig.apply(this, arguments); // Key now exists, use real loader
                        }
                        var el = document.getElementById(panelId);
                        if (el) el.innerHTML = _setupPromptHtml(req, brand);
                    };
                }
            });
        }, 200);
    });
})();

// ── HTML HELPERS ──────────────────────────────────────────────
var _html = {
    loading: function() {
        return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;">' +
            '<div style="text-align:center;">' +
                '<div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>' +
                '<div style="color:rgba(255,255,255,0.4);font-size:13px;">Loading portal...</div>' +
            '</div></div>' +
            '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
    },
    suspended: function() {
        return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">' +
            '<div><div style="font-size:48px;margin-bottom:16px;">⛔</div>' +
            '<div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">Account Suspended</div>' +
            '<div style="color:rgba(255,255,255,0.4);font-size:13px;">Contact your agency to reactivate.</div></div></div>';
    },
    notFound: function(slug) {
        return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">' +
            '<div><div style="font-size:48px;margin-bottom:16px;">🔍</div>' +
            '<div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">Portal Not Found</div>' +
            '<div style="color:rgba(255,255,255,0.4);font-size:13px;">No portal found for "' + slug + '".<br>Check the URL or contact your agency.</div></div></div>';
    }
};

// ── OVERLAY ───────────────────────────────────────────────────
function _showOverlay(html) {
    var el = document.getElementById('tenant-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'tenant-overlay';
        el.style.cssText = 'position:fixed;inset:0;background:#07070f;z-index:99999;overflow-y:auto;' +
            'font-family:Inter,Montserrat,sans-serif;color:#fff;';
        document.body.appendChild(el);
    }
    el.innerHTML = html;
}

// ── MONTY OVERRIDE FOR TENANTS ────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (!window._isAgencyTenant) return;
        window.loadAdminMontyPanel = function() {
            var panel = document.getElementById('adminMontyPanel');
            if (!panel) return;
            var brand = (window._agencyData && window._agencyData.brand_color) || '#6366f1';
            var aName = (window._agencyData && window._agencyData.agency_name) || 'Your Agency';
            panel.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:40px;text-align:center;">' +
                '<div style="width:64px;height:64px;border-radius:18px;background:' + brand + '18;border:1px solid ' + brand + '44;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px;">🤖</div>' +
                '<div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:8px;">AI Assistant</div>' +
                '<div style="background:' + brand + '18;border:1px solid ' + brand + '33;color:' + brand + ';font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;margin-bottom:18px;">🚧 Coming Soon</div>' +
                '<div style="font-size:13px;color:rgba(255,255,255,0.35);max-width:380px;line-height:1.7;">Your AI assistant for ' + aName + ' is being configured. It will let you manage your entire agency using plain English.</div>' +
                '</div>';
        };
    }, 400);
});

// ── AUTO-INJECT agency_id INTO ALL NETLIFY FUNCTION CALLS ────
// Same pattern as admin-auth.js token interceptor
// Only fires when _nuiAgencyId is set (portal only, never /app/)
// Also rewrites function URLs to main domain (portal site has no env vars)
(function() {
    var _origFetch = window.fetch;
    var MAIN_DOMAIN = 'https://newurbaninfluence.com';
    window.fetch = function(url, options) {
        var agencyId = window._nuiAgencyId;
        if (agencyId && typeof url === 'string' && url.includes('/.netlify/functions/')) {
            // Rewrite to main domain if on portal subdomain
            if (window.location.hostname !== 'newurbaninfluence.com') {
                url = MAIN_DOMAIN + url.substring(url.indexOf('/.netlify/'));
            }
            options = options || {};
            // For POST/PATCH — inject into body
            if (options.method && options.method !== 'GET' && options.body) {
                try {
                    var body = JSON.parse(options.body);
                    if (!body.agency_id) body.agency_id = agencyId;
                    options.body = JSON.stringify(body);
                } catch(e) {} // not JSON, skip
            }
            // For GET — append to URL
            if (!options.method || options.method === 'GET') {
                var sep = url.includes('?') ? '&' : '?';
                if (!url.includes('agency_id=')) url = url + sep + 'agency_id=' + encodeURIComponent(agencyId);
            }
        }
        return _origFetch.call(this, url, options);
    };
})();

// ── AUTO-INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    var intercepted = window._agencyTenantInit();
    if (intercepted) window._agencyTenantActive = true;
}, true);

})();
