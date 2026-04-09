// monty-sms.js — Legacy webhook alias
// The "monty" webhook in OpenPhone (Feb 27) points here.
// Guards: drop outbound/delivered events to prevent reply loops.
const { handler } = require('./sms-monty');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const payload = JSON.parse(event.body || '{}');
    const type = payload.type;
    const direction = payload.data?.object?.direction;
    if (
      type === 'message.delivered' ||
      direction === 'outgoing' ||
      direction === 'outbound'
    ) {
      console.log('[monty-sms] Dropped outbound/delivered — loop prevention:', type, direction);
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'outbound_ignored' }) };
    }
    return handler(event);
  } catch(e) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, error: e.message }) };
  }
};
