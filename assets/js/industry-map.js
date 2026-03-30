/**
 * NUI INDUSTRY MAP — Single Source of Truth
 * Feeds: Monty AI, Email Campaigns, Package Pages, Digital Staff recommendations
 * DO NOT edit individual campaign files — edit here and everything updates.
 *
 * STRUCTURE PER INDUSTRY:
 * - dept_entry: Which department they need first
 * - hq_minimum: Minimum HQ level before staff can work
 * - immediate_staff: Available at their minimum HQ level
 * - upgrade_staff: Unlocked when they upgrade HQ
 * - pain: The real problem they feel every day
 * - hook: The one line that opens the conversation
 * - ai_myth: Why AI/DIY doesn't solve their specific problem
 * - monthly_frame: How to present pricing in their language
 * - upgrade_trigger: What Monty says when they ask for locked staff
 * - email_sequence: Campaign ID that fires when this industry is tagged
 * - packages: Recommended NUI packages in order
 * - common_problems: What they Google — used for SEO + AEO
 */

const NUI_INDUSTRY_MAP = {

  // ============================================================
  // TIER 1 — ATTACK NOW
  // ============================================================

  "restaurants": {
    label: "Restaurants & Upscale Dining",
    tier: 1,
    dept_entry: "marketing-wing",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "digital-promoter"],
    upgrade_staff: ["lead-catcher", "neighborhood-captain"],
    packages: ["digital-hq-standard", "digital-street-team", "blueprint-foundation"],
    pain: "Went viral once, lost the momentum. No system to bring people back. Packed weekends, dead Tuesday through Thursday.",
    hook: "You went viral once. Let's make sure you don't have to again.",
    ai_myth: "AI can post your content. It can't build the customer list that keeps your tables full when the hype dies down.",
    monthly_frame: "Less than what you're spending on Yelp ads that stopped converting two years ago.",
    upgrade_trigger: "Once your HQ Standard is live your Lead Catcher goes to work on every person who visited your site and left — that's where the repeat customers come from.",
    email_sequence: "restaurants-sequence",
    common_problems: [
      "how to get more restaurant customers",
      "restaurant marketing Detroit",
      "how to get repeat customers restaurant",
      "restaurant social media strategy",
      "how to fill tables on slow nights"
    ]
  },

  "bars-clubs-nightlife": {
    label: "Bars, Clubs & Nightlife",
    tier: 1,
    dept_entry: "street-team",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "digital-promoter", "digital-secretary"],
    upgrade_staff: ["lead-catcher", "neighborhood-captain"],
    packages: ["digital-hq-standard", "digital-street-team-loaded", "blueprint-full-build"],
    restricted_ads: true,
    pain: "Can't run Google or Facebook ads for certain content. Packed on weekends but dead on weeknights. 40,000 Instagram followers they don't own.",
    hook: "You can't buy visibility the way other businesses can. The only way to win is to own your audience.",
    ai_myth: "AI can't fix a restricted ad account. You need an organic-first strategy built specifically for your environment — that's what we build.",
    monthly_frame: "For less than one night's bar tab you own your customer list forever.",
    upgrade_trigger: "Your Neighborhood Captain can own every stadium corridor and event venue in the city — but that requires HQ Command. Here's what that upgrade unlocks.",
    email_sequence: "nightlife-sequence",
    common_problems: [
      "how to market a nightclub without Facebook ads",
      "how to get more bar customers on weeknights",
      "nightclub promotion ideas Detroit",
      "how to build email list for bar",
      "club marketing strategy Detroit"
    ]
  },


  "hvac-heating-cooling": {
    label: "HVAC / Heating & Cooling",
    tier: 1,
    dept_entry: "front-office",
    hq_minimum: "lite",
    immediate_staff: ["digital-secretary"],
    upgrade_staff: ["lead-catcher", "digital-promoter", "neighborhood-captain"],
    packages: ["digital-hq-standard", "digital-staff-secretary", "blueprint-foundation"],
    pain: "Paying $400 per lead on HomeAdvisor and sharing it with 4 competitors. Missing calls while on a job. Dead in the off-season.",
    hook: "You're paying $400 a lead to share it with 4 competitors. Let's fix that.",
    ai_myth: "AI didn't build your reputation. But it can make sure the next customer finds you before they find the guy who bought a lead list.",
    monthly_frame: "Your Digital Secretary pays for itself the first missed call it catches.",
    upgrade_trigger: "Once your HQ Standard is live, your Neighborhood Captain goes to work owning every zip code in your service area on Google Maps — so leads come to you first instead of HomeAdvisor.",
    email_sequence: "hvac-sequence",
    common_problems: [
      "how to get more HVAC customers",
      "HVAC company near me",
      "furnace repair Detroit",
      "air conditioning installation cost Michigan",
      "how to stop paying for leads HVAC"
    ]
  },

  "roofing": {
    label: "Roofing Contractors",
    tier: 1,
    dept_entry: "front-office",
    hq_minimum: "lite",
    immediate_staff: ["digital-secretary"],
    upgrade_staff: ["lead-catcher", "neighborhood-captain", "publicist"],
    packages: ["digital-hq-standard", "co-sign-feature", "digital-staff-secretary"],
    pain: "Seasonal work, storm-chasing lead services eating margin, no digital trust signals. Good crews losing jobs to companies that just look better online.",
    hook: "Your competitor with the worse crew is ranking above you on Google. Here's why.",
    ai_myth: "AI can build you a website in an hour. It can't build you 200 Google reviews and a press feature that makes homeowners trust you with a $15,000 job.",
    monthly_frame: "One job pays for a year of your Digital Secretary. You only need to not miss one call.",
    upgrade_trigger: "Your Neighborhood Captain can geofence every neighborhood that just had a hailstorm — so you're the first roofer they see. That requires HQ Command. Here's what that looks like.",
    email_sequence: "roofing-sequence",
    common_problems: [
      "best roofing company Detroit",
      "roof replacement cost Michigan",
      "roofing contractor near me",
      "how to find a trustworthy roofer",
      "storm damage roof repair Detroit"
    ]
  },

  "flooring": {
    label: "Flooring Companies",
    tier: 1,
    dept_entry: "marketing-wing",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "lead-catcher"],
    upgrade_staff: ["digital-promoter", "neighborhood-captain"],
    packages: ["digital-hq-standard", "blueprint-foundation", "co-sign-feature"],
    pain: "Visual product with no photos on their website. Losing to Home Depot online. Showroom-based business competing in a digital world.",
    hook: "Flooring is one of the most visual purchases a homeowner makes. Your website has no photos.",
    ai_myth: "AI can generate flooring images. Your customers want to see your actual work in actual Detroit homes — that's what converts.",
    monthly_frame: "One flooring job pays for 6 months of your full marketing team.",
    upgrade_trigger: "Your Neighborhood Captain can own every 'flooring near me' search in Southfield, Royal Oak, and Troy simultaneously once your HQ Command is built.",
    email_sequence: "flooring-sequence",
    common_problems: [
      "hardwood flooring installation Detroit",
      "flooring company near me Michigan",
      "tile installation cost",
      "best flooring contractor Detroit",
      "vinyl plank flooring installer near me"
    ]
  },

  "lawn-care-landscaping": {
    label: "Lawn Care & Landscaping",
    tier: 1,
    dept_entry: "front-office",
    hq_minimum: "lite",
    immediate_staff: ["digital-secretary"],
    upgrade_staff: ["digital-promoter", "neighborhood-captain", "lead-catcher"],
    packages: ["digital-staff-secretary", "digital-hq-standard", "blueprint-foundation"],
    pain: "Everything runs through the owner. Missing calls while on a job. Can't scale because there's no system.",
    hook: "You're leaving $40,000 a year on the table every time you miss a call while you're on a job.",
    ai_myth: "AI didn't build your client base. But it can make sure you never lose another one to voicemail.",
    monthly_frame: "At $197/month your Digital Secretary costs less than one lost lawn care contract.",
    upgrade_trigger: "Once your HQ Standard is set up, your Neighborhood Captain starts owning every neighborhood in your service territory on Google Maps.",
    email_sequence: "lawn-care-sequence",
    common_problems: [
      "lawn care company near me",
      "landscaping service Detroit",
      "how to grow lawn care business",
      "lawn mowing service Southfield",
      "commercial landscaping Michigan"
    ]
  },


  // ============================================================
  // TIER 2 — STRONG TARGETING
  // ============================================================

  "photography-studios": {
    label: "Photography Studios",
    tier: 2,
    dept_entry: "foundation",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "lead-catcher"],
    upgrade_staff: ["digital-promoter", "publicist"],
    packages: ["blueprint-foundation", "digital-hq-standard", "co-sign-feature"],
    pain: "Competing on price because brand looks generic. Losing bookings to cheaper photographers with better Instagram.",
    hook: "The photographer charging $800 less than you has better branding. That's the only reason they're winning.",
    ai_myth: "AI can edit your photos. It can't position you as the premium choice so you stop competing on price entirely.",
    monthly_frame: "One rebooking from a client who found you online pays for your entire system.",
    upgrade_trigger: "Your Publicist can get you featured in NUI Magazine — that one placement changes how every future client sees you before they even call.",
    email_sequence: "photography-sequence",
    common_problems: [
      "wedding photographer Detroit",
      "professional photographer near me Michigan",
      "portrait photographer Detroit",
      "how to get more photography clients",
      "photography studio marketing"
    ]
  },

  "insurance-agencies": {
    label: "Independent Insurance Agencies",
    tier: 2,
    dept_entry: "front-office",
    hq_minimum: "standard",
    immediate_staff: ["digital-secretary", "lead-catcher"],
    upgrade_staff: ["digital-promoter", "neighborhood-captain"],
    packages: ["blueprint-full-build", "digital-hq-standard", "digital-street-team"],
    pain: "Competing against Geico TV ads with a personal brand that looks like a LinkedIn profile from 2014.",
    hook: "People don't buy insurance online. They buy it from someone they trust. Are you building that trust digitally?",
    ai_myth: "AI can write your bio. It can't build the local authority that makes someone choose you over an app.",
    monthly_frame: "One new policy pays for months of your full digital staff.",
    upgrade_trigger: "Your Neighborhood Captain can own every insurance search in Southfield, Detroit, and the surrounding suburbs. That requires HQ Command.",
    email_sequence: "insurance-sequence",
    common_problems: [
      "independent insurance agent near me",
      "best insurance agency Detroit",
      "how to find a local insurance agent",
      "auto insurance Southfield Michigan",
      "life insurance agent Detroit"
    ]
  },

  "medical-healthcare": {
    label: "Medical, Med Spas & Private Practice",
    tier: 2,
    dept_entry: "front-office",
    hq_minimum: "standard",
    immediate_staff: ["digital-secretary", "lead-catcher"],
    upgrade_staff: ["content-crew", "digital-promoter", "neighborhood-captain"],
    packages: ["digital-hq-command", "digital-staff-full", "blueprint-full-build"],
    pain: "Generic website, no social presence, competing against hospital group budgets with a fraction of the resources.",
    hook: "Your patients refer their friends verbally. Your website isn't converting those referrals.",
    ai_myth: "AI can't build patient trust. But it can make sure every person who Googles your specialty in your zip code finds you first.",
    monthly_frame: "One new patient relationship pays for a year of your digital front office.",
    upgrade_trigger: "Your Neighborhood Captain combined with your Lead Catcher creates a system where every person who researches your practice gets followed up with automatically.",
    email_sequence: "medical-sequence",
    common_problems: [
      "private practice near me Detroit",
      "med spa Detroit",
      "chiropractor near me Southfield",
      "how to get more patients",
      "medical practice marketing Michigan"
    ]
  },

  "cannabis-dispensaries": {
    label: "Cannabis Dispensaries",
    tier: 2,
    dept_entry: "street-team",
    hq_minimum: "standard",
    restricted_ads: true,
    immediate_staff: ["content-crew", "digital-promoter", "lead-catcher"],
    upgrade_staff: ["neighborhood-captain"],
    packages: ["digital-hq-standard", "blueprint-full-build", "digital-street-team-loaded"],
    pain: "Can't run Google Ads or Facebook Ads. Completely dependent on Weedmaps and Leafly — renting visibility on someone else's platform.",
    hook: "Every dollar you spend on Weedmaps is building their brand, not yours.",
    ai_myth: "AI can't fix a restricted ad account. You need an owned audience strategy — email, SMS, push — that no platform can take from you.",
    monthly_frame: "Your Digital Promoter reaches your owned list for less than one month of Weedmaps fees.",
    upgrade_trigger: "Your Neighborhood Captain can geofence competitor dispensaries and nearby events — but that requires HQ Command and a Google Ads account setup.",
    email_sequence: "cannabis-sequence",
    common_problems: [
      "dispensary near me Detroit",
      "cannabis dispensary marketing",
      "how to market a dispensary without ads",
      "best dispensary Detroit",
      "marijuana dispensary Michigan"
    ]
  },

  "street-clothing-fashion": {
    label: "Street Clothing & Detroit Fashion",
    tier: 2,
    dept_entry: "foundation",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "digital-promoter"],
    upgrade_staff: ["lead-catcher", "publicist"],
    packages: ["blueprint-full-build", "digital-hq-standard", "digital-street-team-loaded"],
    pain: "Culture is real but the brand doesn't match it. Can't get into retail because they don't look like a legitimate company.",
    hook: "Detroit culture is a billion-dollar brand. You're sitting inside it. Let's make sure your label reflects that.",
    ai_myth: "AI generated your mockup in 10 minutes. Every other brand on the block used the same app. Your brand needs to be unmistakably yours.",
    monthly_frame: "One wholesale order from a retailer who found you online pays for your entire brand system.",
    upgrade_trigger: "Your Publicist can get your brand featured in NUI Magazine — that one placement puts you in a different conversation with retailers and buyers.",
    email_sequence: "fashion-sequence",
    common_problems: [
      "Detroit streetwear brand",
      "clothing brand marketing Detroit",
      "how to start a clothing brand Detroit",
      "streetwear brand identity",
      "Detroit fashion label"
    ]
  },

  "authors-speakers": {
    label: "Authors, Speakers & Personal Brands",
    tier: 2,
    dept_entry: "foundation",
    hq_minimum: "lite",
    immediate_staff: ["digital-secretary", "content-crew"],
    upgrade_staff: ["lead-catcher", "publicist", "digital-promoter"],
    packages: ["blueprint-foundation", "digital-hq-standard", "co-sign-feature"],
    nui_advantage: "Faren Young authored Built Heavy — NUI speaks to this category from lived experience, not theory.",
    pain: "Wrote the book but can't monetize the expertise. Website is a basic template. Not converting readers into clients or speaking engagements.",
    hook: "You wrote the book. Now let's make sure the right people find it — and hire you because of it.",
    ai_myth: "AI can write content about your expertise. It can't replace the credibility of your story told correctly across every platform.",
    monthly_frame: "One speaking engagement booked through your Digital HQ pays for a year of your full system.",
    upgrade_trigger: "Your Publicist is the fastest way to convert your book into authority — a NUI Magazine feature gives bookers and buyers a third-party reason to say yes.",
    email_sequence: "authors-sequence",
    common_problems: [
      "how to market my book",
      "personal brand website Detroit",
      "how to get speaking engagements",
      "author website design",
      "how to monetize expertise"
    ]
  },


  // ============================================================
  // TIER 3 — NUI HOME COURT (Community & Main Street)
  // ============================================================

  "bakeries-food-makers": {
    label: "Bakeries & Food Makers",
    tier: 3,
    dept_entry: "marketing-wing",
    hq_minimum: "lite",
    immediate_staff: ["content-crew", "digital-secretary"],
    upgrade_staff: ["digital-promoter", "lead-catcher"],
    packages: ["blueprint-foundation", "digital-hq-lite", "digital-street-team-posted-up"],
    nui_advantage: "NUI worked with Good Cakes and Bakes. This is our home court.",
    pain: "People drive across the city for their product but they don't show up on Google. No email list. No way to bring customers back consistently.",
    hook: "Detroit knows your name. Google doesn't. Yet.",
    ai_myth: "AI can design a logo that looks like every other bakery. Your brand needs to feel like your kitchen — and only someone who understands Detroit food culture can build that.",
    monthly_frame: "For less than the cost of one catering order you have a full content team working your brand every day.",
    upgrade_trigger: "Once your HQ Standard is live, your Digital Promoter can send flash sale alerts and weekend specials directly to your customer list.",
    email_sequence: "food-makers-sequence",
    common_problems: [
      "bakery marketing Detroit",
      "how to grow a bakery business",
      "Detroit bakery social media",
      "Eastern Market vendor marketing",
      "how to build email list for food business"
    ]
  },

  "creative-makers": {
    label: "Creative Makers (Candles, Art, Jewelry)",
    tier: 3,
    dept_entry: "foundation",
    hq_minimum: "lite",
    immediate_staff: ["content-crew", "digital-secretary"],
    upgrade_staff: ["digital-promoter", "lead-catcher"],
    packages: ["blueprint-foundation", "digital-hq-lite", "vendor-launch-kit"],
    nui_advantage: "NUI built the candle company brand. We know this space.",
    pain: "Etsy is eating their margin. Instagram looks good but doesn't convert. No email list they own.",
    hook: "You built something beautiful. Stop letting another platform own your customers.",
    ai_myth: "AI can generate product photos. It can't build the brand that makes someone buy your candle over the one next to it at the market.",
    monthly_frame: "Your Vendor Launch Kit pays for itself after one good market weekend.",
    upgrade_trigger: "When you're ready to move beyond the market, your HQ Lite gives you a home base your customers can find you at any day of the week.",
    email_sequence: "creative-makers-sequence",
    common_problems: [
      "how to sell candles online Detroit",
      "maker business marketing",
      "how to grow Etsy shop",
      "craft business branding",
      "Detroit maker market vendor"
    ]
  },

  "art-galleries-cultural": {
    label: "Art Galleries & Cultural Spaces",
    tier: 3,
    dept_entry: "marketing-wing",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "publicist"],
    upgrade_staff: ["digital-promoter", "lead-catcher"],
    packages: ["digital-hq-standard", "co-sign-feature", "blueprint-foundation"],
    nui_advantage: "NUI worked with Detroit gallery clients. Deep roots in the creative community.",
    pain: "Foot traffic but no digital presence. Events don't get promoted. New collectors and buyers can't find them online.",
    hook: "The art inside deserves an audience bigger than the block.",
    ai_myth: "AI can describe your art. It can't create the digital experience that makes a collector feel like they need to visit.",
    monthly_frame: "One new collector relationship pays for your entire marketing wing for the year.",
    upgrade_trigger: "Your Publicist can get your gallery featured in NUI Magazine — that placement reaches buyers and collectors who wouldn't find you otherwise.",
    email_sequence: "galleries-sequence",
    common_problems: [
      "art gallery marketing Detroit",
      "how to promote an art show",
      "Detroit art gallery",
      "how to find art collectors online",
      "cultural space marketing Detroit"
    ]
  },

  "salons-barbershops": {
    label: "Established Salons & Barbershops",
    tier: 3,
    dept_entry: "front-office",
    hq_minimum: "lite",
    immediate_staff: ["digital-secretary", "content-crew"],
    upgrade_staff: ["digital-promoter", "lead-catcher"],
    packages: ["digital-staff-secretary", "blueprint-foundation", "digital-hq-standard"],
    pain: "Fully booked by word of mouth but can't scale, can't raise prices, and new clients have no way to find them online.",
    hook: "You're booked out two weeks. Your prices don't reflect that. Your brand should.",
    ai_myth: "AI can post your before-and-afters. It can't build the brand that lets you charge $200 for a cut and have people saying thank you.",
    monthly_frame: "Your Digital Secretary handles bookings 24/7 for less than what you make on one client.",
    upgrade_trigger: "Once your HQ Standard is live, your Digital Promoter can send appointment reminders and rebooking campaigns to your full client list automatically.",
    email_sequence: "salons-sequence",
    common_problems: [
      "hair salon marketing Detroit",
      "barbershop near me Detroit",
      "how to get more salon clients",
      "barber shop social media strategy",
      "salon booking system Detroit"
    ]
  },

  "all-things-detroit-vendors": {
    label: "All Things Detroit & Market Vendors",
    tier: 3,
    dept_entry: "foundation",
    hq_minimum: "vendor-kit",
    immediate_staff: ["digital-secretary"],
    upgrade_staff: ["content-crew", "digital-promoter", "lead-catcher"],
    packages: ["vendor-launch-kit", "blueprint-foundation", "digital-hq-lite"],
    nui_advantage: "NUI built the All Things Detroit brand. Warm relationship with ownership.",
    pain: "Great product, zero digital presence. Selling well at the market but the business disappears the moment the tent comes down.",
    hook: "You're at the table every weekend. Your brand should be working for you 24/7.",
    ai_myth: "AI can make you a Canva logo in 5 minutes. Every other vendor at that market did the same thing. You need to be the one they remember.",
    monthly_frame: "The Vendor Launch Kit pays for itself after one good market weekend.",
    upgrade_trigger: "When you're ready to grow beyond the market, your HQ Lite gives you a permanent address online. Then we activate your Digital Promoter to bring market customers back all week.",
    email_sequence: "atd-vendors-sequence",
    event_team_eligible: true,
    common_problems: [
      "All Things Detroit vendor",
      "Detroit market vendor branding",
      "how to grow vendor business Detroit",
      "small business marketing Detroit",
      "Eastern Market Detroit vendor"
    ]
  },


  // ============================================================
  // TIER 4 — LONGER CYCLE, HIGH CONTRACT VALUE
  // ============================================================

  "auto-detailing-custom": {
    label: "Auto Detailing & Custom Shops",
    tier: 4,
    dept_entry: "foundation",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "lead-catcher"],
    upgrade_staff: ["neighborhood-captain", "digital-promoter"],
    packages: ["blueprint-foundation", "digital-hq-standard", "digital-street-team"],
    pain: "Instagram looks great but no booking system, no email list, no loyalty. Living job to job from word of mouth.",
    hook: "Your work is immaculate. Your online presence isn't.",
    ai_myth: "AI can filter your photos. It can't build the brand that commands $2,000 detail packages instead of $300.",
    monthly_frame: "One premium detail job pays for three months of your full digital staff.",
    upgrade_trigger: "Your Neighborhood Captain can geofence every competing shop in the metro and every car show on Woodward — that's a HQ Command conversation.",
    email_sequence: "auto-detailing-sequence",
    common_problems: [
      "auto detailing near me Detroit",
      "car detailing service Michigan",
      "how to grow auto detailing business",
      "mobile detailing Detroit",
      "Woodward Dream Cruise vendor"
    ]
  },

  "renovation-contractors": {
    label: "Renovation & Contractors",
    tier: 4,
    dept_entry: "front-office",
    hq_minimum: "standard",
    immediate_staff: ["digital-secretary", "lead-catcher"],
    upgrade_staff: ["content-crew", "neighborhood-captain", "publicist"],
    packages: ["digital-hq-standard", "co-sign-feature", "blueprint-foundation"],
    pain: "Doing $2M in renovations a year with a Google listing that has 3 photos. Losing bids to companies that look more established online.",
    hook: "You're doing $2M in renovations a year. Your Google listing has 3 photos.",
    ai_myth: "AI can't replace before-and-after photos of your actual work in actual Detroit homes. That's what converts high-ticket renovation clients.",
    monthly_frame: "One renovation contract pays for two years of your complete digital staff.",
    upgrade_trigger: "Your Publicist turns your best project into a press feature — that one placement makes homeowners trust you with $50,000 jobs they'd otherwise be nervous about.",
    email_sequence: "renovation-sequence",
    common_problems: [
      "home renovation contractor Detroit",
      "kitchen remodel near me Michigan",
      "bathroom renovation Detroit",
      "general contractor Detroit",
      "home addition contractor Michigan"
    ]
  },

  "suburban-professional": {
    label: "Suburban Professionals (Southfield, Troy, Birmingham)",
    tier: 4,
    dept_entry: "foundation",
    hq_minimum: "standard",
    immediate_staff: ["lead-catcher", "digital-secretary"],
    upgrade_staff: ["content-crew", "neighborhood-captain", "publicist"],
    packages: ["blueprint-full-build", "digital-hq-command", "digital-staff-full"],
    pain: "20 years of expertise and a LinkedIn profile that looks like 2014. Losing business to younger competitors who look better online despite less experience.",
    hook: "20 years of expertise. Does your website communicate that?",
    ai_myth: "AI can write your bio. It can't build the digital authority that makes a high-net-worth client choose you over someone half your age with twice the Instagram following.",
    monthly_frame: "One new client relationship from your digital presence pays for your entire system for the year.",
    upgrade_trigger: "Your Neighborhood Captain combined with your Publicist creates a system where your name shows up everywhere your ideal client is looking — online and in print.",
    email_sequence: "suburban-professional-sequence",
    common_problems: [
      "financial advisor Southfield Michigan",
      "attorney Detroit Michigan",
      "consultant personal brand Detroit",
      "professional services marketing Detroit",
      "personal brand website Southfield"
    ]
  },

  "boating-marine": {
    label: "Boating, Marine & Up North Michigan",
    tier: 4,
    dept_entry: "foundation",
    hq_minimum: "standard",
    immediate_staff: ["content-crew", "lead-catcher"],
    upgrade_staff: ["digital-promoter", "neighborhood-captain"],
    packages: ["blueprint-foundation", "digital-hq-standard", "digital-street-team"],
    pain: "Seasonal, high-revenue business with a website last updated in 2016. Pre-bookings don't happen because there's no system to capture them.",
    hook: "A $60,000 boat purchase starts with a Google search. What do they find?",
    ai_myth: "AI can describe your inventory. It can't build the seasonal marketing system that drives pre-bookings before the ice melts.",
    monthly_frame: "One boat sale or charter booking pays for years of your digital infrastructure.",
    upgrade_trigger: "Your Neighborhood Captain can own every marine and boating search across Northern Michigan and Metro Detroit simultaneously.",
    email_sequence: "boating-sequence",
    common_problems: [
      "boat dealer Michigan",
      "marine service near me Michigan",
      "fishing charter Michigan",
      "boat rental Traverse City",
      "pontoon boat dealer Detroit"
    ]
  },

  // ============================================================
  // STAFF DIRECTORY — Master reference for Monty + email system
  // ============================================================

  _staff: {
    "digital-secretary": {
      dept: "front-office",
      label: "The Digital Secretary",
      replaces: "Receptionist / Answering Service",
      pitch: "Stop losing $3,000/mo on a front desk person who misses calls. This secretary is on 24/7, never takes a lunch break, and books your appointments while you're on a job.",
      hq_required: "lite",
      price: "$197/mo"
    },
    "lead-catcher": {
      dept: "front-office",
      label: "The Lead Catcher",
      replaces: "Sales Assistant / Follow-up Person",
      pitch: "Most people visit your site and leave. This position identifies them by name and email and hits them back immediately — like a sales rep who remembers every face that walked in the store.",
      hq_required: "standard",
      price: "Add-on"
    },
    "digital-promoter": {
      dept: "street-team",
      label: "The Digital Promoter",
      replaces: "Flyer Runner / Radio Ad / SMS Blast Person",
      pitch: "Instead of paper flyers on windshields, we drop a digital flyer directly onto their phone screen when they're in your neighborhood — or when they visit your site and leave without calling.",
      hq_required: "standard",
      price: "Add-on"
    },
    "neighborhood-captain": {
      dept: "street-team",
      label: "The Neighborhood Captain",
      replaces: "Outside Sales Rep / Canvasser / Territory Rep",
      pitch: "We put your flag in every zip code. When someone in Southfield or Royal Oak looks for your service, you're the first name they see. We own the territory, block by block.",
      hq_required: "command",
      covers: ["geofencing", "geo-gridding"],
      price: "Add-on — priced by territory"
    },
    "publicist": {
      dept: "marketing-wing",
      label: "The Publicist",
      replaces: "PR Agency",
      pitch: "Gets you featured in NUI Magazine. It's the difference between you saying you're the best and a magazine proving you're the best.",
      hq_required: "any",
      price: "$1,500 feature / $3,500 bundle"
    },
    "content-crew": {
      dept: "marketing-wing",
      label: "The Content Crew",
      replaces: "Social Media Manager / Photographer",
      pitch: "The staff that makes sure you look 'big time' online every single day. Photos, videos, and posts that stay consistent so your brand never looks dead on IG.",
      hq_required: "lite",
      price: "$497–$2,997/mo"
    },
    "store-manager": {
      dept: "foundation",
      label: "The Store Manager",
      replaces: "Web Designer / IT Guy",
      pitch: "This builds your Digital HQ. It's not just a website — it's the systems, the payments, and the security that keeps your business open for business 24/7.",
      hq_required: "this-is-the-hq",
      price: "$3,500 – $8,500+"
    },
    "brand-designer": {
      dept: "foundation",
      label: "The Brand Designer",
      replaces: "Creative Director",
      pitch: "Your logo, your colors, your vibe. We build the visual system that makes people trust you before they even call you.",
      hq_required: "any",
      price: "$2,500 – $12,500+"
    }
  },

  // ============================================================
  // HQ LEVELS — What each storefront unlocks
  // ============================================================

  _hq_levels: {
    "vendor-kit": {
      label: "Vendor Launch Kit",
      price: "$750–$997",
      tagline: "The Table",
      unlocks: ["digital-secretary (basic)"],
      locked: ["lead-catcher", "digital-promoter", "neighborhood-captain", "lead-catcher"],
      pitch: "Your address at the market. Logo, one-page site, Instagram setup, QR email capture. The foundation before the foundation."
    },
    "lite": {
      label: "HQ Lite",
      price: "$3,500",
      tagline: "The Kiosk",
      pages: "Up to 3 pages",
      unlocks: ["digital-secretary", "content-crew", "brand-designer"],
      locked: ["lead-catcher", "digital-promoter", "neighborhood-captain"],
      pitch: "You exist online. People can find you and contact you. But right now you have a kiosk — you can have someone at the front desk, but you can't run a full team yet."
    },
    "standard": {
      label: "HQ Standard",
      price: "$5,500",
      tagline: "The Storefront",
      pages: "Unlimited pages",
      includes: ["Full GMB optimization", "50+ citations", "Meta Pixel", "Analytics", "Lead capture", "Full SEO"],
      unlocks: ["digital-secretary", "content-crew", "lead-catcher", "digital-promoter", "brand-designer", "publicist"],
      locked: ["neighborhood-captain"],
      pitch: "Now you have a real storefront. Front desk is staffed. Your back office is running. Your marketing team can operate. The only thing you can't do yet is send your street team out."
    },
    "command": {
      label: "HQ Command",
      price: "$8,500+",
      tagline: "The Headquarters",
      includes: ["Everything in Standard", "Google Ads account", "Full automation", "Geo-grid mapping", "CRM integration", "Advanced schema"],
      unlocks: ["ALL positions including Neighborhood Captain"],
      locked: [],
      pitch: "This is the full headquarters. Every department is open. Every staff member is available. This is where businesses serious about growth operate from."
    }
  },

  // ============================================================
  // EMAIL SEQUENCES — Campaign IDs mapped to industries
  // Max 18 emails/day via Hostinger SMTP
  // 5 emails per sequence over 14 days
  // ============================================================

  _email_sequences: {
    structure: {
      day_0:  "Name the pain — specific to their industry, their language",
      day_2:  "Social proof — client story from their world",
      day_5:  "The AI/DIY myth — what they didn't know they were missing",
      day_9:  "The financing angle — you can start for X/month",
      day_14: "Direct offer — limited spots, book the call"
    },
    triggers: {
      form_submission:    "Tag by form field selection → fire matching sequence",
      page_visit:         "RB2B identifies visitor → match to industry by page visited → fire cold sequence",
      consultation_booked_no_deposit: "Fire nurture sequence for their industry",
      event_team_capture: "Fire post-event sequence for vendor's industry"
    },
    daily_cap: 18,
    platform: "Hostinger SMTP",
    sequences: [
      "restaurants-sequence",
      "nightlife-sequence",
      "hvac-sequence",
      "roofing-sequence",
      "flooring-sequence",
      "lawn-care-sequence",
      "photography-sequence",
      "insurance-sequence",
      "medical-sequence",
      "cannabis-sequence",
      "fashion-sequence",
      "authors-sequence",
      "food-makers-sequence",
      "creative-makers-sequence",
      "galleries-sequence",
      "salons-sequence",
      "atd-vendors-sequence",
      "auto-detailing-sequence",
      "renovation-sequence",
      "suburban-professional-sequence",
      "boating-sequence"
    ]
  }

};

// Export for use by Monty system prompt, email system, and package pages
if (typeof module !== 'undefined') module.exports = NUI_INDUSTRY_MAP;

