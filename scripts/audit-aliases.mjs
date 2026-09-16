/**
 * URL alias audit — the acceptance test for "old URLs still work".
 *
 * Verifies, against the built dist/:
 *   1. host artifacts are in sync with scripts/alias-registry.mjs (no drift)
 *   2. every 301 target resolves to a real page or file in dist/
 *   3. no alias shadows a canonical page (nothing that exists is redirected away,
 *      except the deliberate cleanUrl/case-fold canonicalisations)
 *   4. no redirect chains (a target is never itself the source of another rule)
 *   5. retired surfaces (410) do not exist as pages in dist/
 *   6. the Vercel middleware matcher cannot intercept a canonical page
 *   7. dist/ carries the host files (/410.html, /_redirects, /aliases.json …)
 *   8. a smoke table of representative historical URLs answers the expected code
 *   9. host limits are respected (vercel ≤ 2048, cloudflare 2000 static + 100 dynamic)
 *
 * Usage: npm run audit:aliases   (requires `npm run build` first)
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registry, resolveAlias } from './alias-registry.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const errors = [];
const notes = [];
const reg = registry();

const rel = (p) => p.replace(/^\//, '');

/* ---------- 1. drift -------------------------------------------------- */
console.log('[aliases] 1/9 host artifacts in sync with the registry');
try {
  execFileSync(process.execPath, [resolve(root, 'scripts/build-alias-rules.mjs'), '--check'], {
    cwd: root,
    stdio: 'pipe'
  });
} catch (error) {
  const out = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
  for (const line of out.split('\n').filter((l) => l.includes('ERROR'))) errors.push(`host config drift — ${line.replace('ERROR', '').trim()}`);
  if (!errors.length) errors.push(`host config drift — ${out}`);
}

/* ---------- dist presence --------------------------------------------- */
if (!existsSync(dist)) {
  console.error('[aliases] dist/ not found — run `npm run build` first.');
  process.exit(1);
}
const pageExists = (path) => existsSync(join(dist, rel(path), 'index.html'));
const fileExists = (path) => existsSync(join(dist, rel(path))) && statSync(join(dist, rel(path))).isFile();
const targetResolves = (to) => pageExists(to) || fileExists(to) || to === '/';

/* ---------- 2. targets resolve ---------------------------------------- */
console.log('[aliases] 2/9 every alias target resolves inside dist/');
const checkTarget = (to, source) => {
  if (!targetResolves(to)) errors.push(`target missing from dist/: ${source} → ${to}`);
};
for (const rule of reg.exact) {
  if (rule.status !== 301 || rule.from === rule.to) continue;
  checkTarget(rule.to, rule.from);
}
for (const rule of reg.prefix) {
  if (rule.splat) {
    // sample with a real record id from the target section so the check proves
    // the handle survives the rewrite
    const real = reg.canonicalPaths.find((p) => p.startsWith(`${rule.to}/`) && p.split('/').length === 3);
    const suffix = real ? `/${real.split('/')[2]}` : '';
    checkTarget(`${rule.to}${suffix}`, `${rule.from}${suffix || '/*'}`);
  } else {
    checkTarget(rule.to, `${rule.from}/*`);
  }
}
for (const rule of reg.query) checkTarget(rule.to, `${rule.path}?${rule.key}`);
for (const rule of reg.cleanUrl) {
  // sample the pattern with a real record id from that section
  const section = rule.from.split('/')[1];
  const real = reg.canonicalPaths.find((p) => p.startsWith(`/${section}/`) && p.split('/').length === 3);
  const id = real ? real.split('/')[2] : 'sample-id';
  checkTarget(rule.to.replace(':id', id), rule.from.replace(':id', id));
}
for (const rule of reg.goneExact) if (pageExists(rule.from)) errors.push(`410 surface still exists in dist/: ${rule.from}`);

/* ---------- 3. no shadowing of canonical pages ------------------------ */
console.log('[aliases] 3/9 no alias shadows a canonical page');
for (const rule of reg.exact) {
  if (rule.class === 'cleanurl' || rule.class === 'case-fold') continue;
  if (pageExists(rule.from) && rule.from !== rule.to) errors.push(`alias shadows a real page: ${rule.from}`);
  if (fileExists(rule.from) && !rule.from.endsWith('.html')) notes.push(`alias shadows a static file: ${rule.from}`);
}
for (const rule of reg.prefix) {
  if (rule.from.endsWith('-')) continue; // fragment rules cannot shadow a page
  for (const path of reg.canonicalPaths) {
    if (path.startsWith(`${rule.from}/`)) errors.push(`prefix alias would hide a canonical page: ${path} (rule ${rule.from})`);
  }
}

/* ---------- 4. no chains ---------------------------------------------- */
console.log('[aliases] 4/9 no redirect chains');
const exactSources = new Set(reg.exact.filter((r) => r.status === 301 && r.class !== 'cleanurl' && r.class !== 'case-fold').map((r) => r.from));
const prefixSources = reg.prefix.map((r) => r.from);
for (const rule of [...reg.exact, ...reg.goneExact]) {
  if (rule.status !== 301 || rule.from === rule.to) continue;
  const to = rule.to;
  const chained =
    exactSources.has(to) ||
    prefixSources.some((from) => (from.endsWith('-') ? to.startsWith(from) : to.startsWith(`${from}/`)));
  if (chained && to !== rule.from) errors.push(`redirect chain: ${rule.from} → ${to} (${to} is itself an alias source)`);
}

/* ---------- 5. host runtimes behave as declared ---------------------- */
console.log('[aliases] 5/9 host runtimes (middleware.ts + Cloudflare Pages Function) answer as declared');

/** Evaluate the generated TypeScript middleware without a build step. */
async function loadMiddleware() {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const file = resolve(root, 'middleware.ts');
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
  }).outputText;
  const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  return { middleware: mod.default, matcher: mod.config.matcher };
}

const callMiddleware = async (middleware, path, search = '') => {
  const response = await middleware(new Request(`https://zazieinstitute.org${path}${search}`));
  if (!response) return { status: 0, location: null };
  return { status: response.status, location: response.headers.get('Location') };
};

const cfModule = await import(pathToFileURL(resolve(root, 'deploy/cloudflare-pages/functions/_middleware.js')).href);
const callCf = async (path, search = '') => {
  const response = await cfModule.onRequest({
    request: new Request(`https://zazieinstitute.org${path}${search}`),
    env: {},
    next: () => new Response('asset-server', { status: 200, headers: { 'x-fallthrough': 'yes' } })
  });
  if (response.headers.get('x-fallthrough') === 'yes') return { status: 0, location: null };
  return { status: response.status, location: response.headers.get('Location') };
};

const { middleware, matcher } = await loadMiddleware();
if (!Array.isArray(matcher) || !matcher.length) errors.push('middleware.ts declares no matcher');
notes.push(`middleware matcher: ${matcher.join(' ')}`);

const HOST_CASES = [
  ['/logs/LOG-330', '', 301, '/research-notes/log-330'],
  ['/people/PERSON-003', '', 301, '/fellows/fellow-001'],
  ['/prototypes/ZIAA-PROTO-003', '', 301, '/prototypes'],
  ['/Synthesis-Signal', '', 301, '/synthesis-signal'],
  ['/PROTOTYPES/PROT-001', '', 301, '/prototypes/prot-001'],
  ['/exhibitions', '', 410, null],
  ['/EXHIB-2025-A', '', 410, null],
  ['/archives/exhib-2025-a-catalog.pdf', '', 410, null],
  ['/timeline/2024', '', 410, null],
  ['/about', '', 0, null],
  ['/prototypes', '', 0, null],
  ['/apps/void-oculus/index.html', '', 0, null],
  ['/papers/essay-2022-01.pdf', '', 0, null],
  ['/404', '', 0, null],
  ['/about/', '', 0, null]
];
for (const [path, search, status, location] of HOST_CASES) {
  for (const [label, call] of [
    ['middleware.ts', (p, q) => callMiddleware(middleware, p, q)],
    ['cloudflare-pages/_middleware.js', callCf]
  ]) {
    const got = await call(path, search);
    const locationTail = got.location ? got.location.replace('https://zazieinstitute.org', '') : null;
    if (got.status !== status || (location && locationTail !== location)) {
      errors.push(`${label}: ${path}${search} → ${got.status || 'fallthrough'} ${locationTail ?? ''} (expected ${status || 'fallthrough'} ${location ?? ''})`);
    }
  }
}

// The strongest safety property: neither runtime may touch a canonical page.
let touched = 0;
for (const path of reg.canonicalPaths) {
  const got = await callMiddleware(middleware, path);
  if (got.status !== 0) {
    touched += 1;
    if (touched < 6) errors.push(`middleware redirects a canonical page: ${path} → ${got.status} ${got.location}`);
  }
}
if (touched >= 6) errors.push(`middleware redirects ${touched} canonical pages (${errors.length} shown)`);
for (const path of reg.canonicalPaths) {
  const got = await callCf(path);
  if (got.status !== 0) errors.push(`cloudflare function answers a canonical page: ${path} → ${got.status}`);
}
notes.push(`runtimes: ${reg.canonicalPaths.length} canonical paths fall through untouched in both host runtimes`);

/* ---------- 6. dist artifacts ----------------------------------------- */
console.log('[aliases] 6/9 dist/ carries the host files');
for (const file of ['410.html', '404.html', '_redirects', '_headers', 'aliases.json', 'sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!existsSync(join(dist, file))) errors.push(`dist/${file} missing (prerender should emit it)`);
}
// The published machine-readable registry must describe the same surface.
const published = JSON.parse(readFileSync(resolve(root, 'public/aliases.json'), 'utf8'));
const publishedCounts = published.counts ?? {};
for (const key of ['exact', 'prefix', 'gone', 'query', 'caseFold', 'cleanUrl', 'canonical']) {
  if (publishedCounts[key] !== reg.counts[key]) {
    errors.push(`public/aliases.json count ${key}=${publishedCounts[key]} but registry says ${reg.counts[key]}`);
  }
}
if (published.exact.length !== reg.counts.exact) errors.push('public/aliases.json exact table is out of step with the registry');
if (published.canonicalPaths.length !== reg.counts.canonical) errors.push('public/aliases.json canonicalPaths is out of step with the registry');
for (const rule of published.exact) {
  if (!published.provenance[rule.class]) errors.push(`public/aliases.json has no provenance for class ${rule.class}`);
}

const publicRedirects = readFileSync(resolve(root, 'public/_redirects'), 'utf8');
const distRedirects = existsSync(join(dist, '_redirects')) ? readFileSync(join(dist, '_redirects'), 'utf8') : '';
if (publicRedirects !== distRedirects) errors.push('dist/_redirects differs from public/_redirects');
const goneHtml = existsSync(join(dist, '410.html')) ? readFileSync(join(dist, '410.html'), 'utf8') : '';
if (goneHtml && !/noindex/.test(goneHtml)) errors.push('dist/410.html is not noindex');

// Canonical policy for surfaces that cannot carry a <link rel=canonical> itself.
/** Parse the line-based `_headers` format into source → header text. */
function headerBlocks(text) {
  const blocks = new Map();
  let source = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      source = raw.trim();
      blocks.set(source, []);
      continue;
    }
    if (source) blocks.get(source).push(raw.trim());
  }
  return blocks;
}

const distHeaderBlocks = headerBlocks(existsSync(join(dist, '_headers')) ? readFileSync(join(dist, '_headers'), 'utf8') : '');
for (const [source, target] of [
  ['/papers/*', '/papers'],
  ['/apps/void-oculus/*', '/void-oculus']
]) {
  const lines = distHeaderBlocks.get(source);
  if (!lines) errors.push(`dist/_headers is missing the ${source} block`);
  else if (!lines.some((l) => l.includes('rel="canonical"') && l.includes(target))) {
    errors.push(`dist/_headers has no canonical Link for ${source} → ${target}`);
  }
}

const vercelLinkValues = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'))
  .headers.flatMap((h) => h.headers.filter((k) => k.key === 'Link').map((k) => `${h.source} ${k.value}`));
if (!vercelLinkValues.some((v) => v.includes('/papers') && v.includes('rel="canonical"'))) {
  errors.push('vercel.json carries no canonical Link header for /papers/*');
}

/* ---------- 7. sitemap cleanliness ------------------------------------ */
console.log('[aliases] 7/9 sitemap lists canonical paths only');
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://zazieinstitute.org', '') || '/');
const aliasSources = new Set([
  ...reg.exact.filter((r) => r.class !== 'cleanurl' && r.class !== 'case-fold').map((r) => r.from),
  ...reg.goneExact.map((r) => r.from)
]);
for (const loc of locs) if (aliasSources.has(loc)) errors.push(`sitemap contains an alias/gone path: ${loc}`);

/* ---------- 8. smoke table -------------------------------------------- */
console.log('[aliases] 8/9 smoke table (the classes the registry must cover)');
const SMOKE = [
  // [path, search, expected kind, expected target/status]
  ['/logs', '', 'redirect', '/research-notes'],
  ['/logs/LOG-330', '', 'redirect', '/research-notes/log-330'],
  ['/archives', '', 'gone', '/410'],
  ['/lab-logs', '', 'redirect', '/research-notes'],
  ['/dashboard', '', 'redirect', '/'],
  ['/vault/INC-2021-01', '', 'redirect', '/post-mortems/inc-2021-01'],
  ['/people', '', 'redirect', '/fellows'],
  ['/people/PERSON-003', '', 'redirect', '/fellows/fellow-001'],
  ['/people/PERSON-004', '', 'redirect', '/fellows'],
  ['/instruments', '', 'redirect', '/prototypes'],
  ['/policies', '', 'redirect', '/legal/institutional-status'],
  ['/timeline', '', 'redirect', '/about'],
  ['/prototypes/ZIAA-PROTO-003', '', 'redirect', '/prototypes'],
  ['/ZIAA-PAT-031', '', 'redirect', '/patents'],
  ['/papers/ZIAA-PAPER-001', '', 'redirect', '/papers'],
  ['/logs/ZIAA-LOG-2024.02.14', '', 'redirect', '/research-notes'],
  ['/prototypes/PROT-001', '', 'redirect', '/prototypes/prot-001'],
  ['/research-notes/LOG-330', '', 'redirect', '/research-notes/log-330'],
  ['/about/index.html', '', 'redirect', '/about'],
  ['/prototypes/prot-001.html', '', 'redirect', '/prototypes/prot-001'],
  ['/void-oculus/index.html', '', 'redirect', '/void-oculus'],
  ['/index.html', '', 'redirect', '/'],
  ['/feed', '', 'redirect', '/feed.xml'],
  ['/rss.xml', '', 'redirect', '/feed.xml'],
  ['/sitemap-index.xml', '', 'redirect', '/sitemap.xml'],
  ['/SYNTHESIS-SIGNAL', '', 'redirect', '/synthesis-signal'],
  ['/interference-archive', '', 'redirect', '/disciplines/signal-archaeology'],
  ['/ziaa-dsp', '', 'redirect', '/disciplines/generative-software'],
  ['/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY', '', 'redirect', '/'],
  ['/prototypes', '?discipline=Signal%20Archaeology', 'redirect', '/disciplines/signal-archaeology'],
  ['/prototypes', '?division=Material+Acoustics', 'redirect', '/disciplines'],
  ['/', '?tab=vault', 'redirect', '/post-mortems'],
  ['/prototypes', '?status=Active', 'redirect', '/prototypes'],
  ['/papers', '?id=ZIAA-PAPER-001', 'redirect', '/papers'],
  ['/exhibitions', '', 'gone', '/410'],
  ['/exhibitions/EXHIB-2023-C', '', 'gone', '/410'],
  ['/EXHIB-2025-A', '', 'gone', '/410'],
  ['/archives/exhib-2025-a-catalog.pdf', '', 'gone', '/410'],
  ['/timeline/2024', '', 'gone', '/410'],
  ['/people/nonexistent', '', 'gone', '/410'],
  ['/search/anything', '', 'gone', '/410'],
  // canonical surfaces must stay untouched
  ['/', '', 'none', '/'],
  ['/prototypes', '', 'none', '/prototypes'],
  ['/prototypes/prot-001', '', 'none', '/prototypes/prot-001'],
  ['/disciplines/signal-archaeology', '', 'none', '/disciplines/signal-archaeology'],
  ['/apps/void-oculus/index.html', '', 'none', '/apps/void-oculus/index.html'],
  ['/papers/essay-2022-01.pdf', '', 'none', '/papers/essay-2022-01.pdf'],
  ['/search', '?q=thorne', 'none', '/search'],
  ['/410', '', 'none', '/410'],
  ['/404', '', 'none', '/404'],
  ['/aliases.json', '', 'none', '/aliases.json']
];
let smokeFailures = 0;
for (const [path, search, kind, expectation] of SMOKE) {
  const hit = resolveAlias(path, { search, channel: 'strict' });
  const got = hit.kind === 'redirect' ? hit.to : hit.kind === 'gone' ? '/410' : hit.to;
  if (hit.kind !== kind || got !== expectation) {
    smokeFailures += 1;
    errors.push(`smoke: ${path}${search} → ${hit.kind}:${got} (expected ${kind}:${expectation})`);
  }
}
notes.push(`smoke table: ${SMOKE.length - smokeFailures}/${SMOKE.length} historical addresses answered as declared`);

/* ---------- 9. host limits -------------------------------------------- */
console.log('[aliases] 9/9 host limits');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
if ((vercel.redirects ?? []).length > 2048) errors.push(`vercel.json redirects ${vercel.redirects.length} > 2048`);
const redirectsFile = publicRedirects.split('\n').filter((l) => l && !l.startsWith('#'));
const cfStatic = redirectsFile.filter((l) => !l.split(' ')[0].includes('*') && !l.split(' ')[0].includes(':')).length;
const cfDynamic = redirectsFile.length - cfStatic;
if (cfStatic > 2000) errors.push(`_redirects static rules ${cfStatic} > 2000 (Cloudflare Pages limit)`);
if (cfDynamic > 100) errors.push(`_redirects dynamic rules ${cfDynamic} > 100 (Cloudflare Pages limit)`);

/* ---------- report ----------------------------------------------------- */
const counts = reg.counts;
console.log(
  `[aliases] registry: ${counts.exact} exact · ${counts.prefix} prefix · ${counts.gone} gone(410) · ${counts.query} query · ` +
    `${counts.caseFold} case-fold · ${counts.cleanUrl} cleanUrl · ${counts.canonical} canonical paths`
);
console.log(`[aliases] hosts: vercel.json ${vercel.redirects.length} rules · middleware matcher ${matcher.length} patterns · _redirects ${cfStatic}+${cfDynamic}`);
for (const note of notes) console.log(`  · ${note}`);

if (errors.length) {
  console.error(`\n[aliases] FAILED with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 40)) console.error('  ✗', error);
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`);
  process.exit(1);
}
console.log('[aliases] OK — every historical address resolves with a real status code.');
