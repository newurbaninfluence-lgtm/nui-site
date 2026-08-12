// netlify/functions/billing-enforcer.js
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 of the billing lifecycle. stripe-webhook.js marks sites 'overdue'
// and stamps grace_until; this cron is what actually acts on that.
//
//   SUSPEND: billing_status='overdue' AND grace_until < now()  → status='suspended'
//   RESTORE: billing_status='active'  AND status='suspended'   → status='active'
//
// Restore only un-suspends sites WE suspended for non-payment. A site suspended
// by hand for any other reason keeps its suspended_reason and is left alone.
// The reason string deliberately matches stripe-webhook.js isNonpaymentReason()
// (/^payment[ _]overdue/i) so the webhook can also auto-clear it on payment.
//
// Safety rails:
//   - BILLING_ENFORCER_DRY_RUN=1 logs intended actions without writing.
//   - reminders_enabled=false exempts a site from automated suspension.
//   - Every run is written to agent_logs for the watchdog to see.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.BILLING_ENFORCER_DRY_RUN === '1';

// Marker so we only auto-restore what we auto-suspended.
// MUST satisfy stripe-webhook.js isNonpaymentReason() → /^payment[ _]overdue/i
const AUTO_REASON = 'Payment overdue — automatic suspension after grace period';
const AUTO_REASON_RE = /^payment[ _]overdue/i;

function sbHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function sbGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`Supabase GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function sbPatch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: { ...sbHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function logRun(status, metadata) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/agent_logs`, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({ agent_id: 'billing_enforcer', status, metadata }),
    });
  } catch (e) {
    console.warn('[billing-enforcer] could not write agent_logs:', e.message);
  }
}

exports.handler = async () => {
  const summary = { suspended: [], restored: [], skipped: [], errors: [] };

  if (!SUPABASE_URL || !SERVICE_KEY) {
    const msg = 'Missing SUPABASE_URL or service key';
    await logRun('error', { error: msg });
    return { statusCode: 500, body: JSON.stringify({ error: msg }) };
  }

  const nowIso = new Date().toISOString();

  try {
    // ── SUSPEND: overdue and past the grace window ──────────────────────────
    const toSuspend = await sbGet(
      'client_sites' +
        '?select=id,site_id,site_name,client_name,status,billing_status,grace_until,reminders_enabled' +
        '&billing_status=eq.overdue' +
        `&grace_until=lt.${encodeURIComponent(nowIso)}` +
        '&status=neq.suspended'
    );

    for (const site of toSuspend) {
      // Opt-out valve: reminders_enabled=false means "leave this one to me".
      if (site.reminders_enabled === false) {
        summary.skipped.push({ site: site.site_id, why: 'reminders_disabled' });
        continue;
      }
      if (DRY_RUN) {
        summary.suspended.push({ site: site.site_id, dry_run: true });
        continue;
      }
      try {
        await sbPatch(`client_sites?id=eq.${site.id}`, {
          status: 'suspended',
          suspended_at: nowIso,
          suspended_reason: AUTO_REASON,
        });
        summary.suspended.push({ site: site.site_id, grace_expired: site.grace_until });
        console.log(`[billing-enforcer] SUSPENDED ${site.site_id} (grace ended ${site.grace_until})`);
      } catch (e) {
        summary.errors.push({ site: site.site_id, action: 'suspend', error: e.message });
      }
    }

    // ── RESTORE: payment landed, bring it back ──────────────────────────────
    const toRestore = await sbGet(
      'client_sites' +
        '?select=id,site_id,site_name,status,billing_status,suspended_reason' +
        '&billing_status=eq.active' +
        '&status=eq.suspended'
    );

    for (const site of toRestore) {
      // Only reverse suspensions taken for non-payment. Manual ones stay put.
      if (!AUTO_REASON_RE.test((site.suspended_reason || '').trim())) {
        summary.skipped.push({ site: site.site_id, why: 'manually_suspended' });
        continue;
      }
      if (DRY_RUN) {
        summary.restored.push({ site: site.site_id, dry_run: true });
        continue;
      }
      try {
        await sbPatch(`client_sites?id=eq.${site.id}`, {
          status: 'active',
          suspended_at: null,
          suspended_reason: null,
        });
        summary.restored.push({ site: site.site_id });
        console.log(`[billing-enforcer] RESTORED ${site.site_id} — payment received`);
      } catch (e) {
        summary.errors.push({ site: site.site_id, action: 'restore', error: e.message });
      }
    }

    const status = summary.errors.length ? 'partial' : 'success';
    await logRun(status, {
      dry_run: DRY_RUN,
      suspended: summary.suspended.length,
      restored: summary.restored.length,
      skipped: summary.skipped.length,
      errors: summary.errors,
      detail: summary,
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true, dry_run: DRY_RUN, ...summary }) };
  } catch (e) {
    console.error('[billing-enforcer] fatal:', e);
    await logRun('error', { error: e.message });
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
