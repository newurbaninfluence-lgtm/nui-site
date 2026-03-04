# NUI → SaaS Architecture Proposal
## Strategist Analysis | March 2026

---

## EXECUTIVE SUMMARY

NUI has already built more than it knows. The agency white-label system, sub-account
management, tenant portal, and module toggles are all live. The problem is they were
**bolted on architecturally rather than designed in from the ground up.** This document
identifies exactly where the cracks are, what assumptions need to be broken, and the
phased migration path to a real multi-tenant SaaS.

---

## WHAT'S ACTUALLY BUILT (Inventory of SaaS Pieces)

### ✅ Already Working
| Feature | File | Notes |
|---------|------|-------|
| Sub-account creation | admin-subaccounts.js | Full CRUD + invite modal |
| White-label branding | agency-config.js, agency-tenant.js | Color, logo, name, nav labels |
| Tenant login overlay | agency-tenant.js | URL-based: `?agency=SLUG` |
| Setup wizard | agency-tenant.js | API key collection per tenant |
| Module toggles | agency-config.js | CSS hide/show per plan |
| Plan tiers | admin-subaccounts.js | Starter/Growth/Pro/Agency/Custom |
| Feature access control | _panelToModule map | Opacity + pointer-events |
| Supabase sub-account table | agency_subaccounts | Stores all tenant configs |
| White-label email identity | admin-subaccounts.js | SMTP, phone, signature, logo |
| One beta client live | configs/msaas-config.js | MSaaS Agency — full plan |

### 🟡 Partially Built
| Feature | Gap |
|---------|-----|
| Per-tenant Supabase | Config object exists, connection not used dynamically |
| Billing (Stripe) | Stripe function exists, not tied to plan activation |
| Custom domains | Netlify doesn't auto-provision domains per tenant |
| Data isolation | No tenant_id column on core tables (clients, orders, etc.) |
| Per-tenant AI (Monty) | Shows "Coming Soon" banner for all sub-accounts |

### ❌ Not Built
| Feature | Impact |
|---------|--------|
| Proper auth (JWT/sessions) | Passwords stored plaintext in DB |
| Automated billing → feature unlock | Manual feature assignment only |
| Tenant data isolation | All tenants see NUI's client data |
| API calls using tenant's own keys | Integration wizard collects keys but ignores them |
| Self-serve signup page | Currently requires Faren to manually create each account |
| Sub-tenant analytics (usage per agency) | No billing/usage data tracked |

---

## CRITICAL BOTTLENECKS TO RETHINK

### 1. The Authentication Problem (URGENT)
**Current:** `login_password` is stored as plaintext text in Supabase `agency_subaccounts`.
Login check is `if (pass === _agencyData.login_password)` in JavaScript.

**Why it breaks at scale:**
- Passwords visible to anyone with Supabase access
- No password reset flow
- No session expiry — `sessionStorage` only, clears on tab close
- No 2FA option

**Fix:** Use Supabase Auth with a separate `agency_users` table. Each sub-account owner
gets a real Supabase Auth user. Map `auth.uid` → `agency_subaccounts.owner_uid`.

---

### 2. The Data Isolation Problem (CRITICAL FOR LAUNCH)
**Current:** Every sub-account tenant that accesses the admin panel sees NUI's own
data from Supabase. The `clients`, `orders`, `contacts`, `projects` tables have NO
`tenant_id` column.

**Why this is a showstopper:** MSaaS Agency is currently logged in. If they go to
the Clients panel, they see *NUI's clients*. This is both a privacy violation and
a compliance issue.

**Fix:** Two viable paths:

| Option | How | Cost | Complexity |
|--------|-----|------|------------|
| Schema-per-tenant | Each agency gets own Supabase schema | Higher | Medium |
| Row-level isolation | Add `tenant_id` to all tables + RLS policies | Low | Low-Medium |
| Project-per-tenant | Each agency gets own Supabase project | Medium | High |

**Recommendation:** Row-level isolation with `tenant_id` + Supabase RLS. This is
the standard SaaS pattern and can be done without new infrastructure.

---

### 3. The Integration Keys Problem
**Current:** Setup wizard collects Stripe, OpenPhone, Supabase, etc. keys and stores
them in `agency_subaccounts.integrations_config` as JSON. But when the tenant
opens the Clients panel, `send-email.js` still uses NUI's Hostinger credentials.
The collected keys are **stored but never routed**.

**Fix:** Netlify functions need to accept a `tenantId` parameter, look up that
tenant's credentials from Supabase (server-side), and use THOSE credentials for
the operation. Functions must never trust client-sent credentials directly.

---

### 4. The Deployment Model Problem
**Current:** All tenants access `newurbaninfluence.com/app?agency=SLUG`. This is fine
for an MVP but has two failure modes:
- White-label is undermined — their clients see "newurbaninfluence.com" in the URL
- All tenants share NUI's Netlify rate limits, deploy pipeline, and CSP headers

**Fix options:**
- **Short-term:** Use `[slug].newurbaninfluence.com` subdomains via Netlify branch deploys
- **Medium-term:** Custom domains via Netlify `_headers` and DNS delegation
- **Long-term:** Separate Netlify site per tenant (fully isolated)

---

### 5. The Module Access Problem
**Current:** Feature toggles work by CSS `display:none` and `pointer-events:none`.
This means a developer could open DevTools and re-enable any panel. More critically,
the **Netlify function endpoints have no tenant awareness** — a Growth plan tenant
could call `/.netlify/functions/send-sms` directly, bypassing plan limits entirely.

**Fix:** Every serverless function needs to:
1. Verify the admin secret (already partially done with ADMIN_SECRET)
2. Identify which tenant is calling
3. Check that tenant's active features against the action being requested
4. Reject the call if the feature isn't in their plan

---

## PROPOSED MODULAR SAAS ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    NUI MASTER (Faren)                        │
│  newurbaninfluence.com/app  (no ?agency param)              │
│  Full admin: Sub-accounts, billing, all tools               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Creates & manages
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  MSaaS       │  │  Agency B    │  │  Agency C    │
│  ?agency=    │  │  ?agency=    │  │  Custom      │
│  msaas       │  │  agency-b    │  │  domain      │
│  Full plan   │  │  Growth plan │  │  Agency plan │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                   Each isolated by
                   tenant_id in Supabase
                   (same DB, separate rows)
```

### Layer 1: Auth Layer (Replace Current Plaintext Login)
```
agency_users (Supabase Auth)
  └─ uid, email, role
  └─ FK → agency_subaccounts.owner_uid

agency_subaccounts
  └─ owner_uid (FK to auth.users)
  └─ tenant_id (UUID, primary isolation key)
  └─ plan, features, status, brand config
```

### Layer 2: Data Layer (Add Tenant Isolation)
Every core table gets `tenant_id UUID NOT NULL DEFAULT 'nui-master'`:
```sql
-- Migration template for all core tables
ALTER TABLE clients ADD COLUMN tenant_id UUID NOT NULL DEFAULT 'nui-master-uuid';
ALTER TABLE orders  ADD COLUMN tenant_id UUID NOT NULL DEFAULT 'nui-master-uuid';
ALTER TABLE contacts ADD COLUMN tenant_id UUID NOT NULL DEFAULT 'nui-master-uuid';
-- ... all tables

-- RLS policy template
CREATE POLICY "tenant_isolation" ON clients
  FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### Layer 3: Function Layer (Tenant-Aware Serverless)
All Netlify functions gain a `X-Tenant-ID` header check:
```javascript
// netlify/functions/utils/tenant-auth.js (new utility)
export async function getTenantContext(event) {
  const tenantId = event.headers['x-tenant-id'];
  if (!tenantId) throw new Error('No tenant context');
  
  // Fetch tenant config + features from Supabase
  const { data } = await supabase
    .from('agency_subaccounts')
    .select('features, integrations_config, status')
    .eq('tenant_id', tenantId)
    .single();
  
  if (data.status === 'suspended') throw new Error('Account suspended');
  return data;
}
```

### Layer 4: Billing Layer (Stripe → Feature Activation)
```
Stripe subscription created → webhook → stripe-webhook.js
  → Update agency_subaccounts SET status='active', plan='growth'
  → Auto-assign features based on plan
  → Send welcome email via tenant's SMTP
```

---

## PHASED MIGRATION PLAN

### PHASE 1: Stop the Bleeding (1-2 weeks)
**Goal: Fix the 3 issues that are showstoppers for current beta client**

1. **Add `tenant_id` to core tables** — MSaaS can't see NUI data, NUI can't see MSaaS data
2. **Fix plaintext passwords** — Migrate to Supabase Auth for agency owner login
3. **Wire integration keys in functions** — When MSaaS sends an email, use their SMTP

Deliverables:
- `supabase-migrations/tenant-isolation.sql` (tenant_id + RLS on all tables)
- `netlify/functions/utils/tenant-auth.js` (new shared utility)
- Updated `send-email.js`, `send-sms.js` to read tenant SMTP/OpenPhone creds

---

### PHASE 2: Self-Serve Signup (2-3 weeks)
**Goal: Faren doesn't have to manually create every account**

1. **Public signup page** — `/agency-signup.html` with plan selection + Stripe checkout
2. **Stripe webhook → auto-provision** — New sub-account created on successful payment
3. **Automated welcome flow** — Invite email + setup wizard link sent immediately
4. **Password reset flow** — Email-based reset via Supabase Auth

Deliverables:
- `agency-signup.html` (public-facing, no admin login required)
- `netlify/functions/provision-agency.js` (Stripe webhook → Supabase sub-account)
- Stripe Products setup: 4 plan tiers as recurring subscriptions

---

### PHASE 3: Custom Domains + Full Isolation (3-4 weeks)
**Goal: White-label clients can send their clients to THEIR domain**

1. **Subdomain routing** — `[slug].newurbaninfluence.com` via Netlify wildcard
2. **Custom domain support** — Instructions + DNS config for agency-owned domains
3. **Per-tenant CSP headers** — Each tenant can set their own tracking IDs
4. **Usage analytics** — NUI master admin can see API call volume per tenant

Deliverables:
- Netlify wildcard subdomain config
- `netlify/functions/domain-provision.js`
- Tenant usage dashboard in admin-subaccounts.js

---

### PHASE 4: SaaS-Grade Features (Ongoing)
**Goal: This becomes a product people buy, not just a white-label tool**

1. **Per-tenant AI (Monty)** — Each agency gets their own AI assistant trained on their client data
2. **Tenant-configurable workflows** — Email templates, drip sequences customizable per agency
3. **Reseller billing** — Agencies can bill THEIR clients via NUI's Stripe infrastructure
4. **API access** — REST API for agencies to build on top of NUI
5. **Marketplace** — Add-on modules purchasable a la carte

---

## PRICING ARCHITECTURE (Recommended)

Based on current `NUI_PLANS` in admin-subaccounts.js:

| Plan | Price | Features | Target |
|------|-------|----------|--------|
| Starter | $97/mo | Core: Clients, Projects, Orders, Invoicing, Email | Freelancers |
| Growth | $197/mo | + SMS, SEO, Push, Analytics | Small agencies |
| Professional | $397/mo | + Brand designer, Moodboard, Retargeting, Rank Intel | Full-service agencies |
| Agency | $697/mo | All features | White-label resellers |
| Custom | Negotiated | Custom feature set + dedicated support | Enterprise |

**Add-ons (Phase 4):**
- AI Phone Assistant: +$97/mo
- Geo-Fencing: +$147/mo (vendor cost pass-through)
- Additional client seats: +$47/mo per 10 clients

---

## IMMEDIATE NEXT STEPS (This Week)

### Fix 1: Tenant Isolation Migration (Priority 1)
Need to run `supabase-migrations/tenant-isolation.sql` — this is the single most
important thing before letting MSaaS use their portal for real client data.

### Fix 2: Auth Security (Priority 2)
Replace plaintext password check in `agency-tenant.js` line ~80 with Supabase Auth.
One afternoon of work. MSaaS is the only active tenant so migration is clean.

### Fix 3: Integration Key Routing (Priority 3)
`send-email.js` and `send-sms.js` need a tenant_id header → lookup → use their creds.
Currently 100% of emails sent through agency portals come from NUI's email. This is
why MSaaS's emails say "New Urban Influence" even after white-labeling.

---

## WHAT NOT TO BREAK

These flows are working and must be preserved through all migrations:

| Flow | Risk Level |
|------|-----------|
| NUI master admin login | Low — different code path from tenant login |
| MSaaS portal access via ?agency=msaas | Medium — test after tenant_id migration |
| Print order submission | Low — no tenant context needed |
| Marketing site (index.html, services, etc.) | None — separate from portal |
| Stripe webhooks | Low — add tenant_id to payload only |
| Holiday drip / SMS drip | Medium — need to pass tenant_id to functions |

---

*Authored by: NUI Strategist Agent | March 2026*
*Handoff to: Developer (Phase 1 implementation)*
