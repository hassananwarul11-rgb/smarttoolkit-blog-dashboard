// SPA fallback for clean URLs (direct post slugs, /tools/*, /blog, /page-*).
// Known slugs are served index.html (200). Anything else that looks like a
// post slug is checked against the live posts.json on GitHub: if it is not a
// real post, tool, page or category, the Function answers 404 (with the site
// shell) instead of a soft-404 homepage, so Google never indexes typo URLs.
// Real files, /admin.html, /posts.json and /api/* pass through untouched.
const SEED_SLUGS = [
  'resize-signature-to-20kb-ssc-bank-forms','compress-image-to-50kb-ssc-upsc-forms',
  'marla-to-kanal-converter-plot-sizes','bijli-bill-calculator-how-bill-calculated',
  'salary-tax-slabs-2025-26-salaried-guide','income-tax-new-regime-fy-2025-26-rebate-explained',
  'how-to-calculate-zakat-gold-silver-cash','gst-calculator-add-remove-gst-guide',
  'cgpa-to-percentage-converter-guide','emi-calculator-extra-principal-payments-guide',
  'sip-calculator-monthly-investment-guide'
];
const STATIC_PAGES = ['about-us','contact','privacy-policy','disclaimer','terms-of-use'];
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
  const parts = path.replace(/^\/+/, '').split('/').filter(Boolean);
  const known =
    parts[0] === 'tools' || parts[0] === 'blog' ||
    parts[0].startsWith('page-') || STATIC_PAGES.includes(parts[0]) ||
    SEED_SLUGS.includes(parts[0]);
  if (!known && parts.length === 1) {
    // A future admin post slug is not in SEED_SLUGS: check live posts.json.
    try {
      const r = await fetch('https://raw.githubusercontent.com/hassananwarul11-rgb/smarttoolkit-blog-dashboard/main/posts.json', { cf: { cacheTtl: 300 } });
      if (r.ok) {
        const list = await r.json();
        if (!Array.isArray(list) || !list.some((p) => p.slug === parts[0])) {
          const shell = await context.env.ASSETS.fetch(new URL('/index.html', url));
          return new Response(shell.body, { status: 404, headers: shell.headers });
        }
      }
    } catch (e) { /* fall through to index.html on fetch failure */ }
  }
  return context.env.ASSETS.fetch(new URL('/index.html', url));
}
