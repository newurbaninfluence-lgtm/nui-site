// ==================== BRAND GUIDE CONFIG ====================
// Package templates, deliverable definitions, data helpers

const BRAND_GUIDE_PACKAGES = {
    'brand-kit': {
        name: 'Brand Kit',
        price: '$1,500',
        categories: [
            { id: 'logo', title: 'Logo Design', icon: '◆', items: [
                { id: 'primary-logo', name: 'Primary Logo', formats: 'PNG, SVG, PDF' },
                { id: 'secondary-logo', name: 'Secondary Logo Variation', formats: 'PNG, SVG, PDF' },
                { id: 'icon-mark', name: 'Icon/Mark Version', formats: 'PNG, SVG, PDF' }
            ]},
            { id: 'colors', title: 'Color Palette & Typography', icon: '🎨', items: [
                { id: 'color-system', name: 'Color System', type: 'colors' },
                { id: 'typography', name: 'Font Pairing', type: 'fonts' }
            ]},
            { id: 'strategy', title: 'Brand Strategy', icon: '🎯', items: [
                { id: 'target-market', name: 'Target Market Identifier', type: 'text' },
                { id: 'brand-voice', name: 'Brand Voice Guidelines', type: 'text' }
            ]},
            { id: 'social', title: 'Social Media Banners', icon: '📱', items: [
                { id: 'fb-cover', name: 'Facebook Cover' },
                { id: 'ig-profile', name: 'Instagram Profile & Highlights' },
                { id: 'linkedin-banner', name: 'LinkedIn Banner' },
                { id: 'yt-art', name: 'YouTube Channel Art' }
            ]},
            { id: 'mockups', title: 'Logo In Action', icon: '📸', items: [
                { id: 'biz-card-mockup', name: 'Business Card Mockup' },
                { id: 'social-preview', name: 'Social Media Preview' },
                { id: 'signage-mockup', name: 'Signage/Storefront Mockup' },
                { id: 'merch-preview', name: 'Apparel/Merch Preview' }
            ]}
        ]
    },
    'service-brand': {
        name: 'Service Brand Identity',
        price: '$4,500',
        categories: [
            { id: 'logo', title: 'Core Brand Identity', icon: '◆', items: [
                { id: 'primary-logo', name: 'Primary Logo', formats: 'PNG, SVG, PDF' },
                { id: 'secondary-logo', name: 'Secondary Logo', formats: 'PNG, SVG, PDF' },
                { id: 'icon-mark', name: 'Icon Version', formats: 'PNG, SVG, PDF' },
                { id: 'color-system', name: 'Color System', type: 'colors' },
                { id: 'typography', name: 'Typography System', type: 'fonts' },
                { id: 'brand-guidelines', name: 'Brand Guidelines PDF' }
            ]},
            { id: 'print-collateral', title: 'Print Collateral', icon: '📄', items: [
                { id: 'business-cards', name: 'Business Cards' },
                { id: 'letterhead', name: 'Letterhead & Envelopes' },
                { id: 'brochures', name: 'Brochures & Flyers' },
                { id: 'presentation-folders', name: 'Presentation Folders' }
            ]},
            { id: 'signage', title: 'Print & Signage', icon: '🖨️', items: [
                { id: 'banners', name: 'Banners' },
                { id: 'posters', name: 'Posters' },
                { id: 'yard-signs', name: 'Yard Signs' },
                { id: 'event-backgrounds', name: 'Event Backgrounds' },
                { id: 'vinyl-decals', name: 'Vinyl Decals' },
                { id: 'building-signage', name: 'Building Signage' },
                { id: 'vehicle-magnets', name: 'Vehicle Magnets' },
                { id: 'postcards', name: 'Postcards & Mailers' },
                { id: 'acrylic-signs', name: 'Acrylic Signs' },
                { id: 'dibond', name: 'Dibond / Aluminum' },
                { id: 'foam-core', name: 'Foam Core' }
            ]},
            { id: 'apparel', title: 'Uniforms & Apparel', icon: '👔', items: [
                { id: 'polos', name: 'Polo Shirts' },
                { id: 'work-shirts', name: 'Work Shirts' },
                { id: 'hats', name: 'Hats & Caps' },
                { id: 'jackets', name: 'Jackets & Outerwear' }
            ]},
            { id: 'digital', title: 'Digital Presence', icon: '🌐', items: [
                { id: 'website', name: 'Website Design' },
                { id: 'email-sig', name: 'Email Signature' },
                { id: 'social-kit', name: 'Social Media Kit' },
                { id: 'google-profile', name: 'Google Business Profile' }
            ]},
            { id: 'marketing', title: 'Digital Marketing', icon: '📧', items: [
                { id: 'email-templates', name: 'Email Templates' },
                { id: 'digital-mailers', name: 'Digital Mailers' },
                { id: 'lead-magnets', name: 'Lead Magnets' },
                { id: 'ad-creatives', name: 'Ad Creatives' }
            ]}
        ]
    },
    'product-brand': {
        name: 'Product Brand Identity',
        price: '$5,500',
        categories: [
            { id: 'logo', title: 'Core Brand Identity', icon: '◆', items: [
                { id: 'primary-logo', name: 'Primary Logo', formats: 'PNG, SVG, PDF' },
                { id: 'secondary-logo', name: 'Secondary Logo', formats: 'PNG, SVG, PDF' },
                { id: 'icon-mark', name: 'Icon/Mark Version', formats: 'PNG, SVG, PDF' },
                { id: 'watermark', name: 'Watermark Version', formats: 'PNG, SVG' },
                { id: 'color-system', name: 'Color System', type: 'colors' },
                { id: 'typography', name: 'Typography System', type: 'fonts' },
                { id: 'brand-guidelines', name: 'Brand Guidelines PDF' }
            ]},
            { id: 'packaging', title: 'Product Packaging & Labels', icon: '📦', items: [
                { id: 'product-labels', name: 'Product Labels' },
                { id: 'packaging-design', name: 'Packaging Design' },
                { id: 'hang-tags', name: 'Hang Tags' },
                { id: 'stickers-seals', name: 'Stickers & Seals' }
            ]},
            { id: 'retail', title: 'Print & In-Store Design', icon: '🏪', items: [
                { id: 'posters-signage', name: 'Posters & Signage' },
                { id: 'window-decals', name: 'Window Decals' },
                { id: 'banners-displays', name: 'Banners & Displays' },
                { id: 'wall-murals', name: 'Wall Murals' }
            ]},
            { id: 'apparel', title: 'Apparel & Merchandise', icon: '👕', items: [
                { id: 'tshirts', name: 'T-Shirt Designs' },
                { id: 'hats', name: 'Hat & Cap Designs' },
                { id: 'uniforms', name: 'Uniform Design' },
                { id: 'tote-bags', name: 'Tote Bags' }
            ]},
            { id: 'marketing', title: 'Digital Marketing Assets', icon: '📱', items: [
                { id: 'email-templates', name: 'Email Templates' },
                { id: 'digital-mailers', name: 'Digital Mailers' },
                { id: 'social-kit', name: 'Social Media Kit' },
                { id: 'ad-creatives', name: 'Ad Creatives' }
            ]}
        ]
    }
};

// Package ID aliases (what intake forms submit → config key)
const BRAND_PACKAGE_ALIASES = {
    'brand-kit': 'brand-kit',
    'brandkit': 'brand-kit',
    'service-brand': 'service-brand',
    'service-identity': 'service-brand',
    'servicebrand': 'service-brand',
    'product-brand': 'product-brand',
    'product-identity': 'product-brand',
    'productbrand': 'product-brand'
};

// Check if a packageId qualifies for auto brand guide creation
function isBrandPackage(packageId) {
    if (!packageId) return false;
    const key = packageId.toLowerCase().replace(/\s+/g, '-');
    return !!BRAND_PACKAGE_ALIASES[key];
}

// Get the config key from any alias
function resolveBrandPackageKey(packageId) {
    if (!packageId) return null;
    const key = packageId.toLowerCase().replace(/\s+/g, '-');
    return BRAND_PACKAGE_ALIASES[key] || null;
}

// Get brand guides from localStorage
function getBrandGuides() {
    return JSON.parse(localStorage.getItem('brandGuides') || '[]');
}

function saveBrandGuides(guides) {
    localStorage.setItem('brandGuides', JSON.stringify(guides));
}

// Create a brand guide from an order
function autoCreateBrandGuide(order, client) {
    const pkgKey = resolveBrandPackageKey(order.packageId || order.packageName);
    if (!pkgKey) return null;

    const config = BRAND_GUIDE_PACKAGES[pkgKey];
    if (!config) return null;

    // Check if guide already exists for this order
    const existing = getBrandGuides();
    if (existing.find(g => g.orderId === order.id)) return null;

    // Build deliverables map from template
    const deliverables = {};
    config.categories.forEach(cat => {
        cat.items.forEach(item => {
            deliverables[item.id] = {
                name: item.name,
                category: cat.id,
                status: 'not-started',
                file: null,
                type: item.type || 'file',
                formats: item.formats || null,
                notes: '',
                uploadedAt: null
            };
        });
    });

    const guide = {
        id: Date.now(),
        orderId: order.id,
        clientId: client?.id || order.clientId,
        clientName: client?.name || order.clientName || 'Unknown',
        clientEmail: client?.email || '',
        packageKey: pkgKey,
        packageName: config.name,
        title: (client?.name || 'Client') + ' — ' + config.name,
        status: 'draft',
        brandColors: ['#e63946', '#1d3557', '#f1faee'],
        fonts: { heading: '', body: '' },
        brandVoice: '',
        targetMarket: '',
        deliverables: deliverables,
        comments: [],
        revisionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    existing.push(guide);
    saveBrandGuides(existing);
    return guide;
}
