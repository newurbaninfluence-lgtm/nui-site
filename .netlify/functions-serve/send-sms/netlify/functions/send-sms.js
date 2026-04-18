var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

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
    function requireAdmin2(event) {
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
      requireAdmin: requireAdmin2,
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
    async function getBrand2(agencyId) {
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
    function hasOpenPhone2(brand) {
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
    module2.exports = { getBrand: getBrand2, getTransporter, getFromAddress, hasSMTP, hasOpenPhone: hasOpenPhone2, buildEmailFooter, buildEmailSignature, buildSmsSystemPrompt, NUI_DEFAULTS };
  }
});

// netlify/functions/send-sms.js
var { requireAdmin } = require_security();
var { getBrand, hasOpenPhone } = require_agency_brand();
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { to, message, clientId, contactId, agency_id } = JSON.parse(event.body || "{}");
    if (!to || !message) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing required fields: to, message" }) };
    }
    const brand = await getBrand(agency_id || null);
    if (agency_id && !hasOpenPhone(brand)) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: "SMS not configured",
          detail: "This agency has not set up their own OpenPhone credentials yet. Go to Settings \u2192 Integrations to add them."
        })
      };
    }
    const isNUI = !agency_id;
    const OPENPHONE_API_KEY = brand.openphone_key || (isNUI ? process.env.OPENPHONE_API_KEY : null);
    const FROM_NUMBER_ID = brand.openphone_number || (isNUI ? process.env.OPENPHONE_PHONE_NUMBER : null);
    if (!OPENPHONE_API_KEY || !FROM_NUMBER_ID) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "OpenPhone not configured. Set OPENPHONE_API_KEY and OPENPHONE_PHONE_NUMBER." }) };
    }
    const resp = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": OPENPHONE_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message,
        to: [to],
        from: FROM_NUMBER_ID
      })
    });
    const result = await resp.json();
    if (!resp.ok) {
      throw new Error(result.message || result.error || `OpenPhone API error: ${resp.status}`);
    }
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await fetch(`${SUPABASE_URL}/rest/v1/communications`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          channel: "sms",
          direction: "outbound",
          message,
          subject: null,
          client_id: contactId || clientId || null,
          metadata: { to, openphone_id: result?.data?.id, from_number_id: FROM_NUMBER_ID },
          created_at: now
        })
      }).catch((err) => console.warn("SMS log to Supabase failed:", err.message));
      const cId = contactId || clientId;
      if (cId) {
        await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            contact_id: cId,
            type: "sms",
            event_type: "sms_sent",
            direction: "outbound",
            content: message,
            metadata: { to, openphone_id: result?.data?.id },
            created_at: now
          })
        }).catch((err) => console.warn("Activity log failed:", err.message));
      }
    }
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, messageId: result?.data?.id || "sent" })
    };
  } catch (err) {
    console.error("send-sms error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || "SMS send failed" })
    };
  }
};
//# sourceMappingURL=send-sms.js.map
