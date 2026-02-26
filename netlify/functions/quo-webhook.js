const { createClient } = require('@supabase/supabase-js');

// =====================================================
// Quo Phone System Webhook
// Receives call + text events, creates/updates contacts
// Webhook URL: https://newurbaninfluence.com/.netlify/functions/quo-webhook
// =====================================================

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method not allowed' };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const payload = JSON.parse(event.body);
    const supabase = createClient(url, key);

    console.log('📞 Quo webhook received:', payload.type || payload.event_type || 'unknown');

    // Normalize payload — Quo sends different shapes for calls vs texts
    const eventType = payload.type || payload.event_type || 'unknown';
    const phone = normalizePhone(payload.from || payload.phone || payload.caller_number || '');
    const callerName = payload.caller_name || payload.from_name || payload.name || null;
    const message = payload.body || payload.message || payload.transcript || payload.summary || '';
    const direction = payload.direction || 'inbound';
    const duration = payload.duration || payload.call_duration || null;
    const recordingUrl = payload.recording_url || payload.recording || null;
    const quoContactId = payload.contact_id || payload.quo_contact_id || null;

    if (!phone) {
      console.warn('Quo webhook: no phone number in payload');
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true, skipped: 'no phone' }) };
    }

    // Find or create contact by phone
    let contact = null;
    const { data: existing } = await supabase.from('crm_contacts')
      .select('*').eq('phone', phone).maybeSingle();

    if (existing) {
      contact = existing;

      // Update contact with any new info from Quo
      const updates = { last_activity_at: new Date().toISOString() };
      if (callerName && (!existing.first_name || existing.first_name === 'Unknown')) {
        const parts = callerName.trim().split(/\s+/);
        updates.first_name = parts[0];
        if (parts.length > 1) updates.last_name = parts.slice(1).join(' ');
      }
      if (quoContactId && !existing.quo_contact_id) {
        updates.quo_contact_id = quoContactId;
      }
      // If they're calling us, they're at least contacted
      if (direction === 'inbound' && existing.status === 'new_lead') {
        updates.status = 'contacted';
      }

      await supabase.from('crm_contacts').update(updates).eq('id', existing.id);
      console.log('✅ Updated existing contact:', existing.id, phone);

    } else {
      // Create new contact from call/text
      const nameParts = callerName ? callerName.trim().split(/\s+/) : [];
      const newContact = {
        first_name: nameParts[0] || null,
        last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        phone: phone,
        source: eventType.includes('text') || eventType.includes('sms') ? 'quo_text' : 'quo_call',
        status: 'new_lead',
        quo_contact_id: quoContactId,
        last_activity_at: new Date().toISOString()
      };

      const { data: created, error } = await supabase.from('crm_contacts')
        .insert(newContact).select().single();

      if (error) {
        console.error('Quo contact create error:', error.message);
        return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: error.message }) };
      }
      contact = created;
      console.log('✅ Created new contact from Quo:', created.id, phone);
    }

    // Log the activity
    const activityType = eventType.includes('text') || eventType.includes('sms') ? 'text' : 'call';
    const activityContent = activityType === 'call'
      ? (message || `${direction} call${duration ? ' (' + Math.round(duration / 60) + ' min)' : ''}`)
      : (message || `${direction} text message`);

    await supabase.from('activity_log').insert({
      contact_id: contact.id,
      type: activityType,
      direction: direction,
      content: activityContent,
      metadata: {
        quo_event: eventType,
        duration: duration,
        recording_url: recordingUrl,
        raw_payload: payload
      },
      read: false
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ ok: true, contact_id: contact.id, action: existing ? 'updated' : 'created' })
    };

  } catch (err) {
    console.error('Quo webhook error:', err);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: err.message }) };
  }
};

function normalizePhone(raw) {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (digits.startsWith('+')) return digits;
  if (digits.length >= 10) return '+' + digits;
  return null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}
