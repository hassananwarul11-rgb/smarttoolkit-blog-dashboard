// SPA fallback for direct post slugs: a post URL is just /<slug> (no /posts/ prefix).
// Cloudflare Pages has no file at that path, so this Function serves index.html
// for it and the site's JS router opens the article. Real files, the admin page,
// posts.json and /api/* are passed through untouched.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  if (
    path === '/' || path === '/index.html' || path === '/admin.html' ||
    path === '/posts.json' || path === '/_redirects' ||
    path.startsWith('/api/') || path.includes('.')
  ) {
    return context.next();
  }
  return context.env.ASSETS.fetch(new URL('/index.html', url));
}
