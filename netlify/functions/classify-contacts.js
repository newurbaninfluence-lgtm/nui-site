// classify-contacts.js — AI-powered business type/category classification
// Reads crm_contacts with company IS NOT NULL AND business_type IS NULL,
// batches them through Claude Sonnet, writes back business_type + business_category.
//
// Usage:
//   POST /.netlify/functions/classify-contacts
//   Body (optional): { batch_size: 20, dry_run: false }
//   Header: X-Admin-Token: <ADMIN_SECRET>

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('./utils/security');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

const CATEGORIES = [
  'restaurant','cafe','salon','barbershop','retail','ecommerce','photography','videography',
  'law','real_estate','healthcare','dental','fitness','trades','construction','automotive',
  'nonprofit','tech','saas','agency','consulting','education','event_planning','catering',
  'music','fashion','beauty','home_services','cleaning','landscaping','financial','accounting',
  'other'
];

async function classifyBatch(contacts) {
  const prompt = `You are classifying small businesses for a Detroit branding agency's CRM. For each business below, determine:
1. business_type: "service" (sells services/time), "product" (sells physical/digital goods), or "both"
2. business_category: ONE of: ${CATEGORIES.join(', ')}

Respond with ONLY a JSON array, no other text. One object per input in the same order:
[{"id":"...","business_type":"service","business_category":"law"}]

If unclear, default to business_type:"service" and business_category:"other".

Businesses to classify:
${contacts.map(c => `- id=${c.id} | company=${(c.company||'').slice(0,80)} | notes=${(c.notes||'').slice(0,100)} | industry=${c.industry||''}`).join('\n')}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API ${resp.status}: ${err.slice(0,300)}`);
  }

  const data = await resp.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in model response: ' + text.slice(0,200));

  return JSON.parse(match[0]);
}

exports.handler = async (event) => {
  const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: baseHeaders, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: 'POST only' }) };

  const auth = requireAdmin(event);
  if (!auth.authorized) return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const batchSize = Math.min(Math.max(parseInt(body.batch_size) || 20, 1), 40);
    const dryRun    = body.dry_run === true;

    const { data: contacts, error: fetchErr } = await supabase
      .from('crm_contacts')
      .select('id, company, notes, industry')
      .is('business_type', null)
      .not('company', 'is', null)
      .neq('company', '')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchErr) throw fetchErr;

    const { count: remaining } = await supabase
      .from('crm_contacts')
      .select('id', { count: 'exact', head: true })
      .is('business_type', null)
      .not('company', 'is', null)
      .neq('company', '');

    if (!contacts || contacts.length === 0) {
      return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ classified: 0, remaining: 0, message: 'No contacts left to classify' }) };
    }

    const classifications = await classifyBatch(contacts);

    let updated = 0, failed = 0;
    const validTypes = ['service','product','both'];

    for (const c of classifications) {
      if (!c.id || !validTypes.includes(c.business_type)) { failed++; continue; }
      const category = (c.business_category || 'other').toLowerCase().replace(/[^a-z_]/g,'_');

      if (!dryRun) {
        const { error: updErr } = await supabase
          .from('crm_contacts')
          .update({
            business_type: c.business_type,
            business_category: category,
            updated_at: new Date().toISOString()
          })
          .eq('id', c.id);
        if (updErr) { failed++; continue; }
      }
      updated++;
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({
        classified: updated,
        failed,
        remaining: Math.max(0, (remaining || 0) - updated),
        sample: classifications.slice(0, 3),
        dry_run: dryRun
      })
    };
  } catch (err) {
    console.error('[classify-contacts]', err);
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
