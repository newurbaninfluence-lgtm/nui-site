// drip-enroll.js — Admin endpoint to enroll contacts in a drip campaign
// Actions:
//   enroll        { contacts: [id,...], category, source_campaign } → queues step 1 for all
//   enroll_list   { filters, category, source_campaign }           → finds matching contacts, enrolls
//   pause_contact { contact_id }                                   → sets drip_status=paused
//   resume_contact{ contact_id }                                   → sets drip_status=active
//   pause_campaign{ source_campaign }                              → cancels all queued rows
//   stats         { }                                              → overall drip health
//   start_ramp    { }                                              → sets ramp_started_at to now (activates ramp from week 1)

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('./utils/security');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

async function enrollContacts(contactIds, category, sourceCampaign) {
  if (!category) throw new Error('business_category required');

  const { data: tpl, error: tErr } = await supabase
    .from('drip_emails')
    .select('position, delay_days')
    .eq('industry', category).eq('active', true)
    .order('position').limit(1).maybeSingle();
  if (tErr) throw tErr;
  if (!tpl) throw new Error(`No templates found for category: ${category}`);

  let enrolled = 0, skipped = 0;
  const errors = [];

  for (const contactId of contactIds) {
    try {
      const { data: existing } = await supabase
        .from('drip_queue').select('id')
        .eq('contact_id', contactId).eq('status', 'queued').limit(1);
      if (existing && existing.length > 0) { skipped++; continue; }

      const when = new Date();
      when.setMinutes(when.getMinutes() + Math.floor(Math.random() * 30));

      const { error: qErr } = await supabase.from('drip_queue').insert({
        contact_id: contactId, channel: 'email', step_number: 1,
        scheduled_for: when.toISOString(), status: 'queued',
        business_category: category, source_campaign: sourceCampaign || category
      });
      if (qErr) throw qErr;

      await supabase.from('crm_contacts').update({
        drip_status: 'queued',
        source_campaign: sourceCampaign || category
      }).eq('id', contactId);

      enrolled++;
    } catch (e) {
      errors.push({ contact_id: contactId, error: e.message });
    }
  }

  return { enrolled, skipped, errors: errors.slice(0, 5), error_count: errors.length };
}

exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({error:'POST only'}) };

  const auth = requireAdmin(event);
  if (!auth.authorized) return { statusCode: 401, headers: h, body: JSON.stringify({error:'Unauthorized'}) };

  try {
    const body = JSON.parse(event.body || '{}');
    const action = body.action || 'enroll';

    if (action === 'enroll') {
      if (!Array.isArray(body.contacts) || body.contacts.length === 0) throw new Error('contacts[] required');
      const result = await enrollContacts(body.contacts, body.category, body.source_campaign);
      return { statusCode: 200, headers: h, body: JSON.stringify(result) };
    }

    if (action === 'enroll_list') {
      if (!body.category) throw new Error('category required');
      let q = supabase.from('crm_contacts')
        .select('id').eq('business_category', body.category)
        .eq('drip_status', 'not_enrolled')
        .not('email', 'is', null).neq('email', '')
        .or('email_unsubscribed.is.null,email_unsubscribed.eq.false')
        .or('email_bounced.is.null,email_bounced.eq.false');
      if (body.source_filter) q = q.eq('source', body.source_filter);
      if (body.source_campaign_filter) q = q.eq('source_campaign', body.source_campaign_filter);

      const { data: matches, error } = await q.limit(body.limit || 5000);
      if (error) throw error;
      if (!matches || matches.length === 0) {
        return { statusCode: 200, headers: h, body: JSON.stringify({ enrolled: 0, matches: 0 }) };
      }
      const ids = matches.map(m => m.id);
      const result = await enrollContacts(ids, body.category, body.source_campaign);
      return { statusCode: 200, headers: h, body: JSON.stringify({ matches: ids.length, ...result }) };
    }

    if (action === 'pause_contact') {
      if (!body.contact_id) throw new Error('contact_id required');
      await supabase.from('crm_contacts').update({
        drip_status: 'paused', drip_paused_at: new Date().toISOString()
      }).eq('id', body.contact_id);
      return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'resume_contact') {
      if (!body.contact_id) throw new Error('contact_id required');
      await supabase.from('crm_contacts').update({
        drip_status: 'active', drip_paused_at: null
      }).eq('id', body.contact_id);
      return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'pause_campaign') {
      if (!body.source_campaign) throw new Error('source_campaign required');
      const { count: cancelled } = await supabase.from('drip_queue')
        .update({ status: 'cancelled' }, { count: 'exact' })
        .eq('source_campaign', body.source_campaign).eq('status', 'queued');
      await supabase.from('crm_contacts').update({
        drip_status: 'paused', drip_paused_at: new Date().toISOString()
      }).eq('source_campaign', body.source_campaign);
      return { statusCode: 200, headers: h, body: JSON.stringify({ cancelled: cancelled || 0 }) };
    }

    if (action === 'start_ramp') {
      await supabase.from('drip_config')
        .update({ value: JSON.stringify(new Date().toISOString()), updated_at: new Date().toISOString() })
        .eq('key', 'ramp_started_at');
      return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true, ramp_started: new Date().toISOString() }) };
    }

    if (action === 'stats') {
      const [queued, sent, paused, opted, activeDrip, cfg] = await Promise.all([
        supabase.from('drip_queue').select('id', { count: 'exact', head: true }).eq('status', 'queued'),
        supabase.from('drip_queue').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('drip_status', 'paused'),
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('drip_status', 'opted_out'),
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('drip_status', 'active'),
        supabase.from('drip_config').select('key,value')
      ]);

      const config = {};
      (cfg.data || []).forEach(r => { config[r.key] = r.value; });

      // By category
      const { data: byCategory } = await supabase.from('drip_queue')
        .select('business_category, status').eq('status', 'queued');
      const catCounts = {};
      (byCategory || []).forEach(r => {
        catCounts[r.business_category] = (catCounts[r.business_category] || 0) + 1;
      });

      return { statusCode: 200, headers: h, body: JSON.stringify({
        queued: queued.count || 0, sent: sent.count || 0,
        paused: paused.count || 0, opted_out: opted.count || 0, active: activeDrip.count || 0,
        by_category_queued: catCounts, config
      })};
    }

    return { statusCode: 400, headers: h, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
  } catch (err) {
    console.error('[drip-enroll]', err);
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
