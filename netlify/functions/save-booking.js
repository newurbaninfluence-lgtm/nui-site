// save-booking.js — Netlify Function
// Saves meeting/booking to Supabase, checks for conflicts
// GET ?date=all → returns all bookings
// POST { ...meetingData } → creates booking, returns { meeting }
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // --- GET: Return bookings (all or by date) ---
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const dateFilter = params.date && params.date !== 'all' ? `&date=eq.${params.date}` : '';
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/meetings?select=*&order=date.asc,time.asc${dateFilter}`,
        { headers }
      );
      const rows = await resp.json();
      // Map snake_case DB → camelCase for the portal
      const meetings = Array.isArray(rows) ? rows.map(m => ({
        id:          m.id,
        clientId:    m.client_id,
        clientName:  m.client_name,
        clientEmail: m.client_email,
        clientPhone: m.client_phone,
        service:     m.service,
        type:        m.type,
        date:        m.date,
        time:        m.time,
        status:      m.status,
        source:      m.source,
        outcome:     m.outcome,
        notes:       m.notes,
        createdAt:   m.created_at
      })) : [];
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, meetings })
      };
    }

    // --- POST: Create booking ---
    if (event.httpMethod === 'POST') {
      const meetingData = JSON.parse(event.body || '{}');

      // Check for time slot conflict
      if (meetingData.date && meetingData.time) {
        const conflictResp = await fetch(
          `${SUPABASE_URL}/rest/v1/meetings?date=eq.${meetingData.date}&time=eq.${encodeURIComponent(meetingData.time)}&status=eq.scheduled&select=id`,
          { headers }
        );
        const conflicts = await conflictResp.json();
        if (conflicts?.length > 0) {
          return {
            statusCode: 409,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Time slot conflict',
              message: `The ${meetingData.time} slot on ${meetingData.date} is already booked.`
            })
          };
        }
      }

      // Map camelCase portal fields → snake_case DB columns
      const dbRecord = {
        client_name:  meetingData.clientName  || meetingData.client_name  || null,
        client_email: meetingData.clientEmail || meetingData.client_email || null,
        client_phone: meetingData.clientPhone || meetingData.client_phone || null,
        client_id:    meetingData.clientId    || meetingData.client_id    || null,
        intake_id:    meetingData.intakeId    || meetingData.intake_id    || null,
        service:      meetingData.service     || null,
        type:         meetingData.type        || 'zoom',
        date:         meetingData.date        || null,
        time:         meetingData.time        || null,
        notes:        meetingData.notes       || null,
        status:       meetingData.status      || 'scheduled',
        source:       meetingData.source      || 'manual',
        outcome:      null,
        created_at:   new Date().toISOString()
      };

      // Insert meeting
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/meetings`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(dbRecord)
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Booking save failed: ${resp.status} - ${errBody}`);
      }

      const [meeting] = await resp.json();

      // Auto-create CRM contact if booked from public page
      if (dbRecord.source === 'booking_page' && dbRecord.client_phone) {
        const phone = dbRecord.client_phone.replace(/\D/g,'');
        const cleanPhone = phone.length === 10 ? `+1${phone}` : phone.length === 11 ? `+${phone}` : dbRecord.client_phone;
        const nameParts = (dbRecord.client_name || '').split(' ');
        // Check existing
        const existing = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?phone=eq.${encodeURIComponent(cleanPhone)}&select=id&limit=1`, { headers });
        const contacts = await existing.json();
        if (!contacts?.length) {
          await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              phone: cleanPhone,
              first_name: nameParts[0] || null,
              last_name: nameParts.slice(1).join(' ') || null,
              email: dbRecord.client_email || null,
              source: 'booking_page',
              status: 'qualified',
              lead_score: 8,
              bant_need: dbRecord.service || null,
              last_activity_at: new Date().toISOString()
            })
          }).catch(() => {});
        } else {
          // Update existing contact
          await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contacts[0].id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'qualified', lead_score: 8, last_activity_at: new Date().toISOString() })
          }).catch(() => {});
        }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, meeting })
      };
    }

    // --- PATCH: Update meeting (outcome, status) ---
    if (event.httpMethod === 'PATCH') {
      const updateData = JSON.parse(event.body || '{}');
      const meetingId = updateData.id;
      if (!meetingId) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Meeting ID required' }) };
      }

      // Only allow updating specific fields
      const allowedFields = ['outcome', 'status', 'notes'];
      const patch = {};
      for (const key of allowedFields) {
        if (updateData[key] !== undefined) patch[key] = updateData[key];
      }
      patch.updated_at = new Date().toISOString();

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/meetings?id=eq.${meetingId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(patch)
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Meeting update failed: ${resp.status} - ${errBody}`);
      }

      const updated = await resp.json();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, meeting: updated[0] })
      };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('save-booking error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Booking failed' })
    };
  }
};
