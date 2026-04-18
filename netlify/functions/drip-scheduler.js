// drip-scheduler.js — Runs every 15 minutes, processes drip_queue
// Enforces: daily caps, weekly ramp, 15-min min gap, send window (recipient timezone)

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

async function getConfig() {
  const { data } = await supabase.from('drip_config').select('key,value');
  const cfg = {};
  (data || []).forEach(r => { cfg[r.key] = r.value; });
  return cfg;
}

function weeksSince(iso) {
  if (!iso) return 1;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1);
}

function currentCapForWeek(ramp, week) {
  let tier = { email: 10, sms: 5 };
  for (const t of (ramp || [])) {
    if (week >= t.week) tier = t;
  }
  return tier;
}

async function countSentToday(channel) {
  const start = new Date(); start.setUTCHours(0,0,0,0);
  const { count } = await supabase.from('drip_queue')
    .select('id', { count: 'exact', head: true })
    .eq('channel', channel).eq('status', 'sent')
    .gte('sent_at', start.toISOString());
  return count || 0;
}

async function lastSentAt() {
  const { data } = await supabase.from('drip_queue')
    .select('sent_at').eq('status', 'sent')
    .order('sent_at', { ascending: false }).limit(1);
  return data?.[0]?.sent_at || null;
}

function inSendWindow(contact, window) {
  const tz = contact.timezone || 'America/Detroit';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, hour: 'numeric', weekday: 'short'
    }).formatToParts(new Date());
    const hour = parseInt(parts.find(p => p.type === 'hour').value);
    const weekdayStr = parts.find(p => p.type === 'weekday').value;
    const map = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    const dow = map[weekdayStr];
    if (!window.days.includes(dow)) return false;
    return hour >= window.start_hour && hour < window.end_hour;
  } catch (e) { return false; }
}

function render(tpl, c) {
  if (!tpl) return '';
  return tpl
    .replace(/\{\{first_name\}\}/gi, c.first_name || 'there')
    .replace(/\{\{last_name\}\}/gi, c.last_name || '')
    .replace(/\{\{company\}\}/gi, c.company || 'your business')
    .replace(/\{\{email\}\}/gi, c.email || '');
}

async function sendEmail(to, subject, html, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Faren Young'}" <${process.env.SMTP_USER}>`,
    to, subject, text, html
  });
  return info.messageId;
}

async function sendSms(to, message) {
  const r = await fetch('https://api.openphone.com/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': process.env.OPENPHONE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.OPENPHONE_PHONE_NUMBER_ID || 'PNZoSoYdKS',
      to: [to], content: message
    })
  });
  if (!r.ok) throw new Error(`OpenPhone ${r.status}: ${(await r.text()).slice(0,200)}`);
  return (await r.json()).data?.id;
}

async function queueNextStep(queueRow, contactId) {
  const { data: cur } = await supabase.from('drip_emails')
    .select('delay_days').eq('industry', queueRow.business_category)
    .eq('position', queueRow.step_number).maybeSingle();
  if (!cur) return;

  const { data: next } = await supabase.from('drip_emails')
    .select('*').eq('industry', queueRow.business_category)
    .eq('position', queueRow.step_number + 1).eq('active', true).maybeSingle();

  if (!next) {
    await supabase.from('crm_contacts').update({ drip_status: 'completed' }).eq('id', contactId);
    return;
  }

  const when = new Date();
  when.setDate(when.getDate() + (next.delay_days - cur.delay_days));

  await supabase.from('drip_queue').insert({
    contact_id: contactId, channel: queueRow.channel, step_number: next.position,
    scheduled_for: when.toISOString(), status: 'queued',
    business_category: queueRow.business_category,
    source_campaign: queueRow.source_campaign
  });
}

exports.handler = async (event) => {
  const results = { processed: 0, sent: 0, skipped: 0, errors: [] };

  try {
    const cfg = await getConfig();
    const week = weeksSince(cfg.ramp_started_at);
    const cap = currentCapForWeek(cfg.ramp_schedule, week);
    results.caps = { week, ...cap };

    const minGap = cfg.min_gap_minutes || 15;
    const window = cfg.send_window || { start_hour: 10, end_hour: 18, days: [1,2,3,4,5,6] };

    // Enforce min gap
    const last = await lastSentAt();
    if (last) {
      const gapMs = Date.now() - new Date(last).getTime();
      if (gapMs < minGap * 60 * 1000) {
        return { statusCode: 200, body: JSON.stringify({ ...results, skipped_reason: `gap ${minGap}m not met` }) };
      }
    }

    const emailCount = await countSentToday('email');
    const smsCount = await countSentToday('sms');
    results.sent_today = { email: emailCount, sms: smsCount };

    const channels = [];
    if (cap.email - emailCount > 0) channels.push('email');
    if (cap.sms - smsCount > 0) channels.push('sms');
    if (channels.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ...results, skipped_reason: 'daily cap reached' }) };
    }

    for (const channel of channels) {
      const { data: rows } = await supabase.from('drip_queue')
        .select('*, crm_contacts!inner(id,email,phone,first_name,last_name,company,timezone,drip_status,email_unsubscribed,email_bounced)')
        .eq('channel', channel).eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for').limit(30);

      for (const row of (rows || [])) {
        results.processed++;
        const c = row.crm_contacts;
        if (!c) { results.skipped++; continue; }

        if (['paused','opted_out','bounced'].includes(c.drip_status)) {
          await supabase.from('drip_queue').update({ status: 'skipped', error_message: `status=${c.drip_status}` }).eq('id', row.id);
          results.skipped++; continue;
        }
        if (channel === 'email' && (!c.email || c.email_unsubscribed || c.email_bounced)) {
          await supabase.from('drip_queue').update({ status: 'skipped', error_message: 'email invalid' }).eq('id', row.id);
          results.skipped++; continue;
        }
        if (channel === 'sms' && !c.phone) {
          await supabase.from('drip_queue').update({ status: 'skipped', error_message: 'no phone' }).eq('id', row.id);
          results.skipped++; continue;
        }
        if (!inSendWindow(c, window)) { results.skipped++; continue; }

        const { data: tpl } = await supabase.from('drip_emails')
          .select('*').eq('industry', row.business_category)
          .eq('position', row.step_number).eq('active', true).maybeSingle();
        if (!tpl) {
          await supabase.from('drip_queue').update({ status: 'failed', error_message: 'no template' }).eq('id', row.id);
          continue;
        }

        const subject = render(tpl.subject, c);
        const bodyText = render(tpl.body_text || '', c);
        const bodyHtml = channel === 'email' ? render(tpl.body_html || tpl.body_text, c) : null;

        try {
          if (channel === 'email') await sendEmail(c.email, subject, bodyHtml, bodyText);
          else await sendSms(c.phone, bodyText);

          await supabase.from('drip_queue').update({
            status: 'sent', sent_at: new Date().toISOString(),
            rendered_subject: subject, rendered_body: bodyText
          }).eq('id', row.id);

          await supabase.from('crm_contacts').update({
            drip_status: 'active',
            last_touch_at: new Date().toISOString(),
            last_touch_summary: `Drip ${channel} #${row.step_number}: ${subject.slice(0,80)}`
          }).eq('id', c.id);

          await queueNextStep(row, c.id);
          results.sent++;
          break; // one per channel per tick
        } catch (e) {
          await supabase.from('drip_queue').update({
            status: 'failed', error_message: e.message,
            attempt_count: (row.attempt_count || 0) + 1
          }).eq('id', row.id);
          results.errors.push(e.message);
        }
      }
    }

    return { statusCode: 200, headers: {'Content-Type':'application/json'}, body: JSON.stringify(results) };
  } catch (err) {
    console.error('[drip-scheduler]', err);
    return { statusCode: 500, headers: {'Content-Type':'application/json'}, body: JSON.stringify({ error: err.message, ...results }) };
  }
};
