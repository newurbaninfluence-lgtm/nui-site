// send-test-v1.js — fires ONE test email to a target inbox for visual QA
// Usage: node scripts/send-test-v1.js [to_email] [angle] [first_name] [company] [template]
//   template: 'bold' (V1 default) or 'plain' (V3)

const fs = require('fs');
const nodemailer = require('nodemailer');

const TO_EMAIL = process.argv[2] || 'info@newurbaninfluence.com';
const ANGLE    = process.argv[3] || 'reconnect';
const FIRST    = process.argv[4] || 'Faren';
const COMPANY  = process.argv[5] || 'New Urban Influence';
const TEMPLATE = process.argv[6] || 'bold';
const SITE_URL = 'https://newurbaninfluence.com';

const src = fs.readFileSync(__dirname + '/../netlify/functions/client-email-broadcast.js', 'utf8');
const start = src.indexOf('function buildEmail(');
const end = src.indexOf('// ── Log send to Supabase');
const fnSrc = src.slice(start, end);
const buildEmail = new Function('SITE_URL', fnSrc + '; return buildEmail;')(SITE_URL);

const TEST_CID = 'TEST';
const TEST_SID = 'test_' + Date.now();
const { subject, html } = buildEmail(TEST_CID, TEST_SID, ANGLE, FIRST, COMPANY, TEMPLATE);

const SMTP_USER = process.env.HOSTINGER_EMAIL;
const SMTP_PASS = process.env.HOSTINGER_PASSWORD;

if (!SMTP_USER || !SMTP_PASS) {
  console.error('Missing HOSTINGER_EMAIL or HOSTINGER_PASSWORD in env');
  process.exit(1);
}

(async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', port: 465, secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  console.log('Sending test email');
  console.log('   Template: ' + TEMPLATE + (TEMPLATE === 'plain' ? ' (V3 Hybrid Plain - Primary-tab optimized)' : ' (V1 Bold Signature)'));
  console.log('   To:       ' + TO_EMAIL);
  console.log('   Angle:    ' + ANGLE);
  console.log('   Subject:  ' + subject);
  console.log('   Size:     ' + html.length + ' chars');
  console.log('   Track:    cid=' + TEST_CID + ' id=' + TEST_SID);
  console.log('');

  try {
    const info = await transporter.sendMail({
      from: '"Faren Young | New Urban Influence" <' + SMTP_USER + '>',
      to: TO_EMAIL,
      subject: subject,
      html, replyTo: SMTP_USER,
      headers: {
        'List-Unsubscribe': '<' + SITE_URL + '/.netlify/functions/unsubscribe?cid=' + TEST_CID + '>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-NUI-Template': TEMPLATE,
        'X-NUI-Angle': ANGLE
      }
    });
    console.log('SENT');
    console.log('   Message ID: ' + info.messageId);
    console.log('   Response:   ' + info.response);
    console.log('   Accepted:   ' + info.accepted.join(', '));
    if (info.rejected && info.rejected.length) console.log('   Rejected: ' + info.rejected.join(', '));
  } catch (e) {
    console.error('FAILED: ' + e.message);
    process.exit(1);
  }
})();
