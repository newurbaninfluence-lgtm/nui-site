#!/usr/bin/env python3
"""Builds /locations/<city>.html from cities.json.

Each city page keeps its address and gets its own local write-up, leaks, industries
and questions. Run from the repo root:  python3 scripts/city-pages/build.py
Styles: /assets/css/site.css (body.nh-page). Nav menu: /assets/js/site-nav.js.
"""
import html, json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
CITIES = json.load(open(os.path.join(HERE, 'cities.json')))
GEO = json.load(open(os.path.join(HERE, 'geo.json')))
SITE = 'https://newurbaninfluence.com'
V = '20261124v2'

ICONS = {
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'message': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'layout': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    'glass': '<path d="M8 22h8M12 15v7M7 3h10l-1 7a4 4 0 0 1-8 0z"/>',
    'scissors': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    'cake': '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3"/>',
    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'pulse': '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    'store': '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    'truck': '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
    'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    'star': '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
}

def ico(name):
    return f'<i class="nh-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[name]}</svg></i>'

e = html.escape

NAV = open(os.path.join(HERE, 'nav.html')).read()
FOOT = open(os.path.join(HERE, 'footer.html')).read()

def miles(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (float(a['lat']), float(a['lng']), float(b['lat']), float(b['lng'])))
    d = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 3959 * 2 * math.asin(math.sqrt(d))

def nearby(slug, n=4):
    others = sorted((miles(GEO[slug], GEO[o]), o) for o in CITIES if o != slug)
    return [o for _, o in others[:n]]

def page(slug, c):
    name, near = c['name'], nearby(slug)
    url = f'{SITE}/locations/{slug}'
    title = f'{name} MI Websites & Business Software | NUI'
    desc = f'Websites and business software for {name}, MI businesses. We find where money is leaking and fix it. Free 30-minute audit.'
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in c['faq']]}
    biz_ld = {"@context": "https://schema.org", "@type": "ProfessionalService",
              "name": f"New Urban Influence, websites and business software in {name}",
              "description": desc, "url": url, "telephone": "(248) 487-8747", "email": "info@newurbaninfluence.com",
              "address": {"@type": "PostalAddress", "addressLocality": "Detroit", "addressRegion": "MI", "addressCountry": "US"},
              "areaServed": [{"@type": "City", "name": name}] + [{"@type": "City", "name": CITIES[o]['name']} for o in near],
              "geo": {"@type": "GeoCoordinates", "latitude": GEO[slug]['lat'], "longitude": GEO[slug]['lng']}}
    crumb_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": "Locations", "item": f"{SITE}/locations/detroit"},
        {"@type": "ListItem", "position": 3, "name": name, "item": url}]}
    ld = lambda o: '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False) + '</script>'

    leaks = ''.join(f'<div class="nh-card">{ico(i)}<h3>{e(t)}</h3><p>{e(d)}</p></div>' for i, t, d in c['leaks'])
    who = ''.join(f'<div class="nh-card">{ico(i)}<h3>{e(t)}</h3><p>{e(d)}</p></div>' for i, t, d in c['who'])
    faq = ''.join(f'<details class="nh-faq"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in c['faq'])
    local = ''.join(f'<p class="section-text">{e(p)}</p>' for p in c['local'])
    near_links = ''.join(f'<a href="/locations/{o}">{CITIES[o]["name"]}, MI</a>' for o in near)

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="author" content="New Urban Influence">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="Websites &amp; Business Software in {e(name)}, MI | New Urban Influence">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE}/og-image.jpg">
<meta property="og:site_name" content="New Urban Influence">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Websites &amp; Business Software in {e(name)}, MI | New Urban Influence">
<meta name="twitter:description" content="{e(desc)}">
<meta name="geo.region" content="US-MI">
<meta name="geo.placename" content="{e(name)}, Michigan">
<meta name="geo.position" content="{GEO[slug]['lat']};{GEO[slug]['lng']}">
<meta name="ICBM" content="{GEO[slug]['lat']}, {GEO[slug]['lng']}">
{ld(biz_ld)}
{ld(crumb_ld)}
{ld(faq_ld)}
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/css/site.css?v={V}">
<script src="/assets/js/site-edits.js?v=20261124v1" defer></script>
</head>
<body class="nh-page nh-gen">
{NAV}
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">&rsaquo;</span> <span>Locations</span> <span aria-hidden="true">&rsaquo;</span> <span>{e(name)}</span></nav>

<header class="hero">
  <div class="badge">Serving {e(name)}, MI</div>
  <h1>Websites and business software for <span class="red">{e(name)}</span> businesses</h1>
  <p>{e(c['hero'])}</p>
  <div class="hero-btns"><a href="/?audit=1" class="btn btn-red">Book your free audit</a><a href="tel:+12484878747" class="btn btn-outline">Call (248) 487-8747</a></div>
  <img class="nh-devices" src="/assets/img/home/system-devices.webp" width="1090" height="560" alt="The owner's daily report on a laptop and the business's website on a phone">
</header>

<section><div class="container">
  <p class="section-label">Doing business in {e(name)}</p>
  <h2>What we see in <span class="red">{e(name)}</span></h2>
  {local}
</div></section>

<section class="dk"><div class="container">
  <p class="section-label">Where the money goes</p>
  <h2>Three leaks we find in {e(name)}</h2>
  <div class="nh-grid">{leaks}</div>
</div></section>

<section><div class="container">
  <p class="section-label">Who we work with</p>
  <h2>Built for how {e(name)} businesses run</h2>
  <div class="nh-grid">{who}</div>
</div></section>

<section><div class="container">
  <p class="section-label">What we build</p>
  <h2>A website that brings customers in. Software that runs the rest.</h2>
  <div class="nh-grid nh-grid2">
    <div class="nh-card">{ico('globe')}<h3>Your website</h3><p>Fast on a phone, easy to book or buy from, and found on Google. Designed around your brand, not a template.</p></div>
    <div class="nh-card">{ico('layout')}<h3>Your back office</h3><p>Bookings, customers, staff, stock, texts and a plain-English report every morning, on your phone. It plugs into your register: Union today, Clover and Square next.</p></div>
  </div>
  <p class="section-text" style="margin-top:28px">One price covers the system, your website, hosting, maintenance and support.</p>
</div></section>

<section><div class="container">
  <p class="section-label">How it works</p>
  <h2>Three steps. Nothing to figure out.</h2>
  <ol class="nh-steps">
    <li><span class="n">1</span><h3>Book your free audit</h3><p>About 30 minutes by phone or video. We look at how you run, what you pay for, and where money slips out.</p></li>
    <li><span class="n">2</span><h3>Get your plan and price</h3><p>A clear plan for your leaks, what we'll build, and exactly what it costs.</p></li>
    <li><span class="n">3</span><h3>We build it</h3><p>Set up with your real data, plus training so your team knows it on day one.</p></li>
  </ol>
</div></section>

<section><div class="container">
  <p class="section-label">Questions from {e(name)} owners</p>
  <h2>Questions owners ask</h2>
  <div class="nh-faqs">{faq}</div>
</div></section>

<section><div class="container">
  <p class="section-label">Nearby</p>
  <h2>We also work with businesses near {e(name)}</h2>
  <div class="nearby-grid">{near_links}</div>
</div></section>

<div class="cta">
  <h2>Let's find your leak.</h2>
  <p>One free audit. You'll leave knowing where your money is going, even if you never hire us.</p>
  <div class="hero-btns"><a href="/?audit=1" class="btn btn-red">Book your free audit</a><a href="tel:+12484878747" class="btn btn-outline">Call (248) 487-8747</a></div>
</div>
{FOOT}
<script src="/assets/js/site-nav.js?v={V}" defer></script>
<script>!function(key) {{if (window.reb2b) return;window.reb2b = {{loaded: true}};var s = document.createElement("script");s.async = true;s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);}}("E63P0HZ53POW");</script>
<script src="/assets/js/nui-push.js?v=20261124v5" defer></script>
</body>
</html>
'''

for slug, c in CITIES.items():
    open(os.path.join(ROOT, 'locations', slug + '.html'), 'w').write(page(slug, c))
    print('built', slug)
