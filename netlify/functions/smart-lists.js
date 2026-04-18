// smart-lists.js — CRUD for smart_lists + contact matching
// Admin-gated. Wraps all smart_lists operations so the UI doesn't hit Supabase directly.
//
// Actions (via POST body.action):
//   list                       → [ { id, name, filters, contact_count, ... } ]
//   create  { name, filters, description?, icon?, color? }
//   update  { id, name?, filters?, ... }
//   delete  { id }
//   preview { filters, limit=10 }        → { count, sample: [ {id, name, email, phone, company, business_type, business_category} ] }
//   match   { id?, filters?, limit=1000 } → { count, contacts: [...] } (full match for sending)
//   refresh { id }                       → recomputes contact_count

const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('./utils/security');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Apply filter JSON to a Supabase query builder
function applyFilters(query, filters = {}) {
  const f = filters || {};

  if (f.business_type) {
    const arr = Array.isArray(f.business_type) ? f.business_type : [f.business_type];
    if (arr.length) query = query.in('business_type', arr);
  }
  if (f.business_category) {
    const arr = Array.isArray(f.business_category) ? f.business_category : [f.business_category];
    if (arr.length) query = query.in('business_category', arr);
  }
  if (f.status) {
    const arr = Array.isArray(f.status) ? f.status : [f.status];
    if (arr.length) query = query.in('status', arr);
  }
  if (f.has_email === true) {
    query = query.not('email', 'is', null).neq('email', '');
    query = query.or('email_unsubscribed.is.null,email_unsubscribed.eq.false');
    query = query.or('email_bounced.is.null,email_bounced.eq.false');
  }
  if (f.has_phone === true) {
    query = query.not('phone', 'is', null).neq('phone', '');
  }
  if (Array.isArray(f.tags_any) && f.tags_any.length) {
    query = query.overlaps('tags', f.tags_any);
  }
  if (f.source) {
    const arr = Array.isArray(f.source) ? f.source : [f.source];
    if (arr.length) query = query.in('source', arr);
  }
  return query;
}

async function countMatching(filters) {
  let q = supabase.from('crm_contacts').select('id', { count: 'exact', head: true });
  q = applyFilters(q, filters);
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
}

async function fetchMatching(filters, limit = 1000) {
  let q = supabase
    .from('crm_contacts')
    .select('id, first_name, last_name, email, phone, company, business_type, business_category, status, tags')
    .order('last_activity_at', { ascending: false, nullsFirst: false })
    .limit(Math.min(limit, 5000));
  q = applyFilters(q, filters);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };

  const auth = requireAdmin(event);
  if (!auth.authorized) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const action = body.action || 'list';

    if (action === 'list') {
      const { data, error } = await supabase
        .from('smart_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ lists: data || [] }) };
    }

    if (action === 'create') {
      if (!body.name) throw new Error('name required');
      const filters = body.filters || {};
      const count = await countMatching(filters);
      const { data, error } = await supabase
        .from('smart_lists')
        .insert({
          name: body.name,
          description: body.description || null,
          filters,
          icon: body.icon || '📋',
          color: body.color || '#dc2626',
          contact_count: count,
          last_refreshed_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ list: data }) };
    }

    if (action === 'update') {
      if (!body.id) throw new Error('id required');
      const patch = { updated_at: new Date().toISOString() };
      ['name','description','icon','color'].forEach(k => { if (body[k] !== undefined) patch[k] = body[k]; });
      if (body.filters !== undefined) {
        patch.filters = body.filters;
        patch.contact_count = await countMatching(body.filters);
        patch.last_refreshed_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from('smart_lists').update(patch).eq('id', body.id).select().single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ list: data }) };
    }

    if (action === 'delete') {
      if (!body.id) throw new Error('id required');
      const { error } = await supabase.from('smart_lists').delete().eq('id', body.id);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'preview') {
      const filters = body.filters || {};
      const limit = Math.min(body.limit || 10, 50);
      const count = await countMatching(filters);
      const sample = await fetchMatching(filters, limit);
      return { statusCode: 200, headers, body: JSON.stringify({ count, sample }) };
    }

    if (action === 'match') {
      let filters = body.filters;
      if (body.id) {
        const { data, error } = await supabase.from('smart_lists').select('filters').eq('id', body.id).single();
        if (error) throw error;
        filters = data.filters;
        await supabase.from('smart_lists').update({ last_used_at: new Date().toISOString() }).eq('id', body.id);
      }
      const contacts = await fetchMatching(filters || {}, body.limit || 1000);
      return { statusCode: 200, headers, body: JSON.stringify({ count: contacts.length, contacts }) };
    }

    if (action === 'refresh') {
      if (!body.id) throw new Error('id required');
      const { data: existing, error: e1 } = await supabase.from('smart_lists').select('filters').eq('id', body.id).single();
      if (e1) throw e1;
      const count = await countMatching(existing.filters);
      const { data, error } = await supabase
        .from('smart_lists')
        .update({ contact_count: count, last_refreshed_at: new Date().toISOString() })
        .eq('id', body.id).select().single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ list: data }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `unknown action: ${action}` }) };
  } catch (err) {
    console.error('[smart-lists]', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
