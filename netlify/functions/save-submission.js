// save-submission.js — Netlify Function
// Saves form submissions / service intake to Supabase
// Then immediately fires email + SMS response — no cron, no polling
// POST { serviceId, serviceName, price, contactName, email, phone, businessName, ... }
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY
//           SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM
//           OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER

const nodemailer = require('nodemailer');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;
const OP_KEY           = process.env.OPENPHONE_API_KEY;
const OP_FROM          = process.env.OPENPHONE_PHONE_NUMBER;

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ── Generate AI reply with Claude Haiku ───────────────────────────────────
async function generateReply(type, context) {
  const prompts = {
    email: `You are responding on behalf of New Urban Influence (NUI), a Detroit branding and AI automation agency founded by Faren Young.

A potential client just submitted an inquiry. Write a warm, professional email reply that:
- Acknowledges their specific interest
- Briefly positions NUI as the right choice for them
- Provides a clear next step (book a free call: https://newurbaninfluence.com/book)
- Sounds like Faren wrote it personally — confident, Detroit-grounded, not corporate

Context: ${context}

Write ONLY the email body (no subject line, no "Dear Name"). Keep it under 150 words.`,

    sms: `Write a 1-sentence SMS from New Urban Influence. Someone just submitted an inquiry form. Sound human and warm — curious about their need. Under 160 chars. End with "- Faren".

Context: ${context}`
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: type === 'email' ? 300 : 100,
      messages: [{ role: 'user', content: prompts[type] }]
    })
  });
  const d = await res.json();
  return d.content?.[0]?.text?.trim() || null;
}

// ── Send email via Hostinger SMTP ─────────────────────────────────────────
async function sendEmail(toEmail, toName, emailBody) {
  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await mailer.sendMail({
    from: `"Faren Young | NUI" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Re: Your inquiry to New Urban Influence`,
    text: emailBody,
    html: `<div style="font-family:sans-serif;max-width:600px;line-height:1.6;">
      ${emailBody.replace(/\n/g, '<br>')}
      <br><br>
      <img src="https://newurbaninfluence.com/assets/images/nui-logo.png" alt="NUI" style="height:40px;">
      <br>
      <a href="https://newurbaninfluence.com/book" style="background:#D4A843;color:#000;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:10px;">
        Book a Free Strategy Call
      </a>
    </div>`
  });
}

// ── Send SMS via OpenPhone ─────────────────────────────────────────────────
async function sendSms(toPhone, message) {
  await fetch('https://api.openphone.com/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': OP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message, from: OP_FROM, to: [toPhone] })
  });
}

// ── Log automation result back to Supabase ────────────────────────────────
async function markReplied(submissionId, results) {
  await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      auto_replied: true,
      auto_replied_at: new Date().toISOString(),
      reply_results: results
    })
  }).catch(e => console.warn('markReplied failed:', e.message));
}

// ── Fire and forget — runs after response is sent to the form ─────────────
async function triggerAutomation(submission) {
  if (!ANTHROPIC_KEY) return;

  const context = [
    `Name: ${submission.contact_name || 'Unknown'}`,
    `Email: ${submission.email || 'none'}`,
    `Phone: ${submission.phone || 'none'}`,
    `Service interest: ${submission.service_name || 'general inquiry'}`,
    `Business: ${submission.business_name || 'not provided'}`,
    `Industry: ${submission.industry || 'not provided'}`
  ].join('. ');

  const results = { email: false, sms: false };

  // Email reply
  if (submission.email) {
    try {
      const emailBody = await generateReply('email', context);
      if (emailBody) {
        await sendEmail(submission.email, submission.contact_name, emailBody);
        results.email = true;
        console.log(`[AutoReply] Email sent to ${submission.email}`);
      }
    } catch (e) {
      console.warn('[AutoReply] Email failed:', e.message);
    }
  }

  // SMS reply — only if phone provided and OpenPhone configured
  if (submission.phone && OP_KEY && OP_FROM) {
    try {
      const smsBody = await generateReply('sms', context);
      if (smsBody) {
        await sendSms(submission.phone, smsBody);
        results.sms = true;
        console.log(`[AutoReply] SMS sent to ${submission.phone}`);
      }
    } catch (e) {
      console.warn('[AutoReply] SMS failed:', e.message);
    }
  }

  await markReplied(submission.id, results);
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // 1. Save submission to Supabase
    const submissionResp = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify({
        service_id:    data.serviceId    || null,
        service_name:  data.serviceName  || '',
        price:         data.price        || null,
        contact_name:  data.contactName  || data.clientName || '',
        email:         data.email        || '',
        phone:         data.phone        || data.clientPhone || '',
        business_name: data.businessName || '',
        industry:      data.industry     || '',
        website:       data.website      || '',
        status:        'new',
        auto_replied:  false,
        metadata:      data,
        created_at:    new Date().toISOString()
      })
    });

    if (!submissionResp.ok) {
      const errBody = await submissionResp.text();
      throw new Error(`Submission save failed: ${submissionResp.status} - ${errBody}`);
    }

    const [submission] = await submissionResp.json();

    // 2. Also create a lead record
    fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        name:             data.contactName || data.clientName || data.businessName || 'Unknown',
        email:            data.email       || '',
        phone:            data.phone       || data.clientPhone || '',
        business_name:    data.businessName || '',
        source:           'website_intake',
        service_interest: data.serviceName || '',
        status:           'new',
        submission_id:    submission.id,
        created_at:       new Date().toISOString()
      })
    }).catch(e => console.warn('Lead creation failed (non-fatal):', e.message));

    // 3. Fire automation — respond with email + SMS immediately
    // Non-blocking: response goes back to the user right away
    triggerAutomation(submission).catch(e => console.warn('[AutoReply] Automation error:', e.message));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, id: submission.id, submission })
    };

  } catch (err) {
    console.error('save-submission error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Submission save failed' })
    };
  }
};
