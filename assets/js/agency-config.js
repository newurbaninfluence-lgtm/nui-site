// ============================================================
// AGENCY CONFIG — White-Label Configuration System
// 
// This file controls ALL tenant-specific settings:
// - Branding (logo, colors, fonts, name)
// - Active modules (which admin panels show)
// - Service definitions (frontend offerings)
// - Contact info
// - Feature flags (toggle anything on/off)
//
// To create a new agency instance:
// 1. Copy this file
// 2. Fill in the agency's details
// 3. Deploy with their config
// ============================================================

const AGENCY_CONFIG = {

    // ── IDENTITY ──────────────────────────────────────
    agency: {
        id: 'nui',
        name: 'New Urban Influence',
        shortName: 'NUI',
        tagline: "We Don't Design. We Influence.",
        domain: 'newurbaninfluence.com',
        email: 'hello@newurbaninfluence.com',
        phone: '(248) 487-8747',
        address: {
            street: '',
            city: 'Detroit',
            state: 'MI',
            zip: '',
            country: 'US'
        },
        socials: {
            instagram: '',
            facebook: '',
            linkedin: '',
            twitter: '',
            youtube: '',
            tiktok: ''
        }
    },

    // ── MASTER ADMIN ──────────────────────────────────
    masterAdmin: {
        email: 'newurbaninfluence@gmail.com',
        name: 'Faren Young',
        defaultPassword: 'newurban'
    },

    // ── BRANDING ──────────────────────────────────────
    brand: {
        logo: '/icons/icon-192.png',
        logoWhite: '/icons/icon-192.png',
        logoWidth: 30,    // px
        favicon: '/icons/favicon.ico',
        colors: {
            primary: '#dc2626',      // Main accent (buttons, highlights)
            primaryHover: '#b91c1c', // Hover state
            primaryLight: 'rgba(220,38,38,0.1)',  // Backgrounds
            secondary: '#1a1a1a',    // Cards, panels
            background: '#0a0a0a',   // Page bg
            surface: '#111111',      // Card bg
            text: '#ffffff',         // Primary text
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
            body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            accent: "'Teko', sans-serif"
        },
        borderRadius: '12px',
        glassEffect: 'rgba(255,255,255,0.03)'
    },

    // ── MODULES (Admin Panels) ────────────────────────
    // true = active, false = hidden but ready to enable
    modules: {
        dashboard:      true,
        clients:        true,
        projects:       true,
        orders:         true,    // Order/booking management
        crm:            true,    // CRM & lead management
        designer:       true,    // Brand designer tools
        seo:            true,    // SEO management
        rankintel:      true,    // Geo-grid rank tracking
        retargeting:    true,    // Meta Pixel + Google Ads
        emailmarketing: true,    // Email automation
        sms:            true,    // SMS automation
        aiphone:        true,    // AI phone assistant
        geofencing:     true,    // Geo-fencing campaigns
        analytics:      true,    // Analytics & reporting
        invoicing:      true,    // Invoicing & payments
        portfolio:      true,    // Portfolio/gallery
        integrations:   true,    // Third-party integrations
        settings:       true     // Account settings
    },

    // ── INTEGRATIONS ──────────────────────────────────
    integrations: {
        supabase: {
            url: '',      // Set per instance
            anonKey: ''   // Set per instance
        },
        checkcherry: {
            enabled: false,
            bookingUrl: ''
        },
        openphone: {
            enabled: false,
            apiKey: ''
        },
        stripe: {
            enabled: false,
            publicKey: ''
        },
        google: {
            mapsApiKey: '',
            ga4Id: '',
            gtmId: '',
            adsId: ''
        },
        meta: {
            pixelId: ''
        },
        rb2b: {
            enabled: false,
            id: ''
        }
    },

    // ── SERVICE PACKAGES (Frontend) ───────────────────
    // Define what shows on the public services page
    // Each agency can define their own packages
    services: {
        showBundles: true,
        showBrandSystem: true,
        packages: []  // Custom per agency — populated in instance configs
    },

    // ── NAVIGATION LABELS ─────────────────────────────
    // Customize what nav items are called
    navLabels: {
        dashboard: 'Dashboard',
        clients: 'Clients',
        projects: 'Projects',
        orders: 'Orders',
        crm: 'CRM',
        designer: 'Designer',
        seo: 'SEO',
        rankintel: 'Rank Intel',
        retargeting: 'Retargeting',
        emailmarketing: 'Email',
        sms: 'SMS',
        aiphone: 'AI Phone',
        geofencing: 'Geo-Fencing',
        analytics: 'Analytics',
        invoicing: 'Invoicing',
        portfolio: 'Portfolio',
        integrations: 'Integrations',
        settings: 'Settings'
    }
};


// ============================================================
// CONFIG HELPERS — Use these throughout the app
// ============================================================

// Check if a module is enabled
function isModuleEnabled(moduleId) {
    return AGENCY_CONFIG.modules[moduleId] === true;
}

// Get brand color (falls back to default)
function getBrandColor(key) {
    return (AGENCY_CONFIG.brand && AGENCY_CONFIG.brand.colors && AGENCY_CONFIG.brand.colors[key]) || '#dc2626';
}

// Get agency info
function getAgencyName() { return AGENCY_CONFIG.agency.name; }
function getAgencyShortName() { return AGENCY_CONFIG.agency.shortName; }
function getAgencyPhone() { return AGENCY_CONFIG.agency.phone; }
function getAgencyEmail() { return AGENCY_CONFIG.agency.email; }

// Get nav label (custom or default)
function getNavLabel(moduleId) {
    return (AGENCY_CONFIG.navLabels && AGENCY_CONFIG.navLabels[moduleId]) || moduleId;
}

// Inject CSS variables from config into :root
function applyBrandTheme() {
    const c = AGENCY_CONFIG.brand.colors;
    const root = document.documentElement;
    root.style.setProperty('--red', c.primary);
    root.style.setProperty('--red-hover', c.primaryHover);
    root.style.setProperty('--red-light', c.primaryLight);
    root.style.setProperty('--bg', c.background);
    root.style.setProperty('--surface', c.surface);
    root.style.setProperty('--text', c.text);
    root.style.setProperty('--gray', c.textMuted);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--success', c.success);
    root.style.setProperty('--warning', c.warning);
    root.style.setProperty('--error', c.error);
    root.style.setProperty('--info', c.info);
    root.style.setProperty('--font-heading', AGENCY_CONFIG.brand.fonts.heading);
    root.style.setProperty('--font-body', AGENCY_CONFIG.brand.fonts.body);

    // Update page title
    document.title = document.title.replace(/New Urban Influence|NUI/g, AGENCY_CONFIG.agency.name);

    // Update favicon if custom
    if (AGENCY_CONFIG.brand.favicon) {
        const fav = document.querySelector("link[rel*='icon']");
        if (fav) fav.href = AGENCY_CONFIG.brand.favicon;
    }
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrandTheme);
} else {
    applyBrandTheme();
}


// ============================================================
// NAV FILTER — Hide disabled modules from admin sidebar
// ============================================================

// Map data-panel values to module keys
const _panelToModule = {
    'dashboard': 'dashboard',
    'clients': 'clients',
    'leads': 'crm',
    'contacthub': 'crm',
    'visitors': 'crm',
    'projects': 'projects',
    'proofs': 'projects',
    'brandguide': 'designer',
    'payments': 'invoicing',
    'invoices': 'invoicing',
    'seo': 'seo',
    'rankintel': 'rankintel',
    'blog': 'seo',
    'emailmarketing': 'emailmarketing',
    'retargeting': 'retargeting',
    'assets': 'designer',
    'moodboard': 'designer',
    'sites': 'designer',
    'integrations': 'integrations',
    'usermanagement': 'settings',
    'calendar': 'dashboard',
    'orders': 'orders',
    'stats': 'analytics',
    'portfolio': 'portfolio'
};

function filterAdminNav() {
    if (typeof AGENCY_CONFIG === 'undefined') return;
    
    const links = document.querySelectorAll('.admin-nav-link[data-panel]');
    links.forEach(link => {
        const panel = link.getAttribute('data-panel');
        const moduleKey = _panelToModule[panel];
        
        if (moduleKey && !isModuleEnabled(moduleKey)) {
            // Hide the link but keep it in DOM (for future toggle-on)
            link.style.display = 'none';
            link.setAttribute('data-module-disabled', 'true');
        } else {
            link.style.display = '';
            link.removeAttribute('data-module-disabled');
        }

        // Apply custom nav labels if defined
        if (moduleKey && AGENCY_CONFIG.navLabels && AGENCY_CONFIG.navLabels[moduleKey]) {
            // Only replace the text node, keep the SVG icon
            const svg = link.querySelector('svg');
            if (svg) {
                link.textContent = '';
                link.appendChild(svg);
                link.appendChild(document.createTextNode(AGENCY_CONFIG.navLabels[moduleKey]));
            }
        }
    });

    // Also hide section headers if ALL their children are hidden
    const sections = document.querySelectorAll('.admin-nav-section');
    sections.forEach(section => {
        const visibleLinks = section.querySelectorAll('.admin-nav-link:not([data-module-disabled])');
        if (visibleLinks.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// Also update the logo in the sidebar
function updateAdminBranding() {
    if (typeof AGENCY_CONFIG === 'undefined') return;

    // Update sidebar logo
    const logoEls = document.querySelectorAll('.admin-sidebar-logo img, .nav-logo img');
    logoEls.forEach(img => {
        if (AGENCY_CONFIG.brand.logo) {
            img.src = AGENCY_CONFIG.brand.logo;
            img.alt = AGENCY_CONFIG.agency.shortName;
            if (AGENCY_CONFIG.brand.logoWidth) {
                img.style.width = AGENCY_CONFIG.brand.logoWidth + 'px';
                img.style.height = 'auto';
            }
        }
    });

    // Update sidebar agency name text
    const nameEls = document.querySelectorAll('.admin-sidebar-title, .sidebar-brand-name');
    nameEls.forEach(el => {
        el.textContent = AGENCY_CONFIG.agency.name;
    });
}


// ============================================================
// POST-RENDER REBRANDING — Swap NUI text/logos in DOM
// Runs after portal view loads, catches all hardcoded references
// ============================================================

function rebrandPortal() {
    if (typeof AGENCY_CONFIG === 'undefined' || AGENCY_CONFIG.agency.id === 'nui') return;

    const name = AGENCY_CONFIG.agency.name;
    const short = AGENCY_CONFIG.agency.shortName;
    const tagline = AGENCY_CONFIG.agency.tagline;
    const color = AGENCY_CONFIG.brand.colors.primary;
    const logo = AGENCY_CONFIG.brand.logo;
    const font = AGENCY_CONFIG.brand.fonts.heading;

    // ── Login page hero text ──
    const heroText = document.querySelector('.login-visual-content');
    if (heroText) {
        const titleDiv = heroText.querySelector('div[style*="font-family"]');
        if (titleDiv) {
            titleDiv.style.fontFamily = font;
            titleDiv.innerHTML = name.replace(/(\\S+)$/, `<span style="color:${color}">$1</span>`);
        }
        const desc = heroText.querySelector('p');
        if (desc) desc.textContent = tagline;
        const loc = heroText.querySelector('div[style*="Detroit"]');
        if (loc && AGENCY_CONFIG.agency.address.city) {
            loc.textContent = '📍 ' + AGENCY_CONFIG.agency.address.city + ', ' + AGENCY_CONFIG.agency.address.state;
        }
    }

    // ── Login box logo + title ──
    const loginLogo = document.querySelector('.login-box-header img');
    if (loginLogo) {
        loginLogo.src = logo;
        loginLogo.alt = short;
    }
    const loginTitle = document.querySelector('.login-box-header h2');
    if (loginTitle) loginTitle.textContent = short + ' Portal';
    const loginDesc = document.querySelector('.login-box-header p');
    if (loginDesc) loginDesc.textContent = 'Access your dashboard & tools';

    // ── Sidebar brand ──
    const sidebarLogo = document.querySelector('.sidebar-brand img');
    if (sidebarLogo) {
        sidebarLogo.src = logo;
        sidebarLogo.alt = short;
    }
    const sidebarName = document.querySelector('.sidebar-brand span');
    if (sidebarName) sidebarName.textContent = short + ' Admin';

    // ── Header logo ──
    const headerLogo = document.getElementById('adminHeaderLogo');
    if (headerLogo) {
        headerLogo.src = logo;
        headerLogo.alt = short;
    }

    // ── Hide demo credentials section ──
    const demoSection = document.getElementById('staffDemoSection');
    if (demoSection) demoSection.style.display = 'none';

    // ── Global text replacement for email templates ──
    // These get handled at send-time via getAgencyName() helpers

    console.log(`✅ Portal rebranded for: ${name}`);
}

// Watch for portal view load and rebrand
const _rebrandObserver = new MutationObserver(function(mutations) {
    for (const m of mutations) {
        if (m.addedNodes.length) {
            const loginBox = document.querySelector('.login-box-header');
            if (loginBox) {
                rebrandPortal();
                // Don't disconnect — sidebar loads later too
            }
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
// BRANDED EMAIL HELPERS — Config-driven email content
// ============================================================

function getBrandedEmailFooter() {
    const name = getAgencyName();
    const city = AGENCY_CONFIG.agency.address?.city || '';
    const state = AGENCY_CONFIG.agency.address?.state || '';
    const domain = AGENCY_CONFIG.agency.domain || '';
    const loc = [city, state].filter(Boolean).join(', ');
    return `<p class="text-muted fs-12 m-0">${name}${loc ? ' • ' + loc : ''}${domain ? ' • ' + domain : ''}</p>`;
}

function getBrandedEmailSignature() {
    return `<p style="color: #888; margin-top: 24px;">— The ${getAgencyShortName()} Team</p>`;
}

function getBrandedWelcomeSubject(clientName) {
    return `Welcome to ${getAgencyName()}, ${clientName}! 🎨`;
}

function getBrandedEmailHeader() {
    const color = getBrandColor('primary');
    return `<h2 style="margin: 0; font-size: 28px; color: #fff;">Welcome to ${getAgencyShortName()}</h2>`;
}

// Replace NUI references in any email HTML string
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
