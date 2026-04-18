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

// netlify/functions/admin-contact-update.js
var { requireAdmin } = require_security();
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS_HEADERS, body: "{}" };
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "No DB" }) };
  const supaHeaders = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
  };
  try {
    const { phone, first_name, last_name, email, company, action } = JSON.parse(event.body || "{}");
    if (action === "find") {
      const digits2 = (phone || "").replace(/\D/g, "").slice(-10);
      const e1642 = `+1${digits2}`;
      const resp2 = await fetch(
        `${SUPABASE_URL}/rest/v1/crm_contacts?or=(phone.eq.${encodeURIComponent(phone)},phone.eq.${encodeURIComponent(e1642)})&select=*&limit=5`,
        { headers: supaHeaders }
      );
      const rows = await resp2.json();
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ contacts: rows }) };
    }
    if (!phone) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Phone required" }) };
    const digits = phone.replace(/\D/g, "").slice(-10);
    const e164 = `+1${digits}`;
    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (company) updates.company = company;
    updates.last_activity_at = (/* @__PURE__ */ new Date()).toISOString();
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_contacts?or=(phone.eq.${encodeURIComponent(phone)},phone.eq.${encodeURIComponent(e164)})`,
      {
        method: "PATCH",
        headers: { ...supaHeaders, "Prefer": "return=representation" },
        body: JSON.stringify(updates)
      }
    );
    const result = await resp.json();
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ updated: result }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=admin-contact-update.js.map
