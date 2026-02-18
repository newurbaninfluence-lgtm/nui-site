# NUI Routes — Complete Audit
> Generated: Phase 0 | Pre-Refactor

## SPA Views (index.html internal router)

| View Name  | URL Hash    | Clean URL (netlify.toml)                    | File Exists? | System     |
|-----------|-------------|---------------------------------------------|-------------|------------|
| home      | #home       | /                                            | index.html  | Marketing  |
| about     | #about      | /about → about.html                         | ✅ Yes       | Marketing  |
| services  | #services   | /services/brand-identity-packages-detroit    | ✅ Yes       | Marketing  |
| portfolio | #portfolio  | /portfolio → portfolio.html                  | ✅ Yes       | Marketing  |
| blog      | #blog       | /blog → blog/index.html                      | ✅ Yes       | Marketing  |
| portal    | #portal     | /portal (SPA catch-all → index.html)         | In monolith | App/Auth   |
| intake    | #intake     | /contact → contact.html                      | ✅ Yes       | Marketing  |

## Admin Panels (37 panels — all inside monolith)

| Panel ID          | Access Via                          | System        |
|-------------------|-------------------------------------|---------------|
| dashboard         | showAdminPanel('dashboard')          | Admin         |
| analytics         | showAdminPanel('analytics')          | Admin         |
| calendar          | showAdminPanel('calendar')           | Admin         |
| usermanagement    | showAdminPanel('usermanagement')     | Admin         |
| clients           | showAdminPanel('clients')            | Admin/CRM     |
| newclient         | showAdminPanel('newclient')          | Admin/CRM     |
| orders            | showAdminPanel('orders')             | Admin/Orders  |
| neworder          | showAdminPanel('neworder')           | Admin/Orders  |
| leads             | showAdminPanel('leads')              | Admin/CRM     |
| projects          | showAdminPanel('projects')           | Admin/PM      |
| proofs            | showAdminPanel('proofs')             | Admin/PM      |
| delivery          | showAdminPanel('delivery')           | Admin/PM      |
| submissions       | showAdminPanel('submissions')        | Admin/CRM     |
| crm               | showAdminPanel('crm')                | Admin/CRM     |
| payments          | showAdminPanel('payments')           | Admin/Finance |
| invoices          | showAdminPanel('invoices')           | Admin/Finance |
| payouts           | showAdminPanel('payouts')            | Admin/Finance |
| stripe            | showAdminPanel('stripe')             | Admin/Finance |
| subscriptions     | showAdminPanel('subscriptions')      | Admin/Finance |
| portfolio         | showAdminPanel('portfolio')          | Admin/Content |
| blog              | showAdminPanel('blog')               | Admin/Content |
| about             | showAdminPanel('about')              | Admin/Content |
| brandguide        | showAdminPanel('brandguide')         | Admin/Content |
| moodboard         | showAdminPanel('moodboard')          | Admin/Content |
| assets            | showAdminPanel('assets')             | Admin/Content |
| siteimages        | showAdminPanel('siteimages')         | Admin/Content |
| designers         | showAdminPanel('designers')          | Admin/Team    |
| seo               | showAdminPanel('seo')                | Admin/SEO     |
| gmb               | showAdminPanel('gmb')                | Admin/SEO     |
| reviews           | showAdminPanel('reviews')            | Admin/SEO     |
| emailmarketing    | showAdminPanel('emailmarketing')     | Admin/Comms   |
| communications    | showAdminPanel('communications')     | Admin/Comms   |
| socialdm          | showAdminPanel('socialdm')           | Admin/Comms   |
| sms               | showAdminPanel('sms')                | Admin/Comms   |
| loyalty           | showAdminPanel('loyalty')            | Admin/Comms   |
| integrations      | showAdminPanel('integrations')       | Admin/Config  |
| emailtemplates    | showAdminPanel('emailtemplates')     | Admin/Comms   |

## Designer Portal Panels (5 panels — inside monolith)

| Panel ID    | Access Via                          | System    |
|-------------|-------------------------------------|-----------|
| dashboard   | showDesignerPanel('dashboard')       | Designer  |
| available   | showDesignerPanel('available')       | Designer  |
| myprojects  | showDesignerPanel('myprojects')      | Designer  |
| proofs      | showDesignerPanel('proofs')          | Designer  |
| messages    | showDesignerPanel('messages')        | Designer  |

## Static Pages (already split — separate HTML files)

| Route                                         | File                                          | System     |
|-----------------------------------------------|-----------------------------------------------|------------|
| /about                                        | about.html                                     | Marketing  |
| /contact                                      | contact.html                                   | Marketing  |
| /portfolio                                    | portfolio.html                                 | Marketing  |
| /blog                                         | blog/index.html                                | Marketing  |
| /blog/branding-mistakes-small-businesses      | blog/branding-mistakes-small-businesses.html   | Marketing  |
| /blog/how-much-does-logo-design-cost-detroit  | blog/how-much-does-logo-design-cost-detroit.html | Marketing |
| /blog/restaurant-branding-guide-detroit       | blog/restaurant-branding-guide-detroit.html    | Marketing  |
| /services/brand-identity-packages-detroit     | services/brand-identity-packages-detroit.html  | Marketing  |
| /services/brand-guidelines-detroit            | services/brand-guidelines-detroit.html         | Marketing  |
| /services/branding-agency-detroit             | services/branding-agency-detroit.html          | Marketing  |
| /services/logo-design-detroit                 | services/logo-design-detroit.html              | Marketing  |
| /services/marketing-automation-detroit        | services/marketing-automation-detroit.html     | Marketing  |
| /services/packaging-design-detroit            | services/packaging-design-detroit.html         | Marketing  |
| /services/print-design-detroit                | services/print-design-detroit.html             | Marketing  |
| /services/social-media-templates-detroit      | services/social-media-templates-detroit.html   | Marketing  |
| /services/web-design-detroit                  | services/web-design-detroit.html               | Marketing  |
| /work/good-cakes-and-bakes                   | work/good-cakes-and-bakes.html                 | Marketing  |
| /work/ascend-coaching-group                   | work/ascend-coaching-group.html                | Marketing  |
| /work/detroit-canvas-co                       | work/detroit-canvas-co.html                    | Marketing  |
| /work/motor-city-bistro                       | work/motor-city-bistro.html                    | Marketing  |

## Geo Landing Pages (13 cities — already split)

| Route                          | File                              |
|-------------------------------|-----------------------------------|
| /locations/ann-arbor          | locations/ann-arbor.html           |
| /locations/birmingham         | locations/birmingham.html          |
| /locations/dearborn           | locations/dearborn.html            |
| /locations/detroit            | locations/detroit.html             |
| /locations/farmington-hills   | locations/farmington-hills.html    |
| /locations/livonia            | locations/livonia.html             |
| /locations/novi               | locations/novi.html                |
| /locations/pontiac            | locations/pontiac.html             |
| /locations/royal-oak          | locations/royal-oak.html           |
| /locations/southfield         | locations/southfield.html          |
| /locations/sterling-heights   | locations/sterling-heights.html    |
| /locations/troy               | locations/troy.html                |
| /locations/warren             | locations/warren.html              |

## Netlify Serverless Functions (14 functions)

| Function              | Purpose                    |
|-----------------------|----------------------------|
| create-payment.js     | Stripe payment creation     |
| get-communications.js | Fetch comms data            |
| google-reviews.js     | Google reviews API          |
| oauth-callback.js     | Social OAuth handler        |
| openphone-webhook.js  | OpenPhone SMS webhook       |
| pexels-search.js      | Pexels image search proxy   |
| poll-email.js         | Email polling               |
| save-booking.js       | Save booking submissions    |
| save-submission.js    | Save form submissions       |
| send-email.js         | Nodemailer SMTP send        |
| send-sms.js           | OpenPhone SMS send          |
| stripe-webhook.js     | Stripe event handler        |
| sync-data.js          | Supabase data sync          |
| upload-image.js       | Image upload handler        |
