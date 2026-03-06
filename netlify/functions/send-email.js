// send-email.js — Netlify Function
// Sends email via Hostinger SMTP using nodemailer
// Env vars: HOSTINGER_EMAIL, HOSTINGER_PASSWORD, MAIL_FROM

const { requireAdmin } = require('./utils/security');
const { getBrand, hasSMTP, getTransporter, getFromAddress } = require('./utils/agency-brand');

const nodemailer = require('nodemailer');

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

  try {
    const { to, subject, html, text, clientId, contactId, agency_id } = JSON.parse(event.body || '{}')
    const brand = await getBrand(agency_id || null);

    if (!to || !subject) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required fields: to, subject' })
      };
    }

    // Sub-accounts must have their own SMTP configured — never use NUI's credentials.
    if (agency_id && !hasSMTP(brand)) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Email not configured',
          detail: 'This agency has not set up their own SMTP credentials yet. Go to Settings → Integrations to add them.'
        })
      };
    }

    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

    // NUI master admin path: require env vars
    if (!agency_id && (!SMTP_USER || !SMTP_PASS)) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'SMTP not configured. Set HOSTINGER_EMAIL and HOSTINGER_PASSWORD in Netlify env vars.' })
      };
    }

    // Build transporter — uses brand's own SMTP if sub-account, NUI env vars if master.
    const transporter = getTransporter(brand);

    // Build HTML with tracking pixel
    const baseHtml = html || `<p>${text || ''}</p>`;
    const siteUrl = process.env.URL || 'https://newurbaninfluence.com';
    let trackedHtml = baseHtml;

    // Embed open-tracking pixel if we have a contactId
    if (contactId) {
      const trackUrl = `${siteUrl}/.netlify/functions/email-track?cid=${contactId}&id=${Date.now()}`;
      trackedHtml += `<img src="${trackUrl}" width="1" height="1" style="display:none" alt="" />`;
    }

    // Send email
    const info = await transporter.sendMail({
      from: getFromAddress(brand),
      to: to,
      subject: subject,
      html: trackedHtml,
      text: text || ''
    });

    console.log('📧 Email sent:', info.messageId, '→', to);

    // Log to Supabase if service key is available
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      // Log to communications table (existing behavior)
      await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          channel: 'email',
          direction: 'outbound',
          subject,
          message: text || html || '',
          client_id: clientId || null,
          metadata: { to, provider: 'hostinger-smtp', messageId: info.messageId },
          created_at: new Date().toISOString()
        })
      }).catch(err => console.warn('Email log to Supabase failed:', err.message));

      // Also log to activity_log if we have a contactId (for Contact Hub timeline)
      if (contactId) {
        await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            contact_id: contactId,
            event_type: 'email_sent',
            direction: 'outbound',
            metadata: {
              to, subject,
              messageId: info.messageId,
              preview: (text || '').substring(0, 200)
            }
          })
        }).catch(err => console.warn('Activity log failed:', err.message));
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, messageId: info.messageId })
    };
  } catch (err) {
    console.error('send-email error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Email send failed' })
    };
  }
};
