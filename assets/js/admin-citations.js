// ============================================================
// CITATION MANAGER — Directory Listing Tracker
// New Urban Influence Admin
//
// Track and manage business listings across 50+ directories
// - Monitor submission status per directory
// - NAP consistency checking
// - Quick-link to each directory for submission
// ============================================================

function loadAdminCitationsPanel() {
    const panel = document.getElementById('adminCitationsPanel');
    if (!panel) return;

    // Load saved citation data from localStorage
    let citationData = JSON.parse(localStorage.getItem('nui_citations') || 'null') || getDefaultCitations();

    const stats = {
        total: citationData.length,
        submitted: citationData.filter(c => c.status === 'live').length,
        pending: citationData.filter(c => c.status === 'pending').length,
        notStarted: citationData.filter(c => c.status === 'not-started').length
    };

    panel.innerHTML = `
    <div style="padding: 32px; max-width: 1200px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
            <div>
                <h2 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                    <span style="color: var(--red);">Citation</span> Manager
                </h2>
                <p style="color: rgba(255,255,255,0.5); margin: 6px 0 0; font-size: 14px;">
                    Track business directory listings for NAP consistency and local SEO.
                </p>
            </div>
        </div>
        <!-- Stats -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #fff;">${stats.total}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Total Directories</div>
            </div>
            <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #34d399;">${stats.submitted}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Live</div>
            </div>
            <div style="background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #fbbf24;">${stats.pending}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Pending</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: rgba(255,255,255,0.4);">${stats.notStarted}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Not Started</div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div style="margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 13px; color: rgba(255,255,255,0.6);">Citation Coverage</span>
                <span style="font-size: 13px; font-weight: 700; color: var(--red);">${Math.round((stats.submitted / stats.total) * 100)}%</span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${(stats.submitted / stats.total) * 100}%; background: linear-gradient(90deg, var(--red), #ff6b6b); border-radius: 4px; transition: width 0.5s;"></div>
            </div>
        </div>

        <!-- Citation List -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden;">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 120px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.35); font-weight: 600;">
                <span>Directory</span>
                <span>Category</span>
                <span>Status</span>
                <span style="text-align:center;">Action</span>
            </div>
            ${citationData.map((c, i) => `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 120px; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                <div>
                    <span style="font-weight: 600; color: #fff; font-size: 14px;">${c.name}</span>
                    ${c.url ? `<a href="${c.listingUrl || c.url}" target="_blank" style="display: block; font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; margin-top: 2px;">${c.url.replace('https://','').split('/')[0]}</a>` : ''}
                </div>
                <span style="font-size: 13px; color: rgba(255,255,255,0.5);">${c.category}</span>
                <div>
                    <select onchange="_citUpdateStatus(${i}, this.value)" style="padding: 6px 10px; background: ${c.status === 'live' ? 'rgba(16,185,129,0.15)' : c.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${c.status === 'live' ? 'rgba(16,185,129,0.3)' : c.status === 'pending' ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; color: ${c.status === 'live' ? '#34d399' : c.status === 'pending' ? '#fbbf24' : 'rgba(255,255,255,0.5)'}; font-size: 12px; font-weight: 600; cursor: pointer;">
                        <option value="not-started" ${c.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                        <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="live" ${c.status === 'live' ? 'selected' : ''}>Live</option>
                    </select>
                </div>
                <div style="text-align: center;">
                    <a href="${c.url}" target="_blank" style="padding: 6px 14px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 12px; text-decoration: none; font-weight: 500;">Submit →</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
    `;
}

function _citUpdateStatus(index, status) {
    let data = JSON.parse(localStorage.getItem('nui_citations') || 'null') || getDefaultCitations();
    data[index].status = status;
    localStorage.setItem('nui_citations', JSON.stringify(data));
    loadAdminCitationsPanel();
}

function getDefaultCitations() {
    return [
        // Tier 1: Major Directories
        { name: 'Google Business Profile', url: 'https://business.google.com', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Apple Maps', url: 'https://mapsconnect.apple.com', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Bing Places', url: 'https://www.bingplaces.com', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Yelp', url: 'https://biz.yelp.com', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Facebook Business', url: 'https://www.facebook.com/pages/create', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Better Business Bureau', url: 'https://www.bbb.org/get-listed', category: 'Major', status: 'not-started', listingUrl: '' },
        // Tier 2: Business Directories
        { name: 'Thumbtack', url: 'https://www.thumbtack.com/pro', category: 'Services', status: 'not-started', listingUrl: '' },
        { name: 'Bark', url: 'https://www.bark.com/en/us/company/register/', category: 'Services', status: 'not-started', listingUrl: '' },
        { name: 'Clutch', url: 'https://clutch.co/getting-listed', category: 'Agency', status: 'not-started', listingUrl: '' },
        { name: 'DesignRush', url: 'https://www.designrush.com/agency/listing', category: 'Agency', status: 'not-started', listingUrl: '' },
        { name: 'UpCity', url: 'https://upcity.com/signup', category: 'Agency', status: 'not-started', listingUrl: '' },
        { name: 'Expertise.com', url: 'https://www.expertise.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Alignable', url: 'https://www.alignable.com/join', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Manta', url: 'https://www.manta.com/claim', category: 'Business', status: 'not-started', listingUrl: '' },
        { name: 'Foursquare', url: 'https://business.foursquare.com', category: 'Major', status: 'not-started', listingUrl: '' },
        { name: 'Nextdoor', url: 'https://business.nextdoor.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'LinkedIn Company', url: 'https://www.linkedin.com/company/setup/new/', category: 'Major', status: 'not-started', listingUrl: '' },

        // Tier 3: Data Aggregators
        { name: 'Data Axle (InfoGroup)', url: 'https://www.dataaxle.com', category: 'Aggregator', status: 'not-started', listingUrl: '' },
        { name: 'Neustar Localeze', url: 'https://www.neustarlocaleze.biz', category: 'Aggregator', status: 'not-started', listingUrl: '' },
        { name: 'Factual (Foursquare)', url: 'https://business.foursquare.com', category: 'Aggregator', status: 'not-started', listingUrl: '' },

        // Tier 4: Industry-Specific
        { name: 'Behance', url: 'https://www.behance.net', category: 'Design', status: 'not-started', listingUrl: '' },
        { name: 'Dribbble', url: 'https://dribbble.com/signup/new', category: 'Design', status: 'not-started', listingUrl: '' },
        { name: 'Awwwards', url: 'https://www.awwwards.com/submit', category: 'Design', status: 'not-started', listingUrl: '' },
        { name: '99designs', url: 'https://99designs.com', category: 'Design', status: 'not-started', listingUrl: '' },
        { name: 'The Manifest', url: 'https://themanifest.com/listing', category: 'Agency', status: 'not-started', listingUrl: '' },
        { name: 'GoodFirms', url: 'https://www.goodfirms.co/get-listed', category: 'Agency', status: 'not-started', listingUrl: '' },
        { name: 'Sortlist', url: 'https://www.sortlist.com', category: 'Agency', status: 'not-started', listingUrl: '' },

        // Tier 5: Review & Local Sites
        { name: 'Trustpilot', url: 'https://business.trustpilot.com', category: 'Reviews', status: 'not-started', listingUrl: '' },
        { name: 'Glassdoor', url: 'https://www.glassdoor.com/employer/', category: 'Reviews', status: 'not-started', listingUrl: '' },
        { name: 'Angi (Angie\'s List)', url: 'https://www.angi.com/pro', category: 'Services', status: 'not-started', listingUrl: '' },
        { name: 'HomeAdvisor', url: 'https://pro.homeadvisor.com', category: 'Services', status: 'not-started', listingUrl: '' },
        { name: 'Hotfrog', url: 'https://www.hotfrog.com', category: 'Business', status: 'not-started', listingUrl: '' },
        { name: 'Cylex', url: 'https://www.cylex.us.com', category: 'Business', status: 'not-started', listingUrl: '' },
        { name: 'Yellow Pages', url: 'https://www.yellowpages.com/claim-your-listing', category: 'Business', status: 'not-started', listingUrl: '' },
        { name: 'Superpages', url: 'https://www.superpages.com', category: 'Business', status: 'not-started', listingUrl: '' },
        { name: 'MapQuest', url: 'https://www.mapquest.com', category: 'Maps', status: 'not-started', listingUrl: '' },
        { name: 'Waze', url: 'https://www.waze.com/business', category: 'Maps', status: 'not-started', listingUrl: '' },

        // Tier 6: Detroit / Michigan Local
        { name: 'Detroit Chamber of Commerce', url: 'https://www.detroitchamber.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Michigan Small Business', url: 'https://www.michiganbusiness.org', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Pure Michigan Business', url: 'https://www.michigan.org/business', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Detroit Free Press Directory', url: 'https://www.freep.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Crain\'s Detroit Business', url: 'https://www.crainsdetroit.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Metro Detroit Cheers', url: 'https://www.metrodetroitcheers.com', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'D:hive Detroit', url: 'https://www.dhivedetroit.org', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'TechTown Detroit', url: 'https://techtowndetroit.org', category: 'Local', status: 'not-started', listingUrl: '' },
        { name: 'Build Institute', url: 'https://www.buildinstitute.org', category: 'Local', status: 'not-started', listingUrl: '' },

        // Tier 7: Social / Content
        { name: 'Pinterest Business', url: 'https://business.pinterest.com', category: 'Social', status: 'not-started', listingUrl: '' },
        { name: 'TikTok Business', url: 'https://www.tiktok.com/business/', category: 'Social', status: 'not-started', listingUrl: '' },
        { name: 'YouTube Channel', url: 'https://www.youtube.com', category: 'Social', status: 'not-started', listingUrl: '' },
        { name: 'Medium', url: 'https://medium.com', category: 'Content', status: 'not-started', listingUrl: '' },
        { name: 'Quora', url: 'https://www.quora.com/business', category: 'Content', status: 'not-started', listingUrl: '' },
        { name: 'Reddit (r/Detroit)', url: 'https://www.reddit.com/r/Detroit', category: 'Community', status: 'not-started', listingUrl: '' },
    ];
}
