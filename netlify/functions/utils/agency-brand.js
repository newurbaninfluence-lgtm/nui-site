// ═══════════════════════════════════════════════════════════════
// utils/agency-brand.js
// Resolves white-label sender identity for any agency sub-account.
// All drip/email/SMS functions call this before building messages.
//
// Usage:
//   const { getBrand } = require('./utils/agency-brand');
//   const brand = await getBrand(agencyId);   // returns brand object
//   const brand = await getBrand(null);        // returns NUI defaults
// ═══════════════════════════════════════════════════════════════

const NUI_DEFAULTS = {
    agency_name:     'New Urban Influence',
    founder_name:    'Faren Young',
    founder_title:   'Founder',
    company_phone:   '(248) 487-8747',
    company_city:    'Detroit, Michigan',
    company_website: 'newurbaninfluence.com',
    company_email:   'info@newurbaninfluence.com',
    company_tagline: "We don't design. We influence.",
    logo_url:        'https://newurbaninfluence.com/logo-nav-cropped.png',
    brand_color:     '#dc2626',
    print_store_url: 'https://newurbaninfluence.com/print',
    smtp_user:       null,
    smtp_pass:       null,
    openphone_key:   null,
    openphone_number:null,
};

async function getBrand(agencyId) {
    // _agencyId: null means NUI master — allowed to use env var credentials.
    // _agencyId: set means sub-account — must only use their own stored credentials.
    if (!agencyId) return { ...NUI_DEFAULTS, _agencyId: null };

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('[agency-brand] No Supabase env — returning NUI defaults');
        return { ...NUI_DEFAULTS };
    }

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/agency_subaccounts?id=eq.${agencyId}&select=*&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                },
            }
        );
        const rows = await res.json();
        if (!rows || rows.length === 0) {
            console.warn(`[agency-brand] No row found for agency_id=${agencyId}`);
            return { ...NUI_DEFAULTS };
        }
        const row = rows[0];
        // Wizard saves keys to integrations_config JSONB — read from there
        const keys = row.integrations_config || {};

        return {
            _agencyId:        agencyId,   // marks this as a sub-account — no NUI cred fallback
            agency_name:      row.agency_name     || NUI_DEFAULTS.agency_name,
            founder_name:     row.founder_name    || row.owner_name || NUI_DEFAULTS.founder_name,
            founder_title:    row.founder_title   || NUI_DEFAULTS.founder_title,
            company_phone:    row.company_phone   || row.owner_phone || NUI_DEFAULTS.company_phone,
            company_city:     row.company_city    || NUI_DEFAULTS.company_city,
            company_website:  row.company_website || row.domain || NUI_DEFAULTS.company_website,
            company_email:    row.company_email   || row.owner_email || NUI_DEFAULTS.company_email,
            company_tagline:  row.company_tagline || NUI_DEFAULTS.company_tagline,
            logo_url:         row.logo_url        || NUI_DEFAULTS.logo_url,
            brand_color:      row.brand_color     || NUI_DEFAULTS.brand_color,
            print_store_url:  row.print_store_url || NUI_DEFAULTS.print_store_url,
            // Keys: check top-level columns THEN integrations_config JSONB
            smtp_user:        row.smtp_user       || keys.sendgrid || null,
            smtp_pass:        row.smtp_pass       || keys.sendgrid_pass || null,
            openphone_key:    row.openphone_key   || keys.openphone || null,
            openphone_number: row.openphone_number|| keys.openphone_number || null,
            stripe_pk:        row.stripe_pk       || keys.stripe || null,
            stripe_sk:        row.stripe_sk       || keys.stripe_sk || null,
            ga4_id:           keys.ga4            || null,
            meta_pixel:       keys.meta_pixel     || null,
            _raw: row,
        };
    } catch (err) {
        console.error('[agency-brand] Lookup failed:', err.message);
        return { ...NUI_DEFAULTS };
    }
}

// Returns true if this brand has its own SMTP credentials configured.
// Sub-accounts that haven't provided SMTP keys must NOT fall back to NUI's credentials.
function hasSMTP(brand) {
    if (!brand._agencyId) return true; // NUI uses env vars
    const keys = (brand._raw && brand._raw.integrations_config) || {};
    return !!(keys.email_key || brand.smtp_user);
}

function hasOpenPhone(brand) {
    const keys = (brand._raw && brand._raw.integrations_config) || {};
    return !!(brand.openphone_key || keys.openphone) && !!(brand.openphone_number || keys.openphone_number);
}

function getTransporter(brand) {
    const nodemailer = require('nodemailer');
    const isNUI = !brand._agencyId;

    // NUI master → use env vars (Hostinger)
    if (isNUI) {
        const user = process.env.HOSTINGER_EMAIL || process.env.SMTP_USER;
        const pass = process.env.HOSTINGER_PASSWORD || process.env.SMTP_PASS;
        if (!user || !pass) throw new Error('SMTP_NOT_CONFIGURED');
        return nodemailer.createTransport({ host: 'smtp.hostinger.com', port: 465, secure: true, auth: { user, pass } });
    }

    // Sub-account → read from integrations_config
    const keys = (brand._raw && brand._raw.integrations_config) || {};
    const provider = (keys.email_provider || '').toLowerCase();
    const emailKey = keys.email_key || brand.smtp_pass || null;
    const emailFrom = keys.email_from || brand.smtp_user || null;

    if (!emailKey) throw new Error('SMTP_NOT_CONFIGURED');

    // Provider-specific SMTP configs
    const PROVIDERS = {
        sendgrid:  { host: 'smtp.sendgrid.net',     port: 587, secure: false, auth: { user: 'apikey', pass: emailKey } },
        gmail:     { host: 'smtp.gmail.com',         port: 587, secure: false, auth: { user: emailFrom, pass: emailKey } },
        hostinger: { host: 'smtp.hostinger.com',     port: 465, secure: true,  auth: { user: emailFrom, pass: emailKey } },
        mailchimp: { host: 'smtp.mandrillapp.com',   port: 587, secure: false, auth: { user: emailFrom || 'anyuser', pass: emailKey } },
        smtp:      { host: keys.smtp_host || 'smtp.hostinger.com', port: parseInt(keys.smtp_port) || 587, secure: false, auth: { user: emailFrom, pass: emailKey } }
    };

    // Auto-detect if no provider set
    let config = PROVIDERS[provider];
    if (!config) {
        if (emailKey.startsWith('SG.')) config = PROVIDERS.sendgrid;
        else if (emailFrom && emailFrom.includes('gmail.com')) config = PROVIDERS.gmail;
        else if (emailFrom && emailFrom.includes('hostinger')) config = PROVIDERS.hostinger;
        else config = { host: 'smtp.hostinger.com', port: 465, secure: true, auth: { user: emailFrom || emailKey, pass: emailKey } };
    }

    return nodemailer.createTransport(config);
}

function getFromAddress(brand) {
    const isNUI = !brand._agencyId;
    const keys = (brand._raw && brand._raw.integrations_config) || {};
    const email = keys.email_from || brand.smtp_user || (isNUI ? (process.env.MAIL_FROM || process.env.HOSTINGER_EMAIL) : null);
    if (!email) throw new Error('SMTP_NOT_CONFIGURED');
    const label = brand.founder_name
        ? `${brand.founder_name} | ${brand.agency_name}`
        : brand.agency_name;
    return `"${label}" <${email}>`; 
}

function buildEmailFooter(brand) {
    return `
    <div style="padding:24px 28px;text-align:center;background:#0a0a0a;">
        <div style="margin-bottom:10px;">
            ${brand.logo_url
                ? `<img src="${brand.logo_url}" alt="${brand.agency_name}" style="height:32px;opacity:0.7;">`
                : `<span style="font-family:'Syne','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.3);">${brand.agency_name.toUpperCase()}</span>`
            }
        </div>
        ${brand.company_tagline ? `<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.15);margin-bottom:10px;">${brand.company_tagline}</div>` : ''}
        <p style="margin:0 0 6px;color:#444;font-size:11px;">
            ${[brand.company_city, brand.company_phone, brand.company_website].filter(Boolean).join(' · ')}
        </p>
        <p style="margin:0;color:#333;font-size:10px;">You're receiving this because you're a valued client.</p>
    </div>`;
}

function buildEmailSignature(brand) {
    return `
    <p style="font-size:15px;line-height:1.7;color:#333;margin-top:24px;">
        Talk soon,<br>
        <strong>${brand.founder_name}</strong><br>
        ${brand.founder_title ? `${brand.founder_title}, ` : ''}${brand.agency_name}<br>
        ${brand.company_phone ? `<span style="color:#888;font-size:13px;">${brand.company_phone}</span>` : ''}
    </p>
    <div style="border-top:1px solid #eee;margin-top:16px;padding-top:12px;font-size:11px;color:#aaa;">
        ${brand.agency_name}${brand.company_city ? ` • ${brand.company_city}` : ''}<br>
        ${brand.company_website ? `<a href="https://${brand.company_website}" style="color:${brand.brand_color};">${brand.company_website}</a>` : ''}
    </div>`;
}

function buildSmsSystemPrompt(brand) {
    return `You are an AI customer service assistant for ${brand.agency_name}, a creative agency${brand.company_city ? ` in ${brand.company_city}` : ''}. You respond to client texts on behalf of ${brand.founder_name}.

RULES:
- Use "we" for the agency. Never mention "NUI" or "New Urban Influence" unless that IS this agency.
- Answer questions about services, pricing, project status.
- Direct complex issues to ${brand.founder_name}.
- If unsure, say "Let me check with ${brand.founder_name} and get back to you."

CONTACT:
${brand.company_phone ? `Phone: ${brand.company_phone}` : ''}
${brand.company_email ? `Email: ${brand.company_email}` : ''}
${brand.company_website ? `Web: ${brand.company_website}` : ''}
OWNER: ${brand.founder_name}${brand.founder_title ? `, ${brand.founder_title}` : ''}`;
}

module.exports = { getBrand, getTransporter, getFromAddress, hasSMTP, hasOpenPhone, buildEmailFooter, buildEmailSignature, buildSmsSystemPrompt, NUI_DEFAULTS };
