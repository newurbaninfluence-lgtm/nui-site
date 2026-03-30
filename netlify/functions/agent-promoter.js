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
    id: 'ai_automation',
    angle: 'Show how NUI uses AI to automate marketing and sales for Detroit businesses. Be SPECIFIC about what the AI actually does: Monty SMS automatically texts every lead back within 60 seconds, qualifies them, and books calls — while the business owner sleeps. This is not a chatbot. This is a full AI sales closer. Give a real scenario: "A Detroit restaurant gets 20 inquiries on Friday night. Monty texts every single one back, answers questions, and books reservations — automatically. Zero humans needed." Make them feel like they are missing out by NOT having this.',
    hashtags: '#AIAutomation #ArtificialIntelligence #NewUrbanInfluence #DetroitBusiness #AIMarketing #SmallBusinessAI #AutomatedSales #AIForBusiness #DetroitTech #FutureBusiness'
  },
  {
    id: 'ai_receptionist',
    angle: 'NUI builds AI phone receptionists for Detroit businesses. The AI answers every call 24/7, qualifies leads, books appointments, and never puts anyone on hold. Use a Detroit example: "A Southfield law firm was missing 40% of calls after hours. We deployed an AI receptionist. Now every call gets answered, every lead gets qualified, every appointment gets booked — automatically." Focus on the MONEY they were leaving on the table. End with: our AI receptionist starts at $197/mo — less than one missed client.',
    hashtags: '#AIReceptionist #AIPhone #NewUrbanInfluence #DetroitBusiness #NeverMissACall #AIAutomation #SmallBusiness #Detroit #BusinessAutomation #AIForSmallBusiness'
  },
  {
    id: 'ai_sms_closer',
    angle: 'NUI built an AI SMS closer called Monty that follows up with every lead using Cardone/Hormozi sales psychology. Monty knows the client history, reads the conversation, and closes deals via text. Give a real scenario with numbers: "A Detroit HVAC company was manually following up with leads — closing maybe 20%. We deployed Monty SMS. Follow-up happens in 60 seconds every time. Closing rate went to 34% in 30 days." Make it feel like this is the unfair advantage other businesses dont have yet.',
    hashtags: '#SMSMarketing #AICloser #NewUrbanInfluence #TextMarketing #LeadConversion #DetroitBusiness #SalesAutomation #AIMarketing #MontyAI #BusinessGrowth'
  },
  {
    id: 'street_team',
    angle: 'Explain geo-fencing as "The Digital Street Team" — when someone walks near your competitor, YOUR ad shows on their phone within 60 seconds. Use a Detroit example: "Your competitor has a barbershop on 7 Mile. We draw a virtual fence around it. Every person who walks in sees YOUR shop ad for the next 30 days." This is what big brands pay $50k for. NUI does it starting at $997/mo. Make them feel like this is the secret weapon nobody in Detroit is talking about yet.',
    hashtags: '#GeoFencing #DigitalStreetTeam #NewUrbanInfluence #DetroitMarketing #LocalMarketing #CompetitorTargeting #AIMarketing #DetroitBusiness #GeoTargeting #313'
  },
  {
    id: 'ai_visitor_id',
    angle: 'NUI gives Detroit businesses the ability to see WHO is visiting their website — name, email, company, LinkedIn — before they even contact you. This is called Silent Visitor ID. Use a scenario: "A Detroit B2B company had 800 website visitors last month. They followed up with the 12 who filled out a form. With our visitor ID tech, they could have followed up with all 800 — because we tell you exactly who they are." Make it feel like a superpower. $97/mo.',
    hashtags: '#WebsiteVisitors #LeadGeneration #NewUrbanInfluence #B2BMarketing #DetroitBusiness #SilentVisitorID #MarketingAutomation #DetroitTech #AIMarketing #SalesIntelligence'
  },
  {
    id: 'ai_email_automation',
    angle: 'NUI builds behavior-based email sequences that send the right message at the right time based on what pages someone visited on your website. Not generic blasts — intelligent automation. Example: "A Detroit med spa visitor looked at Botox pricing 3 times. Our system automatically sent them a Botox special offer 2 hours later. They booked." This is the difference between blasting everyone the same email and actually closing sales. Starting at $97/mo.',
    hashtags: '#EmailAutomation #BehaviorBasedEmail #NewUrbanInfluence #DetroitBusiness #EmailMarketing #MarketingAutomation #AIMarketing #SmallBusiness #DetroitEntrepreneur #ConversionOptimization'
  },
  {
    id: 'client_win',
    angle: 'Share a real AI-powered transformation story (keep client anonymous). Structure it as BEFORE/AFTER with specific numbers. Example format: "A Detroit [industry] was [pain point]. We deployed [NUI AI tool]. In [timeframe] they saw [specific result — leads, revenue, time saved, calls answered]. They now [current state]." Make it feel undeniable. End with: "DM us RESULTS to see what AI automation could do for your business."',
    hashtags: '#ClientResults #AIAutomation #NewUrbanInfluence #DetroitBusiness #BeforeAfter #BrandTransformation #BusinessGrowth #DetroitEntrepreneur #AIForBusiness #Results'
  },
  {
    id: 'ai_content_engine',
    angle: 'NUI uses AI to create and auto-post branded social media content for clients — every single day. No social media manager needed. The AI writes the post, brands the image, picks the right hashtags, and posts at the optimal time — automatically. Use a scenario: "A Detroit restaurant owner was spending 3 hours a week on social media. We set up their AI content engine. Now branded posts go out daily — automatically. They spend zero time on it." This IS the future of marketing for small business.',
    hashtags: '#SocialMediaAutomation #AIContent #NewUrbanInfluence #DetroitBusiness #ContentMarketing #AIMarketing #AutoPost #SmallBusiness #DetroitEntrepreneur #MarketingAutomation'
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
