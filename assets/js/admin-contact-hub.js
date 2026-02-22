// ============================================
// NUI Contact Hub — Supabase-powered CRM
// Reads from: crm_contacts + activity_log
// Written by: Quo webhook + admin manual entry
// ============================================

let contactHubData = { contacts: [], activities: [], loading: true };
let contactHubFilter = 'all';
let contactHubSearch = '';
let contactHubSelected = null;
let contactHubSort = 'newest';

// ── Fetch from Supabase ──────────────────────
async function fetchContactHubData() {
  contactHubData.loading = true;
  try {
    if (!db) throw new Error('Supabase not connected');

    const [contactsRes, activitiesRes] = await Promise.all([
      db.from('crm_contacts').select('*').order('last_activity_at', { ascending: false }),
      db.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200)
    ]);

    if (contactsRes.error) throw contactsRes.error;
    if (activitiesRes.error) throw activitiesRes.error;

    contactHubData.contacts = contactsRes.data || [];
    contactHubData.activities = activitiesRes.data || [];
    contactHubData.loading = false;
    console.log('✅ Contact Hub: ' + contactHubData.contacts.length + ' contacts, ' + contactHubData.activities.length + ' activities');
  } catch (err) {
    console.warn('Contact Hub fetch failed:', err.message);
    contactHubData.loading = false;
    contactHubData.contacts = [];
    contactHubData.activities = [];
  }
}

// ── Main Panel Loader ────────────────────────
async function loadAdminContactHubPanel() {
  const panel = document.getElementById('adminContactHubPanel');
  if (!panel) return;

  // Show loading state
  panel.innerHTML = '<div style="padding:60px;text-align:center;color:rgba(255,255,255,0.4);"><div style="font-size:32px;margin-bottom:12px;">📡</div>Loading contacts from Supabase...</div>';

  await fetchContactHubData();
  renderContactHub();
}

function renderContactHub() {
  const panel = document.getElementById('adminContactHubPanel');
  if (!panel) return;

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
  .ch-stat { background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; }
  .ch-stat .num { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .ch-stat .lbl { font-size: 12px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; }
  .ch-toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
  .ch-search { padding: 10px 16px; background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; width: 260px; font-family: inherit; font-size: 14px; }
  .ch-filter-btn { padding: 8px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
  .ch-filter-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
  .ch-filter-btn.active { background: var(--red); border-color: var(--red); color: #fff; }
  .ch-table { width: 100%; border-collapse: collapse; }
  .ch-table th { text-align: left; padding: 10px 12px; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.4); position: sticky; top: 0; }
  .ch-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .ch-table tr { cursor: pointer; transition: background 0.15s; }
  .ch-table tr:hover td { background: rgba(255,255,255,0.025); }
  .ch-table tr.selected td { background: rgba(220,38,38,0.08); }
  .ch-badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .ch-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .ch-drawer { position: fixed; top: 0; right: 0; width: 420px; height: 100vh; background: #111; border-left: 1px solid rgba(255,255,255,0.1); z-index: 9000; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s ease; }
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
      <button onclick="fetchContactHubData().then(renderContactHub)" class="ch-filter-btn" style="background:#111;">🔄 Refresh</button>
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

<!-- Source pills -->
<div class="ch-source-pills">
  ${Object.entries(sources).map(([src, count]) => {
    const colors = { quo_call: '#8b5cf6', quo_text: '#10b981', website_form: '#3b82f6', manual: '#f59e0b', referral: '#ec4899' };
    const labels = { quo_call: '📞 Calls', quo_text: '💬 Texts', website_form: '🌐 Forms', manual: '✏️ Manual', referral: '🤝 Referral' };
    return '<span class="ch-source-pill" style="background:' + (colors[src] || '#666') + '20;color:' + (colors[src] || '#999') + ';">' + (labels[src] || src) + ': ' + count + '</span>';
  }).join('')}
</div>

<!-- Toolbar -->
<div class="ch-toolbar">
  <input type="text" class="ch-search" placeholder="Search name, phone, email..." value="${contactHubSearch}" oninput="contactHubSearch=this.value;renderContactHub();">
  <button class="ch-filter-btn ${contactHubFilter === 'all' ? 'active' : ''}" onclick="contactHubFilter='all';renderContactHub();">All</button>
  <button class="ch-filter-btn ${contactHubFilter === 'new_lead' ? 'active' : ''}" onclick="contactHubFilter='new_lead';renderContactHub();">🔥 New</button>
  <button class="ch-filter-btn ${contactHubFilter === 'contacted' ? 'active' : ''}" onclick="contactHubFilter='contacted';renderContactHub();">📞 Contacted</button>
  <button class="ch-filter-btn ${contactHubFilter === 'qualified' ? 'active' : ''}" onclick="contactHubFilter='qualified';renderContactHub();">✅ Qualified</button>
  <button class="ch-filter-btn ${contactHubFilter === 'client' ? 'active' : ''}" onclick="contactHubFilter='client';renderContactHub();">⭐ Client</button>
  <select onchange="contactHubSort=this.value;renderContactHub();" style="padding:8px 12px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
    <option value="newest" ${contactHubSort === 'newest' ? 'selected' : ''}>Newest First</option>
    <option value="oldest" ${contactHubSort === 'oldest' ? 'selected' : ''}>Oldest First</option>
    <option value="recent_activity" ${contactHubSort === 'recent_activity' ? 'selected' : ''}>Recent Activity</option>
    <option value="name" ${contactHubSort === 'name' ? 'selected' : ''}>Name A-Z</option>
  </select>
</div>

<!-- Contact Table -->
${contacts.length > 0 ? renderContactTable(contacts) : '<div class="ch-empty"><div style="font-size:48px;margin-bottom:12px;">📡</div><div style="font-size:16px;margin-bottom:8px;">No contacts yet</div><div>Contacts appear automatically when someone calls or texts your Quo number</div></div>'}

<!-- Drawer overlay -->
<div class="ch-drawer-overlay ${contactHubSelected ? 'open' : ''}" onclick="closeContactDrawer()"></div>
<div class="ch-drawer ${contactHubSelected ? 'open' : ''}" id="contactDrawer">
  ${contactHubSelected ? renderContactDrawer(contactHubSelected) : ''}
</div>
  `;
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
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  }

  // Sort
  if (contactHubSort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else if (contactHubSort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  else if (contactHubSort === 'recent_activity') list.sort((a, b) => new Date(b.last_activity_at || b.created_at) - new Date(a.last_activity_at || a.created_at));
  else if (contactHubSort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return list;
}

// ── Table Renderer ───────────────────────────
function renderContactTable(contacts) {
  const statusColors = {
    new_lead: { bg: '#f59e0b20', color: '#f59e0b', label: 'New Lead' },
    contacted: { bg: '#3b82f620', color: '#3b82f6', label: 'Contacted' },
    qualified: { bg: '#10b98120', color: '#10b981', label: 'Qualified' },
    client: { bg: '#8b5cf620', color: '#8b5cf6', label: 'Client' },
    lost: { bg: '#ef444420', color: '#ef4444', label: 'Lost' }
  };
  const sourceIcons = { quo_call: '📞', quo_text: '💬', website_form: '🌐', manual: '✏️', referral: '🤝' };

  return `<div style="overflow-x:auto;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
<table class="ch-table">
<thead><tr>
  <th>Contact</th>
  <th>Phone</th>
  <th>Source</th>
  <th>Status</th>
  <th>Last Activity</th>
  <th>Sona</th>
  <th>Actions</th>
</tr></thead>
<tbody>
${contacts.map(c => {
  const st = statusColors[c.status] || statusColors.new_lead;
  const activities = contactHubData.activities.filter(a => a.contact_id === c.id);
  const lastAct = activities[0];
  const hasUnread = activities.some(a => !a.read);
  return `<tr class="${contactHubSelected === c.id ? 'selected' : ''}" onclick="openContactDrawer('${c.id}')">
    <td>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="ch-avatar" style="background:${st.color}20;color:${st.color};">${(c.name || '?').charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-weight:600;font-size:14px;">${c.name || 'Unknown'}${hasUnread ? ' <span style="color:#ef4444;font-size:10px;">●</span>' : ''}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4);">${c.email || c.company || '—'}</div>
        </div>
      </div>
    </td>
    <td style="font-size:13px;font-family:monospace;color:rgba(255,255,255,0.7);">${c.phone || '—'}</td>
    <td><span style="font-size:16px;" title="${c.source || 'unknown'}">${sourceIcons[c.source] || '❓'}</span></td>
    <td><span class="ch-badge" style="background:${st.bg};color:${st.color};">${st.label}</span></td>
    <td style="font-size:12px;color:rgba(255,255,255,0.45);">${lastAct ? formatHubTime(lastAct.created_at) : '—'}</td>
    <td>${c.sona_qualified ? '<span style="color:#10b981;font-size:16px;" title="Sona qualified">✅</span>' : '<span style="color:rgba(255,255,255,0.2);">—</span>'}</td>
    <td>
      <div style="display:flex;gap:4px;" onclick="event.stopPropagation();">
        ${c.phone ? '<button onclick="hubQuickCall(\'' + c.phone + '\')" style="padding:4px 8px;background:#8b5cf620;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Call">📞</button>' : ''}
        ${c.phone ? '<button onclick="hubQuickSms(\'' + c.id + '\')" style="padding:4px 8px;background:#10b98120;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="SMS">💬</button>' : ''}
        ${c.email ? '<button onclick="hubQuickEmail(\'' + c.id + '\')" style="padding:4px 8px;background:#3b82f620;border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Email">📧</button>' : ''}
        <button onclick="updateHubContactStatus(\'' + c.id + '\')" style="padding:4px 8px;background:rgba(255,255,255,0.06);border:none;border-radius:4px;cursor:pointer;font-size:14px;" title="Update status">⚡</button>
      </div>
    </td>
  </tr>`;
}).join('')}
</tbody>
</table></div>`;
}

// ── Contact Detail Drawer ────────────────────
function renderContactDrawer(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.3);">Contact not found</div>';

  const activities = contactHubData.activities.filter(a => a.contact_id === contactId).slice(0, 50);
  const typeIcons = { text: '💬', call: '📞', email: '📧', voicemail: '📬', form: '📋' };
  const statusOptions = ['new_lead', 'contacted', 'qualified', 'client', 'lost'];

  return `
<div style="padding:24px;">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
    <div style="display:flex;gap:14px;align-items:center;">
      <div class="ch-avatar" style="width:52px;height:52px;font-size:22px;background:var(--red);color:#fff;">${(c.name || '?').charAt(0).toUpperCase()}</div>
      <div>
        <h3 style="font-size:20px;font-weight:700;margin-bottom:2px;">${c.name || 'Unknown'}</h3>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);">${c.company || ''}</div>
      </div>
    </div>
    <button onclick="closeContactDrawer()" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:4px;">✕</button>
  </div>

  <!-- Contact Info -->
  <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-bottom:20px;">
    ${c.phone ? '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:rgba(255,255,255,0.45);font-size:13px;">Phone</span><a href="tel:' + c.phone + '" style="color:#fff;font-family:monospace;">' + c.phone + '</a></div>' : ''}
    ${c.email ? '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:rgba(255,255,255,0.45);font-size:13px;">Email</span><a href="mailto:' + c.email + '" style="color:#3b82f6;">' + c.email + '</a></div>' : ''}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:rgba(255,255,255,0.45);font-size:13px;">Source</span><span>${c.source || '—'}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:rgba(255,255,255,0.45);font-size:13px;">Status</span>
      <select onchange="setHubContactStatus('${c.id}', this.value)" style="padding:4px 8px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#fff;font-size:12px;">
        ${statusOptions.map(s => '<option value="' + s + '"' + (c.status === s ? ' selected' : '') + '>' + s.replace('_', ' ') + '</option>').join('')}
      </select>
    </div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:rgba(255,255,255,0.45);font-size:13px;">Sona Qualified</span><span>${c.sona_qualified ? '✅ Yes' : '❌ No'}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;">
      <span style="color:rgba(255,255,255,0.45);font-size:13px;">Created</span><span style="font-size:13px;">${new Date(c.created_at).toLocaleDateString()} ${new Date(c.created_at).toLocaleTimeString()}</span>
    </div>
  </div>

  <!-- Quick Actions -->
  <div style="display:flex;gap:8px;margin-bottom:24px;">
    ${c.phone ? '<button onclick="hubQuickCall(\'' + c.phone + '\')" style="flex:1;padding:10px;background:#8b5cf6;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">📞 Call</button>' : ''}
    ${c.phone ? '<button onclick="hubQuickSms(\'' + c.id + '\')" style="flex:1;padding:10px;background:#10b981;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">💬 SMS</button>' : ''}
    ${c.email ? '<button onclick="hubQuickEmail(\'' + c.id + '\')" style="flex:1;padding:10px;background:#3b82f6;border:none;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">📧 Email</button>' : ''}
  </div>

  <!-- Notes -->
  <div style="margin-bottom:24px;">
    <h4 style="font-size:14px;font-weight:600;margin-bottom:8px;">📝 Notes</h4>
    <textarea id="hubContactNotes" rows="3" placeholder="Add notes about this contact..." style="width:100%;padding:10px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-family:inherit;font-size:13px;resize:vertical;">${c.notes || ''}</textarea>
    <button onclick="saveHubContactNotes('${c.id}')" style="margin-top:6px;padding:6px 14px;background:rgba(255,255,255,0.1);border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Save Notes</button>
  </div>

  <!-- Activity Timeline -->
  <div>
    <h4 style="font-size:14px;font-weight:600;margin-bottom:12px;">⏱️ Activity Timeline (${activities.length})</h4>
    ${activities.length > 0 ? activities.map(a => {
      const icon = typeIcons[a.type] || '📌';
      const dirColor = a.direction === 'inbound' ? '#10b981' : '#3b82f6';
      return '<div class="ch-timeline-item">' +
        '<div class="ch-timeline-icon" style="background:' + dirColor + '20;color:' + dirColor + ';">' + icon + '</div>' +
        '<div class="ch-timeline-content">' +
          '<div style="font-size:13px;margin-bottom:2px;">' + (a.content || a.type) + '</div>' +
          '<div class="ch-timeline-time">' + (a.direction === 'inbound' ? '← Inbound' : '→ Outbound') + ' · ' + formatHubTime(a.created_at) + '</div>' +
        '</div>' +
      '</div>';
    }).join('') : '<div style="color:rgba(255,255,255,0.3);font-size:13px;padding:20px 0;text-align:center;">No activity yet</div>'}
  </div>

  <!-- Danger Zone -->
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
    <button onclick="convertHubToClient('${c.id}')" style="width:100%;padding:10px;background:#8b5cf620;border:1px solid #8b5cf640;color:#8b5cf6;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;margin-bottom:8px;">⭐ Convert to Client</button>
    <button onclick="deleteHubContact('${c.id}')" style="width:100%;padding:10px;background:#ef444420;border:1px solid #ef444440;color:#ef4444;border-radius:8px;cursor:pointer;font-weight:600;font-family:inherit;">🗑 Delete Contact</button>
  </div>
</div>`;
}

// ── Actions ──────────────────────────────────
function openContactDrawer(contactId) {
  contactHubSelected = contactId;
  // Mark activities as read
  markHubActivitiesRead(contactId);
  renderContactHub();
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

function hubQuickCall(phone) {
  window.open('tel:' + phone, '_self');
}

function hubQuickSms(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c || !c.phone) { alert('No phone number'); return; }
  const msg = prompt('SMS to ' + (c.name || c.phone) + ':');
  if (!msg) return;
  // Send via API
  fetch('/.netlify/functions/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: c.phone, message: msg })
  }).then(r => {
    if (r.ok) alert('✅ SMS sent!');
    else alert('❌ SMS failed');
  }).catch(() => alert('❌ SMS failed'));
}

function hubQuickEmail(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c || !c.email) { alert('No email'); return; }
  window.open('mailto:' + c.email, '_blank');
}

async function convertHubToClient(contactId) {
  const c = contactHubData.contacts.find(x => x.id === contactId);
  if (!c) return;
  if (!confirm('Convert ' + (c.name || 'this contact') + ' to a full client?')) return;

  // Update status in Supabase
  await setHubContactStatus(contactId, 'client');

  // Also create in local clients array if it exists
  if (typeof clients !== 'undefined' && typeof saveClients === 'function') {
    const existing = clients.find(cl => cl.email === c.email || cl.phone === c.phone);
    if (!existing) {
      clients.push({
        id: Date.now(),
        name: c.company || c.name || 'New Client',
        contact: c.name,
        email: c.email || '',
        phone: c.phone || '',
        password: 'client' + Math.random().toString(36).substring(7),
        industry: c.industry || '',
        createdAt: new Date().toISOString()
      });
      saveClients();
    }
  }
  alert('✅ ' + (c.name || 'Contact') + ' is now a client!');
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
    <div class="form-group"><label class="form-label">Name *</label><input type="text" id="hubNewName" class="form-input" placeholder="John Smith"></div>
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
  const name = document.getElementById('hubNewName').value.trim();
  if (!name) { alert('Name is required'); return; }

  const contact = {
    name,
    phone: document.getElementById('hubNewPhone').value.trim() || null,
    email: document.getElementById('hubNewEmail').value.trim() || null,
    company: document.getElementById('hubNewCompany').value.trim() || null,
    industry: document.getElementById('hubNewIndustry').value || null,
    notes: document.getElementById('hubNewNotes').value.trim() || null,
    source: 'manual',
    status: 'new_lead'
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
