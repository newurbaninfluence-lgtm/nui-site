function loadPortalView() {
    document.getElementById('portalView').innerHTML = portalStyles + `
<div id="portalLogin" class="portal-login">
<div class="login-box">
<div style="text-align: center; margin-bottom: 32px;">
<img loading="lazy" src="icons/icon-192.png" alt="NUI" style="height: 60px; margin-bottom: 16px;">
<h2 style="font-size: 24px; margin-bottom: 8px;">Brand Portal</h2>
<p style="color: var(--gray); font-size: 14px;">Access your brand assets & orders</p>
</div>
<div class="login-tabs">
<button onclick="setLoginType('client')" id="clientTab" class="login-tab active">Client</button>
<button onclick="setLoginType('designer')" id="designerTab" class="login-tab">Designer</button>
<button onclick="setLoginType('admin')" id="adminTab" class="login-tab">Admin</button>
</div>
<form onsubmit="event.preventDefault(); handlePortalLogin(event);" action="javascript:void(0)">
<div class="form-group"><label class="form-label">Email</label><input type="email" id="portalEmail" class="form-input" placeholder="you@example.com" required></div>
<div class="form-group">
<label class="form-label">Password</label>
<input type="password" id="portalPassword" class="form-input" placeholder="••••••••" required>
<a onclick="forgotPassword()" style="display: block; text-align: right; margin-top: 8px; color: var(--red); font-size: 12px; cursor: pointer;">Forgot Password?</a>
</div>
<button type="submit" class="btn-cta" style="width: 100%; justify-content: center;">Sign In</button>
</form>

<div style="display: flex; align-items: center; margin: 24px 0; gap: 16px;">
<div style="flex: 1; height: 1px; background: #333;"></div>
<span style="color: #666; font-size: 12px;">or continue with</span>
<div style="flex: 1; height: 1px; background: #333;"></div>
</div>

                <!-- Social Login Buttons -->
<div style="display: flex; flex-direction: column; gap: 12px;">
<button onclick="googleSignIn()" style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 12px 16px; background: #fff; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Continue with Google
</button>
</div>

                <!-- Staff Demo Credentials (hidden for clients) -->
<div id="staffDemoSection" style="display: none; margin-top: 24px;">
<p style="text-align: center; color: var(--gray); font-size: 11px; margin-bottom: 12px;">Staff Demo Credentials:<br>Designer: faren@nui.com / designer123<br>Admin: admin@nui.com / admin123</p>
<div style="display: flex; flex-direction: column; gap: 8px;">
<button onclick="quickAdminAccess()" style="padding: 12px 16px; background: linear-gradient(135deg, #e11d48, #be185d); border: none; color: #fff; cursor: pointer; border-radius: 8px; font-size: 14px; font-weight: 600; width: 100%;">⚡ Quick Admin Access (Demo)</button>
<button onclick="quickDesignerAccess()" style="padding: 10px 12px; background: #3b82f6; border: none; color: #fff; cursor: pointer; border-radius: 6px; font-size: 12px; font-weight: 500;">👨‍🎨 Quick Designer Access</button>
</div>
<button onclick="resetAllData()" style="margin-top: 12px; padding: 8px 16px; background: transparent; border: 1px solid #444; color: #888; cursor: pointer; border-radius: 4px; font-size: 11px; width: 100%;">🔄 Reset All Data</button>
</div>
</div>
</div>
<div id="adminDashboard" style="display: none;">
<header class="admin-header" style="background: var(--admin-header); border-bottom: 1px solid var(--admin-border);">
<div style="display: flex; align-items: center; gap: 16px;">
<img loading="lazy" id="adminHeaderLogo" src="icons/icon-192.png" alt="NUI" style="height: 32px;">
<span style="font-weight: 600; color: var(--admin-text);" id="adminHeaderTitle">Admin Dashboard</span>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
<span id="adminUserInfo" style="font-size: 13px; color: var(--admin-text-muted);"></span>
<button class="theme-toggle-btn" onclick="toggleTheme()" style="padding: 8px 16px; background: var(--admin-card); border: 1px solid var(--admin-border); color: var(--admin-text); cursor: pointer; border-radius: 4px; font-family: inherit; font-weight: 500;">☀️ Light</button>
<button onclick="portalLogout()" style="padding: 8px 16px; background: var(--red); border: none; color: #fff; cursor: pointer; border-radius: 4px; font-family: inherit; font-weight: 500;">Logout</button>
</div>
</header>
<div class="admin-container">
<aside class="admin-sidebar" id="adminSidebar" style="background: var(--admin-sidebar); border-color: var(--admin-border);">
<nav class="admin-nav" id="adminNav">
<div class="admin-nav-group">
<span class="admin-nav-label" style="color: var(--admin-text-muted);">OVERVIEW</span>
<a onclick="showAdminPanel('dashboard')" class="admin-nav-link active" data-panel="dashboard">📊 Dashboard</a>
<a onclick="showAdminPanel('calendar')" class="admin-nav-link" data-panel="calendar">📅 Calendar</a>
<a onclick="showAdminPanel('analytics')" class="admin-nav-link" data-panel="analytics">📈 Site Analytics</a>
<a onclick="showAdminPanel('reviews')" class="admin-nav-link" data-panel="reviews">⭐ Google Reviews</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">CRM & SALES</span>
<a onclick="showAdminPanel('crm')" class="admin-nav-link" data-panel="crm">💼 CRM Pipeline</a>
<a onclick="showAdminPanel('clients')" class="admin-nav-link" data-panel="clients">👥 Clients</a>
<a onclick="showAdminPanel('leads')" class="admin-nav-link" data-panel="leads">🎯 Leads</a>
<a onclick="showAdminPanel('submissions')" class="admin-nav-link" data-panel="submissions">📩 Submissions</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">PROJECTS</span>
<a onclick="showAdminPanel('projects')" class="admin-nav-link" data-panel="projects">📂 Project Tracker</a>
<a onclick="showAdminPanel('orders')" class="admin-nav-link" data-panel="orders">📋 Orders</a>
<a onclick="showAdminPanel('proofs')" class="admin-nav-link" data-panel="proofs">✅ Proof Approval</a>
<a onclick="showAdminPanel('brandguide')" class="admin-nav-link" data-panel="brandguide">📘 Brand Guide</a>
<a onclick="showAdminPanel('delivery')" class="admin-nav-link" data-panel="delivery">📦 Delivery</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">BILLING</span>
<a onclick="showAdminPanel('payments')" class="admin-nav-link" data-panel="payments">💳 Payments</a>
<a onclick="showAdminPanel('invoices')" class="admin-nav-link" data-panel="invoices">📄 Invoices</a>
<a onclick="showAdminPanel('payouts')" class="admin-nav-link" data-panel="payouts">💰 Payouts</a>
<a onclick="showAdminPanel('stripe')" class="admin-nav-link" data-panel="stripe">💎 Stripe</a>
<a onclick="showAdminPanel('subscriptions')" class="admin-nav-link" data-panel="subscriptions">🔄 Subscriptions</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">SEO & MARKETING</span>
<a onclick="showAdminPanel('seo')" class="admin-nav-link" data-panel="seo">🔍 SEO/AEO/GEO</a>
<a onclick="showAdminPanel('gmb')" class="admin-nav-link" data-panel="gmb">📍 Google Business</a>
<a onclick="showAdminPanel('blog')" class="admin-nav-link" data-panel="blog">📝 Blog Manager</a>
<a onclick="showAdminPanel('emailmarketing')" class="admin-nav-link" data-panel="emailmarketing">📧 Email Marketing</a>
<a onclick="showAdminPanel('loyalty')" class="admin-nav-link" data-panel="loyalty">🎁 Loyalty Program</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">COMMUNICATIONS</span>
<a onclick="showAdminPanel('communications')" class="admin-nav-link" data-panel="communications">💬 Inbox Hub</a>
<a onclick="showAdminPanel('socialdm')" class="admin-nav-link" data-panel="socialdm">📱 Social DMs</a>
<a onclick="showAdminPanel('sms')" class="admin-nav-link" data-panel="sms">📲 SMS (OpenPhone)</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">CONTENT</span>
<a onclick="showAdminPanel('siteimages')" class="admin-nav-link" data-panel="siteimages">🖼️ Site Images</a>
<a onclick="showAdminPanel('assets')" class="admin-nav-link" data-panel="assets">📁 Client Assets</a>
<a onclick="showAdminPanel('portfolio')" class="admin-nav-link" data-panel="portfolio">🎨 Portfolio</a>
<a onclick="showAdminPanel('moodboard')" class="admin-nav-link" data-panel="moodboard">🎨 Moodboards</a>
<a onclick="showAdminPanel('about')" class="admin-nav-link" data-panel="about">📄 About Page</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">TEAM</span>
<a onclick="showAdminPanel('designers')" class="admin-nav-link" data-panel="designers">🎨 Designers</a>
<a onclick="showAdminPanel('newclient')" class="admin-nav-link" data-panel="newclient">➕ New Client</a>
<a onclick="showAdminPanel('neworder')" class="admin-nav-link" data-panel="neworder">➕ New Order</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">INTEGRATIONS</span>
<a onclick="showAdminPanel('integrations')" class="admin-nav-link" data-panel="integrations">🔗 All Integrations</a>
</div>
<div class="admin-nav-group">
<span class="admin-nav-label">SETTINGS</span>
<a onclick="showAdminPanel('usermanagement')" class="admin-nav-link" data-panel="usermanagement">🔐 User Management</a>
</div>
</nav>
</aside>
<main class="admin-main" style="background: var(--admin-bg);">
<div id="adminDashboardPanel" class="admin-panel active"></div>
<div id="adminCalendarPanel" class="admin-panel"></div>
<div id="adminAnalyticsPanel" class="admin-panel"></div>
<div id="adminReviewsPanel" class="admin-panel"></div>
<div id="adminCrmPanel" class="admin-panel"></div>
<div id="adminClientsPanel" class="admin-panel"></div>
<div id="adminOrdersPanel" class="admin-panel"></div>
<div id="adminNewOrderPanel" class="admin-panel"></div>
<div id="adminLeadsPanel" class="admin-panel"></div>
<div id="adminSubmissionsPanel" class="admin-panel"></div>
<div id="adminProjectsPanel" class="admin-panel"></div>
<div id="adminProofsPanel" class="admin-panel"></div>
<div id="adminBrandguidePanel" class="admin-panel"></div>
<div id="adminDeliveryPanel" class="admin-panel"></div>
<div id="adminPaymentsPanel" class="admin-panel"></div>
<div id="adminInvoicesPanel" class="admin-panel"></div>
<div id="adminPayoutsPanel" class="admin-panel"></div>
<div id="adminStripePanel" class="admin-panel"></div>
<div id="adminSeoPanel" class="admin-panel"></div>
<div id="adminGmbPanel" class="admin-panel"></div>
<div id="adminBlogPanel" class="admin-panel"></div>
<div id="adminEmailmarketingPanel" class="admin-panel"></div>
<div id="adminLoyaltyPanel" class="admin-panel"></div>
<div id="adminCommunicationsPanel" class="admin-panel"></div>
<div id="adminSocialdmPanel" class="admin-panel"></div>
<div id="adminSmsPanel" class="admin-panel"></div>
<div id="adminSiteimagesPanel" class="admin-panel"></div>
<div id="adminNewclientPanel" class="admin-panel"></div>
<div id="adminAssetsPanel" class="admin-panel"></div>
<div id="adminPortfolioPanel" class="admin-panel"></div>
<div id="adminMoodboardPanel" class="admin-panel"></div>
<div id="adminAboutPanel" class="admin-panel"></div>
<div id="adminDesignersPanel" class="admin-panel"></div>
<div id="adminIntegrationsPanel" class="admin-panel"></div>
<div id="adminUsermanagementPanel" class="admin-panel"></div>
<div id="adminSubscriptionsPanel" class="admin-panel"></div>
</main>
</div>
</div>
<div id="clientPortal" style="display: none; min-height: 100vh; background: #000; color: #fff;">
<header style="background: #000; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 76px; left: 0; right: 0; z-index: 100;">
<span id="clientPortalName" style="font-weight: 600;"></span>
<button onclick="portalLogout()" style="padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; cursor: pointer; border-radius: 4px;">Sign Out</button>
</header>
<div id="clientPortalContent" style="padding-top: 132px;"></div>
</div>
<div id="invoiceModal" class="modal-overlay">
<div class="modal">
<div class="modal-header"><h3 class="modal-title">Invoice Preview</h3><button class="modal-close" onclick="closeInvoiceModal()">×</button></div>
<div class="modal-body" id="invoiceContent"></div>
<div class="modal-footer"><button class="btn-cta" onclick="printInvoice()">Print Invoice</button></div>
</div>
</div>

        <!-- Designer NDA Modal -->
<div id="ndaModal" class="modal-overlay" style="display: none;">
<div class="modal" style="max-width: 700px;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title">🔒 Non-Disclosure Agreement</h3>
</div>
<div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 24px;">
<div style="background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
<strong style="color: var(--red);">⚠️ IMPORTANT:</strong> You must read and agree to this NDA before accessing client projects.
</div>
<h4 style="margin-bottom: 12px;">DESIGNER NON-DISCLOSURE & NON-SOLICITATION AGREEMENT</h4>
<p style="color: #888; font-size: 13px; line-height: 1.7; margin-bottom: 16px;">This Agreement is entered into between New Urban Influence ("Company") and the undersigned Designer ("Contractor").</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">1. CONFIDENTIAL INFORMATION</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Contractor agrees to hold in strict confidence all client information, project details, business strategies, pricing, and any other proprietary information disclosed during the course of work.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">2. NON-SOLICITATION OF CLIENTS</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;"><strong>Contractor agrees NOT to:</strong></p>
<ul style="color: #888; font-size: 13px; line-height: 1.7; margin-left: 20px;">
<li>Contact, solicit, or communicate with any Company client directly</li>
<li>Send emails, calls, texts, or DMs to clients or their associated venues/businesses</li>
<li>Accept direct work from Company clients for a period of 2 years after project completion</li>
<li>Share client contact information with any third party</li>
</ul>

<h5 style="margin: 16px 0 8px; color: var(--red);">3. NON-COMPETE</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Contractor shall not offer services identical or substantially similar to those provided to Company clients for 12 months after the termination of this agreement.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">4. WORK PRODUCT</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">All work created for Company clients is the exclusive property of New Urban Influence and its clients. Contractor may not use, display, or claim ownership of work without written consent.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">5. BREACH & PENALTIES</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Violation of this agreement will result in immediate termination, forfeiture of unpaid earnings, and may result in legal action including damages of no less than $25,000 per incident.</p>

<div style="background: #111; border-radius: 8px; padding: 16px; margin-top: 24px;">
<label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer;">
<input type="checkbox" id="ndaAgree" style="margin-top: 4px; width: 20px; height: 20px; accent-color: var(--red);">
<span style="font-size: 13px; line-height: 1.6;">I have read, understand, and agree to all terms of this Non-Disclosure Agreement. I understand that violation of these terms will result in immediate termination and potential legal action.</span>
</label>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 12px;">
<button onclick="declineNDA()" style="flex: 1; padding: 14px; background: #333; border: none; color: #fff; cursor: pointer; border-radius: 6px;">Decline</button>
<button onclick="acceptNDA()" id="ndaAcceptBtn" style="flex: 2; padding: 14px; background: var(--red); border: none; color: #fff; cursor: pointer; border-radius: 6px; font-weight: 600; opacity: 0.5;" disabled>Accept & Continue</button>
</div>
</div>
</div>

        <!-- Client Terms & Conditions Modal -->
<div id="termsModal" class="modal-overlay" style="display: none;">
<div class="modal" style="max-width: 700px;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title">📋 Terms & Conditions</h3>
</div>
<div class="modal-body" style="max-height: 60vh; overflow-y: auto; padding: 24px;">
<div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
<strong style="color: #3b82f6;">📝 Please Review:</strong> These terms apply to your project with New Urban Influence.
</div>

<h4 style="margin-bottom: 12px;">SERVICE AGREEMENT TERMS</h4>

<h5 style="margin: 16px 0 8px; color: var(--red);">1. PROJECT TIMELINES</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">All delivery dates and timelines provided are <strong>estimates only</strong> and not guaranteed. While we strive to meet all deadlines, project completion depends on timely client feedback, asset delivery, and approval responses. Delays caused by client response times will extend the project timeline accordingly.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">2. REVISIONS & CHANGES</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Each package includes a specified number of revision rounds. Additional revisions beyond the included amount will be billed at our standard hourly rate. Major scope changes after project start may require a new quote.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">3. PAYMENT TERMS</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">A 50% deposit is required to begin work. The remaining balance is due upon project completion, prior to delivery of final files. Invoices not paid within 14 days may incur a 5% late fee.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">4. REFUND POLICY</h5>
<div style="background: rgba(255,0,0,0.1); border-left: 4px solid var(--red); padding: 12px 16px; margin: 12px 0;">
<p style="color: #fff; font-size: 13px; line-height: 1.7; margin: 0;"><strong>NO REFUNDS</strong> will be issued once work has commenced. By paying your invoice, you acknowledge that creative work has begun and the deposit is non-refundable. If you cancel before work begins, a full refund minus a 10% administrative fee will be issued.</p>
</div>

<h5 style="margin: 16px 0 8px; color: var(--red);">5. CLIENT RESPONSIBILITIES</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Client agrees to provide all necessary materials (logos, images, content, feedback) in a timely manner. Failure to respond within 7 days may result in project delays or the need to reschedule.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">6. INTELLECTUAL PROPERTY</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">Upon full payment, client receives full ownership and rights to all final deliverables. New Urban Influence retains the right to display work in portfolios and marketing materials unless otherwise agreed in writing.</p>

<h5 style="margin: 16px 0 8px; color: var(--red);">7. LIMITATION OF LIABILITY</h5>
<p style="color: #888; font-size: 13px; line-height: 1.7;">New Urban Influence's liability is limited to the amount paid for services. We are not liable for any indirect, consequential, or incidental damages arising from the use of our services or deliverables.</p>

<div style="background: #111; border-radius: 8px; padding: 16px; margin-top: 24px;">
<label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer;">
<input type="checkbox" id="termsAgree" style="margin-top: 4px; width: 20px; height: 20px; accent-color: var(--red);">
<span style="font-size: 13px; line-height: 1.6;">I have read, understand, and agree to these Terms & Conditions. I understand that timelines are estimates and that <strong>no refunds</strong> are available once work has started.</span>
</label>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 12px;">
<button onclick="closeTermsModal()" style="flex: 1; padding: 14px; background: #333; border: none; color: #fff; cursor: pointer; border-radius: 6px;">Cancel</button>
<button onclick="acceptTerms()" id="termsAcceptBtn" style="flex: 2; padding: 14px; background: var(--red); border: none; color: #fff; cursor: pointer; border-radius: 6px; font-weight: 600; opacity: 0.5;" disabled>Accept & Proceed to Payment</button>
</div>
</div>
</div>

        <!-- Meeting Calendar Modal -->
<div id="meetingModal" class="modal-overlay" style="display: none;">
<div class="modal" style="max-width: 600px;">
<div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
<h3 class="modal-title">📅 Schedule a Meeting</h3>
<button class="modal-close" onclick="closeMeetingModal()">×</button>
</div>
<div class="modal-body" style="padding: 24px;">
<p style="color: #888; margin-bottom: 24px;">Select your preferred meeting type, date, and time. Meetings are available Monday, Wednesday, and Friday from 10am to 4pm.</p>

<div style="margin-bottom: 20px;">
<label style="font-weight: 600; display: block; margin-bottom: 8px;">Meeting Type</label>
<div style="display: flex; gap: 12px;">
<label style="flex: 1; background: #111; border: 2px solid #333; border-radius: 8px; padding: 16px; cursor: pointer; text-align: center; transition: all 0.2s;" onclick="selectMeetingType('zoom')">
<input type="radio" name="meetingType" value="zoom" style="display: none;">
<div style="font-size: 24px; margin-bottom: 8px;">💻</div>
<div style="font-weight: 600;">Zoom Call</div>
<div style="font-size: 12px; color: #888;">Video meeting</div>
</label>
<label style="flex: 1; background: #111; border: 2px solid #333; border-radius: 8px; padding: 16px; cursor: pointer; text-align: center; transition: all 0.2s;" onclick="selectMeetingType('phone')">
<input type="radio" name="meetingType" value="phone" style="display: none;">
<div style="font-size: 24px; margin-bottom: 8px;">📞</div>
<div style="font-weight: 600;">Phone Call</div>
<div style="font-size: 12px; color: #888;">Voice only</div>
</label>
</div>
</div>

<div style="margin-bottom: 20px;">
<label style="font-weight: 600; display: block; margin-bottom: 8px;">Select Date</label>
<div id="calendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: #111; border-radius: 8px; padding: 12px;"></div>
</div>

<div style="margin-bottom: 20px;">
<label style="font-weight: 600; display: block; margin-bottom: 8px;">Select Time</label>
<div id="timeSlots" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"></div>
</div>

<div id="selectedMeetingInfo" style="display: none; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 8px; padding: 16px; margin-top: 16px;">
<div style="font-weight: 600; color: #10b981; margin-bottom: 8px;">✓ Meeting Selected</div>
<div id="meetingDetails" style="color: #888; font-size: 14px;"></div>
</div>
</div>
<div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
<button onclick="confirmMeeting()" id="confirmMeetingBtn" style="width: 100%; padding: 14px; background: var(--red); border: none; color: #fff; cursor: pointer; border-radius: 6px; font-weight: 600; opacity: 0.5;" disabled>Confirm Meeting</button>
</div>
</div>
</div>
    `;
    // Reset state and show login
    currentUser = null;
    loginType = 'client';
    setTimeout(() => {
        const loginEl = document.getElementById('portalLogin');
        const adminEl = document.getElementById('adminDashboard');
        const clientEl = document.getElementById('clientPortal');
        if (loginEl) loginEl.style.display = 'flex';
        if (adminEl) adminEl.style.display = 'none';
        if (clientEl) clientEl.style.display = 'none';
    }, 10);
}

function setLoginType(type) {
    loginType = type;
    document.getElementById('clientTab')?.classList.toggle('active', type === 'client');
    document.getElementById('designerTab')?.classList.toggle('active', type === 'designer');
    document.getElementById('managerTab')?.classList.toggle('active', type === 'manager');
    document.getElementById('adminTab')?.classList.toggle('active', type === 'admin');
}

// DEMO MODE - Password checks disabled
const DEMO_MODE = false;

// ==================== NDA & TERMS FUNCTIONS ====================
let pendingDesignerLogin = null;
let pendingPaymentInvoice = null;
let selectedMeeting = { type: null, date: null, time: null };

// NDA Modal Functions
function showNDAModal(designerData) {
    pendingDesignerLogin = designerData;
    document.getElementById('ndaModal').style.display = 'flex';
    document.getElementById('ndaAgree').checked = false;
    document.getElementById('ndaAcceptBtn').disabled = true;
    document.getElementById('ndaAcceptBtn').style.opacity = '0.5';
    // Add change listener
    document.getElementById('ndaAgree').addEventListener('change', function() {
        document.getElementById('ndaAcceptBtn').disabled = !this.checked;
        document.getElementById('ndaAcceptBtn').style.opacity = this.checked ? '1' : '0.5';
    });
}

function acceptNDA() {
    if (!document.getElementById('ndaAgree').checked) return;
    // Mark designer as NDA signed
    const designers = JSON.parse(localStorage.getItem('nui_designers') || '[]');
    const designerIdx = designers.findIndex(d => d.email === pendingDesignerLogin?.email);
    if (designerIdx >= 0) {
        designers[designerIdx].ndaSigned = true;
        designers[designerIdx].ndaSignedDate = new Date().toISOString();
        localStorage.setItem('nui_designers', JSON.stringify(designers));
    }
    document.getElementById('ndaModal').style.display = 'none';
    // Continue with designer login
    if (pendingDesignerLogin) {
        completeDesignerLogin(pendingDesignerLogin);
    }
}

function declineNDA() {
    document.getElementById('ndaModal').style.display = 'none';
    alert('You must accept the NDA to access designer projects. Please contact admin@nui.com if you have questions.');
    pendingDesignerLogin = null;
}

// Terms Modal Functions
function showTermsModal(invoiceData) {
    pendingPaymentInvoice = invoiceData;
    document.getElementById('termsModal').style.display = 'flex';
    document.getElementById('termsAgree').checked = false;
    document.getElementById('termsAcceptBtn').disabled = true;
    document.getElementById('termsAcceptBtn').style.opacity = '0.5';
    // Add change listener
    document.getElementById('termsAgree').addEventListener('change', function() {
        document.getElementById('termsAcceptBtn').disabled = !this.checked;
        document.getElementById('termsAcceptBtn').style.opacity = this.checked ? '1' : '0.5';
    });
}

function closeTermsModal() {
    document.getElementById('termsModal').style.display = 'none';
    pendingPaymentInvoice = null;
}

function acceptTerms() {
    if (!document.getElementById('termsAgree').checked) return;
    document.getElementById('termsModal').style.display = 'none';
    // Continue with payment
    if (pendingPaymentInvoice && typeof processPaymentAfterTerms === 'function') {
        processPaymentAfterTerms(pendingPaymentInvoice);
    }
    pendingPaymentInvoice = null;
}

// Meeting Calendar Functions
function openMeetingModal() {
    selectedMeeting = { type: null, date: null, time: null };
    document.getElementById('meetingModal').style.display = 'flex';
    renderCalendar();
    renderTimeSlots();
    updateMeetingBtn();
}

function closeMeetingModal() {
    document.getElementById('meetingModal').style.display = 'none';
}

function selectMeetingType(type) {
    selectedMeeting.type = type;
    document.querySelectorAll('[name="meetingType"]').forEach(input => {
        const label = input.closest('label');
        if (input.value === type) {
            label.style.borderColor = 'var(--red)';
            label.style.background = 'rgba(255,0,0,0.1)';
        } else {
            label.style.borderColor = '#333';
            label.style.background = '#111';
        }
    });
    updateMeetingBtn();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Allowed days: Mon (1), Wed (3), Fri (5)
    const allowedDays = [1, 3, 5];

    let html = dayNames.map(d => `<div style="text-align: center; font-size: 11px; color: #666; padding: 4px;">${d}</div>`).join('');

    // Get next 4 weeks
    const dates = [];
    for (let i = 0; i < 28; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }

    // Pad first week
    const firstDay = dates[0].getDay();
    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }

    dates.forEach(date => {
        const dayNum = date.getDay();
        const isAllowed = allowedDays.includes(dayNum) && date > today;
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = selectedMeeting.date === dateStr;

        html += `<div onclick="${isAllowed ? `selectDate('${dateStr}')` : ''}" style="
            text-align: center;
            padding: 8px 4px;
            border-radius: 4px;
            cursor: ${isAllowed ? 'pointer' : 'not-allowed'};
            background: ${isSelected ? 'var(--red)' : isAllowed ? '#1a1a1a' : 'transparent'};
            color: ${isSelected ? '#fff' : isAllowed ? '#fff' : '#444'};
            font-size: 13px;
            transition: all 0.2s;
        " ${isAllowed ? 'onmouseover="this.style.background=\'' + (isSelected ? 'var(--red)' : '#333') + '\'"' : ''} ${isAllowed ? 'onmouseout="this.style.background=\'' + (isSelected ? 'var(--red)' : '#1a1a1a') + '\'"' : ''}>
            ${date.getDate()}
</div>`;
    });

    grid.innerHTML = html;
}

function selectDate(dateStr) {
    selectedMeeting.date = dateStr;
    selectedMeeting.time = null; // reset time when date changes
    renderCalendar();
    // Check availability from server
    loadAvailableSlots(dateStr);
    updateMeetingBtn();
}

function renderTimeSlots() {
    const container = document.getElementById('timeSlots');
    const times = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    const bookedSlots = window._bookedSlots || [];
    container.innerHTML = times.map(time => {
        const isBooked = bookedSlots.includes(time);
        const isSelected = selectedMeeting.time === time;
        return `
<button onclick="${isBooked ? '' : `selectTime('${time}')`}" style="
            padding: 12px;
            background: ${isSelected ? 'var(--red)' : isBooked ? '#1a1a1a' : '#111'};
            border: 1px solid ${isSelected ? 'var(--red)' : isBooked ? '#222' : '#333'};
            color: ${isBooked ? '#555' : '#fff'};
            border-radius: 6px;
            cursor: ${isBooked ? 'not-allowed' : 'pointer'};
            font-size: 13px;
            transition: all 0.2s;
            ${isBooked ? 'text-decoration: line-through;' : ''}
        ">${time}${isBooked ? ' ✗' : ''}</button>`;
    }).join('');
}

function selectTime(time) {
    selectedMeeting.time = time;
    renderTimeSlots();
    updateMeetingBtn();
}

function updateMeetingBtn() {
    const btn = document.getElementById('confirmMeetingBtn');
    const infoDiv = document.getElementById('selectedMeetingInfo');
    const detailsDiv = document.getElementById('meetingDetails');

    const isComplete = selectedMeeting.type && selectedMeeting.date && selectedMeeting.time;
    btn.disabled = !isComplete;
    btn.style.opacity = isComplete ? '1' : '0.5';

    if (isComplete) {
        infoDiv.style.display = 'block';
        const dateObj = new Date(selectedMeeting.date);
        const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        detailsDiv.innerHTML = `
<strong>${selectedMeeting.type === 'zoom' ? '💻 Zoom Call' : '📞 Phone Call'}</strong><br>
            ${dateFormatted} at ${selectedMeeting.time}
        `;
    } else {
        infoDiv.style.display = 'none';
    }
}

async function confirmMeeting() {
    if (!selectedMeeting.type || !selectedMeeting.date || !selectedMeeting.time) return;

    const btn = document.getElementById('confirmMeetingBtn');
    btn.disabled = true;
    btn.textContent = 'Booking...';

    const meetingData = {
        clientId: currentUser?.id || null,
        clientEmail: currentUser?.email || null,
        clientName: currentUser?.name || currentUser?.email || null,
        clientPhone: currentUser?.phone || null,
        type: selectedMeeting.type,
        date: selectedMeeting.date,
        time: selectedMeeting.time,
        notes: '',
        intakeId: intakeData?.submissionId || null
    };

    // Save to localStorage first (immediate feedback)
    const meetings = JSON.parse(localStorage.getItem('nui_meetings') || '[]');
    const localMeeting = { id: Date.now(), ...meetingData, status: 'scheduled', createdAt: new Date().toISOString() };
    meetings.push(localMeeting);
    localStorage.setItem('nui_meetings', JSON.stringify(meetings));

    // Try to save to Supabase + trigger calendar sync + confirmation email
    let serverResult = null;
    try {
        const resp = await fetch('/.netlify/functions/save-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meetingData)
        });
        serverResult = await resp.json();

        if (resp.status === 409) {
            // Time slot conflict — remove local entry and alert
            meetings.pop();
            localStorage.setItem('nui_meetings', JSON.stringify(meetings));
            btn.disabled = false;
            btn.textContent = 'Confirm Meeting';
            alert(`⚠️ This time slot was just booked by someone else.\n\n${serverResult.message}\n\nPlease choose a different time.`);
            // Refresh available slots
            if (selectedMeeting.date) await loadAvailableSlots(selectedMeeting.date);
            return;
        }

        if (!resp.ok) throw new Error(serverResult.error || 'Server error');

        // Update local entry with server ID
        if (serverResult.meeting?.id) {
            meetings[meetings.length - 1].serverId = serverResult.meeting.id;
            localStorage.setItem('nui_meetings', JSON.stringify(meetings));
        }

        console.log('✅ Meeting saved to server:', serverResult);
    } catch (err) {
        console.log('Server save failed (meeting saved locally):', err.message);
    }

    closeMeetingModal();

    const dateObj = new Date(selectedMeeting.date);
    const dateFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const emailNote = serverResult?.emailSent
        ? '\n\n📧 A confirmation email has been sent!'
        : '\n\nYou\'ll receive a confirmation email with meeting details shortly.';
    const calNote = serverResult?.calendarEventId
        ? '\n📅 Added to calendar automatically.' : '';
    alert(`✅ Meeting Confirmed!\n\n${selectedMeeting.type === 'zoom' ? '💻 Zoom Call' : '📞 Phone Call'}\n${dateFormatted} at ${selectedMeeting.time}${emailNote}${calNote}`);

    // ═══════════════════════════════════════════
    // AUTO-WORKFLOW: Triggered after meeting booking
    // ═══════════════════════════════════════════
    try {
        const meetingClientEmail = meetingData.clientEmail;
        const meetingClientName = meetingData.clientName || 'Valued Client';
        const meetingType = meetingData.type === 'zoom' ? 'Zoom Call' : 'Phone Call';

        // Check if this is a new/prospective client (not already in system)
        const existingClient = clients.find(c => c.email === meetingClientEmail);

        if (meetingClientEmail) {
            // STEP 1: Welcome Email (if new client or client without welcome email)
            if (!existingClient || existingClient.onboardingStatus === 'new' || !existingClient.onboardingStatus) {
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: meetingClientEmail,
                        subject: `Welcome to New Urban Influence, ${meetingClientName}! 🎨`,
                        html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 40px; text-align: center;">
<h2 style="margin: 0; font-size: 28px; color: #fff;">Welcome to NUI</h2>
<p style="color: #fca5a5; margin-top: 8px;">Detroit's Premier Creative Agency</p>
</div>
<div style="padding: 32px;">
<p>Hi ${meetingClientName},</p>
<p>Thank you for booking a <strong>${meetingType}</strong> with us on <strong>${new Date(meetingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>${meetingData.time}</strong>!</p>
<p>We're excited to learn about your brand vision and how we can bring it to life.</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 24px 0;">
<h3 style="color: #dc2626; margin-top: 0;">What's Next:</h3>
<p>✅ Meeting confirmed</p>
<p>📋 Complete our quick service questionnaire (sent separately)</p>
<p>💰 Receive a custom pricing package</p>
<p>🎨 Start creating your brand identity</p>
</div>
<p>If you have any questions before our meeting, reply to this email or visit our website.</p>
<p style="color: #888; margin-top: 24px;">— The NUI Team</p>
</div>
<div style="background: #111; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI • newurbaninfluence.com</p>
</div>
</div>`
                    })
                });
                console.log('✅ Auto-workflow: Welcome email sent');
                if (existingClient) { existingClient.onboardingStatus = 'welcome_sent'; saveClients(); }
            }

            // STEP 2: Service Questionnaire Email
            await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: meetingClientEmail,
                    subject: `Quick Questionnaire Before Our Meeting — NUI`,
                    html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
<div style="background: #111; padding: 32px; text-align: center; border-bottom: 1px solid #222;">
<h2 style="margin: 0; color: #fff;">📋 Service Questionnaire</h2>
<p style="color: #888; margin-top: 8px;">Help us prepare for your consultation</p>
</div>
<div style="padding: 32px;">
<p>Hi ${meetingClientName},</p>
<p>To make the most of our upcoming meeting, please take a moment to fill out our brief intake form. This helps us understand your brand needs and come prepared with ideas.</p>
<div style="text-align: center; margin: 32px 0;">
<a href="https://newurbaninfluence.com/#intake" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Questionnaire →</a>
</div>
<p style="color: #888; font-size: 14px;">This takes about 3-5 minutes and covers your brand goals, target audience, style preferences, and project timeline.</p>
<p style="color: #888; margin-top: 24px;">— The NUI Team</p>
</div>
</div>`
                })
            });
            console.log('✅ Auto-workflow: Questionnaire email sent');
            if (existingClient) { existingClient.onboardingStatus = 'questionnaire_sent'; saveClients(); }

            // STEP 3: Auto-generate initial pricing package based on meeting type
            if (existingClient) {
                const pricingPackage = servicePackages[0]; // Default to Brand Kit starter
                const pricingInvoice = {
                    id: Date.now() + 2,
                    invoiceNumber: 'EST-' + Date.now(),
                    clientId: existingClient.id,
                    clientName: existingClient.name,
                    clientEmail: existingClient.email,
                    type: 'estimate',
                    lineItems: [{ description: pricingPackage.name + ' (Estimated)', amount: pricingPackage.price }],
                    total: pricingPackage.price,
                    status: 'estimate',
                    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
                    createdAt: new Date().toISOString(),
                    notes: 'Auto-generated estimate after meeting booking. Final pricing will be confirmed after consultation.'
                };
                invoices.push(pricingInvoice);
                saveInvoices();
                console.log('✅ Auto-workflow: Pricing estimate created');

                // Send pricing email
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: meetingClientEmail,
                        subject: `Your Custom Pricing Package — New Urban Influence`,
                        html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
<div style="background: #111; padding: 32px; text-align: center; border-bottom: 1px solid #222;">
<h2 style="margin: 0; color: #fff;">💰 Your Pricing Estimate</h2>
</div>
<div style="padding: 32px;">
<p>Hi ${meetingClientName},</p>
<p>Based on your upcoming consultation, here's an initial pricing estimate for our services:</p>
<div style="background: #111; border: 2px solid #dc2626; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
<div style="font-size: 14px; color: #888; margin-bottom: 8px;">${pricingPackage.name}</div>
<div style="font-size: 36px; font-weight: 700; color: #dc2626;">$${pricingPackage.price.toLocaleString()}</div>
<div style="font-size: 13px; color: #888; margin-top: 8px;">Turnaround: ${pricingPackage.turnaround}</div>
</div>
<p style="color: #888; font-size: 14px;">This is a preliminary estimate. We'll discuss your specific needs during our meeting and provide a finalized quote afterward.</p>
<div style="text-align: center; margin: 24px 0;">
<a href="https://newurbaninfluence.com/#portal" style="display: inline-block; padding: 14px 32px; background: #10b981; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Client Portal →</a>
</div>
<p style="color: #888; margin-top: 24px;">— The NUI Team</p>
</div>
</div>`
                    })
                });
                console.log('✅ Auto-workflow: Pricing email sent');
            }

            // LOG TO CRM
            if (typeof communicationsHub !== 'undefined') {
                communicationsHub.inbox.unshift({
                    id: Date.now(),
                    type: 'auto-workflow',
                    subject: `Auto-Workflow Triggered: Meeting Booked by ${meetingClientName}`,
                    from: 'system',
                    to: meetingClientEmail,
                    body: `Auto-workflow started after meeting booking:\n1. Welcome email sent\n2. Questionnaire email sent\n${existingClient ? '3. Pricing estimate created & sent' : '3. No pricing (client not in system yet)'}`,
                    date: new Date().toISOString(),
                    read: false,
                    channel: 'auto-workflow'
                });
                saveCommunicationsHub();
            }
        }
    } catch (workflowErr) {
        console.log('Auto-workflow partial failure (meeting still booked):', workflowErr.message);
    }

    btn.disabled = false;
    btn.textContent = 'Confirm Meeting';
}

// Load available time slots from server (checks for conflicts)
async function loadAvailableSlots(dateStr) {
    try {
        const resp = await fetch(`/.netlify/functions/save-booking?date=${dateStr}`);
        if (resp.ok) {
            const data = await resp.json();
            window._bookedSlots = data.bookedTimes || [];
            renderTimeSlots(); // Re-render with booked slots disabled
        }
    } catch (err) {
        console.log('Could not check availability:', err.message);
        window._bookedSlots = [];
    }
}

// Complete designer login after NDA
function completeDesignerLogin(designer) {
    currentUser = { type: 'designer', ...designer };
    document.getElementById('portalLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadDesignerDashboard(designer);
    console.log('Designer login successful:', designer.name);
}

// Process payment after terms accepted
function processPaymentAfterTerms(invoiceData) {
    // Continue with original payment flow
    if (invoiceData && invoiceData.invoiceId) {
        // Mark terms as accepted
        const invoices = JSON.parse(localStorage.getItem('nui_invoices') || '[]');
        const idx = invoices.findIndex(inv => inv.id === invoiceData.invoiceId);
        if (idx >= 0) {
            invoices[idx].termsAccepted = true;
            invoices[idx].termsAcceptedDate = new Date().toISOString();
            localStorage.setItem('nui_invoices', JSON.stringify(invoices));
        }
        // Redirect to payment or process
        alert('✅ Terms accepted! Processing payment...');
        // Could integrate with Stripe here
    }
}

async function handlePortalLogin(e) {
    e.preventDefault();
    const emailEl = document.getElementById('portalEmail');
    const passwordEl = document.getElementById('portalPassword');
    if (!emailEl || !passwordEl) { alert('Form elements not found. Please refresh.'); return; }
    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value;
    console.log('Login attempt:', loginType, email);

    // ===== MASTER ADMIN — ALWAYS WORKS, BYPASSES EVERYTHING =====
    const masterPw = localStorage.getItem('nui_master_admin_pw') || 'newurban';
    if (email === 'newurbaninfluence@gmail.com' && password === masterPw) {
        currentUser = { type: 'admin', email: 'newurbaninfluence@gmail.com', name: 'Faren Young', isMasterAdmin: true };
        document.getElementById('portalLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        renderAdminSidebar();
        loadAdminDashboardPanel();
        console.log('Master admin login successful');
        return;
    }

    // ===== SUPABASE AUTH (PRIMARY) =====
    if (window.NuiAuth && NuiAuth.isAvailable()) {
        try {
            const authData = await NuiAuth.signIn(email, password);
            const authUser = authData.user;
            console.log('Supabase auth successful:', authUser.email);

            // Determine role from user_metadata or selected tab
            const role = authUser.user_metadata?.role || loginType;

            if (role === 'admin') {
                currentUser = { type: 'admin', email: authUser.email, name: authUser.user_metadata?.name || 'Admin', id: authUser.id };
                document.getElementById('portalLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                renderAdminSidebar();
                loadAdminDashboardPanel();
                console.log('Admin login successful (Supabase)');
            } else if (role === 'manager') {
                currentUser = { type: 'manager', email: authUser.email, name: authUser.user_metadata?.name || 'Manager', id: authUser.id, ...authUser.user_metadata };
                document.getElementById('portalLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                renderAdminSidebar();
                loadAdminDashboardPanel();
                console.log('Manager login successful (Supabase)');
            } else if (role === 'designer') {
                const meta = authUser.user_metadata || {};
                currentUser = { type: 'designer', email: authUser.email, name: meta.name || 'Designer', id: authUser.id, ...meta };
                if (!meta.ndaSigned) {
                    showNDAModal(currentUser);
                } else {
                    completeDesignerLogin(currentUser);
                }
            } else {
                // Client - look up in Supabase clients table
                let clientData = null;
                try {
                    const allClients = await NuiDB.clients.getAll();
                    clientData = allClients.find(c => c.email?.toLowerCase() === email);
                } catch (err) { console.warn('Client lookup failed:', err.message); }

                if (clientData) {
                    currentUser = { type: 'client', ...clientData };
                } else {
                    currentUser = { type: 'client', email: authUser.email, name: authUser.user_metadata?.name || email.split('@')[0], id: authUser.id };
                }
                document.getElementById('portalLogin').style.display = 'none';
                document.getElementById('clientPortal').style.display = 'block';
                showClientPortal(currentUser);
                console.log('Client login successful (Supabase):', currentUser.name);
            }
            return;
        } catch (authError) {
            console.warn('Supabase auth failed, falling through to localStorage auth:', authError.message);
            // Don't return — fall through to localStorage auth below
        }
    }

    // ===== FALLBACK: localStorage auth =====
    console.log('Using localStorage fallback auth');
    const managers = JSON.parse(localStorage.getItem('nui_managers')) || [];

    if (loginType === 'admin') {
        // Master admin - always works regardless of any settings
        const masterPw = localStorage.getItem('nui_master_admin_pw') || 'newurban';
        if (email === 'newurbaninfluence@gmail.com' && password === masterPw) {
            currentUser = { type: 'admin', email: 'newurbaninfluence@gmail.com', name: 'Faren Young', isMasterAdmin: true };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            renderAdminSidebar();
            loadAdminDashboardPanel();
        // Check custom admin accounts from localStorage
        } else {
            const adminAccounts = JSON.parse(localStorage.getItem('nui_admin_accounts')) || [];
            const adminUser = adminAccounts.find(a => a.email.toLowerCase() === email && a.password === password && !a.blocked);
            if (adminUser) {
                currentUser = { type: 'admin', email: adminUser.email, name: adminUser.name || 'Admin' };
                document.getElementById('portalLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                renderAdminSidebar();
                loadAdminDashboardPanel();
            } else { alert('Invalid admin credentials.'); }
        }
    } else if (loginType === 'manager') {
        const manager = managers.find(m => m.email.toLowerCase() === email && m.password === password && !m.blocked);
        if (manager) {
            currentUser = { type: 'manager', ...manager };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            renderAdminSidebar();
            loadAdminDashboardPanel();
        } else { alert('Invalid manager credentials.'); }
    } else if (loginType === 'designer') {
        const designer = designers.find(d => d.email.toLowerCase() === email && d.password === password && !d.blocked);
        if (designer) {
            if (!designer.ndaSigned) { showNDAModal(designer); }
            else { completeDesignerLogin(designer); }
        } else { alert('Invalid designer credentials.'); }
    } else {
        const client = clients.find(c => c.email.toLowerCase() === email && c.password === password && !c.blocked);
        if (client) {
            currentUser = { type: 'client', ...client };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('clientPortal').style.display = 'block';
            showClientPortal(client);
        } else { alert('Invalid client credentials.'); }
    }
}

// Quick Client Access (DEMO MODE)
function quickClientAccess() {
    const clients = JSON.parse(localStorage.getItem('nui_clients')) || [];
    const demoClient = clients.find(c => c.email === 'hello@detroitcoffee.com') || clients[0];
    if (demoClient) {
        currentUser = { type: 'client', clientId: demoClient.id, email: demoClient.email, name: demoClient.name };
        document.getElementById('portalLogin').style.display = 'none';
        document.getElementById('clientPortal').style.display = 'block';
        loadClientPortal(demoClient);
        console.log('Quick Client Access (DEMO MODE) - ' + demoClient.name);
    } else {
        // If no clients exist, initialize demo data first
        initializeDemoData();
        const newClients = JSON.parse(localStorage.getItem('nui_clients')) || [];
        if (newClients.length > 0) {
            currentUser = { type: 'client', clientId: newClients[0].id, email: newClients[0].email, name: newClients[0].name };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('clientPortal').style.display = 'block';
            loadClientPortal(newClients[0]);
        } else {
            alert('No demo clients available. Please try Reset Demo Data.');
        }
    }
}

// Google Sign-In using Google Identity Services
async function googleSignIn() {
    // Use Supabase OAuth for Google sign-in
    if (window.NuiAuth && NuiAuth.isAvailable()) {
        try {
            await NuiAuth.signInWithGoogle();
            // Supabase will redirect to Google, then back to the app
            // The onAuthStateChange listener will handle the rest
            return;
        } catch (error) {
            console.error('Google sign-in error:', error);
            alert('Google sign-in failed: ' + error.message);
            return;
        }
    }

    // Fallback if Supabase not configured
    googleSignInFallback();
}

// Handle Google credential response (JWT) - kept as fallback
function handleGoogleCredentialResponse(response) {
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const googleUser = {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            emailVerified: payload.email_verified || false
        };
        processGoogleUser(googleUser);
    } catch (error) {
        console.error('Error processing Google credential:', error);
        alert('Error signing in with Google. Please try again.');
    }
}

// Fallback when Supabase/Google API isn't available
function googleSignInFallback() {
    const email = prompt('Enter your Google email address:', '');
    if (!email) return;
    if (!validateEmail(email)) { alert('Please enter a valid email address.'); return; }

    const mockGoogleUser = {
        email: email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        picture: '',
        emailVerified: true
    };
    processGoogleUser(mockGoogleUser);
}

// Process Google user - login or create account (fallback only)
function processGoogleUser(googleUser) {
    let existingClient = clients.find(c => c.email.toLowerCase() === googleUser.email.toLowerCase());
    if (existingClient) {
        currentUser = { type: 'client', ...existingClient };
        document.getElementById('portalLogin').style.display = 'none';
        document.getElementById('clientPortal').style.display = 'block';
        showClientPortal(existingClient);
    } else {
        if (confirm('No account found with ' + googleUser.email + '. Create a new account?')) {
            const newClient = {
                id: Date.now(), name: googleUser.name, email: googleUser.email,
                password: 'google_oauth_' + Date.now(), industry: 'Not specified', website: '',
                colors: ['#ff0000', '#000000', '#ffffff'], fonts: { heading: 'Inter', body: 'Inter' },
                assets: { logos: [], mockups: [], social: [], video: [], banner: [], fonts: [], patterns: [], package: [] },
                googleLinked: true, googlePicture: googleUser.picture,
                emailVerified: googleUser.emailVerified, createdVia: 'google', createdAt: new Date().toISOString()
            };
            clients.push(newClient);
            saveClients();
            currentUser = { type: 'client', ...newClient };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('clientPortal').style.display = 'block';
            showClientPortal(newClient);
            alert('Welcome, ' + newClient.name + '! Your account has been created.');
        }
    }
}

// Forgot Password - uses Supabase password reset
async function forgotPassword() {
    const email = prompt('Enter your email address to reset your password:');
    if (!email) return;

    if (window.NuiAuth && NuiAuth.isAvailable()) {
        try {
            await NuiAuth.resetPassword(email);
            alert('Password reset link sent to ' + email + '!\n\nCheck your inbox for the reset link.');
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Error: ' + error.message);
        }
        return;
    }

    // Fallback
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
    const designer = designers.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (client || designer || email === 'admin@nui.com') {
        alert('Password reset link sent to ' + email + '!\n\n(Supabase not configured - reset unavailable in demo mode)');
    } else {
        alert('No account found with email: ' + email);
    }
}

async function portalLogout() {
    // Sign out from Supabase
    if (window.NuiAuth && NuiAuth.isAvailable()) {
        try {
            await NuiAuth.signOut();
            console.log('Supabase sign out successful');
        } catch (error) {
            console.warn('Sign out error:', error.message);
        }
    }

    currentUser = null;
    currentAdminClient = null;
    const loginEl = document.getElementById('portalLogin');
    const adminEl = document.getElementById('adminDashboard');
    const clientEl = document.getElementById('clientPortal');
    const emailEl = document.getElementById('portalEmail');
    const passwordEl = document.getElementById('portalPassword');
    if (loginEl) loginEl.style.display = 'flex';
    if (adminEl) adminEl.style.display = 'none';
    if (clientEl) clientEl.style.display = 'none';
    if (emailEl) emailEl.value = '';
    if (passwordEl) passwordEl.value = '';
    loginType = 'client';
    const clientTab = document.getElementById('clientTab');
    const adminTab = document.getElementById('adminTab');
    if (clientTab) clientTab.classList.add('active');
    if (adminTab) adminTab.classList.remove('active');
}

