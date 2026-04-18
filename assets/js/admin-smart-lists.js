// admin-smart-lists.js — Smart Lists tab for Contact Hub
// Create/edit saved filter definitions, preview matches, send targeted email/SMS.
// Global fetch is auto-patched by admin-auth.js to include X-Admin-Token.

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ══════════════════════════════════════════════════════════════════
  const CATEGORY_PRESETS = [
    { value: 'restaurant',     label: '🍽️ Restaurant' },
    { value: 'cafe',           label: '☕ Cafe / Coffee' },
    { value: 'salon',          label: '💇 Salon' },
    { value: 'barbershop',     label: '💈 Barbershop' },
    { value: 'retail',         label: '🛍️ Retail' },
    { value: 'ecommerce',      label: '📦 E-commerce' },
    { value: 'photography',    label: '📸 Photography' },
    { value: 'videography',    label: '🎥 Videography' },
    { value: 'law',            label: '⚖️ Law Firm' },
    { value: 'real_estate',    label: '🏠 Real Estate' },
    { value: 'healthcare',     label: '🏥 Healthcare' },
    { value: 'dental',         label: '🦷 Dental' },
    { value: 'fitness',        label: '💪 Fitness / Gym' },
    { value: 'trades',         label: '🔧 Trades' },
    { value: 'construction',   label: '🏗️ Construction' },
    { value: 'automotive',     label: '🚗 Automotive' },
    { value: 'nonprofit',      label: '❤️ Nonprofit' },
    { value: 'tech',           label: '💻 Tech' },
    { value: 'saas',           label: '☁️ SaaS' },
    { value: 'agency',         label: '🎨 Agency' },
    { value: 'consulting',     label: '🧠 Consulting' },
    { value: 'education',      label: '🎓 Education' },
    { value: 'event_planning', label: '🎉 Event Planning' },
    { value: 'catering',       label: '🍱 Catering' },
    { value: 'music',          label: '🎵 Music' },
    { value: 'fashion',        label: '👗 Fashion' },
    { value: 'beauty',         label: '💄 Beauty' },
    { value: 'home_services',  label: '🏠 Home Services' },
    { value: 'cleaning',       label: '🧹 Cleaning' },
    { value: 'landscaping',    label: '🌱 Landscaping' },
    { value: 'financial',      label: '💰 Financial' },
    { value: 'accounting',     label: '📊 Accounting' },
    { value: 'other',          label: '📌 Other' }
  ];
  const ICON_OPTIONS = ['📋','🎯','💼','🔥','⭐','🚀','💎','🎨','📧','💬','🏆','🧲','🌟','🎁','📊'];
  const COLOR_OPTIONS = ['#dc2626','#ea580c','#d97706','#65a30d','#16a34a','#0891b2','#2563eb','#7c3aed','#c026d3','#db2777'];

  // ══════════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════════
  const state = {
    lists: [],
    loaded: false,
    loading: false,
    builder: null,       // { editing: {...} | null, filters, name, description, icon, color, preview: null }
    classifyStatus: null // { running, total, done, remaining, message }
  };

  async function fetchLists() {
    state.loading = true;
    try {
      const r = await fetch('/.netlify/functions/smart-lists', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load lists');
      state.lists = data.lists || [];
      state.loaded = true;
    } catch (e) {
      console.error('[smart-lists] fetch:', e);
      alert('Failed to load smart lists: ' + e.message);
    } finally {
      state.loading = false;
    }
  }

  async function apiCall(action, payload = {}) {
    const r = await fetch('/.netlify/functions/smart-lists', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `${action} failed`);
    return data;
  }

  async function fetchClassifyStats() {
    try {
      const db = window.adminDb || (window.getAdminDb && window.getAdminDb()) || null;
      if (!db) return null;
      const [{ count: total }, { count: classified }, { count: withCompany }] = await Promise.all([
        db.from('crm_contacts').select('id', { count: 'exact', head: true }),
        db.from('crm_contacts').select('id', { count: 'exact', head: true }).not('business_type','is',null),
        db.from('crm_contacts').select('id', { count: 'exact', head: true }).not('company','is',null).neq('company','')
      ]);
      return { total: total || 0, classified: classified || 0, withCompany: withCompany || 0 };
    } catch (e) { return null; }
  }

  // ══════════════════════════════════════════════════════════════════
  // MAIN TAB RENDER
  // ══════════════════════════════════════════════════════════════════
  window.renderSmartListsTab = async function renderSmartListsTab() {
    if (!state.loaded && !state.loading) await fetchLists();
    const stats = await fetchClassifyStats();
    const container = document.getElementById('smartListsTabContent');
    if (!container) return;

    const classifiedPct = stats && stats.withCompany
      ? Math.round((stats.classified / stats.withCompany) * 100) : 0;

    container.innerHTML = `
      <div style="padding:24px;">
        <!-- Header / actions -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 style="margin:0 0 4px 0;font-size:22px;color:#fff;font-weight:700;">🎯 Smart Lists</h2>
            <div style="font-size:13px;color:rgba(255,255,255,0.5);">Save contact filters, send targeted email &amp; SMS campaigns.</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="openSmartListBuilder()" style="padding:10px 18px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;">+ New List</button>
            <button onclick="openAiClassifier()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;">🤖 AI Classify</button>
            <button onclick="fetchSmartListsAndRender()" style="padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">🔄</button>
          </div>
        </div>

        <!-- Classification status banner -->
        ${stats ? `
          <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="font-size:22px;">🏷️</div>
              <div>
                <div style="font-size:13px;color:#fff;font-weight:600;">
                  ${stats.classified.toLocaleString()} of ${stats.withCompany.toLocaleString()} contacts classified
                  <span style="color:rgba(255,255,255,0.4);font-weight:400;"> (${classifiedPct}%)</span>
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">
                  ${stats.withCompany - stats.classified > 0 ? (stats.withCompany - stats.classified).toLocaleString() + ' remaining with company names · ' : ''}
                  ${(stats.total - stats.withCompany).toLocaleString()} with no company (skipped)
                </div>
              </div>
            </div>
            <div style="flex:1;min-width:200px;max-width:400px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
              <div style="width:${classifiedPct}%;height:100%;background:linear-gradient(90deg,#dc2626,#ea580c);"></div>
            </div>
          </div>
        ` : ''}

        <!-- Lists grid -->
        ${state.lists.length === 0 ? `
          <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.4);border:1px dashed rgba(255,255,255,0.1);border-radius:12px;">
            <div style="font-size:48px;margin-bottom:12px;">📋</div>
            <div style="font-size:16px;margin-bottom:8px;color:#fff;">No smart lists yet</div>
            <div style="font-size:13px;margin-bottom:20px;">Create filtered contact groups for targeted campaigns.</div>
            <button onclick="openSmartListBuilder()" style="padding:12px 24px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;">Create Your First List</button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
            ${state.lists.map(renderListCard).join('')}
          </div>
        `}
      </div>
    `;
  };

  function renderListCard(list) {
    const f = list.filters || {};
    const chips = [];
    if (f.business_type) chips.push(...(Array.isArray(f.business_type) ? f.business_type : [f.business_type]).map(v => `<span style="padding:2px 8px;background:rgba(220,38,38,0.15);color:#fca5a5;border-radius:10px;font-size:10px;text-transform:uppercase;font-weight:600;">${_esc(v)}</span>`));
    if (f.business_category) {
      const cats = Array.isArray(f.business_category) ? f.business_category : [f.business_category];
      cats.slice(0,3).forEach(v => chips.push(`<span style="padding:2px 8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);border-radius:10px;font-size:10px;">${_esc(_catLabel(v))}</span>`));
      if (cats.length > 3) chips.push(`<span style="font-size:10px;color:rgba(255,255,255,0.4);">+${cats.length-3}</span>`);
    }
    if (f.has_email) chips.push(`<span style="padding:2px 8px;background:rgba(37,99,235,0.15);color:#93c5fd;border-radius:10px;font-size:10px;">📧</span>`);
    if (f.has_phone) chips.push(`<span style="padding:2px 8px;background:rgba(22,163,74,0.15);color:#86efac;border-radius:10px;font-size:10px;">📱</span>`);

    return `
      <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;position:relative;transition:border-color 0.15s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
        <div style="display:flex;align-items:start;gap:12px;margin-bottom:14px;">
          <div style="width:40px;height:40px;background:${_esc(list.color || '#dc2626')};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${_esc(list.icon || '📋')}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;color:#fff;font-weight:700;margin-bottom:2px;word-break:break-word;">${_esc(list.name)}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);">${list.contact_count || 0} contact${list.contact_count === 1 ? '' : 's'}${list.last_refreshed_at ? ' · refreshed ' + _timeAgo(list.last_refreshed_at) : ''}</div>
          </div>
        </div>
        ${list.description ? `<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:12px;line-height:1.4;">${_esc(list.description)}</div>` : ''}
        ${chips.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">${chips.join('')}</div>` : ''}
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="sendEmailToSmartList('${list.id}')" style="flex:1;min-width:80px;padding:8px 10px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-family:inherit;">📧 Email</button>
          <button onclick="sendSmsToSmartList('${list.id}')" style="flex:1;min-width:80px;padding:8px 10px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-family:inherit;">💬 SMS</button>
          <button onclick="refreshSmartList('${list.id}')" title="Refresh count" style="padding:8px 10px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-family:inherit;">🔄</button>
          <button onclick="openSmartListBuilder('${list.id}')" title="Edit" style="padding:8px 10px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-family:inherit;">✏️</button>
          <button onclick="deleteSmartList('${list.id}')" title="Delete" style="padding:8px 10px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#ef4444;font-size:12px;cursor:pointer;font-family:inherit;">🗑</button>
        </div>
      </div>
    `;
  }

  window.fetchSmartListsAndRender = async function () {
    state.loaded = false;
    await fetchLists();
    window.renderSmartListsTab();
  };

  window.refreshSmartList = async function (id) {
    try {
      const { list } = await apiCall('refresh', { id });
      const idx = state.lists.findIndex(l => l.id === id);
      if (idx >= 0) state.lists[idx] = list;
      window.renderSmartListsTab();
    } catch (e) { alert('Refresh failed: ' + e.message); }
  };

  window.deleteSmartList = async function (id) {
    const list = state.lists.find(l => l.id === id);
    if (!confirm(`Delete "${list ? list.name : 'this list'}"?\n\nThis only deletes the filter, not the contacts.`)) return;
    try {
      await apiCall('delete', { id });
      state.lists = state.lists.filter(l => l.id !== id);
      window.renderSmartListsTab();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  // ══════════════════════════════════════════════════════════════════
  // BUILDER MODAL
  // ══════════════════════════════════════════════════════════════════
  window.openSmartListBuilder = function (id) {
    const existing = id ? state.lists.find(l => l.id === id) : null;
    state.builder = {
      editing: existing,
      name: existing ? existing.name : '',
      description: existing ? (existing.description || '') : '',
      icon: existing ? (existing.icon || '📋') : '📋',
      color: existing ? (existing.color || '#dc2626') : '#dc2626',
      filters: existing ? JSON.parse(JSON.stringify(existing.filters || {})) : {
        business_type: [],
        business_category: [],
        has_email: true,
        has_phone: false
      },
      preview: null,
      previewLoading: false
    };
    renderBuilder();
    schedulePreview();
  };

  function renderBuilder() {
    const b = state.builder;
    if (!b) return;
    let modal = document.getElementById('smartListBuilderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'smartListBuilderModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
      document.body.appendChild(modal);
    }

    const cats = b.filters.business_category || [];
    const types = b.filters.business_type || [];

    modal.innerHTML = `
      <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;font-family:inherit;">
        <!-- Header -->
        <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#0a0a0a;z-index:1;">
          <div style="font-size:17px;font-weight:700;color:#fff;">${b.editing ? 'Edit Smart List' : 'New Smart List'}</div>
          <button onclick="closeSmartListBuilder()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;cursor:pointer;padding:4px 8px;">×</button>
        </div>

        <div style="padding:24px;display:grid;grid-template-columns:1fr 280px;gap:24px;">
          <!-- LEFT: form -->
          <div>
            <!-- Identity row -->
            <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:18px;">
              <div style="width:64px;">
                <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Icon</div>
                <button onclick="toggleIconPicker()" style="width:64px;height:64px;background:${_esc(b.color)};border:none;border-radius:12px;font-size:26px;cursor:pointer;">${_esc(b.icon)}</button>
              </div>
              <div style="flex:1;">
                <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Name *</div>
                <input id="slb_name" value="${_esc(b.name)}" placeholder="e.g. Detroit Restaurants" oninput="state_slb_update('name', this.value)"
                  style="width:100%;padding:12px 14px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;box-sizing:border-box;">
              </div>
            </div>

            <div id="slb_iconPicker" style="display:none;margin-bottom:14px;padding:12px;background:#111;border-radius:8px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;">Pick an icon</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
                ${ICON_OPTIONS.map(i => `<button onclick="state_slb_update('icon','${i}');renderBuilder();" style="width:36px;height:36px;background:${b.icon === i ? _esc(b.color) : 'rgba(255,255,255,0.05)'};border:none;border-radius:6px;font-size:18px;cursor:pointer;">${i}</button>`).join('')}
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;">Color</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${COLOR_OPTIONS.map(c => `<button onclick="state_slb_update('color','${c}');renderBuilder();" style="width:28px;height:28px;background:${c};border:${b.color === c ? '3px solid #fff' : 'none'};border-radius:6px;cursor:pointer;"></button>`).join('')}
              </div>
            </div>

            <!-- Description -->
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Description (optional)</div>
              <input value="${_esc(b.description)}" placeholder="e.g. Service businesses in food/hospitality" oninput="state_slb_update('description', this.value)"
                style="width:100%;padding:10px 12px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:13px;box-sizing:border-box;">
            </div>

            <!-- Business Type -->
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Business Type</div>
              <div style="display:flex;gap:8px;">
                ${['service','product','both'].map(t => `
                  <button onclick="toggleSlbArray('business_type','${t}')" style="flex:1;padding:10px;background:${types.includes(t) ? _esc(b.color) : '#111'};border:1px solid ${types.includes(t) ? _esc(b.color) : 'rgba(255,255,255,0.1)'};border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;text-transform:capitalize;">${t}</button>
                `).join('')}
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;">Leave empty to match all types.</div>
            </div>

            <!-- Business Category -->
            <div style="margin-bottom:20px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;">Categories</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);">${cats.length} selected</div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;max-height:180px;overflow-y:auto;padding:4px;">
                ${CATEGORY_PRESETS.map(c => `
                  <button onclick="toggleSlbArray('business_category','${c.value}')" style="padding:6px 10px;background:${cats.includes(c.value) ? _esc(b.color) : '#111'};border:1px solid ${cats.includes(c.value) ? _esc(b.color) : 'rgba(255,255,255,0.1)'};border-radius:14px;color:#fff;font-size:11px;cursor:pointer;font-family:inherit;">${c.label}</button>
                `).join('')}
              </div>
              <div style="display:flex;gap:6px;">
                <input id="slb_customCat" placeholder="Add custom category (e.g. food_truck)" onkeypress="if(event.key==='Enter'){addCustomCategory();event.preventDefault();}"
                  style="flex:1;padding:8px 10px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:12px;box-sizing:border-box;">
                <button onclick="addCustomCategory()" style="padding:8px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;cursor:pointer;font-family:inherit;font-size:12px;">+ Add</button>
              </div>
              ${cats.filter(c => !CATEGORY_PRESETS.find(p => p.value === c)).length ? `
                <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4);">Custom: ${cats.filter(c => !CATEGORY_PRESETS.find(p => p.value === c)).map(c => _esc(c)).join(', ')}</div>
              ` : ''}
            </div>

            <!-- Contact Requirements -->
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Contact Requirements</div>
              <label style="display:flex;align-items:center;gap:10px;padding:10px;background:#111;border-radius:8px;margin-bottom:6px;cursor:pointer;">
                <input type="checkbox" ${b.filters.has_email ? 'checked' : ''} onchange="state_slb_updateFilter('has_email', this.checked)" style="width:16px;height:16px;accent-color:${_esc(b.color)};">
                <span style="color:#fff;font-size:13px;">📧 Must have email (excludes unsubscribes + bounces)</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;padding:10px;background:#111;border-radius:8px;cursor:pointer;">
                <input type="checkbox" ${b.filters.has_phone ? 'checked' : ''} onchange="state_slb_updateFilter('has_phone', this.checked)" style="width:16px;height:16px;accent-color:${_esc(b.color)};">
                <span style="color:#fff;font-size:13px;">📱 Must have phone number</span>
              </label>
            </div>
          </div>

          <!-- RIGHT: live preview -->
          <div style="border-left:1px solid rgba(255,255,255,0.08);padding-left:20px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Live Preview</div>
            <div id="slb_preview" style="background:#111;border-radius:10px;padding:16px;min-height:200px;">
              ${renderPreview()}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;gap:12px;position:sticky;bottom:0;background:#0a0a0a;">
          ${b.editing ? `<button onclick="deleteSmartList('${b.editing.id}');closeSmartListBuilder();" style="padding:10px 16px;background:none;border:none;color:#ef4444;cursor:pointer;font-family:inherit;font-size:13px;">🗑 Delete</button>` : '<div></div>'}
          <div style="display:flex;gap:10px;">
            <button onclick="closeSmartListBuilder()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">Cancel</button>
            <button onclick="saveSmartListFromBuilder()" style="padding:10px 22px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;">${b.editing ? 'Save Changes' : 'Create List'}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreview() {
    const b = state.builder;
    if (!b) return '';
    if (b.previewLoading) return '<div style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;padding:24px;">Counting matches…</div>';
    if (!b.preview)       return '<div style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;padding:24px;">Configure filters to preview matches.</div>';
    const { count, sample } = b.preview;
    if (count === 0) return '<div style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;padding:24px;">No contacts match.<br>Loosen your filters.</div>';
    return `
      <div style="font-size:32px;font-weight:800;color:#fff;text-align:center;margin-bottom:4px;">${count.toLocaleString()}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:16px;">contact${count === 1 ? '' : 's'} match</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Sample</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${(sample || []).slice(0, 8).map(c => `
          <div style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:12px;">
            <div style="color:#fff;font-weight:600;">${_esc(c.first_name || '')} ${_esc(c.last_name || '')}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;">${_esc(c.company || c.email || c.phone || '—')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Debounced preview
  let previewTimer = null;
  function schedulePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    const b = state.builder; if (!b) return;
    b.previewLoading = true;
    const preview = document.getElementById('slb_preview');
    if (preview) preview.innerHTML = renderPreview();
    previewTimer = setTimeout(async () => {
      try {
        const data = await apiCall('preview', { filters: _normalizeFilters(b.filters), limit: 10 });
        b.preview = data; b.previewLoading = false;
      } catch (e) {
        b.preview = { count: 0, sample: [], error: e.message };
        b.previewLoading = false;
      }
      const preview2 = document.getElementById('slb_preview');
      if (preview2) preview2.innerHTML = renderPreview();
    }, 300);
  }

  window.state_slb_update = function (key, val) { if (state.builder) { state.builder[key] = val; } };

  window.state_slb_updateFilter = function (key, val) {
    if (!state.builder) return;
    state.builder.filters[key] = val;
    schedulePreview();
  };

  window.toggleSlbArray = function (key, val) {
    if (!state.builder) return;
    const arr = state.builder.filters[key] || [];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    state.builder.filters[key] = arr;
    renderBuilder();
    schedulePreview();
  };

  window.addCustomCategory = function () {
    const input = document.getElementById('slb_customCat');
    if (!input) return;
    const val = input.value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'_');
    if (!val) return;
    if (!state.builder.filters.business_category) state.builder.filters.business_category = [];
    if (!state.builder.filters.business_category.includes(val)) state.builder.filters.business_category.push(val);
    input.value = '';
    renderBuilder();
    schedulePreview();
  };

  window.toggleIconPicker = function () {
    const picker = document.getElementById('slb_iconPicker');
    if (picker) picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
  };

  window.closeSmartListBuilder = function () {
    const modal = document.getElementById('smartListBuilderModal');
    if (modal) modal.remove();
    state.builder = null;
  };

  window.saveSmartListFromBuilder = async function () {
    const b = state.builder;
    if (!b) return;
    if (!b.name.trim()) { alert('Name is required.'); return; }
    try {
      const payload = {
        name: b.name.trim(),
        description: b.description.trim() || null,
        icon: b.icon, color: b.color,
        filters: _normalizeFilters(b.filters)
      };
      if (b.editing) {
        await apiCall('update', { id: b.editing.id, ...payload });
      } else {
        await apiCall('create', payload);
      }
      window.closeSmartListBuilder();
      await fetchLists();
      window.renderSmartListsTab();
    } catch (e) { alert('Save failed: ' + e.message); }
  };

  // ══════════════════════════════════════════════════════════════════
  // EMAIL / SMS SENDERS
  // ══════════════════════════════════════════════════════════════════
  window.sendEmailToSmartList = async function (listId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    openSenderModal('email', list);
  };

  window.sendSmsToSmartList = async function (listId) {
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;
    openSenderModal('sms', list);
  };

  function openSenderModal(channel, list) {
    const isEmail = channel === 'email';
    let modal = document.getElementById('smartListSenderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'smartListSenderModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;font-family:inherit;">
        <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:17px;font-weight:700;color:#fff;">${isEmail ? '📧 Email' : '💬 SMS'} Campaign — ${_esc(list.name)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">Loading recipient count…</div>
          </div>
          <button onclick="document.getElementById('smartListSenderModal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;cursor:pointer;">×</button>
        </div>
        <div id="slSenderBody" style="padding:24px;"><div style="color:rgba(255,255,255,0.4);text-align:center;padding:40px;">Loading recipients…</div></div>
      </div>
    `;

    // Fetch recipients then render compose form
    (async () => {
      try {
        const requireField = isEmail ? 'has_email' : 'has_phone';
        const mergedFilters = { ..._normalizeFilters(list.filters || {}) };
        mergedFilters[requireField] = true;
        const { count, contacts } = await apiCall('match', { filters: mergedFilters, limit: 5000 });
        const body = document.getElementById('slSenderBody');
        if (!body) return;
        body.innerHTML = renderSenderForm(channel, list, count, contacts);
      } catch (e) {
        const body = document.getElementById('slSenderBody');
        if (body) body.innerHTML = `<div style="color:#ef4444;text-align:center;padding:24px;">Error: ${_esc(e.message)}</div>`;
      }
    })();
  }

  function renderSenderForm(channel, list, count, contacts) {
    const isEmail = channel === 'email';
    if (count === 0) {
      return `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.4);">
        <div style="font-size:40px;margin-bottom:10px;">🚫</div>
        <div>No contacts in this list have ${isEmail ? 'an email address' : 'a phone number'}.</div>
      </div>`;
    }
    return `
      <div style="background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.3);border-radius:8px;padding:12px 14px;margin-bottom:18px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;">${isEmail ? '📧' : '💬'}</div>
        <div style="font-size:13px;color:#fff;">
          Sending to <strong>${count.toLocaleString()}</strong> ${isEmail ? 'email addresses' : 'phone numbers'}
        </div>
      </div>
      ${isEmail ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Subject *</div>
          <input id="slSubject" placeholder="Subject line" style="width:100%;padding:12px 14px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:14px;box-sizing:border-box;">
        </div>
      ` : ''}
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;">Message *</div>
          <div id="slCharCount" style="font-size:11px;color:rgba(255,255,255,0.4);">0 chars</div>
        </div>
        <textarea id="slMessage" rows="${isEmail ? 10 : 5}" ${isEmail ? '' : 'maxlength="1600"'} placeholder="${isEmail ? 'Write your email message here. Supports plain text or basic HTML.' : 'Your SMS message. Keep it under 160 chars to avoid being split into multiple messages.'}" oninput="document.getElementById('slCharCount').textContent = this.value.length + ' chars' + (this.value.length > 160 ? ' · multi-part' : '')"
          style="width:100%;padding:12px 14px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:13px;box-sizing:border-box;resize:vertical;line-height:1.5;"></textarea>
      </div>
      <div style="background:#111;border-radius:8px;padding:12px 14px;margin-bottom:18px;font-size:12px;color:rgba(255,255,255,0.5);">
        <strong style="color:#fff;">Tip:</strong> use <code style="background:#000;padding:1px 6px;border-radius:3px;color:#fca5a5;">{{first_name}}</code> or <code style="background:#000;padding:1px 6px;border-radius:3px;color:#fca5a5;">{{company}}</code> to personalize each send.
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <div style="font-size:12px;color:rgba(255,255,255,0.4);">
          ⚠️ Double-check before sending — this will deliver to ${count.toLocaleString()} ${isEmail ? 'inboxes' : 'phones'}.
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="document.getElementById('smartListSenderModal').remove()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">Cancel</button>
          <button onclick="executeSmartListSend('${channel}','${list.id}')" style="padding:10px 22px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;">🚀 Send to ${count.toLocaleString()}</button>
        </div>
      </div>
    `;
  }

  window.executeSmartListSend = async function (channel, listId) {
    const isEmail = channel === 'email';
    const subject = isEmail ? (document.getElementById('slSubject') || {}).value : null;
    const message = (document.getElementById('slMessage') || {}).value;
    if (isEmail && !subject?.trim()) { alert('Subject required.'); return; }
    if (!message?.trim()) { alert('Message required.'); return; }

    const list = state.lists.find(l => l.id === listId);
    if (!confirm(`Send to ${list.contact_count || '?'} contacts in "${list.name}"?\n\nThis cannot be undone.`)) return;

    const body = document.getElementById('slSenderBody');
    if (body) body.innerHTML = '<div style="color:rgba(255,255,255,0.6);text-align:center;padding:40px;">Queuing sends…</div>';

    try {
      // Get recipient list
      const requireField = isEmail ? 'has_email' : 'has_phone';
      const mergedFilters = { ..._normalizeFilters(list.filters || {}) };
      mergedFilters[requireField] = true;
      const { contacts } = await apiCall('match', { filters: mergedFilters, limit: 5000 });

      // Send in batches
      let sent = 0, failed = 0;
      const endpoint = isEmail ? '/.netlify/functions/client-email-broadcast' : '/.netlify/functions/send-sms';

      for (const c of contacts) {
        try {
          const personalized = message
            .replace(/\{\{first_name\}\}/gi, c.first_name || 'there')
            .replace(/\{\{last_name\}\}/gi, c.last_name || '')
            .replace(/\{\{company\}\}/gi, c.company || 'your business');
          const personalizedSubject = isEmail && subject
            ? subject.replace(/\{\{first_name\}\}/gi, c.first_name || 'there').replace(/\{\{company\}\}/gi, c.company || 'your business')
            : null;

          const payload = isEmail
            ? { to: c.email, subject: personalizedSubject, body: personalized, contactId: c.id, smartListId: listId }
            : { to: c.phone, body: personalized, contactId: c.id, smartListId: listId };

          const r = await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (r.ok) sent++; else failed++;
        } catch (e) { failed++; }

        if ((sent + failed) % 10 === 0 && body) {
          body.innerHTML = `<div style="color:#fff;text-align:center;padding:40px;">
            <div style="font-size:32px;margin-bottom:10px;">📤</div>
            <div style="font-weight:700;margin-bottom:4px;">${sent + failed} of ${contacts.length}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:12px;">${sent} sent, ${failed} failed</div>
          </div>`;
        }
      }

      if (body) body.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:12px;">${failed === 0 ? '✅' : '⚠️'}</div>
          <div style="color:#fff;font-size:18px;font-weight:700;margin-bottom:6px;">Campaign complete</div>
          <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:20px;">${sent.toLocaleString()} sent · ${failed.toLocaleString()} failed</div>
          <button onclick="document.getElementById('smartListSenderModal').remove()" style="padding:10px 22px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-family:inherit;">Close</button>
        </div>
      `;
      // Refresh last_used_at
      apiCall('match', { id: listId, limit: 1 }).catch(() => {});
    } catch (e) {
      if (body) body.innerHTML = `<div style="color:#ef4444;text-align:center;padding:40px;">Error: ${_esc(e.message)}</div>`;
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // AI CLASSIFIER
  // ══════════════════════════════════════════════════════════════════
  window.openAiClassifier = async function () {
    const stats = await fetchClassifyStats();
    const remaining = stats ? Math.max(0, stats.withCompany - stats.classified) : 0;
    let modal = document.getElementById('aiClassifyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aiClassifyModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;max-width:520px;width:100%;font-family:inherit;">
        <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:17px;font-weight:700;color:#fff;">🤖 AI Classify Contacts</div>
          <button onclick="document.getElementById('aiClassifyModal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;cursor:pointer;">×</button>
        </div>
        <div id="aiClassifyBody" style="padding:24px;">
          <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:20px;">
            Claude will read each contact's company name and infer their business type (service / product / both) and category. Only contacts with a company name are classified.
          </div>
          <div style="background:#111;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#fff;">${remaining.toLocaleString()}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">contacts to classify</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;">Estimated cost: ~$${(remaining * 0.0008).toFixed(2)} · time: ~${Math.ceil(remaining/20/4)} min</div>
          </div>
          <div id="aiClassifyProgress" style="display:none;margin-bottom:16px;">
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px;" id="aiClassifyStatus">Starting…</div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
              <div id="aiClassifyBar" style="width:0%;height:100%;background:linear-gradient(90deg,#dc2626,#ea580c);transition:width 0.3s;"></div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="aiClassifyCancel" onclick="stopAiClassifier()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;display:none;">Stop</button>
            <button id="aiClassifyClose" onclick="document.getElementById('aiClassifyModal').remove()" style="padding:10px 18px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-family:inherit;font-size:13px;">Close</button>
            <button id="aiClassifyStart" onclick="startAiClassifier()" style="padding:10px 22px;background:var(--red,#dc2626);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;" ${remaining === 0 ? 'disabled' : ''}>▶ Start Classifying</button>
          </div>
        </div>
      </div>
    `;
  };

  let classifyRunning = false;

  window.startAiClassifier = async function () {
    classifyRunning = true;
    document.getElementById('aiClassifyStart').style.display = 'none';
    document.getElementById('aiClassifyClose').style.display = 'none';
    document.getElementById('aiClassifyCancel').style.display = 'inline-block';
    const progress = document.getElementById('aiClassifyProgress');
    progress.style.display = 'block';
    const statusEl = document.getElementById('aiClassifyStatus');
    const bar = document.getElementById('aiClassifyBar');

    let totalClassified = 0, totalFailed = 0, startRemaining = null;

    while (classifyRunning) {
      try {
        const r = await fetch('/.netlify/functions/classify-contacts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch_size: 20 })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Classifier failed');

        if (data.remaining === 0 && data.classified === 0) {
          statusEl.textContent = '✅ All contacts classified!';
          bar.style.width = '100%';
          break;
        }
        totalClassified += data.classified || 0;
        totalFailed += data.failed || 0;
        if (startRemaining === null) startRemaining = (data.remaining || 0) + (data.classified || 0);
        const done = startRemaining - (data.remaining || 0);
        const pct = startRemaining > 0 ? Math.round(done / startRemaining * 100) : 0;
        bar.style.width = pct + '%';
        statusEl.textContent = `${done.toLocaleString()} of ${startRemaining.toLocaleString()} classified · ${data.remaining.toLocaleString()} remaining${totalFailed > 0 ? ' · ' + totalFailed + ' failed' : ''}`;

        if (data.remaining === 0) {
          statusEl.textContent = `✅ Done! ${totalClassified.toLocaleString()} classified${totalFailed > 0 ? ', ' + totalFailed + ' failed' : ''}.`;
          bar.style.width = '100%';
          break;
        }
      } catch (e) {
        statusEl.textContent = '❌ ' + e.message;
        break;
      }
    }

    classifyRunning = false;
    document.getElementById('aiClassifyCancel').style.display = 'none';
    document.getElementById('aiClassifyClose').style.display = 'inline-block';
    if (window.renderSmartListsTab) setTimeout(() => window.renderSmartListsTab(), 500);
  };

  window.stopAiClassifier = function () {
    classifyRunning = false;
    const statusEl = document.getElementById('aiClassifyStatus');
    if (statusEl) statusEl.textContent = '⏸ Stopped';
  };

  // ══════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════
  function _normalizeFilters(f) {
    const out = {};
    for (const k of Object.keys(f || {})) {
      const v = f[k];
      if (v === null || v === undefined) continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (v === false) continue;
      out[k] = v;
    }
    return out;
  }
  function _esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function _catLabel(v) { const p = CATEGORY_PRESETS.find(c => c.value === v); return p ? p.label.replace(/^[^\s]+ /,'') : v; }
  function _timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  }

  // Expose renderBuilder for re-renders from event handlers
  window.renderBuilder = renderBuilder;

  console.log('✅ admin-smart-lists.js loaded');
})();
