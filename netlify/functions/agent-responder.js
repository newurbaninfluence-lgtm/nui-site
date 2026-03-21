// agent-responder.js — The Responder Agent
// Handles: GBP review replies (auto-responds to new Google reviews)
// Runs every 30 min via cron
// NOTE: Form submission replies are now handled directly in save-submission.js (event-triggered)
//
// Channels handled:
//   1. Web form submissions (from save-submission.js) → auto-email reply via Hostinger SMTP
//   2. GBP reviews (new, unanswered) → AI reply via GBP Manage API
//   3. Contact/intake submissions not yet followed up → SMS + email combo
//   4. (Gmail inbox reading requires OAuth setup — see GMAIL_SETUP.md)
//
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY
//           SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM
//           OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER
//           GOOGLE_MY_BUSINESS_TOKEN, GOOGLE_MY_BUSINESS_LOCATION_ID

const nodemailer = require('nodemailer');

const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE  = process.env.ANTHROPIC_API_KEY;
const OP_KEY  = process.env.OPENPHONE_API_KEY;
const OP_FROM = process.env.OPENPHONE_PHONE_NUMBER;
const GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
const GMB_LOC   = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) }
  });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

// ── Email transporter (Hostinger SMTP) ──
const getMailer = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: 465, secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// ── Claude AI response generator ──
async function generateResponse(type, context) {
  const prompts = {
    form_reply: `You are responding on behalf of New Urban Influence (NUI), a Detroit branding and AI automation agency founded by Faren Young.

A potential client just submitted an inquiry form. Write a warm, professional email reply that:
- Acknowledges their specific interest (see context below)
- Briefly positions NUI as the right choice for them
- Provides a clear next step (book a free call: https://newurbaninfluence.com/book)
- Sounds like Faren wrote it personally — confident, Detroit-grounded, not corporate

Context: ${context}

Write ONLY the email body (no subject line, no "Dear Name"). Keep it under 150 words.`,

    gbp_review_positive: `Write a short, warm Google Business Profile review response for New Urban Influence (NUI), a Detroit branding agency. The reviewer left positive feedback. 
    
Be genuine, specific (mention their experience if possible), and invite them to refer a friend or return.
Review context: ${context}
Keep it under 75 words.`,

    gbp_review_negative: `Write a professional, empathetic Google Business Profile review response for New Urban Influence (NUI). The reviewer had a concern.

Acknowledge their experience, take ownership where appropriate, offer to resolve offline, provide contact: info@newurbaninfluence.com. Do NOT be defensive.
Review context: ${context}
Keep it under 100 words.`,

    sms_followup: `Write a 1-sentence SMS follow-up from New Urban Influence. A contact submitted a form but hasn't heard back yet (within 1 hour). Sound human, warm, and curious about their need.
Context: ${context}
SMS only — under 160 chars. No hashtags. Include "- Faren" at the end.`
  };

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompts[type] }] })
  });
  const d = await r.json();
  return d.content?.[0]?.text?.trim() || '';
}

// ── Channel: Respond to new: Respond to new/unanswered GBP reviews ──
async function respondToGBPReviews() {
  if (!GMB_TOKEN || !GMB_LOC) return [{ skipped: true, reason: 'no GBP credentials' }];
  const results = [];
  try {
    // Fetch reviews from GBP API
    const r = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOC}/reviews?pageSize=10`, {
      headers: { 'Authorization': `Bearer ${GMB_TOKEN}` }
    });
    const d = await r.json();
    const reviews = (d.reviews || []).filter(rv => !rv.reviewReply); // unanswered only

    for (const rv of reviews.slice(0, 5)) {
      try {
        const rating = rv.starRating; // ONE/TWO/THREE/FOUR/FIVE
        const isPositive = ['FOUR', 'FIVE'].includes(rating);
        const context = `Star rating: ${rating}. Review text: "${rv.comment || '(no text)'}"`;
        const type = isPositive ? 'gbp_review_positive' : 'gbp_review_negative';
        const replyText = await generateResponse(type, context);

        // Post reply via GBP API
        const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${rv.name}/reply`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${GMB_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: replyText })
        });
        results.push({ type: 'gbp_review', review_id: rv.name, success: replyRes.ok, rating });
      } catch (e) {
        results.push({ type: 'gbp_review', error: e.message });
      }
    }
  } catch (e) {
    results.push({ type: 'gbp_review', error: e.message });
  }
  return results;
}


// ── Log agent run ──
async function logRun(data) {
  try {
    await sbFetch('agent_logs', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'responder', status: 'success', metadata: data, created_at: new Date().toISOString() })
    });
  } catch {}
}

// ── Main handler ──
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  try {
    const gbpResults = await respondToGBPReviews();

    const result = {
      success: true,
      reviews_processed: gbpResults.filter(r => !r.skipped).length,
      details: { reviews: gbpResults },
      ran_at: new Date().toISOString()
    };

    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
