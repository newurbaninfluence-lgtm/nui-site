// send-sms.js — Netlify Function
// Sends SMS via OpenPhone API
// Env vars: OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { to, message, clientId } = JSON.parse(event.body || '{}');

    if (!to || !message) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required fields: to, message' }) };
    }

    const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
    const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;

    if (!OPENPHONE_API_KEY || !FROM_NUMBER_ID) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'OpenPhone not configured. Set OPENPHONE_API_KEY and OPENPHONE_PHONE_NUMBER.' }) };
    }

    // Send via OpenPhone API
    const resp = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': OPENPHONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message,
        to: [to],
        from: FROM_NUMBER_ID
      })
    });

    const result = await resp.json();
    if (!resp.ok) {
      throw new Error(result.message || result.error || `OpenPhone API error: ${resp.status}`);
    }

    // Log to Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
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
          message,
          client_id: clientId || null,
          metadata: { to, openphone_id: result?.data?.id, from_number_id: FROM_NUMBER_ID },
          created_at: new Date().toISOString()
        })
      }).catch(err => console.warn('SMS log to Supabase failed:', err.message));
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, messageId: result?.data?.id || 'sent' })
    };
  } catch (err) {
    console.error('send-sms error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'SMS send failed' })
    };
  }
};
