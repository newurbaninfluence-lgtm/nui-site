// create-subscription.js — Netlify Function
// Creates a Stripe Checkout session for subscriptions or pay-later.
// Sub-accounts must supply their own Stripe key — NUI's key is never shared.
// Supports: recurring billing, Afterpay, Klarna, Affirm
// Env vars (NUI master only): STRIPE_SECRET_KEY

const { requireAdmin } = require('./utils/security');
const { getBrand } = require('./utils/agency-brand');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
    const parsed = JSON.parse(event.body || '{}');
    const {
      clientEmail, clientName, clientId,
      amount, description, invoiceId,
      billingType, billingCycles, payLater,
      agency_id, site_id
    } = parsed;

    // --- PHASE 1B: SITE HOSTING CHECKOUT (server-side priced) ---
    // Generates a subscription checkout link for a client_sites row.
    // The amount comes from client_sites.monthly_fee via the service key —
    // any browser-supplied amount is IGNORED on this path. Line items are
    // built as an array so a separate maintenance Price can be added to the
    // SAME subscription later (one subscription per site, multiple items).
    if (parsed.site_checkout) {
      const auth = requireAdmin(event);
      if (!auth.authorized) {
        return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: auth.error || 'Unauthorized' }) };
      }
      if (!site_id) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'site_id required' }) };
      }
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Database not configured' }) };
      }
      const rowResp = await fetch(
        `${SUPABASE_URL}/rest/v1/client_sites?id=eq.${encodeURIComponent(site_id)}&select=id,site_name,client_name,plan,monthly_fee,stripe_subscription_id`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const rows = rowResp.ok ? await rowResp.json() : [];
      const siteRow = rows[0];
      if (!siteRow) {
        return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Site not found' }) };
      }
      if (siteRow.stripe_subscription_id) {
        return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Site already linked to subscription ' + siteRow.stripe_subscription_id }) };
      }
      const fee = parseFloat(siteRow.monthly_fee);
      if (!(fee > 0)) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Set a monthly fee on this site before generating a checkout link' }) };
      }
      // One subscription per site; hosting + maintenance are currently one
      // bundled fee. Add future fixed items to this array — same subscription.
      const items = [{
        name: `${siteRow.site_name} — Website Hosting & Maintenance (${siteRow.plan || 'basic'})`,
        amountCents: Math.round(fee * 100)
      }];
      const origin2 = event.headers.origin || 'https://newurbaninfluence.com';
      const sp = new URLSearchParams();
      sp.append('mode', 'subscription');
      for (let i = 0; i < items.length; i++) {
        const pp = new URLSearchParams();
        pp.append('unit_amount', items[i].amountCents);
        pp.append('currency', 'usd');
        pp.append('recurring[interval]', 'month');
        pp.append('product_data[name]', items[i].name);
        pp.append('product_data[metadata][site_id]', siteRow.id);
        const pr = await fetch('https://api.stripe.com/v1/prices', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: pp.toString()
        });
        const price = await pr.json();
        if (!pr.ok) throw new Error(price.error?.message || 'Price creation failed');
        sp.append(`line_items[${i}][price]`, price.id);
        sp.append(`line_items[${i}][quantity]`, '1');
      }
      sp.append('success_url', `${origin2}/app#portal?payment=success`);
      sp.append('cancel_url', `${origin2}/app#portal?payment=cancel`);
      sp.append('metadata[site_id]', siteRow.id);
      sp.append('subscription_data[metadata][site_id]', siteRow.id);
      // Optional free trial (admin-chosen at link generation, capped server-side).
      // Stripe fires customer.subscription.trial_will_end ~3 days before first charge.
      const trialDays = Math.min(90, Math.max(0, parseInt(parsed.trial_days, 10) || 0));
      if (trialDays > 0) sp.append('subscription_data[trial_period_days]', String(trialDays));
      const sr = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: sp.toString()
      });
      const session = await sr.json();
      if (!sr.ok) throw new Error(session.error?.message || 'Session creation failed');
      // NOTE: nothing is written to client_sites here — only the
      // checkout.session.completed webhook may store IDs / set billing_status.
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ url: session.url, sessionId: session.id, type: 'site_checkout', amount: fee, site_name: siteRow.site_name, trial_days: trialDays })
      };
    }

    if (!amount) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Amount required' }) };
    }

    // Resolve Stripe key — sub-accounts must use their own, never NUI's.
    const brand = await getBrand(agency_id || null);
    const agencyStripeKey = brand._raw && brand._raw.integrations_config && brand._raw.integrations_config.stripe_sk;

    if (agency_id && !agencyStripeKey) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Stripe not configured',
          detail: 'This agency has not set up their own Stripe credentials yet. Go to Settings → Integrations to add them.'
        })
      };
    }

    const stripeKey = agencyStripeKey || STRIPE_SECRET_KEY;

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
          'Authorization': `Bearer ${stripeKey}`,
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
      if (site_id) {
        // site_id on the session → webhook links checkout.session.completed to the site.
        // site_id on subscription_data.metadata → copied onto the Subscription object,
        // so every future renewal invoice remains resolvable to this site.
        sessionParams.append('metadata[site_id]', site_id);
        sessionParams.append('subscription_data[metadata][site_id]', site_id);
      }
      if (clientEmail) sessionParams.append('customer_email', clientEmail);

      const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
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
    if (site_id) sessionParams.append('metadata[site_id]', site_id);
    if (clientEmail) sessionParams.append('customer_email', clientEmail);

    // Enable specific pay-later methods
    if (payLater === 'afterpay') {
      sessionParams.append('payment_method_types[0]', 'card');
      sessionParams.append('payment_method_types[1]', 'afterpay_clearpay');
      sessionParams.append('payment_method_types[2]', 'klarna');
    } else if (payLater === 'klarna') {
      sessionParams.append('payment_method_types[0]', 'card');
      sessionParams.append('payment_method_types[1]', 'klarna');
      sessionParams.append('payment_method_types[2]', 'afterpay_clearpay');
    }

    const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
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
