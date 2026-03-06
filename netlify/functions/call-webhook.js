// call-webhook.js — Netlify Function
// Catches OpenPhone call.completed + call.transcript.completed webhooks
// Stores recording URL, transcript, and summary in Supabase
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method not allowed' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const eventType = payload.type || payload.event || '';
    const callData = payload.data?.object || payload.data || {};

    console.log(`📞 Call webhook: ${eventType}`, JSON.stringify(callData).slice(0, 500));

    // Extract call info — handle various OpenPhone payload shapes
    const callId = callData.id || callData.callId || callData.call_id || null;
    const direction = callData.direction || 'incoming';
    const from = callData.from || callData.callerNumber || null;
    const to = callData.to || callData.receiverNumber || null;
    const duration = callData.duration || callData.voicemailDuration || 0;
    const recordingUrl = callData.recordingUrl || callData.recording?.url || callData.voicemailUrl || null;
    const transcript = callData.transcript || callData.transcription?.text || null;
    const summary = callData.summary || callData.aiSummary || null;
    const status = callData.status || 'completed';
    const createdAt = callData.createdAt || callData.completedAt || new Date().toISOString();

    // Determine the client's phone number
    const clientPhone = direction === 'incoming' ? from : to;
    if (!clientPhone) {
      console.log('Call webhook: No phone number found');
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ skipped: 'no phone' }) };
    }

    // Clean phone for lookup
    let cleanPhone = clientPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '+1' + cleanPhone;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) cleanPhone = '+' + cleanPhone;

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };

    // Look up contact by phone
    const contactRes = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts?phone=eq.${encodeURIComponent(cleanPhone)}&limit=1`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const contacts = await contactRes.json();
    const contact = contacts?.[0] || null;
    const contactId = contact?.id || null;

    // Store call recording in communications table
    await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        channel: 'call',
        direction: direction === 'incoming' ? 'inbound' : 'outbound',
        message: summary || transcript || `Call ${direction} - ${Math.round(duration)}s`,
        client_id: contactId,
        metadata: {
          call_id: callId,
          from,
          to,
          duration,
          recording_url: recordingUrl,
          transcript,
          summary,
          status,
          handler: 'call-webhook'
        },
        created_at: createdAt
      })
    });

    // Log to activity_log for Contact Hub timeline
    if (contactId) {
      const durationStr = duration ? `${Math.floor(duration/60)}m ${Math.round(duration%60)}s` : 'unknown duration';
      let activityContent = `📞 ${direction === 'incoming' ? 'Incoming' : 'Outgoing'} call (${durationStr})`;
      if (summary) activityContent += `\n📝 ${summary}`;
      if (recordingUrl) activityContent += `\n🎙️ Recording available`;

      await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contact_id: contactId,
          type: 'call',
          event_type: recordingUrl ? 'recording' : 'call',
          direction: direction === 'incoming' ? 'inbound' : 'outbound',
          content: activityContent,
          metadata: {
            call_id: callId,
            duration,
            recording_url: recordingUrl,
            transcript,
            summary,
            from,
            to
          },
          read: false,
          created_at: createdAt
        })
      });

      // Update contact's last_activity_at
      await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ last_activity_at: new Date().toISOString() })
      });

      console.log(`✅ Call logged for contact ${contactId} — recording: ${!!recordingUrl}`);
    } else {
      console.log(`⚠️ Call from ${clientPhone} — no matching contact found`);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, contactId, hasRecording: !!recordingUrl })
    };

  } catch (err) {
    console.error('Call webhook error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
