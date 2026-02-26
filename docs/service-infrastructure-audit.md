# NUI SERVICE INFRASTRUCTURE AUDIT
## What's Built vs What's Wired Up
### Generated: Feb 25, 2026

---

## QUICK STATUS

| Service | Admin Panel | Backend | SQL Migration | Tracking/API | STATUS |
|---------|------------|---------|---------------|-------------|--------|
| Silent Visitor ID | ✅ | ✅ | Written, NOT RUN | Placeholder ID | 🟡 80% |
| Email Automation | ✅ | ✅ | Written, NOT RUN | Needs SMTP creds | 🟡 75% |
| SMS Automation | ✅ | ✅ | Written, NOT RUN | Needs OpenPhone | 🟡 75% |
| AI Phone Assistant | ⚠️ Partial | ❌ Missing | ❌ Missing | Needs provider | 🔴 20% |
| Facebook Pixel | ✅ | ✅ | ❌ Missing | Placeholder ID | 🟡 60% |
| Google Ads Pixel | ✅ | ✅ | ❌ Missing | Placeholder IDs | 🟡 60% |
| Geo-Fencing | ❌ Missing | ❌ Missing | ❌ Missing | Needs partner | 🔴 10% |
| Geo-Grid Tracking | ✅ | ✅ | ❌ Missing | Needs API key | 🟡 70% |
| CRM Integration | ✅ | ✅ | ❌ Missing | Connected | 🟡 80% |
| AI Chatbot (Sona) | ❌ No log viewer | ✅ | Written, NOT RUN | Needs API key | 🟡 70% |
| Web Push Notifs | ❌ No admin | ✅ | Written, NOT RUN | Needs VAPID keys | 🟡 60% |

---

## SQL MIGRATIONS — NEED TO RUN IN SUPABASE

### Already written, just need to paste into Supabase SQL Editor:

### 1. rb2b-visitors.sql (Silent Visitor ID)
Tables: identified_visitors, visitor_page_views
Status: Written, NOT run

### 2. visitor-auto-emails.sql (Email Automation triggers)
Tables: visitor_auto_emails
Status: Written, NOT run

### 3. 004-sms-drip.sql (SMS Campaigns)
Tables: sms_campaigns, sms_drip_queue
Status: Written, NOT run

### 4. 005-sms-drip-upgrade.sql (SMS Replies)
Tables: sms_suppression, sms_replies
Status: Written, NOT run

### 5. chat-logs.sql (Sona AI Chatbot)
Tables: chat_logs
Status: Written, NOT run

### 6. push-notifications.sql (Web Push)
Tables: push_subscriptions, push_campaigns
Status: Written, NOT run

### SQL MIGRATIONS — NEED TO BE CREATED:

### 7. retargeting.sql (Facebook + Google Pixel) — MISSING
```sql
CREATE TABLE IF NOT EXISTS retargeting_setups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID,
    client_name TEXT,
    platform TEXT NOT NULL, -- 'meta' or 'google'
    pixel_id TEXT,
    ad_account_id TEXT,
    gtm_id TEXT,
    google_ads_id TEXT,
    conversion_id TEXT,
    ga4_id TEXT,
    checklist JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retargeting_audiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID,
    client_name TEXT,
    platform TEXT,
    name TEXT NOT NULL,
    type TEXT,
    size INTEGER,
    status TEXT DEFAULT 'building',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retargeting_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID,
    client_name TEXT,
    platform TEXT,
    name TEXT NOT NULL,
    campaign_type TEXT,
    status TEXT DEFAULT 'draft',
    budget NUMERIC,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr NUMERIC,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE retargeting_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON retargeting_setups FOR ALL USING (true);
CREATE POLICY "Service role full access" ON retargeting_audiences FOR ALL USING (true);
CREATE POLICY "Service role full access" ON retargeting_campaigns FOR ALL USING (true);
```

### 8. geo-grid-scans.sql (Rank Intel) — MISSING
```sql
CREATE TABLE IF NOT EXISTS geo_grid_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID,
    biz_name TEXT NOT NULL,
    keyword TEXT NOT NULL,
    address TEXT,
    center_lat NUMERIC,
    center_lng NUMERIC,
    radius_miles NUMERIC DEFAULT 5,
    grid_size INTEGER DEFAULT 7,
    max_results INTEGER DEFAULT 5,
    points JSONB DEFAULT '[]',
    avg_rank NUMERIC,
    coverage_pct NUMERIC,
    top3_count INTEGER DEFAULT 0,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_scans_client ON geo_grid_scans(client_id);
CREATE INDEX IF NOT EXISTS idx_geo_scans_keyword ON geo_grid_scans(keyword);
CREATE INDEX IF NOT EXISTS idx_geo_scans_date ON geo_grid_scans(scanned_at DESC);

ALTER TABLE geo_grid_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON geo_grid_scans FOR ALL USING (true);
```

### 9. contacts.sql (CRM / Visitor-to-Lead) — MISSING
```sql
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT,
    notes TEXT,
    status TEXT DEFAULT 'lead',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON contacts FOR ALL USING (true);
```

---

## ENVIRONMENT VARIABLES — NETLIFY DASHBOARD

### Currently referenced in code (check which are set):

| Variable | Service | Where to Get |
|----------|---------|-------------|
| SUPABASE_URL | All services | Supabase → Settings → API |
| SUPABASE_KEY | All services | Supabase → Settings → API (anon key) |
| SUPABASE_SERVICE_KEY | All services | Supabase → Settings → API (service role key) |
| ANTHROPIC_API_KEY | Sona Chatbot | console.anthropic.com/settings/keys |
| OPENPHONE_API_KEY | SMS/Voice | OpenPhone dashboard → Settings → API |
| OPENPHONE_PHONE_NUMBER | SMS/Voice | Your OpenPhone number |
| GOOGLE_MAPS_API_KEY | Geo-Grid | Google Cloud Console → APIs → Maps/Places |
| HOSTINGER_EMAIL | Email sending | Your Hostinger email account |
| HOSTINGER_PASSWORD | Email sending | Your Hostinger email password |
| MAIL_FROM | Email sending | e.g. info@newurbaninfluence.com |
| STRIPE_SECRET_KEY | Payments | Stripe Dashboard → Developers → API keys |
| STRIPE_WEBHOOK_SECRET | Payments | Stripe Dashboard → Webhooks |
| VAPID_PUBLIC_KEY | Push Notifications | Generate: npx web-push generate-vapid-keys |
| VAPID_PRIVATE_KEY | Push Notifications | Same command as above |
| VAPID_EMAIL | Push Notifications | Your email (e.g. info@newurbaninfluence.com) |
| FACEBOOK_APP_ID | Retargeting (advanced) | developers.facebook.com |
| FACEBOOK_APP_SECRET | Retargeting (advanced) | developers.facebook.com |
| PEXELS_API_KEY | Image search | pexels.com/api |
| PIXABAY_API_KEY | Image search | pixabay.com/api/docs |
| UNSPLASH_ACCESS_KEY | Image search | unsplash.com/developers |

### Placeholders in index.html (replace with real IDs):

| Placeholder | What It Is | Where to Get |
|-------------|-----------|-------------|
| GTM-XXXXXXX | Google Tag Manager Container | tagmanager.google.com |
| G-XXXXXXXXXX | GA4 Measurement ID | analytics.google.com → Admin → Data Streams |
| AW-XXXXXXXXXX | Google Ads Conversion ID | ads.google.com → Tools → Conversions |
| YOUR_PIXEL_ID | Meta/Facebook Pixel ID | business.facebook.com → Events Manager |
| YOUR_RB2B_ID | RB2B Script ID | app.rb2b.com → Script tab |

---

## WIRING CHECKLIST — DO THIS IN ORDER

### PHASE 1: Run All SQL Migrations (15 min)
Go to Supabase → SQL Editor → paste each file:

- [ ] rb2b-visitors.sql
- [ ] visitor-auto-emails.sql
- [ ] 004-sms-drip.sql
- [ ] 005-sms-drip-upgrade.sql
- [ ] chat-logs.sql
- [ ] push-notifications.sql
- [ ] retargeting.sql (NEW — copy from above)
- [ ] geo-grid-scans.sql (NEW — copy from above)
- [ ] contacts.sql (NEW — copy from above)

### PHASE 2: Set Netlify Environment Variables (10 min)
Netlify → Site configuration → Environment variables:

- [ ] ANTHROPIC_API_KEY (for Sona chatbot)
- [ ] VAPID keys (run: npx web-push generate-vapid-keys)
- [ ] Verify SUPABASE_URL and SUPABASE_SERVICE_KEY are set
- [ ] Verify STRIPE_SECRET_KEY is set
- [ ] OPENPHONE_API_KEY + OPENPHONE_PHONE_NUMBER (if using SMS)
- [ ] GOOGLE_MAPS_API_KEY (for geo-grid scanning)
- [ ] HOSTINGER_EMAIL + HOSTINGER_PASSWORD + MAIL_FROM (for email)

### PHASE 3: Replace Placeholder IDs in index.html (10 min)

- [ ] GTM-XXXXXXX → your GTM container ID
- [ ] G-XXXXXXXXXX → your GA4 measurement ID
- [ ] AW-XXXXXXXXXX → your Google Ads conversion ID
- [ ] YOUR_PIXEL_ID → your Meta Pixel ID
- [ ] YOUR_RB2B_ID → your RB2B script ID

### PHASE 4: External Service Signups (30 min)

- [ ] RB2B (app.rb2b.com) — sign up, configure webhook to:
      https://newurbaninfluence.com/.netlify/functions/rb2b-webhook
- [ ] Google Tag Manager (tagmanager.google.com) — create container
- [ ] GA4 (analytics.google.com) — create property, get measurement ID
- [ ] Google Ads (ads.google.com) — create account if needed
- [ ] Meta Business (business.facebook.com) — create pixel
- [ ] OpenPhone (openphone.com) — get API key for SMS

### PHASE 5: Redeploy (2 min)
After all env vars and IDs are set:
```
cd ~/nui-site && git add -A && git commit -m "Wire up service IDs" && git push
```

---

## WHAT'S STILL MISSING (NEEDS TO BE BUILT)

### 1. AI Phone Assistant
- No backend function exists
- Need to pick a provider: Bland.ai, Vapi, or Retell.ai
- Build netlify function for call handling
- Build admin panel for call logs/transcripts
- Create SQL migration for call_logs table
- Estimated build time: 4-6 hours

### 2. Geo-Fencing
- No backend exists — this requires a partner platform
- Options: Simpli.fi, GroundTruth, or El Toro
- Build admin panel to track zones and campaigns
- Create SQL migration for geo_fence_campaigns
- This is a MANAGED service (you run it through a vendor dashboard)
- Estimated build time: 2-3 hours for admin tracking panel
- Vendor relationship needed for actual ad serving

### 3. Chat Logs Admin Panel
- Sona chatbot works but no way to view conversations in admin
- Need to add "Chat Logs" panel to admin nav
- Show conversations, filter by date, search by topic
- Estimated build time: 1-2 hours

### 4. Push Notification Admin Panel
- Backend works but no admin UI to send push campaigns
- Need to add campaign builder to admin
- Estimated build time: 1-2 hours

---

## FOR CLIENTS (WHITE-LABEL)

The admin-core.js already has white-label module access control:
```javascript
if (typeof _panelToModule !== 'undefined' && typeof isModuleEnabled === 'function') {
    const modKey = _panelToModule[panel];
    if (modKey && !isModuleEnabled(modKey)) { ... }
}
```

Each client site would need:
1. Their own Supabase project (or schema isolation in yours)
2. Their own Netlify site with env vars
3. Module toggles based on which services they purchased
4. Their own pixel/tracking IDs in their index.html

The admin-sites.js panel already manages multiple client sites.

