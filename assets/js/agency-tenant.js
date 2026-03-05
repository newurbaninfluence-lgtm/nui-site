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

    // Check saved session
    try {
        var saved = localStorage.getItem('nui_agency_session') ||
                    sessionStorage.getItem('nui_agency_session');
        if (saved) {
            var sess = JSON.parse(saved);
            var sessData = sess.data || sess.agency; // accept both field names
            if (sess.slug === _agencySlug && sess.role && sessData) {
                _agencySession = sess;
                _agencyData    = sessData;
                _agencyRole    = sess.role;
                _launchPortal();
                return true;
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
        if (emailMatch && pass === adminPass) match = true;
    } else if (_agencyRole === 'designer') {
        var designerPass = d.designer_password || 'designer2026';
        // Designer can use owner email or any email (no separate designer email yet)
        if (pass === designerPass) match = true;
    } else if (_agencyRole === 'client') {
        // Client login — check against agency_clients table (future)
        // For now: use a client_password field or default
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
    { id:'stripe',       name:'Stripe Publishable', icon:'💳', cat:'Billing',   placeholder:'pk_live_...', required:true,  hint:'Dashboard → Developers → API Keys' },
    { id:'stripe_sk',    name:'Stripe Secret Key',  icon:'🔑', cat:'Billing',   placeholder:'sk_live_...', required:true,  hint:'Keep private — server-side only' },
    { id:'openphone',    name:'OpenPhone API Key',   icon:'📱', cat:'SMS',       placeholder:'op_api_...', required:false, hint:'openphone.com → Settings → Integrations' },
    { id:'sendgrid',     name:'SendGrid API Key',    icon:'📧', cat:'Email',     placeholder:'SG.xxxxx...', required:false, hint:'app.sendgrid.com → Settings → API Keys' },
    { id:'ga4',          name:'Google Analytics',    icon:'📊', cat:'Analytics', placeholder:'G-XXXXXXXX', required:false, hint:'GA4 → Admin → Data Streams' },
    { id:'meta_pixel',   name:'Meta Pixel ID',       icon:'📘', cat:'Ads',       placeholder:'1234567890', required:false, hint:'Meta Business → Events Manager' },
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
                    '<input id="wiz-' + it.id + '" type="' + (it.id.includes('sk')?'password':'text') + '" value="' + (_wizKeys[it.id]||'') + '" placeholder="' + it.placeholder + '" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);color:#fff;padding:10px 13px;border-radius:9px;font-size:12px;font-family:monospace;outline:none;box-sizing:border-box;">' +
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
    var initials = name.charAt(0).toUpperCase();

    // ── 1. Inject brand CSS — override ALL NUI red/branding BEFORE overlay drops
    var isLight = (d.brand_theme === 'light' || d.brand_theme === 'white');
    var style = document.getElementById('agency-tenant-styles') || document.createElement('style');
    style.id = 'agency-tenant-styles';
    style.textContent = [
        ':root{',
        '  --admin-accent:' + brand + ' !important;',
        '  --brand-primary:' + brand + ' !important;',
        '  --red:' + brand + ' !important;',
        isLight ? [
        '  --admin-bg:#f5f5f5 !important;',
        '  --admin-bg-secondary:#ffffff !important;',
        '  --admin-text:#0a0a0a !important;',
        '  --admin-text-muted:#666666 !important;',
        '  --admin-card:#ffffff !important;',
        '  --admin-card-hover:#f0f0f0 !important;',
        '  --admin-border:rgba(0,0,0,0.1) !important;',
        '  --admin-input-bg:#ffffff !important;',
        '  --admin-sidebar:#ffffff !important;',
        '  --admin-header:#ffffff !important;',
        ].join('\n') : '',
        '}',
        // White theme body override
        isLight ? [
        'body{background:#f5f5f5 !important;color:#0a0a0a !important;}',
        '.admin-sidebar{background:#fff !important;border-right-color:rgba(0,0,0,0.08) !important;}',
        '.admin-header{background:#fff !important;border-bottom-color:rgba(0,0,0,0.08) !important;color:#0a0a0a !important;}',
        '.admin-header span,.admin-header .sb-name{color:#0a0a0a !important;}',
        '.admin-nav-label{color:rgba(0,0,0,0.4) !important;}',
        '.admin-nav-link{color:rgba(0,0,0,0.5) !important;}',
        '.admin-nav-link.active{color:' + brand + ' !important;background:' + brand + '0a !important;}',
        '.admin-nav-link:hover{color:' + brand + ' !important;}',
        '.admin-card-dark,.admin-card-dark-sm,.admin-card-dark-center{background:#fff !important;border-color:rgba(0,0,0,0.08) !important;color:#0a0a0a !important;}',
        '.admin-card-glass{background:rgba(255,255,255,0.9) !important;border-color:rgba(0,0,0,0.06) !important;color:#0a0a0a !important;}',
        '.admin-input,.admin-input-dark,.admin-select,.admin-textarea{background:#fff !important;color:#0a0a0a !important;border-color:rgba(0,0,0,0.15) !important;}',
        '.admin-main{background:transparent !important;}',
        '.admin-main h1,.admin-main h2,.admin-main h3,.stat-num-lg,.stat-num-xl{color:#0a0a0a !important;}',
        '.admin-heading-sm,.admin-heading-xs,.admin-label-xs,.admin-field-label{color:#666 !important;}',
        '.admin-list-item,.admin-list-item-lg{border-bottom-color:rgba(0,0,0,0.06) !important;}',
        '#adminUserInfo{color:#666 !important;}',
        ].join('\n') : '',
        // Active nav uses brand color
        '.admin-nav-link.active{background:' + brand + '18 !important;color:' + brand + ' !important;border-color:' + brand + '33 !important;}',
        // Buttons use brand color
        '.btn-primary,.admin-save-btn,.sidebar-logo-dot,button[onclick*="portalLogin"]{background:' + brand + ' !important;}',
        '.btn-cta{background:' + brand + ' !important;box-shadow:0 4px 20px ' + brand + '40 !important;}',
        // Hide every NUI-specific element
        '.nui-wordmark,.nui-brand-text,.sidebar-powered,#staffDemoSection{display:none !important;}',
        // Hide the NUI login screen completely — agency-tenant owns auth
        '#portalLogin{display:none !important;}',
        // Hide the NUI background / marketing elements
        '.portal-bg,.portal-hero,.marketing-bg{display:none !important;}'
    ].join('\n');
    if (!style.parentNode) document.head.appendChild(style);

    // ── 3. Set globals BEFORE calling loadPortalView (currentUser set AFTER — see step 4b)
    document.title = name + ' — ' + (role.charAt(0).toUpperCase() + role.slice(1)) + ' Portal';
    window._isAgencyTenant = true;
    window._agencyRole     = role;
    window._agencyData     = d;
    window._agencyFeatures = Array.isArray(d.features) ? d.features : [];
    window._agencyKeys     = d.integrations_config || {};

    // ── 4. Render the portal HTML (WARNING: loadPortalView resets currentUser to null)
    if (typeof loadPortalView === 'function') loadPortalView();

    // ── 4b. Set currentUser AFTER loadPortalView — it resets to null internally
    //        Set type:'admin' for ALL roles so canAccessPanel() passes.
    //        Actual panel visibility is controlled by _filterFeatures() which
    //        hides nav links based on role. This avoids touching core.js PANEL_ACCESS.
    currentUser = {
        type: 'admin',
        email: (_agencySession && _agencySession.email) || d.owner_email || '',
        name: name + ' ' + (role.charAt(0).toUpperCase() + role.slice(1)),
        isMasterAdmin: false,
        isAgencyTenant: true,
        tenantRole: role
    };
    window.currentUser = currentUser;

    // ── 5. Immediately show adminDashboard, hide NUI login form
    var loginEl = document.getElementById('portalLogin');
    var dashEl  = document.getElementById('adminDashboard');
    var clientEl = document.getElementById('clientPortal');
    if (loginEl)  loginEl.style.display  = 'none';
    if (clientEl) clientEl.style.display = 'none';
    if (dashEl) {
        dashEl.style.display   = 'block';
        dashEl.style.visibility = 'visible';
        dashEl.classList.remove('hidden');
    }

    // ── 6. Replace sidebar branding synchronously — no setTimeout
    // Sidebar brand name
    document.querySelectorAll('.sidebar-brand span, .sb-name, #adminHeaderTitle, [id*="adminHeader"] span').forEach(function(el) {
        if (el.textContent.trim() === 'NUI Admin' || el.textContent.trim() === 'Admin Dashboard' || el.id === 'adminHeaderTitle') {
            el.textContent = name + (role !== 'admin' ? ' — ' + role.charAt(0).toUpperCase() + role.slice(1) : '');
        }
    });

    // Sidebar logo: replace NUI icon-192.png with agency initial
    document.querySelectorAll('.sidebar-brand img, #adminHeaderLogo, [src*="icon-192"]').forEach(function(img) {
        var mark = document.createElement('div');
        mark.style.cssText = 'width:' + (img.style.height || '28px') + ';height:' + (img.style.height || '28px') + ';' +
            'min-width:28px;min-height:28px;border-radius:8px;background:' + brand + ';' +
            'display:inline-flex;align-items:center;justify-content:center;' +
            'font-size:15px;font-weight:900;color:#fff;flex-shrink:0;';
        mark.textContent = initials;
        if (img.parentNode) img.parentNode.replaceChild(mark, img);
    });

    // Header user info
    var userInfoEl = document.getElementById('adminUserInfo');
    if (userInfoEl) userInfoEl.textContent = name + ' · ' + (role.charAt(0).toUpperCase() + role.slice(1));

    // ── 7. Remove overlay — LAST, so no flash of NUI branding
    var overlay = document.getElementById('tenant-overlay');
    if (overlay) overlay.remove();

    // ── 8. Load dashboard panel + filter features + rename dashboard
    var landingPanel = (role === 'designer') ? 'projects' : 'dashboard';
    setTimeout(function() {
        if (typeof showAdminPanel === 'function') showAdminPanel(landingPanel);
        _applyBranding();
        // Replace dashboard title with agency name
        document.querySelectorAll('.admin-main h1, .admin-main h2, .admin-panel h1').forEach(function(h) {
            if (h.textContent.trim() === 'Dashboard' || h.textContent.indexOf('Dashboard') !== -1) {
                h.textContent = name + ' Dashboard';
            }
        });
    }, 100);
    setTimeout(function() { _filterFeatures(role); }, 300);

    // ── 10. Re-apply branding on every panel switch (MutationObserver)
    var mainEl = document.querySelector('.admin-main');
    if (mainEl) {
        var _brandObs = new MutationObserver(function() {
            _applyBranding();
            // Also rename any dashboard header in new panel content
            document.querySelectorAll('.admin-panel.active h1, .admin-panel.active h2').forEach(function(h) {
                if (h.textContent.indexOf('NUI') !== -1 || h.textContent.indexOf('New Urban Influence') !== -1) {
                    h.textContent = h.textContent.replace(/New Urban Influence/g, name).replace(/NUI/g, name);
                }
            });
        });
        _brandObs.observe(mainEl, { childList: true, subtree: true });
    }
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

// ── AUTO-INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    var intercepted = window._agencyTenantInit();
    if (intercepted) window._agencyTenantActive = true;
}, true);

})();
