// netlify/functions/cannabis-intake.js
// Cannabis brand intake form handler
// Writes to leads + crm_contacts (same schema as submit-lead.js)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function sbInsert(table, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(body)
  });
  return r.ok;
}

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let raw;
  try { raw = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const {
    name = '', email = '', phone = '', business = '',
    service = 'cannabis-intake', serviceName = 'Cannabis Brand Intake',
    price = '', bookingChoice = 'call',
    optinEmail = true, optinSMS = false, optinPush = false,
    source = '', timestamp, extra = {}
  } = raw;

  if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };

  const now = new Date().toISOString();

  // 1. Write to leads table
  await sbInsert('leads', {
    name,
    email,
    phone,
    business_name: business,
    service,
    service_name: serviceName,
    price_point: price,
    booking_choice: bookingChoice,
    optin_email: optinEmail,
    optin_sms: optinSMS,
    optin_push: optinPush,
    source_url: source,
    industry: 'cannabis',
    drip_sequence: 'cannabis',
    extra_data: JSON.stringify(extra),
    is_cold: true,
    created_at: now,
    site_id: 'newurbaninfluence'
  }).catch(() => {});

  // 2. Write to crm_contacts
  await sbInsert('crm_contacts', {
    name,
    email,
    phone,
    business_name: business,
    tags: ['Cannabis Brand', 'Intake Form', extra.biz_type || '', extra.biz_status || ''].filter(Boolean),
    source: 'cannabis-intake-form',
    service_interest: 'cannabis-intake',
    optin_email: optinEmail,
    optin_sms: optinSMS,
    status: 'new_lead',
    notes: [
      extra.biz_type      ? `Type: ${extra.biz_type}`         : '',
      extra.biz_status    ? `Status: ${extra.biz_status}`     : '',
      extra.location      ? `Location: ${extra.location}`     : '',
      extra.has_brand     ? `Has Branding: ${extra.has_brand}`: '',
      extra.aesthetic     ? `Aesthetic: ${extra.aesthetic}`   : '',
      extra.services      ? `Services: ${extra.services}`     : '',
      extra.timeline      ? `Timeline: ${extra.timeline}`     : '',
      extra.challenges    ? `Challenges: ${extra.challenges}` : '',
      extra.budget        ? `Budget: ${extra.budget}`         : '',
      extra.notes         ? `Notes: ${extra.notes}`           : '',
    ].filter(Boolean).join('\n'),
    site_id: 'newurbaninfluence',
    created_at: now
  }).catch(() => {});

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
