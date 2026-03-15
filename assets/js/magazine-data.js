// NUI Magazine — Article Data
// Version: 20260316v1
// Source of truth for all magazine content
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
  ],
  articles: [
    {
      id: 'aj-vip-studios-2025',
      slug: 'aj-vip-studios-detroit-photography',
      title: 'AJ VIP Studios: Where Detroit Creatives Come to Be Seen',
      dek: 'Inside the studio redefining professional photography for Detroit\'s rising generation of entrepreneurs, podcasters, and artists.',
      category: 'photographers',
      categoryLabel: 'Photography Studio',
      author: 'NUI Editorial',
      publishedAt: '2025-03-01',
      readTime: '4 min read',
      featured: true,
      award: 'NUI Detroit Creative Award 2025',
      awardLabel: 'Best Photography Studio — Detroit Creator Network',
      tags: ['Detroit', 'Photography', 'Studio', 'Content Creation'],
      body: `When Detroit creatives need to put their best face forward — for a brand launch, a podcast thumbnail, a book cover, or a corporate headshot — they find themselves walking through the doors of AJ VIP Studios on Woodward Avenue.

The studio's reputation has grown steadily through word of mouth in Detroit's creative and entrepreneurial community. From podcast hosts building their brand to restaurateurs documenting their menus, the client list reads like a who's who of Detroit's creative economy.

## Services that set them apart

Unlike standard portrait studios, AJ VIP offers a full production environment — with podcast recording, event coverage, and personal brand photography all available under one roof. Clients can shoot a headshot series, record a podcast episode, and walk out with a full content package in a single visit.

## Recognition and community impact

AJ VIP Studios was recognized by New Urban Influence as part of the NUI Creator Network — a curated directory of Detroit's top creative businesses. The studio holds a 4.9-star rating across verified platforms with over 22 client reviews.`,
      business: {
        name: 'AJ VIP Studios',
        category: 'Photography Studio',
        phone: '(313) 555-1234',
        address: '123 Woodward Ave',
        city: 'Detroit', state: 'MI', zip: '48201',
        website: 'ajvipstudios.com',
        rating: 4.9, reviewCount: 22,
        citationId: 'NUI-DET-2025-0014',
        verifiedDate: 'March 2025',
        sameAs: ['Google', 'Yelp', 'Facebook', 'Foursquare'],
        services: ['Portrait Photography', 'Podcast Studio', 'Event Photography', 'Brand Content'],
      },
      reviews: [
        { initials:'MT', name:'Marcus T.', date:'February 2025', rating:5,
          text:'Walked in for headshots and walked out with a full brand shoot. Fastest turnaround in Detroit — edited photos back in 48 hours.' },
        { initials:'SJ', name:'Simone J.', date:'January 2025', rating:5,
          text:'Used the podcast studio for my launch episode. Sound quality was incredible. This is the only studio in Detroit set up for creators.' },
        { initials:'DR', name:'David R.', date:'December 2024', rating:4,
          text:'Professional from booking to delivery. The studio environment is exactly what you\'d expect from a premium LA or NYC operation — right here in Detroit.' },
      ]
    },
    {
      id: 'larry-castleberry-2025',
      slug: 'larry-castleberry-detroit-author-voice-actor',
      title: 'Larry Castleberry: The Voice Detroit Didn\'t Know It Needed',
      dek: 'How a Detroit author and voice actor is building a national platform from the ground up — and why his story resonates far beyond Michigan.',
      category: 'authors',
      categoryLabel: 'Author & Voice Actor',
      author: 'NUI Editorial',
      publishedAt: '2025-02-15',
      readTime: '5 min read',
      featured: true,
      award: null,
      tags: ['Detroit', 'Author', 'Voice Actor', 'Speaker'],
      body: `Larry Castleberry has spent years refining a skill most people never develop — the ability to hold a room, whether that room holds ten people or ten thousand, and whether the medium is a printed page, a podcast mic, or a stage.

The Detroit-based author, speaker, and voice actor has built a reputation that extends well beyond the city limits, drawing clients and audiences from across the country who are drawn to his particular combination of authenticity, craft, and presence.

## The body of work

Castleberry's published work spans multiple genres, with a consistent thread — storytelling rooted in real experience, written for readers who want substance alongside narrative. His voice work is equally varied: corporate narration, audiobook production, commercial spots.

## Why Detroit

Asked why he's stayed in Detroit when opportunities in larger markets have come calling, the answer is immediate. Detroit is the story. Building something here, being part of this city's creative resurgence — that's the work.

New Urban Influence is proud to feature Larry Castleberry as a founding member of the NUI Creator Network.`,
      business: {
        name: 'Larry Castleberry',
        category: 'Author & Voice Actor',
        phone: '(313) 555-8800',
        address: 'Detroit',
        city: 'Detroit', state: 'MI', zip: '',
        website: 'larrycastleberry.com',
        rating: 5.0, reviewCount: 18,
        citationId: 'NUI-DET-2025-0002',
        verifiedDate: 'February 2025',
        sameAs: ['Google', 'Apple Maps', 'Bing', 'Facebook'],
        services: ['Speaking', 'Voice Acting', 'Audiobooks', 'Corporate Narration'],
      },
      reviews: [
        { initials:'TC', name:'Tanya C.', date:'January 2025', rating:5,
          text:'Larry spoke at our corporate event and absolutely held the room. We\'ve had speakers before but never like this. Already booked him for our Q3 summit.' },
        { initials:'MK', name:'Marcus K.', date:'December 2024', rating:5,
          text:'Hired Larry for audiobook narration. The final product sounded like a major label production. Detroit talent at its finest.' },
      ]
    },
  ],

  // Helpers
  getBySlug(slug)     { return this.articles.find(a => a.slug === slug); },
  getFeatured()       { return this.articles.filter(a => a.featured); },
  getByCategory(cat)  { return this.articles.filter(a => a.category === cat); },
  getRecent(n = 6)    { return [...this.articles].sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0,n); },
};
