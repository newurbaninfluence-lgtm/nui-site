// ═══════════════════════════════════════════════════════════════
// MEDIA MANAGER PANEL
// Manage live site images & videos via Cloudinary + Supabase slots
// Each "slot" = a named placeholder on the site (hero-image, etc.)
// Uploading a new file updates the slot URL → change goes live instantly
// ═══════════════════════════════════════════════════════════════

function loadAdminMediaPanel() {
    const panel = document.getElementById('adminMediaPanel');
    panel.innerHTML = `
<div class="panel-header">
  <h2 class="panel-title">🖼️ Media Manager</h2>
  <p class="panel-subtitle">Replace site images & videos — changes go live instantly, no redeploy needed</p>
</div>

<div class="stats-grid" id="mediaStatsGrid">
  <div class="stat-card"><div class="stat-label">Total Slots</div><div class="stat-value" id="mediaStatTotal">—</div></div>
  <div class="stat-card"><div class="stat-label">Filled</div><div class="stat-value" id="mediaStatFilled">—</div></div>
  <div class="stat-card"><div class="stat-label">Empty</div><div class="stat-value" id="mediaStatEmpty">—</div></div>
  <div class="stat-card"><div class="stat-label">Last Updated</div><div class="stat-value" id="mediaStatLast">—</div></div>
</div>

<div class="form-section">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div class="form-section-title" style="margin:0">📂 Site Media Slots</div>
    <div style="display:flex;gap:8px;align-items:center">
      <select id="mediaFilterType" class="form-select" style="width:auto;padding:6px 12px;font-size:13px" onchange="renderMediaSlots()">
        <option value="all">All Types</option>
        <option value="image">Images Only</option>
        <option value="video">Videos Only</option>
      </select>
      <select id="mediaFilterStatus" class="form-select" style="width:auto;padding:6px 12px;font-size:13px" onchange="renderMediaSlots()">
        <option value="all">All Slots</option>
        <option value="filled">Filled</option>
        <option value="empty">Empty</option>
      </select>
    </div>
  </div>
  <div id="mediaSlotsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px"></div>
</div>

<div id="mediaToast" style="display:none;position:fixed;bottom:24px;right:24px;background:#4caf6e;color:#000;padding:12px 20px;border-radius:10px;font-weight:700;font-size:14px;z-index:9999"></div>
`;
    _loadMediaSlots();
}

// ── State ───────────────────────────────────────────────────────
let _mediaSlots = [];

async function _loadMediaSlots() {
    // Determine site ID — use current agency slug or fallback
    const siteId = (typeof currentAgencySlug !== 'undefined' && currentAgencySlug) ? currentAgencySlug : 'nui-site';

    try {
        const res = await fetch(`/.netlify/functions/media-slots?siteId=${siteId}`);
        const data = await res.json();
        _mediaSlots = Array.isArray(data) ? data : [];
    } catch (e) {
        _mediaSlots = [];
    }

    // Update stats
    const filled = _mediaSlots.filter(s => s.cloudinary_url).length;
    const lastUpdated = _mediaSlots
        .filter(s => s.updated_at)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

    document.getElementById('mediaStatTotal').textContent = _mediaSlots.length;
    document.getElementById('mediaStatFilled').textContent = filled;
    document.getElementById('mediaStatEmpty').textContent = _mediaSlots.length - filled;
    document.getElementById('mediaStatLast').textContent = lastUpdated
        ? new Date(lastUpdated.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Never';

    renderMediaSlots();
}

function renderMediaSlots() {
    const typeFilter  = document.getElementById('mediaFilterType')?.value  || 'all';
    const statusFilter = document.getElementById('mediaFilterStatus')?.value || 'all';

    let slots = _mediaSlots.filter(s => {
        if (typeFilter   !== 'all' && s.media_type !== typeFilter) return false;
        if (statusFilter === 'filled' && !s.cloudinary_url) return false;
        if (statusFilter === 'empty'  &&  s.cloudinary_url) return false;
        return true;
    });

    const grid = document.getElementById('mediaSlotsGrid');
    if (!grid) return;

    if (slots.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:#888">
            ${_mediaSlots.length === 0
                ? '⚠️ No slots found for this site. Add slots via <code>/.netlify/functions/media-slots</code>.'
                : 'No slots match the current filter.'}
        </div>`;
        return;
    }

    grid.innerHTML = slots.map(slot => {
        const hasFill = !!slot.cloudinary_url;
        const isVideo = slot.media_type === 'video';
        const preview = hasFill
            ? (isVideo
                ? `<video src="${slot.cloudinary_url}" style="width:100%;height:160px;object-fit:cover;display:block;background:#111" muted playsinline></video>`
                : `<img src="${slot.cloudinary_url}" alt="${slot.label}" style="width:100%;height:160px;object-fit:cover;display:block" loading="lazy" />`)
            : `<div style="width:100%;height:160px;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#555">
                <span style="font-size:2rem">${isVideo ? '🎬' : '🖼️'}</span>
                <span style="font-size:12px">No ${isVideo ? 'video' : 'image'} yet</span>
               </div>`;

        return `
<div style="background:#1c1c1c;border:1px solid ${hasFill ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'};border-radius:12px;overflow:hidden;transition:border-color 0.2s"
     onmouseover="this.style.borderColor='rgba(201,168,76,0.4)'" onmouseout="this.style.borderColor='${hasFill ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}'">
  ${preview}
  <div style="padding:14px">
    <div style="font-weight:700;font-size:14px;margin-bottom:3px">${slot.label || slot.slot_key}</div>
    <div style="font-size:11px;color:#555;font-family:monospace;margin-bottom:10px">${slot.slot_key}</div>
    ${hasFill ? `<div style="font-size:11px;color:#555;word-break:break-all;margin-bottom:10px;max-height:32px;overflow:hidden">${slot.cloudinary_url}</div>` : ''}
    <div style="display:flex;gap:8px">
      <button class="btn-admin primary" style="flex:1;font-size:12px;padding:8px 0" onclick="mediaManagerUpload('${slot.slot_key}','${slot.media_type || 'image'}','${slot.label || slot.slot_key}')">
        ${hasFill ? '🔄 Replace' : '⬆️ Upload'}
      </button>
      ${hasFill ? `<button class="btn-admin" style="font-size:12px;padding:8px 12px" onclick="mediaManagerCopyUrl('${slot.cloudinary_url}')">Copy URL</button>` : ''}
    </div>
    <div id="mediaProg_${slot.slot_key}" style="display:none;margin-top:8px;height:4px;background:#2a2a2a;border-radius:4px;overflow:hidden">
      <div id="mediaProgBar_${slot.slot_key}" style="height:100%;background:#c9a84c;width:0%;transition:width 0.3s"></div>
    </div>
  </div>
</div>
<input type="file" id="mediaFile_${slot.slot_key}"
  accept="${(slot.media_type || 'image') === 'video' ? 'video/*' : 'image/*'}"
  style="display:none"
  onchange="mediaManagerHandleUpload(event,'${slot.slot_key}','${slot.label || slot.slot_key}','${slot.media_type || 'image'}')" />`;
    }).join('');
}

// ── Upload flow ─────────────────────────────────────────────────
function mediaManagerUpload(slotKey, mediaType, label) {
    document.getElementById(`mediaFile_${slotKey}`)?.click();
}

async function mediaManagerHandleUpload(event, slotKey, label, mediaType) {
    const file = event.target.files[0];
    if (!file) return;

    const siteId = (typeof currentAgencySlug !== 'undefined' && currentAgencySlug) ? currentAgencySlug : 'nui-site';

    const progWrap = document.getElementById(`mediaProg_${slotKey}`);
    const progBar  = document.getElementById(`mediaProgBar_${slotKey}`);
    if (progWrap) progWrap.style.display = 'block';
    if (progBar)  progBar.style.width = '25%';

    try {
        const base64 = await _fileToBase64(file);
        if (progBar) progBar.style.width = '55%';

        const res = await fetch('/.netlify/functions/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, folder: 'sites', slotKey, siteId, label, mediaType })
        });

        if (progBar) progBar.style.width = '100%';
        const data = await res.json();

        if (data.url) {
            _mediaToast(`✅ "${label}" updated! Live on site now.`);
            setTimeout(() => {
                if (progWrap) progWrap.style.display = 'none';
                _loadMediaSlots();
            }, 900);
        } else {
            _mediaToast('❌ Upload failed — check Cloudinary env vars.', true);
            if (progWrap) progWrap.style.display = 'none';
        }
    } catch (err) {
        _mediaToast('❌ Upload error: ' + err.message, true);
        if (progWrap) progWrap.style.display = 'none';
    }
}

function mediaManagerCopyUrl(url) {
    navigator.clipboard.writeText(url).then(() => _mediaToast('📋 URL copied!'));
}

function _fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function _mediaToast(msg, isError = false) {
    const t = document.getElementById('mediaToast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = isError ? '#e05a5a' : '#4caf6e';
    t.style.color = isError ? '#fff' : '#000';
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
}
