exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  try {
    const SUPABASE_URL = 'https://jcgvkyizoimwbolhfpta.supabase.co';
    const KEY = process.env.SUPABASE_SERVICE_KEY;
    const body = JSON.parse(event.body);

    const {
      first_name, last_name, email, phone, role,
      biz_name, biz_address, biz_neighborhood, biz_phone, hours_weekday, hours_weekend,
      party_nights, booking_platform,
      domain_name, domain_registrar, domain_login, domain_password,
      google_email, google_password, gbp_claimed,
      fb_email, fb_password, fb_has_bm, ig_handle, ig_email, ig_password,
      logo_url, menu_url, photo_urls, video_urls,
      vibe, colors, music_vibe, inspo,
      canva_url, pos_system, dont_want, additional_notes,
    } = body;

    const full_name = `${first_name || ''} ${last_name || ''}`.trim();

    const scraped_images = [
      'https://hideawaykitchenandbar.net/_assets/media/3a1b3d816f59aa35fe9c6a521e761fba.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/71da056e498a97746af418f49aeb59b6.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/dce9a2386b9cdd597c2f82cedf4b896e.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/21f288038793bf2e0ffc9dd8fa17c1fb.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/88fefb0a8e1072f3ac0b8bc51131eb00.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/2dbc249f2a13bab7f2ae5f4cd37aedd6.jpg',
      'https://hideawaykitchenandbar.net/_assets/media/9c7ffc68ce9c18e3dc04975970b4a783.png',
    ];

    const notes = `=== HIDEAWAY KITCHEN & BAR — NUI CLIENT INTAKE ===
Submitted: ${new Date().toISOString()}

CONTACT: ${full_name} | ${role || 'N/A'} | ${email} | ${phone}

BUSINESS: ${biz_name || 'Hideaway Kitchen & Bar'}
Address: ${biz_address || '29267 Southfield Rd., Southfield MI 48076'}
Phone: ${biz_phone || '(248) 382-2111'}
Hours Weekday: ${hours_weekday || 'N/A'}
Hours Weekend: ${hours_weekend || 'N/A'}
Party Nights: ${party_nights || 'N/A'}
Booking: ${booking_platform || 'Phone only'}

DOMAIN: ${domain_name || 'hideawaykitchenandbar.net'} | Registrar: ${domain_registrar || 'N/A'}
Login: ${domain_login || 'N/A'} | Pass: ${domain_password || 'N/A'}

GOOGLE: ${google_email || 'N/A'} | Pass: ${google_password || 'N/A'} | GBP: ${gbp_claimed || 'Unknown'}

FACEBOOK: ${fb_email || 'N/A'} | Pass: ${fb_password || 'N/A'} | Has BM: ${fb_has_bm || 'N/A'}

INSTAGRAM: ${ig_handle || '@hideaway_kitchen_bar_sfld'} | ${ig_email || 'N/A'} | Pass: ${ig_password || 'N/A'}

ASSETS:
Logo: ${logo_url || scraped_images[scraped_images.length-1]}
Menu: ${menu_url || 'https://drive.google.com/file/d/1OLlr-eRLfLWBLpwk1YkyII-mrHMMFGSZ/view'}
Photos uploaded: ${(photo_urls||[]).length} new + ${scraped_images.length} scraped from site
Videos: ${(video_urls||[]).join(', ') || 'None'}

BRAND: ${vibe || 'N/A'} | Colors: ${colors || 'Black, Gold #bc9c22'} | Music: ${music_vibe || 'N/A'}
Inspo: ${inspo || 'N/A'}

TECH: POS: ${pos_system || 'N/A'} | Current site: ${canva_url || 'hideawaykitchenandbar.net'}
Dont want: ${dont_want || 'N/A'}
Notes: ${additional_notes || 'N/A'}

SOCIALS (scraped): IG @hideaway_kitchen_bar_sfld | IG pics @hideawaykitchenandpics | TikTok @hideawaysouthfield`;

    const post = (table, data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(data),
    });

    const upsert = (table, data, conflict) => fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflict}`, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(data),
    });

    await post('leads', {
      name: full_name,
      email: email || 'greyn74986@gmail.com',
      phone,
      business: biz_name || 'Hideaway Kitchen & Bar',
      service: 'Phase 1 — Website + SEO + AEO + Geo + Pixels + Google + Video Ad',
      industry: 'Restaurant & Bar',
      budget: '$1,500 — Paid',
      site_id: 'newurbaninfluence',
      status: 'active',
      optin_email: true,
      extra_data: JSON.stringify({ ...body, scraped_images, all_photos: [...scraped_images, ...(photo_urls||[])] }),
    });

    await upsert('crm_contacts', {
      first_name: first_name || 'Rozalein',
      last_name: last_name || 'Reynolds',
      email: email || 'greyn74986@gmail.com',
      phone: phone || '248.640.1165',
      company: biz_name || 'Hideaway Kitchen & Bar',
      status: 'active_client',
      category: 'clients',
      tags: ['Restaurant & Bar', 'Phase 1', 'Hideaway', 'Paid', 'Southfield'],
      budget_range: '$1,500 paid',
      industry: 'Restaurant & Bar',
      service_interest: 'Website + SEO + AEO + Geo + Pixels + Google + Video Ad',
      notes,
      site_id: 'newurbaninfluence',
      client_account_id: 'ba6b739b-26fc-4ca8-93ec-91a52f547935',
    }, 'email');

    const OPENPHONE_KEY = process.env.OPENPHONE_KEY;
    if (OPENPHONE_KEY) {
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { Authorization: OPENPHONE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🍸 HIDEAWAY INTAKE SUBMITTED!\nName: ${full_name}\nEmail: ${email}\nPhone: ${phone}\nIG: ${ig_handle || '@hideaway_kitchen_bar_sfld'}\nPhotos: ${(photo_urls||[]).length} uploaded\nCheck admin → Submissions`,
          from: process.env.OPENPHONE_FROM || '+12484878747',
          to: ['+12484878747'],
        }),
      }).catch(e => console.error('SMS:', e.message));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Hideaway intake error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
