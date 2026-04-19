// business-categories.js — Single source of truth for contact categories + sequence routing
// Feeds: admin-contact-hub.js dropdown, client-email-broadcast.js sequence selector
// Edit here and both the UI and the email engine pick it up.

(function() {
  'use strict';

  // Each category: { key, label, emoji, sequence, pain (short), why_exists }
  // `sequence` is either a drip_emails.sequence_id (real industry sequence exists)
  //   or null (falls back to the generic 6-touch reconnect sequence)
  const CATEGORIES = [
    // ── Core Detroit service businesses (Faren's must-haves) ──
    { key: 'bars_nightlife',      label: 'Bars / Nightlife',     emoji: '🍺', sequence: 'nightlife' },
    { key: 'restaurants',         label: 'Restaurants',          emoji: '🍽️', sequence: 'restaurants' },
    { key: 'hvac',                label: 'HVAC',                 emoji: '🔥', sequence: 'hvac' },
    { key: 'plumbing',            label: 'Plumbing',             emoji: '🔧', sequence: 'hvac' }, // shares HVAC sequence (same pain: service calls, seasonal)
    { key: 'roofing',             label: 'Roofing',              emoji: '🏗️', sequence: 'roofing' },
    { key: 'flooring',            label: 'Flooring',             emoji: '🪵', sequence: 'flooring' },
    { key: 'landscaping',         label: 'Landscaping / Lawn',   emoji: '🌱', sequence: 'lawn_care' },
    { key: 'photographers',       label: 'Photographers',        emoji: '📸', sequence: 'photography' },
    { key: 'videographers',       label: 'Videographers',        emoji: '🎥', sequence: 'photography' }, // shares photo sequence
    { key: 'salons_barbershops',  label: 'Salons / Barbershops', emoji: '💇', sequence: null }, // fallback until salons sequence exists
    { key: 'real_estate',         label: 'Real Estate',          emoji: '🏠', sequence: null },
    { key: 'retail',              label: 'Retail',               emoji: '🛍️', sequence: 'product' },
    { key: 'event_promoters',     label: 'Event Promoters',      emoji: '🎤', sequence: 'events' },
    { key: 'authors_speakers',    label: 'Authors / Speakers',   emoji: '✍️', sequence: 'authors' },
    { key: 'coaching_consulting', label: 'Coaching / Consulting',emoji: '🧠', sequence: 'authors' }, // similar audience-building pattern
    { key: 'tech',                label: 'Tech / SaaS',          emoji: '💻', sequence: null },

    // ── Pre-built sequences from industry-map.js worth keeping wired ──
    { key: 'cannabis',            label: 'Cannabis',             emoji: '🌿', sequence: null }, // sequence content in industry-map but not in drip_emails yet
    { key: 'medical_healthcare',  label: 'Medical / Healthcare', emoji: '🏥', sequence: null },
    { key: 'dental',              label: 'Dental',               emoji: '🦷', sequence: null },
    { key: 'insurance',           label: 'Insurance',            emoji: '🛡️', sequence: null },
    { key: 'law',                 label: 'Law',                  emoji: '⚖️', sequence: null },
    { key: 'taxes',               label: 'Taxes / CPA',          emoji: '💰', sequence: null }, // replaces generic "financial"
    { key: 'fashion_apparel',     label: 'Fashion / Apparel',    emoji: '👗', sequence: 'clothing' },
    { key: 'auto_detailing',      label: 'Auto Detailing',       emoji: '🚗', sequence: null },
    { key: 'auto_repair',         label: 'Auto Repair',          emoji: '🔩', sequence: null },
    { key: 'renovation',          label: 'Renovation Contractors',emoji: '🔨', sequence: null },
    { key: 'cleaning',            label: 'Cleaning Services',    emoji: '🧹', sequence: null },
    { key: 'fitness',             label: 'Fitness / Gyms',       emoji: '💪', sequence: null },
    { key: 'bakeries_food',       label: 'Bakeries / Food Makers',emoji: '🍰', sequence: null },
    { key: 'catering',            label: 'Catering',             emoji: '🍱', sequence: null },
    { key: 'event_planning',      label: 'Event Planning',       emoji: '🎉', sequence: null },
    { key: 'art_galleries',       label: 'Art Galleries',        emoji: '🎨', sequence: null },
    { key: 'nonprofit',           label: 'Nonprofit',            emoji: '❤️', sequence: null },

    // ── Catch-all ──
    { key: 'other',               label: 'Other',                emoji: '📌', sequence: null }
  ];

  // Lookup: category key → sequence_id (null means use generic fallback)
  function sequenceFor(categoryKey) {
    if (!categoryKey) return null;
    const row = CATEGORIES.find(c => c.key === categoryKey);
    return row ? row.sequence : null;
  }

  // Render dropdown <option> list for admin UI
  function renderOptions(selectedKey) {
    return CATEGORIES.map(c =>
      `<option value="${c.key}" ${selectedKey === c.key ? 'selected' : ''}>${c.emoji} ${c.label}</option>`
    ).join('');
  }

  // Keyword → category guesser for batch-categorization of legacy contacts
  // Uses WORD BOUNDARIES (\b) to avoid false positives like "bar" matching "Barr".
  // Keywords are tightened to be category-exclusive (no ambiguous generics like "designs").
  const CATEGORY_KEYWORDS = {
    bars_nightlife:      ['bar','lounge','nightclub','nightlife','tavern','saloon','cocktail','pub','speakeasy'],
    restaurants:         ['restaurant','restaurants','grill','eatery','bistro','kitchen','diner','pizzeria','sushi','bbq','cafe','coffee','taqueria','ramen'],
    hvac:                ['hvac','heating','cooling','furnace','air conditioning','mechanical'],
    plumbing:            ['plumbing','plumb','plumber','drain','sewer'],
    roofing:             ['roof','roofs','roofing','roofer'],
    flooring:            ['flooring','hardwood','carpet','tile'],
    landscaping:         ['lawn','landscape','landscaping','lawncare','snow removal'],
    photographers:       ['photography','photographer','photos'],
    videographers:       ['videography','videographer','filmmaker'],
    salons_barbershops:  ['salon','salons','barber','barbershop','hair','nails','spa','braids','locs','lashes'],
    real_estate:         ['realty','real estate','realtor','properties','homes for sale'],
    retail:              ['boutique','streetwear'], // "store"/"shop" too generic
    event_promoters:     ['promoter','promotions','dj ','entertainment','nightlife promoter'],
    authors_speakers:    ['author','speaker','speaking','publisher','publishing','books'],
    coaching_consulting: ['coach','coaching','consultant','consulting','advisory'],
    tech:                ['tech','technology','software','saas','app studio'],
    cannabis:            ['cannabis','dispensary','marijuana','thc','cbd'],
    medical_healthcare:  ['medical','clinic','doctor','physician','wellness','chiropractor','chiro'],
    dental:              ['dental','dentist','orthodontist','orthodontics'],
    insurance:           ['insurance','insurer'],
    law:                 ['attorney','legal','esquire','lawyer','law firm'],
    taxes:               ['tax','taxes','cpa','accounting','accountant','bookkeeper','bookkeeping'],
    fashion_apparel:     ['fashion','apparel','clothing','streetwear','boutique clothing'],
    auto_detailing:      ['detailing','auto spa','car wash'],
    auto_repair:         ['auto repair','mechanic','collision','body shop','autobody','auto body'],
    renovation:          ['renovation','remodel','remodeling','construction','builder','contractor','handyman'],
    cleaning:            ['cleaning','janitorial','maid service'],
    fitness:             ['fitness','gym','crossfit','yoga','pilates','personal trainer'],
    bakeries_food:       ['bakery','bakeries','pastry','cakes','desserts'],
    catering:            ['catering','caterer'],
    event_planning:      ['event planning','weddings','wedding planner','event planner'],
    art_galleries:       ['gallery','art studio','art center'],
    nonprofit:           ['nonprofit','non-profit','foundation','church','ministry']
  };

  function guessCategory(company) {
    if (!company) return null;
    const lower = company.toLowerCase();
    // Prefer longest keyword match (e.g. "real estate" wins over "real")
    let best = null, bestLen = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        // Escape special regex chars (only hyphens/spaces are common here)
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Word boundary on both sides prevents "bar" matching "Barr" or "Republican"
        // For multi-word keywords, ensure they appear as standalone phrases
        const re = new RegExp(`\\b${escaped}\\b`, 'i');
        if (re.test(lower) && kw.length > bestLen) {
          best = cat;
          bestLen = kw.length;
        }
      }
    }
    return best;
  }

  // Expose globally (admin panel) and via CommonJS (Netlify functions)
  const api = { CATEGORIES, sequenceFor, renderOptions, guessCategory, CATEGORY_KEYWORDS };
  if (typeof window !== 'undefined') window.NuiCategories = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
