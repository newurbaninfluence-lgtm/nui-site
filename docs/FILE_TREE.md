# NUI File Tree — Baseline Snapshot
> Generated: Phase 0 | Pre-Refactor

## Current Structure

```
nui-site/
├── index.html                    ← 28,718 lines / ~1.5MB THE MONOLITH
├── nui-complete-app.html         ← 18,519 lines (backup/previous monolith version)
├── about.html                    ← Standalone SEO page
├── contact.html                  ← Standalone SEO page
├── portfolio.html                ← Standalone SEO page
├── moodboard-app.html            ← Redirect/embed (8 lines)
├── 404.html                      ← Custom error page
├── offline.html                  ← PWA offline fallback
├── placeholder.html              ← Placeholder page
│
├── env.js                        ← Supabase environment config
├── supabase-client.js            ← 1,155 lines — Supabase ORM/client
├── nui-system-patch.js           ← 861 lines — Hotfix/patch system
├── sw.js                         ← Service Worker (PWA caching)
│
├── _redirects                    ← Netlify SPA catch-all: /* → /index.html 200
├── netlify.toml                  ← 133 lines — Redirects + headers + functions config
├── manifest.json                 ← PWA manifest
├── sitemap.xml                   ← 230 lines
├── robots.txt                    ← 10 lines
├── package.json                  ← Root package.json
│
├── NUI.avif                      ← Logo image
├── apple-touch-icon.png          ← PWA icon
├── favicon.ico                   ← Favicon
│
├── icons/
│   ├── icon-48.png
│   ├── icon-192.png
│   └── icon-512.png
│
├── images/
│   ├── creative-team.png
│   └── mobile-dev-team.png
│
├── blog/
│   ├── index.html
│   ├── branding-mistakes-small-businesses.html
│   ├── how-much-does-logo-design-cost-detroit.html
│   └── restaurant-branding-guide-detroit.html
│
├── services/
│   ├── brand-identity-packages-detroit.html
│   ├── brand-guidelines-detroit.html
│   ├── branding-agency-detroit.html
│   ├── logo-design-detroit.html
│   ├── marketing-automation-detroit.html
│   ├── packaging-design-detroit.html
│   ├── print-design-detroit.html
│   ├── social-media-templates-detroit.html
│   └── web-design-detroit.html
│
├── work/
│   ├── ascend-coaching-group.html
│   ├── detroit-canvas-co.html
│   ├── good-cakes-and-bakes.html
│   └── motor-city-bistro.html
│
├── locations/
│   ├── ann-arbor.html
│   ├── birmingham.html
│   ├── dearborn.html
│   ├── detroit.html
│   ├── farmington-hills.html
│   ├── livonia.html
│   ├── novi.html
│   ├── pontiac.html
│   ├── royal-oak.html
│   ├── southfield.html
│   ├── sterling-heights.html
│   ├── troy.html
│   └── warren.html
│
└── netlify/functions/
    ├── package.json
    ├── create-payment.js
    ├── get-communications.js
    ├── google-reviews.js
    ├── oauth-callback.js
    ├── openphone-webhook.js
    ├── pexels-search.js
    ├── poll-email.js
    ├── save-booking.js
    ├── save-submission.js
    ├── send-email.js
    ├── send-sms.js
    ├── stripe-webhook.js
    ├── sync-data.js
    └── upload-image.js
```

## Monolith Anatomy (index.html — 28,718 lines)

| Line Range     | Content                                    | ~Lines |
|---------------|--------------------------------------------|--------|
| 1–637         | HEAD: Meta, Schema (7 JSON-LD blocks), GA4  | 637    |
| 638–1167      | Inline CSS (minified global styles)          | 530    |
| 1168–1201     | BODY open, Nav, 7 SPA view containers        | 34     |
| 1202–1715     | JS: Auth/Roles, Permissions, Theme, Sync     | 514    |
| 1716–2756     | JS: Data models (clients, orders, CRM, etc.) | 1,041  |
| 2757–2960     | JS: Router (showView), SEO updater, init     | 204    |
| 2960–3011     | JS: Home helpers                             | 52     |
| 3012–3279     | loadHomeView()                               | 268    |
| 3280–3324     | loadAboutView()                              | 45     |
| 3325–4622     | loadServicesView() + package builder         | 1,298  |
| 4623–7142     | loadPortfolioView() + case study renderer    | 2,520  |
| 7143–7338     | loadAdminBlogPanel()                         | 196    |
| 7339–7548     | loadBlogView()                               | 210    |
| 7549–8669     | loadPortalView() + login system              | 1,121  |
| 8670–9161     | Admin panel switcher + sidebar               | 492    |
| 9162–27404    | 37 Admin panels + Designer portal + Email    | 18,243 |
| 27404–27430   | Closing scripts, service worker reg           | 27     |
