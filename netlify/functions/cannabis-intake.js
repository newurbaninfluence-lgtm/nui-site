// netlify/functions/cannabis-intake.js
// Cannabis brand intake — correct schema for leads + crm_contacts tables

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
  if (!r.ok) {
    const err = await r.text();
    console.error(`[cannabis-intake] ${table} insert failed:`, err);
  }
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
    name = '',
    email = '',
    phone = '',
    business = '',
    price = '',
    bookingChoice = 'call',
    optinEmail = true,
    optinSMS = false,
    optinPush = false,
    source = '',
    extra = {}
  } = raw;

  if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };

  const now = new Date().toISOString();
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Build a readable message summary from all intake answers
  const summary = [
    extra.biz_type        ? `Business Type: ${extra.biz_type}`             : '',
    extra.biz_status      ? `Status: ${extra.biz_status}`                  : '',
    extra.target_audience ? `Target Audience: ${extra.target_audience}`    : '',
    extra.location        ? `Location: ${extra.location}`                  : '',
    extra.has_brand       ? `Existing Branding: ${extra.has_brand}`        : '',
    extra.brand_needs     ? `Brand Needs: ${extra.brand_needs}`            : '',
    extra.aesthetic       ? `Aesthetic: ${extra.aesthetic}`                : '',
    extra.brand_inspo     ? `Brand Inspo: ${extra.brand_inspo}`            : '',
    extra.needs_website   ? `Website: ${extra.needs_website}`              : '',
    extra.site_type       ? `Site Type: ${extra.site_type}`                : '',
    extra.site_pages      ? `Pages: ${extra.site_pages}`                   : '',
    extra.site_inspo      ? `Site Inspo: ${extra.site_inspo}`              : '',
    extra.needs_packaging ? `Packaging: ${extra.needs_packaging}`          : '',
    extra.packaging_types ? `Label Types: ${extra.packaging_types}`        : '',
    extra.print_materials ? `Print / Signage: ${extra.print_materials}`    : '',
    extra.sku_count       ? `SKU Count: ${extra.sku_count}`                : '',
    extra.marketing_needs ? `Marketing: ${extra.marketing_needs}`          : '',
    extra.social_platforms? `Social: ${extra.social_platforms}`            : '',
    extra.challenges      ? `Challenges: ${extra.challenges}`              : '',
    extra.timeline        ? `Timeline: ${extra.timeline}`                  : '',
    extra.budget          ? `Budget: ${extra.budget}`                      : '',
    extra.referral_source ? `Found Us Via: ${extra.referral_source}`       : '',
    extra.contact_pref    ? `Preferred Contact: ${extra.contact_pref}`     : '',
    extra.notes           ? `Notes: ${extra.notes}`                        : '',
  ].filter(Boolean).join('\n');

  // 1. leads table
  const leadsOk = await sbInsert('leads', {
    name,
    email,
    phone,
    business,
    service:        'cannabis-intake',
    budget:         price || extra.budget || '',
    message:        summary,
    source:         source || 'cannabis-intake-form',
    status:         'new',
    site_id:        'newurbaninfluence',
    optin_push:     optinPush,
    booking_choice: bookingChoice || extra.contact_pref || 'call',
    is_cold:        true,
    drip_sequence:  'cannabis',
    industry:       'cannabis',
    extra_data:     JSON.stringify(extra),
    created_at:     now,
  });

  // 2. crm_contacts table
  const crmOk = await sbInsert('crm_contacts', {
    first_name:      firstName,
    last_name:       lastName,
    email,
    phone,
    company:         business,
    status:          'new_lead',
    source:          'cannabis-intake-form',
    tags:            ['Cannabis Brand', 'Intake Form', extra.biz_type || '', extra.biz_status || ''].filter(Boolean),
    service_interest:'cannabis-intake',
    budget_range:    price || extra.budget || '',
    timeline:        extra.timeline || '',
    industry:        'cannabis',
    business_type:   extra.biz_type || '',
    notes:           summary,
    metadata:        extra,
    created_at:      now,
  });

  console.log(`[cannabis-intake] leads=${leadsOk} crm=${crmOk} email=${email}`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, leads: leadsOk, crm: crmOk })
  };
};
