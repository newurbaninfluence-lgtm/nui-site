// site-reminders.js — Netlify Scheduled Function
// Sends each client an email + SMS reminder 7 days before their hosting/maintenance
// payment is due. Sites NOT yet on Stripe get a live checkout link so they can set
// up auto-pay in one tap; sites already on a subscription get a heads-up only.
//
// Safety rules (deliberate):
//   • Only sites with reminders_enabled = true and a next_due_date exactly N days out.
//   • Never reminds a 'paused' or 'canceled' site (no charge is coming).
//   • Idempotent: reminder_sent_for = next_due_date short-circuits repeat sends.
//   • Honors the SMS opt-out list (sms_suppression) — STOP replies are respected.
//   • Never suspends, never charges, never writes billing_status. Notify only.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY,
//      HOSTINGER_EMAIL/HOSTINGER_PASSWORD (SMTP), OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER
//      REMINDER_DAYS_BEFORE (optional, default 7)

const { maskEmail, maskPhone } = require('./utils/log-safe');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DAYS_BEFORE = Math.max(0, parseInt(process.env.REMINDER_DAYS_BEFORE || '7', 10) || 7);
const PORTAL_URL = 'https://newurbaninfluence.com/app/#portal';

function sbHeaders() {
  return {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };
}

// Target date = today + DAYS_BEFORE, as YYYY-MM-DD (UTC).
function targetDateStr(daysAhead) {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().slice(0, 10);
}

// OpenPhone requires E.164. Accepts 10-digit US, 11-digit leading 1, or +… .
function toE164(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s.startsWith('+')) return s.replace(/[^\d+]/g, '');
  const digits = s.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits[0] === '1') return '+' + digits;
  return null; // unrecognised — skip rather than send garbage
}

async function isSmsSuppressed(phone) {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/sms_suppression?select=phone&phone=eq.${encodeURIComponent(phone)}&limit=1`,
      { headers: sbHeaders() }
    );
    if (!r.ok) return false;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch (e) {
    console.warn('suppression check failed:', e.message);
    return false;
  }
}

// Build a Stripe Checkout link for a site that isn't on a subscription yet.
// Priced SERVER-SIDE from client_sites.monthly_fee — never from any input.
async function buildCheckoutLink(site) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const fee = parseFloat(site.monthly_fee);
  if (!STRIPE_SECRET_KEY || !(fee > 0)) return null;
  try {
    const pp = new URLSearchParams();
    pp.append('unit_amount', String(Math.round(fee * 100)));
    pp.append('currency', 'usd');
    pp.append('recurring[interval]', 'month');
    pp.append('product_data[name]', `${site.site_name} — Website Hosting & Maintenance`);
    pp.append('product_data[metadata][site_id]', site.id);
    const pr = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: pp.toString()
    });
    const price = await pr.json();
    if (!pr.ok) throw new Error(price.error?.message || 'price failed');

    const sp = new URLSearchParams();
    sp.append('mode', 'subscription');
    sp.append('line_items[0][price]', price.id);
    sp.append('line_items[0][quantity]', '1');
    sp.append('success_url', `${PORTAL_URL}?payment=success`);
    sp.append('cancel_url', `${PORTAL_URL}?payment=cancel`);
    sp.append('metadata[site_id]', site.id);
    sp.append('subscription_data[metadata][site_id]', site.id);
    if (site.contact_email) sp.append('customer_email', site.contact_email);
    const sr = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: sp.toString()
    });
    const session = await sr.json();
    if (!sr.ok) throw new Error(session.error?.message || 'session failed');
    return session.url || null;
  } catch (e) {
    console.warn(`checkout link failed for ${site.site_id}:`, e.message);
    return null; // reminder still goes out, just without a one-tap link
  }
}

function buildEmailHtml(site, dueDateStr, payUrl, onStripe) {
  const fee = parseFloat(site.monthly_fee) || 0;
  const due = new Date(dueDateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const cta = onStripe
    ? `<p style="color:#ccc;line-height:1.7;">No action needed — your card on file will be charged automatically.</p>`
    : (payUrl
        ? `<div style="text-align:center;margin:28px 0;"><a href="${payUrl}" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Set Up Auto-Pay →</a></div>
           <p style="color:#888;font-size:12px;text-align:center;">Takes about a minute. Cancel anytime.</p>`
        : `<p style="color:#ccc;line-height:1.7;">Reply to this email or call (248) 487-8747 to arrange payment.</p>`);
  return `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="color:#fff;margin:0 0 6px;">Your website hosting renews soon</h2>
<p style="color:#888;font-size:13px;margin:0 0 24px;">${site.site_name}${site.domain ? ' · ' + site.domain : ''}</p>
<p style="color:#ccc;line-height:1.7;">Hi ${site.client_name || 'there'}, this is a heads-up that hosting &amp; maintenance for your site is due on <strong style="color:#fff;">${due}</strong>.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:20px;margin:22px 0;">
<table style="width:100%;font-size:14px;color:#ccc;">
<tr><td style="padding:4px 0;">Website</td><td style="text-align:right;color:#fff;">${site.site_name}</td></tr>
<tr><td style="padding:4px 0;">Amount</td><td style="text-align:right;color:#fff;font-weight:700;">$${fee}/month</td></tr>
<tr><td style="padding:4px 0;">Due</td><td style="text-align:right;color:#fff;">${due}</td></tr>
</table></div>
${cta}
<p style="color:#666;font-size:13px;">Questions? Just reply to this email or call (248) 487-8747.</p>
<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence • Detroit, MI</div></div>`;
}

function buildSmsText(site, dueDateStr, payUrl, onStripe) {
  const fee = parseFloat(site.monthly_fee) || 0;
  const due = new Date(dueDateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const name = site.site_name || 'your website';
  if (onStripe) {
    return `NUI: Heads-up — hosting for ${name} ($${fee}/mo) renews ${due}. Your card on file will be charged automatically. Questions? (248) 487-8747. Reply STOP to opt out.`;
  }
  return payUrl
    ? `NUI: Hosting for ${name} ($${fee}/mo) is due ${due}. Set up auto-pay here: ${payUrl} — Reply STOP to opt out.`
    : `NUI: Hosting for ${name} ($${fee}/mo) is due ${due}. Call (248) 487-8747 to pay. Reply STOP to opt out.`;
}

async function sendEmail(to, subject, html) {
  const nodemailer = require('nodemailer');
  const SMTP_USER = process.env.HOSTINGER_EMAIL;
  const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
  if (!SMTP_USER || !SMTP_PASS) throw new Error('SMTP not configured');
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', port: 465, secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  await transporter.sendMail({ from: `"New Urban Influence" <${SMTP_USER}>`, to, subject, html });
}

async function sendSms(to, message) {
  const API_KEY = process.env.OPENPHONE_API_KEY;
  const FROM = process.env.OPENPHONE_PHONE_NUMBER;
  if (!API_KEY || !FROM) throw new Error('OpenPhone not configured');
  const r = await fetch('https://api.openphone.com/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], content: message })
  });
  if (!r.ok) throw new Error('OpenPhone ' + r.status);
}

exports.handler = async (event) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Database not configured' }) };
  }

  const target = targetDateStr(DAYS_BEFORE);
  const summary = { target_date: target, considered: 0, emailed: 0, texted: 0, skipped: [], errors: [] };

  try {
    // Sites due exactly DAYS_BEFORE days out, reminders on, not paused/canceled.
    const url = `${SUPABASE_URL}/rest/v1/client_sites`
      + `?select=id,site_id,site_name,client_name,domain,monthly_fee,billing_status,next_due_date,contact_email,contact_phone,reminders_enabled,reminder_sent_for,stripe_subscription_id`
      + `&next_due_date=eq.${target}`
      + `&reminders_enabled=is.true`
      + `&billing_status=not.in.(paused,canceled)`;
    const resp = await fetch(url, { headers: sbHeaders() });
    if (!resp.ok) throw new Error('site query failed: ' + resp.status);
    const sites = await resp.json();
    summary.considered = sites.length;

    for (const site of sites) {
      // Idempotency guard — already reminded about this exact due date.
      if (site.reminder_sent_for === site.next_due_date) {
        summary.skipped.push({ site: site.site_id, why: 'already_sent' });
        continue;
      }
      if (!site.contact_email && !site.contact_phone) {
        summary.skipped.push({ site: site.site_id, why: 'no_contact' });
        continue;
      }

      const onStripe = !!site.stripe_subscription_id;
      const payUrl = onStripe ? null : await buildCheckoutLink(site);
      let sentAnything = false;

      if (site.contact_email) {
        try {
          await sendEmail(
            site.contact_email,
            `Your website hosting renews ${new Date(site.next_due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${site.site_name}`,
            buildEmailHtml(site, site.next_due_date, payUrl, onStripe)
          );
          summary.emailed++; sentAnything = true;
          console.log(`reminder emailed: ${site.site_id} → ${maskEmail(site.contact_email)}`);
        } catch (e) {
          summary.errors.push({ site: site.site_id, channel: 'email', error: e.message });
        }
      }

      const phone = toE164(site.contact_phone);
      if (phone) {
        if (await isSmsSuppressed(phone)) {
          summary.skipped.push({ site: site.site_id, why: 'sms_opted_out' });
        } else {
          try {
            await sendSms(phone, buildSmsText(site, site.next_due_date, payUrl, onStripe));
            summary.texted++; sentAnything = true;
            console.log(`reminder texted: ${site.site_id} → ${maskPhone(phone)}`);
          } catch (e) {
            summary.errors.push({ site: site.site_id, channel: 'sms', error: e.message });
          }
        }
      } else if (site.contact_phone) {
        summary.skipped.push({ site: site.site_id, why: 'bad_phone_format' });
      }

      // Mark sent only if at least one channel actually delivered, so a total
      // failure retries tomorrow instead of being silently marked done.
      if (sentAnything) {
        await fetch(`${SUPABASE_URL}/rest/v1/client_sites?id=eq.${encodeURIComponent(site.id)}`, {
          method: 'PATCH',
          headers: { ...sbHeaders(), 'Prefer': 'return=minimal' },
          body: JSON.stringify({ reminder_sent_for: site.next_due_date, reminder_sent_at: new Date().toISOString() })
        }).catch(e => console.warn('mark-sent failed:', e.message));
      }
    }

    console.log('site-reminders summary:', JSON.stringify(summary));
    return { statusCode: 200, body: JSON.stringify(summary) };
  } catch (err) {
    console.error('site-reminders error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message, summary }) };
  }
};
