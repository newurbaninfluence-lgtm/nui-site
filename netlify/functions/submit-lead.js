// netlify/functions/submit-lead.js
// Handles all service intake form submissions from standalone service pages
// Stores lead + opt-ins to Supabase, tags in OpenPhone, routes email campaign
// Security: rate limiting, input sanitization, required field validation

const { checkRateLimit, getClientIP, rateLimitResponse } = require('./rate-limiter');
const { sanitizeText, sanitizeEmail, sanitizePhone } = require('./sanitizer');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENPHONE_KEY = process.env.OPENPHONE_API_KEY;

async function supabase(path, body, method='POST') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(body)
  });
  return r.json().catch(() => ({}));
}

// Map service to industry tag + drip sequence
const SERVICE_MAP = {
  'brand-kit':     { tag:'Brand Kit', seq:'brand_kit',    industry:'branding' },
  'service-brand': { tag:'Service Brand', seq:'branding', industry:'branding' },
  'product-brand': { tag:'Product Brand', seq:'branding', industry:'branding' },
  'digital-hq':    { tag:'Digital HQ',  seq:'web_design', industry:'web' },
  'digital-staff': { tag:'Digital Staff', seq:'ai_staff', industry:'ai' },
  'street-team':   { tag:'Street Team', seq:'marketing',  industry:'marketing' },
  'publicist':     { tag:'The Publicist', seq:'press',    industry:'press' },
  'event-team':    { tag:'Event Team',  seq:'events',     industry:'events' },
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // Rate limit: 5 submissions per IP per minute
  const ip = getClientIP(event);
  const rl = checkRateLimit(`submit-lead:${ip}`, 5, 60000);
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  let raw;
  try { raw = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }; }

  // Sanitize all inputs
  const data = {
    name:          sanitizeText(raw.name, 100),
    email:         sanitizeEmail(raw.email),
    phone:         sanitizePhone(raw.phone),
    business:      sanitizeText(raw.business, 150),
    service:       sanitizeText(raw.service, 50),
    serviceName:   sanitizeText(raw.serviceName, 100),
    price:         sanitizeText(raw.price, 50),
    bookingChoice: sanitizeText(raw.bookingChoice, 20),
    optinEmail:    Boolean(raw.optinEmail),
    optinSMS:      Boolean(raw.optinSMS),
    optinPush:     Boolean(raw.optinPush),
    source:        sanitizeText(raw.source, 100),
    timestamp:     raw.timestamp,
  };

  const {
    name, email, phone, business,
    service, serviceName, price,
    bookingChoice,
    optinEmail, optinSMS, optinPush,
    source, timestamp,
  } = data;
  const extras = {};

  if (!email && !phone) return { statusCode: 400, body: JSON.stringify({ error: 'Email or phone required' }) };

  const svcInfo = SERVICE_MAP[service] || { tag: serviceName || service, seq: 'general', industry: 'general' };
  const now = new Date().toISOString();
  const isCold = !data.returning || data.returning === 'no';

  // 1. Upsert to leads table
  const leadPayload = {
    name: name || '',
    email: email || '',
    phone: phone || '',
    business_name: business || '',
    service: service || '',
    service_name: serviceName || '',
    price_point: price || '',
    booking_choice: bookingChoice || '',
    optin_email: optinEmail === true || optinEmail === 'yes',
    optin_sms: optinSMS === true || optinSMS === 'yes',
    optin_push: optinPush === true || optinPush === 'yes',
    source_url: source || '',
    is_cold: isCold,
    industry: svcInfo.industry,
    drip_sequence: svcInfo.seq,
    extra_data: JSON.stringify(extras),
    created_at: now,
    site_id: 'newurbaninfluence'
  };

  await supabase('leads', leadPayload).catch(() => {});

  // 2. If opted into SMS — add to SMS list with A2P-compliant consent record
  if (optinSMS === true || optinSMS === 'yes') {
    await supabase('sms_optins', {
      phone: phone || '',
      name: name || '',
      email: email || '',
      service: service || '',
      consent_text: 'User opted in to receive SMS tips, discounts, and updates from New Urban Influence via service intake form',
      consent_source: source || 'service-intake-form',
      consent_timestamp: now,
      optin_method: 'web_form',
      status: 'active',
      site_id: 'newurbaninfluence'
    }).catch(() => {});
  }

  // 3. If opted into push — store subscription reference (push handled client-side)
  if (optinPush === true || optinPush === 'yes') {
    await supabase('push_optins_log', {
      email: email || '',
      phone: phone || '',
      service: service || '',
      source: source || '',
      created_at: now,
      site_id: 'newurbaninfluence'
    }).catch(() => {});
  }

  // 4. Tag in CRM contacts
  await supabase('crm_contacts', {
    name: name || '',
    email: email || '',
    phone: phone || '',
    business_name: business || '',
    tags: [svcInfo.tag, isCold ? 'Cold Lead' : 'Warm Lead', bookingChoice === 'call' ? 'Wants Call' : 'Ready to Pay'],
    source: 'service-page-intake',
    service_interest: service || '',
    optin_email: optinEmail === true || optinEmail === 'yes',
    optin_sms: optinSMS === true || optinSMS === 'yes',
    status: 'new_lead',
    site_id: 'newurbaninfluence',
    created_at: now
  }).catch(() => {});

  // 5. Lead is now in crm_contacts with status='new_lead'. The daily
  // client-email-broadcast cron (10am ET) auto-enrolls them into the
  // industry-routed sequence based on business_category. Cold leads with
  // no matching category fall through to the generic 6-touch warmup.
  // (Legacy drip_enrollments insert removed — old system retired.)

  // 6. Send internal notification SMS via OpenPhone
  if (OPENPHONE_KEY && phone) {
    try {
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { Authorization: OPENPHONE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔥 NEW INTAKE — ${serviceName || service}\nName: ${name || 'Unknown'}\nPhone: ${phone}\nEmail: ${email || ''}\nBusiness: ${business || ''}\nChoice: ${bookingChoice || 'N/A'}\nSMS Opt-in: ${optinSMS ? 'YES' : 'no'}\nEmail Opt-in: ${optinEmail ? 'YES' : 'no'}`,
          from: process.env.OPENPHONE_FROM || '+12484878747',
          to: ['+12484878747']
        })
      });
    } catch(e) {}
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true, message: 'Lead submitted successfully' })
  };
};
