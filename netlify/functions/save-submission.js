// save-submission.js — Netlify Function
// Saves form submissions / service intake to Supabase
// POST { serviceId, serviceName, price, contactName, email, phone, businessName, ... }
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    const headers = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. Save to submissions table
    const submissionResp = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        service_id: data.serviceId || null,
        service_name: data.serviceName || '',
        price: data.price || null,
        contact_name: data.contactName || data.clientName || '',
        email: data.email || '',
        phone: data.phone || data.clientPhone || '',
        business_name: data.businessName || '',
        industry: data.industry || '',
        website: data.website || '',
        status: 'new',
        metadata: data,
        created_at: new Date().toISOString()
      })
    });

    if (!submissionResp.ok) {
      const errBody = await submissionResp.text();
      throw new Error(`Submission save failed: ${submissionResp.status} - ${errBody}`);
    }

    const [submission] = await submissionResp.json();

    // 2. Also create/update a lead record
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          name: data.contactName || data.clientName || data.businessName || 'Unknown',
          email: data.email || '',
          phone: data.phone || data.clientPhone || '',
          business_name: data.businessName || '',
          source: 'website_intake',
          service_interest: data.serviceName || '',
          status: 'new',
          submission_id: submission.id,
          created_at: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn('Lead creation failed (non-fatal):', e.message);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, id: submission.id, submission })
    };
  } catch (err) {
    console.error('save-submission error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Submission save failed' })
    };
  }
};
