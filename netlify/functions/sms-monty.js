// sms-monty.js — Netlify Function
// Monty SMS Auto-Responder via OpenPhone Webhook
// Receives incoming texts, looks up client in Supabase, responds intelligently
// Env vars: ANTHROPIC_API_KEY, OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER, SUPABASE_URL, SUPABASE_SERVICE_KEY

const { requireAdmin } = require('./utils/security');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://newurbaninfluence.com',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const SMS_SYSTEM_PROMPT = `You are Monty, the SMS customer service assistant for New Urban Influence (NUI), a branding and design agency in Detroit, Michigan. You're responding to client text messages.

PERSONALITY:
- Friendly, helpful, direct — like texting a real person on the team
- Keep responses SHORT — this is SMS, not email. 1-3 sentences max.
- Use casual professional tone. No corporate speak.
- Use "we" when talking about NUI. You're part of the team.
- Never use emojis excessively. One occasionally is fine.

WHAT YOU CAN DO:
- Give order/job status updates based on client context provided
- Answer questions about NUI services and pricing
- Explain our no-refund policy professionally
- Schedule strategy calls or follow-ups
- Direct complex issues to Faren (founder)

POLICIES:
- NO REFUND POLICY: All sales are final. We do not offer refunds on completed or in-progress work. If there's a quality issue, we'll revise until it's right — but no cash refunds.
- REVISION POLICY: Branding projects include 2 rounds of revisions. Additional revisions billed at $75/hr.
- TURNAROUND: Brand Kit ~2 weeks. Service Brand Identity ~3-4 weeks. Print orders ~3-5 business days.
- PAYMENT: We offer flexible financing — 0% interest, pay over time via payment plans.

JOB STATUS MEANINGS:
- "new" = Just received, hasn't started yet
- "in_progress" = Actively being worked on
- "review" = Ready for client review/approval
- "done" = Completed and delivered
- "on_hold" = Paused, usually waiting on client input

PRINT ORDER STATUS:
- "pending" = Order received, being prepared
- "processing" = Being produced at print facility
- "shipped" = On its way (usually overnight)
- "delivered" = Should have arrived

IMPORTANT:
- If the client isn't in the system, be helpful anyway — ask what they need and offer to get them set up
- If you can't answer something, say "Let me check with Faren and get back to you" — DON'T make things up
- If someone seems angry, be empathetic but firm on policies
- Always end with a clear next step or question

SERVICES & PRICING (brief — for SMS keep it short):
- Brand Kit: $1,500 (logo + brand guidelines)
- Service Brand Identity: $3,500+
- Product Brand Identity: $4,500+
- Landing Page: $1,200
- Business Website: $3,500
- Online Store: $5,500
- Print: Business cards, banners, signs, vehicle wraps — varies

FOUNDER: Faren Young
LOCATION: Detroit, Michigan`;


exports.handler = async function(event) {
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

    // Only process incoming messages (not our own outbound)
    if (direction === 'outgoing' || direction === 'outbound') {
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: 'outbound message' }) };
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
        conversationHistory = '\n\nRECENT SMS HISTORY (newest first):';
        history.reverse().forEach(h => {
          const who = h.direction === 'outbound' ? 'NUI' : 'Client';
          conversationHistory += `\n${who}: ${h.message || h.content || '(no content)'}`;
        });
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SMS_SYSTEM_PROMPT,
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
