# NUI Baseline Notes — Do Not Break
> Generated: Phase 0 | Pre-Refactor

## Architecture Summary

The site is a **Single Page Application (SPA)** built as one monolithic HTML file:
- `index.html` (28,718 lines) contains ALL CSS, HTML, and JavaScript
- Navigation uses `showView('viewName')` to toggle `.view` divs
- URL routing uses hash-based navigation (`#about`, `#services`, etc.)
- Netlify's `_redirects` catch-all (`/* /index.html 200`) ensures all URLs hit the SPA
- Some pages already exist as standalone HTML (blog, services, locations, work)
- BUT the SPA also renders those same views internally (potential duplication)

## Critical Flows — DO NOT BREAK

### 1. Home → Book Strategy Call
- User lands on `/` → `loadHomeView()` renders hero + sections
- User clicks "Book a Strategy Call" → `showView('intake')` → shows intake form
- Form submits to `save-submission` Netlify function
- **Critical IDs**: `intakeView`, `homeView`

### 2. Client Portal Login
- User clicks "Client Portal" → `showView('portal')` → `loadPortalView()`
- Login form authenticates via Supabase
- On success: shows client dashboard OR admin dashboard
- **Critical IDs**: `portalView`, `portalLogin`, `adminDashboard`
- **Critical functions**: `loginClient()`, `loginStaff()`, `setLoginType()`

### 3. Admin Dashboard
- Staff login → `adminDashboard` div shown
- `showAdminPanel('dashboard')` → `loadAdminDashboardPanel()`
- 37 admin panels loaded on demand via `showAdminPanel(panelName)`
- **Critical IDs**: `adminDashboard`, `adminNav`, `adminDashboardPanel`
- **Critical**: All panels use `document.getElementById()` selectors

### 4. Portfolio / Case Studies
- `/portfolio` → `showView('portfolio')` → `loadPortfolioView()`
- Case studies rendered from `portfolioData` array in localStorage
- Individual case studies at `/work/[slug]` (separate HTML files exist)
- **Critical**: Dynamic `href="/work/' + (p.id || '') + '"` in JS

### 5. Blog
- `/blog` → `showView('blog')` → `loadBlogView()`
- Blog posts loaded from localStorage / Supabase
- Individual posts at `/blog/[slug]` (separate HTML files exist)
- Admin blog editor at `showAdminPanel('blog')`

## SPA Routing Mechanism

```javascript
// 7 view containers in the DOM:
<div class="view active" id="homeView"></div>
<div class="view" id="aboutView"></div>
<div class="view" id="servicesView"></div>
<div class="view" id="portfolioView"></div>
<div class="view" id="intakeView"></div>
<div class="view" id="blogView"></div>
<div class="view" id="portalView"></div>

// Router:
function showView(viewName) {
    // Toggle active class on nav links
    // Toggle active class on view divs
    // Lazy-load view content via loadViewContent()
    // Update URL hash + page SEO
}

// Valid views: ['home','about','services','portfolio','blog','portal','intake']
```

## Shared Dependencies (Global)

| Dependency          | File              | Used By             |
|--------------------|-------------------|---------------------|
| Supabase client    | supabase-client.js | All data operations  |
| Environment config | env.js             | Supabase init        |
| System patches     | nui-system-patch.js | Global fixes         |
| Service Worker     | sw.js              | PWA caching          |
| Inter font         | Google Fonts CDN   | All pages            |
| Stripe.js          | js.stripe.com      | Payments only        |

## Data Layer (all in localStorage, synced to Supabase)

| Variable           | Key                   | System     |
|--------------------|-----------------------|------------|
| clients            | nui_clients            | CRM        |
| orders             | nui_orders             | Orders     |
| leads              | nui_leads              | CRM        |
| projects           | nui_projects           | PM         |
| payments           | nui_payments           | Finance    |
| invoices           | nui_invoices           | Finance    |
| proofs             | nui_proofs             | PM         |
| portfolioData      | nui_portfolio          | Content    |
| seoData            | nui_seo                | SEO        |
| crmData            | nui_crm                | CRM        |
| designers          | nui_designers          | Team       |
| emailMarketing     | nui_email_marketing    | Comms      |
| socialMediaDM      | nui_social_dm          | Comms      |
| smsSystem          | nui_sms                | Comms      |
| loyaltyProgram     | nui_loyalty            | Comms      |
| siteImages         | nui_site_images        | Content    |
| subscriptions      | nui_subscriptions      | Finance    |
| communicationsHub  | nui_comm_hub           | Comms      |

## Known Risks

1. **ID Collisions**: Admin panel HTML uses IDs like `customPackageBuilder` and `customPackageTotal` that also appear in the services view. Splitting must preserve context.
2. **Inline Styles**: Massive amounts of inline `style=""` attributes — CSS extraction will be complex.
3. **Dynamic href**: `/work/' + (p.id || '') + '` — JS-generated links depend on data being present.
4. **Two monoliths**: `nui-complete-app.html` (18,519 lines) appears to be an older backup. Verify before deleting.
5. **SPA catch-all**: `_redirects` sends EVERYTHING to index.html — must be updated as pages split.
6. **localStorage coupling**: Every panel reads/writes localStorage directly. Splitting admin panels requires the data layer to remain globally accessible.
