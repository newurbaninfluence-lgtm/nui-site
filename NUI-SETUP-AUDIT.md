# NUI Setup Audit — What's Built vs What's Wired

## STATUS KEY
- ✅ = Done, working
- 📝 = Code exists, NOT run/configured yet
- ❌ = Not built yet

---

## 1. SQL MIGRATIONS — Need to Run in Supabase SQL Editor

### Have .sql files, need to RUN them:

| File | Tables Created | Status |
|------|---------------|--------|
| rb2b-visitors.sql | identified_visitors, visitor_page_views | 📝 NOT RUN |
| visitor-auto-emails.sql | visitor_auto_emails | 📝 NOT RUN |
| push-notifications.sql | push_subscriptions, push_campaigns | 📝 NOT RUN |
| chat-logs.sql | chat_logs | 📝 NOT RUN |
| 004-sms-drip.sql | sms_campaigns, sms_drip_queue | 📝 NOT RUN |
| 005-sms-drip-upgrade.sql | sms_suppression, sms_replies | 📝 NOT RUN |

### MISSING .sql files — need to WRITE and RUN:

| Table Needed | Used By | Status |
|-------------|---------|--------|
| geo_grid_scans | Rank Intel panel | ❌ NO SQL |
| retargeting_setups | Retargeting panel | ❌ NO SQL |
| retargeting_audiences | Retargeting panel | ❌ NO SQL |
| retargeting_campaigns | Retargeting panel | ❌ NO SQL |
| crm_contacts | Contact Hub + CRM | ❌ NO SQL |
| activity_log | Contact Hub | ❌ NO SQL |
| communications | Contact Hub (email/SMS log) | ❌ NO SQL |
| client_sites | Sites panel | ❌ NO SQL |
| contacts | Admin panel | ❌ NO SQL |
| approvals | Admin panel | ❌ NO SQL |
| tasks | Admin panel | ❌ NO SQL |

---

## 2. TRACKING IDs — Replace in index.html

| Placeholder | What It Is | Where to Get It |
|------------|-----------|-----------------|
| GTM-XXXXXXX | Google Tag Manager | tagmanager.google.com → Create Container |
| G-XXXXXXXXXX | GA4 Measurement ID | analytics.google.com → Admin → Data Streams |
| AW-XXXXXXXXXX | Google Ads Conversion ID | ads.google.com → Tools → Conversions |
| YOUR_PIXEL_ID | Meta/Facebook Pixel ID | business.facebook.com → Events Manager |
| YOUR_RB2B_ID | RB2B Script ID | app.rb2b.com → Script Setup |

---

## 3. NETLIFY ENV VARS — Add at app.netlify.com → Site Config → Env Variables

### Critical (blocks features):
