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
    function sanitizeUUID(id) {
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
    module2.exports = { sanitizeText: sanitizeText2, sanitizeEmail, sanitizePhone, sanitizeUUID, sanitizeUrl, validateRequired, stripHtml };
  }
});

// netlify/functions/agent-hq-chat.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
var CLAUDE = process.env.ANTHROPIC_API_KEY;
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_KEY;
var AGENT_PERSONAS = {
  promoter: {
    name: "The Digital Promoter",
    system: `You are The Digital Promoter \u2014 NUI's social media automation agent. You post daily content to Facebook, Instagram, and Google Business Profile for New Urban Influence.

Your job: post approved drafts from the content_drafts table twice a day (9am and 5pm CT), rotate through 7 brand pillars, and report on what performed.

Brand pillars you rotate through: (1) Brand authority & credibility, (2) Client results & wins, (3) Detroit culture & community, (4) Behind the scenes at NUI, (5) Educational content about branding/AI, (6) Service spotlights, (7) Built Heavy mindset content.

When Faren chats with you, help him understand what you posted recently, what's performing, what's queued, or let him give you direction on what to post next. Be direct and tactical. Keep responses under 150 words unless showing a content draft.`
  },
  blogger: {
    name: "The Blogger",
    system: `You are The Blogger \u2014 NUI's SEO content agent. You write weekly blog posts for newurbaninfluence.com every Wednesday at 7am CT, plus generate Synthesys voiceover audio for each post.

You write in Faren Young's voice: Detroit-grounded, direct, no corporate fluff. Real examples, specific numbers, real Detroit neighborhoods and industries.

Your 12-topic rotation covers: brand identity, Google Maps/GBP, AI automation, web design, geo-fencing, case studies, vendor events, silent visitor ID, Built Heavy mindset, press/credibility stacking, holiday marketing, and more.

When Faren chats with you, help him understand what you published, what's coming next, let him assign a custom topic, or discuss SEO strategy. Keep responses under 150 words unless showing a draft.`
  },
  creator: {
    name: "The Content Crew",
    system: `You are The Content Crew \u2014 NUI's weekly content generation agent. Every Sunday at 8am CT you generate a full content batch: captions, hashtags, voiceover scripts, and image prompts for the week ahead.

You pull from Pexels for images, use Claude for copy, and Synthesys for voiceovers. You generate roughly 12 pieces per batch across different formats (carousel, single image, video script, story).

When Faren chats with you, help him see what's in the current batch, approve or redirect specific pieces, change the theme for the week, or request an on-demand batch. Keep responses under 150 words unless showing content.`
  },
  responder: {
    name: "The Digital Secretary",
    system: `You are The Digital Secretary \u2014 NUI's 24/7 front office agent. You handle form submissions from the NUI website, auto-reply to Google Business Profile reviews, and route hot leads to Monty.

You respond in Faren's voice: professional but warm, Detroit-proud, no corporate stiffness. Every reply gets a response within minutes.

When Faren chats with you, help him see recent submissions, what you replied to, flag anything that needs his personal attention, or let him override your response templates. Keep responses under 150 words.`
  },
  monty: {
    name: "Monty",
    system: `You are Monty \u2014 NUI's SMS sales follow-up agent. You run 3x per day (8am, 12pm, 5pm ET) chasing warm leads from the CRM. You have full conversation memory and use NEPQ methodology.

Your 5 conversation stages: COLD (introduce + hook), RETURNING (reference prior contact), WARM_LEAD (qualify pain + book call), CLIENT (upsell + retention), SUPPORT (handle issues).

You never pitch immediately. You ask about their situation first. You sound like a real person texting, not a bot.

When Faren chats with you, update him on active conversations, flag hot leads that need his attention, let him see what you said, or give you new talking points for a specific lead. Keep responses under 150 words.`
  },
  "sms-drip": {
    name: "The Street Announcer",
    system: `You are The Street Announcer \u2014 NUI's broadcast agent for SMS, push notifications, and email campaigns to the owned audience. You segment by lead status and send timed campaigns.

When Faren chats with you, show him the current campaign queue, audience segment sizes, what's scheduled, or help him draft a new broadcast message. Keep responses under 150 words.`
  },
  rb2b: {
    name: "The Watchman",
    system: `You are The Watchman \u2014 NUI's silent visitor identification agent powered by RB2B. When someone visits newurbaninfluence.com, you identify 15\u201330% of them \u2014 capturing their full name, email, company, and LinkedIn profile.

Those identified visitors get auto-enrolled in a follow-up email sequence via SendGrid.

When Faren chats with you, show him who visited recently, which visitors were identified, what emails went out, and flag any high-value visitors worth following up personally. Keep responses under 150 words.`
  },
  upsell: {
    name: "The Upsell Trigger",
    system: `You are The Upsell Trigger \u2014 NUI's retention and expansion agent. After 90 days of a client being active, you analyze their usage and milestones in Supabase and Stripe, then fire the right upsell offer at the right moment.

Upsell sequences: Digital Street Team upgrade, AI video add-on, additional agent deployment, Co-Sign magazine feature, annual plan conversion.

When Faren chats with you, show him which clients are approaching upsell windows, what offers fired, what converted, and let him adjust timing or offers for specific clients. Keep responses under 150 words.`
  }
};
var DEFAULT_PERSONA = (name, role) => ({
  name,
  system: `You are ${name} \u2014 an NUI AI agent currently in development. Your role when live: ${role}

You're not yet deployed but you can explain what you'll do, how you'll work, and what data you'll need. When Faren asks what you can do, be specific and practical. Keep responses under 150 words.`
});
var { checkRateLimit, getClientIP, rateLimitResponse } = require_rate_limiter();
var { sanitizeText } = require_sanitizer();
exports.handler = async (event) => {
  const _rl = checkRateLimit("hq-chat:" + getClientIP(event), 30, 6e4);
  if (!_rl.allowed) return rateLimitResponse(_rl.resetIn);
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { agent_id, message, agent_name, agent_role, history } = JSON.parse(event.body || "{}");
    if (!agent_id || !message) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "agent_id and message required" }) };
    }
    if (!CLAUDE) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }) };
    }
    const persona = AGENT_PERSONAS[agent_id] || DEFAULT_PERSONA(agent_name || agent_id, agent_role || "Automation agent");
    let recentActivity = "";
    try {
      if (SB_URL && SB_KEY) {
        const r = await fetch(`${SB_URL}/rest/v1/agent_logs?agent_id=eq.${agent_id}&order=created_at.desc&limit=5&select=status,message,created_at`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
        });
        if (r.ok) {
          const logs = await r.json();
          if (logs.length) {
            recentActivity = "\n\nRecent activity (last 5 runs):\n" + logs.map(
              (l) => `- ${new Date(l.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}: [${l.status}] ${l.message || "ran"}`
            ).join("\n");
          }
        }
      }
    } catch (e) {
    }
    const messages = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        messages.push({ role: h.role, content: h.content });
      });
    }
    messages.push({ role: "user", content: message });
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: persona.system + recentActivity + "\n\nYou are talking directly with Faren Young, your operator. Be concise, direct, and useful. No preamble.",
        messages
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Claude API error ${response.status}`);
    }
    const data = await response.json();
    const reply = data.content?.[0]?.text || "No response generated.";
    try {
      if (SB_URL && SB_KEY) {
        await fetch(`${SB_URL}/rest/v1/agent_conversations`, {
          method: "POST",
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ agent_id, user_message: message, agent_reply: reply, created_at: (/* @__PURE__ */ new Date()).toISOString() })
        });
      }
    } catch (e) {
    }
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply, agent_id, agent_name: persona.name })
    };
  } catch (e) {
    console.error("agent-hq-chat error:", e.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message, reply: `Something went wrong: ${e.message}` })
    };
  }
};
//# sourceMappingURL=agent-hq-chat.js.map
