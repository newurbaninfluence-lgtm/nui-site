// ==================== BRAND GUIDE EDITOR ====================
// Full editor with package-aware deliverable sections

function renderBrandGuideEditor(guideId) {
    const guides = getBrandGuides();
    const g = guides.find(x => x.id === guideId);
    if (!g) { closeBrandGuideEditor(); return; }

    const config = BRAND_GUIDE_PACKAGES[g.packageKey];
    if (!config) { closeBrandGuideEditor(); return; }

    const progress = getGuideProgress(g);
    const panel = document.getElementById('adminBrandguidePanel');

    panel.innerHTML = `
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
<button onclick="closeBrandGuideEditor()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #fff;">←</button>
<div style="flex: 1;">
<h2 class="panel-title" style="margin: 0;">${g.title}</h2>
<p class="panel-subtitle" style="margin: 4px 0 0;">${g.packageName} • ${progress.done}/${progress.total} deliverables complete (${progress.pct}%)</p>
</div>
<span class="status-badge ${g.status}" style="font-size: 13px;">${(g.status || 'draft').replace('_', ' ')}</span>
</div>

<div style="background: #333; border-radius: 6px; height: 8px; margin-bottom: 24px; overflow: hidden;">
<div style="background: linear-gradient(90deg, #e63946, #3b82f6); height: 100%; width: ${progress.pct}%; transition: width 0.5s;"></div>
</div>

<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
<button class="btn-admin primary" onclick="sendBrandGuideToClient(${g.id})">📤 Send to Client</button>
<button class="btn-admin secondary" onclick="deliverBrandGuidePackage(${g.id})">📦 Deliver Final</button>
<button class="btn-admin" style="background: rgba(255,255,255,0.08);" onclick="deleteBrandGuideConfirm(${g.id})">🗑 Delete</button>
</div>

${config.categories.map(cat => renderEditorCategory(g, cat)).join('')}

<div class="form-section" style="margin-top: 32px;">
<div class="form-section-title">💬 Comments & Revision Notes</div>
<div id="bgComments" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;">
${(g.comments || []).map(c => `
<div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
<div style="font-size: 11px; color: rgba(255,255,255,0.4);">${c.author} • ${new Date(c.date).toLocaleString()}</div>
<div style="margin-top: 4px;">${c.text}</div>
</div>`).join('') || '<p class="text-dim">No comments yet.</p>'}
</div>
<div style="display: flex; gap: 8px;">
<input type="text" id="bgCommentInput" class="form-control" placeholder="Add a note..." style="flex: 1;">
<button class="btn-admin primary" onclick="addBrandGuideComment(${g.id})">Add</button>
</div>
</div>
    `;
}

function renderEditorCategory(guide, cat) {
    const items = cat.items || [];
    const doneCount = items.filter(i => {
        const d = guide.deliverables?.[i.id];
        return d && (d.status === 'uploaded' || d.status === 'approved');
    }).length;

    return `
<div class="form-section" style="margin-bottom: 20px;">
<div class="form-section-title" style="display: flex; align-items: center; gap: 10px;">
<span style="font-size: 20px;">${cat.icon}</span>
<span>${cat.title}</span>
<span style="margin-left: auto; font-size: 12px; color: rgba(255,255,255,0.4);">${doneCount}/${items.length}</span>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
${items.map(item => renderDeliverableSlot(guide, item, cat.id)).join('')}
</div>
</div>`;
}

function renderDeliverableSlot(guide, item, catId) {
    const del = guide.deliverables?.[item.id] || { status: 'not-started', file: null };
    const statusColors = {
        'not-started': '#555', 'in-progress': '#f59e0b', 'uploaded': '#3b82f6', 'approved': '#2ecc71'
    };
    const statusLabel = (del.status || 'not-started').replace('-', ' ');
    const hasFile = !!del.file;

    // Special type: colors
    if (item.type === 'colors') {
        return `
<div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<strong style="font-size: 14px;">${item.name}</strong>
<span style="background: ${statusColors[del.status] || '#555'}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${statusLabel}</span>
</div>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
${(guide.brandColors || []).map((c, i) => `
<input type="color" value="${c}" onchange="updateBGColor(${guide.id}, ${i}, this.value)" style="width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
`).join('')}
<button onclick="addBGColor(${guide.id})" style="width: 40px; height: 40px; border: 1px dashed #555; border-radius: 8px; background: none; color: #888; cursor: pointer; font-size: 20px;">+</button>
</div></div>`;
    }

    // Special type: fonts
    if (item.type === 'fonts') {
        return `
<div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<strong style="font-size: 14px;">${item.name}</strong>
</div>
<input type="text" value="${guide.fonts?.heading || ''}" placeholder="Heading font" class="form-control" style="margin-bottom: 8px;" onchange="updateBGFont(${guide.id}, 'heading', this.value)">
<input type="text" value="${guide.fonts?.body || ''}" placeholder="Body font" class="form-control" onchange="updateBGFont(${guide.id}, 'body', this.value)">
</div>`;
    }

    // Special type: text (brand voice, target market)
    if (item.type === 'text') {
        const fieldKey = item.id === 'brand-voice' ? 'brandVoice' : 'targetMarket';
        return `
<div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<strong style="font-size: 14px;">${item.name}</strong>
<span style="background: ${guide[fieldKey] ? '#3b82f6' : '#555'}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${guide[fieldKey] ? 'done' : 'not started'}</span>
</div>
<textarea class="form-control" rows="3" placeholder="Enter ${item.name.toLowerCase()}..." onchange="updateBGTextField(${guide.id}, '${fieldKey}', this.value)">${guide[fieldKey] || ''}</textarea>
</div>`;
    }

    // Default: file upload slot
    return `
<div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<strong style="font-size: 14px;">${item.name}</strong>
<span style="background: ${statusColors[del.status] || '#555'}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${statusLabel}</span>
</div>
${item.formats ? `<div style="font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 8px;">Formats: ${item.formats}</div>` : ''}
${hasFile ? `
<div style="margin-bottom: 8px;">
${del.file.match(/\.(png|jpg|jpeg|gif|svg|webp)/i) ?
    `<img src="${del.file}" style="max-width: 100%; max-height: 120px; border-radius: 8px; object-fit: contain;" alt="${item.name}">` :
    `<a href="${del.file}" target="_blank" style="color: #3b82f6; font-size: 13px;">📎 View file</a>`
}
</div>
<div style="display: flex; gap: 8px;">
<select class="form-control" style="flex: 1; font-size: 12px;" value="${del.status}" onchange="updateBGDeliverableStatus(${guide.id}, '${item.id}', this.value)">
<option value="uploaded" ${del.status === 'uploaded' ? 'selected' : ''}>Uploaded</option>
<option value="approved" ${del.status === 'approved' ? 'selected' : ''}>Approved</option>
<option value="in-progress" ${del.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
</select>
<button class="btn-admin small" onclick="removeBGFile(${guide.id}, '${item.id}')">✕</button>
</div>
` : `
<label style="display: flex; align-items: center; justify-content: center; height: 80px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#e63946'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
<input type="file" style="display: none;" onchange="uploadBGFile(${guide.id}, '${item.id}', this)">
<span style="color: rgba(255,255,255,0.4); font-size: 13px;">Click to upload</span>
</label>
`}
</div>`;
}
