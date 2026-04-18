var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// netlify/functions/rate-limiter.js
var require_rate_limiter = __commonJS({
  "netlify/functions/rate-limiter.js"(exports2, module2) {
    var _store = /* @__PURE__ */ new Map();
    function checkRateLimit2(key, maxRequests = 10, windowMs = 6e4) {
      const now = Date.now();
      const record = _store.get(key) || { count: 0, windowStart: now };
      if (now - record.windowStart > windowMs) {
        record.count = 0;
        record.windowStart = now;
      }
      record.count++;
      _store.set(key, record);
      if (_store.size > 1e3) {
        for (const [k, v] of _store.entries()) {
          if (now - v.windowStart > windowMs * 2) _store.delete(k);
        }
      }
      const remaining = Math.max(0, maxRequests - record.count);
      const resetIn = Math.ceil((record.windowStart + windowMs - now) / 1e3);
      return {
        allowed: record.count <= maxRequests,
        remaining,
        resetIn,
        retryAfter: record.count > maxRequests ? resetIn : null
      };
    }
    function getClientIP2(event) {
      return event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || event.headers?.["x-nf-client-connection-ip"] || event.headers?.["client-ip"] || "unknown";
    }
    function rateLimitResponse2(resetIn) {
      return {
        statusCode: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(resetIn),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0"
        },
        body: JSON.stringify({
          error: "Too many requests. Please slow down.",
          retry_after_seconds: resetIn
        })
      };
    }
    module2.exports = { checkRateLimit: checkRateLimit2, getClientIP: getClientIP2, rateLimitResponse: rateLimitResponse2 };
  }
});

// netlify/functions/sanitizer.js
var require_sanitizer = __commonJS({
  "netlify/functions/sanitizer.js"(exports2, module2) {
    function stripHtml(str) {
      if (typeof str !== "string") return "";
      return str.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").replace(/[<>]/g, "").trim();
    }
    function sanitizeText2(str, maxLen = 500) {
      if (!str) return "";
      return stripHtml(String(str)).slice(0, maxLen);
    }
    function sanitizeEmail(email) {
      if (!email) return null;
      const clean = stripHtml(String(email)).toLowerCase().trim().slice(0, 254);
      const valid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(clean);
      return valid ? clean : null;
    }
    function sanitizePhone(phone) {
      if (!phone) return null;
      const clean = String(phone).replace(/[^\d+\-\s()]/g, "").trim().slice(0, 20);
      return clean.length >= 7 ? clean : null;
    }
    function sanitizeUUID2(id) {
      if (!id) return null;
      const clean = String(id).trim();
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean) ? clean : null;
    }
    function sanitizeUrl(url) {
      if (!url) return null;
      const clean = String(url).trim().slice(0, 2e3);
      try {
        const u = new URL(clean);
        if (!["http:", "https:"].includes(u.protocol)) return null;
        return u.toString();
      } catch {
        return null;
      }
    }
    function validateRequired(obj, fields) {
      const errors = fields.filter((f) => !obj[f] || String(obj[f]).trim() === "");
      return { valid: errors.length === 0, errors };
    }
    module2.exports = { sanitizeText: sanitizeText2, sanitizeEmail, sanitizePhone, sanitizeUUID: sanitizeUUID2, sanitizeUrl, validateRequired, stripHtml };
  }
});

// netlify/functions/command-center-data.js
var { checkRateLimit, getClientIP, rateLimitResponse } = require_rate_limiter();
var { sanitizeText, sanitizeUUID } = require_sanitizer();
var ADMIN_SECRET = process.env.ADMIN_SECRET;
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_KEY;
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
var sbH = () => ({ "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json" });
async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: sbH() });
  return r.ok ? r.json() : [];
}
async function sbPatch(path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { ...sbH(), "Prefer": "return=minimal" },
    body: JSON.stringify(body)
  });
  return r.ok;
}
var SCHEDULES = [
  { id: "promoter", name: "Promoter", schedule: "9am CT daily", cron_hour: 14, color: "#D90429" },
  { id: "responder", name: "Responder", schedule: "Every 4hrs", cron_hour: null, interval_hrs: 4, color: "#3a9eff" },
  { id: "monty", name: "Monty", schedule: "8am, 12pm, 5pm CT", cron_hours: [13, 17, 22], color: "#49de78" },
  { id: "blogger", name: "Blogger", schedule: "Wed 7am CT", cron_hour: 12, cron_day: 3, color: "#C9A227" },
  { id: "creator", name: "Creator", schedule: "Sun 8am CT", cron_hour: 13, cron_day: 0, color: "#a855f7" },
  { id: "analytics-puller", name: "Analytics", schedule: "Daily 7am CT", cron_hour: 12, color: "#ff7849" }
];
var PROMOTER_PILLARS = [
  { id: "online_sales_tips", label: "5 Things Killing Your Online Sales", fmt: "list" },
  { id: "reach_customers", label: "5 Ways to Reach Customers (No Ads)", fmt: "list" },
  { id: "website_vs_social", label: "Real Website vs Social Page", fmt: "comparison" },
  { id: "why_leads_go_cold", label: "Why Leads Go Cold", fmt: "problem_aware" },
  { id: "ai_vs_human", label: "AI Marketing vs Human Marketing", fmt: "comparison" },
  { id: "brand_vs_logo", label: "Brand Identity vs Just a Logo", fmt: "comparison" },
  { id: "content_mistakes", label: "5 Content Mistakes Killing Your Reach", fmt: "list" },
  { id: "reputation_online", label: "Your Online Reputation Is Hurting You", fmt: "list" },
  { id: "follow_up_system", label: "The Cost of No Follow-Up System", fmt: "problem_aware" },
  { id: "personal_vs_corporate", label: "Personal Branding vs Corporate", fmt: "comparison" }
];
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  const _rl = checkRateLimit("cmd-center:" + getClientIP(event), 60, 6e4);
  if (!_rl.allowed) return { ...rateLimitResponse(_rl.resetIn), headers: { ...CORS } };
  if (event.httpMethod === "POST") {
    const token = event.headers?.["x-admin-token"] || event.headers?.["authorization"]?.replace("Bearer ", "");
    if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
    }
  }
  const action = event.queryStringParameters?.action || "all";
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    if (body.action === "skip_contact") {
      body.contact_id = sanitizeUUID(body.contact_id) || "";
      body.reason = sanitizeText(body.reason || "", 300);
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        status: "do_not_contact",
        notes: body.reason ? `[SKIPPED by Faren: ${body.reason}]` : "[SKIPPED by Faren via Command Center]",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }
    if (body.action === "queue_contact") {
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        followup_stage: 0,
        last_followup_at: null,
        status: "new_lead",
        notes: body.reason ? `[PRIORITY by Faren: ${body.reason}]` : "[PRIORITY by Faren via Command Center]",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }
    if (body.action === "add_note") {
      const contact = (await sbGet(`crm_contacts?id=eq.${body.contact_id}&select=notes`))?.[0];
      const existingNotes = contact?.notes || "";
      const newNote = `[${(/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Detroit" })} \u2014 Faren]: ${body.note}`;
      const ok = await sbPatch(`crm_contacts?id=eq.${body.contact_id}`, {
        notes: existingNotes ? existingNotes + "\n" + newNote : newNote,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: ok }) };
    }
    if (body.action === "skip_pillar") {
      await fetch(`${SB_URL}/rest/v1/agent_logs`, {
        method: "POST",
        headers: { ...sbH(), "Prefer": "return=minimal" },
        body: JSON.stringify({ agent_id: "promoter", status: "success", metadata: { pillar_id: body.pillar_id, skipped_by_faren: true }, created_at: (/* @__PURE__ */ new Date()).toISOString() })
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
    }
    if (body.action === "promote_pillar") {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, message: "Promoter will use this pillar next run" }) };
    }
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const [logs, montyCandidates, postAnalytics, recentErrors] = await Promise.all([
      sbGet("agent_logs?order=created_at.desc&limit=40&select=agent_id,status,created_at,metadata"),
      sbGet("crm_contacts?status=in.(new_lead,contacted)&order=last_followup_at.asc.nullsfirst&limit=20&select=id,first_name,last_name,phone,followup_stage,last_followup_at,last_replied_at,service_interest,notes,status,source,created_at"),
      sbGet("post_analytics?order=posted_at.desc&limit=15&select=pillar_id,topic,cover_style,format_type,performance_tier,engagement_score,ig_likes,ig_comments,ig_saves,posted_at,post_id"),
      sbGet("agent_logs?status=in.(error,partial)&order=created_at.desc&limit=10&select=agent_id,status,created_at,metadata")
    ]);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter((l) => new Date(l.created_at) >= todayStart);
    const weekStart = new Date(now - 7 * 864e5);
    const weekLogs = logs.filter((l) => new Date(l.created_at) >= weekStart);
    const stats = {
      runs_today: todayLogs.filter((l) => l.status === "success").length,
      errors_today: todayLogs.filter((l) => l.status !== "success").length,
      runs_week: weekLogs.filter((l) => l.status === "success").length,
      posts_week: weekLogs.filter((l) => l.agent_id === "promoter" && l.status === "success").length,
      leads_queued: montyCandidates.length,
      misfires: recentErrors.length
    };
    const schedule = SCHEDULES.map((s) => {
      const agentLogs = logs.filter((l) => l.agent_id === s.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const lastRun = agentLogs[0];
      const lastRunAt = lastRun?.created_at || null;
      const lastStatus = lastRun?.status || null;
      let nextRun = null;
      if (s.cron_hour !== void 0 && s.cron_hour !== null) {
        const next = new Date(now);
        next.setUTCHours(s.cron_hour, 0, 0, 0);
        if (s.cron_day !== void 0) {
          while (next.getUTCDay() !== s.cron_day || next <= now) next.setDate(next.getDate() + 1);
        } else {
          if (next <= now) next.setDate(next.getDate() + 1);
        }
        nextRun = next.toISOString();
      }
      return { ...s, lastRunAt, lastStatus, nextRun, recentLogs: agentLogs.slice(0, 5) };
    });
    const stageLabels = ["First Touch (24h)", "Problem Awareness (3d)", "Final Reach (7d)", "Exhausted"];
    const stageReasons = [
      "New lead \u2014 no response yet. Monty sends a situational NEPQ check-in.",
      "Contacted once, still no reply. Monty surfaces the cost of inaction.",
      "Final attempt before marking lost. Booking link included.",
      "All 3 stages complete. Marked as lost unless reactivated."
    ];
    const montyQueue = montyCandidates.map((c) => {
      const hoursIdle = c.last_followup_at ? Math.floor((now - new Date(c.last_followup_at)) / 36e5) : Math.floor((now - new Date(c.created_at)) / 36e5);
      const stage = c.followup_stage || 0;
      const thresholds = [24, 72, 168];
      const isDue = hoursIdle >= (thresholds[stage] || 999);
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || c.phone;
      return {
        id: c.id,
        name,
        phone: c.phone,
        stage,
        stageLabel: stageLabels[Math.min(stage, 3)],
        reason: stageReasons[Math.min(stage, 3)],
        hoursIdle,
        isDue,
        status: c.status,
        service: c.service_interest,
        notes: c.notes,
        lastReplied: c.last_replied_at,
        source: c.source,
        createdAt: c.created_at
      };
    }).sort((a, b) => b.isDue - a.isDue || a.hoursIdle - b.hoursIdle);
    const postedPillarIds = postAnalytics.map((p) => p.pillar_id).filter(Boolean);
    const skippedToday = logs.filter((l) => l.agent_id === "promoter" && new Date(l.created_at) >= todayStart).map((l) => l.metadata?.pillar_id).filter(Boolean);
    const usedRecently = /* @__PURE__ */ new Set([...postedPillarIds.slice(0, 3), ...skippedToday]);
    const promoterQueue = PROMOTER_PILLARS.map((p) => {
      const analytics = postAnalytics.find((a) => a.pillar_id === p.id);
      return {
        ...p,
        lastPosted: analytics?.posted_at || null,
        performance: analytics?.performance_tier || "untested",
        engScore: analytics?.engagement_score || 0,
        igLikes: analytics?.ig_likes || 0,
        igSaves: analytics?.ig_saves || 0,
        isNext: !usedRecently.has(p.id),
        coverStyle: analytics?.cover_style || "black"
      };
    }).sort((a, b) => {
      if (a.performance === "winner" && b.performance !== "winner") return -1;
      if (b.performance === "winner" && a.performance !== "winner") return 1;
      if (!a.lastPosted && b.lastPosted) return -1;
      if (!b.lastPosted && a.lastPosted) return 1;
      return new Date(a.lastPosted || 0) - new Date(b.lastPosted || 0);
    });
    const feed = logs.slice(0, 30).map((l) => {
      const m = l.metadata || {};
      let summary = "";
      if (l.agent_id === "promoter") {
        summary = m.pillar_id ? `Posted "${m.topic || m.pillar_id}" carousel` : m.error || "Ran";
        if (m.skipped_by_faren) summary = `Skipped "${m.pillar_id}" (you skipped it)`;
        if (m.skipped === "already_ran_today") summary = "Blocked \u2014 already ran today";
      } else if (l.agent_id === "responder") {
        const rev = m.details?.reviews?.[0];
        summary = rev?.reason || "Checked GBP reviews";
      } else if (l.agent_id === "monty" || l.agent_id === "monty-followup") {
        summary = m.followups_sent ? `Sent ${m.followups_sent} follow-up${m.followups_sent > 1 ? "s" : ""}` : m.error || "Ran follow-up check";
      } else if (l.agent_id === "analytics-puller") {
        const w = m.summary?.filter((s) => s.tier === "winner").length || 0;
        summary = `Pulled analytics${w ? ` \u2014 ${w} winner${w > 1 ? "s" : ""}` : ""}`;
      } else {
        summary = m.error || m.message || "Ran successfully";
      }
      return { agent_id: l.agent_id, status: l.status, created_at: l.created_at, summary };
    });
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ stats, schedule, montyQueue, promoterQueue, feed, recentErrors, postAnalytics: postAnalytics.slice(0, 8) })
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=command-center-data.js.map
