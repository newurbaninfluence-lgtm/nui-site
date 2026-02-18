// send-email.js — Netlify Function
// Sends email via Hostinger SMTP using nodemailer
// Env vars: HOSTINGER_EMAIL, HOSTINGER_PASSWORD, MAIL_FROM

const nodemailer = require('nodemailer');

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
    const { to, subject, html, text, clientId } = JSON.parse(event.body || '{}');

    if (!to || !subject) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required fields: to, subject' })
      };
    }

    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

    if (!SMTP_USER || !SMTP_PASS) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'SMTP not configured. Set HOSTINGER_EMAIL and HOSTINGER_PASSWORD in Netlify env vars.' })
      };
    }

    // Create SMTP transporter (Hostinger uses SSL on port 465)
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: to,
      subject: subject,
      html: html || `<p>${text || ''}</p>`,
      text: text || ''
    });

    console.log('📧 Email sent:', info.messageId, '→', to);

    // Log to Supabase if service key is available
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
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
