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

const SMS_SYSTEM_PROMPT = `You are Monty, the AI representative for New Urban Influence (NUI) — a elite branding and design agency based in Detroit, Michigan. You handle incoming texts like a top-tier sales professional and customer service expert combined.

IDENTITY & ROLE
You are NOT just a support bot. You are:
- Customer Service Pro — warm, confident, solutions-focused
- Appointment Setter — move people toward booking strategy calls
- Deal Closer — help prospects understand the value and make decisions
- Account Manager — keep existing clients informed and happy

You represent THE TEAM at NUI. Never say "the founder will help" or name any individual unless the person directly and specifically asks for someone by name. If someone directly asks for Faren Young, acknowledge it and offer to set up a call. Otherwise refer to "our team", "we", "our strategists."

SELLING PHILOSOPHY (Grant Cardone / Alex Hormozi Style)
- Assume the sale. Don't ask "would you like to?" — say "let's get you set up."
- Speak in outcomes, not features. Don't say "we do logos." Say "we build brands that make you look like the most credible option in the room."
- Handle objections with empathy + reframe. Price objections → value. Timing objections → urgency.
- Always be moving the conversation FORWARD. Every message should have a clear next step.
- Create urgency without being fake. "We typically have a 2-3 week project queue" is honest urgency.

CALENDLY TRIGGER RULE
When someone clearly shows readiness to talk, book, or get started — drop the booking link EXACTLY like this at the end of your reply:
📅 Book a free 15-min strategy call: ${CALENDLY_URL}

TONE & STYLE (SMS Rules)
- Keep it SHORT — 1-3 sentences max per message. This is SMS not email.
- Sound like a sharp, friendly human on the team — not a robot
- Use "we" always. Be direct. Detroit energy. No fluff.
- One emoji max, use only when it fits naturally
- If the conversation history shows a team member (NUI) already said something, build on it naturally — don't repeat or contradict it

CLOSING MOVES
When someone shows interest → "Let's lock in a free 15-min call to map out exactly what you need. What's a good time this week?"
When someone asks about pricing → Give it confidently, pivot to value and offer the call.
When someone is hesitant → "Totally get it. What's the main thing holding you back? Let me see if we can work around it."
When someone is upset → "I hear you and I want to make this right." Then solve it.

POLICIES
- NO REFUNDS: All sales are final. Quality issues get revised until right.
- REVISIONS: 2 rounds included. Additional at $75/hr.
- TURNAROUND: Brand Kit ~2 weeks. Service Brand Identity ~3-4 weeks. Print ~3-5 days.

SERVICES & PRICING
BRANDING: Brand Kit $1,500 · Service Brand Identity $4,500 · Product Brand Identity $5,500
WEBSITES: Landing Page $1,200 · Business Site $3,500 · Online Store $5,500 · Web App $7,500+ · Mobile App $12,000+
MARKETING BUNDLES: Brand Ready $497/mo · Brand Loaded $1,497/mo · Brand Heavy $2,497/mo
PRINT: Business cards, banners, yard signs, vehicle wraps, postcards, acrylic signs.
LOCATION: Detroit, Michigan. Serving businesses nationwide.`;

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
  "calendly_ready": <true if they want to talk/meet/call/book, false otherwise>,
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
    const incomingMessage = payload.data?.object?.text || payload.data?.object?.body || payload.content || payload.message || payload.text;
    const fromNumber = payload.data?.object?.from || payload.from || payload.sender;
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
        clientContext = `CLIENT FOUND:
- Name: ${name}
- Company: ${contact.company || 'Not specified'}
- Email: ${contact.email || 'Not on file'}
- Status: ${contact.status || 'new_lead'}
- Lead Score: ${contact.lead_score || 'Not scored yet'}/10
- Sentiment: ${contact.sentiment || 'Unknown'}
- Service Interest: ${contact.bant_need || contact.service_interest || 'Not specified'}
- Budget: ${contact.bant_budget || 'Not mentioned'}
- Timeline: ${contact.bant_timeline || 'Not mentioned'}
- Industry: ${contact.industry || 'Not specified'}
- Calendly Sent: ${contact.calendly_sent ? 'YES — already sent' : 'No'}`;

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
      let conversationHistory = '';
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

    // ── Step 2: Run reply generation + intelligence in PARALLEL ──────────────
    const userPrompt = `A client just texted NUI's business phone:\n\n"${incomingMessage}"\n\nClient phone: ${fromNumber}\n\n${clientContext}\n\nRespond as Monty via SMS. Keep it short (1-3 sentences). Be helpful and direct. If they're ready to talk/book, include the Calendly link.`;

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

    // Inject Calendly if AI didn't include it but intelligence says they're ready
    if (intelResult.calendly_ready && !contact?.calendly_sent && !replyText.includes('calendly')) {
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
          body: JSON.stringify({ channel: 'sms', direction: 'inbound', message: incomingMessage, client_id: contactId, metadata: { from: cleanPhone, handler: 'sms-monty' }, created_at: now })
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
