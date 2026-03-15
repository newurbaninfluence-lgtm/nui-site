// NUI Magazine — Article Data
// Version: 20260316v15
// Source: Real client data verified from live sites

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
      category: 'photographers',
      categoryLabel: 'Photography Studio',
      author: 'NUI Editorial',
      publishedAt: '2026-03-16',
      readTime: '5 min read',
      featured: true,
      premium: false,
      award: 'NUI Detroit Creative Award 2026',
      awardLabel: 'Best Photography Studio — Detroit Creator Network',
      heroImage: '/images/magazine/aj-photography-hero.jpg',
      profileImage: '/images/magazine/aj-photography-profile.jpg',
      profileBio: 'Detroit-based photographer and event specialist. Capturing families, couples, professionals, and milestones since 2012. Throne chairs, photobooths, and full event rentals.',
      ownerBio: {
        label: 'Photographer & Founder',
        headline: 'The Eye Behind Detroit\'s Biggest Moments',
        body: 'For over a decade, AJ Photography has been the trusted lens at Detroit\'s most important events. With 36K Instagram followers and 229 Google reviews, the studio has earned its reputation through consistent, memorable work.',
        stats: [
          { val: '13+', label: 'Years in Business' },
          { val: '36K', label: 'Instagram Followers' },
          { val: '4.9★', label: 'Google Rating' },
          { val: '229', label: 'Google Reviews' },
        ],
        tags: ['Photography', 'Event Rentals', 'Oak Park MI', 'Detroit'],
      },
      tags: ['Detroit', 'Photography', 'Studio', 'Events', 'Weddings', 'Portraits'],
      body: `When AJ Photography Studio opened its doors in Detroit in 2012, the mission was simple: capture the moments that matter most. More than a decade later, that mission has grown into one of Detroit's most comprehensive full-service photography and event rental operations.

The studio serves virtually every major life milestone — maternity and pregnancy sessions, engagement and couples portraits, family photography, weddings, graduation photos, prom and senior portraits, adult birthday celebrations, fashion and beauty shoots, and professional headshots for executives and entrepreneurs alike.

## More Than a Camera

What sets AJ Photography Studio apart is the breadth of what they bring to the table. Beyond photography, the studio offers a full suite of event rental services — throne chair rentals, Money Machine booths, portal photobooths, 360-degree photobooths, and red carpet with poles.

The result is a one-stop operation. A client can book their wedding photographer, their photobooth, their throne chair, and their event photography all through a single call to 313.631.8819.

## A Studio Built on Community

Since launching in 2012, AJ Photography Studio has built its reputation the Detroit way — through word of mouth, through showing up, and through delivering work that consistently exceeds expectations.

New Urban Influence is proud to feature AJ Photography Studio as a founding member of the NUI Creator Network and recipient of the 2026 NUI Detroit Creative Award for Best Photography Studio.`,
      business: {
        name: 'AJ Photography Studio',
        category: 'Full-Service Photography Studio',
        phone: '313.631.8819',
        address: '21700 Greenfield Rd Ste LL18',
        city: 'Oak Park',
        state: 'MI',
        zip: '48237',
        website: 'ajvip.com',
        email: 'INFO@AJVIP.COM',
        instagram: '@ajphoto313',
        rating: 4.9,
        reviewCount: 229,
        citationId: 'NUI-DET-2026-0001',
        verifiedDate: 'March 2026',
        verifiedUrl: 'https://www.ajvip.com',
        sameAs: ['Google', 'Yelp', 'Instagram', 'Facebook'],
        services: [
          'Maternity & Pregnancy', 'Family Portraits', 'Engagement & Couples',
          'Wedding Photography', 'Graduation Photos', 'Prom & Senior Portraits',
          'Professional Headshots', 'Fashion & Beauty', 'Event Photography',
          'Throne Chair Rentals', 'Money Machine Rentals', 'Photobooth Rentals',
          '360 Photobooth', 'Red Carpet & Poles',
        ],
      },
      reviews: [
        { initials: 'DM', name: 'D. Moore', date: 'February 2020', rating: 5, platform: 'Yelp',
          text: 'AJ does all of the hottest events in Detroit and I know why — he\'s very professional, patient, and personable. Picture quality is always perfect and he can print on the spot within minutes. If you\'re looking for a photographer or have photobooth needs, AJ is your go to.' },
      ],
    },
    // ── ARTICLE 2: Larry Castleberry ─────────────────
    {
      id: 'larry-castleberry-2026',
      slug: 'larry-castleberry-detroit-storyteller-speaker',
      title: 'Larry Castleberry: Detroit\'s Master Storyteller, Speaker, and Voice Actor',
      dek: 'With over 20 years of experience bringing stories to life, a background in engineering, and a deep practice of Aikido, Larry Castleberry is one of Detroit\'s most singular creative voices.',
      category: 'speakers',
      categoryLabel: 'Storyteller & Speaker',
      author: 'NUI Editorial',
      publishedAt: '2026-03-16',
      readTime: '5 min read',
      featured: true,
      premium: false,
      award: null,
      heroImage: '/images/magazine/larry-castleberry-hero.jpg',
      profileImage: '/images/magazine/larry-castleberry-profile.jpg',
      profileBio: 'Detroit-based storyteller, speaker, and voice actor with 20+ years of experience. B.S. Electrical Engineering · M.S. Engineering Management · Aikido practitioner.',
      ownerBio: {
        label: 'Storyteller, Speaker & Voice Actor',
        headline: 'The Voice Detroit Didn\'t Know It Needed',
        body: 'Larry Castleberry spent years building systems as an engineer before discovering his real gift — making people feel something. Two decades later he\'s a sought-after corporate speaker, a Voices.com voice actor, and a recurring performer at the Secret Society of Twisted Storytellers.',
        stats: [
          { val: '20+', label: 'Years Experience' },
          { val: 'B.S.', label: 'Electrical Engineering' },
          { val: 'M.S.', label: 'Engineering Management' },
          { val: 'Aikido', label: 'Conflict Resolution' },
        ],
        tags: ['Keynote Speaker', 'Voice Actor', 'Storytelling', 'Detroit'],
      },
      tags: ['Detroit', 'Storytelling', 'Voice Actor', 'Speaker', 'Aikido'],
      body: `Some professionals have a skill. Larry Castleberry has a gift — and it's one he's spent more than two decades refining, sharing, and teaching.

The Detroit-based storyteller, motivational speaker, and voice actor has built a reputation that stretches well beyond city limits. Over a career spanning more than 20 years, Castleberry has helped individuals and organizations alike unlock the power of their own stories.

## The Engineer Who Learned to Tell Stories

He holds a B.S. in Electrical Engineering and an M.S. in Engineering Management. Castleberry doesn't just tell stories — he engineers them. Every performance is constructed with the same discipline he applied to circuits and systems.

## Conflict Resolution Through Aikido

One of Castleberry's most distinctive programs draws from his long practice of Aikido. His presentations on conflict resolution apply Aikido's core principles to workplace dynamics, personal relationships, and everyday friction.

He's performed at corporate events, community gatherings, and at the Secret Society of Twisted Storytellers, where audience members described his ability to engage through vocal variety, facial expression, and physical presence as "truly amazing."

## Voice That Carries

Beyond the stage, Castleberry is an accomplished voice actor with a professional profile on Voices.com. Clients describe his voice as "top-notch" with a storyteller's quality that brings characters to life with warmth, authority, and range.

New Urban Influence is honored to feature Larry Castleberry as a founding member of the NUI Creator Network.`,
      business: {
        name: 'Larry Castleberry',
        category: 'Storyteller, Speaker & Voice Actor',
        phone: '',
        address: 'Detroit',
        city: 'Detroit',
        state: 'MI',
        zip: '',
        website: 'larrycastleberry.com',
        email: '',
        instagram: '@lcastleberry',
        rating: 5.0,
        reviewCount: 20,
        citationId: 'NUI-DET-2026-0002',
        verifiedDate: 'March 2026',
        verifiedUrl: 'https://www.larrycastleberry.com',
        sameAs: ['Voices.com', 'SpeakerHub', 'Instagram'],
        services: [
          'Keynote Speaking', 'Storytelling Performances', 'Voice Acting',
          'Audiobook Narration', 'Corporate Narration', 'Conflict Resolution Programs',
          'Motivational Speaking', 'Workshop Facilitation',
        ],
      },
      reviews: [
        { initials: 'KJ', name: 'Karen J.', date: 'February 2026', rating: 5,
          text: 'Larry spoke at our leadership conference and left the entire room speechless. His blend of Aikido philosophy and personal storytelling was unlike anything we\'ve brought to our team before.' },
        { initials: 'MK', name: 'Marcus K.', date: 'January 2026', rating: 5,
          text: 'Hired Larry for audiobook narration. The final product sounded like a major label production. Detroit talent at its finest.' },
        { initials: 'TC', name: 'Thomas C.', date: 'November 2025', rating: 5,
          text: 'Larry gave an incredibly inspiring story at our event. His ability to connect with the audience through vocal variety, facial expressions, and body gestures was truly amazing.' },
      ],
    },
    // ── ARTICLE 3: Faren Young — PREMIUM FOUNDER FEATURE
    {
      id: 'faren-young-nui-2026',
      slug: 'faren-young-new-urban-influence-detroit',
      title: 'Faren Young Is Building Detroit\'s Creative Economy — One Brand at a Time',
      dek: 'From co-founding Bravo Graphix on the Avenue of Fashion to running Detroit\'s most complete branding and AI automation agency, Faren Young has spent 20 years doing the one thing Detroit respects most: building something real.',
      category: 'agencies',
      categoryLabel: 'Agency Founder',
      author: 'NUI Editorial',
      publishedAt: '2026-03-16',
      readTime: '8 min read',
      featured: true,
      premium: true,
      award: 'NUI Detroit Founder Spotlight 2026',
      awardLabel: 'Detroit Creative Leader — NUI Magazine',
      heroImage: '/images/about-story.png',
      profileImage: '/images/magazine/faren-young-profile.png',
      profileBio: 'Native Detroiter. Creative Director & Founder of New Urban Influence. Co-founder of Bravo Graphix. 20+ years building brands across Michigan and nationwide. Obsessed with making small businesses look like Fortune 500 companies.',
      ownerBio: {
        label: 'Founder & Creative Director — New Urban Influence',
        headline: 'The Architect of Detroit\'s Next Brand Era',
        body: 'Martez Hand — known creatively as Faren Young — grew up on Detroit\'s West Side where hustle wasn\'t a buzzword, it was survival. He co-founded Bravo Graphix in 2007, built it to a 1,700 sq ft studio on the Avenue of Fashion, got covered by Rolling Out, Model D Media, and the Detroit Free Press, then evolved the entire operation into New Urban Influence — Detroit\'s most complete branding and AI automation agency.',
        stats: [
          { val: '2007', label: 'Year Founded' },
          { val: '50+', label: 'Brands Built' },
          { val: '$2M+', label: 'Client Revenue' },
          { val: '4.9★', label: '31 Google Reviews' },
        ],
        tags: ['Branding', 'AI Automation', 'Detroit Native', 'Avenue of Fashion', 'NUI Founder'],
      },
      tags: ['Detroit', 'Branding Agency', 'Founder', 'Bravo Graphix', 'Avenue of Fashion', 'NUI'],
      body: `Martez Hand grew up on Detroit's West Side. Where hustle wasn't a buzzword — it was survival. It was culture. It was the blueprint. The world would come to know him as Faren Young: Creative Director, brand strategist, and the founder of one of Metro Detroit's most recognized creative agencies.

But before any of that, there was a designer with a vision bigger than any canvas could hold, and a city that would either sharpen him or break him. Detroit sharpened him.

## Bravo Graphix: Born on the West Side

In 2007, Faren co-founded Bravo Graphix alongside Donald Hand — a full-service multicultural advertising, creative marketing, design, and print agency. They started at Huntington and 7 Mile Rd. on Detroit's upper West Side, with nothing but talent, drive, and a deep understanding of what Detroit businesses actually needed.

Word traveled fast. By 2013, Bravo Graphix had outgrown its roots. The agency relocated to a completely renovated 1,700-square-foot studio at 19434 Livernois Avenue — right on Detroit's iconic Avenue of Fashion. The new space featured an open floor plan, a dedicated photography studio, and five new hires: two designers, two photographers, and a secretary.

The move didn't go unnoticed. Rolling Out covered it. Model D Media covered it — a feature by Nicole Rupersburg that put Bravo Graphix in front of Detroit's creative and business community. The Detroit Free Press put it in the paper.

*"From postcard design to billboards — we offered everything it took to start, grow, and maintain a business."*

## The Evolution to New Urban Influence

The creative landscape was shifting. Print was meeting digital. Logos were becoming brand ecosystems. Businesses didn't just need a designer — they needed a strategist, a builder, a partner who understood that branding is a revenue system, not just a pretty face.

Faren saw the gap. And he filled it.

New Urban Influence was born — a full-spectrum creative agency built to do what Bravo Graphix pioneered, but at a completely different scale. Brand identity, packaging, print, web design, digital marketing, SEO, email and SMS automation, AI phone assistants, geo-fencing, geo-grid tracking, and Silent Visitor ID — a proprietary system that identifies anonymous website visitors by name, email, and LinkedIn before they ever fill out a form.

It's the kind of stack that Fortune 500 companies pay agencies ten times the price for. NUI delivers it to small businesses, coaches, creators, and entrepreneurs — at a price point designed to level the playing field.

## The Client List Speaks

Over 50 brands elevated. Over $2 million in revenue generated for clients. The list reads like a cross-section of Detroit's most important institutions: UAW. Chrysler. The Office of the Governor of Michigan. Kash Doll. Rep. Leslie Love. Eric Sabree, Wayne County Treasurer. Beacon Park. Kiwanis International. Good Cakes and Bakes. Detroit Design Festival. TechTown SWOT City. Revolve Detroit.

Restaurants, nonprofits, government agencies, political campaigns, product brands, artists, coaches — all transformed by the same West Side Detroit energy that started it all.

## What NUI Is Today

Today, New Urban Influence operates as a full platform — not just an agency. Client portals. Proof approval workflows. Automated marketing pipelines. AI systems that identify, nurture, and convert leads while you sleep.

The NUI Magazine you're reading right now is part of that platform — a citation authority network designed to give Detroit's best creators and business owners the verified online presence they deserve.

*"We don't design. We influence."*

That's not a slogan. It's a precise description of what NUI does. Design is the output. Influence — over perception, over reputation, over the decisions potential clients make before they ever pick up the phone — is the actual product.

It's a long game. Faren Young has been playing it since 2007. He's not stopping.`,
      business: {
        name: 'New Urban Influence',
        category: 'Branding & AI Automation Agency',
        phone: '(248) 487-8747',
        address: 'Detroit',
        city: 'Detroit',
        state: 'MI',
        zip: '',
        website: 'newurbaninfluence.com',
        email: 'info@newurbaninfluence.com',
        instagram: '@newurbaninfluence',
        rating: 4.9,
        reviewCount: 31,
        citationId: 'NUI-DET-2026-0000',
        verifiedDate: 'March 2026',
        verifiedUrl: 'https://newurbaninfluence.com',
        sameAs: ['Google', 'Rolling Out', 'Detroit Free Press', 'Model D Media', 'Clutch', 'Yelp'],
        services: [
          'Brand Identity Design', 'Logo Design', 'Web Design & Development',
          'AI Systems & Automation', 'Email & SMS Automation', 'Geo-Fencing',
          'Silent Visitor ID', 'Print & Packaging', 'Social Media & Ads',
        ],
      },
      reviews: [
        { initials: 'MB', name: 'Miss B', date: 'November 2025', rating: 5, platform: 'Google',
          text: 'I would recommend working with New Urban Influence. My experience with Faren was great — even when I was being a difficult customer. The care and attention put into making sure they understood my vision was amazing.' },
        { initials: 'CB', name: 'Chevelles Bar', date: 'October 2025', rating: 5, platform: 'Google',
          text: 'Faren did a great job on a few flyers for me. Prices were reasonable and the quality was superb. My go-to company for all my promotional needs.' },
        { initials: 'SM', name: 'Sierra Meriwether', date: 'December 2025', rating: 5, platform: 'Google',
          text: 'The best graphic design company in the world. I have been a customer for over 10 years and every time they exceed my expectations.' },
        { initials: 'LC', name: 'Larry Castleberry', date: 'December 2025', rating: 5, platform: 'Google',
          text: 'Great experience. New Urban Influence gives you personal and detailed attention, making you feel like you are their most important customer.' },
      ],
    },
  ],

  getBySlug(slug)  { return this.articles.find(a => a.slug === slug); },
  getFeatured()    { return this.articles.filter(a => a.featured); },
  getByCategory(c) { return this.articles.filter(a => a.category === c); },
  getRecent(n)     { return [...this.articles].sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,n||6); },
  getPremium()     { return this.articles.filter(a => a.premium); },
};
