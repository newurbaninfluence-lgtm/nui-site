// admin-session.js — Email/password login for the NUI back office.
// POST with header `Authorization: Bearer <Supabase access token>`.
// 1. Asks Supabase who that login belongs to.
// 2. Checks the user is on the app_admins list.
// 3. If yes, hands back the admin key the back office already uses (X-Admin-Token),
//    so none of the existing admin functions need to change.
// Fails closed: missing config, bad login, or not an admin = no key.

const { getCorsHeaders } = require('./utils/security');

exports.handler = async (event) => {
  const headers = getCorsHeaders(event);
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, reason: 'post_only' }) };
  }

  const deny = (reason, code = 401) => ({ statusCode: code, headers, body: JSON.stringify({ ok: false, reason }) });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_SECRET) {
    console.error('[admin-session] missing SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_SECRET');
    return deny('not_configured', 500);
  }

  const auth = event.headers.authorization || event.headers.Authorization || '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!jwt) return deny('no_session');

  try {
    // Who is this? (Supabase validates the login token for us.)
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${jwt}` }
    });
    if (!userRes.ok) return deny('bad_session');
    const user = await userRes.json();
    if (!user || !user.id) return deny('bad_session');

    // Is this person an admin?
    const adminRes = await fetch(
      `${SUPABASE_URL}/rest/v1/app_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    if (!adminRes.ok) {
      console.error('[admin-session] app_admins lookup failed', adminRes.status);
      return deny('lookup_failed', 500);
    }
    const rows = await adminRes.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      console.warn('[admin-session] signed in but not an admin:', user.id);
      return deny('not_admin', 403);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: true, token: ADMIN_SECRET, email: user.email || '' })
    };
  } catch (err) {
    console.error('[admin-session]', err.message);
    return deny('server_error', 500);
  }
};
