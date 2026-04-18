// netlify/functions/rate-limiter.js
var _store = /* @__PURE__ */ new Map();
function checkRateLimit(key, maxRequests = 10, windowMs = 6e4) {
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
function rateLimitResponse(resetIn) {
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
module.exports = { checkRateLimit, getClientIP, rateLimitResponse };
//# sourceMappingURL=rate-limiter.js.map
