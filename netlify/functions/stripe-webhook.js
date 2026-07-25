// stripe-webhook.js — Netlify Function
// Handles Stripe webhook events (payments, subscriptions, failures)
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
// Email: HOSTINGER_EMAIL, HOSTINGER_PASSWORD, MAIL_FROM
// SMS: OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const crypto = require('crypto');
const { maskEmail, maskPhone, maskName, redact, scrub } = require('./utils/log-safe');

function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured — rejecting webhook');
    return false;  // FAIL CLOSED: reject if no secret configured
  }
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  // Length guard: timingSafeEqual THROWS on unequal-length buffers.
  // A malformed v1 must be a clean 400, not an uncaught 500 (Stripe retry storm).
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

async function supabaseUpdate(url, serviceKey, table, match, data) {
  const query = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  return fetch(`${url}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json', 'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
}

async function supabaseSelect(url, serviceKey, table, query) {
  const resp = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
  });
  if (!resp.ok) return null;
  return resp.json();
}

// ── Client-site billing linkage (Phase 1) ─────────────────────────────
// Grace period is configurable: GRACE_PERIOD_DAYS env var, default 7.
const GRACE_PERIOD_DAYS = Math.max(1, parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10) || 7);

// A site auto-reactivates on payment ONLY if it was suspended for nonpayment:
// the Phase 2 cron constant 'payment_overdue', or the admin UI's prefilled
// "Payment overdue — ..." free-text reason. Any other reason never auto-clears.
function isNonpaymentReason(reason) {
  return typeof reason === 'string' && /^payment[ _]overdue/i.test(reason.trim());
}

const SITE_COLS = 'id,site_id,site_name,status,suspended_reason,billing_status,stripe_customer_id,stripe_subscription_id,grace_until';

// Resolve a Stripe event object to EXACTLY ONE client_sites row.
// Chain (first match wins); ambiguity or no match → null (caller logs + no-op):
//   1. stripe_subscription_id  (steady state for every renewal invoice)
//   2. metadata.site_id        (checkout session metadata / subscription_data metadata)
//   3. stripe_customer_id      (only if it matches exactly one row)
//   4. metadata.clientId → client_sites.client_id  (checkout only, legacy sessions;
//      only if exactly one non-suspended site matches)
async function resolveSite(url, serviceKey, obj, eventType) {
  const subId = typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id;
  const custId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;
  const metaSiteId = obj.metadata?.site_id
    || obj.subscription_details?.metadata?.site_id
    || obj.lines?.data?.[0]?.metadata?.site_id
    || null;

  if (subId) {
    const rows = await supabaseSelect(url, serviceKey, 'client_sites',
      `select=${SITE_COLS}&stripe_subscription_id=eq.${encodeURIComponent(subId)}`);
    if (rows && rows.length === 1) return rows[0];
  }
  if (metaSiteId) {
    const rows = await supabaseSelect(url, serviceKey, 'client_sites',
      `select=${SITE_COLS}&id=eq.${encodeURIComponent(metaSiteId)}`);
    if (rows && rows.length === 1) return rows[0];
  }
  if (custId) {
    const rows = await supabaseSelect(url, serviceKey, 'client_sites',
      `select=${SITE_COLS}&stripe_customer_id=eq.${encodeURIComponent(custId)}`);
    if (rows && rows.length === 1) return rows[0];
    if (rows && rows.length > 1) {
      console.warn(`site-resolution-ambiguous: customer ${custId} matches ${rows.length} sites`);
      return null;
    }
  }
  if (eventType === 'checkout.session.completed' && obj.metadata?.clientId) {
    const rows = await supabaseSelect(url, serviceKey, 'client_sites',
      `select=${SITE_COLS}&client_id=eq.${encodeURIComponent(obj.metadata.clientId)}&status=neq.suspended`);
    if (rows && rows.length === 1) return rows[0];
    if (rows && rows.length > 1) {
      console.warn(`site-resolution-ambiguous: clientId ${obj.metadata.clientId} matches ${rows.length} sites`);
      return null;
    }
  }
  return null;
}

async function sendNotifyEmail(to, subject, html) {
  try {
    const nodemailer = require('nodemailer');
    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    if (!SMTP_USER || !SMTP_PASS) return;
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', port: 465, secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({ from: `"New Urban Influence" <${SMTP_USER}>`, to, subject, html });
    console.log('Email sent to', maskEmail(to));
  } catch (e) { console.error('Email error:', e); }
}

async function sendNotifySMS(to, message) {
  try {
    const API_KEY = process.env.OPENPHONE_API_KEY;
    const FROM_ID = process.env.OPENPHONE_PHONE_NUMBER;
    if (!API_KEY || !FROM_ID || !to) return;
    await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: { 'Authorization': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_ID, to: [to], content: message })
    });
    console.log('SMS sent to', maskPhone(to));
  } catch (e) { console.error('SMS error:', e); }
}

const PORTAL_URL = 'https://newurbaninfluence.com/app/#login';
const ADMIN_EMAIL = () => process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // ── Signature is MANDATORY. Fail closed on missing header or missing secret.
    // (Previously: verification was skipped entirely when the header was absent.)
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    if (!sig) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing stripe-signature header' }) };
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not set — rejecting all webhooks (fail closed)');
      return { statusCode: 500, body: JSON.stringify({ error: 'Webhook secret not configured' }) };
    }
    if (!verifyStripeSignature(event.body, sig, STRIPE_WEBHOOK_SECRET)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const obj = stripeEvent.data?.object;
    console.log(`Stripe webhook: ${eventType}`);

    const hasDB = SUPABASE_URL && SUPABASE_SERVICE_KEY;

    switch (eventType) {

      // ── Payment succeeded ──
      case 'payment_intent.succeeded': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
            { stripe_payment_intent_id: obj.id },
            { status: 'paid', paid_at: new Date().toISOString() }
          );
          if (obj.metadata?.invoiceId) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
              { id: obj.metadata.invoiceId },
              { status: 'paid', paid_at: new Date().toISOString() }
            );
          }
        }
        break;
      }

      // ── Payment failed ──
      case 'payment_intent.payment_failed': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
            { stripe_payment_intent_id: obj.id },
            { status: 'failed', metadata: { failure_message: obj.last_payment_error?.message } }
          );
        }
        break;
      }

      // ── Invoice paid (recurring subscription) ──
      case 'invoice.paid': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { stripe_invoice_id: obj.id },
            { status: 'paid', paid_at: new Date().toISOString() }
          );

          // Client-site billing: mark current, clear grace, and reactivate
          // ONLY if the site was suspended specifically for nonpayment.
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY, obj, eventType);
          if (site) {
            const patch = { billing_status: 'active', grace_until: null };
            if (site.status === 'suspended' && isNonpaymentReason(site.suspended_reason)) {
              patch.status = 'active';
              patch.suspended_reason = null;
              patch.suspended_at = null;
              console.log(`site ${site.site_id || site.id}: reactivated after payment`);
            }
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites', { id: site.id }, patch);
          } else {
            console.warn(`site-resolution-failed: invoice.paid ${obj.id} (sub=${obj.subscription || 'none'})`);
          }
        }
        break;
      }

      // ── Subscription payment failed — AUTO EMAIL + SMS ──
      case 'invoice.payment_failed': {
        const customerEmail = obj.customer_email;
        const customerName = obj.customer_name || '';
        let siteTransitionedToOverdue = true; // default: preserve legacy email behavior for non-site subscriptions
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { stripe_invoice_id: obj.id }, { status: 'overdue' }
          );

          // Client-site billing: start (or keep) the grace period. NEVER suspend here —
          // suspension is the Phase 2 cron's job, after grace_until has passed.
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY, obj, eventType);
          if (site) {
            if (site.billing_status !== 'overdue') {
              const graceUntil = new Date(Date.now() + GRACE_PERIOD_DAYS * 86400000).toISOString();
              await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
                { id: site.id }, { billing_status: 'overdue', grace_until: graceUntil });
              console.log(`site ${site.site_id || site.id}: overdue, grace until ${graceUntil}`);
            } else {
              // Already overdue: idempotent replay/duplicate — keep original grace_until,
              // and suppress the duplicate dunning email below.
              siteTransitionedToOverdue = false;
            }
          } else {
            console.warn(`site-resolution-failed: invoice.payment_failed ${obj.id} (sub=${obj.subscription || 'none'})`);
          }
        }
        if (obj.subscription && customerEmail && siteTransitionedToOverdue) {
          // Email client
          await sendNotifyEmail(customerEmail,
            '⚠️ Payment Failed — Your Subscription Has Been Paused',
            `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="color:#ef4444;">⚠️ Payment Failed</h2>
<p style="color:#ccc;line-height:1.7;">Hi${customerName ? ' ' + customerName : ''}, we were unable to process your subscription payment. Your account has been paused and all active orders are on hold.</p>
<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:20px;margin:24px 0;">
<p style="color:#f59e0b;font-weight:600;margin:0 0 8px;">What this means:</p>
<p style="color:#999;font-size:14px;line-height:1.6;margin:0;">• All design orders are on hold<br>• No new orders accepted<br>• Files retained for 90 days<br>• After 90 days, files permanently deleted</p>
</div>
<div style="text-align:center;margin:24px 0;"><a href="${PORTAL_URL}" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Update Payment →</a></div>
<p style="color:#666;font-size:13px;">Call (248) 487-8747 for help.</p>
<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence • Detroit, MI</div></div>`
          );
          // Alert admin
          await sendNotifyEmail(ADMIN_EMAIL(),
            '🚨 Subscription Payment FAILED — ' + customerEmail,
            `<h2 style="color:red;">Payment Failed</h2><p>Client: ${customerEmail} (${customerName})</p><p>Invoice: ${obj.id}</p><p><strong>Pause their subscription in admin panel and follow up.</strong></p>`
          );
        }
        break;
      }

      // ── Checkout completed — subscription activated ──
      case 'checkout.session.completed': {
        const meta = obj.metadata || {};
        const clientEmail = obj.customer_email || obj.customer_details?.email;
        if (hasDB && meta.invoiceId) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { id: meta.invoiceId }, { status: 'paid', paid_at: new Date().toISOString() }
          );
        }

        // Client-site billing linkage: this is the ONLY place the Stripe
        // customer/subscription IDs are stored and billing_status set active.
        if (hasDB && obj.mode === 'subscription') {
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY, obj, eventType);
          if (site) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
              { id: site.id },
              {
                stripe_customer_id: (typeof obj.customer === 'string' ? obj.customer : obj.customer?.id) || null,
                stripe_subscription_id: (typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id) || null,
                billing_status: 'active',
                grace_until: null
              }
            );
            console.log(`site ${site.site_id || site.id}: linked to subscription ${obj.subscription}`);
          } else {
            console.warn(`site-resolution-failed: checkout.session.completed ${obj.id} (site_id=${meta.site_id || 'none'}, clientId=${meta.clientId || 'none'})`);
          }
        }
        if (clientEmail && obj.mode === 'subscription') {
          await sendNotifyEmail(clientEmail,
            '✅ Subscription Activated — Welcome!',
            `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">
<h2 style="color:#10b981;">✅ You're All Set!</h2>
<p style="color:#ccc;line-height:1.7;">Your design subscription is now active. Payment confirmed.</p>
<p style="color:#ccc;line-height:1.7;">Log in to your client portal to submit your first design order:</p>
<div style="text-align:center;margin:24px 0;"><a href="${PORTAL_URL}" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Open Client Portal →</a></div>
<p style="color:#666;font-size:13px;">Questions? Call (248) 487-8747.</p>
<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;color:#555;font-size:12px;">New Urban Influence • Detroit, MI</div></div>`
          );
          await sendNotifyEmail(ADMIN_EMAIL(),
            '💰 New Subscription Payment — ' + clientEmail,
            `<h2>Subscription Activated</h2><p>Client: ${clientEmail}</p><p>Client ID: ${meta.clientId || 'N/A'}</p><p><strong>Set their status to Active in admin panel.</strong></p>`
          );
        }
        break;
      }

      // ── Subscription status changes ──
      // NOTE: for customer.subscription.* events the object IS the subscription,
      // so we adapt it (subscription = obj.id) before resolving the site.
      // subscription_data.metadata.site_id set at checkout also lives on obj.metadata.
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':    // distinct event on trial-end pause (status='paused')
      case 'customer.subscription.resumed': { // distinct event when a paused subscription resumes
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
            { stripe_customer_id: obj.customer },
            { subscription_status: obj.status, stripe_subscription_id: obj.id }
          );

          // Client-site billing: keep billing_status in sync with the
          // subscription's own lifecycle status (covers Stripe Smart-Retry
          // outcomes and recoveries that don't emit an invoice event).
          // IDs are never stored here — that stays exclusive to
          // checkout.session.completed. Site status is never touched here.
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            { subscription: obj.id, customer: obj.customer, metadata: obj.metadata }, eventType);
          if (site && site.stripe_subscription_id) {
            // Pause comes in two shapes: status='paused' (trial ended, no card)
            // or pause_collection set while status stays 'active' (deliberate
            // collection pause). Both = paused: no dunning, no grace, and the
            // Phase 2 cron must never suspend a paused site.
            const isPaused = obj.status === 'paused' || !!obj.pause_collection;
            // 'trialing' = service is live and will bill later → same as active.
            const isCurrent = (obj.status === 'active' || obj.status === 'trialing') && !isPaused;
            if (isPaused && site.billing_status !== 'paused') {
              await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
                { id: site.id }, { billing_status: 'paused', grace_until: null });
              console.log(`site ${site.site_id || site.id}: subscription paused → billing paused`);
            } else if (!isPaused && (obj.status === 'past_due' || obj.status === 'unpaid') && site.billing_status !== 'overdue') {
              const graceUntil = new Date(Date.now() + GRACE_PERIOD_DAYS * 86400000).toISOString();
              await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
                { id: site.id }, { billing_status: 'overdue', grace_until: graceUntil });
              console.log(`site ${site.site_id || site.id}: subscription ${obj.status} → overdue, grace until ${graceUntil}`);
            } else if (isCurrent && site.billing_status !== 'active') {
              await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
                { id: site.id }, { billing_status: 'active', grace_until: null });
            } else if (obj.status === 'canceled' && site.billing_status !== 'canceled') {
              await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
                { id: site.id }, { billing_status: 'canceled', grace_until: null });
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
            { stripe_customer_id: obj.customer },
            { subscription_status: 'canceled', stripe_subscription_id: null }
          );

          // Client-site billing: subscription is gone — no more invoices will
          // ever arrive, so mark billing canceled and alert Faren. The site
          // itself is NEVER auto-suspended here (admin / Phase 2 cron decision).
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            { subscription: obj.id, customer: obj.customer, metadata: obj.metadata }, eventType);
          if (site && site.stripe_subscription_id) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
              { id: site.id }, { billing_status: 'canceled', grace_until: null });
            await sendNotifyEmail(ADMIN_EMAIL(),
              '⚠️ Hosting subscription CANCELED — ' + (site.site_name || site.site_id || site.id),
              `<h2 style="color:#f59e0b;">Hosting Subscription Canceled</h2><p>Site: <strong>${site.site_name || ''}</strong> (${site.site_id || site.id})</p><p>Subscription: ${obj.id}</p><p>The site is still live. Decide whether to suspend it or win the client back.</p>`
            );
            console.log(`site ${site.site_id || site.id}: subscription deleted → billing canceled`);
          }
        }
        break;
      }

      // ── Trial ending soon (fires ~3 days before first charge) ──
      case 'customer.subscription.trial_will_end': {
        let siteLabel = obj.id;
        if (hasDB) {
          const site = await resolveSite(SUPABASE_URL, SUPABASE_SERVICE_KEY,
            { subscription: obj.id, customer: obj.customer, metadata: obj.metadata }, eventType);
          if (site) siteLabel = `${site.site_name || site.site_id || site.id}`;
        }
        const trialEnd = obj.trial_end ? new Date(obj.trial_end * 1000).toLocaleDateString() : 'soon';
        await sendNotifyEmail(ADMIN_EMAIL(),
          `⏳ Trial ends ${trialEnd} — ${siteLabel}`,
          `<h2>Hosting Trial Ending</h2><p>Site: <strong>${siteLabel}</strong></p><p>Subscription: ${obj.id}</p><p>First charge on <strong>${trialEnd}</strong>. Good moment to check in with the client.</p>`
        );
        break;
      }

      // ── Money-back events: notify admin, write nothing ──
      case 'charge.refunded': {
        await sendNotifyEmail(ADMIN_EMAIL(),
          '↩️ Stripe charge refunded',
          `<h2>Charge Refunded</h2><p>Charge: ${obj.id}</p><p>Amount refunded: $${((obj.amount_refunded || 0) / 100).toFixed(2)}</p>${obj.receipt_email ? `<p>Customer: ${obj.receipt_email}</p>` : ''}`
        );
        break;
      }

      case 'charge.dispute.created': {
        await sendNotifyEmail(ADMIN_EMAIL(),
          '🚨 Stripe DISPUTE opened — respond before the deadline',
          `<h2 style="color:red;">Dispute Opened</h2><p>Dispute: ${obj.id}</p><p>Charge: ${obj.charge}</p><p>Amount: $${((obj.amount || 0) / 100).toFixed(2)}</p><p><strong>Respond with evidence in the Stripe Dashboard before the due date — no response = automatic loss.</strong></p>`
        );
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${eventType}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true, type: eventType }) };
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
