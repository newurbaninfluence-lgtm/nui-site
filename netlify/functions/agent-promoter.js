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
    id: 'digital_hq',
    angle: 'NUI builds Digital Headquarters for Detroit businesses — not just a website, a full command center. A Digital HQ is your brand, your automation, your AI staff, your lead engine, and your reputation — all running together in one system. Use a scenario: "A Detroit consultant had a website nobody could find, no follow-up system, and no brand that stood out. We built their Digital HQ — now they show up on Google, their AI staff follows up every lead automatically, and their brand looks like a $10M company." Position this as the future. Digital HQ starts at $3,500.',
    hashtags: '#DigitalHeadquarters #DigitalHQ #NewUrbanInfluence #DetroitBusiness #AIAutomation #BusinessInfrastructure #DetroitTech #SmallBusiness #BrandStrategy #NUI'
  },
  {
    id: 'digital_staff',
    angle: 'NUI deploys Digital Staff — AI-powered team members that work 24/7 without payroll. The AI Phone answers every call, qualifies leads, and books appointments. The AI SMS closer follows up with every lead in 60 seconds using NEPQ sales psychology. The AI receptionist never sleeps, never calls in sick, never misses a message. Use a Detroit scenario: "A Southfield med spa was missing 40% of after-hours calls. We deployed their Digital Staff. Now every call gets answered, every lead gets followed up. $397/mo — less than one days pay for a part-time employee." Make them feel crazy for NOT having this.',
    hashtags: '#DigitalStaff #AIAutomation #AIReceptionist #NewUrbanInfluence #DetroitBusiness #NeverMissACall #AIPhone #SmallBusiness #BusinessAutomation #DetroitTech'
  },
  {
    id: 'digital_street_team',
    angle: 'NUI runs your Digital Promotion Team — AI-powered geo-fencing that puts your brand in front of people near your competitors. When someone walks into a competitor location, YOUR ad shows on their phone within 60 seconds. They see your brand for the next 30 days. Use a Detroit example: "A Detroit barbershop on 7 Mile was losing clients to the new shop that opened nearby. We deployed their Digital Promotion Team — drew a virtual fence around the competition. Every customer who walked in there saw our clients ads. They got 23 new bookings in the first month." Posted Up plan starts at $497/mo.',
    hashtags: '#DigitalStreetTeam #GeoFencing #NewUrbanInfluence #DetroitMarketing #DetroitBusiness #CompetitorTargeting #LocalMarketing #AIMarketing #313 #DetroitHustle'
  },
  {
    id: 'blueprint',
    angle: 'The Blueprint is NUI\'s brand identity system — your logo, colors, fonts, guidelines, and digital presence built as a complete foundation. Not just a logo. A system. Use a scenario with ROI: "A Detroit food truck owner had a handmade logo and no real brand. We built their Blueprint — logo, brand system, packaging, social templates. They started getting booked for corporate events they could never land before. One booking paid for the entire Blueprint." Foundation starts at $2,500. The brand that looks like a real business closes deals the business card logo never could.',
    hashtags: '#TheBlueprint #BrandIdentity #NewUrbanInfluence #DetroitBusiness #LogoDesign #BrandStrategy #DetroitDesign #SmallBusiness #313 #DetroitEntrepreneur'
  },
  {
    id: 'co_sign',
    angle: 'NUI Co-Sign is how Detroit businesses get featured as a verified, award-winning brand. A Co-Sign feature includes an editorial article in the NUI Detroit Creative Network, a citation ID (NUI-DET-2026-XXXX), an award badge, and schema markup that Google recognizes. Use a scenario: "A Detroit photographer had no press coverage and no credibility signals. We gave them a Co-Sign feature. Now they show up in Google with a recognized citation, an award, and a full editorial profile — before a competitor with twice the reviews." Feature starts at $1,500.',
    hashtags: '#CoSign #NUIDetroit #DetroitCreativeNetwork #NewUrbanInfluence #DetroitBusiness #LocalAuthority #BrandCredibility #SEO #DetroitBusiness #313'
  },
  {
    id: 'client_win',
    angle: 'Share a real transformation story using NUI branded services (keep client anonymous). Use this structure — PROBLEM: "A Detroit [business type] was [specific pain — invisible on Google, missing calls, losing clients to competitors, no follow-up system]." SOLUTION: "We deployed their [Digital HQ / Digital Staff / Digital Promotion Team / Blueprint]." RESULT: "[Specific outcome in 30-90 days — new leads, bookings, calls answered, revenue]." CTA: "DM us your biggest business challenge right now."',
    hashtags: '#ClientResults #NewUrbanInfluence #DetroitBusiness #DigitalHeadquarters #AIAutomation #BeforeAfter #BusinessGrowth #Detroit #313 #DigitalStreetTeam'
  },
  {
    id: 'motion',
    angle: 'NUI Motion — AI-generated brand videos, social reels, and animated content for Detroit businesses. Not stock footage. Not templates. Custom branded motion content built on your brand colors, fonts, and messaging — generated automatically. Use a scenario: "A Detroit real estate agent wanted video content but couldnt afford a production team. We set up their Motion system — now they get 4 branded video posts per week, automatically, starting at $500." Video gets 3x more engagement than static posts. Most Detroit businesses have zero video. This is the edge.',
    hashtags: '#NUIMotion #BrandedVideo #NewUrbanInfluence #DetroitBusiness #VideoMarketing #AIVideo #ContentCreation #DetroitTech #SocialMedia #AIMarketing'
  },
  {
    id: 'ai_discovery',
    angle: 'NUI builds Discovery Engines — systems that make Detroit businesses show up everywhere people search: Google Maps, Google Search, AI search tools like ChatGPT and Perplexity, and local directories. Use a scenario: "A Detroit plumber was invisible online. Competitors with worse reviews were showing up first. We built their Discovery Engine — 50 citation submissions, Google Business optimization, AI-search optimization. They went from page 3 to top 3 in 60 days." If people cannot find you, you do not exist. Discovery Engine is included in every Digital HQ build.',
    hashtags: '#DiscoveryEngine #LocalSEO #NewUrbanInfluence #DetroitBusiness #GoogleMaps #AISearch #DetroitMarketing #SmallBusiness #LocalBusiness #Detroit313'
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
    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    if (CLOUDINARY_CLOUD) {
      const encodedUrl = encodeURIComponent(rawUrl);
      // Simple reliable transforms — tested and working
      const t = [
        'w_1080,h_1080,c_fill,g_center',          // square crop
        'e_brightness:-20',                         // darken for readability
        `l_nui-logo,w_160,g_south_west,x_30,y_64`, // NUI logo bottom left
        `l_text:Arial_36_bold:NEW%20URBAN%20INFLUENCE,co_white,g_south_west,x_210,y_90`, // name
        `l_text:Arial_22:newurbaninfluence.com,co_rgb:e11d48,g_south_west,x_210,y_52`,   // website red
        `l_text:Arial_24_bold:Detroit%20%7C%20313,co_white,g_south_east,x_30,y_60`,     // Detroit tag
        'q_auto,f_jpg'
      ].join('/');
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${t}/${encodedUrl}`;
    }

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

// ── Post Instagram Carousel ──
async function postInstagramCarousel(caption, imageUrls) {
  if (!FB_TOKEN || !IG_ID || !imageUrls?.length) return { skipped: true, reason: 'no credentials or images' };
  try {
    // Create media containers for each slide
    const containerIds = [];
    for (const url of imageUrls) {
      const r = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: FB_TOKEN })
      });
      const d = await r.json();
      if (!r.ok || !d.id) throw new Error(d.error?.message || 'Container failed');
      containerIds.push(d.id);
    }
    // Create carousel container
    const cr = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'CAROUSEL', children: containerIds.join(','), caption, access_token: FB_TOKEN })
    });
    const cd = await cr.json();
    if (!cr.ok || !cd.id) throw new Error(cd.error?.message || 'Carousel container failed');
    // Publish
    const pr = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: cd.id, access_token: FB_TOKEN })
    });
    const pd = await pr.json();
    return { success: pr.ok, post_id: pd.id, error: pd.error?.message };
  } catch(e) { return { success: false, error: e.message }; }
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

    // 4. Get pre-rendered NUI branded image (Remotion-generated, uploaded to Cloudinary)
    const BRANDED_IMAGES = {
      digital_hq:       'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-1.png',
      digital_street_team: 'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-2.png',
      digital_staff:    'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-3.png',
      blueprint:        'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-4.png',
      co_sign:          'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-5.png',
      motion:           'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-1.png',
      client_win:       'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-3.png',
      ai_discovery:     'https://res.cloudinary.com/dlc1yycrq/image/upload/nui-social-post-2.png',
    };
    const imageUrl = BRANDED_IMAGES[pillar.id] || await getPexelsImage(pillar);

    // 5. Post — carousels only on Mon (1) and Thu (4), single posts every other day
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, 4=Thu
    const isCarouselDay = dayOfWeek === 1 || dayOfWeek === 4;

    // Available carousels — will grow as we build more
    const ALL_CAROUSELS = [
      // Digital Staff carousel
      [1,2,3,4,5,6,7,8].map(i => `https://res.cloudinary.com/dlc1yycrq/image/upload/nui-carousel-digital-staff-${i}.png`)
        .concat(['https://res.cloudinary.com/dlc1yycrq/image/upload/nui-carousel-digital-staff-team.png']),
    ];

    // Pick carousel based on week number so it rotates
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const carouselSlides = isCarouselDay ? ALL_CAROUSELS[weekNum % ALL_CAROUSELS.length] : null;
    const isCarousel = !!carouselSlides;

    const [fbResult, igResult, gbpResult] = await Promise.all([
      postFacebook(caption, imageUrl),
      isCarousel ? postInstagramCarousel(caption, carouselSlides) : postInstagram(caption, imageUrl),
      postGBP(rawCopy)
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
