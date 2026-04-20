// sms-sequence.js — Industry-routed NEPQ SMS drip for non-opener email contacts
//
// Trigger: contact received ≥2 emails, never opened (last_email_open_at IS NULL),
//          has phone, business_category maps to an active SMS sequence.
// Cadence: scheduled cron (every 30 min), 9am-6pm ET, 10/day cap, 3-day minimum
//          spacing between touches per contact.
// Compliance: phone suppression check, STOP keyword opt-out, max 3 touches per
//          sequence, clear opt-out language on every message.
// Replies: handled by Monty (existing OpenPhone webhook); this function only
//          pauses the sequence when openphone-webhook.js detects inbound.

const categories = require('../../assets/js/business-categories.js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;

const DAILY_CAP = 10;                // Matches email warmup tier
const MIN_DAYS_BETWEEN_TOUCHES = 3;  // Safety spacing per contact
const BUSINESS_HOUR_START = 9;
const BUSINESS_HOUR_END = 18;

const sbH = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// ── Load active SMS sequences into a cache (sequence_id → ordered steps) ─
let _smsCache = null;
async function loadSmsSequences() {
  if (_smsCache) return _smsCache;
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/sms_sequences?active=eq.true&select=sequence_id,position,delay_days,message&order=sequence_id,position`,
    { headers: sbH }
  );
  const rows = (await r.json()) || [];
  const bySeq = {};
  for (const row of rows) {
    if (!bySeq[row.sequence_id]) bySeq[row.sequence_id] = [];
    bySeq[row.sequence_id].push(row);
  }
  _smsCache = bySeq;
  console.log(`[sms-sequence] Loaded ${Object.keys(bySeq).length} sequences:`, Object.keys(bySeq).join(','));
  return bySeq;
}

// ── Count SMS already sent today (for daily cap enforcement) ──────────────
async function countSentToday() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/communications` +
    `?channel=eq.sms&direction=eq.outbound` +
    `&metadata->>handler=eq.sms_sequence` +
    `&created_at=gte.${todayStart.toISOString()}` +
    `&select=id`,
    { headers: sbH }
  );
  const rows = (await r.json()) || [];
  return rows.length;
}

// ── Respects spacing safeguard: don't SMS twice within N days ─────────────
function respectsSpacing(lastSentAt) {
  if (!lastSentAt) return true;
  const daysSince = (Date.now() - new Date(lastSentAt).getTime()) / 86400000;
  return daysSince >= MIN_DAYS_BETWEEN_TOUCHES;
}

// ── Resolve next step for a contact (industry sequence routing) ───────────
// Returns null if not eligible, sequence complete, or not due yet.
function resolveNextStep(contact, smsCache) {
  const pos = contact.sms_sequence_position || 0;
  const seqId = contact.business_category
    ? categories.sequenceFor(contact.business_category)
    : null;
  if (!seqId || !smsCache[seqId]) return null;
  const schedule = smsCache[seqId];
  const next = schedule.find(s => s.position === pos + 1);
  if (!next) return null;  // sequence complete
  // Position 0 → 1 is the enrollment step, fires immediately (day 0).
  // Positions ≥1 need elapsed days >= next.delay_days since start.
  if (pos > 0) {
    const elapsed = contact.sms_sequence_start_date
      ? Math.floor((Date.now() - new Date(contact.sms_sequence_start_date).getTime()) / 86400000)
      : 0;
    if (elapsed < next.delay_days) return null;
  }
  if (!respectsSpacing(contact.sms_last_sent_at)) return null;
  const isFinal = !schedule.find(s => s.position === next.position + 1);
  return { ...next, sequenceKey: seqId, isFinal };
}

// ── Batch query: contacts eligible for next SMS touch ────────────────────
// ENROLLMENT (sms_sequence_position = 0): received ≥2 emails, NEVER opened,
//   has phone, business_category maps to an active SMS sequence.
// CONTINUATION (sms_sequence_position ≥ 1): already enrolled, not paused,
//   not completed, respects spacing, next step's delay elapsed.
async function getSmsBatch(limit, smsCache) {
  const out = [];
  const seenPhones = new Set();
  const suppressSet = new Set();

  // Load suppression list (phones that replied STOP etc.)
  try {
    const sr = await fetch(`${SUPABASE_URL}/rest/v1/sms_suppression?select=phone`, { headers: sbH });
    const srows = (await sr.json()) || [];
    srows.forEach(r => suppressSet.add(r.phone));
  } catch (_) { /* non-fatal */ }

  const commonSelect =
    'id,first_name,last_name,company,email,phone,business_category,' +
    'sms_sequence_position,sms_sequence_start_date,sms_last_sent_at';

  // Part A: continuations (already enrolled) — go first so ongoing takes priority
  const rOngoing = await fetch(
    `${SUPABASE_URL}/rest/v1/crm_contacts` +
    `?phone=not.is.null&sms_optout=eq.false` +
    `&sms_sequence_position=gte.1` +
    `&sms_sequence_paused_at=is.null&sms_sequence_completed_at=is.null` +
    `&select=${commonSelect}&order=sms_sequence_start_date.asc&limit=${limit * 4}`,
    { headers: sbH }
  );
  const ongoing = (await rOngoing.json()) || [];
  for (const c of ongoing) {
    if (suppressSet.has(c.phone) || seenPhones.has(c.phone)) continue;
    const step = resolveNextStep(c, smsCache);
    if (step) {
      seenPhones.add(c.phone);
      out.push({ ...c, _step: step, _isNew: false });
      if (out.length >= limit) return out;
    }
  }

  // Part B: enrollments — non-openers who received ≥2 emails
  const remaining = limit - out.length;
  if (remaining > 0) {
    const rNew = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts` +
      `?phone=not.is.null&sms_optout=eq.false&email_unsubscribed=eq.false&email_bounced=eq.false` +
      `&sequence_position=gte.2&last_email_open_at=is.null` +
      `&sms_sequence_position=eq.0&status=in.(cold_lead,new_lead,warm_lead)` +
      `&select=${commonSelect}&order=sequence_start_date.asc.nullslast&limit=${remaining * 4}`,
      { headers: sbH }
    );
    const newContacts = (await rNew.json()) || [];
    for (const c of newContacts) {
      if (suppressSet.has(c.phone) || seenPhones.has(c.phone)) continue;
      const step = resolveNextStep({ ...c, sms_sequence_position: 0 }, smsCache);
      if (!step) continue;
      seenPhones.add(c.phone);
      out.push({ ...c, _step: step, _isNew: true });
      if (out.length >= limit) break;
    }
  }

  return out;
}

// ── Fill NEPQ placeholders (supports both {{double}} and {single} braces) ─
function fillMessage(tmpl, contact) {
  const firstName = contact.first_name || 'there';
  const co = contact.company || (contact.business_category === 'authors_speakers' ? 'your author platform' : 'your business');
  return (tmpl || '')
    .replace(/\{\{\s*first_name\s*\}\}|\{\s*firstName\s*\}|\{\s*first_name\s*\}/gi, firstName)
    .replace(/\{\{\s*company\s*\}\}|\{\s*company\s*\}/gi, co)
    .replace(/\{\{\s*last_name\s*\}\}|\{\s*last_name\s*\}/gi, '')
    .trim();
}

// ── Log communication + activity row for a sent SMS ──────────────────────
async function logSent(contact, step, message, openphoneId) {
  const now = new Date().toISOString();
  const meta = {
    handler: 'sms_sequence',
    sequence_key: step.sequenceKey,
    position: step.position,
    openphone_msg_id: openphoneId || null,
    to: contact.phone,
    from_number_id: FROM_NUMBER_ID
  };
  // communications: renders in Contact Hub SMS thread
  await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      channel: 'sms', direction: 'outbound', message,
      client_id: contact.id, metadata: meta, created_at: now
    })
  }).catch(() => {});
  // activity_log: used by analytics and lead scoring
  await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      contact_id: contact.id, type: 'sms',
      event_type: 'sequence_sms_sent', direction: 'outbound',
      content: message, metadata: meta, created_at: now
    })
  }).catch(() => {});
}

// ── Advance the contact's sequence state after a successful send ─────────
async function markContact(contact, step) {
  const now = new Date().toISOString();
  const updates = {
    sms_sequence_position: step.position,
    sms_last_sent_at: now,
    sms_sequence_id: step.sequenceKey
  };
  if (contact._isNew) updates.sms_sequence_start_date = now;
  if (step.isFinal) updates.sms_sequence_completed_at = now;
  await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contact.id}`, {
    method: 'PATCH',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify(updates)
  }).catch(err => console.warn('[sms-sequence] markContact failed:', err.message));
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const isManual = event.httpMethod === 'POST';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }
  if (!OPENPHONE_API_KEY || !FROM_NUMBER_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'OpenPhone not configured' }) };
  }

  // Business hours gate (9am-6pm ET) — skip unless manually invoked
  const estHour = parseInt(new Date().toLocaleString('en-US', {
    timeZone: 'America/Detroit', hour: 'numeric', hour12: false
  }), 10);
  if (!isManual && (estHour < BUSINESS_HOUR_START || estHour >= BUSINESS_HOUR_END)) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'outside_business_hours', hour: estHour }) };
  }

  // Daily cap check — respect 10/day across all sequences
  const sentToday = await countSentToday();
  const remaining = Math.max(0, DAILY_CAP - sentToday);
  if (remaining === 0) {
    console.log(`[sms-sequence] Daily cap reached (${sentToday}/${DAILY_CAP})`);
    return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'daily_cap_reached', sent_today: sentToday }) };
  }

  // Cron fires every 30 min → send at most 1 per run for natural pacing
  // (10/day ÷ ~18 slots in 9am-6pm window ≈ 0.55, so 1/run is conservative)
  const runLimit = isManual ? remaining : 1;
  const cap = Math.min(runLimit, remaining);

  const smsCache = await loadSmsSequences();
  if (Object.keys(smsCache).length === 0) {
    return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'no_active_sequences' }) };
  }

  const batch = await getSmsBatch(cap, smsCache);
  if (batch.length === 0) {
    console.log(`[sms-sequence] No eligible contacts (cap=${cap}, sent_today=${sentToday})`);
    return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'no_eligible_contacts', sent_today: sentToday }) };
  }

  let sent = 0, failed = 0;
  const results = [];
  const tally = {};

  for (const contact of batch) {
    const step = contact._step;
    const message = fillMessage(step.message, contact);
    const stepLabel = `${step.sequenceKey}#${step.position}`;

    try {
      const resp = await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Authorization': OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, to: [contact.phone], from: FROM_NUMBER_ID })
      });
      const body = await resp.json().catch(() => ({}));
      if (resp.ok) {
        await logSent(contact, step, message, body?.data?.id);
        await markContact(contact, step);
        sent++;
        tally[stepLabel] = (tally[stepLabel] || 0) + 1;
        results.push({ phone: contact.phone, status: 'sent', step: stepLabel, isNew: contact._isNew });
        console.log(`[sms-sequence] ✓ ${contact.phone} — ${stepLabel}${contact._isNew ? ' NEW' : ''}`);
      } else {
        failed++;
        const err = body?.message || body?.error || `HTTP ${resp.status}`;
        results.push({ phone: contact.phone, status: 'failed', error: err });
        console.warn(`[sms-sequence] ✗ ${contact.phone}: ${err}`);
      }
    } catch (err) {
      failed++;
      results.push({ phone: contact.phone, status: 'failed', error: err.message });
      console.warn(`[sms-sequence] ✗ ${contact.phone}:`, err.message);
    }

    // 5s spacing between sends within a single invocation
    if (batch.length > 1) await new Promise(r => setTimeout(r, 5000));
  }

  // Log run for visibility
  await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
    method: 'POST',
    headers: { ...sbH, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      agent_id: 'sms_sequence', status: 'success',
      metadata: { sent, failed, cap, sent_today: sentToday + sent, tally, total_eligible: batch.length },
      created_at: new Date().toISOString()
    })
  }).catch(() => {});

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, sent, failed, cap, sent_today: sentToday + sent, tally })
  };
};
