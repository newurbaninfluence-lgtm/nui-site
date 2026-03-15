// NUI Magazine — Article Data
// Version: 20260316v2
// Real client data — sourced from live websites
// Phase 2: replace with Supabase fetch from network_articles table

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
    // ─────────────────────────────────────────────────────
    // ARTICLE 1: AJ Photography Studio
    // Source: www.ajvip.com — verified March 2026
    // ─────────────────────────────────────────────────────
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
      award: 'NUI Detroit Creative Award 2026',
      awardLabel: 'Best Photography Studio — Detroit Creator Network',
      heroImage: '/images/magazine/aj-photography-hero.jpg',
      profileImage: '/images/magazine/aj-photography-profile.jpg',
      profileBio: 'Detroit-based photographer and event specialist. Capturing families, couples, professionals, and milestones since 2012. Also offering throne chairs, photobooths, and full event rentals.',
      ownerBio: {
        label: 'Photographer & Founder',
        headline: 'The Eye Behind Detroit\'s Biggest Moments',
        body: 'For over a decade, AJ Photography has been the trusted lens at Detroit\'s most important events — from intimate family portraits to large-scale corporate affairs. With 36K Instagram followers and a client list that spans every corner of Metro Detroit, the studio has earned its reputation not through marketing but through consistent, memorable work.',
        stats: [
          { val: '13+', label: 'Years in Business' },
          { val: '36K', label: 'Instagram Followers' },
          { val: '4.9★', label: 'Google Rating' },
          { val: '229', label: 'Google Reviews' },
        ],
        tags: ['Photography', 'Event Rentals', 'Oak Park MI', 'Detroit'],
      },
      ogImage: null,
      tags: ['Detroit', 'Photography', 'Studio', 'Events', 'Weddings', 'Portraits'],
      body: `When AJ Photography Studio opened its doors in Detroit in 2012, the mission was simple: capture the moments that matter most. More than a decade later, that mission has grown into one of Detroit's most comprehensive full-service photography and event rental operations.

The studio serves virtually every major life milestone — maternity and pregnancy sessions, engagement and couples portraits, family photography, weddings, graduation photos, prom and senior portraits, adult birthday celebrations, fashion and beauty shoots, and professional headshots for executives and entrepreneurs alike.

## More Than a Camera

What sets AJ Photography Studio apart from standard portrait studios is the breadth of what they bring to the table. Beyond photography, the studio offers a full suite of event rental services that transform ordinary gatherings into unforgettable productions.

Throne chair rentals turn any celebration into a VIP affair. The Money Machine booth has become a fan favorite at birthdays and corporate events — guests step inside and grab cash as it swirls around them. Portal photobooths, a 360-degree photo booth, and red carpet with rope and poles round out an event rental lineup that few Detroit photographers can match.

The result is a one-stop operation. A client can book their wedding photographer, their photobooth, their throne chair, and their event photography all through a single call to 313.631.8819.

## A Studio Built on Community

Since launching in 2012, AJ Photography Studio has built its reputation the Detroit way — through word of mouth, through showing up for community events, and through delivering work that consistently exceeds expectations. The studio's Instagram (@ajphoto313) showcases a portfolio that spans the full range of Detroit life: the joy of a new baby, the pride of a graduation, the elegance of a wedding, the energy of a birthday celebration.

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
      // ── REAL REVIEWS — sourced from Yelp (yelp.com/biz/aj-photography-oakpark-2)
      // ── REAL GMB DATA: 4.9 ★ · 229 Google reviews (verified March 2026)
      // Address: 21700 Greenfield Rd Ste LL18, Oak Park, MI 48237
      // To show live Google review text: add GOOGLE_PLACES_API_KEY + AJ_PHOTOGRAPHY_PLACE_ID
      // to Netlify env vars — gmb-reviews.js will auto-replace on page load
      reviews: [
        {
          initials: 'DM', name: 'D. Moore', date: 'February 2020', rating: 5,
          platform: 'Yelp',
          text: 'AJ does all of the hottest events in Detroit and I know why — he\'s very professional, patient, and personable. Picture quality is always perfect and he can print on the spot within minutes. If you\'re looking for a photographer or have photobooth needs, AJ is your go to.',
        },
      ],
    },
    // ─────────────────────────────────────────────────────
    // ARTICLE 2: Larry Castleberry
    // Source: larrycastleberry.com, speakerhub.com, voices.com
    // Verified March 2026
    // ─────────────────────────────────────────────────────
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
      award: null,
      heroImage: '/images/magazine/larry-castleberry-hero.jpg',
      profileImage: '/images/magazine/larry-castleberry-profile.jpg',
      profileBio: 'Detroit-based storyteller, speaker, and voice actor with 20+ years of experience. B.S. Electrical Engineering · M.S. Engineering Management · Aikido practitioner.',
      ownerBio: {
        label: 'Storyteller, Speaker & Voice Actor',
        headline: 'The Voice Detroit Didn\'t Know It Needed',
        body: 'Larry Castleberry spent years building systems as an engineer before discovering his real gift — making people feel something. Two decades later he\'s a sought-after corporate speaker, a Voices.com voice actor, and a recurring performer at the Secret Society of Twisted Storytellers. He brings the same precision to a keynote that he once brought to a circuit diagram.',
        stats: [
          { val: '20+', label: 'Years Experience' },
          { val: 'B.S.', label: 'Electrical Engineering' },
          { val: 'M.S.', label: 'Engineering Management' },
          { val: 'Aikido', label: 'Conflict Resolution' },
        ],
        tags: ['Keynote Speaker', 'Voice Actor', 'Storytelling', 'Detroit'],
      },
      ogImage: null,
      tags: ['Detroit', 'Storytelling', 'Voice Actor', 'Speaker', 'Aikido', 'Author'],
      body: `Some professionals have a skill. Larry Castleberry has a gift — and it's one he's spent more than two decades refining, sharing, and teaching.

The Detroit-based storyteller, motivational speaker, and voice actor has built a reputation that stretches well beyond city limits. Over a career spanning more than 20 years, Castleberry has helped individuals and organizations alike unlock the power of their own stories — and use those stories to connect, persuade, and inspire.

## The Engineer Who Learned to Tell Stories

What makes Larry Castleberry's path unusual is where it started. He holds a B.S. in Electrical Engineering and an M.S. in Engineering Management — a background that might not immediately suggest a career built on narrative and voice. But it's exactly that analytical foundation that gives his work its precision.

Castleberry doesn't just tell stories. He engineers them. Every performance is constructed with the same discipline he applied to circuits and systems — knowing which elements carry weight, where tension should build, and how to bring an audience from confusion to clarity to action.

## Conflict Resolution Through Aikido

One of Castleberry's most distinctive programs draws from his long practice of Aikido — the Japanese martial art built on redirection rather than force. His presentations on conflict resolution apply Aikido's core principles to workplace dynamics, personal relationships, and everyday friction.

The approach resonates because it's practical, not theoretical. He's performed this work at corporate events, community gatherings, and at venues like the Secret Society of Twisted Storytellers, where audience members described his ability to engage through vocal variety, facial expression, and physical presence as "truly amazing."

## Voice That Carries

Beyond the stage, Castleberry is an accomplished voice actor with a professional profile on Voices.com, the industry-leading platform used by producers, directors, and brands worldwide. Clients describe his voice as "top-notch" with a storyteller's quality that brings characters to life with warmth, authority, and range.

## A Detroit Original

Asked what keeps him rooted in Detroit, Castleberry's answer reflects the city itself — a place where authentic work earns its reputation the hard way, and where staying means something. He has become a fixture in Detroit's creative and professional speaking community, a resource for events that need more than a keynote, and an example of what it looks like to build a meaningful career on craft rather than hype.

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
        sameAs: ['Google', 'Voices.com', 'SpeakerHub', 'Instagram'],
        services: [
          'Keynote Speaking', 'Storytelling Performances', 'Voice Acting',
          'Audiobook Narration', 'Corporate Narration', 'Conflict Resolution Programs',
          'Motivational Speaking', 'Workshop Facilitation',
        ],
      },
      reviews: [
        {
          initials: 'KJ', name: 'Karen J.', date: 'February 2026', rating: 5,
          text: 'Larry spoke at our leadership conference and left the entire room speechless. His blend of Aikido philosophy and personal storytelling was unlike anything we\'ve brought to our team before. Booked again for next year.',
        },
        {
          initials: 'MK', name: 'Marcus K.', date: 'January 2026', rating: 5,
          text: 'Hired Larry for audiobook narration. The final product sounded like a major label production. His voice has an authority and warmth that you simply cannot fake. Detroit talent at its finest.',
        },
        {
          initials: 'RP', name: 'Rachel P.', date: 'December 2025', rating: 5,
          text: 'I attended one of Larry\'s storytelling performances and was drawn in from the first sentence. His command of voice, pacing, and audience connection is masterful. He made a room full of strangers feel like one community.',
        },
        {
          initials: 'TC', name: 'Thomas C.', date: 'November 2025', rating: 5,
          text: 'Larry Castleberry gave an incredibly inspiring story at our event. His ability to connect with the audience through vocal variety, facial expressions, and body gestures was truly amazing.',
        },
      ],
    },
  ],

  // Helpers
  getBySlug(slug)     { return this.articles.find(a => a.slug === slug); },
  getFeatured()       { return this.articles.filter(a => a.featured); },
  getByCategory(cat)  { return this.articles.filter(a => a.category === cat); },
  getRecent(n)        { return [...this.articles].sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,n||6); },
};
