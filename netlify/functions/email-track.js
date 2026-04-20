// email-track.js — Tracking pixel for opens + click-through redirector
// No `url` param  -> returns 1x1 GIF, logs 'email_opened' to activity_log
// With `url` param -> logs 'email_clicked' + clickedUrl, returns 302 redirect
// Hot-lead off-ramp: first click pauses sequence, elevates to hot_lead, fires SMS to Faren

const SAFE_FALLBACK = 'https://newurbaninfluence.com';

exports.handler = async (event) => {
  const { id, cid, url } = event.queryStringParameters || {};
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
  const OPENPHONE_FROM_ID = process.env.OPENPHONE_PHONE_NUMBER;
  const FAREN_PHONE = process.env.FAREN_PHONE; // Set in Netlify to enable hot-lead SMS alerts

  const sbH = SUPABASE_SERVICE_KEY ? {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  } : null;

  const logEvent = (type, extra = {}) => {
    if (!SUPABASE_URL || !sbH || !cid) return;
    return fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST',
      headers: { ...sbH, 'Prefer': 'return=minimal' },
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

  // ── SMS hot-lead alert helper ────────────────────────────────────────
  // Sends a one-line SMS to Faren via OpenPhone when a lead first clicks.
  // Silently skips if FAREN_PHONE env var not set (safe to ship without config).
  const sendHotLeadSms = async (contact, clickedUrl) => {
    if (!FAREN_PHONE || !OPENPHONE_API_KEY || !OPENPHONE_FROM_ID) {
      console.log('[email-track] Hot-lead SMS skipped (missing FAREN_PHONE/OpenPhone config)');
      return;
    }
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown lead';
    const contactRef = contact.phone || contact.email || 'no contact info';
    const category = contact.business_category ? ` (${contact.business_category})` : '';
    // Strip scheme + tracking params from display URL for readability
    let displayUrl = clickedUrl;
    try {
      const u = new URL(clickedUrl);
      displayUrl = u.hostname.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname);
    } catch (_) { /* use as-is */ }
    const msg = `🔥 ${name} clicked ${displayUrl}. ${contactRef}${category}`;
    try {
      const r = await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': OPENPHONE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: msg.slice(0, 320), // OpenPhone 320-char cap
          to: [FAREN_PHONE],
          from: OPENPHONE_FROM_ID
        })
      });
      if (r.ok) console.log('📲 Hot-lead SMS sent to Faren:', msg);
      else console.warn('[email-track] OpenPhone error:', r.status, await r.text().catch(() => ''));
    } catch (err) {
      console.warn('[email-track] SMS send failed:', err.message);
    }
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

    // Stamp the communications row so Contact Hub shows the click state
    if (id && sbH) {
      fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...sbH, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ clicked_at: new Date().toISOString(), read: true })
      }).catch(err => console.warn('[email-track] clicked_at update failed:', err.message));
    }

    // ── HOT-LEAD OFF-RAMP (first click only) ───────────────────────────
    // PATCH with `sequence_paused_at=is.null` filter means update only fires
    // the FIRST time a contact clicks. `Prefer: return=representation` lets us
    // detect whether a row was actually updated (vs no-op), which gates the SMS.
    if (cid && SUPABASE_URL && sbH) {
      try {
        const patchResp = await fetch(
          `${SUPABASE_URL}/rest/v1/crm_contacts` +
          `?id=eq.${cid}&sequence_paused_at=is.null` +
          `&select=id,first_name,last_name,email,phone,business_category,sequence_position,last_broadcast_subject`,
          {
            method: 'PATCH',
            headers: { ...sbH, 'Prefer': 'return=representation' },
            body: JSON.stringify({
              sequence_paused_at: new Date().toISOString(),
              status: 'hot_lead'
            })
          }
        );
        const updated = await patchResp.json().catch(() => []);
        const isFirstClick = Array.isArray(updated) && updated.length > 0;
        if (isFirstClick) {
          console.log('🔥 First click — hot_lead elevated + sequence paused:', cid);
          await sendHotLeadSms(updated[0], target);
        } else {
          console.log('[email-track] Repeat click on paused sequence — no alert:', cid);
        }
      } catch (err) {
        console.warn('[email-track] pause+alert failed:', err.message);
      }
    }

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

  // Stamp the open on crm_contacts so downstream triggers (SMS non-opener
  // sequence, lead scoring) can filter by `last_email_open_at IS NULL`.
  if (cid && SUPABASE_URL && sbH) {
    fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${cid}`, {
      method: 'PATCH',
      headers: { ...sbH, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ last_email_open_at: new Date().toISOString() })
    }).catch(err => console.warn('[email-track] last_email_open_at update failed:', err.message));
  }

  // Stamp the communications row so Contact Hub shows the open state
  if (id && sbH) {
    fetch(`${SUPABASE_URL}/rest/v1/communications?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbH, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ opened_at: new Date().toISOString(), read: true })
    }).catch(err => console.warn('[email-track] comm open stamp failed:', err.message));
  }

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
