// stripe-webhook.js — Netlify Function
// Handles Stripe webhook events (invoice.paid, subscription changes, etc.)
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY

const crypto = require('crypto');

function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret) return true; // Skip verification if no secret (dev mode)
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});
  const timestamp = parts.t;
  const signature = parts.v1;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expected));
}

async function supabaseUpdate(url, serviceKey, table, match, data) {
  const query = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  return fetch(`${url}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // Verify signature
    const sig = event.headers['stripe-signature'];
    if (STRIPE_WEBHOOK_SECRET && sig) {
      const valid = verifyStripeSignature(event.body, sig, STRIPE_WEBHOOK_SECRET);
      if (!valid) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) };
      }
    }

    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const obj = stripeEvent.data?.object;

    console.log(`Stripe webhook: ${eventType}`);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('Supabase not configured — webhook received but not processed');
      return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'No DB configured' }) };
    }

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const piId = obj.id;
        const invoiceId = obj.metadata?.invoiceId;
        // Update payment record
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
          { stripe_payment_intent_id: piId },
          { status: 'paid', paid_at: new Date().toISOString() }
        );
        // Update invoice if linked
        if (invoiceId) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { id: invoiceId },
            { status: 'paid', paid_at: new Date().toISOString() }
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const piId = obj.id;
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'payments',
          { stripe_payment_intent_id: piId },
          { status: 'failed', metadata: { failure_message: obj.last_payment_error?.message } }
        );
        break;
      }

      case 'invoice.paid': {
        const stripeInvoiceId = obj.id;
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
          { stripe_invoice_id: stripeInvoiceId },
          { status: 'paid', paid_at: new Date().toISOString() }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const stripeInvoiceId = obj.id;
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
          { stripe_invoice_id: stripeInvoiceId },
          { status: 'overdue' }
        );
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subId = obj.id;
        const customerId = obj.customer;
        const status = obj.status; // active, past_due, canceled, etc.
        // Update client subscription status
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
          { stripe_customer_id: customerId },
          { subscription_status: status, stripe_subscription_id: subId }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const customerId = obj.customer;
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'clients',
          { stripe_customer_id: customerId },
          { subscription_status: 'canceled', stripe_subscription_id: null }
        );
        break;
      }

      case 'checkout.session.completed': {
        const invoiceId = obj.metadata?.invoiceId;
        if (invoiceId) {
          await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'invoices',
            { id: invoiceId },
            { status: 'paid', paid_at: new Date().toISOString() }
          );
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${eventType}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, type: eventType })
    };
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Webhook processing failed' })
    };
  }
};
