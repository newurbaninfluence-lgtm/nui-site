// sms-monty.js — Netlify Function
// Monty SMS Auto-Responder via OpenPhone Webhook
// Receives incoming texts, looks up client in Supabase, responds intelligently
// Env vars: ANTHROPIC_API_KEY, OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { requireAdmin } = require('./utils/security');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const { getBrand, buildSmsSystemPrompt } = require('./utils/agency-brand');

const SMS_SYSTEM_PROMPT = `You are Monty, the AI representative for New Urban Influence (NUI) — a elite branding and design agency based in Detroit, Michigan. You handle incoming texts like a top-tier sales professional and customer service expert combined.

═══════════════════════════════════════════
IDENTITY & ROLE
═══════════════════════════════════════════
You are NOT just a support bot. You are:
- Customer Service Pro — warm, confident, solutions-focused
- Appointment Setter — move people toward booking strategy calls
- Deal Closer — help prospects understand the value and make decisions
- Account Manager — keep existing clients informed and happy

You represent THE TEAM at NUI. Never say "the founder will help" or name any individual unless the person directly and specifically asks for someone by name. If someone directly asks for Faren Young, acknowledge it and offer to set up a call. Otherwise refer to "our team", "we", "our strategists."

═══════════════════════════════════════════
SELLING PHILOSOPHY (Grant Cardone / Alex Hormozi Style)
═══════════════════════════════════════════
- Assume the sale. Don't ask "would you like to?" — say "let's get you set up."
- Speak in outcomes, not features. Don't say "we do logos." Say "we build brands that make you look like the most credible option in the room."
- Handle objections with empathy + reframe. Price objections → value. Timing objections → urgency.
- Always be moving the conversation FORWARD. Every message should have a clear next step.
- Use social proof naturally. Mention that businesses like theirs have gotten results.
- Create urgency without being fake. "We typically have a 2-3 week project queue" is honest urgency.
- If someone is on the fence, offer the strategy call — it's low commitment and high value.
- The goal of every conversation: book a call OR get a yes on a package.

HORMOZI MINDSET: Make the offer so good they feel stupid saying no. Emphasize what they GET vs. what they PAY. Bundle value. Show ROI.
CARDONE MINDSET: Be bold. Don't be afraid to go for the close. Follow up is NOT annoying — it's service.

═══════════════════════════════════════════
TONE & STYLE (SMS Rules)
═══════════════════════════════════════════
- Keep it SHORT — 1-3 sentences max per message. This is SMS not email.
- Sound like a sharp, friendly human on the team — not a robot or a help desk
- Use "we" always. You're part of the NUI team.
- Be direct. Detroit energy. No fluff.
- One emoji max, use only when it fits naturally
- If the conversation history shows a team member (NUI) already said something, acknowledge it and build on it naturally — don't repeat or contradict it

═══════════════════════════════════════════
CONVERSATION AWARENESS
═══════════════════════════════════════════
You will be given the full recent SMS conversation history including messages sent by the NUI team. Read ALL of it before responding. If a team member already addressed something, don't repeat it — continue the conversation naturally from where it left off. You are joining an ongoing thread, not starting fresh.

═══════════════════════════════════════════
CLOSING MOVES
═══════════════════════════════════════════
When someone shows interest:
→ "Let's lock in a free 15-min strategy call so we can map out exactly what you need. What's a good time this week?"

When someone asks about pricing:
→ Give the number confidently. Don't apologize for price. Then pivot to value and offer the call.

When someone is hesitant:
→ "Totally get it. What's the main thing holding you back? Let me see if we can work around it."

When someone is upset:
→ Lead with empathy first. "I hear you and I want to make this right." Then solve it.

When you need backup (complex issue you can't resolve):
→ "Let me flag this for our team right now and get someone on it today. Can I get the best time to reach you?"

═══════════════════════════════════════════
POLICIES
═══════════════════════════════════════════
- NO REFUNDS: All sales are final. If there's a quality issue, we revise until it's right.
- REVISIONS: 2 rounds included. Additional revisions at $75/hr.
- TURNAROUND: Brand Kit ~2 weeks. Service Brand Identity ~3-4 weeks. Print ~3-5 business days.
- PAYMENT PLANS: 0% interest, split into installments. Make it easy to say yes.

JOB STATUS:
- new = Received, not started yet
- in_progress = Actively being worked on
- review = Ready for client review
- done = Completed and delivered
- on_hold = Waiting on client input

PRINT STATUS:
- pending → processing → shipped → delivered

═══════════════════════════════════════════
SERVICES & PRICING
═══════════════════════════════════════════
BRANDING:
- Brand Kit — $1,500 (logo, colors, fonts, social templates, brand guide)
- Service Brand Identity — $4,500 (full collateral, presentations, signage)
- Product Brand Identity — $5,500 (packaging, labels, retail assets)

WEBSITES: Landing Page $1,200 · Business Site $3,500 · Online Store $5,500 · Web App $7,500+ · Mobile App $12,000+

MARKETING TECH BUNDLES:
- Brand Ready — $497/mo + $1,500 setup (Visitor ID + Email Automation + CRM)
- Brand Loaded — $1,497/mo + $3,000 setup (Full digital stack)
- Brand Heavy — $2,497/mo + $5,000 setup (Everything — total market domination)

PRINT: Business cards, banners, yard signs, vehicle wraps, postcards, acrylic signs.

LOCATION: Detroit, Michigan. Serving businesses nationwide.`;


exports.handler = async function(event) {
  // Resolve agency brand
  let agencyId = null;
  try { const b = JSON.parse(event.body||'{}'); agencyId = b.agency_id||null; } catch(e){}
  const brand = await getBrand(agencyId);
  const AGENCY_SYSTEM_PROMPT = buildSmsSystemPrompt(brand);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    
    // OpenPhone webhook sends message data
    // Handle both direct format and OpenPhone webhook format
    const incomingMessage = payload.data?.object?.text 
      || payload.data?.object?.body 
      || payload.content 
      || payload.message
      || payload.text;
    
    const fromNumber = payload.data?.object?.from 
      || payload.from 
      || payload.sender;

    const direction = payload.data?.object?.direction || payload.direction || 'incoming';

    // If this is an outbound message sent manually by the team, log it and exit
    // This lets Monty see the full conversation thread next time
    if (direction === 'outgoing' || direction === 'outbound') {
      if (SUPABASE_URL && SUPABASE_SERVICE_KEY && incomingMessage && fromNumber) {
        const toNumber = payload.data?.object?.to || payload.to || fromNumber;
        await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            channel: 'sms',
            direction: 'outbound',
            message: incomingMessage,
            metadata: { to: toNumber, handler: 'team_manual' },
            created_at: new Date().toISOString()
          })
        }).catch(e => console.warn('Log team outbound failed:', e.message));
      }
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ logged: 'team outbound message' }) };
    }

    if (!incomingMessage || !fromNumber) {
      console.log('SMS Monty: Missing message or sender. Payload:', JSON.stringify(payload).slice(0, 500));
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing message or sender' }) };
    }

    console.log(`📱 SMS from ${fromNumber}: "${incomingMessage}"`);

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
    const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!ANTHROPIC_API_KEY) {
      console.error('SMS Monty: ANTHROPIC_API_KEY not configured');
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // ── Step 1: Look up client in Supabase ──
    let clientContext = 'CLIENT NOT FOUND IN SYSTEM — This may be a new inquiry.';
    let contactId = null;

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      // Clean phone for lookup
      let cleanPhone = fromNumber.replace(/[^\d+]/g, '');
      if (cleanPhone.length === 10) cleanPhone = '+1' + cleanPhone;
      else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) cleanPhone = '+' + cleanPhone;

      // Look up contact
      const contactRes = await fetch(
        `${SUPABASE_URL}/rest/v1/crm_contacts?phone=eq.${encodeURIComponent(cleanPhone)}&limit=1`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const contacts = await contactRes.json();
      
      if (contacts && contacts.length > 0) {
        const c = contacts[0];
        contactId = c.id;
        clientContext = `CLIENT FOUND:
- Name: ${c.first_name || ''} ${c.last_name || ''}
- Company: ${c.company || 'Not specified'}
- Email: ${c.email || 'Not on file'}
- Status: ${c.status || 'unknown'}
- Service Interest: ${c.service_interest || 'Not specified'}
- Industry: ${c.industry || 'Not specified'}`;

        // Look up their jobs
        const jobsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/jobs?client_id=eq.${c.id}&order=created_at.desc&limit=5`,
          { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
        );
        const jobs = await jobsRes.json();

        if (jobs && jobs.length > 0) {
          clientContext += '\n\nACTIVE JOBS:';
          jobs.forEach(j => {
            clientContext += `\n- "${j.title || j.name || 'Untitled'}" — Status: ${j.status || 'unknown'} (Type: ${j.type || 'N/A'})`;
          });
        } else {
          clientContext += '\n\nNO ACTIVE JOBS found.';
        }

        // Look up print requests
        const printRes = await fetch(
          `${SUPABASE_URL}/rest/v1/print_requests?client_id=eq.${c.id}&order=created_at.desc&limit=5`,
          { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
        );
        const prints = await printRes.json();
        
        if (prints && prints.length > 0) {
          clientContext += '\n\nPRINT ORDERS:';
          prints.forEach(p => {
            clientContext += `\n- ${p.product || p.item || 'Print order'} — Status: ${p.status || 'pending'} (Qty: ${p.quantity || 'N/A'})`;
          });
        }
      }

      // Get recent SMS conversation history for context
      const historyRes = await fetch(
        `${SUPABASE_URL}/rest/v1/communications?channel=eq.sms&or=(metadata->>to.eq.${encodeURIComponent(cleanPhone)},metadata->>from.eq.${encodeURIComponent(cleanPhone)})&order=created_at.desc&limit=6`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const history = await historyRes.json();
      let conversationHistory = '';
      if (history && history.length > 0) {
        conversationHistory = '\n\nRECENT SMS CONVERSATION (chronological — read this before replying):';
        history.reverse().forEach(h => {
          const isTeam = h.direction === 'outbound';
          const handler = h.metadata?.handler || '';
          let who;
          if (isTeam && handler === 'team_manual') who = 'NUI Team (human reply)';
          else if (isTeam && handler === 'sms-monty') who = 'Monty (you — previous reply)';
          else if (isTeam) who = 'NUI Team';
          else who = 'Client';
          conversationHistory += `\n${who}: ${h.message || h.content || '(no content)'}`;
        });
        conversationHistory += '\n\n[You are continuing this conversation. Do NOT repeat what was already said. Pick up naturally from where it left off.]';
      }
      clientContext += conversationHistory;
    }

    // ── Step 2: Ask Monty (Claude) for a response ──
    const userPrompt = `A client just sent this text message to NUI's business phone:

"${incomingMessage}"

Client phone: ${fromNumber}

${clientContext}

Respond as Monty via SMS. Keep it short (1-3 sentences). Be helpful and direct.`;

    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: AGENCY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('SMS Monty AI error:', aiResponse.status, errText);
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'AI service error' }) };
    }

    const aiData = await aiResponse.json();
    const replyText = aiData.content[0]?.text || "Hey! Got your message. Let me check and get back to you shortly.";
    console.log(`🤖 Monty reply to ${fromNumber}: "${replyText}"`);

    // ── Step 3: Send reply via OpenPhone ──
    if (OPENPHONE_API_KEY && FROM_NUMBER_ID) {
      const sendRes = await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': OPENPHONE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyText,
          to: [fromNumber],
          from: FROM_NUMBER_ID
        })
      });

      const sendResult = await sendRes.json();
      if (!sendRes.ok) {
        console.error('OpenPhone send error:', sendResult);
      } else {
        console.log('✅ SMS reply sent via OpenPhone');
      }
    }

    // ── Step 4: Log everything to Supabase ──
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const now = new Date().toISOString();

      // Log incoming message
      await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          channel: 'sms',
          direction: 'inbound',
          message: incomingMessage,
          client_id: contactId,
          metadata: { from: fromNumber, handler: 'sms-monty' },
          created_at: now
        })
      }).catch(e => console.warn('Log inbound failed:', e.message));

      // Log outbound reply
      await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          channel: 'sms',
          direction: 'outbound',
          message: replyText,
          client_id: contactId,
          metadata: { to: fromNumber, handler: 'sms-monty', ai_generated: true },
          created_at: new Date().toISOString()
        })
      }).catch(e => console.warn('Log outbound failed:', e.message));

      // Log to activity_log if we have a contact
      if (contactId) {
        await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            contact_id: contactId,
            type: 'sms',
            event_type: 'monty_sms_reply',
            direction: 'both',
            content: `Client: "${incomingMessage}" → Monty: "${replyText}"`,
            metadata: { from: fromNumber, ai_generated: true },
            read: false,
            created_at: new Date().toISOString()
          })
        }).catch(e => console.warn('Activity log failed:', e.message));
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, reply: replyText })
    };

  } catch (err) {
    console.error('SMS Monty error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'SMS processing failed' })
    };
  }
};
