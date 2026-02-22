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

// ==================== BUILD EMAIL HTML ====================
function buildHolidayEmail(firstName, holiday, week, printUrl) {
    const template = weekTemplates[week];
    if (!template) return null;

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 32px; text-align: center;">
            <img src="https://newurbaninfluence.com/logo-nav-cropped.png" alt="NUI" style="height: 36px; margin-bottom: 16px;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800;">${template.heading(holiday)}</h1>
            <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Week ${9 - week} of 8 countdown</p>
        </div>
        <div style="padding: 32px;">
            <p style="font-size: 16px; line-height: 1.7; color: #ccc;">${template.body(firstName, holiday)}</p>
            <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #dc2626; margin: 0 0 12px;">Quick Picks</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;">Social Media Graphics Kit</td><td style="text-align: right; color: #dc2626; font-weight: 700; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">$195</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;">Storefront Banner</td><td style="text-align: right; color: #dc2626; font-weight: 700; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">$175</td></tr>
                    <tr><td style="padding: 8px 0; color: #fff; font-size: 14px;">Yard Signs (10 pack)</td><td style="text-align: right; color: #dc2626; font-weight: 700; font-size: 14px; padding: 8px 0;">$350</td></tr>
                </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${printUrl}" style="display: inline-block; background: #dc2626; color: #fff; padding: 16px 40px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px;">${template.cta}</a>
            </div>
            <p style="font-size: 13px; color: #555; text-align: center;">24hr production · $10 overnight shipping · Design included</p>
        </div>
        <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="margin: 0; color: #444; font-size: 11px;">New Urban Influence · Detroit, Michigan · (248) 487-8747</p>
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

    for (const holiday of matchedHolidays) {
        for (const client of allClients) {
            try {
                const firstName = (client.name || 'there').split(' ')[0];
                const industry = client.industry || '';
                let printUrl = 'https://newurbaninfluence.com/print';
                const params = [];
                if (industry) params.push(`industry=${encodeURIComponent(industry)}`);
                if (client.id) params.push(`client=${encodeURIComponent(client.id)}`);
                if (params.length) printUrl += '?' + params.join('&');

                const template = weekTemplates[holiday.week];
                if (!template) continue;

                const html = buildHolidayEmail(firstName, holiday.name, holiday.week, printUrl);
                if (!html) continue;

                await transporter.sendMail({
                    from: MAIL_FROM,
                    to: client.email,
                    subject: template.subject(holiday.name),
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
