// log-safe.js — PII-masking helpers for safe logging
// Use these instead of logging raw emails, phones, names, or message bodies.
// Logs land in Netlify function logs / process logs, so never print PII directly.

function maskEmail(v) {
  if (v == null) return v;
  const s = String(v);
  const at = s.indexOf('@');
  if (at < 1) return s ? s[0] + '***' : '[empty]';
  const domain = s.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  const tld = dot >= 0 ? domain.slice(dot) : '';
  return s[0] + '***@***' + tld;
}

function maskPhone(v) {
  if (v == null) return v;
  const digits = String(v).replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return '****' + digits.slice(-4);
}

function maskName(v) {
  if (v == null) return v;
  const s = String(v).trim();
  if (!s) return '[empty]';
  return s.split(/\s+/).map(p => (p ? p[0].toUpperCase() + '***' : '')).join(' ').trim();
}

// redact(value, keep) — for message bodies / free text.
// keep>0 retains a short prefix for debugging; default hides everything but length.
function redact(v, keep = 0) {
  if (v == null) return '[empty]';
  const s = String(v);
  if (keep > 0 && s.length > keep) return s.slice(0, keep) + '…[+' + (s.length - keep) + ' redacted]';
  return '[redacted ' + s.length + ' chars]';
}

// scrub(str) — mask any emails or phone-like digit runs embedded in a free-form string.
function scrub(v) {
  if (v == null) return v;
  let s = String(v);
  s = s.replace(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g, m => maskEmail(m));
  s = s.replace(/\+?\d[\d\s().\-]{6,}\d/g, m => maskPhone(m));
  return s;
}

module.exports = { maskEmail, maskPhone, maskName, redact, scrub };
