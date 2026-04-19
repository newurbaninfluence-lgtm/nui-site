// ============================================
// NUI Contact Hub — Supabase-powered CRM
// Reads from: crm_contacts + activity_log
// Written by: Quo webhook + admin manual entry
// ============================================

// Helper: get display name from first_name + last_name
function hubDisplayName(c) {
  if (!c) return 'Unknown';
  const parts = [c.first_name, c.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown';
}

// Helper: escape HTML to prevent template/render breakage
function _chEsc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/`/g,'&#96;');
}

let contactHubData = { contacts: [], activities: [], emails: [], smsMessages: [], loading: true };
// Expose to window so other modules (admin-smart-lists.js) can read it
if (typeof window !== 'undefined') window.contactHubData = contactHubData;
let contactHubFilter = 'all';
let contactHubView = 'contacts'; // 'contacts' | 'campaigns' | 'smartlists'
let contactHubSearch = '';
let contactHubSelected = null;
let contactHubSort = 'newest';

// Partial table render — updates just the table without destroying search/sort inputs
let _chDebounceTimer = null;
function _chRenderTable() {
  const area = document.getElementById('chTableArea');
  if (!area) return;
  try {
    const contacts = getFilteredContacts();
    area.innerHTML = contacts.length > 0 
      ? renderContactTable(contacts) 
      : '<div class="ch-empty"><div style="font-size:48px;margin-bottom:12px;">📡</div><div style="font-size:16px;margin-bottom:8px;">No contacts yet</div><div>Contacts appear automatically when someone calls or texts your Quo number</div></div>';
    // Update filter button active states
    document.querySelectorAll('.ch-toolbar .ch-filter-btn').forEach(btn => {
      const txt = btn.textContent.trim();
      const map = { 'All': 'all', '🔥 New': 'new_lead', '📞 Contacted': 'contacted', '✅ Qualified': 'qualified', '⭐ Client': 'client' };
      const val = map[txt];
      if (val) btn.classList.toggle('active', contactHubFilter === val);
    });
  } catch (e) { console.error('Table render error:', e); }
}
function _chDebouncedRender() {
  clearTimeout(_chDebounceTimer);
  _chDebounceTimer = setTimeout(_chRenderTable, 200);
}

// ── Fetch from Supabase ──────────────────────
async function fetchContactHubData() {
  contactHubData.loading = true;
  try {
    if (!db) throw new Error('Supabase not connected');

    const [contactsRes, activitiesRes, emailsRes, smsRes] = await Promise.all([
      db.from('crm_contacts').select('*').order('last_activity_at', { ascending: false }),
      db.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200),
      db.from('communications').select('*').eq('channel', 'email').order('created_at', { ascending: false }).limit(200),
      db.from('communications').select('*').eq('channel', 'sms').order('created_at', { ascending: false }).limit(200)
    ]);

    if (contactsRes.error) throw contactsRes.error;
    if (activitiesRes.error) throw activitiesRes.error;

    contactHubData.contacts = contactsRes.data || [];
    contactHubData.activities = activitiesRes.data || [];
    contactHubData.emails = (emailsRes.error ? [] : emailsRes.data) || [];
    contactHubData.smsMessages = (smsRes.error ? [] : smsRes.data) || [];
    contactHubData.loading = false;
    // Re-expose to window (arrays get replaced, reference stays the same but be explicit)
    if (typeof window !== 'undefined') window.contactHubData = contactHubData;
    console.log('✅ Contact Hub: ' + contactHubData.contacts.length + ' contacts, ' + contactHubData.activities.length + ' activities, ' + contactHubData.emails.length + ' emails, ' + contactHubData.smsMessages.length + ' sms');
  } catch (err) {
    console.warn('Contact Hub fetch failed:', err.message);
    contactHubData.loading = false;
    contactHubData.contacts = [];
    contactHubData.activities = [];
    contactHubData.emails = [];
    contactHubData.smsMessages = [];
  }
}
// Expose to window so admin-smart-lists.js can trigger reloads
if (typeof window !== 'undefined') window.fetchContactHubData = fetchContactHubData;

// ── Main Panel Loader ────────────────────────
async function loadAdminContactHubPanel() {
  const panel = document.getElementById('adminContacthubPanel');
  if (!panel) return;

  // Show loading state
  panel.innerHTML = '<div style="padding:60px;text-align:center;color:rgba(255,255,255,0.4);"><div style="font-size:32px;margin-bottom:12px;">📡</div>Loading contacts from Supabase...</div>';

  try {
    await fetchContactHubData();
    renderContactHub();
  } catch (err) {
    console.error('Contact Hub load error:', err);
    panel.innerHTML = '<div style="padding:60px;text-align:center;color:#ef4444;"><div style="font-size:32px;margin-bottom:12px;">⚠️</div><div style="margin-bottom:8px;">Contact Hub failed to load</div><div style="font-size:13px;color:rgba(255,255,255,0.4);">' + (err.message || err) + '</div><button onclick="loadAdminContactHubPanel()" style="margin-top:16px;padding:10px 20px;background:var(--red);border:none;border-radius:8px;color:#fff;cursor:pointer;">Retry</button></div>';
  }
}

function renderContactHub() {
  const panel = document.getElementById('adminContacthubPanel');
  if (!panel) return;

  try {
  const contacts = getFilteredContacts();
  const totalContacts = contactHubData.contacts.length;
  const newLeads = contactHubData.contacts.filter(c => c.status === 'new_lead').length;
  const qualified = contactHubData.contacts.filter(c => c.sona_qualified === true).length;
  const unreadActivities = contactHubData.activities.filter(a => !a.read).length;

  // Source breakdown
  const sources = {};
  contactHubData.contacts.forEach(c => {
    const s = c.source || 'unknown';
    sources[s] = (sources[s] || 0) + 1;
  });

  panel.innerHTML = `
<style>
  .ch-header { margin-bottom: 24px; }
  .ch-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .ch-stat { background: #1c1c1c; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; }
  .ch-stat .num { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .ch-stat .lbl { font-size: 12px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; }
  .ch-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
  .ch-search { padding: 10px 16px; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; width: 260px; font-family: inherit; font-size: 14px; }
  .ch-filter-btn { padding: 8px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
  .ch-filter-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
  .ch-filter-btn.active { background: var(--red); border-color: var(--red); color: #fff; }
  .ch-table { width: 100%; border-collapse: collapse; }
  .ch-table th { text-align: left; padding: 10px 12px; background: #202020; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.4); position: sticky; top: 0; }
  .ch-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .ch-table tr { cursor: pointer; transition: background 0.15s; }
  .ch-table tr:hover td { background: rgba(255,255,255,0.025); }
  .ch-table tr.selected td { background: rgba(220,38,38,0.08); }
  .ch-badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .ch-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .ch-drawer { position: fixed; top: 0; right: 0; width: 480px; height: 100vh; background: #1c1c1c; border-left: 1px solid rgba(255,255,255,0.1); z-index: 9000; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s ease; }
  .ch-drawer.open { transform: translateX(0); }
  .ch-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 8999; display: none; }
  .ch-drawer-overlay.open { display: block; }
  .ch-timeline-item { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; }
  .ch-timeline-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .ch-timeline-content { flex: 1; }
  .ch-timeline-time { font-size: 11px; color: rgba(255,255,255,0.35); }
  .ch-empty { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
  .ch-source-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .ch-source-pill { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
</style>

<div class="ch-header">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
    <h2 style="font-size:24px;font-weight:800;">📡 Contact Hub</h2>
    <div style="display:flex;gap:8px;">
      <button onclick="contactHubView='smartlists'; renderContactHub();" class="ch-filter-btn" style="${contactHubView === 'smartlists' ? 'background:#dc2626;border-color:#dc2626;color:#fff;' : 'background:#1c1c1c;'}">🎯 Smart Lists</button>
      <button onclick="contactHubView = contactHubView === 'campaigns' ? 'contacts' : 'campaigns'; renderContactHub();" class="ch-filter-btn" style="${contactHubView === 'campaigns' ? 'background:#7c3aed;border-color:#7c3aed;color:#fff;' : 'background:#1c1c1c;'}">📲 Campaigns</button>
      <button onclick="contactHubView='contacts'; renderContactHub();" class="ch-filter-btn" style="${contactHubView === 'contacts' ? 'background:#1c1c1c;border-color:rgba(255,255,255,0.3);color:#fff;' : 'background:#1c1c1c;'}">📡 Contacts</button>
      <button onclick="fetchContactHubData().then(renderContactHub)" class="ch-filter-btn" style="background:#1c1c1c;">🔄 Refresh</button>
      <button onclick="showCsvUploadModal()" class="ch-filter-btn" style="background:#1a5c2a;border-color:#1a5c2a;color:#fff;">📄 Import CSV</button>
      <button onclick="showAddHubContactModal()" class="ch-filter-btn" style="background:var(--red);border-color:var(--red);color:#fff;">+ Add Contact</button>
    </div>
  </div>
  <p style="color:rgba(255,255,255,0.4);font-size:13px;">Live from Supabase · Quo calls & texts land here automatically</p>
</div>

<!-- Stats -->
<div class="ch-stats">
  <div class="ch-stat"><div class="num">${totalContacts}</div><div class="lbl">Total Contacts</div></div>
  <div class="ch-stat"><div class="num" style="color:#f59e0b;">${newLeads}</div><div class="lbl">New Leads</div></div>
  <div class="ch-stat"><div class="num" style="color:#10b981;">${qualified}</div><div class="lbl">Sona Qualified</div></div>
  <div class="ch-stat"><div class="num" style="color:#3b82f6;">${unreadActivities}</div><div class="lbl">Unread</div></div>
</div>

${contactHubView === 'campaigns' ? `
<!-- Campaigns View -->
<div id="smsCampaignsTab"></div>
` : contactHubView === 'smartlists' ? `
<!-- Smart Lists View -->
<div id="smartListsTabContent"></div>
` : `
<!-- Source pills -->
<div class="ch-source-pills">
  ${Object.entries(sources).map(([src, count]) => {
    const colors = { quo_call: '#8b5cf6', quo_text: '#10b981', website_form: '#3b82f6', manual: '#f59e0b', referral: '#ec4899', csv_import: '#06b6d4', sona_chat: '#a855f7', monty_chat: '#a855f7' };
    const labels = { quo_call: '📞 Calls', quo_text: '💬 Texts', website_form: '🌐 Forms', manual: '✏️ Manual', referral: '🤝 Referral', csv_import: '📄 CSV Import', sona_chat: '🤖 Sona', monty_chat: '💬 Monty' };
    return '<span class="ch-source-pill" style="background:' + (colors[src] || '#666') + '20;color:' + (colors[src] || '#999') + ';">' + (labels[src] || src) + ': ' + count + '</span>';
  }).join('')}
  ${contactHubData.emails.length > 0 ? (() => {
    const sent = contactHubData.emails.filter(e => e.direction === 'outbound').length;
    const opened = contactHubData.emails.filter(e => e.read).length;
    return '<span class="ch-source-pill" style="background:#3b82f620;color:#3b82f6;">📧 Emails Sent: ' + sent + '</span>' +
           (opened > 0 ? '<span class="ch-source-pill" style="background:#10b98120;color:#10b981;">👁️ Opened: ' + opened + '</span>' : '');
  })() : ''}
</div>

<!-- Toolbar -->
<div class="ch-toolbar">
  <input type="text" class="ch-search" id="chSearchInput" placeholder="Search name, phone, email..." value="${contactHubSearch}" oninput="contactHubSearch=this.value;_chDebouncedRender();">
  <button class="ch-filter-btn ${contactHubFilter === 'all' ? 'active' : ''}" onclick="contactHubFilter='all';_chRenderTable();">All</button>
  <button class="ch-filter-btn ${contactHubFilter === 'new_lead' ? 'active' : ''}" onclick="contactHubFilter='new_lead';_chRenderTable();">🔥 New</button>
  <button class="ch-filter-btn ${contactHubFilter === 'contacted' ? 'active' : ''}" onclick="contactHubFilter='contacted';_chRenderTable();">📞 Contacted</button>
  <button class="ch-filter-btn ${contactHubFilter === 'qualified' ? 'active' : ''}" onclick="contactHubFilter='qualified';_chRenderTable();">✅ Qualified</button>
  <button class="ch-filter-btn ${contactHubFilter === 'client' ? 'active' : ''}" onclick="contactHubFilter='client';_chRenderTable();">⭐ Client</button>
  <select onchange="contactHubSort=this.value;_chRenderTable();" id="chSortSelect" style="padding:8px 12px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
    <option value="newest" ${contactHubSort === 'newest' ? 'selected' : ''}>Newest First</option>
    <option value="oldest" ${contactHubSort === 'oldest' ? 'selected' : ''}>Oldest First</option>
    <option value="recent_activity" ${contactHubSort === 'recent_activity' ? 'selected' : ''}>Recent Activity</option>
    <option value="name" ${contactHubSort === 'name' ? 'selected' : ''}>Name A-Z</option>
  </select>
</div>

<!-- Contact Table -->
<div id="chTableArea">
${contacts.length > 0 ? renderContactTable(contacts) : '<div class="ch-empty"><div style="font-size:48px;margin-bottom:12px;">📡</div><div style="font-size:16px;margin-bottom:8px;">No contacts yet</div><div>Contacts appear automatically when someone calls or texts your Quo number</div></div>'}
</div>

<!-- Drawer overlay -->
<div class="ch-drawer-overlay ${contactHubSelected ? 'open' : ''}" onclick="closeContactDrawer()"></div>
<div class="ch-drawer ${contactHubSelected ? 'open' : ''}" id="contactDrawer">
  ${contactHubSelected ? renderContactDrawer(contactHubSelected) : ''}
</div>
`}
  `;

  // If campaigns view, trigger campaign render
  if (contactHubView === 'campaigns' && typeof renderSmsCampaignsTab === 'function') {
    window._contactHubContacts = contactHubData.contacts.map(c => ({
      id: c.id, name: hubDisplayName(c), phone: c.phone, email: c.email, status: c.status
    }));
    setTimeout(() => renderSmsCampaignsTab(), 50);
  }

  // If smart lists view, trigger render
  if (contactHubView === 'smartlists' && typeof renderSmartListsTab === 'function') {
    setTimeout(() => renderSmartListsTab(), 50);
  }

  } catch (renderErr) {
    console.error('Contact Hub render error:', renderErr);
    panel.innerHTML = '<div style="padding:60px;text-align:center;color:#ef4444;"><div style="font-size:32px;margin-bottom:12px;">⚠️</div><div style="margin-bottom:8px;">Contact Hub render failed</div><div style="font-size:13px;color:rgba(255,255,255,0.4);max-width:500px;margin:0 auto;word-break:break-all;">' + (renderErr.message || renderErr) + '</div><button onclick="loadAdminContactHubPanel()" style="margin-top:16px;padding:10px 20px;background:var(--red);border:none;border-radius:8px;color:#fff;cursor:pointer;">Retry</button></div>';
  }
}

// ── Filter + Sort helpers ────────────────────
function getFilteredContacts() {
  let list = [...contactHubData.contacts];

  // Filter by status
  if (contactHubFilter !== 'all') {
    list = list.filter(c => c.status === contactHubFilter);
  }

  // Search
  if (contactHubSearch.trim()) {
    const q = contactHubSearch.toLowerCase();
    list = list.filter(c =>
      (hubDisplayName(c) || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  }

  // Sort
  if (contactHubSort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else if (contactHubSort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  else if (contactHubSort === 'recent_activity') list.sort((a, b) => new Date(b.last_activity_at || b.created_at) - new Date(a.last_activity_at || a.created_at));
  else if (contactHubSort === 'name') list.sort((a, b) => hubDisplayName(a).localeCompare(hubDisplayName(b)));

  return list;
}

// ── Shared helpers (module-level so both table and drawer can use them) ───────
const _chStatusColors = {
  new_lead:  { bg: '#f59e0b20', color: '#f59e0b', label: 'New Lead' },
  contacted: { bg: '#3b82f620', color: '#3b82f6', label: 'Contacted' },
  qualified: { bg: '#10b98120', color: '#10b981', label: 'Qualified' },
  client:    { bg: '#8b5cf620', color: '#8b5cf6', label: 'Client' },
  lost:      { bg: '#ef444420', color: '#ef4444', label: 'Lost' }
};
const sentimentColors = { excited: '#10b981', warm: '#f59e0b', neutral: '#6b7280', hesitant: '#f97316', frustrated: '#ef4444' };
const sentimentEmoji  = { excited: '🔥', warm: '😊', neutral: '😐', hesitant: '🤔', frustrated: '😤' };
function scoreBar(score) {
  if (!score) return '<span style="color:rgba(255,255,255,0.2);font-size:11px;">—</span>';
  const pct = (score / 10) * 100;
  const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
  return `<div style="display:flex;align-items:center;gap:5px;"><div style="width:50px;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div></div><span style="font-size:11px;color:${color};font-weight:700;">${score}/10</span></div>`;
}

// ── Table Renderer ───────────────────────────
function renderContactTable(contacts) {
  const statusColors = _chStatusColors;
  const sourceIcons = { quo_call: '📞', quo_text: '💬', website_form: '🌐', manual: '✏️', referral: '🤝', csv_import: '📄', sona_chat: '🤖', monty_chat: '💬' };

  return `<div style="overflow-x:auto;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
<table class="ch-table">
<thead><tr>
  <th>Contact</th>
  <th>Business</th>
  <th>Phone</th>
  <th>Source</th>
  <th>Score</th>
  <th>Sentiment</th>
  <th>Status</th>
  <th>Last Activity</th>
  <th>Actions</th>
</tr></thead>
<tbody>
${contacts.map(c => {
  const st = statusColors[c.status] || statusColors.new_lead;
  const activities = contactHubData.activities.filter(a => a.contact_id === c.id);
  const lastAct = activities[0];
  const hasUnread = activities.some(a => !a.read);
  const safeName = _chEsc(hubDisplayName(c));
  const safeEmail = _chEsc(c.email);
  const safeCompany = _chEsc(c.company);
  const safePhone = _chEsc(c.phone);
  const safeId = _chEsc(c.id);
  return `<tr class="${contactHubSelected === c.id ? 'selected' : ''}" onclick="openContactDrawer('${safeId}')">
    <td>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="ch-avatar" style="background:${st.color}20;color:${st.color};">${safeName.charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-weight:600;font-size:14px;">${safeName}${hasUnread ? ' <span style="color:#ef4444;font-size:10px;">●</span>' : ''}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4);">${safeEmail || '—'}</div>
        </div>
      </div>
    </td>
    <td style="font-size:13px;color:rgba(255,255,255,0.6);">${safeCompany || '<span style="color:rgba(255,255,255,0.15);">—</span>'}</td>
    <td style="font-size:13px;font-family:monospace;color:rgba(255,255,255,0.7);">${safePhone || '—'}</td>
    <td><span style="font-size:16px;" title="${_chEsc(c.source) || 'unknown'}">${sourceIcons[c.source] || '❓'}</span></td>
    <td>${scoreBar(c.lead_score || 0)}</td>
    <td>${c.sentiment ? `<span style="font-size:13px;" title="${c.sentiment}">${sentimentEmoji[c.sentiment] || '😐'} <span style="font-size:11px;color:${sentimentColors[c.sentiment] || '#6b7280'};">${c.sentiment}</span></span>` : '<span style="color:rgba(255,255,255,0.2);">—</span>'}</td>
    <td><span class="ch-badge" style="background:${st.bg};color:${st.color};">${st.label}</span></td>
    <td style="font-size:12px;color:rgba(255,255,255,0.45);">${lastAct ? formatHubTime(lastAct.created_at) : '—'}</td>
    <td>
      <div style="display:flex;gap:4px;" onclick="event.stopPropagation();">
        ${c.phone ? '<button onclick="hubQuickCall(\'' + safePhone + '\')" style="padding:4px 8px;background:#8b5cf620;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Call">📞</button>' : ''}
        ${c.phone ? '<button onclick="hubQuickSms(\'' + safeId + '\')" style="padding:4px 8px;background:#10b98120;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="SMS">💬</button>' : ''}
        ${c.email ? '<button onclick="hubQuickEmail(\'' + safeId + '\')" style="padding:4px 8px;background:#3b82f620;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Email">📧</button>' : ''}
        <button onclick="updateHubContactStatus(\'' + safeId + '\')" style="padding:4px 8px;background:rgba(255,255,255,0.06);border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Update status">⚡</button>
      </div>
    </td>
  </tr>`;
}).join('')}
</tbody>
</table></div>`;
}

// ── Actions ──────────────────────────────────
let contactHubDrawerTab = 'timeline';

function openContactDrawer(contactId, tab) {
  contactHubSelected = contactId;
  contactHubDrawerTab = tab || 'timeline';
  // Mark activities as read
  markHubActivitiesRead(contactId);
  renderContactHub();
  // Focus SMS input if on SMS tab
  if (contactHubDrawerTab === 'sms') {
    setTimeout(() => { const inp = document.getElementById('hubSmsInput'); if (inp) inp.focus(); }, 100);
  }
}

function closeContactDrawer() {
  contactHubSelected = null;
  renderContactHub();
}

async function markHubActivitiesRead(contactId) {
  if (!db) return;
  try {
    await db.from('activity_log').update({ read: true }).eq('contact_id', contactId).eq('read', false);
    contactHubData.activities.forEach(a => { if (a.contact_id === contactId) a.read = true; });
  } catch (err) { console.warn('Mark read failed:', err.message); }
}

async function setHubContactStatus(contactId, status) {
  if (!db) return;
  try {
    await db.from('crm_contacts').update({ status }).eq('id', contactId);
    const c = contactHubData.contacts.find(x => x.id === contactId);
    if (c) c.status = status;
    renderContactHub();
    console.log('✅ Status updated:', status);
  } catch (err) { alert('Failed: ' + err.message); }
}

function updateHubContactStatus(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c) return;
  const statuses = ['new_lead', 'contacted', 'qualified', 'client', 'lost'];
  const current = statuses.indexOf(c.status);
  const next = statuses[(current + 1) % statuses.length];
  setHubContactStatus(contactId, next);
}

async function saveHubContactNotes(contactId) {
  const notes = document.getElementById('hubContactNotes')?.value || '';
  if (!db) return;
  try {
    await db.from('crm_contacts').update({ notes }).eq('id', contactId);
    const c = contactHubData.contacts.find(x => x.id === contactId);
    if (c) c.notes = notes;
    console.log('✅ Notes saved');
  } catch (err) { alert('Save failed: ' + err.message); }
}

async function saveHubContactClassification(contactId) {
  const bizType = document.getElementById('hubBizType_' + contactId)?.value || null;
  const bizCat  = document.getElementById('hubBizCat_'  + contactId)?.value || null;
  const feedbackEl = document.getElementById('hubClassifySaved_' + contactId);
  if (!db) return;
  try {
    await db.from('crm_contacts').update({
      business_type: bizType || null,
      business_category: bizCat || null,
      updated_at: new Date().toISOString()
    }).eq('id', contactId);
    // Update in-memory contactHubData so Smart Lists sees the change immediately
    const c = contactHubData.contacts.find(x => x.id === contactId);
    if (c) { c.business_type = bizType; c.business_category = bizCat; }
    // If Smart Lists tab is currently open, re-render it to reflect the new classification
    if (contactHubView === 'smartlists' && typeof window.renderSmartListsTab === 'function') {
      window.renderSmartListsTab();
    }
    if (feedbackEl) {
      feedbackEl.textContent = '✓ Saved';
      setTimeout(() => { if (feedbackEl) feedbackEl.textContent = ''; }, 1500);
    }
  } catch (err) {
    if (feedbackEl) feedbackEl.textContent = '✗ ' + err.message;
  }
}

function hubQuickCall(phone) {
  window.open('tel:' + phone, '_self');
}

function hubQuickSms(contactId) {
  openContactDrawer(contactId, 'sms');
}

function hubQuickEmail(contactId) {
  openContactDrawer(contactId, 'email');
}

// ── Contact Detail Drawer (Tabbed) ───────────
function renderContactDrawer(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.3);">Contact not found</div>';

  const activities = contactHubData.activities.filter(a => a.contact_id === contactId).slice(0, 50);
  
  // Get SMS messages (from activity_log + communications)
  const smsFromActivity = activities.filter(a => a.type === 'sms' || a.type === 'text' || a.event_type === 'sms_sent' || a.event_type === 'text');
  const smsFromComms = contactHubData.emails.length > 0 ? [] : []; // communications table SMS
  // Also fetch SMS from communications by phone
  const smsComms = (contactHubData.smsMessages || []).filter(s => {
    if (!c.phone) return false;
    const msgPhone = s.metadata?.to || s.metadata?.from || '';
    return msgPhone.replace(/[^\d]/g, '').includes(c.phone.replace(/[^\d]/g, '').slice(-10));
  });
  const allSms = [...smsFromActivity, ...smsComms].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Get email messages
  const contactEmails = contactHubData.emails.filter(e => {
    if (!c.email && !c.phone) return false;
    const emailTo = e.metadata?.to || '';
    return (c.email && emailTo.toLowerCase() === c.email.toLowerCase()) ||
           (c.client_id && e.client_id === c.client_id);
  }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  // Also get email activities from activity_log
  const emailActivities = activities.filter(a => a.type === 'email' || a.event_type === 'email_sent' || a.event_type === 'email_opened');
  const allEmails = [...contactEmails.map(e => ({
    ...e,
    _isComm: true,
    content: (e.direction === 'outbound' ? '📤 ' : '📥 ') + (e.subject || e.metadata?.subject || 'No subject'),
    event_type: e.read ? 'email_opened' : 'email_sent'
  })), ...emailActivities].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Combined timeline
  const allActivity = [...activities, ...contactEmails.map(e => ({
    id: e.id, contact_id: contactId, type: 'email',
    event_type: e.read ? 'email_opened' : 'email_sent',
    direction: e.direction,
    content: (e.direction === 'outbound' ? '📤 ' : '📥 ') + (e.subject || e.metadata?.subject || 'No subject') + (e.read ? ' · ✅ Read' : ''),
    created_at: e.created_at, metadata: e.metadata, _isEmail: true
  }))].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);

  const typeIcons = { text: '💬', call: '📞', email: '📧', sms: '💬', voicemail: '📬', form: '📋', email_sent: '📤', email_opened: '👁️', sms_sent: '💬', sona_chat: '🤖', sona_summary: '🧠', monty_chat: '💬', note: '📝', status_change: '⚡', recording: '🎙️' };
  const statusOptions = ['new_lead', 'contacted', 'qualified', 'client', 'lost'];
  const tab = contactHubDrawerTab;

  return `
<div style="padding:24px;">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">
    <div style="display:flex;gap:14px;align-items:center;">
      <div class="ch-avatar" style="width:52px;height:52px;font-size:22px;background:var(--red);color:#fff;">${hubDisplayName(c).charAt(0).toUpperCase()}</div>
      <div>
        <h3 style="font-size:20px;font-weight:700;margin-bottom:2px;">${hubDisplayName(c)}</h3>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);">${c.company || ''}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px;">${c.phone || ''} ${c.phone && c.email ? '·' : ''} ${c.email || ''}</div>
      </div>
    </div>
    <button onclick="closeContactDrawer()" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:4px;">✕</button>
  </div>

  <!-- Lead Score + Sentiment bar -->
  <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;padding:12px;background:#202020;border-radius:8px;">
    <div style="flex:1;">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Lead Score</div>
      ${scoreBar(c.lead_score || 0)}
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Sentiment</div>
      <div style="font-size:13px;">${c.sentiment ? `${sentimentEmoji[c.sentiment] || '😐'} <span style="color:${sentimentColors[c.sentiment] || '#6b7280'};">${c.sentiment}</span>` : '<span style="color:rgba(255,255,255,0.2);">Not analyzed yet</span>'}</div>
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Follow-up Stage</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);">${c.followup_stage > 0 ? `Stage ${c.followup_stage}/3` : c.calendly_sent ? '📅 Calendly sent' : 'None yet'}</div>
    </div>
  </div>

  <!-- BANT Intelligence -->
  ${(c.bant_need || c.bant_budget || c.bant_authority || c.bant_timeline) ? `
  <div style="background:#1a1a2e;border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;color:#3b82f6;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">🎯 BANT Intelligence</div>
    ${c.bant_need      ? `<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Need:</strong> ${_chEsc(c.bant_need)}</div>` : ''}
    ${c.bant_budget    ? `<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Budget:</strong> ${_chEsc(c.bant_budget)}</div>` : ''}
    ${c.bant_authority ? `<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Authority:</strong> ${_chEsc(c.bant_authority)}</div>` : ''}
    ${c.bant_timeline  ? `<div style="font-size:12px;color:rgba(255,255,255,0.7);"><strong style="color:rgba(255,255,255,0.4);">Timeline:</strong> ${_chEsc(c.bant_timeline)}</div>` : ''}
  </div>
  ` : ''}

  ${c.interest_tags?.length ? `
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
    ${c.interest_tags.map(t => `<span style="padding:3px 10px;background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);color:#ef4444;border-radius:100px;font-size:11px;font-weight:600;">#${_chEsc(t)}</span>`).join('')}
  </div>
  ` : ''}

  <!-- Status Bar -->
  <div style="display:flex;gap:6px;margin-bottom:16px;align-items:center;">
    <select onchange="setHubContactStatus('${c.id}', this.value)" style="padding:6px 10px;background:#242424;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:12px;font-weight:600;">
      ${statusOptions.map(s => '<option value="' + s + '"' + (c.status === s ? ' selected' : '') + '>' + s.replace(/_/g, ' ').toUpperCase() + '</option>').join('')}
    </select>
    <span style="font-size:12px;color:rgba(255,255,255,0.3);">Source: ${c.source || '—'}</span>
    ${c.sona_qualified ? '<span style="font-size:12px;color:#10b981;">✅ Sona Qualified</span>' : ''}
  </div>

  <!-- Sona Insights (if available) -->
  ${(c.service_interest || c.budget_range || c.timeline || c.industry) ? `
  <div style="background:#1a1a2e;border:1px solid rgba(139,92,246,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;color:#8b5cf6;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">🤖 Sona Insights</div>
    ${c.service_interest ? '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Interested in:</strong> ' + _chEsc(c.service_interest) + '</div>' : ''}
    ${c.budget_range ? '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Budget:</strong> ' + _chEsc(c.budget_range) + '</div>' : ''}
    ${c.timeline ? '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:4px;"><strong style="color:rgba(255,255,255,0.4);">Timeline:</strong> ' + _chEsc(c.timeline) + '</div>' : ''}
    ${c.industry ? '<div style="font-size:12px;color:rgba(255,255,255,0.7);"><strong style="color:rgba(255,255,255,0.4);">Industry:</strong> ' + _chEsc(c.industry) + '</div>' : ''}
  </div>
  ` : ''}

  <!-- Tab Nav -->
  <div style="display:flex;gap:0;margin-bottom:16px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;">
    <button onclick="contactHubDrawerTab='timeline';renderContactHub();" style="flex:1;padding:10px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;${tab === 'timeline' ? 'background:var(--red);color:#fff;' : 'background:#1c1c1c;color:rgba(255,255,255,0.5);'}">⏱ Timeline</button>
    <button onclick="contactHubDrawerTab='sms';renderContactHub();setTimeout(()=>{const i=document.getElementById('hubSmsInput');if(i)i.focus();},100);" style="flex:1;padding:10px;border:none;border-left:1px solid rgba(255,255,255,0.08);cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;${tab === 'sms' ? 'background:var(--red);color:#fff;' : 'background:#1c1c1c;color:rgba(255,255,255,0.5);'}">${c.phone ? '💬 SMS' : '💬 SMS'} ${allSms.length > 0 ? '(' + allSms.length + ')' : ''}</button>
    <button onclick="contactHubDrawerTab='email';renderContactHub();" style="flex:1;padding:10px;border:none;border-left:1px solid rgba(255,255,255,0.08);cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;${tab === 'email' ? 'background:var(--red);color:#fff;' : 'background:#1c1c1c;color:rgba(255,255,255,0.5);'}">${c.email ? '📧 Email' : '📧 Email'} ${allEmails.length > 0 ? '(' + allEmails.length + ')' : ''}</button>
    <button onclick="contactHubDrawerTab='calls';renderContactHub();" style="flex:1;padding:10px;border:none;border-left:1px solid rgba(255,255,255,0.08);cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;${tab === 'calls' ? 'background:var(--red);color:#fff;' : 'background:#1c1c1c;color:rgba(255,255,255,0.5);'}">📞 Calls</button>
  </div>

  <!-- Tab Content -->
  ${tab === 'timeline' ? renderDrawerTimeline(c, allActivity, typeIcons) : ''}
  ${tab === 'sms' ? renderDrawerSms(c, allSms) : ''}
  ${tab === 'email' ? renderDrawerEmail(c, allEmails) : ''}
  ${tab === 'calls' ? renderDrawerCalls(c) : ''}

  <!-- Classification -->
  <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
    <h4 style="font-size:13px;font-weight:600;margin-bottom:8px;">🏷️ Classification</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px;">
      <div>
        <label style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Business Type</label>
        <select id="hubBizType_${c.id}" onchange="saveHubContactClassification('${c.id}')" style="width:100%;padding:7px 9px;background:#202020;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:12px;">
          <option value="" ${!c.business_type ? 'selected' : ''}>— Not set —</option>
          <option value="service" ${c.business_type === 'service' ? 'selected' : ''}>Service</option>
          <option value="product" ${c.business_type === 'product' ? 'selected' : ''}>Product</option>
          <option value="both" ${c.business_type === 'both' ? 'selected' : ''}>Both</option>
        </select>
      </div>
      <div>
        <label style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Category</label>
        <select id="hubBizCat_${c.id}" onchange="saveHubContactClassification('${c.id}')" style="width:100%;padding:7px 9px;background:#202020;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:12px;">
          <option value="" ${!c.business_category ? 'selected' : ''}>— Not set —</option>
          ${(window.NuiCategories ? window.NuiCategories.renderOptions(c.business_category) : '<option>Loading categories...</option>')}
        </select>
      </div>
    </div>
    <div id="hubClassifySaved_${c.id}" style="font-size:10px;color:#10b981;height:12px;"></div>
  </div>

  <!-- Notes (always visible) -->
  <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
    <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;">📝 Notes</h4>
    <textarea id="hubContactNotes" rows="2" placeholder="Add notes..." style="width:100%;padding:8px;background:#202020;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:12px;resize:vertical;">${c.notes || ''}</textarea>
    <button onclick="saveHubContactNotes('${c.id}')" style="margin-top:4px;padding:5px 12px;background:rgba(255,255,255,0.08);border:none;color:#fff;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">Save</button>
  </div>

  <!-- Actions -->
  <div style="margin-top:16px;display:flex;gap:6px;">
    <button onclick="convertHubToClient('${c.id}')" style="flex:1;padding:8px;background:#8b5cf620;border:1px solid #8b5cf640;color:#8b5cf6;border-radius:6px;cursor:pointer;font-weight:600;font-family:inherit;font-size:11px;">⭐ Convert to Client</button>
    <button onclick="deleteHubContact('${c.id}')" style="flex:1;padding:8px;background:#ef444420;border:1px solid #ef444440;color:#ef4444;border-radius:6px;cursor:pointer;font-weight:600;font-family:inherit;font-size:11px;">🗑 Delete</button>
  </div>
</div>`;
}

// ── Drawer Tab: Timeline ─────────────────────
function renderDrawerTimeline(c, allActivity, typeIcons) {
  if (allActivity.length === 0) {
    return '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.25);font-size:13px;">No activity yet</div>';
  }
  return '<div style="max-height:360px;overflow-y:auto;">' + allActivity.map(a => {
    const icon = typeIcons[a.event_type] || typeIcons[a.type] || '📌';
    const dirColor = a.direction === 'inbound' ? '#10b981' : '#3b82f6';
    return '<div class="ch-timeline-item">' +
      '<div class="ch-timeline-icon" style="background:' + dirColor + '20;color:' + dirColor + ';">' + icon + '</div>' +
      '<div class="ch-timeline-content">' +
        '<div style="font-size:13px;margin-bottom:2px;">' + (a.content || a.type || 'Activity') + '</div>' +
        '<div class="ch-timeline-time">' + (a.direction === 'inbound' ? '← Inbound' : '→ Outbound') + ' · ' + formatHubTime(a.created_at) + '</div>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

// ── Drawer Tab: SMS Thread ───────────────────
function renderDrawerSms(c, allSms) {
  if (!c.phone) {
    return '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.25);font-size:13px;">No phone number on file.<br>Add a phone number to send SMS.</div>';
  }

  let thread = '<div id="hubSmsThread" style="max-height:320px;overflow-y:auto;padding:8px;margin-bottom:12px;background:#202020;border:1px solid rgba(255,255,255,0.06);border-radius:10px;">';

  if (allSms.length === 0) {
    thread += '<div style="text-align:center;padding:40px 10px;color:rgba(255,255,255,0.2);font-size:12px;">No messages yet. Send the first one below.</div>';
  } else {
    allSms.forEach(msg => {
      const isOutbound = msg.direction === 'outbound';
      const text = msg.content || msg.message || msg.metadata?.content || '(message)';
      const time = formatHubTime(msg.created_at);
      thread += '<div style="display:flex;justify-content:' + (isOutbound ? 'flex-end' : 'flex-start') + ';margin-bottom:8px;">' +
        '<div style="max-width:80%;padding:10px 14px;border-radius:' + (isOutbound ? '14px 14px 4px 14px' : '14px 14px 14px 4px') + ';background:' + (isOutbound ? 'var(--red)' : '#1a1a1a') + ';color:#fff;font-size:13px;line-height:1.4;">' +
          '<div>' + text + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px;text-align:' + (isOutbound ? 'right' : 'left') + ';">' + (isOutbound ? 'You' : hubDisplayName(c)) + ' · ' + time + '</div>' +
        '</div>' +
      '</div>';
    });
  }
  thread += '</div>';

  // Compose bar
  thread += `
<div style="display:flex;gap:8px;align-items:flex-end;">
  <textarea id="hubSmsInput" rows="2" placeholder="Type a message..." style="flex:1;padding:10px 14px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-family:inherit;font-size:13px;resize:none;outline:none;" autocomplete="off" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendHubSmsInline('${c.id}');}"></textarea>
  <button id="hubSmsSendBtn" onclick="sendHubSmsInline('${c.id}')" style="padding:10px 18px;background:var(--red);border:none;color:#fff;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;white-space:nowrap;font-family:inherit;">Send</button>
</div>
<div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:4px;">Via OpenPhone · Enter to send, Shift+Enter for new line</div>`;

  return thread;
}

// ── Drawer Tab: Email Thread ─────────────────
function renderDrawerEmail(c, allEmails) {
  if (!c.email) {
    return '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.25);font-size:13px;">No email on file.<br>Add an email address to send messages.</div>';
  }

  let content = '';

  // Email thread
  content += '<div style="max-height:260px;overflow-y:auto;margin-bottom:12px;">';
  if (allEmails.length === 0) {
    content += '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.2);font-size:12px;">No emails yet</div>';
  } else {
    allEmails.forEach(e => {
      const isOutbound = e.direction === 'outbound';
      const subject = e.subject || e.metadata?.subject || 'No subject';
      const preview = e.metadata?.preview || e.content || '';
      const opened = e.read || e.event_type === 'email_opened';
      const time = formatHubTime(e.created_at);
      content += '<div style="padding:12px;margin-bottom:8px;background:#202020;border:1px solid rgba(255,255,255,0.06);border-radius:8px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">' +
          '<div style="font-size:13px;font-weight:600;">' + (isOutbound ? '📤' : '📥') + ' ' + subject + '</div>' +
          (opened ? '<span style="font-size:10px;color:#10b981;white-space:nowrap;">✅ Read</span>' : '<span style="font-size:10px;color:rgba(255,255,255,0.3);white-space:nowrap;">Unread</span>') +
        '</div>' +
        (preview ? '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px;max-height:40px;overflow:hidden;">' + preview + '</div>' : '') +
        '<div style="font-size:10px;color:rgba(255,255,255,0.3);">' + (isOutbound ? 'Sent' : 'Received') + ' · ' + time + '</div>' +
      '</div>';
    });
  }
  content += '</div>';

  // Compose form
  content += `
<div style="background:#202020;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;">
  <div style="font-size:13px;font-weight:600;margin-bottom:10px;">✉️ New Email</div>
  <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">To: ${c.email}</div>
  <input type="text" id="hubEmailSubject" placeholder="Subject" autocomplete="off" autocorrect="off" spellcheck="false" style="width:100%;padding:9px 12px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:13px;margin-bottom:8px;outline:none;">
  <textarea id="hubEmailBody" rows="4" placeholder="Write your message..." autocomplete="off" style="width:100%;padding:9px 12px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-family:inherit;font-size:13px;resize:vertical;outline:none;margin-bottom:8px;"></textarea>
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:10px;color:rgba(255,255,255,0.25);">📊 Open tracking enabled</span>
    <button id="hubEmailSendBtn" onclick="sendHubEmail('${c.id}')" style="padding:8px 20px;background:var(--red);border:none;color:#fff;border-radius:6px;cursor:pointer;font-weight:700;font-family:inherit;font-size:13px;">Send Email</button>
  </div>
</div>`;

  return content;
}

// ── Drawer Tab: Calls ────────────────────────
async function loadCallRecordings(contactId) {
  if (!db) return [];
  try {
    const { data, error } = await db
      .from('communications')
      .select('*')
      .eq('client_id', contactId)
      .eq('channel', 'call')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { console.error('Load calls error:', error); return []; }
    return data || [];
  } catch (e) { console.error('Load calls:', e); return []; }
}

function renderDrawerCalls(c) {
  // We need to load calls async, so show loading then replace
  const containerId = 'hubCallsContainer';
  setTimeout(async () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const calls = await loadCallRecordings(c.id);
    if (calls.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:40px 10px;color:rgba(255,255,255,0.2);font-size:13px;">📞 No call recordings yet<br><span style="font-size:11px;margin-top:6px;display:block;">When clients call, recordings and transcripts will appear here.</span></div>';
      return;
    }

    let html = '';
    calls.forEach((call, i) => {
      const meta = call.metadata || {};
      const duration = meta.duration || 0;
      const durationStr = duration ? `${Math.floor(duration/60)}:${String(Math.round(duration%60)).padStart(2,'0')}` : '—';
      const dir = call.direction === 'inbound' ? '📥 Incoming' : '📤 Outgoing';
      const dirColor = call.direction === 'inbound' ? '#10b981' : '#3b82f6';
      const time = formatHubTime(call.created_at);
      const recordingUrl = meta.recording_url || null;
      const transcript = meta.transcript || null;
      const summary = meta.summary || null;
      const from = meta.from || '';
      const to = meta.to || '';

      html += `<div style="padding:14px;margin-bottom:10px;background:#202020;border:1px solid rgba(255,255,255,0.06);border-radius:10px;">`;

      // Header row
      html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">`;
      html += `<div style="display:flex;align-items:center;gap:8px;">`;
      html += `<span style="font-size:13px;font-weight:600;color:${dirColor};">${dir}</span>`;
      html += `<span style="font-size:11px;color:rgba(255,255,255,0.3);">⏱ ${durationStr}</span>`;
      html += `</div>`;
      html += `<span style="font-size:10px;color:rgba(255,255,255,0.3);">${time}</span>`;
      html += `</div>`;

      // Audio player
      if (recordingUrl) {
        html += `<div style="margin-bottom:8px;">`;
        html += `<audio controls preload="none" style="width:100%;height:36px;border-radius:6px;outline:none;" src="${recordingUrl}"></audio>`;
        html += `</div>`;
      } else {
        html += `<div style="padding:8px;background:#1a1a1a;border-radius:6px;text-align:center;font-size:11px;color:rgba(255,255,255,0.2);margin-bottom:8px;">No recording available</div>`;
      }

      // Summary
      if (summary) {
        html += `<div style="padding:8px 10px;background:#1a1a2e;border:1px solid rgba(139,92,246,0.15);border-radius:6px;margin-bottom:6px;">`;
        html += `<div style="font-size:10px;font-weight:700;color:#8b5cf6;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">🧠 AI Summary</div>`;
        html += `<div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5;">${summary}</div>`;
        html += `</div>`;
      }

      // Transcript toggle
      if (transcript) {
        const transcriptId = 'callTranscript_' + i;
        html += `<div>`;
        html += `<button onclick="document.getElementById('${transcriptId}').style.display=document.getElementById('${transcriptId}').style.display==='none'?'block':'none';" style="background:none;border:none;color:#8b5cf6;font-size:11px;cursor:pointer;padding:4px 0;font-weight:600;font-family:inherit;">📝 Toggle Transcript</button>`;
        html += `<div id="${transcriptId}" style="display:none;margin-top:6px;padding:10px;background:#1a1a1a;border-radius:6px;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.6;max-height:200px;overflow-y:auto;white-space:pre-wrap;">${transcript}</div>`;
        html += `</div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  }, 50);

  return `<div id="${containerId}" style="max-height:420px;overflow-y:auto;">
    <div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);font-size:12px;">Loading calls...</div>
  </div>`;
}

// ── Send SMS Inline ──────────────────────────
async function sendHubSmsInline(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c || !c.phone) return;

  const input = document.getElementById('hubSmsInput');
  const msg = input?.value?.trim();
  if (!msg) return;

  const btn = document.getElementById('hubSmsSendBtn');
  btn.disabled = true;
  btn.textContent = '...';
  input.disabled = true;

  try {
    const resp = await fetch('/.netlify/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: c.phone, message: msg, contactId: contactId })
    });
    if (!resp.ok) throw new Error('Send failed');

    // Update last_activity_at
    if (db) {
      await db.from('crm_contacts').update({ last_activity_at: new Date().toISOString(), status: c.status === 'new_lead' ? 'contacted' : c.status }).eq('id', contactId);
    }

    // Clear input + refresh
    input.value = '';
    await fetchContactHubData();
    contactHubDrawerTab = 'sms';
    renderContactHub();

    // Scroll to bottom of thread
    setTimeout(() => {
      const thread = document.getElementById('hubSmsThread');
      if (thread) thread.scrollTop = thread.scrollHeight;
    }, 100);
  } catch (err) {
    alert('❌ SMS failed: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Send';
    input.disabled = false;
  }
}

// ── Send Email Inline ────────────────────────
async function sendHubEmail(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c || !c.email) return;

  const subject = document.getElementById('hubEmailSubject')?.value?.trim();
  const body = document.getElementById('hubEmailBody')?.value?.trim();
  if (!subject || !body) { alert('Subject and message are required'); return; }

  const btn = document.getElementById('hubEmailSendBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const resp = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: c.email,
        subject: subject,
        html: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;">' + body.replace(/\n/g, '<br>') + '</div>',
        text: body,
        contactId: contactId
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Send failed');

    // Update last_activity_at + auto-mark contacted
    if (db) {
      await db.from('crm_contacts').update({
        last_activity_at: new Date().toISOString(),
        status: c.status === 'new_lead' ? 'contacted' : c.status
      }).eq('id', contactId);
    }

    // Refresh and stay on email tab
    await fetchContactHubData();
    contactHubDrawerTab = 'email';
    renderContactHub();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Send Email';
    alert('❌ Failed: ' + err.message);
  }
}

async function convertHubToClient(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c) return;
  if (!confirm('Convert ' + hubDisplayName(c) + ' to a full client?')) return;

  // Update status in Supabase
  await setHubContactStatus(contactId, 'client');

  // Also create in local clients array if it exists
  if (typeof clients !== 'undefined' && typeof saveClients === 'function') {
    const existing = clients.find(cl => cl.email === c.email || cl.phone === c.phone);
    if (!existing) {
      clients.push({
        id: Date.now(),
        name: c.company || hubDisplayName(c) || 'New Client',
        contact: hubDisplayName(c),
        email: c.email || '',
        phone: c.phone || '',
        password: 'client' + Math.random().toString(36).substring(7),
        industry: c.industry || '',
        createdAt: new Date().toISOString(),
        _hubSynced: true  // Already in crm_contacts, skip re-sync
      });
      saveClients();
    }
  }
  alert('✅ ' + hubDisplayName(c) + ' is now a client!');
  renderContactHub();
}

async function deleteHubContact(contactId) {
  if (!confirm('Delete this contact and all their activity? This cannot be undone.')) return;
  if (!db) return;
  try {
    // Delete activities first (foreign key)
    await db.from('activity_log').delete().eq('contact_id', contactId);
    await db.from('crm_contacts').delete().eq('id', contactId);
    contactHubData.contacts = contactHubData.contacts.filter(c => c.id !== contactId);
    contactHubData.activities = contactHubData.activities.filter(a => a.contact_id !== contactId);
    contactHubSelected = null;
    renderContactHub();
    console.log('✅ Contact deleted');
  } catch (err) { alert('Delete failed: ' + err.message); }
}

// ── Add Contact Modal ────────────────────────
function showAddHubContactModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'hubContactModal';
  modal.innerHTML = `
<div class="modal" style="max-width:480px;">
  <div class="modal-header">
    <h3 class="modal-title">📡 Add Contact</h3>
    <button class="modal-close" onclick="document.getElementById('hubContactModal').remove()">×</button>
  </div>
  <div class="modal-body">
    <div class="form-group"><label class="form-label">First Name *</label><input type="text" id="hubNewFirstName" class="form-input" placeholder="John"></div>
    <div class="form-group"><label class="form-label">Last Name</label><input type="text" id="hubNewLastName" class="form-input" placeholder="Smith"></div>
    <div class="form-group"><label class="form-label">Phone</label><input type="tel" id="hubNewPhone" class="form-input" placeholder="+13135551234"></div>
    <div class="form-group"><label class="form-label">Email</label><input type="email" id="hubNewEmail" class="form-input" placeholder="john@company.com"></div>
    <div class="form-group"><label class="form-label">Company</label><input type="text" id="hubNewCompany" class="form-input" placeholder="Company Name"></div>
    <div class="form-group"><label class="form-label">Industry</label>
      <select id="hubNewIndustry" class="form-select">
        <option value="">Select...</option>
        <option value="trades">Trades</option>
        <option value="marine">Marine</option>
        <option value="farming">Farming</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="bars">Bars/Restaurant</option>
        <option value="authors">Authors</option>
        <option value="apparel">Apparel</option>
        <option value="tax_financial">Tax/Financial</option>
        <option value="tech">Tech</option>
        <option value="events">Events/Comedy</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div class="form-group"><label class="form-label">Notes</label><textarea id="hubNewNotes" class="form-textarea" rows="3" placeholder="How did they find NUI?"></textarea></div>
  </div>
  <div class="modal-footer">
    <button class="btn-admin secondary" onclick="document.getElementById('hubContactModal').remove()">Cancel</button>
    <button class="btn-admin primary" onclick="saveNewHubContact()">Save Contact</button>
  </div>
</div>`;
  document.body.appendChild(modal);
}

async function saveNewHubContact() {
  const firstName = document.getElementById('hubNewFirstName').value.trim();
  if (!firstName) { alert('First name is required'); return; }

  const contact = {
    first_name: firstName,
    last_name: document.getElementById('hubNewLastName').value.trim() || null,
    phone: document.getElementById('hubNewPhone').value.trim() || null,
    email: document.getElementById('hubNewEmail').value.trim() || null,
    company: document.getElementById('hubNewCompany').value.trim() || null,
    industry: document.getElementById('hubNewIndustry').value || null,
    notes: document.getElementById('hubNewNotes').value.trim() || null,
    source: 'manual',
    status: 'new_lead',
    last_activity_at: new Date().toISOString()
  };

  if (!db) { alert('Supabase not connected'); return; }

  try {
    const { data, error } = await db.from('crm_contacts').insert(contact).select().single();
    if (error) throw error;
    contactHubData.contacts.unshift(data);
    document.getElementById('hubContactModal').remove();
    renderContactHub();
    console.log('✅ Contact created:', data.id);
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

// ── Time Formatting ──────────────────────────
function formatHubTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  if (hrs < 24) return hrs + 'h ago';
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString();
}

// ============================================
// CSV BULK IMPORT
// ============================================

function showCsvUploadModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'csvUploadModal';
  modal.innerHTML = `
<div class="modal" style="max-width:640px;">
  <div class="modal-header">
    <h3 class="modal-title">📄 Import Contacts from CSV</h3>
    <button class="modal-close" onclick="document.getElementById('csvUploadModal').remove()">×</button>
  </div>
  <div class="modal-body">
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:16px;">
      Upload a CSV file with columns: <strong>name, phone, email, company, industry, notes</strong><br>
      Only <code>name</code> is required. All contacts will be added as "new_lead" with source "csv_import".
    </p>
    <div style="border:2px dashed rgba(255,255,255,0.15);border-radius:12px;padding:40px;text-align:center;margin-bottom:16px;cursor:pointer;" id="csvDropZone" onclick="document.getElementById('csvFileInput').click()">
      <div style="font-size:32px;margin-bottom:8px;">📂</div>
      <div style="color:rgba(255,255,255,0.5);font-size:14px;">Click to select or drag & drop CSV file</div>
      <input type="file" id="csvFileInput" accept=".csv,.txt" style="display:none;" onchange="previewCsvFile(event)">
    </div>
    <div id="csvPreviewArea" style="display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="font-size:14px;font-weight:600;">Preview</h4>
        <span id="csvRowCount" style="font-size:12px;color:rgba(255,255,255,0.4);"></span>
      </div>
      <div id="csvPreviewTable" style="max-height:300px;overflow-y:auto;border:1px solid rgba(255,255,255,0.08);border-radius:8px;"></div>
      <div id="csvColumnMapping" style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;">
        <h4 style="font-size:13px;font-weight:600;margin-bottom:8px;">Column Mapping</h4>
        <div id="csvMappingFields" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;"></div>
      </div>
    </div>
    <div id="csvImportStatus" style="display:none;padding:16px;border-radius:8px;margin-top:12px;text-align:center;"></div>
  </div>
  <div class="modal-footer">
    <button class="btn-admin secondary" onclick="document.getElementById('csvUploadModal').remove()">Cancel</button>
    <button class="btn-admin primary" id="csvImportBtn" onclick="executeCsvImport()" disabled style="opacity:0.5;">Import Contacts</button>
  </div>
</div>`;
  document.body.appendChild(modal);

  // Drag and drop handlers
  const zone = document.getElementById('csvDropZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--red)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = 'rgba(255,255,255,0.15)'; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = 'rgba(255,255,255,0.15)';
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        parseCsvFromFile(file);
      } else {
        alert('Please upload a .csv or .txt file');
      }
    }
  });
}

let csvParsedRows = [];
let csvHeaders = [];
let csvColumnMap = {};

function previewCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  parseCsvFromFile(file);
}

function parseCsvFromFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { alert('CSV must have a header row + at least 1 data row'); return; }

    // Parse header
    csvHeaders = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    
    // Parse rows
    csvParsedRows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.some(v => v.trim())) {
        const row = {};
        csvHeaders.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
        csvParsedRows.push(row);
      }
    }

    // Auto-map columns
    const targetFields = ['first_name', 'last_name', 'phone', 'email', 'company', 'industry', 'notes'];
    csvColumnMap = {};
    targetFields.forEach(f => {
      const match = csvHeaders.find(h =>
        h === f ||
        h.includes(f.replace('_', ' ')) ||
        h.includes(f.replace('_', '')) ||
        (f === 'first_name' && (h.includes('first') || h === 'name' || h === 'contact' || h.includes('full'))) ||
        (f === 'last_name' && h.includes('last')) ||
        (f === 'phone' && (h.includes('tel') || h.includes('mobile') || h.includes('cell'))) ||
        (f === 'email' && h.includes('mail')) ||
        (f === 'company' && (h.includes('business') || h.includes('org'))) ||
        (f === 'industry' && (h.includes('type') || h.includes('category') || h.includes('sector')))
      );
      if (match) csvColumnMap[f] = match;
    });

    // Show preview
    document.getElementById('csvPreviewArea').style.display = 'block';
    document.getElementById('csvRowCount').textContent = csvParsedRows.length + ' contacts found';
    
    // Preview table (first 5 rows)
    const previewRows = csvParsedRows.slice(0, 5);
    let tableHtml = '<table style="width:100%;font-size:11px;border-collapse:collapse;">';
    tableHtml += '<tr>' + csvHeaders.map(h => '<th style="padding:6px 8px;background:#1c1c1c;border-bottom:1px solid rgba(255,255,255,0.08);text-align:left;color:rgba(255,255,255,0.5);font-weight:600;">' + h + '</th>').join('') + '</tr>';
    previewRows.forEach(row => {
      tableHtml += '<tr>' + csvHeaders.map(h => '<td style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (row[h] || '') + '</td>').join('') + '</tr>';
    });
    if (csvParsedRows.length > 5) tableHtml += '<tr><td colspan="' + csvHeaders.length + '" style="padding:6px;text-align:center;color:rgba(255,255,255,0.3);font-size:11px;">+ ' + (csvParsedRows.length - 5) + ' more rows</td></tr>';
    tableHtml += '</table>';
    document.getElementById('csvPreviewTable').innerHTML = tableHtml;

    // Column mapping dropdowns
    const mappingHtml = targetFields.map(f => {
      return '<div style="display:flex;align-items:center;gap:6px;">' +
        '<label style="color:rgba(255,255,255,0.5);min-width:60px;">' + f + ':</label>' +
        '<select id="csvMap_' + f + '" style="flex:1;padding:4px 6px;background:#1c1c1c;border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#fff;font-size:11px;" onchange="csvColumnMap[\'' + f + '\']=this.value">' +
        '<option value="">— skip —</option>' +
        csvHeaders.map(h => '<option value="' + h + '"' + (csvColumnMap[f] === h ? ' selected' : '') + '>' + h + '</option>').join('') +
        '</select></div>';
    }).join('');
    document.getElementById('csvMappingFields').innerHTML = mappingHtml;

    // Enable import button
    document.getElementById('csvImportBtn').disabled = false;
    document.getElementById('csvImportBtn').style.opacity = '1';
  };
  reader.readAsText(file);
}

// RFC 4180 CSV parser (handles quoted fields, commas in values)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

async function executeCsvImport() {
  if (!db) { alert('Supabase not connected'); return; }
  if (!csvParsedRows.length) { alert('No data to import'); return; }

  // Re-read column mappings from dropdowns
  ['first_name', 'last_name', 'phone', 'email', 'company', 'industry', 'notes'].forEach(f => {
    const sel = document.getElementById('csvMap_' + f);
    if (sel) csvColumnMap[f] = sel.value;
  });

  if (!csvColumnMap.first_name) {
    alert('You must map the "first_name" column — it\'s required.');
    return;
  }

  const statusEl = document.getElementById('csvImportStatus');
  statusEl.style.display = 'block';
  statusEl.style.background = '#111';
  statusEl.innerHTML = '<div style="color:#f59e0b;">⏳ Importing ' + csvParsedRows.length + ' contacts...</div>';

  let imported = 0, skipped = 0, errors = 0;

  // Batch in groups of 25
  const batchSize = 25;
  for (let i = 0; i < csvParsedRows.length; i += batchSize) {
    const batch = csvParsedRows.slice(i, i + batchSize).map(row => {
      const contact = {
        first_name: row[csvColumnMap.first_name] || 'Unnamed',
        last_name: csvColumnMap.last_name ? (row[csvColumnMap.last_name] || null) : null,
        phone: csvColumnMap.phone ? (row[csvColumnMap.phone] || null) : null,
        email: csvColumnMap.email ? (row[csvColumnMap.email] || null) : null,
        company: csvColumnMap.company ? (row[csvColumnMap.company] || null) : null,
        industry: csvColumnMap.industry ? (row[csvColumnMap.industry] || null) : null,
        notes: csvColumnMap.notes ? (row[csvColumnMap.notes] || null) : null,
        source: 'csv_import',
        status: 'new_lead',
        last_activity_at: new Date().toISOString()
      };
      // Clean phone
      if (contact.phone) {
        contact.phone = contact.phone.replace(/[^\d+]/g, '');
        if (contact.phone.length === 10) contact.phone = '+1' + contact.phone;
        else if (contact.phone.length === 11 && contact.phone.startsWith('1')) contact.phone = '+' + contact.phone;
      }
      if (!contact.first_name || contact.first_name === 'Unnamed') return null;
      return contact;
    }).filter(Boolean);

    if (batch.length === 0) { skipped += batchSize; continue; }

    try {
      const { data, error } = await db.from('crm_contacts').insert(batch).select();
      if (error) throw error;
      imported += data.length;
    } catch (err) {
      console.warn('CSV batch error:', err.message);
      errors += batch.length;
    }

    // Update progress
    statusEl.innerHTML = '<div style="color:#f59e0b;">⏳ Imported ' + imported + ' of ' + csvParsedRows.length + '...</div>';
  }

  // Done
  statusEl.style.background = imported > 0 ? '#0a2a0a' : '#2a0a0a';
  statusEl.innerHTML = '<div style="color:' + (imported > 0 ? '#10b981' : '#ef4444') + ';">✅ Done: ' + imported + ' imported' +
    (skipped > 0 ? ', ' + skipped + ' skipped' : '') +
    (errors > 0 ? ', ' + errors + ' errors' : '') + '</div>';

  if (imported > 0) {
    // Refresh the hub
    await fetchContactHubData();
    renderContactHub();
    // Re-show modal with status
    setTimeout(() => {
      const m = document.getElementById('csvUploadModal');
      if (m) m.remove();
    }, 2000);
  }
}
