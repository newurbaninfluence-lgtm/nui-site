// netlify/functions/agent-promoter.v2.backup.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
var CONTENT_PILLARS = [
  {
    id: "digital_hq",
    angle: "Digital HQ \u2014 NUI builds the full business command center. Not a website. A system. Lead capture, AI staff, CRM, booking, territory SEO \u2014 all connected. Detroit businesses that run on a Digital HQ stop losing leads after hours and start looking like $10M companies.",
    hashtags: "#DigitalHQ #NewUrbanInfluence #DetroitBusiness #AIAutomation #BusinessInfrastructure #Detroit #313 #SmallBusiness #DetroitTech #DigitalHeadquarters"
  },
  {
    id: "digital_staff",
    angle: "Digital Staff \u2014 AI positions that run your front desk 24/7. The Digital Secretary answers every call. The Lead Catcher responds to every inquiry in under 5 minutes. The Ghostwriter sends personalized emails from your CRM. The Money Reporter drops a plain-English business summary every week. $397/mo for the full team. Less than one day of part-time payroll.",
    hashtags: "#DigitalStaff #AIReceptionist #NewUrbanInfluence #DetroitBusiness #NeverMissACall #AIAutomation #313 #BusinessAutomation #DetroitTech #SmallBusiness"
  },
  {
    id: "digital_promotion_team",
    angle: "Digital Promotion Team \u2014 geo-fencing, Google Maps domination, social content, visitor ID, retargeting. The Block Captain draws a virtual fence around competitor locations. Anyone who walks in sees your ad for 30 days. The Neighborhood Captain ranks your business in every zip code you serve. The Watchman identifies 15-30% of anonymous website visitors by name and email without a form.",
    hashtags: "#DigitalPromotionTeam #GeoFencing #NewUrbanInfluence #DetroitMarketing #CompetitorTargeting #LocalMarketing #313 #DetroitHustle #GoogleMaps #AIMarketing"
  },
  {
    id: "blueprint",
    angle: "The Blueprint \u2014 brand identity built from strategy. Logo, colors, fonts, social templates, guidelines, source files. Built after a discovery session that maps your audience, competitors, and positioning. Three tiers: Brand Kit $1,500 / Service Business $4,500 / Product Business $5,500. Payment plans on everything. The brand that looks like a real business closes deals the Canva logo never could.",
    hashtags: "#TheBlueprint #BrandIdentity #NewUrbanInfluence #DetroitBusiness #LogoDesign #BrandStrategy #DetroitDesign #313 #SmallBusiness #DetroitEntrepreneur"
  },
  {
    id: "publicist",
    angle: "The Publicist \u2014 NUI Magazine press feature. A professionally written editorial profile, published permanently, indexed by Google. When a high-ticket client searches your name before calling, they find third-party proof. Not your own words \u2014 a publication backing you up. Feature $1,500 / Bundle $3,500 with photography and brand reel.",
    hashtags: "#ThePublicist #NUIDetroit #NUImagazine #NewUrbanInfluence #DetroitBusiness #Credibility #PressFeature #DetroitCreatives #BrandCredibility #313"
  },
  {
    id: "event_team",
    angle: "The Event Team \u2014 day-rate lead capture for vendor shows, pop-ups, and events. A branded camera takes professional photos of every visitor. Photo only delivers after they enter their phone and email and accept push notification permission. They get the photo. You get a verified, opted-in contact in your database. Every person who stops at your table leaves as a lead. All Things Detroit, Eastern Market, any event.",
    hashtags: "#EventTeam #NewUrbanInfluence #AllThingsDetroit #EasternMarket #DetroitVendors #LeadCapture #313 #DetroitBusiness #PopUp #DetroitHustle"
  },
  {
    id: "client_win",
    angle: "Real result from a Detroit business we work with \u2014 keep the client anonymous. Structure: PROBLEM (what was going wrong), SOLUTION (which NUI service was deployed), RESULT (specific measurable outcome in 30-90 days). Make it feel real, specific, and Detroit. End with a direct CTA.",
    hashtags: "#ClientResults #NewUrbanInfluence #DetroitBusiness #DigitalHQ #AIAutomation #BeforeAfter #BusinessGrowth #Detroit #313 #DigitalPromotionTeam"
  },
  {
    id: "truth_bomb",
    angle: "Drop a bold, uncomfortable truth about why Detroit small businesses stay stuck. No pitching \u2014 just a real observation about branding, visibility, AI, or operations that makes a business owner stop scrolling and think. End with one direct question to the audience.",
    hashtags: "#RealTalk #NewUrbanInfluence #DetroitBusiness #SmallBusinessTruth #313 #DetroitEntrepreneur #BusinessGrowth #Detroit #BrandStrategy #AIAutomation"
  }
];
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_KEY;
var CLAUDE = process.env.ANTHROPIC_API_KEY;
var FB_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
var FB_PAGE = process.env.FB_PAGE_ID;
var IG_ID = process.env.IG_USER_ID;
var GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
var GMB_LOCATION_ID = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;
var PEXELS_KEY = process.env.PEXELS_API_KEY;
var sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation", ...opts.headers || {} }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};
async function getNextPillar() {
  try {
    const rows = await sbFetch("agent_logs?agent_id=eq.promoter&order=created_at.desc&limit=8");
    const used = (rows || []).map((r) => r.metadata?.pillar_id).filter(Boolean);
    return CONTENT_PILLARS.find((p) => !used.includes(p.id)) || CONTENT_PILLARS[0];
  } catch {
    return CONTENT_PILLARS[Math.floor(Math.random() * CONTENT_PILLARS.length)];
  }
}
async function generatePost(pillar) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Detroit" });
  const prompt = `You are writing a social media post for New Urban Influence (NUI) \u2014 a Detroit branding and AI automation agency founded by Faren Young. You are Faren's voice.

BRAND VOICE: "Talk like the block, move like the boardroom." Bold, direct, no fluff, slightly aggressive truth. Detroit-proud. Never corporate. Never generic. Never use phrases like "In today's digital landscape" or "leverage synergies."

TODAY: ${today}

CONTENT BRIEF: ${pillar.angle}

WRITE A HIGH-PERFORMING INSTAGRAM/FACEBOOK POST following this EXACT structure:

LINE 1: THE HOOK \u2014 A single punchy statement that stops the scroll. Make a bold claim, drop an uncomfortable truth, or open a loop. Max 12 words. Can use 1 emoji strategically. NO questions. NO "Did you know."

[blank line]

LINES 2-4: THE DEPTH \u2014 2-3 sentences that expand the hook with specifics. Name Detroit neighborhoods, industries, or real scenarios. Be concrete \u2014 dollar amounts, time saved, specific problems. Sound like you've seen this a hundred times.

[blank line]

LINE 5: THE CTA \u2014 One direct action. Examples: "DM us BUILD to get started." / "Book your free call \u2014 link in bio." / "Drop your city below if you need this." Keep it short and human.

[blank line]

LINE 6: SIGNATURE \u2014 Always end exactly with: \u{1F534} New Urban Influence | Detroit

RULES:
\u2014 Total 3 emojis maximum across the entire post
\u2014 Do NOT include hashtags (added separately)
\u2014 Sound like a real Detroit business owner talking to other business owners
\u2014 Specific beats vague every time
\u2014 Under 280 words total

Return ONLY the post text. No labels, no quotes, no explanation.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": CLAUDE, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await r.json();
  return d.content?.[0]?.text?.trim() || "";
}
async function getPexelsImage(pillar) {
  if (!PEXELS_KEY) return null;
  const queries = {
    digital_hq: "modern office digital workspace detroit entrepreneur",
    digital_staff: "AI technology phone business automation",
    digital_promotion_team: "city marketing billboard detroit urban",
    blueprint: "brand identity logo design creative agency",
    publicist: "press feature magazine editorial detroit",
    event_team: "vendor market detroit event crowd",
    client_win: "business success growth detroit entrepreneur",
    truth_bomb: "detroit skyline urban entrepreneur hustle"
  };
  const q = encodeURIComponent(queries[pillar.id] || "detroit business branding");
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=15&orientation=square`, {
      headers: { "Authorization": PEXELS_KEY }
    });
    const d = await r.json();
    const photos = d.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
    const rawUrl = pick.src?.large2x || pick.src?.large || null;
    if (!rawUrl) return null;
    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    if (CLOUDINARY_CLOUD) {
      const encodedUrl = encodeURIComponent(rawUrl);
      const t = ["w_1080,h_1080,c_fill,g_center", "e_brightness:-25", "l_nui-logo,w_160,g_south_west,x_30,y_64", "l_text:Arial_36_bold:NEW%20URBAN%20INFLUENCE,co_white,g_south_west,x_210,y_90", "l_text:Arial_22:newurbaninfluence.com,co_rgb:D90429,g_south_west,x_210,y_52", "l_text:Arial_24_bold:Detroit%20%7C%20313,co_white,g_south_east,x_30,y_60", "q_auto,f_jpg"].join("/");
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${t}/${encodedUrl}`;
    }
    return rawUrl;
  } catch (e) {
    console.warn("Pexels failed:", e.message);
    return null;
  }
}
async function postFacebook(caption, imageUrl) {
  if (!FB_TOKEN || !FB_PAGE) return { skipped: true, reason: "no credentials" };
  const body = { message: caption, access_token: FB_TOKEN };
  const endpoint = imageUrl ? "photos" : "feed";
  if (imageUrl) body.url = imageUrl;
  const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.id, error: d.error?.message };
}
async function postInstagram(caption, imageUrl) {
  if (!FB_TOKEN || !IG_ID || !imageUrl) return { skipped: true, reason: imageUrl ? "no credentials" : "no image" };
  const c = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: FB_TOKEN })
  });
  const cd = await c.json();
  if (!c.ok || !cd.id) return { success: false, error: cd.error?.message || "container failed" };
  const p = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: cd.id, access_token: FB_TOKEN })
  });
  const pd = await p.json();
  return { success: p.ok, post_id: pd.id, error: pd.error?.message };
}
async function postGBP(caption) {
  if (!GMB_TOKEN || !GMB_LOCATION_ID) return { skipped: true, reason: "no GBP credentials" };
  const r = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOCATION_ID}/localPosts`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${GMB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ languageCode: "en-US", summary: caption.slice(0, 1500), callToAction: { actionType: "CALL", url: "https://newurbaninfluence.com/contact" }, topicType: "STANDARD", state: "LIVE" })
  });
  const d = await r.json();
  return { success: r.ok, post_id: d.name, error: d.error?.message };
}
async function alreadyRanToday() {
  try {
    const todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rows = await sbFetch(`agent_logs?agent_id=eq.promoter&status=eq.success&created_at=gte.${todayStart.toISOString()}&select=id`);
    return (rows || []).length > 0;
  } catch {
    return false;
  }
}
async function logRun(data) {
  try {
    await sbFetch("agent_logs", { method: "POST", body: JSON.stringify({ agent_id: "promoter", status: data.success ? "success" : "partial", metadata: data, created_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  } catch (e) {
    console.error("Log failed:", e.message);
  }
}
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  const isManual = event.httpMethod === "POST";
  if (!isManual && await alreadyRanToday()) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, skipped: "already_ran_today" }) };
  }
  const body = isManual ? JSON.parse(event.body || "{}") : {};
  const forcePillar = body.pillar_id ? CONTENT_PILLARS.find((p) => p.id === body.pillar_id) : null;
  try {
    const pillar = forcePillar || await getNextPillar();
    const rawCopy = await generatePost(pillar);
    if (!rawCopy) throw new Error("Sonnet returned empty content");
    const caption = `${rawCopy}

${pillar.hashtags}`;
    const imageUrl = await getPexelsImage(pillar);
    const [fbResult, igResult, gbpResult] = await Promise.all([
      postFacebook(caption, imageUrl),
      postInstagram(caption, imageUrl),
      postGBP(rawCopy)
    ]);
    const result = { success: true, pillar_id: pillar.id, caption_preview: rawCopy.slice(0, 100) + "...", image_url: imageUrl, facebook: fbResult, instagram: igResult, google_business: gbpResult, posted_at: (/* @__PURE__ */ new Date()).toISOString() };
    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    const errResult = { success: false, error: err.message, agent: "promoter" };
    await logRun(errResult).catch(() => {
    });
    return { statusCode: 500, headers: CORS, body: JSON.stringify(errResult) };
  }
};
//# sourceMappingURL=agent-promoter.v2.backup.js.map
