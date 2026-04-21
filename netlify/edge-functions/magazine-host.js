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

export default async (request, context) => {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase();

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

  // 2) Known clean routes → rewrite (URL stays intact in browser)
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
