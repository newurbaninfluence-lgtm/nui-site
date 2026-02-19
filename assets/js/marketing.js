function loadHomeView() {
    document.getElementById('homeView').innerHTML = `
<section class="hero">
<div class="hero-media">
<div class="hero-media-container">
<video id="heroVideo" muted loop playsinline autoplay preload="auto">
<source src="assets/video/hero-bg.mp4" type="video/mp4">
</video>
</div>
<div class="hero-media-overlay"></div>
</div>
<div class="hero-content">
<div class="badge">Detroit's Premier Digital Agency</div>
<h1 class="empire-headline"><span class="empire-word">BUILD</span> <span class="empire-word">YOUR</span><br><span class="empire-word red">INFLUENCE</span></h1>
<p>You built something real. Now let the world see it. <span>Branding, websites & digital strategy for entrepreneurs, coaches, and creators ready to stand out.</span></p>
<div class="hero-buttons">
<a href="/contact" class="btn-cta" onclick="event.preventDefault(); showView('intake');">Book Strategy Call</a>
<a href="/portfolio" class="btn-outline" onclick="event.preventDefault(); showView('portfolio');">View Our Work</a>
</div>
</div>
<div class="scroll-indicator">Scroll</div>
</section>
<section class="stats-ticker">
<div class="ticker-text">50+ BRANDS ELEVATED &bull; <span class="ticker-outline">$2M+ REVENUE GENERATED</span> &bull; DETROIT BORN & RAISED &bull; 50+ BRANDS ELEVATED &bull; <span class="ticker-outline">$2M+ REVENUE GENERATED</span> &bull; DETROIT BORN & RAISED &bull;</div>
</section>
<section class="ticker-section">
<div style="text-align:center;margin-bottom:32px;">
<h3 class="ticker-heading">TRUSTED BY LEADERS, ARTISTS & BUSINESSES ACROSS DETROIT</h3>
</div>
<div class="ticker-strip">
<div class="ticker-row">
<span class="ticker-name">Gov. Rick Snyder</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Kash Doll</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Rep. Leslie Love</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Eric Sabree, Wayne Co. Treasurer</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Beacon Park</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Chambora Vodka</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Detroit Design Festival</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Light It Up Livernois</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Bouzouki (Bouki) Greektown</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Niki's Lounge</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Ask Jennyfer</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">National All Things Detroit Day</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Good Cakes & Bakes</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">I Rep Small Business Saturday</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Crab House Detroit</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">House of Morrison</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Detroit Possible</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Esteem We Inc.</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Fatboyz Detroit</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Deep Drama Designs</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Chevelles Bar</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Jo's Gallery</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Loco's Tex-Mex Grille</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">AJ VIP Photography</span><span class="ticker-bull">&bull;</span>
</div>
<div class="ticker-row">
<span class="ticker-name">Gov. Rick Snyder</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Kash Doll</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Rep. Leslie Love</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Eric Sabree, Wayne Co. Treasurer</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Beacon Park</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Chambora Vodka</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Detroit Design Festival</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Light It Up Livernois</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Bouzouki (Bouki) Greektown</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Niki's Lounge</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Ask Jennyfer</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">National All Things Detroit Day</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Good Cakes & Bakes</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">I Rep Small Business Saturday</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Crab House Detroit</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">House of Morrison</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Detroit Possible</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Esteem We Inc.</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Fatboyz Detroit</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Deep Drama Designs</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Chevelles Bar</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Jo's Gallery</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">Loco's Tex-Mex Grille</span><span class="ticker-bull">&bull;</span>
<span class="ticker-name">AJ VIP Photography</span><span class="ticker-bull">&bull;</span>
</div>
</div>
</section>
<section class="section dark struggle-wrapper">
<div class="struggle-section">
<div class="struggle-left nui-reveal-left">
<h2>THE<br><span class="red">STRUGGLE</span><br>IS REAL.</h2>
<p>Most brands fade into the background noise. In a city that never sleeps and a digital world that never stops, being "good enough" is a death sentence.</p>
<div class="lets-fix-it" style="margin-top:24px;display:flex;align-items:center;gap:12px;"><span style="color:#f5c518;font-family:'Syne',sans-serif;font-size:clamp(18px,2vw,24px);font-weight:700;text-transform:uppercase;letter-spacing:2px;">Let's fix it</span><svg width="48" height="24" viewBox="0 0 48 24" fill="none" style="flex-shrink:0;"><path d="M0 12h40m0 0l-8-8m8 8l-8 8" stroke="#f5c518" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</div>
<div class="problem-cards nui-stagger">
<div class="problem-card"><div class="problem-meta"><div class="number">01</div><span class="problem-detect">Problem Detected</span></div><h3>Your brand looks generic and forgettable</h3></div>
<div class="problem-card"><div class="problem-meta"><div class="number">02</div><span class="problem-detect">Problem Detected</span></div><h3>Your website doesn't convert visitors into customers</h3></div>
<div class="problem-card"><div class="problem-meta"><div class="number">03</div><span class="problem-detect">Problem Detected</span></div><h3>Your social media feels disconnected from your brand</h3></div>
<div class="problem-card"><div class="problem-meta"><div class="number">04</div><span class="problem-detect">Problem Detected</span></div><h3>You're not standing out in a crowded market</h3></div>
</div>
</div>
</section>
<section class="services-white nui-glow-line">
<div class="services-layout">
<div class="services-header nui-reveal-left">
<div class="label">Our Expertise</div>
<h2 class="section-title">WHAT WE<br><span class="red">CREATE</span></h2>
<p style="color: #555; margin-top: 24px;">We don't just make things look pretty. We build systems, brands, and experiences that print money and build legacy.</p>
<button class="btn-cta mt-32" onclick="showView('services')">Explore All Services</button>
</div>
<div class="services-grid home-services nui-stagger">
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>Brand Identity Design</h3><p>Forge Your Legacy. Define Your Empire.</p><div class="learn-more">LEARN MORE →</div></div>
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>Website Design & Dev</h3><p>Your Digital Headquarters. Built for Conversion.</p><div class="learn-more">LEARN MORE →</div></div>
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>Social Media & Ads</h3><p>Command Attention. Drive Engagement.</p><div class="learn-more">LEARN MORE →</div></div>
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>Motion & Video</h3><p>Bring Your Story to Life. Dynamically.</p><div class="learn-more">LEARN MORE →</div></div>
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>Print & Packaging</h3><p>Tangible Brand Power. From Cards to Wraps.</p><div class="learn-more">LEARN MORE →</div></div>
<div class="service-card-simple" onclick="showView('services')"><div class="arrow">↗</div><h3>SEO & Digital Strategy</h3><p>Get Found. Get Chosen. Get Paid.</p><div class="learn-more">LEARN MORE →</div></div>
</div>
</div>
</section>
<section class="section dark detroit-roots-section">
<div class="detroit-roots-bg"></div>
<div class="detroit-roots-content">
<div class="detroit-roots-left nui-reveal-left">
<div class="label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> OUR ROOTS</div>
<h2>BUILT IN<br><span>DETROIT.</span></h2>
<p>We don't just work here. We are part of the fabric of this city. The grit, the hustle, the innovation—it's in our DNA and in every pixel we push.</p>
<a class="btn-outline" onclick="showView('about')" style="margin-top:32px;display:inline-block;cursor:pointer;">Explore Our Legacy</a>
</div>
<div class="detroit-roots-right nui-reveal-scale">
<div class="rotating-circle-wrapper">
<svg class="rotating-circle-svg" viewBox="0 0 400 400">
<circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
<circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
<defs>
<path id="circlePath" d="M200,200 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"/>
</defs>
<text class="rotating-313-text">
<textPath href="#circlePath" startOffset="0%">313 • DETROIT • 313 • MOTOR CITY • 313 • DETROIT • 313 • MOTOR CITY • </textPath>
</text>
<image href="/icons/icon-192.png" x="110" y="110" width="180" height="180" opacity="1"/>
</svg>
</div>
</div>
</div>
</section>
<section class="section dark results-section nui-glow-line">
<div class="label" style="text-align: center; justify-content: center; margin-bottom: 24px;">The Results Speak</div>
<div style="text-align:center;margin-bottom:48px;"><img src="/logo-signature.png" alt="New Urban Influence" style="height:120px;width:auto;opacity:0.85;"></div>
<div class="stats-boxes nui-stagger">
<div class="stat-box">
<div class="stat-number">50+</div>
<div class="stat-label">Brands Elevated</div>
</div>
<div class="stat-box">
<div class="stat-number">$2M+</div>
<div class="stat-label">Revenue Generated</div>
</div>
<div class="stat-box">
<div class="stat-number">100%</div>
<div class="stat-label">Client Satisfaction</div>
</div>
<div class="stat-box">
<div class="stat-number">48hr</div>
<div class="stat-label">Avg Response Time</div>
</div>
</div>
</section>
<section style="padding: 60px 0; background: #080808; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);">
<div class="label" style="justify-content: center; margin-bottom: 32px;">Industries We Serve</div>
<div style="overflow: hidden; position: relative;">
<div style="display: flex; gap: 48px; animation: industriesScroll 25s linear infinite; white-space: nowrap;">
<span class="pkg-section-title">RESTAURANTS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">REAL ESTATE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">FITNESS & WELLNESS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">E-COMMERCE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">PROFESSIONAL SERVICES</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">COACHES & CONSULTANTS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">HEALTHCARE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">BEAUTY & SALONS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">RESTAURANTS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">REAL ESTATE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">FITNESS & WELLNESS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">E-COMMERCE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">PROFESSIONAL SERVICES</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">COACHES & CONSULTANTS</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">HEALTHCARE</span>
<span class="text-red">◆</span>
<span class="pkg-section-title">BEAUTY & SALONS</span>
<span class="text-red">◆</span>
</div>
</div>
</section>
<section class="section dark brands-elevated-section nui-glow-line proven-section">
<div class="proven-results-header">
<h2 class="proven-title nui-reveal-left">PROVEN <span class="red">RESULTS</span></h2>
<a class="view-portfolio-link nui-reveal-right" onclick="showView('portfolio')">VIEW FULL PORTFOLIO →</a>
</div>
<div class="case-study-grid" id="homepageCaseStudies"></div>
</section>
<section class="section dark nui-glow-line whyus-section">
<div class="section-header nui-reveal">
<h2 class="section-title">WHY <span class="red">US?</span></h2>
<p class="section-subtitle">We're not for everyone. We're for the ones who want to win.</p>
</div>
<div class="why-grid nui-stagger">
<div class="why-card"><div class="why-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><h3>Detroit-Rooted Creativity</h3><p>We bring the bold, unapologetic energy of Detroit to every project.</p></div>
<div class="why-card"><div class="why-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div><h3>Revenue-Focused Design</h3><p>Beautiful brands that actually drive business results and conversions.</p></div>
<div class="why-card"><div class="why-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><h3>Elite but Approachable</h3><p>Premium quality without the corporate stuffiness or agency BS.</p></div>
</div>
</section>
<section class="section dark streetcred-section">
<div class="streetcred-header nui-reveal">
<h2 class="streetcred-title">STREET <span class="yellow">CRED</span></h2>
</div>
<div class="streetcred-grid nui-stagger">
<div class="streetcred-card"><div class="streetcred-card-top"><div class="streetcred-stars">★★★★★</div><div class="streetcred-quote">"</div></div><p>"I would recommend working with New Urban Influence. My experience with Faren was great...even when I was being a difficult customer. The care and attention that was put into making sure they understood my vision for my brand was amazing."</p><div class="streetcred-author"><div class="streetcred-avatar"><div class="streetcred-avatar-initial">M</div></div><div><div class="streetcred-name">Miss B</div><div class="streetcred-role">Local Guide · Google Review</div></div></div></div>
<div class="streetcred-card"><div class="streetcred-card-top"><div class="streetcred-stars">★★★★★</div><div class="streetcred-quote">"</div></div><p>"Farren did a great job on a few flyers for me. Prices were reasonable and the quality was superb. My go to company for all my promotional needs. The best at what he does!"</p><div class="streetcred-author"><div class="streetcred-avatar"><div class="streetcred-avatar-initial">C</div></div><div><div class="streetcred-name">Chevelles Bar</div><div class="streetcred-role">Local Guide · Google Review</div></div></div></div>
<div class="streetcred-card"><div class="streetcred-card-top"><div class="streetcred-stars">★★★★★</div><div class="streetcred-quote">"</div></div><p>"The best graphic designing company in the world! I've been a customer for over 10 years and every time they exceed my expectations! Faren and his team has always been very professional and prompt with all my services! I highly recommend this company!"</p><div class="streetcred-author"><div class="streetcred-avatar"><div class="streetcred-avatar-initial">S</div></div><div><div class="streetcred-name">Sierra Meriwether</div><div class="streetcred-role">10+ Year Client · Google Review</div></div></div></div>
<div class="streetcred-card"><div class="streetcred-card-top"><div class="streetcred-stars">★★★★★</div><div class="streetcred-quote">"</div></div><p>"Great experience. Urban Influence gives you personal/detailed attention (making you feel like you are their most important customer). Love not only the services they offer but the personal touch they provide."</p><div class="streetcred-author"><div class="streetcred-avatar"><div class="streetcred-avatar-initial">L</div></div><div><div class="streetcred-name">Larry Castleberry</div><div class="streetcred-role">Google Review</div></div></div></div>
</div>
</section>
<section style="padding: 60px 0; background: #000; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
<div style="text-align: center; margin-bottom: 40px;">
<h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.4); font-weight: 600;">AS SEEN ON</h3>
</div>
<div style="display: flex; animation: logoScroll 40s linear infinite; width: max-content; will-change: transform;">
<div style="display: flex; align-items: center; gap: 64px; padding: 0 32px;">
<a href="https://share.google/0zJCv7QH0SXk4sY7X" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'"><svg height="28" viewBox="0 0 272 92" fill="white"><path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/><path d="M225 3v65h-9.5V3h9.5z"/><path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/></svg></a>
<a href="https://www.yelp.com/biz/new-urban-influence-detroit" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 22px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Yelp</a>
<a href="https://www.dandb.com/businessdirectory/newurbaninfluence-detroit-mi" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Dun & Bradstreet</a>
<a href="https://clutch.co/profile/new-urban-influence" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 22px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Clutch</a>
<a href="https://businessconnect.apple.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 700; color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'"><svg height="20" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 781.5 0 643.9 0 453.8c0-243.2 158.1-372.2 313.9-372.2 62.9 0 115.3 41.3 154.9 41.3 37.7 0 96.5-43.9 168.3-43.9 27.1 0 124.5 2.5 188.9 95.9zm-237.5-173c31.3-37.5 53.9-89.6 53.9-141.9 0-7.2-.6-14.5-1.9-20.4-51.4 1.9-112.2 34.3-148.9 77.4-28.9 33-57 85.2-57 138.1 0 7.9 1.3 15.8 1.9 18.3 3.2.6 8.4 1.3 13.5 1.3 46.1 0 103.7-30.8 138.5-72.8z"/></svg>Business Connect</a>
<a href="https://www.instagram.com/newurbaninfluence/" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 700; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Instagram</a>
<a href="https://www.scottmax.com/company/new-urban-influence" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 700; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">ScottMax</a>
<a href="https://www.manta.com/c/m1x03t9/new-urban-influence" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Manta</a>
<a href="https://detroitdesignfestival.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 16px; font-weight: 700; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Detroit Design Festival</a>
<a href="https://techtowndetroit.org" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">TechTown Detroit</a>
<a href="https://autorama.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 16px; font-weight: 700; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Detroit Autorama</a>
</div>
<div style="display: flex; align-items: center; gap: 64px; padding: 0 32px;">
<a href="https://share.google/0zJCv7QH0SXk4sY7X" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'"><svg height="28" viewBox="0 0 272 92" fill="white"><path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/><path d="M225 3v65h-9.5V3h9.5z"/><path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/></svg></a>
<a href="https://www.yelp.com/biz/new-urban-influence-detroit" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 22px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Yelp</a>
<a href="https://www.dandb.com/businessdirectory/newurbaninfluence-detroit-mi" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Dun & Bradstreet</a>
<a href="https://clutch.co/profile/new-urban-influence" rel="noopener noreferrer" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 22px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Clutch</a>
<a href="https://businessconnect.apple.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 700; color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'"><svg height="20" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 781.5 0 643.9 0 453.8c0-243.2 158.1-372.2 313.9-372.2 62.9 0 115.3 41.3 154.9 41.3 37.7 0 96.5-43.9 168.3-43.9 27.1 0 124.5 2.5 188.9 95.9zm-237.5-173c31.3-37.5 53.9-89.6 53.9-141.9 0-7.2-.6-14.5-1.9-20.4-51.4 1.9-112.2 34.3-148.9 77.4-28.9 33-57 85.2-57 138.1 0 7.9 1.3 15.8 1.9 18.3 3.2.6 8.4 1.3 13.5 1.3 46.1 0 103.7-30.8 138.5-72.8z"/></svg>Business Connect</a>
<a href="https://www.instagram.com/newurbaninfluence/" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 700; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Instagram</a>
<a href="https://www.scottmax.com/company/new-urban-influence" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 700; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">ScottMax</a>
<a href="https://www.manta.com/c/m1x03t9/new-urban-influence" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 20px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Manta</a>
<a href="https://detroitdesignfestival.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 16px; font-weight: 700; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Detroit Design Festival</a>
<a href="https://techtowndetroit.org" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 18px; font-weight: 800; color: white; text-decoration: none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">TechTown Detroit</a>
<a href="https://autorama.com" target="_blank" style="opacity: 0.5; transition: opacity 0.3s; font-size: 16px; font-weight: 700; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">Detroit Autorama</a>
</div>
</div>
</section>
<!-- ==================== FAQ SECTION (Visible for Google Crawlers + Users) ==================== -->
<section class="section dark" id="faq"  style="padding: 80px 0; background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);">
<div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
<div style="text-align: center; margin-bottom: 48px;">
<p class="faq-label">GOT QUESTIONS?</p>
<h2 class="faq-title">FREQUENTLY <span class="text-red">ASKED</span></h2>
<p class="faq-subtitle">Everything you need to know about working with Detroit's top-rated branding agency.</p>
</div>

<div class="faq-grid">

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>What is New Urban Influence?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">New Urban Influence (NUI) is a Detroit-based creative agency specializing in brand identity design, web design, and digital marketing. Founded to help small businesses and startups build professional, competitive brands, NUI offers full branding packages starting at $1,500 including logo design, color systems, typography, social media templates, and brand guidelines. They serve clients throughout Detroit, Southeast Michigan, and nationwide.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>What services does New Urban Influence offer?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">New Urban Influence offers three main branding packages: Brand Kit ($1,500 flat rate) for startups and new businesses, Service Business Brand Identity ($3,500+) for consultants, agencies, and service providers, and Product Brand Identity ($4,500+) for businesses selling physical products. Additional services include logo design ($500), business card design ($150), social media templates ($300), print design and printing (banners, yard signs, business cards, vehicle magnets, postcards, acrylic signs, Dibond panels), packaging design ($600/SKU), and brand guidelines documentation ($400).</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>How much does branding cost in Detroit?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">In Detroit, professional branding packages at New Urban Influence range from $1,500 to $6,000+. The Brand Kit starts at $1,500 (logo, colors, typography, social templates), Service Business Brand Identity starts at $3,500, and Product Brand Identity starts at $4,500. Individual services like logo design start at $500. Payment plans are available including pay-in-full (5% discount), 50/25/25 split, or 3 monthly payments.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>How much does a logo design cost?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">At New Urban Influence, standalone logo design starts at $500 and includes a primary logo, secondary logo variation, icon/mark version, and all file formats (PNG, SVG, PDF). For a complete brand identity that includes the logo plus color palette, typography, social media templates, and brand guidelines, packages start at $1,500.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>How long does a branding project take?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">At New Urban Influence, most branding projects take 2 to 4 weeks depending on complexity. The Brand Kit (starter package) typically completes in 7-10 business days, while comprehensive Service and Product Brand Identity packages take 10-21 business days. Rush delivery is available for an additional fee. Every project follows a structured process: discovery call, strategy, initial concepts, revisions, and final delivery with all files and brand guidelines.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>Do you offer free consultations?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Yes, New Urban Influence offers free strategy consultations for every potential client. During the call, they discuss your business goals, target audience, competitive landscape, and branding needs. You'll receive a custom pricing estimate after the consultation with no obligation to proceed. You can book directly through the website at newurbaninfluence.com.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>What is the best branding agency in Detroit?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">New Urban Influence is one of Detroit's top-rated creative agencies with a 4.9-star rating across 28+ reviews. They specialize in helping small businesses and startups build professional brand identities at accessible price points starting at $1,500. What sets them apart is their strategic approach to branding, transparent flat-rate pricing, payment plans, and a dedicated client portal for real-time project tracking.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '−' : '+';" class="faq-toggle">
<span>What payment options are available?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">New Urban Influence offers flexible payment options for all branding packages: pay in full and receive a 5% discount, split payments 50/25/25, or choose 3 monthly installments. They accept credit cards, debit cards, and bank transfers. No one should have to delay building their brand because of budget — payment plans make professional branding accessible.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>Do you work with businesses outside Detroit?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Yes! While New Urban Influence is based in Detroit, they serve clients nationwide. Most of the branding process is handled remotely through their online client portal, video consultations, and digital proof approvals. They work with businesses in Ann Arbor, Southfield, Troy, Royal Oak, and across Michigan, as well as clients in other states. Local clients can also meet in person for strategy sessions.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>What file formats will I receive for my logo and branding?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Every NUI branding package includes your logo and brand assets in all major file formats: PNG (transparent background), SVG (scalable vector), PDF (print-ready), and high-resolution JPG. You'll also receive a complete brand guidelines document, social media templates sized for Instagram, Facebook, TikTok, and LinkedIn, plus a brand asset folder organized for easy access.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>Can I see examples of your branding work?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Absolutely. Visit the NUI portfolio page to see completed branding projects across restaurants, coaching businesses, art brands, and more. Featured case studies include Good Cakes and Bakes, Detroit Canvas Co., Motor City Bistro, and Ascend Coaching Group. Each case study shows the before-and-after transformation along with results achieved.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>What industries does New Urban Influence specialize in?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">New Urban Influence works with businesses across many industries, with particular strength in restaurants and food service, beauty and wellness, professional services, coaching and consulting, retail and e-commerce, cannabis brands, and creative businesses. They understand the unique branding needs of each industry and tailor their approach accordingly.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>How many logo concepts will I receive?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">NUI provides 2-3 unique logo concepts during the initial design phase based on your brand strategy and discovery call insights. Each concept explores a different creative direction. After you select your preferred direction, they refine it through unlimited revisions until you're completely satisfied. The final logo includes primary, secondary, and icon variations.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>Do you offer web design services?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Yes, New Urban Influence offers custom web design starting at $3,500. Websites are built mobile-first, SEO-optimized, and designed to convert visitors into customers. Services include custom design, development, hosting setup, domain configuration, SSL security, and Google Analytics integration. They also offer website maintenance packages for ongoing support.</div>
</div>
</div>

<div itemscope itemtype="https://schema.org/Question" class="faq-card">
<button onclick="this.parentElement.classList.toggle('faq-open'); this.querySelector('.faq-icon').textContent = this.parentElement.classList.contains('faq-open') ? '\u2212' : '+';" class="faq-toggle">
<span>How do I get started with New Urban Influence?</span>
<span class="faq-icon">+</span>
</button>
<div itemscope itemtype="https://schema.org/Answer" class="faq-answer">
<div class="faq-answer-text">Getting started is simple: book a free strategy call through the website at newurbaninfluence.com or call (248) 487-8747. During the call, you'll discuss your business, goals, and branding needs. After the consultation, you'll receive a custom proposal with pricing. Once approved, NUI kicks off your project with a discovery questionnaire and brand strategy session within 48 hours.</div>
</div>
</div>

</div><!-- end faq-grid -->
</div>
</section>

<section class="cta-section" id="contact" style="background:var(--red);position:relative;overflow:hidden;">
<h2 style="position:relative;z-index:1;">READY TO<br>DOMINATE?</h2>
<p style="position:relative;z-index:1;">Stop playing small. Let's build a brand that demands attention and drives real revenue.</p>
<button class="btn-white" style="position:relative;z-index:1;" onclick="showView('intake')">Book Your Strategy Call</button>
</section>
        ${getFooterHTML()}
    `;
    // Dynamically render homepage case studies from portfolio data
    const csGrid = document.getElementById('homepageCaseStudies');
    if (csGrid) { _refreshHomepageCaseStudies(csGrid); }

    const video = document.getElementById('heroVideo');
    if (video) { video.muted = true; video.play().catch(e => {}); }

    // GSAP Empire Reveal — deferred to window.load so browser has calculated 3D space
    function _nuiEmpireReveal() {
        if (typeof gsap === 'undefined') return;
        // Bail if hero isn't in DOM (user navigated away before load)
        var hero = document.querySelector('.hero');
        if (!hero || !document.querySelector('.empire-word')) return;

        // Signal GSAP is handling it — cancels CSS safety-net animation
        hero.classList.add('gsap-controlled');

        var tl = gsap.timeline({ delay: 0.3 });
        // Badge drops in first with bounce
        tl.fromTo('.badge',
            { opacity: 0, y: -30, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }
        );
        // BUILD and YOUR stagger up from deep below with scale punch + 3D tilt
        tl.fromTo('.empire-word:not(.red)',
            { opacity: 0, y: 80, scale: 0.85, rotationX: 15 },
            { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.0, ease: 'expo.out', stagger: 0.25 },
            '-=0.1'
        );
        // EMPIRE lands heavy — bigger, slower, with 3D depth
        tl.fromTo('.empire-word.red',
            { opacity: 0, y: 100, scale: 0.7, rotationX: 20 },
            { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.4, ease: 'expo.out' },
            '-=0.3'
        );
        // Paragraph and buttons slide up
        tl.fromTo('.hero-content p',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, '-=0.5');
        tl.fromTo('.hero-buttons',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, '-=0.5');
        // Scroll indicator fades in last
        tl.fromTo('.scroll-indicator',
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power1.out' }, '-=0.2');
    }

    // Fire on window.load if page is still loading, otherwise fire on next frame
    if (document.readyState === 'complete') {
        requestAnimationFrame(_nuiEmpireReveal);
    } else {
        window.addEventListener('load', _nuiEmpireReveal, { once: true });
    }

    // Initialize scroll animations for this page
    requestAnimationFrame(function() { _nuiMotionEngine(); });
}

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// NUI MOTION ENGINE v2 — 2026 High-End Scroll Experience
// Auto-detecting parallax, reveals, cursor effects, 3D tilt
// ═══════════════════════════════════════════════════════════

function _nuiMotionEngine() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Kill old ScrollTrigger instances (SPA re-nav safety)
    ScrollTrigger.getAll().forEach(function(t) { t.kill(); });

    // ── 1. EXPLICIT Scroll Reveals (elements with nui-* classes) ──
    document.querySelectorAll('.nui-reveal').forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.nui-reveal-left').forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.nui-reveal-right').forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.nui-reveal-scale').forEach(function(el) {
        gsap.fromTo(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });

    // ── 2. Stagger Children ──
    document.querySelectorAll('.nui-stagger').forEach(function(container) {
        gsap.fromTo(container.children, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12,
            scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none none' } });
    });

    // ── 3. Glow Line Dividers ──
    document.querySelectorAll('.nui-glow-line').forEach(function(el) {
        ScrollTrigger.create({ trigger: el, start: 'top 90%', onEnter: function() { el.classList.add('active'); } });
    });

    // ── 4. Parallax Backgrounds ──
    document.querySelectorAll('.nui-parallax').forEach(function(el) {
        gsap.to(el, { yPercent: -15, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
    });

    // ── 5. Stats Number Count-Up ──
    document.querySelectorAll('.stat-number').forEach(function(el) {
        var text = el.textContent.trim();
        var match = text.match(/^([\$]?)([\d,.]+)(\+?)(.*)/);
        if (!match) return;
        var prefix = match[1], numStr = match[2], plus = match[3], suffix = match[4];
        var target = parseFloat(numStr.replace(/,/g, ''));
        if (isNaN(target)) return;
        var isDecimal = numStr.includes('.');
        var obj = { val: 0 };
        gsap.to(obj, { val: target, duration: 2, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            onUpdate: function() {
                var display = isDecimal ? obj.val.toFixed(1) : Math.round(obj.val).toLocaleString();
                el.textContent = prefix + display + plus + suffix;
            },
            onComplete: function() { el.textContent = text; el.classList.add('glow'); }
        });
    });

    // ── 6. Scroll Progress Bar ──
    var bar = document.querySelector('.nui-scroll-progress');
    if (!bar) { bar = document.createElement('div'); bar.className = 'nui-scroll-progress'; document.body.appendChild(bar); }
    gsap.to(bar, { scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

    // ── 7. Floating Ambient Particles ──
    var pc = document.querySelector('.nui-particles');
    if (!pc) { pc = document.createElement('div'); pc.className = 'nui-particles'; document.body.appendChild(pc); }
    pc.innerHTML = '';
    for (var p = 0; p < 20; p++) {
        var dot = document.createElement('div');
        dot.className = 'nui-particle';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.animationDelay = Math.random() * 8 + 's';
        dot.style.animationDuration = (6 + Math.random() * 6) + 's';
        dot.style.width = dot.style.height = (1 + Math.random() * 3) + 'px';
        pc.appendChild(dot);
    }

    // ── 8. Hero Parallax Depth (video moves slower than content) ──
    var heroMedia = document.querySelector('.hero-media-container');
    if (heroMedia) {
        gsap.to(heroMedia, { yPercent: 30, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // ── 9. About Hero Parallax + Dramatic Entrance ──
    var aboutHero = document.querySelector('.about-hero');
    if (aboutHero) {
        gsap.to(aboutHero, { backgroundPositionY: '30%', ease: 'none',
            scrollTrigger: { trigger: aboutHero, start: 'top top', end: 'bottom top', scrub: true } });
        // Dramatic entrance for About heading
        var aboutH2 = aboutHero.querySelector('h2');
        var aboutP = aboutHero.querySelector('p');
        if (aboutH2) {
            gsap.fromTo(aboutH2, { opacity: 0, y: 100, scale: 0.8, rotationX: 10 },
                { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.6, ease: 'expo.out', delay: 0.3 });
        }
        if (aboutP) {
            gsap.fromTo(aboutP, { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.8 });
        }
    }

    // ── 10. AUTO-DETECT: Animate ALL section headings on scroll ──
    document.querySelectorAll('.section-header .section-title, .struggle-left h2, .roots-left h2, .services-header h2, .story-content h2, .portfolio-header h2').forEach(function(el) {
        if (el.closest('.nui-reveal') || el.closest('.nui-reveal-left')) return;
        gsap.fromTo(el,
            { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });

    // ── 11. AUTO-DETECT: Animate ALL paragraphs and subtitles in sections ──
    document.querySelectorAll('.section-subtitle, .struggle-left p, .roots-left p, .story-content p, .service-description').forEach(function(el) {
        if (el.closest('.nui-reveal') || el.closest('.nui-reveal-left')) return;
        gsap.fromTo(el,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
    });

    // ── 12. AUTO-DETECT: Cards with 3D tilt entrance ──
    document.querySelectorAll('.testimonial-card, .value-card, .why-card, .problem-card, .streetcred-card').forEach(function(card, i) {
        gsap.fromTo(card,
            { opacity: 0, y: 60, rotateY: i % 2 === 0 ? -5 : 5, rotateX: 3 },
            { opacity: 1, y: 0, rotateY: 0, rotateX: 0, duration: 1, ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } });
    });

    // ── 13. Service Cards — stagger in with scale ──
    document.querySelectorAll('.service-card').forEach(function(card, i) {
        gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } });
    });

    // ── 14. Proven Results Cards — slide reveal ──
    document.querySelectorAll('.portfolio-card').forEach(function(card) {
        gsap.fromTo(card,
            { opacity: 0, y: 40, clipPath: 'inset(10% 10% 10% 10%)' },
            { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } });
    });
    document.querySelectorAll('.proven-card').forEach(function(card, i) {
        var isReverse = card.classList.contains('proven-card-reverse');
        var img = card.querySelector('.proven-card-image');
        var info = card.querySelector('.proven-card-info');
        if (img) gsap.fromTo(img,
            { opacity: 0, x: isReverse ? 80 : -80 },
            { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none' } });
        if (info) gsap.fromTo(info,
            { opacity: 0, x: isReverse ? -80 : 80 },
            { opacity: 1, x: 0, duration: 1.2, ease: 'expo.out', delay: 0.15,
              scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none' } });
    });

    // ── 15. CTA Section — scale punch ──
    var cta = document.querySelector('.cta-section');
    if (cta) {
        gsap.fromTo(cta.children, { opacity: 0, y: 50, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out', stagger: 0.15,
              scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none none' } });
    }

    // ── 15b. Problem Cards — sequential red glow on scroll ──
    document.querySelectorAll('.problem-card').forEach(function(card) {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 75%',
            end: 'bottom 25%',
            onEnter: function() { card.classList.add('glow-active'); },
            onLeaveBack: function() { card.classList.remove('glow-active'); }
        });
    });

    // ── 16. Story Image — slide + reveal ──
    document.querySelectorAll('.story-image, .roots-right').forEach(function(el) {
        gsap.fromTo(el,
            { opacity: 0, x: 60, scale: 0.9 },
            { opacity: 1, x: 0, scale: 1, duration: 1.3, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
    });

    // ── 17. Stats Boxes — depth parallax (scrub) ──
    document.querySelectorAll('.stats-boxes, .stats-grid').forEach(function(grid) {
        Array.prototype.forEach.call(grid.children, function(child, i) {
            gsap.fromTo(child,
                { y: 30 + (i * 10) },
                { y: 0, ease: 'none',
                  scrollTrigger: { trigger: grid, start: 'top 90%', end: 'top 40%', scrub: 1 } });
        });
    });

    // ── 18. Section Divider Lines ──
    document.querySelectorAll('.section').forEach(function(sec) {
        gsap.fromTo(sec,
            { borderTopColor: 'rgba(255,255,255,0)' },
            { borderTopColor: 'rgba(255,255,255,0.08)', duration: 1,
              scrollTrigger: { trigger: sec, start: 'top 95%', toggleActions: 'play none none none' } });
    });

    // ── 19. CURSOR GLOW FOLLOWER (desktop only) ──
    if (window.matchMedia('(hover: hover)').matches) {
        var glow = document.querySelector('.nui-cursor-glow');
        if (!glow) {
            glow = document.createElement('div');
            glow.className = 'nui-cursor-glow';
            document.body.appendChild(glow);
        }
        var mx = 0, my = 0;
        document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
        gsap.ticker.add(function() {
            gsap.set(glow, { x: mx, y: my });
        });
        // Brighten glow near interactive elements
        document.querySelectorAll('.btn-cta, .btn-service, .btn-white, .btn-outline, .service-card, .portfolio-card, a').forEach(function(el) {
            el.addEventListener('mouseenter', function() { gsap.to(glow, { scale: 1.5, opacity: 1, duration: 0.4 }); });
            el.addEventListener('mouseleave', function() { gsap.to(glow, { scale: 1, opacity: 0.7, duration: 0.4 }); });
        });
    }

    // ── 20. 3D CARD TILT ON HOVER ──
    document.querySelectorAll('.service-card, .testimonial-card, .value-card, .why-card, .stat-box, .streetcred-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: 'power2.out',
                transformPerspective: 800 });
        });
        card.addEventListener('mouseleave', function() {
            gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'expo.out' });
        });
    });

    // ── 21. MAGNETIC BUTTONS ──
    document.querySelectorAll('.btn-cta, .btn-service, .btn-white').forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function() {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // Refresh triggers after DOM settles
    requestAnimationFrame(function() { ScrollTrigger.refresh(); });
}

// ==================== ABOUT VIEW ====================
function loadAboutView() {
    const teamHTML = aboutData.team.map((member, i) => `
<div class="team-card">
<div class="team-photo">
                ${member.photo ? `<img loading="lazy" src="${member.photo}" alt="${member.name}">` : 'Photo'}
</div>
<h3 class="team-name">${member.name}</h3>
<p class="team-title">${member.title}</p>
<p class="team-bio">${member.bio}</p>
</div>
    `).join('');

    document.getElementById('aboutView').innerHTML = `
<section class="about-hero"><div class="hero-content"><h2>About <span>Us</span></h2><p>We're a Detroit-rooted creative agency crafting bold brands and digital experiences for visionaries who refuse to blend in.</p></div></section>
<section class="section white-break">
<div class="story-section">
<div class="story-content">
<div class="label" style="color:#990000;">Our Story</div>
<h2>BORN IN THE <span class="red">D.</span><br>BUILT TO <span class="red">DOMINATE.</span></h2>
<p>New Urban Influence was founded with a simple mission: to bring the bold, unapologetic energy of Detroit to every brand we touch.</p>
<p>We believe that great design isn't just about looking good - it's about creating systems that drive real business results. Every pixel we push, every strategy we craft, is designed to help our clients dominate their markets.</p>
</div>
<div class="story-image" style="background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); font-size: 14px;">
                    ${aboutData.storyImage ? `<img loading="lazy" src="${aboutData.storyImage}" alt="Our Story" style="width: 100%; height: 100%; object-fit: cover;">` : 'Image'}
</div>
</div>
</section>
<section class="section dark"><div class="section-header"><h2 class="section-title">OUR <span class="red">VALUES</span></h2></div><div class="values-grid"><div class="value-card"><div class="number">01</div><h3>Bold Creativity</h3><p>We don't play it safe. Every project gets our full creative energy.</p></div><div class="value-card"><div class="number">02</div><h3>Results First</h3><p>Beautiful design that drives real business outcomes.</p></div><div class="value-card"><div class="number">03</div><h3>Detroit Grit</h3><p>The hustle and resilience of our city runs through everything.</p></div><div class="value-card"><div class="number">04</div><h3>Client Partners</h3><p>We're invested partners in your success and growth.</p></div></div></section>
<section class="section dark" style="border-top: 1px solid rgba(255,255,255,0.06);">
<div class="section-header">
<div class="label" style="justify-content: center;">The Crew</div>
<h2 class="section-title">MEET THE <span class="red">TEAM</span></h2>
<p class="section-subtitle">The creative minds behind New Urban Influence</p>
</div>
<div class="team-grid">
                ${teamHTML}
</div>
</section>
<section class="section" style="background: var(--red);"><div class="stats-grid"><div class="stat-item"><div class="value">50+</div><div class="stat-label">Brands Elevated</div></div><div class="stat-item"><div class="value">$2M+</div><div class="stat-label">Revenue Generated</div></div><div class="stat-item"><div class="value">100%</div><div class="stat-label">Detroit Pride</div></div><div class="stat-item"><div class="value">313</div><div class="stat-label">Area Code Strong</div></div></div></section>
<section class="cta-section"><h2>READY TO <span>WORK</span> WITH US?</h2><p>Let's build something legendary together.</p><button class="btn-white" onclick="scrollToContact()">Book Your Strategy Call</button></section>
        ${getFooterHTML()}
    `;
    requestAnimationFrame(function() { _nuiMotionEngine(); });
}

// ==================== SERVICES VIEW ====================
function loadServicesView() {
    document.getElementById('servicesView').innerHTML = `
<style>
            .package-section { padding: 0 0 80px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .package-image { position: relative; width: 100%; height: 300px; overflow: hidden; margin-bottom: 60px; }
            .package-image img { width: 100%; height: 100%; object-fit: cover; }
            .package-image::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,59,48,0.4) 0%, rgba(255,59,48,0.2) 50%, rgba(0,0,0,0.9) 100%); }
            .package-header { text-align: center; margin-bottom: 60px; }
            .package-label { font-size: 11px; color: var(--red); text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin-bottom: 16px; }
            .package-title { font-size: 42px; font-weight: 900; margin-bottom: 16px; }
            .package-subtitle { color: var(--gray); font-size: 16px; max-width: 600px; margin: 0 auto; }
            .package-price { font-size: 48px; font-weight: 900; color: var(--red); margin: 24px 0; }
            .package-price span { font-size: 18px; color: var(--gray); font-weight: 400; }

            .deliverables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
            .deliverable-card { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 32px; transition: all 0.3s; cursor: pointer; }
            .deliverable-card:hover { background: #fff; border-color: #fff; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(255,255,255,0.1); }
            .deliverable-card:hover .deliverable-icon { color: var(--red); }
            .deliverable-card:hover .deliverable-title { color: #000; }
            .deliverable-card:hover .deliverable-desc { color: #333; }
            .deliverable-card:hover .deliverable-list li { color: #333; border-color: rgba(0,0,0,0.1); }
            .deliverable-card:hover .deliverable-list li::before { color: var(--red); }
            .deliverable-icon { font-size: 32px; margin-bottom: 20px; }
            .deliverable-title { font-size: 18px; font-weight: 800; margin-bottom: 12px; color: #fff; }
            .deliverable-desc { font-size: 13px; color: var(--gray); line-height: 1.6; margin-bottom: 20px; }
            .deliverable-list { list-style: none; padding: 0; margin: 0; }
            .deliverable-list li { font-size: 13px; color: rgba(255,255,255,0.7); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 10px; }
            .deliverable-list li:last-child { border-bottom: none; }
            .deliverable-list li::before { content: '✓'; color: var(--red); font-weight: 700; }

            .category-section { margin-bottom: 60px; }
            .category-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
            .category-icon { width: 48px; height: 48px; background: rgba(255,59,48,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            .category-title { font-size: 24px; font-weight: 800; }
            .category-subtitle { font-size: 13px; color: var(--gray); margin-top: 4px; }

            .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
            .item-card { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; transition: all 0.3s; cursor: pointer; }
            .item-card:hover { background: #fff; border-color: #fff; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,255,255,0.1); }
            .item-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; transition: color 0.3s; }
            .item-card:hover h4 { color: #000; }
            .item-card p { font-size: 12px; color: var(--gray); line-height: 1.5; transition: color 0.3s; }
            .item-card:hover p { color: #333; }

            .package-cta { text-align: center; margin-top: 48px; }
            .btn-package { background: var(--red); color: #fff; border: none; padding: 18px 48px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
            .btn-package:hover { background: #fff; color: #000; transform: scale(1.02); }

            .comparison-table { max-width: 1000px; margin: 60px auto; }
            .comparison-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2px; margin-bottom: 2px; }
            .comparison-cell { background: #080808; padding: 16px 20px; font-size: 13px; }
            .comparison-cell.header { background: rgba(255,59,48,0.1); font-weight: 700; text-align: center; }
            .comparison-cell.feature { color: rgba(255,255,255,0.8); }
            .comparison-cell.check { text-align: center; color: var(--red); font-size: 18px; }
            .comparison-cell.empty { text-align: center; color: rgba(255,255,255,0.2); }

            /* SERVICES PAGE MOBILE RESPONSIVE */
            @media (max-width: 768px) {
                .package-section { padding: 0 0 60px 0; }
                .package-image { height: 180px; margin-bottom: 32px; }
                .package-header { margin-bottom: 40px; padding: 0 16px; }
                .package-title { font-size: 28px !important; }
                .package-subtitle { font-size: 14px; padding: 0 8px; }
                .package-price { font-size: 36px !important; margin: 16px 0; }
                .package-price span { font-size: 14px; }

                .deliverables-grid { grid-template-columns: 1fr !important; gap: 16px; padding: 0 16px; }
                .deliverable-card { padding: 24px 20px; border-radius: 12px; }
                .deliverable-icon { font-size: 28px; margin-bottom: 16px; }
                .deliverable-title { font-size: 16px; }
                .deliverable-desc { font-size: 13px; margin-bottom: 16px; }
                .deliverable-list li { font-size: 12px; padding: 6px 0; }

                .category-section { margin-bottom: 40px; padding: 0 16px; }
                .category-header { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 24px; }
                .category-icon { width: 40px; height: 40px; font-size: 20px; }
                .category-title { font-size: 20px; }

                .items-grid { grid-template-columns: 1fr !important; gap: 12px; }
                .item-card { padding: 16px; }
                .item-card h4 { font-size: 14px; }
                .item-card p { font-size: 11px; }

                .package-cta { margin-top: 32px; padding: 0 16px; }
                .btn-package { width: 100%; padding: 16px 24px; font-size: 13px; }

                .comparison-table { margin: 40px 16px; overflow-x: auto; }
                .comparison-row { grid-template-columns: 1.5fr 1fr 1fr 1fr; min-width: 500px; }
                .comparison-cell { padding: 12px 8px; font-size: 11px; }
            }

            @media (max-width: 480px) {
                .package-title { font-size: 24px !important; }
                .package-price { font-size: 32px !important; }
                .deliverable-card { padding: 20px 16px; }
                .deliverable-title { font-size: 15px; }
                .category-title { font-size: 18px; }
            }
</style>

<section class="section dark" style="padding-top: 160px; text-align: center;">
<h2 class="section-title">SERVICE <span class="red">PACKAGES</span></h2>
<p class="section-subtitle">Comprehensive branding solutions designed for product-based and service-based businesses. Every deliverable comes with clear direction on how to use it.</p>
</section>

        <!-- BRAND KIT - STARTER PACKAGE -->
<section class="package-section" style="background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);">
<div class="package-image">
<img loading="eager" fetchpriority="high" width="1920" height="1200" src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1920&q=80" alt="Brand Design" data-service-image="brand-kit">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">Starter Package</div>
<h2 class="package-title">BRAND <span class="red">KIT</span></h2>
<p class="package-subtitle">Everything you need to launch your brand with confidence. Logo, voice, visuals, and social presence — all in one complete package.</p>
<div class="package-price">$1,500 <span>flat rate</span></div>
</div>

<div class="deliverables-grid" style="grid-template-columns: repeat(3, 1fr);">
<div class="deliverable-card">
<div class="deliverable-icon">◆</div>
<h3 class="deliverable-title">Logo Design</h3>
<p class="deliverable-desc">Your primary mark that represents your business everywhere.</p>
<ul class="deliverable-list">
<li>Primary Logo</li>
<li>Secondary Logo Variation</li>
<li>Icon/Mark Version</li>
<li>All File Formats (PNG, SVG, PDF)</li>
</ul>
<p class="pkg-note">USE FOR: Business cards, website, signage, social profiles</p>
</div>

<div class="deliverable-card">
<div class="deliverable-icon">🎨</div>
<h3 class="deliverable-title">Color Palette & Typography</h3>
<p class="deliverable-desc">Strategic colors and fonts that define your visual identity.</p>
<ul class="deliverable-list">
<li>Primary & Secondary Colors</li>
<li>HEX, RGB, CMYK Values</li>
<li>Heading & Body Fonts</li>
<li>Font Pairing Guidelines</li>
</ul>
<p class="pkg-note">USE FOR: All marketing materials, website, print</p>
</div>

<div class="deliverable-card">
<div class="deliverable-icon">🎯</div>
<h3 class="deliverable-title">Target Market Identifier</h3>
<p class="deliverable-desc">Know exactly who you're talking to and how to reach them.</p>
<ul class="deliverable-list">
<li>Ideal Customer Profile</li>
<li>Demographics & Psychographics</li>
<li>Pain Points & Desires</li>
<li>Where to Find Them</li>
</ul>
<p class="pkg-note">USE FOR: Marketing strategy, ad targeting, content</p>
</div>

<div class="deliverable-card">
<div class="deliverable-icon">🗣️</div>
<h3 class="deliverable-title">Brand Voice</h3>
<p class="deliverable-desc">How your brand speaks, writes, and connects with your audience.</p>
<ul class="deliverable-list">
<li>Brand Personality Traits</li>
<li>Tone of Voice Guidelines</li>
<li>Messaging Do's & Don'ts</li>
<li>Sample Copy Examples</li>
</ul>
<p class="pkg-note">USE FOR: Social posts, website copy, emails, ads</p>
</div>

<div class="deliverable-card">
<div class="deliverable-icon">📱</div>
<h3 class="deliverable-title">Social Media Banners</h3>
<p class="deliverable-desc">Professional graphics for all your social platforms.</p>
<ul class="deliverable-list">
<li>Facebook Cover</li>
<li>Instagram Profile & Highlight Covers</li>
<li>LinkedIn Banner</li>
<li>YouTube Channel Art</li>
</ul>
<p class="pkg-note">USE FOR: Social media profiles, channel branding</p>
</div>

<div class="deliverable-card">
<div class="deliverable-icon">📸</div>
<h3 class="deliverable-title">Logo In Action</h3>
<p class="deliverable-desc">See your logo applied to real-world mockups.</p>
<ul class="deliverable-list">
<li>Business Card Mockup</li>
<li>Social Media Preview</li>
<li>Signage/Storefront Mockup</li>
<li>Apparel/Merch Preview</li>
</ul>
<p class="pkg-note">USE FOR: Visualizing your brand, presentations, pitches</p>
</div>
</div>

<div class="package-cta">
<button class="btn-package" onclick="startServiceIntake('brand-kit')">Get Your Brand Kit →</button>
</div>
</div>
</section>

        <!-- PRODUCT BUSINESS BRAND IDENTITY -->
<section class="package-section" style="background: #050505;">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80" alt="Product Branding" data-service-image="product-brand">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">For Product-Based Businesses</div>
<h2 class="package-title">PRODUCT <span class="red">BRAND IDENTITY</span></h2>
<p class="package-subtitle">Complete branding system for businesses selling physical products. From packaging to retail displays, we've got you covered.</p>
<div class="package-price">$5,500 <span>starting at</span></div>
</div>

                <!-- Core Brand Identity -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">◆</div>
<div>
<h3 class="category-title">Core Brand Identity</h3>
<p class="category-subtitle">The foundation of your visual brand</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Logo Suite</h4>
<p>Primary, secondary, icon mark, and watermark versions in all formats</p>
</div>
<div class="item-card">
<h4>Color System</h4>
<p>Full palette with primary, secondary, and accent colors plus usage rules</p>
</div>
<div class="item-card">
<h4>Typography</h4>
<p>Heading, body, and accent fonts with hierarchy guidelines</p>
</div>
<div class="item-card">
<h4>Brand Guidelines</h4>
<p>Complete PDF guide on how to use all brand elements correctly</p>
</div>
</div>
</div>

                <!-- Product Packaging & Labels -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">📦</div>
<div>
<h3 class="category-title">Product Packaging & Labels</h3>
<p class="category-subtitle">Make your product stand out on the shelf</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Product Labels</h4>
<p>Custom label designs for bottles, jars, boxes, and bags. Print-ready files included.</p>
</div>
<div class="item-card">
<h4>Packaging Design</h4>
<p>Box designs, mailer boxes, and product sleeves that grab attention.</p>
</div>
<div class="item-card">
<h4>Hang Tags</h4>
<p>Branded tags for apparel and products with care instructions.</p>
</div>
<div class="item-card">
<h4>Stickers & Seals</h4>
<p>Thank you stickers, brand seals, and packaging tape design.</p>
</div>
</div>
</div>

                <!-- Print & In-Store -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">🏪</div>
<div>
<h3 class="category-title">Print & In-Store Design</h3>
<p class="category-subtitle">Dominate retail spaces and physical locations</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Posters & Signage</h4>
<p>Eye-catching posters for in-store displays, windows, and events.</p>
</div>
<div class="item-card">
<h4>Window Decals</h4>
<p>Storefront window graphics and promotional decals.</p>
</div>
<div class="item-card">
<h4>Banners & Displays</h4>
<p>Trade show banners, pop-up displays, and table covers.</p>
</div>
<div class="item-card">
<h4>Wall Murals</h4>
<p>Large-scale branded graphics for store interiors.</p>
</div>
</div>
</div>

                <!-- Apparel & Merch -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">👕</div>
<div>
<h3 class="category-title">Apparel & Merchandise</h3>
<p class="category-subtitle">Turn customers into walking billboards</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>T-Shirt Designs</h4>
<p>Branded tees for staff uniforms or merchandise sales.</p>
</div>
<div class="item-card">
<h4>Hat & Cap Designs</h4>
<p>Embroidery-ready logo files and hat mockups.</p>
</div>
<div class="item-card">
<h4>Uniform Design</h4>
<p>Cohesive staff uniforms including aprons, polos, and jackets.</p>
</div>
<div class="item-card">
<h4>Tote Bags</h4>
<p>Branded shopping bags and reusable totes.</p>
</div>
</div>
</div>

                <!-- Digital Marketing -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">📱</div>
<div>
<h3 class="category-title">Digital Marketing Assets</h3>
<p class="category-subtitle">Everything you need to market online</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Email Templates</h4>
<p>Branded email headers, newsletters, and promo templates.</p>
</div>
<div class="item-card">
<h4>Digital Mailers</h4>
<p>E-blasts and digital flyers for promotions and announcements.</p>
</div>
<div class="item-card">
<h4>Social Media Kit</h4>
<p>Post templates, story templates, and profile graphics.</p>
</div>
<div class="item-card">
<h4>Ad Creatives</h4>
<p>Facebook, Instagram, and Google ad graphics in all sizes.</p>
</div>
</div>
</div>

                <!-- ADD-ONS: Video & Photo (Detroit Metro Only) -->
<div style="background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(0,0,0,0.3)); border: 2px solid var(--red); border-radius: 16px; padding: 32px; margin-top: 40px;">
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
<span style="background: var(--red); color: #fff; padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📍 Detroit Metro Add-Ons</span>
</div>
<p style="color: #888; font-size: 14px; margin-bottom: 24px;">Video production and photography services available as add-ons for clients in the Detroit metro area. These require in-person sessions at your location.</p>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
                        <!-- Motion & Video Add-On -->
<div class="blog-overlay-dark">
<div class="problem-meta">
<span class="text-3xl">🎬</span>
<div>
<h4 style="margin: 0; font-size: 18px;">Video Production</h4>
<p class="pkg-addon-price">Add-on from $500</p>
</div>
</div>
<ul class="pkg-detail-list">
<li>Logo Animation</li>
<li>Brand Commercial (15-30 sec)</li>
<li>Product Showcase Videos</li>
<li>Social Reels & TikToks</li>
</ul>
</div>

                        <!-- Photography Add-On -->
<div class="blog-overlay-dark">
<div class="problem-meta">
<span class="text-3xl">📷</span>
<div>
<h4 style="margin: 0; font-size: 18px;">Photography</h4>
<p class="pkg-addon-price">Add-on from $400</p>
</div>
</div>
<ul class="pkg-detail-list">
<li>Product Photography</li>
<li>Lifestyle Shoots</li>
<li>Flat Lay Photography</li>
<li>Video Content</li>
</ul>
</div>
</div>
<p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">📍 Available for Detroit, Dearborn, Southfield, Troy, Royal Oak, Ferndale, and surrounding metro areas</p>
</div>

<div class="package-cta">
<button class="btn-package" onclick="startServiceIntake('product-brand')">Build Your Product Brand →</button>
</div>
</div>
</section>

        <!-- SERVICE BUSINESS BRAND IDENTITY -->
<section class="package-section" style="background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80" alt="Service Branding" data-service-image="service-brand">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">For Service-Based Businesses</div>
<h2 class="package-title">SERVICE <span class="red">BRAND IDENTITY</span></h2>
<p class="package-subtitle">Complete branding system for consultants, agencies, contractors, and service providers. Build trust and attract premium clients.</p>
<div class="package-price">$4,500 <span>starting at</span></div>
</div>

                <!-- Core Brand Identity -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">◆</div>
<div>
<h3 class="category-title">Core Brand Identity</h3>
<p class="category-subtitle">Professional foundation for your business</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Logo Suite</h4>
<p>Primary, secondary, and icon versions for all applications</p>
</div>
<div class="item-card">
<h4>Color System</h4>
<p>Professional palette that builds trust and recognition</p>
</div>
<div class="item-card">
<h4>Typography</h4>
<p>Font system for documents, presentations, and web</p>
</div>
<div class="item-card">
<h4>Brand Guidelines</h4>
<p>Complete usage guide for consistency across all touchpoints</p>
</div>
</div>
</div>

                <!-- Print Collateral -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">📄</div>
<div>
<h3 class="category-title">Print Collateral</h3>
<p class="category-subtitle">Professional materials that close deals</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Business Cards</h4>
<p>Premium card design with print-ready files and vendor recommendations.</p>
</div>
<div class="item-card">
<h4>Letterhead & Envelopes</h4>
<p>Professional stationery for proposals and correspondence.</p>
</div>
<div class="item-card">
<h4>Brochures & Flyers</h4>
<p>Service brochures and promotional flyers for events.</p>
</div>
<div class="item-card">
<h4>Presentation Folders</h4>
<p>Custom folders for client proposals and welcome packets.</p>
</div>
</div>
</div>

                <!-- Print & Signage -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">🖨️</div>
<div>
<h3 class="category-title">Print & Signage</h3>
<p class="category-subtitle">Real-world graphics that get noticed</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Banners</h4>
<p>Retractable, vinyl, and hanging banners for events and storefronts.</p>
</div>
<div class="item-card">
<h4>Posters</h4>
<p>Promotional posters, wall graphics, and large format prints.</p>
</div>
<div class="item-card">
<h4>Yard Signs</h4>
<p>Campaign, real estate, and promotional yard signs.</p>
</div>
<div class="item-card">
<h4>Event Backgrounds</h4>
<p>Step-and-repeat backdrops and photo booth backgrounds.</p>
</div>
<div class="item-card">
<h4>Vinyl Decals</h4>
<p>Storefront window graphics, wall decals, and custom cut vinyl.</p>
</div>
<div class="item-card">
<h4>Building Signage</h4>
<p>Storefront and office signage design.</p>
</div>
<div class="item-card">
<h4>Vehicle Magnets</h4>
<p>Removable magnetic signs for cars, trucks, and vans.</p>
</div>
<div class="item-card">
<h4>Business Cards</h4>
<p>Premium 16pt cards with UV or matte coating.</p>
</div>
<div class="item-card">
<h4>Postcards & Mailers</h4>
<p>4x6 and 6x9 direct mail postcards.</p>
</div>
<div class="item-card">
<h4>Acrylic Signs</h4>
<p>Clear UV-printed acrylic for lobbies and interiors.</p>
</div>
<div class="item-card">
<h4>Dibond / Aluminum</h4>
<p>Weatherproof aluminum composite exterior signs.</p>
</div>
<div class="item-card">
<h4>Foam Core</h4>
<p>Lightweight mounted prints for events and displays.</p>
</div>
</div>
</div>

                <!-- Uniforms & Apparel -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">👔</div>
<div>
<h3 class="category-title">Uniforms & Apparel</h3>
<p class="category-subtitle">Look professional on every job</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Polo Shirts</h4>
<p>Embroidery-ready designs for professional staff polos.</p>
</div>
<div class="item-card">
<h4>Work Shirts</h4>
<p>Button-up and work shirt designs with logo placement.</p>
</div>
<div class="item-card">
<h4>Hats & Caps</h4>
<p>Branded headwear for team and promotional use.</p>
</div>
<div class="item-card">
<h4>Jackets & Outerwear</h4>
<p>Branded jackets and vests for field work.</p>
</div>
</div>
</div>

                <!-- Digital Presence -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">🌐</div>
<div>
<h3 class="category-title">Digital Presence</h3>
<p class="category-subtitle">Dominate online and attract leads</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Website Design</h4>
<p>Professional website that converts visitors into clients.</p>
</div>
<div class="item-card">
<h4>Email Signature</h4>
<p>Branded email signatures for the whole team.</p>
</div>
<div class="item-card">
<h4>Social Media Kit</h4>
<p>Profile images, cover photos, and post templates.</p>
</div>
<div class="item-card">
<h4>Google Business Profile</h4>
<p>Optimized profile with branded images and posts.</p>
</div>
</div>
</div>

                <!-- Digital Marketing -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">📧</div>
<div>
<h3 class="category-title">Digital Marketing</h3>
<p class="category-subtitle">Automated systems that generate leads</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Email Templates</h4>
<p>Welcome sequences, newsletters, and promotional emails.</p>
</div>
<div class="item-card">
<h4>Digital Mailers</h4>
<p>E-blasts for service announcements and promotions.</p>
</div>
<div class="item-card">
<h4>Lead Magnets</h4>
<p>PDF guides, checklists, and downloads to capture leads.</p>
</div>
<div class="item-card">
<h4>Ad Creatives</h4>
<p>Facebook, Instagram, and Google ad graphics.</p>
</div>
</div>
</div>

                <!-- ADD-ONS: Video & Photo (Detroit Metro Only) -->
<div style="background: linear-gradient(135deg, rgba(255,0,0,0.1), rgba(0,0,0,0.3)); border: 2px solid var(--red); border-radius: 16px; padding: 32px; margin-top: 40px;">
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
<span style="background: var(--red); color: #fff; padding: 6px 16px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📍 Detroit Metro Add-Ons</span>
</div>
<p style="color: #888; font-size: 14px; margin-bottom: 24px;">Video production and photography services available as add-ons for clients in the Detroit metro area. These require in-person sessions at your location.</p>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
                        <!-- Motion & Video Add-On -->
<div class="blog-overlay-dark">
<div class="problem-meta">
<span class="text-3xl">🎬</span>
<div>
<h4 style="margin: 0; font-size: 18px;">Video Production</h4>
<p class="pkg-addon-price">Add-on from $500</p>
</div>
</div>
<ul class="pkg-detail-list">
<li>Logo Animation</li>
<li>Brand Commercial (30-60 sec)</li>
<li>Service Explainer Videos</li>
<li>Testimonial Videos</li>
</ul>
</div>

                        <!-- Photography Add-On -->
<div class="blog-overlay-dark">
<div class="problem-meta">
<span class="text-3xl">📷</span>
<div>
<h4 style="margin: 0; font-size: 18px;">Photography</h4>
<p class="pkg-addon-price">Add-on from $400</p>
</div>
</div>
<ul class="pkg-detail-list">
<li>Team Headshots</li>
<li>Office/Location Shots</li>
<li>Project Photography</li>
<li>Social Content</li>
</ul>
</div>
</div>
<p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">📍 Available for Detroit, Dearborn, Southfield, Troy, Royal Oak, Ferndale, and surrounding metro areas</p>
</div>

<div class="package-cta">
<button class="btn-package" onclick="startServiceIntake('service-brand')">Build Your Service Brand →</button>
</div>
</div>
</section>

        <!-- COMPARISON TABLE -->
<section class="section dark">
<div style="max-width: 1000px; margin: 0 auto; padding: 0 24px;">
<div class="package-header">
<div class="package-label">Compare Packages</div>
<h2 class="package-title">WHAT'S <span class="red">INCLUDED</span></h2>
</div>

<div class="comparison-table">
<div class="comparison-row">
<div class="comparison-cell header">Deliverable</div>
<div class="comparison-cell header">Brand Kit</div>
<div class="comparison-cell header">Product</div>
<div class="comparison-cell header">Service</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Logo Suite</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Color Palette</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Typography System</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Brand Guidelines</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Product Labels & Packaging</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell empty">—</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Business Cards & Stationery</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Print & Signage</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Uniforms & Apparel</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Social Media Kit</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Email Templates</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Logo Animation <span style="font-size: 10px; color: var(--red);">📍 Add-on</span></div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell" class="text-muted-sm">+$400</div>
<div class="comparison-cell" class="text-muted-sm">+$400</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Video Production <span style="font-size: 10px; color: var(--red);">📍 Add-on</span></div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell" class="text-muted-sm">+$500</div>
<div class="comparison-cell" class="text-muted-sm">+$500</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Photography <span style="font-size: 10px; color: var(--red);">📍 Add-on</span></div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell" class="text-muted-sm">+$400</div>
<div class="comparison-cell" class="text-muted-sm">+$400</div>
</div>
<div class="comparison-row">
<div class="comparison-cell feature">Print Signage</div>
<div class="comparison-cell empty">—</div>
<div class="comparison-cell check">✓</div>
<div class="comparison-cell check">✓</div>
</div>
</div>
</div>
</section>

        <!-- WEBSITE & WEBAPP PACKAGES -->
<section class="package-section" style="background: #050505;">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80" alt="Website Development" data-service-image="website">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">Digital Products</div>
<h2 class="package-title">WEBSITE & <span class="red">WEB APPS</span></h2>
<p class="package-subtitle">Your digital headquarters. Built for conversion, designed to dominate.</p>
</div>

<div class="deliverables-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 60px;">
                    <!-- Basic Website -->
<div class="deliverable-card" style="border-color: rgba(255,255,255,0.1);">
<div class="pkg-badge">Starter</div>
<h3 class="deliverable-title" class="text-2xl">Landing Page</h3>
<div class="pkg-price">$1,200</div>
<p class="deliverable-desc">Single page website perfect for capturing leads or launching a product.</p>
<ul class="deliverable-list">
<li>Custom Design</li>
<li>Mobile Responsive</li>
<li>Contact Form</li>
<li>SEO Basics</li>
<li>1 Week Delivery</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('landing-page')">Get Started →</button>
</div>

                    <!-- Business Website -->
<div class="deliverable-card" style="border-color: var(--red); position: relative;">
<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--red); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 16px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Most Popular</div>
<div class="pkg-badge">Professional</div>
<h3 class="deliverable-title" class="text-2xl">Business Website</h3>
<div class="pkg-price">$3,500</div>
<p class="deliverable-desc">Full multi-page website for established businesses ready to dominate online.</p>
<ul class="deliverable-list">
<li>5-7 Custom Pages</li>
<li>CMS Integration</li>
<li>Blog Setup</li>
<li>Advanced SEO</li>
<li>Analytics Dashboard</li>
<li>Speed Optimization</li>
<li>2-3 Week Delivery</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('business-website')">Get Started →</button>
</div>

                    <!-- E-Commerce -->
<div class="deliverable-card" style="border-color: rgba(255,255,255,0.1);">
<div class="pkg-badge">E-Commerce</div>
<h3 class="deliverable-title" class="text-2xl">Online Store</h3>
<div class="pkg-price">$5,500</div>
<p class="deliverable-desc">Full e-commerce solution to sell products online 24/7.</p>
<ul class="deliverable-list">
<li>Shopify / WooCommerce</li>
<li>Product Upload (up to 50)</li>
<li>Payment Integration</li>
<li>Shipping Setup</li>
<li>Abandoned Cart Recovery</li>
<li>Inventory Management</li>
<li>3-4 Week Delivery</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('ecommerce')">Get Started →</button>
</div>
</div>

                <!-- Web App Section -->
<div class="category-section">
<div class="category-header">
<div class="category-icon">⚡</div>
<div>
<h3 class="category-title">Custom Web Applications</h3>
<p class="category-subtitle">Powerful tools built for your specific business needs</p>
</div>
</div>
<div class="items-grid">
<div class="item-card">
<h4>Client Portals</h4>
<p>Secure login areas for clients to access files, invoices, and project updates.</p>
</div>
<div class="item-card">
<h4>Booking Systems</h4>
<p>Custom appointment scheduling with calendar sync and reminders.</p>
</div>
<div class="item-card">
<h4>Member Dashboards</h4>
<p>Membership sites with content access, progress tracking, and community features.</p>
</div>
<div class="item-card">
<h4>Custom CRM</h4>
<p>Contact management and sales pipeline tools tailored to your workflow.</p>
</div>
</div>
<p style="text-align: center; color: var(--gray); margin-top: 32px; font-size: 14px;">Web app pricing starts at <span style="color: var(--red); font-weight: 700;">$7,500</span> — <a onclick="startServiceIntake('webapp')" style="color: #fff; text-decoration: underline; cursor: pointer;">Request a Quote</a></p>
</div>
</div>
</section>

        <!-- MOBILE APP PACKAGES -->
<section class="package-section" style="background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&q=80" alt="Mobile App Development" data-service-image="mobile-app">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">Mobile Development</div>
<h2 class="package-title">MOBILE <span class="red">APPS</span></h2>
<p class="package-subtitle">Put your business in your customers' pockets. Native and cross-platform solutions.</p>
</div>

<div class="deliverables-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <!-- MVP App -->
<div class="deliverable-card">
<div class="pkg-badge">Launch Fast</div>
<h3 class="deliverable-title" class="text-2xl">MVP App</h3>
<div class="pkg-price">$12,000 <span style="font-size: 14px; color: var(--gray); font-weight: 400;">starting at</span></div>
<p class="deliverable-desc">Minimum viable product to test your app idea and get to market fast.</p>
<ul class="deliverable-list">
<li>Cross-Platform (iOS + Android)</li>
<li>Core Feature Set (3-5 features)</li>
<li>User Authentication</li>
<li>Basic Admin Panel</li>
<li>App Store Submission</li>
<li>6-8 Week Delivery</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('mvp-app')">Get Started →</button>
</div>

                    <!-- Full App -->
<div class="deliverable-card">
<div class="pkg-badge">Full Product</div>
<h3 class="deliverable-title" class="text-2xl">Custom Mobile App</h3>
<div class="pkg-price">$20,000+ <span style="font-size: 14px; color: var(--gray); font-weight: 400;">custom quote</span></div>
<p class="deliverable-desc">Full-featured mobile application with advanced functionality and integrations.</p>
<ul class="deliverable-list">
<li>Native or Cross-Platform</li>
<li>Unlimited Features</li>
<li>Payment Integration</li>
<li>Push Notifications</li>
<li>API Integrations</li>
<li>Full Admin Dashboard</li>
<li>Ongoing Support Options</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('custom-app')">Request Quote →</button>
</div>
</div>

                <!-- App Features -->
<div class="category-section" style="margin-top: 60px;">
<div class="category-header">
<div class="category-icon">📲</div>
<div>
<h3 class="category-title">Available App Features</h3>
<p class="category-subtitle">Build the exact functionality your business needs</p>
</div>
</div>
<div class="items-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
<div class="item-card"><h4>User Profiles</h4></div>
<div class="item-card"><h4>Social Login</h4></div>
<div class="item-card"><h4>Push Notifications</h4></div>
<div class="item-card"><h4>In-App Purchases</h4></div>
<div class="item-card"><h4>Booking/Scheduling</h4></div>
<div class="item-card"><h4>Chat & Messaging</h4></div>
<div class="item-card"><h4>GPS & Maps</h4></div>
<div class="item-card"><h4>Camera & Media</h4></div>
<div class="item-card"><h4>Payment Processing</h4></div>
<div class="item-card"><h4>Analytics Dashboard</h4></div>
<div class="item-card"><h4>Loyalty Programs</h4></div>
<div class="item-card"><h4>Offline Mode</h4></div>
</div>
</div>
</div>
</section>

        <!-- SALES FUNNELS & AUTOMATION -->
<section class="package-section" style="background: #050505;">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1920&q=80" alt="Sales Funnels Marketing" data-service-image="sales-funnel">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">Marketing Systems</div>
<h2 class="package-title">SALES <span class="red">FUNNELS</span></h2>
<p class="package-subtitle">Automated systems that turn strangers into customers while you sleep.</p>
</div>

<div class="deliverables-grid" style="grid-template-columns: repeat(3, 1fr);">
<div class="deliverable-card">
<div class="pkg-badge">Lead Generation</div>
<h3 class="deliverable-title">Lead Capture Funnel</h3>
<div class="pkg-price">$1,500</div>
<ul class="deliverable-list">
<li>Landing Page Design</li>
<li>Lead Magnet Creation</li>
<li>Thank You Page</li>
<li>5-Email Welcome Sequence</li>
<li>CRM Integration</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('lead-funnel')">Get Started →</button>
</div>

<div class="deliverable-card" style="border-color: var(--red);">
<div class="pkg-badge">Sales Machine</div>
<h3 class="deliverable-title">Full Sales Funnel</h3>
<div class="pkg-price">$3,500</div>
<ul class="deliverable-list">
<li>Multi-Step Funnel</li>
<li>Sales Page Design</li>
<li>Order/Checkout Pages</li>
<li>Upsell/Downsell Pages</li>
<li>Full Email Automation</li>
<li>Payment Integration</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('sales-funnel')">Get Started →</button>
</div>

<div class="deliverable-card">
<div class="pkg-badge">Webinar</div>
<h3 class="deliverable-title">Webinar Funnel</h3>
<div class="pkg-price">$4,500</div>
<ul class="deliverable-list">
<li>Registration Page</li>
<li>Reminder Sequences</li>
<li>Live/Evergreen Setup</li>
<li>Replay Page</li>
<li>Follow-Up Automation</li>
<li>Sales Page Integration</li>
</ul>
<button class="btn-package" class="pkg-cta" onclick="startServiceIntake('webinar-funnel')">Get Started →</button>
</div>
</div>
</div>
</section>

        <!-- BUILD YOUR OWN PACKAGE -->
<section class="package-section" style="background: linear-gradient(180deg, #0a0a0a 0%, #080808 100%);">
<div class="package-image">
<img loading="lazy" width="1920" height="1200" src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80" alt="Custom Package" data-service-image="custom">
</div>
<div class="container-lg">
<div class="package-header">
<div class="package-label">Customize Your Solution</div>
<h2 class="package-title">BUILD YOUR <span class="red">OWN PACKAGE</span></h2>
<p class="package-subtitle">Select only the services you need. Mix and match to create the perfect solution for your business.</p>
</div>

<div id="customPackageBuilder" style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; margin-bottom: 40px;">

                    <!-- Brand & Identity -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">◆</span>
                            Brand & Identity
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Logo Design" data-price="500"><span class="checkmark"></span><span class="service-name">Logo Design</span><span class="service-price">$500</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Color Palette" data-price="200"><span class="checkmark"></span><span class="service-name">Color Palette</span><span class="service-price">$200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Typography System" data-price="200"><span class="checkmark"></span><span class="service-name">Typography System</span><span class="service-price">$200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Brand Guidelines" data-price="750"><span class="checkmark"></span><span class="service-name">Brand Guidelines</span><span class="service-price">$750</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Business Cards" data-price="150"><span class="checkmark"></span><span class="service-name">Business Cards</span><span class="service-price">$150</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Letterhead & Stationery" data-price="250"><span class="checkmark"></span><span class="service-name">Letterhead & Stationery</span><span class="service-price">$250</span></label>
</div>
</div>

                    <!-- Print & Physical -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">📦</span>
                            Print & Physical
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Product Labels" data-price="300"><span class="checkmark"></span><span class="service-name">Product Labels</span><span class="service-price">$300</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Packaging Design" data-price="500"><span class="checkmark"></span><span class="service-name">Packaging Design</span><span class="service-price">$500</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Posters & Signage" data-price="250"><span class="checkmark"></span><span class="service-name">Posters & Signage</span><span class="service-price">$250</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Window Decals" data-price="200"><span class="checkmark"></span><span class="service-name">Window Decals</span><span class="service-price">$200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Vehicle Magnets Pair (Design+Print)" data-price="195"><span class="checkmark"></span><span class="service-name">Vehicle Magnets Pair</span><span class="service-price">$195</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Banner & Poster Design" data-price="300"><span class="checkmark"></span><span class="service-name">Banner & Poster Design</span><span class="service-price">$300</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Yard Signs 10-Pack (Design+Print)" data-price="350"><span class="checkmark"></span><span class="service-name">Yard Signs 10-Pack (Design+Print)</span><span class="service-price">$350</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Event Backdrop 8x8 (Design+Print)" data-price="450"><span class="checkmark"></span><span class="service-name">Event Backdrop 8x8 (Design+Print)</span><span class="service-price">$450</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Wall Mural Design" data-price="600"><span class="checkmark"></span><span class="service-name">Wall Mural Design</span><span class="service-price">$600</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Brochures & Flyers" data-price="200"><span class="checkmark"></span><span class="service-name">Brochures & Flyers</span><span class="service-price">$200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Business Cards 500 (Design+Print)" data-price="275"><span class="checkmark"></span><span class="service-name">Business Cards 500</span><span class="service-price">$275</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Postcards 250 (Design+Print)" data-price="225"><span class="checkmark"></span><span class="service-name">Postcards 250 (4x6)</span><span class="service-price">$225</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Acrylic Sign 12x12 (Design+Print)" data-price="275"><span class="checkmark"></span><span class="service-name">Acrylic Sign 12x12</span><span class="service-price">$275</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Dibond Sign 12x18 (Design+Print)" data-price="325"><span class="checkmark"></span><span class="service-name">Dibond Sign 12x18</span><span class="service-price">$325</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Foam Core 18x24 (Design+Print)" data-price="195"><span class="checkmark"></span><span class="service-name">Foam Core 18x24</span><span class="service-price">$195</span></label>
</div>
</div>

                    <!-- Apparel & Merch -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">👕</span>
                            Apparel & Merchandise
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="T-Shirt Design" data-price="150"><span class="checkmark"></span><span class="service-name">T-Shirt Design</span><span class="service-price">$150</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Hoodie Design" data-price="150"><span class="checkmark"></span><span class="service-name">Hoodie Design</span><span class="service-price">$150</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Hat/Cap Design" data-price="100"><span class="checkmark"></span><span class="service-name">Hat/Cap Design</span><span class="service-price">$100</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Uniform Design (Full Set)" data-price="400"><span class="checkmark"></span><span class="service-name">Uniform Design (Full)</span><span class="service-price">$400</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Tote Bag Design" data-price="100"><span class="checkmark"></span><span class="service-name">Tote Bag Design</span><span class="service-price">$100</span></label>
</div>
</div>

                    <!-- Digital Marketing -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">📱</span>
                            Digital Marketing
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Social Media Kit" data-price="350"><span class="checkmark"></span><span class="service-name">Social Media Kit</span><span class="service-price">$350</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Email Templates (5)" data-price="300"><span class="checkmark"></span><span class="service-name">Email Templates (5)</span><span class="service-price">$300</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Digital Mailers" data-price="150"><span class="checkmark"></span><span class="service-name">Digital Mailers</span><span class="service-price">$150</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Ad Creatives (10)" data-price="400"><span class="checkmark"></span><span class="service-name">Ad Creatives (10)</span><span class="service-price">$400</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Lead Magnet Design" data-price="250"><span class="checkmark"></span><span class="service-name">Lead Magnet Design</span><span class="service-price">$250</span></label>
</div>
</div>

                    <!-- Motion & Video -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">🎬</span>
                            Motion & Video
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Logo Animation" data-price="400"><span class="checkmark"></span><span class="service-name">Logo Animation</span><span class="service-price">$400</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Brand Commercial (30sec)" data-price="1200"><span class="checkmark"></span><span class="service-name">Brand Commercial</span><span class="service-price">$1,200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Social Reels (5)" data-price="500"><span class="checkmark"></span><span class="service-name">Social Reels (5)</span><span class="service-price">$500</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Motion Graphics Pack" data-price="600"><span class="checkmark"></span><span class="service-name">Motion Graphics Pack</span><span class="service-price">$600</span></label>
</div>
</div>

                    <!-- Photography -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">📷</span>
                            Photography & Production
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Product Photography (10)" data-price="400"><span class="checkmark"></span><span class="service-name">Product Photos (10)</span><span class="service-price">$400</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Headshots (5 people)" data-price="350"><span class="checkmark"></span><span class="service-name">Headshots (5 people)</span><span class="service-price">$350</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Lifestyle Photo Session" data-price="600"><span class="checkmark"></span><span class="service-name">Lifestyle Session</span><span class="service-price">$600</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Location/Office Shoot" data-price="500"><span class="checkmark"></span><span class="service-name">Location Shoot</span><span class="service-price">$500</span></label>
</div>
</div>

                    <!-- Web & Digital -->
<div class="mb-40">
<h3 class="pkg-group-title">
<span class="pkg-group-icon">🌐</span>
                            Web & Digital Products
</h3>
<div class="pkg-feature-grid">
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Landing Page" data-price="1200"><span class="checkmark"></span><span class="service-name">Landing Page</span><span class="service-price">$1,200</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Business Website" data-price="3500"><span class="checkmark"></span><span class="service-name">Business Website</span><span class="service-price">$3,500</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="E-Commerce Store" data-price="5500"><span class="checkmark"></span><span class="service-name">E-Commerce Store</span><span class="service-price">$5,500</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Sales Funnel" data-price="2000"><span class="checkmark"></span><span class="service-name">Sales Funnel</span><span class="service-price">$2,000</span></label>
<label class="custom-service-item" onclick="toggleCustomService(event, this)"><input type="checkbox" data-service="Google Business Setup" data-price="200"><span class="checkmark"></span><span class="service-name">Google Business Setup</span><span class="service-price">$200</span></label>
</div>
</div>

                    <!-- Summary Box -->
<div id="customPackageSummary" style="background: #050505; border: 2px solid rgba(255,59,48,0.3); border-radius: 12px; padding: 32px; margin-top: 40px;">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;">
<div>
<div style="font-size: 13px; color: var(--gray); margin-bottom: 8px;">Your Custom Package</div>
<div style="font-size: 14px; color: rgba(255,255,255,0.6);" id="selectedServicesCount">0 services selected</div>
</div>
<div class="text-right">
<div style="font-size: 13px; color: var(--gray); margin-bottom: 8px;">Estimated Total</div>
<div style="font-size: 36px; font-weight: 900; color: var(--red);" id="customPackageTotal">$0</div>
</div>
<button class="btn-package" onclick="submitCustomPackage()" style="padding: 18px 48px;">Request Custom Quote →</button>
</div>
<div id="selectedServicesList" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); display: none;">
<div style="font-size: 12px; color: var(--gray); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Selected Services:</div>
<div id="selectedServicesDisplay" class="flex-wrap"></div>
</div>
</div>
</div>
</div>
</section>

<style>
            .custom-service-item { display: flex; align-items: center; gap: 12px; background: #0c0c0c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 16px 18px; cursor: pointer; transition: all 0.25s ease; }
            .custom-service-item:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            .custom-service-item.selected { border-color: var(--red); background: rgba(255,59,48,0.12); box-shadow: 0 0 20px rgba(255,59,48,0.2); }
            .custom-service-item.selected:hover { background: rgba(255,59,48,0.18); }
            .custom-service-item input { display: none; }
            .custom-service-item .checkmark { width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.25); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
            .custom-service-item:hover .checkmark { border-color: rgba(255,255,255,0.4); }
            .custom-service-item.selected .checkmark { background: var(--red); border-color: var(--red); }
            .custom-service-item.selected .checkmark::after { content: '✓'; color: #fff; font-size: 13px; font-weight: 700; }
            .custom-service-item .service-name { flex: 1; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.95); }
            .custom-service-item .service-price { font-size: 14px; font-weight: 800; color: var(--red); }
            .custom-service-item.selected .service-name { color: #fff; }
            .selected-service-tag { background: rgba(255,59,48,0.2); border: 1px solid rgba(255,59,48,0.4); color: #fff; font-size: 11px; padding: 8px 14px; border-radius: 6px; font-weight: 600; }
</style>

<section class="cta-section"><h2>HAVE <span>QUESTIONS?</span></h2><p>Book a free strategy call and we'll help you figure out exactly what your business needs.</p><button class="btn-white" onclick="startServiceIntake('consultation')">Book Free Consultation</button></section>
        ${getFooterHTML()}
    `;
    requestAnimationFrame(function() { _nuiMotionEngine(); });
}

// Custom Package Builder Functions
function toggleCustomService(event, el) {
    event.preventDefault();
    event.stopPropagation();
    el.classList.toggle('selected');
    const input = el.querySelector('input');
    if (input) input.checked = el.classList.contains('selected');
    updateCustomPackageTotal();
}

function updateCustomPackageTotal() {
    const selected = document.querySelectorAll('.custom-service-item.selected');
    let total = 0;
    let services = [];
    selected.forEach(item => {
        const input = item.querySelector('input');
        total += parseInt(input.dataset.price);
        services.push(input.dataset.service);
    });
    document.getElementById('customPackageTotal').textContent = '$' + total.toLocaleString();
    document.getElementById('selectedServicesCount').textContent = selected.length + ' service' + (selected.length !== 1 ? 's' : '') + ' selected';
    const listEl = document.getElementById('selectedServicesList');
    const displayEl = document.getElementById('selectedServicesDisplay');
    if (services.length > 0) {
        listEl.style.display = 'block';
        displayEl.innerHTML = services.map(s => '<span class="selected-service-tag">' + s + '</span>').join('');
    } else {
        listEl.style.display = 'none';
    }
}

function submitCustomPackage() {
    try {
        const selected = document.querySelectorAll('.custom-service-item.selected');
        if (selected.length === 0) {
            alert('Please select at least one service to continue.');
            return;
        }
        let services = [];
        let total = 0;
        selected.forEach(item => {
            const input = item.querySelector('input');
            services.push(input.dataset.service);
            total += parseInt(input.dataset.price);
        });
        localStorage.setItem('customPackageServices', JSON.stringify(services));
        localStorage.setItem('customPackageTotal', total.toString());
        console.log('Submitting custom package:', services, total);
        startServiceIntake('custom-package');
    } catch (e) {
        console.error('Error in submitCustomPackage:', e);
        alert('Error: ' + e.message);
    }
}

// ==================== PORTFOLIO VIEW ====================
// Default portfolio data — used as fallback when localStorage is empty or has broken refs
var _defaultPortfolio = [
    { id: 'good-cakes-and-bakes', name: 'Good Cakes and Bakes', tag: 'Brand Identity + Web', desc: 'Complete brand transformation for Detroit\'s favorite bakery', mission: 'To bring joy to Detroit one delicious bake at a time, crafting memories with every bite.', slogan: 'Baked with Love, Served with Soul', websiteUrl: 'https://goodcakesandbakes.com', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800', colors: ['#D4A574', '#2C1810', '#F5E6D3', '#8B4513'], fonts: { heading: 'Playfair Display', body: 'Lato' }, assets: { primaryLogo: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', secondaryLogo: '', iconMark: '', mockups: [] }, results: { revenue: '+340%', traffic: '+520%', engagement: '+280%' }, testimonial: { text: 'NUI transformed our small bakery into a recognized Detroit brand. Our online orders tripled within 3 months!', author: 'Sarah Mitchell', title: 'Owner' } },
    { id: 'motor-city-bistro', name: 'Cloud nine', tag: 'Web Design + Marketing', desc: 'Culinary excellence meets digital sophistication', mission: 'Elevating Detroit\'s culinary scene with innovative cuisine and exceptional hospitality.', slogan: 'Where Detroit Dines Different', websiteUrl: '', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', colors: ['#1A1A2E', '#C4A35A', '#F0F0F0', '#2C2C54'], fonts: { heading: 'Cormorant Garamond', body: 'Montserrat' }, assets: { primaryLogo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', secondaryLogo: '', iconMark: '', mockups: [] }, results: { revenue: '+280%', traffic: '+410%', engagement: '+190%' }, testimonial: { text: 'The website they built us is stunning. Reservations are up 200% and we\'re now booked weeks in advance.', author: 'Marcus Johnson', title: 'Executive Chef' } },
    { id: 'detroit-canvas-co', name: 'Jos Gallerry Art Gallery', tag: 'Social Media + Video', desc: 'Art meets commerce with scroll-stopping content', mission: 'Empowering artists to share their vision and build sustainable creative businesses.', slogan: 'Your Art. Your Story. Your Canvas.', websiteUrl: '', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', colors: ['#FF6B6B', '#4ECDC4', '#1A1A1A', '#F8F8F8'], fonts: { heading: 'Bebas Neue', body: 'Open Sans' }, assets: { primaryLogo: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', secondaryLogo: '', iconMark: '', mockups: [] }, results: { revenue: '+190%', traffic: '+680%', engagement: '+450%' }, testimonial: { text: 'Our Instagram went from 2K to 50K followers. The content they create is absolutely fire.', author: 'Jamal Greene', title: 'Founder' } },
    { id: 'ascend-coaching-group', name: 'Aj VIP', tag: 'Funnels + Automation', desc: 'Lead generation systems that convert 24/7', mission: 'Helping entrepreneurs unlock their potential and build thriving businesses through expert coaching.', slogan: 'Rise. Lead. Succeed.', websiteUrl: '', img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', colors: ['#2D3436', '#00B894', '#FDFDFD', '#636E72'], fonts: { heading: 'Poppins', body: 'Inter' }, assets: { primaryLogo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', secondaryLogo: '', iconMark: '', mockups: [] }, results: { revenue: '+520%', traffic: '+310%', engagement: '+240%' }, testimonial: { text: 'The funnel they built generates leads while I sleep. Best investment I ever made for my business.', author: 'Sarah Chen', title: 'CEO' } }
];

// Load from localStorage, merge names from defaults, and fix broken image refs
var _storedPortfolio = null;
try { _storedPortfolio = JSON.parse(localStorage.getItem('nui_portfolio')); } catch(e) {}

let portfolioData;
if (_storedPortfolio && _storedPortfolio.length > 0) {
    // Use stored data but fix broken idb:// and [too-large] image refs
    portfolioData = _storedPortfolio.map(function(item, idx) {
        var fallback = _defaultPortfolio[idx] || _defaultPortfolio[0];
        // Fix hero image: replace idb:// or empty with fallback
        if (!item.img || item.img.startsWith('idb://') || item.img === '[too-large]') {
            item.img = fallback.img;
        }
        // Fix asset images
        if (item.assets) {
            ['primaryLogo', 'secondaryLogo', 'iconMark'].forEach(function(k) {
                if (item.assets[k] && (item.assets[k].startsWith('idb://') || item.assets[k] === '[too-large]')) {
                    item.assets[k] = (fallback.assets && fallback.assets[k]) ? fallback.assets[k] : '';
                }
            });
            if (item.assets.mockups) {
                item.assets.mockups = item.assets.mockups.map(function(m) {
                    return (m && (m.startsWith('idb://') || m === '[too-large]')) ? '' : m;
                });
            }
        }
        // Sync names from defaults (so admin updates propagate)
        if (fallback && item.id === fallback.id) {
            item.name = fallback.name;
        }
        return item;
    });
} else {
    portfolioData = JSON.parse(JSON.stringify(_defaultPortfolio));
}

// Lightweight cloud sync — fetch portfolio from Supabase database via Netlify function
// This ensures ALL visitors (not just admin users) see real portfolio images
(function() {
    var SYNC_URL = '/.netlify/functions/sync-data?type=all';
    fetch(SYNC_URL)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(result) {
            if (!result || !result.success || !result.syncData) return;
            var cloudData = result.syncData.portfolio && result.syncData.portfolio.data;
            if (!Array.isArray(cloudData) || cloudData.length === 0) return;
            // Fix any broken image refs using defaults as fallback
            cloudData.forEach(function(item, idx) {
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
            });
            // Only update if cloud data has different images
            var oldImgs = portfolioData.map(function(p) { return p.img; }).join('|');
            var newImgs = cloudData.map(function(p) { return p.img; }).join('|');
            if (oldImgs !== newImgs) {
                portfolioData = cloudData;
                try { localStorage.setItem('nui_portfolio', JSON.stringify(portfolioData)); } catch(e) {}
                if (typeof _refreshHomepageCaseStudies === 'function') {
                    _refreshHomepageCaseStudies();
                }
                console.log('✅ Portfolio synced from cloud for all visitors');
            }
        })
        .catch(function() { /* silent fail — defaults already showing */ });
})();

function savePortfolio() {
    try {
        localStorage.setItem('nui_portfolio', JSON.stringify(portfolioData));
    } catch(e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('Portfolio save hit storage limit, compressing...');
            const saveData = JSON.parse(JSON.stringify(portfolioData));
            saveData.forEach(p => {
                if (p.img && p.img.startsWith('data:') && p.img.length > 80000) p.img = '[too-large]';
                if (p.assets) {
                    ['primaryLogo','secondaryLogo','iconMark'].forEach(k => {
                        if (p.assets[k] && p.assets[k].startsWith('data:') && p.assets[k].length > 80000) p.assets[k] = '[too-large]';
                    });
                    if (p.assets.mockups) {
                        p.assets.mockups = p.assets.mockups.map(m => (m.startsWith('data:') && m.length > 80000) ? '[too-large]' : m);
                    }
                }
            });
            try {
                localStorage.setItem('nui_portfolio', JSON.stringify(saveData));
            } catch(e2) {
                alert('Storage full! Use image URLs instead of file uploads for portfolio images, or clear old data from other panels.');
            }
        }
    }
    // Sync to Supabase cloud so all devices see changes
    if (window.NuiPortfolioSync) {
        NuiPortfolioSync.save(portfolioData);
    }
    // Also push to backend sync for cross-device hydration
    const portfolioSyncData = portfolioData.map(p => {
        const clone = Object.assign({}, p);
        // Strip oversized base64 from sync payload
        if (clone.img && clone.img.startsWith('data:') && clone.img.length > 80000) clone.img = '[too-large]';
        if (clone.assets) {
            ['primaryLogo','secondaryLogo','iconMark'].forEach(k => {
                if (clone.assets[k] && clone.assets[k].startsWith('data:') && clone.assets[k].length > 80000) clone.assets[k] = '[too-large]';
            });
        }
        return clone;
    });
    _pushToBackend('portfolio', portfolioSyncData);
}

// ==================== ABOUT PAGE DATA ====================
let aboutData = JSON.parse(localStorage.getItem('nui_about')) || {
    storyImage: '',
    team: [
        { name: 'Faren Young', title: 'Creative Director & Founder', bio: 'Native Detroiter with 20+ years guiding businesses to success through bold design and strategic branding.', photo: '' },
        { name: 'Creative Team', title: 'Design & Development', bio: 'A network of skilled designers, developers, and strategists ready to bring your vision to life.', photo: '/images/creative-team.png' },
        { name: 'Matt', title: 'Mobile Developer', bio: 'Full-stack mobile developer crafting seamless iOS and Android experiences with pixel-perfect precision.', photo: '' },
        { name: 'Michelle', title: 'UI/UX Designer', bio: 'Bringing warmth and intuition to every interface. Michelle turns complex workflows into delightful user experiences.', photo: '' },
        { name: 'You?', title: 'Join Our Team', bio: 'We\'re always looking for talented creatives who share our passion for bold design.', photo: '' }
    ]
};
function saveAbout() {
    localStorage.setItem('nui_about', JSON.stringify(aboutData));
    _pushToBackend('about', aboutData);
}

function loadPortfolioView() {
    document.getElementById('portfolioView').innerHTML = `
<style>
            /* PORTFOLIO CARDS GRID */
            .portfolio-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-bottom: 60px; }
            .portfolio-preview-card { position: relative; border-radius: 24px; overflow: hidden; cursor: pointer; transition: all 0.4s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
            .portfolio-preview-card:hover { transform: translateY(-8px); box-shadow: 0 30px 80px rgba(0,0,0,0.6); }
            .portfolio-card-image { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; }
            .portfolio-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 32px; }
            .portfolio-card-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 12px; }
            .portfolio-card-title { font-size: 28px; font-weight: 800; margin-bottom: 12px; line-height: 1.2; }
            .portfolio-card-desc { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .portfolio-card-btn { margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #fff; opacity: 0; transform: translateY(10px); transition: all 0.3s; }
            .portfolio-preview-card:hover .portfolio-card-btn { opacity: 1; transform: translateY(0); }

            /* CASE STUDY EXPANDED */
            .case-study { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 32px; overflow: hidden; display: none; }
            .case-study.open { display: block; }
            .case-header { display: flex; align-items: center; justify-content: space-between; padding: 32px 40px; cursor: pointer; transition: all 0.3s; position: relative; background: rgba(0,0,0,0.4); }
            .case-header::before { display: none; }
            .case-header:hover { background: rgba(255,255,255,0.02); }
            .case-header-left { display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; }
            .case-logo { width: 64px; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            .case-logo img { width: 100%; height: 100%; object-fit: cover; }
            .case-info h3 { font-size: 24px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
            .case-info .tag { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-size: 10px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
            .case-toggle { width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.3s; position: relative; z-index: 1; }
            .case-study.open .case-toggle { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }

            @media (max-width: 968px) {
                .portfolio-cards-grid { grid-template-columns: 1fr; gap: 24px; }
                .portfolio-card-title { font-size: 22px; }
                .portfolio-card-overlay { padding: 24px; }
            }
            @media (max-width: 580px) {
                .portfolio-cards-grid { gap: 16px; }
                .portfolio-card-title { font-size: 18px; }
                .portfolio-card-desc { font-size: 12px; }
                .portfolio-card-overlay { padding: 20px; }
            }
            .case-content { max-height: 0; overflow: hidden; transition: max-height 0.8s ease; }
            .case-study.open .case-content { max-height: 8000px; }
            .case-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 40px; background: rgba(0,0,0,0.5); }
            .case-tab { padding: 16px 28px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; text-transform: uppercase; letter-spacing: 2px; }
            .case-tab:hover { color: rgba(255,255,255,0.6); }
            .case-tab.active { color: #fff; border-color: currentColor; }
            .case-panels { padding: 0; }
            .case-panel { display: none; animation: fadeIn 0.4s ease; }
            .case-panel.active { display: block; }
            .brand-section { margin-bottom: 56px; }
            .brand-section-title { font-size: 11px; color: var(--red); text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
            .brand-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,59,48,0.3), transparent); }
            .logo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .logo-box { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0; text-align: center; transition: all 0.3s; aspect-ratio: 4/3; display: flex; flex-direction: column; overflow: hidden; }
            .logo-box:hover { border-color: rgba(255,255,255,0.12); transform: scale(1.01); }
            .logo-box-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; padding: 12px 16px; background: rgba(0,0,0,0.9); font-weight: 600; position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; }
            .logo-box-img { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0; position: relative; background: #080808; }
            .logo-box-img img { width: 100%; height: 100%; object-fit: contain; padding: 20px; }
            .logo-placeholder { width: 100%; height: 100%; background: #080808; border: none; border-radius: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.1); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .color-box { aspect-ratio: 1; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding: 12px; position: relative; overflow: hidden; }
            .color-box::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }
            .color-hex { position: relative; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 1px; }
            .font-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .font-box { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; padding: 32px; }
            .font-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
            .font-name { font-size: 36px; font-weight: 700; margin-bottom: 8px; color: #000; }
            .font-sample { color: #333; font-size: 14px; line-height: 1.6; }
            .mockup-grid { display: flex; flex-direction: column; gap: 16px; }
            .mockup-row { display: grid; gap: 16px; }
            .mockup-row.full { grid-template-columns: 1fr; }
            .mockup-row.split { grid-template-columns: 1fr 1fr; }
            .mockup-box { background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; position: relative; transition: all 0.3s ease; }
            .mockup-box.wide { aspect-ratio: 16/9; }
            .mockup-box.tall { aspect-ratio: 4/5; }
            .mockup-box:hover { transform: scale(1.01); border-color: rgba(255,255,255,0.12); }
            .mockup-box img, .mockup-box video { width: 100%; height: 100%; object-fit: cover; }
            .mockup-box::after { display: none; }
            .mockup-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.12); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; gap: 10px; background: #080808; }
            .mockup-placeholder::before { content: '+'; width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: rgba(255,255,255,0.1); }
            .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .result-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 48px 32px; text-align: center; position: relative; overflow: hidden; }
            .result-card::before { display: none; }
            .result-number { font-size: 64px; font-weight: 900; position: relative; }
            .result-label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 3px; margin-top: 12px; position: relative; }
            .website-preview { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
            .website-preview img { width: 100%; display: block; }
            .testimonial-box { background: rgba(0,0,0,0.3); border-left: 3px solid; padding: 48px; border-radius: 0 8px 8px 0; }
            .testimonial-box p { font-size: 22px; font-style: italic; line-height: 1.7; margin-bottom: 32px; font-weight: 300; }
            .testimonial-author { display: flex; align-items: center; gap: 20px; }
            .testimonial-avatar { width: 48px; height: 48px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
            @media (max-width: 768px) {
                .case-study { border-radius: 6px; margin-bottom: 16px; }
                .case-header { padding: 20px; }
                .case-header-left { gap: 16px; }
                .case-logo { width: 48px; height: 48px; border-radius: 4px; }
                .case-info h3 { font-size: 16px; margin-bottom: 4px; }
                .case-info .tag { font-size: 9px; padding: 3px 8px; border-radius: 3px; }
                .case-toggle { width: 32px; height: 32px; font-size: 12px; border-radius: 4px; }
                .case-tabs { padding: 0 16px; }
                .case-tab { padding: 12px 14px; font-size: 9px; letter-spacing: 1px; }
                .brand-section { margin-bottom: 36px; }
                .brand-section-title { font-size: 9px; margin-bottom: 20px; }
                .logo-grid { grid-template-columns: 1fr !important; gap: 12px; }
                .logo-box { border-radius: 6px; aspect-ratio: 16/9; }
                .logo-box-label { font-size: 9px; padding: 10px 12px; }
                .logo-box-img img { padding: 16px; }
                .logo-placeholder { font-size: 9px; }
                .color-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }
                .color-box { border-radius: 4px; }
                .color-hex { font-size: 9px; }
                .font-grid { grid-template-columns: 1fr !important; gap: 12px; }
                .font-box { padding: 20px; border-radius: 6px; }
                .font-label { font-size: 9px; }
                .font-name { font-size: 24px; }
                .font-sample { font-size: 11px; }
                .mockup-grid { gap: 12px; }
                .mockup-row.split { grid-template-columns: 1fr; gap: 12px; }
                .mockup-box { border-radius: 6px; }
                .mockup-box.tall { aspect-ratio: 16/9; }
                .mockup-placeholder { font-size: 10px; }
                .results-grid { grid-template-columns: 1fr !important; gap: 12px; }
                .result-card { padding: 24px; border-radius: 14px; }
                .result-number { font-size: 36px; }
                .result-label { font-size: 9px; letter-spacing: 2px; }
                .website-preview { border-radius: 10px; }
                .website-preview img { height: 200px; }
                .testimonial-box { padding: 24px; border-radius: 0 12px 12px 0; }
                .testimonial-box p { font-size: 16px; margin-bottom: 20px; }
                .testimonial-author { gap: 12px; }
                .testimonial-avatar { width: 40px; height: 40px; font-size: 16px; }
            }
</style>
<section class="section dark" style="padding-top: 160px;">
<div class="portfolio-header" style="text-align: center; margin-bottom: 80px;">
<div class="label" style="justify-content: center; margin-bottom: 24px;">Case Studies</div>
<h2 class="section-title">OUR <span class="red">WORK</span></h2>
<p class="section-subtitle" style="max-width: 600px; margin: 24px auto 0;">Explore our complete brand transformations. Click each case study to dive into the brand guide, website, results, and client testimonials.</p>
</div>
<div style="max-width: 1400px; margin: 0 auto; padding: 0 16px;">
                <!-- PORTFOLIO PREVIEW CARDS -->
<div class="portfolio-cards-grid">
                    ${portfolioData.map((p, i) => {
                        const imgIsIdb = p.img && p.img.startsWith('idb://');
                        return `
<div class="portfolio-preview-card" onclick="openPortfolioCase('${p.id}')" style="background: linear-gradient(145deg, ${p.colors[1] || '#0a0a0a'} 0%, #0a0a0a 100%); border: 1px solid ${p.colors[0]}30;">
<img loading="lazy" src="${imgIsIdb ? '' : ((p.img && p.img !== '[too-large]') ? p.img : '')}" data-idb-src="${p.img || ''}" alt="${p.name}" class="portfolio-card-image" onerror="this.style.display='none';var d=document.createElement('div');d.style.cssText='width:100%;aspect-ratio:16/10;background:linear-gradient(135deg,${(p.colors[1]||'#1a1a2e').replace(/'/g,'')},#0a0a0a);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.15);font-size:48px;font-weight:900;';d.textContent='${p.name.charAt(0)}';this.parentElement.insertBefore(d,this);">
<div class="portfolio-card-overlay" style="background: linear-gradient(to top, ${p.colors[1] || '#000'}ee 0%, ${p.colors[1] || '#000'}99 30%, transparent 100%);">
<div class="portfolio-card-tag" style="color: ${p.colors[0]};">${p.tag}</div>
<div class="portfolio-card-title">${p.name}</div>
<div class="portfolio-card-desc">${p.desc}</div>
<div class="portfolio-card-btn" style="color: ${p.colors[0]};">View Case Study <span>→</span></div>
</div>
</div>`;
                    }).join('')}
</div>

                <!-- EXPANDED CASE STUDIES -->
                ${portfolioData.map((p, i) => `
<div class="case-study" id="case-${p.id}">
<div class="case-header" onclick="toggleCase('${p.id}')">
<div class="case-header-left">
<div class="case-logo"><img loading="lazy" src="${((p.assets?.primaryLogo || p.img || '') && !(p.assets?.primaryLogo || p.img || '').startsWith('idb://') && (p.assets?.primaryLogo || p.img || '') !== '[too-large]') ? (p.assets?.primaryLogo || p.img || '') : ''}" data-idb-src="${p.assets?.primaryLogo || p.img || ''}" alt="${p.name}" onerror="this.style.display='none';"></div>
<div class="case-info">
<h3>${p.name}</h3>
<span class="tag">${p.tag}</span>
</div>
</div>
<div class="case-toggle">✕</div>
</div>
<div class="case-content">
<div class="case-tabs">
<div class="case-tab active" onclick="switchCaseTab('${p.id}', 0, this)">Brand Guide</div>
<div class="case-tab" onclick="switchCaseTab('${p.id}', 1, this)">Website / Webapp</div>
<div class="case-tab" onclick="switchCaseTab('${p.id}', 2, this)">Results</div>
<div class="case-tab" onclick="switchCaseTab('${p.id}', 3, this)">Testimonial</div>
</div>
<div class="case-panels" style="padding: 0;">
                                <!-- BRAND HERO BANNER -->
<div class="brand-hero" style="width: 100%; min-height: 360px; background: linear-gradient(145deg, ${p.colors[1]} 0%, #050505 100%); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 60px 40px;">
<div style="position: absolute; inset: 0; ${p.img && !p.img.startsWith('idb://') ? "background: url('" + p.img + "') center/cover;" : ''} opacity: 0.2;" ${p.img && p.img.startsWith('idb://') ? 'data-idb-bg="' + p.img + '"' : ''}></div>
<div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);"></div>
<div style="position: relative; text-align: center; z-index: 1; max-width: 100%;">
<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 4px; color: ${p.colors[0]}; margin-bottom: 16px; font-weight: 600;">${p.tag}</div>
<h2 style="font-size: clamp(32px, 7vw, 80px); font-weight: 900; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">${p.name}</h2>
<p style="color: rgba(255,255,255,0.5); font-size: 15px; margin-top: 20px; max-width: 550px; margin-left: auto; margin-right: auto; line-height: 1.6;">${p.desc}</p>
</div>
<div style="position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px;">
                                        ${p.colors.map(c => `<div style="width: 28px; height: 28px; border-radius: 4px; background: ${c}; border: 1px solid rgba(255,255,255,0.15);"></div>`).join('')}
</div>
</div>
<div class="case-panel active" data-case="${p.id}" data-panel="0" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${p.colors[1]}10 100%);">
                                    <!-- MISSION & SLOGAN -->
                                    ${(p.slogan || p.mission) ? `
<div class="brand-section">
<div class="brand-section-title" style="color: ${p.colors[0]};">Brand Voice</div>
<div style="display: grid; grid-template-columns: ${p.slogan && p.mission ? '1fr 1fr' : '1fr'}; gap: 20px;">
                                            ${p.slogan ? `
<div class="blog-card-dark">
<div style="font-size: 10px; color: ${p.colors[0]}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; font-weight: 600;">Slogan</div>
<div style="font-size: 24px; font-weight: 700; line-height: 1.3; color: #fff;">"${p.slogan}"</div>
</div>` : ''}
                                            ${p.mission ? `
<div class="blog-card-dark">
<div style="font-size: 10px; color: ${p.colors[0]}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; font-weight: 600;">Mission Statement</div>
<div style="font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.7);">${p.mission}</div>
</div>` : ''}
</div>
</div>` : ''}
                                    <!-- LOGOS SECTION -->
<div class="brand-section">
<div class="brand-section-title" style="color: ${p.colors[0]};">Logo System</div>
<div class="logo-grid">
<div class="logo-box" style="border-color: ${p.colors[0]}20; position: relative;">
<div class="logo-box-img">${p.assets?.primaryLogo && p.assets.primaryLogo !== '[too-large]' ? `<img loading="lazy" src="${p.assets.primaryLogo.startsWith('idb://') ? '' : p.assets.primaryLogo}" data-idb-src="${p.assets.primaryLogo}" alt="Primary Logo" onerror="_applyImageFallback(this)">` : '<div class="logo-placeholder">No Logo</div>'}</div>
<div class="logo-box-label" style="background: rgba(0,0,0,0.8);">Primary Logo</div>
</div>
<div class="logo-box" style="border-color: ${p.colors[0]}20; position: relative;">
<div class="logo-box-img">${p.assets?.secondaryLogo && p.assets.secondaryLogo !== '[too-large]' ? `<img loading="lazy" src="${p.assets.secondaryLogo.startsWith('idb://') ? '' : p.assets.secondaryLogo}" data-idb-src="${p.assets.secondaryLogo}" alt="Secondary Logo" onerror="_applyImageFallback(this)">` : '<div class="logo-placeholder">No Logo</div>'}</div>
<div class="logo-box-label" style="background: rgba(0,0,0,0.8);">Secondary Logo</div>
</div>
<div class="logo-box" style="border-color: ${p.colors[0]}20; position: relative;">
<div class="logo-box-img">${p.assets?.iconMark && p.assets.iconMark !== '[too-large]' ? `<img loading="lazy" src="${p.assets.iconMark.startsWith('idb://') ? '' : p.assets.iconMark}" data-idb-src="${p.assets.iconMark}" alt="Icon Mark" onerror="_applyImageFallback(this)">` : '<div class="logo-placeholder">No Icon</div>'}</div>
<div class="logo-box-label" style="background: rgba(0,0,0,0.8);">Icon / Logo Mark</div>
</div>
</div>
</div>
                                    <!-- COLOR PALETTE -->
<div class="brand-section">
<div class="brand-section-title" style="color: ${p.colors[0]};">Color Palette</div>
<div class="color-grid">
                                            ${p.colors.map((c, idx) => `<div class="color-box" style="background: ${c};"><div class="color-hex">${c}</div></div>`).join('')}
</div>
</div>
                                    <!-- FONT SYSTEM -->
<div class="brand-section">
<div class="brand-section-title" style="color: ${p.colors[0]};">Font System</div>
<div class="font-grid">
<div class="font-box">
<div class="font-label">Heading Font</div>
<div class="font-name">${p.fonts?.heading || p.fonts?.[0] || 'Inter'}</div>
<div class="font-sample">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</div>
</div>
<div class="font-box">
<div class="font-label">Body Font</div>
<div class="font-name">${p.fonts?.body || p.fonts?.[1] || 'Inter'}</div>
<div class="font-sample">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</div>
</div>
</div>
</div>
                                    <!-- BRAND MOCKUPS -->
<div class="brand-section">
<div class="brand-section-title" style="color: ${p.colors[0]};">Brand Mockups</div>
<div class="mockup-grid">
                                            <!-- Top 16:9 -->
<div class="mockup-row full">
<div class="mockup-box wide" style="border-color: ${p.colors[0]}15;">
                                                    ${p.assets?.mockups?.[0] ? (p.assets.mockups[0].includes('video') || p.assets.mockups[0].match(/\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.mockups[0]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.mockups[0]}" alt="Mockup">`) : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
                                            <!-- Middle two 4:5 -->
<div class="mockup-row split">
<div class="mockup-box tall" style="border-color: ${p.colors[0]}15;">
                                                    ${p.assets?.mockups?.[1] ? (p.assets.mockups[1].includes('video') || p.assets.mockups[1].match(/\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.mockups[1]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.mockups[1]}" alt="Mockup">`) : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
<div class="mockup-box tall" style="border-color: ${p.colors[0]}15;">
                                                    ${p.assets?.mockups?.[2] ? (p.assets.mockups[2].includes('video') || p.assets.mockups[2].match(/\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.mockups[2]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.mockups[2]}" alt="Mockup">`) : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
                                            <!-- Bottom 16:9 -->
<div class="mockup-row full">
<div class="mockup-box wide" style="border-color: ${p.colors[0]}15;">
                                                    ${p.assets?.mockups?.[3] ? (p.assets.mockups[3].includes('video') || p.assets.mockups[3].match(/\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.mockups[3]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.mockups[3]}" alt="Mockup">`) : '<div class="mockup-placeholder">Image / Video</div>'}
</div>
</div>
</div>
</div>
</div>
<div class="case-panel" data-case="${p.id}" data-panel="1" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${p.colors[1]}10 100%);">
<div class="website-preview" style="border-color: ${p.colors[0]}20; position: relative;">
<img loading="lazy" src="${p.img}" alt="${p.name} Website" style="width: 100%; height: 500px; object-fit: cover;">
                                        ${p.websiteUrl ? `<a href="${p.websiteUrl}" target="_blank" style="position: absolute; bottom: 24px; right: 24px; background: ${p.colors[0]}; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s;">Visit Site <span style="font-size: 18px;">→</span></a>` : ''}
</div>
<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; flex-wrap: wrap; gap: 20px;">
<p style="color: var(--gray); line-height: 1.8; font-size: 16px; flex: 1; min-width: 280px;">We designed and developed a fully responsive, high-converting website/webapp that captures the essence of ${p.name}. The platform features custom functionality, seamless navigation, and is optimized for both desktop and mobile users.</p>
                                        ${p.websiteUrl ? `<a href="${p.websiteUrl}" target="_blank" style="background: transparent; border: 1px solid ${p.colors[0]}; color: ${p.colors[0]}; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;">${p.websiteUrl.replace('https://', '')}</a>` : ''}
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px;">
<div style="aspect-ratio: 4/5; background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                            ${p.assets?.webMockups?.[0] ? (p.assets.webMockups[0].includes('video') || p.assets.webMockups[0].match(/\\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.webMockups[0]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.webMockups[0]}" alt="Web Mockup" class="img-cover">`) : `<div style="color: rgba(255,255,255,0.12); font-size: 14px;">Image / Video</div>`}
</div>
<div style="aspect-ratio: 4/5; background: #080808; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                            ${p.assets?.webMockups?.[1] ? (p.assets.webMockups[1].includes('video') || p.assets.webMockups[1].match(/\\.(mp4|webm|mov|ogg)$/i) ? `<video src="${p.assets.webMockups[1]}" autoplay muted loop playsinline class="img-cover"></video>` : `<img loading="lazy" src="${p.assets.webMockups[1]}" alt="Web Mockup" class="img-cover">`) : `<div style="color: rgba(255,255,255,0.12); font-size: 14px;">Image / Video</div>`}
</div>
</div>
</div>
<div class="case-panel" data-case="${p.id}" data-panel="2" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${p.colors[1]}10 100%);">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
<div class="blog-card-dark">
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${p.colors[0]}; margin-bottom: 16px; font-weight: 600;">Problem</div>
<p style="color: var(--gray); line-height: 1.8; font-size: 15px; margin: 0;">${p.problem || 'The client faced challenges with brand visibility, outdated digital presence, and difficulty reaching their target audience effectively.'}</p>
</div>
<div class="blog-card-dark">
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${p.colors[0]}; margin-bottom: 16px; font-weight: 600;">Solution</div>
<p style="color: var(--gray); line-height: 1.8; font-size: 15px; margin: 0;">${p.solution || 'We developed a comprehensive brand strategy with modern visual identity, responsive web platform, and targeted digital marketing campaigns.'}</p>
</div>
</div>
<div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${p.colors[0]}; margin-bottom: 24px; font-weight: 600;">Results</div>
<div class="results-grid">
<div class="result-card" style="border-color: ${p.colors[0]}30;"><div class="result-number" style="color: ${p.colors[0]};">${p.results.revenue}</div><div class="result-label">Revenue Growth</div></div>
<div class="result-card" style="border-color: ${p.colors[0]}30;"><div class="result-number" style="color: ${p.colors[0]};">${p.results.traffic}</div><div class="result-label">Web Traffic</div></div>
<div class="result-card" style="border-color: ${p.colors[0]}30;"><div class="result-number" style="color: ${p.colors[0]};">${p.results.engagement}</div><div class="result-label">Engagement</div></div>
</div>
</div>
<div class="case-panel" data-case="${p.id}" data-panel="3" style="padding: 48px; background: linear-gradient(180deg, transparent 0%, ${p.colors[1]}10 100%);">
<div class="testimonial-box" style="border-color: ${p.colors[0]};">
<p>"${p.testimonial.text}"</p>
<div class="testimonial-author">
<div class="testimonial-avatar" style="background: ${p.colors[0]};">${p.testimonial.author.charAt(0)}</div>
<div>
<div style="font-weight: 700;">${p.testimonial.author}</div>
<div style="color: var(--gray); font-size: 14px;">${p.testimonial.title}, ${p.name}</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
                `).join('')}
</div>
</section>
<section class="cta-section"><h2>READY TO BE<br>OUR NEXT SUCCESS?</h2><p>Let's create something legendary together.</p><button class="btn-white" onclick="scrollToContact()">Book Your Strategy Call</button></section>
        ${getFooterHTML()}
    `;
    // Resolve any idb:// image references
    setTimeout(resolveAllImages, 50);
}

function toggleCase(id) {
    const caseEl = document.getElementById('case-' + id);
    caseEl.classList.toggle('open');
    if (!caseEl.classList.contains('open')) {
        // Scroll back to the cards grid when closing
        document.querySelector('.portfolio-cards-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openPortfolioCase(id) {
    // Close all other cases
    document.querySelectorAll('.case-study').forEach(c => c.classList.remove('open'));
    // Open the selected case
    const caseEl = document.getElementById('case-' + id);
    caseEl.classList.add('open');
    // Scroll to the case study
    setTimeout(() => {
        caseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function switchCaseTab(caseId, panelIndex, tabEl) {
    // Update tabs
    const tabs = tabEl.parentElement.querySelectorAll('.case-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    // Update panels
    const panels = document.querySelectorAll(`.case-panel[data-case="${caseId}"]`);
    panels.forEach(p => p.classList.remove('active'));
    panels[panelIndex].classList.add('active');
}

// ==================== PORTAL STYLES ====================
const portalStyles = `
<style>
.portal-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding-top: 80px; background: linear-gradient(135deg, #1a0a0a 0%, #000 100%); }
.login-box { max-width: 420px; width: 100%; padding: 48px; background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; }
.login-tabs { display: flex; margin-bottom: 24px; border: 2px solid #333; border-radius: 8px; overflow: hidden; }
.login-tab { flex: 1; padding: 12px; border: none; background: #000; color: #fff; font-weight: 600; cursor: pointer; font-family: inherit; }
.login-tab.active { background: #fff; color: #000; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: rgba(255,255,255,0.9); }
.form-input { width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.2); background: #0a0a0a; color: #fff; font-size: 15px; border-radius: 8px; font-family: inherit; }
.form-input:focus { outline: none; border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,0,0,0.1); }
.form-select { width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.2); background: #0a0a0a; color: #fff; font-size: 15px; border-radius: 8px; font-family: inherit; }
.form-textarea { width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.2); background: #0a0a0a; color: #fff; font-size: 15px; border-radius: 8px; font-family: inherit; min-height: 100px; resize: vertical; }
.admin-header { background: #0a0a0a; color: #fff; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 76px; left: 0; right: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.08); }
.admin-container { display: flex; padding-top: 132px; min-height: 100vh; background: #000; }
.admin-sidebar { width: 260px; background: #0a0a0a; border-right: 1px solid rgba(255,255,255,0.06); padding: 20px 16px; position: fixed; left: 0; top: 132px; bottom: 0; overflow-y: auto; }
.admin-nav { display: flex; flex-direction: column; gap: 4px; }
.admin-nav-group { margin-bottom: 20px; }
.admin-nav-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: rgba(255,255,255,0.35); padding: 8px 12px; text-transform: uppercase; }
.admin-nav-link { display: block; padding: 10px 12px; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 8px; font-weight: 500; font-size: 13px; transition: all 0.2s; }
.admin-nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
.admin-nav-link.active { background: rgba(255,0,0,0.15); color: var(--red); }
.admin-main { flex: 1; margin-left: 260px; padding: 32px; color: #fff; background: #000; min-width: 0; overflow-x: hidden; }
.admin-panel { display: none; }
.admin-panel.active { display: block; }
.panel-header { margin-bottom: 32px; }
.panel-title { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.panel-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.stat-card { background: var(--admin-card, #0a0a0a); padding: 24px; border-radius: 16px; border: 1px solid var(--admin-border, rgba(255,255,255,0.06)); transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,0,0,0.1); }
.stat-card .num { font-size: 36px; font-weight: 800; color: var(--admin-text, #fff); }
.stat-card .lbl { color: var(--admin-text-muted, rgba(255,255,255,0.5)); font-size: 13px; margin-top: 4px; }
.stat-card.highlight { background: linear-gradient(135deg, rgba(255,0,0,0.15) 0%, rgba(255,0,0,0.05) 100%); border-color: rgba(255,0,0,0.2); }
.stat-card.highlight .num { color: var(--red); }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.client-card { background: var(--admin-card, #0a0a0a); border: 1px solid var(--admin-border, rgba(255,255,255,0.06)); border-radius: 16px; overflow: hidden; transition: all 0.3s; }
.client-card:hover { border-color: rgba(255,0,0,0.3); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(255,0,0,0.1); }
.client-card-header { height: 100px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 48px; font-weight: 700; }
.client-card-body { padding: 24px; }
.client-card-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: var(--admin-text, #fff); }
.client-card-meta { font-size: 13px; color: var(--admin-text-muted, rgba(255,255,255,0.5)); margin-bottom: 16px; }
.client-card-btns { display: flex; gap: 8px; }
.client-card-btns button { flex: 1; padding: 10px; border: none; cursor: pointer; border-radius: 8px; font-weight: 600; font-family: inherit; font-size: 12px; transition: transform 0.2s; }
.client-card-btns button:hover { transform: scale(1.02); }
.order-card { background: var(--admin-card, #0a0a0a); border: 1px solid var(--admin-border, rgba(255,255,255,0.06)); border-radius: 16px; padding: 24px; margin-bottom: 16px; transition: border-color 0.2s; }
.order-card:hover { border-color: rgba(255,0,0,0.3); }
.order-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; }
.order-title { font-size: 18px; font-weight: 700; color: #fff; }
.order-client { font-size: 13px; color: rgba(255,255,255,0.5); }
.order-status { padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.order-status.pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
.order-status.in_progress { background: rgba(59,130,246,0.2); color: #3b82f6; }
.order-status.review { background: rgba(168,85,247,0.2); color: #a855f7; }
.order-status.delivered, .order-status.approved { background: rgba(16,185,129,0.2); color: #10b981; }
.order-status.revision { background: rgba(239,68,68,0.2); color: #ef4444; }
.order-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
.order-detail { text-align: center; }
.order-detail .val { font-size: 16px; font-weight: 700; color: #fff; }
.order-detail .lbl { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--red) 0%, #ff6b6b 100%); transition: width 0.3s; }
.form-section { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
.form-section-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: #fff; display: flex; align-items: center; gap: 10px; }
.form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
/* Toggle Switch */
.switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.2); transition: 0.3s; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: 0.3s; }
input:checked + .slider { background-color: #2ecc71; }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 26px; }
.slider.round:before { border-radius: 50%; }
.category-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.category-tab { padding: 10px 20px; border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; background: transparent; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.category-tab:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
.category-tab.active { background: var(--red); color: #fff; border-color: var(--red); }
.upload-zone { border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; background: rgba(255,255,255,0.02); }
.upload-zone:hover { border-color: var(--red); background: rgba(255,0,0,0.05); }
.upload-zone p { color: rgba(255,255,255,0.5); margin-bottom: 8px; }
.upload-zone span { color: var(--red); font-weight: 600; }
.assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.asset-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; transition: all 0.2s; }
.asset-card:hover { border-color: rgba(255,0,0,0.3); }
.asset-preview { aspect-ratio: 1; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: rgba(255,255,255,0.2); }
.asset-preview img { width: 100%; height: 100%; object-fit: cover; }
.asset-info { padding: 14px; }
.asset-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
.asset-meta { font-size: 11px; color: rgba(255,255,255,0.4); }
/* Pipeline/Kanban Styles */
.pipeline-board { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; }
.pipeline-column { min-width: 280px; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
.pipeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.pipeline-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.pipeline-count { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.pipeline-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
.pipeline-card:hover { border-color: rgba(255,0,0,0.3); transform: translateY(-2px); }
.pipeline-card-name { font-weight: 600; margin-bottom: 4px; }
.pipeline-card-company { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
.pipeline-card-value { font-size: 18px; font-weight: 700; color: var(--red); }
/* Project Tracker Styles */
.project-stages { display: flex; gap: 4px; margin-bottom: 24px; padding: 4px; background: rgba(255,255,255,0.03); border-radius: 12px; }
.project-stage { flex: 1; padding: 12px; text-align: center; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.5); }
.project-stage.active { background: var(--red); color: #fff; }
.project-stage.completed { background: rgba(16,185,129,0.2); color: #10b981; }
/* Proof System Styles */
.proof-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
.proof-preview { aspect-ratio: 16/9; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; position: relative; }
.proof-preview img { width: 100%; height: 100%; object-fit: contain; }
.proof-actions { position: absolute; bottom: 16px; right: 16px; display: flex; gap: 8px; }
.proof-content { padding: 24px; }
.proof-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.proof-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
.proof-comments { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
.comment { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
.comment-author { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.comment-text { font-size: 13px; color: rgba(255,255,255,0.7); }
/* Buttons */
.btn-admin { padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-admin.primary { background: var(--red); color: #fff; box-shadow: 0 4px 12px rgba(255,0,0,0.3); }
.btn-admin.primary:hover { background: #cc0000; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,0,0,0.4); }
.btn-admin.secondary { background: var(--admin-card, rgba(255,255,255,0.1)); color: var(--admin-text, #fff); border: 1px solid var(--admin-border, rgba(255,255,255,0.1)); }
.btn-admin.secondary:hover { background: var(--admin-card-hover, rgba(255,255,255,0.15)); border-color: rgba(255,0,0,0.3); }
.btn-admin.success { background: rgba(16,185,129,0.2); color: #10b981; }
.btn-admin.success:hover { background: rgba(16,185,129,0.3); }
.btn-admin.danger { background: rgba(239,68,68,0.2); color: #ef4444; }
.btn-admin.danger:hover { background: rgba(239,68,68,0.3); }
/* Table Styles */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); }
.data-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
/* Image Upload Card */
.image-upload-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
.image-upload-preview { aspect-ratio: 16/9; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; position: relative; }
.image-upload-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-upload-preview .placeholder { color: rgba(255,255,255,0.2); font-size: 48px; }
.image-upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0; transition: opacity 0.2s; }
.image-upload-card:hover .image-upload-overlay { opacity: 1; }
.image-upload-info { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
.image-upload-label { font-size: 14px; font-weight: 600; }
.image-upload-hint { font-size: 12px; color: rgba(255,255,255,0.4); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(8px); }
.modal-overlay.active { display: flex; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal { background: var(--admin-card, #111); border: 1px solid var(--admin-border, rgba(255,255,255,0.1)); border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { padding: 24px; border-bottom: 1px solid var(--admin-border, rgba(255,255,255,0.06)); display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 20px; font-weight: 700; color: var(--admin-text, #fff); }
.modal-close { width: 36px; height: 36px; border: none; background: rgba(255,255,255,0.1); border-radius: 50%; cursor: pointer; font-size: 20px; color: var(--admin-text, #fff); transition: all 0.2s; }
.modal-close:hover { background: rgba(255,0,0,0.2); color: var(--red); transform: rotate(90deg); }
.modal-body { padding: 24px; color: var(--admin-text, #fff); }
.modal-footer { padding: 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 12px; justify-content: flex-end; }
.invoice-preview { background: #fff; border-radius: 12px; padding: 32px; color: #000; }
.invoice-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #000; }
.invoice-logo { font-size: 24px; font-weight: 800; color: var(--red); }
.invoice-title { font-size: 32px; font-weight: 700; text-align: right; }
.invoice-meta { font-size: 13px; color: #666; text-align: right; }
.invoice-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
.invoice-party h4 { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.invoice-party p { font-size: 14px; line-height: 1.6; }
.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.invoice-table th { text-align: left; padding: 12px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.invoice-table td { padding: 12px; border-bottom: 1px solid #e5e5e5; }
.invoice-total { text-align: right; font-size: 24px; font-weight: 700; margin-top: 16px; }
/* SEO Panel Styles */
.seo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.seo-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; }
.seo-card-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.seo-score { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.seo-score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
.seo-score-circle.good { background: rgba(16,185,129,0.2); color: #10b981; }
.seo-score-circle.medium { background: rgba(245,158,11,0.2); color: #f59e0b; }
.seo-score-circle.bad { background: rgba(239,68,68,0.2); color: #ef4444; }
.faq-item { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.faq-question { font-weight: 600; margin-bottom: 8px; }
.faq-answer { font-size: 13px; color: rgba(255,255,255,0.6); }
/* Tags Input */
.tags-input { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; min-height: 50px; }
.tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,0,0,0.15); color: var(--red); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
.tag-remove { cursor: pointer; opacity: 0.7; }
.tag-remove:hover { opacity: 1; }
.tags-input input { flex: 1; min-width: 120px; border: none; background: transparent; color: #fff; font-size: 14px; outline: none; }
@media (max-width: 968px) {
    .admin-sidebar { display: none; }
    .admin-main { margin-left: 0; padding: 20px; }
    .stat-cards { grid-template-columns: repeat(2, 1fr); }
    .form-row { grid-template-columns: 1fr; }
    .order-details { grid-template-columns: repeat(2, 1fr); }
    .seo-grid { grid-template-columns: 1fr; }
    .pipeline-board { flex-direction: column; }
    .pipeline-column { min-width: 100%; }
}

/* Timer Button Styles */
.timer-btn { transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
.timer-btn:hover { transform: scale(1.1); }
.timer-btn.active { animation: pulse-timer 1.5s infinite; }
@keyframes pulse-timer {
    0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(230, 57, 70, 0); }
}

/* Stats Grid Enhancement */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
.stat-label { font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #fff; }

/* Invoice Animation */
.invoice-line-item { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* Payment Progress Bar */
.payment-progress { display: flex; gap: 4px; margin-top: 8px; }
.payment-progress-segment { height: 6px; border-radius: 3px; transition: all 0.3s ease; }
.payment-progress-segment.paid { background: #2a9d8f; }
.payment-progress-segment.pending { background: rgba(255,255,255,0.1); }

/* Smooth scrollbar for modals */
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
.modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
</style>
`;

// ==================== BLOG VIEW ====================
let blogPosts = JSON.parse(localStorage.getItem('nui_blog_posts')) || [
    {
        id: 1,
        slug: 'why-ai-logo-design-will-destroy-your-brand',
        title: 'Why AI Logo Design Will Destroy Your Brand (And What Smart Business Owners Do Instead)',
        excerpt: 'That $20 AI logo might seem like a deal, but it\'s actually costing you thousands in lost revenue. Here\'s the truth about AI design tools.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'January 28, 2026',
        readTime: '8 min read',
        content: `
<p class="blog-lead">Every week, I get calls from business owners who "saved money" with an AI logo generator. Six months later, they're rebranding because customers don't take them seriously. Let me save you from becoming another cautionary tale.</p>

<h2>The AI Logo Trap</h2>
<p>Here's what the AI logo generators don't tell you: They're trained on existing logos. Which means your "unique" logo is actually a Frankenstein mashup of designs that already exist. You might be one cease-and-desist letter away from a complete rebrand.</p>

<p>I've seen it happen. A Detroit restaurant owner came to me after getting a legal notice that their AI-generated logo was too similar to a national chain. Cost them $15,000 in legal fees and emergency rebranding. That "$50 AI logo" ended up costing more than my premium package.</p>

<h2>What AI Can't Do</h2>
<p>AI doesn't understand your story. It can't capture the 3 AM moments that led you to start your business. It doesn't know your grandmother's recipe that inspired your menu, or the Detroit neighborhood that shaped who you are.</p>

<p>A real brand strategist asks questions AI never will:</p>
<ul>
<li>What emotion do you want customers to feel?</li>
<li>Who are your competitors and how do we differentiate?</li>
<li>What's your 5-year vision?</li>
<li>What story does your brand need to tell?</li>
</ul>

<h2>The Smart Money Move</h2>
<p>Invest in professional branding once. It costs more upfront but pays dividends forever. Nike didn't become Nike with a $20 logo. Apple didn't build a trillion-dollar company on clip art.</p>

<p>Your brand is the single most valuable asset you'll ever own. Treat it that way.</p>

<div class="blog-cta">
<h3>Ready to Build a Brand That Actually Works?</h3>
<p>Let's create something that makes your competition nervous.</p>
<a onclick="showView('services')" class="btn-cta">View Our Brand Packages</a>
</div>
        `
    },
    {
        id: 2,
        slug: 'emyth-revisited-lessons-for-detroit-entrepreneurs',
        title: 'The E-Myth Revisited: 5 Lessons Every Detroit Entrepreneur Needs to Hear',
        excerpt: 'Michael Gerber\'s classic business book changed how I run my agency. Here are the game-changing insights that apply to every small business owner.',
        category: 'Business Strategy',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'January 21, 2026',
        readTime: '10 min read',
        content: `
<p class="blog-lead">If you haven't read "The E-Myth Revisited" by Michael Gerber, stop everything and order it today. This book single-handedly transformed how I think about business — and it'll do the same for you.</p>

<h2>Lesson 1: You're Not Just a Technician</h2>
<p>Gerber's biggest insight: Most businesses are started by technicians who are good at their craft but have no idea how to run a business. A great chef opens a restaurant. A talented designer starts an agency. Sound familiar?</p>

<p>The problem? Being good at making food doesn't mean you're good at managing inventory, marketing, hiring, or financial planning. You need to develop three personalities: The Technician (does the work), The Manager (creates systems), and The Entrepreneur (builds the vision).</p>

<h2>Lesson 2: Work ON Your Business, Not IN It</h2>
<p>This is the one that hit me like a truck. I was working 80-hour weeks doing client work, but my business wasn't growing. Why? Because I never stepped back to build systems, create processes, or plan for scale.</p>

<p>Your business should be able to run without you grinding 24/7. If it can't, you don't have a business — you have a job you created for yourself.</p>

<h2>Lesson 3: The Franchise Prototype</h2>
<p>Gerber asks: "Could you franchise your business?" Not because you should, but because the question forces you to create documented systems for everything. Every process should be so clear that anyone could follow it.</p>

<h2>Lesson 4: Your Business is a Product</h2>
<p>Mind-blowing concept: Your business itself is the product, not just what you sell. You're building something that creates value independent of your daily involvement.</p>

<h2>Lesson 5: Start With the End in Mind</h2>
<p>What do you want your business to look like in 10 years? If you can't answer that clearly, you're building randomly. Every decision should move you toward that vision.</p>

<div class="blog-cta">
<h3>Need a Brand That Supports Your Vision?</h3>
<p>Let's build something that grows with your business.</p>
<a onclick="showView('services')" class="btn-cta">Explore Brand Packages</a>
</div>
        `
    },
    {
        id: 3,
        slug: 'how-nike-built-brand-empire',
        title: 'How Nike Built a $50 Billion Brand (And What Small Businesses Can Steal)',
        excerpt: 'Nike didn\'t become Nike by accident. Here\'s the branding playbook they used — and how you can apply the same principles to your business.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'January 14, 2026',
        readTime: '12 min read',
        content: `
<p class="blog-lead">Nike sells shoes. So does Payless. But Nike is worth $50 billion while Payless went bankrupt. The difference isn't the product — it's the brand. Let's break down exactly what Nike does differently.</p>

<h2>They Sell Identity, Not Products</h2>
<p>Nike doesn't sell running shoes. They sell the identity of being an athlete. "Just Do It" isn't about footwear — it's about who you become when you push past your limits.</p>

<p>Ask yourself: What identity are you selling? If your answer is "quality products at fair prices," you're already losing. That's a feature, not an identity.</p>

<h2>Emotional Storytelling Over Features</h2>
<p>When's the last time you saw a Nike ad talking about "breathable mesh uppers" or "responsive foam technology"? They don't lead with specs — they lead with stories.</p>

<p>Colin Kaepernick. Serena Williams. The kid from Detroit who became a champion. Nike tells stories that make you FEEL something. Your brand should do the same.</p>

<h2>Consistent Visual Identity Everywhere</h2>
<p>The Swoosh looks the same on a billboard in Tokyo as it does on a shoe tag in Detroit. That consistency builds recognition and trust. Every touchpoint reinforces the brand.</p>

<p>Is your Instagram consistent with your website? Does your business card match your storefront? Every inconsistency costs you credibility.</p>

<h2>Premium Positioning</h2>
<p>Nike charges more because they've earned the right to. But here's the secret: the premium positioning came BEFORE the premium prices. They built the brand first, then raised prices.</p>

<h2>What You Can Steal Today</h2>
<ul>
<li>Define the identity you're selling (not just the product)</li>
<li>Lead with emotion, support with logic</li>
<li>Audit every touchpoint for consistency</li>
<li>Position premium before pricing premium</li>
</ul>

<div class="blog-cta">
<h3>Ready to Build a Brand Like the Big Players?</h3>
<p>Let's create something that commands attention and premium prices.</p>
<a onclick="showView('services')" class="btn-cta">Start Your Brand Journey</a>
</div>
        `
    },
    {
        id: 4,
        slug: 'chris-do-futur-lessons-creative-business',
        title: 'What Chris Do and The Futur Taught Me About Running a Creative Business',
        excerpt: 'The Futur YouTube channel is a goldmine for creative entrepreneurs. Here are the biggest lessons that transformed my agency.',
        category: 'Business Growth',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'January 7, 2026',
        readTime: '9 min read',
        content: `
<p class="blog-lead">If you run a creative business and you're not watching The Futur, you're leaving money on the table. Chris Do's content has completely changed how I price, sell, and position my agency.</p>

<h2>Value-Based Pricing Changed Everything</h2>
<p>The Futur's biggest lesson: Stop charging for time, start charging for value. A logo that helps a company make an extra $500K is worth way more than the 20 hours it took to design.</p>

<p>When I switched to value-based pricing, my average project went from $1,500 to $4,500. Same work. Different conversation.</p>

<h2>The Discovery Call Framework</h2>
<p>Chris Do's approach to sales calls is pure gold. Instead of pitching, you're asking questions. Instead of convincing, you're qualifying. The client sells themselves on working with you.</p>

<p>Key questions I now ask every prospect:</p>
<ul>
<li>"What happens if you don't solve this problem?"</li>
<li>"What would success look like for this project?"</li>
<li>"What's the cost of staying where you are?"</li>
</ul>

<h2>Positioning as an Expert</h2>
<p>Stop being a "vendor" and become a "strategic partner." The Futur taught me to speak the language of business outcomes, not creative deliverables.</p>

<p>I don't sell "logo design" anymore. I sell "brand positioning that attracts premium customers." Same service, different value perception.</p>

<h2>Saying No to Bad Clients</h2>
<p>Not every dollar is a good dollar. The Futur community helped me realize that bad clients cost more than they pay. Now I have a qualification process that filters for fit.</p>

<div class="blog-cta">
<h3>Want to Work With an Agency That Gets Business?</h3>
<p>We speak your language and focus on results.</p>
<a onclick="scrollToContact()" class="btn-cta">Book a Strategy Call</a>
</div>
        `
    },
    {
        id: 5,
        slug: 'automation-ai-small-business-guide',
        title: 'AI and Automation: How Smart Small Businesses Are Winning in 2026',
        excerpt: 'AI isn\'t replacing businesses — it\'s amplifying the ones that use it right. Here\'s how to leverage automation without losing your soul.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'December 30, 2025',
        readTime: '11 min read',
        content: `
<p class="blog-lead">AI is the most overhyped AND underhyped technology of our generation. It won't replace you, but someone using AI might. Here's how to stay on the right side of that equation.</p>

<h2>Where AI Actually Helps</h2>
<p>Let's be real: AI is incredible for certain tasks. Email automation, appointment scheduling, data analysis, content repurposing, customer service bots — these are legitimate time-savers.</p>

<p>I use AI tools for:</p>
<ul>
<li>Scheduling and calendar management</li>
<li>First-draft email responses</li>
<li>Social media scheduling</li>
<li>Data analysis and reporting</li>
<li>Research and competitive analysis</li>
</ul>

<h2>Where AI Falls Short</h2>
<p>Strategy. Creativity. Emotional intelligence. Understanding context. Building relationships. These are still human domains, and they're where the real value lives.</p>

<p>AI can write a blog post, but can it understand what your specific audience needs to hear right now? Can it capture your brand voice in a way that feels authentic? Not really.</p>

<h2>The Winning Formula</h2>
<p>Use AI to handle the 80% of tasks that are repetitive and time-consuming. Then invest that saved time into the 20% that actually moves the needle: strategy, relationships, and creative problem-solving.</p>

<h2>Automation Stack for Small Businesses</h2>
<ul>
<li><strong>CRM:</strong> Automate follow-ups and lead nurturing</li>
<li><strong>Email Marketing:</strong> Sequences that run while you sleep</li>
<li><strong>Social Media:</strong> Schedule content in batches</li>
<li><strong>Invoicing:</strong> Automatic payment reminders</li>
<li><strong>Booking:</strong> Calendly or similar for appointments</li>
</ul>

<div class="blog-cta">
<h3>Need a Website That Works While You Sleep?</h3>
<p>We build automated systems that turn visitors into customers.</p>
<a onclick="showView('services')" class="btn-cta">See Our Web Packages</a>
</div>
        `
    },
    {
        id: 6,
        slug: 'website-not-converting-seven-fixes',
        title: 'Your Website Isn\'t Converting. Here Are 7 Fixes That Actually Work.',
        excerpt: 'Getting traffic but no sales? Your website has a conversion problem. Here\'s exactly how to fix it.',
        category: 'Web Design',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'December 23, 2025',
        readTime: '7 min read',
        content: `
<p class="blog-lead">"I'm getting traffic but no one's buying." I hear this every week. The problem isn't your product or your traffic — it's your website. Here are the fixes that work.</p>

<h2>1. Your Headline Doesn't Speak to Pain</h2>
<p>Most websites lead with "Welcome to [Business Name]!" No one cares. Lead with the problem you solve or the transformation you provide.</p>
<p><strong>Bad:</strong> "Welcome to Smith's Accounting Services"</p>
<p><strong>Good:</strong> "Stop Leaving Money on the Table at Tax Time"</p>

<h2>2. Too Many Choices</h2>
<p>When you give visitors 10 options, they choose none. Guide them to ONE clear action. What's the most important thing you want them to do? Make that obvious.</p>

<h2>3. No Social Proof</h2>
<p>People trust other people more than they trust you. Reviews, testimonials, case studies, logos of clients you've worked with — these build credibility fast.</p>

<h2>4. Slow Load Time</h2>
<p>Every second of load time costs you 7% of conversions. Test your site speed and optimize those images.</p>

<h2>5. Weak Call-to-Action</h2>
<p>"Submit" and "Learn More" are boring. Try "Get My Free Quote" or "Start Making Money." Action-oriented, benefit-driven CTAs convert.</p>

<h2>6. No Urgency</h2>
<p>Why should they act now instead of later? Limited-time offers, scarcity, and clear deadlines drive action.</p>

<h2>7. Mobile Experience Sucks</h2>
<p>60%+ of your traffic is on mobile. If your site isn't flawless on a phone, you're losing more than half your potential customers.</p>

<div class="blog-cta">
<h3>Ready for a Website That Actually Converts?</h3>
<p>We build sites that turn visitors into customers.</p>
<a onclick="showView('services')" class="btn-cta">See Website Packages</a>
</div>
        `
    },
    {
        id: 7,
        slug: 'richest-man-in-babylon-wealth-lessons',
        title: 'The Richest Man in Babylon: Timeless Wealth Lessons for Modern Entrepreneurs',
        excerpt: 'This 1926 classic still holds the secrets to building wealth. Here\'s how to apply ancient Babylonian wisdom to your business today.',
        category: 'Business Strategy',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'December 16, 2025',
        readTime: '11 min read',
        content: `
<p class="blog-lead">"The Richest Man in Babylon" by George S. Clason was written nearly 100 years ago, but its wisdom about wealth-building is more relevant than ever. If you run a business and haven't read it, you're missing foundational knowledge.</p>

<h2>Pay Yourself First (The 10% Rule)</h2>
<p>Arkad, the richest man in Babylon, built his fortune with one simple rule: "A part of all you earn is yours to keep." Before you pay rent, before you pay employees, before you buy that new equipment — pay yourself first.</p>

<p>Most business owners pay themselves last. They take whatever's "left over" after expenses. That's backwards. Set aside at least 10% of every dollar that comes into your business for wealth-building. This isn't optional — it's how fortunes are made.</p>

<h2>Make Your Money Work For You</h2>
<p>The Babylonians called this "putting your gold to work." Today we call it investing. But the principle is identical: money sitting idle is money wasted.</p>

<p>For business owners, this means:</p>
<ul>
<li>Reinvesting profits into growth</li>
<li>Building assets that generate passive income</li>
<li>Creating systems that work without you</li>
<li>Investing in education and skills</li>
</ul>

<h2>Guard Your Wealth From Loss</h2>
<p>"Guard thy treasures from loss by investing only where thy principal is safe." The Babylonians knew that getting rich slowly beats getting poor quickly.</p>

<p>Don't chase every shiny opportunity. Don't invest in things you don't understand. The first rule of wealth is: don't lose what you already have.</p>

<h2>Invest in Yourself</h2>
<p>"The more wisdom we know, the more we may earn." Your greatest investment is always your own skills and knowledge. A better brand strategist, a better salesperson, a better leader — these compound over decades.</p>

<h2>Take Action</h2>
<p>"Wealth, like a tree, grows from a tiny seed." You can't think your way to wealth. You have to plant seeds and nurture them. Start with what you have, where you are.</p>

<div class="blog-cta">
<h3>Ready to Invest in Your Brand?</h3>
<p>Your brand is an asset that appreciates over time.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Brand Asset</a>
</div>
        `
    },
    {
        id: 8,
        slug: 'what-logo-design-actually-does',
        title: 'What Your Logo Is Actually For (And What It Can\'t Do)',
        excerpt: 'Your logo isn\'t going to save your business. But used correctly, it\'s one of your most powerful tools. Here\'s the truth about logo design.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'December 9, 2025',
        readTime: '8 min read',
        content: `
<p class="blog-lead">I've had clients tell me they need a "better logo" to fix their struggling business. That's like saying you need better business cards to get more customers. Let's talk about what logos actually do — and don't do.</p>

<h2>What Your Logo IS For</h2>

<h3>1. Recognition & Memory</h3>
<p>Your logo is a visual shortcut. When someone sees the Nike swoosh, they don't need to read "Nike" — they already know. That instant recognition takes years to build, but it's incredibly valuable.</p>

<h3>2. Professionalism & Trust</h3>
<p>A polished logo signals that you're a legitimate operation. It's the difference between a handwritten sign and a professional storefront. First impressions matter.</p>

<h3>3. Consistency Across Touchpoints</h3>
<p>Your logo anchors your visual identity. It appears on your website, business cards, social media, packaging, signage, invoices — everywhere. It creates cohesion.</p>

<h3>4. Differentiation</h3>
<p>In a sea of competitors, your logo helps you stand out. It's a visual stake in the ground that says "this is who we are."</p>

<h2>What Your Logo CAN'T Do</h2>

<h3>It Can't Fix a Bad Product</h3>
<p>No amount of good design will save a product or service people don't want. Your logo is packaging, not the product itself.</p>

<h3>It Can't Replace Marketing</h3>
<p>A logo sitting on your computer does nothing. You need to get it in front of people consistently over time.</p>

<h3>It Can't Communicate Everything</h3>
<p>Your logo doesn't need to show what you do. Apple's logo isn't a computer. Nike's isn't a shoe. The meaning comes from the experiences people have with your brand.</p>

<h2>Where to Use Your Logo</h2>
<ul>
<li><strong>Primary:</strong> Website header, business cards, email signature</li>
<li><strong>Social:</strong> Profile pictures, cover images, watermarks</li>
<li><strong>Physical:</strong> Signage, packaging, uniforms, banners, decals</li>
<li><strong>Documents:</strong> Invoices, proposals, presentations</li>
</ul>

<div class="blog-cta">
<h3>Need a Logo That Works Everywhere?</h3>
<p>We create versatile logos built for real-world use.</p>
<a onclick="showView('services')" class="btn-cta">View Logo Packages</a>
</div>
        `
    },
    {
        id: 9,
        slug: 'brand-assets-attention-guide',
        title: '10 Ways to Use Your Brand Assets to Grab Attention (That Most Businesses Miss)',
        excerpt: 'You paid for brand assets. Now make them work. Here\'s how to leverage your logo, colors, and visual identity to stand out everywhere.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'December 2, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Most businesses get their brand done and then... nothing. The logo sits on their website. The colors show up sometimes. The fonts are "whatever's available." Here's how to actually USE your brand assets to get attention.</p>

<h2>1. Own Your Color</h2>
<p>Coca-Cola red. Tiffany blue. T-Mobile magenta. These brands OWN their colors because they use them obsessively, consistently, everywhere. Pick your primary brand color and make it impossible to miss.</p>

<h2>2. Create Social Media Templates</h2>
<p>Every post should be instantly recognizable as yours. Create templates in your brand colors with your fonts. When someone's scrolling, your content should pop.</p>

<h2>3. Brand Your Physical Space</h2>
<p>If you have a storefront or office — brand it. Wall graphics, window decals, banners, vinyl signage. Turn every physical touchpoint into a billboard.</p>

<h2>4. Watermark Everything</h2>
<p>Your photos, videos, graphics — add a subtle watermark. When your content gets shared, your brand goes with it.</p>

<h2>5. Consistent Email Signatures</h2>
<p>Every email your team sends is a brand touchpoint. Professional email signatures with your logo, colors, and social links. Multiply that by hundreds of emails per week.</p>

<h2>6. Branded Packaging</h2>
<p>If you ship products, your packaging IS marketing. Custom boxes, branded tape, tissue paper in your colors, thank you cards. Create an unboxing experience.</p>

<h2>7. Presentation Templates</h2>
<p>Sales decks, proposals, reports — all in your brand. Professional, consistent, memorable.</p>

<h2>8. Branded Swag That People Actually Want</h2>
<p>Skip the cheap pens. Create merchandise people WANT to wear and use. Quality hoodies, useful notebooks, premium stickers. Walking billboards.</p>

<h2>9. Video Intros & Outros</h2>
<p>If you create video content, branded intros and outros build recognition. Even a simple logo animation makes a difference.</p>

<h2>10. Consistent Photo Style</h2>
<p>Define a photo editing style — color grading, filters, composition rules. Your photos should look like they belong together.</p>

<div class="blog-cta">
<h3>Need Brand Assets That Actually Work?</h3>
<p>We create complete brand systems designed for real-world use.</p>
<a onclick="showView('services')" class="btn-cta">Explore Brand Packages</a>
</div>
        `
    },
    {
        id: 10,
        slug: 'psychology-of-color-branding',
        title: 'The Psychology of Color in Branding: What Your Colors Are Saying',
        excerpt: 'Colors aren\'t just aesthetic choices — they trigger emotions and associations. Here\'s how to choose colors that work for your brand.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'November 25, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">Color is one of the most powerful tools in branding, yet most businesses choose colors because they "look nice." Here's the science behind color psychology and how to use it strategically.</p>

<h2>Red: Energy, Urgency, Passion</h2>
<p>Red increases heart rate and creates urgency. That's why sale signs are red. It's bold, attention-grabbing, and emotional. Use it for brands that want to feel energetic, passionate, or urgent.</p>
<p><strong>Brands using red:</strong> Coca-Cola, Netflix, YouTube, Target</p>

<h2>Blue: Trust, Stability, Professionalism</h2>
<p>Blue is the most universally liked color. It communicates reliability and trustworthiness. That's why banks, tech companies, and healthcare brands love it.</p>
<p><strong>Brands using blue:</strong> Facebook, IBM, American Express, Ford</p>

<h2>Yellow: Optimism, Clarity, Warmth</h2>
<p>Yellow grabs attention and communicates cheerfulness. It's energizing without being aggressive. Great for brands that want to feel approachable and positive.</p>
<p><strong>Brands using yellow:</strong> McDonald's, IKEA, Snapchat, Best Buy</p>

<h2>Green: Growth, Health, Nature</h2>
<p>Green signals growth, health, and environmental consciousness. It's calming and associated with wealth (money is green). Perfect for wellness, finance, and eco-brands.</p>
<p><strong>Brands using green:</strong> Whole Foods, Starbucks, Spotify, John Deere</p>

<h2>Black: Luxury, Sophistication, Power</h2>
<p>Black is timeless and premium. It communicates exclusivity and elegance. High-end fashion and luxury brands lean into black heavily.</p>
<p><strong>Brands using black:</strong> Chanel, Nike, Uber, Apple</p>

<h2>Orange: Creativity, Adventure, Friendliness</h2>
<p>Orange combines red's energy with yellow's friendliness. It's playful and creative without being aggressive.</p>
<p><strong>Brands using orange:</strong> Nickelodeon, Fanta, Harley-Davidson, Amazon</p>

<h2>Choosing Your Brand Colors</h2>
<ul>
<li>Consider your industry expectations</li>
<li>Think about the emotions you want to evoke</li>
<li>Look at what competitors are using (then differentiate)</li>
<li>Test across different applications</li>
<li>Ensure accessibility and contrast</li>
</ul>

<div class="blog-cta">
<h3>Need Help Choosing the Right Colors?</h3>
<p>We create strategic color palettes based on psychology and positioning.</p>
<a onclick="showView('services')" class="btn-cta">Get Your Brand Kit</a>
</div>
        `
    },
    {
        id: 11,
        slug: 'consistency-beats-creativity',
        title: 'Why Consistency Beats Creativity in Branding (Every Single Time)',
        excerpt: 'The secret to brand recognition isn\'t being clever — it\'s being consistent. Here\'s why boring discipline builds billion-dollar brands.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'November 18, 2025',
        readTime: '7 min read',
        content: `
<p class="blog-lead">Everyone wants the viral moment. The clever campaign. The creative breakthrough. But the brands that actually win? They're boringly, relentlessly consistent.</p>

<h2>The Math of Recognition</h2>
<p>Marketing research shows it takes 5-7 impressions before someone remembers your brand. But here's the catch: those impressions need to be consistent. If your brand looks different every time, you're starting from zero each time.</p>

<p>McDonald's golden arches look exactly the same whether you're in Detroit or Dubai. That consistency is worth billions.</p>

<h2>Consistency Builds Trust</h2>
<p>When your brand looks professional and cohesive, people trust you more. When it looks different everywhere — different fonts, different colors, different styles — people subconsciously question your legitimacy.</p>

<p>Consistency signals: "We have our act together."</p>

<h2>Where Consistency Matters Most</h2>
<ul>
<li><strong>Logo usage:</strong> Same logo, same placement, same clear space</li>
<li><strong>Color palette:</strong> Exact hex codes, not "close enough"</li>
<li><strong>Typography:</strong> Same fonts, same hierarchy</li>
<li><strong>Voice & tone:</strong> Same personality in every piece of copy</li>
<li><strong>Photography style:</strong> Same editing, same mood</li>
<li><strong>Design elements:</strong> Consistent patterns, shapes, icons</li>
</ul>

<h2>The Brand Guidelines Test</h2>
<p>Could someone who's never met you create on-brand content using just your brand guidelines? If not, your guidelines aren't clear enough — or you don't have them at all.</p>

<h2>Creativity WITHIN Consistency</h2>
<p>This doesn't mean being boring. Apple is incredibly creative within their clean, minimalist framework. Creativity happens within the rules, not by breaking them constantly.</p>

<div class="blog-cta">
<h3>Need Brand Guidelines That Actually Work?</h3>
<p>We create comprehensive brand systems for consistent execution.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Brand System</a>
</div>
        `
    },
    {
        id: 12,
        slug: 'small-business-big-brand-energy',
        title: 'How to Give Your Small Business Big Brand Energy',
        excerpt: 'You don\'t need Nike\'s budget to look like a premium brand. Here are the moves that make small businesses look like industry leaders.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'November 11, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Some small businesses look like Fortune 500 companies. Others look like they designed their brand in Microsoft Word. The difference isn't budget — it's knowing what actually matters. Here's the playbook.</p>

<h2>1. Invest in Photography</h2>
<p>Nothing screams "small-time" like bad photos. Stock photos that look generic. iPhone photos with bad lighting. Grainy, pixelated images.</p>
<p>Professional photography — especially for your team, products, and workspace — instantly elevates perception. It's one of the highest-ROI investments you can make.</p>

<h2>2. Simplify Everything</h2>
<p>Amateur brands try to do too much. Too many colors. Too many fonts. Too much clutter. Premium brands are simple and confident.</p>
<p>When in doubt, remove something.</p>

<h2>3. Write Like a Human</h2>
<p>Corporate jargon screams "we're trying too hard." The best brands sound like real people having real conversations. Clear, confident, conversational.</p>

<h2>4. Nail the Details</h2>
<p>Big brands sweat the small stuff. Consistent spacing. Proper alignment. Quality paper for print materials. These details compound.</p>

<h2>5. Create Systems, Not One-Offs</h2>
<p>Don't design a social post. Design a social media system. Don't create a flyer. Create a template library. Systems create consistency.</p>

<h2>6. Say No More Often</h2>
<p>Premium brands are selective. They don't chase every trend. They don't work with every client. Selectivity signals value.</p>

<h2>7. Tell Your Story</h2>
<p>Big brands have narratives. Apple is about thinking different. Nike is about athletic achievement. What's your story? Make it clear.</p>

<h2>8. Invest in Experience</h2>
<p>How does it feel to interact with your brand? The packaging, the website navigation, the customer service? Every touchpoint matters.</p>

<div class="blog-cta">
<h3>Ready for Big Brand Energy?</h3>
<p>We help small businesses look and feel like industry leaders.</p>
<a onclick="showView('services')" class="btn-cta">Level Up Your Brand</a>
</div>
        `
    },
    {
        id: 13,
        slug: 'gary-vee-personal-branding-document-dont-create',
        title: 'Gary Vee Was Right: Document Don\'t Create — Build Your Personal Brand in 2026',
        excerpt: 'Gary Vaynerchuk\'s "document don\'t create" strategy changed how entrepreneurs build personal brands. Here\'s how to apply it to grow your business.',
        category: 'Personal Branding',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'November 4, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">Gary Vaynerchuk built a $200 million empire by showing up every single day. His advice? Stop trying to create perfect content. Document your journey instead. Here's why this personal branding strategy works and how to execute it.</p>

<h2>Why "Document Don't Create" Changes Everything</h2>
<p>Most entrepreneurs freeze when they think about content creation. They want everything perfect. The lighting. The script. The editing. Gary V flipped this: just pull out your phone and share what you're already doing.</p>

<p>The power of documenting:</p>
<ul>
<li><strong>Authenticity:</strong> People connect with real, not polished</li>
<li><strong>Consistency:</strong> You can post daily without burnout</li>
<li><strong>Storytelling:</strong> Your journey IS the content</li>
<li><strong>Trust:</strong> Transparency builds loyal audiences</li>
</ul>

<h2>Personal Branding Is Business Branding</h2>
<p>Gary V says people buy from people they know, like, and trust. Your personal brand IS your business development strategy. When you become the face of your expertise, you become the obvious choice.</p>

<p>The equation is simple: Attention + Trust = Revenue.</p>

<h2>Video Content Is Non-Negotiable</h2>
<p>Gary's been screaming this for years: video is king. Instagram Reels, TikTok, YouTube Shorts — short-form video is how you build awareness in 2026. You don't need a studio. You need a smartphone and something to say.</p>

<h2>The $1.80 Strategy</h2>
<p>Gary V's famous $1.80 strategy: Leave your "two cents" on 90 posts per day across 10 hashtags. It's not about posting — it's about engaging. Comment on others. Build relationships. Be part of the conversation.</p>

<h2>Patience Is the Game</h2>
<p>The biggest lesson from Gary V: This takes time. Years, not months. The entrepreneurs who win are the ones who keep showing up when nobody's watching. Compound attention is real.</p>

<div class="blog-cta">
<h3>Need a Personal Brand That Converts?</h3>
<p>We build brand identities that make you the authority in your space.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Personal Brand</a>
</div>
        `
    },
    {
        id: 14,
        slug: 'grant-cardone-10x-sales-branding',
        title: 'What Grant Cardone Gets Right About Sales, Branding, and 10X Thinking',
        excerpt: 'Grant Cardone built a $4 billion real estate empire with 10X thinking. Here\'s how his sales philosophy applies to your brand strategy.',
        category: 'Sales Strategy',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'October 28, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Love him or hate him, Grant Cardone understands sales and attention better than almost anyone. His 10X Rule has helped millions of entrepreneurs think bigger. Here's what his philosophy teaches us about branding and selling.</p>

<h2>The 10X Rule Applied to Branding</h2>
<p>Grant's core message: Whatever you think you need to do, multiply it by 10. Think you need to post once a day? Post 10 times. Think you need 100 leads? Get 1,000. Think your brand is "good enough"? It's not even close.</p>

<p>Most businesses are invisible because they're playing small. 10X branding means:</p>
<ul>
<li>Being impossible to ignore in your market</li>
<li>Showing up more than your competitors</li>
<li>Investing more in your visual identity</li>
<li>Creating content at volume, not perfection</li>
</ul>

<h2>Omnipresence Is the Goal</h2>
<p>Cardone preaches omnipresence — being everywhere your customer looks. Website. Social media. Email. Billboards. Banners. Yard signs. Vinyl decals. The business that's everywhere is the business that gets called.</p>

<p>Your brand should feel inescapable in your local market.</p>

<h2>Sales Is a Contact Sport</h2>
<p>Grant says most people don't follow up enough. The average sale takes 8 touches. Most salespeople give up after 2. Your brand needs to keep showing up until the prospect is ready to buy.</p>

<h2>Speed and Aggression Win</h2>
<p>Cardone's philosophy: Move fast, be bold, take massive action. In branding terms, this means launching before you're ready, iterating in public, and outworking the competition on visibility.</p>

<h2>Invest in Your Image</h2>
<p>Grant drives Rolls Royces and flies private. Why? Because image matters. Your brand is your business's image. A premium brand commands premium prices. Looking cheap costs you money.</p>

<div class="blog-cta">
<h3>Ready to 10X Your Brand?</h3>
<p>We create bold brand identities that demand attention.</p>
<a onclick="showView('services')" class="btn-cta">Get 10X Branding</a>
</div>
        `
    },
    {
        id: 15,
        slug: 'coach-consultant-mentor-personal-brand-guide',
        title: 'Building a Coaching or Consulting Brand: The Complete Personal Branding Guide',
        excerpt: 'Coaches, consultants, and mentors live and die by their personal brand. Here\'s exactly how to position yourself as the go-to expert in your niche.',
        category: 'Personal Branding',
        image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'October 21, 2025',
        readTime: '12 min read',
        content: `
<p class="blog-lead">If you're a coach, consultant, or mentor, YOU are the product. Your personal brand is everything. It determines whether you charge $50/hour or $500/hour. Here's how to build a brand that commands premium rates.</p>

<h2>Why Personal Branding Matters for Coaches</h2>
<p>The coaching industry is flooded. Everyone's a "business coach" or "life coach" now. The only way to stand out is to become the obvious expert in a specific niche. Your personal brand does that positioning work for you.</p>

<p>A strong coaching brand:</p>
<ul>
<li>Attracts ideal clients who are ready to pay</li>
<li>Positions you as the authority, not a commodity</li>
<li>Justifies premium pricing</li>
<li>Creates inbound leads instead of cold outreach</li>
</ul>

<h2>Define Your Niche (Then Go Narrower)</h2>
<p>"Business coach" is not a niche. "Sales coach for SaaS startups doing $1-5M ARR" is a niche. The more specific your positioning, the easier it is to become the obvious choice.</p>

<h2>Video Builds Trust Faster Than Anything</h2>
<p>People need to feel like they know you before they'll pay you. Video content — YouTube, Instagram Reels, TikTok, LinkedIn video — lets prospects experience your coaching style before the sales call.</p>

<h2>Host Events and Workshops</h2>
<p>Nothing builds authority like standing on a stage. Virtual workshops, webinars, local meetups, mentor days — events position you as the expert and generate qualified leads. Plus, you can capture content to repurpose across all platforms.</p>

<h2>Your Visual Identity Signals Your Value</h2>
<p>A coach with a Canva logo and a Wix template site will never command $10K packages. Your visual brand — logo, colors, website, photography — needs to match your desired price point.</p>

<h2>Build Your Ecosystem</h2>
<p>The most successful coaches have:</p>
<ul>
<li>A professional website with clear offers</li>
<li>Consistent social media presence</li>
<li>Email list and newsletter</li>
<li>Free content that demonstrates expertise</li>
<li>Testimonials and case studies</li>
<li>A signature framework or methodology</li>
</ul>

<div class="blog-cta">
<h3>Ready to Build Your Coaching Brand?</h3>
<p>We create premium personal brands for coaches and consultants.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Expert Brand</a>
</div>
        `
    },
    {
        id: 16,
        slug: 'print-design-signage-brand-visibility',
        title: 'Banners, Yard Signs & Vinyl Decals: Turn Your Business Into a Local Billboard',
        excerpt: 'Your storefront, events, and local presence are advertising real estate you already own. Here\'s how print design and signage generate thousands of impressions daily.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'October 14, 2025',
        readTime: '8 min read',
        content: `
<p class="blog-lead">Your storefront window, your next event, the road your customers drive every day — these are advertising surfaces you already have access to. Banners, yard signs, posters, and vinyl decals turn them into 24/7 brand billboards.</p>

<h2>The Math on Print Signage</h2>
<p>A well-placed yard sign or banner generates thousands of impressions per day. At a design cost of $200-$500, printed for under $100, and lasting months to years, you're looking at one of the lowest cost-per-impression advertising methods available. Compare that to:</p>
<ul>
<li>Facebook Ads: $5-15 CPM</li>
<li>Google Display: $2-10 CPM</li>
<li>Digital Billboards: $3-18 CPM</li>
</ul>
<p>Print signage — banners, yard signs, and vinyl decals — is one of the most cost-effective local advertising methods that exist.</p>

<h2>Design Principles for Banners & Posters</h2>
<p>Your banner has about 3 seconds to communicate. That means:</p>
<ul>
<li><strong>Big, readable logo:</strong> Should be visible from across the room or street</li>
<li><strong>One clear message:</strong> What do you do or what's the event?</li>
<li><strong>Phone number or website:</strong> Make it large and easy to read</li>
<li><strong>High contrast colors:</strong> Stand out against any background</li>
</ul>
<p>Don't try to fit your entire service menu on a banner. Less is more.</p>

<h2>Yard Signs That Drive Business</h2>
<p>Yard signs are the original local marketing tool. Effective yard sign design includes:</p>
<ul>
<li><strong>Business name and logo:</strong> Readable from a moving car</li>
<li><strong>Bold phone number or website:</strong> The primary call to action</li>
<li><strong>High-contrast colors:</strong> Visible day and night</li>
<li><strong>Simple message:</strong> "Now Open" or "Grand Opening" or "Free Estimates"</li>
</ul>

<h2>Vinyl Decals & Window Graphics</h2>
<p>Your storefront window is prime real estate. Effective vinyl graphics include:</p>
<ul>
<li><strong>Business name and logo:</strong> Prominent and professional</li>
<li><strong>Hours of operation:</strong> Don't make people guess</li>
<li><strong>Call to action:</strong> "Walk-ins welcome" or "Free consultations"</li>
<li><strong>Seasonal promotions:</strong> Easily changeable window decals</li>
</ul>

<h2>Brand Consistency Is Key</h2>
<p>Your banners, yard signs, vinyl decals, business cards, and website should all look like they belong to the same company. Same colors. Same fonts. Same visual language. This consistency builds recognition.</p>

<h2>Event Backgrounds Multiply Your Reach</h2>
<p>A branded event backdrop turns every photo into free advertising. When guests post photos from your event with your branding in the background, that's organic reach money can't buy.</p>

<div class="blog-cta">
<h3>Ready for Professional Print Design?</h3>
<p>We create banners, posters, yard signs, and vinyl decals that get noticed.</p>
<a onclick="showView('services')" class="btn-cta">Get Print Design</a>
</div>
        `
    },
    {
        id: 17,
        slug: 'custom-web-app-business-growth',
        title: 'Why Every Growing Business Needs a Custom Web App (Not Just a Website)',
        excerpt: 'Websites inform. Web apps transform. Here\'s why custom web applications are the secret weapon of businesses that scale.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'October 7, 2025',
        readTime: '11 min read',
        content: `
<p class="blog-lead">A website is a digital brochure. A custom web app is a digital employee that works 24/7, never calls in sick, and scales infinitely. If you're still running your business on spreadsheets and email, you're leaving money on the table.</p>

<h2>Website vs. Web App: What's the Difference?</h2>
<p>A <strong>website</strong> displays information. Visitors read content, maybe fill out a contact form, and leave. A <strong>web application</strong> performs tasks. Users log in, interact with data, complete workflows, and get things done.</p>

<p>Examples of web apps:</p>
<ul>
<li><strong>Client portals:</strong> Customers check order status, access documents</li>
<li><strong>Booking systems:</strong> Appointments scheduled without phone calls</li>
<li><strong>Project management:</strong> Team collaboration in one place</li>
<li><strong>Custom CRMs:</strong> Track leads and customers your way</li>
<li><strong>Internal tools:</strong> Automate repetitive business processes</li>
</ul>

<h2>Why Custom Beats Off-the-Shelf</h2>
<p>Tools like Salesforce, Monday, and HubSpot are powerful. They're also expensive, bloated, and force you to work their way. A custom web app is built around YOUR processes, not the other way around.</p>

<p>Benefits of custom:</p>
<ul>
<li><strong>Exact fit:</strong> Does exactly what you need, nothing more</li>
<li><strong>Competitive advantage:</strong> Your competitors can't buy it</li>
<li><strong>Scalability:</strong> Grows with your business</li>
<li><strong>Integration:</strong> Connects with your existing tools</li>
<li><strong>Ownership:</strong> You own the code and data forever</li>
</ul>

<h2>Signs You Need a Custom Web App</h2>
<p>If any of these sound familiar, it's time:</p>
<ul>
<li>You're copying data between multiple spreadsheets</li>
<li>Your team wastes hours on repetitive tasks</li>
<li>Customers are frustrated with your ordering/booking process</li>
<li>You're paying for 10 SaaS tools that don't talk to each other</li>
<li>Your business process is too unique for standard software</li>
</ul>

<h2>The ROI of Automation</h2>
<p>A custom web app that saves your team 10 hours per week is worth $25,000/year in labor alone. Most apps pay for themselves in months, then keep generating returns forever.</p>

<h2>Start With One Problem</h2>
<p>You don't need to build everything at once. Pick the one process that's causing the most pain. Automate that. Prove the value. Then expand.</p>

<div class="blog-cta">
<h3>Ready to Build Your Custom Web App?</h3>
<p>We build web applications that automate your business processes.</p>
<a onclick="showView('services')" class="btn-cta">Explore Web App Solutions</a>
</div>
        `
    },
    {
        id: 18,
        slug: 'why-every-business-needs-three-logos',
        title: 'Why Every Business Needs 3 Logos (And What Each One Is For)',
        excerpt: 'One logo is not enough. Here is why professional brands have multiple logo variations and how to use each one correctly.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'September 30, 2025',
        readTime: '7 min read',
        content: `
<p class="blog-lead">If you only have one logo, you are already behind. Professional brands have multiple logo variations designed for different contexts. Here is the logo system every serious business needs.</p>

<h2>The Primary Logo (Horizontal Lockup)</h2>
<p>This is your main logo — the full version with your symbol/icon and wordmark side by side. Use this when you have plenty of horizontal space:</p>
<ul>
<li>Website header</li>
<li>Email signatures</li>
<li>Business cards</li>
<li>Letterhead</li>
<li>Presentations</li>
</ul>
<p>This is the logo most people picture when they think of your brand.</p>

<h2>The Stacked Logo (Vertical Lockup)</h2>
<p>Same elements as your primary logo, but arranged vertically — icon on top, wordmark below. Use this when you have more vertical space or need a more compact format:</p>
<ul>
<li>Social media profile pictures</li>
<li>Signage</li>
<li>Packaging</li>
<li>Apparel embroidery</li>
<li>Square format applications</li>
</ul>

<h2>The Icon/Brandmark (Favicon)</h2>
<p>Just your symbol or a simplified mark — no text. This is crucial for small spaces where your wordmark would be unreadable:</p>
<ul>
<li>Favicon (browser tab icon)</li>
<li>App icons</li>
<li>Social media avatars</li>
<li>Watermarks</li>
<li>Embossed materials</li>
</ul>

<h2>Bonus: Responsive Logo Variations</h2>
<p>Some brands also have size-responsive variations — simplified versions that work at tiny sizes. Think about how your logo looks at 16x16 pixels.</p>

<h2>Color Variations Matter Too</h2>
<p>Each of these three logos should also have:</p>
<ul>
<li><strong>Full color:</strong> Your primary brand colors</li>
<li><strong>Single color:</strong> For one-color printing</li>
<li><strong>Reversed/White:</strong> For dark backgrounds</li>
<li><strong>Black:</strong> For documents and faxes</li>
</ul>

<div class="blog-cta">
<h3>Need a Complete Logo System?</h3>
<p>We create professional logo packages with all the variations you need.</p>
<a onclick="showView('services')" class="btn-cta">Get Your Logo System</a>
</div>
        `
    },
    {
        id: 19,
        slug: 'what-is-brand-identity-complete-guide',
        title: 'What Is Brand Identity? The Complete Guide for Business Owners',
        excerpt: 'Brand identity is more than a logo. Here is everything that makes up your visual brand system and why each piece matters.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'September 23, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Brand identity is the complete visual system that represents your business. It is not just a logo — it is every visual element that helps customers recognize and remember you.</p>

<h2>The Core Elements of Brand Identity</h2>

<h3>1. Logo System</h3>
<p>Your logo is the cornerstone, but as we covered, you need multiple versions — primary, stacked, and icon variations in multiple color formats.</p>

<h3>2. Color Palette</h3>
<p>A defined set of colors used consistently across everything. This typically includes:</p>
<ul>
<li>Primary colors (1-2)</li>
<li>Secondary colors (2-3)</li>
<li>Accent colors</li>
<li>Neutral colors (backgrounds, text)</li>
</ul>

<h3>3. Typography</h3>
<p>The fonts you use communicate personality. Most brands need:</p>
<ul>
<li>Heading font (bold, attention-grabbing)</li>
<li>Body font (readable, professional)</li>
<li>Accent font (optional, for special uses)</li>
</ul>

<h3>4. Imagery Style</h3>
<p>Guidelines for photography, illustrations, and graphics. What mood? What subjects? What editing style?</p>

<h3>5. Graphic Elements</h3>
<p>Patterns, shapes, icons, and textures that create visual consistency beyond the logo.</p>

<h3>6. Voice and Tone</h3>
<p>While technically part of brand strategy, your verbal identity works with visual identity to create a complete brand experience.</p>

<h2>Brand Identity vs. Brand vs. Branding</h2>
<ul>
<li><strong>Brand:</strong> How people perceive you (reputation)</li>
<li><strong>Brand Identity:</strong> The visual tools you use to shape perception</li>
<li><strong>Branding:</strong> The process of building and managing your brand</li>
</ul>

<h2>Why Brand Identity Matters</h2>
<p>Consistent brand identity increases revenue by up to 23% according to research. It builds recognition, creates trust, and makes marketing more effective.</p>

<div class="blog-cta">
<h3>Ready for a Professional Brand Identity?</h3>
<p>We create complete brand identity systems for businesses ready to level up.</p>
<a onclick="showView('services')" class="btn-cta">Explore Brand Packages</a>
</div>
        `
    },
    {
        id: 20,
        slug: 'what-is-a-web-app-explained',
        title: 'What Is a Web App? A Simple Explanation for Non-Technical Business Owners',
        excerpt: 'Web apps, websites, mobile apps — what is the difference? Here is a plain English guide to understanding web applications.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'September 16, 2025',
        readTime: '6 min read',
        content: `
<p class="blog-lead">You have heard the term "web app" but what does it actually mean? Here is a simple explanation without the tech jargon.</p>

<h2>Website vs. Web App: The Simple Version</h2>
<p><strong>Website:</strong> You visit it to READ information. It is like a digital brochure or magazine.</p>
<p><strong>Web App:</strong> You visit it to DO something. It is like a digital tool or software.</p>

<h2>Real Examples</h2>
<p><strong>Websites:</strong></p>
<ul>
<li>A restaurant menu page</li>
<li>A company's "About Us" page</li>
<li>A news article</li>
<li>A portfolio showcase</li>
</ul>
<p><strong>Web Apps:</strong></p>
<ul>
<li>Gmail (you send and receive emails)</li>
<li>Google Docs (you create documents)</li>
<li>Online banking (you manage money)</li>
<li>Canva (you design graphics)</li>
<li>A booking system (you schedule appointments)</li>
</ul>

<h2>Web App vs. Mobile App</h2>
<p><strong>Mobile App:</strong> Downloaded from app store, installed on your phone</p>
<p><strong>Web App:</strong> Accessed through a browser, no download needed</p>
<p>Many services have both. You can use Instagram as a mobile app OR go to instagram.com in your browser (web app).</p>

<h2>Why Would Your Business Need a Web App?</h2>
<ul>
<li><strong>Client Portal:</strong> Customers log in to see their orders, documents, or account info</li>
<li><strong>Booking System:</strong> Clients schedule appointments without calling you</li>
<li><strong>Quote Calculator:</strong> Visitors get instant pricing estimates</li>
<li><strong>Internal Tools:</strong> Your team manages projects, inventory, or processes</li>
</ul>

<h2>The Benefit Over Mobile Apps</h2>
<p>Web apps work on any device with a browser — no app store approval, no downloads, no updates for users to install. One version works everywhere.</p>

<div class="blog-cta">
<h3>Need a Custom Web App for Your Business?</h3>
<p>We build web applications that solve real business problems.</p>
<a onclick="showView('services')" class="btn-cta">Discuss Your Web App</a>
</div>
        `
    },
    {
        id: 21,
        slug: 'what-is-a-vector-file-explained',
        title: 'What Is a Vector File? Why Your Designer Keeps Asking for It',
        excerpt: 'PNG, JPG, SVG, AI, EPS — what do these mean and why does it matter? Here is everything you need to know about vector files.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'September 9, 2025',
        readTime: '6 min read',
        content: `
<p class="blog-lead">Every time you work with a designer or printer, they ask for "vector files." But what does that actually mean? Here is the simple explanation.</p>

<h2>Vector vs. Raster: The Difference</h2>
<p><strong>Raster images (JPG, PNG, GIF):</strong> Made of tiny squares called pixels. Like a mosaic. When you zoom in, you see the squares and it gets blurry.</p>
<p><strong>Vector images (SVG, AI, EPS, PDF):</strong> Made of mathematical paths and shapes. Like connect-the-dots. They can scale to ANY size without losing quality.</p>

<h2>Why Vectors Matter for Your Logo</h2>
<p>Your logo needs to work at every size:</p>
<ul>
<li>Tiny: Favicon (16x16 pixels)</li>
<li>Small: Business card</li>
<li>Medium: Website header</li>
<li>Large: Trade show banner</li>
<li>Huge: Building signage, billboards</li>
</ul>
<p>A raster logo that looks fine on a business card will be a pixelated mess on a billboard. A vector logo looks crisp at ANY size.</p>

<h2>Common File Types Explained</h2>
<ul>
<li><strong>.AI:</strong> Adobe Illustrator file (vector, editable)</li>
<li><strong>.EPS:</strong> Encapsulated PostScript (vector, universal)</li>
<li><strong>.SVG:</strong> Scalable Vector Graphics (vector, web-friendly)</li>
<li><strong>.PDF:</strong> Can be vector OR raster depending on how it was made</li>
<li><strong>.PNG:</strong> Raster, but supports transparency</li>
<li><strong>.JPG:</strong> Raster, compressed, no transparency</li>
</ul>

<h2>What Files Should You Have?</h2>
<p>A professional logo package should include:</p>
<ul>
<li>Vector files (.AI, .EPS, .SVG) for printing and scaling</li>
<li>High-res PNG files for digital use</li>
<li>Various color versions (full color, white, black)</li>
</ul>

<h2>Red Flag: "I Only Have a JPG"</h2>
<p>If your "designer" only gave you JPG files, you do not have a professional logo. You have a picture of a logo. Always get your vector source files.</p>

<div class="blog-cta">
<h3>Need Proper Logo Files?</h3>
<p>We deliver complete file packages with every format you will ever need.</p>
<a onclick="showView('services')" class="btn-cta">Get Professional Logo Files</a>
</div>
        `
    },
    {
        id: 22,
        slug: 'small-brands-beating-ai-with-real-designers',
        title: 'How Small Brands Who Hire Real Designers Are Beating AI-Generated Competition',
        excerpt: 'While everyone rushes to AI design tools, smart small brands are winning by investing in human creativity. Here is why.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'September 2, 2025',
        readTime: '8 min read',
        content: `
<p class="blog-lead">AI logo generators are everywhere. They are cheap. They are fast. And they are creating a sea of forgettable, generic brands. Here is why the smart money is going the other direction.</p>

<h2>The AI Design Problem</h2>
<p>AI tools like Looka, Canva AI, and MidJourney can generate logos in seconds. But here is what they cannot do:</p>
<ul>
<li>Understand your specific market positioning</li>
<li>Research your competitors to ensure differentiation</li>
<li>Create truly original concepts</li>
<li>Guarantee the design is not similar to existing trademarks</li>
<li>Adapt based on strategic feedback</li>
</ul>

<h2>The "AI Look" Is Becoming Obvious</h2>
<p>AI-generated designs have patterns. Certain styles. Particular tendencies. Customers are starting to recognize — even subconsciously — when something looks AI-generated. And it signals: "This business did not invest in their brand."</p>

<h2>The Differentiation Opportunity</h2>
<p>When everyone zigs toward AI, zagging toward human design creates instant differentiation. A thoughtfully crafted brand identity stands out in a sea of algorithmic sameness.</p>

<h2>Real Designers Provide Strategy</h2>
<p>A logo is not just a pretty picture. It is a strategic business asset. Real designers:</p>
<ul>
<li>Ask about your target audience</li>
<li>Research your competitive landscape</li>
<li>Consider your business goals</li>
<li>Think about practical applications</li>
<li>Ensure scalability and versatility</li>
</ul>

<h2>The Hidden Costs of AI Design</h2>
<p>That $50 AI logo might cost you:</p>
<ul>
<li>Customer trust (looks cheap)</li>
<li>Trademark issues (AI does not check)</li>
<li>Rebrand costs in 2 years (when you outgrow it)</li>
<li>Lost premium pricing power</li>
</ul>

<h2>Investment vs. Expense</h2>
<p>AI design is an expense. Professional design is an investment. The brands winning in 2026 understand the difference.</p>

<div class="blog-cta">
<h3>Ready for Human-Crafted Design?</h3>
<p>We create strategic brand identities that AI cannot replicate.</p>
<a onclick="showView('services')" class="btn-cta">Work With Real Designers</a>
</div>
        `
    },
    {
        id: 23,
        slug: 'what-is-brand-story-why-you-need-one',
        title: 'What Is a Brand Story and Why Does Your Business Need One?',
        excerpt: 'Facts tell, stories sell. Here is what a brand story actually is and how to craft one that connects with customers.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'August 26, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Nike does not sell shoes. They sell the story of athletic achievement. Apple does not sell computers. They sell the story of thinking different. What story does your brand tell?</p>

<h2>What Is a Brand Story?</h2>
<p>Your brand story is the narrative that connects your business to your customers emotionally. It is not just your company history — it is the "why" behind everything you do.</p>

<p>A brand story answers:</p>
<ul>
<li>Why does your company exist?</li>
<li>What problem were you born to solve?</li>
<li>Who do you serve and why do you care?</li>
<li>What makes your approach different?</li>
<li>What future are you creating?</li>
</ul>

<h2>Why Stories Beat Facts</h2>
<p>Neuroscience shows stories activate more parts of the brain than facts alone. When someone hears a story, their brain synchronizes with the storyteller. That is connection. That is trust.</p>

<p>People remember stories 22x better than facts alone.</p>

<h2>The Brand Story Framework</h2>
<ol>
<li><strong>The Problem:</strong> What frustration or pain exists in the world?</li>
<li><strong>The Awakening:</strong> What moment made you decide to act?</li>
<li><strong>The Mission:</strong> What are you setting out to change?</li>
<li><strong>The Solution:</strong> How do you uniquely solve the problem?</li>
<li><strong>The Vision:</strong> What does success look like for your customers?</li>
</ol>

<h2>Brand Story Examples</h2>
<p><strong>TOMS:</strong> "With every product you purchase, TOMS will help a person in need." Simple. Emotional. Memorable.</p>
<p><strong>Warby Parker:</strong> Started because glasses were too expensive and buying them was frustrating. They made it accessible and easy.</p>

<h2>Where Your Brand Story Lives</h2>
<ul>
<li>Your "About" page</li>
<li>Social media bios</li>
<li>Pitch decks and proposals</li>
<li>Team training and culture</li>
<li>Customer communications</li>
</ul>

<div class="blog-cta">
<h3>Need Help Crafting Your Brand Story?</h3>
<p>We help businesses discover and articulate their authentic brand narrative.</p>
<a onclick="showView('services')" class="btn-cta">Develop Your Brand Story</a>
</div>
        `
    },
    {
        id: 24,
        slug: 'what-is-brand-voice-how-to-use-it',
        title: 'What Is Brand Voice? (And How to Use It Consistently Everywhere)',
        excerpt: 'Your brand voice is how your business sounds in writing. Here is how to define it, document it, and use it to stand out.',
        category: 'Brand Strategy',
        image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'August 19, 2025',
        readTime: '8 min read',
        content: `
<p class="blog-lead">If your brand was a person, how would they talk? That is your brand voice. It is the personality that comes through in every email, social post, and webpage you write.</p>

<h2>What Is Brand Voice?</h2>
<p>Brand voice is the consistent personality and style of your written and verbal communication. It includes:</p>
<ul>
<li><strong>Tone:</strong> Formal or casual? Serious or playful?</li>
<li><strong>Language:</strong> Technical or simple? Industry jargon or everyday words?</li>
<li><strong>Personality:</strong> Warm or authoritative? Quirky or straightforward?</li>
<li><strong>Rhythm:</strong> Short punchy sentences or flowing prose?</li>
</ul>

<h2>Why Brand Voice Matters</h2>
<p>Consistency builds recognition. When your brand sounds the same everywhere, customers learn to recognize you — even without seeing your logo. Voice creates familiarity. Familiarity creates trust.</p>

<h2>How to Define Your Brand Voice</h2>
<p><strong>Step 1:</strong> Describe your brand as a person. Give them traits. "If our brand was a person, they would be confident but approachable, smart but not arrogant."</p>
<p><strong>Step 2:</strong> List 3-5 voice attributes. Examples: Friendly, Bold, Expert, Playful, Direct, Warm, Rebellious.</p>
<p><strong>Step 3:</strong> Create do's and don'ts for each attribute.</p>

<h2>Example Brand Voice Guidelines</h2>
<p><strong>Voice Attribute: Friendly</strong></p>
<ul>
<li>DO: Use contractions (we're, you'll, it's)</li>
<li>DO: Address the reader as "you"</li>
<li>DON'T: Use cold corporate language</li>
<li>DON'T: Sound like a press release</li>
</ul>

<h2>Using Your Brand Voice Everywhere</h2>
<ul>
<li>Website copy</li>
<li>Social media posts</li>
<li>Email marketing</li>
<li>Customer service responses</li>
<li>Proposals and contracts</li>
<li>Product descriptions</li>
<li>Job postings</li>
</ul>

<h2>Voice vs. Tone</h2>
<p>Voice stays consistent. Tone adapts to context. Your voice might be "friendly and expert." But the tone of a complaint response differs from a promotional email — while both still sound like YOU.</p>

<div class="blog-cta">
<h3>Need Help Defining Your Brand Voice?</h3>
<p>We create brand voice guidelines that keep your messaging consistent.</p>
<a onclick="showView('services')" class="btn-cta">Develop Your Brand Voice</a>
</div>
        `
    },
    {
        id: 25,
        slug: 'why-social-media-reach-is-failing',
        title: 'Why Your Social Media Reach Is Dying (And What Actually Works in 2026)',
        excerpt: 'Organic reach is plummeting. The algorithm hates your posts. Here is what is really happening and how to fix it.',
        category: 'Social Media',
        image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'August 12, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">You post consistently. You use hashtags. You follow all the "tips." Yet your reach keeps dropping. Here is the brutal truth about social media in 2026 — and what actually works.</p>

<h2>Why Organic Reach Is Dying</h2>
<p>The platforms WANT you to pay. Facebook organic reach is down to 2-5% of your followers. Instagram is not much better. The business model is: give you a taste for free, then charge for access to YOUR OWN audience.</p>

<h2>The Algorithm Rewards Engagement</h2>
<p>The algorithm does not care about your business goals. It cares about keeping users on the platform. Posts that get quick engagement (comments, shares, saves) get shown to more people. Posts that get scrolled past get buried.</p>

<h2>Common Mistakes Killing Your Reach</h2>
<ul>
<li><strong>Posting links:</strong> Platforms hate when you send people away</li>
<li><strong>Being boring:</strong> Safe, corporate content gets ignored</li>
<li><strong>Inconsistent posting:</strong> The algorithm forgets you exist</li>
<li><strong>Ignoring video:</strong> All platforms prioritize video content</li>
<li><strong>No engagement:</strong> If you do not comment, they do not show your posts</li>
</ul>

<h2>What Actually Works in 2026</h2>

<h3>1. Short-Form Video Is King</h3>
<p>Reels, TikToks, Shorts — this is where the reach is. The platforms are competing for attention against TikTok, so they push video content hard.</p>

<h3>2. Engagement Before Broadcasting</h3>
<p>Spend 15 minutes engaging with other accounts BEFORE you post. The algorithm sees you as active and rewards your content.</p>

<h3>3. Native Content Only</h3>
<p>Stop sharing links. Create content native to each platform. Put the value IN the post, not behind a click.</p>

<h3>4. Build Email Instead</h3>
<p>Social media is rented land. Your email list is owned. Use social to drive email signups, then nurture through email.</p>

<h3>5. Pay to Play</h3>
<p>Accept that organic is supplemental. Budget for paid promotion of your best content. Even $50-100/month makes a difference.</p>

<div class="blog-cta">
<h3>Need a Social Media Strategy That Works?</h3>
<p>We create branded content systems designed for the algorithm.</p>
<a onclick="showView('services')" class="btn-cta">Fix Your Social Strategy</a>
</div>
        `
    },
    {
        id: 26,
        slug: 'alex-hormozi-100m-offers-brand-lessons',
        title: 'Alex Hormozi\'s $100M Offers: How to Apply Grand Slam Offer Strategy to Your Brand',
        excerpt: 'Alex Hormozi sold $100M+ in services by creating irresistible offers. Here is how to apply his framework to your branding and marketing.',
        category: 'Business Strategy',
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'August 5, 2025',
        readTime: '11 min read',
        content: `
<p class="blog-lead">Alex Hormozi's "$100M Offers" is required reading for anyone selling services. His Grand Slam Offer framework changes how you think about pricing, packaging, and presenting your brand. Here is how to apply it.</p>

<h2>The Core Concept: Value vs. Price</h2>
<p>Hormozi's formula: Make the value SO obvious that price becomes irrelevant. If your offer delivers $100,000 in value, charging $10,000 is a no-brainer. The problem? Most businesses cannot articulate their value.</p>

<h2>The Value Equation</h2>
<p>Value = (Dream Outcome x Perceived Likelihood of Achievement) / (Time Delay x Effort & Sacrifice)</p>
<ul>
<li><strong>Dream Outcome:</strong> What do they REALLY want?</li>
<li><strong>Perceived Likelihood:</strong> Do they believe you can deliver?</li>
<li><strong>Time Delay:</strong> How fast do they get results?</li>
<li><strong>Effort Required:</strong> How hard is it for them?</li>
</ul>

<h2>Applying This to Your Brand</h2>
<p>Your brand should communicate each element of the value equation:</p>
<ul>
<li><strong>Dream Outcome:</strong> Your messaging should paint the vision</li>
<li><strong>Likelihood:</strong> Testimonials, case studies, and credibility markers</li>
<li><strong>Speed:</strong> Clear timelines and fast-start options</li>
<li><strong>Ease:</strong> Done-for-you services, simple processes</li>
</ul>

<h2>Stack the Value</h2>
<p>Hormozi teaches value stacking — adding bonuses and components that increase perceived value without increasing cost. For branding, this means:</p>
<ul>
<li>Include brand guidelines (not just the logo)</li>
<li>Add social media templates</li>
<li>Include business card designs</li>
<li>Provide a brand strategy document</li>
<li>Offer revision rounds</li>
</ul>

<h2>Create Urgency and Scarcity</h2>
<p>Limited slots. Deadline pricing. Bonuses that expire. Hormozi shows that ethical urgency increases conversions. Your brand should create reasons to act NOW.</p>

<h2>Name Your Offer</h2>
<p>Do not sell "logo design." Sell "The Brand Launch System" or "The Authority Brand Package." Naming creates perceived uniqueness.</p>

<div class="blog-cta">
<h3>Ready for a Grand Slam Brand?</h3>
<p>We create value-stacked brand packages designed to convert.</p>
<a onclick="showView('services')" class="btn-cta">See Our Brand Packages</a>
</div>
        `
    },
    {
        id: 27,
        slug: 'dale-carnegie-influence-branding-lessons',
        title: 'Dale Carnegie\'s Timeless Principles: How to Win Customers and Influence Your Market',
        excerpt: 'Dale Carnegie wrote the book on human influence in 1936. His principles are more relevant than ever for building a brand people love.',
        category: 'Business Strategy',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'July 29, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">"How to Win Friends and Influence People" has sold 30+ million copies since 1936. Dale Carnegie's principles about human nature apply directly to how we build brands that connect. Here is the playbook.</p>

<h2>Principle 1: Become Genuinely Interested in Other People</h2>
<p>Carnegie's first rule: Care about others. For brands, this means customer-centric everything. Your website should be about THEM, not you. Your content should solve THEIR problems. Your social media should respond to THEIR needs.</p>
<p>Brands that talk about themselves all day lose. Brands that focus on customer transformation win.</p>

<h2>Principle 2: Smile</h2>
<p>In branding terms: Be approachable. Your visual identity, your copy, your customer service — all of it should feel welcoming, not intimidating. Warmth converts.</p>

<h2>Principle 3: Remember Names</h2>
<p>Personalization matters. Use customer names in emails. Remember their preferences. CRM systems exist for this reason. Making someone feel known creates loyalty.</p>

<h2>Principle 4: Be a Good Listener</h2>
<p>Listen to your market. Read comments. Monitor reviews. Conduct surveys. The brands that win are the ones that hear what customers actually want — not what the brand THINKS they want.</p>

<h2>Principle 5: Talk in Terms of Others' Interests</h2>
<p>Features tell, benefits sell. Nobody cares that your product has "advanced technology." They care that it saves them 2 hours per day. Translate everything into customer benefit.</p>

<h2>Principle 6: Make People Feel Important</h2>
<p>User-generated content. Customer spotlights. Loyalty programs. Handwritten thank-you notes. Small gestures that say "you matter" create brand evangelists.</p>

<h2>Principle 7: Avoid Arguments</h2>
<p>On social media, in reviews, in customer service — never argue. Acknowledge, empathize, solve. You will never win an argument with a customer, even if you are right.</p>

<h2>Principle 8: Admit Mistakes</h2>
<p>Brands that own their mistakes build trust. Defensiveness destroys it. When you mess up, say so clearly, apologize sincerely, and fix it fast.</p>

<h2>The Carnegie Brand Test</h2>
<p>Ask yourself: Does my brand make people feel valued, heard, and important? If not, revisit these principles.</p>

<div class="blog-cta">
<h3>Build a Brand People Love</h3>
<p>We create brands designed around human connection.</p>
<a onclick="showView('services')" class="btn-cta">Start Your Brand Journey</a>
</div>
        `
    },
    {
        id: 28,
        slug: 'what-is-sop-standard-operating-procedure',
        title: 'What Is an SOP? How Standard Operating Procedures Scale Your Business',
        excerpt: 'SOPs are the secret weapon of businesses that grow without chaos. Here is what they are, why you need them, and how to create them.',
        category: 'Business Strategy',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'July 22, 2025',
        readTime: '8 min read',
        content: `
<p class="blog-lead">You cannot scale what is only in your head. Standard Operating Procedures (SOPs) are how businesses go from dependent on the founder to running like a machine. Here is everything you need to know.</p>

<h2>What Is an SOP?</h2>
<p>An SOP (Standard Operating Procedure) is a step-by-step document that explains exactly how to complete a specific task or process. Think of it as a recipe — anyone should be able to follow it and get the same result.</p>

<p>Examples of SOPs:</p>
<ul>
<li>How to onboard a new client</li>
<li>How to process a refund</li>
<li>How to post on social media</li>
<li>How to respond to customer complaints</li>
<li>How to create an invoice</li>
</ul>

<h2>Why SOPs Matter</h2>
<p><strong>Consistency:</strong> Every customer gets the same experience, every time.</p>
<p><strong>Training:</strong> New employees can get up to speed fast.</p>
<p><strong>Delegation:</strong> You can hand off tasks without constant supervision.</p>
<p><strong>Scale:</strong> Processes work whether you have 2 employees or 200.</p>
<p><strong>Quality:</strong> Mistakes decrease when there is a documented process.</p>

<h2>How to Create an SOP</h2>
<ol>
<li><strong>Pick one process:</strong> Start with something you do frequently</li>
<li><strong>Record yourself doing it:</strong> Use Loom or screen recording</li>
<li><strong>Write each step:</strong> Be specific — assume the reader knows nothing</li>
<li><strong>Add screenshots:</strong> Visual guides reduce confusion</li>
<li><strong>Test it:</strong> Have someone follow it and note where they get stuck</li>
<li><strong>Refine:</strong> Update based on feedback</li>
</ol>

<h2>SOP Format Template</h2>
<ul>
<li><strong>Title:</strong> What process is this?</li>
<li><strong>Purpose:</strong> Why does this process exist?</li>
<li><strong>Scope:</strong> When does this apply?</li>
<li><strong>Materials:</strong> What tools or access is needed?</li>
<li><strong>Steps:</strong> Numbered, detailed instructions</li>
<li><strong>Troubleshooting:</strong> Common issues and solutions</li>
</ul>

<h2>Where to Store SOPs</h2>
<p>Google Docs, Notion, Trainual, or your project management tool. The key is that everyone can access and search them easily.</p>

<div class="blog-cta">
<h3>Need Branded SOP Templates?</h3>
<p>We create professional document templates that match your brand.</p>
<a onclick="showView('services')" class="btn-cta">Get Branded Templates</a>
</div>
        `
    },
    {
        id: 29,
        slug: 'what-is-crm-customer-relationship-management',
        title: 'What Is a CRM? The Small Business Guide to Customer Relationship Management',
        excerpt: 'A CRM is the command center for your customer relationships. Here is what it does, why you need one, and which options work for small businesses.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'July 15, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">If your customer data lives in spreadsheets, sticky notes, and your memory, you are leaving money on the table. A CRM (Customer Relationship Management) system changes everything.</p>

<h2>What Is a CRM?</h2>
<p>A CRM is software that helps you track and manage all your interactions with customers and potential customers. It is a central database where every conversation, purchase, and touchpoint is recorded.</p>

<p>Think of it as your business's memory — but better, because it is searchable, shareable, and never forgets.</p>

<h2>What Does a CRM Do?</h2>
<ul>
<li><strong>Contact Management:</strong> Store all customer info in one place</li>
<li><strong>Interaction Tracking:</strong> Log calls, emails, meetings</li>
<li><strong>Deal Pipeline:</strong> Track sales opportunities through stages</li>
<li><strong>Task Management:</strong> Set reminders to follow up</li>
<li><strong>Email Integration:</strong> Send and track emails from the CRM</li>
<li><strong>Reporting:</strong> See sales metrics and forecasts</li>
<li><strong>Automation:</strong> Trigger actions based on customer behavior</li>
</ul>

<h2>Why Your Business Needs a CRM</h2>
<p><strong>No more lost leads:</strong> Every inquiry is tracked and followed up.</p>
<p><strong>Better customer service:</strong> Anyone on your team can see full history.</p>
<p><strong>More sales:</strong> Consistent follow-up closes more deals.</p>
<p><strong>Data-driven decisions:</strong> See what is working and what is not.</p>
<p><strong>Scale your team:</strong> New salespeople can hit the ground running.</p>

<h2>Popular CRM Options for Small Business</h2>
<ul>
<li><strong>HubSpot CRM:</strong> Free tier, great for beginners</li>
<li><strong>Pipedrive:</strong> Visual pipeline, sales-focused</li>
<li><strong>Zoho CRM:</strong> Affordable, full-featured</li>
<li><strong>Salesforce:</strong> Enterprise-level, complex</li>
<li><strong>Monday.com:</strong> Flexible, good for project + CRM</li>
<li><strong>GoHighLevel:</strong> All-in-one marketing + CRM</li>
</ul>

<h2>When to Get a CRM</h2>
<p>If you have more than 20 customers or leads, you need a CRM. If you are forgetting to follow up, you need a CRM. If more than one person talks to customers, you need a CRM.</p>

<div class="blog-cta">
<h3>Need a Custom CRM Solution?</h3>
<p>We build custom web apps tailored to your exact business process.</p>
<a onclick="showView('services')" class="btn-cta">Explore Custom Solutions</a>
</div>
        `
    },
    {
        id: 30,
        slug: 'email-branding-how-it-works',
        title: 'How Email Branding Works: Make Every Email Represent Your Business',
        excerpt: 'Your emails are brand touchpoints. Here is how to brand your email signatures, templates, and newsletters for professional impact.',
        category: 'Branding',
        image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'July 8, 2025',
        readTime: '7 min read',
        content: `
<p class="blog-lead">Your team sends hundreds of emails per week. Every single one is a brand impression. Here is how to make sure those impressions are working for you.</p>

<h2>The Three Layers of Email Branding</h2>

<h3>1. Professional Email Address</h3>
<p>yourname@gmail.com says amateur. yourname@yourbusiness.com says professional. Custom domain email is non-negotiable for any serious business.</p>
<p>Options: Google Workspace, Microsoft 365, Zoho Mail</p>

<h3>2. Email Signature</h3>
<p>Your signature appears on every email. It should include:</p>
<ul>
<li>Your name and title</li>
<li>Company name and logo</li>
<li>Phone number</li>
<li>Website link</li>
<li>Social media icons (optional)</li>
<li>Call-to-action or tagline (optional)</li>
</ul>
<p>Keep it clean. Avoid quotes, too many colors, or massive images.</p>

<h3>3. Email Templates</h3>
<p>For newsletters, promotions, and announcements, branded templates create consistency. Your colors, fonts, and logo should be instantly recognizable.</p>

<h2>Email Signature Best Practices</h2>
<ul>
<li><strong>Keep it under 6 lines:</strong> Nobody reads a novel</li>
<li><strong>Use your brand colors:</strong> Sparingly, for links or accents</li>
<li><strong>Logo size:</strong> Keep it small (100-150px wide max)</li>
<li><strong>Mobile-friendly:</strong> Test how it looks on phones</li>
<li><strong>Consistent across team:</strong> Everyone should match</li>
</ul>

<h2>Newsletter Branding Elements</h2>
<ul>
<li><strong>Header:</strong> Logo and brand colors</li>
<li><strong>Typography:</strong> Web-safe fonts that match your brand</li>
<li><strong>Button styles:</strong> Consistent with your website</li>
<li><strong>Footer:</strong> Contact info, social links, unsubscribe</li>
<li><strong>Image style:</strong> Consistent editing and treatment</li>
</ul>

<h2>Tools for Email Branding</h2>
<ul>
<li><strong>Signatures:</strong> WiseStamp, HubSpot, Canva</li>
<li><strong>Newsletters:</strong> Mailchimp, ConvertKit, Klaviyo</li>
<li><strong>Templates:</strong> Stripo, Bee Free, Litmus</li>
</ul>

<div class="blog-cta">
<h3>Need Professional Email Templates?</h3>
<p>We design branded email signatures and newsletter templates.</p>
<a onclick="showView('services')" class="btn-cta">Get Email Branding</a>
</div>
        `
    },
    {
        id: 31,
        slug: 'how-to-send-email-blast-eblast-guide',
        title: 'How to Send an Email Blast: The Complete E-Blast Guide for Small Business',
        excerpt: 'Email blasts still work when done right. Here is how to send e-blasts that get opened, read, and drive action.',
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'July 1, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">An email blast (or e-blast) is a single email sent to your entire list at once. Done right, it is one of the highest-ROI marketing activities. Done wrong, it lands in spam. Here is how to do it right.</p>

<h2>What Is an Email Blast?</h2>
<p>An email blast is a one-time email sent to many recipients simultaneously. Unlike automated sequences that trigger based on behavior, an e-blast is a broadcast — same message, same time, to everyone (or a segment).</p>

<p>Common uses:</p>
<ul>
<li>Product launches</li>
<li>Sale announcements</li>
<li>Event invitations</li>
<li>Company news</li>
<li>Newsletter editions</li>
</ul>

<h2>Step-by-Step: Sending Your First E-Blast</h2>

<h3>Step 1: Choose Your Platform</h3>
<p>You cannot send mass emails from Gmail — you will get flagged as spam. Use an email marketing platform:</p>
<ul>
<li><strong>Mailchimp:</strong> Free up to 500 contacts</li>
<li><strong>ConvertKit:</strong> Great for creators</li>
<li><strong>Constant Contact:</strong> Small business friendly</li>
<li><strong>Klaviyo:</strong> E-commerce focused</li>
<li><strong>Brevo (Sendinblue):</strong> Affordable high volume</li>
</ul>

<h3>Step 2: Build Your List</h3>
<p>Import your contacts. Make sure you have permission to email them (they opted in). Buying email lists is illegal in many places and destroys deliverability.</p>

<h3>Step 3: Segment If Needed</h3>
<p>Not every email should go to everyone. Segment by customer type, location, purchase history, or engagement level.</p>

<h3>Step 4: Write Your Email</h3>
<ul>
<li><strong>Subject line:</strong> 40 characters or less, creates curiosity</li>
<li><strong>Preview text:</strong> Supports the subject line</li>
<li><strong>Body:</strong> One clear message, one clear CTA</li>
<li><strong>Design:</strong> Use your branded template</li>
</ul>

<h3>Step 5: Test Before Sending</h3>
<p>Send a test to yourself. Check on desktop AND mobile. Click every link.</p>

<h3>Step 6: Schedule and Send</h3>
<p>Best times vary, but Tuesday-Thursday between 10am-2pm tends to perform well. Test and track your own data.</p>

<h2>E-Blast Mistakes to Avoid</h2>
<ul>
<li>No clear call-to-action</li>
<li>Too many topics in one email</li>
<li>Sending from no-reply@ addresses</li>
<li>Forgetting mobile optimization</li>
<li>Not cleaning your list regularly</li>
</ul>

<div class="blog-cta">
<h3>Need E-Blast Templates That Convert?</h3>
<p>We design branded email templates that get results.</p>
<a onclick="showView('services')" class="btn-cta">Get Email Templates</a>
</div>
        `
    },
    {
        id: 32,
        slug: 'how-to-get-more-dms-direct-messages',
        title: 'How to Get More DMs: Turn Your Social Media Into a Lead Machine',
        excerpt: 'DMs are where deals happen. Here is how to create content that makes people want to message you — and start real conversations.',
        category: 'Social Media',
        image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'June 24, 2025',
        readTime: '9 min read',
        content: `
<p class="blog-lead">Likes are vanity. DMs are money. The businesses winning on social media are the ones turning followers into conversations. Here is exactly how to get more direct messages.</p>

<h2>Why DMs Matter More Than Followers</h2>
<p>A DM is intent. Someone took time to privately reach out. That is a warm lead. 10 DMs from qualified prospects beats 10,000 passive followers every time.</p>

<h2>Content That Generates DMs</h2>

<h3>1. "DM Me" Call-to-Actions</h3>
<p>Literally ask. "DM me 'GUIDE' and I will send you my free checklist." "Have questions? DM me, I respond to everyone." Direct asks work.</p>

<h3>2. Controversial Takes</h3>
<p>Strong opinions attract people who agree (and disagree). They will DM to share their thoughts. Safe, boring content generates nothing.</p>

<h3>3. Behind-the-Scenes Content</h3>
<p>Show your process. People are curious. They will DM asking questions about how you do what you do.</p>

<h3>4. Results and Case Studies</h3>
<p>"Just helped a client 3x their revenue." People who want similar results will reach out.</p>

<h3>5. Relatable Struggles</h3>
<p>Share your challenges. Vulnerability creates connection. People DM to say "me too."</p>

<h2>Optimize Your Profile for DMs</h2>
<ul>
<li><strong>Bio:</strong> Clear statement of who you help and how</li>
<li><strong>CTA in bio:</strong> "DM me to get started"</li>
<li><strong>Highlights:</strong> Testimonials, services, FAQ</li>
<li><strong>Link:</strong> Booking page or lead magnet</li>
</ul>

<h2>The DM Conversation Framework</h2>
<ol>
<li><strong>Acknowledge:</strong> Thank them for reaching out</li>
<li><strong>Qualify:</strong> Ask about their situation</li>
<li><strong>Provide value:</strong> Give a quick win or insight</li>
<li><strong>Transition:</strong> Offer a call or next step</li>
</ol>

<h2>Use Stories to Drive DMs</h2>
<p>Instagram Stories with polls, questions, and sliders create interaction. Reply to every response — this opens a DM thread. Now you are in conversation.</p>

<div class="blog-cta">
<h3>Need a Social Media Strategy?</h3>
<p>We create content systems designed to generate leads.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Social Strategy</a>
</div>
        `
    },
    {
        id: 33,
        slug: 'how-to-get-more-engagement-social-media',
        title: 'How to Get More Engagement on Social Media (Without Begging for Likes)',
        excerpt: 'Engagement is not about luck — it is about strategy. Here are the proven tactics that make people comment, share, and save your content.',
        category: 'Social Media',
        image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'June 17, 2025',
        readTime: '10 min read',
        content: `
<p class="blog-lead">"Like if you agree!" is not a strategy. Real engagement comes from content that triggers emotional and intellectual responses. Here is how to create posts people actually interact with.</p>

<h2>Why Engagement Matters</h2>
<p>The algorithm rewards engagement. Posts with comments, shares, and saves get shown to more people. Low engagement = the algorithm buries your content. It is a flywheel — engagement creates more reach, which creates more engagement.</p>

<h2>The Engagement Hierarchy</h2>
<p>Not all engagement is equal. From most to least valuable:</p>
<ol>
<li><strong>Saves:</strong> Highest signal — people want to return to this</li>
<li><strong>Shares:</strong> They are putting their reputation on it</li>
<li><strong>Comments:</strong> They took time to respond</li>
<li><strong>Likes:</strong> Lowest effort, but still counts</li>
</ol>

<h2>Content Types That Drive Engagement</h2>

<h3>1. Ask Questions</h3>
<p>End posts with a genuine question. Not "thoughts?" — that is lazy. Specific questions: "What is the biggest challenge you are facing with X right now?"</p>

<h3>2. Hot Takes and Opinions</h3>
<p>"Unpopular opinion: [your take]." Strong positions polarize — and polarization drives engagement. Agreers and disagreers both comment.</p>

<h3>3. Educational Carousels</h3>
<p>Multi-slide posts with valuable information get saved. "5 mistakes killing your [X]" — people save these to reference later.</p>

<h3>4. Story-Driven Content</h3>
<p>Personal stories create emotional connection. Vulnerability, failures, and comebacks resonate more than polished success.</p>

<h3>5. Fill-in-the-Blank</h3>
<p>"The best business advice I ever got was ______." Easy for people to respond to.</p>

<h2>Engagement Tactics That Work</h2>
<ul>
<li><strong>Reply to every comment:</strong> Doubles your comment count and builds relationships</li>
<li><strong>Engage before posting:</strong> 15 minutes of commenting on others' posts primes the algorithm</li>
<li><strong>Post when your audience is online:</strong> Check your analytics</li>
<li><strong>Use all features:</strong> Reels, Stories, carousels — platforms reward users who use new features</li>
<li><strong>Create "saveable" content:</strong> Checklists, frameworks, templates</li>
</ul>

<h2>What Kills Engagement</h2>
<ul>
<li>Posting links (platforms hate sending people away)</li>
<li>Stock photos and generic graphics</li>
<li>Pure self-promotion with no value</li>
<li>Inconsistent posting (algorithm forgets you)</li>
<li>Ignoring comments and DMs</li>
</ul>

<div class="blog-cta">
<h3>Need Content That Engages?</h3>
<p>We create social media templates and strategies that drive real interaction.</p>
<a onclick="showView('services')" class="btn-cta">Boost Your Engagement</a>
</div>
        `
    },
    {
        id: 34,
        slug: 'businesses-leaving-social-media-traditional-marketing',
        title: 'Why Smart Businesses Are Leaving Social Media and Going Back to Cold Calls and Mailers',
        excerpt: 'The social media backlash is real. Here is why some businesses are ditching the algorithm and returning to direct mail, cold calling, and old-school marketing.',
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80',
        author: 'Faren Young',
        authorImage: 'icons/icon-192.png',
        date: 'June 10, 2025',
        readTime: '11 min read',
        content: `
<p class="blog-lead">Something interesting is happening. While everyone obsesses over Instagram algorithms and TikTok trends, a growing number of successful businesses are quietly going back to basics: cold calls, direct mail, and face-to-face networking. Here is why — and what it means for your marketing strategy.</p>

<h2>The Social Media Exhaustion Is Real</h2>
<p>Business owners are burned out. The constant content treadmill. The algorithm changes. The pay-to-play model where organic reach keeps dying. Many are asking: "Is this actually working, or am I just busy?"</p>

<p>The numbers tell the story:</p>
<ul>
<li>Facebook organic reach: down to 2-5% of followers</li>
<li>Instagram engagement rates: dropped 30% since 2020</li>
<li>Time spent creating content: 10-20 hours per week for most businesses</li>
<li>Actual ROI: often unmeasurable or disappointing</li>
</ul>

<h2>Why Traditional Marketing Is Making a Comeback</h2>

<h3>1. Less Competition in the Mailbox</h3>
<p>Everyone went digital. That means physical mailboxes are less crowded than they have been in decades. A well-designed direct mail piece stands out because nobody else is doing it.</p>
<p>Direct mail response rates are now 5-9% compared to email's 1%. That is not a typo.</p>

<h3>2. Cold Calling Actually Works (When Done Right)</h3>
<p>The phone still works. Decision makers answer calls. While everyone is hiding behind DMs and emails, the salesperson who picks up the phone gets through. Less competition = more opportunity.</p>

<h3>3. You Own the Relationship</h3>
<p>Social media followers are rented. The platform can change the rules, ban your account, or die (remember Vine?). A phone number, email address, or mailing address is YOURS. Nobody can algorithm that away.</p>

<h3>4. Higher Quality Conversations</h3>
<p>A phone call or in-person meeting builds more trust in 15 minutes than 6 months of social media content. Real conversation beats parasocial relationships.</p>

<h3>5. Measurable ROI</h3>
<p>You sent 500 mailers. 25 people called. 5 became customers worth $10,000 each. That is clear math. Social media? "We got 50,000 impressions" means nothing to your bank account.</p>

<h2>What Traditional Marketing Looks Like in 2026</h2>

<h3>Direct Mail (Done Right)</h3>
<ul>
<li><strong>Handwritten envelopes:</strong> 99% open rate</li>
<li><strong>Dimensional mailers:</strong> Boxes and tubes get opened</li>
<li><strong>Personalization:</strong> Variable data printing makes each piece unique</li>
<li><strong>Follow-up sequences:</strong> Multiple touches, not one-and-done</li>
</ul>

<h3>Cold Calling (The Modern Way)</h3>
<ul>
<li><strong>Research first:</strong> Know who you are calling and why</li>
<li><strong>Value-first approach:</strong> Lead with insight, not a pitch</li>
<li><strong>Multi-channel:</strong> Call + email + LinkedIn touch</li>
<li><strong>Persistence:</strong> Average sale takes 8 touches</li>
</ul>

<h3>Networking and Events</h3>
<ul>
<li><strong>Industry conferences:</strong> One conversation can be worth 1,000 followers</li>
<li><strong>Local business groups:</strong> BNI, Chamber of Commerce, meetups</li>
<li><strong>Hosting your own events:</strong> Workshops, lunch-and-learns</li>
</ul>

<h2>The Hybrid Approach: Best of Both Worlds</h2>
<p>The smartest businesses are not abandoning social media entirely — they are rebalancing. Social media for awareness and credibility. Traditional methods for conversion and relationship-building.</p>

<p>A balanced marketing mix might look like:</p>
<ul>
<li>30% social media (brand awareness, content)</li>
<li>25% email marketing (nurturing, offers)</li>
<li>20% direct outreach (cold calls, LinkedIn DMs)</li>
<li>15% direct mail (high-value prospects)</li>
<li>10% networking/events (relationship building)</li>
</ul>

<h2>When to Consider Going Traditional</h2>
<ul>
<li>Your target customer is over 40</li>
<li>You sell high-ticket B2B services</li>
<li>Your local market matters more than national reach</li>
<li>You are exhausted by the content hamster wheel</li>
<li>Your social media ROI is unclear or negative</li>
</ul>

<h2>Your Brand Still Matters (Maybe More)</h2>
<p>Here is the thing: traditional marketing requires even better branding. Your direct mail piece has 3 seconds to make an impression. Your cold call opener needs instant credibility. Your business card gets judged immediately.</p>

<p>Going old-school does not mean looking old-school. Premium brand identity makes every traditional touchpoint more effective.</p>

<div class="blog-cta">
<h3>Need Branding That Works Everywhere?</h3>
<p>We create brand systems designed for both digital and traditional marketing.</p>
<a onclick="showView('services')" class="btn-cta">Build Your Brand System</a>
</div>
        `
    }
];

let currentBlogPost = null;
let blogAuthorImage = localStorage.getItem('nui_blog_author_image') || '';

function saveBlogPosts() { localStorage.setItem('nui_blog_posts', JSON.stringify(blogPosts)); }

function loadAdminBlogPanel() {
    document.getElementById('adminBlogPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📝 Blog Manager</h2>
<p class="panel-subtitle">Create, edit, and manage your blog posts</p>
</div>

        <!-- Author / Blog Logo -->
<div style="background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px;">
<div id="blogAuthorPreview" style="width: 64px; height: 64px; border-radius: 50%; background: var(--red); display: flex; align-items: center; justify-content: center; overflow: hidden; color: #fff; font-weight: 700; font-size: 24px; flex-shrink: 0; cursor: pointer;" onclick="document.getElementById('blogAuthorUpload').click()" title="Click to upload blog logo/icon">
                ${blogAuthorImage ? '<img alt="Blog author photo" loading="lazy" src="' + blogAuthorImage + '" class="img-cover">' : 'F'}
</div>
<div class="flex-1">
<div style="font-weight: 600; color: #fff; margin-bottom: 4px;">Blog Author Image / Logo</div>
<div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Click the circle to upload. Used on all blog posts as the author avatar.</div>
<input type="file" id="blogAuthorUpload" accept="image/*" class="hidden" onchange="handleBlogAuthorUpload(event)">
<div class="flex-gap-8">
<button onclick="document.getElementById('blogAuthorUpload').click()" class="btn-admin" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; font-size: 12px;">📷 Upload Image</button>
<input type="text" id="blogAuthorUrlInput" placeholder="Or paste image URL..." value="${blogAuthorImage}" onchange="setBlogAuthorFromUrl(this.value)" style="flex: 1; padding: 8px 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 12px;">
</div>
</div>
</div>

        <!-- Blog Posts List -->
<div class="admin-row-between">
<h3 class="text-white">${blogPosts.length} Posts</h3>
<button onclick="showBlogEditor()" class="btn-admin primary">+ New Post</button>
</div>

<div class="flex-col-gap-12">
            ${blogPosts.map((post, i) => `
<div style="background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center;">
<div style="width: 80px; height: 50px; border-radius: 8px; overflow: hidden; background: #1a1a1a; flex-shrink: 0;">
                        ${post.image ? '<img alt="Blog post featured image" loading="lazy" src="' + post.image + '" class="img-cover" onerror="this.style.display=\'none\'">' : ''}
</div>
<div style="flex: 1; min-width: 0;">
<div style="font-weight: 600; color: #fff; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.title}</div>
<div style="display: flex; gap: 8px; align-items: center;">
<span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(230,57,70,0.2); color: #e63946;">${post.category}</span>
<span style="font-size: 12px; color: rgba(255,255,255,0.4);">${post.date}</span>
<span style="font-size: 12px; color: rgba(255,255,255,0.4);">${post.readTime}</span>
</div>
</div>
<div style="display: flex; gap: 8px; flex-shrink: 0;">
<button onclick="showBlogEditor(${post.id})" style="padding: 8px 12px; background: #3b82f6; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px;">✏️ Edit</button>
<button onclick="deleteBlogPost(${post.id})" style="padding: 8px 12px; background: rgba(239,68,68,0.2); border: none; color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️</button>
</div>
</div>
            `).join('')}
</div>
    `;
}

function handleBlogAuthorUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        blogAuthorImage = e.target.result;
        localStorage.setItem('nui_blog_author_image', blogAuthorImage);
        // Update all posts
        blogPosts.forEach(p => p.authorImage = blogAuthorImage);
        saveBlogPosts();
        loadAdminBlogPanel();
    };
    reader.readAsDataURL(file);
}

function setBlogAuthorFromUrl(url) {
    if (!url) return;
    blogAuthorImage = url;
    localStorage.setItem('nui_blog_author_image', blogAuthorImage);
    blogPosts.forEach(p => p.authorImage = blogAuthorImage);
    saveBlogPosts();
    loadAdminBlogPanel();
}

function showBlogEditor(postId) {
    const post = postId ? blogPosts.find(p => p.id === postId) : null;
    const isNew = !post;

    const modal = document.createElement('div');
    modal.id = 'blogEditorModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #111; border-radius: 16px; padding: 32px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
<h2 style="font-size: 20px; margin-bottom: 24px; color: #fff;">${isNew ? '📝 New Blog Post' : '✏️ Edit Post'}</h2>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
<div>
<label class="pkg-feature-label">Title</label>
<input type="text" id="blogEditTitle" value="${post?.title || ''}" placeholder="Post title..." style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
</div>
<div>
<label class="pkg-feature-label">Category</label>
<select id="blogEditCategory" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
                            ${['Branding', 'Business Strategy', 'Personal Branding', 'Sales Strategy', 'Brand Strategy', 'Web Design', 'Technology', 'Social Media', 'Marketing'].map(c => '<option value="' + c + '"' + (post?.category === c ? ' selected' : '') + '>' + c + '</option>').join('')}
</select>
</div>
</div>

<div class="mb-16">
<label class="pkg-feature-label">Featured Image URL</label>
<input type="text" id="blogEditImage" value="${post?.image || ''}" placeholder="https://images.unsplash.com/..." style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
</div>

<div class="mb-16">
<label class="pkg-feature-label">Excerpt (short preview)</label>
<textarea id="blogEditExcerpt" rows="2" placeholder="Brief description..." style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; resize: none;">${post?.excerpt || ''}</textarea>
</div>

<div class="mb-16">
<label class="pkg-feature-label">Content (HTML supported)</label>
<textarea id="blogEditContent" rows="12" placeholder="<p>Write your blog post content here...</p>&#10;<h2>Section Header</h2>&#10;<p>More content...</p>" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; resize: vertical; font-family: monospace; font-size: 13px;">${post?.content?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''}</textarea>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
<div>
<label class="pkg-feature-label">Author</label>
<input type="text" id="blogEditAuthor" value="${post?.author || 'Faren Young'}" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
</div>
<div>
<label class="pkg-feature-label">Read Time</label>
<input type="text" id="blogEditReadTime" value="${post?.readTime || '5 min read'}" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
</div>
</div>

<div class="flex-gap-12">
<button onclick="document.getElementById('blogEditorModal').remove()" style="flex: 1; padding: 14px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer;">Cancel</button>
<button onclick="saveBlogPost(${post?.id || 'null'})" style="flex: 1; padding: 14px; background: var(--red); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">${isNew ? 'Publish Post' : 'Save Changes'}</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveBlogPost(existingId) {
    const title = document.getElementById('blogEditTitle').value.trim();
    const category = document.getElementById('blogEditCategory').value;
    const image = document.getElementById('blogEditImage').value.trim();
    const excerpt = document.getElementById('blogEditExcerpt').value.trim();
    const content = document.getElementById('blogEditContent').value;
    const author = document.getElementById('blogEditAuthor').value.trim();
    const readTime = document.getElementById('blogEditReadTime').value.trim();

    if (!title) { alert('Please enter a title.'); return; }
    if (!content) { alert('Please enter content.'); return; }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (existingId) {
        const post = blogPosts.find(p => p.id === existingId);
        if (post) {
            post.title = title;
            post.slug = slug;
            post.category = category;
            post.image = image;
            post.excerpt = excerpt;
            post.content = content;
            post.author = author;
            post.authorImage = blogAuthorImage || post.authorImage;
            post.readTime = readTime;
        }
    } else {
        const newId = blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.id)) + 1 : 1;
        blogPosts.unshift({
            id: newId,
            slug: slug,
            title: title,
            excerpt: excerpt,
            category: category,
            image: image,
            author: author,
            authorImage: blogAuthorImage || '',
            date: dateStr,
            readTime: readTime,
            content: content
        });
    }

    saveBlogPosts();
    document.getElementById('blogEditorModal').remove();
    loadAdminBlogPanel();
    alert(existingId ? '✅ Post updated!' : '✅ Post published!');
}

function deleteBlogPost(postId) {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    blogPosts = blogPosts.filter(p => p.id !== postId);
    saveBlogPosts();
    loadAdminBlogPanel();
}

function loadBlogView() {
    document.getElementById('blogView').innerHTML = `
<style>
            .blog-hero { padding: 140px 48px 80px; text-align: center; background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%); position: relative; }
            .blog-hero::before { content: ''; position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80') center/cover; opacity: 0.15; }
            .blog-hero-content { position: relative; z-index: 2; }
            .blog-hero h1 { font-size: clamp(48px, 8vw, 80px); font-weight: 900; text-transform: uppercase; margin-bottom: 16px; }
            .blog-hero h1 span { color: var(--red); }
            .blog-hero p { font-size: 18px; color: var(--gray); max-width: 600px; margin: 0 auto; }

            .blog-categories { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; padding: 32px 24px; background: #080808; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .blog-category { padding: 10px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .blog-category:hover, .blog-category.active { background: var(--red); border-color: var(--red); color: white; }

            .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1400px; margin: 0 auto; padding: 60px 48px; }
            .blog-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; transition: all 0.3s; cursor: pointer; }
            .blog-card:hover { transform: translateY(-8px); border-color: rgba(255,59,48,0.3); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
            .blog-card-image { position: relative; aspect-ratio: 16/9; overflow: hidden; }
            .blog-card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
            .blog-card:hover .blog-card-image img { transform: scale(1.05); }
            .blog-card-image::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%); }
            .blog-card-category { position: absolute; top: 16px; left: 16px; background: var(--red); color: white; padding: 6px 14px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; z-index: 2; }
            .blog-card-content { padding: 28px; }
            .blog-card-title { font-size: 20px; font-weight: 800; line-height: 1.3; margin-bottom: 12px; color: #fff; }
            .blog-card-excerpt { font-size: 14px; color: var(--gray); line-height: 1.6; margin-bottom: 20px; }
            .blog-card-meta { display: flex; align-items: center; gap: 12px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }
            .blog-card-author-img { width: 36px; height: 36px; border-radius: 50%; background: var(--red); display: flex; align-items: center; justify-content: center; overflow: hidden; color: #fff; font-weight: 700; font-size: 14px; }
            .blog-card-author-img img { width: 100%; height: 100%; object-fit: cover; }
            .blog-card-author-img img[src=''], .blog-card-author-img img:not([src]) { display: none; }
            .blog-card-author-name { font-size: 13px; font-weight: 600; color: #fff; }
            .blog-card-date { font-size: 12px; color: var(--gray); }
            .blog-card-read { font-size: 12px; color: var(--red); margin-left: auto; font-weight: 600; }

            /* SINGLE POST */
            .blog-post { max-width: 800px; margin: 0 auto; padding: 140px 24px 80px; }
            .blog-post-back { display: inline-flex; align-items: center; gap: 8px; color: var(--gray); font-size: 14px; margin-bottom: 32px; cursor: pointer; transition: color 0.3s; }
            .blog-post-back:hover { color: var(--red); }
            .blog-post-category { display: inline-block; background: var(--red); color: white; padding: 8px 16px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .blog-post-title { font-size: clamp(32px, 5vw, 48px); font-weight: 900; line-height: 1.2; margin-bottom: 24px; }
            .blog-post-meta { display: flex; align-items: center; gap: 20px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 40px; flex-wrap: wrap; }
            .blog-post-author { display: flex; align-items: center; gap: 12px; }
            .blog-post-author-img { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid var(--red); }
            .blog-post-author-img img { width: 100%; height: 100%; object-fit: cover; }
            .blog-post-author-name { font-weight: 700; color: #fff; }
            .blog-post-author-title { font-size: 13px; color: var(--gray); }
            .blog-post-date { color: var(--gray); font-size: 14px; }
            .blog-post-read { color: var(--red); font-size: 14px; font-weight: 600; }

            .blog-post-image { width: 100%; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden; margin-bottom: 48px; position: relative; }
            .blog-post-image img { width: 100%; height: 100%; object-fit: cover; }
            .blog-post-image::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,59,48,0.2) 0%, transparent 100%); }

            .blog-post-content { font-size: 17px; line-height: 1.9; color: rgba(255,255,255,0.85); }
            .blog-post-content h2 { font-size: 28px; font-weight: 800; color: #fff; margin: 48px 0 20px; }
            .blog-post-content p { margin-bottom: 24px; }
            .blog-post-content .blog-lead { font-size: 20px; color: #fff; line-height: 1.7; margin-bottom: 32px; }
            .blog-post-content ul { margin: 24px 0; padding-left: 24px; }
            .blog-post-content li { margin-bottom: 12px; color: rgba(255,255,255,0.8); }
            .blog-post-content strong { color: #fff; }

            .blog-cta { background: linear-gradient(135deg, rgba(255,59,48,0.15) 0%, rgba(255,59,48,0.05) 100%); border: 1px solid rgba(255,59,48,0.2); border-radius: 16px; padding: 40px; text-align: center; margin: 48px 0; }
            .blog-cta h3 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
            .blog-cta p { color: var(--gray); margin-bottom: 24px; }
            .blog-cta .btn-cta { display: inline-block; }

            /* SHARE */
            .blog-share { display: flex; align-items: center; gap: 16px; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 48px; }
            .blog-share-label { font-size: 14px; font-weight: 600; color: var(--gray); }
            .blog-share-buttons { display: flex; gap: 12px; }
            .blog-share-btn { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; cursor: pointer; transition: all 0.3s; text-decoration: none; }
            .blog-share-btn:hover { background: var(--red); border-color: var(--red); transform: scale(1.1); }

            @media (max-width: 968px) {
                .blog-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 40px 24px; }
            }
            @media (max-width: 600px) {
                .blog-hero { padding: 120px 24px 60px; }
                .blog-hero h1 { font-size: 36px; }
                .blog-grid { grid-template-columns: 1fr; gap: 20px; padding: 32px 16px; }
                .blog-card-content { padding: 20px; }
                .blog-card-title { font-size: 18px; }
                .blog-post { padding: 120px 16px 60px; }
                .blog-post-title { font-size: 28px; }
                .blog-post-content { font-size: 15px; }
                .blog-post-content h2 { font-size: 22px; }
                .blog-categories { padding: 20px 16px; gap: 8px; }
                .blog-category { padding: 8px 16px; font-size: 11px; }
            }
</style>

<div id="blogList">
<section class="blog-hero">
<div class="blog-hero-content">
<h2>THE <span>INFLUENCE</span> BLOG</h2>
<p>Insights, strategies, and real talk about building brands that dominate. No fluff, just actionable advice.</p>
</div>
</section>

<div class="blog-categories">
<button class="blog-category active" onclick="filterBlogPosts('all')">All Posts</button>
<button class="blog-category" onclick="filterBlogPosts('Branding')">Branding</button>
<button class="blog-category" onclick="filterBlogPosts('Personal Branding')">Personal Branding</button>
<button class="blog-category" onclick="filterBlogPosts('Sales Strategy')">Sales</button>
<button class="blog-category" onclick="filterBlogPosts('Business Strategy')">Business Strategy</button>
<button class="blog-category" onclick="filterBlogPosts('Brand Strategy')">Brand Strategy</button>
<button class="blog-category" onclick="filterBlogPosts('Web Design')">Web Design</button>
<button class="blog-category" onclick="filterBlogPosts('Technology')">Technology</button>
<button class="blog-category" onclick="filterBlogPosts('Social Media')">Social Media</button>
<button class="blog-category" onclick="filterBlogPosts('Marketing')">Marketing</button>
</div>

<div class="blog-grid" id="blogGrid">
                ${blogPosts.map(post => `
<article class="blog-card" data-category="${post.category}" onclick="showBlogPost(${post.id})">
<div class="blog-card-image">
<img loading="lazy" src="${post.image}" alt="${post.title}">
<span class="blog-card-category">${post.category}</span>
</div>
<div class="blog-card-content">
<h3 class="blog-card-title">${post.title}</h3>
<p class="blog-card-excerpt">${post.excerpt}</p>
<div class="blog-card-meta">
<div class="blog-card-author-img">${post.authorImage ? '<img loading="lazy" src="' + post.authorImage + '" alt="' + post.author + '" onerror="this.style.display=\'none\';this.parentElement.textContent=\'' + (post.author || 'N').charAt(0) + '\'">' : (post.author || 'N').charAt(0)}</div>
<div>
<div class="blog-card-author-name">${post.author}</div>
<div class="blog-card-date">${post.date}</div>
</div>
<span class="blog-card-read">${post.readTime}</span>
</div>
</div>
</article>
                `).join('')}
</div>
</div>

<div id="blogSingle" class="hidden"></div>

        ${getFooterHTML()}
    `;
}

function filterBlogPosts(category) {
    document.querySelectorAll('.blog-category').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(category) || (category === 'all' && btn.textContent === 'All Posts'));
    });

    document.querySelectorAll('.blog-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    currentBlogPost = post;
    document.getElementById('blogList').style.display = 'none';
    document.getElementById('blogSingle').style.display = 'block';

    const shareUrl = encodeURIComponent('https://newurbaninfluence.com/blog/' + post.slug);
    const shareText = encodeURIComponent(post.title + ' - New Urban Influence');

    document.getElementById('blogSingle').innerHTML = `
<article class="blog-post">
<a class="blog-post-back" onclick="closeBlogPost()">← Back to Blog</a>
<span class="blog-post-category">${post.category}</span>
<h2 class="blog-post-title">${post.title}</h2>
<div class="blog-post-meta">
<div class="blog-post-author">
<div class="blog-post-author-img" style="${!post.authorImage ? 'background: var(--red); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px;' : ''}">${post.authorImage ? '<img loading="lazy" src="' + post.authorImage + '" alt="' + post.author + '" onerror="this.style.display=\'none\';this.parentElement.style.background=\'var(--red)\';this.parentElement.style.display=\'flex\';this.parentElement.style.alignItems=\'center\';this.parentElement.style.justifyContent=\'center\';this.parentElement.style.color=\'#fff\';this.parentElement.style.fontWeight=\'700\';this.parentElement.style.fontSize=\'20px\';this.parentElement.textContent=\'' + (post.author || 'N').charAt(0) + '\'">' : (post.author || 'N').charAt(0)}</div>
<div>
<div class="blog-post-author-name">${post.author}</div>
<div class="blog-post-author-title">Founder, New Urban Influence</div>
</div>
</div>
<span class="blog-post-date">${post.date}</span>
<span class="blog-post-read">${post.readTime}</span>
</div>
            ${post.image ? '<div class="blog-post-image"><img loading="lazy" src="' + post.image + '" alt="' + post.title + '" onerror="this.parentElement.style.display=\'none\'"></div>' : ''}
<div class="blog-post-content">
                ${post.content}
</div>
<div class="blog-share">
<span class="blog-share-label">Share this article:</span>
<div class="blog-share-buttons">
<a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" class="blog-share-btn" title="Share on X/Twitter">𝕏</a>
<a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" class="blog-share-btn" title="Share on Facebook">f</a>
<a href="https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}" target="_blank" class="blog-share-btn" title="Share on LinkedIn">in</a>
<a href="mailto:?subject=${shareText}&body=Check out this article: ${shareUrl}" class="blog-share-btn" title="Share via Email">✉</a>
</div>
</div>
</article>
        ${getFooterHTML()}
    `;

    window.scrollTo(0, 0);
}

function closeBlogPost() {
    document.getElementById('blogList').style.display = 'block';
    document.getElementById('blogSingle').style.display = 'none';
    currentBlogPost = null;
    window.scrollTo(0, 0);
}

// ==================== PORTAL VIEW ====================
