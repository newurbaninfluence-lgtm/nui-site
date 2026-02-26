// admin-contact-update.js — One-off utility to update contact info
// POST { phone, first_name, last_name, email, company }
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: '{}' };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No DB' }) };

  const supaHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const { phone, first_name, last_name, email, company, action } = JSON.parse(event.body || '{}');

    // Find contact by phone
    if (action === 'find') {
      const digits = (phone || '').replace(/\D/g, '').slice(-10);
      const e164 = `+1${digits}`;
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/crm_contacts?or=(phone.eq.${encodeURIComponent(phone)},phone.eq.${encodeURIComponent(e164)})&select=*&limit=5`,
        { headers: supaHeaders }
      );
      const rows = await resp.json();
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ contacts: rows }) };
    }

    // Update contact
    if (!phone) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Phone required' }) };

    const digits = phone.replace(/\D/g, '').slice(-10);
    const e164 = `+1${digits}`;

    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (company) updates.company = company;
    updates.last_activity_at = new Date().toISOString();

    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts?or=(phone.eq.${encodeURIComponent(phone)},phone.eq.${encodeURIComponent(e164)})`,
      {
        method: 'PATCH',
        headers: { ...supaHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(updates)
      }
    );
    const result = await resp.json();
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ updated: result }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
