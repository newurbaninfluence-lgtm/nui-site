// ==================== BRAND GUIDE PANEL ====================
// List view, stats, create modal, filter/search

var currentBrandGuideId = null;

function loadAdminBrandGuidePanel() {
    const guides = getBrandGuides();
    const panel = document.getElementById('adminBrandguidePanel');
    if (!panel) return;

    // If editing, delegate to editor
    if (currentBrandGuideId) {
        renderBrandGuideEditor(currentBrandGuideId);
        return;
    }

    const stats = {
        total: guides.length,
        draft: guides.filter(g => g.status === 'draft').length,
        pending: guides.filter(g => g.status === 'pending' || g.status === 'revision_requested').length,
        approved: guides.filter(g => g.status === 'approved').length,
        delivered: guides.filter(g => g.status === 'delivered').length
    };

    panel.innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📘 Brand Guide System</h2>
<p class="panel-subtitle">Deliverable tracking for Brand Kit, Service Identity & Product Identity packages</p>
</div>

<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Total Guides</div><div class="stat-value">${stats.total}</div></div>
<div class="stat-card"><div class="stat-label">In Progress</div><div class="stat-value" style="color: #3b82f6;">${stats.draft}</div></div>
<div class="stat-card"><div class="stat-label">Pending Review</div><div class="stat-value" style="color: #f59e0b;">${stats.pending}</div></div>
<div class="stat-card"><div class="stat-label">Approved</div><div class="stat-value" style="color: #2ecc71;">${stats.approved}</div></div>
<div class="stat-card"><div class="stat-label">Delivered</div><div class="stat-value" style="color: #8b5cf6;">${stats.delivered}</div></div>
</div>

<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
<button class="btn-admin primary" onclick="showCreateBrandGuideModal()">+ New Brand Guide</button>
</div>

<div class="form-section">
<div class="form-section-title">📁 All Brand Guides</div>
${guides.length === 0 ? '<p class="text-dim">No brand guides yet. They auto-create when you make a Brand Kit, Service Brand, or Product Brand order.</p>' : ''}
<div class="card-grid">
${guides.map(g => renderBrandGuideCard(g)).join('')}
</div>
</div>

<div class="form-section">
<div class="form-section-title">📋 Activity Log</div>
<table class="data-table">
<thead><tr><th>Guide</th><th>Package</th><th>Client</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
${guides.length === 0 ? '<tr><td colspan="6" class="text-center opacity-50">No guides yet</td></tr>' : ''}
${guides.slice(-10).reverse().map(g => renderBrandGuideRow(g)).join('')}
</tbody>
</table>
</div>
    `;
}

function getGuideProgress(guide) {
    const dels = guide.deliverables || {};
    const total = Object.keys(dels).length;
    if (total === 0) return { pct: 0, done: 0, total: 0 };
    const done = Object.values(dels).filter(d => d.status === 'uploaded' || d.status === 'approved').length;
    return { pct: Math.round((done / total) * 100), done, total };
}

function renderBrandGuideCard(g) {
    const progress = getGuideProgress(g);
    const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == g.clientId) : null;
    const logo = g.deliverables?.['primary-logo']?.file;
    const colors = g.brandColors || ['#e63946', '#1d3557'];

    return `
<div class="client-card" style="cursor: pointer; position: relative;" onclick="openBrandGuideEditor(${g.id})">
<div class="client-card-header" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});">
${logo ? '<img alt="Brand logo" loading="lazy" src="' + logo + '" style="max-width: 80px; max-height: 50px; object-fit: contain;">' : '<span style="font-size: 28px; font-weight: 700;">' + (g.clientName?.charAt(0) || 'B') + '</span>'}
</div>
${g.status === 'revision_requested' ? '<div style="position: absolute; top: 8px; right: 8px; background: #f59e0b; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">REVISION</div>' : ''}
<div class="client-card-body">
<div class="client-card-name">${g.title || g.clientName}</div>
<div class="client-card-meta">${g.packageName || 'Brand Package'}</div>
<div style="margin: 8px 0;">
<div style="background: #333; border-radius: 4px; height: 6px; overflow: hidden;">
<div style="background: ${progress.pct === 100 ? '#2ecc71' : '#3b82f6'}; height: 100%; width: ${progress.pct}%; transition: width 0.3s;"></div>
</div>
<span style="font-size: 11px; color: rgba(255,255,255,0.5);">${progress.done}/${progress.total} deliverables (${progress.pct}%)</span>
</div>
<div class="client-card-btns mt-12">
<button class="bg-red text-white" onclick="event.stopPropagation(); openBrandGuideEditor(${g.id})">Open</button>
<button style="background: rgba(255,255,255,0.1); color: #fff;" onclick="event.stopPropagation(); sendBrandGuideToClient(${g.id})">Send</button>
</div>
</div>
</div>`;
}

function renderBrandGuideRow(g) {
    const progress = getGuideProgress(g);
    const isPaid = (typeof checkClientPaymentStatus === 'function') ? checkClientPaymentStatus(g.clientId) : false;
    return `<tr>
<td class="fw-600">${g.title}</td>
<td><span style="font-size: 12px; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 4px;">${g.packageName}</span></td>
<td>${g.clientName || 'N/A'}</td>
<td><div style="display: flex; align-items: center; gap: 8px;">
<div style="flex: 1; background: #333; border-radius: 4px; height: 6px; min-width: 60px;">
<div style="background: #3b82f6; height: 100%; width: ${progress.pct}%; border-radius: 4px;"></div>
</div><span style="font-size: 11px; white-space: nowrap;">${progress.pct}%</span></div></td>
<td><span class="status-badge ${g.status}">${(g.status || 'draft').replace('_', ' ')}</span></td>
<td>
<button class="btn-admin small" onclick="openBrandGuideEditor(${g.id})">Edit</button>
${g.status === 'approved' && isPaid ? '<button class="btn-admin small primary" onclick="deliverBrandGuidePackage(' + g.id + ')">Deliver</button>' : ''}
</td></tr>`;
}

function openBrandGuideEditor(id) {
    currentBrandGuideId = id;
    loadAdminBrandGuidePanel();
}

function closeBrandGuideEditor() {
    currentBrandGuideId = null;
    loadAdminBrandGuidePanel();
}

// Manual create modal (for when not auto-generated from order)
function showCreateBrandGuideModal() {
    const clientOpts = (typeof clients !== 'undefined') ? clients.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('') : '';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'bgCreateModal';
    modal.innerHTML = `
<div class="modal-content" style="max-width: 500px;">
<div class="modal-header"><h3>Create Brand Guide</h3>
<button onclick="document.getElementById('bgCreateModal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#fff;">×</button></div>
<div class="modal-body">
<div class="form-group"><label>Client</label>
<select id="bgClientSelect" class="form-control">${clientOpts}</select></div>
<div class="form-group"><label>Package Type</label>
<select id="bgPackageSelect" class="form-control">
<option value="brand-kit">Brand Kit ($1,500)</option>
<option value="service-brand">Service Brand Identity ($4,500)</option>
<option value="product-brand">Product Brand Identity ($5,500)</option>
</select></div>
<div class="form-group"><label>Project Name (optional)</label>
<input type="text" id="bgProjectName" class="form-control" placeholder="e.g. Spring 2026 Rebrand"></div>
<button class="btn-admin primary w-full" onclick="createManualBrandGuide()" style="width:100%;margin-top:16px;">Create Brand Guide</button>
</div></div>`;
    document.body.appendChild(modal);
}

function createManualBrandGuide() {
    const clientId = document.getElementById('bgClientSelect')?.value;
    const pkgKey = document.getElementById('bgPackageSelect')?.value;
    const projectName = document.getElementById('bgProjectName')?.value;
    const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == clientId) : null;

    if (!clientId || !pkgKey) { alert('Select a client and package.'); return; }

    const fakeOrder = {
        id: Date.now(),
        clientId: parseInt(clientId),
        clientName: client?.name,
        packageId: pkgKey,
        packageName: BRAND_GUIDE_PACKAGES[pkgKey]?.name || pkgKey,
        projectName: projectName || ''
    };

    const guide = autoCreateBrandGuide(fakeOrder, client);
    if (!guide) { alert('Guide already exists or invalid package.'); return; }

    document.getElementById('bgCreateModal')?.remove();
    openBrandGuideEditor(guide.id);
}
