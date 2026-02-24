// nui-tracking.js — Google Analytics 4 + Google Ads custom event tracking
// Tracks page sections, scroll depth, CTA clicks → builds retargeting audiences
// Interest categories match RB2B auto-email templates for unified targeting

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

    // ── Helper: push to dataLayer ────────────────────────────────
    function track(eventName, params) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: eventName, ...params });

        // Also fire via gtag if available
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }
    }

    // ── 1. Track hash-based navigation as virtual pageviews ──────
    let lastHash = '';

    function trackPageView() {
        const hash = (location.hash || '#').replace('#', '') || 'home';
        if (hash === lastHash) return;
        lastHash = hash;

        // Find matching interest category
        const section = SECTION_INTERESTS[hash] || { interest: 'general', label: hash };

        track('page_view', {
            page_title: section.label,
            page_location: location.href,
            page_path: '/' + hash,
            nui_section: hash,
            nui_interest: section.interest
        });

        // Fire interest-specific event for Google Ads audience building
        track('nui_section_view', {
            section_name: hash,
            interest_category: section.interest,
            section_label: section.label
        });

        // Hot lead signals — higher value events
        if (section.interest === 'hot_lead') {
            track('nui_high_intent', {
                action: 'viewed_booking_page',
                section: hash
            });
        }
        if (section.interest === 'pricing') {
            track('nui_high_intent', {
                action: 'viewed_pricing',
                section: hash
            });
        }
    }

    // Listen for hash changes (SPA navigation)
    window.addEventListener('hashchange', trackPageView);
    // Fire on initial load
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

        // Book a call / intake clicks — conversion event
        if (href.includes('#intake') || href.includes('calendly') ||
            text.includes('book') || text.includes('strategy call') ||
            text.includes('get started') || text.includes('schedule')) {
            track('nui_cta_click', {
                cta_text: btn.textContent.trim(),
                cta_type: 'booking',
                interest_category: 'hot_lead'
            });
            // Google Ads conversion event
            track('conversion', {
                send_to: 'AW-XXXXXXXXXX/CONVERSION_LABEL',
                event_category: 'engagement',
                event_label: 'booking_click'
            });
        }

        // Portfolio / work clicks
        else if (href.includes('#portfolio') || text.includes('portfolio') ||
                 text.includes('our work') || text.includes('case stud')) {
            track('nui_cta_click', {
                cta_text: btn.textContent.trim(),
                cta_type: 'portfolio',
                interest_category: 'portfolio'
            });
        }

        // Pricing / packages clicks
        else if (href.includes('#pricing') || href.includes('#packages') ||
                 text.includes('pricing') || text.includes('package')) {
            track('nui_cta_click', {
                cta_text: btn.textContent.trim(),
                cta_type: 'pricing',
                interest_category: 'pricing'
            });
        }

        // AI systems clicks
        else if (href.includes('ai') || text.includes('ai') ||
                 text.includes('automat')) {
            track('nui_cta_click', {
                cta_text: btn.textContent.trim(),
                cta_type: 'ai_systems',
                interest_category: 'ai_systems'
            });
        }

        // Phone number clicks
        else if (href.includes('tel:')) {
            track('nui_phone_click', {
                phone_number: href.replace('tel:', ''),
                event_category: 'engagement'
            });
        }

        // Email clicks
        else if (href.includes('mailto:')) {
            track('nui_email_click', {
                email: href.replace('mailto:', ''),
                event_category: 'engagement'
            });
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
                track('nui_scroll_depth', {
                    percent: milestone,
                    page_section: lastHash || 'home'
                });
            }
        }
    }, { passive: true });

    // ── 4. Form submission tracking ──────────────────────────────
    document.addEventListener('submit', function(e) {
        const form = e.target;
        const formId = form.id || form.className || 'unknown';

        track('nui_form_submit', {
            form_id: formId,
            page_section: lastHash || 'home',
            interest_category: 'hot_lead'
        });

        // Google Ads lead conversion
        track('conversion', {
            send_to: 'AW-XXXXXXXXXX/LEAD_LABEL',
            event_category: 'conversion',
            event_label: 'form_submission'
        });
    });

    // ── 5. Time on site engagement tracking ──────────────────────
    let engagementFired = false;
    setTimeout(function() {
        if (!engagementFired) {
            engagementFired = true;
            track('nui_engaged_visitor', {
                time_on_site: '30s',
                page_section: lastHash || 'home'
            });
        }
    }, 30000);

    // ── 6. Session interest summary (fires on page unload) ───────
    const sessionInterests = new Set();

    // Collect interests throughout session
    const origTrack = track;
    const sessionTracker = new MutationObserver(function() {});

    window.addEventListener('hashchange', function() {
        const hash = (location.hash || '').replace('#', '');
        const section = SECTION_INTERESTS[hash];
        if (section) sessionInterests.add(section.interest);
    });

    // On unload, fire summary event for audience building
    window.addEventListener('beforeunload', function() {
        if (sessionInterests.size > 0) {
            const interests = Array.from(sessionInterests);
            // Use sendBeacon for reliability during page unload
            const payload = JSON.stringify({
                event: 'nui_session_summary',
                interests: interests,
                interest_count: interests.length,
                top_interest: interests[interests.length - 1]
            });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(
                    'https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=YOUR_API_SECRET',
                    payload
                );
            }
        }
    });

    console.log('📊 NUI Tracking loaded — GA4 + Google Ads remarketing active');
})();
