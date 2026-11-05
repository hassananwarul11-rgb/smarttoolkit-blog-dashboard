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
];
const STATIC_PAGES = ['about-us','contact','privacy-policy','disclaimer','terms-of-use'];
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  if (
    path === '/' || path === '/index.html' ||
    path === '/admin.html' || path === '/admin' || path === '/admin/' ||
    path === '/posts.json' || path === '/_redirects' ||
    path.startsWith('/api/') || path.includes('.')
  ) {
    // NOTE: /admin.html redirects to the clean URL /admin,
    // so /admin must pass through too — otherwise this catch-all treats
    // "admin" as a post slug and answers the site's 404 page.
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
