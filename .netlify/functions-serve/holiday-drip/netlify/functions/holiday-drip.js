var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// netlify/functions/utils/agency-brand.js
var require_agency_brand = __commonJS({
  "netlify/functions/utils/agency-brand.js"(exports2, module2) {
    var NUI_DEFAULTS = {
      agency_name: "New Urban Influence",
      founder_name: "Faren Young",
      founder_title: "Founder",
      company_phone: "(248) 487-8747",
      company_city: "Detroit, Michigan",
      company_website: "newurbaninfluence.com",
      company_email: "info@newurbaninfluence.com",
      company_tagline: "We don't design. We influence.",
      logo_url: "https://newurbaninfluence.com/logo-nav-cropped.png",
      brand_color: "#dc2626",
      print_store_url: "https://newurbaninfluence.com/print",
      smtp_user: null,
      smtp_pass: null,
      openphone_key: null,
      openphone_number: null
    };
    async function getBrand2(agencyId) {
      if (!agencyId) return { ...NUI_DEFAULTS, _agencyId: null };
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn("[agency-brand] No Supabase env \u2014 returning NUI defaults");
        return { ...NUI_DEFAULTS };
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/agency_subaccounts?id=eq.${agencyId}&select=*&limit=1`,
          {
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const rows = await res.json();
        if (!rows || rows.length === 0) {
          console.warn(`[agency-brand] No row found for agency_id=${agencyId}`);
          return { ...NUI_DEFAULTS };
        }
        const row = rows[0];
        const keys = row.integrations_config || {};
        return {
          _agencyId: agencyId,
          // marks this as a sub-account — no NUI cred fallback
          agency_name: row.agency_name || NUI_DEFAULTS.agency_name,
          founder_name: row.founder_name || row.owner_name || NUI_DEFAULTS.founder_name,
          founder_title: row.founder_title || NUI_DEFAULTS.founder_title,
          company_phone: row.company_phone || row.owner_phone || NUI_DEFAULTS.company_phone,
          company_city: row.company_city || NUI_DEFAULTS.company_city,
          company_website: row.company_website || row.domain || NUI_DEFAULTS.company_website,
          company_email: row.company_email || row.owner_email || NUI_DEFAULTS.company_email,
          company_tagline: row.company_tagline || NUI_DEFAULTS.company_tagline,
          logo_url: row.logo_url || NUI_DEFAULTS.logo_url,
          brand_color: row.brand_color || NUI_DEFAULTS.brand_color,
          print_store_url: row.print_store_url || NUI_DEFAULTS.print_store_url,
          // Keys: check top-level columns THEN integrations_config JSONB
          smtp_user: row.smtp_user || keys.sendgrid || null,
          smtp_pass: row.smtp_pass || keys.sendgrid_pass || null,
          openphone_key: row.openphone_key || keys.openphone || null,
          openphone_number: row.openphone_number || keys.openphone_number || null,
          stripe_pk: row.stripe_pk || keys.stripe || null,
          stripe_sk: row.stripe_sk || keys.stripe_sk || null,
          ga4_id: keys.ga4 || null,
          meta_pixel: keys.meta_pixel || null,
          _raw: row
        };
      } catch (err) {
        console.error("[agency-brand] Lookup failed:", err.message);
        return { ...NUI_DEFAULTS };
      }
    }
    function hasSMTP(brand2) {
      if (!brand2._agencyId) return true;
      const keys = brand2._raw && brand2._raw.integrations_config || {};
      return !!(keys.email_key || brand2.smtp_user);
    }
    function hasOpenPhone(brand2) {
      const keys = brand2._raw && brand2._raw.integrations_config || {};
      return !!(brand2.openphone_key || keys.openphone) && !!(brand2.openphone_number || keys.openphone_number);
    }
    function getTransporter2(brand2) {
      const nodemailer2 = require("nodemailer");
      const isNUI = !brand2._agencyId;
      if (isNUI) {
        const user = process.env.HOSTINGER_EMAIL || process.env.SMTP_USER;
        const pass = process.env.HOSTINGER_PASSWORD || process.env.SMTP_PASS;
        if (!user || !pass) throw new Error("SMTP_NOT_CONFIGURED");
        return nodemailer2.createTransport({ host: "smtp.hostinger.com", port: 465, secure: true, auth: { user, pass } });
      }
      const keys = brand2._raw && brand2._raw.integrations_config || {};
      const provider = (keys.email_provider || "").toLowerCase();
      const emailKey = keys.email_key || brand2.smtp_pass || null;
      const emailFrom = keys.email_from || brand2.smtp_user || null;
      if (!emailKey) throw new Error("SMTP_NOT_CONFIGURED");
      const PROVIDERS = {
        sendgrid: { host: "smtp.sendgrid.net", port: 587, secure: false, auth: { user: "apikey", pass: emailKey } },
        gmail: { host: "smtp.gmail.com", port: 587, secure: false, auth: { user: emailFrom, pass: emailKey } },
        hostinger: { host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: emailFrom, pass: emailKey } },
        mailchimp: { host: "smtp.mandrillapp.com", port: 587, secure: false, auth: { user: emailFrom || "anyuser", pass: emailKey } },
        smtp: { host: keys.smtp_host || "smtp.hostinger.com", port: parseInt(keys.smtp_port) || 587, secure: false, auth: { user: emailFrom, pass: emailKey } }
      };
      let config = PROVIDERS[provider];
      if (!config) {
        if (emailKey.startsWith("SG.")) config = PROVIDERS.sendgrid;
        else if (emailFrom && emailFrom.includes("gmail.com")) config = PROVIDERS.gmail;
        else if (emailFrom && emailFrom.includes("hostinger")) config = PROVIDERS.hostinger;
        else config = { host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: emailFrom || emailKey, pass: emailKey } };
      }
      return nodemailer2.createTransport(config);
    }
    function getFromAddress2(brand2) {
      const isNUI = !brand2._agencyId;
      const keys = brand2._raw && brand2._raw.integrations_config || {};
      const email = keys.email_from || brand2.smtp_user || (isNUI ? process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL : null);
      if (!email) throw new Error("SMTP_NOT_CONFIGURED");
      const label = brand2.founder_name ? `${brand2.founder_name} | ${brand2.agency_name}` : brand2.agency_name;
      return `"${label}" <${email}>`;
    }
    function buildEmailFooter2(brand2) {
      return `
    <div style="padding:24px 28px;text-align:center;background:#0a0a0a;">
        <div style="margin-bottom:10px;">
            ${brand2.logo_url ? `<img src="${brand2.logo_url}" alt="${brand2.agency_name}" style="height:32px;opacity:0.7;">` : `<span style="font-family:'Syne','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);">${brand2.agency_name.toUpperCase()}</span>`}
        </div>
        ${brand2.company_tagline ? `<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.15);margin-bottom:10px;">${brand2.company_tagline}</div>` : ""}
        <p style="margin:0 0 6px;color:#444;font-size:11px;">
            ${[brand2.company_city, brand2.company_phone, brand2.company_website].filter(Boolean).join(" \xB7 ")}
        </p>
        <p style="margin:0;color:#333;font-size:10px;">You're receiving this because you're a valued client.</p>
    </div>`;
    }
    function buildEmailSignature(brand2) {
      return `
    <p style="font-size:15px;line-height:1.7;color:#333;margin-top:24px;">
        Talk soon,<br>
        <strong>${brand2.founder_name}</strong><br>
        ${brand2.founder_title ? `${brand2.founder_title}, ` : ""}${brand2.agency_name}<br>
        ${brand2.company_phone ? `<span style="color:#888;font-size:13px;">${brand2.company_phone}</span>` : ""}
    </p>
    <div style="border-top:1px solid #eee;margin-top:16px;padding-top:12px;font-size:11px;color:#aaa;">
        ${brand2.agency_name}${brand2.company_city ? ` \u2022 ${brand2.company_city}` : ""}<br>
        ${brand2.company_website ? `<a href="https://${brand2.company_website}" style="color:${brand2.brand_color};">${brand2.company_website}</a>` : ""}
    </div>`;
    }
    function buildSmsSystemPrompt(brand2) {
      return `You are Monty, the AI representative for ${brand2.agency_name}${brand2.company_city ? `, a creative agency in ${brand2.company_city}` : ""}. You handle SMS like a top-tier sales pro and customer service expert combined.

ROLE: Customer service \xB7 Appointment setter \xB7 Deal closer. You represent THE TEAM \u2014 never direct people to any individual by name unless they specifically ask. Refer to "our team", "we", "our strategists."

SELLING STYLE (Cardone/Hormozi):
- Assume the sale. Speak in outcomes not features.
- Handle objections with empathy + reframe. Price \u2192 value. Timing \u2192 urgency.
- Always move the conversation forward with a clear next step.
- Goal: book a strategy call OR close the deal.

SMS RULES: 1-3 sentences max. Direct. Human. No fluff. One emoji max.

CONVERSATION AWARENESS: You will receive the full SMS thread history. Read ALL of it. If the team already addressed something, build on it \u2014 don't repeat or contradict.

POLICIES: All sales final. Revisions included (2 rounds). Payment plans available (0% interest). If you can't resolve something, offer to have the team follow up today.

CONTACT:
${brand2.company_phone ? `Phone: ${brand2.company_phone}` : ""}
${brand2.company_email ? `Email: ${brand2.company_email}` : ""}
${brand2.company_website ? `Web: ${brand2.company_website}` : ""}`;
    }
    module2.exports = { getBrand: getBrand2, getTransporter: getTransporter2, getFromAddress: getFromAddress2, hasSMTP, hasOpenPhone, buildEmailFooter: buildEmailFooter2, buildEmailSignature, buildSmsSystemPrompt, NUI_DEFAULTS };
  }
});

// netlify/functions/holiday-drip.js
var nodemailer = require("nodemailer");
var { getBrand, getFromAddress, getTransporter, buildEmailFooter } = require_agency_brand();
function getHolidays(year) {
  return [
    { name: "Valentine's Day", slug: "valentines", date: new Date(year, 1, 14) },
    { name: "St. Patrick's Day", slug: "stpatricks", date: new Date(year, 2, 17) },
    { name: "Memorial Day", slug: "memorial", date: getLastMondayOfMay(year) },
    { name: "4th of July", slug: "july4th", date: new Date(year, 6, 4) },
    { name: "Labor Day", slug: "laborday", date: getFirstMondayOfSept(year) },
    { name: "Halloween", slug: "halloween", date: new Date(year, 9, 31) },
    { name: "Black Friday", slug: "blackfriday", date: getBlackFriday(year) },
    { name: "Christmas", slug: "christmas", date: new Date(year, 11, 25) },
    { name: "New Year's", slug: "newyears", date: new Date(year, 0, 1) }
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
  const d = new Date(year, 10, 1);
  let count = 0;
  while (count < 4) {
    if (d.getDay() === 4) count++;
    if (count < 4) d.setDate(d.getDate() + 1);
  }
  d.setDate(d.getDate() + 1);
  return d;
}
var weekTemplates = {
  8: {
    subject: (holiday) => `Is your business ready for ${holiday}?`,
    heading: (holiday) => `${holiday} is 60 days away`,
    body: (firstName, holiday) => `Hey ${firstName}, businesses that update their branding for ${holiday} see up to 23% more foot traffic during the holiday window. Now is the time to plan your signage, social graphics, and promotional materials.`,
    cta: "Plan Your Holiday Graphics"
  },
  7: {
    subject: (holiday) => `What your competitors are doing for ${holiday}`,
    heading: (holiday) => `${holiday} prep is happening now`,
    body: (firstName, holiday) => `${firstName}, smart business owners are already ordering updated signs, banners, and social media kits for ${holiday}. Don't let your storefront look the same while the competition stands out.`,
    cta: "Update Your Graphics"
  },
  6: {
    subject: (holiday) => `Your ${holiday} checklist \u2014 signage, social, print`,
    heading: (holiday) => `${holiday} Checklist`,
    body: (firstName, holiday) => `${firstName}, here's what top businesses update for ${holiday}: storefront banner, social media graphics, yard signs, menu or flyer updates, and business cards with seasonal messaging. We handle all of it \u2014 design included.`,
    cta: "See Print Products"
  },
  5: {
    subject: (holiday) => `Early bird ${holiday} printing \u2014 order now, skip the rush`,
    heading: (holiday) => `Beat the ${holiday} rush`,
    body: (firstName, holiday) => `${firstName}, orders are picking up for ${holiday}. Get ahead of the rush \u2014 order now and your prints ship overnight anywhere in Michigan for just $10. Design is always included.`,
    cta: "Order Early & Save Time"
  },
  4: {
    subject: (holiday) => `30 days to ${holiday} \u2014 customers are already planning`,
    heading: (holiday) => `30 days out from ${holiday}`,
    body: (firstName, holiday) => `${firstName}, your customers are already deciding where to spend their money this ${holiday}. Businesses with updated holiday branding get noticed first. A new banner, updated social graphics, or fresh yard signs can make the difference.`,
    cta: "Update Your Brand Now"
  },
  3: {
    subject: (holiday) => `Your ${holiday} window is closing`,
    heading: (holiday) => `3 weeks to ${holiday}`,
    body: (firstName, holiday) => `${firstName}, we ship overnight but designs take time to get right. If you want custom ${holiday} signage, social graphics, or banners, now is the sweet spot \u2014 enough time for revisions, fast enough to feel the urgency.`,
    cta: "Request Your Graphics"
  },
  2: {
    subject: (holiday) => `Last call for custom ${holiday} designs`,
    heading: (holiday) => `2 weeks \u2014 last call`,
    body: (firstName, holiday) => `${firstName}, this is your last comfortable window for custom ${holiday} graphics. After this week, we're in rush territory. Banners, signs, social kits \u2014 we can still turn it around fast. But don't wait.`,
    cta: "Rush My Order"
  },
  1: {
    subject: (holiday) => `Final week \u2014 we can still get you printed for ${holiday}`,
    heading: (holiday) => `Final week before ${holiday}`,
    body: (firstName, holiday) => `${firstName}, this is it. One week to ${holiday}. We can still design, print, and ship overnight to anywhere in Michigan. Yard signs, banners, business cards, social graphics \u2014 tell us what you need and we'll make it happen.`,
    cta: "Get It Done Now"
  }
};
var holidayThemes = {
  valentines: {
    accent: "#e11d48",
    accentLight: "#fda4af",
    accentDark: "#9f1239",
    gradient: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
    heroBg: "linear-gradient(135deg, #881337 0%, #4c0519 100%)",
    heroImg: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=500&fit=crop",
    tagline: "LOVE IS IN THE AIR \u2014 YOUR BRAND SHOULD BE TOO",
    emoji: "\u{1F495}"
  },
  stpatricks: {
    accent: "#16a34a",
    accentLight: "#86efac",
    accentDark: "#166534",
    gradient: "linear-gradient(135deg, #16a34a 0%, #166534 100%)",
    heroBg: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
    heroImg: "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?w=1200&h=500&fit=crop",
    tagline: "GO GREEN WITH YOUR BRAND THIS ST. PATRICK'S",
    emoji: "\u2618\uFE0F"
  },
  memorial: {
    accent: "#2563eb",
    accentLight: "#93c5fd",
    accentDark: "#1e40af",
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
    heroBg: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)",
    heroImg: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=1200&h=500&fit=crop",
    tagline: "HONOR THE WEEKEND \u2014 OWN THE FOOT TRAFFIC",
    emoji: "\u{1F1FA}\u{1F1F8}"
  },
  july4th: {
    accent: "#dc2626",
    accentLight: "#fca5a5",
    accentDark: "#991b1b",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #991b1b 100%)",
    heroBg: "linear-gradient(135deg, #0c1929 0%, #450a0a 100%)",
    heroImg: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1200&h=500&fit=crop",
    tagline: "MAKE YOUR BUSINESS THE MAIN EVENT THIS 4TH",
    emoji: "\u{1F386}"
  },
  laborday: {
    accent: "#d97706",
    accentLight: "#fcd34d",
    accentDark: "#92400e",
    gradient: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
    heroBg: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    heroImg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=500&fit=crop",
    tagline: "END OF SUMMER SALES START WITH THE RIGHT SIGNAGE",
    emoji: "\u2692\uFE0F"
  },
  halloween: {
    accent: "#f97316",
    accentLight: "#fdba74",
    accentDark: "#c2410c",
    gradient: "linear-gradient(135deg, #f97316 0%, #7c2d12 100%)",
    heroBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    heroImg: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&h=500&fit=crop",
    tagline: "SPOOKY SEASON SELLS \u2014 IS YOUR STOREFRONT READY?",
    emoji: "\u{1F383}"
  },
  thanksgiving: {
    accent: "#b45309",
    accentLight: "#fbbf24",
    accentDark: "#78350f",
    gradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
    heroBg: "linear-gradient(135deg, #451a03 0%, #292524 100%)",
    heroImg: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=1200&h=500&fit=crop",
    tagline: "GRATEFUL CUSTOMERS START WITH GREAT BRANDING",
    emoji: "\u{1F983}"
  },
  blackfriday: {
    accent: "#eab308",
    accentLight: "#fef08a",
    accentDark: "#a16207",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #3f3f46 100%)",
    heroBg: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    heroImg: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=500&fit=crop",
    tagline: "BIGGEST SHOPPING DAY = BIGGEST BRANDING OPPORTUNITY",
    emoji: "\u{1F3F7}\uFE0F"
  },
  christmas: {
    accent: "#dc2626",
    accentLight: "#fca5a5",
    accentDark: "#991b1b",
    gradient: "linear-gradient(135deg, #166534 0%, #14532d 100%)",
    heroBg: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
    heroImg: "https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=1200&h=500&fit=crop",
    tagline: "TIS THE SEASON TO STAND OUT",
    emoji: "\u{1F384}"
  },
  newyears: {
    accent: "#eab308",
    accentLight: "#fef08a",
    accentDark: "#a16207",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    heroBg: "linear-gradient(135deg, #0f0a3c 0%, #1e1b4b 100%)",
    heroImg: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&h=500&fit=crop",
    tagline: "NEW YEAR. NEW LOOK. NEW CUSTOMERS.",
    emoji: "\u{1F389}"
  }
};
var defaultTheme = {
  accent: "#dc2626",
  accentLight: "#fca5a5",
  accentDark: "#991b1b",
  gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  heroBg: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  heroImg: "",
  tagline: "YOUR BRAND DESERVES TO BE SEEN",
  emoji: "\u{1F3AF}"
};
var productImages = {
  social: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
  banner: "https://images.unsplash.com/photo-1588412079929-790b9f593d8e?w=400&h=300&fit=crop",
  yardsigns: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  businesscards: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop"
};
function buildHolidayEmail(firstName, holiday, week, printUrl, resolved, holidaySlug) {
  if (!resolved) return null;
  const theme = holidayThemes[holidaySlug] || defaultTheme;
  const daysLeft = week * 7;
  const weekNum = 9 - week;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet">
</head><body style="margin:0;padding:0;background:#111;">
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a;">

    <!-- ============ TOP BAR ============ -->
    <div style="background: #0a0a0a; padding: 12px 24px; text-align: center;">
        <span style="font-size: 12px; color: ${theme.accent}; font-weight: 700; letter-spacing: 1px;">${theme.emoji} ${daysLeft} DAYS UNTIL ${holiday.toUpperCase()} \u2014 DON'T WAIT ${theme.emoji}</span>
    </div>

    <!-- ============ HERO IMAGE + OVERLAY ============ -->
    <div style="position: relative; background: ${theme.heroBg};">
        <img src="${theme.heroImg}" alt="${holiday}" style="width: 100%; height: 280px; object-fit: cover; display: block; opacity: 0.4;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center;">
            <!-- LOGO -->
            <div style="margin-bottom: 16px;">
                <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.7);">NEW URBAN</span>
                <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: ${theme.accent};"> INFLUENCE</span>
            </div>
            <!-- COUNTDOWN -->
            <div style="background: rgba(0,0,0,0.5); border: 1px solid ${theme.accent}; border-radius: 8px; padding: 8px 24px; margin-bottom: 16px; display: inline-block;">
                <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 36px; color: ${theme.accent};">${daysLeft}</span>
                <span style="font-size: 13px; color: rgba(255,255,255,0.8); display: block; margin-top: -4px; letter-spacing: 2px; text-transform: uppercase;">DAYS LEFT</span>
            </div>
            <!-- HEADLINE -->
            <h1 style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 28px; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2;">${resolved.heading}</h1>
        </div>
    </div>

    <!-- ============ TAGLINE BAR ============ -->
    <div style="background: ${theme.accent}; padding: 14px 24px; text-align: center;">
        <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #fff;">${theme.tagline}</span>
    </div>

    <!-- ============ BODY COPY ============ -->
    <div style="padding: 32px 28px 16px;">
        <p style="font-size: 17px; line-height: 1.8; color: #d4d4d4; margin: 0 0 24px;">Hey ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.8; color: #a3a3a3; margin: 0 0 24px;">${resolved.body}</p>
    </div>

    <!-- ============ PRODUCT CARDS ============ -->
    <div style="padding: 0 28px 24px;">
        <p style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${theme.accent}; margin: 0 0 16px;">\u{1F525} HOLIDAY-READY PRODUCTS</p>

        <!-- Row 1: Two products -->
        <div style="margin-bottom: 12px;">
        <!--[if mso]><table role="presentation" width="100%"><tr><td width="50%" valign="top"><![endif]-->
        <div style="display: inline-block; width: 48%; vertical-align: top; margin-right: 2%;">
            <div style="background: #242424; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <img src="${productImages.social}" alt="Social Media Kit" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                <div style="padding: 14px;">
                    <p style="font-weight: 700; font-size: 14px; color: #fff; margin: 0 0 4px;">Social Media Kit</p>
                    <p style="font-size: 12px; color: #888; margin: 0 0 8px;">10 branded holiday templates</p>
                    <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 22px; color: ${theme.accent};">$195</span>
                </div>
            </div>
        </div>
        <!--[if mso]></td><td width="50%" valign="top"><![endif]-->
        <div style="display: inline-block; width: 48%; vertical-align: top;">
            <div style="background: #242424; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <img src="${productImages.banner}" alt="Storefront Banner" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                <div style="padding: 14px;">
                    <p style="font-weight: 700; font-size: 14px; color: #fff; margin: 0 0 4px;">Storefront Banner</p>
                    <p style="font-size: 12px; color: #888; margin: 0 0 8px;">Full-color vinyl, any size</p>
                    <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 22px; color: ${theme.accent};">$175</span>
                </div>
            </div>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
        </div>

        <!-- Row 2: Two products -->
        <div style="margin-bottom: 12px;">
        <div style="display: inline-block; width: 48%; vertical-align: top; margin-right: 2%;">
            <div style="background: #242424; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <img src="${productImages.yardsigns}" alt="Yard Signs" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                <div style="padding: 14px;">
                    <p style="font-weight: 700; font-size: 14px; color: #fff; margin: 0 0 4px;">Yard Signs (10pk)</p>
                    <p style="font-size: 12px; color: #888; margin: 0 0 8px;">Double-sided + stakes</p>
                    <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 22px; color: ${theme.accent};">$350</span>
                </div>
            </div>
        </div>
        <div style="display: inline-block; width: 48%; vertical-align: top;">
            <div style="background: #242424; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <img src="${productImages.businesscards}" alt="Business Cards" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                <div style="padding: 14px;">
                    <p style="font-weight: 700; font-size: 14px; color: #fff; margin: 0 0 4px;">Business Cards</p>
                    <p style="font-size: 12px; color: #888; margin: 0 0 8px;">250ct premium stock</p>
                    <span style="font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 22px; color: ${theme.accent};">$195</span>
                </div>
            </div>
        </div>
        </div>
    </div>

    <!-- ============ CTA BUTTON ============ -->
    <div style="padding: 0 28px 32px; text-align: center;">
        <a href="${printUrl}" style="display: block; background: ${theme.accent}; color: #fff; padding: 18px 40px; font-family: 'Syne', 'Helvetica Neue', Arial, sans-serif; font-weight: 800; font-size: 16px; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 2px;">${resolved.cta} \u2192</a>
        <p style="font-size: 12px; color: #555; margin: 12px 0 0;">\u26A1 24hr production \xB7 $10 overnight shipping anywhere in Michigan</p>
    </div>

    <!-- ============ SOCIAL PROOF BAR ============ -->
    <div style="background: #111; padding: 20px 28px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0; font-size: 13px; color: #888;">\u2B50\u2B50\u2B50\u2B50\u2B50 <span style="color: #fff; font-weight: 600;">4.9/5</span> from 50+ Michigan businesses \xB7 <span style="color: ${theme.accent}; font-weight: 600;">10+ years in business</span></p>
    </div>

    ${buildEmailFooter(brand)}

</div>
</body></html>`;
}
exports.handler = async (event) => {
  console.log("\u{1F384} Holiday drip check running...");
  let agencyId = null;
  try {
    const body = JSON.parse(event.body || "{}");
    agencyId = body.agency_id || null;
  } catch (e) {
  }
  const brand2 = await getBrand(agencyId);
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const SMTP_USER = process.env.HOSTINGER_EMAIL;
  const SMTP_PASS = process.env.HOSTINGER_PASSWORD;
  const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
  if (!SUPABASE_URL || !SUPABASE_KEY || !SMTP_USER || !SMTP_PASS) {
    console.error("Missing env vars");
    return { statusCode: 500, body: "Missing configuration" };
  }
  try {
    const tplRes = await fetch(
      `${SUPABASE_URL}/rest/v1/holiday_drip_templates?order=week_number.desc`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const dbTemplates2 = await tplRes.json();
    if (Array.isArray(dbTemplates2) && dbTemplates2.length > 0) {
      for (const t of dbTemplates2) {
        weekTemplates[t.week_number] = {
          subject: (holiday) => t.subject.replace(/\{\{holiday\}\}/g, holiday),
          heading: (holiday) => t.heading.replace(/\{\{holiday\}\}/g, holiday),
          body: (firstName, holiday) => t.body.replace(/\{\{firstName\}\}/g, firstName).replace(/\{\{holiday\}\}/g, holiday),
          cta: t.cta
        };
      }
      console.log(`\u{1F4DD} Loaded ${dbTemplates2.length} editable templates from Supabase`);
    }
  } catch (err) {
    console.warn("\u26A0\uFE0F Could not load templates from Supabase, using hardcoded defaults:", err.message);
  }
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const holidays = [
    ...getHolidays(currentYear),
    ...getHolidays(currentYear + 1)
  ];
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
    const diffDays = Math.round((holidayDate - today) / (1e3 * 60 * 60 * 24));
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
    console.log("No holiday emails due today.");
    return { statusCode: 200, body: JSON.stringify({ sent: 0, message: "No holiday emails due today" }) };
  }
  console.log(`Found ${matchedHolidays.length} holiday(s) needing emails:`, matchedHolidays.map((h) => `${h.name} (week ${h.week})`));
  const clientsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/clients?select=id,name,email,industry&email=not.is.null`,
    {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  const allClients = await clientsRes.json();
  if (!Array.isArray(allClients) || allClients.length === 0) {
    console.log("No clients found with emails.");
    return { statusCode: 200, body: JSON.stringify({ sent: 0, message: "No clients" }) };
  }
  console.log(`Sending to ${allClients.length} clients...`);
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  let sentCount = 0;
  let errors = [];
  let dbTemplates = {};
  try {
    const tplRes = await fetch(
      `${SUPABASE_URL}/rest/v1/holiday_drip_templates?select=*`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const tplRows = await tplRes.json();
    if (Array.isArray(tplRows)) {
      for (const row of tplRows) {
        dbTemplates[row.week_number] = row;
      }
      console.log(`\u{1F4DD} Loaded ${tplRows.length} editable templates from Supabase`);
    }
  } catch (e) {
    console.warn("\u26A0\uFE0F Could not load Supabase templates, using hardcoded:", e.message);
  }
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
        const dedupRes = await fetch(
          `${SUPABASE_URL}/rest/v1/holiday_email_log?client_email=eq.${encodeURIComponent(client.email)}&holiday_slug=eq.${encodeURIComponent(holiday.slug)}&week_number=eq.${holiday.week}&select=id&limit=1`,
          { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
        );
        const existing = await dedupRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
          console.log(`\u23ED\uFE0F Skip ${client.email} \u2014 already sent week ${holiday.week} for ${holiday.name}`);
          continue;
        }
        const firstName = (client.name || "there").split(" ")[0];
        const industry = client.industry || "";
        let printUrl = brand2.print_store_url || "https://newurbaninfluence.com/print";
        const params = [];
        if (industry) params.push(`industry=${encodeURIComponent(industry)}`);
        if (client.id) params.push(`client=${encodeURIComponent(client.id)}`);
        if (params.length) printUrl += "?" + params.join("&");
        const resolved = resolveTemplate(holiday.week, holiday.name, firstName);
        if (!resolved) continue;
        const html = buildHolidayEmail(firstName, holiday.name, holiday.week, printUrl, resolved, holiday.slug, brand2);
        if (!html) continue;
        await transporter.sendMail({
          from: getFromAddress(brand2),
          to: client.email,
          subject: resolved.subject,
          html
        });
        await fetch(`${SUPABASE_URL}/rest/v1/holiday_email_log`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            client_id: client.id,
            client_email: client.email,
            holiday: holiday.name,
            holiday_slug: holiday.slug,
            week_number: holiday.week,
            days_until: holiday.daysUntil,
            sent_at: (/* @__PURE__ */ new Date()).toISOString()
          })
        }).catch((err) => console.warn("Log failed:", err.message));
        sentCount++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Failed to send to ${client.email}:`, err.message);
        errors.push({ email: client.email, error: err.message });
      }
    }
  }
  const summary = {
    sent: sentCount,
    errors: errors.length,
    holidays: matchedHolidays.map((h) => `${h.name} (week ${h.week})`),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.log("\u{1F384} Holiday drip complete:", summary);
  return { statusCode: 200, body: JSON.stringify(summary) };
};
//# sourceMappingURL=holiday-drip.js.map
