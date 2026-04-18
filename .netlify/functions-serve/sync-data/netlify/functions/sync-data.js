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

// netlify/functions/sync-data.js
var { requireAdmin } = require_security();
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
var ALL_TYPES = [
  "orders",
  "clients",
  "invoices",
  "subscriptions",
  "proofs",
  "projects",
  "leads",
  "services",
  "meetings",
  "submissions",
  "designer_messages",
  "client_messages",
  "site_images",
  "about",
  "portfolio",
  "stripe_settings",
  "integrations",
  "analytics",
  "crm",
  "comm_hub"
];
async function supabaseFetch(url, serviceKey, path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  return fetch(`${url}/rest/v1/${path}`, {
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...extraHeaders || {}
    },
    ...restOptions
  });
}
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Supabase not configured" })
    };
  }
  try {
    if (event.httpMethod === "GET") {
      const syncData = {};
      const agency_id = event.queryStringParameters?.agency_id || null;
      const typeList = ALL_TYPES.map((t) => {
        const key = agency_id ? `${t}:${agency_id}` : t;
        return `"${key}"`;
      }).join(",");
      const resp = await supabaseFetch(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        `site_config?select=key,value&key=in.(${typeList})`
      );
      if (resp.ok) {
        const rows = await resp.json();
        const rowMap = {};
        rows.forEach((r) => {
          const baseKey = agency_id ? r.key.replace(`:${agency_id}`, "") : r.key;
          rowMap[baseKey] = r.value;
        });
        ALL_TYPES.forEach((type) => {
          if (rowMap[type] !== void 0) {
            syncData[type] = {
              data: rowMap[type],
              count: Array.isArray(rowMap[type]) ? rowMap[type].length : 1,
              lastSync: (/* @__PURE__ */ new Date()).toISOString()
            };
          } else {
            syncData[type] = { data: Array.isArray([]) ? [] : null, count: 0 };
          }
        });
      } else {
        const errText = await resp.text();
        console.warn("Bulk fetch failed:", resp.status, errText);
        ALL_TYPES.forEach((type) => {
          syncData[type] = { data: [], count: 0, error: `${resp.status}` };
        });
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, syncData, syncedAt: (/* @__PURE__ */ new Date()).toISOString() })
      };
    }
    if (event.httpMethod === "POST") {
      const { type, data, syncedBy, agency_id } = JSON.parse(event.body || "{}");
      if (!type || data === void 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Missing type or data" })
        };
      }
      if (!ALL_TYPES.includes(type)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: `Unknown type: ${type}` })
        };
      }
      const scopedKey = agency_id ? `${type}:${agency_id}` : type;
      const resp = await supabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_KEY, "site_config", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          key: scopedKey,
          value: data,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Upsert failed for ${type}: ${resp.status} - ${errBody}`);
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          type,
          count: Array.isArray(data) ? data.length : 1,
          syncedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      };
    }
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  } catch (err) {
    console.error("sync-data error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || "Sync failed" })
    };
  }
};
//# sourceMappingURL=sync-data.js.map
