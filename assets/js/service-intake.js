function copyColors(colors) {
    navigator.clipboard.writeText(colors);
    alert('Colors copied to clipboard: ' + colors);
}

function backToAdmin() {
    if (currentUser?.type === 'admin') {
        document.getElementById('clientPortal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    } else {
        portalLogout();
    }
}

// ==================== MULTI-STEP SERVICE INTAKE SYSTEM ====================
// intakeData, currentIntakeStep, uploadedFiles declared globally in core.js

// Service-specific intake configurations
// Client Background Questions (used across all intakes)
const clientBackgroundFields = [
    { id: 'clientName', type: 'text', label: 'Your Full Name', required: true },
    { id: 'clientPhone', type: 'text', label: 'Phone Number', required: true, placeholder: '(248) 487-8747' },
    { id: 'howDidYouHear', type: 'select', label: 'How did you hear about us?', options: ['Google Search', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Referral from Friend', 'Referral from Client', 'Saw Our Work', 'Local Event', 'Other'] },
    { id: 'workedWithUsBefore', type: 'radio', label: 'Have you worked with us before?', options: [
        { value: 'yes', title: 'Yes', desc: 'I\'m a returning client' },
        { value: 'no', title: 'No', desc: 'This is my first time' }
    ]},
    { id: 'socialMediaAccounts', type: 'textarea', label: 'Your Social Media Accounts', required: false, placeholder: 'Instagram: @yourbusiness\\nFacebook: /yourbusiness\\nTikTok: @yourbusiness' },
    { id: 'emailMarketing', type: 'radio', label: 'Do you currently do email marketing?', options: [
        { value: 'yes', title: 'Yes, actively', desc: 'Regular newsletters/campaigns' },
        { value: 'sometimes', title: 'Sometimes', desc: 'Occasional emails' },
        { value: 'no', title: 'No', desc: 'Not yet' }
    ]},
    { id: 'directMailers', type: 'radio', label: 'Do you use direct mail/mailers?', options: [
        { value: 'yes', title: 'Yes', desc: 'Postcards, flyers, etc.' },
        { value: 'no', title: 'No', desc: 'Digital only' }
    ]}
];

const serviceIntakeConfigs = {
    'brand-starter': {
        name: 'Brand Starter',
        price: 1500,
        steps: ['About You', 'Business Info', 'Brand Vision', 'Preferences', 'Upload', 'Review'],
        fields: {
            1: clientBackgroundFields,
            2: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry/Niche', required: true },
                { id: 'website', type: 'text', label: 'Current Website (if any)', required: false },
                { id: 'targetAudience', type: 'textarea', label: 'Describe your ideal customer', required: true }
            ],
            3: [
                { id: 'brandPersonality', type: 'radio', label: 'Brand Personality', options: [
                    { value: 'bold', title: 'Bold & Edgy', desc: 'Stand out, be different, make a statement' },
                    { value: 'professional', title: 'Professional & Trust', desc: 'Reliable, established, corporate' },
                    { value: 'playful', title: 'Playful & Fun', desc: 'Energetic, youthful, approachable' },
                    { value: 'luxury', title: 'Luxury & Premium', desc: 'High-end, exclusive, sophisticated' }
                ]},
                { id: 'brandValues', type: 'textarea', label: 'What 3 words describe your brand?', required: true }
            ],
            4: [
                { id: 'colorPrefs', type: 'textarea', label: 'Color preferences (or colors to avoid)', required: false },
                { id: 'competitors', type: 'textarea', label: 'List 2-3 competitors you admire', required: false },
                { id: 'inspiration', type: 'textarea', label: 'Links to brands/designs you love', required: false }
            ],
            5: [
                { id: 'files', type: 'file', label: 'Upload reference images, existing logos, or inspiration', accept: 'image/*,.pdf,.ai,.psd', multiple: true }
            ]
        }
    },
    'brand-identity': {
        name: 'Brand Identity Package',
        price: 3500,
        steps: ['About You', 'Business Info', 'Brand Story', 'Visual Direction', 'Upload', 'Review'],
        fields: {
            1: clientBackgroundFields,
            2: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'tagline', type: 'text', label: 'Tagline (if any)', required: false },
                { id: 'industry', type: 'text', label: 'Industry/Niche', required: true },
                { id: 'yearsInBusiness', type: 'select', label: 'Years in Business', options: ['Startup', '1-2 years', '3-5 years', '5+ years'] }
            ],
            3: [
                { id: 'mission', type: 'textarea', label: 'What is your mission statement?', required: true },
                { id: 'uniqueValue', type: 'textarea', label: 'What makes you different from competitors?', required: true },
                { id: 'brandStory', type: 'textarea', label: 'Tell us your brand story in a few sentences', required: true }
            ],
            4: [
                { id: 'brandPersonality', type: 'radio', label: 'Brand Personality', options: [
                    { value: 'bold', title: 'Bold & Edgy', desc: 'Stand out, be different, make a statement' },
                    { value: 'professional', title: 'Professional & Trust', desc: 'Reliable, established, corporate' },
                    { value: 'playful', title: 'Playful & Fun', desc: 'Energetic, youthful, approachable' },
                    { value: 'luxury', title: 'Luxury & Premium', desc: 'High-end, exclusive, sophisticated' }
                ]},
                { id: 'colorPrefs', type: 'textarea', label: 'Color preferences', required: false },
                { id: 'fontStyle', type: 'radio', label: 'Typography Style', options: [
                    { value: 'modern', title: 'Modern Sans-Serif', desc: 'Clean, minimal, contemporary' },
                    { value: 'classic', title: 'Classic Serif', desc: 'Elegant, traditional, timeless' },
                    { value: 'display', title: 'Display/Creative', desc: 'Unique, artistic, memorable' }
                ]}
            ],
            5: [
                { id: 'files', type: 'file', label: 'Upload existing assets, inspiration, or competitor examples', accept: 'image/*,.pdf,.ai,.psd,.doc,.docx', multiple: true }
            ]
        }
    },
    'website-basic': {
        name: 'Website Design',
        price: 2500,
        steps: ['Project Info', 'Content', 'Design', 'Upload', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'websiteGoal', type: 'radio', label: 'Primary Website Goal', options: [
                    { value: 'leads', title: 'Generate Leads', desc: 'Contact forms, inquiries, bookings' },
                    { value: 'sales', title: 'Sell Products', desc: 'E-commerce, online store' },
                    { value: 'info', title: 'Provide Information', desc: 'Portfolio, about, services' },
                    { value: 'booking', title: 'Book Appointments', desc: 'Scheduling, reservations' }
                ]},
                { id: 'currentWebsite', type: 'text', label: 'Current Website URL (if any)', required: false }
            ],
            2: [
                { id: 'pages', type: 'textarea', label: 'List the pages you need (Home, About, Services, Contact, etc.)', required: true },
                { id: 'features', type: 'textarea', label: 'Special features needed (booking system, gallery, blog, etc.)', required: false },
                { id: 'contentReady', type: 'radio', label: 'Do you have website content ready?', options: [
                    { value: 'yes', title: 'Yes, all ready', desc: 'Text, images, and copy prepared' },
                    { value: 'partial', title: 'Partially ready', desc: 'Some content needs work' },
                    { value: 'no', title: 'Need help', desc: 'Will need content creation' }
                ]}
            ],
            3: [
                { id: 'designStyle', type: 'radio', label: 'Design Style', options: [
                    { value: 'minimal', title: 'Minimal & Clean', desc: 'Whitespace, simple, modern' },
                    { value: 'bold', title: 'Bold & Dynamic', desc: 'Strong colors, animations, impact' },
                    { value: 'elegant', title: 'Elegant & Refined', desc: 'Sophisticated, premium feel' },
                    { value: 'creative', title: 'Creative & Unique', desc: 'Artistic, unconventional' }
                ]},
                { id: 'websiteInspiration', type: 'textarea', label: 'Links to websites you like', required: false }
            ],
            4: [
                { id: 'files', type: 'file', label: 'Upload logo, brand assets, content, or reference images', accept: 'image/*,.pdf,.doc,.docx,.txt', multiple: true }
            ]
        }
    },
    'website-pro': {
        name: 'Website Pro',
        price: 5000,
        steps: ['Business Info', 'E-Commerce', 'Design', 'Upload', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry', required: true },
                { id: 'currentWebsite', type: 'text', label: 'Current Website URL', required: false },
                { id: 'monthlyVisitors', type: 'select', label: 'Expected Monthly Visitors', options: ['Under 1,000', '1,000 - 10,000', '10,000 - 50,000', '50,000+'] }
            ],
            2: [
                { id: 'productCount', type: 'select', label: 'Number of Products', options: ['1-10', '11-50', '51-200', '200+'] },
                { id: 'paymentMethods', type: 'textarea', label: 'Payment methods needed (Stripe, PayPal, etc.)', required: true },
                { id: 'shippingNeeds', type: 'textarea', label: 'Shipping requirements', required: false },
                { id: 'integrations', type: 'textarea', label: 'Third-party integrations needed', required: false }
            ],
            3: [
                { id: 'designStyle', type: 'radio', label: 'Design Style', options: [
                    { value: 'minimal', title: 'Minimal & Clean', desc: 'Let products speak for themselves' },
                    { value: 'luxury', title: 'Luxury & Premium', desc: 'High-end shopping experience' },
                    { value: 'energetic', title: 'Bold & Energetic', desc: 'Vibrant, engaging, dynamic' }
                ]},
                { id: 'websiteInspiration', type: 'textarea', label: 'E-commerce sites you admire', required: false }
            ],
            4: [
                { id: 'files', type: 'file', label: 'Upload product images, brand assets, or content', accept: 'image/*,.pdf,.csv,.xlsx', multiple: true }
            ]
        }
    },
    'social-starter': {
        name: 'Social Media Starter',
        price: 800,
        steps: ['Business Info', 'Platforms', 'Style', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry', required: true },
                { id: 'socialHandles', type: 'textarea', label: 'Current social media handles', required: false }
            ],
            2: [
                { id: 'platforms', type: 'textarea', label: 'Which platforms do you need graphics for?', required: true, placeholder: 'Instagram, Facebook, Twitter, LinkedIn, TikTok...' },
                { id: 'contentTypes', type: 'textarea', label: 'Types of posts you need (quotes, promos, announcements, etc.)', required: true }
            ],
            3: [
                { id: 'brandColors', type: 'text', label: 'Brand colors (hex codes if known)', required: false },
                { id: 'style', type: 'radio', label: 'Visual Style', options: [
                    { value: 'minimal', title: 'Clean & Minimal', desc: 'Simple, elegant, professional' },
                    { value: 'bold', title: 'Bold & Eye-catching', desc: 'Vibrant colors, strong typography' },
                    { value: 'playful', title: 'Fun & Playful', desc: 'Illustrations, patterns, energy' }
                ]}
            ]
        }
    },
    'social-pro': {
        name: 'Social Media Pro',
        price: 1500,
        steps: ['Business', 'Strategy', 'Content', 'Upload', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry', required: true },
                { id: 'targetAudience', type: 'textarea', label: 'Describe your target audience', required: true }
            ],
            2: [
                { id: 'goals', type: 'textarea', label: 'What are your social media goals?', required: true },
                { id: 'competitors', type: 'textarea', label: 'Competitors with great social presence', required: false },
                { id: 'postFrequency', type: 'select', label: 'Desired posting frequency', options: ['Daily', '3-4x per week', '2-3x per week', 'Weekly'] }
            ],
            3: [
                { id: 'contentPillars', type: 'textarea', label: 'Main content themes/pillars', required: true },
                { id: 'tone', type: 'radio', label: 'Brand Voice', options: [
                    { value: 'professional', title: 'Professional', desc: 'Authoritative, knowledgeable' },
                    { value: 'friendly', title: 'Friendly & Casual', desc: 'Approachable, conversational' },
                    { value: 'bold', title: 'Bold & Provocative', desc: 'Opinionated, attention-grabbing' }
                ]}
            ],
            4: [
                { id: 'files', type: 'file', label: 'Upload brand assets, product photos, or content ideas', accept: 'image/*,.pdf,.doc', multiple: true }
            ]
        }
    },
    'video-promo': {
        name: 'Promo Video',
        price: 1200,
        steps: ['Project Info', 'Video Details', 'Assets', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'videoGoal', type: 'radio', label: 'Video Purpose', options: [
                    { value: 'brand', title: 'Brand Introduction', desc: 'Introduce your company/brand' },
                    { value: 'product', title: 'Product Launch', desc: 'Showcase a product or service' },
                    { value: 'promo', title: 'Promotion/Sale', desc: 'Announce offers or events' },
                    { value: 'social', title: 'Social Media Ad', desc: 'Short-form video for ads' }
                ]}
            ],
            2: [
                { id: 'videoDuration', type: 'select', label: 'Preferred Duration', options: ['15 seconds', '30 seconds', '60 seconds', '90 seconds'] },
                { id: 'keyMessage', type: 'textarea', label: 'Main message to convey', required: true },
                { id: 'callToAction', type: 'text', label: 'Call to action (Visit website, Shop now, etc.)', required: true }
            ],
            3: [
                { id: 'files', type: 'file', label: 'Upload logo, product images, video clips, or music preferences', accept: 'image/*,video/*,audio/*,.pdf', multiple: true }
            ]
        }
    },
    'full-rebrand': {
        name: 'Full Rebrand',
        price: 8000,
        steps: ['Current State', 'Vision', 'Scope', 'Assets', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'yearsInBusiness', type: 'select', label: 'Years in Business', options: ['1-2 years', '3-5 years', '5-10 years', '10+ years'] },
                { id: 'rebrandReason', type: 'textarea', label: 'Why are you rebranding?', required: true },
                { id: 'currentWebsite', type: 'text', label: 'Current Website', required: false }
            ],
            2: [
                { id: 'newDirection', type: 'textarea', label: 'Describe your new brand direction', required: true },
                { id: 'targetAudience', type: 'textarea', label: 'Target audience for the new brand', required: true },
                { id: 'brandPersonality', type: 'radio', label: 'New Brand Personality', options: [
                    { value: 'bold', title: 'Bold & Disruptive', desc: 'Stand out, challenge norms' },
                    { value: 'premium', title: 'Premium & Exclusive', desc: 'Luxury, high-end feel' },
                    { value: 'approachable', title: 'Friendly & Approachable', desc: 'Warm, welcoming, trustworthy' },
                    { value: 'innovative', title: 'Innovative & Future-forward', desc: 'Tech-savvy, cutting-edge' }
                ]}
            ],
            3: [
                { id: 'scope', type: 'textarea', label: 'What needs to be rebranded? (logo, website, social, signage, etc.)', required: true },
                { id: 'timeline', type: 'select', label: 'Desired Timeline', options: ['ASAP', '1 month', '2-3 months', 'Flexible'] },
                { id: 'keepElements', type: 'textarea', label: 'Any elements to keep from current brand?', required: false }
            ],
            4: [
                { id: 'files', type: 'file', label: 'Upload current brand assets and inspiration for new direction', accept: 'image/*,.pdf,.ai,.psd,.doc', multiple: true }
            ]
        }
    },
    'custom': {
        name: 'Custom Project',
        price: 0,
        steps: ['Project Info', 'Details', 'Budget', 'Upload', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: false }
            ],
            2: [
                { id: 'projectType', type: 'textarea', label: 'Describe your project', required: true },
                { id: 'goals', type: 'textarea', label: 'What do you want to achieve?', required: true },
                { id: 'timeline', type: 'select', label: 'Timeline', options: ['ASAP', '2 weeks', '1 month', '2-3 months', 'Flexible'] }
            ],
            3: [
                { id: 'budget', type: 'radio', label: 'Budget Range', options: [
                    { value: '1000-2500', title: '$1,000 - $2,500', desc: 'Small project scope' },
                    { value: '2500-5000', title: '$2,500 - $5,000', desc: 'Medium project scope' },
                    { value: '5000-10000', title: '$5,000 - $10,000', desc: 'Large project scope' },
                    { value: '10000+', title: '$10,000+', desc: 'Enterprise/Complex project' }
                ]}
            ],
            4: [
                { id: 'files', type: 'file', label: 'Upload any relevant files or references', accept: '*', multiple: true }
            ]
        }
    },
    'brand-kit': {
        name: 'Brand Kit',
        price: 1500,
        steps: ['Contact Info', 'Your Background', 'Brand Vision', 'Preferences', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true },
                { id: 'industry', type: 'text', label: 'Industry/Niche', required: true }
            ],
            2: [
                { id: 'howDidYouHear', type: 'select', label: 'How did you hear about us?', options: ['Google Search', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Referral from Friend', 'Referral from Client', 'Saw Our Work', 'Local Event', 'Other'] },
                { id: 'workedWithUsBefore', type: 'radio', label: 'Have you worked with us before?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Returning client' },
                    { value: 'no', title: 'No', desc: 'First time' }
                ]},
                { id: 'socialMediaAccounts', type: 'textarea', label: 'Your Social Media Accounts', required: false, placeholder: '@instagram, /facebook, etc.' },
                { id: 'emailMarketing', type: 'radio', label: 'Do you currently do email marketing?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Regular newsletters' },
                    { value: 'sometimes', title: 'Sometimes', desc: 'Occasional' },
                    { value: 'no', title: 'No', desc: 'Not yet' }
                ]}
            ],
            3: [
                { id: 'brandPersonality', type: 'radio', label: 'Brand Personality', options: [
                    { value: 'bold', title: 'Bold & Edgy', desc: 'Stand out, make a statement' },
                    { value: 'professional', title: 'Professional & Trust', desc: 'Reliable, established' },
                    { value: 'playful', title: 'Playful & Fun', desc: 'Energetic, approachable' },
                    { value: 'luxury', title: 'Luxury & Premium', desc: 'High-end, sophisticated' }
                ]},
                { id: 'brandValues', type: 'textarea', label: 'What 3 words describe your brand?', required: true }
            ],
            4: [
                { id: 'colorPrefs', type: 'textarea', label: 'Color preferences (or colors to avoid)', required: false },
                { id: 'competitors', type: 'textarea', label: 'Brands you admire (for inspiration)', required: false },
                { id: 'timeline', type: 'select', label: 'Desired Timeline', options: ['ASAP', '1 week', '2 weeks', 'Flexible'] }
            ]
        }
    },
    'product-brand': {
        name: 'Product Brand Identity',
        price: 4500,
        steps: ['Contact Info', 'Your Background', 'Product Details', 'Brand Direction', 'Deliverables', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'howDidYouHear', type: 'select', label: 'How did you hear about us?', options: ['Google Search', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Referral from Friend', 'Referral from Client', 'Saw Our Work', 'Local Event', 'Other'] },
                { id: 'workedWithUsBefore', type: 'radio', label: 'Have you worked with us before?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Returning client' },
                    { value: 'no', title: 'No', desc: 'First time' }
                ]},
                { id: 'socialMediaAccounts', type: 'textarea', label: 'Your Social Media Accounts', required: false, placeholder: '@instagram, /facebook, etc.' },
                { id: 'currentlyAdvertising', type: 'radio', label: 'Are you currently running paid ads?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Facebook, Google, etc.' },
                    { value: 'no', title: 'No', desc: 'Organic only' }
                ]}
            ],
            3: [
                { id: 'productType', type: 'textarea', label: 'What products do you sell?', required: true },
                { id: 'targetMarket', type: 'textarea', label: 'Who is your target customer?', required: true },
                { id: 'salesChannels', type: 'textarea', label: 'Where do you sell? (online, retail, markets, etc.)', required: true }
            ],
            4: [
                { id: 'brandPersonality', type: 'radio', label: 'Brand Personality', options: [
                    { value: 'bold', title: 'Bold & Edgy', desc: 'Stand out on the shelf' },
                    { value: 'artisan', title: 'Artisan & Handcrafted', desc: 'Authentic, handmade feel' },
                    { value: 'modern', title: 'Modern & Clean', desc: 'Minimalist, contemporary' },
                    { value: 'luxury', title: 'Premium & Luxury', desc: 'High-end, exclusive' }
                ]},
                { id: 'colorPrefs', type: 'textarea', label: 'Color preferences', required: false }
            ],
            5: [
                { id: 'packagingNeeds', type: 'textarea', label: 'What packaging do you need? (labels, boxes, bags, etc.)', required: true },
                { id: 'merchNeeds', type: 'textarea', label: 'Merchandise needs (t-shirts, hats, uniforms, etc.)', required: false },
                { id: 'photoNeeds', type: 'radio', label: 'Do you need product photography?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Include photo session' },
                    { value: 'no', title: 'No', desc: 'I have product photos' }
                ]}
            ]
        }
    },
    'service-brand': {
        name: 'Service Brand Identity',
        price: 3500,
        steps: ['Contact Info', 'Your Background', 'Business Details', 'Brand Direction', 'Deliverables', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'howDidYouHear', type: 'select', label: 'How did you hear about us?', options: ['Google Search', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Referral from Friend', 'Referral from Client', 'Saw Our Work', 'Local Event', 'Other'] },
                { id: 'workedWithUsBefore', type: 'radio', label: 'Have you worked with us before?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Returning client' },
                    { value: 'no', title: 'No', desc: 'First time' }
                ]},
                { id: 'socialMediaAccounts', type: 'textarea', label: 'Your Social Media Accounts', required: false, placeholder: '@instagram, /facebook, etc.' },
                { id: 'directMailers', type: 'radio', label: 'Do you use direct mail/mailers?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Postcards, flyers' },
                    { value: 'no', title: 'No', desc: 'Digital only' }
                ]}
            ],
            3: [
                { id: 'serviceType', type: 'textarea', label: 'What services do you provide?', required: true },
                { id: 'targetAudience', type: 'textarea', label: 'Who is your ideal client?', required: true },
                { id: 'serviceArea', type: 'text', label: 'Service area (city, state, or national)', required: true }
            ],
            4: [
                { id: 'brandPersonality', type: 'radio', label: 'Brand Personality', options: [
                    { value: 'professional', title: 'Professional & Trusted', desc: 'Established, reliable' },
                    { value: 'friendly', title: 'Friendly & Approachable', desc: 'Warm, welcoming' },
                    { value: 'premium', title: 'Premium & Exclusive', desc: 'High-end service' },
                    { value: 'bold', title: 'Bold & Confident', desc: 'Stand out from competitors' }
                ]},
                { id: 'colorPrefs', type: 'textarea', label: 'Color preferences', required: false }
            ],
            5: [
                { id: 'printNeeds', type: 'radio', label: 'Do you need print design (banners, signs, decals)?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Banners, yard signs, decals, posters' },
                    { value: 'no', title: 'No', desc: 'Not needed' }
                ]},
                { id: 'uniformNeeds', type: 'radio', label: 'Do you need uniforms designed?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Polos, shirts, hats' },
                    { value: 'no', title: 'No', desc: 'Not needed' }
                ]},
                { id: 'additionalNeeds', type: 'textarea', label: 'Any other specific needs?', required: false }
            ]
        }
    },
    'landing-page': {
        name: 'Landing Page',
        price: 800,
        steps: ['Contact Info', 'Page Details', 'Design', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'pageGoal', type: 'radio', label: 'Page Goal', options: [
                    { value: 'leads', title: 'Capture Leads', desc: 'Email signups, contact forms' },
                    { value: 'sales', title: 'Sell Product/Service', desc: 'Direct sales page' },
                    { value: 'event', title: 'Event Registration', desc: 'Webinar, workshop, etc.' },
                    { value: 'launch', title: 'Coming Soon', desc: 'Pre-launch page' }
                ]},
                { id: 'headline', type: 'text', label: 'Main headline or offer', required: true },
                { id: 'callToAction', type: 'text', label: 'Call to action (Sign Up, Buy Now, etc.)', required: true }
            ],
            3: [
                { id: 'designStyle', type: 'radio', label: 'Design Style', options: [
                    { value: 'minimal', title: 'Clean & Minimal', desc: 'Simple, focused' },
                    { value: 'bold', title: 'Bold & High-energy', desc: 'Vibrant, attention-grabbing' },
                    { value: 'elegant', title: 'Elegant & Premium', desc: 'Sophisticated look' }
                ]},
                { id: 'inspiration', type: 'textarea', label: 'Links to landing pages you like', required: false }
            ]
        }
    },
    'business-website': {
        name: 'Business Website',
        price: 2500,
        steps: ['Contact Info', 'Website Goals', 'Pages & Features', 'Design', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true },
                { id: 'currentWebsite', type: 'text', label: 'Current Website (if any)', required: false }
            ],
            2: [
                { id: 'websiteGoal', type: 'radio', label: 'Primary Goal', options: [
                    { value: 'leads', title: 'Generate Leads', desc: 'Contact forms, inquiries' },
                    { value: 'info', title: 'Showcase Services', desc: 'Portfolio, about, services' },
                    { value: 'booking', title: 'Book Appointments', desc: 'Scheduling system' },
                    { value: 'brand', title: 'Build Brand Presence', desc: 'Establish credibility' }
                ]},
                { id: 'targetAudience', type: 'textarea', label: 'Who are your website visitors?', required: true }
            ],
            3: [
                { id: 'pages', type: 'textarea', label: 'Pages needed (Home, About, Services, Contact, etc.)', required: true },
                { id: 'features', type: 'textarea', label: 'Special features (booking, gallery, blog, etc.)', required: false },
                { id: 'contentReady', type: 'radio', label: 'Do you have content ready?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Text and images ready' },
                    { value: 'partial', title: 'Partially', desc: 'Some content needs work' },
                    { value: 'no', title: 'Need Help', desc: 'Will need content creation' }
                ]}
            ],
            4: [
                { id: 'designStyle', type: 'radio', label: 'Design Style', options: [
                    { value: 'minimal', title: 'Minimal & Clean', desc: 'Whitespace, simple' },
                    { value: 'bold', title: 'Bold & Dynamic', desc: 'Strong colors, impact' },
                    { value: 'elegant', title: 'Elegant & Refined', desc: 'Sophisticated, premium' }
                ]},
                { id: 'inspiration', type: 'textarea', label: 'Websites you like', required: false }
            ]
        }
    },
    'ecommerce': {
        name: 'E-Commerce Store',
        price: 4000,
        steps: ['Contact Info', 'Store Details', 'Products', 'Features', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business/Store Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'platform', type: 'radio', label: 'Preferred Platform', options: [
                    { value: 'shopify', title: 'Shopify', desc: 'Best for most businesses' },
                    { value: 'woocommerce', title: 'WooCommerce', desc: 'WordPress-based' },
                    { value: 'unsure', title: 'Not Sure', desc: 'Help me decide' }
                ]},
                { id: 'productTypes', type: 'textarea', label: 'What products will you sell?', required: true }
            ],
            3: [
                { id: 'productCount', type: 'select', label: 'Number of Products', options: ['1-10', '11-25', '26-50', '50+'] },
                { id: 'hasProducts', type: 'radio', label: 'Do you have product photos?', options: [
                    { value: 'yes', title: 'Yes', desc: 'Ready to upload' },
                    { value: 'no', title: 'No', desc: 'Need photography' }
                ]}
            ],
            4: [
                { id: 'paymentMethods', type: 'textarea', label: 'Payment methods needed', required: true, placeholder: 'Stripe, PayPal, etc.' },
                { id: 'shippingNeeds', type: 'textarea', label: 'Shipping requirements', required: false },
                { id: 'additionalFeatures', type: 'textarea', label: 'Additional features needed', required: false }
            ]
        }
    },
    'webapp': {
        name: 'Custom Web Application',
        price: 0,
        steps: ['Contact Info', 'Project Overview', 'Features', 'Budget & Timeline', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'appType', type: 'radio', label: 'What type of web app?', options: [
                    { value: 'portal', title: 'Client Portal', desc: 'Secure login for clients' },
                    { value: 'booking', title: 'Booking System', desc: 'Appointments & scheduling' },
                    { value: 'dashboard', title: 'Dashboard/CRM', desc: 'Data management' },
                    { value: 'other', title: 'Other', desc: 'Custom application' }
                ]},
                { id: 'appDescription', type: 'textarea', label: 'Describe what you want the app to do', required: true }
            ],
            3: [
                { id: 'userTypes', type: 'textarea', label: 'Who will use this app?', required: true },
                { id: 'keyFeatures', type: 'textarea', label: 'List the key features needed', required: true },
                { id: 'integrations', type: 'textarea', label: 'Third-party integrations needed', required: false }
            ],
            4: [
                { id: 'budget', type: 'radio', label: 'Budget Range', options: [
                    { value: '5000-10000', title: '$5,000 - $10,000', desc: 'Simple web app' },
                    { value: '10000-25000', title: '$10,000 - $25,000', desc: 'Medium complexity' },
                    { value: '25000+', title: '$25,000+', desc: 'Complex application' }
                ]},
                { id: 'timeline', type: 'select', label: 'Desired Timeline', options: ['1-2 months', '2-3 months', '3-6 months', 'Flexible'] }
            ]
        }
    },
    'mvp-app': {
        name: 'MVP Mobile App',
        price: 8000,
        steps: ['Contact Info', 'App Concept', 'Features', 'Design', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business/App Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'appPurpose', type: 'textarea', label: 'What problem does your app solve?', required: true },
                { id: 'targetUsers', type: 'textarea', label: 'Who is your target user?', required: true },
                { id: 'competitors', type: 'textarea', label: 'Similar apps in the market', required: false }
            ],
            3: [
                { id: 'coreFeatures', type: 'textarea', label: 'List 3-5 core features for the MVP', required: true },
                { id: 'platforms', type: 'radio', label: 'Platforms', options: [
                    { value: 'both', title: 'iOS & Android', desc: 'Cross-platform (recommended)' },
                    { value: 'ios', title: 'iOS Only', desc: 'iPhone/iPad' },
                    { value: 'android', title: 'Android Only', desc: 'Android devices' }
                ]}
            ],
            4: [
                { id: 'designStyle', type: 'radio', label: 'Design Style', options: [
                    { value: 'minimal', title: 'Clean & Minimal', desc: 'Simple, intuitive' },
                    { value: 'bold', title: 'Bold & Modern', desc: 'Eye-catching design' },
                    { value: 'playful', title: 'Fun & Playful', desc: 'Engaging, colorful' }
                ]},
                { id: 'inspiration', type: 'textarea', label: 'Apps you like for inspiration', required: false }
            ]
        }
    },
    'custom-app': {
        name: 'Custom Mobile App',
        price: 0,
        steps: ['Contact Info', 'App Vision', 'Features', 'Budget', 'Review'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business/App Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'appVision', type: 'textarea', label: 'Describe your app vision in detail', required: true },
                { id: 'targetUsers', type: 'textarea', label: 'Target users and use cases', required: true },
                { id: 'businessModel', type: 'textarea', label: 'How will the app make money?', required: false }
            ],
            3: [
                { id: 'allFeatures', type: 'textarea', label: 'List all features needed', required: true },
                { id: 'integrations', type: 'textarea', label: 'Third-party integrations', required: false },
                { id: 'platforms', type: 'radio', label: 'Platforms', options: [
                    { value: 'both', title: 'iOS & Android', desc: 'Maximum reach' },
                    { value: 'ios', title: 'iOS Only', desc: 'iPhone/iPad' },
                    { value: 'android', title: 'Android Only', desc: 'Android devices' }
                ]}
            ],
            4: [
                { id: 'budget', type: 'radio', label: 'Budget Range', options: [
                    { value: '15000-30000', title: '$15,000 - $30,000', desc: 'Standard app' },
                    { value: '30000-50000', title: '$30,000 - $50,000', desc: 'Complex app' },
                    { value: '50000+', title: '$50,000+', desc: 'Enterprise solution' }
                ]},
                { id: 'timeline', type: 'select', label: 'Timeline', options: ['2-3 months', '3-6 months', '6+ months', 'Flexible'] }
            ]
        }
    },
    'lead-funnel': {
        name: 'Lead Capture Funnel',
        price: 1200,
        steps: ['Contact Info', 'Funnel Goals', 'Lead Magnet', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'targetAudience', type: 'textarea', label: 'Who are you trying to attract?', required: true },
                { id: 'offer', type: 'textarea', label: 'What do you ultimately want to sell them?', required: true }
            ],
            3: [
                { id: 'leadMagnet', type: 'radio', label: 'Lead Magnet Type', options: [
                    { value: 'ebook', title: 'eBook/Guide', desc: 'PDF download' },
                    { value: 'checklist', title: 'Checklist/Template', desc: 'Quick-win resource' },
                    { value: 'video', title: 'Video Training', desc: 'Video content' },
                    { value: 'discount', title: 'Discount/Coupon', desc: 'Special offer' }
                ]},
                { id: 'leadMagnetTopic', type: 'text', label: 'Lead magnet topic/title', required: true }
            ]
        }
    },
    'sales-funnel': {
        name: 'Full Sales Funnel',
        price: 2500,
        steps: ['Contact Info', 'Offer Details', 'Funnel Structure', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'mainOffer', type: 'textarea', label: 'What is your main offer/product?', required: true },
                { id: 'pricePoint', type: 'text', label: 'Price point', required: true },
                { id: 'targetAudience', type: 'textarea', label: 'Target audience', required: true }
            ],
            3: [
                { id: 'funnelType', type: 'radio', label: 'Funnel Type', options: [
                    { value: 'tripwire', title: 'Tripwire Funnel', desc: 'Low-ticket to high-ticket' },
                    { value: 'webinar', title: 'Webinar Funnel', desc: 'Educate then sell' },
                    { value: 'vsl', title: 'VSL Funnel', desc: 'Video sales letter' },
                    { value: 'product', title: 'Product Launch', desc: 'Launch sequence' }
                ]},
                { id: 'upsells', type: 'textarea', label: 'Upsell/downsell offers (if any)', required: false }
            ]
        }
    },
    'webinar-funnel': {
        name: 'Webinar Funnel',
        price: 3000,
        steps: ['Contact Info', 'Webinar Details', 'Offer', 'Review & Pay'],
        fields: {
            1: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'webinarTopic', type: 'text', label: 'Webinar Topic/Title', required: true },
                { id: 'webinarType', type: 'radio', label: 'Webinar Type', options: [
                    { value: 'live', title: 'Live Webinar', desc: 'Real-time presentation' },
                    { value: 'evergreen', title: 'Evergreen/Automated', desc: 'Pre-recorded, runs automatically' }
                ]},
                { id: 'targetAudience', type: 'textarea', label: 'Who is this webinar for?', required: true }
            ],
            3: [
                { id: 'offer', type: 'textarea', label: 'What will you sell at the end?', required: true },
                { id: 'offerPrice', type: 'text', label: 'Offer price point', required: true },
                { id: 'bonuses', type: 'textarea', label: 'Bonuses to include', required: false }
            ]
        }
    },
    'consultation': {
        name: 'Free Strategy Call',
        price: 0,
        steps: ['Contact Info', 'Business Info', 'Goals', 'Schedule'],
        fields: {
            1: [
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry', required: true },
                { id: 'website', type: 'text', label: 'Current Website (if any)', required: false }
            ],
            3: [
                { id: 'goals', type: 'textarea', label: 'What do you want to achieve?', required: true },
                { id: 'budget', type: 'radio', label: 'Estimated Budget', options: [
                    { value: '1000-3000', title: '$1,000 - $3,000', desc: '' },
                    { value: '3000-5000', title: '$3,000 - $5,000', desc: '' },
                    { value: '5000-10000', title: '$5,000 - $10,000', desc: '' },
                    { value: '10000+', title: '$10,000+', desc: '' }
                ]},
                { id: 'timeline', type: 'select', label: 'When do you want to start?', options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Just exploring'] }
            ]
        }
    },
    'custom-package': {
        name: 'Custom Package',
        price: 0,
        steps: ['Contact Info', 'Business Details', 'Confirm Services', 'Review & Pay'],
        fields: {
            1: [
                { id: 'contactName', type: 'text', label: 'Your Name', required: true },
                { id: 'email', type: 'email', label: 'Email', required: true },
                { id: 'phone', type: 'tel', label: 'Phone', required: true }
            ],
            2: [
                { id: 'businessName', type: 'text', label: 'Business Name', required: true },
                { id: 'industry', type: 'text', label: 'Industry', required: true },
                { id: 'website', type: 'text', label: 'Current Website (if any)', required: false },
                { id: 'additionalNotes', type: 'textarea', label: 'Anything else we should know?', required: false }
            ],
            3: [
                { id: 'servicesConfirm', type: 'custom-services-display', label: 'Your Selected Services' },
                { id: 'timeline', type: 'select', label: 'Desired Timeline', options: ['ASAP', '2-4 weeks', '1-2 months', 'Flexible'] }
            ]
        }
    }
};

// Form submissions storage
let formSubmissions = JSON.parse(localStorage.getItem('nui_submissions')) || [];
function saveSubmissions() { localStorage.setItem('nui_submissions', JSON.stringify(formSubmissions)); }

function startServiceIntake(serviceId) {
    const config = serviceIntakeConfigs[serviceId];
    if (!config) { alert('Service not found'); return; }

    // For custom package, get price from localStorage
    let price = config.price;
    let customServices = [];
    if (serviceId === 'custom-package') {
        price = parseInt(localStorage.getItem('customPackageTotal') || 0);
        customServices = JSON.parse(localStorage.getItem('customPackageServices') || '[]');
    }

    intakeData = { serviceId, serviceName: config.name, price: price, customServices: customServices };
    currentIntakeStep = 1;
    uploadedFiles = [];

    showView('intake');
    renderIntakeWizard(serviceId);
}

function renderIntakeWizard(serviceId) {
    const config = serviceIntakeConfigs[serviceId];
    const totalSteps = config.steps.length;
    const progressPercent = ((currentIntakeStep - 1) / (totalSteps - 1)) * 100;

    let stepsHtml = config.steps.map((step, i) => {
        const stepNum = i + 1;
        let className = 'wizard-step';
        if (stepNum < currentIntakeStep) className += ' completed';
        if (stepNum === currentIntakeStep) className += ' active';
        return `<div class="${className}"><div class="wizard-step-number">${stepNum < currentIntakeStep ? '✓' : stepNum}</div><div class="wizard-step-label">${step}</div></div>`;
    }).join('');

    let panelsHtml = '';
    for (let step = 1; step <= totalSteps; step++) {
        const isReview = step === totalSteps;
        const fields = config.fields[step] || [];

        panelsHtml += `<div class="wizard-panel ${step === currentIntakeStep ? 'active' : ''}" data-step="${step}">`;

        if (isReview) {
            panelsHtml += renderReviewStep(serviceId);
        } else {
            panelsHtml += `<h2 class="wizard-title">${config.steps[step-1]}</h2>`;
            panelsHtml += `<p class="wizard-subtitle">Step ${step} of ${totalSteps}</p>`;
            fields.forEach(field => {
                panelsHtml += renderIntakeField(field);
            });
        }

        panelsHtml += `<div class="wizard-buttons">`;
        if (step > 1) panelsHtml += `<button class="wizard-btn wizard-btn-back" onclick="prevIntakeStep()">← Back</button>`;
        if (isReview) {
            panelsHtml += `<button class="wizard-btn wizard-btn-submit" onclick="submitIntake()">Submit & Continue to Payment →</button>`;
        } else {
            panelsHtml += `<button class="wizard-btn wizard-btn-next" onclick="nextIntakeStep()">Continue →</button>`;
        }
        panelsHtml += `</div></div>`;
    }

    const displayPrice = intakeData.price || config.price;

    // Hormozi-style sales copy based on service type
    const salesCopy = {
        'brand-kit': {
            hook: "Stop losing customers to competitors with better branding.",
            problem: "Right now, potential customers are scrolling past your business because your brand looks DIY. They're choosing competitors who look more established — even if your product is better.",
            agitate: "Every day without professional branding costs you sales. People judge in 0.05 seconds. A weak brand = weak trust = lost revenue.",
            solution: "Get a complete brand identity that makes you look like the premium choice. Logo, colors, voice, social presence — everything you need to command higher prices and close more deals.",
            proof: "50+ Detroit businesses transformed. Average client sees 3x more engagement within 30 days."
        },
        'product-brand': {
            hook: "Your product deserves packaging that sells itself.",
            problem: "Great products fail every day because they look like every other option on the shelf. Customers can't tell you're different if you look the same.",
            agitate: "You're spending money on ads to drive people to products with forgettable packaging. That's like paying for a first date and showing up in pajamas.",
            solution: "Get packaging and branding that stops the scroll, wins the shelf, and turns browsers into buyers. From labels to social content — we build brands that print money.",
            proof: "Our product brands average 340% increase in online sales within 90 days."
        },
        'service-brand': {
            hook: "Charge more. Win more. Look like the obvious choice.",
            problem: "You're competing on price because your brand doesn't communicate value. Prospects are haggling with you while paying premium prices to competitors with better presentation.",
            agitate: "Every proposal you send with a generic logo and mismatched colors screams 'small operation.' And small operations get small budgets.",
            solution: "Get the brand presence that commands premium pricing. Banners, yard signs, vinyl decals, uniforms, professional collateral — look like the company that charges 2x more (then charge 2x more).",
            proof: "Service businesses we brand report 40% higher close rates on proposals."
        },
        'business-website': {
            hook: "Your website is either making you money or costing you money.",
            problem: "Your current site is a digital brochure that does nothing. Visitors come, see nothing compelling, and leave. No calls. No sales. Just a monthly hosting bill.",
            agitate: "You're paying for ads that send traffic to a website that doesn't convert. That's literally paying to lose customers.",
            solution: "Get a website built to convert visitors into customers 24/7. Strategic design, compelling copy, clear calls-to-action — every element engineered to generate leads while you sleep.",
            proof: "Average client sees 280% increase in website inquiries within 60 days."
        },
        'landing-page': {
            hook: "One page. One goal. Maximum conversions.",
            problem: "You're sending traffic to pages that confuse visitors. Too many options. No clear path. They leave without taking action.",
            agitate: "Every click you pay for that doesn't convert is money burned. Bad landing pages are the most expensive mistake in marketing.",
            solution: "Get a landing page engineered for one thing: conversions. Clear headline, compelling offer, irresistible call-to-action. Built to turn visitors into leads.",
            proof: "Our landing pages average 3-5x higher conversion rates than industry standard."
        },
        'ecommerce': {
            hook: "Stop losing sales to a clunky checkout process.",
            problem: "Your store looks like it was built in 2015. Customers add to cart then abandon because the experience feels sketchy.",
            agitate: "69% of carts get abandoned. Every friction point in your store is money walking out the door.",
            solution: "Get a store built for conversions. Fast load times, trust signals, seamless checkout — every element optimized to turn browsers into buyers.",
            proof: "E-commerce clients see average 40% reduction in cart abandonment within 30 days."
        },
        'lead-funnel': {
            hook: "Build a lead machine that works while you sleep.",
            problem: "You're chasing leads instead of attracting them. Cold calling, networking, hoping someone finds you. That's exhausting and unscalable.",
            agitate: "Your competitors have automated systems generating leads 24/7. You're still trading time for maybe-customers.",
            solution: "Get a lead funnel that captures, nurtures, and qualifies prospects automatically. Wake up to warm leads ready to buy.",
            proof: "Average funnel generates 50+ qualified leads per month on autopilot."
        },
        'sales-funnel': {
            hook: "Turn strangers into customers while you sleep.",
            problem: "You have a great offer but no system to sell it. Every sale requires your time, energy, and manual follow-up.",
            agitate: "You're the bottleneck in your own business. Can't scale what requires your presence to close.",
            solution: "Get a sales funnel that educates, builds trust, and closes deals automatically. A 24/7 salesperson that never takes a day off.",
            proof: "Our sales funnels average $50K+ in automated revenue per client annually."
        },
        'custom-package': {
            hook: "Get exactly what you need. Nothing you don't.",
            problem: "Cookie-cutter packages either give you too much or not enough. You're paying for services you don't need or missing critical pieces.",
            agitate: "One-size-fits-all doesn't fit anyone well. Your business is unique — your solution should be too.",
            solution: "Build a custom package with only the services that move your needle. Every dollar invested in exactly what you need.",
            proof: "Custom packages deliver 2x more value because every element is intentional."
        },
        'consultation': {
            hook: "15 minutes that could change your business.",
            problem: "You know something needs to change but you're not sure what. DIY hasn't worked. Generic advice doesn't apply.",
            agitate: "Every month you stay stuck is revenue left on the table. Your competitors aren't waiting.",
            solution: "Get a free strategy call with someone who's helped 50+ businesses break through. No pitch, just clarity on your next best move.",
            proof: "90% of strategy calls end with a clear action plan — whether you work with us or not."
        },
        'default': {
            hook: "Ready to stop blending in and start standing out?",
            problem: "Most businesses look exactly like their competitors. Same boring templates. Same forgettable presence. Same struggle to get noticed.",
            agitate: "In a world of infinite scroll, invisible = irrelevant. Every day your brand doesn't demand attention is a day your competitors are winning.",
            solution: "Get bold, strategic design that captures attention and converts it into revenue. We don't make things pretty — we make things profitable.",
            proof: "50+ brands elevated. $2M+ in client revenue generated. 100% Detroit-made."
        }
    };

    const copy = salesCopy[serviceId] || salesCopy['default'];

    document.getElementById('intakeView').innerHTML = `
<div class="intake-view">
<div class="intake-service-header">
<div class="intake-service-badge">Service Intake</div>
<div class="intake-service-name">${config.name}</div>
<div class="intake-service-price">${displayPrice > 0 ? '$' + displayPrice.toLocaleString() : 'Custom Quote'}</div>
</div>

            <!-- HORMOZI-STYLE SALES SECTION -->
<div style="max-width: 700px; margin: 0 auto 40px; padding: 0 20px;">
<div style="background: linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(0,0,0,0.3) 100%); border: 1px solid rgba(255,59,48,0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
<h2 style="font-family:'Syne',sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 16px; line-height: 1.3;">${copy.hook}</h2>
<p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin-bottom: 16px;">${copy.problem}</p>
<p style="color: rgba(255,255,255,0.9); font-size: 15px; line-height: 1.7; margin-bottom: 16px; font-weight: 500;">${copy.agitate}</p>
<p style="color: #fff; font-size: 15px; line-height: 1.7; margin-bottom: 20px;"><strong class="text-red">The Solution:</strong> ${copy.solution}</p>
<div style="display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
<span class="fs-24">📈</span>
<p style="color: var(--red); font-size: 14px; font-weight: 600; margin: 0;">${copy.proof}</p>
</div>
</div>

                <!-- TRUST BADGES -->
<div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; margin-bottom: 24px;">
<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 13px;">
<span class="text-red">✓</span> 24-48hr Response
</div>
<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 13px;">
<span class="text-red">✓</span> Satisfaction Guaranteed
</div>
<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 13px;">
<span class="text-red">✓</span> Detroit-Based Team
</div>
</div>

<p style="text-align: center; color: rgba(255,255,255,0.5); font-size: 13px;">Complete this quick form and we'll get back to you within 24 hours with next steps.</p>
</div>

<div class="intake-wizard">
<div class="wizard-progress">
<div class="wizard-progress-fill" style="width: ${progressPercent}%"></div>
                    ${stepsHtml}
</div>
<div class="wizard-content">
                    ${panelsHtml}
</div>
</div>

            <!-- BOTTOM CLOSER -->
<div style="max-width: 600px; margin: 40px auto 0; padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 8px;">Still have questions?</p>
<p style="color: rgba(255,255,255,0.8); font-size: 14px;">Call or text: <a href="tel:+12484878747" style="color: var(--red); text-decoration: none; font-weight: 600;">(248) 487-8747</a></p>
</div>
</div>
    `;

    // Restore saved data
    Object.keys(intakeData).forEach(key => {
        const input = document.getElementById(key);
        if (input && intakeData[key]) {
            if (input.type === 'radio') {
                document.querySelector(`input[name="${key}"][value="${intakeData[key]}"]`)?.click();
            } else {
                input.value = intakeData[key];
            }
        }
    });
}

function renderIntakeField(field) {
    let html = `<div class="wizard-field">`;
    html += `<label class="wizard-label">${field.label}${field.required ? ' *' : ''}</label>`;

    switch(field.type) {
        case 'text':
        case 'email':
        case 'tel':
            html += `<input type="${field.type}" id="${field.id}" class="wizard-input" ${field.required ? 'required' : ''} onchange="saveIntakeField('${field.id}', this.value)">`;
            break;
        case 'textarea':
            html += `<textarea id="${field.id}" class="wizard-textarea" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}" onchange="saveIntakeField('${field.id}', this.value)"></textarea>`;
            break;
        case 'select':
            html += `<select id="${field.id}" class="wizard-select" onchange="saveIntakeField('${field.id}', this.value)">
<option value="">Select...</option>
                ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
</select>`;
            break;
        case 'radio':
            html += `<div class="wizard-radio-group">`;
            field.options.forEach(opt => {
                html += `<label class="wizard-radio" onclick="selectRadio(this, '${field.id}', '${opt.value}')">
<input type="radio" name="${field.id}" value="${opt.value}">
<div class="wizard-radio-check"></div>
<div class="wizard-radio-content">
<h4>${opt.title}</h4>
<p>${opt.desc}</p>
</div>
</label>`;
            });
            html += `</div>`;
            break;
        case 'file':
            html += `<div class="file-upload-zone" onclick="document.getElementById('${field.id}').click()" ondragover="event.preventDefault(); this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="handleFileDrop(event, '${field.id}')">
<div class="file-upload-icon">📁</div>
<div class="file-upload-text">Click to upload or drag & drop</div>
<div class="file-upload-hint">Supports: ${field.accept}</div>
<input type="file" id="${field.id}" class="file-upload-input" ${field.multiple ? 'multiple' : ''} accept="${field.accept}" onchange="handleFileSelect(this)">
</div>
<div class="uploaded-files" id="${field.id}-list"></div>`;
            break;
        case 'custom-services-display':
            const savedServices = JSON.parse(localStorage.getItem('customPackageServices') || '[]');
            const savedTotal = localStorage.getItem('customPackageTotal') || 0;
            html += `<div class="custom-services-review" style="background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    ${savedServices.map(s => `<span style="background: rgba(255,59,48,0.15); border: 1px solid rgba(255,59,48,0.3); color: #fff; font-size: 12px; padding: 8px 14px; border-radius: 6px; font-weight: 600;">${s}</span>`).join('')}
</div>
<div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);">
<span style="color: var(--gray); font-size: 14px;">${savedServices.length} services selected</span>
<span style="font-size: 28px; font-weight: 900; color: var(--red);">$${parseInt(savedTotal).toLocaleString()}</span>
</div>
</div>`;
            break;
    }

    html += `</div>`;
    return html;
}

function selectRadio(el, fieldId, value) {
    document.querySelectorAll(`[name="${fieldId}"]`).forEach(r => r.closest('.wizard-radio').classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
    saveIntakeField(fieldId, value);
}

function saveIntakeField(fieldId, value) {
    intakeData[fieldId] = value;
}

function handleFileSelect(input) {
    Array.from(input.files).forEach(file => {
        uploadedFiles.push(file);
        renderUploadedFiles(input.id);
    });
}

function handleFileDrop(event, inputId) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    Array.from(event.dataTransfer.files).forEach(file => {
        uploadedFiles.push(file);
    });
    renderUploadedFiles(inputId);
}

function renderUploadedFiles(inputId) {
    const container = document.getElementById(inputId + '-list');
    if (!container) return;
    container.innerHTML = uploadedFiles.map((file, i) =>
        `<div class="uploaded-file"><span>${file.name}</span><span class="uploaded-file-remove" onclick="removeFile(${i}, '${inputId}')">×</span></div>`
    ).join('');
}

function removeFile(index, inputId) {
    uploadedFiles.splice(index, 1);
    renderUploadedFiles(inputId);
}

function nextIntakeStep() {
    const config = serviceIntakeConfigs[intakeData.serviceId];
    if (currentIntakeStep < config.steps.length) {
        currentIntakeStep++;
        renderIntakeWizard(intakeData.serviceId);
    }
}

function prevIntakeStep() {
    if (currentIntakeStep > 1) {
        currentIntakeStep--;
        renderIntakeWizard(intakeData.serviceId);
    }
}

function renderReviewStep(serviceId) {
    const config = serviceIntakeConfigs[serviceId];
    const displayPrice = intakeData.price || config.price;

    // Service descriptions for each package
    const serviceDescriptions = {
        'brand-kit': {
            title: 'Brand Kit Package',
            description: 'Complete brand identity foundation including logo design, brand voice guidelines, target market identifier, social media banners, and logo-in-action images.',
            deliverables: ['Logo (multiple formats)', 'Brand Voice Document', 'Target Market Profile', 'Social Media Banners', 'Logo In Action Images'],
            timeline: '7-10 business days'
        },
        'product-brand': {
            title: 'Product Brand Identity',
            description: 'Premium branding for physical products including packaging design, product photography direction, label design, and complete visual identity system.',
            deliverables: ['Full Brand Kit', 'Packaging Design', 'Product Label Design', 'Photography Guidelines', 'Marketing Collateral'],
            timeline: '14-21 business days'
        },
        'service-brand': {
            title: 'Service Brand Identity',
            description: 'Professional brand identity for service-based businesses including digital presence optimization, proposal templates, and client-facing materials.',
            deliverables: ['Full Brand Kit', 'Business Card Design', 'Proposal Templates', 'Email Signature', 'Social Media Kit'],
            timeline: '10-14 business days'
        },
        'landing-page': {
            title: 'Landing Page Website',
            description: 'High-converting single-page website optimized for lead generation with mobile responsiveness and basic SEO setup.',
            deliverables: ['Custom Landing Page', 'Mobile Optimization', 'Contact Form', 'Basic SEO', 'Analytics Setup'],
            timeline: '5-7 business days'
        },
        'business-website': {
            title: 'Business Website',
            description: 'Professional multi-page website with up to 5 pages, CMS integration, and full SEO optimization for established businesses.',
            deliverables: ['5-Page Website', 'CMS Dashboard', 'SEO Optimization', 'Contact Forms', 'Blog Setup'],
            timeline: '14-21 business days'
        },
        'ecommerce': {
            title: 'E-Commerce Website',
            description: 'Full-featured online store with product management, secure payments, inventory tracking, and marketing integrations.',
            deliverables: ['Online Store', 'Payment Gateway', 'Product Management', 'Order Tracking', 'Marketing Tools'],
            timeline: '21-30 business days'
        },
        'lead-funnel': {
            title: 'Lead Generation Funnel',
            description: 'Strategic sales funnel designed to capture and nurture leads with automated email sequences and tracking.',
            deliverables: ['Landing Page', 'Lead Magnet', 'Email Sequence (5)', 'Thank You Page', 'Analytics Dashboard'],
            timeline: '7-10 business days'
        },
        'sales-funnel': {
            title: 'Full Sales Funnel',
            description: 'Complete sales system with multiple touchpoints, upsells, downsells, and comprehensive automation for maximum conversions.',
            deliverables: ['Multi-Page Funnel', 'Upsell/Downsell Pages', 'Email Sequence (10+)', 'Payment Integration', 'A/B Testing'],
            timeline: '14-21 business days'
        },
        'custom-package': {
            title: 'Custom Package',
            description: 'Tailored solution built from our service catalog to match your exact business needs and budget.',
            deliverables: intakeData.customServices || ['Custom deliverables based on selection'],
            timeline: 'Varies by scope'
        },
        'consultation': {
            title: 'Free Strategy Call',
            description: 'No-obligation discovery call to discuss your business goals and find the perfect solution for your needs.',
            deliverables: ['30-Minute Call', 'Needs Assessment', 'Custom Recommendations', 'Project Roadmap'],
            timeline: 'Scheduled within 48 hours'
        }
    };

    const serviceInfo = serviceDescriptions[serviceId] || {
        title: config.name,
        description: 'Professional creative services from New Urban Influence.',
        deliverables: ['Custom deliverables'],
        timeline: 'To be determined'
    };

    let html = `<h2 class="wizard-title">Review Your Information</h2>`;
    html += `<p class="wizard-subtitle">Please review before submitting</p>`;

    // SERVICE DESCRIPTION BOX
    html += `<div style="background: linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(0,0,0,0.2) 100%); border: 1px solid rgba(255,59,48,0.15); border-radius: 20px; padding: 28px; margin-bottom: 24px;">`;
    html += `<div style="background: linear-gradient(135deg, var(--red) 0%, #ff6b6b 100%); border-radius: 14px; padding: 18px 24px; margin-bottom: 24px; box-shadow: 0 10px 35px rgba(255,59,48,0.35);">
<div style="display: flex; align-items: center; gap: 14px;">
<span style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">🎯</span>
<h3 style="font-size: 24px; font-weight: 900; color: #fff; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.25); letter-spacing: -0.5px;">${serviceInfo.title}</h3>
</div>
 </div>`;
    html += `<p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${serviceInfo.description}</p>`;

    // Deliverables list
    html += `<div class="mb-16">
<p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">What You'll Get:</p>
<div class="flex-wrap">
            ${serviceInfo.deliverables.map(d => `<span style="background: rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.1);">${d}</span>`).join('')}
</div>
 </div>`;

    html += `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 13px;">
<span>⏱️</span> Expected Timeline: <strong class="text-white">${serviceInfo.timeline}</strong>
 </div>`;
    html += `</div>`;

    // YOUR DETAILS BOX
    html += `<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">`;
    html += `<p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Your Details</p>`;

    html += `<div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
<span class="text-dim">Service</span>
<span class="text-bold-white">${config.name}</span>
 </div>`;

    // Show custom services if this is a custom package
    if (serviceId === 'custom-package' && intakeData.customServices && intakeData.customServices.length > 0) {
        html += `<div style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
<span style="color: rgba(255,255,255,0.5); display: block; margin-bottom: 10px;">Selected Services (${intakeData.customServices.length})</span>
<div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${intakeData.customServices.map(s => `<span style="background: rgba(255,255,255,0.1); color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">${s}</span>`).join('')}
</div>
</div>`;
    }

    html += `<div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
<span class="text-dim">Investment</span>
<span style="font-weight: 700; color: var(--red); font-size: 18px;">${displayPrice > 0 ? '$' + displayPrice.toLocaleString() : 'Custom Quote'}</span>
 </div>`;

    Object.keys(intakeData).forEach(key => {
        if (key !== 'serviceId' && key !== 'serviceName' && key !== 'price' && key !== 'customServices' && intakeData[key]) {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let value = intakeData[key];
            if (Array.isArray(value)) return; // Skip arrays (shown separately)
            html += `<div style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
<span class="text-dim">${label}</span>
<span style="font-weight: 500; color: #fff; max-width: 60%; text-align: right;">${value}</span>
</div>`;
        }
    });

    if (uploadedFiles.length > 0) {
        html += `<div style="padding: 14px 0;">
<span class="text-dim">Files Attached</span>
<div style="margin-top: 10px;">${uploadedFiles.map(f => `<span style="display: inline-block; background: rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 6px; margin: 4px; font-size: 13px;">📎 ${f.name}</span>`).join('')}</div>
</div>`;
    }

    html += `</div>`;

    // WHAT HAPPENS NEXT BOX - Different messaging based on service type
    if (serviceId === 'consultation') {
        html += `<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
<strong style="color: var(--green); display: flex; align-items: center; gap: 8px;"><span>✨</span> What happens next?</strong>
<p style="color: rgba(255,255,255,0.7); margin-top: 10px; font-size: 14px; line-height: 1.6;">After submitting, you'll receive an email with a link to schedule your free strategy call. We'll discuss your project and find the perfect solution for your business.</p>
</div>`;
    } else if (displayPrice > 0) {
        html += `<div style="background: rgba(255,59,48,0.1); border: 1px solid rgba(255,59,48,0.2); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
<strong style="color: var(--red); display: flex; align-items: center; gap: 8px;"><span>🚀</span> What happens next?</strong>
<p style="color: rgba(255,255,255,0.7); margin-top: 10px; font-size: 14px; line-height: 1.6;">After submitting, you'll be redirected to complete your payment. Once payment is received, our team will review your submission and reach out within 24-48 hours to kick off your project.</p>
</div>`;
    } else {
        html += `<div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
<strong style="color: #fbbf24; display: flex; align-items: center; gap: 8px;"><span>📋</span> What happens next?</strong>
<p style="color: rgba(255,255,255,0.7); margin-top: 10px; font-size: 14px; line-height: 1.6;">After submitting, our team will review your requirements and send you a custom quote within 24-48 hours. We'll then schedule a call to discuss your project in detail.</p>
</div>`;
    }

    return html;
}

async function submitIntake() {
    const config = serviceIntakeConfigs[intakeData.serviceId];
    const submission = {
        id: Date.now(),
        ...intakeData,
        files: uploadedFiles.map(f => f.name),
        submittedAt: new Date().toISOString(),
        status: 'pending_payment'
    };

    // Save locally first (always works)
    formSubmissions.push(submission);
    saveSubmissions();

    // Create lead from submission (local)
    const newLead = {
        id: Date.now() + 1,
        name: intakeData.contactName || intakeData.clientName || intakeData.businessName,
        email: intakeData.email || '',
        phone: intakeData.phone || intakeData.clientPhone || '',
        business: intakeData.businessName,
        service: config.name,
        budget: config.price > 0 ? '$' + config.price.toLocaleString() : 'Custom',
        message: intakeData.projectType || intakeData.brandStory || '',
        status: 'new',
        createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    saveLeads();

    // Trigger workflow: Add to pipeline and email subscribers
    triggerNewLead(newLead.id);

    // Save to Supabase (async — don't block the UI)
    try {
        const resp = await fetch('/.netlify/functions/save-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serviceId: intakeData.serviceId,
                serviceName: config.name,
                price: intakeData.price || config.price,
                contactName: intakeData.contactName || intakeData.clientName,
                email: intakeData.email,
                phone: intakeData.phone || intakeData.clientPhone,
                businessName: intakeData.businessName,
                industry: intakeData.industry,
                website: intakeData.website,
                ...intakeData
            })
        });
        const result = await resp.json();
        if (result.success) {
            console.log('✅ Submission saved to Supabase:', result.submission?.id);
            // Store the server submission ID so we can link it to a meeting later
            submission.serverId = result.submission?.id;
            intakeData.submissionId = result.submission?.id;
            if (result.emailSent) {
                console.log('📧 Confirmation email sent to client');
            }
        }
    } catch (err) {
        console.log('Server save failed (saved locally):', err.message);
    }

    // Show success and redirect to payment
    showPaymentPage(submission);
}

function showPaymentPage(submission) {
    const config = serviceIntakeConfigs[submission.serviceId];

    document.getElementById('intakeView').innerHTML = `
<div class="intake-view" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
<div class="wizard-content" style="max-width: 600px; text-align: center;">
<div class="success-icon" style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--green), #34d399); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 48px; color: white; box-shadow: 0 20px 60px rgba(16,185,129,0.4);">✓</div>
<h2 class="success-title">Submission Received!</h2>
<p class="success-message">Thank you for choosing New Urban Influence. A confirmation email has been sent with your project details.</p>

<div class="success-details">
<div class="success-detail">
<span class="success-detail-label">Service</span>
<span class="success-detail-value">${config.name}</span>
</div>
<div class="success-detail">
<span class="success-detail-label">Reference #</span>
<span class="success-detail-value">NUI-${submission.id}</span>
</div>
<div class="success-detail">
<span class="success-detail-label">Amount Due</span>
<span class="success-detail-value text-red">${config.price > 0 ? '$' + config.price.toLocaleString() : 'Quote Pending'}</span>
</div>
</div>

                ${config.price > 0 ? `
<div class="mb-32">
<p style="color: rgba(255,255,255,0.6); margin-bottom: 20px; font-size: 15px;">Complete your payment to start your project:</p>
<a href="https://buy.stripe.com/test" target="_blank" class="btn-cta" style="padding: 20px 48px; font-size: 18px; display: inline-flex; background: linear-gradient(135deg, var(--green) 0%, #34d399 100%); box-shadow: 0 8px 30px rgba(16,185,129,0.4);">
                        Pay $${config.price.toLocaleString()} with Stripe →
</a>
<p style="color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 16px;">🔒 Secure payment powered by Stripe</p>
</div>
                ` : `
<div class="mb-32">
<p style="color: rgba(255,255,255,0.6); margin-bottom: 16px; font-size: 15px;">Our team will prepare a custom quote and contact you within 24 hours.</p>
</div>
                `}

<div style="padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.1);">
<p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 20px; line-height: 1.8;">
<strong class="text-white">Next Steps:</strong><br>
                        1. Complete payment (if applicable)<br>
                        2. Receive project kickoff email<br>
                        3. Schedule strategy call with your creative team
</p>
<button onclick="showView('home')" class="btn-outline" style="color: #fff; border-color: rgba(255,255,255,0.3); padding: 16px 32px;">Back to Home</button>
</div>
</div>
</div>
    `;
}

