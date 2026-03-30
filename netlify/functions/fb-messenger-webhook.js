// fb-messenger-webhook.js — Netlify Function
// Handles Facebook & Instagram DMs → Monty auto-reply → Supabase CRM
// Env vars: FB_PAGE_ACCESS_TOKEN, FB_VERIFY_TOKEN, FB_PAGE_ID,
//           ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const MONTY_SYSTEM_PROMPT = `You are Monty, the AI assistant for New Urban Influence (NUI), a branding and design agency in Detroit, Michigan. You're responding to Facebook or Instagram DMs.

PERSONALITY:
- Friendly, direct, confident — like a real team member DMing back
- Keep replies SHORT — 2-4 sentences max for DMs
- Use "we" when talking about NUI
- One emoji max, only if it fits naturally

YOUR GOAL:
- Understand what they need
- Recommend the right NUI service
- Get their contact info (name, email, phone) naturally in conversation
- Push warm leads toward booking a free strategy call

SERVICES (brief):
- Brand Kit: $1,500 | Service Brand Identity: $4,500+ | Product Brand Identity: $5,500+
- Website: Landing Page $1,200 | Business Site $3,500 | Online Store $5,500
- Marketing Tech: Silent Visitor ID $97/mo | Facebook/Google Ads Pixel $199/mo each | Email Automation $97/mo | SMS $79/mo | AI Phone $197/mo | Geo-Fencing $997/mo | Geo-Grid $297/mo
- Bundles: Brand Ready $497/mo | Brand Loaded $1,497/mo | Brand Heavy $2,497/mo (all services)
- Print: Business cards, banners, signs, wraps — ask for quote

ALWAYS: End with a question or next step. If they seem ready → "Want to book a free 20-min strategy call? Just drop your number and we'll set it up."

NEVER make up prices or services. If unsure → "Let me have Faren (our founder) reach out directly — what's the best number?"`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // ── GET: Webhook verification handshake ──────────────────────────────────
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    if (
      params['hub.mode'] === 'subscribe' &&
      params['hub.verify_token'] === process.env.FB_VERIFY_TOKEN
    ) {
      console.log('✅ Facebook webhook verified');
      return { statusCode: 200, headers: CORS_HEADERS, body: params['hub.challenge'] };
    }
    return { statusCode: 403, headers: CORS_HEADERS, body: 'Forbidden' };
  }

  // ── POST: Incoming DM or comment ─────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    if (body.object !== 'page' && body.object !== 'instagram') {
      return { statusCode: 200, headers: CORS_HEADERS, body: 'Not a page event' };
    }

    const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
    const PAGE_ID    = process.env.FB_PAGE_ID;
    const API_KEY    = process.env.ANTHROPIC_API_KEY;
    const SUPA_URL   = process.env.SUPABASE_URL;
    const SUPA_KEY   = process.env.SUPABASE_SERVICE_KEY;

    for (const entry of (body.entry || [])) {
      // ── MESSENGER DMs ──
      for (const msg of (entry.messaging || [])) {
        const senderId  = msg.sender?.id;
        const text      = msg.message?.text;
        const isEcho    = msg.message?.is_echo;
        const timestamp = msg.timestamp;

        if (!senderId || !text || isEcho || senderId === PAGE_ID) continue;

        console.log(`💬 FB DM from ${senderId}: "${text}"`);
        await handleDM({ senderId, text, timestamp, PAGE_TOKEN, PAGE_ID, API_KEY, SUPA_URL, SUPA_KEY, channel: 'facebook' });
      }

      // ── INSTAGRAM DMs ──
      for (const msg of (entry.messaging || [])) {
        if (!msg.message?.text || msg.message?.is_echo) continue;
        const senderId = msg.sender?.id;
        if (!senderId || senderId === PAGE_ID) continue;
        // Already handled above — skip duplicates
      }

      // ── FEED COMMENTS (Facebook posts) ──
      for (const change of (entry.changes || [])) {
        if (change.field !== 'feed') continue;
        const val = change.value;
        if (val?.item !== 'comment' || !val?.message) continue;
        const commentorId = val.from?.id;
        if (!commentorId || commentorId === PAGE_ID) continue;

        console.log(`💬 FB Comment from ${commentorId}: "${val.message}"`);
        await replyToComment({ commentId: val.comment_id, text: val.message, PAGE_TOKEN, API_KEY, SUPA_URL, SUPA_KEY });
      }
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: 'EVENT_RECEIVED' };
  } catch (err) {
    console.error('FB webhook error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};

// ── Handle a DM: get Monty reply → send → save to CRM ───────────────────────
async function handleDM({ senderId, text, timestamp, PAGE_TOKEN, PAGE_ID, API_KEY, SUPA_URL, SUPA_KEY, channel }) {
  // 1. Get Monty's AI reply
  const reply = await getMontyReply(text, API_KEY);

  // 2. Send reply via Messenger Send API
  await sendFBMessage({ recipientId: senderId, text: reply, PAGE_TOKEN });

  // 3. Save to Supabase CRM (non-blocking)
  saveToSupabase({ senderId, incomingText: text, reply, channel, SUPA_URL, SUPA_KEY }).catch(e =>
    console.warn('Supabase save failed:', e.message)
  );
}

// ── Handle a comment: reply publicly ────────────────────────────────────────
async function replyToComment({ commentId, text, PAGE_TOKEN, API_KEY, SUPA_URL, SUPA_KEY }) {
  const reply = await getMontyReply(text, API_KEY, true);
  if (!PAGE_TOKEN || !commentId) return;

  await fetch(`https://graph.facebook.com/v19.0/${commentId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: reply, access_token: PAGE_TOKEN })
  });

  saveToSupabase({ senderId: null, incomingText: text, reply, channel: 'facebook_comment', SUPA_URL, SUPA_KEY })
    .catch(e => console.warn('Supabase comment save failed:', e.message));
}

// ── Get Monty reply from Claude ──────────────────────────────────────────────
async function getMontyReply(text, API_KEY, isComment = false) {
  if (!API_KEY) return "Hey! Thanks for reaching out. DM us your number and we'll follow up shortly.";

  const contextNote = isComment
    ? 'This is a public Facebook comment — keep reply brief and invite them to DM for details.'
    : 'This is a private DM.';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: MONTY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `${contextNote}\n\nMessage: "${text}"` }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Thanks for reaching out! Drop your number and we'll connect with you shortly.";
  } catch (e) {
    console.error('Monty AI error:', e);
    return "Thanks for reaching out! Drop your number and we'll connect with you shortly.";
  }
}

// ── Send reply via Facebook Messenger API ───────────────────────────────────
async function sendFBMessage({ recipientId, text, PAGE_TOKEN }) {
  if (!PAGE_TOKEN || !recipientId) return;
  const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('FB send error:', err);
  } else {
    console.log('✅ FB reply sent to', recipientId);
  }
}

// ── Save DM to Supabase: crm_contacts + activity_log + communications ────────
async function saveToSupabase({ senderId, incomingText, reply, channel, SUPA_URL, SUPA_KEY }) {
  if (!SUPA_URL || !SUPA_KEY) return;

  const headers = {
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Try to find existing contact by fb_sender_id stored in metadata
  let contactId = null;
  if (senderId) {
    const existing = await fetch(
      `${SUPA_URL}/rest/v1/crm_contacts?metadata->>fb_sender_id=eq.${senderId}&limit=1`,
      { headers }
    ).then(r => r.json()).catch(() => []);

    if (existing?.length > 0) {
      contactId = existing[0].id;
    } else {
      // Create a new lead — we only have the FB sender ID for now
      // Monty will fill in name/email/phone as conversation continues
      const created = await fetch(`${SUPA_URL}/rest/v1/crm_contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          source: channel,
          status: 'new_lead',
          notes: `First contact via ${channel} DM`,
          metadata: { fb_sender_id: senderId },
          last_activity_at: new Date().toISOString()
        })
      }).then(r => r.json()).catch(() => null);
      if (Array.isArray(created) && created.length > 0) contactId = created[0].id;
    }
  }

  // Log to communications
  await fetch(`${SUPA_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      channel,
      direction: 'inbound',
      message: incomingText,
      client_id: contactId,
      metadata: { fb_sender_id: senderId, handler: 'fb-messenger-webhook' },
      created_at: new Date().toISOString()
    })
  }).catch(e => console.warn('Comm inbound log failed:', e.message));

  await fetch(`${SUPA_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      channel,
      direction: 'outbound',
      message: reply,
      client_id: contactId,
      metadata: { fb_sender_id: senderId, ai_generated: true },
      created_at: new Date().toISOString()
    })
  }).catch(e => console.warn('Comm outbound log failed:', e.message));

  // Log activity if we have a contact
  if (contactId) {
    await fetch(`${SUPA_URL}/rest/v1/activity_log`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        contact_id: contactId,
        type: channel,
        direction: 'both',
        content: `DM: "${incomingText}" → Monty: "${reply}"`,
        metadata: { fb_sender_id: senderId, ai_generated: true },
        read: false,
        created_at: new Date().toISOString()
      })
    }).catch(e => console.warn('Activity log failed:', e.message));
  }
}
