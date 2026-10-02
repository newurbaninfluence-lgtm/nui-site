// netlify/functions/utils/primary-site.js
// ─────────────────────────────────────────────────────────────────────────────
// Stops scheduled jobs from running twice.
//
// The nui-site repo is deployed to TWO Netlify sites: the main site
// (newurbaninfluence.com) and nui-portal (portal.newurbaninfluence.com).
// Netlify fires every scheduled function on BOTH, so every agent, drip,
// reminder and billing job ran twice (watchdog logged two runs a day, one of
// them without SMTP credentials).
//
// Rule: scheduled runs only execute on the main site. A scheduled run on the
// portal returns early. Manual/HTTP invocations are never blocked here, and
// the main site is never blocked: we only skip when a signal POSITIVELY
// identifies the portal.
// ─────────────────────────────────────────────────────────────────────────────

const PORTAL_MARKERS = [
  'portal.newurbaninfluence.com',
  'nui-portal',
  'e62d5e64-a5b7-4f5d-a7dd-2a463fdd4bf5', // nui-portal Netlify site id
];

function siteSignals(event) {
  const h = (event && event.headers) || {};
  return [
    process.env.URL,
    process.env.DEPLOY_URL,
    process.env.SITE_NAME,
    process.env.SITE_ID,
    event && event.rawUrl,
    h.host,
    h['x-forwarded-host'],
  ].filter(Boolean).map(String).join(' ').toLowerCase();
}

function isPortalSite(event) {
  const s = siteSignals(event);
  return PORTAL_MARKERS.some((m) => s.includes(m));
}

function isScheduledInvocation(event) {
  const h = (event && event.headers) || {};
  if (String(h['x-nf-event'] || h['X-Nf-Event'] || '').toLowerCase() === 'schedule') return true;
  try { return !!JSON.parse((event && event.body) || '{}').next_run; } catch { return false; }
}

// Returns a response to short-circuit with, or null to continue.
function skipIfDuplicateSchedule(event, name) {
  if (isScheduledInvocation(event) && isPortalSite(event)) {
    console.log(`[${name}] skipped: scheduled run on nui-portal; the main site runs schedules`);
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'scheduled run on secondary site' }) };
  }
  return null;
}

module.exports = { skipIfDuplicateSchedule, isPortalSite, isScheduledInvocation };
