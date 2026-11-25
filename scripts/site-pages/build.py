#!/usr/bin/env python3
"""Builds /restaurants-bars.html and /websites.html.

Shares the nav and footer with the city pages (scripts/city-pages/nav.html, footer.html).
Run from the repo root:  python3 scripts/site-pages/build.py
Styles: /assets/css/site.css (body.nh-page).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHARED = os.path.join(ROOT, 'scripts', 'city-pages')
NAV = open(os.path.join(SHARED, 'nav.html')).read()
FOOT = open(os.path.join(SHARED, 'footer.html')).read()
SITE = 'https://newurbaninfluence.com'
V = '20261124v3'

ICONS = {
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'message': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'star': '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    'check': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
    'glass': '<path d="M8 22h8M12 15v7M7 3h10l-1 7a4 4 0 0 1-8 0z"/>',
    'speaker': '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'layout': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    'pulse': '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    'person': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    'phone': '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    'cart': '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 12h11l2-8H7"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    'brush': '<path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L14 13l-4 1 1-4z"/><path d="M9 14.5A3.5 3.5 0 0 0 5.5 18c0 1.5-1 2.5-2.5 3 3 1 7 0 7-3.5"/>',
    'key': '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
    'shield': '<path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
}

def ico(n):
    return f'<i class="nh-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[n]}</svg></i>'

def card(i, title, text, note=''):
    extra = f'<p class="nh-note">{note}</p>' if note else ''
    return f'<div class="nh-card">{ico(i)}<h3>{title}</h3><p>{text}</p>{extra}</div>'

def faqs(items):
    return ''.join(f'<details class="nh-faq"><summary>{q}</summary><p>{a}</p></details>' for q, a in items)

def strip(s):
    return s.replace('&amp;', '&').replace('&rsquo;', "'")

STEPS = '''<ol class="nh-steps">
    <li><span class="n">1</span><h3>Book your free audit</h3><p>About 30 minutes by phone or video. We look at how you run, what you pay for, and where money slips out.</p></li>
    <li><span class="n">2</span><h3>Get your plan and price</h3><p>A clear plan, what we'll build, and exactly what it costs. No surprises.</p></li>
    <li><span class="n">3</span><h3>We build it</h3><p>Set up with your real data, plus training so your team knows it on day one.</p></li>
  </ol>'''

CTA = '''<div class="cta">
  <h2>Let's find your leak.</h2>
  <p>One free audit. You'll leave knowing where your money is going, even if you never hire us.</p>
  <div class="hero-btns"><a href="/?audit=1" class="btn btn-red">Book your free audit</a><a href="tel:+12484878747" class="btn btn-outline">Call (248) 487-8747</a></div>
</div>'''

def shell(slug, title, desc, crumb, body, faq):
    url = f'{SITE}/{slug}'
    ld = lambda o: '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False) + '</script>'
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faq]}
    crumb_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": crumb, "item": url}]}
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/og-image.jpg">
<meta property="og:site_name" content="New Urban Influence">
<meta name="twitter:card" content="summary_large_image">
{ld(crumb_ld)}
{ld(faq_ld)}
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/css/site.css?v={V}">
<script src="/assets/js/site-edits.js?v=20261124v1" defer></script>
</head>
<body class="nh-page">
{NAV}
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">&rsaquo;</span> <span>{crumb}</span></nav>
{body}
{CTA}
{FOOT}
<script src="/assets/js/site-nav.js?v={V}" defer></script>
<script src="/assets/js/nui-push.js?v=20261124v5" defer></script>
</body>
</html>
'''

# ---------------------------------------------------------------- Restaurants & bars
BAR_FAQ = [
    ("Does this replace my POS?", "No. Keep your register. We plug into it and handle everything around it: bookings, marketing, staff and stock. Sales, voids and tips flow in on their own, so nobody types anything twice."),
    ("Which registers does it work with?", "Union POS today, with Clover and Square next. If you use something else, tell us in the free audit and we'll tell you straight what's possible."),
    ("What does it cost?", "Every build is priced after the free audit, with an exact price up front. One price covers the system, your website, hosting, maintenance and support. There are no add-on fees."),
    ("Will my staff actually use it?", "It's built for a phone and written in plain words. Bartenders, servers, security and the kitchen each get their own simple screen, and we train everyone before day one."),
    ("Do I have to switch everything at once?", "No. We start with the leak that's costing you the most, usually no-shows or untracked pours, then add what you'll actually use."),
    ("Can you handle our flyers and promo videos too?", "Yes. Flyers, motion flyers, promo videos, menus and banners are an optional add-on from the team behind NU Flyers."),
]
BAR = f'''
<header class="hero">
  <div class="badge">Restaurant and bar software</div>
  <h1>Is your bar <span class="red">leaking</span> money?</h1>
  <p>No-shows, free pours, staff on the clock after close. Our software shows you where the money is going and plugs it. It works with the register you already have.</p>
  <div class="hero-btns"><a href="/?audit=1" class="btn btn-red">Book your free audit</a><a href="tel:+12484878747" class="btn btn-outline">Call (248) 487-8747</a></div>
  <img class="nh-devices" src="/assets/img/home/system-devices.webp" width="1090" height="560" alt="The owner's daily report on a laptop and the restaurant's website on a phone">
</header>

<section><div class="container">
  <p class="section-label">Where the money goes</p>
  <h2>Four leaks we find in almost every bar</h2>
  <div class="nh-grid">
    {card('calendar', 'No-shows and unpaid deposits', 'Booths and tables held on a promise, then empty on your busiest night.')}
    {card('glass', 'Voided and free drinks', 'Comps and over-pours nobody tracks until the month looks off.')}
    {card('clock', 'Staff paid after closing', 'People still on the clock long after the last sale.')}
    {card('layout', 'Apps nobody uses', 'Monthly fees for tools that never got set up.')}
  </div>
</div></section>

<section id="included"><div class="container">
  <p class="section-label">What's included</p>
  <h2>Keep your POS. Drop the add-ons.</h2>
  <p class="section-text">Your POS charges extra every month for each add-on, on top of its own fee. We do everything they charge extra for, plus what your POS can't do.</p>
  <div class="nh-grid">
    {card('calendar', 'Bookings and deposits', 'Tables, booths and parties, paid up front.', 'Included, instead of OpenTable or Resy')}
    {card('message', 'Text and email marketing', 'Send a Friday text to every regular.', 'Included, instead of Mailchimp or a texting app')}
    {card('star', 'Rewards', 'Points and perks that bring people back.', 'Included, instead of Fivestars or a POS loyalty add-on')}
    {card('check', 'Staff schedule and checklists', "Who's working, and what got done.", 'Included, instead of 7shifts or Homebase')}
    {card('glass', 'Bar and kitchen stock', 'Counts, pour cost and what to reorder.', 'Included, instead of BevSpot or MarketMan')}
    {card('speaker', 'Promoters and events', 'Guest lists, flyers and who brought who.', 'Included, instead of spreadsheets and group texts')}
  </div>
  <p class="section-text" style="margin-top:28px">Typical POS add-ons for a 20-person bar: about $400 to $650 a month. With us: all of it included, plus your website, hosting, maintenance and support.</p>
</div></section>

<section><div class="container">
  <p class="section-label">Two people, one system</p>
  <h2>Built for the owner. Run by the GM.</h2>
  <div class="nh-grid nh-grid2">
    <div class="nh-card">{ico('pulse')}<h3>For the owner: see the money without being there</h3><ul class="nh-list"><li>One plain-English report every morning</li><li>Alerts only when something needs you</li><li>Every leak in dollars: voids, comps, stock, late clock-outs</li><li>Check it from anywhere, on your phone</li></ul></div>
    <div class="nh-card">{ico('check')}<h3>For the GM: run a tighter night, and show the owner</h3><ul class="nh-list"><li>Someone calls out? The open shift goes to your team and gets covered</li><li>Who's working tonight, and who's late</li><li>Opening and closing checklists your staff tick off</li><li>What's running low, and what to order</li><li>A night report the owner sees, so your good work gets noticed</li></ul></div>
  </div>
</div></section>

<section><div class="container nh-split">
  <div>
    <p class="section-label">Built inside a real bar</p>
    <h2>It runs every night at Hideaway Kitchen &amp; Bar</h2>
    <p class="section-text">We built this system inside a working restaurant and lounge in Southfield. Bookings, booths, promoters, regulars, staff and bar stock all run from one back office there, on the same screens you'd get.</p>
    <a class="btn btn-outline" href="https://hideawaykitchenandbar.net" target="_blank" rel="noopener">Visit Hideaway's website</a>
  </div>
  <img class="nh-shot" src="/images/work/hideaway-site.webp" width="1200" height="750" loading="lazy" alt="Hideaway Kitchen &amp; Bar website built by New Urban Influence">
</div></section>

<section><div class="container">
  <p class="section-label">Optional extras</p>
  <h2>Want more hands on it?</h2>
  <div class="nh-grid nh-grid2">
    {card('person', 'Add a fractional COO', 'Our team works alongside your GM to set the system up, onboard every staff member and find the leaks in your numbers. Hands-on, for as long as you need it.')}
    {card('speaker', 'Promotions done for you', 'Flyers and motion flyers for every night, promo videos with radio-style voiceovers, menu design, birthday templates and discounted banners shipped anywhere in the US. Printed menus for Michigan bars.')}
  </div>
</div></section>

<section><div class="container">
  <p class="section-label">How it works</p>
  <h2>Three steps. Nothing to figure out.</h2>
  {STEPS}
</div></section>

<section><div class="container">
  <p class="section-label">Questions</p>
  <h2>Questions bar owners ask</h2>
  <div class="nh-faqs">{faqs(BAR_FAQ)}</div>
</div></section>
'''

# ---------------------------------------------------------------- Websites
BUILDS = [
    ('Hideaway Kitchen &amp; Bar', 'Restaurant and bar · Southfield', 'https://hideawaykitchenandbar.net', 'hideaway-site'),
    ('AJ Photography', 'Photo studio · Metro Detroit', 'https://ajvip.com', 'ajvip-site'),
    ('Michigan After Dark', 'Nightlife · Detroit', 'https://michiganafterdark.com', 'mad-site'),
    ('Sonya Meadows', 'Author and speaker', 'https://sonyameadows.com', 'sonya-site'),
    ('Ultimate Hair Co.', 'Hair brand · Oak Park', 'https://ultimatehairco.com', 'uhc-site'),
]
WEB_FAQ = [
    ("How much does a website cost?", "It depends on what your business needs, so every site is priced after the free audit, with a clear plan and an exact price up front. Hosting, maintenance and support are included."),
    ("How long does it take?", "Most websites are built in a few weeks. We set it up with your real content and show you how to use it."),
    ("Can I update it myself?", "Yes. Menus, prices, photos and events are changed from your own back office, with a login for you and your staff. You don't have to call us for every change."),
    ("I already have a website. Do I need a new one?", "Maybe not. In the free audit we look at how people find you and where they drop off. If your site can be fixed, we'll tell you."),
    ("Will people find it on Google?", "Every site is built to load fast, read well on a phone and tell Google exactly what you do and where. We also connect it to your Google Business listing."),
]
WEB = f'''
<header class="hero">
  <div class="badge">Websites</div>
  <h1>A website that brings <span class="red">customers</span> in</h1>
  <p>Fast on a phone, easy to book or buy from, and found on Google. Designed around your brand, not a template.</p>
  <div class="hero-btns"><a href="/?audit=1" class="btn btn-red">Book your free audit</a><a href="#builds" class="btn btn-outline">See websites we've built</a></div>
</header>

<section id="builds"><div class="container">
  <p class="section-label">Our work</p>
  <h2>Websites we've built</h2>
  <div class="nh-builds">{''.join(f'<a href="{u}" target="_blank" rel="noopener"><img src="/images/work/{img}.webp" width="1200" height="750" loading="lazy" alt="{n} website built by New Urban Influence"><b>{n}</b><small>{t}</small></a>' for n, t, u, img in BUILDS)}</div>
</div></section>

<section><div class="container">
  <p class="section-label">What's included</p>
  <h2>Every website comes with this</h2>
  <div class="nh-grid">
    {card('phone', 'Fast on a phone', 'Most of your visitors are on their phone. Your site loads quickly and reads easily there first.')}
    {card('cart', 'Easy to book or buy', 'Bookings, orders and payments in a couple of taps, with a confirmation by text.')}
    {card('search', 'Found on Google', 'Built so Google knows what you do and where, and connected to your Business listing.')}
    {card('brush', 'Designed around your brand', 'Your colors, your photos, your voice. No templates.')}
    {card('key', 'A login for you and your staff', 'Change menus, prices, photos and events yourself from your back office.')}
    {card('shield', 'Hosting, maintenance and support', 'Included in one price. When something needs fixing, a real person answers.')}
  </div>
</div></section>

<section><div class="container">
  <p class="section-label">Goes further</p>
  <h2>Add software that runs the business behind it</h2>
  <p class="section-text">The website brings people in. The software behind it runs bookings, customers, staff and follow-up in one place.</p>
  <div class="nh-grid">
    <a class="nh-card nh-link" href="/restaurants-bars">{ico('glass')}<h3>Restaurants and bars</h3><p>Bookings, deposits, staff, stock and texts to regulars. Works with your register.</p><p class="nh-note">See the restaurant and bar software</p></a>
    {card('calendar', 'Photographers', 'Sessions, contracts, deposits and galleries that go out on time.')}
    {card('speaker', 'Nightlife and promoters', 'Tickets, booths, guest lists and promoter payouts.')}
    {card('cart', 'Authors and product brands', 'Sell direct, take requests and grow a customer list you own.')}
  </div>
</div></section>

<section><div class="container">
  <p class="section-label">How it works</p>
  <h2>Three steps. Nothing to figure out.</h2>
  {STEPS}
</div></section>

<section><div class="container">
  <p class="section-label">Questions</p>
  <h2>Questions owners ask</h2>
  <div class="nh-faqs">{faqs(WEB_FAQ)}</div>
</div></section>
'''

PAGES = [
    ('restaurants-bars', 'Restaurant &amp; Bar Software | Bookings, Staff, Stock | New Urban Influence',
     'Software for restaurants and bars: bookings and deposits, texts to regulars, staff schedules, bar stock and a daily owner report. Works with your POS. Free audit.',
     'Restaurants &amp; bars', BAR, BAR_FAQ),
    ('websites', 'Websites That Bring Customers In | New Urban Influence, Detroit',
     'Custom websites for local businesses: fast on a phone, easy to book or buy from, found on Google. Hosting, maintenance and support included. Free audit.',
     'Websites', WEB, WEB_FAQ),
]
for slug, title, desc, crumb, body, faq in PAGES:
    open(os.path.join(ROOT, slug + '.html'), 'w').write(shell(slug, title, desc, crumb, body, faq))
    print('built', slug)
