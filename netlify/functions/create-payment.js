// create-payment.js — Netlify Function
// Creates a Stripe PaymentIntent for invoice payments
// Env vars: STRIPE_SECRET_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { invoiceId, amount, clientId, clientEmail, description } = JSON.parse(event.body || '{}');

    if (!amount) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required field: amount' }) };
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY.' }) };
    }

    // Create PaymentIntent via Stripe REST API
    const params = new URLSearchParams();
    params.append('amount', Math.round(amount * 100)); // Convert to cents
    params.append('currency', 'usd');
    params.append('description', description || `Invoice payment`);
    params.append('metadata[invoiceId]', invoiceId || '');
    params.append('metadata[clientId]', clientId || '');
    if (clientEmail) params.append('receipt_email', clientEmail);
    params.append('automatic_payment_methods[enabled]', 'true');

    const resp = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const paymentIntent = await resp.json();
    if (!resp.ok) {
      throw new Error(paymentIntent.error?.message || 'Stripe PaymentIntent creation failed');
    }

    // Log to Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          invoice_id: invoiceId || null,
          client_id: clientId || null,
          amount: parseFloat(amount),
          status: 'pending',
          stripe_payment_intent_id: paymentIntent.id,
          metadata: { description, clientEmail },
          created_at: new Date().toISOString()
        })
      }).catch(err => console.warn('Payment log to Supabase failed:', err.message));
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };
  } catch (err) {
    console.error('create-payment error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Payment creation failed' })
    };
  }
};
