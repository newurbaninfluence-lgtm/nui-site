// ============================================================
// AJ PHOTOGRAPHY STUDIO — Lite System ($150/mo)
// Core: Orders/Booking, Email, SMS, OpenPhone
// Everything else toggled OFF but ready to upsell
// ============================================================

const AGENCY_CONFIG = {

    agency: {
        id: 'ajphoto',
        name: 'AJ Photography Studio',
        shortName: 'AJ Photo',
        tagline: 'Capturing Moments Since 2012',
        domain: 'ajvip.com',
        email: '',
        phone: '',
        address: { street: '', city: 'Detroit', state: 'MI', zip: '', country: 'US' },
        socials: { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', tiktok: '' }
    },

    brand: {
        logo: '/icons/aj-logo.png',
        logoWhite: '/icons/aj-logo-white.png',
        logoWidth: 120,
        favicon: '/icons/aj-favicon.ico',
        colors: {
            primary: '#c9a84c',          // Gold accent to match photography premium feel
            primaryHover: '#b8943e',
            primaryLight: 'rgba(201,168,76,0.1)',
            secondary: '#1a1a1a',
            background: '#0a0a0a',
            surface: '#111111',
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
            heading: "'Playfair Display', serif",
            body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            accent: "'Playfair Display', serif"
        },
        borderRadius: '8px',
        glassEffect: 'rgba(255,255,255,0.03)'
    },

    // LITE — only what AJ needs now
    // Everything else OFF but toggleable for future upsell
    modules: {
        dashboard:      true,    // ✅ Always on
        clients:        true,    // ✅ Client management
        projects:       true,    // ✅ Track shoots as projects
        orders:         true,    // ✅ CORE — booking/order system (CheckCherry bridge)
        crm:            false,   // 💰 Upsell later
        designer:       false,   // Not applicable
        seo:            false,   // 💰 Upsell later
        rankintel:      false,   // 💰 Upsell later
        retargeting:    false,   // 💰 Upsell later
        emailmarketing: true,    // ✅ CORE — email system
        sms:            true,    // ✅ CORE — SMS system
        aiphone:        false,   // 💰 Upsell later (OpenPhone integration ready)
        geofencing:     false,   // 💰 Upsell later
        analytics:      false,   // 💰 Upsell later
        invoicing:      true,    // ✅ Send invoices for shoots
        portfolio:      true,    // ✅ Show photography work
        integrations:   true,    // ✅ CheckCherry + OpenPhone connections
        settings:       true     // ✅ Always on
    },

    integrations: {
        supabase: { url: '', anonKey: '' },  // AJ gets own Supabase project
        checkcherry: {
            enabled: true,
            bookingUrl: 'https://aj-photography.checkcherry.com'
        },
        openphone: {
            enabled: true,   // AJ wants OpenPhone
            apiKey: ''
        },
        stripe: { enabled: false, publicKey: '' },
        google: { mapsApiKey: '', ga4Id: '', gtmId: '', adsId: '' },
        meta: { pixelId: '' },
        rb2b: { enabled: false, id: '' }
    },

    services: {
        showBundles: false,
        showBrandSystem: false,
        packages: [
            { id: 'maternity', name: 'Maternity + Pregnancy', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42573' },
            { id: 'personal', name: 'Adult Personal & Lifestyle', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42574' },
            { id: 'graduation', name: 'Graduation', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42576' },
            { id: 'couples', name: 'Engagement + Couples', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42577' },
            { id: 'family', name: 'Family', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42578' },
            { id: 'headshot', name: 'Professional Head Shot', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42579' },
            { id: 'prom', name: 'Prom + Senior Photos', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/event_type?package_group_id=9262' },
            { id: 'business', name: 'Business Photos', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=42596' },
            { id: 'throne', name: 'Throne Chair Rental', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=4010' },
            { id: 'moneybooth', name: 'Money Machine Rental', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=4010' },
            { id: 'photobooth', name: 'Photobooth Rental', price: 0, type: 'booking', bookingUrl: 'https://aj-photography.checkcherry.com/reservation/set_event?package_group_id=4010' }
        ]
    },

    navLabels: {
        dashboard: 'Dashboard',
        clients: 'Clients',
        projects: 'Shoots',       // Renamed for photographer context
        orders: 'Bookings',       // Renamed — ties to CheckCherry
        emailmarketing: 'Email',
        sms: 'SMS',
        invoicing: 'Invoicing',
        portfolio: 'Gallery',     // Renamed for photographer context
        integrations: 'Connections',
        settings: 'Settings'
    }
};
