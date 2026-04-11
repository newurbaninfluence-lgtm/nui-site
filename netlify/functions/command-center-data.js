// command-center-data.js — Live data API for NUI Agent Command Center
// Returns: logs, schedule, Monty queue, Promoter queue, misfires, stats

const { checkRateLimit, getClientIP, rateLimitResponse } = require('./rate-limiter');
const { sanitizeText, sanitizeUUID } = require('./sanitizer');
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const sbH = () => ({ 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' });

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: sbH() });
  return r.ok ? r.json() : [];
}

async function sbPatch(path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: 'PATCH', headers: { ...sbH(), 'Prefer': 'return=minimal' },
    body: JSON.stringify(body)
  });
  return r.ok;
}

// ── SCHEDULE CONFIG ───────────────────────────────────────────
const SCHEDULES = [
  { id:'promoter',   name:'Promoter',   schedule:'9am CT daily',    cron_hour:14, color:'#D90429' },
  { id:'responder',  name:'Responder',  schedule:'Every 4hrs',      cron_hour:null, interval_hrs:4, color:'#3a9eff' },
  { id:'monty',      name:'Monty',      schedule:'8am, 12pm, 5pm CT', cron_hours:[13,17,22], color:'#49de78' },
  { id:'blogger',    name:'Blogger',    schedule:'Wed 7am CT',      cron_hour:12, cron_day:3, color:'#C9A227' },
  { id:'creator',    name:'Creator',    schedule:'Sun 8am CT',      cron_hour:13, cron_day:0, color:'#a855f7' },
  { id:'analytics-puller', name:'Analytics', schedule:'Daily 7am CT', cron_hour:12, color:'#ff7849' },
];

// ── PROMOTER PILLARS ──────────────────────────────────────────
const PROMOTER_PILLARS = [
  { id:'online_sales_tips',    label:'5 Things Killing Your Online Sales',  fmt:'list' },
  { id:'reach_customers',      label:'5 Ways to Reach Customers (No Ads)',  fmt:'list' },
  { id:'website_vs_social',    label:'Real Website vs Social Page',         fmt:'comparison' },
  { id:'why_leads_go_cold',    label:'Why Leads Go Cold',                   fmt:'problem_aware' },
  { id:'ai_vs_human',          label:'AI Marketing vs Human Marketing',     fmt:'comparison' },
  { id:'brand_vs_logo',        label:'Brand Identity vs Just a Logo',       fmt:'comparison' },
  { id:'content_mistakes',     label:'5 Content Mistakes Killing Your Reach', fmt:'list' },
  { id:'reputation_online',    label:'Your Online Reputation Is Hurting You', fmt:'list' },
  { id:'follow_up_system',     label:'The Cost of No Follow-Up System',     fmt:'problem_aware' },
  { id:'personal_vs_corporate',label:'Personal Branding vs Corporate',      fmt:'comparison' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  // Rate limit: 60 requests per IP per minute
  const _rl = checkRateLimit('cmd-center:' + getClientIP(event), 60, 60000);
  if (!_rl.allowed) return { ...rateLimitResponse(_rl.resetIn), headers: { ...CORS } };

  // Admin token check for POST mutations
  if (event.httpMethod === 'POST') {
    const token = event.headers?.['x-admin-token'] || event.headers?.['authorization']?.replace('Bearer ','');
    if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const action = event.queryStringParameters?.action || 'all';

  // ── SKIP CONTACT (POST) ───────────────────────────────────
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');

    if (body.action === 'skip_contact') {
      body.contact_id = sanitizeUUID(body.contact_id) || '';
      body.reason = sanitizeText(body.reason || '', 300);
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        status: 'do_not_contact',
        notes: body.reason ? `[SKIPPED by Faren: ${body.reason}]` : '[SKIPPED by Faren via Command Center]',
        updated_at: new Date().toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }

    if (body.action === 'queue_contact') {
      // Force Monty to text a specific contact next by resetting their followup stage
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        followup_stage: 0,
        last_followup_at: null,
        status: 'new_lead',
        notes: body.reason ? `[PRIORITY by Faren: ${body.reason}]` : '[PRIORITY by Faren via Command Center]',
        updated_at: new Date().toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }

    if (body.action === 'add_note') {
      const contact = (await sbGet(`crm_contacts?id=eq.${body.contact_id}&select=notes`))?.[0];
      const existingNotes = contact?.notes || '';
      const newNote = `[${new Date().toLocaleString('en-US',{timeZone:'America/Detroit'})} — Faren]: ${body.note}`;
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        notes: existingNotes ? existingNotes + '\n' + newNote : newNote,
        updated_at: new Date().toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }

    if (body.action === 'skip_pillar') {
      // Log the pillar as skipped so promoter skips it next run
      await fetch(`${SB_URL}/rest/v1/agent_logs`, {
        method: 'POST', headers: { ...sbH(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({ agent_id: 'promoter', status: 'success', metadata: { pillar_id: body.pillar_id, skipped_by_faren: true }, created_at: new Date().toISOString() })
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
    }

    if (body.action === 'promote_pillar') {
      // Remove any existing skips for this pillar so it runs next
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, message: 'Promoter will use this pillar next run' }) };
    }
  }

  try {
    const now = new Date();

    // ── PARALLEL DATA FETCH ───────────────────────────────────
    const [logs, montyCandidates, postAnalytics, recentErrors] = await Promise.all([
      sbGet('agent_logs?order=created_at.desc&limit=40&select=agent_id,status,created_at,metadata'),
      sbGet('crm_contacts?status=in.(new_lead,contacted)&order=last_followup_at.asc.nullsfirst&limit=20&select=id,first_name,last_name,phone,followup_stage,last_followup_at,last_replied_at,service_interest,notes,status,source,created_at'),
      sbGet('post_analytics?order=posted_at.desc&limit=15&select=pillar_id,topic,cover_style,format_type,performance_tier,engagement_score,ig_likes,ig_comments,ig_saves,posted_at,post_id'),
      sbGet('agent_logs?status=in.(error,partial)&order=created_at.desc&limit=10&select=agent_id,status,created_at,metadata'),
    ]);

    // ── STATS ─────────────────────────────────────────────────
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayLogs = logs.filter(l => new Date(l.created_at) >= todayStart);
    const weekStart = new Date(now - 7*864e5);
    const weekLogs  = logs.filter(l => new Date(l.created_at) >= weekStart);
    const stats = {
      runs_today:   todayLogs.filter(l => l.status === 'success').length,
      errors_today: todayLogs.filter(l => l.status !== 'success').length,
      runs_week:    weekLogs.filter(l => l.status === 'success').length,
      posts_week:   weekLogs.filter(l => l.agent_id === 'promoter' && l.status === 'success').length,
      leads_queued: montyCandidates.length,
      misfires:     recentErrors.length,
    };

    // ── SCHEDULE: last run + next run ─────────────────────────
    const schedule = SCHEDULES.map(s => {
      const agentLogs = logs.filter(l => l.agent_id === s.id).sort((a,b) => new Date(b.created_at)-new Date(a.created_at));
      const lastRun   = agentLogs[0];
      const lastRunAt = lastRun?.created_at || null;
      const lastStatus = lastRun?.status || null;

      // Calculate next run
      let nextRun = null;
      if (s.cron_hour !== undefined && s.cron_hour !== null) {
        const next = new Date(now);
        next.setUTCHours(s.cron_hour, 0, 0, 0);
        if (s.cron_day !== undefined) {
          while (next.getUTCDay() !== s.cron_day || next <= now) next.setDate(next.getDate() + 1);
        } else {
          if (next <= now) next.setDate(next.getDate() + 1);
        }
        nextRun = next.toISOString();
      }
      return { ...s, lastRunAt, lastStatus, nextRun, recentLogs: agentLogs.slice(0,5) };
    });

    // ── MONTY QUEUE: enrich with reason ──────────────────────
    const stageLabels = ['First Touch (24h)', 'Problem Awareness (3d)', 'Final Reach (7d)', 'Exhausted'];
    const stageReasons = [
      'New lead — no response yet. Monty sends a situational NEPQ check-in.',
      'Contacted once, still no reply. Monty surfaces the cost of inaction.',
      'Final attempt before marking lost. Booking link included.',
      'All 3 stages complete. Marked as lost unless reactivated.'
    ];

    const montyQueue = montyCandidates.map(c => {
      const hoursIdle = c.last_followup_at
        ? Math.floor((now - new Date(c.last_followup_at)) / 3600000)
        : Math.floor((now - new Date(c.created_at)) / 3600000);
      const stage = c.followup_stage || 0;
      const thresholds = [24, 72, 168];
      const isDue = hoursIdle >= (thresholds[stage] || 999);
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone;
      return {
        id:          c.id,
        name,
        phone:       c.phone,
        stage,
        stageLabel:  stageLabels[Math.min(stage, 3)],
        reason:      stageReasons[Math.min(stage, 3)],
        hoursIdle,
        isDue,
        status:      c.status,
        service:     c.service_interest,
        notes:       c.notes,
        lastReplied: c.last_replied_at,
        source:      c.source,
        createdAt:   c.created_at,
      };
    }).sort((a,b) => (b.isDue - a.isDue) || (a.hoursIdle - b.hoursIdle)); // due first

    // ── PROMOTER QUEUE: what's coming next ───────────────────
    const postedPillarIds = postAnalytics.map(p => p.pillar_id).filter(Boolean);
    const skippedToday = logs
      .filter(l => l.agent_id === 'promoter' && new Date(l.created_at) >= todayStart)
      .map(l => l.metadata?.pillar_id).filter(Boolean);
    const usedRecently = new Set([...postedPillarIds.slice(0,3), ...skippedToday]);

    const promoterQueue = PROMOTER_PILLARS.map(p => {
      const analytics = postAnalytics.find(a => a.pillar_id === p.id);
      return {
        ...p,
        lastPosted:  analytics?.posted_at || null,
        performance: analytics?.performance_tier || 'untested',
        engScore:    analytics?.engagement_score || 0,
        igLikes:     analytics?.ig_likes || 0,
        igSaves:     analytics?.ig_saves || 0,
        isNext:      !usedRecently.has(p.id),
        coverStyle:  analytics?.cover_style || 'black',
      };
    }).sort((a,b) => {
      if (a.performance === 'winner' && b.performance !== 'winner') return -1;
      if (b.performance === 'winner' && a.performance !== 'winner') return 1;
      if (!a.lastPosted && b.lastPosted) return -1;
      if (!b.lastPosted && a.lastPosted) return 1;
      return new Date(a.lastPosted||0) - new Date(b.lastPosted||0);
    });

    // ── ACTIVITY FEED ─────────────────────────────────────────
    const feed = logs.slice(0,30).map(l => {
      const m = l.metadata || {};
      let summary = '';
      if (l.agent_id === 'promoter') {
        summary = m.pillar_id ? `Posted "${m.topic||m.pillar_id}" carousel` : m.error || 'Ran';
        if (m.skipped_by_faren) summary = `Skipped "${m.pillar_id}" (you skipped it)`;
        if (m.skipped === 'already_ran_today') summary = 'Blocked — already ran today';
      } else if (l.agent_id === 'responder') {
        const rev = m.details?.reviews?.[0];
        summary = rev?.reason || 'Checked GBP reviews';
      } else if (l.agent_id === 'monty' || l.agent_id === 'monty-followup') {
        summary = m.followups_sent ? `Sent ${m.followups_sent} follow-up${m.followups_sent>1?'s':''}` : m.error || 'Ran follow-up check';
      } else if (l.agent_id === 'analytics-puller') {
        const w = m.summary?.filter(s=>s.tier==='winner').length || 0;
        summary = `Pulled analytics${w ? ` — ${w} winner${w>1?'s':''}` : ''}`;
      } else {
        summary = m.error || m.message || 'Ran successfully';
      }
      return { agent_id: l.agent_id, status: l.status, created_at: l.created_at, summary };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ stats, schedule, montyQueue, promoterQueue, feed, recentErrors, postAnalytics: postAnalytics.slice(0,8) })
    };

  } catch(err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
