# ROUTES (LOCKED)
# Last updated: 2026-02-19
# Rule: Claude must NOT re-scan the repo if ROUTES is present. Only update routes when a page is added/removed or hrefs change.
# Source: Full repo scan of /Users/farenyoung/nui-site

---

## Marketing SPA (index.html — hash-based views)

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/` | `/index.html` | marketing | SPA view | Home |
| `/#about` | `/index.html` | marketing | SPA view | About section |
| `/#services` | `/index.html` | marketing | SPA view | Services section |
| `/#portfolio` | `/index.html` | marketing | SPA view | Portfolio section |
| `/#blog` | `/index.html` | marketing | SPA view | Blog section |
| `/#intake` | `/index.html` | marketing | SPA view | Service intake form |

## Static Marketing Pages

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/about` | `/about.html` | marketing | static | About page (also SPA view) |
| `/portfolio` | `/portfolio.html` | marketing | static | Portfolio page (also SPA view) |
| `/contact` | `/contact.html` | marketing | static | Contact page |
| `/moodboard-app` | `/moodboard-app.html` | marketing | static | Moodboard tool |

## Location Pages (13 cities)

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/locations/ann-arbor` | `/locations/ann-arbor.html` | marketing | static | Geo-targeted |
| `/locations/birmingham` | `/locations/birmingham.html` | marketing | static | Geo-targeted |
| `/locations/dearborn` | `/locations/dearborn.html` | marketing | static | Geo-targeted |
| `/locations/detroit` | `/locations/detroit.html` | marketing | static | Geo-targeted |
| `/locations/farmington-hills` | `/locations/farmington-hills.html` | marketing | static | Geo-targeted |
| `/locations/livonia` | `/locations/livonia.html` | marketing | static | Geo-targeted |
| `/locations/novi` | `/locations/novi.html` | marketing | static | Geo-targeted |
| `/locations/pontiac` | `/locations/pontiac.html` | marketing | static | Geo-targeted |
| `/locations/royal-oak` | `/locations/royal-oak.html` | marketing | static | Geo-targeted |
| `/locations/southfield` | `/locations/southfield.html` | marketing | static | Geo-targeted |
| `/locations/sterling-heights` | `/locations/sterling-heights.html` | marketing | static | Geo-targeted |
| `/locations/troy` | `/locations/troy.html` | marketing | static | Geo-targeted |
| `/locations/warren` | `/locations/warren.html` | marketing | static | Geo-targeted |

## Service Pages (9 pages)

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/services/brand-guidelines-detroit` | `/services/brand-guidelines-detroit.html` | marketing | static | SEO landing |
| `/services/brand-identity-packages-detroit` | `/services/brand-identity-packages-detroit.html` | marketing | static | SEO landing |
| `/services/branding-agency-detroit` | `/services/branding-agency-detroit.html` | marketing | static | SEO landing |
| `/services/logo-design-detroit` | `/services/logo-design-detroit.html` | marketing | static | SEO landing |
| `/services/marketing-automation-detroit` | `/services/marketing-automation-detroit.html` | marketing | static | SEO landing |
| `/services/packaging-design-detroit` | `/services/packaging-design-detroit.html` | marketing | static | SEO landing |
| `/services/print-design-detroit` | `/services/print-design-detroit.html` | marketing | static | SEO landing |
| `/services/social-media-templates-detroit` | `/services/social-media-templates-detroit.html` | marketing | static | SEO landing |
| `/services/web-design-detroit` | `/services/web-design-detroit.html` | marketing | static | SEO landing |

## Blog (1 index + 3 posts)

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/blog` | `/blog/index.html` | marketing | static | Blog index |
| `/blog/branding-mistakes-small-businesses` | `/blog/branding-mistakes-small-businesses.html` | marketing | static | Blog post |
| `/blog/how-much-does-logo-design-cost-detroit` | `/blog/how-much-does-logo-design-cost-detroit.html` | marketing | static | Blog post |
| `/blog/restaurant-branding-guide-detroit` | `/blog/restaurant-branding-guide-detroit.html` | marketing | static | Blog post |

## Work / Case Studies (4 projects)

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/work/ascend-coaching-group` | `/work/ascend-coaching-group.html` | marketing | static | Case study |
| `/work/detroit-canvas-co` | `/work/detroit-canvas-co.html` | marketing | static | Case study |
| `/work/good-cakes-and-bakes` | `/work/good-cakes-and-bakes.html` | marketing | static | Case study |
| `/work/motor-city-bistro` | `/work/motor-city-bistro.html` | marketing | static | Case study |

## App Shell — NUI Admin (Single SPA — portal.js)
> `/app/` — NUI master admin only. No tenant scripts. Faren-only.

| Route | File | System | Notes |
|-------|------|--------|-------|
| `/app` | `/app/index.html` | app | NUI admin entry |
| `/app/*` | `/app/index.html` | app | SPA catch-all |

## Sub-Account Tenant Portal (agency-tenant.js)
> `/portal/` — Sub-account agencies only. Requires `?agency=SLUG` param.
> Completely separate from NUI admin. Never shares scripts or auth.

| Route | File | System | Notes |
|-------|------|--------|-------|
| `/portal/` | `/portal/index.html` | tenant | Tenant portal entry |
| `/portal/?agency=SLUG` | `/portal/index.html` | tenant | Branded sub-account login |
| `/portal/*` | `/portal/index.html` | tenant | SPA catch-all |
| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/app` | `/app/index.html` | app | SPA shell | App entry point |
| `/portal` | → `/app/index.html` | app | redirect | Legacy redirect (200) |
| `/portal/*` | → `/app/index.html` | app | redirect | Legacy catch-all (200) |

### Admin Panels (internal SPA views within /app)

| Panel ID | System | Category | Notes |
|----------|--------|----------|-------|
| `dashboard` | admin | Overview | 📊 Main admin dashboard |
| `calendar` | admin | Overview | 📅 Calendar |
| `analytics` | admin | Overview | 📈 Site analytics |
| `reviews` | admin | Overview | ⭐ Google Reviews |
| `crm` | admin | Clients | 💼 CRM Pipeline |
| `clients` | admin | Clients | 👥 Client management |
| `leads` | admin | Clients | 🎯 Lead tracking |
| `submissions` | admin | Clients | 📩 Form submissions |
| `projects` | admin | Operations | 📂 Project tracker |
| `orders` | admin | Operations | 📋 Order management |
| `proofs` | admin | Operations | ✅ Proof approval |
| `brandguide` | admin | Operations | 📘 Brand guide |
| `delivery` | admin | Operations | 📦 Asset delivery |
| `payments` | admin | Finance | 💳 Payment tracking |
| `invoices` | admin | Finance | 📄 Invoice management |
| `payouts` | admin | Finance | 💰 Payout tracking |
| `stripe` | admin | Finance | 💎 Stripe integration |
| `subscriptions` | admin | Finance | 🔄 Subscription management |
| `seo` | admin | Marketing | 🔍 SEO/AEO/GEO |
| `gmb` | admin | Marketing | 📍 Google Business |
| `blog` | admin | Marketing | 📝 Blog manager |
| `emailmarketing` | admin | Marketing | 📧 Email campaigns |
| `loyalty` | admin | Marketing | 🎁 Loyalty program |
| `communications` | admin | Comms | 💬 Inbox hub |
| `socialdm` | admin | Comms | 📱 Social DMs |
| `sms` | admin | Comms | 📲 SMS (OpenPhone) |
| `siteimages` | admin | Assets | 🖼️ Site images |
| `assets` | admin | Assets | 📁 Client assets |
| `portfolio` | admin | Assets | 🎨 Portfolio manager |
| `moodboard` | admin | Assets | 🎨 Moodboard tool |
| `about` | admin | Assets | 📄 About page editor |
| `designers` | admin | Admin | 🎨 Designer management |
| `newclient` | admin | Admin | ➕ New client form |
| `neworder` | admin | Admin | ➕ New order form |
| `integrations` | admin | Admin | 🔗 All integrations |
| `usermanagement` | admin | Admin | 🔐 User management |

## Utility Pages

| Route | File | System | Type | Notes |
|-------|------|--------|------|-------|
| `/404` | `/404.html` | utility | static | Not found page |
| `/offline` | `/offline.html` | utility | static | PWA offline fallback |
| `/placeholder` | `/placeholder.html` | utility | static | Placeholder |

## Redirects

| From | To | Status | Notes |
|------|----|--------|-------|
| `/work/good-cakes` | `/work/good-cakes-and-bakes` | 301 | Fix old portfolio link |
| `/portal` | `/portal/index.html` | 200 | Tenant portal |
| `/portal/` | `/portal/index.html` | 200 | Tenant portal (trailing slash) |
| `/portal/*` | `/portal/index.html` | 200 | Tenant portal catch-all |
| `/*` | `/index.html` | 200 | SPA fallback (MUST BE LAST) |

## Missing Pages (TODO)

| Route | Status | Notes |
|-------|--------|-------|
| `/locations/highland-park` | ❌ Missing | Linked from Detroit page, no HTML file |
| `/locations/hamtramck` | ❌ Missing | Linked from Detroit page, no HTML file |

---

## Summary

| Category | Count |
|----------|-------|
| Marketing SPA views | 6 |
| Static marketing pages | 4 |
| Location pages | 13 (+2 missing) |
| Service pages | 9 |
| Blog pages | 4 |
| Case studies | 4 |
| App shell | 1 |
| Admin panels (internal) | 35 |
| Utility pages | 3 |
| Redirects | 4 |
| **Total external routes** | **44** |
| **Total incl. admin panels** | **79** |
