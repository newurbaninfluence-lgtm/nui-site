// rb2b-webhook.js — Receives RB2B visitor identification webhooks
// Stores identified website visitors in Supabase for lead capture & outreach
// Triggers auto-email based on pages visited

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://tpouhkuglmfmhcakvkbj.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Fire auto-email in background (non-blocking)
function triggerAutoEmail(visitorId, capturedUrl) {
    const siteUrl = process.env.URL || 'https://newurbaninfluence.com';
    fetch(`${siteUrl}/.netlify/functions/visitor-auto-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId, captured_url: capturedUrl })
    }).then(r => console.log('Auto-email trigger:', r.status))
      .catch(e => console.warn('Auto-email trigger failed:', e.message));
}

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const data = JSON.parse(event.body);

        // Map RB2B webhook payload to our schema
        const visitor = {
            linkedin_url: data['LinkedIn URL'] || null,
            first_name: data['First Name'] || null,
            last_name: data['Last Name'] || null,
            title: data['Title'] || null,
            company_name: data['Company Name'] || null,
            business_email: data['Business Email'] || null,
            website: data['Website'] || null,
            industry: data['Industry'] || null,
            employee_count: data['Employee Count'] || null,
            estimated_revenue: data['Estimate Revenue'] || null,
            city: data['City'] || null,
            state: data['State'] || null,
            zipcode: data['Zipcode'] || null,
            seen_at: data['Seen At'] || new Date().toISOString(),
            referrer: data['Referrer'] || null,
            captured_url: data['Captured URL'] || null,
            tags: data['Tags'] || null,
            visit_count: 1,
            status: 'new',
            source: 'rb2b'
        };

        // Check if visitor already exists (by linkedin_url or business_email)
        let existing = null;
        if (visitor.linkedin_url) {
            const { data: found } = await supabase
                .from('identified_visitors')
                .select('id, visit_count')
                .eq('linkedin_url', visitor.linkedin_url)
                .single();
            existing = found;
        }
        if (!existing && visitor.business_email) {
            const { data: found } = await supabase
                .from('identified_visitors')
                .select('id, visit_count')
                .eq('business_email', visitor.business_email)
                .single();
            existing = found;
        }

        if (existing) {
            // Update existing — increment visit count, update last seen
            const { error } = await supabase
                .from('identified_visitors')
                .update({
                    visit_count: (existing.visit_count || 1) + 1,
                    last_seen_at: visitor.seen_at,
                    last_captured_url: visitor.captured_url,
                    last_referrer: visitor.referrer,
                    tags: visitor.tags,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

            if (error) throw error;

            // Log page view
            await supabase.from('visitor_page_views').insert({
                visitor_id: existing.id,
                captured_url: visitor.captured_url,
                referrer: visitor.referrer,
                seen_at: visitor.seen_at
            });

            // Trigger personalized auto-email (handles cooldown internally)
            triggerAutoEmail(existing.id, visitor.captured_url);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, action: 'updated', id: existing.id })
            };
        } else {
            // Insert new visitor
            const { data: inserted, error } = await supabase
                .from('identified_visitors')
                .insert({
                    ...visitor,
                    last_seen_at: visitor.seen_at,
                    last_captured_url: visitor.captured_url,
                    last_referrer: visitor.referrer,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (error) throw error;

            // Log first page view
            await supabase.from('visitor_page_views').insert({
                visitor_id: inserted.id,
                captured_url: visitor.captured_url,
                referrer: visitor.referrer,
                seen_at: visitor.seen_at
            });

            // Trigger personalized auto-email for new visitor
            triggerAutoEmail(inserted.id, visitor.captured_url);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, action: 'created', id: inserted.id })
            };
        }
    } catch (err) {
        console.error('RB2B webhook error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
