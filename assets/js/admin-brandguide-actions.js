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
