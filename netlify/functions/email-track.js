// email-track.js — Tracking pixel for email opens
// Returns a 1x1 transparent GIF and logs the open to Supabase

exports.handler = async (event) => {
  const { id, cid } = event.queryStringParameters || {};
  
  // 1x1 transparent GIF
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  // Log to Supabase (fire and forget)
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY && cid) {
    fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        contact_id: parseInt(cid) || null,
        type: 'email_opened',
        details: JSON.stringify({ trackId: id, openedAt: new Date().toISOString(), ip: event.headers['x-forwarded-for'] || 'unknown' }),
        created_at: new Date().toISOString()
      })
    }).catch(err => console.warn('Track pixel log failed:', err.message));
    
    console.log('📧 Email opened — trackId:', id, 'contactId:', cid);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    },
    body: pixel.toString('base64'),
    isBase64Encoded: true
  };
};
