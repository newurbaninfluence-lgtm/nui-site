// ═══════════════════════════════════════════════════════════════
// ADMIN MONTY — AI Command Center Chat UI
// ═══════════════════════════════════════════════════════════════

function loadAdminMontyPanel() {
  const panel = document.getElementById('adminMontyPanel');
  if (!panel) return;

  panel.innerHTML = `
    <div style="display:flex; flex-direction:column; height:calc(100vh - 140px); max-height:800px;">
      <!-- Header -->
      <div style="padding:24px 28px 16px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#991b1b);display:flex;align-items:center;justify-content:center;font-size:22px;">🤖</div>
            <div>
              <h2 style="font-size:20px;font-weight:800;margin:0;">Monty</h2>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);" id="montyStatus">Ready · <span id="montyMode">Checking...</span></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="montyQuick('Show all active jobs')" style="padding:6px 14px;background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);color:#dc2626;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">📋 Jobs</button>
            <button onclick="montyQuick('List new submissions')" style="padding:6px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">📥 Leads</button>
            <button onclick="montyClear()" style="padding:6px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);border-radius:20px;cursor:pointer;font-size:12px;">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div id="montyChatMessages" style="flex:1; overflow-y:auto; padding:20px 28px; display:flex; flex-direction:column; gap:16px;">
        <div class="monty-msg monty-msg-bot">
          <div class="monty-avatar">🤖</div>
          <div class="monty-bubble">
            <div style="font-weight:700;margin-bottom:6px;">Hey Faren 👋</div>
            <div>I'm Monty, your admin assistant. Tell me what you need — add clients, create jobs, start moodboards, send emails, anything. Just type it natural.</div>
            <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;">
              <button onclick="montyQuick('Add client')" class="monty-chip">+ Add Client</button>
              <button onclick="montyQuick('Create a new branding job')" class="monty-chip">🎨 New Job</button>
              <button onclick="montyQuick('Show all jobs')" class="monty-chip">📋 My Jobs</button>
              <button onclick="montyQuick('Find client')" class="monty-chip">🔍 Find Client</button>
              <button onclick="montyQuick('Create an image of')" class="monty-chip">🖼️ Generate Image</button>
              <button onclick="montyQuick('Post to Facebook:')" class="monty-chip">📘 Post to Facebook</button>
              <button onclick="montyQuick('Write a blog post about')" class="monty-chip">📝 Write Blog</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div style="padding:16px 28px 20px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3);">
        <div style="display:flex;gap:12px;align-items:flex-end;">
          <textarea id="montyInput" placeholder="Tell Monty what to do..." rows="1"
            style="flex:1;padding:14px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;resize:none;outline:none;line-height:1.5;max-height:120px;"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();montySend()}"
            oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
          <button onclick="montySend()" id="montySendBtn"
            style="padding:14px 24px;background:#dc2626;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px;white-space:nowrap;transition:all 0.2s;">
            Send ↵
          </button>
        </div>
      </div>
    </div>

    <style>
      .monty-msg { display:flex; gap:12px; max-width:85%; animation:montyFade 0.3s ease; }
      .monty-msg-bot { align-self:flex-start; }
      .monty-msg-user { align-self:flex-end; flex-direction:row-reverse; }
      .monty-avatar { width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0; }
      .monty-msg-bot .monty-avatar { background:rgba(220,38,38,0.2); }
      .monty-msg-user .monty-avatar { background:rgba(255,255,255,0.1); }
      .monty-bubble { padding:14px 18px; border-radius:16px; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.85); }
      .monty-msg-bot .monty-bubble { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-bottom-left-radius:4px; }
      .monty-msg-user .monty-bubble { background:rgba(220,38,38,0.15); border:1px solid rgba(220,38,38,0.25); border-bottom-right-radius:4px; }
      .monty-chip { padding:6px 14px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.25); color:#dc2626; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; transition:all 0.2s; }
      .monty-chip:hover { background:rgba(220,38,38,0.2); }
      .monty-action-card { margin-top:10px; padding:12px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; }
      .monty-action-card .act-label { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:4px; }
      .monty-action-card .act-status { display:inline-block; padding:2px 10px; border-radius:10px; font-size:11px; font-weight:600; }
      .act-success { background:rgba(34,197,94,0.15); color:#22c55e; }
      .act-fail { background:rgba(239,68,68,0.15); color:#ef4444; }
      .monty-typing { display:flex; gap:4px; padding:8px 0; }
      .monty-typing span { width:8px;height:8px;background:rgba(255,255,255,0.3);border-radius:50%;animation:montyBounce 1.4s infinite; }
      .monty-typing span:nth-child(2) { animation-delay:0.2s; }
      .monty-typing span:nth-child(3) { animation-delay:0.4s; }
      @keyframes montyBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
      @keyframes montyFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    </style>
  `;

  // Check mode
  checkMontyMode();

  // Restore chat history from localStorage
  restoreMontyChatLog();
}

function restoreMontyChatLog() {
  if (!montyChatLog || montyChatLog.length === 0) return;
  const container = document.getElementById('montyChatMessages');
  if (!container) return;
  for (const entry of montyChatLog) {
    const div = document.createElement('div');
    div.className = `monty-msg monty-msg-${entry.type === 'user' ? 'user' : 'bot'}`;
    div.innerHTML = `
      <div class="monty-avatar">${entry.type === 'user' ? '👤' : '🤖'}</div>
      <div class="monty-bubble">${entry.html}</div>
    `;
    container.appendChild(div);
  }
  container.scrollTop = container.scrollHeight;
}


// ═══ CONVERSATION HISTORY (persisted to localStorage) ═══
let montyHistory = JSON.parse(localStorage.getItem('monty_history') || '[]');
let montyChatLog = JSON.parse(localStorage.getItem('monty_chat_log') || '[]');

function saveMontyState() {
  try {
    // Keep last 50 messages for context
    if (montyHistory.length > 50) montyHistory = montyHistory.slice(-50);
    if (montyChatLog.length > 100) montyChatLog = montyChatLog.slice(-100);
    localStorage.setItem('monty_history', JSON.stringify(montyHistory));
    localStorage.setItem('monty_chat_log', JSON.stringify(montyChatLog));
  } catch(e) { /* quota exceeded, trim more */ }
}

// ═══ CHECK MODE ═══
async function checkMontyMode() {
  try {
    const res = await fetch('/.netlify/functions/monty-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping', context: [] })
    });
    const data = await res.json();
    const modeEl = document.getElementById('montyMode');
    if (modeEl) {
      modeEl.textContent = data.mode === 'ai' ? '🧠 AI Mode' : '⚡ Smart Commands';
      modeEl.style.color = data.mode === 'ai' ? '#22c55e' : '#f59e0b';
    }
  } catch(e) {
    const modeEl = document.getElementById('montyMode');
    if (modeEl) { modeEl.textContent = '⚡ Smart Commands'; modeEl.style.color = '#f59e0b'; }
  }
}

// ═══ SEND MESSAGE ═══
async function montySend() {
  const input = document.getElementById('montyInput');
  const msg = (input?.value || '').trim();
  if (!msg) return;

  // Add user message
  appendMontyMsg('user', msg);
  input.value = '';
  input.style.height = 'auto';

  // Show typing
  const typingId = showMontyTyping();

  try {
    const res = await fetch('/.netlify/functions/monty-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        context: montyHistory.slice(-10)
      })
    });

    // Handle non-OK responses
    if (!res.ok) {
      removeMontyTyping(typingId);
      const errData = await res.json().catch(() => ({}));
      appendMontyMsg('bot', `<span style="color:#ef4444;">⚠️ ${errData.error || 'Request failed (' + res.status + ')'}</span>`, true);
      return;
    }

    const data = await res.json();

    // Remove typing
    removeMontyTyping(typingId);

    // Store history for AI mode
    montyHistory.push({ role: 'user', content: msg });
    montyHistory.push({ role: 'assistant', content: data.response });
    saveMontyState();

    // Build response with action cards
    let html = formatMontyResponse(data.response);
    if (!html && (!data.results || data.results.length === 0)) {
      html = '<span style="color:rgba(255,255,255,0.4);">...</span>';
    }

    if (data.results && data.results.length > 0) {
      for (const r of data.results) {
        html += renderActionCard(r);
        // Show extra message if action has one (like "No contacts found")
        if (r.message && !r.success) {
          html += `<div style="margin-top:8px;padding:10px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;color:#f59e0b;font-size:13px;">💡 ${r.message}</div>`;
        }
      }
    }

    appendMontyMsg('bot', html, true);

    // If lookup returned contacts, show them
    const lookupResult = (data.results || []).find(r => r.action === 'lookup_contact');
    if (lookupResult) {
      if (lookupResult.contacts && lookupResult.contacts.length > 0) {
        let contactHtml = '<div style="margin-top:8px;">';
        for (const c of lookupResult.contacts) {
          contactHtml += `<div class="monty-action-card" style="cursor:pointer;" onclick="showAdminPanel('contacthub')">
            <div style="font-weight:700;color:#fff;">${c.name || 'Unknown'}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:12px;">${c.email || ''} ${c.phone ? '· ' + c.phone : ''}</div>
            ${c.company ? '<div style="color:rgba(255,255,255,0.4);font-size:11px;">'+c.company+'</div>' : ''}
          </div>`;
        }
        contactHtml += '</div>';
        appendMontyMsg('bot', contactHtml, true);
      } else {
        // No results — offer to add
        const query = lookupResult.query || '';
        let noResultHtml = `<div style="margin-top:8px;padding:14px 18px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
          <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:10px;">No contacts found matching "<strong style="color:#fff;">${escapeHtml(query)}</strong>"</div>
          <button onclick="montyQuick('Add client ${escapeHtml(query)}')" class="monty-chip" style="font-size:13px;padding:8px 16px;">+ Add "${escapeHtml(query)}" as new client</button>
        </div>`;
        appendMontyMsg('bot', noResultHtml, true);
      }
    }

    // If generate_image returned an image, show preview
    const imgResult = (data.results || []).find(r => r.action === 'generate_image' && r.success);
    if (imgResult && imgResult.image_url) {
      let imgHtml = `<div style="margin-top:12px;">
        <img src="${imgResult.image_url}" alt="Generated image" style="width:100%;max-width:480px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);display:block;margin-bottom:12px;" />
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="montyQuick('Post this image to Facebook: ${imgResult.image_url}')" class="monty-chip">📘 Post to Facebook</button>
          <button onclick="montyQuick('Post this image to Instagram: ${imgResult.image_url}')" class="monty-chip">📸 Post to Instagram</button>
          <button onclick="montyQuick('Post this image to both Facebook and Instagram: ${imgResult.image_url}')" class="monty-chip">🚀 Post to Both</button>
          <a href="${imgResult.image_url}" target="_blank" download class="monty-chip" style="text-decoration:none;">⬇️ Download</a>
        </div>
      </div>`;
      appendMontyMsg('bot', imgHtml, true);
    }

    // If post_to_social returned results, show what was posted
    const socialResult = (data.results || []).find(r => r.action === 'post_to_social');
    if (socialResult) {
      if (socialResult.success && socialResult.posted?.length > 0) {
        let socialHtml = `<div style="margin-top:8px;">`;
        for (const p of socialResult.posted) {
          const icon = p.platform === 'facebook' ? '📘' : '📸';
          const color = p.platform === 'facebook' ? '#1877f2' : '#e1306c';
          socialHtml += `<div class="monty-action-card" style="border-color:${color}30;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${icon}</span>
              <div>
                <div style="font-weight:700;color:#fff;">Posted to ${p.platform.charAt(0).toUpperCase()+p.platform.slice(1)}</div>
                <div style="color:rgba(255,255,255,0.4);font-size:11px;">Post ID: ${p.post_id || 'N/A'}</div>
              </div>
              <span class="act-status act-success" style="margin-left:auto;">✓ Live</span>
            </div>
          </div>`;
        }
        if (socialResult.remaining_today !== undefined) {
          socialHtml += `<div style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:6px;text-align:right;">${socialResult.remaining_today} posts remaining today</div>`;
        }
        socialHtml += `</div>`;
        appendMontyMsg('bot', socialHtml, true);
      }
    }

    // If write_blog_post returned a post, show link
    const blogResult = (data.results || []).find(r => r.action === 'write_blog_post' && r.success);
    if (blogResult) {
      let blogHtml = `<div class="monty-action-card" style="border-color:rgba(34,197,94,0.3);">
        <div style="font-weight:700;color:#fff;margin-bottom:6px;">📝 Blog Post Published</div>
        <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:8px;">${blogResult.title || ''}</div>
        <a href="${blogResult.url || '#'}" target="_blank" style="display:inline-block;padding:6px 16px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#22c55e;border-radius:20px;font-size:12px;font-weight:600;text-decoration:none;">🔗 View Post</a>
        <button onclick="montyQuick('Post to Facebook: Check out our latest blog post! ${blogResult.url || ''}')" class="monty-chip" style="margin-left:8px;">📘 Share on Facebook</button>
      </div>`;
      appendMontyMsg('bot', blogHtml, true);
    }

    // If list_jobs returned jobs, show them
    const jobsResult = (data.results || []).find(r => r.action === 'list_jobs');
    if (jobsResult) {
      if (jobsResult.jobs && jobsResult.jobs.length > 0) {
        let jobsHtml = '<div style="margin-top:8px;">';
        const statusColors = { new: '#3b82f6', inprogress: '#f59e0b', review: '#a855f7', done: '#22c55e' };
        for (const j of jobsResult.jobs.slice(0, 10)) {
          const color = statusColors[j.status] || '#888';
          jobsHtml += `<div class="monty-action-card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;color:#fff;">${j.title || j.client_name || 'Untitled'}</span>
              <span class="act-status" style="background:${color}20;color:${color};">${(j.status || 'new').toUpperCase()}</span>
            </div>
            ${j.client_name ? '<div style="color:rgba(255,255,255,0.4);font-size:12px;">Client: '+j.client_name+'</div>' : ''}
          </div>`;
        }
        if (jobsResult.jobs.length > 10) jobsHtml += `<div style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;padding:8px;">+${jobsResult.jobs.length - 10} more</div>`;
        jobsHtml += '</div>';
        appendMontyMsg('bot', jobsHtml, true);
      } else {
        appendMontyMsg('bot', `<div style="color:rgba(255,255,255,0.5);font-size:13px;padding:10px;">📋 No jobs found. Want me to create one?</div>`, true);
      }
    }

  } catch(err) {
    removeMontyTyping(typingId);
    appendMontyMsg('bot', `<span style="color:#ef4444;">⚠️ Error: ${err.message}</span>`, true);
  }
}

// ═══ QUICK COMMANDS ═══
function montyQuick(text) {
  const input = document.getElementById('montyInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

// ═══ CLEAR CHAT ═══
function montyClear() {
  montyHistory = [];
  montyChatLog = [];
  localStorage.removeItem('monty_history');
  localStorage.removeItem('monty_chat_log');
  const container = document.getElementById('montyChatMessages');
  if (container) {
    container.innerHTML = `
      <div class="monty-msg monty-msg-bot">
        <div class="monty-avatar">🤖</div>
        <div class="monty-bubble">Chat cleared. What's next?</div>
      </div>`;
  }
}

// ═══ APPEND MESSAGE (with persistence) ═══
function appendMontyMsg(type, content, isHtml) {
  const container = document.getElementById('montyChatMessages');
  if (!container) return;
  const htmlContent = isHtml ? content : escapeHtml(content);
  const div = document.createElement('div');
  div.className = `monty-msg monty-msg-${type === 'user' ? 'user' : 'bot'}`;
  div.innerHTML = `
    <div class="monty-avatar">${type === 'user' ? '👤' : '🤖'}</div>
    <div class="monty-bubble">${htmlContent}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  // Persist to chat log
  montyChatLog.push({ type, html: htmlContent, ts: Date.now() });
  saveMontyState();
}

// ═══ TYPING INDICATOR ═══
function showMontyTyping() {
  const container = document.getElementById('montyChatMessages');
  if (!container) return null;
  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.className = 'monty-msg monty-msg-bot';
  div.id = id;
  div.innerHTML = `<div class="monty-avatar">🤖</div><div class="monty-bubble"><div class="monty-typing"><span></span><span></span><span></span></div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeMontyTyping(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ═══ FORMAT RESPONSE ═══
function formatMontyResponse(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '<span style="color:#dc2626;">▸</span> ');
}

function renderActionCard(result) {
  const labels = {
    add_contact: '👤 Contact Added',
    create_job: '📁 Job Created',
    create_moodboard: '🎨 Moodboard Created',
    create_brand_guide: '📖 Brand Guide Created',
    add_print_order: '🖨️ Print Order Added',
    send_email: '✉️ Email Sent',
    send_sms: '💬 SMS Sent',
    update_job_status: '🔄 Job Updated',
    add_note: '📝 Note Added',
    lookup_contact: '🔍 Search Complete',
    list_jobs: '📋 Jobs Retrieved',
    write_blog_post: '📝 Blog Post Published',
    post_to_social: '📣 Posted to Social',
    generate_image: '🖼️ Image Generated',
    update_cover_photo: '🖼️ Cover Photo Updated'
  };
  const label = labels[result.action] || result.action;
  const ok = result.success;

  let detail = '';
  if (result.name) detail = result.name;
  if (result.title) detail = result.title;
  if (result.product) detail = result.product;
  if (result.to) detail = result.to;
  if (result.id) detail += (detail ? ' · ' : '') + '<span style="color:rgba(255,255,255,0.3);font-size:11px;">' + result.id + '</span>';

  return `<div class="monty-action-card">
    <div class="act-label">ACTION EXECUTED</div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#fff;font-weight:600;">${label}</span>
      <span class="act-status ${ok ? 'act-success' : 'act-fail'}">${ok ? '✓ Done' : '✗ Failed'}</span>
    </div>
    ${detail ? '<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">'+detail+'</div>' : ''}
    ${result.message ? '<div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">'+result.message+'</div>' : ''}
    ${result.error ? '<div style="color:#ef4444;font-size:12px;margin-top:4px;">'+result.error+'</div>' : ''}
  </div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
