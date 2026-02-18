// get-communications.js — Netlify Function
// GET ?limit=100 → returns communications from Supabase
// PATCH { action: 'log', channel, direction, subject, message, client_id, metadata } → logs activity
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS'
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
    // --- GET: Return communications ---
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const limit = parseInt(params.limit) || 100;
      const clientId = params.clientId;

      let url = `${SUPABASE_URL}/rest/v1/communications?select=*&order=created_at.desc&limit=${limit}`;
      if (clientId) url += `&client_id=eq.${clientId}`;

      const resp = await fetch(url, { headers });
      const communications = await resp.json();

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, communications: communications || [] })
      };
    }

    // --- PATCH: Log activity ---
    if (event.httpMethod === 'PATCH') {
      const data = JSON.parse(event.body || '{}');

      if (data.action === 'log') {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            channel: data.channel || 'system',
            direction: data.direction || 'internal',
            subject: data.subject || '',
            message: data.message || '',
            client_id: data.client_id || null,
            metadata: data.metadata || {},
            unread: false,
            created_at: new Date().toISOString()
          })
        });

        if (!resp.ok) {
          const errBody = await resp.text();
          throw new Error(`Communication log failed: ${resp.status} - ${errBody}`);
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, action: 'logged' })
        };
      }

      // Mark as read
      if (data.action === 'markRead' && data.ids) {
        const ids = Array.isArray(data.ids) ? data.ids : [data.ids];
        for (const id of ids) {
          await fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ unread: false })
          });
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, action: 'marked_read', count: ids.length })
        };
      }

      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('get-communications error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Communications fetch failed' })
    };
  }
};
