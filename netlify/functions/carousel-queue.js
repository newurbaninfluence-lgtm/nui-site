// carousel-queue.js — backs /portal/carousel-queue.html
// Actions:
//   GET  ?action=list              → all carousels ordered by scheduled date
//   POST ?action=post&id=UUID      → post a queued row to IG+FB now
//   POST ?action=skip&id=UUID      → mark row as skipped (never posts)

const SB_URL = 'https://jcgvkyizoimwbolhfpta.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const FB_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_PAGE  = '101657992748052';
const IG_ID    = '17841400776253822';

const supaHeaders = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
};

async function supaSelect(q) {
  const r = await fetch(`${SB_URL}/rest/v1/scheduled_carousels?${q}`, { headers: supaHeaders });
  if (!r.ok) throw new Error(`select: ${await r.text()}`);
  return r.json();
}
async function supaUpdate(id, patch) {
  const r = await fetch(`${SB_URL}/rest/v1/scheduled_carousels?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`update: ${await r.text()}`);
  return r.json();
}

async function postToIG(slide_urls, caption) {
  const ids = [];
  for (const url of slide_urls) {
    const r = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: FB_TOKEN }),
    });
    const j = await r.json();
    if (!j.id) throw new Error(`IG container: ${JSON.stringify(j)}`);
    ids.push(j.id);
  }
  const cr = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'CAROUSEL', children: ids.join(','), caption, access_token: FB_TOKEN }),
  });
  const cj = await cr.json();
  if (!cj.id) throw new Error(`IG carousel: ${JSON.stringify(cj)}`);
  const pr = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: cj.id, access_token: FB_TOKEN }),
  });
  const pj = await pr.json();
  if (!pj.id) throw new Error(`IG publish: ${JSON.stringify(pj)}`);
  return pj.id;
}

async function postToFB(coverUrl, caption) {
  const r = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE}/photos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: caption, url: coverUrl, access_token: FB_TOKEN }),
  });
  const j = await r.json();
  if (!j.id && !j.post_id) throw new Error(`FB: ${JSON.stringify(j)}`);
  return j.post_id || j.id;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const action = (event.queryStringParameters || {}).action || 'list';
  const id = (event.queryStringParameters || {}).id;

  try {
    if (action === 'list') {
      const rows = await supaSelect('select=*&site_id=eq.nui&order=scheduled_for.asc');
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ rows }) };
    }

    if (action === 'skip') {
      if (!id) throw new Error('id required');
      await supaUpdate(id, { status: 'skipped' });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'post') {
      // This sync action is deprecated — posts now go through the background function
      // to avoid proxy timeouts and double-post races. Return 410 to any old callers.
      return { statusCode: 410, headers: CORS, body: JSON.stringify({ error: 'Use /.netlify/functions/carousel-queue-post-background?id=UUID instead' }) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action' }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
