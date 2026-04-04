// agent-responder.js — The Responder Agent v2
// Upgraded: claude-sonnet-4-6, better review response prompts
// Handles: GBP review replies only (form replies handled by save-submission.js)
// Schedule: every 4 hours (netlify.toml)

const nodemailer = require('nodemailer');
const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY;
const CLAUDE  = process.env.ANTHROPIC_API_KEY;
const GMB_TOKEN = process.env.GOOGLE_MY_BUSINESS_TOKEN;
const GMB_LOC   = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID;

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Content-Type': 'application/json' };

const sbFetch = async (path, opts = {}) => {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) } });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(d?.message || `SB ${r.status}`);
  return d;
};

async function generateReviewResponse(type, reviewContext) {
  const prompts = {
    positive: `You are responding to a Google review for New Urban Influence (NUI) — a Detroit branding and AI automation agency founded by Faren Young. Voice: warm, genuine, Detroit-proud. Not corporate.

The reviewer left a POSITIVE review. Write a response that:
— Thanks them genuinely and specifically (reference what they mentioned if possible)
— Reinforces one specific thing NUI does well (brand strategy, AI systems, or design quality)
— Ends with an invitation to refer a friend or come back for the next phase of their business
— Sounds like Faren wrote it personally — not a template

Review: ${reviewContext}
Keep it under 80 words. Return only the response text.`,

    negative: `You are responding to a Google review for New Urban Influence (NUI) — a Detroit branding agency. Voice: professional, empathetic, solution-focused. Detroit owners respect directness.

The reviewer had a CONCERN. Write a response that:
— Acknowledges their experience without being defensive
— Takes accountability where appropriate
— Invites them to resolve it directly: info@newurbaninfluence.com or (248) 487-8747
— Shows NUI cares about every client outcome
— Does NOT argue, make excuses, or get emotional

Review: ${reviewContext}
Keep it under 100 words. Return only the response text.`
  };

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLAUDE, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 200, messages: [{ role: 'user', content: prompts[type] }] })
  });
  const d = await r.json();
  return d.content?.[0]?.text?.trim() || '';
}

async function respondToGBPReviews() {
  if (!GMB_TOKEN || !GMB_LOC) return [{ skipped: true, reason: 'no GBP credentials' }];
  const results = [];
  try {
    const r = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOC}/reviews?pageSize=10`, { headers: { 'Authorization': `Bearer ${GMB_TOKEN}` } });
    const d = await r.json();
    const reviews = (d.reviews || []).filter(rv => !rv.reviewReply);
    for (const rv of reviews.slice(0, 5)) {
      try {
        const isPositive = ['FOUR', 'FIVE'].includes(rv.starRating);
        const context = `Star rating: ${rv.starRating}. Review: "${rv.comment || '(no text)'}"`;
        const replyText = await generateReviewResponse(isPositive ? 'positive' : 'negative', context);
        const replyRes = await fetch(`https://mybusiness.googleapis.com/v4/${rv.name}/reply`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${GMB_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: replyText })
        });
        results.push({ type: 'gbp_review', review_id: rv.name, success: replyRes.ok, rating: rv.starRating });
      } catch (e) { results.push({ type: 'gbp_review', error: e.message }); }
    }
  } catch (e) { results.push({ type: 'gbp_review', error: e.message }); }
  return results;
}

async function logRun(data) {
  try { await sbFetch('agent_logs', { method: 'POST', body: JSON.stringify({ agent_id: 'responder', status: 'success', metadata: data, created_at: new Date().toISOString() }) }); } catch {}
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (GMB_TOKEN && GMB_LOC) {
    try {
      const preCheck = await fetch(`https://mybusiness.googleapis.com/v4/${GMB_LOC}/reviews?pageSize=10`, { headers: { 'Authorization': `Bearer ${GMB_TOKEN}` } });
      const preData = await preCheck.json();
      const unanswered = (preData.reviews || []).filter(rv => !rv.reviewReply);
      if (unanswered.length === 0) {
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, skipped: 'no_unanswered_reviews' }) };
      }
    } catch(e) { console.warn('[Responder] Pre-check failed:', e.message); }
  }
  try {
    const gbpResults = await respondToGBPReviews();
    const result = { success: true, reviews_processed: gbpResults.filter(r => !r.skipped).length, details: { reviews: gbpResults }, ran_at: new Date().toISOString() };
    await logRun(result);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
