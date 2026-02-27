const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const order = JSON.parse(event.body);
    const { client_name, client_email, client_phone, business_name,
            industry, shipping_address, items, subtotal, shipping,
            total, notes, status, source } = order;

    // 1. Save to Supabase
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (SB_URL && SB_KEY) {
      const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

      // Save order
      await (await fetch)(`${SB_URL}/rest/v1/print_requests`, {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          client_name,
          client_email,
          client_phone,
          business_name,
          industry,
          product: items.length === 1 ? items[0].product : `Multi-Item Order (${items.length} items)`,
          price_shown: '$' + total,
          details: JSON.stringify({
            items,
            shipping_address,
            subtotal,
            shipping,
            total,
            notes
          }),
          status: 'new',
          source: source || 'print-store',
          created_at: new Date().toISOString()
        })
      });

      // Log activity
      await (await fetch)(`${SB_URL}/rest/v1/activity_log`, {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          type: 'print_order',
          message: `New print order from ${client_name}: ${items.length} item(s) — $${total}`,
          metadata: { client_email, items_count: items.length, total },
          created_at: new Date().toISOString()
        })
      });
    }

    // 2. Build item list HTML for emails
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #222;color:#fff">${item.product}</td>
        <td style="padding:10px;border-bottom:1px solid #222;color:#999">${item.size}</td>
        <td style="padding:10px;border-bottom:1px solid #222;color:#fff;text-align:center">
          ${item.needsDesign ? '<span style="color:#dc2626">🎨 Design+Print</span>' : '<span style="color:#22c55e">✅ Print Only</span>'}
        </td>
        <td style="padding:10px;border-bottom:1px solid #222;color:#dc2626;font-weight:700;text-align:right">$${item.total}</td>
      </tr>
    `).join('');

    const vendorSummary = {};
    items.forEach(item => {
      if (!vendorSummary[item.vendor]) vendorSummary[item.vendor] = [];
      vendorSummary[item.vendor].push(item.product);
    });
    const vendorHtml = Object.entries(vendorSummary).map(([v, prods]) =>
      `<strong>${v === 'signs365' ? 'Signs365' : 'Knello'}:</strong> ${prods.join(', ')}`
    ).join('<br>');

    const addressHtml = shipping_address ?
      `${shipping_address.address || ''}, ${shipping_address.city || ''}, ${shipping_address.state || 'MI'} ${shipping_address.zip || ''}` :
      'Not provided';

    // 3. Email to Faren (Admin notification)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"NUI Print Orders" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: 'info@newurbaninfluence.com',
      subject: `🖨️ New Print Order: $${total} — ${client_name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;border:1px solid #222">
          <h2 style="color:#dc2626;margin:0 0 4px">New Print Order</h2>
          <p style="color:#666;margin:0 0 24px">Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' })}</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr style="border-bottom:2px solid #333">
              <th style="padding:10px;text-align:left;color:#999;font-size:12px;text-transform:uppercase">Product</th>
              <th style="padding:10px;text-align:left;color:#999;font-size:12px;text-transform:uppercase">Size</th>
              <th style="padding:10px;text-align:center;color:#999;font-size:12px;text-transform:uppercase">Type</th>
              <th style="padding:10px;text-align:right;color:#999;font-size:12px;text-transform:uppercase">Price</th>
            </tr>
            ${itemsHtml}
          </table>

          <div style="background:#111;padding:16px;border-radius:8px;margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:#999">Subtotal</span><span>$${subtotal}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="color:#999">Shipping</span><span>${shipping > 0 ? '$' + shipping : 'TBD'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #333;padding-top:8px;margin-top:8px">
              <span style="font-weight:700;font-size:18px">Total</span>
              <span style="font-weight:900;font-size:22px;color:#dc2626">$${total}</span>
            </div>
          </div>

          <h3 style="color:#fff;margin:20px 0 8px;font-size:14px">Client Info</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#999;width:100px">Name</td><td style="padding:6px 0;font-weight:700">${client_name}</td></tr>
            <tr><td style="padding:6px 0;color:#999">Email</td><td style="padding:6px 0"><a href="mailto:${client_email}" style="color:#dc2626">${client_email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#999">Phone</td><td style="padding:6px 0">${client_phone || 'Not provided'}</td></tr>
            <tr><td style="padding:6px 0;color:#999">Business</td><td style="padding:6px 0">${business_name || 'Not provided'}</td></tr>
            <tr><td style="padding:6px 0;color:#999">Industry</td><td style="padding:6px 0">${industry || 'Not selected'}</td></tr>
            <tr><td style="padding:6px 0;color:#999">Ship To</td><td style="padding:6px 0">${addressHtml}</td></tr>
            ${notes ? `<tr><td style="padding:6px 0;color:#999">Notes</td><td style="padding:6px 0">${notes}</td></tr>` : ''}
          </table>

          <h3 style="color:#fff;margin:20px 0 8px;font-size:14px">Vendor Routing</h3>
          <p style="color:#ccc;font-size:14px">${vendorHtml}</p>
        </div>
      `
    });

    // 4. Confirmation email to client
    const clientItemsHtml = items.map(item => `
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div>
          <div style="font-weight:700">${item.product}</div>
          <div style="color:#999;font-size:13px">${item.size}</div>
          <div style="font-size:12px;margin-top:2px">${item.needsDesign ? '🎨 Design + Print' : '✅ Print Only'}</div>
        </div>
        <div style="font-weight:800;color:#dc2626;font-size:18px">$${item.total}</div>
      </div>
    `).join('');

    await transporter.sendMail({
      from: `"New Urban Influence" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: client_email,
      subject: `Your Print Order — $${total} | New Urban Influence`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <img src="https://newurbaninfluence.com/logo-nav-cropped.png" alt="NUI" style="height:40px">
          </div>
          <h2 style="text-align:center;margin-bottom:8px">Order Received! 🎉</h2>
          <p style="text-align:center;color:#999;margin-bottom:32px">Here's what we got from you:</p>

          <div style="background:rgba(255,255,255,0.04);padding:20px;border-radius:8px;margin-bottom:24px">
            ${clientItemsHtml}
            <div style="display:flex;justify-content:space-between;padding-top:16px;margin-top:8px;border-top:1px solid rgba(255,255,255,0.1)">
              <span style="font-weight:700;font-size:16px">Total</span>
              <span style="font-weight:900;font-size:22px;color:#dc2626">$${total}</span>
            </div>
          </div>

          <h3 style="margin-bottom:8px">What Happens Next</h3>
          <ol style="color:#ccc;font-size:14px;line-height:1.8;padding-left:20px">
            ${items.some(i => i.needsDesign) ? '<li>We\'ll start on your custom designs and send proofs within 24-48 hours</li>' : ''}
            ${items.some(i => !i.needsDesign) ? '<li>We\'ll review your artwork files and confirm they\'re print-ready</li>' : ''}
            <li>Once approved, production starts (most items ship within 24 hours)</li>
            <li>You\'ll get tracking info as soon as it ships</li>
          </ol>

          <p style="color:#999;font-size:14px;margin-top:24px">Questions? Reply to this email or call us at <a href="tel:2484878747" style="color:#dc2626">(248) 487-8747</a></p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0">
          <p style="color:#666;font-size:12px;text-align:center">New Urban Influence · Detroit, Michigan</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Order submitted' })
    };

  } catch (err) {
    console.error('Print order error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
