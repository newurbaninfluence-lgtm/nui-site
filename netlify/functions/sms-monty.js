// sms-monty.js — NUI AI SMS Intelligence Layer v2
// Features: Intent Scoring · Sentiment Detection · BANT Extraction
//           Hot Lead Alerts · Calendly Trigger · CRM Auto-Update
// Env vars: ANTHROPIC_API_KEY, OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER,
//           SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_EMAIL, CALENDLY_URL

const { getBrand, buildSmsSystemPrompt } = require('./utils/agency-brand');
const { requireAdmin } = require('./utils/security');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const CALENDLY_URL = process.env.CALENDLY_URL || 'https://calendly.com/newurbaninfluence';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  || 'newurbaninfluence@gmail.com';

// ── Internal team numbers — recognized contacts, no sales mode ──
const INTERNAL_TEAM = {
  [process.env.IRISH_PHONE || '+12485551234']: { name: 'Irish', role: 'wife', greeting: 'Oh hey Irish 👋' },
  [process.env.FAREN_PHONE || '+12485550000']: { name: 'Faren', role: 'founder', greeting: 'Hey boss 🤙' },
};

const SMS_SYSTEM_PROMPT = `You are Monty, the AI representative for New Urban Influence (NUI) — a Detroit-based agency that builds Digital Headquarters, AI automation systems, and brand infrastructure for businesses. You are the first conversation. You qualify leads, book calls, and set up Faren to close.

SELLING PHILOSOPHY — NEPQ (Neuro-Emotional Persuasion Questioning)
You are a problem finder — NOT a pusher. Help prospects DISCOVER their own problem. Be curious, calm, detached from the outcome. One question per message. Always pause. Always wait for their reply. Never pitch before Stage 3.

═══════════════════════════════════════════
INDUSTRY ROUTING — Detect early, shape questions around their world
═══════════════════════════════════════════

TIER 1 — ATTACK NOW (high pain, fast close):
• Restaurants/Dining — Pain: invisible online, can't compete with chains. Hook: "People search before they walk in. Are you showing up?"
• Bars/Nightlife — Pain: platform ad restrictions, relying on flyers. Hook: "Facebook blocked your ads? There's a way around that."
• HVAC — Pain: dominated by larger companies on Google Maps. Hook: "Are you showing up in every zip code you service?"
• Roofing — Pain: trust issue, hard to stand out. Hook: "Homeowners about to spend $15K are Googling you right now. What do they find?"
• Flooring — Pain: search visibility, no follow-up system. Hook: "Most floor inquiries go to whoever follows up first. Are you doing that automatically?"
• Lawn Care — Pain: seasonal, relies on referrals. Hook: "How are you staying in front of last year's customers?"

TIER 2 — STRONG CLOSE:
• Photography Studios — Pain: booked by referral, not discovery. Hook: "When someone searches for a photographer in your city, do you come up?"
• Insurance Agents — Pain: generic, competitive. Hook: "What makes someone choose you over the big name agents?"
• Medical/Private Practice — Pain: trust, local search. Hook: "Are patients finding you when they search your specialty near them?"
• Cannabis Dispensaries — Pain: can't run Facebook/Google ads. Hook: "No ads allowed — how are you getting found?"
• Street Clothing/Fashion — Pain: social content, brand identity. Hook: "What's your biggest channel right now — Instagram, in-person, something else?"
• Authors/Speakers — Pain: credibility, discoverability. Hook: "When someone Googles your name, what's the first thing they find?"

TIER 3 — NUI HOME COURT:
• Bakeries/Food Makers — Pain: ATD vendor or storefront, needs online presence.
• Creative Makers — Pain: beautiful product, invisible brand.
• Art Galleries — Pain: event attendance, no digital system.
• Salons/Barbershops — Pain: walk-ins vs. consistent booking.
• All Things Detroit Vendors — Pain: foot traffic but no follow-up system. NUI built ATD's brand — use that. "You know All Things Detroit? We built their brand. That's actually why we built something specific for ATD vendors."

WHEN INDUSTRY IS DETECTED — customize Stage 2 situational question to their world. Never ask generic "how do you get clients." Ask the version specific to their business type.

═══════════════════════════════════════════
CONVERSATION STAGES
═══════════════════════════════════════════

STAGE 1 — CONNECTION (first message / cold):
"Hey [name if known], this is Monty with New Urban Influence — Detroit's business infrastructure agency. Not sure if what we do is even a match for you. Mind if I ask one quick question?"
→ STOP. Wait for reply. Do NOT pitch. Do NOT mention services.

STAGE 2 — ENGAGEMENT (after permission):
Use industry-specific situational question from routing above.
Generic fallback: "How are you currently getting most of your new clients — referrals, social, or something else?"

STAGE 3 — PROBLEM AWARENESS:
ONE follow-up: "How long has that been going on?" / "What have you tried to fix that?" / "What do you think was missing?"

STAGE 4 — SOLUTION AWARENESS:
HQ QUALIFICATION FIRST: Before recommending staff or services, identify which HQ level they need.
Ask: "Do you currently have a website for your business?"
→ NO: They need The Blueprint + Digital HQ first. Start there.
→ YES — basic: They may qualify for HQ Lite ($3,500 — unlocks Digital Staff basics)
→ YES — established: They may qualify for HQ Standard ($5,500) or HQ Command ($8,500+)

RULE: Digital Staff positions require a Digital HQ. You CANNOT recommend The Digital Secretary, Lead Catcher, or Digital Promoter without first qualifying their HQ level. The HQ is the storefront. Staff works from the storefront.

SOLUTION FRAMING by pain:
- No leads from website → "We'd build you a Digital HQ — not just a website, but a system that captures leads and follows up automatically while you're working."
- Doing everything manually → "Digital Staff — AI that handles follow-ups, bookings, and messages 24/7 while you run the business."
- Invisible online → "We put your flag in every zip code — Google Maps, AI search, and local discovery at the same time."
- Relying on referrals → "We build a system that brings consistent inbound — so referrals become a bonus, not your only source."
- Need brand credibility → "We start with The Brand Architect — logo, colors, voice, and brand system — then build from there. Three tiers: Brand Kit $1,500, Service Brand $4,500, Product Brand $5,500."
- ATD/market vendor → "We actually built the All Things Detroit brand. We have The Event Team — we show up at your booth, capture photos, and collect verified leads with their phone number and push opt-in in 60 seconds."
- Want press/credibility → "The Publicist — we write and publish your feature in NUI Magazine. That link closes deals before you even get on a call. Starts at $1,500."
- Event/vendor show → "The Event Team — day-rate staff for your booth. Photographer, digital sign-in, instant SMS delivery with your store link, and push notification opt-in gate. Every person who stops leaves as a verified lead. $497 half-day."
- Invisible on social → "The Digital Promotion Team — AI creates your content, sends digital flyers and text blasts to opted-in phones, geofences competitor locations, and dominates Google Maps zip by zip."
- Platform blocking ads → "The Block Captain — geofencing runs outside Facebook and Google's ad platforms entirely. No content restrictions. We plant your brand on every phone in a competitor's parking lot."

STAGE 5 — COMMITMENT:
"I could set up a free 15-min call — no pitch, just a real conversation. If it makes sense we'll talk further, if not no hard feelings. Worth 15 minutes?"
→ YES: drop Calendly link → 📅 Book here: ${CALENDLY_URL}
→ HESITANT: "What's the main thing making you unsure? Maybe I can clear that up right here."
→ NO: "Totally get it. If anything changes you know where to find us."

═══════════════════════════════════════════
SERVICES & PRICING (only at Stage 4+)
═══════════════════════════════════════════

BRAND ARCHITECT (Brand Identity — replaces "The Blueprint")
Brand Kit $1,500 / Service Brand Identity $4,500+ / Product Brand Identity $5,500+
For: New launches, rebrands, product companies, service businesses. No HQ required.
Brand Kit = logo, colors, voice, social templates. Service Brand = + print, signage, uniforms, website, digital assets. Product Brand = + packaging, labels, in-store displays, apparel.

DIGITAL HQ (Website + Business System)
HQ Lite $3,500 / HQ Standard $5,500 / HQ Command $8,500+
Unlocks: HQ Lite → Digital Secretary + basic Content Crew / HQ Standard → Lead Catcher + Digital Promoter + Ghostwriter + Money Reporter / HQ Command → Block Captain + Neighborhood Captain + all positions

DIGITAL STAFF (AI Team — HQ Required):
The Digital Secretary $197/mo — 24/7 AI phone rep, answers calls, books appointments, learns your voice (HQ Lite+)
Full Digital Staff $397/mo — Secretary + Lead Catcher, sub-5-min follow-up on all channels (HQ Standard+)
The Ghostwriter — AI email that reads your CRM, knows who the customer is, writes in your brand voice (HQ Standard+, add-on)
The Money Reporter — plain-English weekly business report, no dashboards (HQ Standard+, add-on)
The Project Manager — hardwires your entire operation in code, one-time fee, no Zapier (one-time build, call for pricing)
The Street Announcer — SMS + push notifications to owned list (HQ Standard+, add-on)

DIGITAL STREET TEAM (Content + Promotion + Visibility):
Content Crew — Posted Up $497/mo / Loaded $1,497/mo / Heavy $2,997/mo
Digital Promoter — SMS + push + retargeting to owned audience (HQ Standard+, add-on)
The Block Captain — Geofencing, no platform restrictions, competitor locations, stadiums (HQ Command+, call for pricing)
The Neighborhood Captain — Google Maps domination zip by zip (HQ Command+, call for pricing)
The Watchman — Silent Visitor ID, identifies 15-30% of anonymous website visitors by name/email/LinkedIn (HQ Standard+, $500 setup + $97/mo)
The Facebook Runner — Meta Pixel + retargeting + lookalike audiences ($500 setup + $199/mo)
The Google Runner — Google display network + YouTube retargeting across 2M+ sites ($500 setup + $199/mo)

THE PUBLICIST (NUI Magazine Feature):
Feature $1,500 / Bundle $3,500 (includes professional photography)
For: Any business where trust drives the sale — roofing, legal, medical, coaching, photography, cannabis, authors.

THE EVENT TEAM (Day-rate, vendor shows + pop-ups):
Half Day $497 / Full Day $897 / Weekend $1,497
How it works: Photographer + digital sign-in + SMS photo delivery with store link + push opt-in gate. 60-second turnaround. Built for All Things Detroit, Eastern Market, trade shows.

PRINT & PACKAGING — from $150
FINANCING: Afterpay + Klarna at checkout. From $89/mo. 0% interest.

═══════════════════════════════════════════
MODES & POLICIES
═══════════════════════════════════════════

WRONG NUMBER / PERSONAL CONTACT MODE: If someone is trying to reach a family member or personal contact — brother, son, grandson, uncle, cousin, dad, mom, sister, nephew, or any personal relationship — respond warmly and redirect:
"No problem, I'll let him know you're looking for him. Text his cell directly — this is his business line."
(Use "her" or "them" if the person they're looking for is female or unknown.)
Do NOT ask who they are. Do NOT try to sell anything. Just be warm, redirect, and end the conversation.

ACTIVE CLIENT MODE: Existing paying client → relationship mode only. Warm, helpful. No sales unless they bring it up. Escalate complex issues.

SUPPORT MODE: Complaint → empathy first. "I hear you. That shouldn't be happening — can you give me a quick description?" Never defend. Escalate.

AFFORDABILITY OBJECTION:
"Is it more of a timing thing or is the investment itself what's giving you pause?"
IF TIMING: "We have Afterpay and Klarna at checkout — you can split it right at payment. Zero extra steps. Packages from $89/mo."
IF VALUE: "What would need to be true for this to feel like a worthwhile investment?"

POLICIES (cite firmly, never waive):
- All sales final. No refunds on completed, approved, or in-progress work.
- Deposits non-refundable. Full payment before delivery.
- Revisions: 2 rounds included, $75/hr after.
- Disputes: hello@newurbaninfluence.com

TONE: 1-3 sentences max. SMS only. Direct. Confident. Sound like a sharp professional from Detroit — not corporate, not sloppy. Clean English always. No broken phrases, no awkward constructions. Real and human, but grammatically tight. Never sound like a bot or a pitch deck. Read your reply out loud before sending — if it sounds off, rewrite it.`;

// ── Intelligence Analysis (runs in parallel with reply generation) ────────────
async function analyzeIntelligence(message, history, clientContext, apiKey) {
  const prompt = `You are an AI sales intelligence engine for a branding agency. Analyze this SMS conversation and return ONLY valid JSON, no markdown, no explanation.

INCOMING MESSAGE: "${message}"

CONVERSATION HISTORY:
${history || '(No prior history)'}

CLIENT CONTEXT:
${clientContext}

Return this exact JSON structure:
{
  "intent_score": <integer 1-10, where 1=no interest, 5=curious/exploring, 8=ready to buy, 10=urgent hot lead>,
  "sentiment": "<one of: excited | warm | neutral | hesitant | frustrated>",
  "calendly_ready": <true ONLY if Monty has already offered a call/meeting in the conversation history AND the prospect is responding YES or confirming they want to book — NOT just because they mentioned wanting to meet on their opening message. First contact "I want to set up a time" = false. Confirmed yes after Monty's offer = true>,
  "is_hot": <true if intent_score >= 7>,
  "bant": {
    "budget": "<what they said about budget/price/cost, or null>",
    "authority": "<are they the decision maker? what they said, or null>",
    "need": "<what service/problem they need help with, or null>",
    "timeline": "<when do they need it? urgency, or null>"
  },
  "followup_needed": <true if they went cold or didn't commit, false if they booked or replied with clear next step>,
  "tags": ["<1-3 short tags like: logo, urgent, price-sensitive, new-business, existing-client>"]
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || '{}';
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.warn('[Monty] Intelligence analysis failed:', e.message);
    return { intent_score: 5, sentiment: 'neutral', calendly_ready: false, is_hot: false, bant: {}, followup_needed: false, tags: [] };
  }
}

// ── Hot Lead Alert (email to Faren when score hits 7+) ───────────────────────
async function sendHotLeadAlert(contact, message, score, sentiment, bant, supabaseUrl, supabaseKey) {
  try {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.phone;
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;">
<div style="background:#dc2626;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
<h2 style="margin:0;">🔥 Hot Lead Alert — Score ${score}/10</h2>
</div>
<div style="background:#1a1a1a;color:#fff;padding:20px;">
<p><strong>Contact:</strong> ${name} · ${contact.phone}</p>
<p><strong>Sentiment:</strong> ${sentiment}</p>
<p><strong>Their message:</strong> "${message}"</p>
<hr style="border-color:#333;"/>
<p><strong>BANT Intelligence:</strong></p>
<ul>
<li>Budget: ${bant?.budget || 'Not mentioned'}</li>
<li>Authority: ${bant?.authority || 'Unknown'}</li>
<li>Need: ${bant?.need || 'Not specified'}</li>
<li>Timeline: ${bant?.timeline || 'Not mentioned'}</li>
</ul>
<p><a href="https://newurbaninfluence.com/app/#contacthub" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">View in Contact Hub →</a></p>
</div></div>`;

    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: ADMIN_EMAIL, subject: `🔥 Hot Lead: ${name} (Score ${score}/10)`, html })
    }).catch(() => {});

    // Also try the Netlify send-email function
    await fetch('https://newurbaninfluence.com/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: ADMIN_EMAIL, subject: `🔥 Hot Lead: ${name} (Score ${score}/10)`, html, text: `Hot lead from ${name}. Score: ${score}/10. Message: "${message}"` })
    }).catch(() => {});
  } catch (e) {
    console.warn('[Monty] Hot lead alert failed:', e.message);
  }
}

// ── Phone helpers ─────────────────────────────────────────────────────────────
function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return raw;
}

function extractNameFromText(text) {
  if (!text) return null;
  const patterns = [
    /(?:this is|i'm|i am|my name is|name'?s|it's|its|hey,? it's)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+(?:here|calling|texting)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && !/monty|sona|nui|urban/i.test(m[1])) return m[1].trim();
  }
  return null;
}

// ── Save intelligence to CRM contact ─────────────────────────────────────────
async function saveIntelligence(contactId, intel, supabaseUrl, supabaseKey) {
  if (!contactId) return;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
  const updates = {
    lead_score: intel.intent_score,
    sentiment: intel.sentiment,
    last_activity_at: new Date().toISOString(),
  };
  if (intel.bant?.budget)    updates.bant_budget    = intel.bant.budget;
  if (intel.bant?.authority) updates.bant_authority = intel.bant.authority;
  if (intel.bant?.need)      updates.bant_need      = intel.bant.need;
  if (intel.bant?.timeline)  updates.bant_timeline  = intel.bant.timeline;
  if (intel.tags?.length)    updates.interest_tags  = intel.tags;
  if (intel.intent_score >= 7) updates.status = 'qualified';

  await fetch(`${supabaseUrl}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH', headers, body: JSON.stringify(updates)
  }).catch(e => console.warn('[Monty] Save intelligence failed:', e.message));
}

// ── Main Handler ──────────────────────────────────────────────────────────────
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const ANTHROPIC_API_KEY  = process.env.ANTHROPIC_API_KEY;
  const OPENPHONE_API_KEY  = process.env.OPENPHONE_API_KEY;
  const FROM_NUMBER_ID     = process.env.OPENPHONE_PHONE_NUMBER;
  const SUPABASE_URL       = process.env.SUPABASE_URL;
  const SUPABASE_KEY       = process.env.SUPABASE_SERVICE_KEY;

  let agencyId = null;
  try { const b = JSON.parse(event.body || '{}'); agencyId = b.agency_id || null; } catch(e){}
  const brand = await getBrand(agencyId);
  const AGENCY_SYSTEM_PROMPT = buildSmsSystemPrompt(brand) || SMS_SYSTEM_PROMPT;

  try {
    const payload = JSON.parse(event.body || '{}');

    // ── Gate #1: Only process inbound SMS events — ignore message.sent, call events, etc ──
    const eventType = payload.type || payload.event || '';
    if (eventType && eventType !== 'message.received') {
      console.log(`[Monty] Ignored event type: ${eventType}`);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: true, reason: 'non_inbound_event', type: eventType }) };
    }

    const incomingMessage = payload.data?.object?.text || payload.data?.object?.body || payload.content || payload.message || payload.text;
    const fromNumber = payload.data?.object?.from || payload.from || payload.sender;
    const messageId   = payload.data?.object?.id || null;

    // ── Gate #2: Direction must be incoming — belt-and-suspenders after event type check ──
    const directionEarly = payload.data?.object?.direction || payload.direction || '';
    if (directionEarly && directionEarly !== 'incoming') {
      console.log(`[Monty] Ignored direction: ${directionEarly}`);
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: true, reason: 'outbound_direction' }) };
    }

    // ── Deduplication — OpenPhone retries webhooks on slow responses ──────────
    // If we've already logged this exact messageId, return 200 immediately.
    // This stops duplicate Monty replies when Anthropic takes > OpenPhone timeout.
    if (messageId && SUPABASE_URL && SUPABASE_KEY) {
      const dedupRes = await fetch(
        `${SUPABASE_URL}/rest/v1/communications?metadata->>quo_message_id=eq.${messageId}&limit=1&select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const existing = await dedupRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`[Monty] Duplicate webhook for message ${messageId} — skipping`);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: true, reason: 'duplicate' }) };
      }
    }

    // ── Block automated/system messages — never let Monty reply to bots ──────
    const AUTOMATED_PATTERNS = [
      /stripe/i,
      /paypal/i,
      /reply\s+stop\s+to\s+cancel/i,
      /msg\s*&\s*data\s+rates/i,
      /msg\s+frequency\s+varies/i,
      /do\s+not\s+reply/i,
      /no[\s-]?reply/i,
      /verification\s+code/i,
      /your\s+(otp|code)\s+is/i,
      /this\s+is\s+an?\s+automated/i,
      /twilio/i,
      /openphone/i,
    ];
    if (incomingMessage && AUTOMATED_PATTERNS.some(p => p.test(incomingMessage))) {
      console.log('[Monty] Blocked automated message:', (incomingMessage || '').slice(0, 80));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: true, reason: 'automated_blocked' }) };
    }

    const direction  = payload.data?.object?.direction || payload.direction || 'incoming';

    // Outbound team message — log it and exit so Monty sees it in history
    if (direction === 'outgoing' || direction === 'outbound') {
      if (SUPABASE_URL && SUPABASE_KEY && incomingMessage && fromNumber) {
        const toNumber = payload.data?.object?.to || payload.to || fromNumber;
        await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ channel: 'sms', direction: 'outbound', message: incomingMessage, metadata: { to: toNumber, handler: 'team_manual' }, created_at: new Date().toISOString() })
        }).catch(() => {});
      }
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ logged: 'team_outbound' }) };
    }

    if (!incomingMessage || !fromNumber) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing message or sender' }) };
    }
    if (!ANTHROPIC_API_KEY) return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'API key not configured' }) };

    console.log(`📱 SMS from ${fromNumber}: "${incomingMessage}"`);
    const cleanPhone = normalizePhone(fromNumber);
    const extractedName = extractNameFromText(incomingMessage);

    // ── Step 1: Look up / create contact ──────────────────────────────────────
    let contact = null;
    let contactId = null;
    let clientContext = 'NEW INQUIRY — Treat as a fresh lead.';
    let conversationHistory = '';

    if (SUPABASE_URL && SUPABASE_KEY) {
      const sbHeaders = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
      const digits = cleanPhone.replace(/\D/g, '').slice(-10);
      const formats = [cleanPhone, `+1${digits}`, digits, `1${digits}`];
      const orFilter = formats.map(f => `phone.eq.${encodeURIComponent(f)}`).join(',');

      const cRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?or=(${orFilter})&select=*&limit=1`, { headers: sbHeaders });
      const contacts = await cRes.json();

      if (contacts?.length > 0) {
        contact = contacts[0];
        contactId = contact.id;

        // If name extracted and contact has none, fill it in
        if (extractedName && !contact.first_name) {
          const parts = extractedName.split(' ');
          await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
            method: 'PATCH',
            headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ first_name: parts[0], last_name: parts.slice(1).join(' ') || null })
          }).catch(() => {});
          contact.first_name = parts[0];
          contact.last_name = parts.slice(1).join(' ') || null;
        }

        const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
        const bizTypeLabel = contact.business_type ? contact.business_type + ' business' : null;
        const categoryLabel = contact.business_category || null;
        const funnelStage = contact.funnel_stage || contact.status || 'new';
        const painList = Array.isArray(contact.pain_points) && contact.pain_points.length
          ? contact.pain_points.join(', ') : null;
        const lastTouch = contact.last_touch_summary || null;
        const lastTouchTime = contact.last_touch_at
          ? `${Math.floor((Date.now() - new Date(contact.last_touch_at).getTime()) / 86400000)} days ago`
          : null;

        clientContext = `CONTACT: ${name}${contact.company ? ' — ' + contact.company : ''}
${categoryLabel ? '📂 Category: ' + categoryLabel + (bizTypeLabel ? ' (' + bizTypeLabel + ')' : '') : ''}
📍 Funnel Stage: ${funnelStage}
📧 Email: ${contact.email || 'Not on file'}
📊 Lead Score: ${contact.lead_score || 'Not scored'}/10 · Sentiment: ${contact.sentiment || 'Unknown'}
${painList ? '🎯 LIKELY PAIN POINTS (based on their category): ' + painList : ''}
${contact.bant_need ? '💬 What they want: ' + contact.bant_need : ''}
${contact.bant_budget ? '💰 Budget signal: ' + contact.bant_budget : ''}
${contact.bant_timeline ? '⏰ Timeline signal: ' + contact.bant_timeline : ''}
${lastTouch ? '🕐 Last touch' + (lastTouchTime ? ' (' + lastTouchTime + ')' : '') + ': ' + lastTouch : ''}
${contact.source_campaign ? '📣 Campaign: ' + contact.source_campaign : ''}
${contact.calendly_sent ? '📅 Calendly link: ALREADY SENT — do not send again' : ''}

COACHING:
- If you see pain points above, DON'T list them at the person. Let them surface one organically via your question. Use it as a mental map only.
- If funnel_stage is "cold" or "warm_lead", keep curiosity high and stay out of pitch mode.
- If funnel_stage is "hot_lead" or "in_convo", it's OK to reference specifics and move toward booking.
- If last_touch was recent (under 3 days), acknowledge the continuity without awkwardly re-introducing yourself.`;

        // Pull their jobs
        const jRes = await fetch(`${SUPABASE_URL}/rest/v1/jobs?client_id=eq.${contactId}&order=created_at.desc&limit=5`, { headers: sbHeaders });
        const jobs = await jRes.json();
        if (jobs?.length > 0) {
          clientContext += '\n\nACTIVE JOBS:';
          jobs.forEach(j => { clientContext += `\n- "${j.title || 'Untitled'}" — Status: ${j.status || 'unknown'}`; });
        }
      } else {
        // Unknown number — auto-create contact
        const nameParts = extractedName ? extractedName.split(' ') : [];
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({ phone: cleanPhone, first_name: nameParts[0] || null, last_name: nameParts.slice(1).join(' ') || null, source: 'quo_text', status: 'new_lead', lead_score: 3, last_activity_at: new Date().toISOString() })
        }).catch(() => null);
        const created = createRes ? await createRes.json() : null;
        if (Array.isArray(created) && created[0]) {
          contact = created[0];
          contactId = contact.id;
          clientContext = `NEW CONTACT AUTO-CREATED: Phone ${cleanPhone}. Name: ${extractedName || 'Not given yet'}. This is their first message — treat as a fresh lead.`;
          console.log(`[Monty] New contact: ${cleanPhone} → ${contactId}`);
        }
      }

      // ── Fetch conversation history ────────────────────────────────────────
      const hRes = await fetch(
        `${SUPABASE_URL}/rest/v1/communications?channel=eq.sms&or=(metadata->>to.eq.${encodeURIComponent(cleanPhone)},metadata->>from.eq.${encodeURIComponent(cleanPhone)})&order=created_at.desc&limit=8`,
        { headers: sbHeaders }
      );
      const history = await hRes.json();
      if (history?.length > 0) {
        conversationHistory = '\n\nRECENT SMS THREAD (chronological — read before replying):';
        history.reverse().forEach(h => {
          const handler = h.metadata?.handler || '';
          let who = h.direction === 'outbound'
            ? (handler === 'team_manual' ? 'NUI Team (human)' : 'Monty (you)')
            : 'Client';
          conversationHistory += `\n${who}: ${h.message || '(no content)'}`;
        });
        conversationHistory += '\n\n[Continue naturally — do NOT repeat what was already said.]';
      }
      clientContext += conversationHistory;
    }

    // ── Check if this is an internal team member ──────────────────────────────
    let teamPhone = fromNumber.replace(/[^\d+]/g, '');
    if (teamPhone.length === 10) teamPhone = '+1' + teamPhone;
    else if (teamPhone.length === 11 && teamPhone.startsWith('1')) teamPhone = '+' + teamPhone;
    const teamMember = INTERNAL_TEAM[teamPhone];

    // ── Check last Monty reply to avoid repeating ─────────────────────────────
    const lastMontyMsg = (conversationHistory || '').split('\n')
      .filter(l => l.startsWith('Monty (you):'))
      .pop() || '';

    // ── Step 2: Run reply generation + intelligence in PARALLEL ──────────────
    let userPrompt;
    if (teamMember) {
      // Internal team member — casual mode, no sales
      userPrompt = `${teamMember.greeting} This is a message from ${teamMember.name} (${teamMember.role} at NUI — internal team, NOT a prospect or client).

Their message: "${incomingMessage}"

Respond casually and helpfully as Monty. Short reply. No sales pitch. No NEPQ. Just be useful and human. If they're testing you or asking about a feature, answer directly.`;
    } else {
      // Regular prospect/client
      userPrompt = `A contact just texted NUI's business phone:\n\n"${incomingMessage}"\n\nPhone: ${fromNumber}\n\n${clientContext}\n\nYour last reply was: "${lastMontyMsg.replace('Monty (you):', '').trim()}"\n\nIMPORTANT: Do NOT repeat or reword your last reply. Continue the conversation naturally from where it left off. Keep it 1-3 sentences. NEPQ style — ask one good question or move them forward. If ready to book, include Calendly link.`;
    }

    const [aiResponse, intelResult] = await Promise.all([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, system: AGENCY_SYSTEM_PROMPT, messages: [{ role: 'user', content: userPrompt }] })
      }),
      analyzeIntelligence(incomingMessage, conversationHistory, clientContext, ANTHROPIC_API_KEY)
    ]);

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('[Monty] AI error:', aiResponse.status, errText);
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'AI service error' }) };
    }
    const aiData = await aiResponse.json();
    let replyText = aiData.content[0]?.text || "Got your message! Let me check and get back to you shortly.";

    // Inject Calendly only if: intelligence confirmed ready AND conversation has history (not first message) AND not already sent
    const hasHistory = conversationHistory && conversationHistory.includes('Monty (you):');
    if (intelResult.calendly_ready && hasHistory && !contact?.calendly_sent && !replyText.includes('calendly')) {
      replyText += `\n\n📅 Book a free 15-min strategy call: ${CALENDLY_URL}`;
    }

    console.log(`🤖 Monty → ${fromNumber}: "${replyText.slice(0,80)}..." | Score:${intelResult.intent_score} | Sentiment:${intelResult.sentiment}`);

    // ── Step 3: Send reply via OpenPhone ────────────────────────────────────
    if (OPENPHONE_API_KEY && FROM_NUMBER_ID) {
      const sendRes = await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Authorization': OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText, to: [fromNumber], from: FROM_NUMBER_ID })
      });
      if (!sendRes.ok) {
        const err = await sendRes.json();
        console.error('[Monty] OpenPhone send error:', err);
      } else {
        console.log('✅ SMS reply sent via OpenPhone');
      }
    }

    // ── Step 4: Save everything to Supabase in parallel ─────────────────────
    const now = new Date().toISOString();
    const sbH = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

    if (SUPABASE_URL && SUPABASE_KEY) {
      const calendaryWasSent = intelResult.calendly_ready && !contact?.calendly_sent;

      await Promise.all([
        // Log inbound message
        fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST', headers: sbH,
          body: JSON.stringify({ channel: 'sms', direction: 'inbound', message: incomingMessage, client_id: contactId, metadata: { from: cleanPhone, handler: 'sms-monty', quo_message_id: messageId }, created_at: now })
        }).catch(() => {}),

        // Log outbound reply
        fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST', headers: sbH,
          body: JSON.stringify({ channel: 'sms', direction: 'outbound', message: replyText, client_id: contactId, metadata: { to: cleanPhone, handler: 'sms-monty', ai_generated: true, intent_score: intelResult.intent_score, sentiment: intelResult.sentiment }, created_at: new Date().toISOString() })
        }).catch(() => {}),

        // Log to activity_log
        contactId ? fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: 'POST', headers: sbH,
          body: JSON.stringify({ contact_id: contactId, type: 'sms', event_type: 'monty_sms_reply', direction: 'both', content: `Client: "${incomingMessage.slice(0,100)}" → Monty: "${replyText.slice(0,100)}"`, metadata: { from: cleanPhone, ai_generated: true, intent_score: intelResult.intent_score, sentiment: intelResult.sentiment }, read: false, created_at: new Date().toISOString() })
        }).catch(() => {}) : Promise.resolve(),

        // Save intelligence to CRM contact
        saveIntelligence(contactId, intelResult, SUPABASE_URL, SUPABASE_KEY),

        // Mark calendly_sent if we sent it
        calendaryWasSent && contactId ? fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
          method: 'PATCH', headers: sbH,
          body: JSON.stringify({ calendly_sent: true, calendly_sent_at: now })
        }).catch(() => {}) : Promise.resolve(),

        // Reset follow-up stage since they replied
        contactId ? fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
          method: 'PATCH', headers: sbH,
          body: JSON.stringify({ followup_stage: 0, last_replied_at: now })
        }).catch(() => {}) : Promise.resolve(),

        // Fire hot lead alert if score >= 7
        intelResult.is_hot && contact ? sendHotLeadAlert(contact, incomingMessage, intelResult.intent_score, intelResult.sentiment, intelResult.bant, SUPABASE_URL, SUPABASE_KEY) : Promise.resolve(),
      ]);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        reply: replyText,
        intelligence: {
          intent_score: intelResult.intent_score,
          sentiment: intelResult.sentiment,
          is_hot: intelResult.is_hot,
          calendly_sent: intelResult.calendly_ready,
          bant: intelResult.bant
        }
      })
    };

  } catch (err) {
    console.error('[Monty] Error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message || 'SMS processing failed' }) };
  }
};
