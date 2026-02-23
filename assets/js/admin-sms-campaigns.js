// ==================== SMS DRIP CAMPAIGNS ====================
// Campaign creation, draft review, queue management, compliance
// Lives as a tab inside Contact Hub
// Depends on: admin-sms-voice.js (voice pools + assembly engine)

let _campaigns = [];
let _campaignQueue = [];
let _campaignReplies = [];
let _activeCampaignId = null;
let _draftReviewData = null; // holds drafts during review flow

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

async function fetchCampaignReplies(campaignId) {
  if (!db) return;
  const { data } = await db.from('sms_replies').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false });
  _campaignReplies = data || [];
}

// ---- Main Campaign List ----
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
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
  <div>
    <h3 style="margin:0;font-size:18px;">📲 SMS Campaigns</h3>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:4px;">Manual-first outreach · Draft → Review → Approve → Send</p>
  </div>
  <button class="btn-admin primary" onclick="showCreateCampaignModal()">+ New Campaign</button>
</div>

${active.length > 0 ? `
<div style="margin-bottom:20px;">
  <div style="font-size:12px;font-weight:600;color:#2ecc71;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">▶ Active</div>
  ${active.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${draft.length > 0 ? `
<div style="margin-bottom:20px;">
  <div style="font-size:12px;font-weight:600;color:#f59e0b;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">📝 Drafts</div>
  ${draft.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${done.length > 0 ? `
<div style="margin-bottom:20px;">
  <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">✓ Done / Paused</div>
  ${done.map(c => renderCampaignCard(c)).join('')}
</div>` : ''}

${_campaigns.length === 0 ? `
<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.4);">
  <div style="font-size:40px;margin-bottom:12px;">📲</div>
  <p>No campaigns yet. Create one to start reaching old clients.</p>
</div>` : ''}
  `;
}

function renderCampaignCard(c) {
  const pct = c.contacts_total > 0 ? Math.round((c.contacts_sent / c.contacts_total) * 100) : 0;
  const colors = { active: '#2ecc71', draft: '#f59e0b', paused: '#e74c3c', complete: 'rgba(255,255,255,0.4)' };
  const color = colors[c.status] || '#888';
  const typeLabel = c.campaign_type === 'cold_outreach' ? '🎯 Cold' : '🔄 Reactivation';

  return `
<div onclick="_activeCampaignId='${c.id}';renderSmsCampaignsTab();" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-weight:600;font-size:15px;">${c.name}</span>
        <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.06);">${typeLabel}</span>
      </div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">${c.contacts_total} contacts · ${c.per_day_limit || 20}/day</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:700;color:${color};">${pct}%</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);">${c.contacts_sent || 0}/${c.contacts_total} sent</div>
    </div>
  </div>
  <div style="margin-top:10px;background:rgba(255,255,255,0.06);border-radius:4px;height:6px;overflow:hidden;">
    <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;"></div>
  </div>
  ${c.auto_paused ? '<div style="margin-top:8px;font-size:12px;color:#e74c3c;">⚠️ Auto-paused: ' + (c.auto_pause_reason || 'compliance') + '</div>' : ''}
</div>`;
}

// ---- Campaign Detail View ----
async function renderCampaignDetail(container) {
  const c = _campaigns.find(x => x.id === _activeCampaignId);
  if (!c) { _activeCampaignId = null; renderSmsCampaignsTab(); return; }
  await fetchCampaignQueue(c.id);
  await fetchCampaignReplies(c.id);

  const sent = _campaignQueue.filter(q => q.status === 'sent');
  const drafts = _campaignQueue.filter(q => q.review_status === 'draft');
  const approved = _campaignQueue.filter(q => q.review_status === 'approved' || q.status === 'queued');
  const failed = _campaignQueue.filter(q => q.status === 'failed');
  const optouts = _campaignReplies.filter(r => r.is_optout);
  const positiveReplies = _campaignReplies.filter(r => r.is_positive);

  const optoutRate = sent.length > 0 ? ((optouts.length / sent.length) * 100).toFixed(1) : '0.0';
  const replyRate = sent.length > 0 ? ((_campaignReplies.length / sent.length) * 100).toFixed(1) : '0.0';
  const threshold = c.campaign_type === 'cold_outreach' ? 3 : 5;
  const typeLabel = c.campaign_type === 'cold_outreach' ? '🎯 Cold Outreach' : '🔄 Old Client Reactivation';

  container.innerHTML = `
<div style="margin-bottom:20px;">
  <button class="btn-admin" onclick="_activeCampaignId=null;renderSmsCampaignsTab();" style="margin-bottom:12px;">← Back</button>
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;">
        <h3 style="margin:0;">${c.name}</h3>
        <span style="font-size:12px;padding:3px 10px;border-radius:10px;background:rgba(255,255,255,0.06);">${typeLabel}</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      ${c.status === 'draft' ? `<button class="btn-admin primary" onclick="launchCampaign('${c.id}')">🚀 Launch</button>` : ''}
      ${c.status === 'active' ? `<button class="btn-admin" style="background:#e74c3c;" onclick="pauseCampaign('${c.id}')">⏸ Pause</button>` : ''}
      ${c.status === 'paused' ? `<button class="btn-admin primary" onclick="resumeCampaign('${c.id}')">▶ Resume</button>` : ''}
      <button class="btn-admin" style="background:rgba(255,0,0,0.2);color:#e74c3c;" onclick="deleteCampaign('${c.id}')">🗑</button>
    </div>
  </div>
</div>

<!-- Stats Grid -->
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:20px;">
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;">${_campaignQueue.length}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">TOTAL</div>
  </div>
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;color:#2ecc71;">${sent.length}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">SENT</div>
  </div>
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;color:#f59e0b;">${drafts.length}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">DRAFTS</div>
  </div>
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;color:#3b82f6;">${_campaignReplies.length}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">REPLIES</div>
  </div>
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;color:#e74c3c;">${failed.length}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">FAILED</div>
  </div>
  <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">
    <div style="font-size:24px;font-weight:700;color:${parseFloat(optoutRate) > threshold ? '#e74c3c' : '#2ecc71'};">${optoutRate}%</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">OPT-OUT</div>
  </div>
</div>

<!-- Compliance Warning -->
${parseFloat(optoutRate) > threshold ? `
<div style="background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#e74c3c;">
  ⚠️ Opt-out rate (${optoutRate}%) exceeds ${threshold}% threshold for ${c.campaign_type === 'cold_outreach' ? 'cold outreach' : 'reactivation'}. Campaign should be paused.
</div>` : ''}
${parseFloat(replyRate) < 5 && sent.length > 10 ? `
<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:#f59e0b;">
  📊 Low reply rate (${replyRate}%). Consider revising message or targeting.
</div>` : ''}

<!-- Drafts Pending Review -->
${drafts.length > 0 ? `
<div style="margin-bottom:20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <div style="font-size:14px;font-weight:600;">📝 Drafts Pending Review (${drafts.length})</div>
    <button class="btn-admin primary" onclick="approveAllDrafts('${c.id}')" style="font-size:12px;">✓ Approve All</button>
  </div>
  <div style="max-height:300px;overflow-y:auto;border:1px solid rgba(255,255,255,0.08);border-radius:8px;">
    ${drafts.map(d => `
    <div style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:flex-start;gap:10px;">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;">${d.contact_name || 'Unknown'} <span style="color:rgba(255,255,255,0.3);font-weight:400;">${d.contact_phone}</span></div>
        <div id="draft-msg-${d.id}" contenteditable="true" style="margin-top:6px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.03);padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);max-width:500px;" onblur="saveDraftEdit('${d.id}',this.textContent)">${d.message}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;">${d.message.length}/300 chars</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        <button class="btn-admin" onclick="approveDraft('${d.id}')" style="font-size:11px;background:rgba(46,204,113,0.15);color:#2ecc71;">✓</button>
        <button class="btn-admin" onclick="skipDraft('${d.id}')" style="font-size:11px;background:rgba(255,0,0,0.1);color:#e74c3c;">✗</button>
      </div>
    </div>`).join('')}
  </div>
</div>` : ''}

<!-- Queue Table -->
<div style="font-size:14px;font-weight:600;margin-bottom:10px;">Queue (${_campaignQueue.length})</div>
<div style="max-height:400px;overflow-y:auto;">
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);font-size:11px;text-transform:uppercase;color:rgba(255,255,255,0.4);">
      <th style="text-align:left;padding:8px;">Contact</th>
      <th style="text-align:left;padding:8px;">Phone</th>
      <th style="text-align:left;padding:8px;">Scheduled</th>
      <th style="text-align:left;padding:8px;">Status</th>
      <th style="text-align:left;padding:8px;">Tier</th>
    </tr></thead>
    <tbody>
      ${_campaignQueue.map(q => {
        const badge = { queued:'<span style="color:#f59e0b;">⏳ Queued</span>', sent:'<span style="color:#2ecc71;">✓ Sent</span>', failed:'<span style="color:#e74c3c;">✗ Failed</span>', skipped:'<span style="color:rgba(255,255,255,0.3);">⊘ Skipped</span>' };
        const dt = new Date(q.scheduled_at);
        const ts = dt.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' ' + dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:8px;">${q.contact_name || 'Unknown'}</td>
          <td style="padding:8px;color:rgba(255,255,255,0.5);">${q.contact_phone}</td>
          <td style="padding:8px;color:rgba(255,255,255,0.5);">${ts}</td>
          <td style="padding:8px;">${badge[q.status] || q.status}</td>
          <td style="padding:8px;"><span style="font-size:11px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.06);">Msg ${q.message_tier || 1}</span></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>

<!-- Replies Section -->
${_campaignReplies.length > 0 ? `
<div style="margin-top:20px;">
  <div style="font-size:14px;font-weight:600;margin-bottom:10px;">💬 Replies (${_campaignReplies.length})</div>
  <div style="max-height:300px;overflow-y:auto;">
    ${_campaignReplies.map(r => `
    <div style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:13px;">${r.contact_phone}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">"${r.reply_text}"</div>
      </div>
      <div>
        ${r.is_optout ? '<span style="color:#e74c3c;font-size:12px;font-weight:600;">OPT-OUT</span>' : r.is_positive ? '<span style="color:#2ecc71;font-size:12px;font-weight:600;">POSITIVE</span>' : '<span style="font-size:12px;color:rgba(255,255,255,0.3);">—</span>'}
      </div>
    </div>`).join('')}
  </div>
</div>` : ''}
  `;
}

// ---- Create Campaign Modal ----
function showCreateCampaignModal() {
  const contacts = (window._contactHubContacts || []).filter(c => c.phone);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'createCampaignModal';
  modal.innerHTML = `
<div class="modal" style="max-width:640px;max-height:90vh;overflow-y:auto;">
  <div class="modal-header">
    <h3>📲 New SMS Campaign</h3>
    <button class="modal-close" onclick="document.getElementById('createCampaignModal').remove()">✕</button>
  </div>
  <div class="modal-body" style="padding:20px;">

    <div style="margin-bottom:16px;">
      <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Campaign Name</label>
      <input id="campName" type="text" placeholder="e.g. Bravo Legacy Reconnect" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:14px;">
    </div>

    <div style="margin-bottom:16px;">
      <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Campaign Type</label>
      <div style="display:flex;gap:10px;">
        <label style="flex:1;padding:14px;background:rgba(255,255,255,0.04);border:2px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;text-align:center;" id="campTypeReact" onclick="selectCampType('reactivation')">
          <input type="radio" name="campType" value="reactivation" checked style="display:none;">
          <div style="font-size:20px;margin-bottom:4px;">🔄</div>
          <div style="font-size:13px;font-weight:600;">Old Client Reactivation</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Bravo Graphix reconnect · 20/day</div>
        </label>
        <label style="flex:1;padding:14px;background:rgba(255,255,255,0.04);border:2px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;text-align:center;" id="campTypeCold" onclick="selectCampType('cold_outreach')">
          <input type="radio" name="campType" value="cold_outreach" style="display:none;">
          <div style="font-size:20px;margin-bottom:4px;">🎯</div>
          <div style="font-size:13px;font-weight:600;">Cold Outreach</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">New prospects · 10/day · requires observation</div>
        </label>
      </div>
    </div>

    <div id="campMessageSection" style="margin-bottom:16px;">
      <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Message Preview</label>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;" id="campMsgPreview">
        Messages will be auto-generated using Faren's voice. Each contact gets a unique variation — no two messages identical.
      </div>
      <button class="btn-admin" onclick="previewSampleMessage()" style="margin-top:8px;font-size:12px;">🎲 Preview Sample Message</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
      <div>
        <label style="font-size:12px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px;">Per Day</label>
        <input id="campPerDay" type="number" value="20" min="1" max="50" style="width:100%;padding:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
      </div>
      <div>
        <label style="font-size:12px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px;">Start Hour</label>
        <select id="campStartHour" style="width:100%;padding:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
          ${[8,9,10,11,12].map(h => `<option value="${h}" ${h===9?'selected':''}>${h}am</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:12px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px;">End Hour</label>
        <select id="campEndHour" style="width:100%;padding:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;">
          ${[15,16,17,18,19,20].map(h => `<option value="${h}" ${h===18?'selected':''}>${h > 12 ? h-12 : h}pm</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Add Contacts</label>
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <button class="btn-admin" onclick="campPickFromHub()" style="font-size:12px;">📡 From Contact Hub</button>
        <button class="btn-admin" onclick="campImportCsv()" style="font-size:12px;">📄 Import CSV</button>
      </div>
      <div id="campContactList" style="max-height:250px;overflow-y:auto;border:1px solid rgba(255,255,255,0.08);border-radius:8px;">
        <div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">No contacts added yet</div>
      </div>
      <div style="margin-top:6px;font-size:12px;color:rgba(255,255,255,0.4);" id="campSelectedCount">0 contacts</div>
    </div>

  </div>
  <div class="modal-footer" style="padding:16px 20px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:flex-end;gap:8px;">
    <button class="btn-admin" onclick="document.getElementById('createCampaignModal').remove()">Cancel</button>
    <button class="btn-admin primary" onclick="createCampaignWithDrafts()">Generate Drafts →</button>
  </div>
</div>`;
  document.body.appendChild(modal);
  // Default selection
  selectCampType('reactivation');
}

let _selectedCampType = 'reactivation';
let _campContacts = [];

function selectCampType(type) {
  _selectedCampType = type;
  const react = document.getElementById('campTypeReact');
  const cold = document.getElementById('campTypeCold');
  if (react) react.style.borderColor = type === 'reactivation' ? '#2ecc71' : 'rgba(255,255,255,0.1)';
  if (cold) cold.style.borderColor = type === 'cold_outreach' ? '#3b82f6' : 'rgba(255,255,255,0.1)';
  // Update per-day default
  const pd = document.getElementById('campPerDay');
  if (pd) pd.value = type === 'cold_outreach' ? 10 : 20;
}

function previewSampleMessage() {
  const msg = assembleMessage(_selectedCampType, {
    first_name: 'Marcus',
    business_name: 'Urban Cuts',
    short_observation: 'Your Instagram branding looks strong but inconsistent.'
  }, 1);
  const el = document.getElementById('campMsgPreview');
  if (el) {
    el.textContent = msg;
    el.style.color = '#fff';
  }
}

// ---- Contact Picker: From Hub ----
function campPickFromHub() {
  const contacts = (window._contactHubContacts || []).filter(c => c.phone);
  if (contacts.length === 0) { alert('No contacts with phone numbers in Contact Hub'); return; }

  const picker = document.createElement('div');
  picker.className = 'modal-overlay active';
  picker.id = 'hubPickerModal';
  picker.innerHTML = `
<div class="modal" style="max-width:500px;max-height:80vh;overflow-y:auto;">
  <div class="modal-header"><h3>Pick Contacts</h3><button class="modal-close" onclick="document.getElementById('hubPickerModal').remove()">✕</button></div>
  <div style="padding:12px;display:flex;gap:6px;border-bottom:1px solid rgba(255,255,255,0.08);">
    <button class="btn-admin" onclick="document.querySelectorAll('.hubPick').forEach(c=>c.checked=true)" style="font-size:11px;">All</button>
    <button class="btn-admin" onclick="document.querySelectorAll('.hubPick').forEach(c=>c.checked=false)" style="font-size:11px;">None</button>
    <button class="btn-admin" onclick="hubPickByStatus('new_lead')" style="font-size:11px;">🔥 New</button>
    <button class="btn-admin" onclick="hubPickByStatus('contacted')" style="font-size:11px;">📞 Contacted</button>
    <button class="btn-admin" onclick="hubPickByStatus('client')" style="font-size:11px;">⭐ Clients</button>
  </div>
  <div style="max-height:400px;overflow-y:auto;">
    ${contacts.map(c => `
    <label style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;gap:10px;">
      <input type="checkbox" class="hubPick" value="${c.id}" data-phone="${c.phone}" data-name="${c.name}" data-status="${c.status || ''}" style="accent-color:#2ecc71;">
      <span style="flex:1;">${c.name || 'Unknown'}</span>
      <span style="color:rgba(255,255,255,0.3);font-size:12px;">${c.phone}</span>
    </label>`).join('')}
  </div>
  <div style="padding:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:flex-end;">
    <button class="btn-admin primary" onclick="addHubPicksTocamp()">Add Selected</button>
  </div>
</div>`;
  document.body.appendChild(picker);
}

function hubPickByStatus(status) {
  const contacts = window._contactHubContacts || [];
  document.querySelectorAll('.hubPick').forEach(cb => {
    const c = contacts.find(x => x.id === cb.value);
    cb.checked = c && c.status === status;
  });
}

function addHubPicksTocamp() {
  document.querySelectorAll('.hubPick:checked').forEach(cb => {
    if (!_campContacts.find(c => c.phone === cb.dataset.phone)) {
      _campContacts.push({ id: cb.value, phone: cb.dataset.phone, name: cb.dataset.name, source: 'hub' });
    }
  });
  document.getElementById('hubPickerModal')?.remove();
  updateCampContactList();
}

// ---- Contact Picker: CSV Import ----
function campImportCsv() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));

    const phoneCol = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
    const nameCol = headers.findIndex(h => h.includes('first') || h === 'name');
    const bizCol = headers.findIndex(h => h.includes('business') || h.includes('company'));
    const obsCol = headers.findIndex(h => h.includes('observation') || h.includes('note'));

    if (phoneCol === -1) { alert('CSV must have a phone/mobile column'); return; }

    let added = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      let phone = cols[phoneCol];
      if (!phone) continue;
      phone = phone.replace(/[^\d+]/g, '');
      if (phone.length === 10) phone = '+1' + phone;
      if (phone.length === 11 && !phone.startsWith('+')) phone = '+' + phone;

      const name = nameCol >= 0 ? cols[nameCol] : '';
      const biz = bizCol >= 0 ? cols[bizCol] : '';
      const obs = obsCol >= 0 ? cols[obsCol] : '';

      if (!_campContacts.find(c => c.phone === phone)) {
        _campContacts.push({ id: null, phone, name: name || phone, business_name: biz, short_observation: obs, source: 'csv' });
        added++;
      }
    }
    alert(`✅ Added ${added} contacts from CSV`);
    updateCampContactList();
  };
  input.click();
}

function updateCampContactList() {
  const el = document.getElementById('campContactList');
  const countEl = document.getElementById('campSelectedCount');
  if (!el) return;

  if (_campContacts.length === 0) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px;">No contacts added yet</div>';
  } else {
    el.innerHTML = _campContacts.map((c, i) => `
    <div style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);gap:10px;">
      <span style="flex:1;font-size:13px;">${c.name || 'Unknown'}${c.business_name ? ' <span style="color:rgba(255,255,255,0.3);">(' + c.business_name + ')</span>' : ''}</span>
      <span style="color:rgba(255,255,255,0.3);font-size:12px;">${c.phone}</span>
      <span style="font-size:10px;padding:2px 6px;border-radius:6px;background:${c.source === 'csv' ? 'rgba(59,130,246,0.15);color:#3b82f6' : 'rgba(46,204,113,0.15);color:#2ecc71'};">${c.source}</span>
      <button onclick="_campContacts.splice(${i},1);updateCampContactList();" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:14px;">✕</button>
    </div>`).join('');
  }
  if (countEl) countEl.textContent = _campContacts.length + ' contacts';
}

// ---- Create Campaign + Generate Drafts ----
async function createCampaignWithDrafts() {
  const name = document.getElementById('campName')?.value?.trim();
  const perDay = parseInt(document.getElementById('campPerDay')?.value) || 20;
  const startHour = parseInt(document.getElementById('campStartHour')?.value) || 9;
  const endHour = parseInt(document.getElementById('campEndHour')?.value) || 18;

  if (!name) { alert('Campaign name required'); return; }
  if (_campContacts.length === 0) { alert('Add at least one contact'); return; }

  // Cold outreach: check for missing business/observation
  if (_selectedCampType === 'cold_outreach') {
    const missing = _campContacts.filter(c => !c.business_name && !c.short_observation);
    if (missing.length > 0) {
      alert(`⚠️ ${missing.length} contacts missing business_name or observation. Cold outreach requires at least one.`);
      return;
    }
  }

  // Check suppression list
  const { data: suppressed } = await db.from('sms_suppression').select('phone');
  const suppressedPhones = new Set((suppressed || []).map(s => s.phone));
  const cleanContacts = _campContacts.filter(c => !suppressedPhones.has(c.phone));
  const blocked = _campContacts.length - cleanContacts.length;
  if (blocked > 0) {
    alert(`ℹ️ ${blocked} contacts are on the suppression list (opted out) and will be skipped.`);
  }

  try {
    // Generate unique messages using voice engine
    const drafts = generateDrafts(cleanContacts, _selectedCampType, 1);

    // Create campaign
    const { data: campaign, error } = await db.from('sms_campaigns').insert({
      name,
      campaign_type: _selectedCampType,
      message_template: '[auto-generated from voice engine]',
      status: 'draft',
      contacts_total: cleanContacts.length,
      per_day_limit: perDay,
      send_start_hour: startHour,
      send_end_hour: endHour
    }).select().single();

    if (error) throw error;

    // Schedule with staggered times + insert as DRAFTS (review_status='draft')
    const today = new Date();
    let currentDay = new Date(today);
    currentDay.setDate(currentDay.getDate() + 1);
    while (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
      currentDay.setDate(currentDay.getDate() + 1);
    }
    let dayCount = 0;

    const queueItems = [];
    for (const draft of drafts) {
      if (draft.blocked) continue;

      if (dayCount >= perDay) {
        dayCount = 0;
        currentDay.setDate(currentDay.getDate() + 1);
        while (currentDay.getDay() === 0 || currentDay.getDay() === 6) {
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }

      const randomMin = Math.floor(Math.random() * (endHour - startHour) * 60);
      const scheduled = new Date(currentDay);
      scheduled.setHours(startHour, randomMin, 0, 0);

      queueItems.push({
        campaign_id: campaign.id,
        contact_id: draft.id || null,
        contact_name: draft.name,
        contact_phone: draft.phone,
        business_name: draft.business_name || null,
        short_observation: draft.short_observation || null,
        message: draft.message,
        message_tier: 1,
        scheduled_at: scheduled.toISOString(),
        status: 'queued',
        review_status: 'draft'
      });
      dayCount++;
    }

    // Batch insert
    for (let i = 0; i < queueItems.length; i += 50) {
      await db.from('sms_drip_queue').insert(queueItems.slice(i, i + 50));
    }

    document.getElementById('createCampaignModal')?.remove();
    _campContacts = [];
    _activeCampaignId = campaign.id;
    await renderSmsCampaignsTab();
    alert(`✅ Campaign "${name}" created with ${queueItems.length} drafts to review!`);

  } catch (err) {
    alert('❌ Failed: ' + err.message);
    console.error(err);
  }
}

// ---- Draft Review Actions ----
async function saveDraftEdit(queueId, newText) {
  if (!newText || !db) return;
  const trimmed = newText.trim().substring(0, 300);
  await db.from('sms_drip_queue').update({ message: trimmed }).eq('id', queueId);
}

async function approveDraft(queueId) {
  if (!db) return;
  await db.from('sms_drip_queue').update({ review_status: 'approved' }).eq('id', queueId);
  await renderSmsCampaignsTab();
}

async function skipDraft(queueId) {
  if (!db) return;
  await db.from('sms_drip_queue').update({ review_status: 'skipped', status: 'skipped' }).eq('id', queueId);
  await renderSmsCampaignsTab();
}

async function approveAllDrafts(campaignId) {
  if (!confirm('Approve all drafts? They will be queued for sending when campaign is launched.')) return;
  await db.from('sms_drip_queue').update({ review_status: 'approved' }).eq('campaign_id', campaignId).eq('review_status', 'draft');
  await renderSmsCampaignsTab();
}

// ---- Campaign Lifecycle ----
async function launchCampaign(id) {
  // Check if all drafts approved
  const { data: drafts } = await db.from('sms_drip_queue').select('review_status').eq('campaign_id', id);
  const pending = (drafts || []).filter(d => d.review_status === 'draft');
  if (pending.length > 0) {
    alert(`⚠️ ${pending.length} drafts still need review. Approve or skip them first.`);
    return;
  }

  // Run compliance check
  const check = await checkCampaignCompliance(id);
  if (!check.safe) {
    alert('⚠️ Compliance issue: ' + check.reason);
    return;
  }

  if (!confirm('Launch this campaign? Approved messages will start sending during business hours.')) return;

  // Move approved → queued
  await db.from('sms_drip_queue').update({ status: 'queued' }).eq('campaign_id', id).eq('review_status', 'approved');
  await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
  await renderSmsCampaignsTab();
}

async function pauseCampaign(id) {
  await db.from('sms_campaigns').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', id);
  await db.from('sms_drip_queue').update({ status: 'skipped' }).eq('campaign_id', id).eq('status', 'queued');
  await renderSmsCampaignsTab();
}

async function resumeCampaign(id) {
  // Re-schedule skipped items from tomorrow
  const { data: skipped } = await db.from('sms_drip_queue').select('*').eq('campaign_id', id).eq('status', 'skipped').neq('review_status', 'skipped');
  const { data: campaign } = await db.from('sms_campaigns').select('*').eq('id', id).single();
  if (!campaign) return;

  const perDay = campaign.per_day_limit || 20;
  const startH = campaign.send_start_hour || 9;
  const endH = campaign.send_end_hour || 18;

  let day = new Date();
  day.setDate(day.getDate() + 1);
  let count = 0;

  for (const item of (skipped || [])) {
    if (count >= perDay) {
      count = 0;
      day.setDate(day.getDate() + 1);
      while (day.getDay() === 0 || day.getDay() === 6) day.setDate(day.getDate() + 1);
    }
    const mins = Math.floor(Math.random() * (endH - startH) * 60);
    const sched = new Date(day);
    sched.setHours(startH, mins, 0, 0);

    await db.from('sms_drip_queue').update({ status: 'queued', scheduled_at: sched.toISOString() }).eq('id', item.id);
    count++;
  }

  await db.from('sms_campaigns').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id);
  await renderSmsCampaignsTab();
}

async function deleteCampaign(id) {
  if (!confirm('Delete this campaign and all messages? Cannot be undone.')) return;
  await db.from('sms_campaigns').delete().eq('id', id);
  _activeCampaignId = null;
  await renderSmsCampaignsTab();
}

// Expose for Contact Hub integration
window._contactHubContacts = window._contactHubContacts || [];
