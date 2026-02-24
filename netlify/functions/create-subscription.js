// create-subscription.js — Netlify Function
// Creates a Stripe Checkout session for subscriptions or pay-later
// Supports: recurring billing, Afterpay, Klarna, Affirm
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

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  try {
    const {
      clientEmail, clientName, clientId,
      amount, description, invoiceId,
      billingType,   // 'one_time', 'monthly', 'quarterly', 'yearly'
      billingCycles, // 0 = ongoing
      payLater       // 'none', 'afterpay', 'affirm', 'klarna'
    } = JSON.parse(event.body || '{}');

    if (!amount) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Amount required' }) };
    }

    const amountCents = Math.round(amount * 100);
    const origin = event.headers.origin || event.headers.referer?.replace(/\/+$/, '') || 'https://newurbaninfluence.com';

    // --- RECURRING SUBSCRIPTION ---
    if (billingType && billingType !== 'one_time') {
      // Step 1: Create a Stripe Price (recurring)
      const intervalMap = { monthly: 'month', quarterly: 'month', yearly: 'year' };
      const intervalCountMap = { monthly: 1, quarterly: 3, yearly: 1 };

      const priceParams = new URLSearchParams();
      priceParams.append('unit_amount', amountCents);
      priceParams.append('currency', 'usd');
      priceParams.append('recurring[interval]', intervalMap[billingType] || 'month');
      priceParams.append('recurring[interval_count]', intervalCountMap[billingType] || 1);
      priceParams.append('product_data[name]', description || 'NUI Website Hosting');
      priceParams.append('product_data[metadata][clientId]', clientId || '');
      priceParams.append('product_data[metadata][invoiceId]', invoiceId || '');

      const priceResp = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: priceParams.toString()
      });
      const price = await priceResp.json();
      if (!priceResp.ok) throw new Error(price.error?.message || 'Price creation failed');

      // Step 2: Create Checkout Session (subscription mode)
      const sessionParams = new URLSearchParams();
      sessionParams.append('mode', 'subscription');
      sessionParams.append('line_items[0][price]', price.id);
      sessionParams.append('line_items[0][quantity]', '1');
      sessionParams.append('success_url', `${origin}/app#portal?payment=success`);
      sessionParams.append('cancel_url', `${origin}/app#portal?payment=cancel`);
      sessionParams.append('metadata[clientId]', clientId || '');
      sessionParams.append('metadata[invoiceId]', invoiceId || '');
      sessionParams.append('metadata[billingType]', billingType);
      if (clientEmail) sessionParams.append('customer_email', clientEmail);

      const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: sessionParams.toString()
      });
      const session = await sessionResp.json();
      if (!sessionResp.ok) throw new Error(session.error?.message || 'Session creation failed');

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ url: session.url, sessionId: session.id, type: 'subscription' })
      };
    }

    // --- ONE-TIME WITH PAY LATER (Afterpay/Klarna/Affirm) ---
    const sessionParams = new URLSearchParams();
    sessionParams.append('mode', 'payment');
    sessionParams.append('line_items[0][price_data][currency]', 'usd');
    sessionParams.append('line_items[0][price_data][unit_amount]', amountCents);
    sessionParams.append('line_items[0][price_data][product_data][name]', description || 'NUI Invoice Payment');
    sessionParams.append('line_items[0][quantity]', '1');
    sessionParams.append('success_url', `${origin}/app#portal?payment=success`);
    sessionParams.append('cancel_url', `${origin}/app#portal?payment=cancel`);
    sessionParams.append('metadata[clientId]', clientId || '');
    sessionParams.append('metadata[invoiceId]', invoiceId || '');
    if (clientEmail) sessionParams.append('customer_email', clientEmail);

    // Enable specific pay-later methods
    if (payLater === 'afterpay') {
      sessionParams.append('payment_method_types[0]', 'card');
      sessionParams.append('payment_method_types[1]', 'afterpay_clearpay');
    } else if (payLater === 'klarna') {
      sessionParams.append('payment_method_types[0]', 'card');
      sessionParams.append('payment_method_types[1]', 'klarna');
    } else if (payLater === 'affirm') {
      sessionParams.append('payment_method_types[0]', 'card');
      sessionParams.append('payment_method_types[1]', 'affirm');
    }

    const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: sessionParams.toString()
    });
    const session = await sessionResp.json();
    if (!sessionResp.ok) throw new Error(session.error?.message || 'Session creation failed');

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: session.url, sessionId: session.id, type: 'payment' })
    };

  } catch (err) {
    console.error('create-subscription error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Failed to create checkout session' })
    };
  }
};
