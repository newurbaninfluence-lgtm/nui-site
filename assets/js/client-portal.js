// ==================== CLIENT PORTAL (PORTFOLIO-STYLE BRAND GUIDE) ====================
function showClientPortal(client) {
    document.getElementById('clientPortalName').textContent = client.name + ' Brand Portal';
    const clientOrders = orders.filter(o => o.clientId === client.id);
    const deliveredOrders = clientOrders.filter(o => o.status === 'delivered');
    const activeOrders = clientOrders.filter(o => o.status !== 'delivered');
    const logos = client.assets?.logos || [];
    const videos = client.assets?.video || [];
    const mockups = client.assets?.mockups || [];
    const social = client.assets?.social || [];
    const banners = client.assets?.banner || [];
    const allAssets = Object.values(client.assets || {}).flat();

    // Get brand guide proof status
    const brandGuide = client.brandGuide || { status: 'draft', proofComments: [] };
    const isPaid = checkClientPaymentStatus(client.id);

    function isLight(c) { const hex = c.replace('#',''); const r = parseInt(hex.substr(0,2),16); const g = parseInt(hex.substr(2,2),16); const b = parseInt(hex.substr(4,2),16); return (r*299+g*587+b*114)/1000 > 128; }

    document.getElementById('clientPortalContent').innerHTML = `
        <!-- Back Navigation Bar -->
<div class="portal-nav-bar" style="background: rgba(0,0,0,0.95); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100;">
<button onclick="goBackFromPortal()" class="portal-back-btn" style="display: flex; align-items: center; gap: 8px; background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; padding: 8px 16px; border-radius: 8px; transition: background 0.2s;">
<span class="fs-20">←</span> Back
</button>
<span class="text-muted fs-14">${client.name} Portal</span>
            ${currentUser?.type === 'admin' ? '<button onclick="backToAdmin()" style="background: var(--accent); color: #000; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Admin Dashboard</button>' : '<div></div>'}
</div>

<!-- CLIENT PORTAL MAIN TABS -->
<div style="background: #111; border-bottom: 1px solid #222; padding: 0 24px; display: flex; gap: 0; overflow-x: auto;">
<button onclick="switchPortalSection('dashboard', ${client.id})" class="portal-main-tab active" data-tab="dashboard" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid #e11d48; color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">📊 Dashboard</button>
<button onclick="switchPortalSection('brand', ${client.id})" class="portal-main-tab" data-tab="brand" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">🎨 Brand Portal</button>
<button onclick="switchPortalSection('orders', ${client.id})" class="portal-main-tab" data-tab="orders" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">📦 Orders & Invoices</button>
<button onclick="switchPortalSection('info', ${client.id})" class="portal-main-tab" data-tab="info" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">👤 My Info</button>
<button onclick="switchPortalSection('proofs', ${client.id})" class="portal-main-tab" data-tab="proofs" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">✅ Proofs ${proofs.filter(pr => pr.clientId == client.id && pr.sentToClient && pr.status === 'pending').length > 0 ? '<span style="background:#e11d48;color:#fff;border-radius:100px;padding:2px 8px;font-size:11px;margin-left:4px;">' + proofs.filter(pr => pr.clientId == client.id && pr.sentToClient && pr.status === 'pending').length + '</span>' : ''}</button>
<button onclick="switchPortalSection('questionnaire', ${client.id})" class="portal-main-tab" data-tab="questionnaire" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">📋 Questionnaire</button>
<button onclick="switchPortalSection('faq', ${client.id})" class="portal-main-tab" data-tab="faq" style="padding: 14px 24px; background: none; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit;">❓ FAQ</button>
</div>

<!-- DASHBOARD SECTION -->
<div id="portalSection-dashboard" class="portal-section p-32">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">Welcome back, ${client.contact || client.name}!</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
<div class="admin-card-dark-sm">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Service</div>
<div style="font-size: 18px; font-weight: 600; color: #fff;">${client.servicePackageName || 'Not set'}</div>
</div>
<div class="admin-card-dark-sm">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Active Orders</div>
<div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${activeOrders.length}</div>
</div>
<div class="admin-card-dark-sm">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Completed</div>
<div style="font-size: 28px; font-weight: 700; color: #10b981;">${deliveredOrders.length}</div>
</div>
<div class="admin-card-dark-sm">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Brand Status</div>
<div style="font-size: 18px; font-weight: 600; color: ${brandGuide.status === 'approved' ? '#10b981' : brandGuide.status === 'pending' ? '#f59e0b' : '#888'};">${brandGuide.status === 'approved' ? '✓ Approved' : brandGuide.status === 'pending' ? '⏳ Pending' : '📝 In Progress'}</div>
</div>
</div>
${(() => {
    const pendingProofs = proofs.filter(pr => pr.clientId == client.id && pr.sentToClient && pr.status === 'pending');
    return pendingProofs.length > 0 ? '<div style="background: #f59e0b15; border: 1px solid #f59e0b40; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;"><div><span class="fs-20">⏳</span> <strong style="color: #f59e0b;">' + pendingProofs.length + ' proof' + (pendingProofs.length > 1 ? 's' : '') + ' waiting for your review</strong><div style="color: #888; font-size: 13px; margin-top: 4px;">' + pendingProofs.map(p => p.title || p.name || 'Proof').join(', ') + '</div></div><button onclick="switchPortalSection(\'proofs\', ' + client.id + ')" style="padding: 12px 24px; background: #f59e0b; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">Review Now →</button></div>' : '';
})()}

<!-- Quick Actions: Contact Designer & Book a Call -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
<button onclick="openClientMessageDesigner(${client.id})" style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; cursor: pointer; text-align: left; font-family: inherit; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#e11d48'" onmouseout="this.style.borderColor='#222'">
<div class="fs-24 mb-8">💬</div>
<div style="font-size: 16px; font-weight: 600; color: #fff;">Contact Your Designer</div>
<div style="font-size: 13px; color: #888; margin-top: 4px;">Send a message about your project</div>
</button>
<button onclick="openBookCallModal()" style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; cursor: pointer; text-align: left; font-family: inherit; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#e11d48'" onmouseout="this.style.borderColor='#222'">
<div class="fs-24 mb-8">📞</div>
<div style="font-size: 16px; font-weight: 600; color: #fff;">Book a Call</div>
<div style="font-size: 13px; color: #888; margin-top: 4px;">Mon–Thu 1:00–4:00 PM EST</div>
</button>
</div>

${activeOrders.length > 0 ? '<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #fff;">Active Projects</h3>' + activeOrders.map(o => '<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;"><div><div class="text-bold-white">' + o.projectName + '</div><div style="font-size: 13px; color: #888; margin-top: 4px;">' + (o.packageName || '') + ' • ' + (o.status || 'pending') + '</div></div><div class="text-muted-sm">' + (o.dueDate ? 'Due: ' + new Date(o.dueDate).toLocaleDateString() : '') + '</div></div>').join('') : '<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 32px; text-align: center; color: #888;">No active orders yet. Your projects will appear here once created.</div>'}
</div>

<!-- ORDERS & INVOICES SECTION -->
<div id="portalSection-orders" class="portal-section" style="padding: 32px; display: none;">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">Orders & Invoices</h2>
${clientOrders.length > 0 ? clientOrders.map(o => {
    const inv = invoices.find(i => i.orderId === o.id);
    const statusColors = { pending: '#f59e0b', 'in-progress': '#3b82f6', review: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
    return '<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-bottom: 16px;"><div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;"><div><h3 style="font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 6px;">' + o.projectName + '</h3><div class="text-muted-sm">' + (o.packageName || 'Custom') + ' • Created ' + new Date(o.createdAt).toLocaleDateString() + '</div></div><div style="display: flex; gap: 12px; align-items: center;"><span style="display: inline-block; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: ' + (statusColors[o.status] || '#888') + '20; color: ' + (statusColors[o.status] || '#888') + ';">' + (o.status || 'pending') + '</span>' + (o.estimate ? '<span style="font-size: 18px; font-weight: 700; color: #e11d48;">$' + o.estimate.toLocaleString() + '</span>' : '') + '</div></div>' + (o.turnaround ? '<div style="margin-top: 12px; font-size: 13px; color: #888;">⏱ Turnaround: ' + o.turnaround + (o.dueDate ? ' • Due: ' + new Date(o.dueDate).toLocaleDateString() : '') + '</div>' : '') + (inv ? '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #222; display: flex; justify-content: space-between; align-items: center;"><span class="text-muted-sm">Invoice #' + (inv.invoiceNumber || inv.id) + '</span><span style="font-size: 13px; font-weight: 600; color: ' + (inv.status === 'paid' ? '#10b981' : '#f59e0b') + ';">' + (inv.status === 'paid' ? '✅ Paid' : '⏳ Unpaid — $' + (inv.total || inv.amount || 0).toLocaleString()) + '</span></div>' : '') + '</div>';
}).join('') : '<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 48px; text-align: center;"><div style="font-size: 48px; margin-bottom: 16px;">📦</div><div style="color: #888; font-size: 16px;">No orders yet</div><div style="color: #666; font-size: 14px; margin-top: 8px;">Your orders and invoices will appear here</div></div>'}
</div>

<!-- MY INFO SECTION -->
<div id="portalSection-info" class="portal-section" style="padding: 32px; display: none;">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">My Information</h2>
<div style="max-width: 600px;">
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
<div class="admin-label-xs">Business Name</div>
<div style="font-size: 16px; color: #fff; font-weight: 600;">${client.name}</div>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Contact</div>
<div class="fs-16 text-white">${client.contact || '—'}</div>
</div>
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Email</div>
<div class="fs-16 text-white">${client.email}</div>
</div>
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Phone</div>
<div class="fs-16 text-white">${client.phone || '—'}</div>
</div>
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Industry</div>
<div class="fs-16 text-white">${client.industry || '—'}</div>
</div>
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Website</div>
<div class="fs-16 text-white">${client.website ? '<a href="' + client.website + '" target="_blank" style="color: #e11d48;">' + client.website + '</a>' : '—'}</div>
</div>
<div class="admin-card-dark-sm">
<div class="admin-label-xs">Service</div>
<div class="fs-16 text-white">${client.servicePackageName || '—'}</div>
</div>
</div>
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-top: 16px;">
<div class="admin-label-xs">Address</div>
<div class="fs-16 text-white">${client.address || '—'}</div>
</div>
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-top: 16px;">
<div class="admin-label-xs">Member Since</div>
<div class="fs-16 text-white">${client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
</div>
</div>
</div>

<!-- QUESTIONNAIRE SECTION -->
<div id="portalSection-questionnaire" class="portal-section" style="padding: 32px; display: none;">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Service Questionnaire</h2>
<p class="text-muted mb-24">Help us understand your brand vision so we can deliver the best results.</p>
<div style="max-width: 600px;">
<form onsubmit="submitClientQuestionnaire(event, ${client.id})">
<div class="mb-20"><label class="admin-field-label-bold">What does your business do? *</label><textarea id="q_businessDesc" class="form-input" rows="3" required placeholder="Describe your business, products, or services...">${client.questionnaire?.businessDesc || ''}</textarea></div>
<div class="mb-20"><label class="admin-field-label-bold">Who is your target audience? *</label><textarea id="q_targetAudience" class="form-input" rows="2" required placeholder="Age range, interests, demographics...">${client.questionnaire?.targetAudience || ''}</textarea></div>
<div class="mb-20"><label class="admin-field-label-bold">What sets you apart from competitors?</label><textarea id="q_uniqueValue" class="form-input" rows="2" placeholder="Your unique selling proposition...">${client.questionnaire?.uniqueValue || ''}</textarea></div>
<div class="mb-20"><label class="admin-field-label-bold">Brand personality / vibe</label>
<select id="q_brandVibe" class="form-input admin-input">
<option value="">Select a vibe...</option>
<option value="bold" ${client.questionnaire?.brandVibe === 'bold' ? 'selected' : ''}>Bold & Edgy</option>
<option value="elegant" ${client.questionnaire?.brandVibe === 'elegant' ? 'selected' : ''}>Elegant & Sophisticated</option>
<option value="playful" ${client.questionnaire?.brandVibe === 'playful' ? 'selected' : ''}>Playful & Fun</option>
<option value="minimal" ${client.questionnaire?.brandVibe === 'minimal' ? 'selected' : ''}>Clean & Minimal</option>
<option value="luxury" ${client.questionnaire?.brandVibe === 'luxury' ? 'selected' : ''}>Luxury & Premium</option>
<option value="urban" ${client.questionnaire?.brandVibe === 'urban' ? 'selected' : ''}>Urban & Street</option>
<option value="organic" ${client.questionnaire?.brandVibe === 'organic' ? 'selected' : ''}>Natural & Organic</option>
<option value="tech" ${client.questionnaire?.brandVibe === 'tech' ? 'selected' : ''}>Modern & Tech</option>
</select></div>
<div class="mb-20"><label class="admin-field-label-bold">Colors you like or want to avoid</label><input type="text" id="q_colorPrefs" class="form-input" placeholder="e.g., Love red and black, avoid pastels" value="${client.questionnaire?.colorPrefs || ''}"></div>
<div class="mb-20"><label class="admin-field-label-bold">Brands you admire (inspiration)</label><input type="text" id="q_inspiration" class="form-input" placeholder="e.g., Nike, Apple, Supreme..." value="${client.questionnaire?.inspiration || ''}"></div>
<div class="mb-20"><label class="admin-field-label-bold">Timeline / deadline</label><input type="text" id="q_timeline" class="form-input" placeholder="e.g., Need by March 1st, flexible, ASAP..." value="${client.questionnaire?.timeline || ''}"></div>
<div class="mb-20"><label class="admin-field-label-bold">Anything else we should know?</label><textarea id="q_additional" class="form-input" rows="3" placeholder="Other details, preferences, existing assets...">${client.questionnaire?.additional || ''}</textarea></div>
<button type="submit" style="width: 100%; padding: 16px; background: #e11d48; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit;">${client.questionnaire ? '✅ Update Questionnaire' : '📋 Submit Questionnaire'}</button>
${client.questionnaire ? '<p style="color: #10b981; font-size: 13px; margin-top: 12px; text-align: center;">✅ Questionnaire submitted on ' + new Date(client.questionnaire.submittedAt).toLocaleDateString() + '</p>' : ''}
</form>
</div>
</div>

<!-- PROOFS & APPROVALS SECTION -->
<div id="portalSection-proofs" class="portal-section" style="padding: 32px; display: none;">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Proofs & Approvals</h2>
<p class="text-muted mb-24">Review your design proofs. Approve when you're happy, or request changes.</p>
${(() => {
    const clientProofs = proofs.filter(pr => pr.clientId == client.id && pr.sentToClient);
    if (clientProofs.length === 0) return '<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 48px; text-align: center;"><div style="font-size: 48px; margin-bottom: 16px;">✅</div><div style="color: #888; font-size: 16px;">No proofs yet</div><div style="color: #666; font-size: 14px; margin-top: 8px;">Design proofs will appear here when your designer sends them for review.</div></div>';
    const pending = clientProofs.filter(p => p.status === 'pending');
    const approved = clientProofs.filter(p => p.status === 'approved');
    const revision = clientProofs.filter(p => p.status === 'revision');
    const statusIcon = s => s === 'approved' ? '✅' : s === 'pending' ? '⏳' : s === 'revision' ? '🔄' : '📄';
    const statusColor = s => s === 'approved' ? '#10b981' : s === 'pending' ? '#f59e0b' : s === 'revision' ? '#ef4444' : '#888';
    let html = '';
    if (pending.length > 0) {
        html += '<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #f59e0b;">⏳ Awaiting Your Review (' + pending.length + ')</h3>';
        html += pending.map(p => '<div style="background: #111; border: 2px solid #f59e0b40; border-radius: 12px; padding: 24px; margin-bottom: 16px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">' +
            '<div><h3 style="font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 4px;">' + (p.title || p.name || p.fileName || 'Design Proof') + '</h3>' +
            '<div class="text-muted-sm">' + (p.category || p.proofType || 'Proof') + ' • v' + (p.version || 1) + ' • Sent ' + new Date(p.sentAt || p.uploadedAt).toLocaleDateString() + '</div></div>' +
            '<span style="padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #f59e0b20; color: #f59e0b;">⏳ Pending Review</span></div>' +
            (p.image || p.fileData ? '<div style="background: #0a0a0a; border: 1px solid #222; border-radius: 8px; overflow: hidden; margin-bottom: 16px; max-height: 400px;"><img src="' + (p.image || p.fileData) + '" style="width: 100%; display: block; object-fit: contain; max-height: 400px;" alt="Proof"></div>' : '') +
            (p.notes ? '<div style="background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 16px; margin-bottom: 16px;"><div class="text-muted fs-12 mb-4">Designer Notes</div><div style="color: #ccc; font-size: 14px;">' + p.notes + '</div></div>' : '') +
            '<div class="flex-gap-12">' +
            '<button onclick="clientRequestProofRevision(' + p.id + ', ' + client.id + ')" style="flex: 1; padding: 14px; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; font-size: 14px;">🔄 Request Changes</button>' +
            '<button onclick="clientApproveProof(' + p.id + ', ' + client.id + ')" style="flex: 1; padding: 14px; background: #10b981; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; font-size: 14px;">✅ Approve</button>' +
            '</div></div>').join('');
    }
    if (approved.length > 0) {
        html += '<h3 style="font-size: 16px; font-weight: 600; margin: 24px 0 16px; color: #10b981;">✅ Approved (' + approved.length + ')</h3>';
        html += approved.map(p => '<div style="background: #111; border: 1px solid #10b98130; border-radius: 12px; padding: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;"><div><div class="text-bold-white">' + (p.title || p.name || p.fileName || 'Design Proof') + '</div><div style="font-size: 13px; color: #888; margin-top: 4px;">' + (p.category || '') + ' • Approved ' + (p.approvedAt ? new Date(p.approvedAt).toLocaleDateString() : '') + '</div></div><span style="padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #10b98120; color: #10b981;">✅ Approved</span></div>').join('');
    }
    if (revision.length > 0) {
        html += '<h3 style="font-size: 16px; font-weight: 600; margin: 24px 0 16px; color: #ef4444;">🔄 Revision In Progress (' + revision.length + ')</h3>';
        html += revision.map(p => '<div style="background: #111; border: 1px solid #ef444430; border-radius: 12px; padding: 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;"><div><div class="text-bold-white">' + (p.title || p.name || p.fileName || 'Design Proof') + '</div><div style="font-size: 13px; color: #888; margin-top: 4px;">Revision #' + (p.revisionCount || 1) + ' • Designer is working on changes</div></div><span style="padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #ef444420; color: #ef4444;">🔄 Revising</span></div>').join('');
    }
    return html;
})()}
</div>

<!-- FAQ SECTION -->
<div id="portalSection-faq" class="portal-section" style="padding: 32px; display: none;">
<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Frequently Asked Questions</h2>
<p class="text-muted mb-24">Common questions about your project and working with NUI.</p>
<div class="max-w-700">
${[
    { q: "How long does my branding project take?", a: "Brand Kit projects typically take 7–10 business days. Service Brand Identity is 10–14 days, and Product Brand Identity is 14–21 days. Your specific timeline is in your order details." },
    { q: "How do I approve or request changes to my designs?", a: "Go to the <strong>Proofs</strong> tab in your portal. When a proof is ready, you will see Approve and Request Changes buttons. You will also get an email notification when new proofs are available." },
    { q: "How many revisions do I get?", a: "All packages include 2 rounds of revisions. Additional revision rounds can be added for $150 each. We want you to be 100% happy with the final result." },
    { q: "When can I download my final files?", a: "Final files become available in the <strong>Brand Portal</strong> tab after your proofs are approved and payment is complete. You will get all formats: PNG, SVG, PDF, and more." },
    { q: "What file formats will I receive?", a: "You will receive your logo in PNG (transparent + white background), SVG (scalable vector), PDF, and AI/EPS source files. Brand guidelines come as a professional PDF document." },
    { q: "How do I contact my designer?", a: "Click the <strong>Contact Your Designer</strong> button on your Dashboard. You can also reply to any email from us, or call (248) 487-8747 during business hours." },
    { q: "What are your business hours?", a: "We are available Monday–Thursday 1:00 PM – 4:00 PM EST for calls. Fridays are reserved for design work. Email support is available 24/7 and we respond within 1 business day." },
    { q: "Can I add more services to my project?", a: "Absolutely! Contact us through your portal or call (248) 487-8747 to discuss adding services like social media templates, business cards, packaging design, or web design." },
    { q: "What is included in my brand guidelines?", a: "Your brand guidelines document includes: logo usage rules, color palette with hex/RGB/CMYK codes, typography specifications, brand voice guidelines, and dos and donts for brand consistency." },
    { q: "How does payment work?", a: "We offer flexible payment options: pay in full (5% discount), 50/25/25 split, or 3 monthly payments. View your invoices and make payments in the <strong>Orders &amp; Invoices</strong> tab." }
].map(function(faq, i) { return '<div style="background: #111; border: 1px solid #222; border-radius: 12px; margin-bottom: 8px; overflow: hidden;"><button onclick="this.parentElement.classList.toggle(\'faq-open\'); var sp=this.querySelectorAll(\'span\'); if(sp.length>1) sp[1].textContent=this.parentElement.classList.contains(\'faq-open\') ? String.fromCharCode(8722) : \'+\';" style="width: 100%; padding: 20px 24px; background: none; border: none; color: #fff; font-size: 15px; font-weight: 600; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: inherit;"><span class="flex-1">' + faq.q + '</span><span style="color: #e11d48; font-size: 20px; margin-left: 16px;">+</span></button><div style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding: 0 24px;"><div style="padding: 0 0 20px 0; color: #aaa; font-size: 14px; line-height: 1.7;">' + faq.a + '</div></div></div>'; }).join("")}
</div>
<style>.faq-open > div:last-child { max-height: 300px !important; }</style>
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-top: 24px; max-width: 700px; text-align: center;">
<p style="color: #888; font-size: 14px; margin-bottom: 12px;">Still have questions?</p>
<div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
<button onclick="openClientMessageDesigner(${client.id})" style="padding: 12px 24px; background: #e11d48; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">💬 Message Us</button>
<a href="tel:2484878747" style="padding: 12px 24px; background: transparent; border: 1px solid #333; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">📞 (248) 487-8747</a>
</div>
</div>
</div>

<!-- BRAND PORTAL SECTION (existing content) -->
<div id="portalSection-brand" class="portal-section hidden">

<style>
            /* PORTFOLIO-STYLE BRAND GUIDE CSS */
            .brand-portal-case { background: #080808; border-radius: 8px; overflow: hidden; }
            .brand-portal-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 40px; background: rgba(0,0,0,0.5); }
            .brand-portal-tab { padding: 16px 28px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; text-transform: uppercase; letter-spacing: 2px; }
            .brand-portal-tab:hover { color: rgba(255,255,255,0.6); }
            .brand-portal-tab.active { color: #fff; border-color: ${client.colors[0]}; }
            .brand-portal-panel { display: none; animation: fadeIn 0.4s ease; }
            .brand-portal-panel.active { display: block; }
            .brand-section { margin-bottom: 56px; }
            .brand-section-title { font-size: 11px; color: ${client.colors[0]}; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
            .brand-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, ${client.colors[0]}50, transparent); }
            .logo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .logo-box { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0; text-align: center; transition: all 0.3s; aspect-ratio: 4/3; display: flex; flex-direction: column; overflow: hidden; position: relative; }
            .logo-box:hover { border-color: rgba(255,255,255,0.12); transform: scale(1.01); }
            .logo-box-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; padding: 12px 16px; background: rgba(0,0,0,0.9); font-weight: 600; position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; }
            .logo-box-img { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0; position: relative; background: #080808; }
            .logo-box-img img { width: 100%; height: 100%; object-fit: contain; padding: 20px; }
            .logo-placeholder { width: 100%; height: 100%; background: #080808; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.1); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .color-box { aspect-ratio: 1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding: 12px; position: relative; overflow: hidden; }
            .color-box::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }
            .color-hex { position: relative; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 1px; }
            .font-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .font-box { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; padding: 32px; }
            .font-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
            .font-name { font-size: 36px; font-weight: 700; margin-bottom: 8px; color: #000; }
            .font-sample { color: #333; font-size: 14px; line-height: 1.6; }
            .mockup-grid { display: flex; flex-direction: column; gap: 16px; }
            .mockup-row { display: grid; gap: 16px; }
            .mockup-row.full { grid-template-columns: 1fr; }
            .mockup-row.split { grid-template-columns: 1fr 1fr; }
            .mockup-box { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; position: relative; transition: all 0.3s ease; }
            .mockup-box.wide { aspect-ratio: 16/9; }
            .mockup-box.tall { aspect-ratio: 4/5; }
            .mockup-box:hover { transform: scale(1.01); border-color: rgba(255,255,255,0.12); }
            .mockup-box img, .mockup-box video { width: 100%; height: 100%; object-fit: cover; }
            .mockup-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.12); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; gap: 10px; background: #080808; }
            .mockup-placeholder::before { content: '+'; width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: rgba(255,255,255,0.1); }
            .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .result-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 48px 32px; text-align: center; position: relative; overflow: hidden; }
            .result-number { font-size: 64px; font-weight: 900; position: relative; color: ${client.colors[0]}; }
            .result-label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 3px; margin-top: 12px; position: relative; }
            .website-preview { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
            .website-preview img { width: 100%; display: block; }
            .testimonial-box { background: rgba(0,0,0,0.3); border-left: 3px solid ${client.colors[0]}; padding: 48px; border-radius: 0 8px 8px 0; }
            .testimonial-box p { font-size: 22px; font-style: italic; line-height: 1.7; margin-bottom: 32px; font-weight: 300; }
            .testimonial-author { display: flex; align-items: center; gap: 20px; }
            .testimonial-avatar { width: 48px; height: 48px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; background: ${client.colors[0]}; }
            .proof-approval-bar { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin: 24px 48px; }
            .proof-status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; }
            .download-section { background: #0a0a0a; padding: 48px; border-top: 1px solid rgba(255,255,255,0.06); }
            .download-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .download-card { background: #1a1a1a; padding: 24px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; transition: transform 0.2s; }
            .download-card:hover { transform: translateY(-4px); }
            .download-card h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
            .download-card p { font-size: 13px; color: #888; }
            .download-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 0; font-weight: 600; color: #fff; cursor: pointer; border-bottom: 2px solid #fff; transition: gap 0.2s; background: none; border-top: none; border-left: none; border-right: none; font-family: inherit; }
            .download-btn:hover { gap: 14px; }
            .download-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            @media (max-width: 768px) {
                .brand-portal-tabs { padding: 0 16px; flex-wrap: wrap; }
                .brand-portal-tab { padding: 12px 14px; font-size: 9px; }
                .logo-grid { grid-template-columns: 1fr !important; }
                .color-grid { grid-template-columns: repeat(2, 1fr) !important; }
                .font-grid { grid-template-columns: 1fr !important; }
                .mockup-row.split { grid-template-columns: 1fr; }
                .results-grid { grid-template-columns: 1fr !important; }
                .download-grid { grid-template-columns: 1fr !important; }
                .proof-approval-bar { margin: 24px 16px; }
            }
</style>

        <!-- BRAND HERO BANNER (Portfolio Style) -->
<div class="brand-hero" style="width: 100%; min-height: 360px; background: linear-gradient(145deg, ${client.colors[1] || client.colors[0]} 0%, #050505 100%); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 60px 40px;">
<div style="position: absolute; inset: 0; background: url('${logos[0]?.data || ''}') center/cover; opacity: 0.15;"></div>
<div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);"></div>
<div style="position: relative; text-align: center; z-index: 1; max-width: 100%;">
<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 4px; color: ${client.colors[0]}; margin-bottom: 16px; font-weight: 600;">${client.industry || 'Brand Identity'}</div>
<h2 style="font-size: clamp(32px, 7vw, 80px); font-weight: 900; text-transform: uppercase; letter-spacing: -2px; line-height: 1; color: #fff;">${client.name}</h2>
<p style="color: rgba(255,255,255,0.5); font-size: 15px; margin-top: 20px; max-width: 550px; margin-left: auto; margin-right: auto; line-height: 1.6;">Complete Brand Identity & Digital Presence</p>
</div>
<div style="position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px;">
                ${client.colors.map(c => '<div style="width: 28px; height: 28px; border-radius: 4px; background: ' + c + '; border: 1px solid rgba(255,255,255,0.15);"></div>').join('')}
</div>
</div>

        <!-- MOODBOARD SECTION (for clients) -->
        ${currentUser?.type !== 'admin' ? (() => {
            const moodboards = proofs.filter(p => p.type === 'moodboard' && p.clientId == client.id && p.sentToClient);
            if (moodboards.length === 0) return '';
            const moodboard = moodboards[moodboards.length - 1]; // Latest moodboard
            const statusColors = {
                'approved': { bg: '#10b98120', color: '#10b981', icon: '✓', label: 'Approved' },
                'pending': { bg: '#f59e0b20', color: '#f59e0b', icon: '⏳', label: 'Pending Review' },
                'revision': { bg: '#ef444420', color: '#ef4444', icon: '↻', label: 'Revision Requested' },
                'draft': { bg: '#33333350', color: '#888', icon: '📝', label: 'Draft' }
            };
            const statusInfo = statusColors[moodboard.status] || statusColors.draft;
            return `
<div style="background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; margin: 0 48px 32px 48px;">
<div class="admin-row-between">
<h3 style="font-size: 18px; font-weight: 600; color: #fff; margin: 0;">🎨 Creative Direction — Moodboard</h3>
<div class="proof-status-badge" style="background: ${statusInfo.bg}; color: ${statusInfo.color}; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 600;">
<span>${statusInfo.icon}</span>
                        ${statusInfo.label}
</div>
</div>
                ${moodboard.notes ? `<p style="color: rgba(255,255,255,0.6); margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">${moodboard.notes}</p>` : ''}
<div style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; margin-bottom: 20px; position: relative; min-height: 400px; overflow: hidden;">
<div style="position: absolute; inset: 0; ${moodboard.canvasBackground ? 'background: ' + moodboard.canvasBackground : 'background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'};"></div>
<div style="position: relative; width: 100%; height: 100%; min-height: 400px;">
                        ${renderMoodboardItems(moodboard)}
</div>
</div>
                ${moodboard.status === 'pending' ? `
<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
<button onclick="requestMoodboardChanges(${client.id}, ${moodboard.id})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">↻ Request Changes</button>
<button onclick="approveMoodboard(${client.id}, ${moodboard.id})" style="background: #10b981; border: none; color: #fff; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">✓ Approve Moodboard</button>
</div>
                ` : ''}
                ${moodboard.comments && moodboard.comments.length > 0 ? `
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Feedback History</div>
                    ${moodboard.comments.slice(-3).map(c => '<div style="background: #0a0a0a; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px;"><div class="text-muted fs-12 mb-4">' + new Date(c.timestamp).toLocaleDateString() + ' - ' + (c.author || 'Designer') + '</div><div style="font-size: 14px; color: rgba(255,255,255,0.7);">' + c.text + '</div></div>').join('')}
</div>
                ` : ''}
</div>
            `;
        })() : ''}

        <!-- PROOF APPROVAL BAR (for clients) -->
        ${currentUser?.type !== 'admin' ? `
<div class="proof-approval-bar">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
<div>
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Proof Status</div>
<div class="proof-status-badge" style="background: ${brandGuide.status === 'approved' ? '#10b98120' : brandGuide.status === 'pending' ? '#f59e0b20' : brandGuide.status === 'revision_requested' ? '#ef444420' : '#33333350'}; color: ${brandGuide.status === 'approved' ? '#10b981' : brandGuide.status === 'pending' ? '#f59e0b' : brandGuide.status === 'revision_requested' ? '#ef4444' : '#888'};">
<span>${brandGuide.status === 'approved' ? '✓' : brandGuide.status === 'pending' ? '⏳' : brandGuide.status === 'revision_requested' ? '↻' : '📝'}</span>
                        ${brandGuide.status === 'approved' ? 'Approved' : brandGuide.status === 'pending' ? 'Pending Review' : brandGuide.status === 'revision_requested' ? 'Revision Requested' : 'Draft'}
</div>
</div>
                ${brandGuide.status === 'pending' ? `
<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
<button onclick="showRevisionModal(${client.id})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">↻ Request Revision</button>
<button onclick="approveClientBrandProof(${client.id})" style="background: #10b981; border: none; color: #fff; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">✓ Approve Proof</button>
</div>
                ` : brandGuide.status === 'approved' ? `
<div style="color: #10b981; font-weight: 600;">
                    ${isPaid ? '✓ Your brand assets are ready for download below!' : '⚠️ Complete payment to download your brand assets'}
</div>
                ` : ''}
</div>
            ${brandGuide.proofComments?.length > 0 ? `
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Revision History</div>
                ${brandGuide.proofComments.slice(-3).map(c => '<div style="background: #0a0a0a; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px;"><div class="text-muted fs-12 mb-4">' + new Date(c.date).toLocaleDateString() + ' - ' + c.type + '</div><div class="fs-14">' + c.comment + '</div></div>').join('')}
</div>
            ` : ''}
</div>
        ` : ''}

        <!-- PORTFOLIO-STYLE TABS -->
<div class="brand-portal-case">
<div class="brand-portal-tabs">
<div class="brand-portal-tab active" onclick="switchBrandPortalTab(0, this)">Brand Guide</div>
<div class="brand-portal-tab" onclick="switchBrandPortalTab(1, this)">Website / Webapp</div>
<div class="brand-portal-tab" onclick="switchBrandPortalTab(2, this)">Results</div>
<div class="brand-portal-tab" onclick="switchBrandPortalTab(3, this)">Downloads</div>
</div>

            <!-- PANEL 0: BRAND GUIDE -->
<div class="brand-portal-panel active" data-panel="0" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${client.colors[1] || client.colors[0]}10 100%);">

                <!-- BRAND VOICE (Slogan & Mission) -->
                ${(client.slogan || client.mission) ? `
<div class="brand-section">
<div class="brand-section-title">Brand Voice</div>
<div style="display: grid; grid-template-columns: ${client.slogan && client.mission ? '1fr 1fr' : '1fr'}; gap: 20px;">
                        ${client.slogan ? '<div style="background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 32px;"><div style="font-size: 10px; color: ' + client.colors[0] + '; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; font-weight: 600;">Slogan</div><div style="font-size: 24px; font-weight: 700; line-height: 1.3; color: #fff;">"' + client.slogan + '"</div></div>' : ''}
                        ${client.mission ? '<div style="background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 32px;"><div style="font-size: 10px; color: ' + client.colors[0] + '; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; font-weight: 600;">Mission Statement</div><div style="font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.7);">' + client.mission + '</div></div>' : ''}
</div>
</div>
                ` : ''}

                <!-- LOGO SYSTEM (3-Column Grid) -->
<div class="brand-section">
<div class="brand-section-title">Logo System</div>
<div class="logo-grid">
<div class="logo-box" style="border-color: ${client.colors[0]}20;">
<div class="logo-box-img">${logos[0]?.data ? '<img loading="lazy" src="' + logos[0].data + '" alt="Primary Logo">' : '<div class="logo-placeholder">No Logo</div>'}</div>
<div class="logo-box-label">Primary Logo</div>
</div>
<div class="logo-box" style="border-color: ${client.colors[0]}20;">
<div class="logo-box-img">${logos[1]?.data ? '<img loading="lazy" src="' + logos[1].data + '" alt="Secondary Logo">' : '<div class="logo-placeholder">No Logo</div>'}</div>
<div class="logo-box-label">Secondary Logo</div>
</div>
<div class="logo-box" style="border-color: ${client.colors[0]}20;">
<div class="logo-box-img">${logos[2]?.data ? '<img loading="lazy" src="' + logos[2].data + '" alt="Icon Mark">' : '<div class="logo-placeholder">No Icon</div>'}</div>
<div class="logo-box-label">Icon / Logo Mark</div>
</div>
</div>
</div>

                <!-- COLOR PALETTE (4-Column Grid) -->
<div class="brand-section">
<div class="brand-section-title">Color Palette</div>
<div class="color-grid">
                        ${client.colors.map((c, idx) => '<div class="color-box" style="background: ' + c + ';"><div class="color-hex">' + c.toUpperCase() + '</div></div>').join('')}
                        ${client.colors.length < 4 ? Array(4 - client.colors.length).fill('<div class="color-box" style="background: #1a1a1a;"><div class="color-hex">—</div></div>').join('') : ''}
</div>
</div>

                <!-- FONT SYSTEM (2-Column Grid) -->
<div class="brand-section">
<div class="brand-section-title">Font System</div>
<div class="font-grid">
<div class="font-box">
<div class="font-label">Heading Font</div>
<div class="font-name" style="font-family: '${client.fonts?.heading || 'Inter'}', sans-serif;">${client.fonts?.heading || 'Inter'}</div>
<div class="font-sample">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</div>
</div>
<div class="font-box">
<div class="font-label">Body Font</div>
<div class="font-name" style="font-family: '${client.fonts?.body || 'Inter'}', sans-serif;">${client.fonts?.body || 'Inter'}</div>
<div class="font-sample" style="font-family: '${client.fonts?.body || 'Inter'}', sans-serif;">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</div>
</div>
</div>
</div>

                <!-- BRAND MOCKUPS (Portfolio Layout: 16:9, two 4:5, 16:9) -->
<div class="brand-section">
<div class="brand-section-title">Brand Mockups</div>
<div class="mockup-grid">
                        <!-- Top 16:9 -->
<div class="mockup-row full">
<div class="mockup-box wide" style="border-color: ${client.colors[0]}15;">
                                ${mockups[0]?.data ? '<img loading="lazy" src="' + mockups[0].data + '" alt="Mockup">' : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
                        <!-- Middle two 4:5 -->
<div class="mockup-row split">
<div class="mockup-box tall" style="border-color: ${client.colors[0]}15;">
                                ${mockups[1]?.data ? '<img loading="lazy" src="' + mockups[1].data + '" alt="Mockup">' : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
<div class="mockup-box tall" style="border-color: ${client.colors[0]}15;">
                                ${mockups[2]?.data ? '<img loading="lazy" src="' + mockups[2].data + '" alt="Mockup">' : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
                        <!-- Bottom 16:9 -->
<div class="mockup-row full">
<div class="mockup-box wide" style="border-color: ${client.colors[0]}15;">
                                ${mockups[3]?.data ? '<img loading="lazy" src="' + mockups[3].data + '" alt="Mockup">' : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
</div>
</div>
</div>

            <!-- PANEL 1: WEBSITE / WEBAPP -->
<div class="brand-portal-panel" data-panel="1" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${client.colors[1] || client.colors[0]}10 100%);">
<div class="website-preview" style="border-color: ${client.colors[0]}20; position: relative; margin-bottom: 32px;">
<img loading="lazy" src="${client.websiteScreenshot || logos[0]?.data || ''}" alt="${client.name} Website" style="width: 100%; height: 500px; object-fit: cover; background: #0a0a0a;">
                    ${client.websiteUrl ? '<a href="' + client.websiteUrl + '" target="_blank" style="position: absolute; bottom: 24px; right: 24px; background: ' + client.colors[0] + '; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s;">Visit Site <span style="font-size: 18px;">→</span></a>' : ''}
</div>
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
<p style="color: rgba(255,255,255,0.6); line-height: 1.8; font-size: 16px; flex: 1; min-width: 280px;">A fully responsive, high-converting website designed to capture the essence of ${client.name}. The platform features custom functionality, seamless navigation, and is optimized for both desktop and mobile users.</p>
                    ${client.websiteUrl ? '<a href="' + client.websiteUrl + '" target="_blank" style="background: transparent; border: 1px solid ' + client.colors[0] + '; color: ' + client.colors[0] + '; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">' + (client.websiteUrl.replace('https://', '').replace('http://', '')) + '</a>' : ''}
</div>
                <!-- Web Mockups Grid -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px;">
<div style="aspect-ratio: 4/5; background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${client.webMockups?.[0] ? '<img loading="lazy" src="' + client.webMockups[0] + '" alt="Web Mockup" style="width:100%;height:100%;object-fit:cover;">' : '<div style="color: rgba(255,255,255,0.12); font-size: 14px;">Image / Video</div>'}
</div>
<div style="aspect-ratio: 4/5; background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${client.webMockups?.[1] ? '<img loading="lazy" src="' + client.webMockups[1] + '" alt="Web Mockup" style="width:100%;height:100%;object-fit:cover;">' : '<div style="color: rgba(255,255,255,0.12); font-size: 14px;">Image / Video</div>'}
</div>
</div>
</div>

            <!-- PANEL 2: RESULTS -->
<div class="brand-portal-panel" data-panel="2" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${client.colors[1] || client.colors[0]}10 100%);">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
<div style="background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 32px;">
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${client.colors[0]}; margin-bottom: 16px; font-weight: 600;">Challenge</div>
<p style="color: rgba(255,255,255,0.6); line-height: 1.8; font-size: 15px; margin: 0;">${client.problem || 'The client needed a complete brand transformation to better connect with their target audience and stand out in a competitive market.'}</p>
</div>
<div style="background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 32px;">
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${client.colors[0]}; margin-bottom: 16px; font-weight: 600;">Solution</div>
<p style="color: rgba(255,255,255,0.6); line-height: 1.8; font-size: 15px; margin: 0;">${client.solution || 'We developed a comprehensive brand strategy with modern visual identity, responsive web platform, and targeted digital marketing campaigns.'}</p>
</div>
</div>
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${client.colors[0]}; margin-bottom: 24px; font-weight: 600;">Results</div>
<div class="results-grid">
<div class="result-card"><div class="result-number">${client.results?.revenue || '+45%'}</div><div class="result-label">Revenue Growth</div></div>
<div class="result-card"><div class="result-number">${client.results?.traffic || '+120%'}</div><div class="result-label">Web Traffic</div></div>
<div class="result-card"><div class="result-number">${client.results?.engagement || '+85%'}</div><div class="result-label">Engagement</div></div>
</div>
                ${client.testimonial ? `
<div style="margin-top: 48px;">
<div class="testimonial-box">
<p>"${client.testimonial.text || 'Working with NUI transformed our brand completely. The attention to detail and creative vision exceeded our expectations.'}"</p>
<div class="testimonial-author">
<div class="testimonial-avatar">${(client.testimonial.author || client.name).charAt(0)}</div>
<div>
<div style="font-weight: 700;">${client.testimonial.author || client.contact || 'Client'}</div>
<div style="color: rgba(255,255,255,0.5); font-size: 14px;">${client.testimonial.title || 'Owner'}, ${client.name}</div>
</div>
</div>
</div>
</div>
                ` : ''}
</div>

            <!-- PANEL 3: DOWNLOADS -->
<div class="brand-portal-panel" data-panel="3" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${client.colors[1] || client.colors[0]}10 100%);">
                ${!isPaid && brandGuide.status !== 'approved' ? `
<div style="background: #1a0a0a; border: 1px solid #ef4444; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
<div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
<h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Downloads Locked</h3>
<p class="text-muted mb-24">Please approve your brand proofs and complete payment to unlock downloads.</p>
</div>
                ` : ''}
<div class="brand-section-title">Available Downloads</div>
<div class="download-grid">
                    ${logos.length > 0 ? '<div class="download-card" style="background: linear-gradient(135deg, ' + client.colors[0] + ', ' + (client.colors[1] || client.colors[0]) + ');"><div><h4>Logo Pack</h4><p>' + logos.length + ' logo file(s)</p></div><button class="download-btn" onclick="downloadAsset(' + client.id + ', \'logos\', 0)" ' + (!isPaid ? 'disabled' : '') + '>Download ↓</button></div>' : ''}
                    ${mockups.length > 0 ? '<div class="download-card" style="background: #2563eb;"><div><h4>Brand Mockups</h4><p>' + mockups.length + ' mockup(s)</p></div><button class="download-btn" onclick="downloadAsset(' + client.id + ', \'mockups\', 0)" ' + (!isPaid ? 'disabled' : '') + '>Download ↓</button></div>' : ''}
                    ${videos.length > 0 ? '<div class="download-card" style="background: #dc2626;"><div><h4>Brand Video</h4><p>' + (videos[0]?.size || '1 video') + '</p></div><button class="download-btn" onclick="downloadAsset(' + client.id + ', \'video\', 0)" ' + (!isPaid ? 'disabled' : '') + '>Download ↓</button></div>' : ''}
                    ${social.length > 0 ? '<div class="download-card" style="background: linear-gradient(135deg, #7c3aed, #a855f7);"><div><h4>Social Templates</h4><p>' + social.length + ' template(s)</p></div><button class="download-btn" onclick="downloadAsset(' + client.id + ', \'social\', 0)" ' + (!isPaid ? 'disabled' : '') + '>Download ↓</button></div>' : ''}
                    ${banners.length > 0 ? '<div class="download-card" style="background: #0891b2;"><div><h4>Banners</h4><p>' + banners.length + ' banner(s)</p></div><button class="download-btn" onclick="downloadAsset(' + client.id + ', \'banner\', 0)" ' + (!isPaid ? 'disabled' : '') + '>Download ↓</button></div>' : ''}
<div class="download-card" style="background: linear-gradient(135deg, ${client.colors[0]}, ${client.colors[1] || client.colors[0]});"><div><h4>Color Palette</h4><p>${client.colors.join(' • ')}</p></div><button class="download-btn" onclick="copyColors('${client.colors.join(',')}')">Copy Colors 📋</button></div>
</div>
</div>
</div>

        <!-- FOOTER -->
<section style="padding: 48px; background: #000; text-align: center; border-top: 1px solid #222;">
<div style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #fff;">${client.name}</div>
<p style="color: #666; font-size: 14px;">Brand Guidelines • ${new Date().getFullYear()}</p>
<p style="color: #333; font-size: 12px; margin-top: 32px;">Powered by NUI Brand Portal</p>
<button onclick="backToAdmin()" style="margin-top: 24px; padding: 12px 24px; background: transparent; border: 1px solid #333; color: #fff; cursor: pointer; border-radius: 4px; font-family: inherit;">← Back</button>
</section>
</div><!-- /portalSection-brand -->
    `;
}

// Note: checkClientPaymentStatus is defined later in the file (line ~12356) with more comprehensive checking

// Switch brand portal tabs
function switchBrandPortalTab(panelIndex, tabEl) {
    const tabs = document.querySelectorAll('.brand-portal-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    const panels = document.querySelectorAll('.brand-portal-panel');
    panels.forEach(p => p.classList.remove('active'));
    panels[panelIndex].classList.add('active');
}

// Switch main portal sections (Dashboard, Brand, Orders, Info, Questionnaire)
function switchPortalSection(section, clientId) {
    document.querySelectorAll('.portal-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.portal-main-tab').forEach(t => { t.style.borderBottomColor = 'transparent'; t.style.color = '#888'; });
    const target = document.getElementById('portalSection-' + section);
    if (target) target.style.display = section === 'brand' ? 'block' : 'block';
    const activeTab = document.querySelector('.portal-main-tab[data-tab="' + section + '"]');
    if (activeTab) { activeTab.style.borderBottomColor = '#e11d48'; activeTab.style.color = '#fff'; }
}

// Submit client questionnaire from portal
function submitClientQuestionnaire(e, clientId) {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    client.questionnaire = {
        businessDesc: document.getElementById('q_businessDesc')?.value || '',
        targetAudience: document.getElementById('q_targetAudience')?.value || '',
        uniqueValue: document.getElementById('q_uniqueValue')?.value || '',
        brandVibe: document.getElementById('q_brandVibe')?.value || '',
        colorPrefs: document.getElementById('q_colorPrefs')?.value || '',
        inspiration: document.getElementById('q_inspiration')?.value || '',
        timeline: document.getElementById('q_timeline')?.value || '',
        additional: document.getElementById('q_additional')?.value || '',
        submittedAt: new Date().toISOString()
    };
    saveClients();
    alert('✅ Questionnaire submitted! We\'ll use this to tailor your brand experience.');
    showClientPortal(client);
}

// Show revision modal for proof feedback
function showRevisionModal(clientId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
    modal.innerHTML = `
<div style="background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 500px; width: 100%;">
<h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #fff;">Request Revision</h3>
<p class="text-muted mb-24">Please describe what changes you'd like to see.</p>
<textarea id="revisionComment" placeholder="Describe the changes needed..." style="width: 100%; min-height: 120px; padding: 16px; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; font-family: inherit; font-size: 14px; resize: vertical;"></textarea>
<div style="display: flex; gap: 12px; margin-top: 24px;">
<button onclick="this.closest('div[style*=fixed]').remove()" style="flex: 1; padding: 14px; background: transparent; border: 1px solid #333; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">Cancel</button>
<button onclick="submitRevision(${clientId})" style="flex: 1; padding: 14px; background: #ef4444; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit;">Submit Revision</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

// Submit revision request
function submitRevision(clientId) {
    const comment = document.getElementById('revisionComment').value.trim();
    if (!comment) { alert('Please enter your revision comments'); return; }

    const client = clients.find(c => c.id === clientId);
    if (!client.brandGuide) client.brandGuide = { status: 'draft', proofComments: [] };
    client.brandGuide.status = 'revision_requested';
    client.brandGuide.proofComments.push({ type: 'Revision Requested', comment: comment, date: new Date().toISOString() });
    saveClients();

    // UPDATE THE PROOF SYSTEM: Find matching proof and update it
    const clientProof = proofs.find(p => p.type === 'brandguide' && p.clientId == clientId && (p.status === 'pending' || p.status === 'revision'));

    if (clientProof) {
        // Update proof with revision information
        clientProof.status = 'revision';
        clientProof.revisionCount = (clientProof.revisionCount || 0) + 1;
        clientProof.comments = clientProof.comments || [];
        clientProof.comments.push({
            author: client.name || 'Client',
            text: comment,
            timestamp: new Date().toISOString()
        });
        clientProof.updatedAt = new Date().toISOString();
        saveProofs();

        // Notify designer about the revision request
        if (clientProof.designerId) {
            addDesignerMessage(clientProof.designerId, clientProof.projectId, `📝 Client "${client.name}" has requested revisions on "${clientProof.name}": ${comment}`, 'revision', false);
        }

        // Log to CRM
        logProofActivity('revision', clientProof, `Client "${client.name}" requested revisions on "${clientProof.name}"`);
    }

    // Send email notification to admin about revision request
    simulateEmailNotification(
        'admin@newurbaninfluence.com',
        `📝 Revision Requested: ${client.name} - ${clientProof?.name || 'Brand Guide'}`,
        `Client "${client.name}" has requested revisions on "${clientProof?.name || 'their brand guide'}". Revision request:\n\n"${comment}"`
    );

    document.querySelector('div[style*="fixed"][style*="inset"]').remove();
    alert('Revision request submitted! Our team will review and update your proofs.');
    showClientPortal(client);
}

// Approve client brand proof (for client portal)
function approveClientBrandProof(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client.brandGuide) client.brandGuide = { status: 'draft', proofComments: [] };

    const isPaid = checkClientPaymentStatus(clientId);
    client.brandGuide.status = 'approved';
    client.brandGuide.proofComments.push({ type: 'Approved', comment: 'Client approved the brand proofs', date: new Date().toISOString() });
    client.brandGuide.approvedAt = new Date().toISOString();
    saveClients();

    // TRIGGER THE FULL APPROVAL WORKFLOW: Find matching proof and call approveProof()
    const clientProof = proofs.find(p => p.type === 'brandguide' && p.clientId == clientId && (p.status === 'pending' || p.status === 'revision'));

    if (clientProof) {
        // Call the existing approveProof() function which handles all the real workflow:
        // - Saves to brand assets
        // - Updates order status
        // - Notifies designer
        // - Sends real email
        // - Logs to CRM
        approveProof(clientProof.id);
    } else {
        // LEGACY DATA: No matching proof found, do manual workflow
        // Send real email notification instead of console.log
        simulateEmailNotification(
            client.email,
            `✅ Your Brand Proofs Have Been Approved!`,
            `Great news! Your brand proofs have been approved. ${isPaid ? 'Your brand assets are now available for download in your client portal.' : 'Complete your payment to unlock the final deliverable files.'}`
        );

        // Log approval to CRM
        const legacyProof = {
            clientId: clientId,
            clientName: client.name,
            name: 'Brand Guide',
            type: 'brandguide',
            id: Date.now()
        };
        logProofActivity('approved', legacyProof, `Client "${client.name}" approved their brand guide`);
    }

    if (isPaid) {
        alert('🎉 Proof Approved! Your brand assets are now available for download.');
    } else {
        alert('Proof Approved! Please complete payment to download your brand assets.');
    }
    showClientPortal(client);
}

// Approve moodboard (for client portal)
function approveMoodboard(clientId, moodboardId) {
    const mb = proofs.find(p => p.id == moodboardId);
    if (!mb) return;

    // Update moodboard status
    mb.status = 'approved';
    mb.approvedAt = new Date().toISOString();
    saveProofs();

    // Log to CRM
    if (typeof logProofActivity === 'function') {
        logProofActivity('approved', mb.clientName || 'Client', mb.title + ' moodboard approved by client');
    }

    // Notify admin via email
    if (typeof simulateEmailNotification === 'function') {
        simulateEmailNotification('newurbaninfluence@gmail.com', 'Moodboard Approved: ' + mb.title,
            '<h2>Moodboard Approved!</h2><p>' + (mb.clientName || 'Client') + ' has approved the moodboard: <strong>' + mb.title + '</strong></p><p>You can now proceed with creating the brand guide.</p>');
    }

    alert('Moodboard approved! Your designer will begin working on your brand guide.');

    // Refresh portal
    const client = clients.find(c => c.id == clientId);
    if (client) showClientPortal(client);
}

// Request moodboard changes (for client portal)
function requestMoodboardChanges(clientId, moodboardId) {
    const feedback = prompt('What changes would you like? Describe your feedback:');
    if (!feedback || !feedback.trim()) return;

    const mb = proofs.find(p => p.id == moodboardId);
    if (!mb) return;

    mb.status = 'revision';
    mb.revisionCount = (mb.revisionCount || 0) + 1;
    if (!mb.comments) mb.comments = [];
    mb.comments.push({ author: mb.clientName || 'Client', text: feedback.trim(), timestamp: new Date().toISOString() });
    mb.updatedAt = new Date().toISOString();
    saveProofs();

    // Notify admin
    if (typeof simulateEmailNotification === 'function') {
        simulateEmailNotification('newurbaninfluence@gmail.com', 'Moodboard Revision Request: ' + mb.title,
            '<h2>Revision Requested</h2><p>' + (mb.clientName || 'Client') + ' has requested changes to the moodboard: <strong>' + mb.title + '</strong></p><p><strong>Feedback:</strong> ' + feedback.trim() + '</p>');
    }

    // Log to CRM
    if (typeof logProofActivity === 'function') {
        logProofActivity('revision', mb.clientName || 'Client', 'Moodboard revision requested: ' + feedback.trim());
    }

    alert('Your feedback has been sent to the design team!');

    const client = clients.find(c => c.id == clientId);
    if (client) showClientPortal(client);
}

