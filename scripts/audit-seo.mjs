/**
 * Post-build technical SEO audit over dist/. Fails the process on any error.
 * Checks: unique <title>, description length, exactly one canonical & one H1,
 * heading order, no accidental noindex, image alt/width/height, internal links
 * resolve to prerendered files, sitemap ⊆ indexable pages, trailing-slash policy.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const SITE = 'https://zazieinstitute.org';

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!['assets', 'apps'].includes(name)) walk(p); }
    else if (name === 'index.html') pages.push(p);
  }
})(dist);

const errors = [];
const warnings = [];
const titles = new Map();
const descs = new Map();
const indexable = new Set();
const attr = (tag, a) => tag.match(new RegExp(`${a}="([^"]*)"`))?.[1];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\/$/, '');
  const url = route === '/' ? '/' : route;
  const where = `[${url}]`;

  const title = html.match(/<title>([^<]*)<\/title>/g) ?? [];
  if (title.length !== 1) errors.push(`${where} expected 1 <title>, found ${title.length}`);
  const t = title[0]?.replace(/<\/?title>/g, '') ?? '';
  if (t.length > 70) warnings.push(`${where} title ${t.length} chars: ${t.slice(0, 60)}…`);
  if (titles.has(t)) errors.push(`${where} duplicate title with ${titles.get(t)}`);
  titles.set(t, url);

  const desc = html.match(/<meta name="description" content="([^"]*)"/g) ?? [];
  if (desc.length !== 1) errors.push(`${where} expected 1 meta description, found ${desc.length}`);
  const d = attr(desc[0] ?? '', 'content') ?? '';
  if (d.length < 70) warnings.push(`${where} short description (${d.length})`);
  if (d.length > 165) warnings.push(`${where} long description (${d.length})`);
  if (descs.has(d)) errors.push(`${where} duplicate description with ${descs.get(d)}`);
  descs.set(d, url);

  const canon = html.match(/<link rel="canonical" href="([^"]*)"/g) ?? [];
  if (canon.length !== 1) errors.push(`${where} expected 1 canonical, found ${canon.length}`);
  const c = attr(canon[0] ?? '', 'href');
  if (c && c !== SITE + url) errors.push(`${where} canonical mismatch: ${c}`);
  if (c && c !== SITE + '/' && c.endsWith('/')) errors.push(`${where} canonical has trailing slash`);

  const robots = attr(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? '', 'content') ?? '';
  const noindex = robots.includes('noindex');
  if (!noindex) indexable.add(url);
  if (noindex && !['/404', '/search'].includes(url)) errors.push(`${where} unexpected noindex`);

  const h1 = html.match(/<h1[\s>]/g) ?? [];
  if (h1.length !== 1) errors.push(`${where} expected 1 <h1>, found ${h1.length}`);
  const hs = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
  for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) { warnings.push(`${where} heading skips h${hs[i-1]}→h${hs[i]}`); break; }

  if (!/<main[\s>]/.test(html)) errors.push(`${where} missing <main>`);
  if (!/<html lang="en"/.test(html)) errors.push(`${where} missing lang`);
  if (!/application\/ld\+json/.test(html)) warnings.push(`${where} no JSON-LD`);
  if (!/property="og:title"/.test(html)) errors.push(`${where} missing og:title`);

  for (const img of html.match(/<img [^>]*>/g) ?? []) {
    if (!/ alt="/.test(img)) errors.push(`${where} <img> without alt: ${img.slice(0, 80)}`);
    if (!/ width="/.test(img) || !/ height="/.test(img)) warnings.push(`${where} <img> without dimensions: ${img.slice(0, 80)}`);
  }
  for (const m of html.matchAll(/<a [^>]*href="([^"#?]*)/g)) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (/\.(xml|png|svg|ico|html|txt|pdf)$/.test(href)) { if (!existsSync(join(dist, href))) errors.push(`${where} broken asset link ${href}`); continue; }
    if (href !== '/' && href.endsWith('/')) errors.push(`${where} internal link with trailing slash: ${href}`);
    const target = join(dist, href, 'index.html');
    if (!existsSync(target)) errors.push(`${where} broken internal link ${href}`);
  }
}

// Sitemap consistency
const sm = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1].replace(SITE, '') || '/');
for (const l of locs) if (!indexable.has(l)) errors.push(`sitemap lists non-indexable or missing page ${l}`);
for (const p of indexable) if (!locs.includes(p)) errors.push(`indexable page missing from sitemap: ${p}`);
if (new Set(locs).size !== locs.length) errors.push('sitemap has duplicate URLs');
const robotsTxt = readFileSync(join(dist, 'robots.txt'), 'utf8');
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`)) errors.push('robots.txt does not reference sitemap');

console.log(`[audit] ${pages.length} pages, ${indexable.size} indexable, ${locs.length} sitemap URLs`);

/* ---------- JSON-LD entity-graph integrity ---------- */
const { auditGraph } = await import('./lib/jsonld-graph.mjs');
const graph = auditGraph(root);
errors.push(...graph.errors.map(e => `[graph] ${e}`));

const s = graph.stats;
console.log(
  `[graph] ${s.blocks} JSON-LD blocks across ${s.pages} pages · ` +
    `${s.declaredNodes} declared nodes · ${s.referencedIds} @id pointers · ` +
    `${s.resolvedEdges} resolved cross-node edges · ${s.dangling} dangling`
);
console.log(`[graph] ${s.typesUsed} distinct schema.org types used (vocabulary: ${s.vocabulary.types} types, ${s.vocabulary.props} properties)`);

// Entity-class census: evidence that the institutional graph is actually interlocking.
const census = new Map();
for (const id of graph.declared.keys()) {
  const cls = id.includes('#department-') ? 'Department'
    : id.includes('#division-') ? 'Division'
    : id.includes('#program-') ? 'ResearchProject'
    : id.includes('#grant-') ? 'MonetaryGrant'
    : id.includes('#course-') ? 'Course/CourseInstance'
    : id.includes('#term-') ? 'DefinedTerm'
    : id.includes('#facility-') ? 'Place (facility)'
    : id.includes('#person') ? 'Person'
    : id.includes('#work') ? 'CreativeWork'
    : id.includes('#place') ? 'Place (field station)'
    : id.includes('#app') ? 'SoftwareApplication'
    : id.includes('#dataset') ? 'Dataset'
    : id.includes('#collection') ? 'CollectionPage'
    : id.includes('#vocabulary') ? 'DefinedTermSet'
    : id.includes('#catalog') ? 'DataCatalog'
    : id === `${SITE}/#organization` ? 'ResearchOrganization'
    : id === `${SITE}/#website` ? 'WebSite'
    : 'Other';
  census.set(cls, (census.get(cls) ?? 0) + 1);
}
console.log('[graph] declared node census: ' + [...census.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(', '));

for (const w of warnings.slice(0, +(process.env.AUDIT_MAX_WARN ?? 40))) console.warn('  warn', w);
if (warnings.length > 40) console.warn(`  … ${warnings.length - 40} more warnings`);
for (const e of errors) console.error('  ERROR', e);
console.log(`[audit] ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
