// push-subscribe.js — Saves web push notification subscriptions to Supabase
// Stores endpoint, keys, platform, and interests for targeted campaigns

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://jcgvkyizoimwbolhfpta.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    try {
        const { subscription, interests, user_agent, platform } = JSON.parse(event.body);

        if (!subscription || !subscription.endpoint) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid subscription' }) };
        }

        // Check for existing subscription by endpoint
        const { data: existing } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', subscription.endpoint)
            .single();

        if (existing) {
            // Update existing
            await supabase.from('push_subscriptions')
                .update({
                    keys: subscription.keys,
                    interests: interests || [],
                    user_agent: user_agent,
                    platform: platform,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

            return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'updated' }) };
        }

        // Insert new subscription
        const { error } = await supabase.from('push_subscriptions').insert({
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            interests: interests || [],
            user_agent: user_agent,
            platform: platform || 'unknown',
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (error) throw error;

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'created' }) };
    } catch (err) {
        console.error('Push subscribe error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
