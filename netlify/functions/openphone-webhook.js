// openphone-webhook.js — Netlify Function
// Handles incoming SMS from OpenPhone webhook
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    // OpenPhone webhook events: message.received, message.sent, call.completed, etc.
    const eventType = payload.type || payload.event;

    if (eventType === 'message.received' || eventType === 'message_received') {
      const msg = payload.data || payload;
      const from = msg.from || msg.participants?.find(p => p.direction === 'incoming')?.phoneNumber;
      const body = msg.content || msg.body || msg.text || '';
      const receivedAt = msg.createdAt || msg.timestamp || new Date().toISOString();

      // Store in Supabase
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        // Try to match sender to a client by phone number
        let clientId = null;
        try {
          const clientResp = await fetch(
            `${SUPABASE_URL}/rest/v1/clients?phone=eq.${encodeURIComponent(from)}&select=id&limit=1`,
            {
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
              }
            }
          );
          const clients = await clientResp.json();
          if (clients?.length > 0) clientId = clients[0].id;
        } catch (e) { /* non-fatal */ }

        // Insert communication record
        await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            channel: 'sms',
            direction: 'inbound',
            message: body,
            client_id: clientId,
            unread: true,
            metadata: { from, openphone_event: eventType, raw_id: msg.id },
            created_at: receivedAt
          })
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, action: 'message_stored' })
      };
    }

    // For other event types, acknowledge receipt
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, action: 'event_acknowledged', type: eventType })
    };
  } catch (err) {
    console.error('openphone-webhook error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Webhook processing failed' })
    };
  }
};
