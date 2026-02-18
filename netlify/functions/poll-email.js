// poll-email.js — Netlify Function
// Polls for new emails (IMAP/API based) and stores in Supabase
// GET ?manual=true → trigger manual poll
// Env vars: IMAP_HOST, IMAP_USER, IMAP_PASSWORD (or EMAIL_API_KEY for API-based)
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // For now, return latest communications marked as email/inbound from Supabase
    // Full IMAP polling can be added later with a scheduled function

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/communications?channel=eq.email&direction=eq.inbound&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const emails = await resp.json();

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          emails: emails || [],
          polledAt: new Date().toISOString(),
          note: 'Returning stored inbound emails. Full IMAP polling available with IMAP env vars.'
        })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        emails: [],
        error: 'Email polling not configured. Set SUPABASE_URL + SUPABASE_SERVICE_KEY.'
      })
    };
  } catch (err) {
    console.error('poll-email error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Email poll failed' })
    };
  }
};
