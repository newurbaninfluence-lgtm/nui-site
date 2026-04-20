// Capture clean screenshots of client sites for /for-authors showcase
// Uses system Chrome (no Puppeteer Chromium download needed)
const puppeteer = require('puppeteer-core');
const path = require('path');

const TARGETS = [
  { url: 'https://sonyameadows.com', out: 'assets/img/case-studies/sonya-meadows.jpg' },
  { url: 'https://larrycastleberry.com', out: 'assets/img/case-studies/larry-castleberry.jpg' },
];

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  for (const t of TARGETS) {
    console.log(`Capturing ${t.url} ...`);
    const page = await browser.newPage();
    try {
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 25000 });
      // Let hero video/lazy images settle
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({
        path: path.join(__dirname, '..', t.out),
        type: 'jpeg',
        quality: 82,
        clip: { x: 0, y: 0, width: 1440, height: 900 },
      });
      console.log(`  ✓ saved ${t.out}`);
    } catch (err) {
      console.error(`  ✗ ${t.url} failed: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('Done.');
})();
