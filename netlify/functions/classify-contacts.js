// classify-contacts.js — AI-powered business classification + pain point enrichment
// Reads crm_contacts with company IS NOT NULL AND business_type IS NULL, batches through Claude,
// writes back business_type + business_category + pain_points + funnel_stage + last_touch_summary.
//
// Usage: POST /.netlify/functions/classify-contacts
// Body (optional): { batch_size: 20, dry_run: false }
// Header: X-Admin-Token: <ADMIN_SECRET>

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('./utils/security');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Hand-curated pain points per category. The AI picks which 2-4 apply for each specific contact.
// These mirror the drip email content so when Monty brings one up, the drip backs it up.
const CATEGORY_PAIN_LIBRARY = {
  authors: [
    'no email list growth', 'stale website from book 1', 'Amazon algorithm squeeze',
    'no reader magnet / lead capture', 'book launch lacks choreography',
    'press kit missing or weak', 'no next-book tease system', 'dependent on Instagram for reach'
  ],
  photography: [
    'IG-dependent lead flow', 'no pricing anchor before DM', 'leads ghost after rates sent',
    'no gallery delivery system', 'booking gaps in slow months', 'referral-only pipeline',
    'site loses the job in 8 seconds', 'no follow-up automation'
  ],
  videography: [
    'inconsistent project flow', 'no showreel that converts', 'undercharging per project',
    'no retainer pipeline', 'IG-dependent lead flow'
  ],
  product: [
    'low site conversion under 1%', 'flat product photography', 'no trust signals above fold',
    'checkout friction losing sales', 'rented-land Amazon/Etsy dependency',
    'no post-purchase sequence', 'abandoned cart leaks', 'no wholesale materials'
  ],
  ecommerce: [
    'low site conversion', 'no post-purchase drip', 'abandoned cart leaks',
    'no customer retention engine', 'generic product photography'
  ],
  retail: [
    'no foot traffic system', 'no email capture at POS', 'weekday revenue gaps',
    'no digital presence for physical store', 'dependent on walk-ins'
  ],
  clothing: [
    'drops not selling through', 'no pre-order window', 'lookbook weak or generic',
    'IG drops no longer hit', 'no size-inclusive model shots',
    'returns eating margin', 'no wholesale deck', 'no email list for drop alerts'
  ],
  events: [
    'low pre-sale ticket %', 'not using past attendee email list', 'no SMS 48hr close',
    'sponsor deck weak / Canva-looking', 'no post-event content capture',
    'flyer fatigue on IG', 'different brand every show'
  ],
  restaurants: [
    'slow weeknights', 'weak review management', 'no loyalty/repeat system',
    'menu design feels outdated', 'no online ordering flow', 'hard to find on Google'
  ],
  bars_nightlife: [
    'Facebook ads keep getting blocked', 'flyers reaching same 300 people',
    'no audience-building system', 'slow weeknights', 'no SMS pre-sale list'
  ],
  cafe: [
    'slow afternoon revenue', 'no loyalty program', 'weak Google visibility',
    'no catering / event revenue stream'
  ],
  salon: [
    'no online booking system', 'dependent on walk-ins', 'no rebooking automation',
    'weak IG content', 'no retail product sales'
  ],
  barbershop: [
    'walk-in only no booking app', 'slow Mondays/Tuesdays', 'no review collection',
    'no SMS for last-minute cancels', 'dependent on same 100 regulars'
  ],
  fitness: [
    'seasonal membership churn', 'no lead funnel for intro offers',
    'weak retention after month 3', 'no digital/hybrid offering'
  ],
  trades: [
    'search visibility weak', 'no follow-up system on quotes',
    'reliant on referrals alone', 'slow season revenue gaps'
  ],
  construction: [
    'long sales cycle no nurture', 'weak portfolio presentation',
    'no project update system for past clients'
  ],
  automotive: [
    'weak local SEO', 'no reminder system for maintenance',
    'dependent on walk-ins', 'no review collection flow'
  ],
  law: [
    'weak local SEO', 'generic brand indistinct from competitors',
    'long sales cycle no nurture', 'no content / thought leadership'
  ],
  real_estate: [
    'dependent on Zillow leads', 'no personal brand presence',
    'inconsistent IG presence', 'no past-client drip'
  ],
  healthcare: [
    'generic brand', 'no patient education content',
    'weak online booking flow', 'outdated site hurts trust'
  ],
  dental: [
    'low new-patient conversion', 'no review collection system',
    'weak local SEO', 'outdated brand'
  ],
  hvac: [
    'search visibility weak', 'no emergency response funnel',
    'ad spend rising leads flat', 'no storm-season campaign system'
  ],
  roofing: [
    'slow quote-to-signed conversion', 'referral-only pipeline',
    'weak post-storm response system', 'no trust content online'
  ],
  flooring: [
    'inquiries go to whoever replies first', 'weak website vs competitors',
    'no follow-up automation', 'showroom traffic not captured online'
  ],
  home_services: [
    'search visibility weak', 'no follow-up on quotes',
    'seasonal revenue gaps', 'referral-dependent pipeline'
  ],
  cleaning: [
    'no recurring-client retention flow', 'weak online presence',
    'dependent on referrals', 'no upsell system'
  ],
  landscaping: [
    'seasonal revenue gaps', 'no off-season nurture',
    'weak digital presence for local search', 'no recurring service upsell'
  ],
  nonprofit: [
    'weak donor retention', 'no recurring giving system',
    'inconsistent brand across campaigns', 'event-dependent fundraising'
  ],
  tech: [
    'weak positioning vs competitors', 'no content funnel',
    'founder-dependent sales', 'long sales cycle no nurture'
  ],
  saas: [
    'weak activation flow', 'no post-signup nurture',
    'churn on month 3', 'weak landing page conversion'
  ],
  agency: [
    'feast-or-famine pipeline', 'founder-dependent sales',
    'no productized offer', 'weak positioning / niche'
  ],
  consulting: [
    'founder-dependent sales', 'no recurring revenue',
    'no lead magnet / funnel', 'weak content/thought leadership'
  ],
  education: [
    'enrollment gaps', 'weak digital presence',
    'no nurture for interested families', 'outdated site'
  ],
  event_planning: [
    'inconsistent client flow', 'weak portfolio presentation',
    'no wedding-specific funnel', 'referral-dependent pipeline'
  ],
  catering: [
    'no corporate account system', 'seasonal revenue gaps',
    'weak portfolio/menu presentation', 'no repeat client drip'
  ],
  music: [
    'dependent on streaming algorithm', 'no email list',
    'merch not integrated', 'no tour announcement system'
  ],
  fashion: [
    'drops not selling through', 'no pre-order window',
    'lookbook weak', 'no email list for drops'
  ],
  beauty: [
    'dependent on IG algorithm', 'no recurring client system',
    'weak retail product sales', 'no before/after content strategy'
  ],
  financial: [
    'generic brand', 'weak local SEO', 'long sales cycle no nurture',
    'no content / thought leadership'
  ],
  accounting: [
    'seasonal revenue compression', 'no year-round engagement',
    'weak client retention during off-season', 'referral-only pipeline'
  ],
  other: [
    'weak digital presence', 'no follow-up system',
    'dependent on referrals', 'inconsistent brand'
  ],
  uaw_workers: [
    'campaign materials on short timelines', 'need union-approved design',
    'rally/event signage needs', 'member communication materials',
    'solidarity merch and apparel', 'contract negotiation materials'
  ],
  political_campaign: [
    'tight deadline yard signs', 'mailer + door hanger print runs',
    'campaign signage and rally materials', 'fundraiser event collateral',
    'volunteer t-shirts and merch', 'candidate brand consistency across materials'
  ]
};

const CATEGORIES = Object.keys(CATEGORY_PAIN_LIBRARY);

async function classifyBatch(contacts) {
  const prompt = `You are classifying small businesses for a Detroit branding agency's CRM. For each business, determine:
1. business_type: "service" (sells services/time), "product" (sells physical/digital goods), or "both"
2. business_category: ONE of: ${CATEGORIES.join(', ')}
3. pain_points: pick 2-4 MOST LIKELY pain points from this category's library (I'll paste below). Choose based on the company name hinting at size/stage/focus. If truly generic, pick the top 2-3.

Respond with ONLY a JSON array, no markdown, no explanation. One object per input in order:
[{"id":"...","business_type":"service","business_category":"law","pain_points":["weak local SEO","generic brand indistinct from competitors"]}]

PAIN POINT LIBRARY (pick from these exact strings):
${Object.entries(CATEGORY_PAIN_LIBRARY).map(([c, p]) => `${c}: ${p.join(' | ')}`).join('\n')}

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
      max_tokens: 8000,
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
    const reEnrich  = body.re_enrich === true;

    // Fetch next batch of unclassified contacts with a company name
    let q = supabase
      .from('crm_contacts')
      .select('id, company, notes, industry')
      .not('company', 'is', null)
      .neq('company', '')
      .order('created_at', { ascending: true })
      .limit(batchSize);
    if (!reEnrich) q = q.is('business_type', null);

    const { data: contacts, error: fetchErr } = await q;
    if (fetchErr) throw fetchErr;

    // Remaining count
    let countQ = supabase
      .from('crm_contacts')
      .select('id', { count: 'exact', head: true })
      .not('company', 'is', null)
      .neq('company', '');
    if (!reEnrich) countQ = countQ.is('business_type', null);
    const { count: remaining } = await countQ;

    if (!contacts || contacts.length === 0) {
      return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ classified: 0, remaining: 0, message: 'No contacts left to classify' }) };
    }

    const classifications = await classifyBatch(contacts);

    let updated = 0, failed = 0;
    const validTypes = ['service','product','both'];

    for (const c of classifications) {
      if (!c.id || !validTypes.includes(c.business_type)) { failed++; continue; }
      const category = (c.business_category || 'other').toLowerCase().replace(/[^a-z_]/g,'_');
      const validLib = CATEGORY_PAIN_LIBRARY[category] || CATEGORY_PAIN_LIBRARY.other;
      // Filter pain_points to only those that exist in the library for that category (guards against hallucination)
      const painPoints = Array.isArray(c.pain_points)
        ? c.pain_points.filter(p => validLib.includes(p)).slice(0, 4)
        : [];
      // If the model returned nothing valid, fall back to the top 2 library entries
      const finalPains = painPoints.length > 0 ? painPoints : validLib.slice(0, 2);

      if (!dryRun) {
        const { error: updErr } = await supabase
          .from('crm_contacts')
          .update({
            business_type: c.business_type,
            business_category: category,
            pain_points: finalPains,
            funnel_stage: 'cold',
            enrichment_version: 1,
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
