const { checkRateLimit, rateLimitResponse } = require('./rate-limiter');
const { sanitizePhone, sanitizeText } = require('./sanitizer');
// monty-sms.js — Legacy webhook alias (OpenPhone "monty" webhook Feb 27)
// Guards: blocks automated/Stripe messages + drops outbound to prevent loops
const { handler } = require('./sms-monty');

const AUTOMATED_PATTERNS = [
  /stripe/i,
  /reply\s+stop\s+to\s+cancel/i,
  /msg&data\s+rates/i,
  /msg\s+frequency\s+varies/i,
  /support\.stripe\.com/i,
  /paypal/i,
  /do\s+not\s+reply/i,
  /no[\s-]?reply/i,
  /verification\s+code/i,
  /your\s+(otp|code)\s+is/i,
  /this\s+is\s+an?\s+automated/i,
];

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const payload = JSON.parse(event.body || '{}');
    const type = payload.type;
    const obj = payload.data?.object || {};
    const direction = obj.direction;
    const body = (obj.body || obj.text || '').trim();

    // Drop outbound/delivered — never let Monty reply to his own messages
    if (type === 'message.delivered' || direction === 'outgoing' || direction === 'outbound') {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'outbound_ignored' }) };
    }

    // Block automated/system messages
    if (AUTOMATED_PATTERNS.some(p => p.test(body))) {
      console.log('[monty-sms] Blocked automated msg:', body.slice(0, 60));
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'automated_blocked' }) };
    }

    return handler(event);
  } catch(e) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, error: e.message }) };
  }
};
