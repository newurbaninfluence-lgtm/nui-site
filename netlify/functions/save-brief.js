// save-brief.js — Saves client brand questionnaire responses to Supabase
// POST { clientId, clientName, clientEmail, responses: { q1: "...", q2: "...", ... } }
// Also creates/updates a crm_contacts record linking brief data

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // GET — fetch briefs (optionally by clientId)
  if (event.httpMethod === 'GET') {
    const clientId = event.queryStringParameters?.clientId;
    let url = `${SUPABASE_URL}/rest/v1/client_briefs?order=created_at.desc&limit=50`;
    if (clientId) url = `${SUPABASE_URL}/rest/v1/client_briefs?client_id=eq.${clientId}&order=created_at.desc&limit=1`;
    
    try {
      const resp = await fetch(url, { headers });
      const data = await resp.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, briefs: data }) };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    
    if (!data.responses || Object.keys(data.responses).length === 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No questionnaire responses provided' }) };
    }

    const briefRecord = {
      client_id: data.clientId || null,
      client_name: data.clientName || '',
      client_email: data.clientEmail || '',
      client_phone: data.clientPhone || '',
      service_type: data.serviceType || 'branding',
      responses: data.responses,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert — if a brief exists for this client, update it
    let url = `${SUPABASE_URL}/rest/v1/client_briefs`;
    let method = 'POST';
    
    if (data.clientId) {
      // Check if brief exists
      const checkResp = await fetch(
        `${SUPABASE_URL}/rest/v1/client_briefs?client_id=eq.${data.clientId}&limit=1`,
        { headers }
      );
      const existing = await checkResp.json();
      
      if (existing && existing.length > 0) {
        // Update existing
        url = `${SUPABASE_URL}/rest/v1/client_briefs?client_id=eq.${data.clientId}`;
        method = 'PATCH';
        delete briefRecord.created_at;
        delete briefRecord.client_id;
      }
    }

    const saveResp = await fetch(url, {
      method,
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(briefRecord)
    });

    if (!saveResp.ok) {
      const errText = await saveResp.text();
      // If table doesn't exist, create it
      if (errText.includes('relation') && errText.includes('does not exist')) {
        // Auto-create table
        const createSQL = `
          CREATE TABLE IF NOT EXISTS client_briefs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id TEXT,
            client_name TEXT,
            client_email TEXT,
            client_phone TEXT,
            service_type TEXT DEFAULT 'branding',
            responses JSONB DEFAULT '{}',
            status TEXT DEFAULT 'submitted',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sql: createSQL })
        });
        
        // Retry save
        const retryResp = await fetch(`${SUPABASE_URL}/rest/v1/client_briefs`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(briefRecord)
        });
        const retryData = await retryResp.json();
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, brief: retryData }) };
      }
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: errText }) };
    }

    const result = await saveResp.json();

    // Also send notification email to admin
    try {
      const { SMTP_HOST, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;
      if (ADMIN_EMAIL) {
        await fetch(`${SUPABASE_URL.replace('supabase.co','functions.supabase.co')}/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: ADMIN_EMAIL,
            subject: `New Brand Brief from ${data.clientName || 'Client'}`,
            text: `A client has submitted their brand questionnaire.\n\nClient: ${data.clientName}\nEmail: ${data.clientEmail}\nService: ${data.serviceType}\n\nView in your NUI dashboard.`
          })
        }).catch(() => {});
      }
    } catch(e) { /* notification is optional */ }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, brief: result })
    };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
