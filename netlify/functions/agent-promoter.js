// agent-promoter.js — The Promoter Agent
// Auto-generates and posts daily content to Facebook, Instagram, and Google Business Profile
// Runs on schedule: 9am CT daily (netlify.toml cron) + can be triggered manually
// Also handles: Reddit-style AEO answers, GBP posts, content rotation tracking
//
// Env vars needed:
//   ANTHROPIC_API_KEY, FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID, IG_USER_ID
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
//   GOOGLE_MY_BUSINESS_TOKEN (optional — GBP posting)
//   PEXELS_API_KEY (optional — background images)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── CONTENT PILLARS — rotate so we never repeat back-to-back ──
const CONTENT_PILLARS = [
  {
    id: 'brand_tip',
    angle: 'Share a practical branding tip Detroit business owners can act on today. Keep it punchy, 1-2 key insights. Relate it to local Detroit hustle culture.',
    hashtags: '#DetroitBusiness #BrandingTips #NewUrbanInfluence #DetroitEntrepreneur #BrandStrategy'
  },
  {
    id: 'nui_service',
    angle: 'Highlight one specific NUI service (rotate: brand identity, web design, AI automation, social media, print design). Show the outcome/result, not just the service.',
    hashtags: '#DetroitBranding #WebDesign #AIAutomation #DetroitAgency #BrandIdentity'
  },
  {
    id: 'built_heavy',
    angle: 'Promote the Built Heavy podcast by Faren Young. Share a quick insight or quote from the book/podcast about being built by pressure, driven by purpose. Invite people to listen.',
    hashtags: '#BuiltHeavy #FarenYoung #DetroitPodcast #Entrepreneurship #MindsetMatters'
  },
  {
    id: 'client_win',
    angle: 'Share a client success story or transformation (keep it general — "a Detroit restaurant client", "a local consultant"). Focus on the before/after result.',
    hashtags: '#ClientWin #DetroitBusiness #BrandingResults #NUIAgency #DesignMatters'
  },
  {
    id: 'did_you_know',
    angle: 'Share a surprising fact or stat about digital marketing, AI automation, local SEO, or brand design — something that makes Detroit business owners say "I need to fix this."',
    hashtags: '#DigitalMarketing #LocalSEO #AIMarketing #DetroitBusiness #MarketingFacts'
  },
  {
    id: 'community',
    angle: 'Post something that celebrates Detroit — a shoutout to the city, a local event, a Detroit business milestone, or a "Detroit is rising" type message that NUI aligns with.',
    hashtags: '#Detroit #DetroitRising #313 #DetroitStrong #NewUrbanInfluence'
  },
  {
    id: 'free_value',
    angle: 'Offer something free — a free brand audit, a free consultation, a tip sheet, a checklist. Make it feel exclusive and limited.',
    hashtags: '#FreeResource #DetroitBusiness #BrandAudit #NUIAgency #FreeTips'
  }
];

const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE  = process.env.ANTHROPIC_API_KEY;
const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE  = process.env.FB_PAGE_ID;
const IG_ID    = process.env.IG_USER_ID;
const GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
const GMB_LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json', 'Prefer': 'return=representation',
      ...(opts.headers || {})
    }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

// ── Get which pillar to use next (round-robin, tracks in Supabase) ──
async function getNextPillar() {
  try {
    const rows = await sbFetch('agent_logs?agent_id=eq.promoter&order=created_at.desc&limit=7');
    const used = (rows || []).map(r => r.metadata?.pillar_id).filter(Boolean);
    const next = CONTENT_PILLARS.find(p => !used.includes(p.id)) || CONTENT_PILLARS[0];
    return next;
  } catch { return CONTENT_PILLARS[Math.floor(Math.random() * CONTENT_PILLARS.length)]; }
}

// ── Generate post copy with Claude ──
async function generatePost(pillar) {
  const prompt = `You are the social media voice for New Urban Influence (NUI), a Detroit branding, design, and AI automation agency. Founded by Faren Young. Gritty, confident, Detroit-proud tone.

Write a social media post for this angle:
${pillar.angle}

Requirements:
- 150-250 characters max (fits FB + IG without truncation)
- Strong opening hook (no "Hey" or "Are you")
- 1 clear CTA at the end (e.g., "DM us", "Link in bio", "Book a free call")
- Natural, authentic — sounds like a real person, not a bot
- Do NOT include hashtags (added separately)
- Do NOT use emojis excessively — max 2

Return ONLY the post text. No quotes, no explanation.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await r.json();
  return d.content?.[0]?.text?.trim() || '';
}

// ── Get a relevant image from Pexels ──
async function getPexelsImage(pillar) {
  if (!PEXELS_KEY) return null;
  const queries = {
    brand_tip: 'brand identity design studio',
    nui_service: 'modern agency creative workspace Detroit',
    built_heavy: 'entrepreneur hustle motivation book',
    client_win: 'business success celebration team',
    did_you_know: 'digital marketing analytics data',
    community: 'Detroit Michigan city skyline',
    free_value: 'free resource checklist business'
  };
  const q = encodeURIComponent(queries[pillar.id] || 'branding design agency');
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=5&orientation=square`, {
      headers: { 'Authorization': PEXELS_KEY }
    });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * photos.length)];
    return pick.src?.large || pick.src?.original || null;
  } catch { return null; }
}

// ── Post to Facebook ──
async function postFacebook(caption, imageUrl) {
  if (!FB_TOKEN || !FB_PAGE) return { skipped: true, reason: 'no credentials' };
  const body = { message: caption, access_token: FB_TOKEN };
  const endpoint = imageUrl ? 'photos' : 'feed';
  if (imageUrl) body.url = imageUrl;
  const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.id, error: d.error?.message };
}

// ── Post to Instagram (requires image) ──
async function postInstagram(caption, imageUrl) {
  if (!FB_TOKEN || !IG_ID || !imageUrl) return { skipped: true, reason: imageUrl ? 'no credentials' : 'no image' };
  // Step 1: create container
  const c = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: FB_TOKEN })
  });
  const cd = await c.json();
  if (!c.ok || !cd.id) return { success: false, error: cd.error?.message || 'container failed' };
  // Step 2: publish
  const p = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: cd.id, access_token: FB_TOKEN })
  });
  const pd = await p.json();
  return { success: p.ok, post_id: pd.id, error: pd.error?.message };
}

// ── Post to Google Business Profile ──
async function postGBP(caption) {
  if (!GMB_TOKEN || !GMB_LOCATION_ID) return { skipped: true, reason: 'no GBP credentials' };
  const r = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOCATION_ID}/localPosts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GMB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      languageCode: 'en-US',
      summary: caption.slice(0, 1500),
      callToAction: { actionType: 'CALL', url: 'https://newurbaninfluence.com/book' },
      topicType: 'STANDARD',
      state: 'LIVE'
    })
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.name, error: d.error?.message };
}


// ── DAILY RUN GUARD — only post once per day ──────────────────────────────
async function alreadyRanToday() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rows = await sbFetch(
      `agent_logs?agent_id=eq.promoter&status=eq.success&created_at=gte.${todayStart.toISOString()}&select=id`
    );
    return (rows || []).length > 0;
  } catch { return false; }
}

// ── Log agent run to Supabase ──
async function logRun(data) {
  try {
    await sbFetch('agent_logs', {
      method: 'POST',
      body: JSON.stringify({
        agent_id: 'promoter',
        status: data.success ? 'success' : 'partial',
        metadata: data,
        created_at: new Date().toISOString()
      })
    });
  } catch (e) { console.error('Log failed:', e.message); }
}

// ── Main handler ──
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  // Allow manual trigger from admin panel
  const isManual = event.httpMethod === 'POST';

  // Daily run guard — skip if already posted today (unless manual trigger)
  if (!isManual) {
    const alreadyRan = await alreadyRanToday();
    if (alreadyRan) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, skipped: 'already_ran_today' }) };
    }
  }
  const body = isManual ? JSON.parse(event.body || '{}') : {};
  const forcePillar = body.pillar_id ? CONTENT_PILLARS.find(p => p.id === body.pillar_id) : null;

  try {
    // 1. Pick content pillar
    const pillar = forcePillar || await getNextPillar();

    // 2. Generate post copy
    const rawCopy = await generatePost(pillar);
    if (!rawCopy) throw new Error('Claude returned empty content');

    // 3. Build full caption (copy + hashtags)
    const caption = `${rawCopy}\n\n${pillar.hashtags}`;

    // 4. Get background image
    const imageUrl = await getPexelsImage(pillar);

    // 5. Post to all platforms in parallel
    const [fbResult, igResult, gbpResult] = await Promise.all([
      postFacebook(caption, imageUrl),
      postInstagram(caption, imageUrl),
      postGBP(rawCopy) // GBP gets clean copy without hashtags
    ]);

    const result = {
      success: true,
      pillar_id: pillar.id,
      caption_preview: rawCopy.slice(0, 100) + '...',
      image_url: imageUrl,
      facebook: fbResult,
      instagram: igResult,
      google_business: gbpResult,
      posted_at: new Date().toISOString()
    };

    await logRun(result);

    return {
      statusCode: 200, headers: CORS,
      body: JSON.stringify(result)
    };

  } catch (err) {
    const errResult = { success: false, error: err.message, agent: 'promoter' };
    await logRun(errResult).catch(() => {});
    return { statusCode: 500, headers: CORS, body: JSON.stringify(errResult) };
  }
};
