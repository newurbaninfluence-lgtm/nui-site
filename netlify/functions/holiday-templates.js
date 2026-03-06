// Netlify Function: Holiday Drip Template Management
// Admin reads/updates holiday drip email templates stored in Supabase

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  const sbHeaders = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {

    // GET — fetch all 8 week templates
    if (event.httpMethod === 'GET') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/holiday_drip_templates?order=week_number.desc`,
        { headers: sbHeaders }
      );
      const templates = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(templates) };
    }

    // POST — update a specific week's template
    if (event.httpMethod === 'POST') {
      const { week_number, subject, heading, body, cta } = JSON.parse(event.body || '{}');

      if (!week_number) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'week_number required' }) };
      }

      const update = {};
      if (subject !== undefined) update.subject = subject;
      if (heading !== undefined) update.heading = heading;
      if (body !== undefined) update.body = body;
      if (cta !== undefined) update.cta = cta;
      update.updated_at = new Date().toISOString();

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/holiday_drip_templates?week_number=eq.${week_number}`,
        {
          method: 'PATCH',
          headers: { ...sbHeaders, 'Prefer': 'return=representation' },
          body: JSON.stringify(update)
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Update failed: ${res.status} ${errText}`);
      }

      const updated = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, template: updated[0] }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('holiday-templates error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
