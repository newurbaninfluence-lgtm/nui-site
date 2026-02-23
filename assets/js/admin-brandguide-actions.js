// ==================== BRAND GUIDE ACTIONS ====================
// Upload, update, send, deliver, delete operations

function uploadBGFile(guideId, itemId, input) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const guides = getBrandGuides();
        const g = guides.find(x => x.id === guideId);
        if (!g || !g.deliverables[itemId]) return;
        g.deliverables[itemId].file = e.target.result;
        g.deliverables[itemId].status = 'uploaded';
        g.deliverables[itemId].uploadedAt = new Date().toISOString();
        g.updatedAt = new Date().toISOString();
        saveBrandGuides(guides);
        syncBrandGuideToClient(guideId); // Keep portal in sync
        renderBrandGuideEditor(guideId);
    };
    reader.readAsDataURL(file);
}

function removeBGFile(guideId, itemId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g || !g.deliverables[itemId]) return;
    g.deliverables[itemId].file = null;
    g.deliverables[itemId].status = 'not-started';
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
    syncBrandGuideToClient(guideId); // Keep portal in sync
    renderBrandGuideEditor(guideId);
}

function updateBGDeliverableStatus(guideId, itemId, status) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g || !g.deliverables[itemId]) return;
    g.deliverables[itemId].status = status;
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
}

function updateBGColor(guideId, index, value) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    if (!g.brandColors) g.brandColors = [];
    g.brandColors[index] = value;
    // Also mark color-system deliverable as uploaded
    if (g.deliverables['color-system']) g.deliverables['color-system'].status = 'uploaded';
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
}

function addBGColor(guideId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    if (!g.brandColors) g.brandColors = [];
    g.brandColors.push('#888888');
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
    renderBrandGuideEditor(guideId);
}

function updateBGFont(guideId, type, value) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    if (!g.fonts) g.fonts = {};
    g.fonts[type] = value;
    if (g.deliverables['typography']) g.deliverables['typography'].status = 'uploaded';
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
}

function updateBGTextField(guideId, field, value) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    g[field] = value;
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
}

function addBrandGuideComment(guideId) {
    const input = document.getElementById('bgCommentInput');
    const text = input?.value?.trim();
    if (!text) return;
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    if (!g.comments) g.comments = [];
    g.comments.push({
        text: text,
        author: (typeof currentUser !== 'undefined' && currentUser?.name) || 'Admin',
        date: new Date().toISOString()
    });
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);
    renderBrandGuideEditor(guideId);
}

async function sendBrandGuideToClient(guideId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;
    if (!g.clientEmail) { alert('No client email set.'); return; }

    const progress = getGuideProgress(g);
    if (progress.pct < 20) {
        if (!confirm('Only ' + progress.pct + '% complete. Send anyway?')) return;
    }

    g.status = 'pending';
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);

    // Sync deliverables to client.assets for portal display
    syncBrandGuideToClient(guideId);

    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: g.clientEmail,
                clientId: g.clientId,
                subject: '📘 Your Brand Guide is Ready for Review — ' + g.packageName,
                html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #202020; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #e11d48, #ff6b6b); padding: 32px; text-align: center;">
<h2 style="margin:0;font-size:24px;color:#fff;">Your Brand Guide is Ready!</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc;">Hey ${g.clientName},</p>
<p style="color: #ccc;">Your <strong style="color: #fff;">${g.packageName}</strong> brand guide has been prepared and is ready for your review.</p>
<p style="color: #ccc;">Log into your client portal to review all deliverables, approve, or request revisions.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${window.location.origin}/app/#proofs" style="display: inline-block; background: #e11d48; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review Brand Guide →</a>
</div>
</div></div>`
            })
        });
        alert('✅ Brand guide sent to ' + g.clientEmail);
    } catch (err) {
        console.error('Send failed:', err);
        alert('Email send failed. Guide status updated to pending.');
    }
    if (currentBrandGuideId) renderBrandGuideEditor(guideId);
    else loadAdminBrandGuidePanel();
}

async function deliverBrandGuidePackage(guideId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return;

    const isPaid = (typeof checkClientPaymentStatus === 'function') ? checkClientPaymentStatus(g.clientId) : false;
    if (!isPaid) { alert('Client has not paid. Cannot deliver until payment is confirmed.'); return; }
    if (g.status !== 'approved') { alert('Brand guide must be approved by client before delivery.'); return; }

    g.status = 'delivered';
    g.deliveredAt = new Date().toISOString();
    g.updatedAt = new Date().toISOString();
    saveBrandGuides(guides);

    // Final sync — push all deliverables to client portal
    syncBrandGuideToClient(guideId);

    // Send delivery email
    if (g.clientEmail) {
        try {
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: g.clientEmail,
                    clientId: g.clientId,
                    subject: '🎉 Your Brand Package Has Been Delivered! — ' + g.packageName,
                    html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #202020; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 32px; text-align: center;">
<h2 style="margin:0;font-size:24px;color:#fff;">🎉 Brand Package Delivered!</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc;">Hey ${g.clientName},</p>
<p style="color: #ccc;">All deliverables for your <strong style="color: #fff;">${g.packageName}</strong> are ready. Access them anytime through your client portal.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="${window.location.origin}/app/#proofs" style="display: inline-block; background: #2ecc71; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View My Brand Package →</a>
</div>
</div></div>`
                })
            });
        } catch (err) { console.error('Delivery email failed:', err); }
    }

    alert('✅ Brand package delivered to ' + g.clientName);
    if (currentBrandGuideId) renderBrandGuideEditor(guideId);
    else loadAdminBrandGuidePanel();
}

function deleteBrandGuideConfirm(guideId) {
    if (!confirm('Delete this brand guide? This cannot be undone.')) return;
    let guides = getBrandGuides();
    guides = guides.filter(g => g.id !== guideId);
    saveBrandGuides(guides);
    closeBrandGuideEditor();
}

// ==================== SYNC BRIDGE: Brand Guide → Client Portal ====================
// Maps brand guide deliverable categories to client.assets categories
const BG_TO_ASSET_MAP = {
    'logo':             'logos',
    'colors':           'brand',
    'strategy':         'brand',
    'social':           'social',
    'mockups':          'mockups',
    'print-collateral': 'print',
    'signage':          'print',
    'retail':           'print',
    'apparel':          'apparel',
    'digital':          'digital',
    'marketing':        'digital',
    'packaging':        'packaging'
};

function syncBrandGuideToClient(guideId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) return false;

    const client = clients.find(c => c.id == g.clientId);
    if (!client) return false;

    if (!client.assets) client.assets = {};

    // Sync brand colors & fonts from guide
    if (g.brandColors?.length) client.colors = g.brandColors;
    if (g.fonts) client.fonts = g.fonts;
    if (g.brandVoice) client.brandVoice = g.brandVoice;
    if (g.targetMarket) client.targetMarket = g.targetMarket;

    // Get package config for category mapping
    const config = BRAND_GUIDE_PACKAGES[g.packageKey];
    if (!config) return false;

    // Build a deliverable-id → category-id lookup
    const itemCategoryMap = {};
    config.categories.forEach(cat => {
        cat.items.forEach(item => {
            itemCategoryMap[item.id] = cat.id;
        });
    });

    // Clear synced assets (only brand-guide sourced ones) to avoid duplicates
    const syncedCategories = new Set();

    // Walk all deliverables and push files to client.assets
    Object.entries(g.deliverables || {}).forEach(([itemId, del]) => {
        if (!del.file) return; // no file uploaded
        if (del.status === 'not-started') return;

        const bgCat = itemCategoryMap[itemId] || 'other';
        const assetCat = BG_TO_ASSET_MAP[bgCat] || 'other';

        // First time seeing this category — clear old synced items
        if (!syncedCategories.has(assetCat)) {
            if (!client.assets[assetCat]) client.assets[assetCat] = [];
            // Remove previously synced brand guide items (keep manual uploads)
            client.assets[assetCat] = client.assets[assetCat].filter(a => !a._fromBrandGuide);
            syncedCategories.add(assetCat);
        }

        // Determine file type from base64 or name
        const isImage = del.file.match(/\.(png|jpg|jpeg|gif|svg|webp)/i) || del.file.startsWith('data:image');
        const isVideo = del.file.match(/\.(mp4|mov|webm)/i) || del.file.startsWith('data:video');

        client.assets[assetCat].push({
            name: del.name || itemId,
            data: del.file,
            type: isImage ? 'image' : isVideo ? 'video' : 'file',
            category: del.category || bgCat,
            itemId: itemId,
            formats: del.formats || null,
            uploadedAt: del.uploadedAt || new Date().toISOString(),
            _fromBrandGuide: guideId // tag for de-dup on re-sync
        });
    });

    // Store the brand guide metadata on the client for portal display
    client.brandGuidePackage = g.packageName;
    client.brandGuideStatus = g.status;

    saveClients();
    console.log(`✅ Synced ${Object.keys(g.deliverables).length} deliverables → client.assets for ${client.name}`);
    return true;
}
