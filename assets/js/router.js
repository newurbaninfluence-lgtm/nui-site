// ==================== PER-PAGE SEO METADATA ====================
const pageSEO = {
    home: {
        title: 'New Urban Influence | Detroit Branding Agency — Logo Design & Brand Identity from $1,500',
        description: 'Detroit branding agency for small businesses and startups. Professional brand identity packages from $1,500 — logo design, packaging, social media templates, brand guidelines. 4.9★ rated. Free consultation. Serving Metro Detroit, Southfield, Royal Oak, Ann Arbor and all of Michigan.',
        keywords: 'branding agency detroit, logo design detroit, brand identity detroit, graphic design agency detroit, detroit creative agency, michigan branding agency, affordable branding packages, small business branding detroit, packaging design detroit, branding near me, best branding agency detroit',
        ogTitle: 'New Urban Influence | Detroit Branding Agency — Packages from $1,500',
        ogDescription: 'Professional branding for small businesses. Logo design, brand identity, packaging, social media templates. 4.9★ rated. Free consultation. Payment plans available.',
        hash: ''
    },
    about: {
        title: 'About New Urban Influence | Detroit Branding & Graphic Design Agency Team',
        description: 'New Urban Influence is a Detroit-based branding and graphic design agency helping small businesses and startups build professional brand identities. 4.9★ rated with 28+ reviews. Brand strategists and designers serving Metro Detroit, Michigan, and nationwide.',
        keywords: 'about new urban influence, detroit branding agency team, detroit graphic design agency, michigan brand strategist, detroit graphic designers, who is new urban influence, nui detroit, creative agency detroit michigan',
        ogTitle: 'About New Urban Influence | Detroit Branding Agency',
        ogDescription: 'Detroit branding agency helping small businesses build professional brands. 4.9★ rated. 50+ brands elevated.',
        hash: 'about'
    },
    founder: {
        title: 'Faren Young — Founder & Creative Director | New Urban Influence Detroit',
        description: 'Meet Faren Young (Martez Hand), founder of New Urban Influence and former owner of Bravo Graphix on Detroit\'s Avenue of Fashion. 20+ years building bold brands for businesses, unions, nonprofits, and government agencies across Michigan.',
        keywords: 'faren young, martez hand, bravo graphix detroit, new urban influence founder, detroit creative director, avenue of fashion detroit, detroit brand designer, detroit graphic designer, michigan branding expert',
        ogTitle: 'Faren Young — Founder of New Urban Influence',
        ogDescription: 'Native Detroiter with 20+ years crafting bold brands. From Bravo Graphix on the Avenue of Fashion to New Urban Influence.',
        hash: 'founder'
    },
    services: {
        title: 'Branding Packages & Pricing | Detroit Logo Design & Brand Identity — New Urban Influence',
        description: 'Branding packages for small businesses: Brand Kit $1,500, Service Brand Identity $4,500+, Product Brand Identity $5,500+. Logo design from $500. Packaging design, print design, banners, posters, yard signs, vinyl decals, social media templates, business cards, brand guidelines. Payment plans. Detroit, MI.',
        keywords: 'branding packages detroit, logo design cost detroit, how much does branding cost, brand identity pricing michigan, packaging design detroit michigan, business card design detroit, social media templates design, print design detroit, banner design detroit, yard sign design detroit, vinyl decal design detroit, vehicle magnets detroit, postcard printing detroit, acrylic signs detroit, dibond signs detroit, foam core detroit, affordable branding small business, logo design near me, branding payment plans, brand guidelines cost',
        ogTitle: 'Branding Packages & Pricing | From $1,500',
        ogDescription: 'Brand Kit $1,500 • Service Brand $4,500+ • Product Brand $5,500+. Logo, packaging, social templates. Payment plans available.',
        hash: 'services'
    },
    portfolio: {
        title: 'Branding Portfolio | Detroit Logo Design & Brand Identity Work — New Urban Influence',
        description: 'View New Urban Influence\'s branding portfolio. Logo design, packaging design, brand guidelines, visual identity systems, social media branding for small businesses, startups, and product brands. Detroit, Michigan.',
        keywords: 'branding portfolio detroit, logo design examples detroit, brand identity portfolio michigan, packaging design examples, detroit graphic design portfolio, branding work samples, logo designer portfolio',
        ogTitle: 'Branding Portfolio | Logo Design & Brand Identity',
        ogDescription: 'See the brands we\'ve elevated. Logo design, packaging, brand systems and more. 50+ brands transformed.',
        hash: 'portfolio'
    },
    blog: {
        title: 'Branding Tips & Design Blog | Small Business Branding Advice — New Urban Influence Detroit',
        description: 'Expert branding tips for small businesses. Learn about logo design best practices, brand strategy, packaging design, social media marketing, and how to build a professional brand identity on any budget. From Detroit\'s top-rated branding agency.',
        keywords: 'branding tips small business, logo design tips, brand strategy blog, small business branding advice detroit, how to build a brand, design insights, social media marketing tips, packaging design tips, branding on a budget',
        ogTitle: 'Branding Tips & Design Blog | Small Business Advice',
        ogDescription: 'Expert branding tips and design insights. Learn how to build a professional brand on any budget.',
        hash: 'blog'
    },
    portal: {
        title: 'Client Portal | New Urban Influence — Project Tracking & Proof Review',
        description: 'Access your New Urban Influence client portal. Review design proofs, approve projects, track progress, view invoices, and communicate with your design team in real time.',
        keywords: 'client portal, design proof review, project tracking, branding project portal, new urban influence login',
        ogTitle: 'Client Portal | Project Tracking & Proofs',
        ogDescription: 'Review proofs, approve designs, track your project, and communicate with your NUI team.',
        hash: 'portal'
    },
    intake: {
        title: 'Get Started | Free Branding Consultation — New Urban Influence Detroit',
        description: 'Start your branding project with New Urban Influence. Fill out our quick intake form and book a free strategy consultation. We\'ll create a custom pricing estimate based on your business needs. No obligation.',
        keywords: 'free branding consultation detroit, get branding quote, start branding project, brand identity consultation, design agency intake form',
        ogTitle: 'Get Started | Free Branding Consultation',
        ogDescription: 'Book a free strategy call. Get a custom pricing estimate. No obligation. Start building your brand today.',
        hash: 'intake'
    }
};

function updatePageSEO(viewName) {
    const seo = pageSEO[viewName] || pageSEO.home;

    // Update document title
    document.title = seo.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = seo.description;

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.content = seo.keywords;

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = seo.hash ? `https://newurbaninfluence.com/#${seo.hash}` : 'https://newurbaninfluence.com';

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = seo.ogTitle;
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = seo.ogDescription;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = seo.hash ? `https://newurbaninfluence.com/#${seo.hash}` : 'https://newurbaninfluence.com';

    // Update Twitter tags
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = seo.ogTitle;
    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = seo.ogDescription;

    // Update URL hash (for bookmarking and sharing)
    if (seo.hash) {
        history.replaceState({ view: viewName }, seo.title, `#${seo.hash}`);
    } else {
        history.replaceState({ view: 'home' }, seo.title, window.location.pathname);
    }
}

function showView(viewName, skipTracking = false) {
    // If portal/admin requested on marketing site, redirect to app shell
    if (viewName === 'portal' && !document.getElementById('portalView')) {
        window.location.href = '/app/';
        return;
    }
    // Track navigation for back button functionality
    if (!skipTracking && typeof trackNavigation === 'function') {
        const currentView = document.querySelector('.view.active');
        if (currentView) {
            trackNavigation(currentView.id.replace('View', ''));
        }
    }
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
    window.scrollTo(0, 0);
    loadViewContent(viewName);

    // Update page-level SEO for this view
    updatePageSEO(viewName);
}

function scrollToContact() {
    showView('intake');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

function loadViewContent(viewName) {
    const viewEl = document.getElementById(viewName + 'View');
    if (!viewEl.innerHTML.trim()) {
        if (viewName === 'home') loadHomeView();
        if (viewName === 'about') loadAboutView();
        if (viewName === 'founder') loadFounderView();
        if (viewName === 'services') loadServicesView();
        if (viewName === 'portfolio') loadPortfolioView();
        if (viewName === 'blog') loadBlogView();
        if (viewName === 'portal') loadPortalView();
        if (viewName === 'intake') {
            // Default to free consultation if no specific service was pre-selected
            if (!intakeData || !intakeData.serviceId) {
                intakeData = { serviceId: 'consultation', serviceName: 'Free Strategy Call', price: 0, customServices: [] };
                currentIntakeStep = 1;
                uploadedFiles = [];
            }
            renderIntakeWizard(intakeData.serviceId);
        }
    }
}

// Update site logos from CMS
function updateSiteLogos() {
    // Update main nav logo
    const mainNavLogo = document.getElementById('mainNavLogo');
    if (mainNavLogo) {
        if (siteImages.headerLogo?.url) {
            mainNavLogo.innerHTML = `<img loading="lazy" src="${siteImages.headerLogo.url}" alt="New Urban Influence – Detroit Branding Agency" style="height: 36px; display: block;"><span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">NUI | New Urban Influence</span>`;
        }
        // If no CMS logo, the default icons/icon-192.png img + sr-only text from HTML stays as-is
    }

    // Update admin header logo
    const adminHeaderLogo = document.getElementById('adminHeaderLogo');
    if (adminHeaderLogo && siteImages.headerLogo?.url) {
        adminHeaderLogo.src = siteImages.headerLogo.url;
    }

    // Update hero taglines from CMS
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle && siteImages.tagline) {
        heroTitle.innerHTML = `BUILD YOUR<br><span class="text-red">${siteImages.tagline.split(' ').pop() || 'EMPIRE'}</span>`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // If we're in the app shell (/app/), skip marketing router — app has its own init
    const currentPath = window.location.pathname.replace(/^\//, '').split('/')[0];
    if (currentPath === 'app') return;

    initializeTheme();
    updateSiteLogos();

    // Apply CMS service images to data-service-image elements
    document.querySelectorAll('[data-service-image]').forEach(function(img) {
        var serviceId = img.getAttribute('data-service-image');
        var cmsUrl = getServiceImage(serviceId);
        if (cmsUrl) img.src = cmsUrl;
    });

    // Route to correct view based on URL path OR hash (supports direct links & bookmarks)
    const validViews = ['home', 'about', 'founder', 'services', 'portfolio', 'blog', 'intake'];
    const hashView = window.location.hash.replace('#', '').split('?')[0];
    const pathView = window.location.pathname.replace(/^\//, '').split('/')[0].split('?')[0];

    // Redirect portal/app routes to the dedicated app shell
    // (only if we're on the marketing site — not already in /app/)
    if ((pathView === 'portal' || pathView === 'app') && !document.getElementById('portalView')) {
        window.location.href = '/app/';
        return;
    }

    const routeView = (hashView && validViews.includes(hashView)) ? hashView
        : (pathView && validViews.includes(pathView)) ? pathView
        : null;
    // Try to load portfolio from cloud BEFORE rendering (so mobile gets real image URLs)
    try {
        if (window.NuiPortfolioSync && typeof NuiPortfolioSync.load === 'function') {
            const cloudData = await Promise.race([
                NuiPortfolioSync.load(),
                new Promise(resolve => setTimeout(() => resolve(null), 3000)) // 3s timeout
            ]);
            if (cloudData && cloudData.length > 0) {
                // Merge cloud data but fix broken image refs using defaults
                portfolioData = cloudData.map(function(item, idx) {
                    var fallback = _defaultPortfolio[idx] || _defaultPortfolio[0];
                    if (!item.img || item.img.startsWith('idb://') || item.img === '[too-large]') {
                        item.img = fallback.img;
                    }
                    if (item.assets) {
                        ['primaryLogo','secondaryLogo','iconMark'].forEach(function(k) {
                            if (item.assets[k] && (item.assets[k].startsWith('idb://') || item.assets[k] === '[too-large]')) {
                                item.assets[k] = (fallback.assets && fallback.assets[k]) ? fallback.assets[k] : '';
                            }
                        });
                    }
                    // Sync names from defaults
                    if (fallback && item.id === fallback.id) item.name = fallback.name;
                    return item;
                });
                try { localStorage.setItem('nui_portfolio', JSON.stringify(portfolioData)); } catch(e) {}
                console.log('✅ Portfolio pre-loaded from cloud before render');
            }
        }
    } catch(e) { console.log('Cloud portfolio pre-load skipped:', e.message); }

    if (routeView) {
        showView(routeView, true);
    } else {
        loadHomeView();
        updatePageSEO('home');
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.view) {
            showView(e.state.view, true);
        } else {
            const hv = window.location.hash.replace('#', '');
            const pv = window.location.pathname.replace(/^\//, '').split('/')[0];
            const resolvedView = (hv && validViews.includes(hv)) ? hv
                : (pv && validViews.includes(pv)) ? pv : 'home';
            showView(resolvedView, true);
        }
    });

    // Hydrate data from backend (non-blocking)
    try {
        const hydrated = await hydrateFromBackend();
        if (hydrated) {
            console.log('✅ App data hydrated from Supabase backend');
            // Re-render active view with fresh backend data
            try {
                const activeView = document.querySelector('.view.active');
                if (activeView) {
                    if (activeView.id === 'homeView') {
                        const csGrid = document.getElementById('homepageCaseStudies');
                        if (csGrid && typeof _refreshHomepageCaseStudies === 'function') _refreshHomepageCaseStudies(csGrid);
                    } else if (activeView.id === 'portfolioView') {
                        if (typeof loadPortfolioView === 'function') loadPortfolioView();
                    }
                }
                // If admin panel is open, refresh the active admin tab
                var adminPanel = document.getElementById('adminPanel');
                if (adminPanel && adminPanel.style.display !== 'none') {
                    var activeTab = adminPanel.querySelector('.admin-tab.active');
                    if (activeTab) {
                        var tabName = activeTab.getAttribute('data-tab') || activeTab.textContent.trim().toLowerCase();
                        if (tabName === 'clients' && typeof loadAdminClientsPanel === 'function') loadAdminClientsPanel();
                        if (tabName === 'orders' && typeof loadAdminOrdersPanel === 'function') loadAdminOrdersPanel();
                    }
                }
                // Resolve any idb:// images in the refreshed views
                if (typeof resolveAllImages === 'function') setTimeout(resolveAllImages, 300);
            } catch(refreshErr) { console.warn('Post-hydration refresh error:', refreshErr.message); }
        }
    } catch (e) {
        console.log('Backend hydration skipped:', e.message);
    }

    // Portfolio cloud sync — late refresh in case pre-render load was skipped or timed out
    try {
        if (window.NuiPortfolioSync) {
            const cloudPortfolio = await NuiPortfolioSync.load();
            if (cloudPortfolio && cloudPortfolio.length > 0) {
                // Fix broken idb:// refs using default fallback images
                cloudPortfolio.forEach(function(p, idx) {
                    var fallback = _defaultPortfolio[idx] || _defaultPortfolio[0];
                    if (!p.img || p.img.startsWith('idb://') || p.img === '[too-large]') p.img = fallback.img;
                    if (p.assets) {
                        ['primaryLogo','secondaryLogo','iconMark'].forEach(function(k) {
                            if (p.assets[k] && (p.assets[k].startsWith('idb://') || p.assets[k] === '[too-large]')) {
                                p.assets[k] = (fallback.assets && fallback.assets[k]) ? fallback.assets[k] : '';
                            }
                        });
                        if (p.assets.mockups) {
                            p.assets.mockups = p.assets.mockups.map(function(m) {
                                return (m && (m.startsWith('idb://') || m === '[too-large]')) ? '' : m;
                            });
                        }
                    }
                    if (fallback && p.id === fallback.id) p.name = fallback.name;
                });
                // Only re-render if data actually changed (has new URLs)
                const oldJson = JSON.stringify(portfolioData.map(function(p) { return p.img; }));
                const newJson = JSON.stringify(cloudPortfolio.map(function(p) { return p.img; }));
                if (oldJson !== newJson) {
                    portfolioData = cloudPortfolio;
                    try { localStorage.setItem('nui_portfolio', JSON.stringify(portfolioData)); } catch(e) {}
                    const activeView = document.querySelector('.view.active');
                    if (activeView) {
                        if (activeView.id === 'homeView') {
                            const csGrid = document.getElementById('homepageCaseStudies');
                            if (csGrid) { _refreshHomepageCaseStudies(csGrid); }
                        } else if (activeView.id === 'portfolioView') {
                            loadPortfolioView();
                        }
                    }
                    console.log('✅ Portfolio refreshed from cloud (late sync)');
                }
            }
        }
    } catch (e) {
        console.log('Portfolio cloud sync skipped:', e.message);
    }

    // Mobile footer accordion — collapse footer columns on small screens
    if (window.innerWidth <= 580) {
        document.querySelectorAll('.footer-col .footer-col-title').forEach(function(title) {
            title.addEventListener('click', function() {
                this.parentElement.classList.toggle('open');
            });
        });
    }
});

// Render homepage case study cards from portfolioData (reusable for cloud sync refresh)
function _refreshHomepageCaseStudies(csGrid) {
    if (!csGrid) csGrid = document.getElementById('homepageCaseStudies');
    if (!csGrid) return;
    csGrid.innerHTML = portfolioData.slice(0, 4).map(function(p, idx) {
        const imgIsIdb = p.img && p.img.startsWith('idb://');
        const imgSrc = (!imgIsIdb && p.img) ? p.img : '';
        const isEven = idx % 2 === 0;
        const categories = (p.tag || '').toUpperCase().replace(/\+/g, ',').replace(/\s*,\s*/g, ', ');
        const longDesc = p.mission ? p.desc + ' ' + p.mission : p.desc;
        const testimonialText = p.testimonial ? p.testimonial.text : '';
        const fullText = longDesc + (testimonialText ? ' ' + testimonialText : '');
        return '<div class="proven-card ' + (isEven ? '' : 'proven-card-reverse') + '">' +
            '<div class="proven-card-image" ' + (imgIsIdb ? 'data-idb-bg="' + p.img + '"' : '') + '>' +
                (imgSrc ? '<img src="' + imgSrc + '" alt="' + (p.name || '') + ' case study by New Urban Influence Detroit" loading="lazy">' : '') +
            '</div>' +
            '<div class="proven-card-info">' +
                '<div class="proven-card-categories">' + categories + '</div>' +
                '<hr class="proven-card-divider">' +
                '<h3 class="proven-card-title">' + (p.name || '') + '</h3>' +
                '<p class="proven-card-desc">' + fullText + '</p>' +
                '<a href="/work/' + (p.id || '') + '" class="proven-card-btn">View Case Study</a>' +
            '</div>' +
        '</div>';
    }).join('');
    setTimeout(function() { if (typeof resolveAllImages === 'function') resolveAllImages(); }, 100);
}

// ==================== HOME VIEW ====================
