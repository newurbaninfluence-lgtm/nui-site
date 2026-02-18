// ==================== ENHANCED BRAND PORTAL ====================
function loadEnhancedBrandPortal(client) {
    // Find latest approved brand guide for this client
    const clientBrandGuide = proofs.filter(p => p.type === 'brandguide' && p.clientId == client.id && (p.status === 'approved' || p.status === 'delivered')).sort((a,b) => (b.id || 0) - (a.id || 0))[0];

    // Use brand guide data if available, otherwise fall back to client data
    const useGuide = clientBrandGuide ? true : false;

    const primaryColor = (useGuide && clientBrandGuide.brandColors?.[0]) || client.colors?.[0] || '#ff0000';
    const secondaryColor = (useGuide && clientBrandGuide.brandColors?.[1]) || client.colors?.[1] || '#000000';

    // Prepare the data source
    const dataSource = useGuide ? clientBrandGuide : client;

    document.getElementById('clientPortal').style.setProperty('--client-primary', primaryColor);
    document.getElementById('clientPortal').style.setProperty('--client-secondary', secondaryColor);

    document.getElementById('clientPortal').innerHTML = `
        <!-- Back Navigation Bar -->
<div class="portal-nav-bar" style="background: rgba(0,0,0,0.9); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100;">
<button onclick="goBackFromPortal()" class="portal-back-btn" style="display: flex; align-items: center; gap: 8px; background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; padding: 8px 16px; border-radius: 8px; transition: background 0.2s;">
<span style="font-size: 20px;">←</span> Back
</button>
<span style="color: #888; font-size: 14px;">${client.name} Brand Portal</span>
            ${currentUser?.type === 'admin' ? `<button onclick="backToAdmin()" style="background: var(--accent); color: #000; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Admin Dashboard</button>` : '<div></div>'}
</div>

<div class="brand-portal-header" style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);">
            ${(useGuide && clientBrandGuide.logo) || client.logo ? `<img loading="lazy" src="${(useGuide && clientBrandGuide.logo) || client.logo}" class="brand-portal-logo" alt="${client.name}">` : `<div style="font-size: 48px; font-weight: 900;">${client.name}</div>`}
<h2 class="brand-portal-title">${client.name} Brand Portal</h2>
<p class="brand-portal-subtitle">Your complete brand identity system</p>
</div>

        <!-- LOGO SECTION -->
<div class="brand-section">
<div class="brand-section-header">
<h2 class="brand-section-title">Logo Suite</h2>
<button class="brand-download-all" onclick="downloadAllLogos()">📥 Download All</button>
</div>
<div class="logo-grid">
                ${renderLogoCards(dataSource, useGuide)}
</div>
</div>

        <!-- COLOR PALETTE -->
<div class="brand-section">
<div class="brand-section-header">
<h2 class="brand-section-title">Color Palette</h2>
</div>
<div class="color-palette">
                ${renderColorSwatches(dataSource, useGuide)}
</div>
</div>

        <!-- TYPOGRAPHY -->
<div class="brand-section">
<div class="brand-section-header">
<h2 class="brand-section-title">Typography</h2>
</div>
<div class="typography-showcase">
                ${renderTypography(dataSource, useGuide)}
</div>
</div>

        <!-- BRAND ELEMENTS -->
<div class="brand-section">
<div class="brand-section-header">
<h2 class="brand-section-title">Brand Elements</h2>
</div>
<div class="elements-grid">
                ${renderBrandElements(client)}
</div>
</div>

        <!-- MOCKUPS -->
<div class="brand-section">
<div class="brand-section-header">
<h2 class="brand-section-title">Brand Mockups</h2>
</div>
<div class="mockups-grid">
                ${renderMockups(dataSource, useGuide)}
</div>
</div>

<div style="padding: 40px; text-align: center; background: #f5f5f5;">
<p style="color: #888; margin-bottom: 16px;">Need updates to your brand assets?</p>
<button onclick="showView('intake');" class="btn-cta">Contact NUI</button>
            ${currentUser?.type === 'admin' ? `<button onclick="backToAdmin()" class="btn-outline" style="margin-left: 16px; color: #000; border-color: #000;">Back to Admin</button>` : ''}
</div>
    `;
}

function renderLogoCards(data, useGuide) {
    const primaryLogo = useGuide ? data.logo : data.logo;
    const secondaryLogo = useGuide ? data.secondaryLogo : null;
    const iconMark = useGuide ? data.iconMark : null;

    const logos = [
        { name: 'Primary Logo', image: primaryLogo, desc: 'Full color' },
        ...(secondaryLogo ? [{ name: 'Secondary Logo', image: secondaryLogo, desc: 'Alternate version' }] : []),
        ...(iconMark ? [{ name: 'Icon / Mark', image: iconMark, desc: 'Symbol only' }] : [])
    ];

    return logos.map(logo => `
<div class="logo-card">
<div class="logo-preview light-bg">
                ${logo.image ? `<img loading="lazy" src="${logo.image}" alt="${logo.name}">` : `<div style="font-size: 36px; font-weight: 900; color: #000;">Logo</div>`}
</div>
<div class="logo-info">
<div>
<div class="logo-name">${logo.name}</div>
<div class="logo-format">${logo.desc}</div>
</div>
<button class="logo-download" onclick="alert('Download ${logo.name}')">↓ PNG</button>
</div>
</div>
    `).join('');
}

function renderColorSwatches(data, useGuide) {
    const colors = (useGuide && data.brandColors) || data.colors || ['#ff0000', '#000000', '#ffffff'];
    const colorNames = ['Primary', 'Secondary', 'Accent', 'Background', 'Text'];

    return colors.map((color, i) => `
<div class="color-swatch" style="background: ${color};">
<button class="color-copy" onclick="copyColor('${color}')">Copy</button>
<div class="color-info">
<div class="color-name">${colorNames[i] || 'Color ' + (i+1)}</div>
<div class="color-hex">${color.toUpperCase()}</div>
</div>
</div>
    `).join('');
}

function copyColor(hex) {
    navigator.clipboard.writeText(hex);
    alert('Copied: ' + hex);
}

function renderTypography(data, useGuide) {
    let headingFont, bodyFont;
    if (useGuide) {
        headingFont = data.fonts?.primary || 'Inter';
        bodyFont = data.fonts?.secondary || 'Inter';
    } else {
        headingFont = data.fonts?.heading || 'Inter';
        bodyFont = data.fonts?.body || 'Inter';
    }

    return `
<div class="typography-card">
<div class="typography-label">Heading Font</div>
<div class="typography-preview" style="font-family: '${headingFont}', sans-serif;">
<h2>Aa Bb Cc</h2>
<p style="font-size: 14px; margin-top: 8px;">${headingFont}</p>
</div>
<div class="typography-specimen">
<span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
<span>abcdefghijklmnopqrstuvwxyz</span>
<span>0123456789</span>
</div>
<div class="typography-download">
<span style="flex: 1;">${headingFont} Font Family</span>
<button class="typography-download-btn" onclick="alert('Download font files')">Download</button>
</div>
</div>
<div class="typography-card">
<div class="typography-label">Body Font</div>
<div class="typography-preview" style="font-family: '${bodyFont}', sans-serif;">
<p>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
</div>
<div class="typography-specimen">
<span>Regular 400</span>
<span>Medium 500</span>
<span>Semibold 600</span>
<span>Bold 700</span>
</div>
<div class="typography-download">
<span style="flex: 1;">${bodyFont} Font Family</span>
<button class="typography-download-btn" onclick="alert('Download font files')">Download</button>
</div>
</div>
    `;
}

function renderBrandElements(client) {
    const elements = ['Pattern', 'Icon Set', 'Texture', 'Divider', 'Badge', 'Stamp'];
    return elements.map(el => `
<div class="element-card">
<div class="element-preview">
<div style="color: #888; font-size: 32px;">◇</div>
</div>
<div class="element-info">
<div class="element-name">${el}</div>
<div class="element-actions">
<button class="element-btn" onclick="alert('Download ${el}')">PNG</button>
<button class="element-btn" onclick="alert('Download ${el}')">SVG</button>
</div>
</div>
</div>
    `).join('');
}

function renderMockups(data, useGuide) {
    let mockupImages = [];

    if (useGuide && data.mockups && data.mockups.length > 0) {
        mockupImages = data.mockups.map((img, i) => ({ name: 'Mockup ' + (i+1), img: img }));
    } else {
        mockupImages = [
            { name: 'Business Card', img: 'https://via.placeholder.com/400x240/1a1a1a/ffffff?text=Business+Card' },
            { name: 'Letterhead', img: 'https://via.placeholder.com/400x240/1a1a1a/ffffff?text=Letterhead' },
            { name: 'Social Media', img: 'https://via.placeholder.com/400x240/1a1a1a/ffffff?text=Social+Media' },
            { name: 'Website Preview', img: 'https://via.placeholder.com/400x240/1a1a1a/ffffff?text=Website' }
        ];
    }

    return mockupImages.map(m => `
<div class="mockup-card">
<img loading="lazy" src="${m.img}" class="mockup-image" alt="${m.name}">
<div class="mockup-info">
<span class="mockup-name">${m.name}</span>
<button class="mockup-download" onclick="alert('Download ${m.name}')">Download</button>
</div>
</div>
    `).join('');
}

function downloadAllLogos() {
    alert('Downloading all logo files as ZIP...');
}

// Navigation history for back buttons
let navigationHistory = [];

function goBackFromPortal() {
    if (navigationHistory.length > 0) {
        const prevView = navigationHistory.pop();
        showView(prevView, true);
    } else if (currentUser?.type === 'admin') {
        showView('admin', true);
    } else {
        showView('home', true);
    }
}

function trackNavigation(viewName) {
    if (navigationHistory[navigationHistory.length - 1] !== viewName) {
        navigationHistory.push(viewName);
        if (navigationHistory.length > 10) navigationHistory.shift();
    }
}

