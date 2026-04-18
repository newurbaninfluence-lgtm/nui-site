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
    function sanitizeEmail2(email) {
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
    module2.exports = { sanitizeText: sanitizeText2, sanitizeEmail: sanitizeEmail2, sanitizePhone: sanitizePhone2, sanitizeUUID, sanitizeUrl, validateRequired, stripHtml };
  }
});

// netlify/functions/submit-lead.js
var { checkRateLimit, getClientIP, rateLimitResponse } = require_rate_limiter();
var { sanitizeText, sanitizeEmail, sanitizePhone } = require_sanitizer();
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
var OPENPHONE_KEY = process.env.OPENPHONE_API_KEY;
async function supabase(path, body, method = "POST") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(body)
  });
  return r.json().catch(() => ({}));
}
var SERVICE_MAP = {
  "brand-kit": { tag: "Brand Kit", seq: "brand_kit", industry: "branding" },
  "service-brand": { tag: "Service Brand", seq: "branding", industry: "branding" },
  "product-brand": { tag: "Product Brand", seq: "branding", industry: "branding" },
  "digital-hq": { tag: "Digital HQ", seq: "web_design", industry: "web" },
  "digital-staff": { tag: "Digital Staff", seq: "ai_staff", industry: "ai" },
  "street-team": { tag: "Street Team", seq: "marketing", industry: "marketing" },
  "publicist": { tag: "The Publicist", seq: "press", industry: "press" },
  "event-team": { tag: "Event Team", seq: "events", industry: "events" }
};
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const ip = getClientIP(event);
  const rl = checkRateLimit(`submit-lead:${ip}`, 5, 6e4);
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);
  let raw;
  try {
    raw = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }
  const data = {
    name: sanitizeText(raw.name, 100),
    email: sanitizeEmail(raw.email),
    phone: sanitizePhone(raw.phone),
    business: sanitizeText(raw.business, 150),
    service: sanitizeText(raw.service, 50),
    serviceName: sanitizeText(raw.serviceName, 100),
    price: sanitizeText(raw.price, 50),
    bookingChoice: sanitizeText(raw.bookingChoice, 20),
    optinEmail: Boolean(raw.optinEmail),
    optinSMS: Boolean(raw.optinSMS),
    optinPush: Boolean(raw.optinPush),
    source: sanitizeText(raw.source, 100),
    timestamp: raw.timestamp
  };
  const {
    name,
    email,
    phone,
    business,
    service,
    serviceName,
    price,
    bookingChoice,
    optinEmail,
    optinSMS,
    optinPush,
    source,
    timestamp
  } = data;
  const extras = {};
  if (!email && !phone) return { statusCode: 400, body: JSON.stringify({ error: "Email or phone required" }) };
  const svcInfo = SERVICE_MAP[service] || { tag: serviceName || service, seq: "general", industry: "general" };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const isCold = !data.returning || data.returning === "no";
  const leadPayload = {
    name: name || "",
    email: email || "",
    phone: phone || "",
    business_name: business || "",
    service: service || "",
    service_name: serviceName || "",
    price_point: price || "",
    booking_choice: bookingChoice || "",
    optin_email: optinEmail === true || optinEmail === "yes",
    optin_sms: optinSMS === true || optinSMS === "yes",
    optin_push: optinPush === true || optinPush === "yes",
    source_url: source || "",
    is_cold: isCold,
    industry: svcInfo.industry,
    drip_sequence: svcInfo.seq,
    extra_data: JSON.stringify(extras),
    created_at: now,
    site_id: "newurbaninfluence"
  };
  await supabase("leads", leadPayload).catch(() => {
  });
  if (optinSMS === true || optinSMS === "yes") {
    await supabase("sms_optins", {
      phone: phone || "",
      name: name || "",
      email: email || "",
      service: service || "",
      consent_text: "User opted in to receive SMS tips, discounts, and updates from New Urban Influence via service intake form",
      consent_source: source || "service-intake-form",
      consent_timestamp: now,
      optin_method: "web_form",
      status: "active",
      site_id: "newurbaninfluence"
    }).catch(() => {
    });
  }
  if (optinPush === true || optinPush === "yes") {
    await supabase("push_optins_log", {
      email: email || "",
      phone: phone || "",
      service: service || "",
      source: source || "",
      created_at: now,
      site_id: "newurbaninfluence"
    }).catch(() => {
    });
  }
  await supabase("crm_contacts", {
    name: name || "",
    email: email || "",
    phone: phone || "",
    business_name: business || "",
    tags: [svcInfo.tag, isCold ? "Cold Lead" : "Warm Lead", bookingChoice === "call" ? "Wants Call" : "Ready to Pay"],
    source: "service-page-intake",
    service_interest: service || "",
    optin_email: optinEmail === true || optinEmail === "yes",
    optin_sms: optinSMS === true || optinSMS === "yes",
    status: "new_lead",
    site_id: "newurbaninfluence",
    created_at: now
  }).catch(() => {
  });
  if (optinEmail === true || optinEmail === "yes") {
    const dripSeq = isCold ? `cold_warmup` : svcInfo.seq;
    await supabase("drip_enrollments", {
      email: email || "",
      name: name || "",
      sequence_id: dripSeq,
      service: service || "",
      enrolled_at: now,
      status: "active",
      site_id: "newurbaninfluence"
    }).catch(() => {
    });
  }
  if (OPENPHONE_KEY && phone) {
    try {
      await fetch("https://api.openphone.com/v1/messages", {
        method: "POST",
        headers: { Authorization: OPENPHONE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `\u{1F525} NEW INTAKE \u2014 ${serviceName || service}
Name: ${name || "Unknown"}
Phone: ${phone}
Email: ${email || ""}
Business: ${business || ""}
Choice: ${bookingChoice || "N/A"}
SMS Opt-in: ${optinSMS ? "YES" : "no"}
Email Opt-in: ${optinEmail ? "YES" : "no"}`,
          from: process.env.OPENPHONE_FROM || "+12484878747",
          to: ["+12484878747"]
        })
      });
    } catch (e) {
    }
  }
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ ok: true, message: "Lead submitted successfully" })
  };
};
//# sourceMappingURL=submit-lead.js.map
