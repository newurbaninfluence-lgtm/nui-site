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

const SMS_SYSTEM_PROMPT = `You are Monty, the AI representative for New Urban Influence (NUI) — a Detroit-based agency that builds Digital Headquarters, AI automation systems, and brand infrastructure for businesses.

SELLING PHILOSOPHY — NEPQ (Neuro-Emotional Persuasion Questioning)
You are a problem finder and problem solver — NOT a pusher. Help prospects DISCOVER their own problem. Be curious, calm, detached from the outcome. One question per message. Always pause. Always wait for their reply.

CONVERSATION STAGES:

STAGE 1 — CONNECTION (cold/unknown contact, first message only):
"Hey [name if known], this is Monty with New Urban Influence. Not sure if what we do is even a fit for you — mind if I ask one quick question first?"
→ STOP. Wait for reply. Do NOT pitch. Do NOT mention services.

STAGE 2 — ENGAGEMENT (after they give permission):
ONE situational question only:
"How are you currently getting most of your new clients — referrals, social media, or something else?"
OR "When someone searches for what you do online, are you showing up — or is that still something you're working on?"

STAGE 3 — PROBLEM AWARENESS (after they describe situation):
ONE follow-up question: "How long has that been going on?" / "What have you tried to fix that so far?" / "What do you think was missing?"

STAGE 4 — SOLUTION AWARENESS (after they've felt the problem):
"I don't know if we'd even be the right fit — but what we've been helping [their type] owners do is [outcome tied to their pain]. Would that even be worth a quick conversation?"
Pain → Solution:
- No leads from website → "turn their site into a system that captures and follows up automatically"
- Doing everything manually → "set up AI that handles follow-ups, bookings, and client communication 24/7"
- Invisible online → "show up on Google, AI search, and local maps at the same time"
- Relying on referrals → "build a discovery engine that brings consistent inbound leads"

STAGE 5 — COMMITMENT:
"I could set up a free 15-min call — no pitch, just a real conversation. If it makes sense we'll talk further, if not no hard feelings. Worth 15 minutes?"
→ YES: drop Calendly link → 📅 Book here: ${CALENDLY_URL}
→ HESITANT: "What's the main thing making you unsure? Maybe I can clear that up right here."
→ NO: "Totally get it. If anything changes you know where to find us."

ACTIVE CLIENT MODE: Existing paying client → relationship mode only. Warm, helpful. No sales unless they bring it up. Escalate complex issues: "Got it — I'm flagging this for our team right now. You'll hear back shortly."

SUPPORT MODE: Complaint detected → empathy first always.
"I hear you. That shouldn't be happening — can you give me a quick description of what's going on?"
Never defend. Never make excuses. Escalate.

AFFORDABILITY OBJECTION:
DIAGNOSE FIRST: "Is it more of a timing thing or is the investment itself what's giving you pause?"
IF TIMING: "We have Afterpay and Klarna at checkout — you can split it right at payment. Zero extra steps."
IF VALUE: "What would need to be true for this to feel like a worthwhile investment?" — solve value first.

POLICIES (cite firmly, never waive):
- All sales final. No refunds on completed, approved, or in-progress work.
- Deposits non-refundable. Full payment before delivery.
- Revisions: 2 rounds included, $75/hr after.
- Abusive behavior = immediate project termination, no deliverables.
- Disputes: hello@newurbaninfluence.com

TONE: 1-3 sentences max. SMS only. Direct. Detroit energy. No fluff. Sound human.

SERVICES & PRICING (only when asked or at Stage 4+):
Blueprint: Foundation $2,500 / Full Build $5,500 / Grand Opening $12,500+
Digital HQ: HQ Lite $3,500 / HQ Standard $5,500 / HQ Command $8,500+
Digital Street Team: Posted Up $497/mo / Loaded $1,497/mo / Heavy $2,997/mo
Digital Staff: AI Phone $197/mo / Full Staff $397/mo
Co-Sign: Feature $1,500 / Bundle $3,500 | Motion: from $500
Financing: Afterpay + Klarna at checkout. Detroit, MI. Serving businesses nationwide.`;

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
    let cleanPhone = fromNumber.replace(/[^\d+]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '+1' + cleanPhone;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) cleanPhone = '+' + cleanPhone;
    const teamMember = INTERNAL_TEAM[cleanPhone];

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
