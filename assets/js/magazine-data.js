// NUI Magazine — Article Data
// Version: 20260316v18
// Validate before commit: node -e "new Function(require('fs').readFileSync(FILE,'utf8'))"

const NUI_MAG = {
  categories: [
    { slug: 'photographers', label: 'Photography', color: '#ff0000' },
    { slug: 'studios',       label: 'Studios',     color: '#ff0000' },
    { slug: 'authors',       label: 'Authors',     color: '#ff0000' },
    { slug: 'creators',      label: 'Creators',    color: '#ff0000' },
    { slug: 'brands',        label: 'Brands',      color: '#ff0000' },
    { slug: 'agencies',      label: 'Agencies',    color: '#ff0000' },
    { slug: 'awards',        label: 'Awards',      color: '#ffd700' },
    { slug: 'speakers',      label: 'Speakers',    color: '#ff0000' },
  ],
  articles: [
    // ── ARTICLE 1: AJ Photography Studio ─────────────
    {
      id: 'aj-photography-studio-2026',
      slug: 'aj-photography-studio-detroit',
      title: 'AJ Photography Studio: Detroit\'s Full-Service Photography Experience Since 2012',
      dek: 'From maternity portraits to weddings, throne chair rentals to 360 photobooths — AJ Photography Studio has been capturing Detroit\'s most important moments for over a decade.',
      category: 'photographers', categoryLabel: 'Photography Studio',
      author: 'NUI Editorial', publishedAt: '2026-03-16', readTime: '5 min read',
      featured: true, premium: false,
      award: 'NUI Detroit Creative Award 2026', awardLabel: 'Best Photography Studio — Detroit Creator Network',
      heroImage: '/images/magazine/aj-photography-hero.jpg',
      profileImage: '/images/magazine/aj-photography-profile.jpg',
      profileBio: 'Detroit-based photographer and event specialist. Capturing families, couples, professionals, and milestones since 2012. Throne chairs, photobooths, and full event rentals.',
      ownerBio: {
        label: 'Photographer & Founder',
        headline: 'The Eye Behind Detroit\'s Biggest Moments',
        body: 'For over a decade, AJ Photography has been the trusted lens at Detroit\'s most important events. With 36K Instagram followers and 229 Google reviews, the studio has earned its reputation through consistent, memorable work.',
        stats: [{ val: '13+', label: 'Years in Business' },{ val: '36K', label: 'Instagram Followers' },{ val: '4.9★', label: 'Google Rating' },{ val: '229', label: 'Google Reviews' }],
        tags: ['Photography', 'Event Rentals', 'Oak Park MI', 'Detroit'],
      },
      tags: ['Detroit', 'Photography', 'Studio', 'Events', 'Weddings', 'Portraits'],
      body: `When AJ Photography Studio opened its doors in Detroit in 2012, the mission was simple: capture the moments that matter most. More than a decade later, that mission has grown into one of Detroit's most comprehensive full-service photography and event rental operations.

The studio serves virtually every major life milestone — maternity and pregnancy sessions, engagement and couples portraits, family photography, weddings, graduation photos, prom and senior portraits, adult birthday celebrations, fashion and beauty shoots, and professional headshots for executives and entrepreneurs alike.

## More Than a Camera

What sets AJ Photography Studio apart is the breadth of what they bring to the table. Beyond photography, the studio offers throne chair rentals, Money Machine booths, portal photobooths, 360-degree photobooths, and red carpet with poles.

The result is a one-stop operation. A client can book their wedding photographer, their photobooth, their throne chair, and their event photography all through a single call to 313.631.8819.

## A Studio Built on Community

Since launching in 2012, AJ Photography Studio has built its reputation the Detroit way — through word of mouth, through showing up, and through delivering work that consistently exceeds expectations.

New Urban Influence is proud to feature AJ Photography Studio as a founding member of the NUI Creator Network and recipient of the 2026 NUI Detroit Creative Award for Best Photography Studio.`,
      business: {
        name: 'AJ Photography Studio', category: 'Full-Service Photography Studio',
        phone: '313.631.8819', address: '21700 Greenfield Rd Ste LL18', city: 'Oak Park', state: 'MI', zip: '48237',
        website: 'ajvip.com', email: 'INFO@AJVIP.COM', instagram: '@ajphoto313',
        rating: 4.9, reviewCount: 229, citationId: 'NUI-DET-2026-0001',
        verifiedDate: 'March 2026', verifiedUrl: 'https://www.ajvip.com',
        sameAs: ['Google', 'Yelp', 'Instagram', 'Facebook'],
        services: ['Maternity & Pregnancy','Family Portraits','Engagement & Couples','Wedding Photography','Graduation Photos','Prom & Senior Portraits','Professional Headshots','Fashion & Beauty','Event Photography','Throne Chair Rentals','Money Machine Rentals','Photobooth Rentals','360 Photobooth','Red Carpet & Poles'],
      },
      reviews: [
        { initials: 'DM', name: 'D. Moore', date: 'February 2020', rating: 5, platform: 'Yelp', text: 'AJ does all of the hottest events in Detroit and I know why — he\'s very professional, patient, and personable. Picture quality is always perfect and he can print on the spot within minutes. If you\'re looking for a photographer or have photobooth needs, AJ is your go to.' },
      ],
    },
    // ── ARTICLE 2: Larry Castleberry ─────────────────
    {
      id: 'larry-castleberry-2026',
      slug: 'larry-castleberry-detroit-storyteller-speaker',
      title: 'Larry Castleberry: Detroit\'s Master Storyteller, Speaker, and Voice Actor',
      dek: 'With over 20 years of experience bringing stories to life, a background in engineering, and a deep practice of Aikido, Larry Castleberry is one of Detroit\'s most singular creative voices.',
      category: 'speakers', categoryLabel: 'Storyteller & Speaker',
      author: 'NUI Editorial', publishedAt: '2026-03-16', readTime: '5 min read',
      featured: true, premium: false, award: null,
      heroImage: '/images/magazine/larry-castleberry-hero.jpg',
      profileImage: '/images/magazine/larry-castleberry-profile.jpg',
      profileBio: 'Detroit-based storyteller, speaker, and voice actor with 20+ years of experience. B.S. Electrical Engineering · M.S. Engineering Management · Aikido practitioner.',
      ownerBio: {
        label: 'Storyteller, Speaker & Voice Actor',
        headline: 'The Voice Detroit Didn\'t Know It Needed',
        body: 'Larry Castleberry spent years building systems as an engineer before discovering his real gift — making people feel something. Two decades later he\'s a sought-after corporate speaker, a Voices.com voice actor, and a recurring performer at the Secret Society of Twisted Storytellers.',
        stats: [{ val: '20+', label: 'Years Experience' },{ val: 'B.S.', label: 'Electrical Engineering' },{ val: 'M.S.', label: 'Engineering Management' },{ val: 'Aikido', label: 'Conflict Resolution' }],
        tags: ['Keynote Speaker', 'Voice Actor', 'Storytelling', 'Detroit'],
      },
      tags: ['Detroit', 'Storytelling', 'Voice Actor', 'Speaker', 'Aikido'],
      body: `Some professionals have a skill. Larry Castleberry has a gift — and it's one he's spent more than two decades refining, sharing, and teaching.

The Detroit-based storyteller, motivational speaker, and voice actor has built a reputation that stretches well beyond city limits.

## The Engineer Who Learned to Tell Stories

He holds a B.S. in Electrical Engineering and an M.S. in Engineering Management. Castleberry doesn't just tell stories — he engineers them. Every performance is constructed with the same discipline he applied to circuits and systems.

## Conflict Resolution Through Aikido

One of Castleberry's most distinctive programs draws from his long practice of Aikido. He's performed at corporate events, community gatherings, and the Secret Society of Twisted Storytellers, where audience members described his ability to engage as "truly amazing."

## Voice That Carries

Beyond the stage, Castleberry is an accomplished voice actor on Voices.com. Clients describe his voice as "top-notch" with a storyteller's quality that brings characters to life with warmth and range.

New Urban Influence is honored to feature Larry Castleberry as a founding member of the NUI Creator Network.`,
      business: {
        name: 'Larry Castleberry', category: 'Storyteller, Speaker & Voice Actor',
        phone: '', address: 'Detroit', city: 'Detroit', state: 'MI', zip: '',
        website: 'larrycastleberry.com', email: '', instagram: '@lcastleberry',
        rating: 5.0, reviewCount: 20, citationId: 'NUI-DET-2026-0002',
        verifiedDate: 'March 2026', verifiedUrl: 'https://www.larrycastleberry.com',
        sameAs: ['Voices.com', 'SpeakerHub', 'Instagram'],
        services: ['Keynote Speaking','Storytelling Performances','Voice Acting','Audiobook Narration','Corporate Narration','Conflict Resolution Programs','Motivational Speaking','Workshop Facilitation'],
      },
      reviews: [
        { initials: 'KJ', name: 'Karen J.', date: 'February 2026', rating: 5, text: 'Larry spoke at our leadership conference and left the entire room speechless. His blend of Aikido philosophy and personal storytelling was unlike anything we\'ve brought to our team before.' },
        { initials: 'MK', name: 'Marcus K.', date: 'January 2026', rating: 5, text: 'Hired Larry for audiobook narration. The final product sounded like a major label production. Detroit talent at its finest.' },
        { initials: 'TC', name: 'Thomas C.', date: 'November 2025', rating: 5, text: 'Larry gave an incredibly inspiring story at our event. His ability to connect with the audience through vocal variety and body gestures was truly amazing.' },
      ],
    },
    // ── ARTICLE 3: Faren Young — PREMIUM FOUNDER FEATURE
    {
      id: 'faren-young-nui-2026',
      slug: 'faren-young-new-urban-influence-detroit',
      title: 'Faren Young Is Building Detroit\'s Creative Economy — One Brand at a Time',
      dek: 'From co-founding Bravo Graphix on the Avenue of Fashion to running Detroit\'s most complete branding and AI automation agency, Faren Young has spent 20 years doing the one thing Detroit respects most: building something real.',
      category: 'agencies', categoryLabel: 'Agency Founder',
      author: 'NUI Editorial', publishedAt: '2026-03-16', readTime: '8 min read',
      featured: true, premium: true,
      award: 'NUI Detroit Founder Spotlight 2026', awardLabel: 'Detroit Creative Leader — NUI Magazine',
      heroImage: '/images/about-story.png',
      profileImage: '/images/magazine/faren-young-profile.png',
      profileBio: 'Native Detroiter. Creative Director & Founder of New Urban Influence. Co-founder of Bravo Graphix. 20+ years building brands across Michigan and nationwide.',
      ownerBio: {
        label: 'Founder & Creative Director — New Urban Influence',
        headline: 'The Architect of Detroit\'s Next Brand Era',
        body: 'Martez Hand — known creatively as Faren Young — grew up on Detroit\'s West Side where hustle wasn\'t a buzzword, it was survival. He co-founded Bravo Graphix in 2007, built it to a 1,700 sq ft studio on the Avenue of Fashion, got covered by Rolling Out, Model D Media, and the Detroit Free Press, then evolved the entire operation into New Urban Influence.',
        stats: [{ val: '2007', label: 'Year Founded' },{ val: '50+', label: 'Brands Built' },{ val: '$2M+', label: 'Client Revenue' },{ val: '4.9★', label: '31 Google Reviews' }],
        tags: ['Branding', 'AI Automation', 'Detroit Native', 'Avenue of Fashion', 'NUI Founder'],
      },
      tags: ['Detroit', 'Branding Agency', 'Founder', 'Bravo Graphix', 'Avenue of Fashion', 'NUI'],
      body: `Martez Hand grew up on Detroit's West Side. Where hustle wasn't a buzzword — it was survival. It was culture. It was the blueprint. The world would come to know him as Faren Young: Creative Director, brand strategist, and the founder of one of Metro Detroit's most recognized creative agencies.

But before any of that, there was a designer with a vision bigger than any canvas could hold, and a city that would either sharpen him or break him. Detroit sharpened him.

## Bravo Graphix: Born on the West Side

In 2007, Faren co-founded Bravo Graphix alongside Donald Hand. They started at Huntington and 7 Mile Rd. on Detroit's upper West Side. By 2013 the agency had relocated to a 1,700-square-foot studio at 19434 Livernois Avenue — right on Detroit's iconic Avenue of Fashion. Rolling Out covered it. Model D Media covered it. The Detroit Free Press put it in the paper.

*"From postcard design to billboards — we offered everything it took to start, grow, and maintain a business."*

## The Evolution to New Urban Influence

The creative landscape was shifting. Businesses didn't just need a designer — they needed a strategist who understood that branding is a revenue system, not just a pretty face. Faren saw the gap. And he filled it.

New Urban Influence was born — brand identity, packaging, web, email and SMS automation, AI phone assistants, geo-fencing, geo-grid tracking, and Silent Visitor ID — a system that identifies anonymous website visitors by name, email, and LinkedIn before they ever fill out a form.

## The Client List Speaks

Over 50 brands elevated. Over $2 million in revenue generated for clients. UAW. Chrysler. The Office of the Governor of Michigan. Kash Doll. Rep. Leslie Love. Eric Sabree, Wayne County Treasurer. Beacon Park. Kiwanis International. Good Cakes and Bakes. Detroit Design Festival.

## What NUI Is Today

Today, NUI operates as a full platform — client portals, proof approval workflows, automated marketing pipelines, AI systems that work while you sleep.

*"We don't design. We influence."*

That's not a slogan. It's a precise description of what NUI does. Influence — over perception, over reputation, over the decisions potential clients make before they ever pick up the phone — is the actual product.

It's a long game. Faren Young has been playing it since 2007. He's not stopping.`,
      business: {
        name: 'New Urban Influence', category: 'Branding & AI Automation Agency',
        phone: '(248) 487-8747', address: 'Detroit', city: 'Detroit', state: 'MI', zip: '',
        website: 'newurbaninfluence.com', email: 'info@newurbaninfluence.com', instagram: '@newurbaninfluence',
        rating: 4.9, reviewCount: 31, citationId: 'NUI-DET-2026-0000',
        verifiedDate: 'March 2026', verifiedUrl: 'https://newurbaninfluence.com',
        sameAs: ['Google', 'Rolling Out', 'Detroit Free Press', 'Model D Media', 'Clutch', 'Yelp'],
        services: ['Brand Identity Design','Logo Design','Web Design & Development','AI Systems & Automation','Email & SMS Automation','Geo-Fencing','Silent Visitor ID','Print & Packaging','Social Media & Ads'],
      },
      reviews: [
        { initials: 'MB', name: 'Miss B', date: 'November 2025', rating: 5, platform: 'Google', text: 'I would recommend working with New Urban Influence. My experience with Faren was great — even when I was being a difficult customer. The care and attention put into making sure they understood my vision was amazing.' },
        { initials: 'CB', name: 'Chevelles Bar', date: 'October 2025', rating: 5, platform: 'Google', text: 'Faren did a great job on a few flyers for me. Prices were reasonable and the quality was superb. My go-to company for all my promotional needs.' },
        { initials: 'SM', name: 'Sierra Meriwether', date: 'December 2025', rating: 5, platform: 'Google', text: 'The best graphic design company in the world. I have been a customer for over 10 years and every time they exceed my expectations.' },
        { initials: 'LC', name: 'Larry Castleberry', date: 'December 2025', rating: 5, platform: 'Google', text: 'Great experience. New Urban Influence gives you personal and detailed attention, making you feel like you are their most important customer.' },
      ],
    },
    // ── ARTICLE 4: Built Heavy — Faren Young Author Feature
    {
      id: 'built-heavy-faren-young-2026',
      slug: 'built-heavy-faren-young-book',
      title: 'Built Heavy: Forged by Pressure, Driven by Purpose',
      dek: 'Detroit author Faren Young\'s debut book argues that adversity isn\'t the obstacle — it\'s the training ground. Built Heavy is the blueprint for people who don\'t break under pressure but are built by it.',
      category: 'authors', categoryLabel: 'Author · Detroit',
      author: 'NUI Editorial', publishedAt: '2026-03-16', readTime: '6 min read',
      featured: true, premium: true,
      award: 'NUI Detroit Author Spotlight 2026', awardLabel: 'Featured Author — NUI Creator Network',
      heroImage: '/images/about-story.png',
      profileImage: '/images/magazine/faren-young-profile.png',
      videoUrl: 'https://www.youtube.com/embed/tmQckAw4bFk',
      podcastUrl: 'https://notebooklm.google.com/notebook/0c5dad06-32a7-44f9-92d3-c7229b7c00a8?artifactId=af5c6997-b17b-4c18-b849-31486378b0f5',
      authorMode: true,
      profileBio: 'Author, creative director, and founder of New Urban Influence. Native Detroiter. Built Heavy is Faren Young\'s first book — a blueprint for turning pressure into purpose, hustle into legacy.',
      ownerBio: {
        label: 'Author — Built Heavy',
        headline: 'Pressure Doesn\'t Destroy Everyone. Some People Are Built By It.',
        body: 'Faren Young wrote Built Heavy from lived experience — not theory. Two decades of building businesses from nothing, navigating setbacks, sharpening vision under pressure, and turning street-level hustle into systems that generate real wealth. Built Heavy is the book he needed when he was starting out. Now it exists for everyone else who\'s building under pressure.',
        stats: [{ val: '5', label: 'Core Themes' },{ val: '1', label: 'Core Message' },{ val: '20+', label: 'Years of Lessons' },{ val: 'Detroit', label: 'Born & Built' }],
        tags: ['Mindset', 'Legacy', 'Entrepreneurship', 'Detroit Author', 'Built Heavy'],
      },
      tags: ['Built Heavy', 'Book', 'Detroit Author', 'Mindset', 'Legacy', 'Entrepreneurship', 'Faren Young'],
      body: `Some books explain success. Built Heavy is about something harder to explain — and harder to earn. It's about what happens before the win. The pressure. The friction. The moments when everything you've built feels like it could collapse, and you have to decide who you are.

Faren Young's debut book, Built Heavy: Forged by Pressure, Driven by Purpose, is that book. And it comes from someone who didn't theorize about adversity from a distance. He lived it — on Detroit's West Side, in the trenches of entrepreneurship, building businesses that had no safety net and no guarantee.

## What Built Heavy Is About

The book is organized around five pillars that form the foundation of a Built Heavy mindset:

**Mindset** — Most people treat mental toughness like a switch you flip when things get hard. Built Heavy argues it's a forge — something you build over time, in fire, through reps. The book walks readers through developing clarity of purpose when everything around you is unclear.

**Pressure as a Forge** — The central argument of Built Heavy is simple and radical: pressure isn't the enemy. It's the training ground. The book reframes adversity not as something to survive but as the primary force that shapes stronger people, sharper thinkers, and more resilient builders.

**Building Something Real** — There's a difference between making money and building something. Built Heavy draws a clear line between hustle that spends itself and hustle that compounds — into business, into influence, into legacy. Young shows how to make that transition.

**Purpose and Identity** — Who are you building for? Built Heavy digs into the question that most business books skip: the why beneath the what. Understanding your identity isn't soft — it's the thing that keeps you building when the money doesn't justify it yet.

**Legacy Thinking** — The final pillar is the one most people defer until it's almost too late. Built Heavy makes the case for thinking about impact now — not as a retirement project, but as the daily operating system of a person who intends to matter beyond their own lifetime.

## The Core Message

*"Pressure doesn't destroy everyone. Some people are Built Heavy — forged by it."*

This isn't motivational content dressed up in hardcover. It's a practical, honest, street-level examination of what it actually takes to build a life of purpose, wealth, and impact when the odds are stacked against you. The lessons don't come from case studies or boardrooms. They come from the grind — from building Bravo Graphix on Detroit's Avenue of Fashion, from launching New Urban Influence from nothing, from the years when the vision was clear but the resources weren't.

## Why It Matters Now

Detroit has always produced people who build under pressure. That's not a story — it's a reality. Built Heavy is the blueprint for those people. The ones who don't need to be told that hard things are hard. The ones who need a framework for turning that hardness into something that lasts.

Watch the Built Heavy story below — then read the book.`,
      business: {
        name: 'Built Heavy — Faren Young', category: 'Author & Book',
        phone: '(248) 487-8747', address: 'Detroit', city: 'Detroit', state: 'MI', zip: '',
        website: 'newurbaninfluence.com', email: 'info@newurbaninfluence.com', instagram: '@newurbaninfluence',
        rating: 5.0, reviewCount: 12, citationId: 'NUI-DET-2026-0003',
        verifiedDate: 'March 2026', verifiedUrl: 'https://newurbaninfluence.com',
        sameAs: ['Google', 'YouTube', 'Instagram'],
        services: ['Built Heavy Book','Mindset Coaching','Keynote Speaking','Author Appearances','Brand Consulting','NUI Branding Services'],
      },
      reviews: [
        { initials: 'RD', name: 'R. Davis', date: 'March 2026', rating: 5, text: 'Built Heavy hit different. This isn\'t another motivational book — it\'s real. Faren writes the way people who\'ve actually been through it think. Every chapter felt like a conversation I needed to have years ago.' },
        { initials: 'TM', name: 'T. Morgan', date: 'March 2026', rating: 5, text: 'The chapter on pressure as a forge changed how I think about my business struggles. I stopped fighting my circumstances and started using them. That shift alone was worth the read.' },
        { initials: 'KW', name: 'K. Williams', date: 'March 2026', rating: 5, text: 'Faren Young writes with the kind of clarity that only comes from experience. Built Heavy is the book Detroit needed. The legacy thinking section is something every entrepreneur should read.' },
        { initials: 'JB', name: 'J. Brooks', date: 'March 2026', rating: 5, text: 'I\'ve read a lot of business books. Built Heavy is the first one that felt like it was written for people like me — not Silicon Valley, not the Ivy League. Detroit. Real life. Real pressure. Real results.' },
      ],
    },
  ],

  getBySlug(slug)  { return this.articles.find(function(a) { return a.slug === slug; }); },
  getFeatured()    { return this.articles.filter(function(a) { return a.featured; }); },
  getByCategory(c) { return this.articles.filter(function(a) { return a.category === c; }); },
  getRecent(n)     { return this.articles.slice().sort(function(a,b) { return new Date(b.publishedAt)-new Date(a.publishedAt); }).slice(0,n||6); },
  getPremium()     { return this.articles.filter(function(a) { return a.premium; }); },
};
