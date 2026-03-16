// ═══════════════════════════════════════════════════════════════
// ADMIN SOCIAL PLANNER — NUI Social Media Command Center
// Create, schedule, generate images, and post to FB + Instagram
// ═══════════════════════════════════════════════════════════════

const SOCIAL_STORAGE_KEY = 'nui_social_posts';

function getSocialPosts() {
  try { return JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveSocialPosts(posts) {
  try { localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(posts)); }
  catch(e) {}
}

function loadAdminSocialPlannerPanel() {
  const panel = document.getElementById('adminSocialplannerPanel');
  if (!panel) return;

  panel.innerHTML = `
    <style>
      .sp-tabs { display:flex; gap:0; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:28px; }
      .sp-tab { padding:12px 24px; font-size:14px; font-weight:600; color:rgba(255,255,255,0.4); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; }
      .sp-tab.active { color:#dc2626; border-bottom-color:#dc2626; }
      .sp-tab:hover:not(.active) { color:rgba(255,255,255,0.7); }
      .sp-grid { display:grid; grid-template-columns:1fr 380px; gap:24px; }
      .sp-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; }
      .sp-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:10px; }
      .sp-input { width:100%; padding:12px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
      .sp-input:focus { border-color:rgba(220,38,38,0.5); }
      .sp-textarea { resize:vertical; min-height:120px; line-height:1.7; }
      .sp-platform-btn { display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.5); cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s; }
      .sp-platform-btn.selected-fb { background:rgba(24,119,242,0.15); border-color:#1877f2; color:#1877f2; }
      .sp-platform-btn.selected-ig { background:rgba(225,48,108,0.15); border-color:#e1306c; color:#e1306c; }
      .sp-post-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:12px; transition:all 0.2s; }
      .sp-post-card:hover { border-color:rgba(255,255,255,0.15); }
      .sp-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
      .sp-badge-scheduled { background:rgba(59,130,246,0.15); color:#3b82f6; }
      .sp-badge-posted { background:rgba(34,197,94,0.15); color:#22c55e; }
      .sp-badge-draft { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); }
      .sp-badge-failed { background:rgba(239,68,68,0.15); color:#ef4444; }
      .sp-img-preview { width:100%; border-radius:12px; border:1px solid rgba(255,255,255,0.1); margin-top:12px; display:none; }
      .sp-char-count { font-size:11px; color:rgba(255,255,255,0.3); text-align:right; margin-top:4px; }
      .sp-ai-bar { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .sp-ai-chip { padding:6px 14px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.25); color:#dc2626; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; white-space:nowrap; }
      .sp-ai-chip:hover { background:rgba(220,38,38,0.2); }
      @media (max-width:768px) { .sp-grid { grid-template-columns:1fr; } }
    </style>

    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
      <div>
        <h2 style="font-size:26px; font-weight:800; color:#fff; margin:0;">📣 Social Planner</h2>
        <p style="color:rgba(255,255,255,0.4); font-size:13px; margin-top:4px;">Create, schedule and post to Facebook & Instagram</p>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <div id="spDailyCount" style="padding:8px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:rgba(255,255,255,0.5);">
          Loading usage...
        </div>
      </div>
    </div>

    <div class="sp-tabs">
      <div class="sp-tab active" onclick="spShowTab('compose')">✍️ Compose</div>
      <div class="sp-tab" onclick="spShowTab('queue')">📅 Queue</div>
      <div class="sp-tab" onclick="spShowTab('posted')">✅ Posted</div>
    </div>

    <!-- COMPOSE TAB -->
    <div id="spTabCompose">
      <div class="sp-grid">
        <!-- Left: Composer -->
        <div>
          <div class="sp-card">
            <div class="sp-label">Caption</div>
            <textarea id="spCaption" class="sp-input sp-textarea" placeholder="Write your caption... or let Monty write it for you" oninput="spUpdateCharCount()"></textarea>
            <div class="sp-char-count"><span id="spCharCount">0</span> / 2200</div>

            <div class="sp-ai-bar">
              <button class="sp-ai-chip" onclick="spAICaption('promotional')">🤖 Write Promo Caption</button>
              <button class="sp-ai-chip" onclick="spAICaption('educational')">📚 Educational Post</button>
              <button class="sp-ai-chip" onclick="spAICaption('engagement')">💬 Engagement Post</button>
              <button class="sp-ai-chip" onclick="spAICaption('behindthescenes')">🎬 Behind the Scenes</button>
            </div>
          </div>

          <div class="sp-card" style="margin-top:16px;">
            <div class="sp-label">Image</div>
            <div id="spImagePreviewWrap" style="display:none; margin-bottom:16px;">
              <img id="spImagePreview" class="sp-img-preview" style="display:block;" />
              <button onclick="spClearImage()" style="margin-top:8px; padding:6px 14px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#ef4444; border-radius:8px; font-size:12px; cursor:pointer; font-family:inherit;">✕ Remove Image</button>
            </div>
            <div id="spNoImage" style="display:flex; flex-direction:column; gap:10px;">
              <div class="sp-ai-bar">
                <button class="sp-ai-chip" onclick="spShowImagePrompt()">🖼️ Generate with AI</button>
                <button class="sp-ai-chip" onclick="document.getElementById('spImageUpload').click()">📁 Upload Image</button>
              </div>
              <input type="file" id="spImageUpload" accept="image/*" style="display:none;" onchange="spHandleImageUpload(event)">
              <div id="spImagePromptArea" style="display:none; margin-top:8px;">
                <input id="spImagePrompt" class="sp-input" placeholder="Describe the image... (e.g. Detroit skyline at night, neon accents)" style="margin-bottom:8px;">
                <button onclick="spGenerateImage()" id="spGenImageBtn" style="padding:10px 20px; background:#dc2626; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer; font-size:13px; font-family:inherit; transition:all 0.2s;">
                  ✨ Generate Image
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Settings & Actions -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="sp-card">
            <div class="sp-label">Platform</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button id="spBtnFB" class="sp-platform-btn selected-fb" onclick="spTogglePlatform('facebook')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </button>
              <button id="spBtnIG" class="sp-platform-btn" onclick="spTogglePlatform('instagram')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </button>
            </div>
            <div id="spIGWarning" style="display:none; margin-top:8px; padding:8px 12px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); border-radius:8px; font-size:12px; color:#f59e0b;">
              ⚠️ Instagram requires an image
            </div>
          </div>

          <div class="sp-card">
            <div class="sp-label">When to Post</div>
            <div style="display:flex; gap:8px; flex-direction:column;">
              <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
                <input type="radio" name="spWhen" value="now" checked onchange="spToggleSchedule()" style="accent-color:#dc2626;">
                <span style="font-size:14px; color:#fff; font-weight:500;">Post Now</span>
              </label>
              <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
                <input type="radio" name="spWhen" value="schedule" onchange="spToggleSchedule()" style="accent-color:#dc2626;">
                <span style="font-size:14px; color:#fff; font-weight:500;">Schedule for Later</span>
              </label>
              <div id="spScheduleFields" style="display:none; margin-top:4px;">
                <input type="datetime-local" id="spScheduleTime" class="sp-input" style="margin-bottom:0;">
              </div>
            </div>
          </div>

          <button onclick="spSubmitPost()" id="spPostBtn" style="padding:16px; background:#dc2626; color:#fff; border:none; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer; font-family:inherit; transition:all 0.2s; text-align:center; width:100%;">
            🚀 Post Now
          </button>
          <div id="spPostStatus" style="display:none; padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; text-align:center;"></div>
        </div>
      </div>
    </div>

    <!-- QUEUE TAB -->
    <div id="spTabQueue" style="display:none;">
      <div id="spQueueList"></div>
    </div>

    <!-- POSTED TAB -->
    <div id="spTabPosted" style="display:none;">
      <div id="spPostedList"></div>
    </div>
  `;

  spLoadDailyCount();
  spRenderQueue();
  spRenderPosted();
}

// ── Tab switcher ──
let spSelectedPlatforms = { facebook: true, instagram: false };

function spShowTab(tab) {
  document.querySelectorAll('.sp-tab').forEach((t, i) => {
    t.classList.remove('active');
    if (['compose','queue','posted'][i] === tab) t.classList.add('active');
  });
  document.getElementById('spTabCompose').style.display = tab === 'compose' ? '' : 'none';
  document.getElementById('spTabQueue').style.display = tab === 'queue' ? '' : 'none';
  document.getElementById('spTabPosted').style.display = tab === 'posted' ? '' : 'none';
  if (tab === 'queue') spRenderQueue();
  if (tab === 'posted') spRenderPosted();
}

// ── Platform toggle ──
function spTogglePlatform(p) {
  spSelectedPlatforms[p] = !spSelectedPlatforms[p];
  document.getElementById('spBtnFB').className = 'sp-platform-btn' + (spSelectedPlatforms.facebook ? ' selected-fb' : '');
  document.getElementById('spBtnIG').className = 'sp-platform-btn' + (spSelectedPlatforms.instagram ? ' selected-ig' : '');
  document.getElementById('spIGWarning').style.display = spSelectedPlatforms.instagram ? '' : 'none';
}

// ── Schedule toggle ──
function spToggleSchedule() {
  const isSchedule = document.querySelector('input[name="spWhen"]:checked')?.value === 'schedule';
  document.getElementById('spScheduleFields').style.display = isSchedule ? '' : 'none';
  document.getElementById('spPostBtn').textContent = isSchedule ? '📅 Schedule Post' : '🚀 Post Now';
}

// ── Char count ──
function spUpdateCharCount() {
  const val = document.getElementById('spCaption')?.value || '';
  const el = document.getElementById('spCharCount');
  if (el) { el.textContent = val.length; el.style.color = val.length > 2000 ? '#ef4444' : 'rgba(255,255,255,0.3)'; }
}

// ── Image handling ──
let spCurrentImageUrl = null;

function spShowImagePrompt() {
  document.getElementById('spImagePromptArea').style.display = '';
}

function spClearImage() {
  spCurrentImageUrl = null;
  document.getElementById('spImagePreviewWrap').style.display = 'none';
  document.getElementById('spNoImage').style.display = 'flex';
  document.getElementById('spImagePromptArea').style.display = 'none';
}

function spHandleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    spCurrentImageUrl = ev.target.result;
    document.getElementById('spImagePreview').src = spCurrentImageUrl;
    document.getElementById('spImagePreviewWrap').style.display = '';
    document.getElementById('spNoImage').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function spGenerateImage() {
  const prompt = document.getElementById('spImagePrompt')?.value?.trim();
  if (!prompt) { alert('Enter an image description first'); return; }
  const btn = document.getElementById('spGenImageBtn');
  btn.textContent = '⏳ Generating...'; btn.disabled = true;

  try {
    const res = await fetch('/.netlify/functions/monty-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Generate an image: ${prompt}`, context: [] })
    });
    const data = await res.json();
    const imgResult = (data.results || []).find(r => r.action === 'generate_image' && r.success);
    if (imgResult?.image_url) {
      spCurrentImageUrl = imgResult.image_url;
      document.getElementById('spImagePreview').src = spCurrentImageUrl;
      document.getElementById('spImagePreviewWrap').style.display = '';
      document.getElementById('spNoImage').style.display = 'none';
    } else {
      alert('Image generation failed. Try again or upload manually.');
    }
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    btn.textContent = '✨ Generate Image'; btn.disabled = false;
  }
}

// ── AI Caption generator ──
async function spAICaption(type) {
  const captions = {
    promotional: `Write a short Facebook/Instagram promotional post for New Urban Influence, a Detroit branding agency. Highlight our services (brand identity, web design, print). End with a CTA to book a free strategy call. Max 150 words, 1-2 emojis, no hashtags.`,
    educational: `Write an educational social media post for New Urban Influence about why small businesses in Detroit need strong branding. Conversational tone, 1-2 key tips. Max 150 words, 1-2 emojis.`,
    engagement: `Write an engaging question-based social media post for New Urban Influence that encourages comments. About branding, business growth, or Detroit. Max 100 words, casual tone.`,
    behindthescenes: `Write a behind-the-scenes social media post for New Urban Influence showing our creative process or team culture. Authentic, human tone. Max 120 words, 1-2 emojis.`
  };

  const captionEl = document.getElementById('spCaption');
  if (!captionEl) return;
  captionEl.value = '⏳ Writing caption...';
  captionEl.disabled = true;

  try {
    // Route through Monty (Netlify function) to avoid CORS
    const res = await fetch('/.netlify/functions/monty-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: captions[type],
        context: [],
        _raw_caption: true  // flag to return raw AI text
      })
    });
    const data = await res.json();
    // monty-admin returns response field with the AI text
    const text = data.response || data.content?.[0]?.text || '';
    captionEl.value = text || 'Could not generate caption.';
    spUpdateCharCount();
  } catch(e) {
    captionEl.value = '';
    alert('Caption generation failed: ' + e.message);
  } finally {
    captionEl.disabled = false;
  }
}

// ── Daily usage count ──
async function spLoadDailyCount() {
  const el = document.getElementById('spDailyCount');
  if (!el) return;
  const posts = getSocialPosts();
  const today = new Date().toDateString();
  const todayCount = posts.filter(p => p.status === 'posted' && new Date(p.postedAt).toDateString() === today).length;
  el.innerHTML = `<span style="color:${todayCount >= 4 ? '#f59e0b' : '#22c55e'};">${todayCount}/5</span> <span style="color:rgba(255,255,255,0.3);">posts today</span>`;
}

// ── Submit post ──
async function spSubmitPost() {
  const caption = document.getElementById('spCaption')?.value?.trim();
  const isSchedule = document.querySelector('input[name="spWhen"]:checked')?.value === 'schedule';
  const scheduleTime = document.getElementById('spScheduleTime')?.value;
  const btn = document.getElementById('spPostBtn');
  const statusEl = document.getElementById('spPostStatus');

  if (!caption) { spShowStatus('⚠️ Add a caption first', 'warning'); return; }
  if (!spSelectedPlatforms.facebook && !spSelectedPlatforms.instagram) {
    spShowStatus('⚠️ Select at least one platform', 'warning'); return;
  }
  if (spSelectedPlatforms.instagram && !spCurrentImageUrl) {
    spShowStatus('⚠️ Instagram requires an image', 'warning'); return;
  }
  if (isSchedule && !scheduleTime) {
    spShowStatus('⚠️ Pick a date and time', 'warning'); return;
  }

  const platform = spSelectedPlatforms.facebook && spSelectedPlatforms.instagram ? 'both'
    : spSelectedPlatforms.facebook ? 'facebook' : 'instagram';

  // Save to local queue/post
  const post = {
    id: 'sp_' + Date.now(),
    caption,
    platform,
    imageUrl: spCurrentImageUrl || null,
    status: isSchedule ? 'scheduled' : 'posting',
    scheduledFor: isSchedule ? scheduleTime : null,
    createdAt: new Date().toISOString(),
    postedAt: null,
    results: []
  };

  const posts = getSocialPosts();
  posts.unshift(post);
  saveSocialPosts(posts);

  if (isSchedule) {
    spShowStatus('📅 Post scheduled for ' + new Date(scheduleTime).toLocaleString(), 'success');
    spResetComposer();
    return;
  }

  // Post now
  btn.textContent = '⏳ Posting...'; btn.disabled = true;
  spShowStatus('', 'hidden');

  try {
    const payload = {
      message: `Post to ${platform}: caption="${caption}"${spCurrentImageUrl ? ` image_url="${spCurrentImageUrl}"` : ''}`,
      context: []
    };
    const res = await fetch('/.netlify/functions/monty-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const socialResult = (data.results || []).find(r => r.action === 'post_to_social');

    if (socialResult?.success) {
      post.status = 'posted';
      post.postedAt = new Date().toISOString();
      post.results = socialResult.posted || [];
      const allPosts = getSocialPosts();
      const idx = allPosts.findIndex(p => p.id === post.id);
      if (idx !== -1) { allPosts[idx] = post; saveSocialPosts(allPosts); }
      spShowStatus('✅ Posted successfully!', 'success');
      spLoadDailyCount();
      spResetComposer();
    } else {
      post.status = 'failed';
      post.error = socialResult?.error || data.response || 'Unknown error';
      const allPosts = getSocialPosts();
      const idx = allPosts.findIndex(p => p.id === post.id);
      if (idx !== -1) { allPosts[idx] = post; saveSocialPosts(allPosts); }
      spShowStatus('❌ ' + post.error, 'error');
    }
  } catch(e) {
    post.status = 'failed'; post.error = e.message;
    spShowStatus('❌ Error: ' + e.message, 'error');
  } finally {
    btn.textContent = '🚀 Post Now'; btn.disabled = false;
  }
}

// ── Helpers ──
function spShowStatus(msg, type) {
  const el = document.getElementById('spPostStatus');
  if (!el) return;
  if (type === 'hidden') { el.style.display = 'none'; return; }
  const colors = { success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' } };
  const c = colors[type] || colors.warning;
  el.style.cssText = `display:block; padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; text-align:center; background:${c.bg}; border:1px solid ${c.border}; color:${c.color};`;
  el.textContent = msg;
}

function spResetComposer() {
  const cap = document.getElementById('spCaption');
  if (cap) { cap.value = ''; spUpdateCharCount(); }
  spClearImage();
  document.querySelector('input[name="spWhen"][value="now"]').checked = true;
  spToggleSchedule();
}

// ── Queue tab ──
function spRenderQueue() {
  const el = document.getElementById('spQueueList');
  if (!el) return;
  const posts = getSocialPosts().filter(p => p.status === 'scheduled' || p.status === 'posting');
  if (posts.length === 0) {
    el.innerHTML = `<div style="text-align:center; padding:60px 20px; color:rgba(255,255,255,0.3);">
      <div style="font-size:48px; margin-bottom:12px;">📅</div>
      <p>No scheduled posts. Compose one above.</p>
    </div>`; return;
  }
  el.innerHTML = posts.map(p => spPostCard(p)).join('');
}

// ── Posted tab ──
function spRenderPosted() {
  const el = document.getElementById('spPostedList');
  if (!el) return;
  const posts = getSocialPosts().filter(p => p.status === 'posted' || p.status === 'failed');
  if (posts.length === 0) {
    el.innerHTML = `<div style="text-align:center; padding:60px 20px; color:rgba(255,255,255,0.3);">
      <div style="font-size:48px; margin-bottom:12px;">📭</div>
      <p>No posts yet.</p>
    </div>`; return;
  }
  el.innerHTML = posts.map(p => spPostCard(p)).join('');
}

function spPostCard(p) {
  const badgeMap = { scheduled: 'scheduled', posted: 'posted', draft: 'draft', failed: 'failed', posting: 'scheduled' };
  const badge = badgeMap[p.status] || 'draft';
  const platformIcon = p.platform === 'facebook' ? '📘' : p.platform === 'instagram' ? '📸' : '📘📸';
  const time = p.postedAt ? new Date(p.postedAt).toLocaleString() : p.scheduledFor ? '📅 ' + new Date(p.scheduledFor).toLocaleString() : new Date(p.createdAt).toLocaleString();

  return `<div class="sp-post-card">
    <div style="display:flex; align-items:start; justify-content:space-between; gap:12px;">
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="font-size:18px;">${platformIcon}</span>
          <span class="sp-badge sp-badge-${badge}">${p.status}</span>
          <span style="font-size:11px; color:rgba(255,255,255,0.3); margin-left:auto;">${time}</span>
        </div>
        <p style="color:rgba(255,255,255,0.75); font-size:13px; line-height:1.6; margin:0; white-space:pre-wrap; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;">${p.caption || ''}</p>
        ${p.error ? `<div style="margin-top:6px; font-size:12px; color:#ef4444;">⚠️ ${p.error}</div>` : ''}
      </div>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:72px; height:72px; object-fit:cover; border-radius:8px; border:1px solid rgba(255,255,255,0.1); flex-shrink:0;">` : ''}
    </div>
    ${p.results?.length > 0 ? `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05); display:flex; gap:8px;">
      ${p.results.map(r => `<span style="font-size:11px; padding:3px 10px; background:rgba(34,197,94,0.1); color:#22c55e; border-radius:20px;">${r.platform === 'facebook' ? '📘' : '📸'} ${r.platform} · ${r.post_id || 'posted'}</span>`).join('')}
    </div>` : ''}
    <div style="margin-top:10px; display:flex; gap:6px;">
      ${p.status === 'failed' ? `<button onclick="spRetryPost('${p.id}')" style="padding:6px 14px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.25); color:#dc2626; border-radius:8px; font-size:12px; cursor:pointer; font-family:inherit;">🔄 Retry</button>` : ''}
      <button onclick="spDeletePost('${p.id}')" style="padding:6px 14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); border-radius:8px; font-size:12px; cursor:pointer; font-family:inherit;">🗑️ Delete</button>
    </div>
  </div>`;
}

function spDeletePost(id) {
  const posts = getSocialPosts().filter(p => p.id !== id);
  saveSocialPosts(posts);
  spRenderQueue(); spRenderPosted(); spLoadDailyCount();
}

function spRetryPost(id) {
  const posts = getSocialPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  // Pre-fill composer and switch to compose tab
  spShowTab('compose');
  setTimeout(() => {
    const cap = document.getElementById('spCaption');
    if (cap) { cap.value = post.caption; spUpdateCharCount(); }
    if (post.imageUrl) {
      spCurrentImageUrl = post.imageUrl;
      document.getElementById('spImagePreview').src = post.imageUrl;
      document.getElementById('spImagePreviewWrap').style.display = '';
      document.getElementById('spNoImage').style.display = 'none';
    }
    spSelectedPlatforms.facebook = post.platform === 'facebook' || post.platform === 'both';
    spSelectedPlatforms.instagram = post.platform === 'instagram' || post.platform === 'both';
    document.getElementById('spBtnFB').className = 'sp-platform-btn' + (spSelectedPlatforms.facebook ? ' selected-fb' : '');
    document.getElementById('spBtnIG').className = 'sp-platform-btn' + (spSelectedPlatforms.instagram ? ' selected-ig' : '');
  }, 100);
}
