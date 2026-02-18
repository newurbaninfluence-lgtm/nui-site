function loadAdminAssetsPanel() {
    // Calculate storage stats
    const totalAssets = clients.reduce((sum, c) => {
        if (!c.assets) return sum;
        return sum + Object.values(c.assets).reduce((s, arr) => s + (arr?.length || 0), 0);
    }, 0);

    const clientsWithAssets = clients.filter(c => {
        if (!c.assets) return false;
        return Object.values(c.assets).some(arr => arr?.length > 0);
    });

    document.getElementById('adminAssetsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📁 Client Brand Asset Storage</h2>
<p class="panel-subtitle">Centralized storage for all client brand assets</p>
</div>

        <!-- Stats -->
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Total Assets</div><div class="stat-value">${totalAssets}</div></div>
<div class="stat-card"><div class="stat-label">Clients with Assets</div><div class="stat-value">${clientsWithAssets.length}</div></div>
<div class="stat-card"><div class="stat-label">Total Clients</div><div class="stat-value">${clients.length}</div></div>
<div class="stat-card"><div class="stat-label">Asset Categories</div><div class="stat-value">8</div></div>
</div>

        <!-- Client Selector -->
<div class="form-section">
<div class="form-section-title">📂 Select Client</div>
<div class="form-row">
<div class="form-group" style="flex: 2;">
<select id="assetClient" class="form-select" onchange="selectAssetClient(this.value)">
<option value="">-- Select Client to View/Upload Assets --</option>
                        ${clients.map(c => {
                            const assetCount = c.assets ? Object.values(c.assets).reduce((s, arr) => s + (arr?.length || 0), 0) : 0;
                            return '<option value="' + c.id + '">' + c.name + ' (' + assetCount + ' assets)</option>';
                        }).join('')}
</select>
</div>
<div class="form-group">
<button class="btn-admin primary" onclick="showBulkAssetUpload()">📤 Bulk Upload</button>
</div>
</div>
</div>

        <!-- Quick Access - Clients with Assets -->
<div class="form-section">
<div class="form-section-title">⭐ Quick Access - Clients with Assets</div>
            ${clientsWithAssets.length === 0 ? '<p class="text-dim">No clients have assets yet. Select a client above to start uploading.</p>' : ''}
<div class="flex-gap-12 flex-wrap">
                ${clientsWithAssets.slice(0, 10).map(c => {
                    const assetCount = Object.values(c.assets || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
                    const firstLogo = c.assets?.logos?.[0]?.data || '';
                    return `
<div onclick="selectAssetClient(${c.id})" style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; min-width: 200px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
<div style="width: 48px; height: 48px; border-radius: 8px; background: linear-gradient(135deg, ${c.colors?.[0] || '#ff3b30'}, ${c.colors?.[1] || '#000'}); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            ${firstLogo ? '<img alt="Client brand logo" loading="lazy" src="' + firstLogo + '" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;">' : '<span style="color: #fff; font-weight: 700;">' + c.name.charAt(0) + '</span>'}
</div>
<div>
<div class="text-bold-white">${c.name}</div>
<div class="text-dim fs-12">${assetCount} assets</div>
</div>
</div>
                `;}).join('')}
</div>
</div>

        <!-- Asset Upload Area -->
<div id="assetUploadArea"></div>

        <!-- All Clients Assets Overview -->
<div class="form-section mt-24">
<div class="form-section-title">📊 All Clients Asset Overview</div>
<table class="data-table">
<thead><tr><th>Client</th><th>Logos</th><th>Mockups</th><th>Social</th><th>Video</th><th>Fonts</th><th>Total</th><th>Actions</th></tr></thead>
<tbody>
                    ${clients.slice(0, 20).map(c => {
                        const a = c.assets || {};
                        const total = Object.values(a).reduce((s, arr) => s + (arr?.length || 0), 0);
                        return `
<tr>
<td class="fw-600">${c.name}</td>
<td>${a.logos?.length || 0}</td>
<td>${a.mockups?.length || 0}</td>
<td>${a.social?.length || 0}</td>
<td>${a.video?.length || 0}</td>
<td>${a.fonts?.length || 0}</td>
<td class="fw-600">${total}</td>
<td>
<button class="btn-admin small" onclick="selectAssetClient(${c.id})">View</button>
                                ${total > 0 ? '<button class="btn-admin small primary" onclick="downloadClientAssets(' + c.id + ')">Download</button>' : ''}
</td>
</tr>
                    `;}).join('')}
</tbody>
</table>
</div>
    `;
}

function selectAssetClient(clientId) {
    if (!clientId) {
        currentAdminClient = null;
        document.getElementById('assetUploadArea').innerHTML = '';
        return;
    }
    currentAdminClient = clients.find(c => c.id == clientId);
    document.getElementById('assetClient').value = clientId;
    renderAssetUpload();
}

function downloadClientAssets(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;

    const assetCount = Object.values(client.assets || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
    alert('Downloading ' + assetCount + ' assets for ' + client.name + '...\n\nIn production, this would generate a ZIP file with all brand assets organized by category.');
}

function renderAssetUpload() {
    if (!currentAdminClient) { document.getElementById('assetUploadArea').innerHTML = ''; return; }

    // Initialize assets object if it doesn't exist
    if (!currentAdminClient.assets) {
        currentAdminClient.assets = {};
    }

    const categories = ['logos', 'video', 'mockups', 'social', 'banner', 'fonts', 'patterns', 'package'];
    const currentAssets = currentAdminClient.assets[assetCategory] || [];
    const categoryName = assetCategory ? assetCategory.charAt(0).toUpperCase() + assetCategory.slice(1) : 'Assets';

    document.getElementById('assetUploadArea').innerHTML = `
<div class="category-tabs">${categories.map(cat => `<button class="category-tab ${assetCategory === cat ? 'active' : ''}" onclick="assetCategory='${cat}'; renderAssetUpload();">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`).join('')}</div>
<div class="upload-zone" onclick="document.getElementById('assetFile').click();" ondragover="event.preventDefault(); this.style.borderColor='var(--red)';" ondragleave="this.style.borderColor='#ccc';" ondrop="handleAssetDrop(event);">
<p>Drag & drop files here or <span>browse</span></p>
<small>PNG, JPG, SVG, MP4, ZIP supported</small>
<input type="file" id="assetFile" class="hidden" multiple onchange="handleAssetUpload(event)">
</div>
<h3 class="mb-16">Current ${categoryName} (${currentAssets.length})</h3>
<div class="assets-grid">${currentAssets.map((a, i) => `
<div class="asset-card">
<div class="asset-preview">${a.data && a.data.startsWith('data:image') ? `<img alt="Brand asset preview" loading="lazy" src="${a.data}">` : a.type}</div>
<div class="asset-info"><div class="asset-name">${a.name}</div><div class="asset-meta">${a.size} • ${a.type}</div></div>
<div style="padding: 0 12px 12px;"><button onclick="deleteAsset(${i})" style="width: 100%; padding: 8px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Delete</button></div>
</div>
        `).join('') || '<p style="color: #888; grid-column: 1/-1; text-align: center; padding: 40px;">No assets yet</p>'}</div>
    `;
}

function handleAssetUpload(e) {
    if (!currentAdminClient) return;

    // Initialize assets object if it doesn't exist
    if (!currentAdminClient.assets) {
        currentAdminClient.assets = {};
    }

    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (!currentAdminClient.assets[assetCategory]) currentAdminClient.assets[assetCategory] = [];
            currentAdminClient.assets[assetCategory].push({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.name.split('.').pop().toUpperCase(),
                data: ev.target.result,
                uploadedAt: new Date().toISOString()
            });
            saveClients();
            renderAssetUpload();
        };
        reader.readAsDataURL(file);
    });
}

function handleAssetDrop(e) {
    e.preventDefault();
    e.target.style.borderColor = '#ccc';
    if (e.dataTransfer.files.length) {
        document.getElementById('assetFile').files = e.dataTransfer.files;
        handleAssetUpload({ target: { files: e.dataTransfer.files } });
    }
}

function deleteAsset(index) {
    if (!confirm('Delete this asset?')) return;
    if (currentAdminClient && currentAdminClient.assets && currentAdminClient.assets[assetCategory]) {
        currentAdminClient.assets[assetCategory].splice(index, 1);
        saveClients();
        renderAssetUpload();
    }
}


