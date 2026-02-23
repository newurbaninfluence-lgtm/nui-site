// holiday-drip.js — Netlify Scheduled Function
// Runs daily. Checks upcoming US holidays.
// Sends weekly countdown emails starting 60 days before each holiday.
// Emails upsell print products (social graphics, signage, banners).

const nodemailer = require('nodemailer');

// ==================== HOLIDAY CALENDAR ====================
// Returns holidays for a given year with their dates
function getHolidays(year) {
    return [
        { name: "Valentine's Day", slug: 'valentines', date: new Date(year, 1, 14) },
        { name: 'St. Patrick\'s Day', slug: 'stpatricks', date: new Date(year, 2, 17) },
        { name: 'Memorial Day', slug: 'memorial', date: getLastMondayOfMay(year) },
        { name: '4th of July', slug: 'july4th', date: new Date(year, 6, 4) },
        { name: 'Labor Day', slug: 'laborday', date: getFirstMondayOfSept(year) },
        { name: 'Halloween', slug: 'halloween', date: new Date(year, 9, 31) },
        { name: 'Black Friday', slug: 'blackfriday', date: getBlackFriday(year) },
        { name: 'Christmas', slug: 'christmas', date: new Date(year, 11, 25) },
        { name: "New Year's", slug: 'newyears', date: new Date(year, 0, 1) },
    ];
}

function getLastMondayOfMay(year) {
    const d = new Date(year, 4, 31);
    while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
    return d;
}
function getFirstMondayOfSept(year) {
    const d = new Date(year, 8, 1);
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return d;
}
function getBlackFriday(year) {
    // 4th Thursday of November + 1 day
    const d = new Date(year, 10, 1);
    let count = 0;
    while (count < 4) {
        if (d.getDay() === 4) count++;
        if (count < 4) d.setDate(d.getDate() + 1);
    }
    d.setDate(d.getDate() + 1); // Friday
    return d;
}

// ==================== EMAIL TEMPLATES ====================
const weekTemplates = {
    8: {
        subject: (holiday) => `Is your business ready for ${holiday}?`,
        heading: (holiday) => `${holiday} is 60 days away`,
        body: (firstName, holiday) => `Hey ${firstName}, businesses that update their branding for ${holiday} see up to 23% more foot traffic during the holiday window. Now is the time to plan your signage, social graphics, and promotional materials.`,
        cta: 'Plan Your Holiday Graphics'
    },
    7: {
        subject: (holiday) => `What your competitors are doing for ${holiday}`,
        heading: (holiday) => `${holiday} prep is happening now`,
        body: (firstName, holiday) => `${firstName}, smart business owners are already ordering updated signs, banners, and social media kits for ${holiday}. Don't let your storefront look the same while the competition stands out.`,
        cta: 'Update Your Graphics'
    },
    6: {
        subject: (holiday) => `Your ${holiday} checklist — signage, social, print`,
        heading: (holiday) => `${holiday} Checklist`,
        body: (firstName, holiday) => `${firstName}, here's what top businesses update for ${holiday}: storefront banner, social media graphics, yard signs, menu or flyer updates, and business cards with seasonal messaging. We handle all of it — design included.`,
        cta: 'See Print Products'
    },
    5: {
        subject: (holiday) => `Early bird ${holiday} printing — order now, skip the rush`,
        heading: (holiday) => `Beat the ${holiday} rush`,
        body: (firstName, holiday) => `${firstName}, orders are picking up for ${holiday}. Get ahead of the rush — order now and your prints ship overnight anywhere in Michigan for just $10. Design is always included.`,
        cta: 'Order Early & Save Time'
    },
    4: {
        subject: (holiday) => `30 days to ${holiday} — customers are already planning`,
        heading: (holiday) => `30 days out from ${holiday}`,
        body: (firstName, holiday) => `${firstName}, your customers are already deciding where to spend their money this ${holiday}. Businesses with updated holiday branding get noticed first. A new banner, updated social graphics, or fresh yard signs can make the difference.`,
        cta: 'Update Your Brand Now'
    },
    3: {
        subject: (holiday) => `Your ${holiday} window is closing`,
        heading: (holiday) => `3 weeks to ${holiday}`,
        body: (firstName, holiday) => `${firstName}, we ship overnight but designs take time to get right. If you want custom ${holiday} signage, social graphics, or banners, now is the sweet spot — enough time for revisions, fast enough to feel the urgency.`,
        cta: 'Request Your Graphics'
    },
    2: {
        subject: (holiday) => `Last call for custom ${holiday} designs`,
        heading: (holiday) => `2 weeks — last call`,
        body: (firstName, holiday) => `${firstName}, this is your last comfortable window for custom ${holiday} graphics. After this week, we're in rush territory. Banners, signs, social kits — we can still turn it around fast. But don't wait.`,
        cta: 'Rush My Order'
    },
    1: {
        subject: (holiday) => `Final week — we can still get you printed for ${holiday}`,
        heading: (holiday) => `Final week before ${holiday}`,
        body: (firstName, holiday) => `${firstName}, this is it. One week to ${holiday}. We can still design, print, and ship overnight to anywhere in Michigan. Yard signs, banners, business cards, social graphics — tell us what you need and we'll make it happen.`,
        cta: 'Get It Done Now'
    }
};

// ==================== HOLIDAY THEMES ====================
// Each holiday gets its own color palette and themed header image
const holidayThemes = {
    valentines: {
        accent: '#e11d48',
        gradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
        headerImg: 'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
        emoji: '💕'
    },
    stpatricks: {
        accent: '#16a34a',
        gradient: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)',
        headerImg: 'https://media.giphy.com/media/l0MYt5jPR6QX5APm0/giphy.gif',
        emoji: '☘️'
    },
    memorial: {
        accent: '#2563eb',
        gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)',
        headerImg: 'https://media.giphy.com/media/fYfCUkeriuMiRCJjNS/giphy.gif',
        emoji: '🇺🇸'
    },
    july4th: {
        accent: '#dc2626',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #991b1b 50%, #1e3a8a 100%)',
        headerImg: 'https://media.giphy.com/media/l0MYDzAElHm3SHKWQ/giphy.gif',
        emoji: '🎆'
    },
    laborday: {
        accent: '#d97706',
        gradient: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)',
        headerImg: 'https://media.giphy.com/media/26u4hHueRIOJBCmME/giphy.gif',
        emoji: '⚒️'
    },
    halloween: {
        accent: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #7c2d12 50%, #1a1a2e 100%)',
        headerImg: 'https://media.giphy.com/media/3o7TKSxTboDzOQiPCM/giphy.gif',
        emoji: '🎃'
    },
    thanksgiving: {
        accent: '#b45309',
        gradient: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        headerImg: 'https://media.giphy.com/media/l3fQezVIIjbUpjAis/giphy.gif',
        emoji: '🦃'
    },
    blackfriday: {
        accent: '#eab308',
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #3f3f46 100%)',
        headerImg: 'https://media.giphy.com/media/3o7TKVSE5isogWqnqo/giphy.gif',
        emoji: '🏷️'
    },
    christmas: {
        accent: '#dc2626',
        gradient: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
        headerImg: 'https://media.giphy.com/media/3otPoOxyDTXjzpMbIY/giphy.gif',
        emoji: '🎄'
    },
    newyears: {
        accent: '#eab308',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        headerImg: 'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif',
        emoji: '🎉'
    }
};

const defaultTheme = {
    accent: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    headerImg: '',
    emoji: '🎯'
};

// ==================== BUILD EMAIL HTML ====================
function buildHolidayEmail(firstName, holiday, week, printUrl, resolved, holidaySlug) {
    if (!resolved) return null;
    const theme = holidayThemes[holidaySlug] || defaultTheme;

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; border-radius: 12px; overflow: hidden;">
        <!-- HEADER with holiday theme -->
        <div style="background: ${theme.gradient}; padding: 32px 32px 24px; text-align: center;">
            <!-- Syne-style text logo -->
            <div style="margin-bottom: 20px;">
                <span style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; font-size: 18px; letter-spacing: 3px; text-transform: uppercase; color: #fff;">NEW URBAN </span><span style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; font-size: 18px; letter-spacing: 3px; text-transform: uppercase; color: ${theme.accent};">INFLUENCE</span>
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 4px;">We don't design. We influence.</div>
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800;">${theme.emoji} ${resolved.heading}</h1>
            <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Week ${9 - week} of 8 countdown</p>
        </div>
        ${theme.headerImg ? `
        <!-- Holiday themed image -->
        <div style="text-align: center; background: #111;">
            <img src="${theme.headerImg}" alt="${holiday}" style="width: 100%; max-height: 200px; object-fit: cover; display: block;">
        </div>` : ''}
        <div style="padding: 32px;">
            <p style="font-size: 16px; line-height: 1.7; color: #ccc;">${resolved.body}</p>
            <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${theme.accent}; margin: 0 0 12px;">Quick Picks</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;">Social Media Graphics Kit</td><td style="text-align: right; color: ${theme.accent}; font-weight: 700; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">$195</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;">Storefront Banner</td><td style="text-align: right; color: ${theme.accent}; font-weight: 700; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">$175</td></tr>
                    <tr><td style="padding: 8px 0; color: #fff; font-size: 14px;">Yard Signs (10 pack)</td><td style="text-align: right; color: ${theme.accent}; font-weight: 700; font-size: 14px; padding: 8px 0;">$350</td></tr>
                </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${printUrl}" style="display: inline-block; background: ${theme.accent}; color: #fff; padding: 16px 40px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px;">${resolved.cta}</a>
            </div>
            <p style="font-size: 13px; color: #555; text-align: center;">24hr production · $10 overnight shipping · Design included</p>
        </div>
        <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="margin: 0; color: #555; font-size: 11px;">New Urban Influence · Detroit, Michigan · (248) 487-8747</p>
        </div>
    </div>`;
}

// ==================== MAIN HANDLER ====================
exports.handler = async (event) => {
    console.log('🎄 Holiday drip check running...');

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const SMTP_USER = process.env.HOSTINGER_EMAIL;
    const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
    const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

    if (!SUPABASE_URL || !SUPABASE_KEY || !SMTP_USER || !SMTP_PASS) {
        console.error('Missing env vars');
        return { statusCode: 500, body: 'Missing configuration' };
    }

    // Try to load editable templates from Supabase (fall back to hardcoded)
    try {
        const tplRes = await fetch(
            `${SUPABASE_URL}/rest/v1/holiday_drip_templates?order=week_number.desc`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const dbTemplates = await tplRes.json();
        if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
            for (const t of dbTemplates) {
                weekTemplates[t.week_number] = {
                    subject: (holiday) => t.subject.replace(/\{\{holiday\}\}/g, holiday),
                    heading: (holiday) => t.heading.replace(/\{\{holiday\}\}/g, holiday),
                    body: (firstName, holiday) => t.body.replace(/\{\{firstName\}\}/g, firstName).replace(/\{\{holiday\}\}/g, holiday),
                    cta: t.cta
                };
            }
            console.log(`📝 Loaded ${dbTemplates.length} editable templates from Supabase`);
        }
    } catch (err) {
        console.warn('⚠️ Could not load templates from Supabase, using hardcoded defaults:', err.message);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Get holidays for this year and next (for New Year's)
    const holidays = [
        ...getHolidays(currentYear),
        ...getHolidays(currentYear + 1)
    ];

    // Check which holidays need emails today
    // Send days: 60, 53, 46, 39, 32, 25, 18, 11 days before (weeks 8-1)
    const sendDays = [
        { days: 60, week: 8 },
        { days: 53, week: 7 },
        { days: 46, week: 6 },
        { days: 39, week: 5 },
        { days: 32, week: 4 },
        { days: 25, week: 3 },
        { days: 18, week: 2 },
        { days: 11, week: 1 }
    ];

    const matchedHolidays = [];
    for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((holidayDate - today) / (1000 * 60 * 60 * 24));

        for (const sd of sendDays) {
            if (diffDays === sd.days) {
                matchedHolidays.push({
                    ...holiday,
                    week: sd.week,
                    daysUntil: diffDays
                });
            }
        }
    }

    if (matchedHolidays.length === 0) {
        console.log('No holiday emails due today.');
        return { statusCode: 200, body: JSON.stringify({ sent: 0, message: 'No holiday emails due today' }) };
    }

    console.log(`Found ${matchedHolidays.length} holiday(s) needing emails:`, matchedHolidays.map(h => `${h.name} (week ${h.week})`));

    // Fetch all clients with email addresses from Supabase
    const clientsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/clients?select=id,name,email,industry&email=not.is.null`,
        {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        }
    );
    const allClients = await clientsRes.json();
    if (!Array.isArray(allClients) || allClients.length === 0) {
        console.log('No clients found with emails.');
        return { statusCode: 200, body: JSON.stringify({ sent: 0, message: 'No clients' }) };
    }

    console.log(`Sending to ${allClients.length} clients...`);

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    let sentCount = 0;
    let errors = [];

    // Fetch editable templates from Supabase (fall back to hardcoded if unavailable)
    let dbTemplates = {};
    try {
        const tplRes = await fetch(
            `${SUPABASE_URL}/rest/v1/holiday_drip_templates?select=*`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const tplRows = await tplRes.json();
        if (Array.isArray(tplRows)) {
            for (const row of tplRows) {
                dbTemplates[row.week_number] = row;
            }
            console.log(`📝 Loaded ${tplRows.length} editable templates from Supabase`);
        }
    } catch (e) {
        console.warn('⚠️ Could not load Supabase templates, using hardcoded:', e.message);
    }

    // Helper: resolve template — Supabase version uses {{holiday}} / {{firstName}} placeholders
    function resolveTemplate(weekNum, holidayName, firstName) {
        const db = dbTemplates[weekNum];
        if (db) {
            return {
                subject: db.subject.replace(/\{\{holiday\}\}/g, holidayName).replace(/\{\{firstName\}\}/g, firstName),
                heading: db.heading.replace(/\{\{holiday\}\}/g, holidayName).replace(/\{\{firstName\}\}/g, firstName),
                body: db.body.replace(/\{\{holiday\}\}/g, holidayName).replace(/\{\{firstName\}\}/g, firstName),
                cta: db.cta.replace(/\{\{holiday\}\}/g, holidayName).replace(/\{\{firstName\}\}/g, firstName)
            };
        }
        // Fallback to hardcoded
        const hc = weekTemplates[weekNum];
        if (!hc) return null;
        return {
            subject: hc.subject(holidayName),
            heading: hc.heading(holidayName),
            body: hc.body(firstName, holidayName),
            cta: hc.cta
        };
    }

    for (const holiday of matchedHolidays) {
        for (const client of allClients) {
            try {
                // DEDUP CHECK — skip if already sent this week for this holiday
                const dedupRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/holiday_email_log?client_email=eq.${encodeURIComponent(client.email)}&holiday_slug=eq.${encodeURIComponent(holiday.slug)}&week_number=eq.${holiday.week}&select=id&limit=1`,
                    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
                );
                const existing = await dedupRes.json();
                if (Array.isArray(existing) && existing.length > 0) {
                    console.log(`⏭️ Skip ${client.email} — already sent week ${holiday.week} for ${holiday.name}`);
                    continue;
                }

                const firstName = (client.name || 'there').split(' ')[0];
                const industry = client.industry || '';
                let printUrl = 'https://newurbaninfluence.com/print';
                const params = [];
                if (industry) params.push(`industry=${encodeURIComponent(industry)}`);
                if (client.id) params.push(`client=${encodeURIComponent(client.id)}`);
                if (params.length) printUrl += '?' + params.join('&');

                const resolved = resolveTemplate(holiday.week, holiday.name, firstName);
                if (!resolved) continue;

                const html = buildHolidayEmail(firstName, holiday.name, holiday.week, printUrl, resolved, holiday.slug);
                if (!html) continue;

                await transporter.sendMail({
                    from: MAIL_FROM,
                    to: client.email,
                    subject: resolved.subject,
                    html: html
                });

                // Log to Supabase
                await fetch(`${SUPABASE_URL}/rest/v1/holiday_email_log`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        client_id: client.id,
                        client_email: client.email,
                        holiday: holiday.name,
                        holiday_slug: holiday.slug,
                        week_number: holiday.week,
                        days_until: holiday.daysUntil,
                        sent_at: new Date().toISOString()
                    })
                }).catch(err => console.warn('Log failed:', err.message));

                sentCount++;

                // Small delay to avoid SMTP rate limits
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.error(`Failed to send to ${client.email}:`, err.message);
                errors.push({ email: client.email, error: err.message });
            }
        }
    }

    const summary = {
        sent: sentCount,
        errors: errors.length,
        holidays: matchedHolidays.map(h => `${h.name} (week ${h.week})`),
        timestamp: new Date().toISOString()
    };

    console.log('🎄 Holiday drip complete:', summary);
    return { statusCode: 200, body: JSON.stringify(summary) };
};
