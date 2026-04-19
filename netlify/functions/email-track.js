// email-track.js — Tracking pixel for opens + click-through redirector
// No `url` param  -> returns 1x1 GIF, logs 'email_opened' to activity_log
// With `url` param -> logs 'email_clicked' + clickedUrl, returns 302 redirect
// Fixes open-redirect vuln by only allowing http(s) targets.

const SAFE_FALLBACK = 'https://newurbaninfluence.com';

exports.handler = async (event) => {
  const { id, cid, url } = event.queryStringParameters || {};
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const logEvent = (type, extra = {}) => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !cid) return;
    return fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        contact_id: parseInt(cid) || null,
        type,
        details: JSON.stringify({
          trackId: id,
          at: new Date().toISOString(),
          ip: event.headers['x-forwarded-for'] || 'unknown',
          ua: event.headers['user-agent'] || 'unknown',
          ...extra
        }),
        created_at: new Date().toISOString()
      })
    }).catch(err => console.warn(`[email-track] ${type} log failed:`, err.message));
  };

  // ── CLICK TRACKING ──────────────────────────────────────────────────
  if (url) {
    let target = SAFE_FALLBACK;
    try {
      const decoded = decodeURIComponent(url);
      if (/^https?:\/\//i.test(decoded)) target = decoded;
    } catch (_) { /* fall through to SAFE_FALLBACK */ }

    // Defeat Netlify's auto-forwarding of incoming query params onto the
    // Location header — it only kicks in when the target has no query string.
    // Adding ?src=email gives a clean redirect AND an attribution param.
    try {
      const urlObj = new URL(target);
      if (!urlObj.searchParams.has('src')) urlObj.searchParams.set('src', 'email');
      target = urlObj.toString();
    } catch (_) { /* target unparseable, use as-is */ }

    await logEvent('email_clicked', { clickedUrl: target });
    console.log('🖱️  Email clicked — trackId:', id, 'contactId:', cid, '→', target);

    return {
      statusCode: 302,
      headers: {
        'Location': target,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      },
      body: ''
    };
  }

  // ── OPEN TRACKING ──────────────────────────────────────────────────
  logEvent('email_opened');
  console.log('📧 Email opened — trackId:', id, 'contactId:', cid);

  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    },
    body: pixel.toString('base64'),
    isBase64Encoded: true
  };
};
