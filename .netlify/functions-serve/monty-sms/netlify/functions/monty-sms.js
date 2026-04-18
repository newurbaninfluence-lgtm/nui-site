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
    function getClientIP(event) {
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
    module2.exports = { checkRateLimit: checkRateLimit2, getClientIP, rateLimitResponse: rateLimitResponse2 };
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
    function sanitizePhone2(phone) {
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
    module2.exports = { sanitizeText: sanitizeText2, sanitizeEmail, sanitizePhone: sanitizePhone2, sanitizeUUID, sanitizeUrl, validateRequired, stripHtml };
  }
});

// netlify/functions/utils/agency-brand.js
var require_agency_brand = __commonJS({
  "netlify/functions/utils/agency-brand.js"(exports2, module2) {
    var NUI_DEFAULTS = {
      agency_name: "New Urban Influence",
      founder_name: "Faren Young",
      founder_title: "Founder",
      company_phone: "(248) 487-8747",
      company_city: "Detroit, Michigan",
      company_website: "newurbaninfluence.com",
      company_email: "info@newurbaninfluence.com",
      company_tagline: "We don't design. We influence.",
      logo_url: "https://newurbaninfluence.com/logo-nav-cropped.png",
      brand_color: "#dc2626",
      print_store_url: "https://newurbaninfluence.com/print",
      smtp_user: null,
      smtp_pass: null,
      openphone_key: null,
      openphone_number: null
    };
    async function getBrand(agencyId) {
      if (!agencyId) return { ...NUI_DEFAULTS, _agencyId: null };
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn("[agency-brand] No Supabase env \u2014 returning NUI defaults");
        return { ...NUI_DEFAULTS };
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/agency_subaccounts?id=eq.${agencyId}&select=*&limit=1`,
          {
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const rows = await res.json();
        if (!rows || rows.length === 0) {
          console.warn(`[agency-brand] No row found for agency_id=${agencyId}`);
          return { ...NUI_DEFAULTS };
        }
        const row = rows[0];
        const keys = row.integrations_config || {};
        return {
          _agencyId: agencyId,
          // marks this as a sub-account — no NUI cred fallback
          agency_name: row.agency_name || NUI_DEFAULTS.agency_name,
          founder_name: row.founder_name || row.owner_name || NUI_DEFAULTS.founder_name,
          founder_title: row.founder_title || NUI_DEFAULTS.founder_title,
          company_phone: row.company_phone || row.owner_phone || NUI_DEFAULTS.company_phone,
          company_city: row.company_city || NUI_DEFAULTS.company_city,
          company_website: row.company_website || row.domain || NUI_DEFAULTS.company_website,
          company_email: row.company_email || row.owner_email || NUI_DEFAULTS.company_email,
          company_tagline: row.company_tagline || NUI_DEFAULTS.company_tagline,
          logo_url: row.logo_url || NUI_DEFAULTS.logo_url,
          brand_color: row.brand_color || NUI_DEFAULTS.brand_color,
          print_store_url: row.print_store_url || NUI_DEFAULTS.print_store_url,
          // Keys: check top-level columns THEN integrations_config JSONB
          smtp_user: row.smtp_user || keys.sendgrid || null,
          smtp_pass: row.smtp_pass || keys.sendgrid_pass || null,
          openphone_key: row.openphone_key || keys.openphone || null,
          openphone_number: row.openphone_number || keys.openphone_number || null,
          stripe_pk: row.stripe_pk || keys.stripe || null,
          stripe_sk: row.stripe_sk || keys.stripe_sk || null,
          ga4_id: keys.ga4 || null,
          meta_pixel: keys.meta_pixel || null,
          _raw: row
        };
      } catch (err) {
        console.error("[agency-brand] Lookup failed:", err.message);
        return { ...NUI_DEFAULTS };
      }
    }
    function hasSMTP(brand) {
      if (!brand._agencyId) return true;
      const keys = brand._raw && brand._raw.integrations_config || {};
      return !!(keys.email_key || brand.smtp_user);
    }
    function hasOpenPhone(brand) {
      const keys = brand._raw && brand._raw.integrations_config || {};
      return !!(brand.openphone_key || keys.openphone) && !!(brand.openphone_number || keys.openphone_number);
    }
    function getTransporter(brand) {
      const nodemailer = require("nodemailer");
      const isNUI = !brand._agencyId;
      if (isNUI) {
        const user = process.env.HOSTINGER_EMAIL || process.env.SMTP_USER;
        const pass = process.env.HOSTINGER_PASSWORD || process.env.SMTP_PASS;
        if (!user || !pass) throw new Error("SMTP_NOT_CONFIGURED");
        return nodemailer.createTransport({ host: "smtp.hostinger.com", port: 465, secure: true, auth: { user, pass } });
      }
      const keys = brand._raw && brand._raw.integrations_config || {};
      const provider = (keys.email_provider || "").toLowerCase();
      const emailKey = keys.email_key || brand.smtp_pass || null;
      const emailFrom = keys.email_from || brand.smtp_user || null;
      if (!emailKey) throw new Error("SMTP_NOT_CONFIGURED");
      const PROVIDERS = {
        sendgrid: { host: "smtp.sendgrid.net", port: 587, secure: false, auth: { user: "apikey", pass: emailKey } },
        gmail: { host: "smtp.gmail.com", port: 587, secure: false, auth: { user: emailFrom, pass: emailKey } },
        hostinger: { host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: emailFrom, pass: emailKey } },
        mailchimp: { host: "smtp.mandrillapp.com", port: 587, secure: false, auth: { user: emailFrom || "anyuser", pass: emailKey } },
        smtp: { host: keys.smtp_host || "smtp.hostinger.com", port: parseInt(keys.smtp_port) || 587, secure: false, auth: { user: emailFrom, pass: emailKey } }
      };
      let config = PROVIDERS[provider];
      if (!config) {
        if (emailKey.startsWith("SG.")) config = PROVIDERS.sendgrid;
        else if (emailFrom && emailFrom.includes("gmail.com")) config = PROVIDERS.gmail;
        else if (emailFrom && emailFrom.includes("hostinger")) config = PROVIDERS.hostinger;
        else config = { host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: emailFrom || emailKey, pass: emailKey } };
      }
      return nodemailer.createTransport(config);
    }
    function getFromAddress(brand) {
      const isNUI = !brand._agencyId;
      const keys = brand._raw && brand._raw.integrations_config || {};
      const email = keys.email_from || brand.smtp_user || (isNUI ? process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL : null);
      if (!email) throw new Error("SMTP_NOT_CONFIGURED");
      const label = brand.founder_name ? `${brand.founder_name} | ${brand.agency_name}` : brand.agency_name;
      return `"${label}" <${email}>`;
    }
    function buildEmailFooter(brand) {
      return `
    <div style="padding:24px 28px;text-align:center;background:#0a0a0a;">
        <div style="margin-bottom:10px;">
            ${brand.logo_url ? `<img src="${brand.logo_url}" alt="${brand.agency_name}" style="height:32px;opacity:0.7;">` : `<span style="font-family:'Syne','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);">${brand.agency_name.toUpperCase()}</span>`}
        </div>
        ${brand.company_tagline ? `<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.15);margin-bottom:10px;">${brand.company_tagline}</div>` : ""}
        <p style="margin:0 0 6px;color:#444;font-size:11px;">
            ${[brand.company_city, brand.company_phone, brand.company_website].filter(Boolean).join(" \xB7 ")}
        </p>
        <p style="margin:0;color:#333;font-size:10px;">You're receiving this because you're a valued client.</p>
    </div>`;
    }
    function buildEmailSignature(brand) {
      return `
    <p style="font-size:15px;line-height:1.7;color:#333;margin-top:24px;">
        Talk soon,<br>
        <strong>${brand.founder_name}</strong><br>
        ${brand.founder_title ? `${brand.founder_title}, ` : ""}${brand.agency_name}<br>
        ${brand.company_phone ? `<span style="color:#888;font-size:13px;">${brand.company_phone}</span>` : ""}
    </p>
    <div style="border-top:1px solid #eee;margin-top:16px;padding-top:12px;font-size:11px;color:#aaa;">
        ${brand.agency_name}${brand.company_city ? ` \u2022 ${brand.company_city}` : ""}<br>
        ${brand.company_website ? `<a href="https://${brand.company_website}" style="color:${brand.brand_color};">${brand.company_website}</a>` : ""}
    </div>`;
    }
    function buildSmsSystemPrompt(brand) {
      return `You are Monty, the AI representative for ${brand.agency_name}${brand.company_city ? `, a creative agency in ${brand.company_city}` : ""}. You handle SMS like a top-tier sales pro and customer service expert combined.

ROLE: Customer service \xB7 Appointment setter \xB7 Deal closer. You represent THE TEAM \u2014 never direct people to any individual by name unless they specifically ask. Refer to "our team", "we", "our strategists."

SELLING STYLE (Cardone/Hormozi):
- Assume the sale. Speak in outcomes not features.
- Handle objections with empathy + reframe. Price \u2192 value. Timing \u2192 urgency.
- Always move the conversation forward with a clear next step.
- Goal: book a strategy call OR close the deal.

SMS RULES: 1-3 sentences max. Direct. Human. No fluff. One emoji max.

CONVERSATION AWARENESS: You will receive the full SMS thread history. Read ALL of it. If the team already addressed something, build on it \u2014 don't repeat or contradict.

POLICIES: All sales final. Revisions included (2 rounds). Payment plans available (0% interest). If you can't resolve something, offer to have the team follow up today.

CONTACT:
${brand.company_phone ? `Phone: ${brand.company_phone}` : ""}
${brand.company_email ? `Email: ${brand.company_email}` : ""}
${brand.company_website ? `Web: ${brand.company_website}` : ""}`;
    }
    module2.exports = { getBrand, getTransporter, getFromAddress, hasSMTP, hasOpenPhone, buildEmailFooter, buildEmailSignature, buildSmsSystemPrompt, NUI_DEFAULTS };
  }
});

// netlify/functions/utils/security.js
var require_security = __commonJS({
  "netlify/functions/utils/security.js"(exports2, module2) {
    var ALLOWED_ORIGINS = [
      "https://newurbaninfluence.com",
      "https://www.newurbaninfluence.com",
      "http://localhost:8888",
      "http://localhost:3000",
      "http://127.0.0.1:8888"
    ];
    function getCorsHeaders(event) {
      const origin = event?.headers?.origin || "";
      const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
      return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Content-Type": "application/json"
      };
    }
    function requireAdmin(event) {
      const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"] || "";
      const secret = process.env.ADMIN_SECRET;
      if (!secret) {
        console.warn("\u26A0\uFE0F ADMIN_SECRET not set \u2014 admin endpoint is UNPROTECTED. Set it in Netlify Dashboard.");
        return { authorized: true, warning: "No ADMIN_SECRET configured" };
      }
      if (!token) {
        return { authorized: false, error: "Missing authentication token" };
      }
      if (token.length !== secret.length) {
        return { authorized: false, error: "Invalid token" };
      }
      const a = Buffer.from(token);
      const b = Buffer.from(secret);
      const crypto = require("crypto");
      if (!crypto.timingSafeEqual(a, b)) {
        return { authorized: false, error: "Invalid token" };
      }
      return { authorized: true };
    }
    function requireWebhookSecret(event, envKey) {
      const expected = process.env[envKey];
      if (!expected) return { authorized: true };
      const token = event.headers["x-webhook-secret"] || event.headers["authorization"] || event.queryStringParameters?.secret || "";
      if (token === expected || token === `Bearer ${expected}`) {
        return { authorized: true };
      }
      return { authorized: false, error: "Invalid webhook secret" };
    }
    function sanitize(input) {
      if (typeof input !== "string") return input;
      return input.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").replace(/data:/gi, "").trim().slice(0, 5e3);
    }
    function sanitizeObject(obj) {
      if (!obj || typeof obj !== "object") return obj;
      const clean = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          clean[key] = sanitize(value);
        } else if (typeof value === "object" && value !== null) {
          clean[key] = Array.isArray(value) ? value.map(sanitize) : sanitizeObject(value);
        } else {
          clean[key] = value;
        }
      }
      return clean;
    }
    function isValidEmail(email) {
      if (!email || typeof email !== "string") return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    }
    function isValidPhone(phone) {
      if (!phone || typeof phone !== "string") return false;
      const digits = phone.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11 && digits[0] === "1";
    }
    var rateLimitStore = {};
    function rateLimit(ip, maxRequests = 30, windowMs = 6e4) {
      const now = Date.now();
      const key = ip || "unknown";
      if (!rateLimitStore[key]) {
        rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
        return { limited: false, remaining: maxRequests - 1 };
      }
      if (now > rateLimitStore[key].resetAt) {
        rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
        return { limited: false, remaining: maxRequests - 1 };
      }
      rateLimitStore[key].count++;
      if (rateLimitStore[key].count > maxRequests) {
        return { limited: true, remaining: 0 };
      }
      return { limited: false, remaining: maxRequests - rateLimitStore[key].count };
    }
    function errorResponse(statusCode, message, headers) {
      return {
        statusCode,
        headers: headers || {},
        body: JSON.stringify({ error: message })
      };
    }
    function handleOptions(event) {
      if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: getCorsHeaders(event), body: "" };
      }
      return null;
    }
    module2.exports = {
      getCorsHeaders,
      requireAdmin,
      requireWebhookSecret,
      sanitize,
      sanitizeObject,
      isValidEmail,
      isValidPhone,
      rateLimit,
      errorResponse,
      handleOptions,
      ALLOWED_ORIGINS
    };
  }
});

// netlify/functions/sms-monty.js
var require_sms_monty = __commonJS({
  "netlify/functions/sms-monty.js"(exports2) {
    var { getBrand, buildSmsSystemPrompt } = require_agency_brand();
    var { requireAdmin } = require_security();
    var CORS_HEADERS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    var CALENDLY_URL = process.env.CALENDLY_URL || "https://calendly.com/newurbaninfluence";
    var ADMIN_EMAIL = process.env.ADMIN_EMAIL || "newurbaninfluence@gmail.com";
    var INTERNAL_TEAM = {
      [process.env.IRISH_PHONE || "+12485551234"]: { name: "Irish", role: "wife", greeting: "Oh hey Irish \u{1F44B}" },
      [process.env.FAREN_PHONE || "+12485550000"]: { name: "Faren", role: "founder", greeting: "Hey boss \u{1F919}" }
    };
    var SMS_SYSTEM_PROMPT = `You are Monty, the AI representative for New Urban Influence (NUI) \u2014 a Detroit-based agency that builds Digital Headquarters, AI automation systems, and brand infrastructure for businesses. You are the first conversation. You qualify leads, book calls, and set up Faren to close.

SELLING PHILOSOPHY \u2014 NEPQ (Neuro-Emotional Persuasion Questioning)
You are a problem finder \u2014 NOT a pusher. Help prospects DISCOVER their own problem. Be curious, calm, detached from the outcome. One question per message. Always pause. Always wait for their reply. Never pitch before Stage 3.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
INDUSTRY ROUTING \u2014 Detect early, shape questions around their world
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

TIER 1 \u2014 ATTACK NOW (high pain, fast close):
\u2022 Restaurants/Dining \u2014 Pain: invisible online, can't compete with chains. Hook: "People search before they walk in. Are you showing up?"
\u2022 Bars/Nightlife \u2014 Pain: platform ad restrictions, relying on flyers. Hook: "Facebook blocked your ads? There's a way around that."
\u2022 HVAC \u2014 Pain: dominated by larger companies on Google Maps. Hook: "Are you showing up in every zip code you service?"
\u2022 Roofing \u2014 Pain: trust issue, hard to stand out. Hook: "Homeowners about to spend $15K are Googling you right now. What do they find?"
\u2022 Flooring \u2014 Pain: search visibility, no follow-up system. Hook: "Most floor inquiries go to whoever follows up first. Are you doing that automatically?"
\u2022 Lawn Care \u2014 Pain: seasonal, relies on referrals. Hook: "How are you staying in front of last year's customers?"

TIER 2 \u2014 STRONG CLOSE:
\u2022 Photography Studios \u2014 Pain: booked by referral, not discovery. Hook: "When someone searches for a photographer in your city, do you come up?"
\u2022 Insurance Agents \u2014 Pain: generic, competitive. Hook: "What makes someone choose you over the big name agents?"
\u2022 Medical/Private Practice \u2014 Pain: trust, local search. Hook: "Are patients finding you when they search your specialty near them?"
\u2022 Cannabis Dispensaries \u2014 Pain: can't run Facebook/Google ads. Hook: "No ads allowed \u2014 how are you getting found?"
\u2022 Street Clothing/Fashion \u2014 Pain: social content, brand identity. Hook: "What's your biggest channel right now \u2014 Instagram, in-person, something else?"
\u2022 Authors/Speakers \u2014 Pain: credibility, discoverability. Hook: "When someone Googles your name, what's the first thing they find?"

TIER 3 \u2014 NUI HOME COURT:
\u2022 Bakeries/Food Makers \u2014 Pain: ATD vendor or storefront, needs online presence.
\u2022 Creative Makers \u2014 Pain: beautiful product, invisible brand.
\u2022 Art Galleries \u2014 Pain: event attendance, no digital system.
\u2022 Salons/Barbershops \u2014 Pain: walk-ins vs. consistent booking.
\u2022 All Things Detroit Vendors \u2014 Pain: foot traffic but no follow-up system. NUI built ATD's brand \u2014 use that. "You know All Things Detroit? We built their brand. That's actually why we built something specific for ATD vendors."

WHEN INDUSTRY IS DETECTED \u2014 customize Stage 2 situational question to their world. Never ask generic "how do you get clients." Ask the version specific to their business type.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
CONVERSATION STAGES
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

STAGE 1 \u2014 CONNECTION (first message / cold):
"Hey [name if known], this is Monty with New Urban Influence \u2014 Detroit's business infrastructure agency. Not sure if what we do is even a match for you. Mind if I ask one quick question?"
\u2192 STOP. Wait for reply. Do NOT pitch. Do NOT mention services.

STAGE 2 \u2014 ENGAGEMENT (after permission):
Use industry-specific situational question from routing above.
Generic fallback: "How are you currently getting most of your new clients \u2014 referrals, social, or something else?"

STAGE 3 \u2014 PROBLEM AWARENESS:
ONE follow-up: "How long has that been going on?" / "What have you tried to fix that?" / "What do you think was missing?"

STAGE 4 \u2014 SOLUTION AWARENESS:
HQ QUALIFICATION FIRST: Before recommending staff or services, identify which HQ level they need.
Ask: "Do you currently have a website for your business?"
\u2192 NO: They need The Blueprint + Digital HQ first. Start there.
\u2192 YES \u2014 basic: They may qualify for HQ Lite ($3,500 \u2014 unlocks Digital Staff basics)
\u2192 YES \u2014 established: They may qualify for HQ Standard ($5,500) or HQ Command ($8,500+)

RULE: Digital Staff positions require a Digital HQ. You CANNOT recommend The Digital Secretary, Lead Catcher, or Digital Promoter without first qualifying their HQ level. The HQ is the storefront. Staff works from the storefront.

SOLUTION FRAMING by pain:
- No leads from website \u2192 "We'd build you a Digital HQ \u2014 not just a website, but a system that captures leads and follows up automatically while you're working."
- Doing everything manually \u2192 "Digital Staff \u2014 AI that handles follow-ups, bookings, and messages 24/7 while you run the business."
- Invisible online \u2192 "We put your flag in every zip code \u2014 Google Maps, AI search, and local discovery at the same time."
- Relying on referrals \u2192 "We build a system that brings consistent inbound \u2014 so referrals become a bonus, not your only source."
- Need brand credibility \u2192 "We start with The Brand Architect \u2014 logo, colors, voice, and brand system \u2014 then build from there. Three tiers: Brand Kit $1,500, Service Brand $4,500, Product Brand $5,500."
- ATD/market vendor \u2192 "We actually built the All Things Detroit brand. We have The Event Team \u2014 we show up at your booth, capture photos, and collect verified leads with their phone number and push opt-in in 60 seconds."
- Want press/credibility \u2192 "The Publicist \u2014 we write and publish your feature in NUI Magazine. That link closes deals before you even get on a call. Starts at $1,500."
- Event/vendor show \u2192 "The Event Team \u2014 day-rate staff for your booth. Photographer, digital sign-in, instant SMS delivery with your store link, and push notification opt-in gate. Every person who stops leaves as a verified lead. $497 half-day."
- Invisible on social \u2192 "The Digital Promotion Team \u2014 AI creates your content, sends digital flyers and text blasts to opted-in phones, geofences competitor locations, and dominates Google Maps zip by zip."
- Platform blocking ads \u2192 "The Block Captain \u2014 geofencing runs outside Facebook and Google's ad platforms entirely. No content restrictions. We plant your brand on every phone in a competitor's parking lot."

STAGE 5 \u2014 COMMITMENT:
"I could set up a free 15-min call \u2014 no pitch, just a real conversation. If it makes sense we'll talk further, if not no hard feelings. Worth 15 minutes?"
\u2192 YES: drop Calendly link \u2192 \u{1F4C5} Book here: ${CALENDLY_URL}
\u2192 HESITANT: "What's the main thing making you unsure? Maybe I can clear that up right here."
\u2192 NO: "Totally get it. If anything changes you know where to find us."

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
SERVICES & PRICING (only at Stage 4+)
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

BRAND ARCHITECT (Brand Identity \u2014 replaces "The Blueprint")
Brand Kit $1,500 / Service Brand Identity $4,500+ / Product Brand Identity $5,500+
For: New launches, rebrands, product companies, service businesses. No HQ required.
Brand Kit = logo, colors, voice, social templates. Service Brand = + print, signage, uniforms, website, digital assets. Product Brand = + packaging, labels, in-store displays, apparel.

DIGITAL HQ (Website + Business System)
HQ Lite $3,500 / HQ Standard $5,500 / HQ Command $8,500+
Unlocks: HQ Lite \u2192 Digital Secretary + basic Content Crew / HQ Standard \u2192 Lead Catcher + Digital Promoter + Ghostwriter + Money Reporter / HQ Command \u2192 Block Captain + Neighborhood Captain + all positions

DIGITAL STAFF (AI Team \u2014 HQ Required):
The Digital Secretary $197/mo \u2014 24/7 AI phone rep, answers calls, books appointments, learns your voice (HQ Lite+)
Full Digital Staff $397/mo \u2014 Secretary + Lead Catcher, sub-5-min follow-up on all channels (HQ Standard+)
The Ghostwriter \u2014 AI email that reads your CRM, knows who the customer is, writes in your brand voice (HQ Standard+, add-on)
The Money Reporter \u2014 plain-English weekly business report, no dashboards (HQ Standard+, add-on)
The Project Manager \u2014 hardwires your entire operation in code, one-time fee, no Zapier (one-time build, call for pricing)
The Street Announcer \u2014 SMS + push notifications to owned list (HQ Standard+, add-on)

DIGITAL STREET TEAM (Content + Promotion + Visibility):
Content Crew \u2014 Posted Up $497/mo / Loaded $1,497/mo / Heavy $2,997/mo
Digital Promoter \u2014 SMS + push + retargeting to owned audience (HQ Standard+, add-on)
The Block Captain \u2014 Geofencing, no platform restrictions, competitor locations, stadiums (HQ Command+, call for pricing)
The Neighborhood Captain \u2014 Google Maps domination zip by zip (HQ Command+, call for pricing)
The Watchman \u2014 Silent Visitor ID, identifies 15-30% of anonymous website visitors by name/email/LinkedIn (HQ Standard+, $500 setup + $97/mo)
The Facebook Runner \u2014 Meta Pixel + retargeting + lookalike audiences ($500 setup + $199/mo)
The Google Runner \u2014 Google display network + YouTube retargeting across 2M+ sites ($500 setup + $199/mo)

THE PUBLICIST (NUI Magazine Feature):
Feature $1,500 / Bundle $3,500 (includes professional photography)
For: Any business where trust drives the sale \u2014 roofing, legal, medical, coaching, photography, cannabis, authors.

THE EVENT TEAM (Day-rate, vendor shows + pop-ups):
Half Day $497 / Full Day $897 / Weekend $1,497
How it works: Photographer + digital sign-in + SMS photo delivery with store link + push opt-in gate. 60-second turnaround. Built for All Things Detroit, Eastern Market, trade shows.

PRINT & PACKAGING \u2014 from $150
FINANCING: Afterpay + Klarna at checkout. From $89/mo. 0% interest.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
MODES & POLICIES
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

ACTIVE CLIENT MODE: Existing paying client \u2192 relationship mode only. Warm, helpful. No sales unless they bring it up. Escalate complex issues.

SUPPORT MODE: Complaint \u2192 empathy first. "I hear you. That shouldn't be happening \u2014 can you give me a quick description?" Never defend. Escalate.

AFFORDABILITY OBJECTION:
"Is it more of a timing thing or is the investment itself what's giving you pause?"
IF TIMING: "We have Afterpay and Klarna at checkout \u2014 you can split it right at payment. Zero extra steps. Packages from $89/mo."
IF VALUE: "What would need to be true for this to feel like a worthwhile investment?"

POLICIES (cite firmly, never waive):
- All sales final. No refunds on completed, approved, or in-progress work.
- Deposits non-refundable. Full payment before delivery.
- Revisions: 2 rounds included, $75/hr after.
- Disputes: hello@newurbaninfluence.com

TONE: 1-3 sentences max. SMS only. Direct. Detroit energy. Sound human. Never sound like a bot or a pitch deck.`;
    async function analyzeIntelligence(message, history, clientContext, apiKey) {
      const prompt = `You are an AI sales intelligence engine for a branding agency. Analyze this SMS conversation and return ONLY valid JSON, no markdown, no explanation.

INCOMING MESSAGE: "${message}"

CONVERSATION HISTORY:
${history || "(No prior history)"}

CLIENT CONTEXT:
${clientContext}

Return this exact JSON structure:
{
  "intent_score": <integer 1-10, where 1=no interest, 5=curious/exploring, 8=ready to buy, 10=urgent hot lead>,
  "sentiment": "<one of: excited | warm | neutral | hesitant | frustrated>",
  "calendly_ready": <true if they want to talk/meet/call/book, false otherwise>,
  "is_hot": <true if intent_score >= 7>,
  "bant": {
    "budget": "<what they said about budget/price/cost, or null>",
    "authority": "<are they the decision maker? what they said, or null>",
    "need": "<what service/problem they need help with, or null>",
    "timeline": "<when do they need it? urgency, or null>"
  },
  "followup_needed": <true if they went cold or didn't commit, false if they booked or replied with clear next step>,
  "tags": ["<1-3 short tags like: logo, urgent, price-sensitive, new-business, existing-client>"]
}`;
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        const raw = data.content?.[0]?.text || "{}";
        return JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch (e) {
        console.warn("[Monty] Intelligence analysis failed:", e.message);
        return { intent_score: 5, sentiment: "neutral", calendly_ready: false, is_hot: false, bant: {}, followup_needed: false, tags: [] };
      }
    }
    async function sendHotLeadAlert(contact, message, score, sentiment, bant, supabaseUrl, supabaseKey) {
      try {
        const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.phone;
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;">
<div style="background:#dc2626;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
<h2 style="margin:0;">\u{1F525} Hot Lead Alert \u2014 Score ${score}/10</h2>
</div>
<div style="background:#1a1a1a;color:#fff;padding:20px;">
<p><strong>Contact:</strong> ${name} \xB7 ${contact.phone}</p>
<p><strong>Sentiment:</strong> ${sentiment}</p>
<p><strong>Their message:</strong> "${message}"</p>
<hr style="border-color:#333;"/>
<p><strong>BANT Intelligence:</strong></p>
<ul>
<li>Budget: ${bant?.budget || "Not mentioned"}</li>
<li>Authority: ${bant?.authority || "Unknown"}</li>
<li>Need: ${bant?.need || "Not specified"}</li>
<li>Timeline: ${bant?.timeline || "Not mentioned"}</li>
</ul>
<p><a href="https://newurbaninfluence.com/app/#contacthub" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">View in Contact Hub \u2192</a></p>
</div></div>`;
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ to: ADMIN_EMAIL, subject: `\u{1F525} Hot Lead: ${name} (Score ${score}/10)`, html })
        }).catch(() => {
        });
        await fetch("https://newurbaninfluence.com/.netlify/functions/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: ADMIN_EMAIL, subject: `\u{1F525} Hot Lead: ${name} (Score ${score}/10)`, html, text: `Hot lead from ${name}. Score: ${score}/10. Message: "${message}"` })
        }).catch(() => {
        });
      } catch (e) {
        console.warn("[Monty] Hot lead alert failed:", e.message);
      }
    }
    function normalizePhone(raw) {
      if (!raw) return null;
      const digits = raw.replace(/\D/g, "");
      if (digits.length === 10) return "+1" + digits;
      if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
      return raw;
    }
    function extractNameFromText(text) {
      if (!text) return null;
      const patterns = [
        /(?:this is|i'm|i am|my name is|name'?s|it's|its|hey,? it's)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i,
        /^([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+(?:here|calling|texting)/i
      ];
      for (const p of patterns) {
        const m = text.match(p);
        if (m && !/monty|sona|nui|urban/i.test(m[1])) return m[1].trim();
      }
      return null;
    }
    async function saveIntelligence(contactId, intel, supabaseUrl, supabaseKey) {
      if (!contactId) return;
      const headers = { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" };
      const updates = {
        lead_score: intel.intent_score,
        sentiment: intel.sentiment,
        last_activity_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (intel.bant?.budget) updates.bant_budget = intel.bant.budget;
      if (intel.bant?.authority) updates.bant_authority = intel.bant.authority;
      if (intel.bant?.need) updates.bant_need = intel.bant.need;
      if (intel.bant?.timeline) updates.bant_timeline = intel.bant.timeline;
      if (intel.tags?.length) updates.interest_tags = intel.tags;
      if (intel.intent_score >= 7) updates.status = "qualified";
      await fetch(`${supabaseUrl}/rest/v1/crm_contacts?id=eq.${contactId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updates)
      }).catch((e) => console.warn("[Monty] Save intelligence failed:", e.message));
    }
    exports2.handler = async function(event) {
      if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
      if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
      const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
      const OPENPHONE_API_KEY = process.env.OPENPHONE_API_KEY;
      const FROM_NUMBER_ID = process.env.OPENPHONE_PHONE_NUMBER;
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
      let agencyId = null;
      try {
        const b = JSON.parse(event.body || "{}");
        agencyId = b.agency_id || null;
      } catch (e) {
      }
      const brand = await getBrand(agencyId);
      const AGENCY_SYSTEM_PROMPT = buildSmsSystemPrompt(brand) || SMS_SYSTEM_PROMPT;
      try {
        const payload = JSON.parse(event.body || "{}");
        const incomingMessage = payload.data?.object?.text || payload.data?.object?.body || payload.content || payload.message || payload.text;
        const fromNumber = payload.data?.object?.from || payload.from || payload.sender;
        const direction = payload.data?.object?.direction || payload.direction || "incoming";
        if (direction === "outgoing" || direction === "outbound") {
          if (SUPABASE_URL && SUPABASE_KEY && incomingMessage && fromNumber) {
            const toNumber = payload.data?.object?.to || payload.to || fromNumber;
            await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
              method: "POST",
              headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
              body: JSON.stringify({ channel: "sms", direction: "outbound", message: incomingMessage, metadata: { to: toNumber, handler: "team_manual" }, created_at: (/* @__PURE__ */ new Date()).toISOString() })
            }).catch(() => {
            });
          }
          return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ logged: "team_outbound" }) };
        }
        if (!incomingMessage || !fromNumber) {
          return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing message or sender" }) };
        }
        if (!ANTHROPIC_API_KEY) return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "API key not configured" }) };
        console.log(`\u{1F4F1} SMS from ${fromNumber}: "${incomingMessage}"`);
        const cleanPhone = normalizePhone(fromNumber);
        const extractedName = extractNameFromText(incomingMessage);
        let contact = null;
        let contactId = null;
        let clientContext = "NEW INQUIRY \u2014 Treat as a fresh lead.";
        let conversationHistory = "";
        if (SUPABASE_URL && SUPABASE_KEY) {
          const sbHeaders = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };
          const digits = cleanPhone.replace(/\D/g, "").slice(-10);
          const formats = [cleanPhone, `+1${digits}`, digits, `1${digits}`];
          const orFilter = formats.map((f) => `phone.eq.${encodeURIComponent(f)}`).join(",");
          const cRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?or=(${orFilter})&select=*&limit=1`, { headers: sbHeaders });
          const contacts = await cRes.json();
          if (contacts?.length > 0) {
            contact = contacts[0];
            contactId = contact.id;
            if (extractedName && !contact.first_name) {
              const parts = extractedName.split(" ");
              await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
                method: "PATCH",
                headers: { ...sbHeaders, "Content-Type": "application/json", "Prefer": "return=minimal" },
                body: JSON.stringify({ first_name: parts[0], last_name: parts.slice(1).join(" ") || null })
              }).catch(() => {
              });
              contact.first_name = parts[0];
              contact.last_name = parts.slice(1).join(" ") || null;
            }
            const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unknown";
            clientContext = `CLIENT FOUND:
- Name: ${name}
- Company: ${contact.company || "Not specified"}
- Email: ${contact.email || "Not on file"}
- Status: ${contact.status || "new_lead"}
- Lead Score: ${contact.lead_score || "Not scored yet"}/10
- Sentiment: ${contact.sentiment || "Unknown"}
- Service Interest: ${contact.bant_need || contact.service_interest || "Not specified"}
- Budget: ${contact.bant_budget || "Not mentioned"}
- Timeline: ${contact.bant_timeline || "Not mentioned"}
- Industry: ${contact.industry || "Not specified"}
- Calendly Sent: ${contact.calendly_sent ? "YES \u2014 already sent" : "No"}`;
            const jRes = await fetch(`${SUPABASE_URL}/rest/v1/jobs?client_id=eq.${contactId}&order=created_at.desc&limit=5`, { headers: sbHeaders });
            const jobs = await jRes.json();
            if (jobs?.length > 0) {
              clientContext += "\n\nACTIVE JOBS:";
              jobs.forEach((j) => {
                clientContext += `
- "${j.title || "Untitled"}" \u2014 Status: ${j.status || "unknown"}`;
              });
            }
          } else {
            const nameParts = extractedName ? extractedName.split(" ") : [];
            const createRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_contacts`, {
              method: "POST",
              headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
              body: JSON.stringify({ phone: cleanPhone, first_name: nameParts[0] || null, last_name: nameParts.slice(1).join(" ") || null, source: "quo_text", status: "new_lead", lead_score: 3, last_activity_at: (/* @__PURE__ */ new Date()).toISOString() })
            }).catch(() => null);
            const created = createRes ? await createRes.json() : null;
            if (Array.isArray(created) && created[0]) {
              contact = created[0];
              contactId = contact.id;
              clientContext = `NEW CONTACT AUTO-CREATED: Phone ${cleanPhone}. Name: ${extractedName || "Not given yet"}. This is their first message \u2014 treat as a fresh lead.`;
              console.log(`[Monty] New contact: ${cleanPhone} \u2192 ${contactId}`);
            }
          }
          const hRes = await fetch(
            `${SUPABASE_URL}/rest/v1/communications?channel=eq.sms&or=(metadata->>to.eq.${encodeURIComponent(cleanPhone)},metadata->>from.eq.${encodeURIComponent(cleanPhone)})&order=created_at.desc&limit=8`,
            { headers: sbHeaders }
          );
          const history = await hRes.json();
          if (history?.length > 0) {
            conversationHistory = "\n\nRECENT SMS THREAD (chronological \u2014 read before replying):";
            history.reverse().forEach((h) => {
              const handler2 = h.metadata?.handler || "";
              let who = h.direction === "outbound" ? handler2 === "team_manual" ? "NUI Team (human)" : "Monty (you)" : "Client";
              conversationHistory += `
${who}: ${h.message || "(no content)"}`;
            });
            conversationHistory += "\n\n[Continue naturally \u2014 do NOT repeat what was already said.]";
          }
          clientContext += conversationHistory;
        }
        let teamPhone = fromNumber.replace(/[^\d+]/g, "");
        if (teamPhone.length === 10) teamPhone = "+1" + teamPhone;
        else if (teamPhone.length === 11 && teamPhone.startsWith("1")) teamPhone = "+" + teamPhone;
        const teamMember = INTERNAL_TEAM[teamPhone];
        const lastMontyMsg = (conversationHistory || "").split("\n").filter((l) => l.startsWith("Monty (you):")).pop() || "";
        let userPrompt;
        if (teamMember) {
          userPrompt = `${teamMember.greeting} This is a message from ${teamMember.name} (${teamMember.role} at NUI \u2014 internal team, NOT a prospect or client).

Their message: "${incomingMessage}"

Respond casually and helpfully as Monty. Short reply. No sales pitch. No NEPQ. Just be useful and human. If they're testing you or asking about a feature, answer directly.`;
        } else {
          userPrompt = `A contact just texted NUI's business phone:

"${incomingMessage}"

Phone: ${fromNumber}

${clientContext}

Your last reply was: "${lastMontyMsg.replace("Monty (you):", "").trim()}"

IMPORTANT: Do NOT repeat or reword your last reply. Continue the conversation naturally from where it left off. Keep it 1-3 sentences. NEPQ style \u2014 ask one good question or move them forward. If ready to book, include Calendly link.`;
        }
        const [aiResponse, intelResult] = await Promise.all([
          fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, system: AGENCY_SYSTEM_PROMPT, messages: [{ role: "user", content: userPrompt }] })
          }),
          analyzeIntelligence(incomingMessage, conversationHistory, clientContext, ANTHROPIC_API_KEY)
        ]);
        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error("[Monty] AI error:", aiResponse.status, errText);
          return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: "AI service error" }) };
        }
        const aiData = await aiResponse.json();
        let replyText = aiData.content[0]?.text || "Got your message! Let me check and get back to you shortly.";
        if (intelResult.calendly_ready && !contact?.calendly_sent && !replyText.includes("calendly")) {
          replyText += `

\u{1F4C5} Book a free 15-min strategy call: ${CALENDLY_URL}`;
        }
        console.log(`\u{1F916} Monty \u2192 ${fromNumber}: "${replyText.slice(0, 80)}..." | Score:${intelResult.intent_score} | Sentiment:${intelResult.sentiment}`);
        if (OPENPHONE_API_KEY && FROM_NUMBER_ID) {
          const sendRes = await fetch("https://api.openphone.com/v1/messages", {
            method: "POST",
            headers: { "Authorization": OPENPHONE_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ content: replyText, to: [fromNumber], from: FROM_NUMBER_ID })
          });
          if (!sendRes.ok) {
            const err = await sendRes.json();
            console.error("[Monty] OpenPhone send error:", err);
          } else {
            console.log("\u2705 SMS reply sent via OpenPhone");
          }
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const sbH = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" };
        if (SUPABASE_URL && SUPABASE_KEY) {
          const calendaryWasSent = intelResult.calendly_ready && !contact?.calendly_sent;
          await Promise.all([
            // Log inbound message
            fetch(`${SUPABASE_URL}/rest/v1/communications`, {
              method: "POST",
              headers: sbH,
              body: JSON.stringify({ channel: "sms", direction: "inbound", message: incomingMessage, client_id: contactId, metadata: { from: cleanPhone, handler: "sms-monty" }, created_at: now })
            }).catch(() => {
            }),
            // Log outbound reply
            fetch(`${SUPABASE_URL}/rest/v1/communications`, {
              method: "POST",
              headers: sbH,
              body: JSON.stringify({ channel: "sms", direction: "outbound", message: replyText, client_id: contactId, metadata: { to: cleanPhone, handler: "sms-monty", ai_generated: true, intent_score: intelResult.intent_score, sentiment: intelResult.sentiment }, created_at: (/* @__PURE__ */ new Date()).toISOString() })
            }).catch(() => {
            }),
            // Log to activity_log
            contactId ? fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
              method: "POST",
              headers: sbH,
              body: JSON.stringify({ contact_id: contactId, type: "sms", event_type: "monty_sms_reply", direction: "both", content: `Client: "${incomingMessage.slice(0, 100)}" \u2192 Monty: "${replyText.slice(0, 100)}"`, metadata: { from: cleanPhone, ai_generated: true, intent_score: intelResult.intent_score, sentiment: intelResult.sentiment }, read: false, created_at: (/* @__PURE__ */ new Date()).toISOString() })
            }).catch(() => {
            }) : Promise.resolve(),
            // Save intelligence to CRM contact
            saveIntelligence(contactId, intelResult, SUPABASE_URL, SUPABASE_KEY),
            // Mark calendly_sent if we sent it
            calendaryWasSent && contactId ? fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
              method: "PATCH",
              headers: sbH,
              body: JSON.stringify({ calendly_sent: true, calendly_sent_at: now })
            }).catch(() => {
            }) : Promise.resolve(),
            // Reset follow-up stage since they replied
            contactId ? fetch(`${SUPABASE_URL}/rest/v1/crm_contacts?id=eq.${contactId}`, {
              method: "PATCH",
              headers: sbH,
              body: JSON.stringify({ followup_stage: 0, last_replied_at: now })
            }).catch(() => {
            }) : Promise.resolve(),
            // Fire hot lead alert if score >= 7
            intelResult.is_hot && contact ? sendHotLeadAlert(contact, incomingMessage, intelResult.intent_score, intelResult.sentiment, intelResult.bant, SUPABASE_URL, SUPABASE_KEY) : Promise.resolve()
          ]);
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            reply: replyText,
            intelligence: {
              intent_score: intelResult.intent_score,
              sentiment: intelResult.sentiment,
              is_hot: intelResult.is_hot,
              calendly_sent: intelResult.calendly_ready,
              bant: intelResult.bant
            }
          })
        };
      } catch (err) {
        console.error("[Monty] Error:", err);
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message || "SMS processing failed" }) };
      }
    };
  }
});

// netlify/functions/monty-sms.js
var { checkRateLimit, rateLimitResponse } = require_rate_limiter();
var { sanitizePhone, sanitizeText } = require_sanitizer();
var { handler } = require_sms_monty();
var AUTOMATED_PATTERNS = [
  /stripe/i,
  /reply\s+stop\s+to\s+cancel/i,
  /msg&data\s+rates/i,
  /msg\s+frequency\s+varies/i,
  /support\.stripe\.com/i,
  /paypal/i,
  /do\s+not\s+reply/i,
  /no[\s-]?reply/i,
  /verification\s+code/i,
  /your\s+(otp|code)\s+is/i,
  /this\s+is\s+an?\s+automated/i
];
exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const payload = JSON.parse(event.body || "{}");
    const type = payload.type;
    const obj = payload.data?.object || {};
    const direction = obj.direction;
    const body = (obj.body || obj.text || "").trim();
    if (type === "message.delivered" || direction === "outgoing" || direction === "outbound") {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: "outbound_ignored" }) };
    }
    if (AUTOMATED_PATTERNS.some((p) => p.test(body))) {
      console.log("[monty-sms] Blocked automated msg:", body.slice(0, 60));
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: "automated_blocked" }) };
    }
    return handler(event);
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, error: e.message }) };
  }
};
//# sourceMappingURL=monty-sms.js.map
