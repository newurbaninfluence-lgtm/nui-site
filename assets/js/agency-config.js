// ============================================================
// AGENCY CONFIG — NUI Master Configuration
//
// This is the DEFAULT config for the NUI admin panel.
// It uses id: 'nui' which tells rebrandPortal() and brandEmailHtml()
// to leave all NUI branding untouched.
//
// Sub-account tenants get their config loaded dynamically from
// Supabase via agency-tenant.js (URL ?agency=SLUG).
// Per-tenant static configs live in /configs/[slug]-config.js
// and are only used for self-hosted white-label deploys.
// ============================================================

const AGENCY_CONFIG = {

    agency: {
        id: 'nui',   // ← CRITICAL: keeps rebrand/email helpers from firing on NUI admin
        name: 'New Urban Influence',
        shortName: 'NUI',
        tagline: "We don't design. We influence.",
        domain: 'newurbaninfluence.com',
        email: 'info@newurbaninfluence.com',
        phone: '(248) 487-8747',
        address: { street: '', city: 'Detroit', state: 'MI', zip: '', country: 'US' },
        socials: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', tiktok: '' }
    },

    masterAdmin: {
        email: 'info@newurbaninfluence.com',
        name: 'Faren Young',
        defaultPassword: ''
    },

    brand: {
        logo: '/logo-nav-cropped.png',
        logoWhite: '/logo-nav-cropped.png',
        logoWidth: 140,
        favicon: '/favicon.ico',
        colors: {
            primary: '#dc2626',
            primaryHover: '#b91c1c',
            primaryLight: 'rgba(220,38,38,0.1)',
            secondary: '#111111',
            background: '#000000',
            surface: '#0a0a0a',
            text: '#ffffff',
            textMuted: 'rgba(255,255,255,0.5)',
            textDim: 'rgba(255,255,255,0.3)',
            border: 'rgba(255,255,255,0.06)',
            success: '#4ade80',
            warning: '#facc15',
            error: '#ef4444',
            info: '#818cf8'
        },
        fonts: {
            heading: "'Syne', sans-serif",
            body: "'Montserrat', sans-serif",
            accent: "'Syne', sans-serif"
        },
        borderRadius: '10px',
        glassEffect: 'rgba(255,255,255,0.03)'
    },

    // NUI master has ALL modules enabled
    modules: {
        dashboard:      true,
        clients:        true,
        projects:       true,
        orders:         true,
        crm:            true,
        designer:       true,
        moodboard:      true,
        print:          true,
        seo:            true,
        rankintel:      true,
        citations:      true,
        retargeting:    true,
        emailmarketing: true,
        sms:            true,
        aiphone:        true,
        geofencing:     true,
        analytics:      true,
        invoicing:      true,
        portfolio:      true,
        integrations:   true,
        settings:       true,
        subaccounts:    true,
        sites:          true,
        visitors:       true
    },

    integrations: {
        supabase: { url: '', anonKey: '' },
        checkcherry: { enabled: false, bookingUrl: '' },
        openphone: { enabled: true, apiKey: '' },
        stripe: { enabled: true, publicKey: '' },
        google: { mapsApiKey: '', ga4Id: '', gtmId: '', adsId: '' },
        meta: { pixelId: '' },
        rb2b: { enabled: false, id: '' }
    },

    services: {
        showBundles: true,
        showBrandSystem: true,
        packages: []
    },

    navLabels: {
        dashboard: 'Dashboard',
        clients: 'Clients',
        projects: 'Projects',
        orders: 'Orders',
        crm: 'CRM',
        seo: 'SEO',
        rankintel: 'Rank Intel',
        citations: 'Citations',
        retargeting: 'Retargeting',
        emailmarketing: 'Email',
        sms: 'SMS',
        aiphone: 'AI Phone',
        geofencing: 'Geo-Fencing',
        analytics: 'Analytics',
        invoicing: 'Invoicing',
        integrations: 'Integrations',
        settings: 'Settings',
        subaccounts: 'Sub-Accounts',
        sites: 'Client Sites',
        visitors: 'Visitors'
    }
};


// ============================================================
// CONFIG HELPERS — Used throughout the app
// ============================================================

function isModuleEnabled(moduleId) {
    return AGENCY_CONFIG.modules[moduleId] === true;
}

function getBrandColor(key) {
    return (AGENCY_CONFIG.brand && AGENCY_CONFIG.brand.colors && AGENCY_CONFIG.brand.colors[key]) || '#dc2626';
}

function getAgencyName()      { return AGENCY_CONFIG.agency.name; }
function getAgencyShortName() { return AGENCY_CONFIG.agency.shortName; }
function getAgencyPhone()     { return AGENCY_CONFIG.agency.phone; }
function getAgencyEmail()     { return AGENCY_CONFIG.agency.email; }

function getNavLabel(moduleId) {
    return (AGENCY_CONFIG.navLabels && AGENCY_CONFIG.navLabels[moduleId]) || moduleId;
}

// Inject CSS variables from config into :root
// For NUI admin this is a no-op because global.css already sets the same values.
// For white-label sub-accounts, agency-tenant.js overrides these after login.
function applyBrandTheme() {
    const c = AGENCY_CONFIG.brand.colors;
    const root = document.documentElement;
    root.style.setProperty('--red',        c.primary);
    root.style.setProperty('--red-hover',  c.primaryHover);
    root.style.setProperty('--red-light',  c.primaryLight);
    root.style.setProperty('--bg',         c.background);
    root.style.setProperty('--surface',    c.surface);
    root.style.setProperty('--text',       c.text);
    root.style.setProperty('--gray',       c.textMuted);
    root.style.setProperty('--border',     c.border);
    root.style.setProperty('--success',    c.success);
    root.style.setProperty('--warning',    c.warning);
    root.style.setProperty('--error',      c.error);
    root.style.setProperty('--info',       c.info);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrandTheme);
} else {
    applyBrandTheme();
}


// ============================================================
// NAV FILTER — Hide disabled modules from admin sidebar
// For NUI master all modules are enabled so this is effectively a no-op.
// For sub-accounts, agency-tenant.js calls _filterAgencyFeatures() instead.
// ============================================================

const _panelToModule = {
    'dashboard':     'dashboard',
    'calendar':      'dashboard',
    'clients':       'clients',
    'leads':         'crm',
    'contacthub':    'crm',
    'visitors':      'visitors',
    'projects':      'projects',
    'proofs':        'projects',
    'brandguide':    'designer',
    'payments':      'invoicing',
    'invoices':      'invoicing',
    'seo':           'seo',
    'rankintel':     'rankintel',
    'gmb':           'seo',
    'citations':     'citations',
    'blog':          'seo',
    'emailmarketing':'emailmarketing',
    'retargeting':   'retargeting',
    'assets':        'designer',
    'moodboard':     'moodboard',
    'sites':         'sites',
    'integrations':  'integrations',
    'usermanagement':'settings',
    'subaccounts':   'subaccounts',
    'orders':        'orders',
    'stats':         'analytics',
    'portfolio':     'portfolio',
    'monty':         'dashboard'
};

function filterAdminNav() {
    if (typeof AGENCY_CONFIG === 'undefined') return;
    const links = document.querySelectorAll('.admin-nav-link[data-panel]');
    links.forEach(link => {
        const panel     = link.getAttribute('data-panel');
        const moduleKey = _panelToModule[panel];
        if (moduleKey && !isModuleEnabled(moduleKey)) {
            link.style.display = 'none';
            link.setAttribute('data-module-disabled', 'true');
        } else {
            link.style.display = '';
            link.removeAttribute('data-module-disabled');
        }
    });
    document.querySelectorAll('.admin-nav-section').forEach(section => {
        const visible = section.querySelectorAll('.admin-nav-link:not([data-module-disabled])');
        section.style.display = visible.length === 0 ? 'none' : '';
    });
}

function updateAdminBranding() {
    if (typeof AGENCY_CONFIG === 'undefined') return;
    document.querySelectorAll('.admin-sidebar-logo img, .nav-logo img').forEach(img => {
        if (AGENCY_CONFIG.brand.logo) {
            img.src = AGENCY_CONFIG.brand.logo;
            img.alt = AGENCY_CONFIG.agency.shortName;
            if (AGENCY_CONFIG.brand.logoWidth) {
                img.style.width  = AGENCY_CONFIG.brand.logoWidth + 'px';
                img.style.height = 'auto';
            }
        }
    });
    document.querySelectorAll('.admin-sidebar-title, .sidebar-brand-name').forEach(el => {
        el.textContent = AGENCY_CONFIG.agency.name;
    });
}


// ============================================================
// POST-RENDER REBRANDING
// Only runs for sub-account tenants (id !== 'nui').
// Guarded against infinite loops — observer disconnects before
// touching the DOM, and only fires once per page load.
// ============================================================

function rebrandPortal() {
    // NUI master admin — nothing to rebrand
    if (typeof AGENCY_CONFIG === 'undefined' || AGENCY_CONFIG.agency.id === 'nui') return;

    const name    = AGENCY_CONFIG.agency.name;
    const short   = AGENCY_CONFIG.agency.shortName;
    const tagline = AGENCY_CONFIG.agency.tagline;
    const color   = AGENCY_CONFIG.brand.colors.primary;
    const logo    = AGENCY_CONFIG.brand.logo;
    const font    = AGENCY_CONFIG.brand.fonts.heading;

    const heroText = document.querySelector('.login-visual-content');
    if (heroText) {
        const titleDiv = heroText.querySelector('div[style*="font-family"]');
        if (titleDiv) { titleDiv.style.fontFamily = font; titleDiv.textContent = name; }
        const desc = heroText.querySelector('p');
        if (desc) desc.textContent = tagline;
        const loc = heroText.querySelector('div[style*="Detroit"]');
        if (loc && AGENCY_CONFIG.agency.address.city) {
            loc.textContent = '📍 ' + AGENCY_CONFIG.agency.address.city + ', ' + AGENCY_CONFIG.agency.address.state;
        }
    }
    const loginLogo = document.querySelector('.login-box-header img');
    if (loginLogo) { loginLogo.src = logo; loginLogo.alt = short; }
    const loginTitle = document.querySelector('.login-box-header h2');
    if (loginTitle) loginTitle.textContent = short + ' Portal';
    const loginDesc = document.querySelector('.login-box-header p');
    if (loginDesc) loginDesc.textContent = 'Access your dashboard & tools';
    const sidebarLogo = document.querySelector('.sidebar-brand img');
    if (sidebarLogo) { sidebarLogo.src = logo; sidebarLogo.alt = short; }
    const sidebarName = document.querySelector('.sidebar-brand span');
    if (sidebarName) sidebarName.textContent = short + ' Admin';
    const headerLogo = document.getElementById('adminHeaderLogo');
    if (headerLogo) { headerLogo.src = logo; headerLogo.alt = short; }
    const demoSection = document.getElementById('staffDemoSection');
    if (demoSection) demoSection.style.display = 'none';
    console.log('✅ Portal rebranded for:', name);
}

// Disconnect before touching DOM to prevent infinite loop
var _rebrandDone = false;
const _rebrandObserver = new MutationObserver(function(mutations) {
    if (_rebrandDone) return;
    for (const m of mutations) {
        if (m.addedNodes.length && document.querySelector('.login-box-header')) {
            _rebrandObserver.disconnect();
            rebrandPortal();
            _rebrandDone = true;
            return;
        }
    }
});

if (document.getElementById('portalView')) {
    _rebrandObserver.observe(document.getElementById('portalView'), { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', function() {
        const pv = document.getElementById('portalView');
        if (pv) _rebrandObserver.observe(pv, { childList: true, subtree: true });
    });
}


// ============================================================
// BRANDED EMAIL HELPERS
// ============================================================

function getBrandedEmailFooter() {
    const name   = getAgencyName();
    const city   = AGENCY_CONFIG.agency.address?.city || '';
    const state  = AGENCY_CONFIG.agency.address?.state || '';
    const domain = AGENCY_CONFIG.agency.domain || '';
    const loc    = [city, state].filter(Boolean).join(', ');
    return `<p class="text-muted fs-12 m-0">${name}${loc ? ' • ' + loc : ''}${domain ? ' • ' + domain : ''}</p>`;
}

function getBrandedEmailSignature() {
    return `<p style="color:#888;margin-top:24px;">— The ${getAgencyShortName()} Team</p>`;
}

function getBrandedWelcomeSubject(clientName) {
    return `Welcome to ${getAgencyName()}, ${clientName}! 🎨`;
}

function getBrandedEmailHeader() {
    const color = getBrandColor('primary');
    return `<h2 style="margin:0;font-size:28px;color:#fff;">Welcome to ${getAgencyShortName()}</h2>`;
}

function brandEmailHtml(html) {
    if (typeof AGENCY_CONFIG === 'undefined' || AGENCY_CONFIG.agency.id === 'nui') return html;
    return html
        .replace(/New Urban Influence/g, getAgencyName())
        .replace(/NUI/g, getAgencyShortName())
        .replace(/newurbaninfluence\.com/g, AGENCY_CONFIG.agency.domain || 'newurbaninfluence.com')
        .replace(/#dc2626/g, getBrandColor('primary'))
        .replace(/#b91c1c/g, getBrandColor('primaryHover'))
        .replace(/Detroit, MI/g,
            [AGENCY_CONFIG.agency.address?.city, AGENCY_CONFIG.agency.address?.state].filter(Boolean).join(', ') || 'Detroit, MI'
        );
}
