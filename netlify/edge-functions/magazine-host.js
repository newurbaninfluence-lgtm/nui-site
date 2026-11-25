/**
 * magazine-host.js — Routes newurbanmagazine.com to the /magazine/ subtree.
 *
 * Netlify Edge Function. Runs before netlify.toml redirects & origin.
 * Netlify's redirects don't support Host conditions, so host-based
 * routing has to live here.
 *
 * Behavior on newurbanmagazine.com + www.newurbanmagazine.com:
 *   /                 → rewrite to /magazine/index.html
 *   /article?slug=x   → rewrite to /magazine/article.html?slug=x
 *   /awards           → rewrite to /magazine/awards.html
 *   /subscribe        → rewrite to /magazine/subscribe.html
 *   /submit           → rewrite to /magazine/submit.html
 *   /sitemap.xml      → rewrite to /magazine/sitemap.xml
 *   /magazine/*       → 301 redirect to clean URL (strip prefix)
 *   /assets/*, /images/*, /.netlify/*, *.css/js/etc → pass through
 *   anything else     → rewrite to /magazine/index.html (soft 404)
 *
 * All other hostnames (newurbaninfluence.com, previews, etc.) pass
 * through untouched — normal netlify.toml rules process them.
 */

const MAGAZINE_HOSTS = new Set([
  'newurbanmagazine.com',
  'www.newurbanmagazine.com',
]);

const ROUTE_MAP = {
  '/': '/magazine/index.html',
  '/article': '/magazine/article.html',
  '/awards': '/magazine/awards.html',
  '/subscribe': '/magazine/subscribe.html',
  '/submit': '/magazine/submit.html',
  '/sitemap.xml': '/magazine/sitemap.xml',
};

// .html-suffix variants → 301 to the clean URL (no .html).
// Covers legacy links like /magazine/article.html that get stripped
// to /article.html and would otherwise hit the unknown-path fallback.
const HTML_SUFFIX_REDIRECT = {
  '/index.html': '/',
  '/article.html': '/article',
  '/awards.html': '/awards',
  '/subscribe.html': '/subscribe',
  '/submit.html': '/submit',
};

const ASSET_PREFIXES = [
  '/assets/',
  '/images/',
  '/icons/',
  '/fonts/',
  '/.netlify/',
];

const ASSET_FILE_RE = /\.(css|js|mjs|map|png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf|eot|xml|txt|json|pdf|mp4|webm|mp3|wav)$/i;

const EXACT_PASSTHROUGH = new Set([
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sw.js',
]);

// ── Bot guard (runs on every host) ──────────────────────────────────
// 1) Hacker scanners probe for password files, PHP and WordPress pages.
//    This site has none of those, so answer with a plain 404.
// 2) Private project files (notes, scripts, database files, backups)
//    live in the repo but must never be downloadable.
const SCANNER_RE = /(\/\.(env|git|svn|hg|aws|ssh|htaccess|htpasswd|DS_Store|vscode|idea)(\/|\.|$)|\.(php\d?|phtml|asp|aspx|jsp|cgi|bak|old|orig|swp|sql|sqlite|db|log|ini|yml|yaml|lock)$|\/wp-(admin|login|content|includes|json)|xmlrpc|\/cgi-bin\/|phpmyadmin|\/vendor\/phpunit|\/server-status|\/actuator)/i;
const PRIVATE_PREFIXES = ['/docs/', '/scripts/', '/supabase/', '/supabase-migrations/', '/.backups/', '/_to_delete/', '/configs/', '/netlify/'];
const PRIVATE_FILE_RE = /^\/([A-Z0-9_-]+\.md|package(-lock)?\.json|deno\.lock|portal-netlify\.toml|netlify\.toml|[a-z0-9-]+-migration\.sql)$/;

function isBlocked(path) {
  return SCANNER_RE.test(path) ||
    PRIVATE_PREFIXES.some((p) => path.startsWith(p)) ||
    PRIVATE_FILE_RE.test(path);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase();

  // Turn away scanners and keep private files private (all hosts)
  if (isBlocked(url.pathname)) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600', 'X-Robots-Tag': 'noindex' } });
  }

  // Not a magazine-host request — let everything else handle it.
  if (!MAGAZINE_HOSTS.has(host)) return;

  const path = url.pathname;

  // 1) Strip legacy /magazine/ prefix → 301 to the clean URL
  if (path === '/magazine' || path.startsWith('/magazine/')) {
    const cleanPath = path.replace(/^\/magazine/, '') || '/';
    return Response.redirect(
      `https://${host}${cleanPath}${url.search}`,
      301,
    );
  }

  // 2) .html-suffix paths → 301 to clean URL (cleans legacy links)
  if (HTML_SUFFIX_REDIRECT[path]) {
    return Response.redirect(
      `https://${host}${HTML_SUFFIX_REDIRECT[path]}${url.search}`,
      301,
    );
  }

  // 3) Known clean routes → rewrite (URL stays intact in browser)
  if (ROUTE_MAP[path]) {
    const rewriteUrl = new URL(url);
    rewriteUrl.pathname = ROUTE_MAP[path];
    return context.rewrite(rewriteUrl);
  }

  // 3) Static assets & Netlify internals pass through untouched
  if (
    EXACT_PASSTHROUGH.has(path) ||
    ASSET_PREFIXES.some((p) => path.startsWith(p)) ||
    ASSET_FILE_RE.test(path)
  ) {
    return;
  }

  // 4) Unknown path on magazine host → soft fallback to magazine index
  const fallback = new URL(url);
  fallback.pathname = '/magazine/index.html';
  return context.rewrite(fallback);
};

export const config = {
  path: '/*',
};
