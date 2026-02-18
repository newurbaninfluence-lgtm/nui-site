# NUI System Map
> Generated: Phase 1 | System Identification

## System 1: Marketing (Public-Facing Website)

**Entry Points:** `/`, `/about`, `/services/*`, `/portfolio`, `/blog/*`, `/work/*`, `/locations/*`, `/contact`
**Monolith Lines:** ~1,200–5,300 (views) + 638–1167 (CSS)

### Components:
- Home view (hero, services grid, case studies preview, reviews, values, team, CTA)
- About view (about hero, team section, values)
- Services view (3 brand packages, web/app packages, funnels, custom builder)
- Portfolio view (preview cards + expanded case studies)
- Blog view (blog grid + single post reader)
- Intake/Contact form
- Footer (shared across all views)
- Nav (shared across all views)

### Shared Dependencies:
- `supabase-client.js` (portfolio data, blog posts from CMS)
- `env.js` (Supabase keys)
- Google Fonts (Inter)
- Global CSS variables

### Already Split Files:
- `about.html`, `contact.html`, `portfolio.html`
- `blog/*.html` (4 files)
- `services/*.html` (9 files)
- `work/*.html` (4 files)
- `locations/*.html` (13 files)

---

## System 2: App — Client Portal

**Entry Point:** `/portal` → `showView('portal')` → `loadPortalView()`
**Monolith Lines:** ~7,549–8,669

### Components:
- Login screen (client login + social login + staff demo)
- Client dashboard (order status, proofs, messages, files)
- Proof review interface
- File delivery interface

### Shared Dependencies:
- Auth system (loginClient, loginStaff, setLoginType)
- `supabase-client.js`
- Proof data model (`nui_proofs`)
- Order data model (`nui_orders`)

---

## System 3: App — Admin Dashboard

**Entry Point:** `/portal` → staff login → `adminDashboard` shown
**Monolith Lines:** ~8,670–27,404 (THE BULK — ~18,000 lines)

### Sub-Systems:

#### 3a: Admin Core
- Dashboard overview (`loadAdminDashboardPanel`)
- Analytics (`loadAdminAnalyticsPanel`)
- Calendar (`loadAdminCalendarPanel`)
- User management (`loadAdminUserManagementPanel`)
- Integrations (`loadAdminIntegrationsPanel`)

#### 3b: CRM & Sales
- Clients list + new client (`loadAdminClientsPanel`, `loadAdminNewClientPanel`)
- Leads (`loadAdminLeadsPanel`)
- Submissions (`loadAdminSubmissionsPanel`)
- CRM pipeline (`loadAdminCrmPanel`)

#### 3c: Orders & Project Management
- Orders + new order (`loadAdminOrdersPanel`, `loadAdminNewOrderPanel`)
- Projects (`loadAdminProjectsPanel`)
- Proofs (`loadAdminProofsPanel`)
- Delivery (`loadAdminDeliveryPanel`)

#### 3d: Finance
- Payments (`loadAdminPaymentsPanel`)
- Invoices (`loadAdminInvoicesPanel`)
- Payouts (`loadAdminPayoutsPanel`)
- Stripe integration (`loadAdminStripePanel`)
- Subscriptions (`loadAdminSubscriptionsPanel`)

#### 3e: Content Management
- Portfolio editor (`loadAdminPortfolioPanel`)
- Blog editor (`loadAdminBlogPanel`)
- About editor (`loadAdminAboutPanel`)
- Brand guide builder (`loadAdminBrandGuidePanel`)
- Moodboard (`loadAdminMoodboardPanel`)
- Assets manager (`loadAdminAssetsPanel`)
- Site images (`loadAdminSiteImagesPanel`)

#### 3f: Communications
- Email marketing (`loadAdminEmailMarketingPanel`)
- Email templates (`loadAdminEmailTemplatesPanel`)
- Communications hub (`loadAdminCommunicationsPanel`)
- Social DMs (`loadAdminSocialDmPanel`)
- SMS (`loadAdminSmsPanel`)
- Loyalty program (`loadAdminLoyaltyPanel`)

#### 3g: SEO & Reviews
- SEO settings (`loadAdminSeoPanel`)
- Google My Business (`loadAdminGmbPanel`)
- Reviews (`loadAdminReviewsPanel`)

#### 3h: Team
- Designers management (`loadAdminDesignersPanel`)

### Shared Dependencies:
- ALL data models (clients, orders, leads, projects, payments, invoices, etc.)
- `supabase-client.js` + `env.js`
- Auth/role system (`ROLE_PERMISSIONS`, `PANEL_ACCESS`, `hasPermission`)
- `syncToBackend()` / `hydrateFromBackend()`
- Admin CSS (dark/light theme variables)
- `showNotification()`, admin header, admin nav

---

## System 4: App — Designer Portal

**Entry Point:** `/portal` → designer login → designer dashboard
**Monolith Lines:** ~25,070–26,000 (estimated)

### Components:
- Designer dashboard
- Available projects
- My projects
- Proofs management
- Messages

### Shared Dependencies:
- Auth system (designer role)
- Projects + Proofs data models
- Admin CSS (shared with admin)

---

## System 5: Auth

**Entry Point:** `loadPortalView()` login form
**Monolith Lines:** ~1,208–1,260 (roles) + ~7,549–7,600 (login UI)

### Components:
- Role-based permissions (`ROLE_PERMISSIONS`, `PANEL_ACCESS`)
- Login type switcher (client/admin/designer)
- Supabase auth integration
- Session management (`currentUser`, `loginType`)

### Shared Dependencies:
- `supabase-client.js`
- `env.js`

---

## Dependency Graph

```
Marketing ──→ supabase-client.js, env.js, Global CSS, Nav, Footer
    ↓
Client Portal ──→ Auth, supabase-client.js, Data Models (orders, proofs)
    ↓
Admin Dashboard ──→ Auth, supabase-client.js, ALL Data Models, Admin CSS
    ↓
Designer Portal ──→ Auth, supabase-client.js, Projects/Proofs Data
    ↓
Netlify Functions ──→ Supabase (server-side), Stripe, OpenPhone, Nodemailer
```

## Proposed Split Priority

| Priority | What to Split                          | Impact    | Risk  |
|----------|----------------------------------------|-----------|-------|
| 1        | Extract global CSS → `/assets/css/`    | High      | Low   |
| 2        | Extract shared nav + footer partials   | High      | Low   |
| 3        | Extract data layer → `/assets/js/`     | High      | Med   |
| 4        | Split marketing views into pages       | Med       | Low   |
| 5        | Split admin panels into modules        | Very High | High  |
| 6        | Split designer portal                  | Med       | Med   |
