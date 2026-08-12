// netlify/functions/agent-watchdog.js
// ─────────────────────────────────────────────────────────────────────────────
// Watches the other agents so silent failures don't run for weeks.
//
// Real case that motivated this: agent-blogger failed 75 consecutive times
// over two weeks. Every run logged the error correctly — nobody was reading.
//
// Two failure modes detected:
//   1. FAILING  — N consecutive error/partial runs (default 3)
//   2. SILENT   — no run at all within the agent's expected window
//
// Alerts by email (and SMS if configured). Idempotent: won't re-alert about the
// same problem within ALERT_COOLDOWN_HOURS.
// ─────────────────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const SMTP_USER = process.env.HOSTINGER_EMAIL || process.env.SMTP_USER;
const SMTP_PASS = process.env.HOSTINGER_PASSWORD || process.env.SMTP_PASS;
const ALERT_TO = process.env.ALERT_EMAIL || 'newurbaninfluence@gmail.com';
const ALERT_FROM = process.env.MAIL_FROM_NOTIFICATIONS || 'notifications@newurbaninfluence.com';

const FAIL_THRESHOLD = Math.max(2, parseInt(process.env.WATCHDOG_FAIL_THRESHOLD || '3', 10) || 3);
const COOLDOWN_HOURS = Math.max(1, parseInt(process.env.ALERT_COOLDOWN_HOURS || '12', 10) || 12);

// Expected max hours between runs, per agent. Anything longer = SILENT.
// Padded ~2x the cron interval so a single missed run isn't a false alarm.
const EXPECTED_WINDOW_HOURS = {
  responder: 10,          // every 4h
  blogger: 360,           // weekly (Wed)
  promoter: 30,           // daily
  email_broadcast: 30,    // hourly window 14-23
  creator: 360,           // weekly (Sun)
  billing_enforcer: 30,   // daily
  site_reminders: 30,     // daily
};

function sbHeaders() {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
}

async function sbGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`Supabase GET ${path} → ${res.status}`);
  return res.json();
}

async function logRun(status, metadata) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
      method: 'POST', headers: sbHeaders(),
      body: JSON.stringify({ agent_id: 'watchdog', status, metadata }),
    });
  } catch (e) { console.warn('[watchdog] log failed:', e.message); }
}

// Did we already alert about this agent recently?
async function recentlyAlerted(agentId) {
  const since = new Date(Date.now() - COOLDOWN_HOURS * 3600000).toISOString();
  try {
    const rows = await sbGet(
      `agent_logs?agent_id=eq.watchdog&created_at=gt.${encodeURIComponent(since)}&order=created_at.desc&limit=25`
    );
    return (rows || []).some(r => (r.metadata?.alerted_agents || []).includes(agentId));
  } catch { return false; }
}

async function sendAlert(problems) {
  if (!SMTP_USER || !SMTP_PASS) return { sent: false, reason: 'no SMTP credentials' };

  const rows = problems.map(p => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #222;color:#fff;font-weight:600;">${p.agent}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #222;color:${p.kind === 'FAILING' ? '#e63946' : '#f59e0b'};font-weight:600;">${p.kind}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #222;color:#ccc;font-size:13px;">${p.detail}</td>
    </tr>`).join('');

  const html = `<div style="font-family:-apple-system,sans-serif;background:#0a0a0a;padding:28px;border-radius:12px;max-width:640px;">
<h2 style="color:#fff;margin:0 0 6px;">Agent Watchdog Alert</h2>
<p style="color:#888;margin:0 0 20px;font-size:14px;">${problems.length} agent${problems.length > 1 ? 's need' : ' needs'} attention.</p>
<table style="width:100%;border-collapse:collapse;background:#141414;border-radius:8px;overflow:hidden;">
<tr><th style="text-align:left;padding:10px 12px;color:#888;font-size:12px;text-transform:uppercase;">Agent</th>
<th style="text-align:left;padding:10px 12px;color:#888;font-size:12px;text-transform:uppercase;">Issue</th>
<th style="text-align:left;padding:10px 12px;color:#888;font-size:12px;text-transform:uppercase;">Detail</th></tr>
${rows}
</table>
<p style="color:#666;font-size:12px;margin:20px 0 0;">You won't be alerted about the same agent again for ${COOLDOWN_HOURS} hours.</p>
</div>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: 465, secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"NUI Watchdog" <${ALERT_FROM}>`,
    replyTo: SMTP_USER,
    to: ALERT_TO,
    subject: `⚠️ ${problems.length} agent${problems.length > 1 ? 's' : ''} need attention — ${problems.map(p => p.agent).join(', ')}`,
    html,
  });
  return { sent: true, to: ALERT_TO };
}

exports.handler = async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Supabase config' }) };
  }

  const problems = [];

  try {
    // Pull recent history for every agent except the watchdog itself.
    const logs = await sbGet('agent_logs?select=agent_id,status,created_at,metadata&order=created_at.desc&limit=500');
    const byAgent = {};
    for (const row of logs || []) {
      if (row.agent_id === 'watchdog') continue;
      (byAgent[row.agent_id] = byAgent[row.agent_id] || []).push(row);
    }

    for (const [agent, runs] of Object.entries(byAgent)) {
      // 1) CONSECUTIVE FAILURES — walk newest-first until a success appears.
      let consecutive = 0;
      for (const r of runs) {
        if (r.status === 'error' || r.status === 'partial') consecutive++;
        else break;
      }
      if (consecutive >= FAIL_THRESHOLD) {
        const lastErr = runs[0]?.metadata?.error || 'no error message recorded';
        problems.push({
          agent,
          kind: 'FAILING',
          detail: `${consecutive} consecutive failures. Latest: ${String(lastErr).slice(0, 140)}`,
        });
        continue; // failing already covers it; don't also report silence
      }

      // 2) SILENT — nothing logged inside the expected window.
      const windowH = EXPECTED_WINDOW_HOURS[agent];
      if (windowH && runs[0]) {
        const hoursSince = (Date.now() - new Date(runs[0].created_at).getTime()) / 3600000;
        if (hoursSince > windowH) {
          problems.push({
            agent,
            kind: 'SILENT',
            detail: `No run in ${Math.round(hoursSince)}h (expected within ${windowH}h). Cron may be broken.`,
          });
        }
      }
    }

    // Respect the cooldown so a broken agent doesn't email every single day.
    const toAlert = [];
    for (const p of problems) {
      if (await recentlyAlerted(p.agent)) continue;
      toAlert.push(p);
    }

    let alertResult = { sent: false, reason: 'nothing new to report' };
    if (toAlert.length) alertResult = await sendAlert(toAlert);

    await logRun(problems.length ? 'partial' : 'success', {
      checked: Object.keys(byAgent).length,
      problems_found: problems.length,
      alerted_agents: toAlert.map(p => p.agent),
      problems,
      alert: alertResult,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, checked: Object.keys(byAgent).length, problems, alerted: toAlert.map(p => p.agent), alert: alertResult }),
    };
  } catch (e) {
    console.error('[watchdog] fatal:', e);
    await logRun('error', { error: e.message });
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
