function loadAdminNewOrderPanel() {
    document.getElementById('adminNewOrderPanel').innerHTML = `
<h2 style="font-size: 28px; font-weight: 700; margin-bottom: 32px;">Create New Order</h2>

        <!-- SERVICE PACKAGES -->
<div class="form-section">
<div class="form-section-title">📦 Select Service Package</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
                ${servicePackages.map(pkg => `
<div class="package-card" onclick="selectPackage('${pkg.id}')" id="pkg-${pkg.id}" style="padding: 20px; border: 2px solid #e5e5e5; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
<div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${pkg.name}</div>
<div style="font-size: 24px; font-weight: 700; color: var(--red); margin-bottom: 8px;">${pkg.price > 0 ? '$' + pkg.price.toLocaleString() : 'Custom'}</div>
<div style="font-size: 12px; color: #888; margin-bottom: 8px;">${pkg.turnaround}</div>
<div class="text-muted-sm">${pkg.desc}</div>
</div>
                `).join('')}
</div>
</div>

        <!-- ORDER FORM -->
<form onsubmit="createOrder(event)" class="form-section max-w-700">
<div class="form-section-title">📋 Order Details</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Client *</label>
<select id="orderClient" class="form-input" required class="admin-input">
<option value="">-- Select or Add New --</option>
                        ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
<option value="new">+ Add New Client</option>
</select>
</div>
<div class="form-group"><label class="form-label">Package</label>
<select id="orderPackage" class="form-input" onchange="fillPackageDetails()" class="admin-input">
<option value="">-- Select Package --</option>
<optgroup label="📦 Service Packages">
                        ${servicePackages.map(p => `<option value="${p.id}">${p.name} - $${p.price}</option>`).join('')}
</optgroup>
<optgroup label="🎯 Individual Services">
                        ${individualServices.map(s => `<option value="svc-${s.id}">${s.name} - $${s.price}</option>`).join('')}
</optgroup>
<option value="custom">➕ Create Custom Package</option>
</select>
</div>
</div>

            <!-- Custom Package Builder -->
<div id="customPackageBuilder" style="display: none; margin-bottom: 20px; padding: 20px; background: rgba(225,29,72,0.1); border-radius: 12px; border: 1px solid rgba(225,29,72,0.3);">
<div style="font-weight: 600; margin-bottom: 12px; color: var(--red);">🎨 Build Custom Package</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;" id="selectedServicesContainer"></div>
<select id="addServiceToPackage" onchange="addServiceToCustomPackage(this.value)" style="width: 100%; padding: 10px; background: #252525; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;">
<option value="">➕ Add service to package...</option>
                    ${individualServices.map(s => `<option value="${s.id}">${s.name} - $${s.price}</option>`).join('')}
</select>
<div style="margin-top: 12px; font-size: 14px; color: rgba(255,255,255,0.7);">Package Total: <strong id="customPackageTotal">$0</strong></div>
</div>
<div class="form-group"><label class="form-label">Project Name *</label><input type="text" id="orderProject" class="form-input" required></div>
<div class="form-group"><label class="form-label">Description</label><textarea id="orderDesc" class="form-input" rows="2"></textarea></div>
<div class="form-row">
<div class="form-group"><label class="form-label">Price ($) *</label><input type="number" id="orderEstimate" class="form-input" required></div>
<div class="form-group"><label class="form-label">Turnaround *</label><input type="text" id="orderTurnaround" class="form-input" required></div>
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Due Date *</label><input type="date" id="orderDueDate" class="form-input" required></div>
<div class="form-group"><label class="form-label">Status</label>
<select id="orderStatus" class="form-input">
<option value="pending">Pending</option>
<option value="in_progress">In Progress</option>
<option value="delivered">Delivered</option>
</select>
</div>
</div>
<div style="display: flex; gap: 12px; margin-top: 20px;">
<button type="submit" class="btn-cta flex-1">Create Order & Invoice</button>
<button type="button" onclick="generateLeadForm()" class="btn-cta" style="flex: 1; background: #000;">Generate Lead Form</button>
</div>
</form>

        <!-- LEAD FORM GENERATOR -->
<div class="form-section" id="leadFormSection" class="hidden">
<div class="form-section-title">🎯 Lead Capture Form Code</div>
<p style="color: #666; margin-bottom: 16px;">Copy this code and paste it on your website to capture leads:</p>
<textarea id="leadFormCode" class="form-input" rows="12" style="font-family: monospace; font-size: 12px;" readonly></textarea>
<button onclick="copyLeadForm()" class="btn-cta mt-12">📋 Copy Form Code</button>
</div>
    `;
}

function selectPackage(pkgId) {
    document.querySelectorAll('.package-card').forEach(el => el.style.borderColor = '#e5e5e5');
    document.getElementById('pkg-' + pkgId).style.borderColor = 'var(--red)';
    document.getElementById('orderPackage').value = pkgId;
    fillPackageDetails();
}

let customPackageServices = [];

function fillPackageDetails() {
    const pkgId = document.getElementById('orderPackage').value;
    const customBuilder = document.getElementById('customPackageBuilder');

    // Handle custom package option
    if (pkgId === 'custom') {
        customBuilder.style.display = 'block';
        document.getElementById('orderProject').value = 'Custom Package';
        return;
    } else {
        customBuilder.style.display = 'none';
    }

    // Handle individual service
    if (pkgId.startsWith('svc-')) {
        const svcId = pkgId.replace('svc-', '');
        const svc = individualServices.find(s => s.id == svcId);
        if (svc) {
            document.getElementById('orderProject').value = svc.name;
            document.getElementById('orderDesc').value = svc.description || '';
            document.getElementById('orderEstimate').value = svc.price;
            document.getElementById('orderTurnaround').value = svc.turnaround || '5-7 days';
            const days = parseInt(svc.turnaround) || 7;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + days);
            document.getElementById('orderDueDate').value = dueDate.toISOString().split('T')[0];
        }
        return;
    }

    // Handle package
    const pkg = servicePackages.find(p => p.id === pkgId);
    if (pkg) {
        document.getElementById('orderProject').value = pkg.name;
        document.getElementById('orderDesc').value = pkg.desc;
        document.getElementById('orderEstimate').value = pkg.price;
        document.getElementById('orderTurnaround').value = pkg.turnaround;
        const days = parseInt(pkg.turnaround) || 14;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        document.getElementById('orderDueDate').value = dueDate.toISOString().split('T')[0];
    }
}

function addServiceToCustomPackage(serviceId) {
    if (!serviceId) return;
    const svc = individualServices.find(s => s.id == serviceId);
    if (!svc || customPackageServices.find(s => s.id == serviceId)) return;

    customPackageServices.push(svc);
    renderCustomPackageServices();
    document.getElementById('addServiceToPackage').value = '';
}

function removeFromCustomPackage(serviceId) {
    customPackageServices = customPackageServices.filter(s => s.id != serviceId);
    renderCustomPackageServices();
}

function renderCustomPackageServices() {
    const container = document.getElementById('selectedServicesContainer');
    const total = customPackageServices.reduce((sum, s) => sum + (s.price || 0), 0);

    container.innerHTML = customPackageServices.map(s => `
<span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: #252525; border-radius: 20px; font-size: 13px;">
            ${s.name} - $${s.price}
<button onclick="removeFromCustomPackage(${s.id})" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 16px;">×</button>
</span>
    `).join('');

    document.getElementById('customPackageTotal').textContent = '$' + total.toLocaleString();
    document.getElementById('orderEstimate').value = total;
    document.getElementById('orderDesc').value = customPackageServices.map(s => s.name).join(', ');
}

function generateLeadForm() {
    const pkgId = document.getElementById('orderPackage').value;
    const pkg = servicePackages.find(p => p.id === pkgId) || { name: 'Project Inquiry', price: '', desc: '' };

    const formCode = `<!-- NUI Lead Capture Form -->
<style>
.nui-form{font-family:'Inter',sans-serif;max-width:500px;margin:0 auto;padding:40px;background:#000;color:#fff;border-radius:12px}
.nui-form h3{font-size:24px;margin-bottom:8px}
.nui-form p{color:#888;margin-bottom:24px;font-size:14px}
.nui-form input,.nui-form select,.nui-form textarea{width:100%;padding:14px;margin-bottom:16px;border:1px solid #333;background:#1c1c1c;color:#fff;border-radius:8px;font-size:14px}
.nui-form input:focus,.nui-form select:focus,.nui-form textarea:focus{outline:none;border-color:#ff0000}
.nui-form button{width:100%;padding:16px;background:#ff0000;color:#fff;border:none;font-weight:600;font-size:16px;cursor:pointer;border-radius:8px}
.nui-form button:hover{background:#cc0000}
.nui-form .logo{color:#ff0000;font-weight:800;font-size:20px;margin-bottom:24px}
</style>
<form class="nui-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <div class="logo">NUI.</div>
  <h3>${pkg.name || 'Get Started'}</h3>
  <p>${pkg.desc || "Fill out the form below and we'll get back to you within 24 hours."}</p>
  <input type="text" name="name" placeholder="Your Name *" required>
  <input type="email" name="email" placeholder="Email Address *" required>
  <input type="tel" name="phone" placeholder="Phone Number">
  <input type="text" name="business" placeholder="Business Name">
  <select name="service">
 <option value="">Select Service Interest</option>
    ${servicePackages.map(p => `<option value="${p.name}">${p.name} - $${p.price}</option>`).join('\n    ')}
  </select>
  <input type="text" name="budget" placeholder="Budget Range">
  <textarea name="message" rows="3" placeholder="Tell us about your project..."></textarea>
  <input type="hidden" name="source" value="NUI Lead Form - ${pkg.name}">
  <button type="submit">Get Your Free Quote →</button>
</form>`;

    document.getElementById('leadFormCode').value = formCode;
    document.getElementById('leadFormSection').style.display = 'block';
    document.getElementById('leadFormSection').scrollIntoView({ behavior: 'smooth' });
}

function copyLeadForm() {
    const code = document.getElementById('leadFormCode');
    code.select();
    document.execCommand('copy');
    alert('Lead form code copied to clipboard!');
}

function loadAdminNewClientPanel() {
    document.getElementById('adminNewclientPanel').innerHTML = `
<h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">Create New Client</h2>
<p style="color: #888; margin-bottom: 32px;">Fill in client details to set up their portal, then send a welcome email with questionnaire.</p>
<form onsubmit="createClient(event)" class="form-section max-w-700">

            <!-- CONTACT INFO -->
<div style="font-weight: 600; font-size: 16px; margin-bottom: 16px; color: var(--red); display: flex; align-items: center; gap: 8px;">👤 Contact Information</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Business / Client Name *</label><input type="text" id="newClientName" class="form-input" required placeholder="e.g., Acme Coffee Co."></div>
<div class="form-group"><label class="form-label">Contact Person</label><input type="text" id="newClientContact" class="form-input" placeholder="e.g., John Smith"></div>
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Email *</label><input type="email" id="newClientEmail" class="form-input" required placeholder="client@email.com"></div>
<div class="form-group"><label class="form-label">Phone Number</label><input type="tel" id="newClientPhone" class="form-input" placeholder="(248) 487-8747"></div>
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Password *</label><input type="text" id="newClientPassword" class="form-input" required value="" placeholder="Temporary login password"></div>
<div class="form-group"><label class="form-label">Address</label><input type="text" id="newClientAddress" class="form-input" placeholder="Detroit, MI"></div>
</div>

            <!-- BUSINESS INFO -->
<div style="font-weight: 600; font-size: 16px; margin: 24px 0 16px; color: var(--red); display: flex; align-items: center; gap: 8px;">🏢 Business Details</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Industry</label><input type="text" id="newClientIndustry" class="form-input" placeholder="e.g., Restaurant, Tech, Retail"></div>
<div class="form-group"><label class="form-label">Website</label><input type="url" id="newClientWebsite" class="form-input" placeholder="https://"></div>
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Service Package *</label>
<select id="newClientService" class="form-input" required class="admin-input">
<option value="">What service are they getting?</option>
${servicePackages.map(p => '<option value="' + p.id + '">' + p.name + ' — $' + p.price.toLocaleString() + '</option>').join('')}
<option value="custom">Custom / Multiple Services</option>
</select>
</div>
<div class="form-group"><label class="form-label">Referral Source</label>
<select id="newClientReferral" class="form-input admin-input">
<option value="">How did they find us?</option>
<option value="google">Google Search</option>
<option value="instagram">Instagram</option>
<option value="referral">Word of Mouth / Referral</option>
<option value="website">Our Website</option>
<option value="event">Networking / Event</option>
<option value="other">Other</option>
</select>
</div>
</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Social Media</label><input type="text" id="newClientSocial" class="form-input" placeholder="@handle or link"></div>
<div class="form-group"><label class="form-label">Notes</label><textarea id="newClientNotes" class="form-input" rows="2" placeholder="Anything important to remember about this client..."></textarea></div>
</div>

            <!-- HOSTING & SUBSCRIPTION PLANS -->
<div style="font-weight: 600; font-size: 16px; margin: 24px 0 16px; color: var(--red); display: flex; align-items: center; gap: 8px;">💰 Plans & Subscriptions</div>
<div class="form-row">
<div class="form-group"><label class="form-label">Hosting Plan</label>
<select id="newClientHostingPlan" class="form-input">
<option value="">— No Hosting Plan —</option>
<option value="basic-hosting">Basic Hosting — $27/mo</option>
<option value="hosting-funnels">Hosting + Funnels — $125/mo</option>
</select>
</div>
<div class="form-group"><label class="form-label">Design Subscription</label>
<select id="newClientDesignSub" class="form-input">
<option value="">— No Design Subscription —</option>
<option value="design-essentials">Brand Essentials — $297/mo</option>
<option value="design-growth">Growth Engine — $497/mo</option>
<option value="design-creative">Full Creative Team — $697/mo</option>
</select>
</div>
</div>

            <!-- ONBOARDING OPTIONS -->
<div style="font-weight: 600; font-size: 16px; margin: 24px 0 16px; color: var(--red); display: flex; align-items: center; gap: 8px;">🚀 Onboarding Actions</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
<label style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #242424; border: 1px solid #333; border-radius: 8px; cursor: pointer;">
<input type="checkbox" id="sendWelcomeEmail" checked> <span class="fs-14">📧 Send Welcome Email</span>
</label>
<label style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #242424; border: 1px solid #333; border-radius: 8px; cursor: pointer;">
<input type="checkbox" id="sendQuestionnaire" checked> <span class="fs-14">📋 Send Service Questionnaire</span>
</label>
<label style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #242424; border: 1px solid #333; border-radius: 8px; cursor: pointer;">
<input type="checkbox" id="addToPipeline" checked> <span class="fs-14">📊 Add to CRM Pipeline</span>
</label>
</div>

<button type="submit" class="btn-cta" style="width: 100%; padding: 16px; font-size: 16px;">Create Client & Start Onboarding</button>
</form>
    `;
}


// ═══════════════════════════════════════════════════════════
// MIGRATE EXISTING CLIENT — All-in-one panel
// Add existing clients with projects, invoices, subscriptions
// ═══════════════════════════════════════════════════════════

function loadAdminMigrateClientPanel() {
    document.getElementById('adminMigrateclientPanel').innerHTML = `
<h2 style="font-size:28px;font-weight:700;margin-bottom:8px;">↩️ Migrate Existing Client</h2>
<p style="color:#888;margin-bottom:32px;">Add a client from your old system — include all their past projects, invoices, and subscriptions in one shot. No welcome email sent by default.</p>

<form onsubmit="migrateClient(event)" class="form-section max-w-800">

<!-- ── CONTACT INFO ── -->
<div style="font-weight:600;font-size:16px;margin-bottom:16px;color:var(--red);">👤 Client Info</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Business / Client Name *</label><input type="text" id="migClientName" class="form-input" required placeholder="e.g., PenMindState"></div>
  <div class="form-group"><label class="form-label">Contact Person</label><input type="text" id="migClientContact" class="form-input" placeholder="e.g., Damon Meadows"></div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Email *</label><input type="email" id="migClientEmail" class="form-input" required placeholder="client@email.com"></div>
  <div class="form-group"><label class="form-label">Phone</label><input type="tel" id="migClientPhone" class="form-input" placeholder="(313) 555-1234"></div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Portal Password *</label><input type="text" id="migClientPassword" class="form-input" required placeholder="Set their login password"></div>
  <div class="form-group"><label class="form-label">Industry</label><input type="text" id="migClientIndustry" class="form-input" placeholder="e.g., Music, Retail, Food"></div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Website</label><input type="url" id="migClientWebsite" class="form-input" placeholder="https://"></div>
  <div class="form-group"><label class="form-label">Notes</label><textarea id="migClientNotes" class="form-input" rows="2" placeholder="Anything important..."></textarea></div>
</div>

<!-- ── PROJECTS ── -->
<div style="font-weight:600;font-size:16px;margin:28px 0 16px;color:var(--red);">📁 Past & Active Projects</div>
<div id="migProjectsList"></div>
<button type="button" onclick="addMigProject()" style="padding:10px 20px;background:#1a1a1a;border:1px dashed #444;color:#888;border-radius:8px;cursor:pointer;font-size:14px;margin-bottom:8px;">+ Add Project</button>

<!-- ── INVOICES ── -->
<div style="font-weight:600;font-size:16px;margin:28px 0 16px;color:var(--red);">🧾 Invoice History</div>
<div id="migInvoicesList"></div>
<button type="button" onclick="addMigInvoice()" style="padding:10px 20px;background:#1a1a1a;border:1px dashed #444;color:#888;border-radius:8px;cursor:pointer;font-size:14px;margin-bottom:8px;">+ Add Invoice</button>

<!-- ── SUBSCRIPTIONS ── -->
<div style="font-weight:600;font-size:16px;margin:28px 0 16px;color:var(--red);">🔄 Monthly Subscriptions</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Hosting Plan</label>
    <select id="migHostingPlan" class="form-input">
      <option value="">— None —</option>
      <option value="basic-hosting">Basic Hosting — $27/mo</option>
      <option value="hosting-funnels">Hosting + Funnels — $125/mo</option>
    </select>
  </div>
  <div class="form-group"><label class="form-label">Design Subscription</label>
    <select id="migDesignSub" class="form-input">
      <option value="">— None —</option>
      <option value="design-essentials">Brand Essentials — $297/mo</option>
      <option value="design-growth">Growth Engine — $497/mo</option>
      <option value="design-creative">Full Creative Team — $697/mo</option>
    </select>
  </div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Marketing Tech Plan</label>
    <select id="migMarketingPlan" class="form-input">
      <option value="">— None —</option>
      <option value="brand-ready">Brand Ready — $497/mo</option>
      <option value="brand-loaded">Brand Loaded — $1,497/mo</option>
      <option value="brand-heavy">Brand Heavy — $2,497/mo</option>
    </select>
  </div>
  <div class="form-group"><label class="form-label">Next Billing Date</label>
    <input type="date" id="migBillingDate" class="form-input">
  </div>
</div>

<!-- ── OPTIONS ── -->
<div style="font-weight:600;font-size:16px;margin:28px 0 16px;color:var(--red);">⚙️ Options</div>
<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
  <label style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#242424;border:1px solid #333;border-radius:8px;cursor:pointer;">
    <input type="checkbox" id="migSendPortalEmail"> <span class="fs-14">📧 Send Portal Access Email</span>
  </label>
  <label style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#242424;border:1px solid #333;border-radius:8px;cursor:pointer;">
    <input type="checkbox" id="migAddPipeline" checked> <span class="fs-14">📊 Add to CRM Pipeline</span>
  </label>
  <label style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:#242424;border:1px solid #333;border-radius:8px;cursor:pointer;">
    <input type="checkbox" id="migMarkActive" checked> <span class="fs-14">✅ Mark as Active Client</span>
  </label>
</div>

<button type="submit" class="btn-cta" style="width:100%;padding:16px;font-size:16px;">↩️ Migrate Client into System</button>
</form>
`;
    // Add first project and invoice row by default
    addMigProject();
    addMigInvoice();
}

let migProjectCount = 0;
function addMigProject() {
    migProjectCount++;
    const id = migProjectCount;
    const div = document.createElement('div');
    div.id = 'migProject_' + id;
    div.style.cssText = 'background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:12px;position:relative;';
    div.innerHTML = `
<button type="button" onclick="document.getElementById('migProject_${id}').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#666;cursor:pointer;font-size:18px;">✕</button>
<div class="form-row">
  <div class="form-group"><label class="form-label">Project Name *</label><input type="text" name="migProj_name_${id}" class="form-input" placeholder="e.g., Brand Identity Design" required></div>
  <div class="form-group"><label class="form-label">Service Type</label>
    <select name="migProj_type_${id}" class="form-input">
      <option value="brand_identity">Brand Identity</option>
      <option value="web_design">Web Design</option>
      <option value="print">Print</option>
      <option value="social_media">Social Media</option>
      <option value="marketing">Marketing</option>
      <option value="custom">Custom / Other</option>
    </select>
  </div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Status</label>
    <select name="migProj_status_${id}" class="form-input">
      <option value="done">✅ Completed</option>
      <option value="in_progress">🔄 In Progress</option>
      <option value="review">👁 In Review</option>
      <option value="on_hold">⏸ On Hold</option>
    </select>
  </div>
  <div class="form-group"><label class="form-label">Start Date</label><input type="date" name="migProj_date_${id}" class="form-input"></div>
</div>
<div class="form-group"><label class="form-label">Notes / Deliverables</label><input type="text" name="migProj_notes_${id}" class="form-input" placeholder="Logo, brand guide, business cards, etc."></div>`;
    document.getElementById('migProjectsList').appendChild(div);
}

let migInvoiceCount = 0;
function addMigInvoice() {
    migInvoiceCount++;
    const id = migInvoiceCount;
    const div = document.createElement('div');
    div.id = 'migInvoice_' + id;
    div.style.cssText = 'background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:12px;position:relative;';
    div.innerHTML = `
<button type="button" onclick="document.getElementById('migInvoice_${id}').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#666;cursor:pointer;font-size:18px;">✕</button>
<div class="form-row">
  <div class="form-group"><label class="form-label">Description</label><input type="text" name="migInv_desc_${id}" class="form-input" placeholder="e.g., Brand Kit — Full Payment"></div>
  <div class="form-group"><label class="form-label">Amount *</label><input type="number" name="migInv_amount_${id}" class="form-input" placeholder="1500" min="0"></div>
</div>
<div class="form-row">
  <div class="form-group"><label class="form-label">Date Paid / Invoiced</label><input type="date" name="migInv_date_${id}" class="form-input"></div>
  <div class="form-group"><label class="form-label">Status</label>
    <select name="migInv_status_${id}" class="form-input">
      <option value="paid">✅ Paid</option>
      <option value="partial">💛 Partial Payment</option>
      <option value="unpaid">❌ Unpaid / Outstanding</option>
    </select>
  </div>
</div>`;
    document.getElementById('migInvoicesList').appendChild(div);
}

function migrateClient(e) {
    e.preventDefault();

    // Build client object
    const newClient = {
        id: Date.now(),
        name: document.getElementById('migClientName').value.trim(),
        contact: document.getElementById('migClientContact').value.trim(),
        email: document.getElementById('migClientEmail').value.trim(),
        phone: document.getElementById('migClientPhone').value.trim(),
        password: document.getElementById('migClientPassword').value.trim(),
        industry: document.getElementById('migClientIndustry').value.trim(),
        website: document.getElementById('migClientWebsite').value.trim(),
        notes: document.getElementById('migClientNotes').value.trim(),
        hostingPlan: document.getElementById('migHostingPlan').value,
        designSubscription: document.getElementById('migDesignSub').value,
        marketingPlan: document.getElementById('migMarketingPlan').value,
        billingDate: document.getElementById('migBillingDate').value,
        status: document.getElementById('migMarkActive').checked ? 'active' : 'inactive',
        source: 'migration',
        createdAt: new Date().toISOString()
    };

    clients.push(newClient);
    saveClients();

    // Build projects
    let projCount = 0;
    for (let i = 1; i <= migProjectCount; i++) {
        const nameEl = document.querySelector(`[name="migProj_name_${i}"]`);
        if (!nameEl || !nameEl.closest(`#migProject_${i}`)) continue;
        const proj = {
            id: Date.now() + projCount++,
            clientId: newClient.id,
            projectName: nameEl.value,
            type: document.querySelector(`[name="migProj_type_${i}"]`)?.value || 'custom',
            status: document.querySelector(`[name="migProj_status_${i}"]`)?.value || 'done',
            createdAt: document.querySelector(`[name="migProj_date_${i}"]`)?.value || new Date().toISOString(),
            notes: document.querySelector(`[name="migProj_notes_${i}"]`)?.value || '',
            migrated: true
        };
        orders.push(proj);
    }
    saveOrders();

    // Build invoices
    let invCount = 0;
    for (let i = 1; i <= migInvoiceCount; i++) {
        const descEl = document.querySelector(`[name="migInv_desc_${i}"]`);
        if (!descEl || !descEl.closest(`#migInvoice_${i}`)) continue;
        const amountVal = parseFloat(document.querySelector(`[name="migInv_amount_${i}"]`)?.value || 0);
        if (!amountVal) continue;
        const inv = {
            id: Date.now() + 1000 + invCount++,
            clientId: newClient.id,
            invoiceNumber: 'MIG-' + (Date.now() + invCount),
            description: descEl.value || 'Migrated Invoice',
            total: amountVal,
            amount: amountVal,
            status: document.querySelector(`[name="migInv_status_${i}"]`)?.value || 'paid',
            date: document.querySelector(`[name="migInv_date_${i}"]`)?.value || new Date().toISOString(),
            paidAt: document.querySelector(`[name="migInv_status_${i}"]`)?.value === 'paid' ? (document.querySelector(`[name="migInv_date_${i}"]`)?.value || new Date().toISOString()) : null,
            migrated: true,
            createdAt: new Date().toISOString()
        };
        invoices.push(inv);
    }
    saveInvoices();

    alert('✅ ' + newClient.name + ' migrated successfully!\n\nProjects, invoices and subscriptions have been added to their portal.');
    showAdminPanel('clients');
}
