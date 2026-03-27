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
    angle: 'Share a practical branding tip Detroit business owners can act on TODAY. Be specific — give them one thing they can change or fix right now. Reference the Detroit hustle. Make them feel like they just got insider knowledge.',
    hashtags: '#DetroitBusiness #BrandingTips #NewUrbanInfluence #DetroitEntrepreneur #BrandStrategy #Detroit313 #SmallBusiness #DetroitMade #NUI #BrandIdentity'
  },
  {
    id: 'nui_service',
    angle: 'Highlight ONE specific NUI service with a bold claim. Rotate through: Brand Identity ($1,500 — logo colors fonts guidelines), Web Design ($3,500 — built to convert not just look pretty), AI Automation (Monty SMS closer — texts leads back automatically), Geo-Fencing (your ad shows on phones near your competitors). Lead with the OUTCOME not the feature.',
    hashtags: '#DetroitBranding #WebDesign #AIAutomation #DetroitAgency #BrandIdentity #GeoFencing #DigitalMarketing #Detroit #NewUrbanInfluence #LocalMarketing'
  },
  {
    id: 'built_heavy',
    angle: 'Drop a mindset hit from the Built Heavy podcast by Faren Young — about being built by pressure, resilience, Detroit grit, entrepreneurship. Make it feel like a real moment from the show. End with "Episode on Spotify/Apple — link in bio."',
    hashtags: '#BuiltHeavy #FarenYoung #DetroitPodcast #Entrepreneurship #MindsetMatters #DetroitHustle #PodcastLife #BusinessMindset #313 #Detroit'
  },
  {
    id: 'client_win',
    angle: 'Tell a real-feeling client story (keep anonymous — "a Detroit barbershop", "a Metro Detroit consultant", "a Corktown restaurant"). Describe where they were BEFORE NUI and what changed AFTER. Specific numbers if possible. End with a CTA to book their free strategy call.',
    hashtags: '#ClientWin #DetroitBusiness #BrandingResults #NewUrbanInfluence #DesignMatters #BeforeAfter #DetroitAgency #SmallBusinessOwner #BrandTransformation #313'
  },
  {
    id: 'did_you_know',
    angle: 'Drop a stat or fact that HURTS — something that makes Detroit business owners realize they are losing money or customers RIGHT NOW because of something they are not doing. Examples: 70% of customers check a website before visiting a business. Consistent branding increases revenue 23%. Geo-fencing ads get 2x higher CTR than regular display ads. Make it feel urgent.',
    hashtags: '#DigitalMarketing #LocalSEO #AIMarketing #DetroitBusiness #MarketingFacts #GrowthHacking #SmallBusiness #NewUrbanInfluence #BrandingROI #DetroitEntrepreneur'
  },
  {
    id: 'community',
    angle: 'Celebrate Detroit — the city, a local business win, an industry moment, Detroit resilience. NUI is PART of Detroit not just located here. Reference specific Detroit neighborhoods (Corktown, Midtown, Greektown, New Center, Livernois Ave of Fashion), Detroit culture (music, food, automotive, sports), or Detroit business news. Make it feel local and real.',
    hashtags: '#Detroit #DetroitRising #313 #DetroitStrong #NewUrbanInfluence #DetroitMade #MotorCity #DetroitBusiness #MichiganBusiness #DetroitProud'
  },
  {
    id: 'free_value',
    angle: 'Offer the FREE 15-minute Brand Strategy Session. Make it feel EXCLUSIVE and LIMITED. Paint the picture of what they will walk away with (clarity on their brand, a custom roadmap, knowing exactly what is hurting their growth). Address the objection that they think they cannot afford good branding. Hammer the free part.',
    hashtags: '#FreeConsultation #DetroitBusiness #BrandAudit #NewUrbanInfluence #FreeTips #BrandStrategy #SmallBusiness #DetroitEntrepreneur #MarketingHelp #313'
  },
  {
    id: 'street_team',
    angle: 'Explain geo-fencing in Detroit terms — YOUR digital street team. When someone walks near your competitor, YOUR ad shows up on their phone within 60 seconds. Use a Detroit example: "Your competitor opens on 8 Mile? We put your ad in front of everyone who walks in." Make it feel like a secret weapon they have never heard of.',
    hashtags: '#GeoFencing #StreetTeam #DetroitMarketing #NewUrbanInfluence #LocalMarketing #CompetitorTargeting #DigitalMarketing #DetroitBusiness #AIMarketing #313'
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
  const prompt = `You are the social media voice for New Urban Influence (NUI) — Detroit's boldest branding, web design, and AI automation agency. Founded by Faren Young. The tone is gritty, confident, Detroit-proud, real. Like a sharp Detroit entrepreneur talking directly to other business owners.

Write a high-performing Instagram/Facebook post for this angle:
${pillar.angle}

STRUCTURE (follow this exactly):
Line 1: HOOK — Bold, punchy opening statement that stops the scroll. No questions. Make a declaration or drop a fact. Max 10 words. Can use 1 emoji.
Line 2: blank line
Lines 3-5: VALUE — 2-3 sentences expanding on the hook. Specific, real, relatable to Detroit small business owners. Reference real situations they deal with. Can name-drop Detroit or specific industries.
Line 6: blank line
Line 7: CTA — Clear, direct call to action. Examples: "DM us 'BRAND' to get started." / "Link in bio — book your free call today." / "Comment 'INFO' and we'll reach out." / "Tag a business owner who needs this."
Line 8: blank line
Line 9: SIGNATURE — Always end with: 🔴 New Urban Influence | Detroit

RULES:
- Sound like a REAL person, not a marketing bot
- Use Detroit references naturally (313, Motor City, Detroit hustle, etc)
- Be specific — "most agencies charge $5k for a logo and deliver nothing" is better than "we offer affordable branding"
- Max 3 emojis total across entire post
- Do NOT include hashtags (added separately)
- Total length: 150-300 words

Return ONLY the post text. No quotes, no explanation, no labels.`;

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
    brand_tip: 'brand identity design logo detroit',
    nui_service: 'creative agency modern workspace detroit michigan',
    built_heavy: 'entrepreneur hustle success detroit',
    client_win: 'business success detroit celebration',
    did_you_know: 'digital marketing analytics phone laptop',
    community: 'Detroit Michigan skyline city',
    free_value: 'business owner strategy planning detroit'
  };
  const q = encodeURIComponent(queries[pillar.id] || 'detroit branding agency');
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=10&orientation=square`, {
      headers: { 'Authorization': PEXELS_KEY }
    });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * photos.length)];
    const rawUrl = pick.src?.large2x || pick.src?.large || pick.src?.original || null;
    if (!rawUrl) return null;

    // ── Apply NUI branding overlay via Cloudinary ──
    // This adds: dark overlay + NUI logo text + red bottom bar on every image
    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    if (CLOUDINARY_CLOUD) {
      const encodedUrl = encodeURIComponent(rawUrl);
      // Cloudinary fetch + transform: dark overlay + NUI text + red bar
      const transforms = [
        'w_1080,h_1080,c_fill,g_center',           // square crop 1080x1080
        'e_brightness:-20',                          // darken slightly
        'l_text:Arial_52_bold:NEW%20URBAN%20INFLUENCE,co_white,g_south_west,x_40,y_80', // NUI name bottom left
        'l_text:Arial_28:newurbaninfluence.com,co_rgb:e11d48,g_south_west,x_40,y_44',  // website in red
        'l_text:Arial_32_bold:Detroit%20%E2%80%A2%20313,co_rgb:ffffff,g_south_east,x_40,y_80', // Detroit tag
        'b_rgb:e11d48,h_6,w_1080,g_south',          // red bottom bar
        'q_auto,f_auto'                              // optimize
      ].join('/');
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodedUrl}`;
    }

    // Fallback: return raw image if no Cloudinary
    return rawUrl;
  } catch (e) {
    console.warn('Pexels fetch failed:', e.message);
    return null;
  }
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
