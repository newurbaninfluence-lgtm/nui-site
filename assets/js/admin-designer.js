// ==================== ADMIN DESIGNER ====================
// Portfolio, About Page, Designer Dashboard, Site Images, Designers, Brand Guide, Moodboard

// ==================== ADMIN PORTFOLIO PANEL ====================
let currentPortfolioCase = null;
let portfolioAssetCategory = 'primaryLogo';

function loadAdminPortfolioPanel() {
    document.getElementById('adminPortfolioPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">Portfolio Case Studies</h2>
<button onclick="addNewPortfolioCase()" class="btn-cta">+ Add Case Study</button>
</div>
<div class="card-grid">
            ${portfolioData.map(p => `
<div class="client-card pointer" onclick="editPortfolioCase('${p.id}')">
<div class="client-card-header" style="background: linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]});">
<img alt="Client project logo" loading="lazy" src="${(p.assets?.primaryLogo || p.img) && !(p.assets?.primaryLogo || p.img).startsWith('idb://') ? (p.assets?.primaryLogo || p.img) : ''}" data-idb-src="${p.assets?.primaryLogo || p.img || ''}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
</div>
<div class="client-card-body">
<div class="client-card-name">${p.name}</div>
<div class="client-card-meta">${p.tag}</div>
<div style="display: flex; gap: 8px; margin-top: 12px;">
<span style="font-size: 11px; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${p.assets?.primaryLogo ? '✓ Logo' : '○ Logo'}</span>
<span style="font-size: 11px; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${p.colors.length} Colors</span>
</div>
</div>
</div>
            `).join('')}
</div>
        ${currentPortfolioCase ? renderPortfolioEditor() : ''}
    `;
    setTimeout(resolveAllImages, 50);
}

function renderPortfolioEditor() {
    const p = portfolioData.find(x => x.id === currentPortfolioCase);
    if (!p) return '';
    return `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px;">
<div style="background: #111; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 16px; border:1px solid rgba(255,255,255,0.1);">
<div style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
<h2 style="font-size: 24px; font-weight: 700; color:#fff;">Edit: ${p.name}</h2>
<button onclick="currentPortfolioCase = null; loadAdminPortfolioPanel();" style="background: none; border: none; font-size: 24px; cursor: pointer; color:rgba(255,255,255,0.5);">×</button>
</div>
<div class="p-24">
<div class="form-section">
<div class="form-section-title">Basic Info</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" value="${p.name}" onchange="updatePortfolioField('${p.id}', 'name', this.value)"></div>
<div class="form-group"><label class="form-label">Tag</label><input type="text" class="form-input" value="${p.tag}" onchange="updatePortfolioField('${p.id}', 'tag', this.value)"></div>
</div>
<div class="form-group"><label class="form-label">Description</label><textarea class="form-input" rows="2" onchange="updatePortfolioField('${p.id}', 'desc', this.value)">${p.desc}</textarea></div>
<div class="form-group"><label class="form-label">Slogan</label><input type="text" class="form-input" value="${p.slogan || ''}" onchange="updatePortfolioField('${p.id}', 'slogan', this.value)" placeholder="e.g., Your Brand Tagline Here"></div>
<div class="form-group"><label class="form-label">Mission Statement</label><textarea class="form-input" rows="3" onchange="updatePortfolioField('${p.id}', 'mission', this.value)" placeholder="What is the brand's mission?">${p.mission || ''}</textarea></div>
<div class="form-group"><label class="form-label">Website URL</label><input type="url" class="form-input" value="${p.websiteUrl || ''}" onchange="updatePortfolioField('${p.id}', 'websiteUrl', this.value)" placeholder="https://example.com"></div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Hero Banner Image (21:9 Full Width)</div>
<div style="aspect-ratio: 21/9; border: 2px dashed #ddd; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, ${p.colors[0]} 0%, ${p.colors[1]} 100%); position: relative;">
                            ${p.img ? `<img alt="Portfolio project image" loading="lazy" src="${!p.img.startsWith('idb://') ? p.img : ''}" data-idb-src="${p.img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">` : ''}
<div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
<div style="font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">${p.name}</div>
<input type="file" id="heroImageUpload" class="hidden" onchange="uploadPortfolioHero('${p.id}', this)">
<button onclick="document.getElementById('heroImageUpload').click()" style="padding: 12px 24px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; backdrop-filter: blur(10px);">Upload Hero Image</button>
<div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
<input type="text" id="heroImageUrl" placeholder="Or paste image URL..." style="padding:8px 12px;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:6px;font-size:12px;width:260px;backdrop-filter:blur(10px);" onkeydown="if(event.key==='Enter'){const p=portfolioData.find(x=>x.id==='${p.id}');if(p){p.img=this.value.trim();savePortfolio();loadAdminPortfolioPanel();}}">
<span style="font-size:10px;color:rgba(255,255,255,0.5);">💡 URLs save storage</span>
</div>
</div>
</div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Logo System (1:1 Square)</div>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
<div style="aspect-ratio: 1/1; border: 2px dashed #ddd; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; background: #fafafa;">
<div style="font-size: 11px; color: #888; padding: 16px; background: #f0f0f0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Primary Logo</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;">
                                    ${p.assets?.primaryLogo ? `<img alt="Client primary logo" loading="lazy" src="${!p.assets.primaryLogo.startsWith('idb://') ? p.assets.primaryLogo : ''}" data-idb-src="${p.assets.primaryLogo}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : '<div style="color: #ccc; font-size: 13px;">No logo</div>'}
</div>
<div style="padding: 16px; background: #f0f0f0; text-align: center;">
<input type="file" id="primaryLogoUpload" class="hidden" onchange="uploadPortfolioAsset('${p.id}', 'primaryLogo', this)">
<button onclick="document.getElementById('primaryLogoUpload').click()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Upload</button>
</div>
</div>
<div style="aspect-ratio: 1/1; border: 2px dashed #ddd; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; background: #fafafa;">
<div style="font-size: 11px; color: #888; padding: 16px; background: #f0f0f0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Secondary Logo</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;">
                                    ${p.assets?.secondaryLogo ? `<img alt="Client secondary logo" loading="lazy" src="${!p.assets.secondaryLogo.startsWith('idb://') ? p.assets.secondaryLogo : ''}" data-idb-src="${p.assets.secondaryLogo}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : '<div style="color: #ccc; font-size: 13px;">No logo</div>'}
</div>
<div style="padding: 16px; background: #f0f0f0; text-align: center;">
<input type="file" id="secondaryLogoUpload" class="hidden" onchange="uploadPortfolioAsset('${p.id}', 'secondaryLogo', this)">
<button onclick="document.getElementById('secondaryLogoUpload').click()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Upload</button>
</div>
</div>
<div style="aspect-ratio: 1/1; border: 2px dashed #ddd; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; background: #fafafa;">
<div style="font-size: 11px; color: #888; padding: 16px; background: #f0f0f0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">Icon / Logo Mark</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;">
                                    ${p.assets?.iconMark ? `<img alt="Client icon mark" loading="lazy" src="${!p.assets.iconMark.startsWith('idb://') ? p.assets.iconMark : ''}" data-idb-src="${p.assets.iconMark}" style="max-height: 100%; max-width: 100%; object-fit: contain;">` : '<div style="color: #ccc; font-size: 13px;">No icon</div>'}
</div>
<div style="padding: 16px; background: #f0f0f0; text-align: center;">
<input type="file" id="iconMarkUpload" class="hidden" onchange="uploadPortfolioAsset('${p.id}', 'iconMark', this)">
<button onclick="document.getElementById('iconMarkUpload').click()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Upload</button>
</div>
</div>
</div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Color Palette</div>
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            ${p.colors.map((c, i) => `
<div class="text-center">
<input type="color" value="${c}" onchange="updatePortfolioColor('${p.id}', ${i}, this.value)" style="width: 60px; height: 60px; border: none; border-radius: 8px; cursor: pointer;">
<div style="font-size: 11px; color: #888; margin-top: 4px;">${c}</div>
</div>
                            `).join('')}
<button onclick="addPortfolioColor('${p.id}')" style="width: 60px; height: 60px; border: 2px dashed #ddd; border-radius: 8px; background: none; cursor: pointer; font-size: 24px; color: #ccc;">+</button>
</div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Font System</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Heading Font</label><input type="text" class="form-input" value="${p.fonts?.heading || ''}" onchange="updatePortfolioFont('${p.id}', 'heading', this.value)"></div>
<div class="form-group"><label class="form-label">Body Font</label><input type="text" class="form-input" value="${p.fonts?.body || ''}" onchange="updatePortfolioFont('${p.id}', 'body', this.value)"></div>
</div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Brand Mockups (Image / Video)</div>
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                            ${(p.assets?.mockups || []).map((m, i) => `
<div style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                                    ${m.includes('video') || m.match(/\.(mp4|webm|mov|ogg)$/i) ? `<video src="${!m.startsWith('idb://') ? m : ''}" data-idb-src="${m}" autoplay muted loop playsinline style="width: 100%; aspect-ratio: 16/9; object-fit: cover;"></video>` : `<img alt="Project mockup image" loading="lazy" src="${!m.startsWith('idb://') ? m : ''}" data-idb-src="${m}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">`}
<div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.7); color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${m.includes('video') || m.match(/\.(mp4|webm|mov|ogg)$/i) ? '▶ Video' : 'Image'} ${i+1}</div>
<button onclick="removePortfolioMockup('${p.id}', ${i})" style="position: absolute; top: 12px; right: 12px; background: #dc2626; color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 16px;">×</button>
</div>
                            `).join('')}
<div style="border: 2px dashed #ddd; border-radius: 16px; aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #fafafa;">
<div style="width: 48px; height: 48px; border: 2px dashed #ccc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #ccc;">▶</div>
<input type="file" id="mockupUpload" accept="image/*,video/*" class="hidden" onchange="uploadPortfolioMockup('${p.id}', this)">
<button onclick="document.getElementById('mockupUpload').click()" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">+ Add Image / Video</button>
<div style="font-size: 11px; color: #888;">Supports JPG, PNG, MP4, WebM</div>
</div>
</div>
</div>
<div class="form-section mt-24">
<div class="form-section-title">Results</div>
<div class="form-row" style="grid-template-columns: repeat(3, 1fr);">
<div class="form-group"><label class="form-label">Revenue Growth</label><input type="text" class="form-input" value="${p.results?.revenue || ''}" onchange="updatePortfolioResult('${p.id}', 'revenue', this.value)"></div>
<div class="form-group"><label class="form-label">Web Traffic</label><input type="text" class="form-input" value="${p.results?.traffic || ''}" onchange="updatePortfolioResult('${p.id}', 'traffic', this.value)"></div>
<div class="form-group"><label class="form-label">Engagement</label><input type="text" class="form-input" value="${p.results?.engagement || ''}" onchange="updatePortfolioResult('${p.id}', 'engagement', this.value)"></div>
</div>
</div>
<div style="margin-top: 32px; display: flex; gap: 16px; flex-wrap: wrap;">
<button onclick="pushPortfolioToFrontend(); showNotification('All changes saved and pushed to site!', 'success');" class="btn-cta" style="background: var(--red); padding: 14px 32px; font-weight: 700;">Save All Changes</button>
<button onclick="currentPortfolioCase = null; loadAdminPortfolioPanel();" style="padding: 14px 24px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Close Editor</button>
<button onclick="deletePortfolioCase('${p.id}')" style="padding: 14px 24px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer;">Delete Case Study</button>
</div>
</div>
</div>
</div>
    `;
}

function editPortfolioCase(id) {
    currentPortfolioCase = id;
    loadAdminPortfolioPanel();
}

function updatePortfolioField(id, field, value) {
    const p = portfolioData.find(x => x.id === id);
    if (p) { p[field] = value; savePortfolio(); }
}

function updatePortfolioColor(id, index, value) {
    const p = portfolioData.find(x => x.id === id);
    if (p) { p.colors[index] = value; savePortfolio(); loadAdminPortfolioPanel(); }
}

function addPortfolioColor(id) {
    const p = portfolioData.find(x => x.id === id);
    if (p && p.colors.length < 6) { p.colors.push('#000000'); savePortfolio(); loadAdminPortfolioPanel(); }
}

function updatePortfolioFont(id, type, value) {
    const p = portfolioData.find(x => x.id === id);
    if (p) { if (!p.fonts || Array.isArray(p.fonts)) p.fonts = { heading: '', body: '' }; p.fonts[type] = value; savePortfolio(); }
}

function updatePortfolioResult(id, type, value) {
    const p = portfolioData.find(x => x.id === id);
    if (p) { if (!p.results) p.results = {}; p.results[type] = value; savePortfolio(); }
}

function uploadPortfolioAsset(id, type, input) {
    const file = input.files[0];
    if (!file) return;
    showNotification('Uploading ' + type + '...', 'info');
    const reader = new FileReader();
    reader.onload = async function(e) {
        const p = portfolioData.find(x => x.id === id);
        if (p) {
            if (!p.assets) p.assets = {};
            try {
                const compressed = await compressImage(e.target.result, 600, 0.6);
                const ref = await NuiImageStore.saveImage('asset', compressed);
                p.assets[type] = ref;
            } catch(err) {
                console.warn('Cloud storage save failed, using compressed data URL');
                try { p.assets[type] = await compressImage(e.target.result, 400, 0.5); } catch(e2) { p.assets[type] = e.target.result; }
            }
            savePortfolio();
            loadAdminPortfolioPanel();
            showNotification(type.replace(/([A-Z])/g, ' $1').trim() + ' saved successfully!', 'success');
        }
    };
    reader.readAsDataURL(file);
}

function uploadPortfolioHero(id, input) {
    const file = input.files[0];
    if (!file) return;
    showNotification('Uploading hero image...', 'info');
    const reader = new FileReader();
    reader.onload = async function(e) {
        const p = portfolioData.find(x => x.id === id);
        if (p) {
            try {
                const compressed = await compressImage(e.target.result, 1200, 0.6);
                const ref = await NuiImageStore.saveImage('hero', compressed);
                p.img = ref;
            } catch(err) {
                console.warn('Cloud storage save failed, using compressed data URL');
                try { p.img = await compressImage(e.target.result, 400, 0.5); } catch(e2) { p.img = e.target.result; }
            }
            savePortfolio();
            loadAdminPortfolioPanel();
            showNotification('Hero image saved!', 'success');
        }
    };
    reader.readAsDataURL(file);
}

function uploadPortfolioMockup(id, input) {
    const file = input.files[0];
    if (!file) return;
    showNotification('Uploading mockup...', 'info');
    const reader = new FileReader();
    reader.onload = async function(e) {
        const p = portfolioData.find(x => x.id === id);
        if (p) {
            if (!p.assets) p.assets = {};
            if (!p.assets.mockups) p.assets.mockups = [];
            try {
                const compressed = await compressImage(e.target.result, 800, 0.6);
                const ref = await NuiImageStore.saveImage('mockup', compressed);
                p.assets.mockups.push(ref);
            } catch(err) {
                console.warn('Cloud storage save failed, using compressed data URL');
                try { p.assets.mockups.push(await compressImage(e.target.result, 400, 0.5)); } catch(e2) { p.assets.mockups.push(e.target.result); }
            }
            savePortfolio();
            loadAdminPortfolioPanel();
            showNotification('Mockup saved!', 'success');
        }
    };
    reader.readAsDataURL(file);
}

function removePortfolioMockup(id, index) {
    const p = portfolioData.find(x => x.id === id);
    if (p && p.assets?.mockups) { p.assets.mockups.splice(index, 1); savePortfolio(); loadAdminPortfolioPanel(); }
}

function addNewPortfolioCase() {
    const newId = 'case-' + Date.now();
    portfolioData.push({
        id: newId,
        name: 'New Case Study',
        tag: 'Brand Identity',
        desc: 'Description here...',
        img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        colors: ['#000000', '#ffffff', '#ff3b30'],
        fonts: { heading: 'Inter', body: 'Inter' },
        assets: { primaryLogo: '', secondaryLogo: '', iconMark: '', mockups: [] },
        results: { revenue: '+0%', traffic: '+0%', engagement: '+0%' },
        testimonial: { text: 'Testimonial here...', author: 'Client Name', title: 'Position' }
    });
    savePortfolio();
    currentPortfolioCase = newId;
    loadAdminPortfolioPanel();
}

function deletePortfolioCase(id) {
    if (!confirm('Delete this case study?')) return;
    portfolioData = portfolioData.filter(p => p.id !== id);
    savePortfolio();
    currentPortfolioCase = null;
    loadAdminPortfolioPanel();
}

// ==================== ADMIN ABOUT PAGE PANEL ====================
function loadAdminAboutPanel() {
    document.getElementById('adminAboutPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📄 About Page Settings</h2>
<p class="panel-subtitle">Manage your team members and story section</p>
</div>

<div class="form-section">
<div class="form-section-title">Story Section Image</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">
<div style="aspect-ratio:4/5;background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    ${aboutData.storyImage ? `<img alt="About page story image" loading="lazy" src="${!aboutData.storyImage.startsWith('idb://') ? aboutData.storyImage : ''}" data-idb-src="${aboutData.storyImage}" style="width:100%;height:100%;object-fit:cover;">` : '<span style="color:rgba(255,255,255,0.25);">No Image</span>'}
</div>
<div>
<p style="color:rgba(255,255,255,0.5);margin-bottom:16px;">Upload an image for the "Our Story" section. Recommended: 800x1000px (4:5 ratio)</p>
<input type="file" id="storyImageUpload" accept="image/*" class="hidden" onchange="uploadAboutStoryImage(this)">
<button onclick="document.getElementById('storyImageUpload').click()" style="padding:12px 24px;background:#e63946;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Upload Story Image</button>
                    ${aboutData.storyImage ? `<button onclick="removeAboutStoryImage()" style="padding:12px 24px;background:rgba(230,57,70,0.15);color:#e63946;border:none;border-radius:8px;cursor:pointer;margin-left:12px;">Remove</button>` : ''}
</div>
</div>
</div>

<div class="form-section mt-32">
<div class="form-section-title">Team Members (${aboutData.team.length})</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
                ${aboutData.team.map((member, i) => `
<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;position:relative;">
<button onclick="deleteTeamMember(${i})" style="position:absolute;top:10px;right:10px;width:28px;height:28px;background:rgba(230,57,70,0.15);border:1px solid rgba(230,57,70,0.3);color:#e63946;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;z-index:2;" title="Delete member">&times;</button>
<div style="aspect-ratio:3/4;background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
                            ${member.photo ? `<img alt="Team member photo" loading="lazy" src="${!member.photo.startsWith('idb://') ? member.photo : ''}" data-idb-src="${member.photo}" style="width:100%;height:100%;object-fit:cover;">` : '<span style="color:rgba(255,255,255,0.25);font-size:12px;">No Photo</span>'}
</div>
<input type="file" id="teamPhoto${i}" accept="image/*" class="hidden" onchange="uploadTeamPhoto(${i}, this)">
<button onclick="document.getElementById('teamPhoto${i}').click()" style="width:100%;padding:10px;background:rgba(255,255,255,0.1);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-bottom:8px;">Upload Photo</button>
                        ${member.photo ? `<button onclick="removeTeamPhoto(${i})" style="width:100%;padding:10px;background:rgba(230,57,70,0.15);color:#e63946;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-bottom:12px;">Remove Photo</button>` : ''}
<div class="form-group" style="margin-bottom:12px;">
<label class="form-label" style="font-size:11px;">Name</label>
<input type="text" class="form-input" style="padding:10px;font-size:14px;" value="${member.name}" onchange="updateTeamMember(${i}, 'name', this.value)">
</div>
<div class="form-group" style="margin-bottom:12px;">
<label class="form-label" style="font-size:11px;">Title</label>
<input type="text" class="form-input" style="padding:10px;font-size:14px;" value="${member.title}" onchange="updateTeamMember(${i}, 'title', this.value)">
</div>
<div class="form-group">
<label class="form-label" style="font-size:11px;">Bio</label>
<textarea class="form-input" style="padding:10px;font-size:13px;" rows="3" onchange="updateTeamMember(${i}, 'bio', this.value)">${member.bio}</textarea>
</div>
</div>
                `).join('')}
</div>
<div class="mt-20">
<button onclick="addTeamMember()" style="padding:12px 24px;background:#e63946;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">+ Add Team Member</button>
</div>
</div>
    `;
    setTimeout(resolveAllImages, 50);
}

function uploadAboutStoryImage(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const compressed = await compressImage(e.target.result, 1000, 0.6);
            const ref = await NuiImageStore.saveImage('story', compressed);
            aboutData.storyImage = ref;
        } catch(err) {
            console.warn('Cloud storage save failed, using compressed data URL');
            try { aboutData.storyImage = await compressImage(e.target.result, 400, 0.5); } catch(e2) { aboutData.storyImage = e.target.result; }
        }
        saveAbout();
        loadAdminAboutPanel();
        loadAboutView();
    };
    reader.readAsDataURL(file);
}

function removeAboutStoryImage() {
    aboutData.storyImage = '';
    saveAbout();
    loadAdminAboutPanel();
    loadAboutView();
}

function uploadTeamPhoto(index, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const compressed = await compressImage(e.target.result, 400, 0.6);
            const ref = await NuiImageStore.saveImage('team', compressed);
            aboutData.team[index].photo = ref;
        } catch(err) {
            console.warn('Cloud storage save failed, using compressed data URL');
            try { aboutData.team[index].photo = await compressImage(e.target.result, 400, 0.5); } catch(e2) { aboutData.team[index].photo = e.target.result; }
        }
        saveAbout();
        loadAdminAboutPanel();
        loadAboutView();
    };
    reader.readAsDataURL(file);
}

function removeTeamPhoto(index) {
    aboutData.team[index].photo = '';
    saveAbout();
    loadAdminAboutPanel();
    loadAboutView();
}

function updateTeamMember(index, field, value) {
    aboutData.team[index][field] = value;
    saveAbout();
    loadAboutView();
}

function addTeamMember() {
    aboutData.team.push({
        name: 'New Member',
        title: 'Role',
        bio: 'Bio here...',
        photo: ''
    });
    saveAbout();
    loadAdminAboutPanel();
}

function deleteTeamMember(index) {
    const member = aboutData.team[index];
    if (!member) return;
    if (!confirm('Delete ' + member.name + ' from the team?')) return;
    aboutData.team.splice(index, 1);
    saveAbout();
    loadAdminAboutPanel();
    if (typeof loadAboutView === 'function') loadAboutView();
}


// ==================== DESIGNER DASHBOARD ====================
function loadDesignerDashboard(designer) {
    // Update header to show designer name
    document.querySelector('.admin-header span').textContent = 'Designer: ' + designer.name;

    // Show only permitted panels
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        const panel = link.getAttribute('data-panel');
        const permitted = ['dashboard'];
        if (designer.permissions.includes('projects')) permitted.push('projects');
        if (designer.permissions.includes('proofs')) permitted.push('proofs');
        if (designer.permissions.includes('assets')) permitted.push('assets');
        if (designer.permissions.includes('clients')) permitted.push('clients');

        if (!permitted.includes(panel)) {
            link.style.display = 'none';
        }
    });

    // Hide nav groups that have no visible items
    document.querySelectorAll('.admin-nav-group').forEach(group => {
        const visibleLinks = group.querySelectorAll('.admin-nav-link:not([style*="display: none"])');
        if (visibleLinks.length === 0) {
            group.style.display = 'none';
        }
    });

    loadAdminDashboardPanel();
}


// ==================== SITE IMAGES PANEL ====================
function loadAdminSiteImagesPanel() {
    document.getElementById('adminSiteimagesPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">🖼️ Site Images & Branding</h2>
<p class="panel-subtitle">Manage logos, taglines, and images across the entire website</p>
</div>

        <!-- CMS LOGO MANAGEMENT SECTION -->
<div class="form-section" style="background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(255,107,107,0.05)); border: 1px solid rgba(255,0,0,0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
<div class="form-section-title text-red">🎨 Brand Identity (CMS)</div>
<p style="color: var(--admin-text-muted); font-size: 13px; margin-bottom: 20px;">These logos and taglines appear across the entire website header and footer.</p>

<div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
                <!-- Header Logo -->
<div class="image-upload-card" style="background: var(--admin-card); border-radius: 12px; overflow: hidden;">
<div class="image-upload-preview" style="height: 120px; background: var(--admin-bg-secondary);">
                        ${siteImages.headerLogo?.url ? `<img loading="lazy" src="${siteImages.headerLogo.url}" alt="Header Logo" style="max-height: 80px; object-fit: contain;">` : '<span class="placeholder" style="font-size: 48px;">🏷️</span>'}
<div class="image-upload-overlay">
<button class="btn-admin primary" onclick="document.getElementById('headerLogoUpload').click()">Upload</button>
                            ${siteImages.headerLogo?.url ? `<button class="btn-admin danger" onclick="clearSiteImage('headerLogo')">Remove</button>` : ''}
</div>
</div>
<input type="file" id="headerLogoUpload" accept="image/*" class="hidden" onchange="uploadSiteImage('headerLogo', this)">
<div class="image-upload-info p-16">
<span class="image-upload-label" style="font-weight: 600; color: var(--admin-text);">Header Logo</span>
<span class="image-upload-hint" style="color: var(--admin-text-muted);">300x80px recommended (PNG/SVG)</span>
</div>
</div>

                <!-- Footer Logo -->
<div class="image-upload-card" style="background: var(--admin-card); border-radius: 12px; overflow: hidden;">
<div class="image-upload-preview" style="height: 120px; background: var(--admin-bg-secondary);">
                        ${siteImages.footerLogo?.url ? `<img loading="lazy" src="${siteImages.footerLogo.url}" alt="Footer Logo" style="max-height: 80px; object-fit: contain;">` : '<span class="placeholder" style="font-size: 48px;">🏷️</span>'}
<div class="image-upload-overlay">
<button class="btn-admin primary" onclick="document.getElementById('footerLogoUpload').click()">Upload</button>
                            ${siteImages.footerLogo?.url ? `<button class="btn-admin danger" onclick="clearSiteImage('footerLogo')">Remove</button>` : ''}
</div>
</div>
<input type="file" id="footerLogoUpload" accept="image/*" class="hidden" onchange="uploadSiteImage('footerLogo', this)">
<div class="image-upload-info p-16">
<span class="image-upload-label" style="font-weight: 600; color: var(--admin-text);">Footer Logo</span>
<span class="image-upload-hint" style="color: var(--admin-text-muted);">300x80px recommended (PNG/SVG)</span>
</div>
</div>
</div>

            <!-- Taglines -->
<div style="margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
<div>
<label style="display: block; font-weight: 600; color: var(--admin-text); margin-bottom: 8px;">Site Tagline</label>
<input type="text" id="siteTagline" value="${siteImages.tagline || ''}"
                        placeholder="e.g., BUILD YOUR EMPIRE"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--admin-border); border-radius: 8px; font-size: 14px; background: var(--admin-input-bg); color: var(--admin-text);"
                        onchange="siteImages.tagline = this.value; saveSiteImages();">
<span class="admin-text-muted-xs">Appears in navigation and footer</span>
</div>
<div>
<label style="display: block; font-weight: 600; color: var(--admin-text); margin-bottom: 8px;">Hero Tagline</label>
<input type="text" id="heroTagline" value="${siteImages.heroTagline || ''}"
                        placeholder="e.g., UNAPOLOGETICALLY DETROIT"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--admin-border); border-radius: 8px; font-size: 14px; background: var(--admin-input-bg); color: var(--admin-text);"
                        onchange="siteImages.heroTagline = this.value; saveSiteImages();">
<span class="admin-text-muted-xs">Appears on homepage hero section</span>
</div>
</div>
</div>

<div class="form-section">
<div class="form-section-title">🏠 Homepage Images</div>
<div class="card-grid">
<div class="image-upload-card">
<div class="image-upload-preview">
                        ${siteImages.hero?.url ? `<img loading="lazy" src="${siteImages.hero.url}" alt="Hero">` : '<span class="placeholder">🖼️</span>'}
<div class="image-upload-overlay">
<button class="btn-admin primary" onclick="document.getElementById('heroImageUpload').click()">Upload</button>
                            ${siteImages.hero?.url ? `<button class="btn-admin danger" onclick="clearSiteImage('hero')">Remove</button>` : ''}
</div>
</div>
<input type="file" id="heroImageUpload" accept="image/*" class="hidden" onchange="uploadSiteImage('hero', this)">
<div class="image-upload-info"><span class="image-upload-label">Hero Background</span><span class="image-upload-hint">1920x1080 recommended</span></div>
</div>
<div class="image-upload-card">
<div class="image-upload-preview">
                        ${siteImages.about?.url ? `<img loading="lazy" src="${siteImages.about.url}" alt="About">` : '<span class="placeholder">🖼️</span>'}
<div class="image-upload-overlay">
<button class="btn-admin primary" onclick="document.getElementById('aboutImageUpload').click()">Upload</button>
                            ${siteImages.about?.url ? `<button class="btn-admin danger" onclick="clearSiteImage('about')">Remove</button>` : ''}
</div>
</div>
<input type="file" id="aboutImageUpload" accept="image/*" class="hidden" onchange="uploadSiteImage('about', this)">
<div class="image-upload-info"><span class="image-upload-label">About Section</span><span class="image-upload-hint">1200x800 recommended</span></div>
</div>
</div>
</div>
<div class="form-section">
<div class="form-section-title">📦 Service Package Images</div>
<div class="card-grid">
                ${siteImages.services.map(service => `
<div class="image-upload-card">
<div class="image-upload-preview">
                            ${service.url ? `<img loading="lazy" src="${service.url}" alt="${service.alt}">` : '<span class="placeholder">🖼️</span>'}
<div class="image-upload-overlay">
<button class="btn-admin primary" onclick="document.getElementById('service_${service.id}').click()">Upload</button>
</div>
</div>
<input type="file" id="service_${service.id}" accept="image/*" class="hidden" onchange="uploadServiceImage('${service.id}', this)">
<div class="image-upload-info">
<span class="image-upload-label">${service.alt}</span>
<span class="image-upload-hint">1920x600 recommended</span>
</div>
</div>
                `).join('')}
</div>
</div>
<button class="btn-admin primary" onclick="saveSiteImages(); loadServicesView(); showNotification('Site images saved and pushed to frontend!', 'success');">Save All Changes</button>
    `;
}

function uploadSiteImage(key, input) {
    if (input.files && input.files[0]) {
        showNotification('Uploading ' + key + ' image...', 'info');
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const compressed = await compressImage(e.target.result, 1200, 0.7);
                const ref = await NuiImageStore.saveImage('site_' + key, compressed);
                siteImages[key].url = ref;
            } catch(err) {
                console.warn('Cloud storage failed for site image, using compressed data URL:', err.message);
                try { siteImages[key].url = await compressImage(e.target.result, 800, 0.5); }
                catch(e2) { siteImages[key].url = e.target.result; }
            }
            saveSiteImages();
            loadAdminSiteImagesPanel();
            showNotification((siteImages[key].alt || key) + ' saved!', 'success');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function uploadServiceImage(serviceId, input) {
    if (input.files && input.files[0]) {
        showNotification('Uploading service image...', 'info');
        const reader = new FileReader();
        reader.onload = async function(e) {
            const service = siteImages.services.find(s => s.id === serviceId);
            if (service) {
                try {
                    const compressed = await compressImage(e.target.result, 1200, 0.7);
                    const ref = await NuiImageStore.saveImage('service_' + serviceId, compressed);
                    service.url = ref;
                } catch(err) {
                    console.warn('Cloud storage failed for service image, using compressed data URL:', err.message);
                    try { service.url = await compressImage(e.target.result, 800, 0.5); }
                    catch(e2) { service.url = e.target.result; }
                }
                saveSiteImages();
                loadAdminSiteImagesPanel();
                showNotification(service.alt + ' image saved!', 'success');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearSiteImage(key) {
    siteImages[key].url = '';
    saveSiteImages();
    loadAdminSiteImagesPanel();
}

// ==================== DESIGNERS PANEL ====================
function loadAdminDesignersPanel(searchTerm = '') {
    const filtered = searchTerm
        ? designers.filter(d =>
            (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.role || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : designers;

    document.getElementById('adminDesignersPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">🎨 Designer Management</h2>
<p class="panel-subtitle">Manage designer accounts and permissions (${filtered.length} of ${designers.length})</p>
</div>
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="designerSearch" placeholder="Search designers..." value="${searchTerm}"
                oninput="loadAdminDesignersPanel(this.value)"
                style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; background: rgba(255,255,255,0.1); color: #fff;">
<button onclick="exportDesignersCSV()" style="padding: 10px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; color: #fff;">Export CSV</button>
<button class="btn-admin primary" onclick="showAddDesignerModal()">+ Add Designer</button>
</div>
        ${filtered.length > 0 ? `
<div class="card-grid">
            ${filtered.map(designer => `
<div class="client-card">
<div class="client-card-header" style="background: linear-gradient(135deg, var(--red), #ff6b6b);">
                        ${designer.avatar ? '<img alt="Designer avatar" loading="lazy" src="' + designer.avatar + '" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">' : designer.name.charAt(0)}
</div>
<div class="client-card-body">
<div class="client-card-name">${designer.name}</div>
<div class="client-card-meta">${designer.email}<br>${designer.role}</div>
<div style="margin-bottom: 12px;">
                            ${(designer.permissions || []).map(p => '<span class="tag" style="margin: 2px;">' + p + '</span>').join('')}
</div>
<div class="client-card-btns">
<button class="bg-red text-white" onclick="editDesigner(${designer.id})">Edit</button>
<button style="background: rgba(255,255,255,0.1); color: #fff;" onclick="deleteDesigner(${designer.id})">Delete</button>
</div>
</div>
</div>
            `).join('')}
</div>
        ` : '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No designers found.</p>'}
<div class="form-section mt-32">
<div class="form-section-title">🔐 Designer Login Credentials</div>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 16px;">Designers can log in at the portal with these credentials:</p>
<table class="data-table">
<thead><tr><th>Name</th><th>Email</th><th>Password</th><th>Role</th></tr></thead>
<tbody>
                    ${filtered.length === 0 ? '<tr><td colspan="4" class="text-center">No designers</td></tr>' : ''}
                    ${filtered.map(d => '<tr><td>' + d.name + '</td><td>' + d.email + '</td><td>' + d.password + '</td><td>' + d.role + '</td></tr>').join('')}
</tbody>
</table>
</div>
    `;
}

// Export designers to CSV
function exportDesignersCSV() {
    if (designers.length === 0) {
        alert('No designers to export.');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Role', 'Permissions', 'Payout Tier'];
    const rows = designers.map(d => [
        d.id,
        d.name || '',
        d.email || '',
        d.role || '',
        (d.permissions || []).join('; '),
        d.payoutTier || '35%'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    downloadCSV(csv, 'nui-designers-' + new Date().toISOString().split('T')[0] + '.csv');
}

function showAddDesignerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'designerModal';
    modal.innerHTML = `
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Add Designer</h3><button class="modal-close" onclick="document.getElementById('designerModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Name *</label><input type="text" id="designerName" class="form-input" placeholder="Jane Designer"></div>
<div class="form-group"><label class="form-label">Email *</label><input type="email" id="designerEmail" class="form-input" placeholder="jane@nui.com"></div>
<div class="form-group"><label class="form-label">Password *</label><input type="text" id="designerPassword" class="form-input" placeholder="designer123"></div>
<div class="form-group"><label class="form-label">Role</label><input type="text" id="designerRole" class="form-input" placeholder="Designer" value="Designer"></div>
<div class="form-group">
<label class="form-label">Permissions</label>
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permProjects" checked> Projects</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permProofs" checked> Proofs</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permAssets" checked> Assets</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permClients"> Clients</label>
</div>
</div>
</div>
<div class="modal-footer"><button class="btn-admin secondary" onclick="document.getElementById('designerModal').remove()">Cancel</button><button class="btn-admin primary" onclick="saveDesigner()">Add Designer</button></div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveDesigner() {
    const permissions = [];
    if (document.getElementById('permProjects').checked) permissions.push('projects');
    if (document.getElementById('permProofs').checked) permissions.push('proofs');
    if (document.getElementById('permAssets').checked) permissions.push('assets');
    if (document.getElementById('permClients').checked) permissions.push('clients');

    const designer = {
        id: Date.now(),
        name: document.getElementById('designerName').value,
        email: document.getElementById('designerEmail').value,
        password: document.getElementById('designerPassword').value,
        role: document.getElementById('designerRole').value,
        avatar: '',
        permissions: permissions
    };
    designers.push(designer);
    saveDesigners();
    document.getElementById('designerModal').remove();
    loadAdminDesignersPanel();
}

function editDesigner(id) {
    const designer = designers.find(d => d.id === id);
    if (!designer) return;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'designerModal';
    modal.innerHTML = `
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Edit Designer</h3><button class="modal-close" onclick="document.getElementById('designerModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Name</label><input type="text" id="designerName" class="form-input" value="${designer.name}"></div>
<div class="form-group"><label class="form-label">Email</label><input type="email" id="designerEmail" class="form-input" value="${designer.email}"></div>
<div class="form-group"><label class="form-label">Password</label><input type="text" id="designerPassword" class="form-input" value="${designer.password}"></div>
<div class="form-group"><label class="form-label">Role</label><input type="text" id="designerRole" class="form-input" value="${designer.role}"></div>
<div class="form-group">
<label class="form-label">Permissions</label>
<div style="display: flex; flex-wrap: wrap; gap: 12px;">
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permProjects" ${designer.permissions.includes('projects') ? 'checked' : ''}> Projects</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permProofs" ${designer.permissions.includes('proofs') ? 'checked' : ''}> Proofs</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permAssets" ${designer.permissions.includes('assets') ? 'checked' : ''}> Assets</label>
<label class="flex-center-gap-8 pointer"><input type="checkbox" id="permClients" ${designer.permissions.includes('clients') ? 'checked' : ''}> Clients</label>
</div>
</div>
</div>
<div class="modal-footer"><button class="btn-admin secondary" onclick="document.getElementById('designerModal').remove()">Cancel</button><button class="btn-admin primary" onclick="updateDesigner(${id})">Update</button></div>
</div>
    `;
    document.body.appendChild(modal);
}

function updateDesigner(id) {
    const designer = designers.find(d => d.id === id);
    if (!designer) return;
    const permissions = [];
    if (document.getElementById('permProjects').checked) permissions.push('projects');
    if (document.getElementById('permProofs').checked) permissions.push('proofs');
    if (document.getElementById('permAssets').checked) permissions.push('assets');
    if (document.getElementById('permClients').checked) permissions.push('clients');

    designer.name = document.getElementById('designerName').value;
    designer.email = document.getElementById('designerEmail').value;
    designer.password = document.getElementById('designerPassword').value;
    designer.role = document.getElementById('designerRole').value;
    designer.permissions = permissions;
    saveDesigners();
    document.getElementById('designerModal').remove();
    loadAdminDesignersPanel();
}

function deleteDesigner(id) {
    const designer = designers.find(d => d.id == id);
    if (!designer) { alert('Designer not found.'); return; }
    if (!confirm('Delete ' + designer.name + '? This cannot be undone.')) return;
    designers = designers.filter(d => d.id != id);
    saveDesigners();
    loadAdminDesignersPanel();
}

// ==================== BRAND GUIDE PANEL ====================
// Current brand guide being edited
let currentBrandGuide = null;

function loadAdminBrandGuidePanel() {
    const clientProofs = proofs.filter(p => p.type === 'brandguide');

    document.getElementById('adminBrandguidePanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📘 Brand Guide & Proof System</h2>
<p class="panel-subtitle">Create brand guides, manage proofs, and client asset storage</p>
</div>

        <!-- Stats -->
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Active Guides</div><div class="stat-value">${clientProofs.length}</div></div>
<div class="stat-card"><div class="stat-label">Pending Approval</div><div class="stat-value" style="color: #f59e0b;">${clientProofs.filter(p => p.status === 'pending' || p.status === 'revision_requested').length}</div></div>
<div class="stat-card"><div class="stat-label">Approved</div><div class="stat-value" style="color: #2ecc71;">${clientProofs.filter(p => p.status === 'approved').length}</div></div>
<div class="stat-card"><div class="stat-label">Delivered</div><div class="stat-value" style="color: #3b82f6;">${clientProofs.filter(p => p.status === 'delivered').length}</div></div>
</div>

<div style="display: flex; gap: 12px; margin-bottom: 24px;">
<button class="btn-admin primary" onclick="showCreateBrandGuideModal()">+ Create Brand Guide</button>
<button class="btn-admin secondary" onclick="showAdminPanel('assets')">📁 Client Asset Storage</button>
</div>

        <!-- Brand Guides Grid (Portfolio Style) -->
<div class="form-section">
<div class="form-section-title">📁 Brand Guides</div>
            ${clientProofs.length === 0 ? '<p class="text-dim">No brand guides created yet. Click "Create Brand Guide" to get started.</p>' : ''}
<div class="card-grid">
                ${clientProofs.map(proof => {
                    const client = clients.find(c => c.id == proof.clientId);
                    const isPaid = checkClientPaymentStatus(proof.clientId);
                    return `
<div class="client-card" style="cursor: pointer; position: relative;" onclick="editBrandGuidePortfolio(${proof.id})">
<div class="client-card-header" style="background: linear-gradient(135deg, ${proof.brandColors?.[0] || '#e63946'}, ${proof.brandColors?.[1] || '#1d3557'});">
                            ${proof.logo ? '<img alt="Client logo proof" loading="lazy" src="' + proof.logo + '" style="max-width: 80px; max-height: 50px; object-fit: contain;">' : (proof.clientName?.charAt(0) || 'B')}
</div>
                        ${proof.status === 'revision_requested' ? '<div style="position: absolute; top: 8px; right: 8px; background: #f59e0b; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">REVISION</div>' : ''}
                        ${isPaid ? '<div style="position: absolute; top: 8px; left: 8px; background: #2ecc71; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">PAID</div>' : ''}
<div class="client-card-body">
<div class="client-card-name">${proof.title || proof.clientName}</div>
<div class="client-card-meta">
                                ${client?.name || 'No Client'}<br>
<span class="status-badge ${proof.status}" style="margin-top: 4px; display: inline-block;">${proof.status?.replace('_', ' ') || 'draft'}</span>
</div>
<div style="margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.5);">
                                ${proof.revisionCount || 0} revisions • ${proof.comments?.length || 0} comments
</div>
<div class="client-card-btns mt-12">
<button class="bg-red text-white" onclick="event.stopPropagation(); editBrandGuidePortfolio(${proof.id})">Edit</button>
<button style="background: rgba(255,255,255,0.1); color: #fff;" onclick="event.stopPropagation(); sendProofToClient(${proof.id})">Send</button>
</div>
</div>
</div>
                `;}).join('')}
</div>
</div>

        <!-- Recent Activity -->
<div class="form-section">
<div class="form-section-title">📋 Recent Proof Activity</div>
<table class="data-table">
<thead><tr><th>Brand Guide</th><th>Client</th><th>Status</th><th>Payment</th><th>Last Update</th><th>Actions</th></tr></thead>
<tbody>
                    ${clientProofs.length === 0 ? '<tr><td colspan="6" class="text-center opacity-50">No activity yet</td></tr>' : ''}
                    ${clientProofs.slice(-10).reverse().map(p => {
                        const client = clients.find(c => c.id == p.clientId);
                        const isPaid = checkClientPaymentStatus(p.clientId);
                        return `
<tr>
<td class="fw-600">${p.title}</td>
<td>${client?.name || 'N/A'}</td>
<td><span class="status-badge ${p.status}">${p.status?.replace('_', ' ') || 'draft'}</span></td>
<td>${isPaid ? '<span style="color: #2ecc71;">✓ Paid</span>' : '<span style="color: #f59e0b;">Pending</span>'}</td>
<td>${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '-'}</td>
<td>
<button class="btn-admin small" onclick="editBrandGuidePortfolio(${p.id})">Edit</button>
                                ${p.status === 'approved' && isPaid ? '<button class="btn-admin small primary" onclick="deliverBrandGuide(' + p.id + ')">Deliver</button>' : ''}
</td>
</tr>
                    `;}).join('')}
</tbody>
</table>
</div>
        ${currentBrandGuide ? renderBrandGuideEditor() : ''}
    `;
}

// Check if client has paid for their project
function checkClientPaymentStatus(clientId) {
    const clientPayments = payments.filter(p => p.clientId == clientId && p.status === 'completed');
    const clientInvoices = invoices.filter(i => i.clientId == clientId && i.status === 'paid');
    return clientPayments.length > 0 || clientInvoices.length > 0;
}

// Portfolio-style Brand Guide Editor
function renderBrandGuideEditor() {
    const p = proofs.find(x => x.id === currentBrandGuide);
    if (!p) return '';
    const client = clients.find(c => c.id == p.clientId);
    const isPaid = checkClientPaymentStatus(p.clientId);

    return `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;">
<div style="background: #1a1a1a; width: 100%; max-width: 1100px; max-height: 95vh; overflow-y: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <!-- Header -->
<div style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #1a1a1a; z-index: 10;">
<div>
<h2 style="font-size: 24px; font-weight: 700; color: #fff;">${p.title}</h2>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 4px;">Client: ${client?.name || 'Unknown'} • Status: <span class="status-badge ${p.status}">${p.status?.replace('_', ' ')}</span></p>
</div>
<div style="display: flex; gap: 12px; align-items: center;">
                        ${isPaid ? '<span style="background: #2ecc71; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;">✓ PAID</span>' : '<span style="background: #f59e0b; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;">PAYMENT PENDING</span>'}
<button onclick="currentBrandGuide = null; loadAdminBrandGuidePanel();" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #fff;">×</button>
</div>
</div>

<div class="p-24">
                    <!-- Hero Banner (21:9) -->
<div class="form-section">
<div class="form-section-title">🖼️ Hero Banner Image (21:9 Full Width)</div>
<div style="aspect-ratio: 21/9; border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, ${p.brandColors?.[0] || '#e63946'} 0%, ${p.brandColors?.[1] || '#1d3557'} 100%); position: relative;">
                            ${p.heroImage ? '<img alt="Brand guide hero image" loading="lazy" src="' + p.heroImage + '" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">' : ''}
<div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
<div style="font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">${p.title}</div>
                                ${p.tagline ? '<div style="font-size: 16px; color: rgba(255,255,255,0.8);">' + p.tagline + '</div>' : ''}
<input type="file" id="bgHeroUpload" class="hidden" accept="image/*" onchange="uploadBrandGuideHero(${p.id}, this)">
<button onclick="document.getElementById('bgHeroUpload').click()" style="padding: 12px 24px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Upload Hero Image</button>
</div>
</div>
</div>

                    <!-- Basic Info -->
<div class="form-section mt-24">
<div class="form-section-title">📝 Basic Info</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Brand Name</label><input type="text" class="form-input" value="${p.title || ''}" onchange="updateBrandGuideField(${p.id}, 'title', this.value)"></div>
<div class="form-group"><label class="form-label">Tagline</label><input type="text" class="form-input" value="${p.tagline || ''}" onchange="updateBrandGuideField(${p.id}, 'tagline', this.value)"></div>
</div>
<div class="form-group"><label class="form-label">Brand Story / Mission</label><textarea class="form-textarea" rows="3" onchange="updateBrandGuideField(${p.id}, 'description', this.value)">${p.description || ''}</textarea></div>
</div>

                    <!-- Logo System (1:1 Square) -->
<div class="form-section mt-24">
<div class="form-section-title">🎨 Logo System (1:1 Square)</div>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                            ${['Primary Logo', 'Secondary Logo', 'Icon / Logo Mark'].map((label, i) => {
                                const keys = ['logo', 'secondaryLogo', 'iconMark'];
                                const key = keys[i];
                                return `
<div style="aspect-ratio: 1/1; border: 2px dashed rgba(255,255,255,0.2); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; background: rgba(255,255,255,0.05);">
<div style="font-size: 11px; color: rgba(255,255,255,0.6); padding: 16px; background: rgba(255,255,255,0.05); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">${label}</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; background: #fff;">
                                        ${p[key] ? '<img alt="Brand asset image" loading="lazy" src="' + p[key] + '" style="max-height: 100%; max-width: 100%; object-fit: contain;">' : '<div style="color: #ccc; font-size: 13px;">No logo</div>'}
</div>
<div style="padding: 16px; background: rgba(255,255,255,0.05); text-align: center;">
<input type="file" id="bgLogo${i}Upload" class="hidden" accept="image/*" onchange="uploadBrandGuideAsset(${p.id}, '${key}', this)">
<button onclick="document.getElementById('bgLogo${i}Upload').click()" style="padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Upload</button>
</div>
</div>
                            `;}).join('')}
</div>
</div>

                    <!-- Color Palette -->
<div class="form-section mt-24">
<div class="form-section-title">🎨 Color Palette</div>
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            ${(p.brandColors || ['#e63946', '#1d3557', '#f4a261']).map((c, i) => `
<div class="text-center">
<input type="color" value="${c}" onchange="updateBrandGuideColor(${p.id}, ${i}, this.value)" style="width: 70px; height: 70px; border: none; border-radius: 12px; cursor: pointer;">
<div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; font-family: monospace;">${c}</div>
</div>
                            `).join('')}
<button onclick="addBrandGuideColor(${p.id})" style="width: 70px; height: 70px; border: 2px dashed rgba(255,255,255,0.3); border-radius: 12px; background: none; cursor: pointer; font-size: 24px; color: rgba(255,255,255,0.5);">+</button>
</div>
</div>

                    <!-- Font System -->
<div class="form-section mt-24">
<div class="form-section-title">🔤 Font System</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Heading Font</label><input type="text" class="form-input" value="${p.fonts?.primary || ''}" onchange="updateBrandGuideFont(${p.id}, 'primary', this.value)"></div>
<div class="form-group"><label class="form-label">Body Font</label><input type="text" class="form-input" value="${p.fonts?.secondary || ''}" onchange="updateBrandGuideFont(${p.id}, 'secondary', this.value)"></div>
</div>
</div>

                    <!-- Brand Mockups -->
<div class="form-section mt-24">
<div class="form-section-title">📸 Brand Mockups</div>
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                            ${(p.mockups || []).map((m, i) => `
<div style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
<img alt="Moodboard reference image" loading="lazy" src="${m}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
<button onclick="removeBrandGuideMockup(${p.id}, ${i})" style="position: absolute; top: 12px; right: 12px; background: #dc2626; color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">×</button>
</div>
                            `).join('')}
<div style="border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
<input type="file" id="bgMockupUpload" accept="image/*" class="hidden" onchange="uploadBrandGuideMockup(${p.id}, this)">
<button onclick="document.getElementById('bgMockupUpload').click()" style="padding: 12px 24px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">+ Add Mockup</button>
</div>
</div>
</div>

                    <!-- Proof Approval Section -->
<div class="form-section" style="margin-top: 32px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
<div class="form-section-title">✅ Proof Approval System</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                            <!-- Status & Actions -->
<div>
<p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 16px;">Current Status: <span class="status-badge ${p.status}" style="margin-left: 8px;">${p.status?.replace('_', ' ') || 'draft'}</span></p>
<p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 16px;">Revision Count: <strong>${p.revisionCount || 0}</strong></p>
<p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 16px;">Payment: ${isPaid ? '<span style="color: #2ecc71; font-weight: 600;">✓ Paid</span>' : '<span style="color: #f59e0b; font-weight: 600;">Pending</span>'}</p>

<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px;">
<button class="btn-admin primary" onclick="sendProofToClient(${p.id})">📤 Send to Client</button>
                                    ${p.status === 'approved' && isPaid ? '<button class="btn-admin" style="background: #2ecc71; color: #fff;" onclick="deliverBrandGuide(' + p.id + ')">📦 Deliver Files</button>' : ''}
                                    ${p.status === 'approved' && !isPaid ? '<button class="btn-admin secondary" disabled title="Client must pay before delivery">⏳ Awaiting Payment</button>' : ''}
</div>
</div>

                            <!-- Comments -->
<div>
<p style="color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 12px;">💬 Comments & Feedback (${(p.comments || []).length})</p>
<div style="max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                                    ${(p.comments || []).length === 0 ? '<p style="color: rgba(255,255,255,0.4); font-size: 13px;">No comments yet</p>' : ''}
                                    ${(p.comments || []).map(c => `
<div style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
<div style="display: flex; justify-content: space-between;">
<strong style="font-size: 12px; color: ${c.from === 'client' ? '#3b82f6' : '#2ecc71'};">${c.from === 'client' ? '👤 Client' : '🏢 NUI'}</strong>
<span style="font-size: 11px; color: rgba(255,255,255,0.4);">${new Date(c.timestamp).toLocaleString()}</span>
</div>
<p style="font-size: 13px; margin-top: 4px; color: rgba(255,255,255,0.8);">${c.text}</p>
</div>
                                    `).join('')}
</div>
<div class="flex-gap-8">
<input type="text" id="bgNewComment" class="form-input" placeholder="Add a comment..." class="flex-1">
<button class="btn-admin primary" onclick="addBrandGuideComment(${p.id})">Send</button>
</div>
</div>
</div>
</div>

                    <!-- Client Download Section -->
                    ${p.status === 'approved' || p.status === 'delivered' ? `
<div class="form-section" style="margin-top: 24px; background: ${isPaid ? 'rgba(46,204,113,0.1)' : 'rgba(255,59,48,0.1)'}; border: 1px solid ${isPaid ? '#2ecc71' : '#ff3b30'};">
<div class="form-section-title">${isPaid ? '✅ Ready for Download' : '🔒 Payment Required for Download'}</div>
                        ${isPaid ? `
<p style="color: rgba(255,255,255,0.6); margin-bottom: 16px;">Client can now download their brand assets.</p>
<div class="flex-gap-12 flex-wrap">
<button class="btn-admin" style="background: #2ecc71; color: #fff;" onclick="downloadBrandGuidePackage(${p.id})">📥 Download Full Package</button>
<button class="btn-admin secondary" onclick="emailBrandGuideToClient(${p.id})">📧 Email to Client</button>
</div>
                        ` : `
<p style="color: rgba(255,255,255,0.6); margin-bottom: 16px;">Client must complete payment before downloading files.</p>
<button class="btn-admin primary" onclick="sendPaymentReminder(${p.clientId})">💳 Send Payment Reminder</button>
                        `}
</div>
                    ` : ''}

                    <!-- Footer Actions -->
<div style="margin-top: 32px; display: flex; gap: 16px; justify-content: space-between;">
<button onclick="deleteBrandGuide(${p.id})" style="padding: 12px 24px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; cursor: pointer;">Delete Brand Guide</button>
<button onclick="currentBrandGuide = null; loadAdminBrandGuidePanel();" class="btn-admin primary">Save & Close</button>
</div>
</div>
</div>
</div>
    `;
}

function editBrandGuidePortfolio(id) {
    currentBrandGuide = id;
    loadAdminBrandGuidePanel();
}

function updateBrandGuideField(id, field, value) {
    const p = proofs.find(x => x.id === id);
    if (p) {
        p[field] = value;
        p.updatedAt = new Date().toISOString();
        saveProofs();
    }
}

function updateBrandGuideColor(id, index, value) {
    const p = proofs.find(x => x.id === id);
    if (p) {
        if (!p.brandColors) p.brandColors = ['#e63946', '#1d3557', '#f4a261'];
        p.brandColors[index] = value;
        p.updatedAt = new Date().toISOString();
        saveProofs();
        loadAdminBrandGuidePanel();
    }
}

function addBrandGuideColor(id) {
    const p = proofs.find(x => x.id === id);
    if (p && (!p.brandColors || p.brandColors.length < 6)) {
        if (!p.brandColors) p.brandColors = [];
        p.brandColors.push('#000000');
        saveProofs();
        loadAdminBrandGuidePanel();
    }
}

function updateBrandGuideFont(id, type, value) {
    const p = proofs.find(x => x.id === id);
    if (p) {
        if (!p.fonts) p.fonts = {};
        p.fonts[type] = value;
        saveProofs();
    }
}

function uploadBrandGuideHero(id, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const p = proofs.find(x => x.id === id);
        if (p) {
            p.heroImage = e.target.result;
            p.updatedAt = new Date().toISOString();
            saveProofs();
            loadAdminBrandGuidePanel();
        }
    };
    reader.readAsDataURL(file);
}

function uploadBrandGuideAsset(id, key, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const p = proofs.find(x => x.id === id);
        if (p) {
            p[key] = e.target.result;
            p.updatedAt = new Date().toISOString();
            saveProofs();
            loadAdminBrandGuidePanel();
        }
    };
    reader.readAsDataURL(file);
}

function uploadBrandGuideMockup(id, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const p = proofs.find(x => x.id === id);
        if (p) {
            if (!p.mockups) p.mockups = [];
            p.mockups.push(e.target.result);
            p.updatedAt = new Date().toISOString();
            saveProofs();
            loadAdminBrandGuidePanel();
        }
    };
    reader.readAsDataURL(file);
}

function removeBrandGuideMockup(id, index) {
    const p = proofs.find(x => x.id === id);
    if (p && p.mockups) {
        p.mockups.splice(index, 1);
        saveProofs();
        loadAdminBrandGuidePanel();
    }
}

function addBrandGuideComment(id) {
    const input = document.getElementById('bgNewComment');
    const text = input.value.trim();
    if (!text) return;

    const p = proofs.find(x => x.id === id);
    if (p) {
        if (!p.comments) p.comments = [];
        p.comments.push({
            from: 'admin',
            text: text,
            timestamp: new Date().toISOString()
        });
        p.updatedAt = new Date().toISOString();
        saveProofs();
        input.value = '';
        loadAdminBrandGuidePanel();
    }
}

async function sendProofToClient(id) {
    const p = proofs.find(x => x.id === id);
    if (!p) return;

    p.status = 'pending';
    p.sentToClient = true;
    p.sentAt = new Date().toISOString();
    p.updatedAt = new Date().toISOString();
    saveProofs();

    const client = clients.find(c => c.id == p.clientId);
    const clientEmail = client?.email;

    // Send real email to client
    let emailSent = false;
    if (clientEmail) {
        try {
            const resp = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: clientEmail,
                    clientId: client?.id,
                    subject: `🎨 Your ${p.title || 'Brand Guide'} Proof is Ready for Review`,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e63946, #ff6b6b); padding: 32px; text-align: center;">
<h2 class="m-0 fs-24 text-white">Your Proof is Ready! 🎉</h2>
</div>
<div class="p-32">
<p class="text-light">Hey ${client?.name || 'there'},</p>
<p class="text-light">Your <strong>${p.title || 'Brand Guide'}</strong> proof is ready for your review!</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
<p style="color: #fff; font-weight: 600; margin-bottom: 16px;">What to do next:</p>
<p style="color: #ccc; font-size: 14px; margin-bottom: 8px;">✅ <strong>Approve</strong> — if everything looks perfect</p>
<p style="color: #ccc; font-size: 14px;">🔄 <strong>Request Revisions</strong> — if you need changes</p>
</div>
<p style="color: #ccc; font-size: 14px;">Log into your <a href="https://newurbaninfluence.com/#portal" style="color: #e63946; text-decoration: none; font-weight: 600;">Client Portal</a> to review and respond.</p>
<p style="color: #888; font-size: 13px; margin-top: 24px;">Questions? Reply to this email or call (248) 487-8747.</p>
</div>
<div class="admin-footer-bar">
<p class="text-muted fs-12 m-0">New Urban Influence • Detroit, MI</p>
</div>
</div>`,
                    text: `Hey ${client?.name || 'there'}, your ${p.title || 'Brand Guide'} proof is ready for review! Log into your client portal to approve or request revisions. — New Urban Influence`
                })
            });
            emailSent = resp.ok;
        } catch (err) {
            console.log('Client email failed:', err.message);
        }
    }

    // Log to CRM
    logProofActivity('sent_to_client', p, `Proof "${p.title || 'Brand Guide'}" sent to ${client?.name || 'client'} for review`);

    alert('Proof sent to ' + (client?.name || 'client') + '!' + (emailSent ? '\n\n📧 Email delivered to ' + clientEmail : '\n\n⚠️ No email on file — notify client manually.'));
    loadAdminBrandGuidePanel();
}

async function deliverBrandGuide(id) {
    const p = proofs.find(x => x.id === id);
    if (!p) return;

    const isPaid = checkClientPaymentStatus(p.clientId);
    if (!isPaid) {
        alert('Cannot deliver - client has not paid yet.');
        return;
    }

    p.status = 'delivered';
    p.deliveredAt = new Date().toISOString();
    p.updatedAt = new Date().toISOString();
    saveProofs();

    const client = clients.find(c => c.id == p.clientId);

    // Send real delivery email
    if (client?.email) {
        await simulateEmailNotification(
            client.email,
            `🎉 Your ${p.title || 'Brand Guide'} is Ready for Download!`,
            `Your brand assets have been finalized and are ready to download. Log into your Client Portal at newurbaninfluence.com to access your files. Package includes all logo files, color palettes, typography guides, and brand guidelines.`
        );
    }

    // Log to CRM
    logProofActivity('delivered', p, `Brand Guide "${p.title}" delivered to ${client?.name || 'client'}`);

    alert('Brand Guide delivered to ' + (client?.name || 'client') + '!' + (client?.email ? '\n📧 Download notification sent via email.' : ''));
    loadAdminBrandGuidePanel();
}

function downloadBrandGuidePackage(id) {
    const p = proofs.find(x => x.id === id);
    if (!p) return;

    const isPaid = checkClientPaymentStatus(p.clientId);
    if (!isPaid) {
        alert('Download not available - payment required.');
        return;
    }

    // Generate HTML brand guide document
    const client = clients.find(c => c.id === p.clientId);
    const brandName = p.title || 'Brand Guide';
    const logoImages = [
        { name: 'Primary Logo', url: p.logo },
        { name: 'Secondary Logo', url: p.secondaryLogo },
        { name: 'Icon / Mark', url: p.iconMark }
    ].filter(l => l.url);

    const colorSwatches = (p.brandColors || []).map((color, i) => {
        const colorNames = ['Primary', 'Secondary', 'Accent'];
        return `
<div style="display: inline-block; text-align: center; margin: 16px; vertical-align: top;">
<div style="width: 120px; height: 120px; background: ${color}; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"></div>
<p style="font-weight: 600; margin-top: 12px; font-size: 14px;">${colorNames[i] || 'Color ' + (i+1)}</p>
<p style="font-family: monospace; color: #666; margin: 4px 0; font-size: 12px;">${color.toUpperCase()}</p>
</div>
        `;
    }).join('');

    const mockupHTML = (p.mockups || []).map(mockup => `
<div style="margin: 20px 0;">
<img alt="Brand mockup preview" loading="lazy" src="${mockup}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>${brandName} - Brand Guide</title>
 <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }

        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, ${p.brandColors?.[0] || '#e63946'} 0%, ${p.brandColors?.[1] || '#1d3557'} 100%);
            color: white;
            padding: 80px 40px;
            text-align: center;
            border-radius: 16px;
            margin-bottom: 60px;
            ${p.heroImage ? `background-image: url('${p.heroImage}'); background-size: cover; background-position: center;` : ''}
        }
        .hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.4);
            border-radius: 16px;
        }
        .hero h1 {
            font-size: 48px;
            font-weight: 900;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
        }
        .hero p {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        /* Section */
        .section {
            margin-bottom: 80px;
        }
        .section-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 32px;
            border-bottom: 3px solid ${p.brandColors?.[0] || '#e63946'};
            padding-bottom: 16px;
        }

        /* Logo Suite */
        .logo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 32px;
            margin-bottom: 40px;
        }
        .logo-item {
            text-align: center;
        }
        .logo-item img {
            width: 100%;
            height: 120px;
            object-fit: contain;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #eee;
            padding: 16px;
            margin-bottom: 12px;
        }
        .logo-item h3 {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }

        /* Color Palette */
        .color-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
        }
        .color-item {
            text-align: center;
        }
        .color-box {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            margin-bottom: 12px;
        }
        .color-info {
            font-size: 12px;
            font-weight: 600;
        }
        .color-hex {
            font-family: monospace;
            color: #666;
            font-size: 11px;
        }

        /* Typography */
        .typography-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .typography-item h3 {
            font-size: 14px;
            font-weight: 600;
            color: #666;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .typography-preview {
            padding: 24px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #eee;
        }
        .typography-preview h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .typography-preview p {
            font-size: 14px;
            line-height: 1.6;
        }

        /* Description */
        .description {
            background: #f0f0f0;
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 60px;
        }
        .description h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .description p {
            font-size: 15px;
            line-height: 1.8;
        }

        /* Mockups */
        .mockup-gallery {
            margin-bottom: 40px;
        }
        .mockup-gallery img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 24px;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 40px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
        }
 </style>
    <!-- Geo Meta Tags -->
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="Detroit, Michigan">
    <meta name="geo.position" content="42.3314;-83.0458">
    <meta name="ICBM" content="42.3314, -83.0458">
</head>
<body>
 <div class="container">
        <!-- Hero Section -->
<div class="hero" style="position: relative;">
<h2>${brandName}</h2>
            ${p.tagline ? `<p>${p.tagline}</p>` : ''}
</div>

        <!-- Description -->
        ${p.description ? `
<div class="description">
<h3>Brand Story</h3>
<p>${p.description.replace(/\n/g, '<br>')}</p>
</div>
        ` : ''}

        <!-- Logo Suite -->
<div class="section">
<h2 class="section-title">Logo Suite</h2>
<div class="logo-grid">
                ${logoImages.map(logo => `
<div class="logo-item">
<img loading="lazy" src="${logo.url}" alt="${logo.name}">
<h3>${logo.name}</h3>
</div>
                `).join('')}
</div>
</div>

        <!-- Color Palette -->
<div class="section">
<h2 class="section-title">Color Palette</h2>
<div class="color-grid">
                ${colorSwatches}
</div>
</div>

        <!-- Typography -->
        ${p.fonts ? `
<div class="section">
<h2 class="section-title">Typography</h2>
<div class="typography-section">
<div class="typography-item">
<h3>Headings</h3>
<div class="typography-preview">
<h2 style="font-family: '${p.fonts.primary || 'inherit'}', sans-serif;">Aa Bb Cc</h2>
<p style="font-size: 12px; color: #999;">${p.fonts.primary || 'Primary Font'}</p>
</div>
</div>
<div class="typography-item">
<h3>Body Text</h3>
<div class="typography-preview">
<p style="font-family: '${p.fonts.secondary || 'inherit'}', sans-serif;">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
<p style="font-size: 12px; color: #999; margin-top: 12px;">${p.fonts.secondary || 'Secondary Font'}</p>
</div>
</div>
</div>
</div>
        ` : ''}

        <!-- Mockups -->
        ${mockupHTML ? `
<div class="section">
<h2 class="section-title">Brand Applications</h2>
<div class="mockup-gallery">
                ${mockupHTML}
</div>
</div>
        ` : ''}

        <!-- Footer -->
<div class="footer">
<p>Brand Guide for ${client?.name || 'Client'} • Generated on ${new Date().toLocaleDateString()}</p>
<p class="mt-12">© New Urban Influence • All Rights Reserved</p>
</div>
 </div>
</body>
</html>
    `;

    // Create blob and trigger download
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-brand-guide.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

async function emailBrandGuideToClient(id) {
    const p = proofs.find(x => x.id === id);
    if (!p) return;

    const isPaid = checkClientPaymentStatus(p.clientId);
    if (!isPaid) {
        alert('Cannot email - client has not paid yet.');
        return;
    }

    const client = clients.find(c => c.id == p.clientId);
    if (client?.email) {
        await simulateEmailNotification(
            client.email,
            `📦 Your Brand Assets - ${p.title || 'Brand Guide'}`,
            `Here are your brand assets! Log into your Client Portal at newurbaninfluence.com to download your complete brand package including logo files (SVG, PNG, EPS), color palette, typography guide, and all approved mockups.`
        );
        alert('📧 Email sent to ' + client.email + ' with download links!');
    } else {
        alert('No email address on file for this client.');
    }
}

async function sendPaymentReminder(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (client?.email) {
        await simulateEmailNotification(
            client.email,
            `💳 Payment Reminder - New Urban Influence`,
            `Hi ${client.name || 'there'}, this is a friendly reminder that you have an outstanding balance for your project. Please log into your Client Portal to complete payment and unlock your final deliverables. Questions? Reply to this email or call (248) 487-8747.`
        );
        alert('📧 Payment reminder sent to ' + client.email + '!');
    } else {
        alert('No email on file for this client.');
    }
}

function deleteBrandGuide(id) {
    if (!confirm('Are you sure you want to delete this brand guide?')) return;
    proofs = proofs.filter(p => p.id !== id);
    saveProofs();
    currentBrandGuide = null;
    loadAdminBrandGuidePanel();
}

function showCreateBrandGuideModal() {
    const clientList = clients || [];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'brandGuideModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 800px;">
<div class="modal-header">
<h3 class="modal-title">Create Brand Guide</h3>
<button class="modal-close" onclick="document.getElementById('brandGuideModal').remove()">×</button>
</div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
<div class="form-group">
<label class="form-label">Select Client *</label>
<select id="bgClient" class="form-select">
<option value="">-- Select Client --</option>
                        ${clientList.map(c => '<option value="' + c.id + '">' + c.name + ' - ' + (c.company || c.industry || 'N/A') + '</option>').join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Brand Name *</label>
<input type="text" id="bgBrandName" class="form-input" placeholder="Brand / Company Name">
</div>
<div class="form-group">
<label class="form-label">Tagline</label>
<input type="text" id="bgTagline" class="form-input" placeholder="Your brand tagline">
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Primary Color</label>
<input type="color" id="bgColor1" value="#e63946" style="width: 100%; height: 50px; border: none; border-radius: 8px; cursor: pointer;">
</div>
<div class="form-group">
<label class="form-label">Secondary Color</label>
<input type="color" id="bgColor2" value="#1d3557" style="width: 100%; height: 50px; border: none; border-radius: 8px; cursor: pointer;">
</div>
<div class="form-group">
<label class="form-label">Accent Color</label>
<input type="color" id="bgColor3" value="#f4a261" style="width: 100%; height: 50px; border: none; border-radius: 8px; cursor: pointer;">
</div>
</div>
<div class="form-group">
<label class="form-label">Hero Image (Optional)</label>
<input type="file" id="bgHeroImageUpload" accept="image/*" class="form-input" onchange="previewBrandGuideHeroImage(this)">
<div id="bgHeroImagePreview" class="mt-12"></div>
<p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Recommended: 21:9 aspect ratio for full width banner</p>
</div>
<div class="form-group">
<label class="form-label">Primary Logo *</label>
<input type="file" id="bgLogoUpload" accept="image/*" class="form-input" onchange="previewBrandGuideLogo(this)">
<div id="bgLogoPreview" class="mt-12"></div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Secondary Logo (Optional)</label>
<input type="file" id="bgSecondaryLogoUpload" accept="image/*" class="form-input" onchange="previewBrandGuideSecondaryLogo(this)">
<div id="bgSecondaryLogoPreview" class="mt-12"></div>
</div>
<div class="form-group">
<label class="form-label">Icon/Logo Mark (Optional)</label>
<input type="file" id="bgIconMarkUpload" accept="image/*" class="form-input" onchange="previewBrandGuideIconMark(this)">
<div id="bgIconMarkPreview" class="mt-12"></div>
</div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Primary Font</label>
<select id="bgFontPrimary" class="form-select">
<option value="Playfair Display">Playfair Display</option>
<option value="Poppins">Poppins</option>
<option value="Montserrat">Montserrat</option>
<option value="Roboto">Roboto</option>
<option value="Open Sans">Open Sans</option>
<option value="Lato">Lato</option>
</select>
</div>
<div class="form-group">
<label class="form-label">Secondary Font</label>
<select id="bgFontSecondary" class="form-select">
<option value="Inter">Inter</option>
<option value="Roboto">Roboto</option>
<option value="Open Sans">Open Sans</option>
<option value="Lato">Lato</option>
<option value="Poppins">Poppins</option>
</select>
</div>
</div>
<div class="form-group">
<label class="form-label">Brand Story / Description</label>
<textarea id="bgDescription" class="form-textarea" rows="4" placeholder="Brief brand story or description..."></textarea>
</div>
<div class="form-group">
<label class="form-label">Brand Mockups (Optional)</label>
<input type="file" id="bgMockupsUpload" accept="image/*" multiple class="form-input">
<p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Upload mockups showing the brand in use (business cards, letterhead, packaging, etc.)</p>
</div>
<div class="form-group">
<label class="form-label">Additional Assets (Optional)</label>
<input type="file" id="bgAssetsUpload" accept="image/*" multiple class="form-input">
<p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Upload additional brand assets (icons, patterns, photos)</p>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('brandGuideModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="saveBrandGuide()">Create Brand Guide</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function previewBrandGuideLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bgLogoPreview').innerHTML = `<img alt="Uploaded primary logo" loading="lazy" src="${e.target.result}" style="max-width: 200px; max-height: 100px; object-fit: contain; background: #fff; padding: 12px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewBrandGuideHeroImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bgHeroImagePreview').innerHTML = `<img alt="Uploaded hero image" loading="lazy" src="${e.target.result}" style="max-width: 300px; max-height: 150px; object-fit: cover; border-radius: 8px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewBrandGuideSecondaryLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bgSecondaryLogoPreview').innerHTML = `<img alt="Uploaded secondary logo" loading="lazy" src="${e.target.result}" style="max-width: 150px; max-height: 100px; object-fit: contain; background: #fff; padding: 12px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function previewBrandGuideIconMark(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bgIconMarkPreview').innerHTML = `<img alt="Uploaded icon mark" loading="lazy" src="${e.target.result}" style="max-width: 150px; max-height: 100px; object-fit: contain; background: #fff; padding: 12px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveBrandGuide() {
    const clientId = document.getElementById('bgClient').value;
    const client = clients.find(c => c.id == clientId);

    const logoInput = document.getElementById('bgLogoUpload');
    const secondaryLogoInput = document.getElementById('bgSecondaryLogoUpload');
    const iconMarkInput = document.getElementById('bgIconMarkUpload');
    const heroImageInput = document.getElementById('bgHeroImageUpload');
    const mockupsInput = document.getElementById('bgMockupsUpload');
    const assetsInput = document.getElementById('bgAssetsUpload');

    const saveGuide = (data) => {
        const brandGuide = {
            id: Date.now(),
            type: 'brandguide',
            clientId: clientId,
            clientName: client ? client.name : document.getElementById('bgBrandName').value,
            title: document.getElementById('bgBrandName').value,
            tagline: document.getElementById('bgTagline').value,
            brandColors: [
                document.getElementById('bgColor1').value,
                document.getElementById('bgColor2').value,
                document.getElementById('bgColor3').value
            ],
            fonts: {
                primary: document.getElementById('bgFontPrimary').value,
                secondary: document.getElementById('bgFontSecondary').value
            },
            logo: data.logo || '',
            heroImage: data.heroImage || '',
            secondaryLogo: data.secondaryLogo || '',
            iconMark: data.iconMark || '',
            description: document.getElementById('bgDescription').value,
            mockups: data.mockups || [],
            comments: [],
            revisionCount: 0,
            assets: data.assets || [],
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sentToClient: false
        };

        proofs.push(brandGuide);
        saveProofs();
        document.getElementById('brandGuideModal').remove();
        loadAdminBrandGuidePanel();
        alert('Brand Guide created successfully!');
    };

    // Collect all file data
    const fileData = {};
    let filesToProcess = 0;
    let filesProcessed = 0;

    // Helper to process all files and call saveGuide when done
    const tryCallSaveGuide = () => {
        filesProcessed++;
        if (filesProcessed === filesToProcess) {
            saveGuide(fileData);
        }
    };

    // Count files to process
    if (heroImageInput.files && heroImageInput.files[0]) filesToProcess++;
    if (logoInput.files && logoInput.files[0]) filesToProcess++;
    if (secondaryLogoInput.files && secondaryLogoInput.files[0]) filesToProcess++;
    if (iconMarkInput.files && iconMarkInput.files[0]) filesToProcess++;
    if (mockupsInput.files && mockupsInput.files.length > 0) filesToProcess++;
    if (assetsInput.files && assetsInput.files.length > 0) filesToProcess++;

    // If no files, just save
    if (filesToProcess === 0) {
        saveGuide(fileData);
        return;
    }

    // Process hero image
    if (heroImageInput.files && heroImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            fileData.heroImage = e.target.result;
            tryCallSaveGuide();
        };
        reader.readAsDataURL(heroImageInput.files[0]);
    }

    // Process primary logo
    if (logoInput.files && logoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            fileData.logo = e.target.result;
            tryCallSaveGuide();
        };
        reader.readAsDataURL(logoInput.files[0]);
    }

    // Process secondary logo
    if (secondaryLogoInput.files && secondaryLogoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            fileData.secondaryLogo = e.target.result;
            tryCallSaveGuide();
        };
        reader.readAsDataURL(secondaryLogoInput.files[0]);
    }

    // Process icon mark
    if (iconMarkInput.files && iconMarkInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            fileData.iconMark = e.target.result;
            tryCallSaveGuide();
        };
        reader.readAsDataURL(iconMarkInput.files[0]);
    }

    // Process mockups
    if (mockupsInput.files && mockupsInput.files.length > 0) {
        fileData.mockups = [];
        let mockupCount = 0;
        Array.from(mockupsInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                fileData.mockups.push(e.target.result);
                mockupCount++;
                if (mockupCount === mockupsInput.files.length) {
                    tryCallSaveGuide();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Process additional assets
    if (assetsInput.files && assetsInput.files.length > 0) {
        fileData.assets = [];
        let assetCount = 0;
        Array.from(assetsInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                fileData.assets.push({ name: file.name, data: e.target.result });
                assetCount++;
                if (assetCount === assetsInput.files.length) {
                    tryCallSaveGuide();
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

function viewBrandGuide(id) {
    const guide = proofs.find(p => p.id === id);
    if (!guide) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'viewBrandGuideModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 900px; max-height: 90vh; overflow: hidden;">
<div class="modal-header" style="background: linear-gradient(135deg, ${guide.brandColors?.[0] || '#e63946'}, ${guide.brandColors?.[1] || '#1d3557'});">
<h3 class="modal-title text-white">${guide.title} - Brand Guide</h3>
<button class="modal-close" onclick="document.getElementById('viewBrandGuideModal').remove()" class="text-white">×</button>
</div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto; background: #0a0a0a;">
                <!-- Brand Header -->
<div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, ${guide.brandColors?.[0]}22, ${guide.brandColors?.[1]}22); border-radius: 12px; margin-bottom: 24px;">
                    ${guide.logo ? `<img alt="Brand guide logo" loading="lazy" src="${guide.logo}" style="max-width: 200px; max-height: 100px; object-fit: contain; margin-bottom: 16px;">` : ''}
<h2 style="font-family: '${guide.fonts?.primary || 'Playfair Display'}', serif; font-size: 32px; margin-bottom: 8px;">${guide.title}</h2>
                    ${guide.tagline ? `<p style="font-family: '${guide.fonts?.secondary || 'Inter'}', sans-serif; font-size: 16px; opacity: 0.8;">${guide.tagline}</p>` : ''}
</div>

                <!-- Color Palette -->
<div class="mb-32">
<h3 style="margin-bottom: 16px; font-size: 18px;">Color Palette</h3>
<div style="display: flex; gap: 16px; flex-wrap: wrap;">
                        ${guide.brandColors?.map((color, i) => `
<div style="flex: 1; min-width: 120px;">
<div style="width: 100%; height: 80px; background: ${color}; border-radius: 12px; margin-bottom: 8px;"></div>
<p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${['Primary', 'Secondary', 'Accent'][i]}</p>
<p style="font-family: monospace; font-size: 14px;">${color}</p>
</div>
                        `).join('') || ''}
</div>
</div>

                <!-- Typography -->
<div class="mb-32">
<h3 style="margin-bottom: 16px; font-size: 18px;">Typography</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
<div style="padding: 24px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-size: 12px; opacity: 0.6; margin-bottom: 8px;">PRIMARY FONT</p>
<p style="font-family: '${guide.fonts?.primary}', serif; font-size: 28px;">${guide.fonts?.primary}</p>
<p style="font-family: '${guide.fonts?.primary}', serif; font-size: 16px; margin-top: 12px;">Aa Bb Cc Dd Ee Ff Gg</p>
</div>
<div style="padding: 24px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-size: 12px; opacity: 0.6; margin-bottom: 8px;">SECONDARY FONT</p>
<p style="font-family: '${guide.fonts?.secondary}', sans-serif; font-size: 28px;">${guide.fonts?.secondary}</p>
<p style="font-family: '${guide.fonts?.secondary}', sans-serif; font-size: 16px; margin-top: 12px;">Aa Bb Cc Dd Ee Ff Gg</p>
</div>
</div>
</div>

                <!-- Brand Story -->
                ${guide.description ? `
<div class="mb-32">
<h3 style="margin-bottom: 16px; font-size: 18px;">Brand Story</h3>
<p style="line-height: 1.8; opacity: 0.9;">${guide.description}</p>
</div>
                ` : ''}

                <!-- Assets -->
                ${guide.assets && guide.assets.length > 0 ? `
<div class="mb-32">
<h3 style="margin-bottom: 16px; font-size: 18px;">Brand Assets</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                        ${guide.assets.map(asset => `
<div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; text-align: center;">
<img alt="Brand asset thumbnail" loading="lazy" src="${asset.data}" style="max-width: 100%; max-height: 120px; object-fit: contain; margin-bottom: 8px;">
<p style="font-size: 12px; opacity: 0.7;">${asset.name}</p>
</div>
                        `).join('')}
</div>
</div>
                ` : ''}
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('viewBrandGuideModal').remove()">Close</button>
<button class="btn-admin primary" onclick="downloadBrandGuideAssets(${id})">📥 Download All Assets</button>
<button class="btn-admin primary" onclick="sendBrandGuideToClient(${id})">📧 Send to Client</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function editBrandGuide(id) {
    const guide = proofs.find(p => p.id === id);
    if (!guide) return;
    // Reuse create modal with pre-filled data
    showCreateBrandGuideModal();
    setTimeout(() => {
        document.getElementById('bgBrandName').value = guide.title || '';
        document.getElementById('bgTagline').value = guide.tagline || '';
        document.getElementById('bgColor1').value = guide.brandColors?.[0] || '#e63946';
        document.getElementById('bgColor2').value = guide.brandColors?.[1] || '#1d3557';
        document.getElementById('bgColor3').value = guide.brandColors?.[2] || '#f4a261';
        document.getElementById('bgFontPrimary').value = guide.fonts?.primary || 'Playfair Display';
        document.getElementById('bgFontSecondary').value = guide.fonts?.secondary || 'Inter';
        document.getElementById('bgDescription').value = guide.description || '';
        if (guide.logo) {
            document.getElementById('bgLogoPreview').innerHTML = `<img alt="Brand guide cover logo" loading="lazy" src="${guide.logo}" style="max-width: 200px; max-height: 100px; object-fit: contain; background: #fff; padding: 12px; border-radius: 8px;">`;
        }
        // Update save button to update instead of create
        const saveBtn = document.querySelector('#brandGuideModal .modal-footer .btn-admin.primary');
        saveBtn.textContent = 'Update Brand Guide';
        saveBtn.onclick = () => updateBrandGuide(id);
    }, 100);
}

function updateBrandGuide(id) {
    const guide = proofs.find(p => p.id === id);
    if (!guide) return;

    guide.title = document.getElementById('bgBrandName').value;
    guide.tagline = document.getElementById('bgTagline').value;
    guide.brandColors = [
        document.getElementById('bgColor1').value,
        document.getElementById('bgColor2').value,
        document.getElementById('bgColor3').value
    ];
    guide.fonts = {
        primary: document.getElementById('bgFontPrimary').value,
        secondary: document.getElementById('bgFontSecondary').value
    };
    guide.description = document.getElementById('bgDescription').value;

    saveProofs();
    document.getElementById('brandGuideModal').remove();
    loadAdminBrandGuidePanel();
    alert('Brand Guide updated!');
}

function downloadBrandGuideAssets(id) {
    const guide = proofs.find(p => p.id === id);
    if (!guide) return;

    // Create downloadable content
    const assets = [];
    if (guide.logo) assets.push({ name: 'logo.png', data: guide.logo });
    if (guide.assets) guide.assets.forEach(a => assets.push(a));

    if (assets.length === 0) {
        alert('No assets to download');
        return;
    }

    // Download each asset
    assets.forEach((asset, i) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = asset.data;
            link.download = asset.name || `asset-${i + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, i * 500);
    });

    alert(`Downloading ${assets.length} asset(s)...`);
}

function sendBrandGuideToClient(id) {
    const guide = proofs.find(p => p.id === id);
    if (!guide) return;

    guide.sentToClient = true;
    guide.sentAt = new Date().toISOString();
    saveProofs();

    alert(`Brand Guide for "${guide.title}" has been marked as sent to client. In production, this would send an email with the brand guide link.`);
    loadAdminBrandGuidePanel();
}

// ==================== MOODBOARD SYSTEM ====================
function loadAdminMoodboardPanel() {
    // Run storage cleanup on panel load to prevent quota issues
    cleanupProofStorage();
    const moodboards = proofs.filter(p => p.type === 'moodboard');
    const pending = moodboards.filter(m => m.status === 'pending').length;
    const approved = moodboards.filter(m => m.status === 'approved').length;
    const drafts = moodboards.filter(m => m.status === 'draft').length;

    const boardCards = moodboards.length === 0 ?
        '<div style="text-align: center; padding: 60px 20px; color: #666;"><div style="font-size: 48px; margin-bottom: 16px;">🎨</div><h3>No Moodboards Yet</h3><p style="margin-top: 8px;">Create your first moodboard to share creative direction with clients.</p></div>' :
        moodboards.map(m => {
            const client = clients.find(c => c.id == m.clientId);
            const previewImages = (m.collageItems || []).filter(i => i.type === 'image').slice(0, 4);
            const colorItems = (m.collageItems || []).filter(i => i.type === 'color').slice(0, 5);
            const statusColors = { draft: '#888', pending: '#ffaa00', approved: '#44ff44', revision: '#ff4444', delivered: '#4488ff' };
            return `
<div style="background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; cursor: pointer;" onclick="openMoodboardEditor('${m.id}')">
<div style="height: 200px; background: #0a0a0a; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2px; overflow: hidden;">
                        ${previewImages.map(img => {
                            const isIdb = img.src && img.src.startsWith('idb://');
                            return `<div style="${isIdb ? '' : "background: url('" + img.src + "') center/cover;"} min-height: 98px; background-color: #1a1a1a;" ${isIdb ? 'data-idb-bg="' + img.src + '"' : ''}></div>`;
                        }).join('')}
                        ${previewImages.length === 0 ? '<div style="grid-column: 1/-1; grid-row: 1/-1; display: flex; align-items: center; justify-content: center; color: #444; font-size: 48px;">🎨</div>' : ''}
</div>
<div class="p-16">
<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
<h4 style="font-size: 15px; font-weight: 600;">${m.title || 'Untitled Moodboard'}</h4>
<span style="padding: 3px 10px; border-radius: 20px; font-size: 11px; background: ${statusColors[m.status] || '#888'}20; color: ${statusColors[m.status] || '#888'};">${m.status}</span>
</div>
<div class="text-muted-sm">${client?.name || 'No Client'}</div>
<div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                            ${colorItems.map(c => `<div style="width: 20px; height: 20px; border-radius: 50%; background: ${c.color}; border: 2px solid rgba(255,255,255,0.1);"></div>`).join('')}
</div>
<div style="display: flex; gap: 8px; margin-top: 12px;">
                            ${m.status === 'draft' ? `<button onclick="event.stopPropagation(); sendProofToClient('${m.id}')" style="padding: 6px 14px; background: #ff0000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Send to Client</button>` : ''}
<button onclick="event.stopPropagation(); deleteMoodboard('${m.id}')" style="padding: 6px 14px; background: transparent; border: 1px solid #ff444440; color: #ff4444; border-radius: 6px; cursor: pointer; font-size: 12px;">Delete</button>
</div>
</div>
</div>
            `;
        }).join('');

    document.getElementById('adminMoodboardPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">🎨 Moodboards</h2>
<button onclick="showCreateMoodboardModal()" style="padding: 12px 24px; background: linear-gradient(135deg, #ff0000, #cc0000); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">+ New Moodboard</button>
</div>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #888;">${drafts}</div>
<div class="text-muted-sm">Drafts</div>
</div>
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #ffaa00;">${pending}</div>
<div class="text-muted-sm">Sent / Pending</div>
</div>
<div class="admin-card-dark-center">
<div style="font-size: 28px; font-weight: 700; color: #44ff44;">${approved}</div>
<div class="text-muted-sm">Approved</div>
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${boardCards}
</div>
    `;
    // Resolve any idb:// thumbnail backgrounds
    setTimeout(resolveAllImages, 50);
}

function deleteMoodboard(id) {
    if (!confirm('Delete this moodboard?')) return;
    const idx = proofs.findIndex(p => p.id == id);
    if (idx !== -1) { proofs.splice(idx, 1); saveProofs(); }
    loadAdminMoodboardPanel();
}

function showCreateMoodboardModal() {
    const clientOpts = clients.map(c => `<option value="${c.id}">${c.name} — ${c.email}</option>`).join('');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'createMoodboardModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
<div class="modal" style="max-width: 500px;">
<div class="modal-header">
<h3 class="modal-title">Create Moodboard</h3>
<button class="modal-close" onclick="document.getElementById('createMoodboardModal').remove()">×</button>
</div>
<div class="modal-body p-24">
<div class="form-group mb-16">
<label class="form-label">Client *</label>
<select id="moodboardClient" class="form-input"><option value="">Select client...</option>${clientOpts}</select>
</div>
<div class="form-group mb-16">
<label class="form-label">Moodboard Title *</label>
<input type="text" id="moodboardTitle" class="form-input" placeholder="e.g. Brand Direction — Modern & Bold">
</div>
<div class="form-group mb-16">
<label class="form-label">Creative Brief / Notes</label>
<textarea id="moodboardNotes" class="form-input" rows="3" placeholder="Describe the creative direction..."></textarea>
</div>
</div>
<div class="modal-footer">
<button onclick="document.getElementById('createMoodboardModal').remove()" class="btn-outline">Cancel</button>
<button onclick="createMoodboardAndOpenEditor()" class="btn-cta">Create & Open Builder</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function createMoodboardAndOpenEditor() {
    const clientId = document.getElementById('moodboardClient').value;
    const title = document.getElementById('moodboardTitle').value.trim();
    const notes = document.getElementById('moodboardNotes').value.trim();
    if (!clientId || !title) { alert('Client and title are required.'); return; }

    const client = clients.find(c => c.id == clientId);
    const moodboard = {
        id: Date.now(),
        type: 'moodboard',
        clientId: clientId,
        clientName: client?.name || '',
        title: title,
        notes: notes,
        collageItems: [],
        canvasBackground: '#111111',
        canvasWidth: 1200,
        canvasHeight: 800,
        comments: [],
        revisionCount: 0,
        status: 'draft',
        sentToClient: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    proofs.push(moodboard);
    saveProofs();
    document.getElementById('createMoodboardModal').remove();
    openMoodboardEditor(moodboard.id);
}

// ==================== MILANOTE-STYLE MOODBOARD EDITOR ====================

// Canvas state
var _mbZoom = 1;
var _mbPanX = 0;
var _mbPanY = 0;
var _mbIsPanning = false;
var _mbPanStart = { x: 0, y: 0 };
var _mbPanStartOff = { x: 0, y: 0 };
var _mbSpaceHeld = false;
var _mbGridSize = 20;
var _mbSnapOn = true;
var _mbDragging = false;
var _mbDragIdx = -1;
var _mbDragStart = { x: 0, y: 0 };
var _mbItemStart = { x: 0, y: 0 };
var _mbResizing = false;
var _mbResizeIdx = -1;
var _mbResizeStart = { x: 0, y: 0 };
var _mbResizeItemStart = { w: 0, h: 0 };

function snapVal(v) { return _mbSnapOn ? Math.round(v / _mbGridSize) * _mbGridSize : v; }
function escHtml(s) { if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escCss(s) { if(!s) return ''; return String(s).replace(/[;"'<>&\\(){}]/g, ''); }

function openMoodboardEditor(id) {
    var mb = proofs.find(function(p) { return p.id == id; });
    if (!mb) { alert('Moodboard not found.'); return; }
    var client = clients.find(function(c) { return c.id == mb.clientId; });
    _mbZoom = 1; _mbPanX = 0; _mbPanY = 0;
    window._mbEditorState = { id: mb.id, selectedItem: null };
    var bgColor = mb.canvasBackground || '#f5f5f5';

    document.getElementById('adminMoodboardPanel').innerHTML = `
<style>
            .ml-wrap{display:flex;flex-direction:column;height:calc(100vh - 180px);background:#fff;border-radius:12px;overflow:hidden;border:1px solid #d4d4d8;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
            .ml-head{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:linear-gradient(180deg,#fff 0%,#fafafa 100%);border-bottom:1px solid #e4e4e7}
            .ml-head-title{font-size:17px;font-weight:700;color:#18181b;letter-spacing:-0.3px}
            .ml-head-sub{font-size:12px;color:#a1a1aa;margin-top:2px}
            .ml-hbtn{padding:8px 18px;background:#fff;border:1px solid #d4d4d8;color:#3f3f46;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
            .ml-hbtn:hover{background:#f4f4f5;border-color:#a1a1aa;box-shadow:0 2px 4px rgba(0,0,0,0.08);transform:translateY(-1px)}
            .ml-hbtn:active{transform:translateY(0);box-shadow:0 1px 2px rgba(0,0,0,0.04)}
            .ml-hbtn-red{background:linear-gradient(180deg,#ef4444,#dc2626);border-color:#dc2626;color:#fff;box-shadow:0 1px 3px rgba(220,38,38,0.3)}
            .ml-hbtn-red:hover{background:linear-gradient(180deg,#dc2626,#b91c1c);box-shadow:0 3px 8px rgba(220,38,38,0.35)}
            .ml-body{display:flex;flex:1;overflow:hidden}

            /* Sidebar */
            .ml-sidebar{width:220px;background:linear-gradient(180deg,#fafafa 0%,#f4f4f5 100%);border-right:1px solid #e4e4e7;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
            .ml-sb-section{padding:18px 16px 8px;font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:1.2px}
            .ml-sb-item{display:flex;align-items:center;gap:11px;padding:10px 14px;margin:2px 10px;border-radius:10px;cursor:pointer;color:#52525b;font-size:13px;font-weight:500;transition:all .18s;border:1px solid transparent;user-select:none}
            .ml-sb-item:hover{background:#fff;border-color:#d4d4d8;color:#18181b;box-shadow:0 2px 8px rgba(0,0,0,0.06);transform:translateX(2px)}
            .ml-sb-item:active{transform:scale(0.97) translateX(0);box-shadow:0 0 0 2px rgba(59,130,246,0.3);background:#eff6ff}
            .ml-sb-item[draggable]{cursor:grab}
            .ml-sb-item[draggable]:active{cursor:grabbing}
            .ml-ghost{position:fixed;pointer-events:none;z-index:9999;opacity:0.9;padding:10px 16px;background:#fff;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,0.2);font-size:13px;font-weight:600;color:#18181b;display:none}
            .ml-sb-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
            .ml-sb-sep{height:1px;background:linear-gradient(90deg,transparent,#d4d4d8,transparent);margin:10px 16px}

            /* Canvas */
            .ml-canvas-area{flex:1;overflow:hidden;position:relative;background:#e4e4e7;cursor:default}
            .ml-canvas-area.panning{cursor:grab}
            .ml-canvas{transform-origin:0 0;position:absolute;width:5000px;height:4000px}
            .ml-grid{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.25;background-image:radial-gradient(circle,#a1a1aa 0.5px,transparent 0.5px);background-size:20px 20px}

            /* Cards */
            .ml-card{position:absolute;background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.03);cursor:move;user-select:none;transition:box-shadow .2s,transform .1s}
            .ml-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.05)}
            .ml-card.sel{box-shadow:0 0 0 2.5px #3b82f6,0 4px 16px rgba(59,130,246,0.2)}
            .ml-card .ml-rz{position:absolute;width:10px;height:10px;background:#3b82f6;border:2px solid #fff;border-radius:2px;display:none;z-index:5;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
            .ml-card.sel .ml-rz{display:block}
            .ml-rz-se{bottom:-5px;right:-5px;cursor:se-resize}

            /* Image card */
            .ml-img-wrap{width:100%;overflow:hidden;border-radius:8px 8px 0 0;cursor:move}
            .ml-img-wrap img{width:100%;display:block;pointer-events:none}
            .ml-img-caption{padding:10px 14px;font-size:12px;color:#52525b;border:none;background:none;width:100%;outline:none;box-sizing:border-box;min-height:20px;resize:none;font-family:inherit;border-top:1px solid #f4f4f5}
            .ml-img-caption:focus{background:#fafafa}
            .ml-img-caption:empty::before{content:'Add a caption...';color:#d4d4d8}
            .ml-img-caption::placeholder{color:#d4d4d8}

            /* Note card */
            .ml-note{overflow:hidden}
            .ml-note-strip{height:5px;border-radius:8px 8px 0 0}
            .ml-note-handle{height:24px;cursor:move;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.01));border-bottom:1px solid rgba(0,0,0,0.05);position:relative}
            .ml-note-handle:hover{background:linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.02))}
            .ml-note-handle::after{content:'';width:28px;height:3px;border-radius:3px;background:rgba(0,0,0,0.12)}
            .ml-note-title{font-size:15px;font-weight:600;color:#18181b;padding:10px 14px 2px;border:none;background:none;width:100%;outline:none;box-sizing:border-box;font-family:inherit}
            .ml-note-title:focus{background:#fafafa}
            .ml-note-body{font-size:13px;color:#52525b;padding:4px 14px 14px;border:none;background:none;width:100%;outline:none;resize:none;min-height:40px;line-height:1.6;box-sizing:border-box;font-family:inherit}
            .ml-note-body:focus{background:#fafafa}
            .ml-note-title::placeholder{color:#d4d4d8}
            .ml-note-body::placeholder{color:#d4d4d8}

            /* Link card */
            .ml-link-domain{font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;padding:14px 14px 6px}
            .ml-link-title{font-size:14px;font-weight:600;color:#18181b;padding:0 14px 8px;line-height:1.3}
            .ml-link-url{border-top:1px solid #f4f4f5;padding:10px 14px;font-size:11px}
            .ml-link-url a{color:#3b82f6;text-decoration:none;font-weight:500}
            .ml-link-url a:hover{text-decoration:underline}

            /* Color swatch */
            .ml-swatch-color{width:100%;aspect-ratio:1;border-radius:8px 8px 0 0}
            .ml-swatch-label{padding:8px 10px;font-size:11px;color:#71717a;font-family:'SF Mono',SFMono-Regular,monospace;text-align:center;background:#fff;border-radius:0 0 8px 8px;font-weight:500}

            /* Text card */
            .ml-text-card{background:transparent!important;box-shadow:none!important}
            .ml-text-card:hover{box-shadow:0 0 0 1.5px #3b82f6!important}
            .ml-text-card.sel{box-shadow:0 0 0 2.5px #3b82f6!important}

            /* Footer */
            .ml-foot{display:flex;align-items:center;justify-content:space-between;padding:8px 18px;background:linear-gradient(180deg,#fafafa,#fff);border-top:1px solid #e4e4e7;font-size:11px;color:#a1a1aa}
            .ml-zbtn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #d4d4d8;color:#52525b;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all .12s;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
            .ml-zbtn:hover{background:#f4f4f5;color:#18181b;border-color:#a1a1aa;box-shadow:0 2px 4px rgba(0,0,0,0.08)}

            /* Floating panels */
            .ml-float{position:absolute;top:14px;right:14px;width:250px;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:16px;z-index:50;display:none;box-shadow:0 8px 32px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.03)}
            .ml-float.show{display:block;animation:mlPanelIn .15s ease-out}
            @keyframes mlPanelIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
            .ml-float h4{font-size:10px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px}
            .ml-finput{width:100%;padding:9px 12px;background:#fafafa;border:1px solid #d4d4d8;color:#18181b;border-radius:8px;font-size:12px;margin-bottom:8px;box-sizing:border-box;transition:border-color .15s}
            .ml-finput:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
            .ml-fbtn{width:100%;padding:9px;background:#f4f4f5;border:1px solid #d4d4d8;color:#3f3f46;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;margin-bottom:6px;transition:all .12s}
            .ml-fbtn:hover{background:#e4e4e7;color:#18181b;border-color:#a1a1aa}
</style>

<div class="ml-wrap">
            <!-- HEADER -->
<div class="ml-head">
<div style="display:flex;align-items:center;gap:14px;">
<button onclick="loadAdminMoodboardPanel()" class="ml-hbtn">\u2190 Back</button>
<div>
<div class="ml-head-title">${mb.title}</div>
<div class="ml-head-sub">${client?.name || 'Client'} \u00b7 ${mb.collageItems.length} items</div>
</div>
</div>
<div class="flex-gap-8">
<button onclick="saveMoodboardState('${mb.id}')" class="ml-hbtn">\ud83d\udcbe Save</button>
<button onclick="previewMoodboard('${mb.id}')" class="ml-hbtn">\ud83d\udc41 Preview</button>
                    ${mb.status === 'draft' ? `<button onclick="sendProofToClient('${mb.id}'); setTimeout(function(){ openMoodboardEditor('${mb.id}'); }, 500);" class="ml-hbtn ml-hbtn-red">\ud83d\udce4 Send to Client</button>` : `<span style="padding:6px 12px;background:#fff8e1;color:#f59e0b;border-radius:6px;font-size:11px;border:1px solid #fde68a;">Sent \u00b7 ${mb.status}</span>`}
</div>
</div>

            <!-- BODY -->
<div class="ml-body">
                <!-- LEFT SIDEBAR - Milanote-style wide toolbar with labels -->
<div class="ml-sidebar" id="mlSidebar">
<div class="ml-sb-section">Add to Board</div>

<div class="ml-sb-item" draggable="true" onclick="addMoodboardNote('${mb.id}')" ondragstart="mlDragStart(event,'note','${mb.id}')" ondragend="mlDragEnd(event)">
<div class="ml-sb-icon" style="background:#fff3cd;color:#d97706;">\ud83d\udcdd</div>
<div><div class="fw-600">Note</div><div class="text-muted-xs">Drag onto board or click</div></div>
</div>

<div class="ml-sb-item" onclick="document.getElementById('mbImageUpload').click()">
<div class="ml-sb-icon" style="background:#dbeafe;color:#2563eb;">\ud83d\uddbc</div>
<div><div class="fw-600">Image</div><div class="text-muted-xs">Upload from computer</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('imageUrl')">
<div class="ml-sb-icon" style="background:#dbeafe;color:#2563eb;">\ud83c\udf10</div>
<div><div class="fw-600">Image URL</div><div class="text-muted-xs">Paste a link</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('imageSearch')">
<div class="ml-sb-icon" style="background:#dbeafe;color:#2563eb;">\ud83d\udd0d</div>
<div><div class="fw-600">Search Photos</div><div class="text-muted-xs">Free stock images</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('link')">
<div class="ml-sb-icon" style="background:#e0e7ff;color:#4f46e5;">\ud83d\udd17</div>
<div><div class="fw-600">Link</div><div class="text-muted-xs">Web page preview</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('text')">
<div class="ml-sb-icon" style="background:#f3e8ff;color:#7c3aed;">T</div>
<div><div class="fw-600">Text</div><div class="text-muted-xs">Heading or label</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('color')">
<div class="ml-sb-icon" style="background:linear-gradient(135deg,#e63946,#f4a261,#2a9d8f);border-radius:50%;">&nbsp;</div>
<div><div class="fw-600">Color Swatch</div><div class="text-muted-xs">Palette builder</div></div>
</div>

<div class="ml-sb-item" onclick="mlShowPanel('video')">
<div class="ml-sb-icon" style="background:#fce7f3;color:#db2777;">\u25b6</div>
<div><div class="fw-600">Video</div><div class="text-muted-xs">YouTube / Vimeo</div></div>
</div>

<div class="ml-sb-sep"></div>
<div class="ml-sb-section">Templates</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','brand')">
<div class="ml-sb-icon" style="background:#fef2f2;color:#e63946;">\ud83c\udfa8</div>
<div><div class="fw-600">Brand Board</div><div class="text-muted-xs">Logo, colors, fonts</div></div>
</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','mood')">
<div class="ml-sb-icon" style="background:#ecfdf5;color:#059669;">\u2728</div>
<div><div class="fw-600">Mood Board</div><div class="text-muted-xs">Inspiration layout</div></div>
</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','ui')">
<div class="ml-sb-icon" style="background:#eff6ff;color:#2563eb;">\ud83d\udcf1</div>
<div><div class="fw-600">UI Design</div><div class="text-muted-xs">Screens + references</div></div>
</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','photo')">
<div class="ml-sb-icon" style="background:#fefce8;color:#ca8a04;">\ud83d\udcf7</div>
<div><div class="fw-600">Photography</div><div class="text-muted-xs">Visual direction</div></div>
</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','interior')">
<div class="ml-sb-icon" style="background:#f0fdf4;color:#16a34a;">\ud83c\udfe0</div>
<div><div class="fw-600">Interior Design</div><div class="text-muted-xs">Space + materials</div></div>
</div>

<div class="ml-sb-item" onclick="loadMbTemplate('${mb.id}','fashion')">
<div class="ml-sb-icon" style="background:#fdf2f8;color:#db2777;">\ud83d\udc57</div>
<div><div class="fw-600">Fashion</div><div class="text-muted-xs">Style + texture</div></div>
</div>

<div class="ml-sb-sep"></div>
<div class="ml-sb-section">Board</div>

<div class="ml-sb-item" onclick="mlShowPanel('settings')">
<div class="ml-sb-icon" style="background:#f5f5f5;color:#666;">\u2699</div>
<div><div class="fw-600">Settings</div><div class="text-muted-xs">Background, grid, notes</div></div>
</div>

                    <!-- Hidden file input -->
<input type="file" id="mbImageUpload" accept="image/*" multiple onchange="addMoodboardImages('${mb.id}')" class="hidden">
</div>

                <!-- CANVAS -->
<div class="ml-canvas-area" id="mbCanvasWrap"
                     onmousedown="mbEditorMouseDown(event)"
                     onmousemove="mbEditorMouseMove(event)"
                     onmouseup="mbEditorMouseUp(event)"
                     onmouseleave="mbEditorMouseUp(event)"
                     onwheel="mbEditorWheel(event)">

<div id="moodboardCanvas" class="ml-canvas" style="transform:scale(${_mbZoom}) translate(${_mbPanX}px,${_mbPanY}px);background:${bgColor};">
<div class="ml-grid" id="mbGrid" style="${_mbSnapOn ? '' : 'display:none'}"></div>
                        ${renderMoodboardItems(mb)}
</div>

                    <!-- Image URL quick-add (shows when clicking Image if no file selected) -->
<div class="ml-float" id="mlPanel-imageUrl">
<h4>Add Image</h4>
<input type="text" id="mbImageUrl" class="ml-finput" placeholder="Paste image URL and press Enter..." onkeydown="if(event.key==='Enter'){addMoodboardImageUrl('${mb.id}');mlHideAllPanels();}">
<button onclick="addMoodboardImageUrl('${mb.id}');mlHideAllPanels();" class="ml-fbtn">Add from URL</button>
<button onclick="document.getElementById('mbImageUpload').click();mlHideAllPanels();" class="ml-fbtn">Upload from Computer</button>
</div>

<div class="ml-float" id="mlPanel-imageSearch" style="width:320px;">
<h4>Search Free Photos</h4>
<div style="display:flex;gap:6px;margin-bottom:10px;">
<input type="text" id="mbPexelsQuery" class="ml-finput" style="margin:0;flex:1;" placeholder="Search photos..." onkeydown="if(event.key==='Enter') searchPexelsImages('${mb.id}')">
<button onclick="searchPexelsImages('${mb.id}')" class="ml-fbtn" style="width:auto;padding:8px 14px;margin:0;">Search</button>
</div>
<div id="mbPexelsResults" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:340px;overflow-y:auto;"></div>
<div style="font-size:9px;color:#bbb;margin-top:6px;text-align:center;">Photos by Pexels</div>
</div>

<div class="ml-float" id="mlPanel-link">
<h4>Add Link</h4>
<input type="text" id="mbLinkUrl" class="ml-finput" placeholder="Paste any URL..." onkeydown="if(event.key==='Enter'){addMoodboardLink('${mb.id}');mlHideAllPanels();}">
<button onclick="addMoodboardLink('${mb.id}');mlHideAllPanels();" class="ml-fbtn">Add Link Card</button>
</div>

<div class="ml-float" id="mlPanel-text">
<h4>Add Text</h4>
<input type="text" id="mbTextInput" class="ml-finput" placeholder="Type heading or label..." onkeydown="if(event.key==='Enter'){addMoodboardText('${mb.id}');mlHideAllPanels();}">
<select id="mbFontSelect" class="ml-finput">
<option value="Inter, sans-serif">Inter</option>
<option value="Georgia, serif">Georgia</option>
<option value="Playfair Display, serif">Playfair Display</option>
<option value="Montserrat, sans-serif">Montserrat</option>
</select>
<button onclick="addMoodboardText('${mb.id}');mlHideAllPanels();" class="ml-fbtn">Add Text</button>
</div>

<div class="ml-float" id="mlPanel-color">
<h4>Add Color Swatch</h4>
<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
<input type="color" id="mbColorPicker" value="#e63946" style="width:40px;height:36px;border:none;cursor:pointer;">
<button onclick="addMoodboardColor('${mb.id}');mlHideAllPanels();" class="ml-fbtn" style="margin:0;flex:1;">Add</button>
</div>
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;">
                            ${['#e63946','#264653','#2a9d8f','#e9c46a','#f4a261','#e76f51','#1d3557','#457b9d','#a8dadc','#606c38','#dda15e','#bc6c25'].map(c => `<div onclick="document.getElementById('mbColorPicker').value='${c}';addMoodboardColor('${mb.id}');mlHideAllPanels();" style="width:100%;aspect-ratio:1;background:${c};border-radius:50%;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.15);"></div>`).join('')}
</div>
</div>

<div class="ml-float" id="mlPanel-video">
<h4>Add Video</h4>
<input type="text" id="mbVideoUrl" class="ml-finput" placeholder="YouTube or Vimeo URL..." onkeydown="if(event.key==='Enter'){addMoodboardVideo('${mb.id}');mlHideAllPanels();}">
<button onclick="addMoodboardVideo('${mb.id}');mlHideAllPanels();" class="ml-fbtn">Add Video</button>
</div>

<div class="ml-float" id="mlPanel-settings">
<h4>Board Settings</h4>
<label style="font-size:11px;color:#888;display:block;margin-bottom:4px;">Background</label>
<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
<input type="color" id="mbCanvasBg" value="${bgColor}" onchange="updateCanvasBackground('${mb.id}',this.value)" style="width:32px;height:32px;border:none;cursor:pointer;">
                            ${['#f5f5f5','#ffffff','#f5f0e8','#fafafa','#1a1a1a','#111111'].map(c => `<div onclick="updateCanvasBackground('${mb.id}','${c}')" style="width:32px;height:32px;background:${c};border-radius:4px;cursor:pointer;border:1px solid #ddd;"></div>`).join('')}
</div>
<label style="font-size:11px;color:#888;display:block;margin-bottom:4px;">Grid</label>
<button onclick="_mbSnapOn=!_mbSnapOn;document.getElementById('mbGrid').style.display=_mbSnapOn?'':'none';this.textContent=_mbSnapOn?'Grid: ON':'Grid: OFF'" class="ml-fbtn">${_mbSnapOn ? 'Grid: ON' : 'Grid: OFF'}</button>
<label style="font-size:11px;color:#888;display:block;margin-bottom:4px;margin-top:8px;">Board Notes</label>
<textarea id="mbNotes" class="ml-finput" style="min-height:80px;resize:vertical;">${mb.notes || ''}</textarea>
<button onclick="clearMoodboardStorage('${mb.id}')" class="ml-fbtn" style="color:#e63946;margin-top:4px;">Clear Old Image Data</button>
</div>

                    <!-- Selected item controls -->
<div class="ml-float" id="mlPanel-selected" style="top:auto;bottom:44px;">
<h4>Selected Item</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
<button onclick="resizeMbItem(1.15)" class="ml-fbtn">+ Bigger</button>
<button onclick="resizeMbItem(0.85)" class="ml-fbtn">\u2212 Smaller</button>
<button onclick="bringMbItemForward()" class="ml-fbtn">\u2191 Forward</button>
<button onclick="sendMbItemBackward()" class="ml-fbtn">\u2193 Backward</button>
<button onclick="rotateMbItem(15)" class="ml-fbtn">\u21bb Rotate</button>
<button onclick="rotateMbItem(-15)" class="ml-fbtn">\u21ba Rotate</button>
</div>
<button onclick="deleteMbItem()" class="ml-fbtn" style="color:#e63946;border-color:#fecaca;margin-top:6px;">Delete Item</button>
</div>
</div>
</div>

            <!-- FOOTER -->
<div class="ml-foot">
<div>${mb.collageItems.length} items \u00b7 ${client?.name || ''}</div>
<div style="display:flex;align-items:center;gap:6px;">
<button class="ml-zbtn" onclick="mbSetZoom(_mbZoom-0.1)">\u2212</button>
<span id="mbZoomLevel" style="min-width:36px;text-align:center;">${Math.round(_mbZoom*100)}%</span>
<button class="ml-zbtn" onclick="mbSetZoom(_mbZoom+0.1)">+</button>
<button class="ml-zbtn" onclick="mbSetZoom(1);_mbPanX=0;_mbPanY=0;mbUpdateTransform();" style="width:auto;padding:0 8px;font-size:10px;">Reset</button>
<span style="color:#ccc;margin:0 6px;">|</span>
<span style="color:#bbb;font-size:10px;">Space+Drag to pan \u00b7 Scroll to zoom</span>
</div>
</div>
</div>
    `;

    document.removeEventListener('keydown', mbKeyDown);
    document.removeEventListener('keyup', mbKeyUp);
    document.addEventListener('keydown', mbKeyDown);
    document.addEventListener('keyup', mbKeyUp);
    setTimeout(resolveAllImages, 50);
}

// Panel management
// Drag from sidebar onto canvas
var _mlDragType = null;
var _mlDragMbId = null;

function mlDragStart(e, type, mbId) {
    _mlDragType = type;
    _mlDragMbId = mbId;
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
    // Set a small drag image
    var ghost = document.createElement('div');
    ghost.textContent = type === 'note' ? 'Note' : type === 'color' ? 'Color' : type;
    ghost.style.cssText = 'padding:6px 12px;background:#fff;border-radius:6px;font-size:12px;font-weight:600;color:#333;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:absolute;top:-100px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 30, 15);
    setTimeout(function(){ ghost.remove(); }, 0);
}

function mlDragEnd(e) {
    _mlDragType = null;
    _mlDragMbId = null;
}

// Enable drop on canvas
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('dragover', function(e) {
        var wrap = document.getElementById('mbCanvasWrap');
        if (wrap && wrap.contains(e.target)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    });
    document.addEventListener('drop', function(e) {
        var wrap = document.getElementById('mbCanvasWrap');
        if (!wrap || !wrap.contains(e.target)) return;
        e.preventDefault();
        if (!_mlDragType || !_mlDragMbId) return;

        var mb = proofs.find(function(p){return p.id == _mlDragMbId;});
        if (!mb) return;

        // Calculate drop position on canvas
        var rect = document.getElementById('moodboardCanvas').getBoundingClientRect();
        var dropX = (e.clientX - rect.left) / _mbZoom;
        var dropY = (e.clientY - rect.top) / _mbZoom;
        dropX = snapVal(dropX);
        dropY = snapVal(dropY);

        if (_mlDragType === 'note') {
            mb.collageItems.push({
                type:'note', title:'', body:'', stripColor:'#e9c46a',
                x:dropX, y:dropY, width:260, height:160, rotation:0,
                zIndex:mb.collageItems.length+1
            });
        }

        _mlDragType = null;
        _mlDragMbId = null;
        mb.updatedAt = new Date().toISOString();
        saveProofs();
        openMoodboardEditor(mb.id);
    });
});

function mlShowPanel(name) {
    mlHideAllPanels();
    var p = document.getElementById('mlPanel-' + name);
    if (p) p.classList.add('show');
}
function mlHideAllPanels() {
    document.querySelectorAll('.ml-float').forEach(function(p) {
        if (p.id !== 'mlPanel-selected') p.classList.remove('show');
    });
}

// Keyboard
function mbKeyDown(e) {
    if (e.code === 'Space' && !e.target.matches('input,textarea,[contenteditable]')) {
        e.preventDefault(); _mbSpaceHeld = true;
        var w = document.getElementById('mbCanvasWrap');
        if (w) w.classList.add('panning');
    }
    if ((e.code === 'Delete' || e.code === 'Backspace') && !e.target.matches('input,textarea,[contenteditable]')) {
        if (window._mbEditorState && window._mbEditorState.selectedItem != null) {
            e.preventDefault(); deleteMbItem();
        }
    }
}
function mbKeyUp(e) {
    if (e.code === 'Space') {
        _mbSpaceHeld = false;
        var w = document.getElementById('mbCanvasWrap');
        if (w) w.classList.remove('panning');
    }
}

// Zoom
function mbSetZoom(z) {
    _mbZoom = Math.max(0.15, Math.min(3, z));
    mbUpdateTransform();
    var l = document.getElementById('mbZoomLevel');
    if (l) l.textContent = Math.round(_mbZoom*100)+'%';
}
function mbUpdateTransform() {
    var c = document.getElementById('moodboardCanvas');
    if (c) c.style.transform = 'scale('+_mbZoom+') translate('+_mbPanX+'px,'+_mbPanY+'px)';
}
function mbEditorWheel(e) {
    e.preventDefault();
    mbSetZoom(_mbZoom + (e.deltaY > 0 ? -0.08 : 0.08));
}

// Mouse handlers
function mbEditorMouseDown(e) {
    // Pan
    if (_mbSpaceHeld || e.button === 1) {
        _mbIsPanning = true;
        _mbPanStart = { x: e.clientX, y: e.clientY };
        _mbPanStartOff = { x: _mbPanX, y: _mbPanY };
        e.preventDefault(); return;
    }

    // Resize handle (SE corner)
    var rz = e.target.closest('.ml-rz');
    if (rz) {
        var card = rz.closest('.ml-card');
        if (card) {
            var idx = parseInt(card.dataset.idx);
            _mbResizing = true; _mbResizeIdx = idx;
            _mbResizeStart = { x: e.clientX, y: e.clientY };
            var mb = proofs.find(function(p){return p.id==window._mbEditorState.id;});
            if (mb && mb.collageItems[idx]) {
                var ci = mb.collageItems[idx];
                _mbResizeItemStart = { w: ci.width||240, h: ci.height||180 };
            }
            e.preventDefault(); return;
        }
    }

    // Click card to select + start drag
    var card = e.target.closest('.ml-card');
    if (card) {
        if (e.target.matches('input,textarea,[contenteditable]')) return;
        var idx = parseInt(card.dataset.idx);
        window._mbEditorState.selectedItem = idx;
        _mbDragging = true; _mbDragIdx = idx;
        _mbDragStart = { x: e.clientX, y: e.clientY };
        var mb = proofs.find(function(p){return p.id==window._mbEditorState.id;});
        if (mb && mb.collageItems[idx]) {
            _mbItemStart = { x: mb.collageItems[idx].x||0, y: mb.collageItems[idx].y||0 };
        }
        document.querySelectorAll('.ml-card').forEach(function(c){c.classList.remove('sel');c.style.opacity='';});
        card.classList.add('sel');
        card.style.opacity='0.85';
        var sp = document.getElementById('mlPanel-selected');
        if (sp) sp.classList.add('show');
        e.preventDefault(); return;
    }

    // Deselect
    document.querySelectorAll('.ml-card').forEach(function(c){c.classList.remove('sel');});
    window._mbEditorState.selectedItem = null;
    var sp = document.getElementById('mlPanel-selected');
    if (sp) sp.classList.remove('show');
    mlHideAllPanels();
}

function mbEditorMouseMove(e) {
    if (_mbIsPanning) {
        _mbPanX = _mbPanStartOff.x + (e.clientX-_mbPanStart.x)/_mbZoom;
        _mbPanY = _mbPanStartOff.y + (e.clientY-_mbPanStart.y)/_mbZoom;
        mbUpdateTransform(); return;
    }
    if (_mbResizing && _mbResizeIdx >= 0) {
        var mb = proofs.find(function(p){return p.id==window._mbEditorState.id;});
        if (!mb||!mb.collageItems[_mbResizeIdx]) return;
        var ci = mb.collageItems[_mbResizeIdx];
        var dx = (e.clientX-_mbResizeStart.x)/_mbZoom;
        var dy = (e.clientY-_mbResizeStart.y)/_mbZoom;
        ci.width = Math.max(60, snapVal(_mbResizeItemStart.w+dx));
        ci.height = Math.max(40, snapVal(_mbResizeItemStart.h+dy));
        var el = document.querySelector('.ml-card[data-idx="'+_mbResizeIdx+'"]');
        if (el) { el.style.width=ci.width+'px'; if(ci.type!=='note') el.style.height=ci.height+'px'; }
        return;
    }
    if (_mbDragging && _mbDragIdx >= 0) {
        var mb = proofs.find(function(p){return p.id==window._mbEditorState.id;});
        if (!mb||!mb.collageItems[_mbDragIdx]) return;
        var dx = (e.clientX-_mbDragStart.x)/_mbZoom;
        var dy = (e.clientY-_mbDragStart.y)/_mbZoom;
        mb.collageItems[_mbDragIdx].x = snapVal(_mbItemStart.x+dx);
        mb.collageItems[_mbDragIdx].y = snapVal(_mbItemStart.y+dy);
        var el = document.querySelector('.ml-card[data-idx="'+_mbDragIdx+'"]');
        if (el) {
            var ci = mb.collageItems[_mbDragIdx];
            el.style.transform='translate('+ci.x+'px,'+ci.y+'px) rotate('+(ci.rotation||0)+'deg)';
        }
    }
}

function mbEditorMouseUp(e) {
    if (_mbIsPanning) { _mbIsPanning=false; return; }
    if (_mbResizing) {
        _mbResizing=false; _mbResizeIdx=-1;
        var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
        if(mb){mb.updatedAt=new Date().toISOString();saveProofs();}
        return;
    }
    if (_mbDragging) {
        var dragEl=document.querySelector('.ml-card[data-idx="'+_mbDragIdx+'"]');
        if(dragEl) dragEl.style.opacity='';
        _mbDragging=false; _mbDragIdx=-1;
        var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
        if(mb){mb.updatedAt=new Date().toISOString();saveProofs();}
    }
}

// RENDER ITEMS - Milanote-style cards
function renderMoodboardItems(mb, isPreview) {
    return (mb.collageItems||[]).map(function(item, idx) {
        var tx = 'translate('+(item.x||0)+'px,'+(item.y||0)+'px) rotate('+(item.rotation||0)+'deg)';
        var w = item.width || 240;
        var z = item.zIndex || idx+1;
        var sel = (!isPreview && window._mbEditorState && window._mbEditorState.selectedItem===idx) ? ' sel':'';
        var rz = isPreview ? '' : '<div class="ml-rz ml-rz-se"></div>';

        if (item.type === 'image') {
            var isIdb = item.src && item.src.startsWith('idb://');
            // Show full image at natural aspect ratio
            return '<div class="ml-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+w+'px;z-index:'+z+';padding:0;overflow:hidden;">'+
                rz+
                '<div class="ml-img-wrap">'+
                    '<img alt="Moodboard item" loading="lazy" src="'+(isIdb?'':escHtml(item.src))+'" data-idb-src="'+escHtml(item.src||'')+'" style="width:100%;display:block;'+(isIdb?'min-height:120px;background:#f0f0f0;':'')+'">'+
                '</div>'+
                (isPreview ? (item.caption ? '<div style="padding:8px 12px;font-size:12px;color:#555;">'+escHtml(item.caption)+'</div>' : '') :
                '<textarea class="ml-img-caption" placeholder="Add a caption..." onclick="event.stopPropagation()" onchange="mbUpdateCaption('+idx+',this.value)">'+escHtml(item.caption||'')+'</textarea>')+
            '</div>';

        } else if (item.type === 'note') {
            var stripColor = escCss(item.stripColor || '#e9c46a');
            if (isPreview) {
                return '<div class="ml-card ml-note" style="transform:'+tx+';width:'+w+'px;z-index:'+z+';padding:0;">'+
                    '<div class="ml-note-strip" style="background:'+stripColor+';"></div>'+
                    '<div style="padding:12px 14px 4px;font-size:15px;font-weight:600;color:#1a1a1a;">'+escHtml(item.title||'Untitled')+'</div>'+
                    '<div style="padding:4px 14px 12px;font-size:13px;color:#555;line-height:1.6;">'+escHtml(item.body||'')+'</div>'+
                '</div>';
            }
            return '<div class="ml-card ml-note'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+w+'px;z-index:'+z+';padding:0;">'+
                rz+
                '<div class="ml-note-strip" style="background:'+stripColor+';" onclick="event.stopPropagation();mbCycleNoteColor('+idx+')"></div>'+
                '<div class="ml-note-handle" title="Drag to move"></div>'+
                '<input class="ml-note-title" value="'+escHtml(item.title||'')+'" placeholder="Title" onchange="mbUpdateNote('+idx+',\'title\',this.value)" onclick="event.stopPropagation()">'+
                '<textarea class="ml-note-body" placeholder="Write something..." onchange="mbUpdateNote('+idx+',\'body\',this.value)" onclick="event.stopPropagation()" oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\'">'+escHtml(item.body||'')+'</textarea>'+
            '</div>';

        } else if (item.type === 'link') {
            var domain='';
            try{domain=new URL(item.url).hostname.replace('www.','');}catch(e){domain=item.url||'';}
            return '<div class="ml-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+w+'px;z-index:'+z+';padding:0;overflow:hidden;">'+
                rz+
                '<div class="ml-link-domain">'+
                    '<img alt="Website favicon" loading="lazy" src="https://www.google.com/s2/favicons?domain='+escHtml(domain)+'&sz=32" style="width:14px;height:14px;border-radius:2px;" onerror="this.style.display=\'none\'">'+
                    '<span>'+escHtml(domain)+'</span>'+
                '</div>'+
                '<div class="ml-link-title">'+escHtml(item.title||item.url)+'</div>'+
                '<div class="ml-link-url"><a href="'+escHtml(item.url||'')+'" target="_blank" onclick="event.stopPropagation()">'+escHtml(item.url||'')+'</a></div>'+
            '</div>';

        } else if (item.type === 'color') {
            return '<div class="ml-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+(item.width||80)+'px;z-index:'+z+';padding:0;overflow:hidden;">'+
                rz+
                '<div class="ml-swatch-color" style="background:'+escCss(item.color)+';"></div>'+
                '<div class="ml-swatch-label">'+escHtml(item.color)+'</div>'+
            '</div>';

        } else if (item.type === 'text') {
            return '<div class="ml-card ml-text-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';z-index:'+z+';padding:12px 16px;">'+
                rz+
                '<div style="font-family:'+escCss(item.font||'Inter,sans-serif')+';font-size:'+(parseInt(item.fontSize)||28)+'px;color:'+escCss(item.color||'#1a1a1a')+';white-space:nowrap;font-weight:700;">'+escHtml(item.text)+'</div>'+
            '</div>';

        } else if (item.type === 'texture') {
            return '<div class="ml-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+w+'px;height:'+(item.height||150)+'px;z-index:'+z+';padding:0;overflow:hidden;">'+
                rz+
                '<div style="width:100%;height:100%;background:'+escCss(item.pattern)+';border-radius:6px;"></div>'+
            '</div>';

        } else if (item.type === 'video') {
            return '<div class="ml-card'+sel+'" data-idx="'+idx+'" style="transform:'+tx+';width:'+(item.width||320)+'px;height:'+(item.height||220)+'px;z-index:'+z+';padding:0;overflow:hidden;">'+
                rz+
                '<div style="width:100%;height:calc(100% - 32px);position:relative;">'+
                    '<iframe src="'+escHtml(item.embedUrl)+'" style="width:100%;height:100%;border:none;pointer-events:none;" allowfullscreen></iframe>'+
                    '<div style="position:absolute;top:0;left:0;right:0;bottom:0;cursor:move;"></div>'+
                '</div>'+
                '<div style="height:32px;display:flex;align-items:center;padding:0 12px;font-size:11px;color:#888;border-top:1px solid #eee;">\u25b6 '+escHtml(item.title||'Video')+'</div>'+
            '</div>';
        }
        return '';
    }).join('');
}

// Update helpers
function mbUpdateNote(idx, field, value) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    if(!mb||!mb.collageItems[idx]) return;
    mb.collageItems[idx][field] = value;
    mb.updatedAt=new Date().toISOString(); saveProofs();
}

function mbUpdateCaption(idx, value) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    if(!mb||!mb.collageItems[idx]) return;
    mb.collageItems[idx].caption = value;
    mb.updatedAt=new Date().toISOString(); saveProofs();
}

var _noteColors = ['#e9c46a','#e63946','#4a90d9','#2a9d8f','#7c3aed','#f4a261','#606c38','#264653'];
function mbCycleNoteColor(idx) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    if(!mb||!mb.collageItems[idx]) return;
    var current = mb.collageItems[idx].stripColor||'#e9c46a';
    var ci = _noteColors.indexOf(current);
    mb.collageItems[idx].stripColor = _noteColors[(ci+1)%_noteColors.length];
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

// Add items
function addMoodboardNote(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    mb.collageItems.push({
        type:'note', title:'', body:'', stripColor:'#e9c46a',
        x:100+Math.random()*200, y:100+Math.random()*200,
        width:260, height:160, rotation:0, zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

function addMoodboardLink(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var url=(document.getElementById('mbLinkUrl')?.value||'').trim();
    if(!url){alert('Paste a URL first.');return;}
    if(!url.startsWith('http')) url='https://'+url;
    var domain='',title='';
    try{domain=new URL(url).hostname.replace('www.','');title=domain;}catch(e){title=url;}
    mb.collageItems.push({
        type:'link', url:url, title:title, description:'',
        x:100+Math.random()*200, y:100+Math.random()*200,
        width:280, rotation:0, zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

function addMoodboardImages(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var files=document.getElementById('mbImageUpload').files;
    if(!files.length){
        // No file selected — show URL panel instead
        mlShowPanel('imageUrl');
        return;
    }
    var loaded=0, total=files.length;
    if(typeof showNotification==='function') showNotification('Uploading '+total+' image(s)...','info');

    Array.from(files).forEach(function(file, i) {
        var reader=new FileReader();
        reader.onload=async function(e) {
            // Get natural image dimensions for proper aspect ratio
            var img=new Image();
            img.onload=async function() {
                var natW=img.naturalWidth, natH=img.naturalHeight;
                var cardW=280; // default card width
                var cardH=Math.round(cardW*(natH/natW)); // maintain aspect ratio

                var imgRef;
                try {
                    var compressed=await compressImage(e.target.result, 1200, 0.75);
                    imgRef=await NuiImageStore.saveImage('moodboard', compressed);
                } catch(err) {
                    try{imgRef=await compressImage(e.target.result, 600, 0.6);}catch(e2){imgRef=e.target.result;}
                }
                mb.collageItems.push({
                    type:'image', src:imgRef, caption:'',
                    x:60+(i*40), y:60+(i*40),
                    width:cardW, height:cardH, rotation:0,
                    zIndex:mb.collageItems.length+1
                });
                loaded++;
                if(loaded===total) {
                    mb.updatedAt=new Date().toISOString(); saveProofs();
                    openMoodboardEditor(mb.id);
                    if(typeof showNotification==='function') showNotification(total+' image(s) added!','success');
                }
            };
            img.src=e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function addMoodboardImageUrl(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    var url=(document.getElementById('mbImageUrl')?.value||'').trim();
    if(!mb||!url) return;
    // Try to load image to get natural dimensions
    var img=new Image();
    img.crossOrigin='anonymous';
    img.onload=function(){
        var cardW=280, cardH=Math.round(cardW*(img.naturalHeight/img.naturalWidth));
        mb.collageItems.push({
            type:'image', src:url, caption:'',
            x:60+Math.random()*100, y:60+Math.random()*100,
            width:cardW, height:cardH, rotation:0,
            zIndex:mb.collageItems.length+1
        });
        mb.updatedAt=new Date().toISOString(); saveProofs();
        openMoodboardEditor(mb.id);
    };
    img.onerror=function(){
        // If can't load (CORS), use default dimensions
        mb.collageItems.push({
            type:'image', src:url, caption:'',
            x:60+Math.random()*100, y:60+Math.random()*100,
            width:280, height:200, rotation:0,
            zIndex:mb.collageItems.length+1
        });
        mb.updatedAt=new Date().toISOString(); saveProofs();
        openMoodboardEditor(mb.id);
    };
    img.src=url;
}

function addMoodboardColor(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var color=document.getElementById('mbColorPicker')?.value||'#e63946';
    mb.collageItems.push({
        type:'color', color:color,
        x:60+Math.random()*200, y:60+Math.random()*200,
        width:80, height:100, rotation:0,
        zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

function addMoodboardText(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var text=(document.getElementById('mbTextInput')?.value||'').trim();
    var font=document.getElementById('mbFontSelect')?.value||'Inter, sans-serif';
    if(!text){alert('Enter text first.');return;}
    mb.collageItems.push({
        type:'text', text:text, font:font, fontSize:28, color:'#1a1a1a',
        x:100+Math.random()*100, y:100+Math.random()*100,
        rotation:0, zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

function addMoodboardVideo(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var rawUrl=(document.getElementById('mbVideoUrl')?.value||'').trim();
    if(!rawUrl){alert('Paste a video URL first.');return;}
    var embedUrl='', title='Video';
    var ytMatch=rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if(ytMatch){embedUrl='https://www.youtube.com/embed/'+ytMatch[1]+'?rel=0';title='YouTube Video';}
    if(!embedUrl){var vmMatch=rawUrl.match(/(?:vimeo\.com\/)(\d+)/);if(vmMatch){embedUrl='https://player.vimeo.com/video/'+vmMatch[1];title='Vimeo Video';}}
    if(!embedUrl&&(rawUrl.includes('youtube.com/embed/')||rawUrl.includes('player.vimeo.com/'))){embedUrl=rawUrl;}
    if(!embedUrl){alert('Please paste a valid YouTube or Vimeo URL.');return;}
    mb.collageItems.push({
        type:'video', embedUrl:embedUrl, originalUrl:rawUrl, title:title,
        x:60+Math.random()*100, y:60+Math.random()*100,
        width:360, height:240, rotation:0,
        zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

function addMoodboardTexture(mbId, pattern) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var patterns={
        'dots':'radial-gradient(circle, #ffffff30 1px, transparent 1px); background-size: 8px 8px',
        'lines':'repeating-linear-gradient(45deg, transparent, transparent 5px, #ffffff15 5px, #ffffff15 6px)',
        'grid':'linear-gradient(#ffffff15 1px, transparent 1px), linear-gradient(90deg, #ffffff15 1px, transparent 1px); background-size: 10px 10px',
        'gradient1':'linear-gradient(135deg, #e63946, #ff6b6b)',
        'gradient2':'linear-gradient(135deg, #457b9d, #1d3557)',
        'gradient3':'linear-gradient(135deg, #2a9d8f, #264653)'
    };
    mb.collageItems.push({
        type:'texture', pattern:patterns[pattern]||patterns.dots,
        x:80+Math.random()*150, y:80+Math.random()*150,
        width:200, height:150, rotation:0,
        zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
}

// Templates
function loadMbTemplate(mbId, tplName) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    if(mb.collageItems.length>0 && !confirm('This will replace your current board. Continue?')) return;

    if(tplName==='brand') {
        mb.canvasBackground='#f5f5f5';
        mb.collageItems=[
            {type:'text',text:'Brand Guidelines',font:'Playfair Display, serif',fontSize:36,color:'#1a1a1a',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Brand Story',body:'Write your brand narrative here...',stripColor:'#e63946',x:60,y:120,width:300,height:160,rotation:0,zIndex:2},
            {type:'note',title:'Typography',body:'Primary: [Font Name]\nSecondary: [Font Name]\nBody: [Font Name]',stripColor:'#264653',x:380,y:120,width:260,height:160,rotation:0,zIndex:3},
            {type:'text',text:'Color Palette',font:'Inter, sans-serif',fontSize:20,color:'#666',x:60,y:320,rotation:0,zIndex:4},
            {type:'color',color:'#e63946',x:60,y:370,width:80,height:100,rotation:0,zIndex:5},
            {type:'color',color:'#264653',x:160,y:370,width:80,height:100,rotation:0,zIndex:6},
            {type:'color',color:'#2a9d8f',x:260,y:370,width:80,height:100,rotation:0,zIndex:7},
            {type:'color',color:'#e9c46a',x:360,y:370,width:80,height:100,rotation:0,zIndex:8},
            {type:'color',color:'#f4a261',x:460,y:370,width:80,height:100,rotation:0,zIndex:9},
            {type:'note',title:'Logo Usage',body:'Place your logo variations here.\nPrimary, secondary, icon-only.',stripColor:'#4a90d9',x:60,y:500,width:300,height:140,rotation:0,zIndex:10},
            {type:'note',title:'Brand Voice',body:'Tone: Professional yet approachable\nStyle: Modern, clean, confident',stripColor:'#2a9d8f',x:380,y:500,width:260,height:140,rotation:0,zIndex:11},
            {type:'text',text:'Imagery & Photography',font:'Inter, sans-serif',fontSize:20,color:'#666',x:60,y:680,rotation:0,zIndex:12},
            {type:'note',title:'Photo Style',body:'Add reference images that capture the brand aesthetic.',stripColor:'#f4a261',x:60,y:730,width:580,height:100,rotation:0,zIndex:13}
        ];
    } else if(tplName==='mood') {
        mb.canvasBackground='#f0ede8';
        mb.collageItems=[
            {type:'text',text:'Moodboard',font:'Playfair Display, serif',fontSize:42,color:'#1a1a1a',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Concept',body:'Describe the feeling, atmosphere, and direction...',stripColor:'#e9c46a',x:60,y:120,width:300,height:140,rotation:0,zIndex:2},
            {type:'text',text:'Inspiration Images',font:'Inter, sans-serif',fontSize:18,color:'#888',x:60,y:300,rotation:0,zIndex:3},
            {type:'note',title:'Add images here',body:'Upload photos or paste URLs from the sidebar to build your visual mood.',stripColor:'#4a90d9',x:60,y:350,width:280,height:120,rotation:0,zIndex:4},
            {type:'text',text:'Color Direction',font:'Inter, sans-serif',fontSize:18,color:'#888',x:380,y:300,rotation:0,zIndex:5},
            {type:'color',color:'#264653',x:380,y:350,width:70,height:90,rotation:0,zIndex:6},
            {type:'color',color:'#2a9d8f',x:470,y:350,width:70,height:90,rotation:0,zIndex:7},
            {type:'color',color:'#e9c46a',x:560,y:350,width:70,height:90,rotation:0,zIndex:8},
            {type:'note',title:'References & Links',body:'Add web links to reference sites...',stripColor:'#7c3aed',x:380,y:480,width:250,height:120,rotation:0,zIndex:9}
        ];
    } else if(tplName==='ui') {
        mb.canvasBackground='#f8f9fa';
        mb.collageItems=[
            {type:'text',text:'UI Design References',font:'Inter, sans-serif',fontSize:32,color:'#1a1a1a',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Design System',body:'Components, patterns, and reusable elements.',stripColor:'#4a90d9',x:60,y:110,width:280,height:140,rotation:0,zIndex:2},
            {type:'note',title:'Screen Flows',body:'Add screenshots and wireframes here.',stripColor:'#2a9d8f',x:360,y:110,width:280,height:140,rotation:0,zIndex:3},
            {type:'text',text:'Typography Scale',font:'Inter, sans-serif',fontSize:18,color:'#888',x:60,y:290,rotation:0,zIndex:4},
            {type:'note',title:'Type Hierarchy',body:'H1: 32px Bold\nH2: 24px Semi\nBody: 16px Regular\nCaption: 12px',stripColor:'#264653',x:60,y:340,width:240,height:160,rotation:0,zIndex:5},
            {type:'text',text:'Color Tokens',font:'Inter, sans-serif',fontSize:18,color:'#888',x:360,y:290,rotation:0,zIndex:6},
            {type:'color',color:'#2563eb',x:360,y:340,width:70,height:90,rotation:0,zIndex:7},
            {type:'color',color:'#1a1a1a',x:450,y:340,width:70,height:90,rotation:0,zIndex:8},
            {type:'color',color:'#f5f5f5',x:540,y:340,width:70,height:90,rotation:0,zIndex:9},
            {type:'note',title:'Interaction Patterns',body:'Add links to reference apps and sites.',stripColor:'#7c3aed',x:60,y:540,width:580,height:100,rotation:0,zIndex:10}
        ];
    } else if(tplName==='photo') {
        mb.canvasBackground='#1a1a1a';
        mb.collageItems=[
            {type:'text',text:'Photography Direction',font:'Playfair Display, serif',fontSize:36,color:'#ffffff',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Shot List',body:'1. Hero shot\n2. Detail close-ups\n3. Environment/context\n4. Lifestyle/in-use\n5. Behind-the-scenes',stripColor:'#e9c46a',x:60,y:120,width:280,height:200,rotation:0,zIndex:2},
            {type:'note',title:'Mood & Lighting',body:'Direction: Natural / Studio / Dramatic\nLighting: Soft / Hard / Golden hour\nPost-processing: Clean / Moody / Film',stripColor:'#4a90d9',x:360,y:120,width:280,height:200,rotation:0,zIndex:3},
            {type:'text',text:'Reference Images',font:'Inter, sans-serif',fontSize:20,color:'#888',x:60,y:360,rotation:0,zIndex:4},
            {type:'note',title:'Add reference photos here',body:'Upload images or search free photos from the sidebar.',stripColor:'#2a9d8f',x:60,y:410,width:580,height:100,rotation:0,zIndex:5},
            {type:'text',text:'Color Grading',font:'Inter, sans-serif',fontSize:20,color:'#888',x:60,y:550,rotation:0,zIndex:6},
            {type:'color',color:'#2c1810',x:60,y:600,width:70,height:90,rotation:0,zIndex:7},
            {type:'color',color:'#d4a574',x:150,y:600,width:70,height:90,rotation:0,zIndex:8},
            {type:'color',color:'#f5e6d3',x:240,y:600,width:70,height:90,rotation:0,zIndex:9}
        ];
    } else if(tplName==='interior') {
        mb.canvasBackground='#f5f0e8';
        mb.collageItems=[
            {type:'text',text:'Interior Concept',font:'Playfair Display, serif',fontSize:36,color:'#1a1a1a',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Space Overview',body:'Room: \nDimensions: \nStyle: Modern / Traditional / Eclectic\nBudget: ',stripColor:'#264653',x:60,y:120,width:280,height:180,rotation:0,zIndex:2},
            {type:'note',title:'Materials & Finishes',body:'Flooring: \nWalls: \nCountertops: \nHardware: ',stripColor:'#2a9d8f',x:360,y:120,width:280,height:180,rotation:0,zIndex:3},
            {type:'text',text:'Color Palette',font:'Inter, sans-serif',fontSize:20,color:'#666',x:60,y:340,rotation:0,zIndex:4},
            {type:'color',color:'#d4c5a9',x:60,y:390,width:70,height:90,rotation:0,zIndex:5},
            {type:'color',color:'#8b7355',x:150,y:390,width:70,height:90,rotation:0,zIndex:6},
            {type:'color',color:'#2f4f4f',x:240,y:390,width:70,height:90,rotation:0,zIndex:7},
            {type:'color',color:'#f5f0e8',x:330,y:390,width:70,height:90,rotation:0,zIndex:8},
            {type:'note',title:'Furniture & Fixtures',body:'Add product images and links here.',stripColor:'#e9c46a',x:60,y:520,width:280,height:120,rotation:0,zIndex:9},
            {type:'note',title:'Inspiration',body:'Add reference images of spaces you love.',stripColor:'#f4a261',x:360,y:520,width:280,height:120,rotation:0,zIndex:10}
        ];
    } else if(tplName==='fashion') {
        mb.canvasBackground='#fafafa';
        mb.collageItems=[
            {type:'text',text:'Fashion Moodboard',font:'Playfair Display, serif',fontSize:36,color:'#1a1a1a',x:60,y:40,rotation:0,zIndex:1},
            {type:'note',title:'Collection Theme',body:'Season: \nTheme: \nTarget audience: \nKey pieces: ',stripColor:'#db2777',x:60,y:120,width:280,height:180,rotation:0,zIndex:2},
            {type:'note',title:'Fabric & Texture',body:'Add fabric swatches and texture references.',stripColor:'#7c3aed',x:360,y:120,width:280,height:180,rotation:0,zIndex:3},
            {type:'text',text:'Color Story',font:'Inter, sans-serif',fontSize:20,color:'#666',x:60,y:340,rotation:0,zIndex:4},
            {type:'color',color:'#1a1a1a',x:60,y:390,width:70,height:90,rotation:0,zIndex:5},
            {type:'color',color:'#8b0000',x:150,y:390,width:70,height:90,rotation:0,zIndex:6},
            {type:'color',color:'#f5f5dc',x:240,y:390,width:70,height:90,rotation:0,zIndex:7},
            {type:'color',color:'#c0a080',x:330,y:390,width:70,height:90,rotation:0,zIndex:8},
            {type:'note',title:'Styling References',body:'Add lookbook images and styling ideas.',stripColor:'#e63946',x:60,y:520,width:580,height:100,rotation:0,zIndex:9},
            {type:'text',text:'Silhouettes & Shapes',font:'Inter, sans-serif',fontSize:20,color:'#666',x:60,y:660,rotation:0,zIndex:10},
            {type:'note',title:'Key Silhouettes',body:'Sketch or describe the key shapes for this collection.',stripColor:'#264653',x:60,y:710,width:580,height:100,rotation:0,zIndex:11}
        ];
    }

    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
    if(typeof showNotification==='function') showNotification('Template loaded!','success');
}

// Pexels image search
function searchPexelsImages(mbId) {
    var query=(document.getElementById('mbPexelsQuery')?.value||'').trim();
    if(!query){alert('Enter a search term.');return;}
    var resultsDiv=document.getElementById('mbPexelsResults');
    if(!resultsDiv) return;
    resultsDiv.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:#999;">Searching...</div>';

    // Use Pexels API via backend proxy (key stored server-side)
    fetch('/.netlify/functions/pexels-search?query='+encodeURIComponent(query))
    .then(function(r){return r.json();})
    .then(function(data) {
        if(!data.photos||!data.photos.length) {
            resultsDiv.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:#999;">No results found. Try different keywords.</div>';
            return;
        }
        resultsDiv.innerHTML=data.photos.map(function(photo) {
            var safeUrl=escHtml(photo.src.medium);
            var safeThumb=escHtml(photo.src.tiny);
            return '<div onclick="addPexelsImage(\''+mbId+'\',\''+safeUrl+'\','+parseInt(photo.width)||0+','+parseInt(photo.height)||0+')" style="cursor:pointer;border-radius:6px;overflow:hidden;border:1px solid #eee;transition:all .15s;aspect-ratio:1;background:#f5f5f5;" onmouseover="this.style.transform=\'scale(1.03)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.15)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'">'+
                '<img alt="Moodboard thumbnail" loading="lazy" src="'+safeThumb+'" style="width:100%;height:100%;object-fit:cover;display:block;">'+
            '</div>';
        }).join('');
    })
    .catch(function(err) {
        resultsDiv.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:#e63946;">Search failed. Try again.</div>';
    });
}

function addPexelsImage(mbId, url, natW, natH) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var cardW=280, cardH=Math.round(cardW*(natH/natW));
    mb.collageItems.push({
        type:'image', src:url, caption:'Photo by Pexels',
        x:60+Math.random()*100, y:60+Math.random()*100,
        width:cardW, height:cardH, rotation:0,
        zIndex:mb.collageItems.length+1
    });
    mb.updatedAt=new Date().toISOString(); saveProofs();
    openMoodboardEditor(mb.id);
    if(typeof showNotification==='function') showNotification('Image added!','success');
}

// Utility functions
function isLightColor(hex) {
    var c=hex.replace('#','');
    var r=parseInt(c.substr(0,2),16), g=parseInt(c.substr(2,2),16), b=parseInt(c.substr(4,2),16);
    return (r*299+g*587+b*114)/1000>128;
}

function resizeMbItem(factor) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null||!mb.collageItems[idx]) return;
    var ci=mb.collageItems[idx];
    if(ci.width) ci.width=Math.round(ci.width*factor);
    if(ci.height) ci.height=Math.round(ci.height*factor);
    if(ci.fontSize) ci.fontSize=Math.round(ci.fontSize*factor);
    saveProofs(); openMoodboardEditor(mb.id);
}

function stretchMbItem(dim, amt) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null||!mb.collageItems[idx]) return;
    if(dim==='width') mb.collageItems[idx].width=Math.max(40,(mb.collageItems[idx].width||200)+amt);
    else mb.collageItems[idx].height=Math.max(40,(mb.collageItems[idx].height||150)+amt);
    saveProofs(); openMoodboardEditor(mb.id);
}

function rotateMbItem(deg) {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null||!mb.collageItems[idx]) return;
    mb.collageItems[idx].rotation=((mb.collageItems[idx].rotation||0)+deg)%360;
    saveProofs(); openMoodboardEditor(mb.id);
}

function bringMbItemForward() {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null||!mb.collageItems[idx]) return;
    mb.collageItems[idx].zIndex=(mb.collageItems[idx].zIndex||idx+1)+1;
    saveProofs(); openMoodboardEditor(mb.id);
}

function sendMbItemBackward() {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null||!mb.collageItems[idx]) return;
    mb.collageItems[idx].zIndex=Math.max(1,(mb.collageItems[idx].zIndex||idx+1)-1);
    saveProofs(); openMoodboardEditor(mb.id);
}

function deleteMbItem() {
    var mb=proofs.find(function(p){return p.id==window._mbEditorState.id;});
    var idx=window._mbEditorState.selectedItem;
    if(!mb||idx==null) return;
    mb.collageItems.splice(idx,1);
    window._mbEditorState.selectedItem=null;
    var sp=document.getElementById('mlPanel-selected');
    if(sp) sp.classList.remove('show');
    saveProofs(); openMoodboardEditor(mb.id);
}

function updateCanvasBackground(mbId, color) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    mb.canvasBackground=color;
    var c=document.getElementById('moodboardCanvas');
    if(c) c.style.background=color;
    var g=document.getElementById('mbGrid');
    if(g){
        var dot=isLightColor(color)?'rgba(0,0,0,0.1)':'rgba(255,255,255,0.1)';
        g.style.backgroundImage='radial-gradient(circle,'+dot+' 0.5px,transparent 0.5px)';
    }
    saveProofs();
}

function saveMoodboardState(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var n=document.getElementById('mbNotes');
    if(n) mb.notes=n.value;
    mb.updatedAt=new Date().toISOString(); saveProofs();

    // AUTO-SEND: If moodboard has content, hasn't been sent yet, and client has a qualifying service package
    if (mb.collageItems && mb.collageItems.length > 0 && !mb.sentToClient && mb.status === 'draft') {
        var client = clients.find(function(c) { return c.id == mb.clientId; });
        var autoSendServices = ['brand_kit', 'product_brand', 'service_brand', 'brand-kit', 'product-brand', 'service-brand', 'brandkit', 'productbrand', 'servicebrand'];
        var clientService = (client && client.servicePackageId) ? client.servicePackageId.toLowerCase() : '';
        var clientServiceName = (client && client.servicePackageName) ? client.servicePackageName.toLowerCase() : '';
        var qualifies = autoSendServices.some(function(s) { return clientService.indexOf(s) !== -1; }) ||
            clientServiceName.indexOf('brand') !== -1 || clientServiceName.indexOf('product') !== -1 || clientServiceName.indexOf('service') !== -1;
        if (qualifies) {
            // Auto-send moodboard to client
            sendProofToClient(mb.id);
            if(typeof showNotification==='function') showNotification('Moodboard saved & auto-sent to client!','success');
            else alert('Moodboard saved & auto-sent to ' + (client?.name || 'client') + '!');
            return;
        }
    }

    if(typeof showNotification==='function') showNotification('Moodboard saved!','success');
    else alert('Moodboard saved!');
}

function clearMoodboardStorage(mbId) {
    if(!confirm('Clear cached image data from old moodboards to free storage?')) return;
    var freed=0;
    proofs.forEach(function(p){
        if(p.type==='moodboard'&&p.collageItems&&p.id!=mbId){
            p.collageItems.forEach(function(item){
                if(item.type==='image'&&item.src&&item.src.startsWith('data:')&&item.src.length>1000){
                    freed+=item.src.length; item.src='[cleared-for-space]';
                }
            });
        }
        if(p.image&&p.image.startsWith('data:')&&p.image.length>5000){
            freed+=p.image.length; p.image='[cleared-for-space]';
        }
    });
    saveProofs();
    var kb=Math.round(freed/1024);
    if(typeof showNotification==='function') showNotification('Freed ~'+kb+'KB!','success');
    else alert('Freed ~'+kb+'KB of storage!');
}

function previewMoodboard(mbId) {
    var mb=proofs.find(function(p){return p.id==mbId;});
    if(!mb) return;
    var client=clients.find(function(c){return c.id==mb.clientId;});
    var bgColor=mb.canvasBackground||'#f5f5f5';

    var html='<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:10000;overflow-y:auto;">'+
        '<style>.ml-card{position:absolute;background:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.08);user-select:none} .ml-img-wrap{overflow:hidden;border-radius:6px 6px 0 0} .ml-img-wrap img{width:100%;display:block} .ml-note-strip{height:4px;border-radius:6px 6px 0 0} .ml-swatch-color{width:100%;aspect-ratio:1;border-radius:6px 6px 0 0} .ml-swatch-label{padding:6px 10px;font-size:11px;color:#666;font-family:monospace;text-align:center} .ml-link-domain{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;padding:12px 14px 6px} .ml-link-title{font-size:14px;font-weight:600;color:#1a1a1a;padding:0 14px 6px} .ml-link-url{border-top:1px solid #f0f0f0;padding:8px 14px;font-size:11px} .ml-link-url a{color:#4a90d9;text-decoration:none} .ml-text-card{background:transparent!important;box-shadow:none!important}</style>'+
        '<div style="max-width:1200px;margin:0 auto;padding:40px;">'+
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">'+
                '<div><h2 style="font-size:28px;font-weight:700;color:#fff;">'+mb.title+'</h2>'+
                '<p style="color:#888;margin-top:4px;">Prepared for '+(client?.name||'Client')+' by New Urban Influence</p></div>'+
                '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="padding:10px 20px;background:#333;border:1px solid #555;color:#fff;border-radius:8px;cursor:pointer;">Close</button>'+
            '</div>'+
            (mb.notes?'<div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin-bottom:24px;"><p style="color:#ccc;line-height:1.6;">'+mb.notes+'</p></div>':'')+
            '<div style="background:'+bgColor+';border-radius:12px;position:relative;width:100%;height:700px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">'+
                renderMoodboardItems(mb, true)+
            '</div>'+
        '</div>'+
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(resolveAllImages, 50);
}

