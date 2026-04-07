// stripe-webhook.js — Netlify Function
// Handles Stripe webhook events (payments, subscriptions, failures, payment links)
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
// Email: HOSTINGER_EMAIL, HOSTINGER_PASSWORD, MAIL_FROM
// SMS: OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const crypto = require('crypto');

function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret) { console.error('STRIPE_WEBHOOK_SECRET not configured'); return false; }
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, val] = part.split('='); acc[key] = val; return acc;
  }, {});
  const signedPayload = `${parts.t}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(parts.v1 || ''), Buffer.from(expected));
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
    console.log('Email sent to', to);
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
    console.log('SMS sent to', to);
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
    const sig = event.headers['stripe-signature'];
    if (STRIPE_WEBHOOK_SECRET && sig) {
      if (!verifyStripeSignature(event.body, sig, STRIPE_WEBHOOK_SECRET)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) };
      }
    }
    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const obj = stripeEvent.data && stripeEvent.data.object;
    console.log('Stripe webhook:', eventType);

    const hasDB = SUPABASE_URL && SUPABASE_SERVICE_KEY;

    switch (eventType) {

      // ── Payment intent succeeded ──
      case 'payment_intent.succeeded': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
            { stripe_payment_intent_id: obj.id },
            { status: 'paid', paid_at: new Date().toISOString() }
          );
          if (obj.metadata && obj.metadata.invoiceId) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
              { id: obj.metadata.invoiceId },
              { status: 'paid', paid_at: new Date().toISOString() }
            );
          }
        }
        break;
      }

      // ── Payment intent failed ──
      case 'payment_intent.payment_failed': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
            { stripe_payment_intent_id: obj.id },
            { status: 'failed' }
          );
        }
        break;
      }

      // ── Invoice paid (recurring) ──
      case 'invoice.paid': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { stripe_invoice_id: obj.id },
            { status: 'paid', paid_at: new Date().toISOString() }
          );
        }
        break;
      }

      // ── Subscription payment failed ──
      case 'invoice.payment_failed': {
        const customerEmail = obj.customer_email;
        const customerName = obj.customer_name || '';
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { stripe_invoice_id: obj.id }, { status: 'overdue' }
          );
        }
        if (obj.subscription && customerEmail) {
          await sendNotifyEmail(customerEmail,
            'Payment Failed - Your Subscription Has Been Paused',
            '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">' +
            '<h2 style="color:#ef4444;">Payment Failed</h2>' +
            '<p style="color:#ccc;line-height:1.7;">Hi' + (customerName ? ' ' + customerName : '') + ', we were unable to process your subscription payment.</p>' +
            '<div style="text-align:center;margin:24px 0;"><a href="' + PORTAL_URL + '" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Update Payment</a></div>' +
            '<p style="color:#666;font-size:13px;">Call (248) 487-8747 for help.</p></div>'
          );
          await sendNotifyEmail(ADMIN_EMAIL(),
            'Subscription Payment FAILED - ' + customerEmail,
            '<h2 style="color:red;">Payment Failed</h2><p>Client: ' + customerEmail + ' (' + customerName + ')</p><p>Invoice: ' + obj.id + '</p>'
          );
        }
        break;
      }

      // ── Checkout session completed (payment links + subscriptions) ──
      case 'checkout.session.completed': {
        const meta = obj.metadata || {};
        const clientEmail = obj.customer_email || (obj.customer_details && obj.customer_details.email);
        const now = new Date().toISOString();
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // ── PAYMENT LINK: one-time payment ──
        if (obj.mode === 'payment' && meta.site) {
          // Update client_sites
          if (hasDB) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'client_sites',
              { site_id: meta.site },
              { last_payment_date: now, next_payment_due: nextMonth, status: 'active' }
            );
          }
          // Update crm_contacts
          if (hasDB && clientEmail) {
            await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'crm_contacts',
              { email: clientEmail },
              { status: 'client', last_contacted: now, last_activity_at: now }
            );
          }
          const amountPaid = obj.amount_total ? '$' + (obj.amount_total / 100).toFixed(2) : '';
          const clientFirst = meta.client ? meta.client.split(' ')[0] : '';
          // Notify Faren
          await sendNotifyEmail(ADMIN_EMAIL(),
            'Payment Received - ' + (meta.client || clientEmail) + ' (' + amountPaid + ')',
            '<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:32px;max-width:600px;border-radius:10px;">' +
            '<h2 style="color:#10b981;">Payment Received</h2>' +
            '<p><strong>Client:</strong> ' + (meta.client || 'N/A') + '</p>' +
            '<p><strong>Email:</strong> ' + (clientEmail || 'N/A') + '</p>' +
            '<p><strong>Service:</strong> ' + (meta.service || 'N/A') + '</p>' +
            '<p><strong>Site:</strong> ' + (meta.site || 'N/A') + '</p>' +
            '<p><strong>Amount:</strong> ' + amountPaid + '</p>' +
            '<p style="color:#10b981;font-weight:700;">Client record and site status auto-updated in backend.</p>' +
            '</div>'
          );
          // Confirm to client
          if (clientEmail) {
            await sendNotifyEmail(clientEmail,
              'Payment Confirmed - Your Digital HQ is Being Activated',
              '<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:40px;max-width:600px;border-radius:10px;border-top:4px solid #D90429;">' +
              '<div style="text-align:center;margin-bottom:24px;">' +
              '<div style="font-size:18px;font-weight:900;letter-spacing:2px;">NEW URBAN INFLUENCE</div>' +
              '<div style="color:#C9A227;font-size:11px;letter-spacing:3px;margin-top:4px;">DESIGNING CULTURE. BUILDING INFLUENCE.</div></div>' +
              '<h2 style="color:#10b981;text-align:center;">Payment Confirmed!</h2>' +
              '<p style="color:rgba(255,255,255,0.7);text-align:center;">Thank you ' + clientFirst + '! We received your payment of <strong style="color:#fff;">' + amountPaid + '</strong>.</p>' +
              '<div style="background:#111;border:1px solid #222;border-radius:8px;padding:24px;margin:24px 0;">' +
              '<p style="color:#C9A227;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 12px;">WHAT HAPPENS NOW</p>' +
              '<p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0;">' +
              'Your Digital HQ is being activated<br>' +
              'CRM, ticket system and AI chatbox setup within 24hrs<br>' +
              'You will receive onboarding details shortly<br>' +
              'Your site: <a href="https://backyard-comedy-battle.netlify.app" style="color:#D90429;">backyard-comedy-battle.netlify.app</a></p></div>' +
              '<p style="color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">Questions? Reply to this email or text (248) 487-8747</p>' +
              '<div style="border-top:1px solid #222;margin-top:24px;padding-top:16px;text-align:center;">' +
              '<a href="https://newurbaninfluence.com" style="color:#C9A227;font-size:12px;text-decoration:none;">newurbaninfluence.com</a></div></div>'
            );
          }
          break;
        }

        // ── Invoice checkout ──
        if (hasDB && meta.invoiceId) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { id: meta.invoiceId }, { status: 'paid', paid_at: now }
          );
        }
        // ── Subscription checkout ──
        if (clientEmail && obj.mode === 'subscription') {
          await sendNotifyEmail(clientEmail,
            'Subscription Activated - Welcome!',
            '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;">' +
            '<h2 style="color:#10b981;">You are All Set!</h2>' +
            '<p style="color:#ccc;line-height:1.7;">Your subscription is now active. Payment confirmed.</p>' +
            '<div style="text-align:center;margin:24px 0;"><a href="' + PORTAL_URL + '" style="display:inline-block;padding:14px 40px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Open Client Portal</a></div>' +
            '<p style="color:#666;font-size:13px;">Questions? Call (248) 487-8747.</p></div>'
          );
          await sendNotifyEmail(ADMIN_EMAIL(),
            'New Subscription Payment - ' + clientEmail,
            '<h2>Subscription Activated</h2><p>Client: ' + clientEmail + '</p><p>Client ID: ' + (meta.clientId || 'N/A') + '</p>'
          );
        }
        break;
      }

      // ── Subscription status changes ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
            { stripe_customer_id: obj.customer },
            { subscription_status: obj.status, stripe_subscription_id: obj.id }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        if (hasDB) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
            { stripe_customer_id: obj.customer },
            { subscription_status: 'canceled', stripe_subscription_id: null }
          );
        }
        break;
      }

      default:
        console.log('Unhandled Stripe event:', eventType);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true, type: eventType }) };
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
