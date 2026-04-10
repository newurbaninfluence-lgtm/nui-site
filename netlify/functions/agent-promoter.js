// agent-promoter.js — The Promoter Agent v2
// Upgraded: claude-sonnet-4-6, stronger NUI brand voice prompts, improved pillar rotation
// TODO: Move content generation to Cowork task when Mac Mini is back online
// Schedule: daily 9am CT (netlify.toml)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const CONTENT_PILLARS = [
  {
    id: 'digital_hq',
    angle: 'Digital HQ — NUI builds the full business command center. Not a website. A system. Lead capture, AI staff, CRM, booking, territory SEO — all connected. Detroit businesses that run on a Digital HQ stop losing leads after hours and start looking like $10M companies.',
    hashtags: '#DigitalHQ #NewUrbanInfluence #DetroitBusiness #AIAutomation #BusinessInfrastructure #Detroit #313 #SmallBusiness #DetroitTech #DigitalHeadquarters'
  },
  {
    id: 'digital_staff',
    angle: 'Digital Staff — AI positions that run your front desk 24/7. The Digital Secretary answers every call. The Lead Catcher responds to every inquiry in under 5 minutes. The Ghostwriter sends personalized emails from your CRM. The Money Reporter drops a plain-English business summary every week. $397/mo for the full team. Less than one day of part-time payroll.',
    hashtags: '#DigitalStaff #AIReceptionist #NewUrbanInfluence #DetroitBusiness #NeverMissACall #AIAutomation #313 #BusinessAutomation #DetroitTech #SmallBusiness'
  },
  {
    id: 'digital_promotion_team',
    angle: 'Digital Promotion Team — geo-fencing, Google Maps domination, social content, visitor ID, retargeting. The Block Captain draws a virtual fence around competitor locations. Anyone who walks in sees your ad for 30 days. The Neighborhood Captain ranks your business in every zip code you serve. The Watchman identifies 15-30% of anonymous website visitors by name and email without a form.',
    hashtags: '#DigitalPromotionTeam #GeoFencing #NewUrbanInfluence #DetroitMarketing #CompetitorTargeting #LocalMarketing #313 #DetroitHustle #GoogleMaps #AIMarketing'
  },
  {
    id: 'blueprint',
    angle: 'The Blueprint — brand identity built from strategy. Logo, colors, fonts, social templates, guidelines, source files. Built after a discovery session that maps your audience, competitors, and positioning. Three tiers: Brand Kit $1,500 / Service Business $4,500 / Product Business $5,500. Payment plans on everything. The brand that looks like a real business closes deals the Canva logo never could.',
    hashtags: '#TheBlueprint #BrandIdentity #NewUrbanInfluence #DetroitBusiness #LogoDesign #BrandStrategy #DetroitDesign #313 #SmallBusiness #DetroitEntrepreneur'
  },
  {
    id: 'publicist',
    angle: 'The Publicist — NUI Magazine press feature. A professionally written editorial profile, published permanently, indexed by Google. When a high-ticket client searches your name before calling, they find third-party proof. Not your own words — a publication backing you up. Feature $1,500 / Bundle $3,500 with photography and brand reel.',
    hashtags: '#ThePublicist #NUIDetroit #NUImagazine #NewUrbanInfluence #DetroitBusiness #Credibility #PressFeature #DetroitCreatives #BrandCredibility #313'
  },
  {
    id: 'event_team',
    angle: 'The Event Team — day-rate lead capture for vendor shows, pop-ups, and events. A branded camera takes professional photos of every visitor. Photo only delivers after they enter their phone and email and accept push notification permission. They get the photo. You get a verified, opted-in contact in your database. Every person who stops at your table leaves as a lead. All Things Detroit, Eastern Market, any event.',
    hashtags: '#EventTeam #NewUrbanInfluence #AllThingsDetroit #EasternMarket #DetroitVendors #LeadCapture #313 #DetroitBusiness #PopUp #DetroitHustle'
  },
  {
    id: 'client_win',
    angle: 'Real result from a Detroit business we work with — keep the client anonymous. Structure: PROBLEM (what was going wrong), SOLUTION (which NUI service was deployed), RESULT (specific measurable outcome in 30-90 days). Make it feel real, specific, and Detroit. End with a direct CTA.',
    hashtags: '#ClientResults #NewUrbanInfluence #DetroitBusiness #DigitalHQ #AIAutomation #BeforeAfter #BusinessGrowth #Detroit #313 #DigitalPromotionTeam'
  },
  {
    id: 'truth_bomb',
    angle: 'Drop a bold, uncomfortable truth about why Detroit small businesses stay stuck. No pitching — just a real observation about branding, visibility, AI, or operations that makes a business owner stop scrolling and think. End with one direct question to the audience.',
    hashtags: '#RealTalk #NewUrbanInfluence #DetroitBusiness #SmallBusinessTruth #313 #DetroitEntrepreneur #BusinessGrowth #Detroit #BrandStrategy #AIAutomation'
  }
];

const SB_URL   = process.env.SUPABASE_URL;
const SB_KEY   = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE   = process.env.ANTHROPIC_API_KEY;
const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_PAGE  = process.env.FB_PAGE_ID;
const IG_ID    = process.env.IG_USER_ID;
const GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
const GMB_LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;
const PEXELS_KEY = process.env.PEXELS_API_KEY;


const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

async function getNextPillar() {
  try {
    const rows = await sbFetch('agent_logs?agent_id=eq.promoter&order=created_at.desc&limit=8');
    const used = (rows || []).map(r => r.metadata?.pillar_id).filter(Boolean);
    return CONTENT_PILLARS.find(p => !used.includes(p.id)) || CONTENT_PILLARS[0];
  } catch { return CONTENT_PILLARS[Math.floor(Math.random() * CONTENT_PILLARS.length)]; }
}

async function generatePost(pillar) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Detroit' });

  const prompt = `You are writing a social media post for New Urban Influence (NUI) — a Detroit branding and AI automation agency founded by Faren Young. You are Faren's voice.

BRAND VOICE: "Talk like the block, move like the boardroom." Bold, direct, no fluff, slightly aggressive truth. Detroit-proud. Never corporate. Never generic. Never use phrases like "In today's digital landscape" or "leverage synergies."

TODAY: ${today}

CONTENT BRIEF: ${pillar.angle}

WRITE A HIGH-PERFORMING INSTAGRAM/FACEBOOK POST following this EXACT structure:

LINE 1: THE HOOK — A single punchy statement that stops the scroll. Make a bold claim, drop an uncomfortable truth, or open a loop. Max 12 words. Can use 1 emoji strategically. NO questions. NO "Did you know."

[blank line]

LINES 2-4: THE DEPTH — 2-3 sentences that expand the hook with specifics. Name Detroit neighborhoods, industries, or real scenarios. Be concrete — dollar amounts, time saved, specific problems. Sound like you've seen this a hundred times.

[blank line]

LINE 5: THE CTA — One direct action. Examples: "DM us BUILD to get started." / "Book your free call — link in bio." / "Drop your city below if you need this." Keep it short and human.

[blank line]

LINE 6: SIGNATURE — Always end exactly with: 🔴 New Urban Influence | Detroit

RULES:
— Total 3 emojis maximum across the entire post
— Do NOT include hashtags (added separately)
— Sound like a real Detroit business owner talking to other business owners
— Specific beats vague every time
— Under 280 words total

Return ONLY the post text. No labels, no quotes, no explanation.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const d = await r.json();
  return d.content?.[0]?.text?.trim() || '';
}


// Generate text-only branded carousel slides via Cloudinary
// Each slide = solid dark background + NUI branding + post copy chunk
function buildTextSlides(rawCopy, pillar) {
  const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
  if (!CLOUD) return [];

  // Split the post into logical chunks for slides
  const lines = rawCopy.split('\n').map(l => l.trim()).filter(Boolean);

  // Slide 1: Hook (first line) — large, bold, centered
  // Slide 2-3: Body (middle lines grouped)
  // Slide 4: CTA + branding

  const chunks = [];
  if (lines.length > 0) chunks.push(lines[0]); // hook
  if (lines.length > 1) {
    const mid = lines.slice(1, -2);
    if (mid.length > 0) {
      // Group middle lines into 1-2 slides of ~3 lines each
      chunks.push(mid.slice(0, 3).join(' '));
      if (mid.length > 3) chunks.push(mid.slice(3, 6).join(' '));
    }
  }
  // Last slide: CTA line + "newurbaninfluence.com"
  const ctaLine = lines[lines.length - 1] || 'Build Different. Detroit.';
  chunks.push(ctaLine);

  return chunks.slice(0, 4).map((chunk, i) => {
    const isHook = i === 0;
    const isCTA = i === chunks.length - 1;

    // Encode text safely for Cloudinary URL
    const safeText = chunk
      .replace(/[,\/]/g, ' ')
      .replace(/[^a-zA-Z0-9 !?.'\-]/g, '')
      .trim()
      .slice(0, 120);

    const encodedText = encodeURIComponent(safeText);
    const fontSize = isHook ? 52 : 42;
    const textColor = isCTA ? 'rgb:D90429' : 'white';

    // Build Cloudinary transformation:
    // solid black 1080x1080 base → NUI red accent bar → slide text → footer branding
    const transforms = [
      'w_1080,h_1080,c_fill,b_rgb:0a0a0a', // black canvas
      'l_fetch:aHR0cHM6Ly9uZXd1cmJhbmluZmx1ZW5jZS5jb20vaWNvbnMvaWNvbi0xOTIucG5n,w_80,g_north_west,x_40,y_40', // NUI icon top-left
      `l_text:Arial_${fontSize}_bold:${encodedText},co_${textColor},w_940,c_fit,g_center`, // main text
      'l_text:Arial_26_bold:NEW%20URBAN%20INFLUENCE,co_white,g_south_west,x_40,y_72',
      'l_text:Arial_20:newurbaninfluence.com,co_rgb:D90429,g_south_west,x_40,y_42',
      'l_text:Arial_22:Detroit%20%7C%20313,co_rgb:888888,g_south_east,x_40,y_42',
      'q_auto,f_jpg'
    ].join('/');

    return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms}/sample`; // 'sample' is a base public ID placeholder — Cloudinary renders text on it
  });
}

async function postFacebook(caption, imageUrl) {
  if (!FB_TOKEN || !FB_PAGE) return { skipped: true, reason: 'no credentials' };
  const body = { message: caption, access_token: FB_TOKEN };
  const endpoint = imageUrl ? 'photos' : 'feed';
  if (imageUrl) body.url = imageUrl;
  const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.id, error: d.error?.message };
}

async function postInstagram(caption, imageUrl, extraImages = []) {
  if (!FB_TOKEN || !IG_ID || !imageUrl) return { skipped: true, reason: imageUrl ? 'no credentials' : 'no image' };

  const allImages = [imageUrl, ...extraImages].filter(Boolean);

  // Use carousel if we have multiple images, single post otherwise
  if (allImages.length > 1) {
    // Step 1: Create a media container for each image
    const childIds = [];
    for (const imgUrl of allImages.slice(0, 10)) { // IG max 10 slides
      const c = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imgUrl, is_carousel_item: true, access_token: FB_TOKEN })
      });
      const cd = await c.json();
      if (c.ok && cd.id) childIds.push(cd.id);
    }
    if (childIds.length < 2) return { success: false, error: 'Not enough carousel items created' };

    // Step 2: Create carousel container
    const car = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: FB_TOKEN })
    });
    const card = await car.json();
    if (!car.ok || !card.id) return { success: false, error: card.error?.message || 'carousel container failed' };

    // Step 3: Publish
    const p = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: card.id, access_token: FB_TOKEN })
    });
    const pd = await p.json();
    return { success: p.ok, post_id: pd.id, type: 'carousel', slides: childIds.length, error: pd.error?.message };
  }

  // Single image fallback
  const c = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: FB_TOKEN })
  });
  const cd = await c.json();
  if (!c.ok || !cd.id) return { success: false, error: cd.error?.message || 'container failed' };
  const p = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: cd.id, access_token: FB_TOKEN })
  });
  const pd = await p.json();
  return { success: p.ok, post_id: pd.id, type: 'single', error: pd.error?.message };
}

async function postGBP(caption) {
  if (!GMB_TOKEN || !GMB_LOCATION_ID) return { skipped: true, reason: 'no GBP credentials' };
  const r = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOCATION_ID}/localPosts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GMB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ languageCode: 'en-US', summary: caption.slice(0, 1500), callToAction: { actionType: 'CALL', url: 'https://newurbaninfluence.com/contact' }, topicType: 'STANDARD', state: 'LIVE' })
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.name, error: d.error?.message };
}

async function alreadyRanToday() {
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const rows = await sbFetch(`agent_logs?agent_id=eq.promoter&status=eq.success&created_at=gte.${todayStart.toISOString()}&select=id`);
    return (rows || []).length > 0;
  } catch { return false; }
}

async function logRun(data) {
  try {
    await sbFetch('agent_logs', { method: 'POST', body: JSON.stringify({ agent_id: 'promoter', status: data.success ? 'success' : 'partial', metadata: data, created_at: new Date().toISOString() }) });
  } catch (e) { console.error('Log failed:', e.message); }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  const isManual = event.httpMethod === 'POST';
  if (!isManual && await alreadyRanToday()) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, skipped: 'already_ran_today' }) };
  }
  const body = isManual ? JSON.parse(event.body || '{}') : {};
  const forcePillar = body.pillar_id ? CONTENT_PILLARS.find(p => p.id === body.pillar_id) : null;
  try {
    const pillar = forcePillar || await getNextPillar();
    const rawCopy = await generatePost(pillar);
    if (!rawCopy) throw new Error('Sonnet returned empty content');
    const caption = `${rawCopy}\n\n${pillar.hashtags}`;
    const slides = buildTextSlides(rawCopy, pillar);
    const imageUrl = slides[0] || null;
    const extraImages = slides.slice(1);
    const [fbResult, igResult, gbpResult] = await Promise.all([
      postFacebook(caption, imageUrl),
      postInstagram(caption, imageUrl, extraImages),
      postGBP(rawCopy)
    ]);
    const result = { success: true, pillar_id: pillar.id, caption_preview: rawCopy.slice(0, 100) + '...', image_url: imageUrl, facebook: fbResult, instagram: igResult, google_business: gbpResult, posted_at: new Date().toISOString() };
    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    const errResult = { success: false, error: err.message, agent: 'promoter' };
    await logRun(errResult).catch(() => {});
    return { statusCode: 500, headers: CORS, body: JSON.stringify(errResult) };
  }
};
