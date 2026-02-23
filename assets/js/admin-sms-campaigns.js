// ==================== SMS DRIP CAMPAIGNS ====================
// Campaign creation, queue management, contact picker, stats
// Lives as a tab inside Contact Hub

let _campaigns = [];
let _campaignQueue = [];
let _activeCampaignId = null;

// ---- Data Layer ----
async function fetchCampaigns() {
  if (!db) return;
  const { data } = await db.from('sms_campaigns').select('*').order('created_at', { ascending: false });
  _campaigns = data || [];
}

async function fetchCampaignQueue(campaignId) {
  if (!db) return;
  const { data } = await db.from('sms_drip_queue').select('*').eq('campaign_id', campaignId).order('scheduled_at', { ascending: true });
  _campaignQueue = data || [];
}

// ---- Main Render ----
async function renderSmsCampaignsTab() {
  await fetchCampaigns();
  const container = document.getElementById('smsCampaignsTab');
  if (!container) return;

  if (_activeCampaignId) {
    await renderCampaignDetail(container);
    return;
  }

  const active = _campaigns.filter(c => c.status === 'active');
  const draft = _campaigns.filter(c => c.status === 'draft');
  const done = _campaigns.filter(c => c.status === 'complete' || c.status === 'paused');

  container.innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<div>
<h3 style="margin: 0; font-size: 18px;">📲 SMS Drip Campaigns</h3>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 4px;">Staggered outreach — ${_campaigns.reduce((s,c) => s + (c.per_day_limit || 20), 0)} max/day across all active campaigns</p>
</div>
<button class="btn-admin primary" onclick="showCreateCampaignModal()">+ New Campaign</button>
</div>

${active.length > 0 ? `
<div style="margin-bottom: 20px;">
<div style="font-size: 13px; font-weight: 600; color: #2ecc71; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">▶ Active</div>
${active.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${draft.length > 0 ? `
<div style="margin-bottom: 20px;">
<div style="font-size: 13px; font-weight: 600; color: #f59e0b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">📝 Drafts</div>
${draft.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${done.length > 0 ? `
<div style="margin-bottom: 20px;">
<div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">✓ Completed / Paused</div>
${done.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${_campaigns.length === 0 ? `
<div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4);">
<div style="font-size: 40px; margin-bottom: 12px;">📲</div>
<p>No campaigns yet. Create one to start reaching out to old clients.</p>
</div>` : ''}
  `;
}

function renderCampaignCard(c) {
  const pct = c.contacts_total > 0 ? Math.round((c.contacts_sent / c.contacts_total) * 100) : 0;
  const statusColors = { active: '#2ecc71', draft: '#f59e0b', paused: '#e74c3c', complete: '#888' };
  const color = statusColors[c.status] || '#888';

  return `
<div onclick="_activeCampaignId='${c.id}'; renderSmsCampaignsTab()" 
     style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: background 0.2s;"
     onmouseenter="this.style.background='rgba(255,255,255,0.08)'" onmouseleave="this.style.background='rgba(255,255,255,0.04)'">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-weight: 600; font-size: 15px;">${c.name}</div>
      <div style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 4px;">
        ${c.contacts_sent}/${c.contacts_total} sent · ${c.contacts_failed > 0 ? `<span style="color:#e74c3c">${c.contacts_failed} failed</span> · ` : ''}${c.per_day_limit}/day limit
      </div>
    </div>
    <div style="text-align: right;">
      <span style="background: ${color}22; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${c.status}</span>
      <div style="color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 6px;">${new Date(c.created_at).toLocaleDateString()}</div>
    </div>
  </div>
  ${c.status === 'active' ? `
  <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 6px; height: 6px; overflow: hidden;">
    <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 6px; transition: width 0.5s;"></div>
  </div>` : ''}
</div>`;
}

// ---- Campaign Detail View ----
async function renderCampaignDetail(container) {
  const c = _campaigns.find(x => x.id === _activeCampaignId);
  if (!c) { _activeCampaignId = null; renderSmsCampaignsTab(); return; }
  await fetchCampaignQueue(c.id);

  const sent = _campaignQueue.filter(q => q.status === 'sent');
  const queued = _campaignQueue.filter(q => q.status === 'queued');
  const failed = _campaignQueue.filter(q => q.status === 'failed');

  container.innerHTML = `
<div style="margin-bottom: 20px;">
  <button class="btn-admin" onclick="_activeCampaignId=null; renderSmsCampaignsTab()" style="margin-bottom: 16px;">← Back to Campaigns</button>
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <h3 style="margin: 0; font-size: 20px;">${c.name}</h3>
      <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 4px;">Created ${new Date(c.created_at).toLocaleDateString()} · ${c.per_day_limit}/day · ${c.send_start_hour}:00–${c.send_end_hour}:00 EST</p>
    </div>
    <div style="display: flex; gap: 8px;">
      ${c.status === 'draft' ? `<button class="btn-admin primary" onclick="launchCampaign('${c.id}')">🚀 Launch</button>` : ''}
      ${c.status === 'active' ? `<button class="btn-admin" onclick="pauseCampaign('${c.id}')" style="border-color: #e74c3c; color: #e74c3c;">⏸ Pause</button>` : ''}
      ${c.status === 'paused' ? `<button class="btn-admin primary" onclick="resumeCampaign('${c.id}')">▶ Resume</button>` : ''}
      <button class="btn-admin" onclick="deleteCampaign('${c.id}')" style="border-color: #e74c3c44; color: #e74c3c;">🗑</button>
    </div>
  </div>
</div>

<div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
  <div style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message Template</div>
  <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${c.message_template}</div>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
  <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-size: 24px; font-weight: 700;">${c.contacts_total}</div>
    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">TOTAL</div>
  </div>
  <div style="background: rgba(46,204,113,0.1); border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-size: 24px; font-weight: 700; color: #2ecc71;">${sent.length}</div>
    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">SENT</div>
  </div>
  <div style="background: rgba(245,158,11,0.1); border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${queued.length}</div>
    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">QUEUED</div>
  </div>
  <div style="background: rgba(231,76,60,0.1); border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-size: 24px; font-weight: 700; color: #e74c3c;">${failed.length}</div>
    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">FAILED</div>
  </div>
</div>

<div style="font-size: 13px; font-weight: 600; margin-bottom: 10px;">Queue (${_campaignQueue.length})</div>
<div style="max-height: 400px; overflow-y: auto;">
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    <thead>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">
        <th style="padding: 8px; color: rgba(255,255,255,0.5);">Contact</th>
        <th style="padding: 8px; color: rgba(255,255,255,0.5);">Phone</th>
        <th style="padding: 8px; color: rgba(255,255,255,0.5);">Scheduled</th>
        <th style="padding: 8px; color: rgba(255,255,255,0.5);">Status</th>
      </tr>
    </thead>
    <tbody>
      ${_campaignQueue.map(q => {
        const sc = { queued: '#f59e0b', sent: '#2ecc71', failed: '#e74c3c', skipped: '#888' };
        return `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px;">${q.contact_name || 'Unknown'}</td>
          <td style="padding: 8px; color: rgba(255,255,255,0.5);">${q.contact_phone}</td>
          <td style="padding: 8px; color: rgba(255,255,255,0.5);">${new Date(q.scheduled_at).toLocaleString()}</td>
          <td style="padding: 8px;"><span style="color: ${sc[q.status] || '#888'}; font-weight: 600; text-transform: uppercase; font-size: 11px;">${q.status}</span>${q.error ? `<span style="color:#e74c3c; font-size: 11px;"> — ${q.error}</span>` : ''}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>
  `;
}

// ---- Create Campaign Modal ----
let _campaignDraftContacts = [];

function showCreateCampaignModal() {
  _campaignDraftContacts = [];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'campaignModal';
  modal.innerHTML = `
<div class="modal" style="max-width: 640px; max-height: 90vh; overflow-y: auto;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
    <h3 style="margin: 0;">📲 New SMS Campaign</h3>
    <button onclick="document.getElementById('campaignModal')?.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">✕</button>
  </div>

  <label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px;">Campaign Name</label>
  <input id="campName" type="text" placeholder="e.g. Feb Re-engagement" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px; margin-bottom: 16px;" />

  <label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px;">Message Template</label>
  <div style="font-size: 11px; color: rgba(255,255,255,0.35); margin-bottom: 6px;">Use {name} to auto-insert contact's first name</div>
  <textarea id="campMessage" rows="4" placeholder="Hey {name}! It's Faren from New Urban Influence. Wanted to check in — we've got some fresh branding packages that might be perfect for your business this spring. Hit me back if you're interested!" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px; resize: vertical; margin-bottom: 16px;"></textarea>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
    <div>
      <label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px;">Per Day Limit</label>
      <input id="campDayLimit" type="number" value="20" min="1" max="100" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px;" />
    </div>
    <div>
      <label style="font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px;">Send Window (EST)</label>
      <div style="display: flex; gap: 6px; align-items: center;">
        <input id="campStartHr" type="number" value="9" min="6" max="20" style="width: 60px; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px;" />
        <span style="color: rgba(255,255,255,0.4);">to</span>
        <input id="campEndHr" type="number" value="18" min="7" max="21" style="width: 60px; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 14px;" />
      </div>
    </div>
  </div>

  <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-bottom: 16px;">
    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 10px;">Add Contacts</label>
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button class="btn-admin" onclick="campPickFromHub()" style="flex: 1;">👥 Pick from Contact Hub</button>
      <button class="btn-admin" onclick="document.getElementById('campCsvInput').click()" style="flex: 1;">📄 Import CSV</button>
      <input type="file" id="campCsvInput" accept=".csv" style="display: none;" onchange="campHandleCsv(this)" />
    </div>
    <div id="campContactList" style="max-height: 200px; overflow-y: auto;"></div>
    <div id="campContactCount" style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 6px;"></div>
  </div>

  <div style="display: flex; gap: 10px; justify-content: flex-end;">
    <button class="btn-admin" onclick="document.getElementById('campaignModal')?.remove()">Cancel</button>
    <button class="btn-admin primary" onclick="createCampaign()">Create Campaign</button>
  </div>
</div>`;
  document.body.appendChild(modal);
}

// ---- Contact Sources ----
function campPickFromHub() {
  // Show a sub-modal with checkboxes for each hub contact
  const contacts = window._contactHubData || [];
  if (!contacts.length) { alert('No contacts in Contact Hub. Add some first!'); return; }

  const picker = document.createElement('div');
  picker.className = 'modal-overlay active';
  picker.id = 'contactPickerModal';
  picker.innerHTML = `
<div class="modal" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
  <h3 style="margin: 0 0 12px 0;">Select Contacts</h3>
  <div style="margin-bottom: 12px; display: flex; gap: 8px;">
    <button class="btn-admin" onclick="campSelectAll(true)" style="font-size: 12px;">Select All</button>
    <button class="btn-admin" onclick="campSelectAll(false)" style="font-size: 12px;">Deselect All</button>
  </div>
  <div id="campPickerList" style="max-height: 50vh; overflow-y: auto;">
    ${contacts.filter(c => c.phone).map(c => `
    <label style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;"
           onmouseenter="this.style.background='rgba(255,255,255,0.04)'" onmouseleave="this.style.background='transparent'">
      <input type="checkbox" class="camp-contact-cb" value="${c.id}" data-name="${(c.name || c.first_name || 'Unknown').replace(/"/g, '')}" data-phone="${c.phone}" />
      <div>
        <div style="font-size: 14px;">${c.name || c.first_name || 'Unknown'}</div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.4);">${c.phone}${c.email ? ' · ' + c.email : ''}</div>
      </div>
    </label>`).join('')}
  </div>
  <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
    <button class="btn-admin" onclick="document.getElementById('contactPickerModal')?.remove()">Cancel</button>
    <button class="btn-admin primary" onclick="campAddSelected()">Add Selected</button>
  </div>
</div>`;
  document.body.appendChild(picker);
}

function campSelectAll(checked) {
  document.querySelectorAll('.camp-contact-cb').forEach(cb => cb.checked = checked);
}

function campAddSelected() {
  document.querySelectorAll('.camp-contact-cb:checked').forEach(cb => {
    const existing = _campaignDraftContacts.find(c => c.phone === cb.dataset.phone);
    if (!existing) {
      _campaignDraftContacts.push({
        id: cb.value,
        name: cb.dataset.name,
        phone: cb.dataset.phone
      });
    }
  });
  document.getElementById('contactPickerModal')?.remove();
  updateCampContactList();
}

function campHandleCsv(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').filter(l => l.trim());
    if (lines.length < 2) { alert('CSV needs a header row + data'); return; }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('cell'));
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('first'));
    if (phoneIdx === -1) { alert('CSV must have a "phone" column'); return; }

    let added = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      const phone = cols[phoneIdx]?.replace(/[^+\d]/g, '');
      if (!phone || phone.length < 10) continue;
      const formatted = phone.startsWith('+') ? phone : (phone.startsWith('1') ? '+' + phone : '+1' + phone);
      const name = nameIdx >= 0 ? cols[nameIdx] : 'Unknown';
      if (!_campaignDraftContacts.find(c => c.phone === formatted)) {
        _campaignDraftContacts.push({ id: null, name, phone: formatted });
        added++;
      }
    }
    alert(`Added ${added} contacts from CSV`);
    updateCampContactList();
  };
  reader.readAsText(file);
  input.value = '';
}

function updateCampContactList() {
  const list = document.getElementById('campContactList');
  const count = document.getElementById('campContactCount');
  if (!list) return;

  if (_campaignDraftContacts.length === 0) {
    list.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; text-align: center; padding: 16px;">No contacts added yet</div>';
    if (count) count.textContent = '';
    return;
  }

  list.innerHTML = _campaignDraftContacts.map((c, i) => `
<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px;">
  <span>${c.name} <span style="color: rgba(255,255,255,0.4);">${c.phone}</span></span>
  <button onclick="_campaignDraftContacts.splice(${i},1); updateCampContactList()" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 16px;">✕</button>
</div>`).join('');

  if (count) count.textContent = `${_campaignDraftContacts.length} contacts ready`;
}

// ---- Create Campaign + Schedule Queue ----
async function createCampaign() {
  const name = document.getElementById('campName')?.value?.trim();
  const message = document.getElementById('campMessage')?.value?.trim();
  const dayLimit = parseInt(document.getElementById('campDayLimit')?.value) || 20;
  const startHr = parseInt(document.getElementById('campStartHr')?.value) || 9;
  const endHr = parseInt(document.getElementById('campEndHr')?.value) || 18;

  if (!name) { alert('Give your campaign a name'); return; }
  if (!message) { alert('Write your message template'); return; }
  if (_campaignDraftContacts.length === 0) { alert('Add at least one contact'); return; }

  // Create the campaign
  const { data: campaign, error } = await db.from('sms_campaigns').insert({
    name,
    message_template: message,
    status: 'draft',
    contacts_total: _campaignDraftContacts.length,
    per_day_limit: dayLimit,
    send_start_hour: startHr,
    send_end_hour: endHr
  }).select().single();

  if (error || !campaign) { alert('Failed to create campaign: ' + (error?.message || 'Unknown error')); return; }

  // Build the queue with staggered times
  const queueItems = buildSchedule(_campaignDraftContacts, campaign.id, message, dayLimit, startHr, endHr);

  // Insert in batches of 50
  for (let i = 0; i < queueItems.length; i += 50) {
    const batch = queueItems.slice(i, i + 50);
    const { error: qErr } = await db.from('sms_drip_queue').insert(batch);
    if (qErr) console.error('Queue insert batch error:', qErr);
  }

  document.getElementById('campaignModal')?.remove();
  _activeCampaignId = campaign.id;
  await renderSmsCampaignsTab();
}

function buildSchedule(contacts, campaignId, template, perDay, startHr, endHr) {
  const items = [];
  const hoursPerDay = endHr - startHr;
  const minutesBetween = Math.floor((hoursPerDay * 60) / Math.min(perDay, contacts.length));
  const minGap = Math.max(minutesBetween, 15); // At least 15 min between sends

  // Start tomorrow at startHr EST
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Rough EST offset (UTC-5)
  const estOffset = 5;
  tomorrow.setUTCHours(startHr + estOffset, 0, 0, 0);

  let cursor = new Date(tomorrow);
  let sentToday = 0;

  for (const contact of contacts) {
    // Personalize message
    const firstName = (contact.name || 'there').split(' ')[0];
    const personalMsg = template.replace(/\{name\}/gi, firstName);

    items.push({
      campaign_id: campaignId,
      contact_id: contact.id || null,
      contact_name: contact.name || 'Unknown',
      contact_phone: contact.phone,
      message: personalMsg,
      scheduled_at: cursor.toISOString(),
      status: 'queued'
    });

    sentToday++;
    // Add random jitter (±5 min) for natural feel
    const jitter = Math.floor(Math.random() * 10) - 5;
    cursor = new Date(cursor.getTime() + (minGap + jitter) * 60 * 1000);

    // If we hit daily limit or past end hour, roll to next day
    const cursorEstHr = (cursor.getUTCHours() - estOffset + 24) % 24;
    if (sentToday >= perDay || cursorEstHr >= endHr) {
      sentToday = 0;
      cursor.setDate(cursor.getDate() + 1);
      cursor.setUTCHours(startHr + estOffset, 0, 0, 0);
      // Skip weekends
      const dow = cursor.getDay();
      if (dow === 0) cursor.setDate(cursor.getDate() + 1); // Sun → Mon
      if (dow === 6) cursor.setDate(cursor.getDate() + 2); // Sat → Mon
    }
  }
  return items;
}

// ---- Campaign Actions ----
async function launchCampaign(id) {
  if (!confirm('Launch this campaign? SMS messages will start sending during business hours.')) return;
  await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
  await renderSmsCampaignsTab();
}

async function pauseCampaign(id) {
  await db.from('sms_campaigns').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', id);
  await renderSmsCampaignsTab();
}

async function resumeCampaign(id) {
  await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
  await renderSmsCampaignsTab();
}

async function deleteCampaign(id) {
  if (!confirm('Delete this campaign and all queued messages? This cannot be undone.')) return;
  // Queue items cascade-deleted via FK
  await db.from('sms_campaigns').delete().eq('id', id);
  _activeCampaignId = null;
  await renderSmsCampaignsTab();
}

// ---- Expose globally ----
window.renderSmsCampaignsTab = renderSmsCampaignsTab;
window.showCreateCampaignModal = showCreateCampaignModal;
window.campPickFromHub = campPickFromHub;
window.campSelectAll = campSelectAll;
window.campAddSelected = campAddSelected;
window.campHandleCsv = campHandleCsv;
window.launchCampaign = launchCampaign;
window.pauseCampaign = pauseCampaign;
window.resumeCampaign = resumeCampaign;
window.deleteCampaign = deleteCampaign;

function renderCampaignCard(c) {
  const pct = c.contacts_total > 0 ? Math.round((c.contacts_sent / c.contacts_total) * 100) : 0;
  const statusColors = { active: '#2ecc71', draft: '#f59e0b', paused: '#e74c3c', complete: 'rgba(255,255,255,0.4)' };
  const color = statusColors[c.status] || '#888';

  return `
<div onclick="_activeCampaignId='${c.id}'; renderSmsCampaignsTab();" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.2s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-weight: 600; font-size: 15px;">${c.name}</div>
      <div style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 4px;">${c.contacts_total} contacts · ${c.per_day_limit || 20}/day limit</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 22px; font-weight: 700; color: ${color};">${pct}%</div>
      <div style="font-size: 11px; color: rgba(255,255,255,0.4);">${c.contacts_sent}/${c.contacts_total} sent</div>
    </div>
  </div>
  <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 6px; overflow: hidden;">
    <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.3s;"></div>
  </div>
  <div style="margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.3); display: flex; gap: 12px;">
    <span>📝 "${(c.message_template || '').substring(0, 50)}${(c.message_template || '').length > 50 ? '...' : ''}"</span>
  </div>
</div>`;
}

// ---- Campaign Detail View ----
async function renderCampaignDetail(container) {
  const c = _campaigns.find(x => x.id === _activeCampaignId);
  if (!c) { _activeCampaignId = null; renderSmsCampaignsTab(); return; }
  await fetchCampaignQueue(c.id);

  const sent = _campaignQueue.filter(q => q.status === 'sent');
  const queued = _campaignQueue.filter(q => q.status === 'queued');
  const failed = _campaignQueue.filter(q => q.status === 'failed');

  container.innerHTML = `
<div style="margin-bottom: 20px;">
  <button class="btn-admin" onclick="_activeCampaignId=null; renderSmsCampaignsTab();" style="margin-bottom: 12px;">← Back to Campaigns</button>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0;">${c.name}</h3>
    <div style="display: flex; gap: 8px;">
      ${c.status === 'draft' ? `<button class="btn-admin primary" onclick="launchCampaign('${c.id}')">🚀 Launch</button>` : ''}
      ${c.status === 'active' ? `<button class="btn-admin" style="background: #e74c3c;" onclick="pauseCampaign('${c.id}')">⏸ Pause</button>` : ''}
      ${c.status === 'paused' ? `<button class="btn-admin primary" onclick="resumeCampaign('${c.id}')">▶ Resume</button>` : ''}
      <button class="btn-admin" style="background: rgba(255,0,0,0.2); color: #e74c3c;" onclick="deleteCampaign('${c.id}')">🗑</button>
    </div>
  </div>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
  <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px;">
    <div style="font-size: 28px; font-weight: 700;">${_campaignQueue.length}</div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.4);">TOTAL</div>
  </div>
  <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px;">
    <div style="font-size: 28px; font-weight: 700; color: #2ecc71;">${sent.length}</div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.4);">SENT</div>
  </div>
  <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px;">
    <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${queued.length}</div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.4);">QUEUED</div>
  </div>
  <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px;">
    <div style="font-size: 28px; font-weight: 700; color: #e74c3c;">${failed.length}</div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.4);">FAILED</div>
  </div>
</div>

<div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
  <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 6px;">MESSAGE TEMPLATE</div>
  <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${c.message_template}</div>
  <div style="margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.3);">Sending ${c.per_day_limit || 20}/day · ${c.send_start_hour || 9}am–${c.send_end_hour || 18 > 12 ? (c.send_end_hour || 18) - 12 : c.send_end_hour || 18}pm EST</div>
</div>

<div style="font-size: 13px; font-weight: 600; margin-bottom: 10px;">Queue (${_campaignQueue.length})</div>
<div style="max-height: 400px; overflow-y: auto;">
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    <thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; font-size: 11px; color: rgba(255,255,255,0.4);">
      <th style="text-align: left; padding: 8px;">Contact</th>
      <th style="text-align: left; padding: 8px;">Phone</th>
      <th style="text-align: left; padding: 8px;">Scheduled</th>
      <th style="text-align: left; padding: 8px;">Status</th>
    </tr></thead>
    <tbody>
      ${_campaignQueue.map(q => {
        const statusBadge = {
          queued: '<span style="color: #f59e0b;">⏳ Queued</span>',
          sent: '<span style="color: #2ecc71;">✓ Sent</span>',
          failed: '<span style="color: #e74c3c;">✗ Failed</span>',
          skipped: '<span style="color: rgba(255,255,255,0.3);">⊘ Skipped</span>'
        };
        const schedDate = new Date(q.scheduled_at);
        const timeStr = schedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + schedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px;">${q.contact_name || 'Unknown'}</td>
          <td style="padding: 8px; color: rgba(255,255,255,0.5);">${q.contact_phone}</td>
          <td style="padding: 8px; color: rgba(255,255,255,0.5);">${timeStr}</td>
          <td style="padding: 8px;">${statusBadge[q.status] || q.status}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>
  `;
}

// ---- Create Campaign Modal ----
function showCreateCampaignModal() {
  // Get contacts from Contact Hub's data
  const contacts = (window._contactHubContacts || []).filter(c => c.phone);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'createCampaignModal';
  modal.innerHTML = `
<div class="modal" style="max-width: 640px; max-height: 90vh; overflow-y: auto;">
  <div class="modal-header">
    <h3>📲 New SMS Campaign</h3>
    <button class="modal-close" onclick="document.getElementById('createCampaignModal').remove()">✕</button>
  </div>
  <div class="modal-body" style="padding: 20px;">
    <div style="margin-bottom: 16px;">
      <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Campaign Name</label>
      <input id="campName" type="text" placeholder="e.g. Old Client Reactivation" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 14px;">
    </div>

    <div style="margin-bottom: 16px;">
      <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Message Template</label>
      <textarea id="campMessage" rows="4" placeholder="Hey {name}, it's Faren from NUI — been a minute! Got some new print packages that might work for you. Want me to send over details?" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 14px; resize: vertical;"></textarea>
      <div style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px;">Use {name} for contact's first name</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div>
        <label style="font-size: 12px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Per Day</label>
        <input id="campPerDay" type="number" value="20" min="1" max="50" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
      </div>
      <div>
        <label style="font-size: 12px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">Start Hour</label>
        <select id="campStartHour" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          ${[8,9,10,11,12].map(h => `<option value="${h}" ${h===9?'selected':''}>${h > 12 ? h-12 : h}${h >= 12 ? 'pm' : 'am'}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size: 12px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px;">End Hour</label>
        <select id="campEndHour" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff;">
          ${[15,16,17,18,19,20].map(h => `<option value="${h}" ${h===18?'selected':''}>${h > 12 ? h-12 : h}pm</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Select Contacts</label>
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button class="btn-admin" onclick="campSelectAll()" style="font-size: 12px;">Select All</button>
        <button class="btn-admin" onclick="campSelectNone()" style="font-size: 12px;">Select None</button>
        <button class="btn-admin" onclick="campSelectByStatus('new_lead')" style="font-size: 12px;">🔥 New Leads</button>
        <button class="btn-admin" onclick="campSelectByStatus('contacted')" style="font-size: 12px;">📞 Contacted</button>
        <button class="btn-admin" onclick="campSelectByStatus('client')" style="font-size: 12px;">⭐ Clients</button>
      </div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 8px;">Or <a href="#" onclick="event.preventDefault(); showCsvImportForCampaign();" style="color: #3b82f6;">import CSV</a> of contacts</div>
      <div id="campContactList" style="max-height: 250px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
        ${contacts.length === 0 ? '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.3);">No contacts with phone numbers</div>' :
          contacts.map(c => `
          <label style="display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; gap: 10px;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='none'">
            <input type="checkbox" class="campContactCheck" value="${c.id}" data-phone="${c.phone}" data-name="${c.name || c.phone}" style="accent-color: #2ecc71;">
            <span style="flex: 1;">${c.name || 'Unknown'}</span>
            <span style="color: rgba(255,255,255,0.3); font-size: 12px;">${c.phone}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.06);">${c.status || '—'}</span>
          </label>`).join('')}
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.4);" id="campSelectedCount">0 selected</div>
    </div>
  </div>
  <div class="modal-footer" style="padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 8px;">
    <button class="btn-admin" onclick="document.getElementById('createCampaignModal').remove()">Cancel</button>
    <button class="btn-admin primary" onclick="createCampaignFromModal()">Create Campaign</button>
  </div>
</div>`;
  document.body.appendChild(modal);

  // Checkbox counter
  modal.addEventListener('change', () => {
    const checked = modal.querySelectorAll('.campContactCheck:checked').length;
    const el = document.getElementById('campSelectedCount');
    if (el) el.textContent = checked + ' selected';
  });
}

// ---- Contact Selection Helpers ----
function campSelectAll() {
  document.querySelectorAll('.campContactCheck').forEach(cb => cb.checked = true);
  const el = document.getElementById('campSelectedCount');
  if (el) el.textContent = document.querySelectorAll('.campContactCheck:checked').length + ' selected';
}
function campSelectNone() {
  document.querySelectorAll('.campContactCheck').forEach(cb => cb.checked = false);
  const el = document.getElementById('campSelectedCount');
  if (el) el.textContent = '0 selected';
}
function campSelectByStatus(status) {
  const contacts = window._contactHubContacts || [];
  document.querySelectorAll('.campContactCheck').forEach(cb => {
    const c = contacts.find(x => x.id === cb.value);
    cb.checked = c && c.status === status;
  });
  const el = document.getElementById('campSelectedCount');
  if (el) el.textContent = document.querySelectorAll('.campContactCheck:checked').length + ' selected';
}

// ---- CSV Import for Campaigns ----
function showCsvImportForCampaign() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));

    const phoneCol = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('cell'));
    const nameCol = headers.findIndex(h => h.includes('name') || h.includes('first'));
    if (phoneCol === -1) { alert('CSV must have a phone/mobile column'); return; }

    let added = 0;
    const listEl = document.getElementById('campContactList');
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      let phone = cols[phoneCol];
      if (!phone) continue;
      phone = phone.replace(/[^\d+]/g, '');
      if (phone.length === 10) phone = '+1' + phone;
      if (phone.length === 11 && !phone.startsWith('+')) phone = '+' + phone;
      const name = nameCol >= 0 ? cols[nameCol] : '';

      // Add to contact list UI
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;gap:10px;';
      label.innerHTML = `
        <input type="checkbox" class="campContactCheck" value="csv-${i}" data-phone="${phone}" data-name="${name || phone}" checked style="accent-color:#2ecc71;">
        <span style="flex:1;">${name || 'CSV Import'}</span>
        <span style="color:rgba(255,255,255,0.3);font-size:12px;">${phone}</span>
        <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(59,130,246,0.15);color:#3b82f6;">csv</span>`;
      listEl.appendChild(label);
      added++;
    }
    alert(`✅ Added ${added} contacts from CSV`);
    const el = document.getElementById('campSelectedCount');
    if (el) el.textContent = document.querySelectorAll('.campContactCheck:checked').length + ' selected';
  };
  input.click();
}

// ---- Create Campaign ----
async function createCampaignFromModal() {
  const name = document.getElementById('campName')?.value?.trim();
  const template = document.getElementById('campMessage')?.value?.trim();
  const perDay = parseInt(document.getElementById('campPerDay')?.value) || 20;
  const startHour = parseInt(document.getElementById('campStartHour')?.value) || 9;
  const endHour = parseInt(document.getElementById('campEndHour')?.value) || 18;

  if (!name) { alert('Campaign name required'); return; }
  if (!template) { alert('Message template required'); return; }

  const checked = document.querySelectorAll('.campContactCheck:checked');
  if (checked.length === 0) { alert('Select at least one contact'); return; }

  // Collect contacts
  const selectedContacts = Array.from(checked).map(cb => ({
    id: cb.value.startsWith('csv-') ? null : cb.value,
    phone: cb.dataset.phone,
    name: cb.dataset.name
  }));

  try {
    // Create campaign
    const { data: campaign, error } = await db.from('sms_campaigns').insert({
      name,
      message_template: template,
      status: 'draft',
      contacts_total: selectedContacts.length,
      per_day_limit: perDay,
      send_start_hour: startHour,
      send_end_hour: endHour
    }).select().single();

    if (error) throw error;

    // Schedule queue entries with staggered times
    const queueItems = buildSchedule(selectedContacts, template, campaign.id, perDay, startHour, endHour);

    // Insert in batches of 50
    for (let i = 0; i < queueItems.length; i += 50) {
      const batch = queueItems.slice(i, i + 50);
      const { error: qErr } = await db.from('sms_drip_queue').insert(batch);
      if (qErr) console.error('Queue insert error:', qErr);
    }

    document.getElementById('createCampaignModal')?.remove();
    _activeCampaignId = campaign.id;
    await renderSmsCampaignsTab();
    alert(`✅ Campaign "${name}" created with ${selectedContacts.length} contacts queued!`);

  } catch (err) {
    alert('❌ Failed to create campaign: ' + err.message);
    console.error(err);
  }
}

// ---- Schedule Builder ----
// Distributes contacts across days with random times during business hours
function buildSchedule(contacts, template, campaignId, perDay, startHour, endHour) {
  const items = [];
  const today = new Date();
  // Start tomorrow
  let currentDay = new Date(today);
  currentDay.setDate(currentDay.getDate() + 1);
  currentDay.setHours(startHour, 0, 0, 0);

  let dayCount = 0;

  for (let i = 0; i < contacts.length; i++) {
    if (dayCount >= perDay) {
      dayCount = 0;
      currentDay.setDate(currentDay.getDate() + 1);
      // Skip weekends
      while (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    // Random time within business hours
    const hoursRange = endHour - startHour;
    const randomMinutes = Math.floor(Math.random() * hoursRange * 60);
    const scheduledAt = new Date(currentDay);
    scheduledAt.setHours(startHour, randomMinutes, 0, 0);

    // Personalize message
    const firstName = (contacts[i].name || '').split(' ')[0] || 'there';
    const message = template.replace(/\{name\}/gi, firstName);

    items.push({
      campaign_id: campaignId,
      contact_id: contacts[i].id,
      contact_name: contacts[i].name,
      contact_phone: contacts[i].phone,
      message,
      scheduled_at: scheduledAt.toISOString(),
      status: 'queued'
    });

    dayCount++;
  }

  return items;
}

// ---- Campaign Actions ----
async function launchCampaign(id) {
  if (!confirm('Launch this campaign? Messages will start sending during business hours.')) return;
  try {
    await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
    await renderSmsCampaignsTab();
  } catch (err) { alert('Failed: ' + err.message); }
}

async function pauseCampaign(id) {
  try {
    await db.from('sms_campaigns').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', id);
    // Mark remaining queued items as skipped
    await db.from('sms_drip_queue').update({ status: 'skipped' }).eq('campaign_id', id).eq('status', 'queued');
    await renderSmsCampaignsTab();
  } catch (err) { alert('Failed: ' + err.message); }
}

async function resumeCampaign(id) {
  try {
    // Re-queue skipped items with new schedule starting tomorrow
    const { data: skipped } = await db.from('sms_drip_queue').select('*').eq('campaign_id', id).eq('status', 'skipped');
    const { data: campaign } = await db.from('sms_campaigns').select('*').eq('id', id).single();

    if (skipped && skipped.length > 0) {
      const perDay = campaign?.per_day_limit || 20;
      const startHour = campaign?.send_start_hour || 9;
      const endHour = campaign?.send_end_hour || 18;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      let dayCount = 0;
      let currentDay = new Date(tomorrow);

      for (const item of skipped) {
        if (dayCount >= perDay) {
          dayCount = 0;
          currentDay.setDate(currentDay.getDate() + 1);
          while (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
            currentDay.setDate(currentDay.getDate() + 1);
          }
        }
        const hoursRange = endHour - startHour;
        const randomMinutes = Math.floor(Math.random() * hoursRange * 60);
        const scheduledAt = new Date(currentDay);
        scheduledAt.setHours(startHour, randomMinutes, 0, 0);

        await db.from('sms_drip_queue').update({
          status: 'queued',
          scheduled_at: scheduledAt.toISOString()
        }).eq('id', item.id);
        dayCount++;
      }
    }

    await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
    await renderSmsCampaignsTab();
  } catch (err) { alert('Failed: ' + err.message); }
}

async function deleteCampaign(id) {
  if (!confirm('Delete this campaign and all queued messages? This cannot be undone.')) return;
  try {
    await db.from('sms_campaigns').delete().eq('id', id);
    _activeCampaignId = null;
    await renderSmsCampaignsTab();
  } catch (err) { alert('Failed: ' + err.message); }
}

// Expose contacts for campaign picker
window._contactHubContacts = window._contactHubContacts || [];
