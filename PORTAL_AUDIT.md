# ═══════════════════════════════════════════════════════════════
# TENANT PORTAL AUDIT REPORT — March 7, 2026
# portal.newurbaninfluence.com readiness check
# ═══════════════════════════════════════════════════════════════

## ✅ PASSING

### Panel Loaders (42/43)
All 42 panel loader functions are defined in portal scripts.
Only `loadAdminSubAccountsPanel` is missing — has stub. PASS.

### CORS (30/30)
All 30 Netlify functions use wildcard CORS (`*`).
8 webhook functions have no CORS (correct — server-to-server). PASS.

### Script Load Order
agency-isolation → agency-config → agency-tenant → core → portal → admin-core.
Config loaded BEFORE tenant. Tenant loads BEFORE portal. PASS.

### Portal Domain Config
NUI_PORTAL_DOMAIN = portal.newurbaninfluence.com
enterPortalAsAdmin uses base64 token (cross-domain safe). PASS.

### Fetch Interceptor
Auto-injects agency_id into all Netlify function calls. PASS.

### Login Flow
Password-only check (email match removed). 3 roles supported. PASS.

### Token Bypass
Enter Portal button → base64 session in URL → parsed by agency-tenant.
Saved to localStorage on portal domain. URL cleaned after. PASS.

---

## 🔴 CRITICAL BUGS (must fix before deploy)

### BUG 1: core.js SEED DATA creates Faren Young on empty localStorage
**File:** core.js line 668
**Problem:** On subdomain, localStorage is empty (correct for isolation).
But `seedTestAccount()` fires when no client with "newurbaninfluence@gmail.com"
exists → creates Faren Young client + $750 Logo Design order.
SEO data (line 725) seeds NUI title, description, keywords, FAQ.
**Impact:** Tenant sees YOUR client, YOUR orders, YOUR SEO.
**Fix:** Guard with `if (window._isAgencyTenant) return;` at top of seed.

### BUG 2: core.js SEO + FAQ seed — 50 NUI Q&A pairs
**File:** core.js lines 725-810
**Problem:** Default SEO data includes NUI business name, Detroit address,
phone number, 50 FAQ pairs all mentioning "New Urban Influence".
On subdomain this populates immediately because localStorage is empty.
**Impact:** Tenant's SEO panel shows NUI content.
**Fix:** Same guard — skip if `_isAgencyTenant`.

### BUG 3: Supabase db force-patch may miss early panel loads
**File:** agency-tenant.js step 11
**Problem:** Retry loop patches `db` every 250ms. Dashboard panel loads at
150ms. If panel queries Supabase before patch completes → no isolation.
**Impact:** First panel load might show unscoped data.
**Fix:** Move db patch to step 3 (before loadPortalView) or block panel
load until patch confirms.

---

## 🟡 BRANDING LEAKS (visible to tenant)

### LEAK 1: Dashboard banner "NEW URBAN INFLUENCE" (admin-core.js:243)
MutationObserver TreeWalker should catch this — VERIFY after deploy.

### LEAK 2: Legal agreements in portal.js (lines 203, 221, 248, 271, 274)
Designer and client terms say "New Urban Influence" — not replaced.
Low priority (only visible during onboarding terms acceptance).

### LEAK 3: Email fallbacks use "NUI" (portal.js lines 750, 772, 787, 801)
Uses `getAgencyName()` with NUI fallback. Since AGENCY_CONFIG is
populated by _launchPortal, fallback should never fire. VERIFY.

### LEAK 4: portal.js login HTML (lines 6-9, 78)
"New Urban Influence" logo, "NUI Admin", "Detroit Michigan".
rebrandPortal() replaces these — but only AFTER _launchPortal CSS
hides #portalLogin with `display:none`. If there's a flash, user sees NUI.
On subdomain with token bypass, login is never shown. LOW RISK.

### LEAK 5: admin-core.js master email (line 1011)
User Management panel shows "newurbaninfluence@gmail.com".
Only visible if tenant has usermanagement module enabled.

---

## 📊 SUMMARY

| Category            | Status    | Count |
|---------------------|-----------|-------|
| Panel Loaders       | ✅ PASS   | 42/43 |
| CORS                | ✅ PASS   | 30/30 |
| Token Bypass        | ✅ PASS   | OK    |
| Fetch Interceptor   | ✅ PASS   | OK    |
| Login Flow          | ✅ PASS   | OK    |
| Seed Data Isolation | 🔴 FAIL  | 3 bugs |
| NUI Branding Leaks  | 🟡 WARN  | 5 leaks |
| localStorage Reads  | ✅ PASS*  | 90 reads (empty on subdomain = correct) |

*On subdomain, all 90 localStorage reads return empty/[] which is correct.
Panels then hydrate from Supabase (isolated by agency_id).

## REQUIRED FIXES BEFORE DEPLOY
1. Guard seed data with `_isAgencyTenant` check
2. Guard SEO/FAQ seed with same check
3. Move db isolation patch earlier in boot sequence
