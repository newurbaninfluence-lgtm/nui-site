// monty-followup.js — Scheduled Smart Follow-up + Dormant Lead Reactivation
// Runs every hour via netlify.toml cron
// Logic: Check contacts who haven't replied, send staged follow-ups at 24h/3d/7d
//        Reactivate dormant leads (30/60/90 days no activity) with fresh angles
// Env vars: ANTHROPIC_API_KEY, OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER, SUPABASE_URL, SUPABASE_SERVICE_KEY

const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
const FROM_NUMBER       = process.env.OPENPHONE_PHONE_NUMBER;
const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CALENDLY_URL      = process.env.CALENDLY_URL || 'https://calendly.com/newurbaninfluence';

const sbH = () => ({ 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' });

// Follow-up message templates per stage — Claude personalizes these
const FOLLOWUP_ANGLES = [
  // Stage 1 — 24h — soft check-in
  `You're writing a short, warm SMS follow-up (1-2 sentences). The person reached out to NUI about branding/design but hasn't responded. Don't be pushy — just check in and keep the door open. Sound human, not automated.`,
  // Stage 2 — 3 days — value add
  `You're writing a short SMS follow-up (1-2 sentences). This is your second attempt. Lead with a quick value statement or recent win — something that makes NUI feel credible and relevant. Then invite a reply. Sound like a person.`,
  // Stage 3 — 7 days — final nudge
  `You're writing a final short SMS follow-up (1-2 sentences). This is the last touch for now. Be honest — something like "I'll leave you alone after this, but wanted to give you one last shot before our schedule fills up." Include the Calendly link: ${CALENDLY_URL}`
];

const REACTIVATION_ANGLES = [
  // 30 days dormant
  `You're writing a re-engagement SMS to someone who inquired about NUI branding services 30 days ago but went cold. Write 1-2 sentences that reference something current or relevant (e.g., "we just wrapped a project for a Detroit business owner"). Make it feel timely, not like a bulk blast.`,
  // 60 days dormant  
  `You're writing a re-engagement SMS to a cold lead from 2 months ago. Write 1-2 sentences with a fresh angle — maybe a new service, a seasonal hook, or a quick win story. Keep it conversational. Include the Calendly link: ${CALENDLY_URL}`,
  // 90 days dormant
  `You're writing a final re-engagement SMS to a cold lead from 3 months ago. Be direct and low-pressure: "Hey, I know it's been a while — if timing was the issue before, we'd love to reconnect whenever you're ready. No pressure." Include: ${CALENDLY_URL}`
];

async function generateFollowup(angle, contact) {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'there';
  const context = `Contact name: ${name}. Phone: ${contact.phone}. Known need: ${contact.bant_need || contact.service_interest || 'branding/design'}. Last score: ${contact.lead_score || 'unknown'}/10. Sentiment history: ${contact.sentiment || 'unknown'}.`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: 'You are Monty, AI rep for New Urban Influence, a Detroit branding agency. Write SMS messages only — short, direct, human. No emojis unless natural. Sign off as "— NUI Team" when appropriate.',
        messages: [{ role: 'user', content: `${angle}\n\nContact context: ${context}\n\nWrite the SMS message only. No labels, no explanation.` }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (e) {
    console.warn('[Followup] Generate failed:', e.message);
    return null;
  }
}

async function sendSms(to, message) {
  if (!OPENPHONE_API_KEY || !FROM_NUMBER) return false;
  try {
    const res = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: { 'Authorization': OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message, to: [to], from: FROM_NUMBER })
    });
    return res.ok;
  } catch (e) { return false; }
}

async function logSms(contactId, phone, message, eventType) {
  const now = new Date().toISOString();
  await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/communications`, {
      method: 'POST', headers: sbH(),
      body: JSON.stringify({ channel: 'sms', direction: 'outbound', message, client_id: contactId, metadata: { to: phone, handler: 'monty-followup', event_type: eventType }, created_at: now })
    }).catch(() => {}),
    contactId ? fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: 'POST', headers: sbH(),
      body: JSON.stringify({ contact_id: contactId, type: 'sms', event_type: eventType, direction: 'outbound', content: message, metadata: { ai_generated: true }, read: false, created_at: now })
    }).catch(() => {}) : Promise.resolve()
  ]);
}

async function updateContact(contactId, updates) {
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
    method: 'PATCH', headers: { ...sbH(), 'Prefer': 'return=minimal' },
    body: JSON.stringify({ ...updates, last_activity_at: new Date().toISOString() })
  }).catch(() => {});
}

exports.handler = async function(event) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_API_KEY) {
    return { statusCode: 200, body: JSON.stringify({ skipped: 'missing env vars' }) };
  }

  const now = new Date();
  const results = { followups_sent: 0, reactivations_sent: 0, skipped: 0, errors: 0 };

  // ── Part 1: Follow-up Sequences ───────────────────────────────────────────
  // Find contacts who Monty texted but haven't replied (followup_stage 0, 1, or 2)
  // and last_replied_at is older than threshold for their stage
  const thresholds = [
    { stage: 0, hoursAgo: 24,  label: 'followup_24h' },
    { stage: 1, hoursAgo: 72,  label: 'followup_3d'  },
    { stage: 2, hoursAgo: 168, label: 'followup_7d'  },
  ];

  for (const t of thresholds) {
    const cutoff = new Date(now - t.hoursAgo * 3600000).toISOString();
    // Get contacts at this stage where last_replied_at is older than cutoff (or null)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts?followup_stage=eq.${t.stage}&source=in.(quo_text,quo_call,website_form)&status=in.(new_lead,contacted)&last_replied_at=lt.${cutoff}&select=*&limit=20`,
      { headers: sbH() }
    ).catch(() => null);

    if (!res?.ok) continue;
    const contacts = await res.json();

    for (const c of (contacts || [])) {
      if (!c.phone) { results.skipped++; continue; }

      const angle = FOLLOWUP_ANGLES[t.stage];
      const message = await generateFollowup(angle, c);
      if (!message) { results.errors++; continue; }

      const sent = await sendSms(c.phone, message);
      if (sent) {
        await logSms(c.id, c.phone, message, t.label);
        await updateContact(c.id, {
          followup_stage: t.stage + 1,
          last_followup_at: now.toISOString(),
          // After stage 3, mark as lost if still no reply
          ...(t.stage === 2 ? { status: 'lost' } : {})
        });
        results.followups_sent++;
        console.log(`[Followup] Stage ${t.stage + 1} sent to ${c.phone}`);
      } else {
        results.errors++;
      }
      // Rate limit — don't blast
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // ── Part 2: Dormant Lead Reactivation ─────────────────────────────────────
  // Leads who were qualified/interested but went silent for 30/60/90 days
  const dormantWindows = [
    { daysAgo: 30, maxDays: 59, angle: REACTIVATION_ANGLES[0], label: 'reactivation_30d' },
    { daysAgo: 60, maxDays: 89, angle: REACTIVATION_ANGLES[1], label: 'reactivation_60d' },
    { daysAgo: 90, maxDays: 179, angle: REACTIVATION_ANGLES[2], label: 'reactivation_90d' },
  ];

  for (const w of dormantWindows) {
    const cutoffOld = new Date(now - w.daysAgo * 86400000).toISOString();
    const cutoffNew = new Date(now - w.maxDays * 86400000).toISOString();

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts?last_activity_at=lt.${cutoffOld}&last_activity_at=gt.${cutoffNew}&status=in.(new_lead,contacted,qualified)&reactivation_sent=is.null&source=in.(quo_text,quo_call,website_form)&select=*&limit=10`,
      { headers: sbH() }
    ).catch(() => null);

    if (!res?.ok) continue;
    const contacts = await res.json();

    for (const c of (contacts || [])) {
      if (!c.phone) { results.skipped++; continue; }

      const message = await generateFollowup(w.angle, c);
      if (!message) { results.errors++; continue; }

      const sent = await sendSms(c.phone, message);
      if (sent) {
        await logSms(c.id, c.phone, message, w.label);
        await updateContact(c.id, { reactivation_sent: now.toISOString(), followup_stage: 0 });
        results.reactivations_sent++;
        console.log(`[Followup] Reactivation ${w.daysAgo}d sent to ${c.phone}`);
      } else {
        results.errors++;
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('[Monty Followup]', JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify({ success: true, ...results }) };
};
