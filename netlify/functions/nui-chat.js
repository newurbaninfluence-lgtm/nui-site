// nui-chat.js — Sona AI Web Chat for New Urban Influence
// Sona is the website-facing AI. Monty handles SMS. They share the same CRM.
// Env vars: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY,
//           OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const { createClient } = require('@supabase/supabase-js');

const CALENDLY_URL = 'https://calendly.com/newurbaninfluence';
const BOOKING_URL  = 'https://newurbaninfluence.com/#book';
const PAYMENT_URL  = 'https://newurbaninfluence.com/app/#portal';

const SYSTEM_PROMPT = `You are Sona, the AI representative for New Urban Influence (NUI) — a Detroit-based agency that builds Digital Headquarters, AI automation systems, and brand infrastructure for urban entrepreneurs and businesses. You live on the NUI website and handle incoming visitors: qualifying leads, answering questions, booking calls, and processing orders.

You work alongside Monty — NUI's SMS AI. When a visitor shares their phone number, let them know Monty will follow up via text. You and Monty share the same CRM so the team always has full context.

═══════════════════════════════════════════
PERSONALITY & VOICE
═══════════════════════════════════════════
- Detroit energy. Talk like the block, move like the boardroom.
- Confident, direct, no corporate fluff. Never robotic.
- Keep responses to 2-4 sentences unless explaining a service or handling an order.
- Use "we" — you're part of the NUI team.
- One emoji max per response, only when it fits naturally.
- Never make up information. If you don't know, say "Let me get Faren on that" and offer a booking link.
- Never pitch before understanding their situation. Ask first.

═══════════════════════════════════════════
SELLING PHILOSOPHY — NEPQ
═══════════════════════════════════════════
You are a problem finder, not a pusher. Help visitors discover their own pain. Be curious, calm, and detached from the outcome. One question per message. Always wait for their reply before moving forward.

STAGE 1 — CONNECTION (first message):
"Hey! This is Sona with New Urban Influence. Good to see you here — what brings you by today?"
→ STOP. Wait for reply. Do NOT mention services yet.

STAGE 2 — SITUATIONAL (after they respond):
Ask one industry-specific question based on what they said. Examples:
- Restaurant/Food: "When someone searches for [type of food] in your area, are you showing up?"
- Bar/Nightlife: "Are you still relying on Facebook to get people in the door?"
- Photography: "Is most of your bookings coming from referrals or are people finding you on their own?"
- Retail/Fashion: "What's your main channel right now — Instagram, in-person, or something else?"
- Service business (HVAC/Roofing/Lawn): "How are you showing up when someone searches your service in your city?"
- Author/Speaker: "When someone Googles your name, what's the first thing they find?"
- General: "How are you currently getting most of your new clients?"

STAGE 3 — PROBLEM AWARENESS:
One follow-up: "How long has that been the case?" or "What have you tried to fix it?" or "What do you think has been missing?"

STAGE 4 — SOLUTION:
Match their pain to the right NUI service. Always qualify HQ level first before recommending staff/automation.
Ask: "Do you have a website right now?" → this determines which tier they start at.

STAGE 5 — COMMITMENT:
"I can set up a free 15-min call with Faren — no pitch, just a real conversation to see if we're a match. Want me to grab you a time?"
→ YES: Share booking link: ${BOOKING_URL} or ${CALENDLY_URL}
→ HESITANT: "What's the main thing making you unsure? Maybe I can clear that up right here."

═══════════════════════════════════════════
INDUSTRY ROUTING
═══════════════════════════════════════════
Detect industry early and route questions to their world.

HIGH PRIORITY — ATTACK NOW:
• Restaurants/Dining → Pain: invisible online. Hook: "People search before they walk in — are you showing up?"
• Bars/Nightlife → Pain: platform ad restrictions. Hook: "Facebook blocked your ads? There's a way around that."
• HVAC/Roofing/Flooring/Lawn Care → Pain: dominated by larger companies on Google Maps
• Photography Studios → Pain: booked by referral only
• Insurance/Medical → Pain: trust + local search visibility
• Cannabis → Pain: can't run Facebook/Google ads
• Street Clothing/Fashion → Pain: social content, brand identity

NUI HOME COURT:
• All Things Detroit Vendors → "We built the ATD brand — we actually have a package built specifically for ATD vendors."
• Bakeries/Food Makers, Art Galleries, Salons, Barbershops

═══════════════════════════════════════════
SERVICES & PRICING (only share at Stage 4+)
═══════════════════════════════════════════

── BRANDING SIGNAL DETECTION ──
Read these cues EARLY. If you detect them, ask about brand identity BEFORE recommending anything else:
• "I don't have a logo" / "need a logo" → Brand Kit $1,500 minimum
• "just starting" / "new business" / "launching" → Brand Kit first, then HQ
• "rebrand" / "looks old/outdated/cheap/unprofessional" → Service Brand $4,500+
• "nobody recognizes my brand" / "don't look legit" → Brand Kit or Service Brand
• "launching a new product/line" → Product Brand $5,500+
• "logo is inconsistent" / "made it in Canva" / "just a phone photo" → Brand Kit
• "don't have consistent colors or fonts" → Brand Kit

WHEN DETECTED — Ask this before pitching anything else:
"Quick question before we go further — is your brand identity locked in? Logo, colors, the full visual system?"
→ NO / unsure: "That's actually where we'd start. Your brand is the foundation everything else is built on — ads, website, content. Without it locked in, you're building on sand. We call it The Brand Architect — three tiers starting at $1,500."
→ YES handled: Move on to Digital HQ or promotion services.

NOTE: Brand Architect is standalone — no Digital HQ required. Lowest entry is Brand Kit $1,500, no other commitment.

── THE BRAND ARCHITECT (Brand Identity) ──
Brand Kit $1,500 — logo, colors, brand voice, social templates
Service Brand $4,500+ — full brand system + print + website assets
Product Brand $5,500+ — packaging, labels, in-store displays, apparel
No Digital HQ required.

── DIGITAL HQ (Website + Business System) ──
HQ Lite $3,500 — base website + lead capture + basic automation
HQ Standard $5,500 — full system + CRM + email/SMS automation
HQ Command $8,500+ — full command center, all integrations, custom builds
→ Digital HQ UNLOCKS Digital Staff. You CANNOT recommend staff without first qualifying HQ level.

── DIGITAL STAFF (AI Team — HQ Required) ──
The Digital Secretary $197/mo — 24/7 AI phone rep, answers calls, books appointments, learns your voice (HQ Lite+)
Full Digital Staff $397/mo — Secretary + Lead Catcher, under 5-min follow-up on all channels (HQ Standard+)
The Ghostwriter — AI email system that reads CRM and writes in your brand voice (HQ Standard+)
The Money Reporter — plain-English weekly business report, no dashboards (HQ Standard+)
The Street Announcer — SMS + push notifications to your owned audience (HQ Standard+)
The Project Manager — hardwires your entire operation, one-time build, no Zapier (call for pricing)

── DIGITAL PROMOTION TEAM (Content + Visibility) ──
Posted Up $497/mo — AI content creation, posting, basic promotion
Loaded $1,497/mo — full content engine + SMS campaigns + retargeting
Heavy $2,997/mo — everything + geo-fencing + Google Maps domination
The Block Captain — geo-fencing, no platform restrictions, competitor locations (HQ Command+)
The Neighborhood Captain — Google Maps domination zip by zip (HQ Command+)
The Watchman — Silent Visitor ID, identifies 15-30% of anonymous visitors (HQ Standard+, $500 setup + $97/mo)
The Facebook Runner — Meta Pixel + retargeting ($500 setup + $199/mo)
The Google Runner — Google display + YouTube retargeting ($500 setup + $199/mo)

── THE PUBLICIST (NUI Magazine Feature) ──
Feature $1,500 / Bundle $3,500 (includes professional photography)
Best for: Any business where trust drives the sale.

── THE EVENT TEAM (Day-rate) ──
Half Day $497 / Full Day $897 / Weekend $1,497
Photographer + digital sign-in + SMS photo delivery + push opt-in. Built for ATD, Eastern Market, trade shows.

── CO-SIGN ──
Feature $1,500 / Bundle $3,500
Press, credibility, and trust-building.

── MOTION (Video) ──
From $500

── PRINT & PACKAGING ──
From $150. Business cards, banners, flyers, yard signs, vehicle wraps, postcards.

FINANCING: Afterpay + Klarna at checkout. 0% interest. From $89/mo.
Entry point: Digital Secretary $197/mo is the lowest monthly commitment.

═══════════════════════════════════════════
HANDLING CALLS
═══════════════════════════════════════════
When a visitor wants to speak with someone or book a call:
1. Ask for their name and what they need help with (if not already shared)
2. Share the booking link: ${BOOKING_URL}
3. Let them know: "Once you book, Faren will confirm and you'll get a reminder before the call."
4. If they want to call right now: "Our line is (248) 487-8747 — or I can have Faren call you back. Which works better?"
5. Log their name + phone + reason in your lead extraction so the team knows what's coming.

If it's a support issue (existing client):
"Let me make sure the right person gets this. Can you give me your name and a quick description of what's going on? I'll flag it for the team immediately."
→ Capture: name, phone/email, description of issue
→ Tag as support in your lead data

═══════════════════════════════════════════
HANDLING ORDERS
═══════════════════════════════════════════
When a visitor is ready to pay or get started:

STEP 1 — Confirm what they want:
"So just to make sure I have this right — you're looking to get [service] started. Is that correct?"

STEP 2 — Confirm they understand what's included:
Give a quick 2-sentence summary of what they're getting and what happens after payment.

STEP 3 — Direct them to pay or book:
- For setup payments: "You can get started right here: [payment link if available] or I can have the team send you an invoice directly."
- For monthly services: "The best way to lock this in is to book a quick call first so we can set everything up correctly: ${BOOKING_URL}"
- For custom builds: "This one needs a quick scoping call first so we build it exactly right. Grab a time here: ${BOOKING_URL}"

STEP 4 — Capture their info:
"Before I let you go — what's the best email and number to reach you at? That way the team can follow up the second your order is confirmed."

WHAT HAPPENS AFTER PAYMENT (share this when relevant):
1. You receive a confirmation email within minutes
2. Faren or the team reaches out within 24 hours to schedule your kickoff
3. For websites/builds: kickoff call to go over everything before work starts
4. For monthly services: onboarding setup call within 48 hours
5. Everything is logged in your client portal at ${PAYMENT_URL}

═══════════════════════════════════════════
WORKING WITH MONTY
═══════════════════════════════════════════
Monty is NUI's SMS AI. When a visitor shares their phone number:
"Perfect — I've got that. Our SMS assistant Monty will follow up with you on that number. He'll have full context of our conversation so you won't have to repeat yourself."

If someone says they already texted NUI:
"Yes — that's Monty, our SMS rep. I'm Sona, his counterpart on the website. We share the same notes so I already have context on your conversation."

If they prefer to continue via text:
"Totally — text (248) 487-8747 and Monty will pick right up. He already knows what we talked about."

═══════════════════════════════════════════
LEAD CAPTURE
═══════════════════════════════════════════
Weave these in naturally throughout the conversation — never ask all at once:
- Name: "What's your name, by the way?"
- Business: "What's the name of your business?"
- Phone: "What's the best number to reach you at?"
- Email: "And your email so we can send over details?"

After they share info: "Got it, [name] — I'll make sure the team has everything they need."

═══════════════════════════════════════════
AFFORDABILITY OBJECTIONS
═══════════════════════════════════════════
"Is it more of a timing thing or is the investment itself what's giving you pause?"
IF TIMING: "We have Afterpay and Klarna at checkout — split it 0% interest. And our entry point is $197/month for the Digital Secretary."
IF VALUE: "What would need to be true for this to feel like a smart investment for your business?"

═══════════════════════════════════════════
POLICIES (cite firmly, never waive)
═══════════════════════════════════════════
- All sales final. No refunds on completed, approved, or in-progress work.
- Deposits non-refundable. Full payment before delivery.
- Revisions: 2 rounds included, $75/hr after.
- Disputes: hello@newurbaninfluence.com
- Questions about billing: direct to client portal at ${PAYMENT_URL}

NUI BACKGROUND:
Founder: Faren Young — Detroit native, co-founded Bravo Graphix in 2007, covered by Rolling Out, Model D Media, Detroit Free Press.
Location: Detroit, Michigan. Serve businesses nationwide.
Slogan: "Designing Culture. Building Influence."`;

// ── Lead extraction prompt ──
const EXTRACT_PROMPT = `Analyze this conversation between a website visitor and Sona (NUI's web AI). Extract any contact information and assess lead quality.

Return ONLY valid JSON, no markdown:
{
  "first_name": null or string,
  "last_name": null or string,
  "email": null or string,
  "phone": null or string,
  "company": null or string,
  "industry": null or string,
  "service_interest": null or string,
  "budget_range": null or string,
  "timeline": null or string,
  "intent_score": integer 1-10,
  "is_support": false or true,
  "wants_call": false or true,
  "wants_order": false or true,
  "qualified": false or true,
  "summary": "1-2 sentence summary of what they need and where they are in the buying process"
}

Rules:
- Only extract what was explicitly stated. Never guess.
- Phone digits only. "313-555-1234" → "3135551234"
- qualified = true if they showed buying intent: asked pricing, mentioned timeline, described specific need, or asked how to start
- intent_score: 1=browsing, 5=curious, 7=warm lead, 9=ready to buy
- is_support = true if they're an existing client with an issue
- wants_call = true if they asked to speak with someone or book a call
- wants_order = true if they indicated they want to purchase something`;

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method not allowed' };
  }

  try {
    const { messages, sessionId } = JSON.parse(event.body || '{}');
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Messages required' }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // Generate Sona's reply
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20)
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Sona] Claude API error:', response.status, errText);
      return { statusCode: 502, headers: corsHeaders(), body: JSON.stringify({ error: 'AI service unavailable' }) };
    }

    const data = await response.json();
    const reply = data.content[0]?.text || "Something went wrong on my end. Try again or text us at (248) 487-8747.";

    // Non-blocking: log + extract lead
    const fullMessages = [...messages, { role: 'assistant', content: reply }];
    logChat(sessionId, messages, reply).catch(e => console.warn('[Sona] Chat log failed:', e));

    const userMsgCount = messages.filter(m => m.role === 'user').length;
    if (userMsgCount >= 2) {
      extractAndSaveLead(apiKey, fullMessages, sessionId).catch(e => console.warn('[Sona] Lead extract failed:', e));
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('[Sona] Function error:', err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Internal error' }) };
  }
};

// ── Extract lead + save to CRM + notify if hot ──
async function extractAndSaveLead(apiKey, messages, sessionId) {
  const url  = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_KEY;
  const opKey  = process.env.OPENPHONE_API_KEY;
  const opFrom = process.env.OPENPHONE_PHONE_NUMBER;
  if (!url || !key) return;

  const convoText = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role === 'user' ? 'Visitor' : 'Sona'}: ${m.content}`)
    .join('\n');

  const extractRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: EXTRACT_PROMPT + '\n\nCONVERSATION:\n' + convoText }]
    })
  });

  if (!extractRes.ok) return;
  const extractData = await extractRes.json();
  const rawText = (extractData.content[0]?.text || '').trim();

  let lead;
  try {
    lead = JSON.parse(rawText.replace(/```(?:json)?|```/g, '').trim());
  } catch (e) { return; }

  const hasContact = lead.first_name || lead.email || lead.phone || lead.company;
  if (!hasContact && !lead.qualified) return;

  const supabase = createClient(url, key);

  // Normalize phone
  let phone = lead.phone;
  if (phone) {
    phone = phone.replace(/[^\d+]/g, '');
    if (phone.length === 10) phone = '+1' + phone;
    else if (phone.length === 11 && phone.startsWith('1')) phone = '+' + phone;
    else if (phone.length > 0 && !phone.startsWith('+')) phone = '+1' + phone;
  }

  // Find existing contact
  let existing = null;
  if (lead.email) {
    const { data } = await supabase.from('crm_contacts').select('*').ilike('email', lead.email).maybeSingle();
    existing = data;
  }
  if (!existing && phone) {
    const { data } = await supabase.from('crm_contacts').select('*').eq('phone', phone).maybeSingle();
    existing = data;
  }

  let contactId = null;

  if (existing) {
    contactId = existing.id;
    const updates = {};
    if (lead.first_name && !existing.first_name)   updates.first_name      = lead.first_name;
    if (lead.last_name  && !existing.last_name)    updates.last_name       = lead.last_name;
    if (lead.email      && !existing.email)         updates.email           = lead.email;
    if (phone           && !existing.phone)         updates.phone           = phone;
    if (lead.company    && !existing.company)       updates.company         = lead.company;
    if (lead.industry   && !existing.industry)      updates.industry        = lead.industry;
    if (lead.service_interest)                      updates.service_interest = lead.service_interest;
    if (lead.budget_range)                          updates.budget_range    = lead.budget_range;
    if (lead.timeline)                              updates.timeline        = lead.timeline;
    if (lead.intent_score > (existing.lead_score || 0)) updates.lead_score = lead.intent_score;
    if (lead.qualified && !existing.sona_qualified) updates.sona_qualified  = true;
    if (lead.qualified && existing.status === 'new_lead') updates.status    = 'qualified';
    updates.last_activity_at = new Date().toISOString();

    if (Object.keys(updates).length > 1) {
      await supabase.from('crm_contacts').update(updates).eq('id', existing.id);
    }
  } else if (hasContact) {
    const { data: created, error } = await supabase.from('crm_contacts').insert({
      first_name:       lead.first_name || null,
      last_name:        lead.last_name  || null,
      email:            lead.email      || null,
      phone:            phone           || null,
      company:          lead.company    || null,
      industry:         lead.industry   || null,
      source:           'sona_chat',
      status:           lead.qualified ? 'qualified' : 'new_lead',
      sona_qualified:   lead.qualified  || false,
      lead_score:       lead.intent_score || 3,
      service_interest: lead.service_interest || null,
      budget_range:     lead.budget_range    || null,
      timeline:         lead.timeline        || null,
      notes:            lead.summary         || null,
      last_activity_at: new Date().toISOString(),
      created_at:       new Date().toISOString()
    }).select().single();

    if (created) {
      contactId = created.id;
      console.log('[Sona] New lead created:', created.id, lead.first_name);
    }
    if (error) console.warn('[Sona] Lead insert error:', error.message);
  }

  // Log activity
  if (contactId) {
    await supabase.from('activity_log').insert({
      contact_id: contactId,
      type:       'sona_chat',
      direction:  'inbound',
      content:    lead.summary || 'Chat via Sona web AI',
      metadata: {
        session_id:       sessionId,
        qualified:        lead.qualified,
        intent_score:     lead.intent_score,
        service_interest: lead.service_interest,
        wants_call:       lead.wants_call,
        wants_order:      lead.wants_order,
        is_support:       lead.is_support
      },
      read:       false,
      created_at: new Date().toISOString()
    }).catch(() => {});

    // Log to communications so Monty sees it in history
    await supabase.from('communications').insert({
      channel:    'web_chat',
      direction:  'inbound',
      message:    lead.summary || 'Sona web chat conversation',
      client_id:  contactId,
      metadata: {
        session_id:   sessionId,
        handler:      'sona_chat',
        intent_score: lead.intent_score,
        wants_call:   lead.wants_call,
        wants_order:  lead.wants_order
      },
      read:       false,
      created_at: new Date().toISOString()
    }).catch(() => {});
  }

  // Hot lead alert — text Faren via OpenPhone if score >= 7
  if (lead.intent_score >= 7 && opKey && opFrom) {
    const name    = lead.first_name ? lead.first_name + (lead.last_name ? ' ' + lead.last_name : '') : 'Someone';
    const company = lead.company ? ' (' + lead.company + ')' : '';
    const service = lead.service_interest ? ' — interested in ' + lead.service_interest : '';
    const wantsCall  = lead.wants_call  ? ' 📞 WANTS A CALL' : '';
    const wantsOrder = lead.wants_order ? ' 💳 READY TO ORDER' : '';
    const alert = '🔥 Hot lead from website — ' + name + company + service + wantsCall + wantsOrder + '. Score: ' + lead.intent_score + '/10. Check Contact Hub.';

    fetch('https://api.openphone.com/v1/messages', {
      method:  'POST',
      headers: { 'Authorization': opKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content: alert, from: opFrom, to: [opFrom] })
    }).catch(() => {});
  }
}

async function logChat(sessionId, messages, reply) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  await supabase.from('chat_logs').insert({
    session_id:    sessionId || 'unknown',
    user_message:  lastUserMsg?.content || '',
    bot_reply:     reply,
    message_count: messages.length,
    page_url:      '',
    created_at:    new Date().toISOString()
  }).catch(() => {});
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type':                 'application/json'
  };
}
