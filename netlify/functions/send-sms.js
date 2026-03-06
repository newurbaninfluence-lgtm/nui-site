// send-sms.js — Netlify Function
// Sends SMS via OpenPhone API
// Sub-accounts must supply their own OpenPhone keys — NUI's keys are never shared.
// Env vars (NUI master only): OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const { requireAdmin } = require('./utils/security');
const { getBrand, hasOpenPhone } = require('./utils/agency-brand');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
    const { to, message, clientId, contactId, agency_id } = JSON.parse(event.body || '{}');

    if (!to || !message) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required fields: to, message' }) };
    }

    // Resolve credentials — sub-accounts use their own keys, never NUI's.
    const brand = await getBrand(agency_id || null);

    if (agency_id && !hasOpenPhone(brand)) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'SMS not configured',
          detail: 'This agency has not set up their own OpenPhone credentials yet. Go to Settings → Integrations to add them.'
        })
      };
    }

    // NUI master uses env vars; sub-accounts use their stored keys.
    const isNUI = !agency_id;
    const OPENPHONE_API_KEY = brand.openphone_key || (isNUI ? process.env.OPENPHONE_API_KEY : null);
    const FROM_NUMBER_ID    = brand.openphone_number || (isNUI ? process.env.OPENPHONE_PHONE_NUMBER : null);

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
      const now = new Date().toISOString();
      // Log to communications table
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
          subject: null,
          client_id: contactId || clientId || null,
          metadata: { to, openphone_id: result?.data?.id, from_number_id: FROM_NUMBER_ID },
          created_at: now
        })
      }).catch(err => console.warn('SMS log to Supabase failed:', err.message));

      // Also log to activity_log for Contact Hub timeline
      const cId = contactId || clientId;
      if (cId) {
        await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            contact_id: cId,
            type: 'sms',
            event_type: 'sms_sent',
            direction: 'outbound',
            content: message,
            metadata: { to, openphone_id: result?.data?.id },
            created_at: now
          })
        }).catch(err => console.warn('Activity log failed:', err.message));
      }
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
