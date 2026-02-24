// nui-tracking.js — Unified tracking: GA4 + Google Ads + Meta Pixel (Facebook/Instagram)
// Tracks page sections, scroll depth, CTA clicks → builds retargeting audiences
// Interest categories match RB2B auto-email templates for unified targeting across all platforms

(function() {
    'use strict';

    // ── Interest Categories (mirrors visitor-auto-email.js) ─────────
    const SECTION_INTERESTS = {
        'services':   { interest: 'branding',     label: 'Brand Identity Services' },
        'portfolio':  { interest: 'portfolio',    label: 'Portfolio' },
        'intake':     { interest: 'hot_lead',     label: 'Strategy Call Booking' },
        'about':      { interest: 'about',        label: 'About NUI' },
        'founder':    { interest: 'about',        label: 'Our Founder' },
        'blog':       { interest: 'content',      label: 'Blog & Resources' },
        'ai-system':  { interest: 'ai_systems',   label: 'AI Systems' },
        'ai-systems': { interest: 'ai_systems',   label: 'AI Systems' },
        'pricing':    { interest: 'pricing',      label: 'Pricing' },
        'contact':    { interest: 'hot_lead',     label: 'Contact' },
        'packages':   { interest: 'branding',     label: 'Brand Packages' },
        'web':        { interest: 'web_design',   label: 'Web Design' },
        'social':     { interest: 'social_media', label: 'Social Media' }
    };

    // ── Helpers: push to Google + Meta ────────────────────────────
    function track(eventName, params) {
        // Google dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: eventName, ...params });
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    }

    function metaTrack(eventName, params) {
        if (typeof fbq === 'function') {
            fbq('trackCustom', eventName, params);
        }
    }

    function metaStandard(eventName, params) {
        if (typeof fbq === 'function') {
            fbq('track', eventName, params || {});
        }
    }

    // ── 1. Track hash-based navigation ───────────────────────────
    let lastHash = '';
    const sessionInterests = new Set();

    function trackPageView() {
        const hash = (location.hash || '#').replace('#', '') || 'home';
        if (hash === lastHash) return;
        lastHash = hash;

        const section = SECTION_INTERESTS[hash] || { interest: 'general', label: hash };
        sessionInterests.add(section.interest);

        // Google: virtual pageview + section event
        track('page_view', {
            page_title: section.label,
            page_location: location.href,
            page_path: '/' + hash,
            nui_section: hash,
            nui_interest: section.interest
        });
        track('nui_section_view', {
            section_name: hash,
            interest_category: section.interest,
            section_label: section.label
        });

        // Meta: ViewContent with interest data (builds Custom Audiences)
        metaStandard('ViewContent', {
            content_name: section.label,
            content_category: section.interest,
            content_type: 'page_section',
            content_ids: [hash]
        });

        // Hot lead signals
        if (section.interest === 'hot_lead') {
            track('nui_high_intent', { action: 'viewed_booking_page', section: hash });
            metaStandard('InitiateCheckout', { content_name: 'Strategy Call Booking', content_category: 'hot_lead' });
        }
        if (section.interest === 'pricing') {
            track('nui_high_intent', { action: 'viewed_pricing', section: hash });
            metaStandard('ViewContent', { content_name: 'Pricing', content_category: 'pricing', value: 1 });
        }
    }

    window.addEventListener('hashchange', trackPageView);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

    // ── 2. Track CTA button clicks ──────────────────────────────
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('a, button');
        if (!btn) return;

        const text = (btn.textContent || '').trim().toLowerCase();
        const href = btn.getAttribute('href') || '';

        // Book a call / intake — conversion on ALL platforms
        if (href.includes('#intake') || href.includes('calendly') ||
            text.includes('book') || text.includes('strategy call') ||
            text.includes('get started') || text.includes('schedule')) {
            track('nui_cta_click', { cta_text: btn.textContent.trim(), cta_type: 'booking', interest_category: 'hot_lead' });
            track('conversion', { send_to: 'AW-XXXXXXXXXX/CONVERSION_LABEL', event_category: 'engagement', event_label: 'booking_click' });
            // Meta: Schedule event (standard event for bookings)
            metaStandard('Schedule', { content_name: 'Strategy Call', content_category: 'booking' });
        }

        // Portfolio clicks
        else if (href.includes('#portfolio') || text.includes('portfolio') || text.includes('our work')) {
            track('nui_cta_click', { cta_text: btn.textContent.trim(), cta_type: 'portfolio', interest_category: 'portfolio' });
            metaTrack('ViewPortfolio', { content_name: 'Portfolio' });
        }

        // Pricing clicks
        else if (href.includes('#pricing') || href.includes('#packages') || text.includes('pricing') || text.includes('package')) {
            track('nui_cta_click', { cta_text: btn.textContent.trim(), cta_type: 'pricing', interest_category: 'pricing' });
            metaTrack('ViewPricing', { content_name: 'Pricing', content_category: 'pricing' });
        }

        // AI systems clicks
        else if (href.includes('ai') || text.includes('ai') || text.includes('automat')) {
            track('nui_cta_click', { cta_text: btn.textContent.trim(), cta_type: 'ai_systems', interest_category: 'ai_systems' });
            metaTrack('ViewAISystems', { content_name: 'AI Systems', content_category: 'ai_systems' });
        }

        // Phone clicks
        else if (href.includes('tel:')) {
            track('nui_phone_click', { phone_number: href.replace('tel:', '') });
            metaStandard('Contact', { content_name: 'Phone Call', content_category: 'engagement' });
        }

        // Email clicks
        else if (href.includes('mailto:')) {
            track('nui_email_click', { email: href.replace('mailto:', '') });
            metaStandard('Contact', { content_name: 'Email', content_category: 'engagement' });
        }
    });

    // ── 3. Scroll depth tracking ─────────────────────────────────
    const scrollMilestones = [25, 50, 75, 90];
    const scrollFired = new Set();

    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        for (const milestone of scrollMilestones) {
            if (scrollPercent >= milestone && !scrollFired.has(milestone)) {
                scrollFired.add(milestone);
                track('nui_scroll_depth', { percent: milestone, page_section: lastHash || 'home' });
                // Meta: track deep scrollers for lookalike audiences
                if (milestone >= 75) {
                    metaTrack('DeepScroll', { percent: milestone, section: lastHash || 'home' });
                }
            }
        }
    }, { passive: true });

    // ── 4. Form submission tracking ──────────────────────────────
    document.addEventListener('submit', function(e) {
        const formId = (e.target.id || e.target.className || 'unknown');
        track('nui_form_submit', { form_id: formId, page_section: lastHash || 'home', interest_category: 'hot_lead' });
        track('conversion', { send_to: 'AW-XXXXXXXXXX/LEAD_LABEL', event_category: 'conversion', event_label: 'form_submission' });
        // Meta: Lead standard event (highest value for ad optimization)
        metaStandard('Lead', { content_name: 'Form Submission', content_category: lastHash || 'general' });
    });

    // ── 5. Time on site — engaged visitor (30s+) ─────────────────
    let engagementFired = false;
    setTimeout(function() {
        if (!engagementFired) {
            engagementFired = true;
            track('nui_engaged_visitor', { time_on_site: '30s', page_section: lastHash || 'home' });
            metaTrack('EngagedVisitor', { time_on_site: 30, section: lastHash || 'home' });
        }
    }, 30000);

    // ── 6. Session summary on exit ───────────────────────────────
    window.addEventListener('beforeunload', function() {
        if (sessionInterests.size > 0) {
            const interests = Array.from(sessionInterests);
            // Meta: fire FindLocation with all interests (good for Custom Audiences)
            metaTrack('SessionSummary', {
                interests: interests.join(','),
                interest_count: interests.length,
                top_interest: interests[interests.length - 1]
            });
        }
    });

    console.log('📊 NUI Tracking loaded — GA4 + Google Ads + Meta Pixel active');
})();
