// netlify/functions/sms-reply-webhook.js
// Receives incoming SMS replies via OpenPhone webhook
// Detects opt-outs, logs replies, updates suppression list

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'remove', "don't text", 'dont text', 'opt out', 'optout', 'leave me alone', 'no more'];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: 'Missing config' };
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const payload = JSON.parse(event.body);

    // OpenPhone webhook format: data.object contains the message
    const msg = payload?.data?.object;
    if (!msg || msg.direction !== 'incoming') {
      return { statusCode: 200, body: 'Not an incoming message' };
    }

    const fromPhone = msg.from;
    const body = msg.body || msg.content || '';
    const now = new Date().toISOString();

    if (!fromPhone || !body) {
      return { statusCode: 200, body: 'Missing phone or body' };
    }

    // Find the most recent sent message to this phone (to link to campaign)
    const queueResp = await fetch(
      `${SUPABASE_URL}/rest/v1/sms_drip_queue?contact_phone=eq.${encodeURIComponent(fromPhone)}&status=eq.sent&order=sent_at.desc&limit=1`,
      { headers }
    );
    const queueItems = await queueResp.json();
    const queueItem = queueItems?.[0];

    const campaignId = queueItem?.campaign_id || null;
    const contactId = queueItem?.contact_id || null;

    // Check for opt-out
    const lowerBody = body.toLowerCase().trim();
    const isOptOut = OPT_OUT_KEYWORDS.some(kw => lowerBody.includes(kw));

    // Detect positive replies (simple heuristic)
    const positiveKeywords = ['yes', 'yeah', 'yep', 'sure', 'hey', 'hi', 'hello', 'what up', 'still here', 'who is this', 'this is'];
    const isPositive = !isOptOut && positiveKeywords.some(kw => lowerBody.includes(kw));

    // Log reply to sms_replies
    await fetch(`${SUPABASE_URL}/rest/v1/sms_replies`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        contact_phone: fromPhone,
        contact_id: contactId,
        campaign_id: campaignId,
        queue_item_id: queueItem?.id || null,
        reply_text: body,
        is_optout: isOptOut,
        is_positive: isPositive,
        follow_up_suggested: isPositive ? 'tier_2' : null,
        created_at: now
      })
    });

    // If opt-out: add to suppression list + update campaign count
    if (isOptOut) {
      // Add to suppression (ignore conflict if already exists)
      await fetch(`${SUPABASE_URL}/rest/v1/sms_suppression`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal', 'on-conflict': 'phone' },
        body: JSON.stringify({
          phone: fromPhone,
          reason: 'opt_out',
          source_campaign_id: campaignId,
          reply_text: body,
          created_at: now
        })
      });

      // Increment campaign opt-out count
      if (campaignId) {
        const campResp = await fetch(
          `${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${campaignId}&select=contacts_optout`,
          { headers }
        );
        const camp = (await campResp.json())?.[0];
        if (camp) {
          await fetch(`${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${campaignId}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ contacts_optout: (camp.contacts_optout || 0) + 1 })
          });
        }

        // Cancel any remaining queued messages for this phone in this campaign
        await fetch(
          `${SUPABASE_URL}/rest/v1/sms_drip_queue?campaign_id=eq.${campaignId}&contact_phone=eq.${encodeURIComponent(fromPhone)}&status=eq.queued`,
          {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'skipped', error: 'Contact opted out' })
          }
        );
      }
    }

    // Update campaign reply count
    if (campaignId) {
      const campResp = await fetch(
        `${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${campaignId}&select=contacts_replied`,
        { headers }
      );
      const camp = (await campResp.json())?.[0];
      if (camp) {
        await fetch(`${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${campaignId}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ contacts_replied: (camp.contacts_replied || 0) + 1 })
        });
      }
    }

    // Log to activity_log
    if (contactId) {
      await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          contact_id: contactId,
          type: 'sms',
          event_type: isOptOut ? 'drip_sms_optout' : 'drip_sms_reply',
          direction: 'inbound',
          content: body,
          metadata: { campaign_id: campaignId, from: fromPhone, is_positive: isPositive },
          created_at: now
        })
      }).catch(() => {});
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: true,
        phone: fromPhone,
        is_optout: isOptOut,
        is_positive: isPositive,
        campaign_id: campaignId
      })
    };

  } catch (err) {
    console.error('sms-reply-webhook error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
