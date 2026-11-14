// SPA fallback for clean URLs (direct post slugs, /tools/*, /blog, /page-*).
// Known slugs are served index.html (200). Anything else that looks like a
// post slug is checked against the live posts.json: if it is not a
// real post, tool, page or category, the Function answers 404 (with the site
// shell) instead of a soft-404 homepage, so Google never indexes typo URLs.
// Real files, /admin.html, /posts.json and /api/* pass through untouched.
const SEED_SLUGS = [
  'resize-signature-to-20kb-ssc-bank-forms','compress-image-to-50kb-ssc-upsc-forms',
  'marla-to-kanal-converter-plot-sizes','bijli-bill-calculator-how-bill-calculated',
  'salary-tax-slabs-2025-26-salaried-guide','income-tax-new-regime-fy-2025-26-rebate-explained',
  'how-to-calculate-zakat-gold-silver-cash','gst-calculator-add-remove-gst-guide',
  'cgpa-to-percentage-converter-guide','emi-calculator-extra-principal-payments-guide',
  'sip-calculator-monthly-investment-guide',
  'passport-size-photo-maker-35x45mm',
  'convert-pdf-to-jpg-without-losing-quality',
  'convert-images-to-pdf-free',
  'make-signature-transparent-png',
  'compress-pdf-to-100kb',
  'crop-photo-for-online-forms',
  'resize-image-for-whatsapp-profile-photo',
  'reduce-pdf-file-size-without-losing-quality',
  'compound-interest-how-your-money-grows',
  'fixed-deposit-calculator-guide-compare-fd-returns',
  'retirement-calculator-how-much-save-every-month',
  'home-loan-emi-how-much-house-can-you-afford',
  'how-to-file-income-tax-return-online-step-by-step',
  'how-credit-card-interest-is-calculated-avoid-it',
  'simple-interest-vs-compound-interest-explained',
  'loan-eligibility-how-banks-decide-how-much-you-can-borrow',
  'square-feet-to-marla-converter-plot-sizes',
  'kanal-to-acre-converter-land-sizes',
  'how-to-calculate-plot-price-per-marla',
  'house-construction-cost-per-square-foot-guide',
  'how-many-units-does-air-conditioner-use',
  'how-many-solar-panels-do-you-need-home',
  'what-internet-speed-do-you-actually-need',
  'how-to-read-water-meter-check-for-leaks',
  'how-to-calculate-exact-age-years-months-days',
  'how-to-calculate-days-between-two-dates',
  'percentage-calculator-guide-work-out-any-percentage',
  'how-to-calculate-grade-from-marks',
  'gpa-calculator-convert-marks-to-gpa',
  'bmi-calculator-what-your-bmi-means',
  'how-many-calories-do-you-need-per-day',
  'how-much-water-should-you-drink-per-day',
  'how-much-tip-should-you-leave',
  'how-to-calculate-discount-percentage',
  'how-to-convert-currency-without-losing-money-on-fees',
  'unit-converter-guide-length-weight-volume',
  'how-to-count-words-in-an-essay-or-article',
  'character-counter-why-character-limits-matter-on-forms',
  'how-to-calculate-due-date-from-last-period',
  'how-to-calculate-time-duration-between-two-times',
  'compress-heic-image-to-50kb','compress-image-to-200kb-without-losing-quality',
  'what-internet-speed-do-you-need-for-gaming','what-internet-speed-do-you-need-for-4k-streaming',
  'what-internet-speed-do-you-need-to-work-from-home','what-is-good-upload-speed-ping-latency-explained',
  'how-many-solar-panels-do-you-need-by-house-size','how-many-solar-panels-to-charge-an-ev-run-ac-off-grid',
  'how-to-calculate-exact-age-in-excel','retirement-calculator-in-excel-how-much-you-need',
  'how-to-read-a-digital-water-meter','signature-resize-to-20kb-ssc-ibps-gds-exams',
  'income-tax-new-regime-vs-old-regime-which-is-better','how-to-calculate-zakat-on-business-stocks-property','sip-calculator-vs-lumpsum-which-grows-more','passport-size-photo-maker-visa-sizes','resize-image-for-whatsapp-dp-without-cropping','how-to-file-late-income-tax-return-belated-revised','credit-card-interest-free-period-explained','fixed-deposit-tax-tds-rates-explained','house-construction-cost-breakdown-material-labour','what-internet-speed-mbps-means-measured','days-between-two-dates-in-excel-formula','how-to-calculate-percentage-increase-and-decrease','bmi-for-kids-and-teens-healthy-ranges','how-much-tip-for-delivery-uber-eats-doordash',
  'sip-calculator-swp-withdrawal-plan-explained',
  'sip-calculator-with-inflation-adjusted-returns',
  'generate-uuid-online-guide',
  'unix-epoch-converter-epoch-time-to-date',
  'base64-encoding-explained-guide',
  'sip-calculator-with-step-up-yearly-increase',
  'sip-xirr-calculator-real-returns-explained',
  'passport-size-photo-maker-a4-sheet-print',
  'passport-size-photo-maker-background-change-white',
  'passport-size-photo-maker-with-name-and-date',
  'convert-image-to-pdf-under-200kb',
  'compress-multiple-pdf-to-100kb-at-once',
  'compress-pdf-to-200kb-without-losing-quality',
  'resize-image-for-whatsapp-status',
  'compound-interest-excel-formula',
  'compound-interest-half-yearly-formula-explained',
  'compound-interest-loan-how-interest-grows',
  'compound-interest-questions-and-answers-exams',
  'fixed-deposit-calculator-excel-formula-sheet',
  'fixed-deposit-monthly-payout-interest-explained',
  'fixed-deposit-senior-citizen-rates-benefits',
  'how-long-will-my-money-last-in-retirement',
  'retirement-calculator-for-couples-plan-together',
  'retirement-calculator-for-government-employees',
  'retirement-countdown-calculator-days-left',
  'home-loan-emi-excel-formula-free-sheet',
  'home-loan-emi-per-lakh-10-20-year-table',
  'home-loan-emi-tax-benefit-old-new-regime',
  'home-loan-emi-tax-benefit-old-new-regime',
  'how-to-file-income-tax-return-for-deceased-person',
  'how-to-file-income-tax-return-for-pensioners',
  'how-to-file-nil-income-tax-return-online',
  'which-itr-form-should-you-file-itr-1-itr-4',
  'credit-card-balance-transfer-lower-interest',
  'credit-card-minimum-payment-trap',
  'credit-card-interest-on-cash-withdrawal',
  'credit-card-interest-vs-personal-loan-interest',
  'simple-interest-on-loans-emi-home-gold',
  'business-loan-eligibility-documents-msme',
  'car-loan-eligibility-how-much-you-can-get',
  'home-loan-eligibility-documents-salary',
  'personal-loan-eligibility-emi-calculator',
  'sq-ft-to-sq-meter-convert-land-area',
  'bijli-bill-calculator-by-appliance-watts',
  'bijli-bill-calculator-in-excel-formula',
  'how-to-check-bijli-bill-online-and-pay',
  'house-construction-cost-by-plot-size-20x30-30x40',
  'house-construction-cost-calculator-excel-template',
];
const STATIC_PAGES = ['about-us','contact','privacy-policy','disclaimer','terms-of-use'];
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  if (
    path === '/' || path === '/index.html' ||
    path === '/admin.html' || path === '/admin' || path === '/admin/' ||
    path === '/posts.json' || path === '/_redirects' ||
    path.startsWith('/api/') || (path.includes('.') && !path.startsWith('/tools/'))
  ) {
    // NOTE: /tools/* is excluded from the dotted-path pass-through, so a
    // literal /tools/${x.id} URL (Google found these in the JS source) is
    // decided by the Function (404 for unknown ids) instead of the
    // /tools/* -> index.html 200 rewrite in _redirects. Real dotted tool
    // URLs (tools/gold-rate-converter.html) still 301 via REDIRECTS below.
    // NOTE: /admin.html redirects to the clean URL /admin,
    // so /admin must pass through too — otherwise this catch-all treats
    // "admin" as a post slug and answers the site's 404 page.
    return context.next();
  }
const REDIRECTS = {
  'home': '/',
  'tools/bmi-calculator': '/tools/bmi',
  'tools/pakistan-salary-tax-calculator': '/tools/paktax',
  'blog/base64-encoding-explained-guide': '/base64-encoding-explained-guide',
  'blog/data-breach-what-to-do': '/privacy-policy',
  'tools/gold-rate-converter.html': '/tools/unit',
};
  const clean = path.replace(/\/+$/, '').replace(/^\/+/, '');
  if (REDIRECTS[clean]) return Response.redirect(new URL(REDIRECTS[clean], url), 301);
  const parts = path.replace(/^\/+/, '').split('/').filter(Boolean);
  const known =
    parts[0] === 'tools' || parts[0] === 'blog' ||
    parts[0].startsWith('page-') || STATIC_PAGES.includes(parts[0]) ||
    SEED_SLUGS.includes(parts[0]);
  let livePosts = null;
  if (!known && parts.length === 1) {
    // A future admin post slug is not in SEED_SLUGS: check live posts.json.
    try {
      const r = await fetch('https://raw.githubusercontent.com/hassananwarul11-rgb/smarttoolkit-blog-dashboard/main/posts.json', { cf: { cacheTtl: 300 } });
      if (r.ok) {
        const list = await r.json();
        livePosts = list;
        if (!Array.isArray(list) || !list.some((p) => p.slug === parts[0])) {
          const shell = await context.env.ASSETS.fetch(new URL('/index.html', url));
          return new Response(shell.body, { status: 404, headers: shell.headers });
        }
      }
    } catch (e) { /* fall through to index.html on fetch failure */ }
  }
  return serveWithMeta(context, url, parts, livePosts);
}

// ---------- server-side meta injection (SEO round 2) ----------
const POSTS_JSON_URL = 'https://raw.githubusercontent.com/hassananwarul11-rgb/smarttoolkit-blog-dashboard/main/posts.json';

function escAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function unesc(s) {
  return String(s ?? '').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}
function fieldAfter(text, start, field, prefix) {
  const pat = (prefix ? '(?:,|\\{)' : '') + field + ":'((?:[^'\\\\]|\\\\.)*)'";
  const m = new RegExp(pat).exec(text.slice(start, start + 8000));
  return m ? unesc(m[1]) : '';
}
function articleLd(p) {
  const g = [
    { '@type': 'Article', headline: p.title, description: p.meta, image: 'https://smarttoolkit.space/thumbs/' + p.slug + '.svg', mainEntityOfPage: 'https://smarttoolkit.space/' + p.slug, author: { '@type': 'Person', name: 'Ayesha', jobTitle: 'Editor, SmartToolkit' } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://smarttoolkit.space/' },
      { '@type': 'ListItem', position: 2, name: 'Blog & Guides', item: 'https://smarttoolkit.space/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: 'https://smarttoolkit.space/' + p.slug },
    ] },
  ];
  if (p.date) g[0].datePublished = p.date;
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': g });
}
function toolLd(x) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: x.t, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0' }, description: x.meta },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://smarttoolkit.space/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://smarttoolkit.space/tools' },
      { '@type': 'ListItem', position: 3, name: x.t, item: 'https://smarttoolkit.space/tools/' + x.id },
    ] },
  ] });
}
function postMetaFromHtml(html, slug) {
  const i = html.indexOf("slug:'" + slug + "'");
  if (i < 0) return null;
  const start = html.lastIndexOf("{id:'p", i);
  const seg = html.slice(start < 0 ? i : start, i + 8000);
  const title = fieldAfter(seg, 0, 'title');
  const seo = fieldAfter(seg, 0, 'seo');
  const meta = fieldAfter(seg, 0, 'meta');
  const date = fieldAfter(seg, 0, 'date');
  if (!seo || !meta) return null;
  return { title: seo, desc: meta, image: 'https://smarttoolkit.space/thumbs/' + slug + '.svg', canon: 'https://smarttoolkit.space/' + slug, ld: articleLd({ title: title || seo, meta, date, slug }) };
}
function toolMetaFromHtml(html, id) {
  const i = html.indexOf("id:'" + id + "'");
  if (i < 0) return null;
  const seg = html.slice(i, i + 3000);
  const t = fieldAfter(seg, 0, 't', true);
  const seo = fieldAfter(seg, 0, 'seo');
  const meta = fieldAfter(seg, 0, 'meta');
  if (!seo || !meta) return null;
  return { title: seo, desc: meta, image: 'https://smarttoolkit.space/shots/' + id + '.svg', canon: 'https://smarttoolkit.space/tools/' + id, ld: toolLd({ id, t: t || seo, meta }) };
}
function injectMeta(html, m) {
  const rep1 = (re, build) => { html = html.replace(re, function () { return build(Array.prototype.slice.call(arguments)); }); };
  rep1(/<title>[^<]*<\/title>/, () => '<title>' + escAttr(m.title) + '</title>');
  rep1(/(<meta[^>]*name="description"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.desc) + g[2]);
  rep1(/(<meta[^>]*property="og:title"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.title) + g[2]);
  rep1(/(<meta[^>]*property="og:description"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.desc) + g[2]);
  rep1(/(<meta[^>]*property="og:image"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.image) + g[2]);
  rep1(/(<meta[^>]*property="og:url"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.canon) + g[2]);
  rep1(/(<meta[^>]*name="twitter:title"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.title) + g[2]);
  rep1(/(<meta[^>]*name="twitter:description"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.desc) + g[2]);
  rep1(/(<meta[^>]*name="twitter:image"[^>]*content=")[^"]*(")/, (g) => g[1] + escAttr(m.image) + g[2]);
  rep1(/(<link[^>]*rel="canonical"[^>]*href=")[^"]*(")/, (g) => g[1] + escAttr(m.canon) + g[2]);
  if (m.ld) rep1(/<script id="ld-dynamic" type="application\/ld\+json">.*?<\/script>/, () => '<script id="ld-dynamic" type="application/ld+json">' + m.ld + '</script>');
  return html;
}
async function serveWithMeta(context, url, parts, livePosts) {
  const res = await context.env.ASSETS.fetch(new URL('/index.html', url));
  let html;
  try { html = await res.text(); } catch (e) { return res; }
  try {
    let m = null;
    if (parts[0] === 'tools' && parts[1]) {
      m = toolMetaFromHtml(html, parts[1]);
      if (!m) {
        // Unknown tool id (e.g. a literal /tools/${x.id} URL Google found by
        // scanning the JS source): real 404, not a 200 homepage shell, so
        // Google drops it instead of listing it as a canonical duplicate.
        const h0 = new Headers(res.headers);
        h0.delete('content-length');
        return new Response(html, { status: 404, headers: h0 });
      }
    } else if (parts.length === 1 && !STATIC_PAGES.includes(parts[0])) {
      m = postMetaFromHtml(html, parts[0]);
      if (!m) {
        let list = livePosts;
        if (!list) {
          try {
            const r = await fetch(POSTS_JSON_URL, { cf: { cacheTtl: 300 } });
            if (r.ok) list = await r.json();
          } catch (e) { /* ignore: fall through to plain shell */ }
        }
        if (Array.isArray(list)) {
          const p = list.find((x) => x.slug === parts[0]);
          if (p && p.seo && p.meta) {
            m = { title: p.seo, desc: p.meta, image: 'https://smarttoolkit.space/thumbs/' + p.slug + '.svg', canon: 'https://smarttoolkit.space/' + p.slug, ld: articleLd({ title: p.title || p.seo, meta: p.meta, date: p.date || '', slug: p.slug }) };
          }
        }
      }
    }
    if (m) {
      const out = injectMeta(html, m);
      const h = new Headers(res.headers);
      h.set('content-type', 'text/html;charset=UTF-8');
      h.delete('content-length');
      return new Response(out, { status: res.status, headers: h });
    }
  } catch (e) { /* fall through: serve the plain shell */ }
  const h2 = new Headers(res.headers);
  h2.delete('content-length');
  return new Response(html, { status: res.status, headers: h2 });
}
