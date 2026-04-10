// agent-promoter.js — The Promoter Agent v3
// CAROUSEL DESIGN SYSTEM — NUI Black Slides (Satori + resvg-js)
// Schedule: daily 9am CT (netlify.toml)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── CONTENT PILLARS ──────────────────────────────────────────
const CONTENT_PILLARS = [
  { id: 'branding_vs_logo',      topicA: 'Brand Identity',    topicB: 'Just a Logo',       hashtags: '#BrandStrategy #NewUrbanInfluence #DetroitBusiness #BrandIdentity #LogoDesign #313 #Detroit #SmallBusiness #UrbanEntrepreneur #Branding' },
  { id: 'ai_vs_human',           topicA: 'AI Marketing',      topicB: 'Human Marketing',   hashtags: '#AIMarketing #NewUrbanInfluence #DetroitBusiness #AIAutomation #Marketing #313 #SmallBusiness #DigitalMarketing #Detroit #MarketingStrategy' },
  { id: 'website_vs_social',     topicA: 'A Real Website',    topicB: 'A Social Page',     hashtags: '#DigitalHQ #NewUrbanInfluence #DetroitBusiness #WebDesign #SmallBusiness #313 #Detroit #DigitalHeadquarters #OnlinePresence #BusinessInfrastructure' },
  { id: 'personal_vs_corporate', topicA: 'Personal Branding', topicB: 'Corporate Branding',hashtags: '#PersonalBranding #NewUrbanInfluence #DetroitBusiness #Branding #313 #Detroit #UrbanEntrepreneur #BrandStrategy #SmallBusiness #CreatorEconomy' },
  { id: 'followers_vs_community',topicA: 'Real Community',    topicB: 'Follower Count',    hashtags: '#CommunityBuilding #NewUrbanInfluence #DetroitBusiness #SocialMedia #313 #Detroit #SmallBusiness #ContentCreator #Engagement #DigitalMarketing' },
  { id: 'strategy_vs_posting',   topicA: 'Content Strategy',  topicB: 'Random Posting',    hashtags: '#ContentStrategy #NewUrbanInfluence #DetroitBusiness #ContentMarketing #313 #Detroit #SmallBusiness #SocialMediaMarketing #ContentCreation #Marketing' },
  { id: 'organic_vs_paid',       topicA: 'Organic Growth',    topicB: 'Paid Ads Only',     hashtags: '#OrganicGrowth #NewUrbanInfluence #DetroitBusiness #DigitalMarketing #PaidAds #313 #Detroit #SmallBusiness #MarketingStrategy #SEO' },
  { id: 'automation_vs_manual',  topicA: 'Business Automation',topicB: 'Manual Everything',hashtags: '#Automation #NewUrbanInfluence #DetroitBusiness #AIAutomation #DigitalStaff #313 #Detroit #SmallBusiness #BusinessGrowth #Efficiency' },
];

// ── CAROUSEL SYSTEM PROMPT ───────────────────────────────────
const CAROUSEL_SYSTEM_PROMPT = `You are the NUI Promoter Agent for New Urban Influence — a Detroit branding and AI automation agency founded by Faren Young.

BRAND VOICE: "Talk like the block, move like the boardroom."
Direct, real, culturally sharp. No corporate fluff. No generic motivational filler. Write like you're giving game to someone who needs to hear it.

OUTPUT: Return ONLY valid JSON. No markdown. No preamble. No explanation. Just raw JSON.

STRUCTURE:
{
  "hook_number": "NO. 1 REASON",
  "hook_body": "One punchy truth that stops the scroll. Max 15 words. Real and specific.",
  "slides": [
    {
      "angle": "1-2 word label",
      "body_a": "2-3 sentence insight for Side A. Specific. No fluff. Detroit context when relevant.",
      "body_b": "2-3 sentence insight for Side B. Specific. No fluff. Detroit context when relevant."
    }
  ],
  "cta": "Question to audience + engagement ask. Max 3 sentences. Creates debate or self-reflection.",
  "caption": "Instagram caption. Detroit voice. 150-200 words. 15-20 hashtags at the end on their own line."
}

RULES:
— slides array must have EXACTLY 7 items
— Every insight must be actionable or revealing — not obvious
— Avoid: generic advice, "it's important to", "make sure you"
— Include: specific scenarios, dollar amounts, Detroit references where natural
— The CTA question must create genuine debate`;

// ── FONT + LOGO LOADER ───────────────────────────────────────
let _fontDataSyne = null;
let _fontDataInter = null;
let _logoBase64 = null;

async function loadAssets() {
  const fs = await import('fs');
  const path = await import('path');
  const { default: nodeFetch } = await import('node-fetch');

  // Load NUI logo from filesystem
  const logoPath = path.join(process.cwd(), 'logo-nav-cropped.png');
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath);
    _logoBase64 = `data:image/png;base64,${buf.toString('base64')}`;
  }

  // Load fonts from Google Fonts
  if (!_fontDataSyne) {
    try {
      const r = await nodeFetch('https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uQ.woff');
      _fontDataSyne = await r.arrayBuffer();
    } catch(e) { console.warn('Syne font load failed:', e.message); }
  }
  if (!_fontDataInter) {
    try {
      const r = await nodeFetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2');
      _fontDataInter = await r.arrayBuffer();
    } catch(e) { console.warn('Inter font load failed:', e.message); }
  }
}

// ── SATORI SLIDE RENDERER ────────────────────────────────────
async function renderSlideToBuffer(slideJSX, fonts) {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');

  const svg = await satori(slideJSX, {
    width: 1080,
    height: 1350,
    fonts: fonts.filter(Boolean),
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } });
  return resvg.render().asPng();
}

// ── SLIDE JSX BUILDERS ───────────────────────────────────────
function makeHeader(hashtag) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
      children: [
        _logoBase64
          ? { type: 'img', props: { src: _logoBase64, style: { height: 32, width: 'auto' } } }
          : { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 6 },
              children: [
                { type: 'div', props: { style: { background: '#fff', color: '#000', fontWeight: 800, fontSize: 14, padding: '3px 5px', borderRadius: 3 }, children: 'NUI' } },
                { type: 'span', props: { style: { color: '#fff', fontSize: 16, fontWeight: 500 }, children: 'New Urban Influence' } }
              ]
            }
          },
        { type: 'span', props: { style: { color: '#fff', fontSize: 18, fontWeight: 700 }, children: hashtag } }
      ]
    }
  };
}

function makeFooter() {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' },
      children: [
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column' }, children: [
          { type: 'span', props: { style: { color: 'rgba(255,255,255,0.4)', fontSize: 14 }, children: '@2026 New Urban Influence' } },
          { type: 'span', props: { style: { color: 'rgba(255,255,255,0.4)', fontSize: 14 }, children: 'All Rights Reserved' } }
        ]}},
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [
          { type: 'span', props: { style: { color: 'rgba(255,255,255,0.65)', fontSize: 14 }, children: 'Faren Young' } },
          { type: 'span', props: { style: { color: 'rgba(255,255,255,0.65)', fontSize: 14 }, children: '@CreativeFaren' } }
        ]}},
        { type: 'span', props: { style: { color: '#fff', fontSize: 20, fontWeight: 700 }, children: '2026' } }
      ]
    }
  };
}

function wrapSlide(content, hashtag) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', background: '#000000', width: 1080, height: 1350, padding: 56, boxSizing: 'border-box' },
      children: [ makeHeader(hashtag), content, makeFooter() ]
    }
  };
}

function buildCoverSlide(topicA, topicB, hookBody, hashtag) {
  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' },
      children: [
        { type: 'div', props: { style: { color: '#fff', fontSize: 120, fontWeight: 800, lineHeight: 0.9, letterSpacing: -3, marginBottom: 8 }, children: topicA } },
        { type: 'div', props: { style: { color: '#555', fontSize: 56, fontWeight: 700, marginBottom: 8 }, children: 'vs.' } },
        { type: 'div', props: { style: { color: '#fff', fontSize: 120, fontWeight: 800, lineHeight: 0.9, letterSpacing: -3, marginBottom: 28 }, children: topicB } },
        { type: 'div', props: { style: { color: '#D90429', fontSize: 30, fontWeight: 600, lineHeight: 1.4 }, children: hookBody } }
      ]
    }
  };
  return wrapSlide(content, hashtag);
}

function buildHookSlide(hookNumber, hookBody, hashtag) {
  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center' },
      children: [
        { type: 'div', props: { style: { color: '#D90429', fontSize: 80, fontWeight: 800, textAlign: 'center', letterSpacing: -1, marginBottom: 24 }, children: hookNumber } },
        { type: 'div', props: { style: { color: '#fff', fontSize: 40, fontWeight: 500, textAlign: 'center', lineHeight: 1.4 }, children: hookBody } }
      ]
    }
  };
  return wrapSlide(content, hashtag);
}

function buildCompSlide(angle, topicA, bodyA, topicB, bodyB, hashtag) {
  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' },
      children: [
        { type: 'div', props: { style: { color: 'rgba(255,255,255,0.22)', fontSize: 20, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 28 }, children: angle } },
        { type: 'div', props: { style: { color: '#D90429', fontSize: 44, fontWeight: 800, marginBottom: 14 }, children: topicA + ':' } },
        { type: 'div', props: { style: { color: '#fff', fontSize: 30, fontWeight: 400, lineHeight: 1.5, marginBottom: 0 }, children: bodyA } },
        { type: 'div', props: { style: { borderTop: '1px solid #fff', width: '100%', marginTop: 32, marginBottom: 32 } } },
        { type: 'div', props: { style: { color: '#00BFFF', fontSize: 44, fontWeight: 800, marginBottom: 14 }, children: topicB + ':' } },
        { type: 'div', props: { style: { color: '#fff', fontSize: 30, fontWeight: 400, lineHeight: 1.5 }, children: bodyB } }
      ]
    }
  };
  return wrapSlide(content, hashtag);
}

function buildCTASlide(ctaText, hashtag) {
  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' },
      children: [
        { type: 'div', props: { style: { color: '#fff', fontSize: 36, fontWeight: 500, lineHeight: 1.55, marginBottom: 40 }, children: ctaText } },
        { type: 'div', props: { style: { color: '#fff', fontSize: 36, fontStyle: 'italic', fontWeight: 700, marginBottom: 6 }, children: 'Faren Young' } },
        { type: 'div', props: { style: { color: 'rgba(255,255,255,0.4)', fontSize: 22, lineHeight: 1.5 }, children: 'Encouraging analytical thinkers to adopt creativity for meaningful outcomes.' } }
      ]
    }
  };
  return wrapSlide(content, hashtag);
}

// ── GENERATE ALL 10 SLIDE BUFFERS ────────────────────────────
async function generateCarouselBuffers(data, pillar, fonts) {
  const hashtag = '#branding';
  const tA = pillar.topicA;
  const tB = pillar.topicB;
  const buffers = [];

  const slides = [
    buildCoverSlide(tA, tB, data.hook_body, hashtag),
    buildHookSlide(data.hook_number, data.hook_body, hashtag),
    ...data.slides.map(s => buildCompSlide(s.angle, tA, s.body_a, tB, s.body_b, hashtag)),
    buildCTASlide(data.cta, hashtag),
  ];

  for (const jsx of slides) {
    const png = await renderSlideToBuffer(jsx, fonts);
    buffers.push(png);
  }
  return buffers;
}

// -- SUPABASE STORAGE UPLOADER --
async function uploadToStorage(buffer, filename) {
  const { default: nodeFetch } = await import('node-fetch');
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const bucket = 'carousel-images';
  const path   = filename + '.png';
  const r = await nodeFetch(SB_URL + '/storage/v1/object/' + bucket + '/' + path, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SB_KEY,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || d.message || 'Storage upload failed: ' + r.status);
  return SB_URL + '/storage/v1/object/public/' + bucket + '/' + path;
}


// ── INSTAGRAM CAROUSEL POSTER ────────────────────────────────
async function postInstagramCarousel(caption, imageUrls) {
  const { default: nodeFetch } = await import('node-fetch');
  const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const IG_ID    = process.env.IG_USER_ID;
  if (!FB_TOKEN || !IG_ID) return { skipped: true, reason: 'no credentials' };

  // Step 1: Create a media container for each image
  const containerIds = [];
  for (const url of imageUrls) {
    const r = await nodeFetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: FB_TOKEN })
    });
    const d = await r.json();
    if (!r.ok || !d.id) return { success: false, error: `Container failed: ${d.error?.message}` };
    containerIds.push(d.id);
  }

  // Step 2: Create carousel container
  const carouselR = await nodeFetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'CAROUSEL', children: containerIds.join(','), caption, access_token: FB_TOKEN })
  });
  const carouselD = await carouselR.json();
  if (!carouselR.ok || !carouselD.id) return { success: false, error: `Carousel container failed: ${carouselD.error?.message}` };

  // Step 3: Publish
  const pubR = await nodeFetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: carouselD.id, access_token: FB_TOKEN })
  });
  const pubD = await pubR.json();
  return { success: pubR.ok, post_id: pubD.id, error: pubD.error?.message };
}

// ── FACEBOOK SINGLE COVER POSTER ────────────────────────────
async function postFacebook(caption, coverImageUrl) {
  const { default: nodeFetch } = await import('node-fetch');
  const FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const FB_PAGE  = process.env.FB_PAGE_ID;
  if (!FB_TOKEN || !FB_PAGE) return { skipped: true, reason: 'no credentials' };
  const body = { message: caption, access_token: FB_TOKEN };
  const endpoint = coverImageUrl ? 'photos' : 'feed';
  if (coverImageUrl) body.url = coverImageUrl;
  const r = await nodeFetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.id, error: d.error?.message };
}

async function postGBP(caption) {
  const { default: nodeFetch } = await import('node-fetch');
  const GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
  const GMB_LOC   = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;
  if (!GMB_TOKEN || !GMB_LOC) return { skipped: true, reason: 'no GBP credentials' };
  const r = await nodeFetch(`https://mybusiness.googleapis.com/v4/${GMB_LOC}/localPosts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GMB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ languageCode: 'en-US', summary: caption.slice(0, 1500), callToAction: { actionType: 'CALL', url: 'https://newurbaninfluence.com/contact' }, topicType: 'STANDARD', state: 'LIVE' })
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.name, error: d.error?.message };
}

// ── SUPABASE HELPERS ─────────────────────────────────────────
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

const sbFetch = async (path, opts = {}) => {
  const { default: nodeFetch } = await import('node-fetch');
  const r = await nodeFetch(`${SB_URL}/rest/v1/${path}`, {
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

// ── GENERATE CAROUSEL CONTENT FROM CLAUDE ───────────────────
async function generateCarouselContent(pillar) {
  const { default: nodeFetch } = await import('node-fetch');
  const CLAUDE = process.env.ANTHROPIC_API_KEY;
  const r = await nodeFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: CAROUSEL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Create a 10-slide educational carousel comparing "${pillar.topicA}" vs "${pillar.topicB}". Return raw JSON only — no markdown fences, no explanation.` }]
    })
  });
  const d = await r.json();
  const raw = d.content?.[0]?.text?.trim() || '';
  const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

// ── MAIN HANDLER ─────────────────────────────────────────────
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

    // 1. Load fonts + logo
    await loadAssets();
    const fonts = [
      _fontDataSyne ? { name: 'Syne', data: _fontDataSyne, weight: 800, style: 'normal' } : null,
      _fontDataInter ? { name: 'Inter', data: _fontDataInter, weight: 400, style: 'normal' } : null,
      _fontDataInter ? { name: 'Inter', data: _fontDataInter, weight: 500, style: 'normal' } : null,
    ].filter(Boolean);

    // 2. Generate carousel content
    const carouselData = await generateCarouselContent(pillar);

    // 3. Render all 10 slides to PNG buffers
    const buffers = await generateCarouselBuffers(carouselData, pillar, fonts);

    // 4. Upload all slides to Supabase Storage
    const timestamp = Date.now();
    const imageUrls = [];
    for (let i = 0; i < buffers.length; i++) {
      const url = await uploadToStorage(buffers[i], `nui-carousel-${timestamp}-slide-${i+1}`);
      imageUrls.push(url);
    }

    // 5. Build caption
    const caption = `${carouselData.caption}\n\n${pillar.hashtags}`;

    // 6. Post — IG carousel, FB cover image, GBP text
    const [igResult, fbResult, gbpResult] = await Promise.all([
      postInstagramCarousel(caption, imageUrls),
      postFacebook(caption, imageUrls[0]),
      postGBP(carouselData.caption),
    ]);

    const result = {
      success: true,
      pillar_id: pillar.id,
      topic: `${pillar.topicA} vs. ${pillar.topicB}`,
      slide_count: imageUrls.length,
      image_urls: imageUrls,
      instagram: igResult,
      facebook: fbResult,
      google_business: gbpResult,
      posted_at: new Date().toISOString()
    };
    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };

  } catch (err) {
    const errResult = { success: false, error: err.message, agent: 'promoter' };
    await logRun(errResult).catch(() => {});
    return { statusCode: 500, headers: CORS, body: JSON.stringify(errResult) };
  }
};
