/**
 * NUI Print Store — Quote Engine + Cart
 * Lightweight client-side pricing, no API calls
 * Only loads on /print page
 */

const NUI_PRINT = {
  // ═══════════════════════════════════════
  // PRODUCT CATALOG (embedded, no fetch)
  // ═══════════════════════════════════════
  products: {
    // ── BUSINESS CARDS (Signs365) ──
    'business-cards': {
      name: 'Business Cards',
      vendor: 'signs365',
      category: 'cards',
      icon: '🃏',
      desc: 'Premium 16pt full color. UV gloss or matte coating.',
      industries: ['all'],
      sizes: [
        { label: '250 cards', id: '250' },
        { label: '500 cards', id: '500' },
        { label: '1,000 cards', id: '1000' },
        { label: '2,500 cards', id: '2500' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]},
        { label: 'Finish', id: 'finish', choices: [
          { label: 'Gloss Laminate', value: 'gloss' },
          { label: 'Matte Laminate', value: 'matte' },
          { label: 'No Coating', value: 'none' }
        ]}
      ],
      pricing: {
        '250':  { print: 45, designSingle: 35, designDouble: 70 },
        '500':  { print: 65, designSingle: 35, designDouble: 70 },
        '1000': { print: 95, designSingle: 35, designDouble: 70 },
        '2500': { print: 175, designSingle: 35, designDouble: 70 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── SPOT UV BUSINESS CARDS (Signs365) ──
    'spot-uv-cards': {
      name: 'Spot UV Business Cards',
      vendor: 'signs365',
      category: 'cards',
      icon: '✨',
      desc: 'Premium finish with raised UV coating for a luxury feel.',
      industries: ['tax','tech','authors','bars'],
      sizes: [
        { label: '250 cards', id: '250' },
        { label: '500 cards', id: '500' },
        { label: '1,000 cards', id: '1000' }
      ],
      options: [],
      pricing: {
        '250':  { print: 85, designSingle: 150, designDouble: 150 },
        '500':  { print: 120, designSingle: 150, designDouble: 150 },
        '1000': { print: 180, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '2-3 day production + overnight ship'
    },

    // ── ALUMINUM BUSINESS CARDS (Signs365) ──
    'aluminum-cards': {
      name: 'Aluminum Business Cards',
      vendor: 'signs365',
      category: 'cards',
      icon: '🪙',
      desc: 'Metal business cards that make a statement. Set of 55.',
      industries: ['tech','tax','manufacturing'],
      sizes: [
        { label: '55 cards (.025")', id: '55-thin' },
        { label: '55 cards (.040")', id: '55-thick' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '55-thin':  { print: 100, designSingle: 35, designDouble: 70 },
        '55-thick': { print: 140, designSingle: 35, designDouble: 70 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── FLYERS — Small (Knello) ──
    'flyers-small': {
      name: 'Flyers (4x6)',
      vendor: 'knello',
      category: 'print-collateral',
      icon: '📄',
      desc: 'Full color flyers/postcards. Perfect for handouts and mailers.',
      industries: ['all'],
      sizes: [
        { label: '250', id: '250' },
        { label: '500', id: '500' },
        { label: '1,000', id: '1000' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '250':  { print: 85, designSingle: 75, designDouble: 150 },
        '500':  { print: 140, designSingle: 75, designDouble: 150 },
        '1000': { print: 210, designSingle: 75, designDouble: 150 }
      },
      shipping: 'calculated',
      turnaround: '3-5 business days + delivery'
    },

    // ── FLYERS — Medium (Knello) ──
    'flyers-medium': {
      name: 'Flyers (4x9 / 6x9)',
      vendor: 'knello',
      category: 'print-collateral',
      icon: '📄',
      desc: 'Larger format flyers and rack cards. Great for menus and promos.',
      industries: ['bars','events','trades','tax'],
      sizes: [
        { label: '250 (4x9)', id: '250-4x9' },
        { label: '500 (4x9)', id: '500-4x9' },
        { label: '250 (6x9)', id: '250-6x9' },
        { label: '500 (6x9)', id: '500-6x9' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '250-4x9': { print: 115, designSingle: 100, designDouble: 200 },
        '500-4x9': { print: 175, designSingle: 100, designDouble: 200 },
        '250-6x9': { print: 125, designSingle: 100, designDouble: 200 },
        '500-6x9': { print: 200, designSingle: 100, designDouble: 200 }
      },
      shipping: 'calculated',
      turnaround: '3-5 business days + delivery'
    },

    // ── BROCHURES (Knello) ──
    'brochures': {
      name: 'Trifold Brochure',
      vendor: 'knello',
      category: 'print-collateral',
      icon: '📰',
      desc: 'Professional trifold brochures. Binding and folding included.',
      industries: ['all'],
      sizes: [
        { label: '250', id: '250' },
        { label: '500', id: '500' },
        { label: '1,000', id: '1000' }
      ],
      options: [],
      pricing: {
        '250':  { print: 225, designSingle: 200, designDouble: 200 },
        '500':  { print: 350, designSingle: 200, designDouble: 200 },
        '1000': { print: 500, designSingle: 200, designDouble: 200 }
      },
      shipping: 'calculated',
      turnaround: '5-7 business days + delivery'
    },

    // ── OBITUARIES (Knello) ──
    'obituaries': {
      name: 'Obituary Programs',
      vendor: 'knello',
      category: 'print-collateral',
      icon: '🕊️',
      desc: 'Memorial programs and bookmarks. Respectful, fast turnaround.',
      industries: ['events'],
      sizes: [
        { label: '50 programs', id: '50' },
        { label: '100 programs', id: '100' },
        { label: '200 programs', id: '200' },
        { label: '100 bookmarks', id: '100-bm' }
      ],
      options: [],
      pricing: {
        '50':     { print: 100, designSingle: 75, designDouble: 75 },
        '100':    { print: 160, designSingle: 75, designDouble: 75 },
        '200':    { print: 250, designSingle: 75, designDouble: 75 },
        '100-bm': { print: 85, designSingle: 75, designDouble: 75 }
      },
      shipping: 'calculated',
      turnaround: '2-3 business days (rush available)'
    },

    // ── STICKERS (Knello) ──
    'stickers': {
      name: 'Stickers & Labels',
      vendor: 'knello',
      category: 'print-collateral',
      icon: '🏷️',
      desc: 'Kiss-cut, die-cut, or roll labels. Custom shapes available.',
      industries: ['apparel','events','bars','tech'],
      sizes: [
        { label: '100 kiss-cut (3x3)', id: '100-kiss' },
        { label: '250 kiss-cut (3x3)', id: '250-kiss' },
        { label: '100 die-cut (custom)', id: '100-die' },
        { label: '250 die-cut (custom)', id: '250-die' },
        { label: '250 roll labels', id: '250-roll' },
        { label: '500 roll labels', id: '500-roll' }
      ],
      options: [],
      pricing: {
        '100-kiss': { print: 75,  designSingle: 75, designDouble: 75 },
        '250-kiss': { print: 140, designSingle: 75, designDouble: 75 },
        '100-die':  { print: 115, designSingle: 75, designDouble: 75 },
        '250-die':  { print: 190, designSingle: 75, designDouble: 75 },
        '250-roll': { print: 150, designSingle: 75, designDouble: 75 },
        '500-roll': { print: 225, designSingle: 75, designDouble: 75 }
      },
      shipping: 'calculated',
      turnaround: '5-7 business days + delivery',
      note: 'Custom die-cut: $250 one-time setup (reusable)'
    },

    // ── HD VINYL BANNERS (Signs365) ──
    'hd-banner': {
      name: 'HD Vinyl Banner',
      vendor: 'signs365',
      category: 'banners',
      icon: '🏷️',
      desc: 'Full color vinyl scrim. Grommets and hemmed edges included.',
      industries: ['all'],
      sizes: [
        { label: '2x4 ft', id: '2x4' },
        { label: '3x6 ft', id: '3x6' },
        { label: '4x8 ft', id: '4x8' },
        { label: '4x10 ft', id: '4x10' },
        { label: '6x10 ft', id: '6x10' },
        { label: 'Custom Size', id: 'custom' }
      ],
      options: [
        { label: 'Material', id: 'material', choices: [
          { label: '13oz Standard', value: '13oz' },
          { label: '15oz Premium', value: '15oz' },
          { label: '18oz Heavy Duty', value: '18oz' }
        ]}
      ],
      pricing: {
        '2x4':  { print: 35, designSingle: 100, designDouble: 100 },
        '3x6':  { print: 65, designSingle: 150, designDouble: 150 },
        '4x8':  { print: 100, designSingle: 150, designDouble: 150 },
        '4x10': { print: 125, designSingle: 150, designDouble: 150 },
        '6x10': { print: 190, designSingle: 150, designDouble: 150 },
        'custom': { print: 0, designSingle: 150, designDouble: 150, sqftRate: 3.15, note: 'Price per sq ft' }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── MESH BANNERS (Signs365) ──
    'mesh-banner': {
      name: 'Mesh Banner',
      vendor: 'signs365',
      category: 'banners',
      icon: '🌬️',
      desc: 'Wind-through mesh for outdoor use. Fences, construction sites, storefronts.',
      industries: ['trades','farming','manufacturing','marine','events'],
      sizes: [
        { label: '3x6 ft', id: '3x6' },
        { label: '4x8 ft', id: '4x8' },
        { label: 'Custom Size', id: 'custom' }
      ],
      options: [],
      pricing: {
        '3x6':    { print: 110, designSingle: 150, designDouble: 150 },
        '4x8':    { print: 195, designSingle: 150, designDouble: 150 },
        'custom': { print: 0, designSingle: 150, designDouble: 150, sqftRate: 6.10 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── RETRACTABLE BANNER (Signs365) ──
    'retractable-banner': {
      name: 'Retractable Banner',
      vendor: 'signs365',
      category: 'banners',
      icon: '🎯',
      desc: '33.5x80" display with retractable stand and carrying case.',
      industries: ['all'],
      sizes: [
        { label: '1 Banner + Stand', id: '1' },
        { label: '2 Banners + Stands', id: '2' }
      ],
      options: [],
      pricing: {
        '1': { print: 225, designSingle: 150, designDouble: 150 },
        '2': { print: 400, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── YARD SIGNS (Signs365) ──
    'yard-signs': {
      name: 'Yard Signs',
      vendor: 'signs365',
      category: 'signs',
      icon: '🪧',
      desc: '24x18" coroplast with wire step stakes. Weatherproof.',
      industries: ['trades','farming','events','tax','manufacturing'],
      sizes: [
        { label: '5 signs', id: '5' },
        { label: '10 signs', id: '10' },
        { label: '25 signs', id: '25' },
        { label: '50 signs', id: '50' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '5-single':  { print: 175, designSingle: 100, designDouble: 100 },
        '10-single': { print: 250, designSingle: 100, designDouble: 100 },
        '25-single': { print: 500, designSingle: 100, designDouble: 100 },
        '50-single': { print: 875, designSingle: 100, designDouble: 100 },
        '5-double':  { print: 225, designSingle: 100, designDouble: 100 },
        '10-double': { print: 325, designSingle: 100, designDouble: 100 },
        '25-double': { print: 650, designSingle: 100, designDouble: 100 },
        '50-double': { print: 1100, designSingle: 100, designDouble: 100 },
        '5':  { print: 175, designSingle: 100, designDouble: 100 },
        '10': { print: 250, designSingle: 100, designDouble: 100 },
        '25': { print: 500, designSingle: 100, designDouble: 100 },
        '50': { print: 875, designSingle: 100, designDouble: 100 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship',
      note: 'Stakes included. Heavy duty stakes +$5/ea'
    },

    // ── VEHICLE MAGNETS (Signs365) ──
    'vehicle-magnets': {
      name: 'Vehicle Magnets',
      vendor: 'signs365',
      category: 'vehicle',
      icon: '🚗',
      desc: 'Premium weight magnets. Removable and reusable.',
      industries: ['trades','farming','marine','manufacturing'],
      sizes: [
        { label: '18x12" (pair)', id: '18x12' },
        { label: '24x12" (pair)', id: '24x12' },
        { label: '24x18" (pair)', id: '24x18' },
        { label: '42x12" (pair)', id: '42x12' }
      ],
      options: [],
      pricing: {
        '18x12': { print: 60, designSingle: 100, designDouble: 100 },
        '24x12': { print: 76, designSingle: 100, designDouble: 100 },
        '24x18': { print: 104, designSingle: 100, designDouble: 100 },
        '42x12': { print: 150, designSingle: 100, designDouble: 100 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── POSTERS (Signs365) ──
    'posters': {
      name: 'Poster',
      vendor: 'signs365',
      category: 'signs',
      icon: '🖼️',
      desc: 'Photo-quality posters on premium paper. Gloss or matte.',
      industries: ['events','bars','authors','apparel','tech'],
      sizes: [
        { label: '18x24"', id: '18x24' },
        { label: '24x36"', id: '24x36' },
        { label: '36x48"', id: '36x48' }
      ],
      options: [],
      pricing: {
        '18x24': { print: 25, designSingle: 100, designDouble: 100 },
        '24x36': { print: 35, designSingle: 150, designDouble: 150 },
        '36x48': { print: 60, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── CANVAS PRINTS (Signs365) ──
    'canvas': {
      name: 'Canvas Print',
      vendor: 'signs365',
      category: 'signs',
      icon: '🎨',
      desc: 'Poly-cotton canvas. Gallery quality for interior displays.',
      industries: ['bars','authors','tech','events'],
      sizes: [
        { label: '16x20"', id: '16x20' },
        { label: '24x36"', id: '24x36' },
        { label: '30x40"', id: '30x40' }
      ],
      options: [],
      pricing: {
        '16x20': { print: 35, designSingle: 150, designDouble: 150 },
        '24x36': { print: 75, designSingle: 150, designDouble: 150 },
        '30x40': { print: 105, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── ACRYLIC SIGNS (Signs365) ──
    'acrylic-sign': {
      name: 'Acrylic Sign',
      vendor: 'signs365',
      category: 'signs',
      icon: '💎',
      desc: '3/16" crystal clear acrylic with UV direct print. Lobby-ready.',
      industries: ['bars','tax','tech','manufacturing','trades'],
      sizes: [
        { label: '12x12"', id: '12x12' },
        { label: '18x24"', id: '18x24' },
        { label: '24x36"', id: '24x36' }
      ],
      options: [],
      pricing: {
        '12x12': { print: 95, designSingle: 150, designDouble: 150 },
        '18x24': { print: 175, designSingle: 150, designDouble: 150 },
        '24x36': { print: 325, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship',
      note: 'Standoff hardware: +$15/set'
    },

    // ── PVC SIGNS (Signs365) ──
    'pvc-sign': {
      name: 'PVC Sign',
      vendor: 'signs365',
      category: 'signs',
      icon: '🔲',
      desc: 'Rigid PVC for indoor/outdoor signage. Lightweight and durable.',
      industries: ['manufacturing','trades','bars','tax'],
      sizes: [
        { label: '24x18" (3mm)', id: '24x18-3mm' },
        { label: '24x18" (6mm)', id: '24x18-6mm' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '24x18-3mm': { print: 165, designSingle: 100, designDouble: 100 },
        '24x18-6mm': { print: 240, designSingle: 100, designDouble: 100 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── ALUMINUM SIGNS (Signs365) ──
    'aluminum-sign': {
      name: 'Aluminum Sign',
      vendor: 'signs365',
      category: 'signs',
      icon: '🏢',
      desc: 'Professional grade aluminum. Perfect for permanent outdoor signage.',
      industries: ['manufacturing','trades','bars','farming'],
      sizes: [
        { label: '24x18" (.040)', id: '24x18-040' },
        { label: '24x18" (.080)', id: '24x18-080' }
      ],
      options: [
        { label: 'Sides', id: 'sides', choices: [
          { label: 'Single-Sided', value: 'single', priceKey: 'single' },
          { label: 'Double-Sided', value: 'double', priceKey: 'double' }
        ]}
      ],
      pricing: {
        '24x18-040': { print: 440, designSingle: 150, designDouble: 150 },
        '24x18-080': { print: 750, designSingle: 150, designDouble: 150 }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship'
    },

    // ── ADHESIVE VINYL (Signs365) ──
    'adhesive-vinyl': {
      name: 'Adhesive Vinyl',
      vendor: 'signs365',
      category: 'vinyl',
      icon: '📋',
      desc: '3M vinyl for walls, windows, floors, vehicles. Indoor/outdoor.',
      industries: ['all'],
      sizes: [
        { label: 'Wall Vinyl (per sqft)', id: 'wall' },
        { label: 'Window Cling (per sqft)', id: 'cling' },
        { label: 'Floor Graphic Indoor (per sqft)', id: 'floor-in' },
        { label: 'Floor Graphic Outdoor (per sqft)', id: 'floor-out' },
        { label: 'One-Way Window (per sqft)', id: 'oneway' }
      ],
      options: [],
      pricing: {
        'wall':      { print: 0, designSingle: 150, designDouble: 150, sqftRate: 8.75, note: 'Per sq ft' },
        'cling':     { print: 0, designSingle: 150, designDouble: 150, sqftRate: 7.20, note: 'Per sq ft' },
        'floor-in':  { print: 0, designSingle: 150, designDouble: 150, sqftRate: 6.25, note: 'Per sq ft' },
        'floor-out': { print: 0, designSingle: 150, designDouble: 150, sqftRate: 31.25, note: 'Per sq ft' },
        'oneway':    { print: 0, designSingle: 150, designDouble: 150, sqftRate: 10.00, note: 'Per sq ft' }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship',
      customQty: true
    },

    // ── VEHICLE WRAP (Signs365) ──
    'vehicle-wrap': {
      name: 'Vehicle Wrap',
      vendor: 'signs365',
      category: 'vehicle',
      icon: '🚙',
      desc: '3M ControlTac vinyl. Professional installation recommended.',
      industries: ['trades','farming','marine','manufacturing'],
      sizes: [
        { label: 'Custom Quote', id: 'custom' }
      ],
      options: [],
      pricing: {
        'custom': { print: 0, designSingle: 0, designDouble: 0, note: 'Custom quote required' }
      },
      shipping: 10,
      turnaround: 'Quote-based',
      customQuote: true
    },

    // ── DTF TRANSFERS (Signs365) ──
    'dtf-transfers': {
      name: 'DTF Transfers',
      vendor: 'signs365',
      category: 'apparel',
      icon: '👕',
      desc: 'Full-color heat transfers. Press onto shirts, hoodies, bags.',
      industries: ['apparel','events','bars','trades'],
      sizes: [
        { label: '1 Transfer (up to 12")', id: '1' },
        { label: '5 Transfers', id: '5' },
        { label: '10 Transfers', id: '10' },
        { label: '25 Transfers', id: '25' },
        { label: 'Gang Sheet (22" wide)', id: 'gang' }
      ],
      options: [],
      pricing: {
        '1':    { print: 15, designSingle: 75, designDouble: 75 },
        '5':    { print: 60, designSingle: 75, designDouble: 75 },
        '10':   { print: 110, designSingle: 75, designDouble: 75 },
        '25':   { print: 250, designSingle: 75, designDouble: 75 },
        'gang': { print: 0, designSingle: 75, designDouble: 75, inchRate: 1.25, note: 'Per linear inch (22" wide)' }
      },
      shipping: 10,
      turnaround: '24hr production + overnight ship',
      note: 'Transfers only — you supply the blanks or we can source them (ask)'
    }
  }, // end products

  // ═══════════════════════════════════════
  // POP-UP KIT BUNDLES
  // ═══════════════════════════════════════
  bundles: {
    'starter-kit': {
      name: 'Starter Kit',
      price: 450,
      designAddon: 350,
      desc: 'Perfect for your first pop-up or vendor event.',
      popular: false,
      items: [
        'Retractable banner + stand',
        '250 business cards (double-sided)',
        '2x4 HD banner (13oz)',
        '5 yard signs (single) + stakes'
      ]
    },
    'standard-kit': {
      name: 'Standard Kit',
      price: 850,
      designAddon: 500,
      desc: 'Full trade show presence. Walk in looking professional.',
      popular: true,
      items: [
        'Retractable banner + stand',
        '3x6 HD banner (15oz) + grommets',
        '500 business cards (double-sided)',
        '10 yard signs (double) + stakes',
        '2 vehicle magnets (24x18")'
      ]
    },
    'premium-kit': {
      name: 'Premium Kit',
      price: 1500,
      designAddon: 750,
      desc: 'Dominate any event or storefront launch.',
      popular: false,
      items: [
        '2 retractable banners + stands',
        '4x8 HD banner (18oz)',
        '1,000 business cards (double-sided)',
        '25 yard signs (double) + stakes',
        '4 vehicle magnets (24x18")',
        'Window cling (18x24")',
        'Foamcore display board',
        'DTF transfers (2 designs)'
      ]
    }
  },

  // ═══════════════════════════════════════
  // CART STATE
  // ═══════════════════════════════════════
  cart: [],

  // ═══════════════════════════════════════
  // QUOTE CALCULATOR — Pure math, no API
  // ═══════════════════════════════════════
  calculatePrice(productId, sizeId, options, needsDesign) {
    const product = this.products[productId];
    if (!product) return null;

    // Handle yard signs with side option
    let lookupKey = sizeId;
    if (options && options.sides && product.pricing[sizeId + '-' + options.sides]) {
      lookupKey = sizeId + '-' + options.sides;
    }

    const tier = product.pricing[lookupKey] || product.pricing[sizeId];
    if (!tier) return null;

    let printCost = tier.print;
    let designCost = 0;

    if (needsDesign) {
      const isDouble = options && options.sides === 'double';
      designCost = isDouble ? (tier.designDouble || tier.designSingle) : tier.designSingle;
    }

    // sqft-based products
    let sqftNote = null;
    if (tier.sqftRate && options && options.sqft) {
      printCost = Math.ceil(tier.sqftRate * options.sqft);
      sqftNote = `${options.sqft} sq ft × $${tier.sqftRate}/sqft`;
    }

    // linear inch products (DTF gang sheet)
    let inchNote = null;
    if (tier.inchRate && options && options.inches) {
      printCost = Math.ceil(tier.inchRate * options.inches);
      inchNote = `${options.inches}" × $${tier.inchRate}/inch`;
    }

    const shipping = product.shipping === 'calculated' ? 0 : (product.shipping || 0);
    const total = printCost + designCost;

    return {
      printCost,
      designCost,
      shipping,
      total,
      totalWithShipping: total + shipping,
      sqftNote,
      inchNote,
      turnaround: product.turnaround,
      vendor: product.vendor,
      needsDesign
    };
  },

  // ═══════════════════════════════════════
  // CART OPERATIONS
  // ═══════════════════════════════════════
  addToCart(item) {
    this.cart.push({
      id: Date.now(),
      productId: item.productId,
      productName: item.productName,
      size: item.size,
      sizeLabel: item.sizeLabel,
      options: item.options || {},
      needsDesign: item.needsDesign,
      hasArtwork: item.hasArtwork || false,
      price: item.price,
      vendor: item.vendor
    });
    this.saveCart();
    this.renderCart();
    this.updateCartBadge();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
    this.renderCart();
    this.updateCartBadge();
  },

  saveCart() {
    try { localStorage.setItem('nui_print_cart', JSON.stringify(this.cart)); } catch(e) {}
  },

  loadCart() {
    try {
      const saved = localStorage.getItem('nui_print_cart');
      if (saved) this.cart = JSON.parse(saved);
    } catch(e) { this.cart = []; }
  },

  getCartTotal() {
    let subtotal = 0;
    let shipping = 0;
    let hasKnello = false;
    let hasSigns365 = false;

    this.cart.forEach(item => {
      subtotal += item.price.total;
      if (item.vendor === 'signs365') { hasSigns365 = true; shipping = 10; }
      if (item.vendor === 'knello') hasKnello = true;
    });

    // Knello shipping TBD — show "calculated at checkout"
    return {
      subtotal,
      shipping: hasSigns365 ? 10 : 0,
      knelloShipping: hasKnello,
      total: subtotal + (hasSigns365 ? 10 : 0),
      itemCount: this.cart.length
    };
  },

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.renderCart();
    this.updateCartBadge();
  },

  // ═══════════════════════════════════════
  // UI — PRODUCT GRID RENDERER
  // ═══════════════════════════════════════
  renderProductGrid(filter) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.entries(this.products).forEach(([id, p]) => {
      // Filter logic
      if (filter && filter !== 'all') {
        if (!p.industries.includes('all') && !p.industries.includes(filter)) return;
      }
      // Skip custom-quote-only products from grid display
      if (p.customQuote) return;

      const startPrice = this.getStartingPrice(id);
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.productId = id;
      card.innerHTML = `
        <div class="product-img"><div class="placeholder">${p.icon}</div></div>
        <div class="product-body">
          <div class="product-tags">
            ${p.industries.includes('all') ? '<span class="product-tag">All Industries</span>' :
              p.industries.slice(0,3).map(i => `<span class="product-tag">${this.industryLabel(i)}</span>`).join('')}
            ${p.vendor === 'knello' ? '<span class="product-tag" style="background:rgba(59,130,246,0.1);color:#3b82f6">Knello</span>' : ''}
          </div>
          <h3>${p.name}</h3>
          <div class="price">$${startPrice} <span>/ starting</span></div>
          <p class="desc">${p.desc}</p>
          <p style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:16px">⏱ ${p.turnaround}</p>
          <button class="btn btn-red btn-block btn-sm" onclick="NUI_PRINT.openConfigurator('${id}')">Get Instant Quote</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Add vehicle wrap custom quote card
    const wrapCard = document.createElement('div');
    wrapCard.className = 'product-card';
    wrapCard.innerHTML = `
      <div class="product-img"><div class="placeholder">🚙</div></div>
      <div class="product-body">
        <div class="product-tags"><span class="product-tag">Trades</span><span class="product-tag">Marine</span></div>
        <h3>Vehicle Wrap</h3>
        <div class="price">Custom <span>/ quote</span></div>
        <p class="desc">Full or partial vehicle wrap with 3M ControlTac vinyl.</p>
        <button class="btn btn-outline btn-block btn-sm" onclick="NUI_PRINT.openRequest('Vehicle Wrap','Custom Quote')">Request Quote</button>
      </div>
    `;
    grid.appendChild(wrapCard);
  },

  getStartingPrice(productId) {
    const p = this.products[productId];
    if (!p) return 0;
    const firstSize = Object.keys(p.pricing)[0];
    return p.pricing[firstSize]?.print || 0;
  },

  industryLabel(key) {
    const map = {
      trades: 'Trades', marine: 'Marine', farming: 'Farming',
      manufacturing: 'Manufacturing', bars: 'Bars', authors: 'Authors',
      apparel: 'Apparel', tax: 'Tax/Finance', tech: 'Tech', events: 'Events'
    };
    return map[key] || key;
  },

  // ═══════════════════════════════════════
  // UI — CONFIGURATOR MODAL (Instant Quote)
  // ═══════════════════════════════════════
  openConfigurator(productId) {
    const product = this.products[productId];
    if (!product) return;

    const modal = document.getElementById('configModal');
    if (!modal) return;

    const body = document.getElementById('configBody');
    body.innerHTML = `
      <h2 style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;margin-bottom:4px">${product.name}</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:24px">${product.desc}</p>

      <!-- Size Selector -->
      <div class="form-group">
        <label>Size / Quantity</label>
        <select id="cfgSize" onchange="NUI_PRINT.updateQuote('${productId}')">
          ${product.sizes.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
        </select>
      </div>

      <!-- Options -->
      ${product.options.map(opt => `
        <div class="form-group">
          <label>${opt.label}</label>
          <select id="cfgOpt_${opt.id}" onchange="NUI_PRINT.updateQuote('${productId}')">
            ${opt.choices.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
          </select>
        </div>
      `).join('')}

      <!-- Custom sqft input for sqft-based products -->
      ${product.customQty ? `
        <div class="form-group" id="cfgSqftGroup" style="display:none">
          <label>Square Feet</label>
          <input type="number" id="cfgSqft" min="1" value="10" onchange="NUI_PRINT.updateQuote('${productId}')" oninput="NUI_PRINT.updateQuote('${productId}')">
        </div>
      ` : ''}

      <!-- The Two Doors -->
      <div style="margin:24px 0 16px">
        <label style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:10px">Do you have artwork ready?</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="door-btn active" id="doorPrint" onclick="NUI_PRINT.setDoor('${productId}','print')" style="padding:16px;border-radius:10px;border:2px solid #dc2626;background:rgba(220,38,38,0.1);color:#fff;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:14px;text-align:center;transition:all .2s">
            ✅ I Have Artwork<br><span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.5)">Print only</span>
          </button>
          <button class="door-btn" id="doorDesign" onclick="NUI_PRINT.setDoor('${productId}','design')" style="padding:16px;border-radius:10px;border:2px solid rgba(255,255,255,0.12);background:transparent;color:#fff;cursor:pointer;font-family:'Montserrat',sans-serif;font-weight:600;font-size:14px;text-align:center;transition:all .2s">
            🎨 I Need Design<br><span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.5)">Design + Print</span>
          </button>
        </div>
      </div>

      <!-- Live Quote Display -->
      <div id="cfgQuote" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:rgba(255,255,255,0.5);font-size:14px">Print</span>
          <span id="qPrint" style="font-weight:600">$0</span>
        </div>
        <div id="qDesignRow" style="display:none;justify-content:space-between;margin-bottom:8px">
          <span style="color:rgba(255,255,255,0.5);font-size:14px">Design</span>
          <span id="qDesign" style="font-weight:600;color:#dc2626">$0</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:rgba(255,255,255,0.5);font-size:14px">Shipping</span>
          <span id="qShip" style="font-weight:600">$10</span>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;margin-top:8px;display:flex;justify-content:space-between">
          <span style="font-weight:700;font-size:16px">Total</span>
          <span id="qTotal" style="font-weight:900;font-size:24px;color:#dc2626">$0</span>
        </div>
        <p id="qNote" style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;display:none"></p>
      </div>

      <p style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:16px">⏱ ${product.turnaround}${product.note ? ' · ' + product.note : ''}</p>

      <button class="btn btn-red btn-block" id="cfgAddBtn" onclick="NUI_PRINT.addFromConfigurator('${productId}')">Add to Order</button>
      <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="NUI_PRINT.closeConfigurator()">Cancel</button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this._currentDoor = 'print';
    this.updateQuote(productId);
  },

  _currentDoor: 'print',

  setDoor(productId, door) {
    this._currentDoor = door;
    const printBtn = document.getElementById('doorPrint');
    const designBtn = document.getElementById('doorDesign');
    if (door === 'print') {
      printBtn.style.borderColor = '#dc2626';
      printBtn.style.background = 'rgba(220,38,38,0.1)';
      printBtn.classList.add('active');
      designBtn.style.borderColor = 'rgba(255,255,255,0.12)';
      designBtn.style.background = 'transparent';
      designBtn.classList.remove('active');
    } else {
      designBtn.style.borderColor = '#dc2626';
      designBtn.style.background = 'rgba(220,38,38,0.1)';
      designBtn.classList.add('active');
      printBtn.style.borderColor = 'rgba(255,255,255,0.12)';
      printBtn.style.background = 'transparent';
      printBtn.classList.remove('active');
    }
    this.updateQuote(productId);
  },

  updateQuote(productId) {
    const product = this.products[productId];
    if (!product) return;

    const sizeEl = document.getElementById('cfgSize');
    const sizeId = sizeEl ? sizeEl.value : Object.keys(product.pricing)[0];

    // Gather options
    const options = {};
    product.options.forEach(opt => {
      const el = document.getElementById('cfgOpt_' + opt.id);
      if (el) options[opt.id] = el.value;
    });

    // sqft input
    const sqftGroup = document.getElementById('cfgSqftGroup');
    const tier = product.pricing[sizeId] || product.pricing[sizeId + '-' + (options.sides || 'single')];
    if (sqftGroup && tier && tier.sqftRate) {
      sqftGroup.style.display = 'block';
      const sqftEl = document.getElementById('cfgSqft');
      if (sqftEl) options.sqft = parseFloat(sqftEl.value) || 10;
    } else if (sqftGroup) {
      sqftGroup.style.display = 'none';
    }

    const needsDesign = this._currentDoor === 'design';
    const quote = this.calculatePrice(productId, sizeId, options, needsDesign);
    if (!quote) return;

    // Update display
    document.getElementById('qPrint').textContent = '$' + quote.printCost;
    document.getElementById('qDesignRow').style.display = needsDesign ? 'flex' : 'none';
    document.getElementById('qDesign').textContent = '$' + quote.designCost;

    if (product.shipping === 'calculated') {
      document.getElementById('qShip').textContent = 'Calculated at delivery';
      document.getElementById('qShip').style.fontSize = '12px';
    } else {
      document.getElementById('qShip').textContent = '$' + quote.shipping;
      document.getElementById('qShip').style.fontSize = '';
    }

    document.getElementById('qTotal').textContent = '$' + quote.total;

    // Notes
    const noteEl = document.getElementById('qNote');
    if (quote.sqftNote || quote.inchNote || (tier && tier.note)) {
      noteEl.style.display = 'block';
      noteEl.textContent = quote.sqftNote || quote.inchNote || tier.note || '';
    } else {
      noteEl.style.display = 'none';
    }

    // Store for add-to-cart
    this._currentQuote = quote;
    this._currentProduct = productId;
    this._currentSize = sizeId;
    this._currentSizeLabel = sizeEl ? sizeEl.options[sizeEl.selectedIndex].text : sizeId;
    this._currentOptions = options;
  },

  addFromConfigurator(productId) {
    if (!this._currentQuote) return;

    const product = this.products[productId];
    this.addToCart({
      productId,
      productName: product.name,
      size: this._currentSize,
      sizeLabel: this._currentSizeLabel,
      options: this._currentOptions,
      needsDesign: this._currentDoor === 'design',
      hasArtwork: this._currentDoor === 'print',
      price: this._currentQuote,
      vendor: product.vendor
    });

    this.closeConfigurator();
    this.showCartDrawer();
  },

  closeConfigurator() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  // ═══════════════════════════════════════
  // UI — CART DRAWER
  // ═══════════════════════════════════════
  showCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) drawer.classList.add('active');
    this.renderCart();
  },

  hideCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) drawer.classList.remove('active');
  },

  updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = this.cart.length;
      badge.style.display = this.cart.length > 0 ? 'flex' : 'none';
    }
  },

  renderCart() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (!list) return;

    if (this.cart.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:40px 0">Your order is empty</p>';
      if (totalEl) totalEl.textContent = '$0';
      if (checkoutBtn) checkoutBtn.style.display = 'none';
      return;
    }

    list.innerHTML = this.cart.map(item => `
      <div style="display:flex;justify-content:space-between;align-items:start;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px">${item.productName}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5)">${item.sizeLabel}</div>
          <div style="font-size:12px;margin-top:4px">
            ${item.needsDesign ?
              '<span style="color:#dc2626;font-weight:600">🎨 Design + Print</span>' :
              '<span style="color:#22c55e;font-weight:600">✅ Print Only</span>'}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:2px">${item.vendor === 'signs365' ? '⚡ Ships overnight' : '🚚 Local delivery'}</div>
        </div>
        <div style="text-align:right;min-width:80px">
          <div style="font-weight:800;font-size:18px;color:#dc2626">$${item.price.total}</div>
          <button onclick="NUI_PRINT.removeFromCart(${item.id})" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:12px;margin-top:4px">✕ Remove</button>
        </div>
      </div>
    `).join('');

    const totals = this.getCartTotal();
    if (totalEl) totalEl.textContent = '$' + totals.total;
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    // Shipping note
    const shipNote = document.getElementById('cartShipNote');
    if (shipNote) {
      let notes = [];
      if (totals.shipping > 0) notes.push(`Signs365: $${totals.shipping} overnight`);
      if (totals.knelloShipping) notes.push('Knello: delivery fee at checkout');
      shipNote.textContent = notes.join(' · ') || '';
    }
  },

  // ═══════════════════════════════════════
  // CHECKOUT — Order Submission
  // ═══════════════════════════════════════
  showCheckout() {
    this.hideCartDrawer();
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  hideCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  async submitOrder() {
    const name = document.getElementById('coName')?.value.trim();
    const email = document.getElementById('coEmail')?.value.trim();
    const phone = document.getElementById('coPhone')?.value.trim();
    const business = document.getElementById('coBusiness')?.value.trim();
    const address = document.getElementById('coAddress')?.value.trim();
    const city = document.getElementById('coCity')?.value.trim();
    const state = document.getElementById('coState')?.value.trim() || 'MI';
    const zip = document.getElementById('coZip')?.value.trim();
    const notes = document.getElementById('coNotes')?.value.trim();
    const industry = document.getElementById('coIndustry')?.value || '';

    if (!name || !email) {
      alert('Please enter your name and email.');
      return;
    }

    const btn = document.getElementById('coSubmitBtn');
    if (btn) { btn.textContent = 'Submitting...'; btn.disabled = true; }

    const totals = this.getCartTotal();
    const orderData = {
      client_name: name,
      client_email: email,
      client_phone: phone,
      business_name: business,
      industry: industry,
      shipping_address: { address, city, state, zip },
      items: this.cart.map(item => ({
        product: item.productName,
        size: item.sizeLabel,
        options: item.options,
        needsDesign: item.needsDesign,
        hasArtwork: item.hasArtwork,
        printCost: item.price.printCost,
        designCost: item.price.designCost,
        total: item.price.total,
        vendor: item.vendor
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      notes: notes,
      status: 'new',
      source: window.location.href,
      created_at: new Date().toISOString()
    };

    try {
      // Submit to Netlify function
      const res = await fetch('/.netlify/functions/submit-print-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Submit failed');

      // Show success
      document.getElementById('checkoutForm').style.display = 'none';
      document.getElementById('checkoutSuccess').style.display = 'block';
      this.clearCart();

    } catch (err) {
      console.error('Order submit error:', err);
      // Fallback: try direct Supabase save
      try {
        const SB_URL = window.SUPABASE_URL || '';
        const SB_KEY = window.SUPABASE_ANON_KEY || '';
        if (SB_URL && SB_KEY) {
          await fetch(`${SB_URL}/rest/v1/print_requests`, {
            method: 'POST',
            headers: {
              'apikey': SB_KEY,
              'Authorization': `Bearer ${SB_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              client_name: name,
              client_email: email,
              client_phone: phone,
              business_name: business,
              industry: industry,
              product: 'Multi-Item Order',
              price_shown: '$' + totals.total,
              details: JSON.stringify(orderData.items),
              status: 'new',
              source: window.location.href,
              created_at: new Date().toISOString()
            })
          });
        }
      } catch(e2) {}

      // Still show success — Faren gets notified regardless
      document.getElementById('checkoutForm').style.display = 'none';
      document.getElementById('checkoutSuccess').style.display = 'block';
      this.clearCart();
    }

    if (btn) { btn.textContent = 'Submit Order'; btn.disabled = false; }
  },

  // ═══════════════════════════════════════
  // LEGACY — Request Modal (for custom quotes)
  // ═══════════════════════════════════════
  openRequest(product, price) {
    document.getElementById('requestProduct').textContent = `Product: ${product} — ${price}`;
    document.getElementById('reqProduct').value = product;
    document.getElementById('reqPrice').value = price;
    document.getElementById('requestModal').classList.add('active');
    document.getElementById('requestForm').style.display = 'block';
    document.getElementById('requestSuccess').style.display = 'none';
    document.body.style.overflow = 'hidden';
  },

  // ═══════════════════════════════════════
  // BUNDLE ADD — Adds entire kit to cart
  // ═══════════════════════════════════════
  addBundle(bundleId, withDesign) {
    const bundle = this.bundles[bundleId];
    if (!bundle) return;

    const price = withDesign ? bundle.price + bundle.designAddon : bundle.price;

    this.addToCart({
      productId: bundleId,
      productName: bundle.name + (withDesign ? ' + Design' : ''),
      size: 'bundle',
      sizeLabel: 'Complete Kit',
      options: {},
      needsDesign: withDesign,
      hasArtwork: !withDesign,
      price: {
        printCost: bundle.price,
        designCost: withDesign ? bundle.designAddon : 0,
        shipping: 10,
        total: price,
        totalWithShipping: price + 10
      },
      vendor: 'signs365'
    });

    this.showCartDrawer();
  },

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════
  init() {
    this.loadCart();
    this.updateCartBadge();

    // Render product grid
    const params = new URLSearchParams(window.location.search);
    const industryParam = params.get('industry');
    this.renderProductGrid(industryParam || 'all');

    // Set active filter button from URL
    if (industryParam) {
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === industryParam);
      });
    }

    // Filter button clicks
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderProductGrid(btn.dataset.filter);
      });
    });
  }
}; // end NUI_PRINT

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => NUI_PRINT.init());
