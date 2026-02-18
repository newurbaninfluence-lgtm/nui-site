// ==================== ADMIN STATS ====================
// Analytics, Reviews, SEO, GMB, Email Marketing, Loyalty, Communications, Social DM, SMS

// ==================== SITE ANALYTICS PANEL ====================
function loadAdminAnalyticsPanel() {
    const visitors = siteAnalytics.visitors || { total: 2847, today: 156, week: 892 };
    const pageViews = siteAnalytics.pageViews || { total: 12453, today: 543, week: 3241 };
    const topPages = siteAnalytics.topPages || [];
    const trafficSources = siteAnalytics.trafficSources || [];

    document.getElementById('adminAnalyticsPanel').innerHTML = `
<div class="flex-between mb-32">
<h2 class="fs-28 fw-700">📈 Site Analytics</h2>
<div class="flex-gap-12">
<select id="analyticsDateRange" onchange="updateAnalyticsRange(this.value)" style="padding: 10px 16px; border: 1px solid #e5e5e5; border-radius: 8px; font-size: 14px;">
<option value="7d">Last 7 Days</option>
<option value="30d">Last 30 Days</option>
<option value="90d">Last 90 Days</option>
<option value="all">All Time</option>
</select>
<button onclick="refreshAnalytics()" class="btn-outline">🔄 Refresh</button>
</div>
</div>

        <!-- Key Metrics -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
<div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); padding: 24px; border-radius: 16px; color: #fff;">
<div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">Total Visitors</div>
<div style="font-size: 36px; font-weight: 700;">${visitors.total.toLocaleString()}</div>
<div style="font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
<span style="color: #86efac;">↑ 12%</span> vs last period
</div>
</div>
<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff0000 100%); padding: 24px; border-radius: 16px; color: #fff;">
<div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">Page Views</div>
<div style="font-size: 36px; font-weight: 700;">${pageViews.total.toLocaleString()}</div>
<div style="font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
<span style="color: #86efac;">↑ 8%</span> vs last period
</div>
</div>
<div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding: 24px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">Avg. Session</div>
<div style="font-size: 36px; font-weight: 700;">3:42</div>
<div style="font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
<span style="color: #86efac;">↑ 5%</span> vs last period
</div>
</div>
<div style="background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%); padding: 24px; border-radius: 16px; color: #fff; border: 1px solid rgba(255,255,255,0.1);">
<div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">Bounce Rate</div>
<div style="font-size: 36px; font-weight: 700;">38%</div>
<div style="font-size: 13px; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
<span style="color: #86efac;">↓ 3%</span> vs last period
</div>
</div>
</div>

        <!-- Charts Row -->
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
            <!-- Traffic Chart -->
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #fff;">Traffic Overview</h3>
<div style="height: 200px; display: flex; align-items: flex-end; gap: 8px; padding: 20px 0;">
                    ${generateTrafficBars()}
</div>
<div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.5);">
<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
</div>
</div>

            <!-- Traffic Sources -->
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #fff;">Traffic Sources</h3>
<div style="display: flex; flex-direction: column; gap: 16px;">
                    ${trafficSources.map(s => `
<div>
<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
<span style="font-size: 14px; color: rgba(255,255,255,0.8);">${s.source}</span>
<span class="text-bold-white">${s.percent}%</span>
</div>
<div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
<div style="width: ${s.percent}%; height: 100%; background: ${s.color}; border-radius: 4px;"></div>
</div>
</div>
                    `).join('')}
</div>
</div>
</div>

        <!-- Top Pages Table -->
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px;">
<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #fff;">Top Pages</h3>
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
<th style="text-align: left; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Page</th>
<th style="text-align: right; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Views</th>
<th style="text-align: right; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Bounce Rate</th>
<th style="text-align: right; padding: 12px 0; font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase;">Trend</th>
</tr>
</thead>
<tbody>
                    ${topPages.map((p, i) => `
<tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
<td style="padding: 16px 0;">
<div class="flex-center-gap-12">
<span style="width: 24px; height: 24px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${i + 1}</span>
<span style="font-weight: 500; color: #fff;">/${p.page.toLowerCase()}</span>
</div>
</td>
<td style="text-align: right; padding: 16px 0; font-weight: 600; color: #fff;">${p.views.toLocaleString()}</td>
<td style="text-align: right; padding: 16px 0;">
<span style="background: ${p.bounce < 35 ? 'rgba(16,185,129,0.2)' : p.bounce < 45 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${p.bounce < 35 ? '#10b981' : p.bounce < 45 ? '#f59e0b' : '#ef4444'}; padding: 4px 10px; border-radius: 12px; font-size: 13px;">${p.bounce}%</span>
</td>
<td style="text-align: right; padding: 16px 0; color: #10b981;">↑ ${Math.floor(Math.random() * 15) + 1}%</td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>

        <!-- Real-time Stats -->
<div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 24px; border-radius: 16px; color: #fff;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: 600;">Real-Time Visitors</h3>
<span style="display: flex; align-items: center; gap: 6px;">
<span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></span>
<span style="color: #10b981; font-weight: 600;">${Math.floor(Math.random() * 20) + 5} active now</span>
</span>
</div>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
<div>
<div class="fs-24 fw-700">${visitors.today}</div>
<div class="text-muted-sm">Today</div>
</div>
<div>
<div class="fs-24 fw-700">${visitors.week}</div>
<div class="text-muted-sm">This Week</div>
</div>
<div>
<div class="fs-24 fw-700">${pageViews.today}</div>
<div class="text-muted-sm">Page Views Today</div>
</div>
<div>
<div class="fs-24 fw-700">2.4</div>
<div class="text-muted-sm">Pages/Session</div>
</div>
</div>
</div>
    `;
}

function generateTrafficBars() {
    const heights = [65, 82, 45, 91, 73, 58, 87];
    return heights.map(h => `
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
<div style="width: 100%; height: ${h}%; background: linear-gradient(180deg, var(--red, #ff0000) 0%, #cc0000 100%); border-radius: 4px; min-height: 20px;"></div>
</div>
    `).join('');
}

function refreshAnalytics() {
    const btn = event.target;
    btn.innerHTML = '🔄 Loading...';
    setTimeout(() => {
        siteAnalytics.visitors.today += Math.floor(Math.random() * 10);
        siteAnalytics.pageViews.today += Math.floor(Math.random() * 20);
        saveAnalytics();
        loadAdminAnalyticsPanel();
    }, 1000);
}

function updateAnalyticsRange(range) {
    console.log('Updating analytics for range:', range);
    loadAdminAnalyticsPanel();
}

// ==================== GOOGLE REVIEWS PANEL ====================
let googleReviews = JSON.parse(localStorage.getItem('nui_reviews')) || [
    { id: 1, author: 'Marcus Johnson', rating: 5, text: 'NUI completely transformed our brand. The team understood our vision from day one and delivered beyond expectations. Highly recommend!', date: '2025-01-15', replied: true, reply: 'Thank you Marcus! It was a pleasure working with you.', source: 'demo' },
    { id: 2, author: 'Sarah Williams', rating: 5, text: 'Professional, creative, and incredibly responsive. Our new website has already increased our leads by 40%.', date: '2025-01-10', replied: true, reply: 'We appreciate the kind words Sarah! Excited to see your business grow.', source: 'demo' },
    { id: 3, author: 'David Chen', rating: 4, text: 'Great design work and reasonable pricing. Would have liked faster turnaround but overall satisfied with the results.', date: '2025-01-05', replied: false, reply: '', source: 'demo' },
    { id: 4, author: 'Ashley Brown', rating: 5, text: 'The branding package was exactly what we needed. Logo, colors, everything came together perfectly. Detroit proud!', date: '2024-12-28', replied: true, reply: 'Detroit represent! Thanks for trusting us with your brand.', source: 'demo' },
    { id: 5, author: 'Michael Torres', rating: 5, text: 'Second time working with NUI and they continue to exceed expectations. True partners in our business growth.', date: '2024-12-20', replied: false, reply: '', source: 'demo' }
];
function saveReviews() { localStorage.setItem('nui_reviews', JSON.stringify(googleReviews)); }

// Google Reviews Sync State
let googleReviewsSyncData = JSON.parse(localStorage.getItem('nui_reviews_sync')) || null;

async function syncGoogleReviews() {
    const placeId = seoData.googleMyBusiness?.placeId;
    const resultEl = document.getElementById('gmbSyncResult');

    if (!placeId) {
        if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.innerHTML = '<div style="padding: 12px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #f87171; font-size: 13px;">⚠️ Enter your Google Place ID above first. <a href="https://developers.google.com/maps/documentation/places/web-service/place-id-lookup" target="_blank" style="color: #60a5fa; text-decoration: underline;">Find your Place ID →</a></div>';
        }
        return;
    }

    if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = '<div style="padding: 12px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; color: #60a5fa; font-size: 13px;">🔄 Syncing reviews from Google...</div>';
    }

    try {
        const response = await fetch('/.netlify/functions/google-reviews?placeId=' + encodeURIComponent(placeId));
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Sync failed');
        }

        // Store sync data
        googleReviewsSyncData = data;
        localStorage.setItem('nui_reviews_sync', JSON.stringify(data));

        // Replace demo reviews with real Google reviews
        if (data.reviews && data.reviews.length > 0) {
            googleReviews = data.reviews;
            saveReviews();
        }

        // Update sync status
        seoData.googleMyBusiness.connected = true;
        seoData.googleMyBusiness.lastSync = data.syncedAt;
        seoData.googleMyBusiness.totalReviews = data.totalReviews;
        seoData.googleMyBusiness.avgRating = data.avgRating;
        saveSeo();

        if (resultEl) {
            resultEl.innerHTML = `<div style="padding: 12px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; color: #34d399; font-size: 13px;">
                ✅ Synced! Found <strong>${data.totalReviews} total reviews</strong> · Average rating: <strong>${data.avgRating}⭐</strong> · ${data.reviews.length} reviews loaded
<div style="margin-top: 4px; font-size: 11px; opacity: 0.7;">Last sync: ${new Date(data.syncedAt).toLocaleString()}</div>
</div>`;
        }

        // Refresh the reviews panel if it's visible
        const reviewsPanel = document.getElementById('adminReviewsPanel');
        if (reviewsPanel && reviewsPanel.innerHTML) {
            loadAdminReviewsPanel();
        }

        // Update the status badge
        const statusEl = document.getElementById('gmbSyncStatus');
        if (statusEl) {
            statusEl.style.background = 'rgba(16,185,129,0.15)';
            statusEl.style.color = '#34d399';
            statusEl.textContent = '● Connected · ' + data.totalReviews + ' reviews';
        }

    } catch (error) {
        console.error('Google Reviews sync error:', error);
        if (resultEl) {
            resultEl.innerHTML = `<div style="padding: 12px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #f87171; font-size: 13px;">
                ❌ Sync failed: ${error.message}
<div style="margin-top: 8px; font-size: 11px; opacity: 0.7;">Make sure <strong>GOOGLE_PLACES_API_KEY</strong> is set in Netlify → Site Settings → Environment Variables</div>
</div>`;
        }
    }
}

function loadAdminReviewsPanel() {
    const avgRating = (googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length).toFixed(1);
    const fiveStarCount = googleReviews.filter(r => r.rating === 5).length;
    const unrepliedCount = googleReviews.filter(r => !r.replied).length;
    const isLiveData = googleReviews.some(r => r.source === 'google');
    const lastSync = seoData.googleMyBusiness?.lastSync;
    const totalGoogleReviews = seoData.googleMyBusiness?.totalReviews || googleReviews.length;
    const reviewLink = seoData.googleMyBusiness?.reviewLink || 'https://g.page/r/YOUR_PLACE_ID/review';

    document.getElementById('adminReviewsPanel').innerHTML = `
<div class="admin-row-between">
<div>
<h2 style="font-size: 28px; font-weight: 700; color: #fff;">⭐ Google Reviews</h2>
<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
<span style="font-size: 11px; padding: 4px 10px; border-radius: 100px; background: ${isLiveData ? 'rgba(16,185,129,0.15); color: #34d399;' : 'rgba(245,158,11,0.15); color: #fbbf24;'}">${isLiveData ? '● Live from Google' : '● Demo Data'}</span>
                    ${lastSync ? '<span style="font-size: 11px; color: rgba(255,255,255,0.3);">Last sync: ' + new Date(lastSync).toLocaleString() + '</span>' : ''}
                    ${totalGoogleReviews > googleReviews.length ? '<span style="font-size: 11px; color: rgba(255,255,255,0.4);">Showing ' + googleReviews.length + ' of ' + totalGoogleReviews + ' total</span>' : ''}
</div>
</div>
<div class="flex-gap-12">
<button onclick="syncGoogleReviews(); setTimeout(loadAdminReviewsPanel, 3000);" class="btn-outline" style="border-color: rgba(255,255,255,0.2); color: #fff;">🔄 Sync Reviews</button>
<button onclick="requestReview()" class="btn-outline" style="border-color: rgba(255,255,255,0.2); color: #fff;">📧 Request Review</button>
<a href="${reviewLink}" target="_blank" class="btn-cta">View on Google →</a>
</div>
</div>
        ${!isLiveData ? '<div style="padding: 16px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;"><span class="fs-24">💡</span><div><p style="font-size: 13px; color: #fbbf24; font-weight: 600;">These are demo reviews.</p><p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">Go to 📍 Google Business → Google Integration → enter your Place ID and click Sync to pull real reviews.</p></div></div>' : ''}

        <!-- Stats Overview -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
<div style="background: linear-gradient(135deg, #e63946 0%, #ff6b6b 100%); padding: 24px; border-radius: 16px; color: #fff; text-align: center;">
<div style="font-size: 48px; font-weight: 700;">⭐ ${avgRating}</div>
<div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Average Rating</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
<div style="font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #888 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${googleReviews.length}</div>
<div style="font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 8px;">Total Reviews</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
<div style="font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${fiveStarCount}</div>
<div style="font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 8px;">5-Star Reviews</div>
</div>
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
<div style="font-size: 48px; font-weight: 700; background: linear-gradient(135deg, ${unrepliedCount > 0 ? '#f59e0b, #fbbf24' : '#10b981, #34d399'}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${unrepliedCount}</div>
<div style="font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 8px;">Needs Reply</div>
</div>
</div>

        <!-- Rating Distribution -->
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px;">
<h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #fff;">Rating Distribution</h3>
<div class="flex-col-gap-12">
                ${[5,4,3,2,1].map(rating => {
                    const count = googleReviews.filter(r => r.rating === rating).length;
                    const percent = Math.round((count / googleReviews.length) * 100);
                    return `
<div class="flex-center-gap-12">
<span style="width: 60px; font-size: 14px; color: rgba(255,255,255,0.7);">${rating} star${rating > 1 ? 's' : ''}</span>
<div style="flex: 1; height: 12px; background: rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden;">
<div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, ${rating >= 4 ? '#10b981, #34d399' : rating === 3 ? '#f59e0b, #fbbf24' : '#ef4444, #f87171'}); border-radius: 6px;"></div>
</div>
<span style="width: 40px; text-align: right; font-weight: 600; color: #fff;">${count}</span>
</div>
                    `;
                }).join('')}
</div>
</div>

        <!-- Reviews List -->
<div style="background: #111; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: 600; color: #fff;">All Reviews</h3>
<select style="padding: 8px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; background: #1a1a1a; color: #fff;">
<option>Most Recent</option>
<option>Highest Rated</option>
<option>Lowest Rated</option>
<option>Needs Reply</option>
</select>
</div>
<div style="display: flex; flex-direction: column; gap: 16px;">
                ${googleReviews.map(r => renderReviewCard(r)).join('')}
</div>
</div>
    `;
}

function renderReviewCard(review) {
    return `
<div style="padding: 20px; background: #1a1a1a; border-radius: 12px; border-left: 4px solid ${review.rating >= 4 ? '#10b981' : review.rating === 3 ? '#f59e0b' : '#ef4444'};">
<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
<div class="flex-center-gap-12">
<div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: #fff;">${review.author.charAt(0)}</div>
<div>
<div class="text-bold-white">${review.author}</div>
<div style="font-size: 13px; color: rgba(255,255,255,0.4);">${new Date(review.date).toLocaleDateString()}</div>
</div>
</div>
<div style="display: flex; gap: 2px; color: #f59e0b;">
                    ${'★'.repeat(review.rating)}${'<span style="color: rgba(255,255,255,0.2);">☆</span>'.repeat(5 - review.rating)}
</div>
</div>
<p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px; color: rgba(255,255,255,0.7);">"${review.text}"</p>
            ${review.replied ? `
<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">
<div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Your Reply:</div>
<p style="font-size: 13px; color: #34d399;">${review.reply}</p>
</div>
            ` : `
<button onclick="openReplyModal(${review.id})" style="padding: 8px 16px; background: #e63946; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Reply to Review</button>
            `}
</div>
    `;
}

function openReplyModal(reviewId) {
    const review = googleReviews.find(r => r.id === reviewId);
    if (!review) return;
    const reply = prompt('Reply to ' + review.author + "'s review:", '');
    if (reply) {
        review.replied = true;
        review.reply = reply;
        saveReviews();
        loadAdminReviewsPanel();
    }
}

function requestReview() {
    alert('📧 Review request feature coming soon! This will send automated emails to recent clients asking for Google reviews.');
}


// ==================== SEO PANEL ====================
function loadAdminSeoPanel() {
    document.getElementById('adminSeoPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">🔍 SEO / AEO / GEO Management</h2>
<p class="panel-subtitle">Optimize for search engines, AI answer engines, and local search</p>
</div>
<div class="seo-grid">
<div class="seo-card">
<div class="seo-card-title">📊 SEO Score</div>
<div class="seo-score">
<div class="seo-score-circle good">85</div>
<div><p class="fw-600">Good</p><p style="font-size: 13px; color: rgba(255,255,255,0.5);">Your site is well optimized</p></div>
</div>
</div>
<div class="seo-card">
<div class="seo-card-title">🤖 AEO Readiness</div>
<div class="seo-score">
<div class="seo-score-circle medium">72</div>
<div><p class="fw-600">Moderate</p><p style="font-size: 13px; color: rgba(255,255,255,0.5);">Add more FAQ content</p></div>
</div>
</div>
</div>
<div class="form-section">
<div class="form-section-title">🏷️ Meta Tags</div>
<div class="form-group"><label class="form-label">Page Title</label><input type="text" class="form-input" value="${seoData.siteMeta.title}" onchange="seoData.siteMeta.title = this.value; saveSeo();"></div>
<div class="form-group"><label class="form-label">Meta Description</label><textarea class="form-textarea" onchange="seoData.siteMeta.description = this.value; saveSeo();">${seoData.siteMeta.description}</textarea></div>
<div class="form-group">
<label class="form-label">Keywords</label>
<input type="text" class="form-input" value="${seoData.siteMeta.keywords}" onchange="seoData.siteMeta.keywords = this.value; saveSeo();" placeholder="Separate with commas">
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">OG Image URL</label><input type="text" class="form-input" value="${seoData.siteMeta.ogImage || ''}" onchange="seoData.siteMeta.ogImage = this.value; saveSeo();" placeholder="https://..."></div>
<div class="form-group"><label class="form-label">Twitter Handle</label><input type="text" class="form-input" value="${seoData.siteMeta.twitterHandle || ''}" onchange="seoData.siteMeta.twitterHandle = this.value; saveSeo();" placeholder="@yourhandle"></div>
</div>
<button class="btn-admin primary" onclick="applyMetaTags()">Apply Meta Tags to Site</button>
</div>
<div class="form-section">
<div class="form-section-title">❓ AEO - FAQ Schema (For AI Answer Engines)</div>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 16px;">FAQs help AI assistants find and cite your content</p>
            ${seoData.aeoContent.faqs.map((faq, i) => `
<div class="faq-item">
<div class="faq-question">${faq.question}</div>
<div class="faq-answer">${faq.answer}</div>
<button class="btn-admin danger" style="margin-top: 8px; padding: 6px 12px; font-size: 11px;" onclick="removeFaq(${i})">Remove</button>
</div>
            `).join('')}
<button class="btn-admin secondary" onclick="showAddFaqModal()">+ Add FAQ</button>
</div>
    `;
}

function applyMetaTags() {
    document.title = seoData.siteMeta.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = seoData.siteMeta.description;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) { metaKeywords = document.createElement('meta'); metaKeywords.name = 'keywords'; document.head.appendChild(metaKeywords); }
    metaKeywords.content = seoData.siteMeta.keywords;
    alert('Meta tags applied successfully!');
}

function showAddFaqModal() {
    const q = prompt('Enter the question:');
    if (!q) return;
    const a = prompt('Enter the answer:');
    if (!a) return;
    seoData.aeoContent.faqs.push({ question: q, answer: a });
    saveSeo();
    loadAdminSeoPanel();
}

function removeFaq(idx) {
    seoData.aeoContent.faqs.splice(idx, 1);
    saveSeo();
    loadAdminSeoPanel();
}

// ==================== GOOGLE MY BUSINESS PANEL ====================
function loadAdminGmbPanel() {
    document.getElementById('adminGmbPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📍 Google My Business</h2>
<p class="panel-subtitle">Manage your local SEO and Google Business Profile</p>
</div>
<div class="seo-grid">
<div class="form-section" style="margin-bottom: 0;">
<div class="form-section-title">📍 Business Information</div>
<div class="form-group"><label class="form-label">Business Name</label><input type="text" class="form-input" value="${seoData.localSeo.businessName}" onchange="seoData.localSeo.businessName = this.value; saveSeo();"></div>
<div class="form-group"><label class="form-label">Address</label><input type="text" class="form-input" value="${seoData.localSeo.address}" onchange="seoData.localSeo.address = this.value; saveSeo();"></div>
<div class="form-row">
<div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" value="${seoData.localSeo.phone}" onchange="seoData.localSeo.phone = this.value; saveSeo();"></div>
<div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="${seoData.localSeo.email}" onchange="seoData.localSeo.email = this.value; saveSeo();"></div>
</div>
<div class="form-group"><label class="form-label">Business Hours</label><input type="text" class="form-input" value="${seoData.localSeo.hours}" onchange="seoData.localSeo.hours = this.value; saveSeo();"></div>
</div>
<div class="form-section" style="margin-bottom: 0;">
<div class="form-section-title">🔗 Google Integration</div>
<div class="form-group"><label class="form-label">Google Place ID</label><input type="text" class="form-input" value="${seoData.googleMyBusiness.placeId || ''}" onchange="seoData.googleMyBusiness.placeId = this.value; saveSeo();" placeholder="ChIJ..."></div>
<div class="form-group"><label class="form-label">Review Link</label><input type="text" class="form-input" value="${seoData.googleMyBusiness.reviewLink || ''}" onchange="seoData.googleMyBusiness.reviewLink = this.value; saveSeo();" placeholder="https://g.page/..."></div>
<div class="form-group"><label class="form-label">Map Embed URL</label><input type="text" class="form-input" value="${seoData.googleMyBusiness.mapEmbed || ''}" onchange="seoData.googleMyBusiness.mapEmbed = this.value; saveSeo();" placeholder="https://www.google.com/maps/embed..."></div>
<div style="padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-top: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
<h4 style="font-size: 14px; font-weight: 600; color: #fff;">⚡ Live Reviews Sync</h4>
<span id="gmbSyncStatus" style="font-size: 12px; padding: 4px 12px; border-radius: 100px; background: ${seoData.googleMyBusiness.placeId ? 'rgba(16,185,129,0.15); color: #34d399;' : 'rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);'}">${seoData.googleMyBusiness.placeId ? '● Place ID Set' : '○ Not Configured'}</span>
</div>
<p style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px;">Enter your Place ID above, then add <strong class="text-white">GOOGLE_PLACES_API_KEY</strong> to your Netlify environment variables. Click Sync to pull real Google reviews.</p>
<div class="flex-gap-12">
<button onclick="syncGoogleReviews()" class="btn-admin primary flex-1">🔄 Sync Reviews Now</button>
<button onclick="window.open('https://developers.google.com/maps/documentation/places/web-service/place-id-lookup', '_blank')" class="btn-admin" style="flex: 1; background: rgba(255,255,255,0.1); color: #fff;">🔍 Find Place ID</button>
</div>
<div id="gmbSyncResult" style="margin-top: 12px; display: none;"></div>
</div>
</div>
</div>
<div class="form-section">
<div class="form-section-title">🗺️ Service Areas</div>
<div class="tags-input">
                ${seoData.localSeo.serviceAreas.map((area, i) => `<span class="tag">${area}<span class="tag-remove" onclick="removeServiceArea(${i})">×</span></span>`).join('')}
<input type="text" placeholder="Add area..." onkeypress="if(event.key === 'Enter') { addServiceArea(this.value); this.value = ''; }">
</div>
</div>
<div class="form-section">
<div class="form-section-title">🏢 Business Categories</div>
<div class="tags-input">
                ${seoData.localSeo.categories.map((cat, i) => `<span class="tag">${cat}<span class="tag-remove" onclick="removeCategory(${i})">×</span></span>`).join('')}
<input type="text" placeholder="Add category..." onkeypress="if(event.key === 'Enter') { addCategory(this.value); this.value = ''; }">
</div>
</div>
<div class="form-section">
<div class="form-section-title">⭐ Schema.org Data</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Price Range</label><select class="form-select" onchange="seoData.schema.priceRange = this.value; saveSeo();">
<option value="$" ${seoData.schema.priceRange === '$' ? 'selected' : ''}>$ - Budget</option>
<option value="$$" ${seoData.schema.priceRange === '$$' ? 'selected' : ''}>$$ - Moderate</option>
<option value="$$$" ${seoData.schema.priceRange === '$$$' ? 'selected' : ''}>$$$ - Expensive</option>
<option value="$$$$" ${seoData.schema.priceRange === '$$$$' ? 'selected' : ''}>$$$$ - Luxury</option>
</select></div>
<div class="form-group"><label class="form-label">Rating</label><input type="text" class="form-input" value="${seoData.schema.rating}" onchange="seoData.schema.rating = this.value; saveSeo();"></div>
</div>
</div>
    `;
}

function addServiceArea(area) {
    if (area && !seoData.localSeo.serviceAreas.includes(area)) {
        seoData.localSeo.serviceAreas.push(area);
        saveSeo();
        loadAdminGmbPanel();
    }
}

function removeServiceArea(idx) {
    seoData.localSeo.serviceAreas.splice(idx, 1);
    saveSeo();
    loadAdminGmbPanel();
}

function addCategory(cat) {
    if (cat && !seoData.localSeo.categories.includes(cat)) {
        seoData.localSeo.categories.push(cat);
        saveSeo();
        loadAdminGmbPanel();
    }
}

function removeCategory(idx) {
    seoData.localSeo.categories.splice(idx, 1);
    saveSeo();
    loadAdminGmbPanel();
}

// ==================== EMAIL MARKETING PANEL ====================
function loadAdminEmailMarketingPanel() {
    const em = emailMarketing;
    document.getElementById('adminEmailmarketingPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📧 Email Marketing</h2>
<p class="panel-subtitle">Send newsletters and promotions to your subscribers</p>
</div>

        <!-- Stats -->
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Subscribers</div><div class="stat-value">${em.subscribers.length}</div></div>
<div class="stat-card"><div class="stat-label">Campaigns Sent</div><div class="stat-value">${em.campaigns.length}</div></div>
<div class="stat-card"><div class="stat-label">Open Rate</div><div class="stat-value">${em.analytics.sent > 0 ? Math.round((em.analytics.opened / em.analytics.sent) * 100) : 0}%</div></div>
<div class="stat-card"><div class="stat-label">Click Rate</div><div class="stat-value">${em.analytics.sent > 0 ? Math.round((em.analytics.clicked / em.analytics.sent) * 100) : 0}%</div></div>
</div>

        <!-- Automated Newsletter Toggle -->
<div class="form-section" style="background: ${em.settings.automatedSending ? 'rgba(46,204,113,0.1)' : 'rgba(255,59,48,0.1)'}; border: 1px solid ${em.settings.automatedSending ? '#2ecc71' : '#ff3b30'};">
<div class="flex-between">
<div>
<div class="form-section-title m-0">🤖 Automated Weekly Newsletter</div>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 8px 0 0;">Send newsletters automatically every ${em.settings.sendDay} at ${em.settings.sendTime}</p>
</div>
<label class="switch">
<input type="checkbox" ${em.settings.automatedSending ? 'checked' : ''} onchange="toggleAutomatedEmail(this.checked)">
<span class="slider round"></span>
</label>
</div>
</div>

        <!-- Schedule Settings -->
<div class="form-section">
<div class="form-section-title">⏰ Schedule Settings</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Send Day</label>
<select class="form-select" onchange="updateEmailSchedule('sendDay', this.value)">
<option value="monday" ${em.settings.sendDay === 'monday' ? 'selected' : ''}>Monday</option>
<option value="tuesday" ${em.settings.sendDay === 'tuesday' ? 'selected' : ''}>Tuesday</option>
<option value="wednesday" ${em.settings.sendDay === 'wednesday' ? 'selected' : ''}>Wednesday</option>
<option value="thursday" ${em.settings.sendDay === 'thursday' ? 'selected' : ''}>Thursday</option>
<option value="friday" ${em.settings.sendDay === 'friday' ? 'selected' : ''}>Friday</option>
</select>
</div>
<div class="form-group">
<label class="form-label">Send Time</label>
<input type="time" class="form-input" value="${em.settings.sendTime}" onchange="updateEmailSchedule('sendTime', this.value)">
</div>
<div class="form-group">
<label class="form-label">Sender Name</label>
<input type="text" class="form-input" value="${em.settings.senderName}" onchange="updateEmailSchedule('senderName', this.value)">
</div>
<div class="form-group">
<label class="form-label">Sender Email</label>
<input type="email" class="form-input" value="${em.settings.senderEmail}" onchange="updateEmailSchedule('senderEmail', this.value)">
</div>
</div>
</div>

        <!-- Create Campaign -->
<div style="display: flex; gap: 12px; margin-bottom: 24px;">
<button class="btn-admin primary" onclick="showCreateCampaignModal()">📝 Create Campaign</button>
<button class="btn-admin secondary" onclick="showAddSubscriberModal()">➕ Add Subscriber</button>
<button class="btn-admin secondary" onclick="exportSubscribersCSV()">📥 Export Subscribers</button>
</div>

        <!-- Templates -->
<div class="form-section">
<div class="form-section-title">📋 Email Templates</div>
<div class="card-grid">
                ${em.templates.map(t => `
<div class="client-card pointer" onclick="editEmailTemplate(${t.id})">
<div class="client-card-header" style="background: linear-gradient(135deg, ${t.type === 'newsletter' ? '#3b82f6' : t.type === 'promo' ? '#f59e0b' : '#8b5cf6'}, #000); height: 80px;">
<span class="fs-24">${t.type === 'newsletter' ? '📰' : t.type === 'promo' ? '🎁' : '📢'}</span>
</div>
<div class="client-card-body">
<div class="client-card-name">${t.name}</div>
<div class="client-card-meta">${t.subject}</div>
<div class="client-card-btns">
<button onclick="event.stopPropagation(); useEmailTemplate(${t.id})" class="bg-red text-white">Use Template</button>
</div>
</div>
</div>
                `).join('')}
</div>
</div>

        <!-- Recent Campaigns -->
<div class="form-section">
<div class="form-section-title">📊 Recent Campaigns</div>
<table class="data-table">
<thead><tr><th>Campaign</th><th>Sent</th><th>Opens</th><th>Clicks</th><th>Date</th><th>Status</th></tr></thead>
<tbody>
                    ${em.campaigns.length === 0 ? '<tr><td colspan="6" class="text-center opacity-50">No campaigns yet</td></tr>' : ''}
                    ${em.campaigns.slice(-10).reverse().map(c => `
<tr>
<td>${c.subject}</td>
<td>${c.sent || 0}</td>
<td>${c.opens || 0}</td>
<td>${c.clicks || 0}</td>
<td>${new Date(c.createdAt).toLocaleDateString()}</td>
<td><span class="status-badge ${c.status}">${c.status}</span></td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>

        <!-- Subscribers List -->
<div class="form-section">
<div class="form-section-title">👥 Subscribers (${em.subscribers.length})</div>
<div style="max-height: 300px; overflow-y: auto;">
<table class="data-table">
<thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Subscribed</th><th>Actions</th></tr></thead>
<tbody>
                        ${em.subscribers.length === 0 ? '<tr><td colspan="5" class="text-center opacity-50">No subscribers yet</td></tr>' : ''}
                        ${em.subscribers.map(s => `
<tr>
<td>${s.email}</td>
<td>${s.name || '-'}</td>
<td>${s.source || 'manual'}</td>
<td>${new Date(s.subscribedAt).toLocaleDateString()}</td>
<td><button class="btn-admin small danger" onclick="removeSubscriber('${s.email}')">Remove</button></td>
</tr>
                        `).join('')}
</tbody>
</table>
</div>
</div>
    `;
}

function toggleAutomatedEmail(enabled) {
    emailMarketing.settings.automatedSending = enabled;
    saveEmailMarketing();
    loadAdminEmailMarketingPanel();
}

function updateEmailSchedule(key, value) {
    emailMarketing.settings[key] = value;
    saveEmailMarketing();
}

function showCreateCampaignModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'campaignModal';
    modal.innerHTML = `
<div class="modal max-w-700">
<div class="modal-header"><h3 class="modal-title">Create Email Campaign</h3><button class="modal-close" onclick="document.getElementById('campaignModal').remove()">×</button></div>
<div class="modal-body">
<div class="form-group"><label class="form-label">Subject Line *</label><input type="text" id="campaignSubject" class="form-input" placeholder="Your eye-catching subject line"></div>
<div class="form-group"><label class="form-label">Preview Text</label><input type="text" id="campaignPreview" class="form-input" placeholder="Brief preview shown in inbox"></div>
<div class="form-group"><label class="form-label">Email Content *</label><textarea id="campaignContent" class="form-textarea" rows="10" placeholder="Write your email content here... Use {name} for personalization."></textarea></div>
<div class="form-group">
<label class="form-label">Send To</label>
<select id="campaignAudience" class="form-select">
<option value="all">All Subscribers (${emailMarketing.subscribers.length})</option>
<option value="clients">Clients Only</option>
<option value="leads">Leads Only</option>
</select>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('campaignModal').remove()">Cancel</button>
<button class="btn-admin secondary" onclick="saveCampaignDraft()">Save Draft</button>
<button class="btn-admin primary" onclick="sendCampaign()">Send Now</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function sendCampaign() {
    const subject = document.getElementById('campaignSubject').value;
    const content = document.getElementById('campaignContent').value;
    const audience = document.getElementById('campaignAudience').value;

    if (!subject || !content) {
        alert('Please fill in subject and content.');
        return;
    }

    const campaign = {
        id: Date.now(),
        subject: subject,
        preview: document.getElementById('campaignPreview').value,
        content: content,
        audience: audience,
        sent: emailMarketing.subscribers.length,
        opens: Math.floor(emailMarketing.subscribers.length * 0.35),
        clicks: Math.floor(emailMarketing.subscribers.length * 0.12),
        status: 'sent',
        createdAt: new Date().toISOString()
    };

    emailMarketing.campaigns.push(campaign);
    emailMarketing.analytics.sent += campaign.sent;
    emailMarketing.analytics.opened += campaign.opens;
    emailMarketing.analytics.clicked += campaign.clicks;
    saveEmailMarketing();

    document.getElementById('campaignModal').remove();
    loadAdminEmailMarketingPanel();
    alert('Campaign sent to ' + campaign.sent + ' subscribers!');
}

function showAddSubscriberModal() {
    const email = prompt('Enter subscriber email:');
    if (!email || !validateEmail(email)) {
        if (email) alert('Please enter a valid email address.');
        return;
    }

    if (emailMarketing.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())) {
        alert('This email is already subscribed.');
        return;
    }

    const name = prompt('Enter subscriber name (optional):');

    emailMarketing.subscribers.push({
        email: email,
        name: name || '',
        source: 'manual',
        subscribedAt: new Date().toISOString()
    });
    saveEmailMarketing();
    loadAdminEmailMarketingPanel();
    alert('Subscriber added!');
}

function removeSubscriber(email) {
    if (!confirm('Remove ' + email + ' from subscribers?')) return;
    emailMarketing.subscribers = emailMarketing.subscribers.filter(s => s.email !== email);
    saveEmailMarketing();
    loadAdminEmailMarketingPanel();
}

function useEmailTemplate(templateId) {
    const template = emailMarketing.templates.find(t => t.id === templateId);
    if (!template) {
        alert('Template not found');
        return;
    }

    // Pre-fill the campaign modal with template data
    showCreateCampaignModal();

    // Wait for modal to render then populate
    setTimeout(() => {
        const subjectInput = document.getElementById('campaignSubject');
        const contentInput = document.getElementById('campaignContent');
        if (subjectInput) subjectInput.value = template.subject || '';
        if (contentInput) contentInput.value = template.content || template.body || '';
    }, 100);
}

function editEmailTemplate(templateId) {
    const template = emailMarketing.templates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'editTemplateModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 600px; background: #1a1a1a; color: #fff;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title text-white">✏️ Edit Template: ${template.name}</h3>
<button class="modal-close" onclick="document.getElementById('editTemplateModal').remove()" class="text-white">×</button>
</div>
<div class="modal-body">
<div class="form-group">
<label class="form-label text-white">Template Name</label>
<input type="text" id="editTemplateName" class="form-input" value="${template.name}" class="admin-input">
</div>
<div class="form-group">
<label class="form-label text-white">Subject Line</label>
<input type="text" id="editTemplateSubject" class="form-input" value="${template.subject || ''}" class="admin-input">
</div>
<div class="form-group">
<label class="form-label text-white">Type</label>
<select id="editTemplateType" class="form-select admin-input">
<option value="newsletter" ${template.type === 'newsletter' ? 'selected' : ''}>📰 Newsletter</option>
<option value="promo" ${template.type === 'promo' ? 'selected' : ''}>🎁 Promotional</option>
<option value="announcement" ${template.type === 'announcement' ? 'selected' : ''}>📢 Announcement</option>
</select>
</div>
<div class="form-group">
<label class="form-label text-white">Content</label>
<textarea id="editTemplateContent" class="form-textarea" rows="8" class="admin-input">${template.content || template.body || ''}</textarea>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
<button class="btn-admin secondary" onclick="document.getElementById('editTemplateModal').remove()" style="background: #333; color: #fff;">Cancel</button>
<button class="btn-admin danger" onclick="deleteEmailTemplate(${templateId})" style="background: #dc2626; color: #fff;">Delete</button>
<button class="btn-admin primary" onclick="saveEmailTemplate(${templateId})" class="bg-red text-white">Save Changes</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveEmailTemplate(templateId) {
    const template = emailMarketing.templates.find(t => t.id === templateId);
    if (!template) return;

    template.name = document.getElementById('editTemplateName').value;
    template.subject = document.getElementById('editTemplateSubject').value;
    template.type = document.getElementById('editTemplateType').value;
    template.content = document.getElementById('editTemplateContent').value;
    template.body = document.getElementById('editTemplateContent').value;

    saveEmailMarketing();
    document.getElementById('editTemplateModal').remove();
    loadAdminEmailMarketingPanel();
    alert('Template saved!');
}

function deleteEmailTemplate(templateId) {
    if (!confirm('Delete this template?')) return;
    emailMarketing.templates = emailMarketing.templates.filter(t => t.id !== templateId);
    saveEmailMarketing();
    document.getElementById('editTemplateModal').remove();
    loadAdminEmailMarketingPanel();
}

function showCreateProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'createProductModal';
    modal.innerHTML = `
<div class="modal" style="background: #1a1a1a; color: #fff;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title text-white">➕ Create New Product/Service</h3>
<button class="modal-close" onclick="document.getElementById('createProductModal').remove()" class="text-white">×</button>
</div>
<div class="modal-body">
<div class="form-group">
<label class="form-label text-white">Product/Service Name *</label>
<input type="text" id="newProductName" class="form-input" placeholder="e.g., Custom Logo Design" class="admin-input">
</div>
<div class="form-group">
<label class="form-label text-white">Type</label>
<select id="newProductType" class="form-select admin-input">
<option value="service">Individual Service</option>
<option value="package">Package</option>
</select>
</div>
<div class="form-group">
<label class="form-label text-white">Price *</label>
<input type="number" id="newProductPrice" class="form-input" placeholder="0.00" step="0.01" class="admin-input">
</div>
<div class="form-group">
<label class="form-label text-white">Turnaround Time</label>
<input type="text" id="newProductTurnaround" class="form-input" placeholder="e.g., 3-5 days" class="admin-input">
</div>
<div class="form-group">
<label class="form-label text-white">Description</label>
<textarea id="newProductDescription" class="form-textarea" rows="3" placeholder="Service description..." class="admin-input"></textarea>
</div>
<div class="form-group">
<label class="form-label text-white">Category</label>
<select id="newProductCategory" class="form-select admin-input">
<option value="branding">Branding</option>
<option value="web">Web Development</option>
<option value="print">Print Design</option>
<option value="marketing">Marketing</option>
<option value="social">Social Media</option>
<option value="video">Video Production</option>
<option value="other">Other</option>
</select>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
<button class="btn-admin secondary" onclick="document.getElementById('createProductModal').remove()" style="background: #333; color: #fff;">Cancel</button>
<button class="btn-admin primary" onclick="saveNewProduct()" class="bg-red text-white">Create Product</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveNewProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value) || 0;
    const type = document.getElementById('newProductType').value;
    const turnaround = document.getElementById('newProductTurnaround').value || '3-5 days';
    const description = document.getElementById('newProductDescription').value;
    const category = document.getElementById('newProductCategory').value;

    if (!name || !price) {
        alert('Please enter product name and price');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        turnaround: turnaround,
        description: description,
        category: category
    };

    if (type === 'package') {
        servicePackages.push(newProduct);
        localStorage.setItem('nui_service_packages', JSON.stringify(servicePackages));
    } else {
        individualServices.push(newProduct);
        localStorage.setItem('nui_individual_services', JSON.stringify(individualServices));
    }

    document.getElementById('createProductModal').remove();

    // If invoice modal is open, refresh the dropdowns
    const invoiceModal = document.getElementById('createInvoiceModal');
    if (invoiceModal) {
        const packagesSelect = document.getElementById('quickAddPackage');
        const servicesSelect = document.getElementById('quickAddService');
        if (packagesSelect) {
            packagesSelect.innerHTML = '<option value="">-- Select Package --</option>' +
                servicePackages.map(p => '<option value="' + p.id + '">' + p.name + ' - $' + p.price + '</option>').join('');
        }
        if (servicesSelect) {
            servicesSelect.innerHTML = '<option value="">-- Select Service --</option>' +
                individualServices.map(s => '<option value="' + s.id + '">' + s.name + ' - $' + s.price + '</option>').join('');
        }
    }

    alert('Product "' + name + '" created successfully! Price: $' + price);
}

// ==================== LOYALTY PROGRAM PANEL ====================
function loadAdminLoyaltyPanel() {
    const lp = loyaltyProgram;
    document.getElementById('adminLoyaltyPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">🎁 Loyalty Program</h2>
<p class="panel-subtitle">Reward your loyal clients with points and discounts</p>
</div>

        <!-- Program Toggle -->
<div class="form-section" style="background: ${lp.enabled ? 'rgba(46,204,113,0.1)' : 'rgba(255,59,48,0.1)'}; border: 1px solid ${lp.enabled ? '#2ecc71' : '#ff3b30'};">
<div class="flex-between">
<div>
<div class="form-section-title m-0">🎯 Loyalty Program Status</div>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 8px 0 0;">Clients earn ${lp.pointsPerDollar} point(s) per $1 spent</p>
</div>
<label class="switch">
<input type="checkbox" ${lp.enabled ? 'checked' : ''} onchange="toggleLoyaltyProgram(this.checked)">
<span class="slider round"></span>
</label>
</div>
</div>

        <!-- Stats -->
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Total Members</div><div class="stat-value">${lp.members.length}</div></div>
<div class="stat-card"><div class="stat-label">Points Issued</div><div class="stat-value">${lp.members.reduce((sum, m) => sum + (m.totalEarned || 0), 0).toLocaleString()}</div></div>
<div class="stat-card"><div class="stat-label">Points Redeemed</div><div class="stat-value">${lp.members.reduce((sum, m) => sum + (m.totalRedeemed || 0), 0).toLocaleString()}</div></div>
<div class="stat-card"><div class="stat-label">Avg Balance</div><div class="stat-value">${lp.members.length > 0 ? Math.round(lp.members.reduce((sum, m) => sum + (m.points || 0), 0) / lp.members.length) : 0}</div></div>
</div>

        <!-- Settings -->
<div class="form-section">
<div class="form-section-title">⚙️ Program Settings</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Points per $1 Spent</label>
<input type="number" class="form-input" value="${lp.pointsPerDollar}" min="1" onchange="updateLoyaltySetting('pointsPerDollar', parseInt(this.value))">
</div>
</div>
</div>

        <!-- Reward Tiers -->
<div class="form-section">
<div class="form-section-title">🏆 Reward Tiers</div>
<div class="card-grid">
                ${lp.rewardTiers.map((tier, i) => `
<div class="client-card">
<div class="client-card-header" style="background: linear-gradient(135deg, ${i === 0 ? '#cd7f32' : i === 1 ? '#c0c0c0' : i === 2 ? '#ffd700' : '#e5e4e2'}, #000);">
<span class="fs-24">${i === 0 ? '🥉' : i === 1 ? '🥈' : i === 2 ? '🥇' : '💎'}</span>
</div>
<div class="client-card-body">
<div class="client-card-name">${tier.name}</div>
<div class="client-card-meta">${tier.minPoints}+ points<br>${tier.discount}% discount</div>
<div style="margin-top: 8px;">
                                ${tier.perks.map(p => '<span class="tag" style="font-size: 10px;">' + p + '</span>').join('')}
</div>
<div class="client-card-btns mt-12">
<button onclick="editLoyaltyTier(${i})" class="bg-red text-white">Edit</button>
</div>
</div>
</div>
                `).join('')}
</div>
</div>

        <!-- Members -->
<div class="form-section">
<div class="form-section-title">👥 Loyalty Members</div>
<div style="display: flex; gap: 12px; margin-bottom: 16px;">
<button class="btn-admin primary" onclick="enrollClientInLoyalty()">➕ Enroll Client</button>
<button class="btn-admin secondary" onclick="awardBonusPoints()">🎁 Award Bonus Points</button>
</div>
<table class="data-table">
<thead><tr><th>Client</th><th>Tier</th><th>Points</th><th>Lifetime Earned</th><th>Joined</th><th>Actions</th></tr></thead>
<tbody>
                    ${lp.members.length === 0 ? '<tr><td colspan="6" class="text-center opacity-50">No members yet. Enroll clients to get started!</td></tr>' : ''}
                    ${lp.members.map(m => {
                        const tier = lp.rewardTiers.slice().reverse().find(t => m.points >= t.minPoints) || lp.rewardTiers[0];
                        return `
<tr>
<td>${m.name}</td>
<td><span class="status-badge" style="background: ${tier.name === 'Bronze' ? '#cd7f32' : tier.name === 'Silver' ? '#c0c0c0' : tier.name === 'Gold' ? '#ffd700' : '#e5e4e2'}; color: #000;">${tier.name}</span></td>
<td class="fw-600">${(m.points || 0).toLocaleString()}</td>
<td>${(m.totalEarned || 0).toLocaleString()}</td>
<td>${new Date(m.joinedAt).toLocaleDateString()}</td>
<td>
<button class="btn-admin small" onclick="adjustLoyaltyPoints(${m.clientId})">Adjust</button>
<button class="btn-admin small danger" onclick="removeLoyaltyMember(${m.clientId})">Remove</button>
</td>
</tr>
                    `;}).join('')}
</tbody>
</table>
</div>
    `;
}

function toggleLoyaltyProgram(enabled) {
    loyaltyProgram.enabled = enabled;
    saveLoyalty();
    loadAdminLoyaltyPanel();
}

function updateLoyaltySetting(key, value) {
    loyaltyProgram[key] = value;
    saveLoyalty();
}

function enrollClientInLoyalty() {
    const availableClients = clients.filter(c => !loyaltyProgram.members.find(m => m.clientId === c.id));
    if (availableClients.length === 0) {
        alert('All clients are already enrolled!');
        return;
    }

    const clientList = availableClients.map(c => c.name + ' (' + c.email + ')').join('\n');
    const selection = prompt('Enter client name to enroll:\n\n' + clientList);
    if (!selection) return;

    const client = availableClients.find(c => c.name.toLowerCase().includes(selection.toLowerCase()));
    if (!client) {
        alert('Client not found.');
        return;
    }

    loyaltyProgram.members.push({
        clientId: client.id,
        name: client.name,
        email: client.email,
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        joinedAt: new Date().toISOString()
    });
    saveLoyalty();
    loadAdminLoyaltyPanel();
    alert(client.name + ' has been enrolled in the loyalty program!');
}

function adjustLoyaltyPoints(clientId) {
    const member = loyaltyProgram.members.find(m => m.clientId === clientId);
    if (!member) return;

    const adjustment = prompt('Enter points to add (use negative for deduction). Current balance: ' + member.points);
    if (!adjustment) return;

    const points = parseInt(adjustment);
    if (isNaN(points)) return;

    member.points += points;
    if (points > 0) member.totalEarned += points;
    else member.totalRedeemed += Math.abs(points);

    saveLoyalty();
    loadAdminLoyaltyPanel();
}

function removeLoyaltyMember(clientId) {
    if (!confirm('Remove this client from the loyalty program?')) return;
    loyaltyProgram.members = loyaltyProgram.members.filter(m => m.clientId !== clientId);
    saveLoyalty();
    loadAdminLoyaltyPanel();
}

// ==================== COMMUNICATIONS HUB PANEL ====================
function loadAdminCommunicationsPanel() {
    // Combine all messages from different channels
    const allMessages = [
        ...socialMediaDM.conversations.map(c => ({...c, channel: c.platform})),
        ...smsSystem.conversations.map(c => ({...c, channel: 'sms'})),
        ...(crmData.communications || []).map(c => ({...c, channel: 'email'}))
    ].sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));

    document.getElementById('adminCommunicationsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">💬 Communications Hub</h2>
<p class="panel-subtitle">All your client communications in one place</p>
</div>

        <!-- Stats -->
<div class="stats-grid">
<div class="stat-card" style="border-left-color: #3b82f6;"><div class="stat-label">📧 Emails</div><div class="stat-value">${(crmData.communications || []).length}</div></div>
<div class="stat-card" style="border-left-color: #1877f2;"><div class="stat-label">📱 Facebook</div><div class="stat-value">${socialMediaDM.conversations.filter(c => c.platform === 'facebook').length}</div></div>
<div class="stat-card" style="border-left-color: #e4405f;"><div class="stat-label">📸 Instagram</div><div class="stat-value">${socialMediaDM.conversations.filter(c => c.platform === 'instagram').length}</div></div>
<div class="stat-card" style="border-left-color: #25d366;"><div class="stat-label">📲 SMS</div><div class="stat-value">${smsSystem.conversations.length}</div></div>
</div>

        <!-- Filters -->
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="commSearch" placeholder="Search conversations..."
                oninput="filterCommunications()"
                style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; background: rgba(255,255,255,0.1); color: #fff;">
<select id="commChannelFilter" onchange="filterCommunications()" style="padding: 12px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.1); color: #fff;">
<option value="all">All Channels</option>
<option value="email">📧 Email</option>
<option value="facebook">📱 Facebook</option>
<option value="instagram">📸 Instagram</option>
<option value="sms">📲 SMS</option>
</select>
<button class="btn-admin primary" onclick="composeNewMessage()">✉️ New Message</button>
</div>

        <!-- Unified Inbox -->
<div class="form-section">
<div class="form-section-title">📥 Unified Inbox</div>
<div id="unifiedInbox" style="max-height: 500px; overflow-y: auto;">
                ${allMessages.length === 0 ? '<p style="text-align: center; opacity: 0.5; padding: 40px;">No conversations yet. Connect your channels to get started!</p>' : ''}
                ${allMessages.slice(0, 50).map(msg => `
<div class="conversation-item" style="display: flex; gap: 16px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="openConversation('${msg.channel}', ${msg.id})">
<div style="width: 40px; height: 40px; border-radius: 50%; background: ${msg.channel === 'facebook' ? '#1877f2' : msg.channel === 'instagram' ? '#e4405f' : msg.channel === 'sms' ? '#25d366' : '#3b82f6'}; display: flex; align-items: center; justify-content: center;">
                            ${msg.channel === 'facebook' ? '📱' : msg.channel === 'instagram' ? '📸' : msg.channel === 'sms' ? '📲' : '📧'}
</div>
<div class="flex-1">
<div style="display: flex; justify-content: space-between;">
<strong>${msg.contactName || msg.name || msg.from || 'Unknown'}</strong>
<span style="font-size: 12px; opacity: 0.5;">${msg.lastMessageAt ? new Date(msg.lastMessageAt).toLocaleString() : ''}</span>
</div>
<p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${msg.lastMessage || msg.preview || 'No messages'}</p>
</div>
                        ${msg.unread ? '<div style="width: 10px; height: 10px; background: var(--red); border-radius: 50%;"></div>' : ''}
</div>
                `).join('')}
</div>
</div>

        <!-- Quick Connect -->
<div class="form-section">
<div class="form-section-title">🔗 Channel Connections</div>
<div class="card-grid">
<div class="client-card" onclick="showAdminPanel('socialdm')">
<div class="client-card-header" style="background: linear-gradient(135deg, #1877f2, #000);">📱</div>
<div class="client-card-body">
<div class="client-card-name">Facebook</div>
<div class="client-card-meta">${socialMediaDM.conversations.filter(c => c.platform === 'facebook').length} conversations</div>
</div>
</div>
<div class="client-card" onclick="showAdminPanel('socialdm')">
<div class="client-card-header" style="background: linear-gradient(135deg, #e4405f, #000);">📸</div>
<div class="client-card-body">
<div class="client-card-name">Instagram</div>
<div class="client-card-meta">${socialMediaDM.conversations.filter(c => c.platform === 'instagram').length} conversations</div>
</div>
</div>
<div class="client-card" onclick="showAdminPanel('sms')">
<div class="client-card-header" style="background: linear-gradient(135deg, #25d366, #000);">📲</div>
<div class="client-card-body">
<div class="client-card-name">OpenPhone SMS</div>
<div class="client-card-meta">${smsSystem.openPhone.connected ? '✅ Connected' : '❌ Not Connected'}</div>
</div>
</div>
</div>
</div>
    `;
}

function composeNewMessage() {
    const channel = prompt('Select channel (email, sms, facebook, instagram):');
    if (!channel) return;

    if (channel === 'sms') {
        showAdminPanel('sms');
    } else if (channel === 'facebook' || channel === 'instagram') {
        showAdminPanel('socialdm');
    } else {
        alert('Compose email feature - In production, this would open your email client.');
    }
}

function filterCommunications() {
    const search = document.getElementById('commSearch')?.value?.toLowerCase() || '';
    const channel = document.getElementById('commChannelFilter')?.value || 'all';
    const inbox = document.getElementById('unifiedInbox');
    if (!inbox) return;

    const items = inbox.querySelectorAll('.conversation-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matchesSearch = !search || text.includes(search);
        const matchesChannel = channel === 'all' || item.innerHTML.includes(channel);
        item.style.display = (matchesSearch && matchesChannel) ? 'flex' : 'none';
    });
}

function openConversation(channel, id) {
    if (channel === 'sms') {
        showAdminPanel('sms');
    } else if (channel === 'facebook' || channel === 'instagram') {
        showAdminPanel('socialdm');
    } else if (channel === 'email') {
        showAdminPanel('emailmarketing');
    }
}

// ==================== SOCIAL DM PANEL ====================
function loadAdminSocialDmPanel() {
    const sm = socialMediaDM;
    const contactsWithHandles = clients.filter(c => c.socialHandles && (c.socialHandles.instagram || c.socialHandles.facebook || c.socialHandles.twitter)).length;
    const todayDate = new Date().toDateString();
    const todayDrafts = sm.conversations.filter(c => new Date(c.timestamp).toDateString() === todayDate).length;

    document.getElementById('adminSocialdmPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">💬 Social Media Quick Links</h2>
<p class="panel-subtitle">Send DMs directly to clients without API - store handles, draft messages, click to open</p>
</div>

        <!-- Stats Row -->
<div class="stats-grid">
<div class="stat-card">
<div class="stat-label">Contacts with Handles</div>
<div class="stat-value">${contactsWithHandles}</div>
</div>
<div class="stat-card">
<div class="stat-label">Messages Logged Today</div>
<div class="stat-value">${todayDrafts}</div>
</div>
<div class="stat-card">
<div class="stat-label">Total Conversations</div>
<div class="stat-value">${sm.conversations.length}</div>
</div>
</div>

        <!-- Quick Send Section -->
<div class="form-section">
<div class="form-section-title">✉️ Quick Send DM</div>

<div class="form-row">
<div class="form-group flex-1">
<label class="form-label">Select Client</label>
<select id="dmClientSelect" class="form-select" onchange="selectDmClient(this.value)">
<option value="">-- Choose a client --</option>
                        ${clients.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('')}
</select>
</div>
<div class="form-group flex-1">
<label class="form-label">Platform</label>
<div style="display: flex; gap: 8px; margin-top: 8px;">
<button class="platform-btn" id="platformInstagram" onclick="setDmPlatform('instagram')" style="background: rgba(228, 64, 95, 0.2); color: #e4405f; border: 1px solid #e4405f;">📷 Instagram</button>
<button class="platform-btn" id="platformFacebook" onclick="setDmPlatform('facebook')" style="background: rgba(24, 119, 242, 0.2); color: #1877f2; border: 1px solid #1877f2;">f Facebook</button>
<button class="platform-btn" id="platformTwitter" onclick="setDmPlatform('twitter')" style="background: rgba(29, 161, 242, 0.2); color: #1da1f2; border: 1px solid #1da1f2;">𝕏 Twitter</button>
</div>
</div>
</div>

<div class="form-row">
<div class="form-group flex-1">
<label class="form-label">Handle (@username)</label>
<input type="text" id="dmHandle" class="form-input" placeholder="e.g., @username or facebook_page_name" oninput="validateDmHandle()">
</div>
</div>

<div class="form-group">
<label class="form-label">Message <span style="opacity: 0.5;" id="dmCharCount">(0 chars)</span></label>
<textarea id="dmMessage" class="form-textarea" rows="4" placeholder="Compose your message..." oninput="updateDmCharCount()"></textarea>
</div>

<div style="display: flex; gap: 8px; margin-bottom: 16px;">
<button class="btn-template" onclick="fillDmTemplate('follow_up')" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px;">📌 Follow Up</button>
<button class="btn-template" onclick="fillDmTemplate('update')" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px;">📊 Project Update</button>
<button class="btn-template" onclick="fillDmTemplate('payment')" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px;">💳 Payment Reminder</button>
<button class="btn-template" onclick="fillDmTemplate('thanks')" style="background: rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px;">🙏 Thank You</button>
</div>

<div class="flex-gap-8">
<button class="btn-admin primary" onclick="openSocialDm()" class="flex-1">🔗 Open DM in Browser</button>
<button class="btn-admin" onclick="copyDmMessage()" style="flex: 1; background: rgba(255,255,255,0.1); color: #fff;">📋 Copy Message</button>
<button class="btn-admin" onclick="logDmConversation()" style="flex: 1; background: rgba(46,204,113,0.2); color: #2ecc71;">💾 Log Conversation</button>
</div>
</div>

        <!-- Client Handles Directory -->
<div class="form-section">
<div class="form-section-title">📋 Client Handles Directory</div>
<div style="overflow-x: auto;">
<table class="data-table" style="width: 100%; min-width: 600px;">
<thead>
<tr>
<th>Client Name</th>
<th class="text-center">📷 Instagram</th>
<th class="text-center">f Facebook</th>
<th class="text-center">𝕏 Twitter</th>
<th>Action</th>
</tr>
</thead>
<tbody>
                        ${clients.length === 0 ? '<tr><td colspan="5" class="text-center opacity-50">No clients yet</td></tr>' : clients.map(c => `
<tr>
<td><strong>${c.name}</strong></td>
<td class="text-center">${c.socialHandles?.instagram ? '@' + c.socialHandles.instagram : '-'}</td>
<td class="text-center">${c.socialHandles?.facebook ? c.socialHandles.facebook : '-'}</td>
<td class="text-center">${c.socialHandles?.twitter ? '@' + c.socialHandles.twitter : '-'}</td>
<td><button class="btn-admin small primary" onclick="editClientHandles('${c.id}')">Edit Handles</button></td>
</tr>
                        `).join('')}
</tbody>
</table>
</div>
</div>

        <!-- Conversation Log -->
<div class="form-section">
<div class="admin-row-between">
<div class="form-section-title m-0">📥 Conversation Log (${sm.conversations.length})</div>
<button class="btn-admin small" onclick="exportDmLog()" style="background: rgba(255,255,255,0.1); color: #fff;">📊 Export CSV</button>
</div>
<div style="margin-bottom: 12px;">
<input type="text" id="dmLogSearch" class="form-input" placeholder="🔍 Search conversations..." oninput="searchDmLog(this.value)">
</div>
<div id="dmLogContainer" style="max-height: 500px; overflow-y: auto;">
                ${sm.conversations.length === 0 ? '<p style="text-align: center; opacity: 0.5; padding: 32px;">No conversations logged yet. Send and log messages to build history.</p>' : sm.conversations.map((conv, idx) => `
<div style="display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 8px; border-left: 3px solid ${conv.platform === 'facebook' ? '#1877f2' : conv.platform === 'instagram' ? '#e4405f' : '#1da1f2'};">
<div class="flex-1">
<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
<div>
<span style="font-weight: bold;">${conv.clientName}</span>
<span style="opacity: 0.5; margin-left: 8px; font-size: 12px;">@${conv.handle}</span>
<span style="opacity: 0.5; margin-left: 8px; font-size: 11px;">${conv.platform === 'facebook' ? 'f' : conv.platform === 'instagram' ? '📷' : '𝕏'}</span>
</div>
<span style="font-size: 11px; opacity: 0.5;">${new Date(conv.timestamp).toLocaleString()}</span>
</div>
<p style="margin: 0; font-size: 13px; opacity: 0.8; line-height: 1.4;">${(conv.message || '').substring(0, 150)}${(conv.message || '').length > 150 ? '...' : ''}</p>
</div>
<button class="btn-admin small danger" onclick="deleteDmConversation(${idx})" style="padding: 4px 8px; height: fit-content;">✕</button>
</div>
                `).join('')}
</div>
</div>

        <!-- Auto-Response Templates -->
<div class="form-section">
<div class="form-section-title">🤖 Auto-Response Settings</div>
<div class="admin-row-between">
<p style="color: rgba(255,255,255,0.6); margin: 0;">Automatically respond to common inquiries across platforms</p>
<label class="switch">
<input type="checkbox" ${sm.settings.autoReplyEnabled ? 'checked' : ''} onchange="toggleSocialAutoReply(this.checked)">
<span class="slider round"></span>
</label>
</div>
<div class="mb-16">
<button class="btn-admin primary" onclick="addSocialAutoResponse()">+ Add Auto-Response</button>
</div>
<table class="data-table">
<thead><tr><th>Trigger</th><th>Platform</th><th>Response</th><th>Actions</th></tr></thead>
<tbody>
                    ${sm.autoResponses.map((ar, i) => `
<tr>
<td><span class="tag">${ar.trigger}</span></td>
<td>${ar.platform}</td>
<td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ar.message}</td>
<td>
<button class="btn-admin small danger" onclick="deleteSocialAutoResponse(${i})">Delete</button>
</td>
</tr>
                    `).join('')}
</tbody>
</table>
</div>
    `;
}

// ==================== SOCIAL DM HELPER FUNCTIONS ====================

let currentDmPlatform = 'instagram';

function selectDmClient(clientId) {
    if (!clientId) {
        document.getElementById('dmHandle').value = '';
        return;
    }
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const handles = client.socialHandles || {};
    const handle = handles[currentDmPlatform] || '';
    document.getElementById('dmHandle').value = handle ? '@' + handle.replace('@', '') : '';
}

function setDmPlatform(platform) {
    currentDmPlatform = platform;

    // Update button styles
    document.getElementById('platformInstagram').style.background = platform === 'instagram' ? 'rgba(228, 64, 95, 0.4)' : 'rgba(228, 64, 95, 0.2)';
    document.getElementById('platformInstagram').style.fontWeight = platform === 'instagram' ? '600' : '400';

    document.getElementById('platformFacebook').style.background = platform === 'facebook' ? 'rgba(24, 119, 242, 0.4)' : 'rgba(24, 119, 242, 0.2)';
    document.getElementById('platformFacebook').style.fontWeight = platform === 'facebook' ? '600' : '400';

    document.getElementById('platformTwitter').style.background = platform === 'twitter' ? 'rgba(29, 161, 242, 0.4)' : 'rgba(29, 161, 242, 0.2)';
    document.getElementById('platformTwitter').style.fontWeight = platform === 'twitter' ? '600' : '400';

    // Re-populate handle from client if one is selected
    const clientSelect = document.getElementById('dmClientSelect');
    if (clientSelect && clientSelect.value) {
        selectDmClient(clientSelect.value);
    }
}

function fillDmTemplate(type) {
    let template = '';
    const clientSelect = document.getElementById('dmClientSelect');
    const clientId = clientSelect ? clientSelect.value : '';
    const clientName = clientId ? (clients.find(c => c.id === clientId)?.name || 'Client') : 'Client';

    switch(type) {
        case 'follow_up':
            template = `Hi ${clientName},\n\nJust following up on our previous conversation. Let me know if you have any questions!\n\nBest regards,\nNew Urban Influence`;
            break;
        case 'update':
            template = `Hi ${clientName},\n\nYour project is progressing well! Check your email for the latest proof/update.\n\nLooking forward to your feedback!\n\nBest regards,\nNew Urban Influence`;
            break;
        case 'payment':
            template = `Hi ${clientName},\n\nFriendly reminder that your invoice is due soon. Let me know if you have any questions!\n\nThanks!`;
            break;
        case 'thanks':
            template = `Hi ${clientName},\n\nThank you for working with us! We really appreciate the opportunity.\n\nBest regards,\nNew Urban Influence`;
            break;
    }

    document.getElementById('dmMessage').value = template;
    updateDmCharCount();
}

function updateDmCharCount() {
    const msg = document.getElementById('dmMessage').value;
    document.getElementById('dmCharCount').textContent = '(' + msg.length + ' chars)';
}

function validateDmHandle() {
    let handle = document.getElementById('dmHandle').value;
    if (currentDmPlatform === 'twitter' || currentDmPlatform === 'instagram') {
        handle = handle.replace('@', '').trim();
    }
    document.getElementById('dmHandle').value = handle;
}

function openSocialDm() {
    const platform = currentDmPlatform;
    const handle = document.getElementById('dmHandle').value.replace('@', '').trim();
    const message = document.getElementById('dmMessage').value;

    if (!handle) {
        alert('Please enter a handle');
        return;
    }

    let url = '';
    let encodedMsg = encodeURIComponent(message);

    switch(platform) {
        case 'instagram':
            url = 'https://ig.me/m/' + handle;
            break;
        case 'facebook':
            url = 'https://m.me/' + handle;
            break;
        case 'twitter':
            url = 'https://twitter.com/' + handle;
            break;
        default:
            alert('Invalid platform');
            return;
    }

    window.open(url, '_blank');
}

function copyDmMessage() {
    const message = document.getElementById('dmMessage').value;
    if (!message) {
        alert('Message is empty');
        return;
    }
    navigator.clipboard.writeText(message).then(() => {
        alert('Message copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy message');
    });
}

function logDmConversation() {
    const clientSelect = document.getElementById('dmClientSelect');
    if (!clientSelect.value) {
        alert('Please select a client');
        return;
    }

    const clientId = clientSelect.value;
    const client = clients.find(c => c.id === clientId);
    const handle = document.getElementById('dmHandle').value.replace('@', '').trim();
    const message = document.getElementById('dmMessage').value;

    if (!handle || !message) {
        alert('Please fill in handle and message');
        return;
    }

    const conversation = {
        clientName: client.name,
        clientId: clientId,
        platform: currentDmPlatform,
        handle: handle,
        message: message,
        timestamp: new Date().toISOString()
    };

    socialMediaDM.conversations.unshift(conversation);
    saveSocialDM();

    // Log to CRM if available
    if (typeof logProofActivity === 'function') {
        logProofActivity(clientId, 'social_dm', `Sent DM to @${handle} on ${currentDmPlatform}: ${message.substring(0, 100)}`);
    }

    // Clear form
    document.getElementById('dmMessage').value = '';
    document.getElementById('dmHandle').value = '';
    updateDmCharCount();

    loadAdminSocialDmPanel();
    alert('Conversation logged!');
}

function deleteDmConversation(index) {
    if (!confirm('Delete this conversation from log?')) return;
    socialMediaDM.conversations.splice(index, 1);
    saveSocialDM();
    loadAdminSocialDmPanel();
}

function searchDmLog(query) {
    const logContainer = document.getElementById('dmLogContainer');
    if (!logContainer) return;

    const items = logContainer.querySelectorAll('[style*="border-left"]');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
}

function exportDmLog() {
    if (socialMediaDM.conversations.length === 0) {
        alert('No conversations to export');
        return;
    }

    let csv = 'Client,Handle,Platform,Message,Date\n';
    socialMediaDM.conversations.forEach(conv => {
        const date = new Date(conv.timestamp).toLocaleString();
        const msg = '"' + (conv.message || '').replace(/"/g, '""') + '"';
        csv += `"${conv.clientName}","@${conv.handle}","${conv.platform}",${msg},"${date}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_dm_log_' + new Date().getTime() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function editClientHandles(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const current = client.socialHandles || {};
    const instagram = prompt('Instagram handle (without @):', current.instagram || '');
    if (instagram === null) return;

    const facebook = prompt('Facebook handle/page name:', current.facebook || '');
    if (facebook === null) return;

    const twitter = prompt('Twitter/X handle (without @):', current.twitter || '');
    if (twitter === null) return;

    client.socialHandles = {
        instagram: instagram.replace('@', '').trim(),
        facebook: facebook.trim(),
        twitter: twitter.replace('@', '').trim()
    };

    saveClients();
    loadAdminSocialDmPanel();
    alert('Handles saved for ' + client.name);
}

function toggleSocialAutoReply(enabled) {
    socialMediaDM.settings.autoReplyEnabled = enabled;
    saveSocialDM();
}

function addSocialAutoResponse() {
    const trigger = prompt('Enter trigger word (e.g., "pricing", "hello", "hours"):');
    if (!trigger) return;

    const message = prompt('Enter auto-response message:');
    if (!message) return;

    socialMediaDM.autoResponses.push({
        id: Date.now(),
        trigger: trigger.toLowerCase(),
        platform: 'all',
        message: message
    });
    saveSocialDM();
    loadAdminSocialDmPanel();
}

function deleteSocialAutoResponse(index) {
    if (!confirm('Delete this auto-response?')) return;
    socialMediaDM.autoResponses.splice(index, 1);
    saveSocialDM();
    loadAdminSocialDmPanel();
}

// ==================== SMS / OPENPHONE PANEL ====================
function loadAdminSmsPanel() {
    const sms = smsSystem;
    document.getElementById('adminSmsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📲 SMS Communications</h2>
<p class="panel-subtitle">Manage SMS through OpenPhone integration</p>
</div>

        <!-- OpenPhone Connection -->
<div class="form-section" style="background: ${sms.openPhone.connected ? 'rgba(46,204,113,0.1)' : 'rgba(255,59,48,0.1)'}; border: 1px solid ${sms.openPhone.connected ? '#2ecc71' : '#ff3b30'};">
<div class="flex-between">
<div>
<div class="form-section-title m-0">📱 OpenPhone Connection</div>
<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 8px 0 0;">
                        ${sms.openPhone.connected ? 'Connected: ' + sms.openPhone.phoneNumber : 'Connect your OpenPhone account to send/receive SMS'}
</p>
</div>
<button class="btn-admin ${sms.openPhone.connected ? 'danger' : 'primary'}" onclick="${sms.openPhone.connected ? 'disconnectOpenPhone()' : 'connectOpenPhone()'}">
                    ${sms.openPhone.connected ? 'Disconnect' : 'Connect OpenPhone'}
</button>
</div>
</div>

        <!-- API Configuration -->
        ${!sms.openPhone.connected ? `
<div class="form-section">
<div class="form-section-title">🔑 OpenPhone API Configuration</div>
<div class="form-group">
<label class="form-label">API Key</label>
<input type="password" id="openPhoneApiKey" class="form-input" placeholder="Enter your OpenPhone API key">
</div>
<div class="form-group">
<label class="form-label">Phone Number</label>
<input type="tel" id="openPhoneNumber" class="form-input" placeholder="+1 (313) 555-0123">
</div>
<button class="btn-admin primary" onclick="saveOpenPhoneConfig()">Save & Connect</button>
<p style="font-size: 12px; opacity: 0.5; margin-top: 12px;">
                Get your API key from <a href="https://app.openphone.com/settings/api" target="_blank" class="text-red">OpenPhone Settings → API</a>
</p>
</div>
        ` : ''}

        <!-- Auto-Response Settings -->
<div class="form-section">
<div class="admin-row-between">
<div class="form-section-title m-0">🤖 Auto-Response Settings</div>
<label class="switch">
<input type="checkbox" ${sms.settings.autoReplyEnabled ? 'checked' : ''} onchange="toggleSmsAutoReply(this.checked)">
<span class="slider round"></span>
</label>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Business Hours Only</label>
<select class="form-select" onchange="updateSmsSetting('businessHoursOnly', this.value === 'true')">
<option value="true" ${sms.settings.businessHoursOnly ? 'selected' : ''}>Yes</option>
<option value="false" ${!sms.settings.businessHoursOnly ? 'selected' : ''}>No (24/7)</option>
</select>
</div>
<div class="form-group">
<label class="form-label">Start Time</label>
<input type="time" class="form-input" value="${sms.settings.businessHours.start}" onchange="updateSmsBusinessHours('start', this.value)">
</div>
<div class="form-group">
<label class="form-label">End Time</label>
<input type="time" class="form-input" value="${sms.settings.businessHours.end}" onchange="updateSmsBusinessHours('end', this.value)">
</div>
</div>
</div>

        <!-- SMS Templates -->
<div class="form-section">
<div class="form-section-title">📝 SMS Templates</div>
<div class="mb-16">
<button class="btn-admin primary" onclick="addSmsTemplate()">+ Add Template</button>
</div>
<div class="card-grid">
                ${sms.templates.map(t => `
<div class="client-card">
<div class="client-card-header" style="background: linear-gradient(135deg, #25d366, #000);">📲</div>
<div class="client-card-body">
<div class="client-card-name">${t.name}</div>
<div class="client-card-meta" style="font-size: 12px; height: 40px; overflow: hidden;">${t.message}</div>
<div class="client-card-btns">
<button onclick="useSmsTemplate(${t.id})" class="bg-red text-white">Use</button>
<button onclick="editSmsTemplate(${t.id})" style="background: rgba(255,255,255,0.1); color: #fff;">Edit</button>
</div>
</div>
</div>
                `).join('')}
</div>
</div>

        <!-- Send SMS -->
<div class="form-section">
<div class="form-section-title">✉️ Send SMS</div>
<div class="form-row">
<div class="form-group flex-1">
<label class="form-label">To (Phone Number)</label>
<input type="tel" id="smsTo" class="form-input" placeholder="+1 (313) 555-0123">
</div>
<div class="form-group flex-1">
<label class="form-label">Select Client</label>
<select id="smsClientSelect" class="form-select" onchange="populateSmsPhone(this.value)">
<option value="">-- Or select client --</option>
                        ${clients.filter(c => c.phone).map(c => '<option value="' + c.phone + '">' + c.name + ' - ' + c.phone + '</option>').join('')}
</select>
</div>
</div>
<div class="form-group">
<label class="form-label">Message (<span id="smsCharCount">0</span>/160)</label>
<textarea id="smsMessage" class="form-textarea" rows="3" placeholder="Type your message..." oninput="updateSmsCharCount()"></textarea>
</div>
<button class="btn-admin primary" onclick="sendSms()">📤 Send SMS</button>
</div>

        <!-- Conversations -->
<div class="form-section">
<div class="form-section-title">💬 SMS Conversations (${sms.conversations.length})</div>
<div style="max-height: 400px; overflow-y: auto;">
                ${sms.conversations.length === 0 ? '<p style="text-align: center; opacity: 0.5; padding: 40px;">No SMS conversations yet.</p>' : ''}
                ${sms.conversations.map(conv => `
<div style="display: flex; gap: 12px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;">
<div style="width: 48px; height: 48px; border-radius: 50%; background: #25d366; display: flex; align-items: center; justify-content: center; font-size: 20px;">📲</div>
<div class="flex-1">
<div style="display: flex; justify-content: space-between;">
<strong>${conv.contactName || conv.phone}</strong>
<span style="font-size: 12px; opacity: 0.5;">${new Date(conv.lastMessageAt).toLocaleString()}</span>
</div>
<p style="margin: 4px 0; font-size: 13px; opacity: 0.7;">${conv.phone}</p>
<p style="margin: 4px 0 8px; font-size: 14px;">${conv.lastMessage}</p>
<button class="btn-admin small primary" onclick="openSmsConversation('${conv.phone}')">Reply</button>
</div>
</div>
                `).join('')}
</div>
</div>

        <!-- Test -->
<div class="form-section">
<div class="form-section-title">🧪 Test</div>
<button class="btn-admin secondary" onclick="simulateIncomingSms()">Simulate Incoming SMS</button>
</div>
    `;
}

function connectOpenPhone() {
    document.getElementById('openPhoneApiKey')?.focus();
}

function saveOpenPhoneConfig() {
    const apiKey = document.getElementById('openPhoneApiKey').value;
    const phoneNumber = document.getElementById('openPhoneNumber').value;

    if (!apiKey || !phoneNumber) {
        alert('Please enter both API key and phone number.');
        return;
    }

    smsSystem.openPhone = {
        connected: true,
        apiKey: apiKey,
        phoneNumber: phoneNumber,
        userId: 'user_' + Date.now()
    };
    saveSms();
    loadAdminSmsPanel();
    alert('OpenPhone connected successfully!');
}

function disconnectOpenPhone() {
    if (!confirm('Disconnect OpenPhone?')) return;
    smsSystem.openPhone = { connected: false, apiKey: '', phoneNumber: '', userId: '' };
    saveSms();
    loadAdminSmsPanel();
}

function toggleSmsAutoReply(enabled) {
    smsSystem.settings.autoReplyEnabled = enabled;
    saveSms();
}

function updateSmsSetting(key, value) {
    smsSystem.settings[key] = value;
    saveSms();
}

function updateSmsBusinessHours(key, value) {
    smsSystem.settings.businessHours[key] = value;
    saveSms();
}

function populateSmsPhone(phone) {
    if (phone) document.getElementById('smsTo').value = phone;
}

function updateSmsCharCount() {
    const msg = document.getElementById('smsMessage').value;
    document.getElementById('smsCharCount').textContent = msg.length;
}

async function sendSms() {
    const to = document.getElementById('smsTo').value;
    const message = document.getElementById('smsMessage').value;

    if (!to || !message) {
        alert('Please enter phone number and message.');
        return;
    }

    if (!smsSystem.openPhone.connected) {
        alert('Please connect OpenPhone first.');
        return;
    }

    // Show sending state
    const sendBtn = document.querySelector('[onclick="sendSms()"]');
    if (sendBtn) { sendBtn.textContent = '⏳ Sending...'; sendBtn.disabled = true; }

    let apiSuccess = false;
    try {
        const res = await fetch('/.netlify/functions/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, message })
        });
        const result = await res.json();
        apiSuccess = res.ok && result.success;
        if (!apiSuccess) {
            console.warn('SMS API error:', result.error || res.status);
        }
    } catch (err) {
        console.warn('SMS send failed:', err.message);
    }

    // Add to local conversations for immediate display
    let conv = smsSystem.conversations.find(c => c.phone === to);
    if (!conv) {
        conv = {
            id: Date.now(),
            phone: to,
            contactName: clients.find(c => c.phone === to)?.name || '',
            messages: [],
            lastMessage: '',
            lastMessageAt: ''
        };
        smsSystem.conversations.push(conv);
    }

    conv.messages.push({ direction: 'outbound', content: message, timestamp: new Date().toISOString(), sentViaApi: apiSuccess });
    conv.lastMessage = message;
    conv.lastMessageAt = new Date().toISOString();

    saveSms();
    document.getElementById('smsMessage').value = '';
    updateSmsCharCount();
    loadAdminSmsPanel();

    if (sendBtn) { sendBtn.textContent = '📤 Send SMS'; sendBtn.disabled = false; }
    alert(apiSuccess ? '✅ SMS sent to ' + to + '!' : '⚠️ SMS saved locally but delivery failed. Check your OpenPhone API key in Netlify env vars (OPENPHONE_API_KEY, OPENPHONE_PHONE_NUMBER).');
}

// Dev/test helper — simulates an incoming SMS for testing the UI
// In production, real incoming SMS arrives via OpenPhone webhook → Supabase → realtime
function simulateIncomingSms() {
    const phones = ['+1 (313) 555-0101', '+1 (313) 555-0202', '+1 (313) 555-0303'];
    const names = ['John Doe', 'Jane Smith', 'Bob Wilson'];
    const messages = [
        'Hi! I received your email. When can we chat?',
        'Thanks for the quote! I have a few questions.',
        'Is the project still on track for next week?',
        'Got it, thanks!'
    ];

    const phone = phones[Math.floor(Math.random() * phones.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    let conv = smsSystem.conversations.find(c => c.phone === phone);
    if (!conv) {
        conv = { id: Date.now(), phone: phone, contactName: name, messages: [], lastMessage: '', lastMessageAt: '' };
        smsSystem.conversations.push(conv);
    }

    conv.messages.push({ direction: 'inbound', content: message, timestamp: new Date().toISOString() });
    conv.lastMessage = message;
    conv.lastMessageAt = new Date().toISOString();

    saveSms();
    loadAdminSmsPanel();
    showNotification('Test SMS received from ' + name, 'info');
}

function addSmsTemplate() {
    const name = prompt('Template name:');
    if (!name) return;

    const message = prompt('Message (use {name}, {invoice}, {time} for placeholders):');
    if (!message) return;

    smsSystem.templates.push({ id: Date.now(), name: name, message: message });
    saveSms();
    loadAdminSmsPanel();
}

function useSmsTemplate(id) {
    const template = smsSystem.templates.find(t => t.id === id);
    if (template) {
        document.getElementById('smsMessage').value = template.message;
        updateSmsCharCount();
    }
}

function openSmsConversation(phone) {
    // Populate the phone number field
    document.getElementById('smsTo').value = phone;
    document.getElementById('smsTo').focus();

    // Find conversation and show messages
    const conv = smsSystem.conversations.find(c => c.phone === phone);
    if (conv && conv.messages && conv.messages.length > 0) {
        const messagesHtml = conv.messages.slice(-10).map(m => `
<div style="display: flex; justify-content: ${m.direction === 'outbound' ? 'flex-end' : 'flex-start'}; margin-bottom: 8px;">
<div style="max-width: 70%; padding: 10px 14px; border-radius: 12px; background: ${m.direction === 'outbound' ? 'var(--red)' : 'rgba(255,255,255,0.1)'}; color: #fff;">
<p style="margin: 0; font-size: 14px;">${m.content}</p>
<span style="font-size: 10px; opacity: 0.6;">${new Date(m.timestamp).toLocaleString()}</span>
</div>
</div>
        `).join('');

        alert(`Conversation with ${conv.contactName || phone}:\n\n${conv.messages.slice(-5).map(m => `${m.direction === 'outbound' ? 'You' : 'Them'}: ${m.content}`).join('\n')}`);
    }

    // Scroll to send section
    document.getElementById('smsMessage').focus();
}


// ==================== BLOG PANEL (STUB - was never defined in monolith) ====================
function loadAdminBlogPanel() {
    const panel = document.getElementById('adminBlogPanel');
    if (panel) {
        panel.innerHTML = `
<div style="padding: 40px; text-align: center;">
    <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">Blog Management</h2>
    <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">Blog management panel coming soon. Posts are currently managed via static HTML files in /blog/.</p>
    <a href="/blog/" target="_blank" class="btn-cta">View Blog →</a>
</div>`;
    }
}
