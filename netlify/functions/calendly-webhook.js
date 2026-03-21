// calendly-webhook.js — Netlify Function
// Receives Calendly webhook events (invitee.created, invitee.canceled)
// Saves/updates meetings in Supabase, auto-creates leads
// Webhook URL: https://newurbaninfluence.com/.netlify/functions/calendly-webhook
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, CALENDLY_WEBHOOK_SECRET (optional)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Calendly-Webhook-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};


// ── Automation env vars ───────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SMTP_USER     = process.env.SMTP_USER;
const SMTP_PASS     = process.env.SMTP_PASS;
const SMTP_HOST     = process.env.SMTP_HOST || 'smtp.hostinger.com';
const OP_KEY        = process.env.OPENPHONE_API_KEY;
const OP_FROM       = process.env.OPENPHONE_PHONE_NUMBER;

async function triggerBookingConfirmation(clientName, clientEmail, clientPhone, serviceInterest, meetingDate, meetingTime, zoomLink) {
  if (!ANTHROPIC_KEY) return;
  const firstName = clientName.split(' ')[0];
  const context = 'Name: ' + clientName + '. Service: ' + (serviceInterest || 'branding consultation') + '. Date: ' + meetingDate + ' at ' + meetingTime + ' ET.';
  if (clientEmail && SMTP_USER) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 250, messages: [{ role: 'user', content: 'You are Faren Young at NUI Detroit branding agency. Write a warm booking confirmation email body (no subject, no Dear). Thank them, confirm date/time, mention what to expect. Zoom: ' + (zoomLink||'will be sent separately') + '. Detroit energy. Context: ' + context + '. Under 120 words.' }] })
      });
      const d = await res.json();
      const emailBody = d.content?.[0]?.text?.trim();
      if (emailBody) {
        const nodemailer = require('nodemailer');
        const mailer = nodemailer.createTransport({ host: SMTP_HOST, port: 465, secure: true, auth: { user: SMTP_USER, pass: SMTP_PASS } });
        await mailer.sendMail({
          from: '"Faren Young | NUI" <' + SMTP_USER + '>',
          to: clientEmail,
          subject: "You're booked — NUI Strategy Call " + meetingDate,
          text: emailBody,
          html: '<div style="font-family:sans-serif;max-width:600px;line-height:1.7;">' + emailBody.replace(/\n/g,'<br>') + '<br><br><img src="https://newurbaninfluence.com/assets/images/nui-logo.png" alt="NUI" style="height:40px;"></div>'
        });
        console.log('[Calendly] Confirmation email sent to', clientEmail);
      }
    } catch(e) { console.warn('[Calendly] Confirm email failed:', e.message); }
  }
  if (clientPhone && OP_KEY && OP_FROM) {
    try {
      const sms = 'Hey ' + firstName + ", you're confirmed for your NUI strategy call on " + meetingDate + ' at ' + meetingTime + ' ET. See you then — Faren';
      await fetch('https://api.openphone.com/v1/messages', { method: 'POST', headers: { 'Authorization': OP_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: sms, from: OP_FROM, to: [clientPhone] }) });
      console.log('[Calendly] Confirmation SMS sent to', clientPhone);
    } catch(e) { console.warn('[Calendly] Confirm SMS failed:', e.message); }
  }
}

async function triggerCancellationNotice(clientName, clientEmail, clientPhone, meetingDate, meetingTime) {
  const firstName = clientName.split(' ')[0];
  if (clientEmail && SMTP_USER) {
    try {
      const nodemailer = require('nodemailer');
      const mailer = nodemailer.createTransport({ host: SMTP_HOST, port: 465, secure: true, auth: { user: SMTP_USER, pass: SMTP_PASS } });
      await mailer.sendMail({
        from: '"Faren Young | NUI" <' + SMTP_USER + '>',
        to: clientEmail,
        subject: 'Your NUI call on ' + meetingDate + ' has been canceled',
        html: '<div style="font-family:sans-serif;max-width:600px;"><p>Hey ' + firstName + ',</p><p>Your call on <strong>' + meetingDate + ' at ' + meetingTime + '</strong> was canceled.</p><p>Rebook anytime: <a href="https://newurbaninfluence.com/book">newurbaninfluence.com/book</a></p><p>— Faren</p></div>'
      });
    } catch(e) { console.warn('[Calendly] Cancel email failed:', e.message); }
  }
  if (clientPhone && OP_KEY && OP_FROM) {
    try {
      await fetch('https://api.openphone.com/v1/messages', { method: 'POST', headers: { 'Authorization': OP_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'Hey ' + firstName + ', your NUI call on ' + meetingDate + ' was canceled. Rebook: newurbaninfluence.com/book — Faren', from: OP_FROM, to: [clientPhone] }) });
    } catch(e) { console.warn('[Calendly] Cancel SMS failed:', e.message); }
  }
}
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'POST only' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  const supaHeaders = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const payload = JSON.parse(event.body || '{}');
    const eventType = payload.event; // invitee.created or invitee.canceled
    const invitee = payload.payload?.invitee || {};
    const scheduledEvent = payload.payload?.scheduled_event || payload.payload?.event || {};
    const questionsAndAnswers = payload.payload?.questions_and_answers || [];

    console.log(`Calendly webhook: ${eventType}`, JSON.stringify({ invitee: invitee.name, email: invitee.email }));

    // Extract data from Calendly payload
    const clientName = invitee.name || 'Unknown';
    const clientEmail = invitee.email || '';
    const clientPhone = extractPhone(questionsAndAnswers);
    const serviceInterest = extractService(questionsAndAnswers);
    const calendlyEventUri = scheduledEvent.uri || invitee.event || '';
    const calendlyInviteeUri = invitee.uri || '';

    // Parse date and time from scheduled event
    const startTime = scheduledEvent.start_time || scheduledEvent.start || '';
    let meetingDate = '';
    let meetingTime = '';

    if (startTime) {
      const dt = new Date(startTime);
      meetingDate = dt.toISOString().split('T')[0]; // YYYY-MM-DD
      meetingTime = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Detroit' });
    }

    // --- INVITEE CREATED: Save new meeting ---
    if (eventType === 'invitee.created') {
      // Check for duplicate (same email + date + time)
      const dupeCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/meetings?client_email=eq.${encodeURIComponent(clientEmail)}&date=eq.${meetingDate}&source=eq.calendly&select=id`,
        { headers: supaHeaders }
      );
      const dupes = await dupeCheck.json();
      if (dupes?.length > 0) {
        console.log('Duplicate Calendly booking, skipping');
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: 'duplicate_skipped' }) };
      }

      // Insert meeting
      const meetingData = {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service: serviceInterest || 'Not specified',
        type: 'zoom',
        date: meetingDate,
        time: meetingTime,
        status: 'scheduled',
        outcome: null,
        source: 'calendly',
        metadata: JSON.stringify({
          calendly_event_uri: calendlyEventUri,
          calendly_invitee_uri: calendlyInviteeUri,
          zoom_link: scheduledEvent.location?.join_url || scheduledEvent.location?.data?.url || ''
        }),
        created_at: new Date().toISOString()
      };

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/meetings`, {
        method: 'POST',
        headers: { ...supaHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(meetingData)
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Meeting save failed: ${resp.status} - ${errBody}`);
      }

      const [meeting] = await resp.json();

      // Also upsert into leads table (create if not exists)
      await upsertLead(SUPABASE_URL, supaHeaders, {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        service: serviceInterest,
        source: 'calendly',
        meeting_id: meeting.id
      });

      console.log(`Meeting saved: ${meeting.id}, Lead upserted for ${clientEmail}`);
      const zoomLink = scheduledEvent.location?.join_url || scheduledEvent.location?.data?.url || '';
      triggerBookingConfirmation(clientName, clientEmail, clientPhone, serviceInterest, meetingDate, meetingTime, zoomLink).catch(e => console.warn('[Calendly] Confirm failed:', e.message));
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ status: 'meeting_created', meeting_id: meeting.id })
      };
    }

    // --- INVITEE CANCELED: Update meeting status ---
    if (eventType === 'invitee.canceled') {
      // Find the meeting by Calendly event URI in metadata
      const searchResp = await fetch(
        `${SUPABASE_URL}/rest/v1/meetings?client_email=eq.${encodeURIComponent(clientEmail)}&date=eq.${meetingDate}&source=eq.calendly&select=id&order=created_at.desc&limit=1`,
        { headers: supaHeaders }
      );
      const matches = await searchResp.json();

      if (matches?.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/meetings?id=eq.${matches[0].id}`, {
          method: 'PATCH',
          headers: supaHeaders,
          body: JSON.stringify({ status: 'canceled', outcome: 'canceled', updated_at: new Date().toISOString() })
        });
        console.log(`Meeting ${matches[0].id} canceled`);
      }
      triggerCancellationNotice(clientName, clientEmail, clientPhone, meetingDate, meetingTime).catch(e => console.warn('[Calendly] Cancel notice failed:', e.message));
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ status: 'meeting_canceled' })
      };
    }

    // Unknown event type — acknowledge anyway
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ status: 'ignored', event: eventType }) };

  } catch (err) {
    console.error('Calendly webhook error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};

// --- Helper: Extract phone from Calendly Q&A ---
function extractPhone(qAndA) {
  if (!Array.isArray(qAndA)) return '';
  const phoneQ = qAndA.find(q =>
    q.question?.toLowerCase().includes('phone') ||
    q.question?.toLowerCase().includes('number') ||
    q.question?.toLowerCase().includes('cell')
  );
  return phoneQ?.answer || '';
}

// --- Helper: Extract service interest from Calendly Q&A ---
function extractService(qAndA) {
  if (!Array.isArray(qAndA)) return '';
  const serviceQ = qAndA.find(q =>
    q.question?.toLowerCase().includes('service') ||
    q.question?.toLowerCase().includes('interest') ||
    q.question?.toLowerCase().includes('looking for') ||
    q.question?.toLowerCase().includes('project') ||
    q.question?.toLowerCase().includes('help with')
  );
  return serviceQ?.answer || '';
}

// --- Helper: Upsert lead in Supabase leads table ---
async function upsertLead(supabaseUrl, headers, leadData) {
  try {
    // Check if lead with this email already exists
    const checkResp = await fetch(
      `${supabaseUrl}/rest/v1/leads?email=eq.${encodeURIComponent(leadData.email)}&select=id,meeting_count`,
      { headers }
    );
    const existing = await checkResp.json();

    if (existing?.length > 0) {
      // Update existing lead: increment meeting count, update last activity
      await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          meeting_count: (existing[0].meeting_count || 0) + 1,
          last_meeting_id: leadData.meeting_id,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
    } else {
      // Create new lead
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || '',
          service: leadData.service || '',
          source: leadData.source || 'calendly',
          status: 'new',
          meeting_count: 1,
          last_meeting_id: leadData.meeting_id,
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      });
    }
  } catch (err) {
    console.error('Lead upsert error:', err);
    // Non-fatal — meeting was still saved
  }
}
