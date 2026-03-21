// admin-agents.js — NUI Agent Command Center
// Controls all 3 agents: Promoter, Responder, Creator
// v20260321v1

const AGENTS_VERSION = '20260321v1';

const AGENT_CONFIG = {
  promoter: {
    label: 'The Promoter',
    desc: 'Posts daily content to Facebook, Instagram & Google Business',
    icon: '📣',
    endpoint: '/.netlify/functions/agent-promoter',
    schedule: 'Daily 9am CT',
    color: '#D4A843'
  },
  responder: {
    label: 'The Responder',
    desc: 'Replies to form submissions, emails & GBP reviews automatically',
    icon: '💬',
    endpoint: '/.netlify/functions/agent-responder',
    schedule: 'Every 30 min',
    color: '#4CAF82'
  },
  creator: {
    label: 'The Creator',
    desc: 'Generates content packages with copy, voiceover & visuals',
    icon: '🎨',
    endpoint: '/.netlify/functions/agent-creator',
    schedule: 'Sundays 8am + on-demand',
    color: '#7B5CF5'
  }
};

const CONTENT_PILLARS = [
  { id: 'brand_tip',    label: 'Brand Tip' },
  { id: 'nui_service',  label: 'NUI Service Spotlight' },
  { id: 'built_heavy',  label: 'Built Heavy / Podcast' },
  { id: 'client_win',   label: 'Client Win Story' },
  { id: 'did_you_know', label: 'Did You Know' },
  { id: 'community',    label: 'Detroit Community' },
  { id: 'free_value',   label: 'Free Value Offer' }
];

async function loadAdminAgentsPanel() {
  const panel = document.getElementById('adminAgentsPanel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="agents-wrap">
      <div class="agents-header">
        <div>
          <h2 class="agents-title">🤖 Agent Command Center</h2>
          <p class="agents-subtitle">Your 3 AI agents running NUI around the clock</p>
        </div>
        <button class="btn-refresh-logs" onclick="agentsRefreshLogs()">↻ Refresh Logs</button>
      </div>

      <!-- Agent Status Cards -->
      <div class="agent-cards">
        ${Object.entries(AGENT_CONFIG).map(([id, cfg]) => `
          <div class="agent-card" id="agentCard_${id}">
            <div class="agent-card-top">
              <span class="agent-icon">${cfg.icon}</span>
              <div class="agent-status-dot" id="agentDot_${id}" title="Unknown"></div>
            </div>
            <div class="agent-label">${cfg.label}</div>
            <div class="agent-desc">${cfg.desc}</div>
            <div class="agent-schedule">⏰ ${cfg.schedule}</div>
            <div class="agent-last-run" id="agentLastRun_${id}">Last run: loading...</div>
            <button class="agent-trigger-btn" style="background:${cfg.color}" onclick="agentTrigger('${id}')">
              ▶ Run Now
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Tabs -->
      <div class="agents-tabs">
        <button class="agents-tab active" onclick="agentsShowTab('drafts', this)">📝 Content Drafts</button>
        <button class="agents-tab" onclick="agentsShowTab('logs', this)">📋 Agent Logs</button>
        <button class="agents-tab" onclick="agentsShowTab('create', this)">✨ Create Content</button>
      </div>

      <!-- Drafts Tab -->
      <div id="agentsTab_drafts" class="agents-tab-content">
        <div class="drafts-toolbar">
          <span class="drafts-count" id="draftsCount">Loading...</span>
          <button class="btn-batch" onclick="agentRunBatch()">🗂 Generate Week of Content</button>
        </div>
        <div id="draftsList" class="drafts-list">
          <div class="agents-loading">Loading drafts...</div>
        </div>
      </div>

      <!-- Logs Tab -->
      <div id="agentsTab_logs" class="agents-tab-content" style="display:none">
        <div id="agentLogsList" class="logs-list">
          <div class="agents-loading">Loading logs...</div>
        </div>
      </div>

      <!-- Create Tab -->
      <div id="agentsTab_create" class="agents-tab-content" style="display:none">
        <div class="create-form">
          <div class="create-form-grid">
            <div class="form-group">
              <label>Content Topic / Brief</label>
              <textarea id="createTopic" rows="3" placeholder="e.g. How NUI helped a Detroit restaurant increase walk-in traffic with a brand refresh..."></textarea>
            </div>
            <div class="form-group">
              <label>Tone / Angle</label>
              <select id="createTone">
                <option value="nui_brand">NUI Brand Voice</option>
                <option value="built_heavy">Built Heavy / Podcast</option>
                <option value="educational">Educational / Tips</option>
                <option value="client_promo">Client Spotlight</option>
              </select>
            </div>
            <div class="form-group">
              <label>Voice Style (Synthesys)</label>
              <select id="createVoice">
                <option value="nui_male">Marcus — NUI Brand (Male)</option>
                <option value="deep_male">James — Deep / Podcast (Male)</option>
                <option value="female">Aria — Warm (Female)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quick Pillar (optional)</label>
              <select id="createPillar">
                <option value="">— Custom topic above —</option>
                ${CONTENT_PILLARS.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="btn-create-content" onclick="agentCreateContent()">✨ Generate Content Draft</button>
          <div id="createResult" class="create-result" style="display:none"></div>
        </div>

        <!-- Promoter Quick Fire -->
        <div class="quick-fire-section">
          <h4>⚡ Quick Fire — Post Now</h4>
          <p>Choose a content pillar and fire The Promoter immediately (skips drafts).</p>
          <div class="pillar-grid">
            ${CONTENT_PILLARS.map(p => `
              <button class="pillar-btn" onclick="agentFirePillar('${p.id}')">${p.label}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  agentsInjectStyles();
  agentsLoadDrafts();
  agentsLoadLogs();
}

// ── Tab switching ──
function agentsShowTab(tab, btn) {
  document.querySelectorAll('.agents-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.agents-tab').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`agentsTab_${tab}`);
  if (target) target.style.display = 'block';
  if (btn) btn.classList.add('active');
  if (tab === 'logs') agentsLoadLogs();
}

// ── Load drafts ──
async function agentsLoadDrafts() {
  const list = document.getElementById('draftsList');
  const count = document.getElementById('draftsCount');
  if (!list) return;

  try {
    const token = window.adminToken;
    const res = await fetch(`${window.SUPABASE_URL}/rest/v1/content_drafts?status=eq.pending_approval&order=created_at.desc&limit=20`, {
      headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}` }
    });
    const drafts = await res.json();
    if (count) count.textContent = `${(drafts || []).length} pending drafts`;

    if (!drafts || !drafts.length) {
      list.innerHTML = `<div class="empty-state">No pending drafts. Run The Creator to generate content.</div>`;
      return;
    }

    list.innerHTML = drafts.map(d => `
      <div class="draft-card" id="draft_${d.id}">
        <div class="draft-top">
          <span class="draft-type ${d.content_type}">${d.content_type || 'post'}</span>
          <span class="draft-date">${new Date(d.created_at).toLocaleDateString()}</span>
        </div>
        <div class="draft-topic">${d.topic || 'Untitled'}</div>
        <div class="draft-caption">${d.post_caption || ''}</div>
        ${d.hashtags ? `<div class="draft-hashtags">${d.hashtags.slice(0, 80)}...</div>` : ''}
        ${d.voiceover_script ? `<details class="draft-script"><summary>🎙 Voiceover Script</summary><p>${d.voiceover_script}</p></details>` : ''}
        ${d.audio_url ? `<div class="draft-audio"><audio controls src="${d.audio_url}" style="width:100%;height:36px;"></audio></div>` : '<div class="draft-no-audio">⚠️ No audio — SYNTHESYS_API_KEY needed</div>'}
        ${d.image_url ? `<img src="${d.thumb_url || d.image_url}" class="draft-thumb" alt="background">` : ''}
        <div class="draft-actions">
          <div class="draft-platforms">
            <label><input type="checkbox" checked value="facebook" class="platform-check_${d.id}"> FB</label>
            <label><input type="checkbox" checked value="instagram" class="platform-check_${d.id}"> IG</label>
          </div>
          <input type="datetime-local" class="draft-schedule-time" id="draftTime_${d.id}"
            value="${new Date(Date.now() + 3600000).toISOString().slice(0, 16)}">
          <button class="btn-approve" onclick="agentApproveDraft(${d.id})">✓ Approve & Schedule</button>
          <button class="btn-reject" onclick="agentRejectDraft(${d.id})">✕ Reject</button>
        </div>
      </div>
    `).join('');

  } catch (e) {
    list.innerHTML = `<div class="error-state">Error loading drafts: ${e.message}</div>`;
  }
}

// ── Load agent logs ──
async function agentsLoadLogs() {
  const list = document.getElementById('agentLogsList');
  if (!list) return;

  try {
    const res = await fetch(`${window.SUPABASE_URL}/rest/v1/agent_logs?order=created_at.desc&limit=30`, {
      headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}` }
    });
    const logs = await res.json();

    // Update last-run on cards
    const lastByAgent = {};
    (logs || []).forEach(l => { if (!lastByAgent[l.agent_id]) lastByAgent[l.agent_id] = l; });
    Object.entries(lastByAgent).forEach(([id, log]) => {
      const el = document.getElementById(`agentLastRun_${id}`);
      if (el) el.textContent = `Last run: ${new Date(log.created_at).toLocaleString()}`;
      const dot = document.getElementById(`agentDot_${id}`);
      if (dot) {
        dot.style.background = log.status === 'success' ? '#4CAF82' : '#E55';
        dot.title = log.status;
      }
    });

    if (!logs || !logs.length) {
      list.innerHTML = `<div class="empty-state">No agent runs yet. Trigger an agent to see logs here.</div>`;
      return;
    }

    const agentColors = { promoter: '#D4A843', responder: '#4CAF82', creator: '#7B5CF5' };
    list.innerHTML = `
      <table class="logs-table">
        <thead><tr><th>Agent</th><th>Status</th><th>Summary</th><th>Time</th></tr></thead>
        <tbody>
          ${logs.map(l => {
            const m = l.metadata || {};
            const summary = l.agent_id === 'promoter'
              ? `Posted ${m.pillar_id || ''} | FB:${m.facebook?.success ? '✓' : '✗'} IG:${m.instagram?.success ? '✓' : '✗'} GBP:${m.google_business?.success ? '✓' : (m.google_business?.skipped ? '—' : '✗')}`
              : l.agent_id === 'responder'
              ? `Forms: ${m.forms_processed || 0} | Reviews: ${m.reviews_processed || 0}`
              : l.agent_id === 'creator'
              ? `Mode: ${m.mode || 'single'} | Drafts: ${m.drafts_created || (m.draft_id ? 1 : 0)}`
              : m.error || '—';
            return `
              <tr>
                <td><span class="log-agent-badge" style="background:${agentColors[l.agent_id] || '#666'}">${l.agent_id}</span></td>
                <td><span class="log-status ${l.status}">${l.status}</span></td>
                <td class="log-summary">${summary}</td>
                <td class="log-time">${new Date(l.created_at).toLocaleString()}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    list.innerHTML = `<div class="error-state">Error: ${e.message}</div>`;
  }
}

function agentsRefreshLogs() { agentsLoadLogs(); agentsLoadDrafts(); }

// ── Trigger agent manually ──
async function agentTrigger(agentId) {
  const btn = document.querySelector(`#agentCard_${agentId} .agent-trigger-btn`);
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Running...'; }

  try {
    const res = await fetch(AGENT_CONFIG[agentId].endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': window.adminToken || '' },
      body: JSON.stringify({ manual: true })
    });
    const data = await res.json();

    if (data.success) {
      showAgentToast(`✅ ${AGENT_CONFIG[agentId].label} ran successfully!`, 'success');
    } else {
      showAgentToast(`⚠️ ${AGENT_CONFIG[agentId].label}: ${data.error || 'partial run'}`, 'warning');
    }
    setTimeout(() => { agentsLoadLogs(); agentsLoadDrafts(); }, 1500);
  } catch (e) {
    showAgentToast(`❌ Error: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Run Now'; }
  }
}

// ── Fire promoter with specific pillar ──
async function agentFirePillar(pillarId) {
  showAgentToast(`📣 Firing Promoter with "${pillarId}" pillar...`, 'info');
  try {
    const res = await fetch(AGENT_CONFIG.promoter.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillar_id: pillarId })
    });
    const data = await res.json();
    if (data.success) {
      showAgentToast(`✅ Posted! ${data.facebook?.success ? 'FB ✓' : ''} ${data.instagram?.success ? 'IG ✓' : ''}`, 'success');
    } else {
      showAgentToast(`⚠️ ${data.error}`, 'warning');
    }
    setTimeout(agentsLoadLogs, 1500);
  } catch (e) {
    showAgentToast(`❌ ${e.message}`, 'error');
  }
}

// ── Run Creator batch (week of content) ──
async function agentRunBatch() {
  const btn = document.querySelector('.btn-batch');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating 7 drafts...'; }
  showAgentToast('🎨 Creator is generating a week of content... this takes ~30s', 'info');

  try {
    const res = await fetch(AGENT_CONFIG.creator.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'batch' })
    });
    const data = await res.json();
    showAgentToast(`✅ Created ${data.drafts_created || 0} drafts! Check Content Drafts tab.`, 'success');
    setTimeout(agentsLoadDrafts, 1500);
  } catch (e) {
    showAgentToast(`❌ ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🗂 Generate Week of Content'; }
  }
}

// ── Create single content draft ──
async function agentCreateContent() {
  const btn = document.querySelector('.btn-create-content');
  const result = document.getElementById('createResult');
  const pillarId = document.getElementById('createPillar')?.value;
  const topic = document.getElementById('createTopic')?.value || pillarId || 'NUI branding services Detroit';
  const tone = document.getElementById('createTone')?.value || 'nui_brand';
  const voice = document.getElementById('createVoice')?.value || 'nui_male';

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Creating...'; }
  if (result) { result.style.display = 'block'; result.innerHTML = '<div class="agents-loading">Generating content + voiceover...</div>'; }

  try {
    const res = await fetch(AGENT_CONFIG.creator.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'single', topic, tone, voice })
    });
    const data = await res.json();

    if (data.success && result) {
      const c = data.content || {};
      result.innerHTML = `
        <div class="create-success">
          <div class="create-success-label">✅ Draft #${data.draft_id} created!</div>
          <div class="create-preview-caption">${c.post_caption || ''}</div>
          <div class="create-preview-tags">${c.hashtags || ''}</div>
          ${data.voiceover?.audio_url ? `
            <div class="create-audio-label">🎙 Voiceover ready:</div>
            <audio controls src="${data.voiceover.audio_url}" style="width:100%;height:36px;"></audio>
          ` : `<div class="create-no-audio">⚠️ No audio — add SYNTHESYS_API_KEY to Netlify env vars</div>`}
          ${data.background?.image_url ? `<img src="${data.background.thumb_url || data.background.image_url}" class="create-thumb">` : ''}
          <button class="btn-view-drafts" onclick="agentsShowTab('drafts', document.querySelectorAll('.agents-tab')[0])">View in Drafts →</button>
        </div>
      `;
      agentsLoadDrafts();
    } else if (result) {
      result.innerHTML = `<div class="error-state">Error: ${data.error}</div>`;
    }
  } catch (e) {
    if (result) result.innerHTML = `<div class="error-state">Error: ${e.message}</div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✨ Generate Content Draft'; }
  }
}

// ── Approve draft ──
async function agentApproveDraft(draftId) {
  const timeInput = document.getElementById(`draftTime_${draftId}`);
  const scheduledFor = timeInput?.value ? new Date(timeInput.value).toISOString() : null;
  const platformChecks = document.querySelectorAll(`.platform-check_${draftId}:checked`);
  const platform = platformChecks.length === 2 ? 'both' : (platformChecks[0]?.value || 'facebook');

  try {
    const res = await fetch(AGENT_CONFIG.creator.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'approve', draft_id: draftId, scheduled_for: scheduledFor, platform })
    });
    const data = await res.json();
    if (data.success) {
      showAgentToast('✅ Approved & scheduled!', 'success');
      document.getElementById(`draft_${draftId}`)?.remove();
    } else {
      showAgentToast(`⚠️ ${data.error}`, 'warning');
    }
  } catch (e) {
    showAgentToast(`❌ ${e.message}`, 'error');
  }
}

// ── Reject draft ──
async function agentRejectDraft(draftId) {
  try {
    await fetch(`${window.SUPABASE_URL}/rest/v1/content_drafts?id=eq.${draftId}`, {
      method: 'PATCH',
      headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    showAgentToast('Draft rejected.', 'info');
    document.getElementById(`draft_${draftId}`)?.remove();
  } catch (e) {
    showAgentToast(`❌ ${e.message}`, 'error');
  }
}

// ── Toast notification ──
function showAgentToast(msg, type = 'info') {
  const colors = { success: '#4CAF82', error: '#E55', warning: '#D4A843', info: '#7B5CF5' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${colors[type]};color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;z-index:9999;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity .4s;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 4000);
}

// ── Styles ──
function agentsInjectStyles() {
  if (document.getElementById('agentsStyles')) return;
  const s = document.createElement('style');
  s.id = 'agentsStyles';
  s.textContent = `
    .agents-wrap { padding: 0 0 40px; }
    .agents-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .agents-title { font-size:22px; font-weight:700; color:#fff; margin:0 0 4px; }
    .agents-subtitle { color:#999; font-size:13px; margin:0; }
    .btn-refresh-logs { background:#222; border:1px solid #333; color:#ccc; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:13px; }
    .btn-refresh-logs:hover { background:#333; color:#fff; }

    .agent-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-bottom:28px; }
    .agent-card { background:#111; border:1px solid #222; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:8px; position:relative; }
    .agent-card-top { display:flex; justify-content:space-between; align-items:center; }
    .agent-icon { font-size:28px; }
    .agent-status-dot { width:10px; height:10px; border-radius:50%; background:#444; }
    .agent-label { font-size:15px; font-weight:700; color:#fff; }
    .agent-desc { font-size:12px; color:#888; line-height:1.4; flex:1; }
    .agent-schedule { font-size:11px; color:#666; }
    .agent-last-run { font-size:11px; color:#555; }
    .agent-trigger-btn { margin-top:4px; padding:9px 14px; border:none; border-radius:7px; cursor:pointer; font-size:13px; font-weight:600; color:#000; }
    .agent-trigger-btn:hover { opacity:.85; }
    .agent-trigger-btn:disabled { opacity:.4; cursor:not-allowed; }

    .agents-tabs { display:flex; gap:4px; margin-bottom:0; border-bottom:1px solid #222; }
    .agents-tab { background:none; border:none; color:#888; padding:10px 18px; cursor:pointer; font-size:13px; font-weight:600; border-bottom:2px solid transparent; margin-bottom:-1px; }
    .agents-tab.active { color:#D4A843; border-bottom-color:#D4A843; }
    .agents-tab-content { padding:20px 0; }

    .drafts-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
    .drafts-count { color:#888; font-size:13px; }
    .btn-batch { background:#7B5CF5; border:none; color:#fff; padding:9px 18px; border-radius:7px; cursor:pointer; font-size:13px; font-weight:600; }
    .btn-batch:hover { opacity:.85; } .btn-batch:disabled { opacity:.4; cursor:not-allowed; }

    .drafts-list { display:grid; gap:16px; }
    .draft-card { background:#111; border:1px solid #222; border-radius:10px; padding:18px; }
    .draft-top { display:flex; justify-content:space-between; margin-bottom:8px; }
    .draft-type { font-size:11px; text-transform:uppercase; letter-spacing:.5px; padding:2px 8px; border-radius:4px; background:#1a1a1a; color:#888; }
    .draft-date { font-size:11px; color:#555; }
    .draft-topic { font-weight:600; color:#ddd; margin-bottom:8px; font-size:14px; }
    .draft-caption { color:#aaa; font-size:13px; line-height:1.5; margin-bottom:8px; }
    .draft-hashtags { color:#555; font-size:11px; margin-bottom:10px; }
    .draft-script { margin-bottom:10px; }
    .draft-script summary { color:#7B5CF5; cursor:pointer; font-size:12px; }
    .draft-script p { color:#888; font-size:12px; line-height:1.5; margin-top:8px; padding:10px; background:#0a0a0a; border-radius:6px; }
    .draft-audio { margin-bottom:10px; }
    .draft-no-audio { color:#666; font-size:11px; padding:6px; background:#1a1a0a; border-radius:4px; margin-bottom:10px; }
    .draft-thumb { width:100%; max-height:140px; object-fit:cover; border-radius:6px; margin-bottom:10px; }
    .draft-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .draft-platforms { display:flex; gap:10px; color:#888; font-size:12px; }
    .draft-schedule-time { background:#0f0f0f; border:1px solid #333; color:#ccc; padding:6px 10px; border-radius:6px; font-size:12px; flex:1; min-width:160px; }
    .btn-approve { background:#4CAF82; border:none; color:#000; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; }
    .btn-reject { background:#222; border:1px solid #333; color:#888; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:12px; }

    .logs-table { width:100%; border-collapse:collapse; font-size:13px; }
    .logs-table th { text-align:left; padding:8px 12px; color:#666; border-bottom:1px solid #222; font-weight:600; font-size:11px; text-transform:uppercase; }
    .logs-table td { padding:10px 12px; border-bottom:1px solid #161616; vertical-align:middle; }
    .log-agent-badge { padding:3px 8px; border-radius:4px; color:#000; font-size:11px; font-weight:700; text-transform:uppercase; }
    .log-status { font-size:11px; font-weight:600; }
    .log-status.success { color:#4CAF82; } .log-status.error { color:#E55; } .log-status.partial { color:#D4A843; }
    .log-summary { color:#888; max-width:300px; }
    .log-time { color:#555; font-size:11px; white-space:nowrap; }

    .create-form { background:#111; border:1px solid #222; border-radius:10px; padding:20px; margin-bottom:20px; }
    .create-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
    .form-group label { display:block; color:#888; font-size:12px; margin-bottom:6px; }
    .form-group textarea, .form-group select { width:100%; background:#0f0f0f; border:1px solid #333; color:#ccc; padding:9px 12px; border-radius:7px; font-size:13px; box-sizing:border-box; resize:vertical; }
    .form-group textarea { grid-column:1/-1; }
    .btn-create-content { background:#D4A843; border:none; color:#000; padding:11px 24px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:700; }
    .btn-create-content:hover { opacity:.85; } .btn-create-content:disabled { opacity:.4; cursor:not-allowed; }
    .create-result { margin-top:16px; }
    .create-success { background:#0a1a0a; border:1px solid #1a3a1a; border-radius:8px; padding:16px; }
    .create-success-label { color:#4CAF82; font-weight:700; margin-bottom:10px; }
    .create-preview-caption { color:#ddd; font-size:14px; line-height:1.5; margin-bottom:8px; }
    .create-preview-tags { color:#555; font-size:12px; margin-bottom:10px; }
    .create-no-audio { color:#666; font-size:12px; background:#1a1a0a; padding:8px; border-radius:4px; margin-bottom:10px; }
    .create-thumb { width:100%; max-height:120px; object-fit:cover; border-radius:6px; margin:10px 0; }
    .btn-view-drafts { background:none; border:1px solid #D4A843; color:#D4A843; padding:7px 14px; border-radius:6px; cursor:pointer; font-size:12px; margin-top:8px; }

    .quick-fire-section { background:#111; border:1px solid #222; border-radius:10px; padding:20px; }
    .quick-fire-section h4 { color:#fff; margin:0 0 6px; font-size:15px; }
    .quick-fire-section p { color:#888; font-size:13px; margin:0 0 14px; }
    .pillar-grid { display:flex; flex-wrap:wrap; gap:8px; }
    .pillar-btn { background:#1a1a1a; border:1px solid #333; color:#ccc; padding:8px 14px; border-radius:7px; cursor:pointer; font-size:13px; }
    .pillar-btn:hover { background:#D4A843; border-color:#D4A843; color:#000; font-weight:700; }

    .agents-loading { color:#666; padding:20px; text-align:center; font-size:14px; }
    .empty-state { color:#555; padding:30px; text-align:center; font-size:14px; border:1px dashed #222; border-radius:8px; }
    .error-state { color:#E55; padding:16px; font-size:13px; background:#1a0a0a; border-radius:6px; }

    @media(max-width:640px) {
      .create-form-grid { grid-template-columns:1fr; }
      .draft-actions { flex-direction:column; align-items:stretch; }
    }
  `;
  document.head.appendChild(s);
}
