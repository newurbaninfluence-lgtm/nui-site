// email-track.js — Open pixel + click redirect tracker
// Open: GET /email-track?cid=UUID&id=SEND_ID → 1x1 GIF + log open
// Click: GET /email-track?cid=UUID&id=SEND_ID&url=ENCODED_URL → redirect + log click

exports.handler = async (event) => {
  const { id, cid, url } = event.queryStringParameters || {};
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const sbH = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  const now = new Date().toISOString();

  // ── Click tracking redirect ──
  if (url) {
    const decoded = decodeURIComponent(url);
    if (SUPABASE_URL && SUPABASE_KEY && cid) {
      fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${cid}`, {
        method: 'PATCH', headers: sbH,
        body: JSON.stringify({ last_email_click_at: now, email_engaged: true })
      }).catch(() => {});
      fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${id}`, {
        method: 'PATCH', headers: sbH,
        body: JSON.stringify({ clicked_at: now })
      }).catch(() => {});
      fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
        method: 'POST', headers: sbH,
        body: JSON.stringify({ contact_id: cid, type: 'email', event_type: 'email_clicked', direction: 'inbound', metadata: { send_id: id, url: decoded }, created_at: now })
      }).catch(() => {});
    }
    return { statusCode: 302, headers: { Location: decoded, 'Cache-Control': 'no-store' }, body: '' };
  }

  // ── Open pixel ──
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  if (SUPABASE_URL && SUPABASE_KEY && cid) {
    fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${cid}`, {
      method: 'PATCH', headers: sbH,
      body: JSON.stringify({ last_email_open_at: now, email_engaged: true })
    }).catch(() => {});
    if (id) {
      fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${id}`, {
        method: 'PATCH', headers: sbH,
        body: JSON.stringify({ opened_at: now })
      }).catch(() => {});
    }
    fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST', headers: sbH,
      body: JSON.stringify({ contact_id: cid, type: 'email', event_type: 'email_opened', direction: 'inbound', metadata: { send_id: id, ip: event.headers?.['x-forwarded-for'] || 'unknown' }, created_at: now })
    }).catch(() => {});
    console.log('📧 Email opened — contact:', cid, 'send:', id);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' },
    body: pixel.toString('base64'),
    isBase64Encoded: true
  };
};
