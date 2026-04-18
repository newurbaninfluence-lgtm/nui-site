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

// netlify/functions/image-search.js
var { requireAdmin } = require_security();
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};
var PIXABAY_COLORS = {
  red: "red",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  teal: "turquoise",
  blue: "blue",
  purple: "lilac",
  black: "black",
  white: "white"
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") return { statusCode: 405, headers: CORS, body: '{"error":"Method not allowed"}' };
  const p = event.queryStringParameters || {};
  const query = p.query;
  if (!query) return { statusCode: 400, headers: CORS, body: '{"error":"Missing query"}' };
  const color = p.color || "";
  const perPage = Math.min(parseInt(p.per_page) || 15, 30);
  const PX = process.env.PEXELS_API_KEY;
  const UN = process.env.UNSPLASH_ACCESS_KEY;
  const PB = process.env.PIXABAY_API_KEY;
  const results = [];
  if (PX) {
    try {
      let u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) u += `&color=${encodeURIComponent(color)}`;
      const r = await fetch(u, { headers: { Authorization: PX } });
      if (r.ok) {
        const d = await r.json();
        (d.photos || []).forEach((x) => results.push({
          id: "pexels-" + x.id,
          source: "pexels",
          thumb: x.src.tiny,
          medium: x.src.medium,
          large: x.src.large2x || x.src.large,
          width: x.width,
          height: x.height,
          alt: x.alt || query,
          photographer: x.photographer,
          color: x.avg_color || "",
          url: x.url
        }));
      }
    } catch (e) {
      console.warn("Pexels:", e.message);
    }
  }
  if (UN) {
    try {
      let u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`;
      if (color) u += `&color=${encodeURIComponent(color)}`;
      const r = await fetch(u, { headers: { Authorization: `Client-ID ${UN}` } });
      if (r.ok) {
        const d = await r.json();
        (d.results || []).forEach((x) => results.push({
          id: "unsplash-" + x.id,
          source: "unsplash",
          thumb: x.urls.thumb,
          medium: x.urls.small,
          large: x.urls.regular,
          width: x.width,
          height: x.height,
          alt: x.alt_description || query,
          photographer: x.user?.name || "",
          color: x.color || "",
          url: x.links?.html || ""
        }));
      }
    } catch (e) {
      console.warn("Unsplash:", e.message);
    }
  }
  if (PB) {
    try {
      let u = `https://pixabay.com/api/?key=${PB}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo`;
      if (color && PIXABAY_COLORS[color]) u += `&colors=${PIXABAY_COLORS[color]}`;
      const r = await fetch(u);
      if (r.ok) {
        const d = await r.json();
        (d.hits || []).forEach((x) => results.push({
          id: "pixabay-" + x.id,
          source: "pixabay",
          thumb: x.previewURL,
          medium: x.webformatURL,
          large: x.largeImageURL,
          width: x.imageWidth,
          height: x.imageHeight,
          alt: x.tags || query,
          photographer: x.user || "",
          color: "",
          url: x.pageURL
        }));
      }
    } catch (e) {
      console.warn("Pixabay:", e.message);
    }
  }
  if (!PX && !UN && !PB) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({
      photos: [],
      error: "No image API keys configured. Set PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, and/or PIXABAY_API_KEY."
    }) };
  }
  return { statusCode: 200, headers: CORS, body: JSON.stringify({
    photos: results,
    total: results.length,
    query,
    color: color || null,
    sources: { pexels: !!PX, unsplash: !!UN, pixabay: !!PB }
  }) };
};
//# sourceMappingURL=image-search.js.map
