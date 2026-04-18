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

// netlify/functions/save-moodboard.js
var { requireAdmin } = require_security();
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, PATCH, OPTIONS"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server not configured" }) };
  }
  const dbHeaders = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  if (event.httpMethod === "GET") {
    const { id, clientId } = event.queryStringParameters || {};
    let url = `${SUPABASE_URL}/rest/v1/moodboards?order=updated_at.desc&limit=100`;
    if (id) url = `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${id}&limit=1`;
    else if (clientId) url = `${SUPABASE_URL}/rest/v1/moodboards?client_id=eq.${clientId}&order=updated_at.desc`;
    try {
      const resp = await fetch(url, { headers: dbHeaders });
      if (!resp.ok) {
        const errText = await resp.text();
        if (errText.includes("does not exist")) {
          return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, moodboards: [] }) };
        }
        throw new Error(errText);
      }
      const data = await resp.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, moodboards: data }) };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }
  if (event.httpMethod === "DELETE") {
    const { id } = event.queryStringParameters || {};
    if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing id" }) };
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/moodboards?id=eq.${id}`, {
        method: "DELETE",
        headers: dbHeaders
      });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }
  if (event.httpMethod !== "POST" && event.httpMethod !== "PATCH") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const data = JSON.parse(event.body || "{}");
    const cleanItems = (data.collageItems || []).map((item) => {
      const clean = { ...item };
      if (clean.type === "image" && clean.src && clean.src.startsWith("data:")) {
        clean.src = "[pending-upload]";
        clean._needsUpload = true;
      }
      if (clean.src && clean.src.startsWith("idb://")) {
        clean.src = "[local-only]";
        clean._needsUpload = true;
      }
      delete clean.storageSrc;
      delete clean.src_stored;
      return clean;
    });
    const record = {
      id: data.id || `mb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      client_id: data.clientId || null,
      client_name: data.clientName || "",
      project_id: data.projectId || null,
      title: data.title || "Untitled Moodboard",
      status: data.status || "draft",
      collage_items: cleanItems,
      canvas_background: data.canvasBackground || "#0a0a0a",
      notes: data.notes || "",
      brief_id: data.briefId || null,
      brief_snapshot: data.briefSnapshot || null,
      brand_colors: data.brandColors || [],
      fonts: data.fonts || {},
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    let isUpdate = false;
    if (data.id) {
      const checkResp = await fetch(
        `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${data.id}&limit=1`,
        { headers: dbHeaders }
      );
      const existing = await checkResp.json();
      isUpdate = existing && existing.length > 0;
    }
    let url, method;
    if (isUpdate) {
      url = `${SUPABASE_URL}/rest/v1/moodboards?id=eq.${data.id}`;
      method = "PATCH";
      delete record.id;
      delete record.created_at;
    } else {
      url = `${SUPABASE_URL}/rest/v1/moodboards`;
      method = "POST";
      record.created_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    const resp = await fetch(url, {
      method,
      headers: dbHeaders,
      body: JSON.stringify(record)
    });
    if (!resp.ok) {
      const errText = await resp.text();
      if (errText.includes("does not exist")) {
        return {
          statusCode: 500,
          headers: CORS,
          body: JSON.stringify({
            error: "Table not found. Run this SQL in Supabase:",
            sql: `CREATE TABLE moodboards (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  project_id TEXT,
  title TEXT DEFAULT 'Untitled',
  status TEXT DEFAULT 'draft',
  collage_items JSONB DEFAULT '[]',
  canvas_background TEXT DEFAULT '#0a0a0a',
  notes TEXT DEFAULT '',
  brief_id TEXT,
  brief_snapshot JSONB,
  brand_colors JSONB DEFAULT '[]',
  fonts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS client_briefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  service_type TEXT DEFAULT 'branding',
  responses JSONB DEFAULT '{}',
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
          })
        };
      }
      throw new Error(errText);
    }
    const result = await resp.json();
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, moodboard: result[0] || result })
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
//# sourceMappingURL=save-moodboard.js.map
