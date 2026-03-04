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

// ── BOOT ─────────────────────────────────────────────────────
window._agencyTenantInit = function() {
    var params = new URLSearchParams(window.location.search);
    _agencySlug = params.get('agency');
    if (!_agencySlug) return false;

    document.title = 'Portal — Loading...';
    _showOverlay(_html.loading());

    // Check saved session
    try {
        var saved = localStorage.getItem('nui_agency_session') ||
                    sessionStorage.getItem('nui_agency_session');
        if (saved) {
            var sess = JSON.parse(saved);
            if (sess.slug === _agencySlug && sess.role && sess.data) {
                _agencySession = sess;
                _agencyData    = sess.data;
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
    try {
        if (typeof db !== 'undefined' && db) {
            var res = await db.from('agency_subaccounts').select('*')
                .eq('portal_slug', _agencySlug).single();
            if (!res.error && res.data) {
                _agencyData = res.data;
            } else {
                var r2 = await db.from('agency_subaccounts').select('*')
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
        { id: 'designer', icon: '🎨', title: 'Designer', desc: 'Brand guide, moodboard, proofs & creative tools', always: false, enabled: hasDesigner },
        { id: 'client',   icon: '👤', title: 'Client',   desc: 'View invoices, proofs, messages & project status', always: true },
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
    if (_agencyData && typeof db !== 'undefined' && db) {
        try {
            await db.from('agency_subaccounts').update({
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

    // Inject brand CSS vars — REPLACE all NUI red with agency color
    var style = document.getElementById('agency-tenant-styles') || document.createElement('style');
    style.id = 'agency-tenant-styles';
    style.textContent =
        ':root{--admin-accent:' + brand + ' !important;--brand-primary:' + brand + ' !important;}' +
        '.admin-nav-link.active,.ni.on{background:' + brand + '18 !important;color:' + brand + ' !important;border-color:' + brand + '33 !important;}' +
        '.btn-primary,.admin-save-btn,.sidebar-logo-dot{background:' + brand + ' !important;}' +
        // Hide NUI logo text / branding elements completely
        '.nui-wordmark,.nui-brand-text,.sidebar-powered{display:none !important;}';
    if (!style.parentNode) document.head.appendChild(style);

    document.title = name + ' — ' + (role.charAt(0).toUpperCase()+role.slice(1)) + ' Portal';

    // Set globals for feature filtering
    window._isAgencyTenant = true;
    window._agencyRole     = role;
    window._agencyData     = d;
    window._agencyFeatures = Array.isArray(d.features) ? d.features : [];
    window._agencyKeys     = d.integrations_config || {};

    // Remove overlay, boot portal
    var overlay = document.getElementById('tenant-overlay');
    if (overlay) overlay.remove();

    if (typeof loadPortalView === 'function') loadPortalView();

    setTimeout(_applyBranding, 350);
    setTimeout(function(){ _filterFeatures(role); }, 600);
}

// ── APPLY BRANDING ────────────────────────────────────────────
function _applyBranding() {
    var d     = _agencyData;
    var brand = d.brand_color || '#6366f1';
    var name  = d.agency_name;

    // Replace sidebar brand name — never show "New Urban Influence"
    var brandEls = document.querySelectorAll('.sidebar-brand span,.sb-name,.admin-brand-name');
    brandEls.forEach(function(el){ el.textContent = name; });

    // Replace any NUI logo images with styled text logo mark
    var logoImgs = document.querySelectorAll('.sidebar-logo img,.admin-logo img,.sb-logo img');
    logoImgs.forEach(function(img){
        var wrap = img.parentNode;
        var mark = document.createElement('div');
        mark.style.cssText = 'width:32px;height:32px;border-radius:9px;background:' + brand + ';' +
            'display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;';
        mark.textContent = name.charAt(0).toUpperCase();
        wrap.replaceChild(mark, img);
    });

    // Add "Powered by NUI" in footer only — subtle, never on main UI
    var foot = document.querySelector('.sidebar-footer,.sb-foot');
    if (foot && !foot.querySelector('.nui-powered')) {
        var p = document.createElement('div');
        p.className = 'nui-powered';
        p.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.15);margin-top:8px;text-align:center;';
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
        designer: ['dashboard','projects','designer','moodboard','brandguide','assets','proofs'],
        client:   ['dashboard','proofs','invoices','payments','calendar','messaging'],
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
        // Hide if not in their plan features (admin only — designers/clients have fixed panels)
        if (role === 'admin' && feat && !features.includes(feat)) {
            el.style.opacity = '0.25';
            el.style.pointerEvents = 'none';
            el.title = 'Not included in your plan';
        }
    });

    // Always hide sub-accounts panel from tenants
    document.querySelectorAll('[data-panel="subaccounts"],[onclick*="subaccounts"]').forEach(function(el){
        el.style.display = 'none';
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
