// push-send.js — Sends web push notifications to subscribers
// Filter by platform (ios/android/all) and interests
// Uses web-push library with VAPID authentication

const { requireAdmin } = require('./utils/security');

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://tpouhkuglmfmhcakvkbj.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// VAPID keys — generate once: npx web-push generate-vapid-keys
webpush.setVapidDetails(
    'mailto:hello@newurbaninfluence.com',
    process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY',
    process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY'
);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    try {
        const { title, body, url, image, interest, platform, tag } = JSON.parse(event.body);

        if (!title || !body) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'title and body required' }) };
        }

        // Build query — filter by platform and/or interest
        let query = supabase.from('push_subscriptions').select('*').eq('active', true);

        if (platform && platform !== 'all') {
            query = query.eq('platform', platform);
        }
        if (interest) {
            query = query.contains('interests', [interest]);
        }

        const { data: subscribers, error } = await query;
        if (error) throw error;

        const payload = JSON.stringify({
            title: title,
            body: body,
            url: url || 'https://newurbaninfluence.com',
            image: image || null,
            tag: tag || 'nui-campaign',
            interest: interest || 'general'
        });

        let sent = 0, failed = 0, expired = [];

        // Send to all matching subscribers
        const results = await Promise.allSettled(
            (subscribers || []).map(async (sub) => {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: sub.keys
                    }, payload);
                    sent++;
                } catch (err) {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        // Subscription expired — mark inactive
                        expired.push(sub.id);
                    }
                    failed++;
                }
            })
        );

        // Clean up expired subscriptions
        if (expired.length > 0) {
            await supabase.from('push_subscriptions')
                .update({ active: false, updated_at: new Date().toISOString() })
                .in('id', expired);
        }

        // Log the campaign
        await supabase.from('push_campaigns').insert({
            title, body, url,
            interest_filter: interest || null,
            platform_filter: platform || 'all',
            total_subscribers: (subscribers || []).length,
            sent_count: sent,
            failed_count: failed,
            sent_at: new Date().toISOString()
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, sent, failed, expired: expired.length, total: (subscribers || []).length })
        };
    } catch (err) {
        console.error('Push send error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
