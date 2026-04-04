// monty-followup.js — Scheduled NEPQ Follow-up + Reactivation v2
// Upgraded: claude-sonnet-4-6, NEPQ-aligned prompts from Obsidian vault
// Runs every hour via netlify.toml cron

const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
const FROM_NUMBER       = process.env.OPENPHONE_PHONE_NUMBER;
const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CALENDLY_URL      = process.env.CALENDLY_URL || 'https://newurbaninfluence.com/contact';

const sbH = () => ({ 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' });

const FOLLOWUP_ANGLES = [
  // Stage 1 — 24h — NEPQ situational: check-in without pressure
  `You are Monty, the AI sales rep for New Urban Influence (NUI) — a Detroit branding and AI automation agency. Write a single follow-up SMS (1-2 sentences max) for someone who reached out about NUI services but hasn't responded yet. Use NEPQ Stage 2 language — ask one situational question that shows you care about their situation, not just closing them. Sound human, not automated. No emojis unless natural. No pressure.`,

  // Stage 2 — 3 days — NEPQ problem awareness: surface the cost of inaction
  `You are Monty from New Urban Influence (NUI), Detroit. Write a 1-2 sentence follow-up SMS using NEPQ Stage 3 language — gently surface the cost of the problem they haven't solved yet. Reference that other Detroit businesses similar to theirs are actively building their systems right now. Stay curious, not pushy. One specific question to get a reply.`,

  // Stage 3 — 7 days — NEPQ final: honest last touch with CTA
  `You are Monty from New Urban Influence. Write a final 1-2 sentence SMS follow-up. Be direct and honest: this is the last outreach for a while. Use NEPQ close language — position it as removing pressure while keeping the door open. Include the booking link: ${CALENDLY_URL}. Sound like a real person, not a mass text.`
];

const REACTIVATION_ANGLES = [
  // 30 days dormant — fresh hook
  `You are Monty from New Urban Influence, Detroit. Write a 1-2 sentence re-engagement SMS to someone who inquired 30 days ago but went cold. Lead with something timely or relevant — a recent Detroit business win, a new NUI service, or a seasonal angle. Do NOT say "I haven't heard from you." Make it feel like a new conversation, not a chase.`,

  // 60 days dormant — value angle
  `You are Monty from New Urban Influence. Write a re-engagement SMS to a cold lead from 2 months ago. Lead with a specific result a Detroit business recently got from NUI (keep it anonymous). Make them feel like they missed something and can still get in on it. 1-2 sentences. Include: ${CALENDLY_URL}`,

  // 90 days dormant — honest, low-pressure goodbye
  `You are Monty from New Urban Influence. Write a final re-engagement SMS to a lead who went cold 3 months ago. Be completely honest and low-pressure: timing might not have been right, no hard feelings, door is always open. 1-2 sentences. Include: ${CALENDLY_URL}. Do NOT sound desperate.`
];

async function generateFollowup(angle, contact) {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'there';
  const context = `Contact: ${name}. Known need: ${contact.bant_need || contact.service_interest || 'NUI services'}. Industry: ${contact.industry || 'unknown'}. Lead score: ${contact.lead_score || 'unknown'}/10.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: `You are Monty — the AI sales rep for New Urban Influence, a Detroit branding and AI automation agency. Write SMS messages only. Short, direct, human. Detroit energy. Uses NEPQ methodology. Signs off as "— Monty, NUI" when appropriate. Never mass-text style. Never use "Hey there" or "I hope this finds you well."`,
        messages: [{ role: 'user', content: `${angle}\n\nContact context: ${context}\n\nWrite the SMS only. No labels. No explanation. No quotes.` }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (e) { console.warn('[Followup] Generate failed:', e.message); return null; }
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
  } catch { return false; }
}

async function logSms(contactId, phone, message, eventType) {
  const now = new Date().toISOString();
  await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/communications`, { method: 'POST', headers: sbH(), body: JSON.stringify({ channel: 'sms', direction: 'outbound', message, client_id: contactId, metadata: { to: phone, handler: 'monty-followup', event_type: eventType }, created_at: now }) }).catch(() => {}),
    contactId ? fetch(`${SUPABASE_URL}/rest/v1/activity_log`, { method: 'POST', headers: sbH(), body: JSON.stringify({ contact_id: contactId, type: 'sms', event_type: eventType, direction: 'outbound', content: message, metadata: { ai_generated: true, model: 'claude-sonnet-4-6' }, read: false, created_at: now }) }).catch(() => {}) : Promise.resolve()
  ]);
}

async function updateContact(contactId, updates) {
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, { method: 'PATCH', headers: { ...sbH(), 'Prefer': 'return=minimal' }, body: JSON.stringify({ ...updates, last_activity_at: new Date().toISOString() }) }).catch(() => {});
}

async function getDailySmsSent() {
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/communications?channel=eq.sms&direction=eq.outbound&metadata->>handler=eq.monty-followup&created_at=gte.${todayStart.toISOString()}&select=id`, { headers: sbH() });
    return ((await res.json().catch(() => [])) || []).length;
  } catch { return 0; }
}

const DAILY_SMS_CAP = 15;

exports.handler = async function(event) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_API_KEY) return { statusCode: 200, body: JSON.stringify({ skipped: 'missing env vars' }) };

  const now = new Date();
  const results = { followups_sent: 0, reactivations_sent: 0, skipped: 0, errors: 0 };

  let dailySmsSent = await getDailySmsSent();
  if (dailySmsSent >= DAILY_SMS_CAP) return { statusCode: 200, body: JSON.stringify({ success: true, skipped: 'daily_sms_cap_reached', sent_today: dailySmsSent }) };

  const thresholds = [
    { stage: 0, hoursAgo: 24, label: 'followup_24h' },
    { stage: 1, hoursAgo: 72, label: 'followup_3d' },
    { stage: 2, hoursAgo: 168, label: 'followup_7d' }
  ];

  for (const t of thresholds) {
    const cutoff = new Date(now - t.hoursAgo * 3600000).toISOString();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?followup_stage=eq.${t.stage}&source=in.(quo_text,quo_call,website_form)&status=in.(new_lead,contacted)&last_replied_at=lt.${cutoff}&select=*&limit=20`, { headers: sbH() }).catch(() => null);
    if (!res?.ok) continue;
    const contacts = await res.json();
    for (const c of (contacts || [])) {
      if (!c.phone) { results.skipped++; continue; }
      const message = await generateFollowup(FOLLOWUP_ANGLES[t.stage], c);
      if (!message) { results.errors++; continue; }
      const sent = await sendSms(c.phone, message);
      if (sent) {
        await logSms(c.id, c.phone, message, t.label);
        await updateContact(c.id, { followup_stage: t.stage + 1, last_followup_at: now.toISOString(), ...(t.stage === 2 ? { status: 'lost' } : {}) });
        results.followups_sent++;
      } else { results.errors++; }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const dormantWindows = [
    { daysAgo: 30, maxDays: 59, angle: REACTIVATION_ANGLES[0], label: 'reactivation_30d' },
    { daysAgo: 60, maxDays: 89, angle: REACTIVATION_ANGLES[1], label: 'reactivation_60d' },
    { daysAgo: 90, maxDays: 179, angle: REACTIVATION_ANGLES[2], label: 'reactivation_90d' }
  ];

  for (const w of dormantWindows) {
    const cutoffOld = new Date(now - w.daysAgo * 86400000).toISOString();
    const cutoffNew = new Date(now - w.maxDays * 86400000).toISOString();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?last_activity_at=lt.${cutoffOld}&last_activity_at=gt.${cutoffNew}&status=in.(new_lead,contacted,qualified)&reactivation_sent=is.null&source=in.(quo_text,quo_call,website_form)&select=*&limit=10`, { headers: sbH() }).catch(() => null);
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
      } else { results.errors++; }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return { statusCode: 200, body: JSON.stringify({ success: true, ...results }) };
};
