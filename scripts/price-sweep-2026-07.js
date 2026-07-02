// NUI pricing sweep — 2026-07-02. Single-pass simultaneous replacement per file.
const fs = require('fs');
const path = '/Users/farenyoung/nui-site';

function sweep(file, map, protect = []) {
  const p = `${path}/${file}`;
  if (!fs.existsSync(p)) return console.log(`SKIP (missing): ${file}`);
  let s = fs.readFileSync(p, 'utf8');
  const orig = s;
  // Protect exact phrases from the map
  protect.forEach((ph, i) => { s = s.split(ph).join(`\u0001P${i}\u0001`); });
  // Build single-pass alternation, longest keys first
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  const rx = new RegExp(keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  s = s.replace(rx, m => map[m]);
  // Restore protected
  protect.forEach((ph, i) => { s = s.split(`\u0001P${i}\u0001`).join(ph); });
  if (s !== orig) {
    fs.writeFileSync(p + '.pricebak', orig);
    fs.writeFileSync(p, s);
    console.log(`SWEPT: ${file}`);
  } else console.log(`no change: ${file}`);
}

const CORE = {
  'Save $4,000+': 'Save thousands',
  '$12,500': '$6,500',
  '$2,497/mo': '$1,997/mo',
  '$2,497': '$1,997',
  '$1,497/mo': '$997/mo',
  '$1,497': '$997',
  '$497/mo': '$397/mo',
  '$497': '$397',
  '$7,000+': '$6,500+',
  '$4,500': '$2,500',
  '$5,500': '$3,500',
  '$1,500': '$1,000',
  '$1,200': '$1,000'
};
const ECOM = ['e-commerce stores from $5,500', 'ecommerce stores from $5,500', 'E-commerce stores from $5,500'];

[
  'index.html',
  'services/brand-identity-packages-detroit.html',
  'services/brand-kit-detroit.html',
  'services/brand-system-detroit.html',
  'services/branding-agency-detroit.html',
  'services/brand-guidelines-detroit.html',
  'services/logo-design-detroit.html',
  'services/business-website-detroit.html',
  'services/web-design-detroit.html',
  'services/brand-heavy-marketing-bundle-detroit.html',
  'services/event-team-detroit.html',
  'services/design-subscriptions.html',
  'services/social-media-management-detroit.html',
  'services/marketing-automation-detroit.html'
].forEach(f => sweep(f, CORE, ECOM));

// Digital Staff: own map (397 target collides with core output otherwise)
sweep('services/digital-staff-detroit.html', {
  '$197/mo': '$147/mo', '$197': '$147',
  '$397/mo': '$297/mo', '$397': '$297'
});

// Co-Sign / press: $3,500 means the TOP press tier here, not websites
sweep('services/press-feature-detroit.html', {
  '$1,500': '$1,000', '$3,500': '$2,500'
});

console.log('DONE');
