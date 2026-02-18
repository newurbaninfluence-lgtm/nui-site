// save-booking.js — Netlify Function
// Saves meeting/booking to Supabase, checks for conflicts
// GET ?date=all → returns all bookings
// POST { ...meetingData } → creates booking, returns { meeting }
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
    // --- GET: Return all bookings ---
    if (event.httpMethod === 'GET') {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/meetings?select=*&order=date.asc,time.asc`,
        { headers }
      );
      const meetings = await resp.json();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, meetings: meetings || [] })
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

      // Insert meeting
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/meetings`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...meetingData,
          status: meetingData.status || 'scheduled',
          created_at: new Date().toISOString()
        })
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Booking save failed: ${resp.status} - ${errBody}`);
      }

      const [meeting] = await resp.json();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, meeting })
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
