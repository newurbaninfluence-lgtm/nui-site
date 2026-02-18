const NUI_COMPANY = {
    name: 'New Urban Influence',
    phone: '(248) 487-8747',
    email: 'info@newurbaninfluence.com',
    location: 'Detroit, MI',
    website: 'newurbaninfluence.com',
    colors: {
        primary: '#e63946',
        secondary: '#1a1a1a',
        accent: '#f4f4f4'
    },
    logo: 'NUI | New Urban Influence' // Text logo for now
};

// Email Templates Storage
let emailTemplates = JSON.parse(localStorage.getItem('nui_email_templates')) || [];
let scheduledEmails = JSON.parse(localStorage.getItem('nui_scheduled_emails')) || [];
function saveEmailTemplates() { localStorage.setItem('nui_email_templates', JSON.stringify(emailTemplates)); }
function saveScheduledEmails() { localStorage.setItem('nui_scheduled_emails', JSON.stringify(scheduledEmails)); }

// Initialize default templates
if (emailTemplates.length === 0) {
    emailTemplates = [
        {
            id: 1,
            name: 'Welcome New Client',
            subject: 'Welcome to the NUI Family, {{clientName}}!',
            category: 'onboarding',
            body: `Hey {{clientName}},

Let me be real with you — you just made one of the smartest decisions for your business.

While your competitors are out there playing small, you chose to invest in a brand that actually WORKS. That takes vision. That takes guts. And honestly? That's exactly the type of client we love working with.

Here's what happens next:
• Your dedicated designer will reach out within 24 hours
• We'll dive deep into your brand strategy
• You'll start seeing concepts within 72 hours

This isn't just another design project. This is the beginning of your business transformation.

Stay hungry. Stay focused. And get ready to dominate.

Let's build something legendary.`
        },
        {
            id: 2,
            name: 'Project Kickoff',
            subject: '🚀 Your Project Just Started, {{clientName}}!',
            category: 'project',
            body: `Hey {{clientName}},

Game time.

Your project is officially in motion, and I want you to understand something important: we don't do average work. We create brands that make your competition nervous.

Your designer {{designerName}} is already working on bringing your vision to life.

What to expect:
• First proof delivery: 72 hours
• Unlimited revisions until you're 100% satisfied
• Direct communication the entire way

Here's my challenge to you: dream bigger than you think you should. Push us. Tell us what you REALLY want your brand to feel like. The bolder you go, the more we can deliver.

Time to level up.`
        },
        {
            id: 3,
            name: 'Proof Ready',
            subject: '👀 Your Proof is Ready for Review, {{clientName}}',
            category: 'project',
            body: `Hey {{clientName}},

Stop what you're doing.

Your first proof is ready, and I'm genuinely excited for you to see it. This is the moment where your brand starts becoming REAL.

Log into your client portal to review:
{{portalLink}}

Here's what I need from you:
1. Look at it with fresh eyes
2. Imagine it on your website, your business cards, everywhere
3. Trust your gut reaction

Love it? Approve it and we move forward.
Want changes? No problem — tell us exactly what you're thinking.

This is YOUR brand. Make sure it feels right.

Waiting on your feedback.`
        },
        {
            id: 4,
            name: 'Invoice Reminder',
            subject: 'Quick Reminder: Invoice {{invoiceNumber}} Due Soon',
            category: 'payment',
            body: `Hey {{clientName}},

Quick heads up — your invoice {{invoiceNumber}} for \${{amount}} is coming due.

I know you're busy building your empire, so I wanted to make this easy. Click below to handle it in 30 seconds:

{{paymentLink}}

Once this is squared away, we can keep the momentum going on your project. No delays, no interruptions — just results.

Questions? Hit reply. I got you.

Talk soon.`
        },
        {
            id: 5,
            name: 'Project Complete',
            subject: '🎉 Your Brand is LIVE, {{clientName}}!',
            category: 'delivery',
            body: `Hey {{clientName}},

This is it. The moment you've been waiting for.

Your brand is complete, approved, and ready to take over your market. All your files are waiting in your portal:
{{portalLink}}

But here's what I really want you to understand...

This isn't the end. This is the BEGINNING.

You now have a brand that:
• Commands attention
• Builds instant credibility
• Makes people remember you

Now it's time to USE it. Put it everywhere. Be loud. Be consistent. And watch what happens to your business.

It's been an honor working with you. And remember — we're always here when you're ready to level up again.

Go dominate.`
        },
        {
            id: 6,
            name: 'Holiday Greeting',
            subject: 'Happy Holidays from the NUI Family! 🎄',
            category: 'newsletter',
            body: `Hey {{clientName}},

As the year wraps up, I wanted to take a moment to say something that doesn't get said enough:

THANK YOU.

Thank you for trusting us with your brand. Thank you for dreaming big. Thank you for being part of the NUI family.

This year, we helped brands just like yours stand out, get noticed, and grow. And honestly? It never gets old.

Wishing you and your family an incredible holiday season filled with rest, reflection, and maybe a little strategic planning for next year 😉

Here's to an even bigger year ahead.

Happy Holidays!`
        },
        {
            id: 7,
            name: 'New Year Special',
            subject: '2026 is YOUR Year, {{clientName}} — Let\'s Make It Happen',
            category: 'promo',
            body: `Hey {{clientName}},

New year. New opportunity. Same question:

Are you going to play small, or are you going to DOMINATE?

Look, I'm not here to give you some generic "new year, new you" message. I'm here to tell you that the brands who win in 2026 are the ones taking action NOW.

That's why we're offering something special:
🔥 20% off any branding package this month
🔥 Free brand strategy session ($500 value)
🔥 Priority scheduling for Q1 delivery

This isn't about discounts. This is about momentum. The businesses that start strong, finish strong.

Ready to make 2026 your year?

Reply "LET'S GO" and I'll personally set up your strategy call.

No excuses. Just results.`
        }
    ];
    saveEmailTemplates();
}

// Generate email HTML with beautiful template
function generateEmailHTML(template, clientData) {
    const { clientName, designerName, invoiceNumber, amount, paymentLink, portalLink } = clientData;

    let body = template.body
        .replace(/\{\{clientName\}\}/g, clientName || 'there')
        .replace(/\{\{designerName\}\}/g, designerName || 'our team')
        .replace(/\{\{invoiceNumber\}\}/g, invoiceNumber || '')
        .replace(/\{\{amount\}\}/g, amount || '')
        .replace(/\{\{paymentLink\}\}/g, paymentLink || '#')
        .replace(/\{\{portalLink\}\}/g, portalLink || '#');

    // Convert line breaks to HTML
    const bodyHTML = body.split('\n\n').map(p => `<p style="margin: 0 0 16px 0; line-height: 1.7;">${p.replace(/\n/g, '<br>')}</p>`).join('');

    return `
<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Geo Meta Tags -->
    <meta name="geo.region" content="US-MI">
    <meta name="geo.placename" content="Detroit, Michigan">
    <meta name="geo.position" content="42.3314;-83.0458">
    <meta name="ICBM" content="42.3314, -83.0458">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Arial, sans-serif;">
 <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
<tr>
<td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
                    <!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px 40px; text-align: center;">
<h2 style="margin: 0; font-size: 28px; font-weight: 800; color: #e63946; letter-spacing: 2px;">NUI</h2>
<p style="margin: 8px 0 0 0; font-size: 11px; color: #888; letter-spacing: 3px; text-transform: uppercase;">New Urban Influence</p>
</td>
</tr>
                    <!-- Accent Bar -->
<tr>
<td style="background: linear-gradient(90deg, #e63946, #ff6b6b); height: 4px;"></td>
</tr>
                    <!-- Body -->
<tr>
<td style="padding: 48px 40px; color: #1a1a1a; font-size: 16px;">
                            ${bodyHTML}
</td>
</tr>
                    <!-- Signature -->
<tr>
<td style="padding: 0 40px 40px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #eee; padding-top: 24px;">
<tr>
<td>
<p style="margin: 0 0 4px 0; font-weight: 700; color: #1a1a1a;">New Urban Influence</p>
<p style="margin: 0; font-size: 14px; color: #666;">Detroit's Premier Creative Agency</p>
<p style="margin: 12px 0 0 0; font-size: 14px; color: #888;">
                                            📞 ${NUI_COMPANY.phone}<br>
                                            📧 ${NUI_COMPANY.email}<br>
                                            📍 ${NUI_COMPANY.location}
</p>
</td>
</tr>
</table>
</td>
</tr>
                    <!-- Footer -->
<tr>
<td style="background-color: #1a1a1a; padding: 24px 40px; text-align: center;">
<p style="margin: 0; font-size: 12px; color: #888;">
                                © 2026 New Urban Influence. Unapologetically Detroit.
</p>
<p style="margin: 12px 0 0 0; font-size: 11px; color: #666;">
<a href="#" style="color: #e63946; text-decoration: none;">Website</a> ·
<a href="#" style="color: #e63946; text-decoration: none;">Instagram</a> ·
<a href="#" style="color: #e63946; text-decoration: none;">Unsubscribe</a>
</p>
</td>
</tr>
</table>
</td>
</tr>
 </table>
</body>
</html>`;
}

// Send email using template
async function sendTemplateEmail(templateId, clientId, customData = {}) {
    const template = emailTemplates.find(t => t.id === templateId);
    const client = clients.find(c => c.id === clientId);

    if (!template || !client) {
        alert('Template or client not found');
        return;
    }

    const clientData = {
        clientName: client.name,
        portalLink: window.location.origin + '/portal',
        ...customData
    };

    const subject = template.subject.replace(/\{\{clientName\}\}/g, client.name);
    const html = generateEmailHTML(template, clientData);

    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: client.email,
                subject: subject,
                html: html,
                text: template.body.replace(/\{\{clientName\}\}/g, client.name),
                clientId: client.id
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Email sent successfully!');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Email error:', error);
        alert('Email sending failed. Check console for details.');
    }
}

// Load Email Templates Panel in Admin
function loadAdminEmailTemplatesPanel() {
    const categories = ['onboarding', 'project', 'payment', 'delivery', 'newsletter', 'promo'];

    document.getElementById('adminEmailmarketingPanel').innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
<h2 style="font-size: 28px; font-weight: 700;">📧 Email Templates</h2>
<button onclick="showCreateTemplateModal()" class="btn-cta">+ New Template</button>
</div>

        <!-- Quick Send -->
<div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
<h3 style="margin: 0 0 16px 0; color: #fff;">⚡ Quick Send</h3>
<div style="display: flex; gap: 12px; flex-wrap: wrap;">
<select id="quickSendTemplate" style="flex: 1; min-width: 200px; padding: 12px; background: #333; border: 1px solid #444; color: #fff; border-radius: 8px;">
<option value="">Select Template</option>
                    ${emailTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
</select>
<select id="quickSendClient" style="flex: 1; min-width: 200px; padding: 12px; background: #333; border: 1px solid #444; color: #fff; border-radius: 8px;">
<option value="">Select Client</option>
                    ${clients.map(c => `<option value="${c.id}">${c.name} (${c.email})</option>`).join('')}
</select>
<button onclick="quickSendEmail()" style="padding: 12px 24px; background: #e63946; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Send Now</button>
<button onclick="previewEmail()" style="padding: 12px 24px; background: #333; color: #fff; border: 1px solid #444; border-radius: 8px; cursor: pointer;">Preview</button>
</div>
</div>

        <!-- Scheduled Campaigns -->
<div style="background: #111; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<h3 style="margin: 0;">🗓️ Scheduled Campaigns</h3>
<button onclick="showScheduleCampaignModal()" style="padding: 8px 16px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer;">+ Schedule Campaign</button>
</div>
            ${scheduledEmails.length > 0 ? scheduledEmails.map(s => `
<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #222;">
<div>
<div style="font-weight: 500;">${emailTemplates.find(t => t.id === s.templateId)?.name || 'Unknown'}</div>
<div style="font-size: 13px; color: #888;">${s.audience === 'all' ? 'All Clients' : s.audience} · ${new Date(s.sendAt).toLocaleString()}</div>
</div>
<div style="display: flex; gap: 8px;">
<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${s.status === 'sent' ? '#10b98120' : '#f59e0b20'}; color: ${s.status === 'sent' ? '#10b981' : '#f59e0b'};">${s.status}</span>
<button onclick="cancelScheduledEmail(${s.id})" style="padding: 4px 8px; background: #333; border: none; color: #888; border-radius: 4px; cursor: pointer;">×</button>
</div>
</div>
            `).join('') : '<p style="color: #888;">No scheduled campaigns.</p>'}
</div>

        <!-- Templates by Category -->
        ${categories.map(cat => `
<div style="margin-bottom: 24px;">
<h3 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">${cat}</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    ${emailTemplates.filter(t => t.category === cat).map(t => `
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222;">
<h4 style="margin: 0 0 8px 0; font-size: 16px;">${t.name}</h4>
<p style="margin: 0 0 12px 0; font-size: 13px; color: #888; line-height: 1.5;">${t.subject}</p>
<div style="display: flex; gap: 8px;">
<button onclick="editTemplate(${t.id})" style="flex: 1; padding: 8px; background: #333; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px;">Edit</button>
<button onclick="previewTemplate(${t.id})" style="flex: 1; padding: 8px; background: #e63946; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px;">Preview</button>
</div>
</div>
                    `).join('')}
</div>
</div>
        `).join('')}
    `;
}

function quickSendEmail() {
    const templateId = parseInt(document.getElementById('quickSendTemplate').value);
    const clientId = parseInt(document.getElementById('quickSendClient').value);
    if (!templateId || !clientId) {
        alert('Please select both a template and a client');
        return;
    }
    sendTemplateEmail(templateId, clientId);
}

function previewEmail() {
    const templateId = parseInt(document.getElementById('quickSendTemplate').value);
    const clientId = parseInt(document.getElementById('quickSendClient').value);
    const template = emailTemplates.find(t => t.id === templateId);
    const client = clients.find(c => c.id === clientId) || { name: 'John Smith' };

    if (!template) {
        alert('Please select a template');
        return;
    }

    const html = generateEmailHTML(template, { clientName: client.name });
    const win = window.open('', 'Email Preview', 'width=700,height=800');
    win.document.write(html);
    win.document.close();
}

function previewTemplate(templateId) {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    const html = generateEmailHTML(template, { clientName: 'John Smith' });
    const win = window.open('', 'Email Preview', 'width=700,height=800');
    win.document.write(html);
    win.document.close();
}

function showCreateTemplateModal() {
    const modal = document.createElement('div');
    modal.id = 'templateModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
<div style="padding: 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
<h2 style="margin: 0; font-size: 20px;">Create Email Template</h2>
<button onclick="document.getElementById('templateModal').remove()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
</div>
<div style="padding: 24px;">
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Template Name</label>
<input type="text" id="newTemplateName" placeholder="e.g., Follow Up Email" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Subject Line (use {{clientName}} for personalization)</label>
<input type="text" id="newTemplateSubject" placeholder="e.g., Hey {{clientName}}, quick question..." style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Category</label>
<select id="newTemplateCategory" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
<option value="onboarding">Onboarding</option>
<option value="project">Project Updates</option>
<option value="payment">Payment</option>
<option value="delivery">Delivery</option>
<option value="newsletter">Newsletter</option>
<option value="promo">Promotional</option>
</select>
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Email Body</label>
<textarea id="newTemplateBody" rows="12" placeholder="Hey {{clientName}},

Write your email here...

Use {{clientName}}, {{designerName}}, {{invoiceNumber}}, {{amount}}, {{paymentLink}}, {{portalLink}} for dynamic content." style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; font-family: inherit; line-height: 1.6;"></textarea>
</div>
<button onclick="saveNewTemplate()" style="width: 100%; padding: 14px; background: #e63946; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Save Template</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function saveNewTemplate() {
    const name = document.getElementById('newTemplateName').value.trim();
    const subject = document.getElementById('newTemplateSubject').value.trim();
    const category = document.getElementById('newTemplateCategory').value;
    const body = document.getElementById('newTemplateBody').value.trim();

    if (!name || !subject || !body) {
        alert('Please fill in all fields');
        return;
    }

    emailTemplates.push({
        id: Date.now(),
        name,
        subject,
        category,
        body
    });
    saveEmailTemplates();

    document.getElementById('templateModal').remove();
    loadAdminEmailTemplatesPanel();
    alert('Template saved!');
}

function editTemplate(templateId) {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.createElement('div');
    modal.id = 'templateModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
<div style="padding: 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
<h2 style="margin: 0; font-size: 20px;">Edit Template: ${template.name}</h2>
<button onclick="document.getElementById('templateModal').remove()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
</div>
<div style="padding: 24px;">
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Template Name</label>
<input type="text" id="editTemplateName" value="${template.name}" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Subject Line</label>
<input type="text" id="editTemplateSubject" value="${template.subject}" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Category</label>
<select id="editTemplateCategory" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
<option value="onboarding" ${template.category === 'onboarding' ? 'selected' : ''}>Onboarding</option>
<option value="project" ${template.category === 'project' ? 'selected' : ''}>Project Updates</option>
<option value="payment" ${template.category === 'payment' ? 'selected' : ''}>Payment</option>
<option value="delivery" ${template.category === 'delivery' ? 'selected' : ''}>Delivery</option>
<option value="newsletter" ${template.category === 'newsletter' ? 'selected' : ''}>Newsletter</option>
<option value="promo" ${template.category === 'promo' ? 'selected' : ''}>Promotional</option>
</select>
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Email Body</label>
<textarea id="editTemplateBody" rows="12" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; font-family: inherit; line-height: 1.6;">${template.body}</textarea>
</div>
<div style="display: flex; gap: 12px;">
<button onclick="updateTemplate(${template.id})" style="flex: 1; padding: 14px; background: #e63946; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Save Changes</button>
<button onclick="deleteTemplate(${template.id})" style="padding: 14px 24px; background: #333; color: #ef4444; border: 1px solid #ef4444; border-radius: 8px; cursor: pointer;">Delete</button>
</div>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function updateTemplate(templateId) {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    template.name = document.getElementById('editTemplateName').value.trim();
    template.subject = document.getElementById('editTemplateSubject').value.trim();
    template.category = document.getElementById('editTemplateCategory').value;
    template.body = document.getElementById('editTemplateBody').value.trim();

    saveEmailTemplates();
    document.getElementById('templateModal').remove();
    loadAdminEmailTemplatesPanel();
    alert('Template updated!');
}

function deleteTemplate(templateId) {
    if (!confirm('Delete this template?')) return;
    emailTemplates = emailTemplates.filter(t => t.id !== templateId);
    saveEmailTemplates();
    document.getElementById('templateModal').remove();
    loadAdminEmailTemplatesPanel();
}

// Schedule Campaign Modal
function showScheduleCampaignModal() {
    const modal = document.createElement('div');
    modal.id = 'scheduleModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 16px; width: 100%; max-width: 500px;">
<div style="padding: 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
<h2 style="margin: 0; font-size: 20px;">Schedule Campaign</h2>
<button onclick="document.getElementById('scheduleModal').remove()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
</div>
<div style="padding: 24px;">
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Template</label>
<select id="scheduleTemplate" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
                            ${emailTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
</select>
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Send To</label>
<select id="scheduleAudience" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
<option value="all">All Clients</option>
<option value="active">Active Clients (with projects)</option>
<option value="leads">Leads Only</option>
</select>
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; margin-bottom: 8px; color: #888; font-size: 13px;">Send Date & Time</label>
<input type="datetime-local" id="scheduleDateTime" style="width: 100%; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px;">
</div>
<button onclick="scheduleCampaign()" style="width: 100%; padding: 14px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Schedule Campaign</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function scheduleCampaign() {
    const templateId = parseInt(document.getElementById('scheduleTemplate').value);
    const audience = document.getElementById('scheduleAudience').value;
    const sendAt = document.getElementById('scheduleDateTime').value;

    if (!sendAt) {
        alert('Please select a date and time');
        return;
    }

    scheduledEmails.push({
        id: Date.now(),
        templateId,
        audience,
        sendAt: new Date(sendAt).toISOString(),
        status: 'scheduled'
    });
    saveScheduledEmails();

    document.getElementById('scheduleModal').remove();
    loadAdminEmailTemplatesPanel();
    alert('Campaign scheduled!');
}

function cancelScheduledEmail(id) {
    if (!confirm('Cancel this scheduled campaign?')) return;
    scheduledEmails = scheduledEmails.filter(s => s.id !== id);
    saveScheduledEmails();
    loadAdminEmailTemplatesPanel();
}

// Check for scheduled emails to send (run on page load and every minute)
function checkScheduledEmails() {
    const now = new Date();
    scheduledEmails.forEach(async (scheduled) => {
        if (scheduled.status === 'scheduled' && new Date(scheduled.sendAt) <= now) {
            // Get recipients based on audience
            let recipients = [];
            if (scheduled.audience === 'all') {
                recipients = clients;
            } else if (scheduled.audience === 'active') {
                const activeClientIds = orders.filter(o => o.status === 'in_progress').map(o => o.clientId);
                recipients = clients.filter(c => activeClientIds.includes(c.id));
            } else if (scheduled.audience === 'leads') {
                recipients = leads;
            }

            // Send to each recipient
            for (const recipient of recipients) {
                await sendTemplateEmail(scheduled.templateId, recipient.id);
            }

            scheduled.status = 'sent';
            saveScheduledEmails();
        }
    });
}

// Run scheduled email check every minute
setInterval(checkScheduledEmails, 60000);
checkScheduledEmails(); // Run immediately on load

// Update admin panel loaders to include email templates
const originalShowAdminPanel = showAdminPanel;
showAdminPanel = function(panel) {
    originalShowAdminPanel(panel);
    if (panel === 'emailmarketing') {
        loadAdminEmailTemplatesPanel();
    }
    if (panel === 'subscriptions') {
        loadAdminSubscriptionsPanel();
    }
};

// ==================== SUBSCRIPTION MANAGEMENT PANEL ====================
function loadAdminSubscriptionsPanel() {
    const totalSubscribers = subscriptions.filter(s => s.status === 'active').length;
    const monthlyRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0);

    const planBreakdown = {};
    subscriptionPlans.forEach(plan => {
        const count = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;
        if (count > 0) planBreakdown[plan.id] = { name: plan.name, count };
    });

    let html = `
<div style="padding: 32px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
<div>
<h2 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0;">Subscription Management</h2>
<p style="color: #888; margin-top: 8px;">Manage customer subscriptions and billing plans</p>
</div>
<button onclick="showAssignPlanModal(null)" style="background: #e63946; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 14px;">+ Assign Plan</button>
</div>

            <!-- Stats Cards -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Total Subscribers</div>
<div style="font-size: 36px; font-weight: 700; color: #e63946;">${totalSubscribers}</div>
<div style="color: #666; font-size: 12px; margin-top: 8px;">Active subscriptions</div>
</div>
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Monthly Revenue</div>
<div style="font-size: 36px; font-weight: 700; color: #10b981;">$${monthlyRevenue.toLocaleString()}</div>
<div style="color: #666; font-size: 12px; margin-top: 8px;">Recurring monthly</div>
</div>
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Active Plans</div>
<div style="font-size: 36px; font-weight: 700; color: #3b82f6;">${Object.keys(planBreakdown).length}</div>
<div style="color: #666; font-size: 12px; margin-top: 8px;">Of ${subscriptionPlans.length} plans</div>
</div>
</div>

            <!-- Plan Cards -->
<div style="margin-bottom: 32px;">
<h2 style="font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 16px 0;">Plans Overview</h2>
<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
    `;

    subscriptionPlans.forEach(plan => {
        const count = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;
        html += `
<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #e63946; margin-bottom: 8px;">$${plan.price}</div>
<div style="font-weight: 600; color: #fff; margin-bottom: 12px; font-size: 14px;">${plan.name}</div>
<div style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px;">${count}</div>
<div style="color: #666; font-size: 11px; margin-bottom: 16px;">Active subscribers</div>
<button onclick="showAssignPlanModal('${plan.id}')" style="width: 100%; background: #e63946; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px;">Assign Plan</button>
</div>
        `;
    });

    html += `
</div>
</div>

            <!-- Search/Filter -->
<div style="margin-bottom: 20px; display: flex; gap: 12px;">
<input type="text" id="subscriptionSearchInput" placeholder="Search by client name or email..." style="flex: 1; padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 14px;">
<select id="subscriptionFilterStatus" onchange="filterSubscriptionTable()" style="padding: 12px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; cursor: pointer;">
<option value="">All Status</option>
<option value="active">Active</option>
<option value="paused">Paused</option>
<option value="cancelled">Cancelled</option>
</select>
<button onclick="filterSubscriptionTable()" style="background: #e63946; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Search</button>
</div>

            <!-- Active Subscriptions Table -->
<div style="background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden;">
<table id="subscriptionTable" style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="background: #0a0a0a; border-bottom: 1px solid #222;">
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Client</th>
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Plan</th>
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Price</th>
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Status</th>
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Start Date</th>
<th style="padding: 16px; text-align: left; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Next Billing</th>
<th style="padding: 16px; text-align: center; color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase;">Actions</th>
</tr>
</thead>
<tbody id="subscriptionTableBody">
    `;

    subscriptions.forEach(sub => {
        const statusColors = { active: '#10b981', paused: '#f59e0b', cancelled: '#ef4444' };
        const statusIcons = { active: '●', paused: '⏸', cancelled: '✕' };
        const startDate = new Date(sub.startDate).toLocaleDateString();
        const nextBillingDate = new Date(sub.nextBillingDate).toLocaleDateString();

        html += `
<tr style="border-bottom: 1px solid #222; hover: {background: #0a0a0a;}">
<td style="padding: 16px; color: #fff;">${sub.clientName}</td>
<td style="padding: 16px; color: rgba(255,255,255,0.7);">${sub.plan}</td>
<td style="padding: 16px; color: #e63946; font-weight: 600;">$${sub.price}/mo</td>
<td style="padding: 16px;">
<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: ${statusColors[sub.status]}20; color: ${statusColors[sub.status]}; border-radius: 100px; font-size: 12px; font-weight: 600;">
<span>${statusIcons[sub.status]}</span>
                                    ${sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
</span>
</td>
<td style="padding: 16px; color: rgba(255,255,255,0.6); font-size: 13px;">${startDate}</td>
<td style="padding: 16px; color: rgba(255,255,255,0.6); font-size: 13px;">${nextBillingDate}</td>
<td style="padding: 16px; text-align: center;">
<div style="display: flex; gap: 8px; justify-content: center;">
                                    ${sub.status === 'active' ? `<button onclick="pauseSubscription(${sub.id})" style="background: #f59e0b; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">Pause</button>` : sub.status === 'paused' ? `<button onclick="resumeSubscription(${sub.id})" style="background: #10b981; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">Resume</button>` : ''}
<button onclick="showChangePlanModal(${sub.id})" style="background: #3b82f6; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">Change Plan</button>
<button onclick="sendSubscriptionInvoice(${sub.id})" style="background: #10b981; color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">Invoice</button>
<button onclick="cancelSubscription(${sub.id})" style="background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">Cancel</button>
</div>
</td>
</tr>
        `;
    });

    html += `
</tbody>
</table>
                ${subscriptions.length === 0 ? `<div style="padding: 40px; text-align: center; color: #666;">No subscriptions yet. <a onclick="showAssignPlanModal(null)" style="color: #e63946; cursor: pointer; font-weight: 600;">Create one now</a></div>` : ''}
</div>
</div>
    `;

    document.getElementById('adminSubscriptionsPanel').innerHTML = html;
    document.getElementById('subscriptionSearchInput').addEventListener('input', filterSubscriptionTable);
}

function showAssignPlanModal(planId) {
    const plan = planId ? subscriptionPlans.find(p => p.id === planId) : null;

    let html = `
<div class="modal-overlay" id="assignPlanModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
<div style="background: #111; border: 1px solid #333; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
<h2 style="font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 24px 0;">Assign Subscription Plan</h2>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 8px;">Select Client</label>
<select id="assignPlanClient" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 14px;">
<option value="">-- Choose a client --</option>
                        ${clients.map(c => `<option value="${c.id}">${c.name} (${c.email})</option>`).join('')}
</select>
</div>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 8px;">Select Plan</label>
<select id="assignPlanSelect" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 14px;">
<option value="">-- Choose a plan --</option>
                        ${subscriptionPlans.map(p => `<option value="${p.id}" ${p.id === planId ? 'selected' : ''}>${p.name} - $${p.price}/mo</option>`).join('')}
</select>
</div>

<div id="planPreview" style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: none;">
<div style="color: #fff; font-weight: 600; margin-bottom: 12px;" id="planPreviewName"></div>
<div style="color: #888; font-size: 13px; line-height: 1.6;" id="planPreviewFeatures"></div>
</div>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 8px;">Start Date</label>
<input type="date" id="assignPlanStartDate" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 14px;">
</div>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 8px;">Billing Method</label>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
<label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: #1a1a1a; border: 1px solid #e63946; border-radius: 8px; cursor: pointer;">
<input type="radio" name="billingMethod" value="stripe" checked style="cursor: pointer;">
<span style="color: #fff; font-size: 14px;">Auto (Stripe)</span>
</label>
<label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; cursor: pointer;">
<input type="radio" name="billingMethod" value="manual" style="cursor: pointer;">
<span style="color: #fff; font-size: 14px;">Manual Invoice</span>
</label>
</div>
</div>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 8px;">Notes (optional)</label>
<textarea id="assignPlanNotes" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 80px;" placeholder="Any special notes about this subscription..."></textarea>
</div>

<div style="display: flex; gap: 12px;">
<button onclick="document.getElementById('assignPlanModal').remove()" style="flex: 1; padding: 12px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancel</button>
<button onclick="assignSubscription()" style="flex: 1; padding: 12px; background: #e63946; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Assign Plan</button>
</div>
</div>
</div>
    `;

    document.body.appendChild(document.createElement('div')).outerHTML = html;

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assignPlanStartDate').value = today;

    // Show plan preview when plan is selected
    document.getElementById('assignPlanSelect').addEventListener('change', function() {
        const selectedPlanId = this.value;
        const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (selectedPlan) {
            document.getElementById('planPreview').style.display = 'block';
            document.getElementById('planPreviewName').textContent = selectedPlan.name + ' - $' + selectedPlan.price + '/mo';
            document.getElementById('planPreviewFeatures').innerHTML = selectedPlan.features.map(f => '✓ ' + f).join('<br>');
        } else {
            document.getElementById('planPreview').style.display = 'none';
        }
    });
}

function assignSubscription() {
    const clientId = parseInt(document.getElementById('assignPlanClient').value);
    const planId = document.getElementById('assignPlanSelect').value;
    const startDateStr = document.getElementById('assignPlanStartDate').value;
    const billingMethod = document.querySelector('input[name="billingMethod"]:checked').value;
    const notes = document.getElementById('assignPlanNotes').value;

    if (!clientId || !planId || !startDateStr) {
        alert('Please fill in all required fields');
        return;
    }

    const client = clients.find(c => c.id === clientId);
    const plan = subscriptionPlans.find(p => p.id === planId);

    if (!client || !plan) {
        alert('Invalid client or plan selected');
        return;
    }

    const startDate = new Date(startDateStr);
    const nextBillingDate = new Date(startDate);
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    const subscription = {
        id: Date.now(),
        planId: planId,
        clientId: clientId,
        clientName: client.name,
        clientEmail: client.email,
        plan: plan.name,
        price: plan.price,
        billingMethod: billingMethod,
        status: 'active',
        startDate: startDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        orderLimit: plan.orderLimit,
        features: plan.features,
        notes: notes,
        history: [{ action: 'created', date: new Date().toISOString(), note: 'Subscription started', user: currentUser?.name || 'Admin' }]
    };

    subscriptions.push(subscription);
    saveSubscriptions();

    logProofActivity(clientId, 'subscription_assigned', `${plan.name} subscription assigned for $${plan.price}/mo`, subscription);

    // Send email notification
    if (client.email) {
        try {
            simulateEmailNotification(client.email, `Welcome to ${plan.name}!`, `Your ${plan.name} plan is now active. Next billing date: ${nextBillingDate.toLocaleDateString()}`);
        } catch (e) {
            console.log('Email notification not available');
        }
    }

    document.getElementById('assignPlanModal').remove();
    loadAdminSubscriptionsPanel();
    alert(`Subscription assigned! ${client.name} is now on the ${plan.name} plan.`);
}

function pauseSubscription(subId) {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    if (!confirm(`Pause subscription for ${sub.clientName}? They won't be charged until resumed.`)) return;

    sub.status = 'paused';
    sub.history.push({ action: 'paused', date: new Date().toISOString(), note: 'Subscription paused', user: currentUser?.name || 'Admin' });
    saveSubscriptions();
    loadAdminSubscriptionsPanel();
    alert('Subscription paused');
}

function resumeSubscription(subId) {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    sub.status = 'active';
    sub.history.push({ action: 'resumed', date: new Date().toISOString(), note: 'Subscription resumed', user: currentUser?.name || 'Admin' });
    saveSubscriptions();
    loadAdminSubscriptionsPanel();
    alert('Subscription resumed');
}

function cancelSubscription(subId) {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    if (!confirm(`Cancel subscription for ${sub.clientName}? This action cannot be undone.`)) return;

    sub.status = 'cancelled';
    sub.cancelledDate = new Date().toISOString();
    sub.history.push({ action: 'cancelled', date: new Date().toISOString(), note: 'Subscription cancelled', user: currentUser?.name || 'Admin' });
    saveSubscriptions();
    loadAdminSubscriptionsPanel();
    alert('Subscription cancelled');
}

function showChangePlanModal(subId) {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    let html = `
<div class="modal-overlay" id="changePlanModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
<div style="background: #111; border: 1px solid #333; border-radius: 16px; padding: 32px; max-width: 600px; width: 90%;">
<h2 style="font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 24px 0;">Change Plan for ${sub.clientName}</h2>

<div style="background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
<div style="font-size: 13px; color: #888; margin-bottom: 4px;">Current Plan</div>
<div style="font-size: 18px; font-weight: 600; color: #fff;">${sub.plan} - $${sub.price}/mo</div>
</div>

<div style="margin-bottom: 20px;">
<label style="display: block; color: #fff; font-weight: 600; margin-bottom: 12px;">Select New Plan</label>
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
    `;

    subscriptionPlans.forEach(plan => {
        const isCurrentPlan = plan.id === sub.planId;
        html += `
<button onclick="changePlan(${subId}, '${plan.id}')" style="padding: 16px; background: ${isCurrentPlan ? '#e63946' : '#1a1a1a'}; border: ${isCurrentPlan ? '2px solid #e63946' : '1px solid #333'}; border-radius: 8px; cursor: ${isCurrentPlan ? 'default' : 'pointer'}; color: #fff; text-align: left; transition: all 0.2s;" ${isCurrentPlan ? 'disabled' : ''}>
<div style="font-weight: 600; margin-bottom: 4px;">${plan.name}</div>
<div style="font-size: 14px; font-weight: 700; color: ${isCurrentPlan ? '#fff' : '#e63946'};">$${plan.price}/mo</div>
                            ${isCurrentPlan ? '<div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 8px;">Current Plan</div>' : ''}
</button>
        `;
    });

    html += `
</div>
</div>

<div style="display: flex; gap: 12px;">
<button onclick="document.getElementById('changePlanModal').remove()" style="flex: 1; padding: 12px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancel</button>
</div>
</div>
</div>
    `;

    document.body.appendChild(document.createElement('div')).outerHTML = html;
}

function changePlan(subId, newPlanId) {
    const sub = subscriptions.find(s => s.id === subId);
    const newPlan = subscriptionPlans.find(p => p.id === newPlanId);

    if (!sub || !newPlan || newPlan.id === sub.planId) {
        return;
    }

    const oldPlan = sub.plan;
    const oldPrice = sub.price;

    sub.planId = newPlanId;
    sub.plan = newPlan.name;
    sub.price = newPlan.price;
    sub.orderLimit = newPlan.orderLimit;
    sub.features = newPlan.features;
    sub.history.push({
        action: 'plan_changed',
        date: new Date().toISOString(),
        note: `Changed from ${oldPlan} ($${oldPrice}/mo) to ${newPlan.name} ($${newPlan.price}/mo)`,
        user: currentUser?.name || 'Admin'
    });

    saveSubscriptions();
    document.getElementById('changePlanModal').remove();
    loadAdminSubscriptionsPanel();
    alert(`Plan changed! ${sub.clientName} is now on the ${newPlan.name} plan ($${newPlan.price}/mo).`);
}

function sendSubscriptionInvoice(subId) {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    const invoice = {
        id: Date.now() + Math.random(),
        invoiceNumber: 'SUB-INV-' + sub.id + '-' + new Date().getTime(),
        clientId: sub.clientId,
        clientName: sub.clientName,
        clientEmail: sub.clientEmail,
        subscriptionId: sub.id,
        projectName: sub.plan + ' Subscription - Monthly',
        lineItems: [{
            description: `${sub.plan} - Monthly subscription (${new Date(sub.nextBillingDate).toLocaleDateString()})`,
            amount: sub.price
        }],
        subtotal: sub.price,
        total: sub.price,
        dueDate: new Date(sub.nextBillingDate).toISOString().split('T')[0],
        notes: `Billing Method: ${sub.billingMethod === 'stripe' ? 'Automatic (Stripe)' : 'Manual Invoice'}`,
        status: 'pending',
        termsAccepted: false,
        createdAt: new Date().toISOString()
    };

    invoices.push(invoice);
    saveInvoices();

    // Send invoice to client
    if (sub.clientEmail) {
        try {
            sendInvoiceToClient(invoice);
        } catch (e) {
            console.log('Email notification not available');
        }
    }

    alert(`Invoice sent to ${sub.clientName}`);
    loadAdminSubscriptionsPanel();
}

function filterSubscriptionTable(query) {
    const searchInput = document.getElementById('subscriptionSearchInput');
    const statusFilter = document.getElementById('subscriptionFilterStatus');
    const searchQuery = (query || searchInput.value).toLowerCase();
    const statusValue = statusFilter.value;

    const rows = document.querySelectorAll('#subscriptionTableBody tr');
    rows.forEach(row => {
        const clientName = row.cells[0].textContent.toLowerCase();
        const statusText = row.cells[3].textContent.toLowerCase();

        const matchesSearch = clientName.includes(searchQuery);
        const matchesStatus = statusValue === '' || statusText.includes(statusValue);

        row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
}
