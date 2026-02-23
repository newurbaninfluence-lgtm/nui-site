// netlify/functions/sms-drip.js
// Scheduled: runs every 30 min, sends queued SMS via OpenPhone
// Picks 3 messages per run = ~18/day across 9am-6pm (6 runs × 3)

exports.handler = async (event) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
  const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;

  if (!SUPABASE_URL || !SUPABASE_KEY || !OPENPHONE_API_KEY || !FROM_NUMBER_ID) {
    console.error('sms-drip: Missing env vars');
    return { statusCode: 500, body: 'Missing configuration' };
  }

  const now = new Date();
  const estHour = new Date(now.toLocaleString('en-US', { timeZone: 'America/Detroit' })).getHours();

  // Only send during business hours (9am - 6pm EST)
  if (estHour < 9 || estHour >= 18) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'Outside business hours', hour: estHour }) };
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Get active campaign IDs first
    const campResp = await fetch(
      `${SUPABASE_URL}/rest/v1/sms_campaigns?status=eq.active&select=id,campaign_type,contacts_sent,contacts_optout`,
      { headers }
    );
    const activeCampaigns = await campResp.json();
    if (!activeCampaigns || activeCampaigns.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'No active campaigns' }) };
    }

    // Compliance check: auto-pause campaigns exceeding opt-out threshold
    for (const camp of activeCampaigns) {
      const sent = camp.contacts_sent || 0;
      const optouts = camp.contacts_optout || 0;
      if (sent >= 10) {
        const rate = (optouts / sent) * 100;
        const threshold = camp.campaign_type === 'cold_outreach' ? 3 : 5;
        if (rate > threshold) {
          await fetch(`${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${camp.id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'paused', auto_paused: true, auto_pause_reason: `Opt-out rate ${rate.toFixed(1)}% > ${threshold}%` })
          });
          continue;
        }
      }
    }

    const activeIds = activeCampaigns.filter(c => !c.auto_paused).map(c => c.id);
    if (activeIds.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'All campaigns paused by compliance' }) };
    }

    // Check suppression list
    const suppressResp = await fetch(`${SUPABASE_URL}/rest/v1/sms_suppression?select=phone`, { headers });
    const suppressedPhones = new Set((await suppressResp.json() || []).map(s => s.phone));

    // Fetch up to 3 approved+queued messages from active campaigns
    const queueResp = await fetch(
      `${SUPABASE_URL}/rest/v1/sms_drip_queue?status=eq.queued&review_status=eq.approved&scheduled_at=lte.${now.toISOString()}&campaign_id=in.(${activeIds.join(',')})&order=scheduled_at.asc&limit=3`,
      { headers }
    );
    const queue = await queueResp.json();

    if (!queue || queue.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'No queued messages' }) };
    }

    let sentCount = 0;
    let failCount = 0;

    for (const item of queue) {
      // Skip suppressed numbers
      if (suppressedPhones.has(item.contact_phone)) {
        await fetch(`${SUPABASE_URL}/rest/v1/sms_drip_queue?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: 'skipped', error: 'Phone on suppression list' })
        });
        continue;
      }
      try {
        // Send via OpenPhone
        const smsResp = await fetch('https://api.openphone.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': OPENPHONE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: item.message,
            to: [item.contact_phone],
            from: FROM_NUMBER_ID
          })
        });

        const smsResult = await smsResp.json();

        if (smsResp.ok) {
          // Mark as sent
          await fetch(`${SUPABASE_URL}/rest/v1/sms_drip_queue?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              status: 'sent',
              review_status: 'sent',
              sent_at: now.toISOString(),
              openphone_msg_id: smsResult?.data?.id || null
            })
          });

          // Log to activity_log if contact_id exists
          if (item.contact_id) {
            await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
              method: 'POST',
              headers: { ...headers, 'Prefer': 'return=minimal' },
              body: JSON.stringify({
                contact_id: item.contact_id,
                type: 'sms',
                event_type: 'drip_sms_sent',
                direction: 'outbound',
                content: item.message,
                metadata: { campaign_id: item.campaign_id, openphone_id: smsResult?.data?.id },
                created_at: now.toISOString()
              })
            }).catch(() => {});

            // Log to communications for Contact Hub SMS thread
            await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
              method: 'POST',
              headers: { ...headers, 'Prefer': 'return=minimal' },
              body: JSON.stringify({
                channel: 'sms',
                direction: 'outbound',
                message: item.message,
                client_id: item.contact_id,
                metadata: { to: item.contact_phone, campaign_id: item.campaign_id, openphone_id: smsResult?.data?.id, from_number_id: FROM_NUMBER_ID },
                created_at: now.toISOString()
              })
            }).catch(() => {});
          }

          sentCount++;
        } else {
          // Mark as failed
          await fetch(`${SUPABASE_URL}/rest/v1/sms_drip_queue?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              status: 'failed',
              error: smsResult?.message || smsResult?.error || `HTTP ${smsResp.status}`
            })
          });
          failCount++;
        }

        // 5 second delay between sends for natural spacing
        await new Promise(r => setTimeout(r, 5000));

      } catch (itemErr) {
        console.error(`sms-drip: Failed for ${item.contact_phone}:`, itemErr.message);
        await fetch(`${SUPABASE_URL}/rest/v1/sms_drip_queue?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: 'failed', error: itemErr.message })
        }).catch(() => {});
        failCount++;
      }
    }

    // Update campaign sent/failed counts
    const campaignIds = [...new Set(queue.map(q => q.campaign_id).filter(Boolean))];
    for (const cid of campaignIds) {
      // Get current counts
      const countResp = await fetch(
        `${SUPABASE_URL}/rest/v1/sms_drip_queue?campaign_id=eq.${cid}&select=status`,
        { headers }
      );
      const allItems = await countResp.json();
      const sent = allItems.filter(i => i.status === 'sent').length;
      const failed = allItems.filter(i => i.status === 'failed').length;
      const queued = allItems.filter(i => i.status === 'queued').length;

      await fetch(`${SUPABASE_URL}/rest/v1/sms_campaigns?id=eq.${cid}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          contacts_sent: sent,
          contacts_failed: failed,
          status: queued === 0 ? 'complete' : 'active',
          updated_at: now.toISOString()
        })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ sent: sentCount, failed: failCount, processed: queue.length })
    };

  } catch (err) {
    console.error('sms-drip error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
