// openphone-webhook.js — NUI Contact Hub Webhook Receiver
// Handles ALL Quo (OpenPhone) webhook events:
//   message.received, message.delivered,
//   call.ringing, call.completed,
//   call.summary.completed, call.transcript.completed,
//   call.recording.completed
//
// Flow: Quo event → find/create contact in crm_contacts → log to activity_log
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supaHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ── Supabase helpers ──────────────────────────────────────────────

async function findContactByPhone(phone) {
  if (!phone) return null;
  // Normalize: strip everything except digits, keep last 10
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return null;

  // Try multiple phone formats since we don't know how it was stored
  const e164 = `+1${digits}`;
  const formats = [phone, e164, digits, `1${digits}`];
  const orFilter = formats.map(f => `phone.eq.${encodeURIComponent(f)}`).join(',');

  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/crm_contacts?or=(${orFilter})&select=id,phone,first_name,last_name,status&limit=1`,
    { headers: supaHeaders }
  );
  const rows = await resp.json();
  return rows?.length > 0 ? rows[0] : null;
}

async function createContact(phone, source) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts`, {
    method: 'POST',
    headers: { ...supaHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      phone,
      source: source || 'quo_unknown',
      status: 'new_lead',
      last_activity_at: new Date().toISOString(),
    })
  });
  const rows = await resp.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

async function logActivity(contactId, type, direction, content, metadata) {
  await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
    method: 'POST',
    headers: { ...supaHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      contact_id: contactId,
      type,
      direction,
      content: content || '',
      metadata: metadata || {},
      read: false,
      created_at: new Date().toISOString(),
    })
  });
}

// Also write to communications table so CRM Conversations panel shows Quo data
async function logCommunication(contactId, channel, direction, message, metadata) {
  const internalTypes = ['sona_summary', 'transcript', 'recording', 'call_ringing'];
  if (internalTypes.includes(channel)) return; // don't clutter comms with internal events
  await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...supaHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      channel,
      direction,
      message: message || '',
      client_id: contactId,
      metadata: metadata || {},
      read: false,
      created_at: new Date().toISOString(),
    })
  });
}

async function touchContact(contactId) {
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ last_activity_at: new Date().toISOString() })
  });
}

async function updateContactInfo(contactId, updates) {
  // Only update fields that have values and aren't already set
  const cleanUpdates = {};
  for (const [key, val] of Object.entries(updates)) {
    if (val && val.trim && val.trim().length > 0) cleanUpdates[key] = val.trim();
  }
  if (Object.keys(cleanUpdates).length === 0) return;
  cleanUpdates.last_activity_at = new Date().toISOString();
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify(cleanUpdates)
  });
  console.log(`[NUI] Contact ${contactId} updated:`, Object.keys(cleanUpdates).join(', '));
}

// Extract caller name/email from transcript text
function extractCallerInfo(text) {
  const info = {};
  if (!text) return info;

  // Extract name patterns
  const namePatterns = [
    /my name is ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /this is ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /I'm ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /i am ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /name'?s ([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /call me ([A-Z][a-z]+ [A-Z][a-z]+)/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim();
      // Skip if it's the AI assistant's name
      if (!/sona|monty|assistant/i.test(name)) {
        const parts = name.split(' ');
        info.first_name = parts[0];
        if (parts.length > 1) info.last_name = parts.slice(1).join(' ');
        break;
      }
    }
  }

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/i);
  if (emailMatch) info.email = emailMatch[0].toLowerCase();

  // Extract from summary format: "The caller, Bo Taylor" or "caller Bo Taylor"
  if (!info.first_name) {
    const summaryName = text.match(/(?:caller|client|customer)[,]?\s+([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (summaryName) {
      const parts = summaryName[1].trim().split(' ');
      info.first_name = parts[0];
      if (parts.length > 1) info.last_name = parts.slice(1).join(' ');
    }
  }

  return info;
}

// ── Phone extraction ──────────────────────────────────────────────

function extractPhone(obj, direction) {
  // For inbound: the caller's number is "from"
  // For outbound: the recipient's number is "to"
  if (!obj) return null;
  if (direction === 'incoming' || direction === 'inbound') return obj.from;
  if (direction === 'outgoing' || direction === 'outbound') return obj.to;
  // Fallback: use "from" for received, "to" for delivered
  return obj.from || obj.to;
}

// ── Ensure contact exists ─────────────────────────────────────────

async function ensureContact(phone, source) {
  if (!phone) return null;
  let contact = await findContactByPhone(phone);
  if (!contact) {
    contact = await createContact(phone, source);
    console.log(`[NUI] New contact created: ${phone} → ${contact?.id}`);
  }
  return contact;
}

// ── Event Handlers ────────────────────────────────────────────────

async function handleMessageReceived(obj, rawPayload) {
  const phone = obj.from;
  const contact = await ensureContact(phone, 'quo_text');
  if (!contact) return { action: 'message_received_no_phone' };

  const msgMeta = { quo_message_id: obj.id, from: obj.from, to: obj.to, media: obj.media || [], conversation_id: obj.conversationId, phone_number_id: obj.phoneNumberId };
  await logActivity(contact.id, 'text', 'inbound', obj.body || '', msgMeta);
  await logCommunication(contact.id, 'sms', 'inbound', obj.body || '', msgMeta);
  await touchContact(contact.id);

  // Fire Monty AI reply — async, don't await so we return 200 to OpenPhone fast
  const siteUrl = process.env.URL || 'https://newurbaninfluence.com';
  fetch(`${siteUrl}/.netlify/functions/sms-monty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawPayload
  }).catch(e => console.warn('[NUI] sms-monty trigger failed:', e.message));

  return { action: 'message_received', contactId: contact.id };
}

async function handleMessageDelivered(obj) {
  const phone = obj.to;
  const contact = await ensureContact(phone, 'quo_text');
  if (!contact) return { action: 'message_delivered_no_phone' };

  const delivMeta = { quo_message_id: obj.id, from: obj.from, to: obj.to, status: obj.status, conversation_id: obj.conversationId };
  await logActivity(contact.id, 'text', 'outbound', obj.body || '', delivMeta);
  await logCommunication(contact.id, 'sms', 'outbound', obj.body || '', delivMeta);
  await touchContact(contact.id);
  return { action: 'message_delivered', contactId: contact.id };
}

async function handleCallRinging(obj) {
  const phone = extractPhone(obj, obj.direction);
  const contact = await ensureContact(phone, 'quo_call');
  if (!contact) return { action: 'call_ringing_no_phone' };

  await logActivity(contact.id, 'call_ringing', obj.direction === 'incoming' ? 'inbound' : 'outbound', 
    `Incoming call from ${obj.from}`, {
    quo_call_id: obj.id,
    from: obj.from,
    to: obj.to,
    direction: obj.direction,
  });
  return { action: 'call_ringing', contactId: contact.id };
}

async function handleCallCompleted(obj) {
  const phone = extractPhone(obj, obj.direction);
  const contact = await ensureContact(phone, 'quo_call');
  if (!contact) return { action: 'call_completed_no_phone' };

  // Calculate duration in seconds
  let durationSec = null;
  if (obj.answeredAt && obj.completedAt) {
    durationSec = Math.round((new Date(obj.completedAt) - new Date(obj.answeredAt)) / 1000);
  }
  const wasAnswered = !!obj.answeredAt;
  const durationDisplay = durationSec ? `${Math.floor(durationSec/60)}m ${durationSec%60}s` : 'missed';
  const dirLabel = obj.direction === 'incoming' ? 'Inbound' : 'Outbound';
  const content = wasAnswered
    ? `${dirLabel} call — ${durationDisplay}`
    : `${dirLabel} call — missed/unanswered`;

  const callMeta = { quo_call_id: obj.id, from: obj.from, to: obj.to, direction: obj.direction, status: obj.status, answered: wasAnswered, duration_seconds: durationSec, created_at: obj.createdAt, answered_at: obj.answeredAt, completed_at: obj.completedAt, voicemail: obj.voicemail, conversation_id: obj.conversationId };
  await logActivity(contact.id, 'call', obj.direction === 'incoming' ? 'inbound' : 'outbound', content, callMeta);
  await logCommunication(contact.id, 'call', obj.direction === 'incoming' ? 'inbound' : 'outbound', content, callMeta);
  await touchContact(contact.id);
  // Missed inbound call — send AI follow-up SMS
  if (!wasAnswered && obj.direction === 'incoming') {
    const contactName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || null;
    triggerMissedCallSMS(phone, contactName).catch(e => console.warn('[OpenPhone] Missed call SMS error:', e.message));
  }
  return { action: 'call_completed', contactId: contact.id, answered: wasAnswered, duration: durationSec };
}

async function handleCallSummary(obj) {
  // call.summary.completed — Sona/AI-generated summary
  // obj has: callId, summary (array), nextSteps (array)
  // We need to find the contact by callId — look up the call activity we already logged
  const callId = obj.callId;
  
  // Find existing call activity by quo_call_id in metadata
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/activity_log?metadata->>quo_call_id=eq.${callId}&type=eq.call&select=contact_id&limit=1`,
    { headers: supaHeaders }
  );
  const rows = await resp.json();
  const contactId = rows?.[0]?.contact_id;
  if (!contactId) {
    console.log(`[NUI] call.summary: no matching call found for ${callId}`);
    return { action: 'call_summary_orphaned', callId };
  }

  const summaryText = Array.isArray(obj.summary) ? obj.summary.join('\n') : (obj.summary || '');
  const nextStepsText = Array.isArray(obj.nextSteps) ? obj.nextSteps.join('\n') : (obj.nextSteps || '');
  const content = `Summary: ${summaryText}${nextStepsText ? '\n\nNext Steps: ' + nextStepsText : ''}`;

  await logActivity(contactId, 'sona_summary', 'internal', content, {
    call_id: callId,
    summary: obj.summary,
    next_steps: obj.nextSteps,
    status: obj.status,
  });

  // Mark contact as Sona-qualified
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ sona_qualified: true, last_activity_at: new Date().toISOString() })
  });

  // Extract caller name/email from summary and update contact
  const callerInfo = extractCallerInfo(summaryText + ' ' + nextStepsText);
  if (callerInfo.first_name || callerInfo.email) {
    await updateContactInfo(contactId, callerInfo);
  }

  return { action: 'call_summary_logged', contactId };
}

async function handleCallTranscript(obj) {
  const callId = obj.callId;
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/activity_log?metadata->>quo_call_id=eq.${callId}&type=eq.call&select=contact_id&limit=1`,
    { headers: supaHeaders }
  );
  const rows = await resp.json();
  const contactId = rows?.[0]?.contact_id;
  if (!contactId) return { action: 'call_transcript_orphaned', callId };

  // Transcript can be a string or array of dialogue objects
  let transcriptText = '';
  if (typeof obj.transcript === 'string') {
    transcriptText = obj.transcript;
  } else if (Array.isArray(obj.dialogue || obj.transcript)) {
    const dialogue = obj.dialogue || obj.transcript;
    transcriptText = dialogue.map(d => `${d.speaker || d.role || '?'}: ${d.content || d.text || ''}`).join('\n');
  }

  await logActivity(contactId, 'transcript', 'internal', transcriptText, {
    call_id: callId,
    raw_transcript: obj.transcript || obj.dialogue,
  });

  // Extract caller name/email from transcript and update contact
  const callerInfo = extractCallerInfo(transcriptText);
  if (callerInfo.first_name || callerInfo.email) {
    await updateContactInfo(contactId, callerInfo);
  }

  return { action: 'call_transcript_logged', contactId };
}

async function handleCallRecording(obj) {
  const callId = obj.callId;
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/activity_log?metadata->>quo_call_id=eq.${callId}&type=eq.call&select=contact_id&limit=1`,
    { headers: supaHeaders }
  );
  const rows = await resp.json();
  const contactId = rows?.[0]?.contact_id;
  if (!contactId) return { action: 'call_recording_orphaned', callId };

  await logActivity(contactId, 'recording', 'internal', 'Call recording available', {
    call_id: callId,
    recording_url: obj.url || obj.recordingUrl,
    duration: obj.duration,
  });
  return { action: 'call_recording_logged', contactId };
}


// ── Missed inbound call — AI SMS follow-up ───────────────────────────────
async function triggerMissedCallSMS(phone, contactName) {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const OP_KEY  = process.env.OPENPHONE_API_KEY;
  const OP_FROM = process.env.OPENPHONE_PHONE_NUMBER;
  if (!ANTHROPIC_KEY || !OP_KEY || !OP_FROM) return;
  try {
    const nameRef = contactName ? ('Hey ' + contactName.split(' ')[0]) : 'Hey';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 80, messages: [{ role: 'user', content: 'Write a 1-sentence SMS from Faren Young at New Urban Influence (NUI Detroit branding agency). Someone called but no one answered. Sound human and warm. Offer to call back or have them reply. Name: ' + nameRef + '. Under 140 chars, end with "- Faren".' }] })
    });
    const d   = await res.json();
    const sms = d.content?.[0]?.text?.trim();
    if (!sms) return;
    await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: { 'Authorization': OP_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: sms, from: OP_FROM, to: [phone] })
    });
    console.log('[OpenPhone] Missed call SMS sent to', phone);
  } catch(e) { console.warn('[OpenPhone] Missed call SMS failed:', e.message); }
}
// ── Main Handler ──────────────────────────────────────────────────

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Check Supabase config
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[NUI] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const eventType = payload.type;
    const obj = payload.data?.object || {};

    console.log(`[NUI] Quo webhook: ${eventType} | id: ${payload.id}`);

    let result;

    switch (eventType) {
      case 'message.received':
        result = await handleMessageReceived(obj, event.body);
        break;
      case 'message.delivered':
        result = await handleMessageDelivered(obj);
        break;
      case 'call.ringing':
        result = await handleCallRinging(obj);
        break;
      case 'call.completed':
        result = await handleCallCompleted(obj);
        break;
      case 'call.summary.completed':
        result = await handleCallSummary(obj);
        break;
      case 'call.transcript.completed':
        result = await handleCallTranscript(obj);
        break;
      case 'call.recording.completed':
        result = await handleCallRecording(obj);
        break;
      default:
        console.log(`[NUI] Unhandled event type: ${eventType}`);
        result = { action: 'unhandled', type: eventType };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ...result })
    };

  } catch (err) {
    console.error('[NUI] Webhook error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Webhook processing failed' })
    };
  }
};
