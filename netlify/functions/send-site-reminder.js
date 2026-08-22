// send-site-reminder.js — Netlify Function (admin, on-demand)
// Sends ONE site's payment reminder right now, instead of waiting for the
// scheduled 7-days-before run in site-reminders.js. Same email/SMS templates,
// same checkout-link logic, same STOP-list handling — only the trigger differs.
//
// Deliberate differences from the scheduled job:
//   • Ignores the "exactly N days out" date window (that's the whole point).
//   • Ignores reminders_enabled — an admin pressing the button IS the consent.
//   • Does NOT write reminder_sent_for, so the automatic 7-day reminder still
//     goes out on schedule. Only reminder_sent_at is stamped, as an audit trail.
//   • Still honors the SMS suppression list — STOP always wins.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY, ADMIN_SECRET,
//      HOSTINGER_EMAIL/HOSTINGER_PASSWORD, OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const { requireAdmin } = require('./utils/security');
const { maskEmail, maskPhone } = require('./utils/log-safe');
const {
  sbHeaders, toE164, isSmsSuppressed, buildCheckoutLink,
  buildEmailHtml, buildSmsText, sendEmail, sendSms
} = require('./site-reminders').helpers;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const SELECT_COLS = 'id,site_id,site_name,client_name,domain,monthly_fee,list_price,' +
  'discount_amount,discount_reason,billing_group,billing_status,next_due_date,' +
  'contact_email,contact_phone,reminders_enabled,reminder_sent_for,stripe_subscription_id';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auth = requireAdmin(event);
  if (!auth.authorized) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: auth.error || 'Unauthorized' }) };
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Database not configured' }) };
  }

  let siteId, channels;
  try {
    const parsed = JSON.parse(event.body || '{}');
    siteId = parsed.site_id;
    // Optional: ['email'] / ['sms'] / both. Defaults to whatever the site has.
    channels = Array.isArray(parsed.channels) && parsed.channels.length ? parsed.channels : null;
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }
  if (!siteId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'site_id required' }) };
  }

  const result = { site_id: siteId, emailed: false, texted: false, skipped: [], errors: [] };

  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/client_sites?id=eq.${encodeURIComponent(siteId)}&select=${SELECT_COLS}`,
      { headers: sbHeaders() }
    );
    if (!resp.ok) throw new Error('site query failed: ' + resp.status);
    const site = (await resp.json())[0];
    if (!site) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Site not found' }) };
    }
    if (!site.next_due_date) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Set a next due date on this site before sending a reminder' }) };
    }
    if (!site.contact_email && !site.contact_phone) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'No reminder contact on this site — add a billing email or phone first' }) };
    }

    const onStripe = !!site.stripe_subscription_id;
    const wantEmail = !channels || channels.includes('email');
    const wantSms = !channels || channels.includes('sms');
    // Sites already on a subscription get a heads-up only — no payment link.
    const payUrl = onStripe ? null : await buildCheckoutLink(site);

    if (wantEmail && site.contact_email) {
      try {
        await sendEmail(
          site.contact_email,
          `Your website hosting renews ${new Date(site.next_due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${site.site_name}`,
          buildEmailHtml(site, site.next_due_date, payUrl, onStripe)
        );
        result.emailed = true;
        console.log(`manual reminder emailed: ${site.site_id} → ${maskEmail(site.contact_email)}`);
      } catch (e) {
        result.errors.push({ channel: 'email', error: e.message });
      }
    } else if (wantEmail) {
      result.skipped.push({ channel: 'email', why: 'no_email' });
    }

    if (wantSms && site.contact_phone) {
      const phone = toE164(site.contact_phone);
      if (!phone) {
        result.skipped.push({ channel: 'sms', why: 'unparseable_phone' });
      } else if (await isSmsSuppressed(phone)) {
        result.skipped.push({ channel: 'sms', why: 'opted_out' });
      } else {
        try {
          await sendSms(phone, buildSmsText(site, site.next_due_date, payUrl, onStripe));
          result.texted = true;
          console.log(`manual reminder texted: ${site.site_id} → ${maskPhone(phone)}`);
        } catch (e) {
          result.errors.push({ channel: 'sms', error: e.message });
        }
      }
    } else if (wantSms) {
      result.skipped.push({ channel: 'sms', why: 'no_phone' });
    }

    if (!result.emailed && !result.texted) {
      const why = result.errors.length ? result.errors.map(e => `${e.channel}: ${e.error}`).join('; ')
                                       : result.skipped.map(s => `${s.channel}: ${s.why}`).join('; ');
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Nothing sent — ' + (why || 'no channel available'), result }) };
    }

    // Audit stamp only. reminder_sent_for is deliberately left alone so the
    // scheduled 7-day reminder still fires on its own.
    await fetch(`${SUPABASE_URL}/rest/v1/client_sites?id=eq.${encodeURIComponent(site.id)}`, {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify({ reminder_sent_at: new Date().toISOString() })
    }).catch(() => {});

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) };
  } catch (err) {
    console.error('send-site-reminder error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message, result }) };
  }
};
