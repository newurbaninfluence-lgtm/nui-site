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
      if (!id) throw new Error('id required');
      const rows = await supaSelect(`select=*&id=eq.${id}`);
      const row = rows[0];
      if (!row) throw new Error('row not found');
      if (row.status !== 'queued') throw new Error(`row is ${row.status}, cannot post`);

      let ig_post_id = null, fb_post_id = null, error_message = null;
      let final_status = 'posted';
      try { ig_post_id = await postToIG(row.slide_urls, row.caption); }
      catch (e) { error_message = `IG: ${e.message}`; final_status = 'failed'; }
      try { fb_post_id = await postToFB(row.slide_urls[0], row.caption); }
      catch (e) { error_message = (error_message ? error_message + ' | ' : '') + `FB: ${e.message}`; }

      await supaUpdate(id, {
        status: final_status,
        posted_at: new Date().toISOString(),
        ig_post_id, fb_post_id, error_message,
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: final_status === 'posted', ig_post_id, fb_post_id, error: error_message }) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action' }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
