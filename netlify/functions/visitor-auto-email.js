// visitor-auto-email.js — Auto-sends personalized emails to identified visitors
// Analyzes page views → maps to interests → sends targeted email via Hostinger SMTP
// Called by rb2b-webhook after visitor identification

const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const { getBrand, getFromAddress, getTransporter, buildEmailSignature } = require('./utils/agency-brand');

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://jcgvkyizoimwbolhfpta.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// ── Page → Interest Mapping ──────────────────────────────────────
const PAGE_INTERESTS = {
    '#services':  { interest: 'branding', label: 'Brand Identity Services', weight: 3 },
    '#portfolio': { interest: 'portfolio', label: 'Our Portfolio', weight: 2 },
    '#intake':    { interest: 'hot_lead', label: 'Strategy Call Booking', weight: 5 },
    '#about':     { interest: 'about', label: 'About NUI', weight: 1 },
    '#founder':   { interest: 'about', label: 'Our Founder', weight: 1 },
    '#blog':      { interest: 'content', label: 'Blog & Resources', weight: 1 },
    '':           { interest: 'general', label: 'Homepage', weight: 1 },
    '#':          { interest: 'general', label: 'Homepage', weight: 1 }
};

// Keywords in URL for deeper interest detection
const URL_KEYWORDS = {
    'brand':      { interest: 'branding', weight: 3 },
    'logo':       { interest: 'branding', weight: 3 },
    'package':    { interest: 'branding', weight: 3 },
    'ai-system':  { interest: 'ai_systems', weight: 4 },
    'ai':         { interest: 'ai_systems', weight: 3 },
    'automat':    { interest: 'ai_systems', weight: 4 },
    'web':        { interest: 'web_design', weight: 3 },
    'social':     { interest: 'social_media', weight: 2 },
    'print':      { interest: 'print', weight: 2 },
    'pricing':    { interest: 'pricing', weight: 4 },
    'contact':    { interest: 'hot_lead', weight: 5 }
};

// ── Email Templates ──────────────────────────────────────────────
function getEmailTemplate(visitor, topInterest, pagesViewed) {
    const firstName = visitor.first_name || 'there';
    const company = visitor.company_name ? ` at ${visitor.company_name}` : '';
    const pageList = pagesViewed.map(p => `• ${p.label}`).join('\n');

    const templates = {
        // ── They looked at services/branding pages ──
        branding: {
            subject: `${firstName}, your brand could be turning more heads`,
            html: `
<div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Syne',sans-serif;font-size:22px;margin:0;letter-spacing:2px;">NEW URBAN <span style="color:#dc2626;">INFLUENCE</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1.5px;margin:8px 0 0;">WE DON'T DESIGN. WE INFLUENCE.</p>
    </div>
    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">I noticed you were checking out our brand identity packages — love that you're investing in how your business shows up.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Most businesses we work with come to us at a tipping point: they've outgrown the DIY look, or they're launching something new and need to show up like they mean it.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Our brand packages start at <strong>$1,500</strong> and include everything — logo, colors, typography, social templates, and brand guidelines. No hidden fees, no scope creep.</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://${brand.company_website || 'newurbaninfluence.com'}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">BOOK A FREE STRATEGY CALL</a>
        </div>
        <p style="font-size:14px;color:#666;line-height:1.6;">No pitch. No pressure. Just a real conversation about where your brand is and where it could be.</p>
        ${buildEmailSignature(brand)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
        ${brand.agency_name}${brand.company_city ? ' • ' + brand.company_city : ''}<br>
        ${brand.company_website ? '<a href="https://'+brand.company_website+'" style="color:'+brand.brand_color+';">'+brand.company_website+'</a>' : ''}
    </div>
</div>`
        },

        // ── They looked at AI systems / automation ──
        ai_systems: {
            subject: `${firstName}, your competitors are automating — are you?`,
            html: `
<div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Syne',sans-serif;font-size:22px;margin:0;letter-spacing:2px;">NEW URBAN <span style="color:#dc2626;">INFLUENCE</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1.5px;margin:8px 0 0;">WE DON'T DESIGN. WE INFLUENCE.</p>
    </div>
    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">I saw you checking out our AI systems — sounds like you're thinking about leveling up your operations.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">We're building AI-powered tools for small businesses that handle the stuff that eats your time: lead follow-up, content creation, client onboarding, booking automation. All trained on <em>your</em> brand voice and business data.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Most of our clients save <strong>10-15 hours per week</strong> after implementation. Systems start at <strong>$2,500</strong> with monthly maintenance plans.</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://${brand.company_website || 'newurbaninfluence.com'}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">BOOK A FREE AI STRATEGY CALL</a>
        </div>
        <p style="font-size:14px;color:#666;line-height:1.6;">15 minutes. I'll show you exactly what we could automate for ${visitor.company_name || 'your business'}.</p>
        ${buildEmailSignature(brand)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
        ${brand.agency_name}${brand.company_city ? ' • ' + brand.company_city : ''}<br>
        ${brand.company_website ? '<a href="https://'+brand.company_website+'" style="color:'+brand.brand_color+';">'+brand.company_website+'</a>' : ''}
    </div>
</div>`
        },

        // ── They looked at portfolio (browsing, interested) ──
        portfolio: {
            subject: `${firstName}, liked what you saw?`,
            html: `
<div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Syne',sans-serif;font-size:22px;margin:0;letter-spacing:2px;">NEW URBAN <span style="color:#dc2626;">INFLUENCE</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1.5px;margin:8px 0 0;">WE DON'T DESIGN. WE INFLUENCE.</p>
    </div>
    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">I noticed you were browsing our portfolio — hope you liked what you saw.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Every project in there started the same way: a business that knew they deserved better than what they had. We turned that feeling into a brand that actually works — one that attracts the right clients and makes the competition nervous.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">If ${visitor.company_name || 'your business'} is ready for that kind of transformation, I'd love to chat about what's possible.</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://${brand.company_website || 'newurbaninfluence.com'}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">LET'S TALK ABOUT YOUR BRAND</a>
        </div>
        ${buildEmailSignature(brand)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
        ${brand.agency_name}${brand.company_city ? ' • ' + brand.company_city : ''}<br>
        ${brand.company_website ? '<a href="https://'+brand.company_website+'" style="color:'+brand.brand_color+';">'+brand.company_website+'</a>' : ''}
    </div>
</div>`
        },

        // ── HOT LEAD — they hit the intake/booking page ──
        hot_lead: {
            subject: `${firstName}, still thinking it over?`,
            html: `
<div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Syne',sans-serif;font-size:22px;margin:0;letter-spacing:2px;">NEW URBAN <span style="color:#dc2626;">INFLUENCE</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1.5px;margin:8px 0 0;">WE DON'T DESIGN. WE INFLUENCE.</p>
    </div>
    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Looks like you got close to booking a call with us — wanted to make it as easy as possible.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Here's what happens when you book:</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">
            <strong>1.</strong> Quick 15-min strategy call (free, no pitch)<br>
            <strong>2.</strong> I'll audit your current brand and share honest feedback<br>
            <strong>3.</strong> You'll get a custom recommendation — no cookie-cutter proposals
        </p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Worst case, you walk away with free expert advice. Best case, we build something incredible together.</p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://${brand.company_website || 'newurbaninfluence.com'}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">FINISH BOOKING YOUR CALL</a>
        </div>
        <p style="font-size:14px;color:#666;line-height:1.6;">Or just reply to this email — I read every one.</p>
        ${buildEmailSignature(brand)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
        ${brand.agency_name}${brand.company_city ? ' • ' + brand.company_city : ''}<br>
        ${brand.company_website ? '<a href="https://'+brand.company_website+'" style="color:'+brand.brand_color+';">'+brand.company_website+'</a>' : ''}
    </div>
</div>`
        },

        // ── General / just browsed homepage ──
        general: {
            subject: `${firstName}, thanks for checking us out`,
            html: `
<div style="font-family:'Montserrat',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#111;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Syne',sans-serif;font-size:22px;margin:0;letter-spacing:2px;">NEW URBAN <span style="color:#dc2626;">INFLUENCE</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:1.5px;margin:8px 0 0;">WE DON'T DESIGN. WE INFLUENCE.</p>
    </div>
    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hey ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Thanks for stopping by New Urban Influence. We're a Detroit-based branding agency that helps small businesses and startups look like the real deal — because you are.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;">Whether you need a complete brand identity, a website that converts, AI-powered automation, or just a logo that doesn't look like it was made in 2003 — we've got you.</p>
        <p style="font-size:15px;line-height:1.7;color:#333;"><strong>What we're known for:</strong></p>
        <p style="font-size:15px;line-height:1.7;color:#333;">
            → Brand Identity Packages from $1,500<br>
            → AI Systems & Automation from $2,500<br>
            → Transparent pricing, no surprises<br>
            → Payment plans on everything
        </p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://${brand.company_website || 'newurbaninfluence.com'}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">BOOK A FREE STRATEGY CALL</a>
        </div>
        ${buildEmailSignature(brand)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#999;">
        ${brand.agency_name}${brand.company_city ? ' • ' + brand.company_city : ''}<br>
        ${brand.company_website ? '<a href="https://'+brand.company_website+'" style="color:'+brand.brand_color+';">'+brand.company_website+'</a>' : ''}
    </div>
</div>`
        }
    };

    // Fallbacks
    if (!templates[topInterest]) return templates.general;
    return templates[topInterest];
}

// ── Analyze visitor's page views to determine top interest ────────
function analyzeInterest(pageViews, currentUrl) {
    const scores = {};

    // Score all page views
    const allUrls = [...pageViews.map(pv => pv.captured_url), currentUrl].filter(Boolean);

    for (const url of allUrls) {
        try {
            const parsed = new URL(url);
            const hash = parsed.hash || '';
            const path = parsed.pathname + hash;

            // Check hash-based routing
            if (PAGE_INTERESTS[hash]) {
                const { interest, weight, label } = PAGE_INTERESTS[hash];
                scores[interest] = (scores[interest] || { total: 0, label }) ;
                scores[interest].total += weight;
            }

            // Check URL keywords
            const urlLower = path.toLowerCase();
            for (const [keyword, { interest, weight }] of Object.entries(URL_KEYWORDS)) {
                if (urlLower.includes(keyword)) {
                    scores[interest] = scores[interest] || { total: 0, label: interest };
                    scores[interest].total += weight;
                }
            }
        } catch (e) {
            // If URL can't be parsed, check raw string
            const urlLower = (url || '').toLowerCase();
            for (const [keyword, { interest, weight }] of Object.entries(URL_KEYWORDS)) {
                if (urlLower.includes(keyword)) {
                    scores[interest] = scores[interest] || { total: 0, label: interest };
                    scores[interest].total += weight;
                }
            }
        }
    }

    // Find highest scoring interest
    let topInterest = 'general';
    let topScore = 0;
    for (const [interest, data] of Object.entries(scores)) {
        if (data.total > topScore) {
            topScore = data.total;
            topInterest = interest;
        }
    }

    // Build page labels for template
    const pagesViewed = allUrls.map(url => {
        try {
            const hash = new URL(url).hash || '';
            return PAGE_INTERESTS[hash] || { label: url };
        } catch (e) {
            return { label: url };
        }
    });

    return { topInterest, pagesViewed: [...new Map(pagesViewed.map(p => [p.label, p])).values()] };
}

// ── Main: Send auto-email to identified visitor ──────────────────
async function sendVisitorEmail(visitorId, currentUrl) {
    // 1. Get visitor data
    const { data: visitor, error: vErr } = await supabase
        .from('identified_visitors')
        .select('*')
        .eq('id', visitorId)
        .single();

    if (vErr || !visitor) {
        console.log('Visitor not found:', visitorId);
        return { sent: false, reason: 'visitor_not_found' };
    }

    // 2. Must have email
    if (!visitor.business_email) {
        console.log('No email for visitor:', visitor.first_name, visitor.last_name);
        return { sent: false, reason: 'no_email' };
    }

    // 3. Check cooldown — no email if we sent one in last 7 days
    const cooldownDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEmails } = await supabase
        .from('visitor_auto_emails')
        .select('id')
        .eq('visitor_id', visitorId)
        .gte('sent_at', cooldownDate)
        .limit(1);

    if (recentEmails && recentEmails.length > 0) {
        console.log('Cooldown active for:', visitor.business_email);
        return { sent: false, reason: 'cooldown_active' };
    }

    // 4. Get all page views for this visitor
    const { data: pageViews } = await supabase
        .from('visitor_page_views')
        .select('captured_url, seen_at')
        .eq('visitor_id', visitorId)
        .order('seen_at', { ascending: true });

    // 5. Analyze interest
    const { topInterest, pagesViewed } = analyzeInterest(pageViews || [], currentUrl);
    console.log(`Visitor ${visitor.first_name} — top interest: ${topInterest}`);

    // 6. Get email template
    const template = getEmailTemplate(visitor, topInterest, pagesViewed);

    // 7. Send via Hostinger SMTP
    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

    // Resolve agency brand (agency_id in visitor record or event body)
    const agencyId = (visitor && visitor.agency_id) || null;
    const brand = await getBrand(agencyId);

    if (!SMTP_USER && !brand.smtp_user) {
        console.error('SMTP not configured');
        return { sent: false, reason: 'smtp_not_configured' };
    }

    const transporter = getTransporter(brand);

    await transporter.sendMail({
        from: getFromAddress(brand),
        to: visitor.business_email,
        subject: template.subject,
        html: template.html,
        replyTo: MAIL_FROM
    });

    console.log(`✅ Auto-email sent to ${visitor.business_email} (${topInterest})`);

    // 8. Log the email
    await supabase.from('visitor_auto_emails').insert({
        visitor_id: visitorId,
        email_to: visitor.business_email,
        subject: template.subject,
        interest_detected: topInterest,
        pages_analyzed: (pageViews || []).map(pv => pv.captured_url),
        sent_at: new Date().toISOString()
    });

    // 9. Update visitor status to 'contacted' if still 'new'
    if (visitor.status === 'new') {
        await supabase
            .from('identified_visitors')
            .update({ status: 'contacted', updated_at: new Date().toISOString() })
            .eq('id', visitorId);
    }

    return { sent: true, interest: topInterest, email: visitor.business_email };
}

// ── Netlify Function Handler ─────────────────────────────────────
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://newurbaninfluence.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    try {
        const { visitor_id, captured_url } = JSON.parse(event.body);
        if (!visitor_id) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'visitor_id required' }) };
        }

        const result = await sendVisitorEmail(visitor_id, captured_url);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
    } catch (err) {
        console.error('Auto-email error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
