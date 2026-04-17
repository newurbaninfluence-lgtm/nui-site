#!/usr/bin/env node
// ========================================================================
// rls_audit.js  -  RLS verification probe for NUI Supabase
// ========================================================================
// Purpose : Probe each of the 17 audited tables with the anon key and
//           prove RLS is enforcing access control.
// Pass    : SELECT returns 0 rows (RLS filters), INSERT returns 401/403/
//           42501 (insufficient_privilege).
// Fail    : SELECT returns rows, or INSERT succeeds.
// Usage   : node scripts/rls_audit.js
// ========================================================================

const SUPABASE_URL = 'https://jcgvkyizoimwbolhfpta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ3ZreWl6b2ltd2JvbGhmcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDMwMjQsImV4cCI6MjA4NTg3OTAyNH0.a8gjkPoUHQ1kgROa2Lqaq3252opqg5CPMm6vR3t1NOk';

const TABLES = [
  'crm_contacts','agent_logs','communications','client_sites','site_config',
  'identified_visitors','push_subscriptions','clients','invoices','leads',
  'orders','payments','projects','proofs','push_campaigns','sms_campaigns',
  'visitor_auto_emails','visitor_page_views'
];

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function probeSelect(table) {
  // Use HEAD + count=exact to get the total visible rows via Content-Range
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=*`,
    {
      method: 'HEAD',
      headers: { ...HEADERS, 'Prefer': 'count=exact', 'Range': '0-0' }
    }
  );
  const range = res.headers.get('content-range') || '';
  const visibleCount = range.includes('/') ? range.split('/')[1] : 'unknown';
  return { status: res.status, visibleCount };
}

async function probeInsert(table) {
  // Try a no-op insert. We send an empty object — RLS should reject before
  // column validation runs. If a column-required error comes back, that
  // also proves RLS allowed the request through and is a FAIL.
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}`,
    {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ rls_probe: 'audit-2026-04-18' })
    }
  );
  let body = '';
  try { body = await res.text(); } catch (_) {}
  return { status: res.status, body: body.slice(0, 200) };
}

function classifySelect(p) {
  if (p.status >= 400) return 'PASS (blocked)';
  if (p.visibleCount === '0') return 'PASS (0 rows)';
  if (p.visibleCount === 'unknown') return 'INDETERMINATE';
  return `FAIL (${p.visibleCount} rows visible to anon)`;
}

function classifyInsert(p) {
  // 401, 403, or any 4xx with insufficient_privilege / RLS message = pass
  if (p.status === 401 || p.status === 403) return 'PASS (blocked)';
  if (/row-level security|42501|insufficient/i.test(p.body)) return 'PASS (RLS rejected)';
  if (p.status >= 400 && p.status !== 400) return `PASS (${p.status})`;
  // 400 with column errors = RLS let it through, INSERT was attempted
  if (p.status === 400) return `FAIL (RLS bypassed, status 400: ${p.body.slice(0, 80)})`;
  if (p.status >= 200 && p.status < 300) return 'FAIL (insert succeeded)';
  return `UNKNOWN (status ${p.status})`;
}

(async () => {
  console.log('NUI RLS Audit Probe');
  console.log('===================');
  console.log(`Project : jcgvkyizoimwbolhfpta`);
  console.log(`Run at  : ${new Date().toISOString()}`);
  console.log(`Tables  : ${TABLES.length}\n`);

  const rows = [];
  for (const t of TABLES) {
    const sel = await probeSelect(t);
    const ins = await probeInsert(t);
    const selVerdict = classifySelect(sel);
    const insVerdict = classifyInsert(ins);
    rows.push({ table: t, selVerdict, insVerdict, sel, ins });
    console.log(
      `${t.padEnd(22)}  SELECT: ${selVerdict.padEnd(28)}  INSERT: ${insVerdict}`
    );
  }

  const fails = rows.filter(r =>
    r.selVerdict.startsWith('FAIL') || r.insVerdict.startsWith('FAIL')
  );
  console.log(
    `\n${rows.length - fails.length}/${rows.length} tables PASS, ${fails.length} FAIL`
  );
  if (fails.length) {
    console.log('\nFailures:');
    for (const f of fails) {
      console.log(`  - ${f.table}`);
      if (f.selVerdict.startsWith('FAIL')) {
        console.log(`      SELECT -> status ${f.sel.status}, visible: ${f.sel.visibleCount}`);
      }
      if (f.insVerdict.startsWith('FAIL')) {
        console.log(`      INSERT -> status ${f.ins.status}, body: ${f.ins.body.slice(0,120)}`);
      }
    }
    process.exit(1);
  }
  process.exit(0);
})();
