// NUI Environment Configuration (client-safe keys only)
// Sensitive keys (API secrets, service roles) live in Netlify Dashboard env vars

window.SUPABASE_URL = 'https://jcgvkyizoimwbolhfpta.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ3ZreWl6b2ltd2JvbGhmcHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDMwMjQsImV4cCI6MjA4NTg3OTAyNH0.a8gjkPoUHQ1kgROa2Lqaq3252opqg5CPMm6vR3t1NOk';

// TODO: Replace with your real Stripe publishable key from https://dashboard.stripe.com/apikeys
window.STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';

// Social OAuth app IDs (client-safe, set in Netlify Dashboard or here)
window.INSTAGRAM_APP_ID = '';
window.FACEBOOK_APP_ID = '';
window.LINKEDIN_CLIENT_ID = '';

window.SITE_URL = 'https://soft-rolypoly-668214.netlify.app';

console.log('✅ NUI Environment loaded:', window.SITE_URL);
