// email-track.js — Netlify Function
// Tracking pixel for email opens. Embedded as <img> in outbound emails.
// GET /email-track?id={messageId}&cid={contactId}
// Returns 1x1 transparent GIF + logs open to Supabase activity_log

exports.handler = async (event) => {
  // 1x1 transparent GIF
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  const { id: messageId, cid: contactId } = event.queryStringParameters || {};

  // Log the open asynchronously — don't block pixel delivery
  if (contactId) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      // Log email open to activity_log
      fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          contact_id: contactId,
          event_type: 'email_opened',
          direction: 'outbound',
          metadata: {
            messageId: messageId || null,
            openedAt: new Date().toISOString(),
            userAgent: event.headers['user-agent'] || null,
            ip: event.headers['x-forwarded-for'] || null
          }
        })
      }).catch(err => console.warn('Email open track failed:', err.message));

      // Also update communications record if messageId provided
      if (messageId) {
        fetch(
          `${SUPABASE_URL}/rest/v1/communications?metadata->>messageId=eq.${messageId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              read: true,
              metadata: { messageId, openedAt: new Date().toISOString() }
            })
          }
        ).catch(err => console.warn('Comms update failed:', err.message));
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: pixel.toString('base64'),
    isBase64Encoded: true
  };
};
