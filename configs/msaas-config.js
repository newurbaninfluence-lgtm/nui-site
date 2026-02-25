// ============================================================
// MSaaS AGENCY — Full System ($1,000 + $300/mo)
// Beta client — all modules enabled
// ============================================================

const AGENCY_CONFIG = {

    agency: {
        id: 'msaas',
        name: 'MSaaS Agency',
        shortName: 'MSaaS',
        tagline: 'AI Assistants that Fully Automate for Conversion',
        domain: 'msaasagency.com',
        email: 'info@msaasagency.com',
        phone: '(866) 781-5220',
        address: { street: '', city: '', state: '', zip: '', country: 'US' },
        socials: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', tiktok: '' }
    },

    masterAdmin: {
        email: '',           // MSaaS owner email — fill before deploy
        name: '',            // MSaaS owner name
        defaultPassword: ''  // Set before deploy
    },

    brand: {
        logo: '/icons/msaas-logo.png',
        logoWhite: '/icons/msaas-logo-white.png',
        logoWidth: 140,
        favicon: '/icons/msaas-favicon.ico',
        colors: {
            primary: '#6366f1',          // Indigo/purple from their site
            primaryHover: '#4f46e5',
            primaryLight: 'rgba(99,102,241,0.1)',
            secondary: '#1a1a2e',
            background: '#0a0a0f',
            surface: '#111118',
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
            heading: "'Inter', sans-serif",
            body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            accent: "'Inter', sans-serif"
        },
        borderRadius: '12px',
        glassEffect: 'rgba(255,255,255,0.03)'
    },

    // ALL modules enabled — full system beta
    modules: {
        dashboard:      true,
        clients:        true,
        projects:       true,
        orders:         true,
        crm:            true,
        designer:       false,   // MSaaS doesn't do brand design
        seo:            true,
        rankintel:      true,
        retargeting:    true,
        emailmarketing: true,
        sms:            true,
        aiphone:        true,
        geofencing:     true,
        analytics:      true,
        invoicing:      true,
        portfolio:       false,  // No portfolio needed
        integrations:   true,
        settings:       true
    },

    integrations: {
        supabase: { url: '', anonKey: '' },  // MSaaS gets own Supabase project
        checkcherry: { enabled: false, bookingUrl: '' },
        openphone: { enabled: false, apiKey: '' },
        stripe: { enabled: false, publicKey: '' },
        google: { mapsApiKey: '', ga4Id: '', gtmId: '', adsId: '' },
        meta: { pixelId: '' },
        rb2b: { enabled: false, id: '' }
    },

    services: {
        showBundles: true,
        showBrandSystem: false,
        packages: [
            { id: 'ai-chat', name: 'AI Chat Assistant', price: 297, type: 'monthly' },
            { id: 'ai-voice', name: 'AI Voice Agent', price: 497, type: 'monthly' },
            { id: 'ai-full', name: 'Full AI Suite', price: 997, type: 'monthly' },
            { id: 'online-presence', name: 'Online Presence', price: 497, type: 'monthly' }
        ]
    },

    navLabels: {
        dashboard: 'Dashboard',
        clients: 'Clients',
        projects: 'Projects',
        orders: 'Orders',
        crm: 'CRM',
        seo: 'SEO',
        rankintel: 'Rank Intel',
        retargeting: 'Retargeting',
        emailmarketing: 'Email',
        sms: 'SMS',
        aiphone: 'AI Phone',
        geofencing: 'Geo-Fencing',
        analytics: 'Analytics',
        invoicing: 'Invoicing',
        integrations: 'Integrations',
        settings: 'Settings'
    }
};
