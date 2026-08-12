# NUI PROJECT STATE

**Last updated:** 2026-08-12
**Mission:** Finish the platform. Stop building. Sell.

> **READ THIS FIRST at the start of every session.** It is the single source of
> truth for where things stand. Update it at the end of every working session —
> move items between sections, add new gotchas, record decisions.
> Location: `~/nui-site/PROJECT-STATE.md` (committed to git).

---

## 🎯 CURRENT FOCUS

Working the **Ship List** (`/mnt/user-data/outputs/NUI-Ship-List.md`, also summarized below).
**Rule in force: nothing new until the ship list is empty.**

The platform is ~90% built and has been for months. The failure mode is adding
capability instead of closing defects. Resist it.

---

## ✅ DONE (verified working — do not re-litigate)

### Email — transactional (Hostinger)
- 6 aliases live on `info@newurbaninfluence.com` mailbox (6/50 used):
  `billing@` `orders@` `bookings@` `hello@` `support@` `notifications@`
- Functions repointed to send from the right alias, Reply-To → `info@`
- **All 6 tested end-to-end** — landed in inbox, correct From
- SMTP auth still logs in as `info@`; only the From label changed
- Commit `ff77368`

### Billing — reminders
- 3-day lead time (`REMINDER_DAYS_BEFORE=3`), daily cron 16:00 UTC
- Email shows list price → discount → amount due
- 48-hour grace warning in email + SMS
- Billing groups: sites sharing `billing_group` get ONE combined reminder
- Idempotent per due date via `reminder_sent_for`
- Commit `3b38b9c`

### Billing — enforcement (Phase 2)
- `billing-enforcer.js`, daily cron 17:00 UTC (1hr after reminders)
- SUSPEND when `billing_status='overdue'` AND `grace_until` passed
- RESTORE when `billing_status='active'` again
- Only reverses reasons matching `/^payment[ _]overdue/i` — **manual suspensions never auto-clear**
- `reminders_enabled=false` opts a site out
- `BILLING_ENFORCER_DRY_RUN=1` to test safely
- `GRACE_PERIOD_DAYS` 7 → **2** (matches the 48hr promise)
- Dry-run against live data: clean, no false positives
- Commit `c67bd0b`

### Security — CRITICAL FIX
- `agency_subaccounts` had policy "Service key full access" scoped to **public** role,
  `ALL` commands, `USING(true)`. The anon key ships in public JS (`agency-tenant.js`),
  so **tenant passwords + SMTP password were publicly readable AND writable.**
- Locked to `service_role` only. Verified: anon read → `[]`, anon write → 401.
- `client_sites` public read still works (site suspension depends on it).
- ⚠️ **OUTSTANDING: rotate SMTP password `newurban`** — it was exposed.

---

## 🔴 OPEN — SHIP LIST

### Blockers
- [ ] **Rotate exposed SMTP password** (`newurban`) — was publicly readable
- [ ] ~~B1 auth rebuild~~ → **DESCOPED.** Not reselling yet, no live tenants.
      Required before reselling the platform, not before selling to own clients.
- [ ] ~~B2 tenant isolation~~ → **DESCOPED**, same reason.
- [x] ~~B3 Stripe → billing → features~~ → **DONE**, was already 90% built.

### High
- [ ] **H2 — Blogger agent: 75 consecutive failures.** Two bugs:
      1. `Blog JSON parse failed: ```json` — strip markdown fences before JSON.parse
      2. `duplicate key blog_posts_slug_key` — append date/counter to slug
      Effort: 30 min
- [ ] **H4 — Watchdog function.** Read `agent_logs`, alert on consecutive failures
      or an agent silent past its schedule. (H2 ran broken 2 weeks unnoticed.)
      Effort: 2 hrs. High leverage.
- [ ] **H1 — ShootOS: clients save but don't display.**
      VERIFIED: write works (`clients` table, correct `site_id='ajvip'`).
      Root cause is READ path. `shootos_*` tables are all **0 rows**;
      unprefixed tables hold everything. Half-finished rename.
      Fix: point all reads at unprefixed tables, drop `shootos_*` duplicates.
      Effort: 2-3 hrs
- [ ] **H3 — Client billing data.** Only Sonya has email + due date.
      11 other sites have neither → reminders skip them silently.
      **BLOCKED ON FAREN** — needs email, phone, billing day per client.

### Medium
- [ ] M1 — `crm-api.js` has hardcoded `const SITE_ID = 'ajvip'`
- [ ] M2 — Client-prefixed tables break portability (`uhc_site_settings` w/ `id:1`, `shootos_*`)
- [ ] M3 — Delete orphan Netlify site `pen-mindstate` (`11aee525-...`);
      live one is `penmindstate` (`cdb80538-...`) which holds the domain
- [ ] M4 — Remove 8 `.bak` files in `netlify/functions/` + `_to_delete/` folder
- [ ] M5 — Instagram promoter pillar rotation: `post_analytics` empty →
      always defaults to `PILLARS[0]`. Needs round-robin fallback.

---

## 📋 DECISIONS MADE (don't re-open)

| Decision | Detail |
|---|---|
| **Pricing tiers** | $50 Website · $150 System · $297 System Pro · Marketing from $500/mo + ad spend |
| **"Website" vs "System"** | Never call the $150 tier "hosting" — it invites the $8 GoDaddy comparison. It's business software. |
| **Grace period** | 48 hours, then suspend. (Faren wanted 4hrs; 48 chosen as firm but survivable.) |
| **Billing date** | Sonya = 15th of month. Others TBD. |
| **Sonya pricing** | $300 list − $100 loyalty discount = $200/mo for BOTH sites, one invoice |
| **Damon reactivation** | Two paths: $50 hosting-only or $150 full system. Back balance wiped. Emails drafted, NOT sent. |
| **Resend** | Free plan, 1 domain. `notify.newurbaninfluence.com` added, DNS published, verification pending. Marketing/bulk only. |
| **Cold outreach domain** | NOT needed — list is warm (Bravo clients, manual adds), 50-100/day |
| **RB2B** | Not paid for, not running. `visitor-auto-email.js` dormant. |
| **MSaaS / trust detroit** | Dormant tenants, not reselling yet |
| **Client repos** | **READ-ONLY. Never alter client code or databases without explicit per-task approval.** |

---

## ⚠️ GOTCHAS (learned the hard way)

- **Netlify CLI mangles JSON payloads** on `api createDnsRecord` → use `curl` directly
- **Netlify env vars**: use account-scoped endpoint with slug `info-ivxkgvq`;
  PATCH rejects `context:"all"` → use **PUT** with the full object
- **Netlify digest deploys** need BOTH `files` (SHA1) and `functions` (SHA256) manifests
  or serverless functions are silently dropped
- **`NODE_ENV=production`** in shell silently skips devDependencies — `unset NODE_ENV`
- **Supabase mgmt API is blocked from the Claude sandbox** — use Desktop Commander or MCP
- **`create_file`/`str_replace` write to the CONTAINER, not the Mac.**
  Use `Desktop Commander:write_file` / `edit_block` for anything on Faren's machine.
- **`features` flags in `client_sites` are load-bearing** — `feature-gate.js` reads them.
  They are NOT decorative. But they're also NOT reliably maintained. Verify against reality.
- **`client_sites` DB record can be stale** — PenMindState had blank `netlify_site_id`
  and `github_repo` despite both existing. Don't trust it; verify.
- **No Netlify Functions ≠ no backend.** PenMindState talks to Supabase directly
  from the browser. Check the app bundle, not just the functions list.
- **NUI Magazine JS rule:** always validate `magazine-article.js` / `magazine-data.js`
  with `node -e "new Function(require('fs').readFileSync(FILE,'utf8'))"` before commit.
  Rewrite the full file clean if >3 edits — never append partial fragments.

---

## 🗺 WHAT EXISTS (stop rebuilding it)

**nui-site:** 84 netlify functions · 72 `assets/js` admin modules · 122 Supabase tables

Key pieces already built:
- `feature-gate.js` — **fully generic, portable, handles suspend/cancel/unpaid/paused/trial
  + per-feature flags with 5-min cache. THIS IS THE TIER SYSTEM. Done.**
- `stripe-webhook.js` — 11 event types, full billing lifecycle
- `agency-tenant.js` / `agency-config.js` / `agency-isolation.js` — multi-tenant portal,
  role picker (Admin/Designer/Client), white-label, module toggles
- `configs/msaas-config.js` — working example of the per-client config object
- 72 admin panels: CRM, leads, invoices, payments, orders, projects, SMS campaigns,
  social planner, push, retargeting, smart lists, brand guide, media manager, designer
- `docs/SAAS-ARCHITECTURE-PROPOSAL.md` — March 2026 strategist analysis, still accurate

**Harvestable from client repos (READ-ONLY):**
- ShootOS (23 fns): `crm-api` `lead-capture` `booking-confirm` `create-checkout`
  `contract-sign` `invoice-view` `drip-scheduler` `ai-chat`
- UHC (26 fns): `feature-gate` `loyalty` `sms-blast` `sms-campaign` `openphone-*`
  `drip-engine` `staff-auth` `log-safe`
- Hideaway v2: reservations SQL, floor map, SMS verification
- PenMindState: PWA pattern (service worker, manifest, install banner)

**Only genuine gap in the blueprint: drag-and-drop form builder.**

---

## 👥 CLIENT ROSTER — BILLING READINESS

| Client | Site(s) | Fee | Email | Due date | Status |
|---|---|---|---|---|---|
| Sonya Meadows | sonyameadows + vividverse | $200 (300−100) | ✅ Upload@vividversetv.com | ✅ 15th | **READY** |
| Damon Meadows | pen-mindstate | $150 | ✅ info@penmindstate.com | ❌ | SUSPENDED, reactivation drafted |
| Malcolm Cason | uhc | ? | ❌ | ❌ | needs data |
| Roz Reynolds | hideaway | ? | ❌ | ❌ | needs data |
| AJ Grant | shoot-os | ? | ❌ | ❌ | needs data |
| Chris | smile-for-me | ? | ❌ | ❌ | needs data |
| Ashley Mathaw | backyard comedy | ? | ❌ | ❌ | needs data |
| Larry Castleberry | larrycastleberry | ? | ❌ | ❌ | needs data |
| Elevated Dreams | elevated-dreams | ? | ❌ | ❌ | hold page (non-payment) |
| Turner Tax | turner-tax-pwa | ? | ❌ | ❌ | needs data |

---

## ▶️ NEXT ACTIONS (in order)

1. **H2** — fix blogger (30 min)
2. **H4** — build watchdog (2 hrs)
3. **H1** — ShootOS read path (3 hrs)
4. **M3, M4** — cleanup (1 hr)
5. **H3** — Faren supplies client billing data
6. **End-to-end test**: fake client → subscribe → features unlock → miss payment →
   overdue → grace expires → auto-suspend → pay → auto-restore
7. **THEN SELL.** Only after that, pick ONE item from the blueprint.

---

## 📁 REFERENCE DOCS

- `/mnt/user-data/outputs/NUI-Ship-List.md` — full verified defect audit
- `/mnt/user-data/outputs/NUI-Platform-Blueprint.md` — product vision (POST-SHIP)
- `/mnt/user-data/outputs/NUI-Complete-Capability-Outline.md` — what the system provides
- `/mnt/user-data/outputs/Sonya-Meadows-System-Value-and-Pricing.md` — client value doc
- `/mnt/user-data/outputs/Damon-Meadows-Reactivation-Emails.md` — 2-email sequence, unsent
- `~/nui-site/docs/SAAS-ARCHITECTURE-PROPOSAL.md` — March 2026 analysis

---

## 🔑 IDs & ENDPOINTS

- Supabase (NUI): `jcgvkyizoimwbolhfpta`
- Supabase (ShootOS): `soagukttbuwmaktkpaih`
- Netlify site (nui-site): `33bd6d24-40c8-4d1f-a636-81ad47ae996c`
- Netlify DNS zone (newurbaninfluence.com): `698a5bdfe5cb2a72e571190d`
- Netlify account slug: `info-ivxkgvq`
- GitHub org: `newurbaninfluence-lgtm`
- PenMindState Netlify (live): `cdb80538-d136-4702-8766-84b802883968`
- PenMindState Netlify (orphan, delete): `11aee525-812d-4a58-a3c6-f2aee9a84d2b`
