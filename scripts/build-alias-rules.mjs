/**
 * Generates every routing artifact from scripts/alias-registry.mjs.
 *
 *   vercel.json                                  redirects + canonical headers (308 on the wire)
 *   middleware.ts                                Vercel Routing Middleware: literal 301 + 410 + facet
 *                                                canonicalisation for alias-shaped paths only
 *   public/_redirects                            portable 301 rules (Netlify / Cloudflare Pages)
 *   public/_headers                              header policy merge (noindex surfaces)
 *   public/aliases.json                          machine-readable registry (served, noindex)
 *   src/routes/aliases.generated.json            client rescue table
 *   deploy/netlify/_redirects                    portable rules + 410 + query facets (Netlify powers)
 *   deploy/cloudflare-pages/functions/_middleware.js  410 + case fold for Cloudflare Pages
 *   deploy/nginx-aliases.conf                    real 301/410/query for a self-hosted mirror
 *   deploy/apache-aliases.conf                   real 301/410/query for a self-hosted mirror
 *   deploy/vercel-bulk-redirects.csv             literal 301 incl. uppercase accessions (CLI upload)
 *   deploy/README.md                             host matrix + how each artifact is applied
 *   URL_ALIAS_LEDGER.md                          the human ledger: class → rule → provenance
 *
 * Run:   npm run build:aliases          (also part of predev/prebuild)
 * Check: node scripts/build-alias-rules.mjs --check     (audit mode: no writes)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { registry, PROVENANCE, CANONICAL_ORIGIN, RECORD_SECTIONS } from './alias-registry.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const reg = registry();

const LIMITS = {
  vercelRedirects: 2048,
  cfStatic: 2000,
  cfDynamic: 100,
  matcherEntries: 250
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const rel = (p) => p.replace(/^\//, '');
const isFragment = (from) => from.endsWith('-');
/** Alias vocabulary only: cleanUrl shapes and accession case folds are not middleware's job. */
const aliasExact = reg.exact.filter(
  (r) => r.class !== 'cleanurl' && r.class !== 'case-fold' && !r.from.includes(':id')
);
const cleanUrlLiteral = reg.cleanUrl.filter((r) => !r.from.includes(':id'));
const cleanUrlPattern = reg.cleanUrl.filter((r) => r.from.includes(':id'));
/** Canonical pages, as `.html` file URLs — used for the portable cleanUrl rules. */
const canonicalHtmlVariants = reg.canonicalPaths
  .filter((p) => p !== '/' && p !== '/404' && p !== '/410')
  .map((p) => ({ from: `${p}.html`, to: p }));

const sortPrefixes = (list) => [...list].sort((a, b) => b.from.length - a.from.length);

/**
 * Matcher entry: every page-shaped request except static assets. The middleware
 * is cheap and never rewrites a canonical URL on its own, so it can afford to
 * see the whole page space; assets, PDFs and data files skip it entirely.
 */
function matcherEntries() {
  return [`/((?!.*\\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|pdf|xml|txt|json|webmanifest|zip)$).*)`];
}

/* ------------------------------------------------------------------ */
/* vercel.json                                                         */
/* ------------------------------------------------------------------ */

function buildVercel() {
  const path = resolve(root, 'vercel.json');
  const base = JSON.parse(readFileSync(path, 'utf8'));
  const redirects = [];
  const seen = new Set();
  const add = (rule) => {
    const key = JSON.stringify(rule);
    if (seen.has(key)) return;
    seen.add(key);
    redirects.push(rule);
  };

  // 1. exact literals (alias vocabulary, predecessor accessions, probes).
  for (const rule of aliasExact) {
    if (rule.class === 'case-fold') continue; // case-sensitive matching across hosts is not guaranteed
    if (rule.from === rule.to) continue;
    add({ source: rule.from, destination: rule.to, permanent: true });
  }

  // 2. prefix trees and the recorded-index.html canonicalisation.
  for (const rule of sortPrefixes(reg.prefix)) {
    add(
      isFragment(rule.from)
        ? { source: `${rule.from}:id`, destination: rule.to, permanent: true }
        : { source: `${rule.from}/:path*`, destination: rule.splat ? `${rule.to}/:path*` : rule.to, permanent: true }
    );
  }
  for (const rule of cleanUrlPattern.filter((r) => r.hosts.includes('config'))) {
    add({ source: rule.from, destination: rule.to, permanent: true });
  }

  // 3. facet canonicalisation (destination differs from source; nothing loops).
  for (const rule of reg.byChannel.config.query) {
    add({
      source: rule.path,
      has: [{ type: 'query', key: rule.key, ...(rule.value ? { value: rule.value } : {}) }],
      destination: rule.to,
      permanent: true
    });
  }

  // Header sources are path-to-regexp patterns; normalise `*` to `(.*)` and merge
  // every declaration for the same source into one entry (later keys win).
  const normalize = (source) =>
    source.includes('*') && !source.includes('(') ? source.replace(/\*$/, '(.*)') : source;
  const merged = new Map();
  for (const entry of [...(base.headers ?? []), ...reg.headers.map((rule) => ({ source: rule.source, headers: rule.headers }))]) {
    const source = normalize(entry.source);
    const values = merged.get(source) ?? new Map();
    const pairs = Array.isArray(entry.headers)
      ? entry.headers.map((h) => [h.key, h.value])
      : Object.entries(entry.headers);
    for (const [key, value] of pairs) values.set(key, value);
    merged.set(source, values);
  }
  const headers = [...merged].map(([source, values]) => ({
    source,
    headers: [...values].map(([key, value]) => ({ key, value }))
  }));

  return {
    file: 'vercel.json',
    content: `${JSON.stringify({ ...base, redirects, headers }, null, 2)}\n`,
    metrics: { redirects: redirects.length, headers: headers.length }
  };
}

/* ------------------------------------------------------------------ */
/* Vercel Routing Middleware (literal 301 + 410)                       */
/* ------------------------------------------------------------------ */

function buildMiddleware() {
  const lines = [];
  const arr = (rows) => `[\n${rows.map((r) => `  ${r}`).join(',\n')}\n]`;

  const redirects = aliasExact
    .filter((r) => r.from !== r.to)
    .map((r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}, ${JSON.stringify(r.class)}]`);
  const cleanIndex = cleanUrlLiteral
    .filter((r) => r.hosts.includes('config'))
    .map((r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}, "cleanurl"]`);
  const prefixes = sortPrefixes(reg.prefix).map(
    (r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}, ${r.splat ? '"1"' : '""'}, ${JSON.stringify(r.class)}]`
  );
  const goneExact = reg.goneExact.map((r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.class)}]`);
  const gonePrefix = reg.gonePrefix.map(
    (r) => `[${JSON.stringify(r.from)}, ${r.from.endsWith('-') ? '"fragment"' : '"segment"'}, ${JSON.stringify(r.class)}]`
  );
  const matcher = matcherEntries();

  lines.push(
    '/**',
    ' * ZIAA Routing Middleware — GENERATED by scripts/build-alias-rules.mjs.',
    ' * Do not edit by hand: edit scripts/alias-registry.mjs and run `npm run build:aliases`.',
    ' *',
    ' * Why this file exists: Vercel configuration redirects can only answer 307/308 and cannot',
    ' * express 410. This middleware answers the historical surface with the *exact* codes the',
    ' * alias registry prescribes: 301 for moved addresses, 410 for retired ones, plus the case',
    ' * fold that turns a printed accession (PROT-001) into its canonical URL.',
    ' *',
    ' * It only ever redirects to a path that exists in the canonical route set, matches',
    ' * case-insensitively against the alias tables, and falls through to the routes on any',
    ' * error — it can never take the archive offline.',
    ' */',
    '',
    `const REDIRECTS: string[][] = ${arr([...redirects, ...cleanIndex])};`,
    '',
    `const PREFIXES: string[][] = ${arr(prefixes)};`,
    '',
    `const GONE_EXACT: string[][] = ${arr(goneExact)};`,
    '',
    `const GONE_PREFIX: string[][] = ${arr(gonePrefix)};`,
    '',
    `const CANONICAL: string[] = ${arr(reg.canonicalPaths.map((p) => JSON.stringify(p)))};`,
    '',
    'const CANONICAL_SET = new Set(CANONICAL);',
    'const EXACT = new Map(REDIRECTS.map(([from, to]) => [from, to]));',
    'const PREFIX_SORTED = [...PREFIXES].sort((a, b) => b[0].length - a[0].length);',
    '',
    'const stripSlash = (p: string) => (p.length > 1 ? p.replace(/\\/+$/, "") : p);',
    '',
    '/** Fold a rewritten target to lower case when that exact canonical page exists. */',
    'function fold(target: string): string {',
    '  const lower = target.toLowerCase();',
    '  return lower !== target && CANONICAL_SET.has(lower) ? lower : target;',
    '}',
    '',
    '/** Exact alias in one hop, case-sensitive first, then case-insensitive. */',
    'function exactAlias(path: string): string | undefined {',
    '  const direct = EXACT.get(path);',
    '  if (direct) return direct;',
    '  const lower = path.toLowerCase();',
    '  return lower === path ? undefined : EXACT.get(lower);',
    '}',
    '',
    '/** Longest-prefix alias (fragment rules match a bare accession, segment rules a subtree). */',
    'function prefixAlias(path: string): string | undefined {',
    '  for (const probe of path.toLowerCase() === path ? [path] : [path, path.toLowerCase()]) {',
    '    for (const [from, to, splat] of PREFIX_SORTED) {',
    '      const fragment = from.endsWith("-");',
    '      const match = fragment ? probe.startsWith(from) : probe.startsWith(`${from}/`);',
    '      if (!match) continue;',
    '      const rest = splat ? probe.slice(from.length) : "";',
    '      return fold(`${to}${rest}`);',
    '    }',
    '  }',
    '  return undefined;',
    '}',
    '',
    'export default async function middleware(request: Request): Promise<Response | undefined> {',
    '  try {',
    '    const url = new URL(request.url);',
    '    const path = stripSlash(url.pathname);',
    '    const redirect = (to: string) => Response.redirect(new URL(to, url.origin), 301);',
    '',
    '    const exact = exactAlias(path);',
    '    if (exact && exact !== path) return redirect(exact);',
    '',
    '    const prefix = prefixAlias(path);',
    '    if (prefix && prefix !== path) return redirect(prefix);',
    '',
    '    const lower = path.toLowerCase();',
    '    if (lower !== path && CANONICAL_SET.has(lower)) return redirect(lower);',
    '',
    '    const gone = (l: string) => GONE_EXACT.some(([from]) => from === l) || GONE_PREFIX.some(([from, mode]) => (mode === "fragment" ? l.startsWith(from) : l.startsWith(`${from}/`)));',
    '    if (gone(path) || (lower !== path && gone(lower))) return await goneResponse(url);',
    '  } catch {',
    '    // Never let the alias layer break the archive: fall through to the routes.',
    '  }',
    '  return undefined;',
    '}',
    '',
    '/** 410 with the archive\'s own Gone page as the body (empty body if it cannot be read). */',
    'async function goneResponse(url: URL): Promise<Response> {',
    '  const headers: Record<string, string> = {',
    '    "Cache-Control": "public, max-age=3600",',
    '    "X-Robots-Tag": "noindex",',
    '    "Content-Type": "text/html; charset=utf-8"',
    '  };',
    '  try {',
    '    const surface = await fetch(new URL("/410", url.origin));',
    '    if (surface.ok) return new Response(await surface.text(), { status: 410, headers });',
    '  } catch {',
    '    // fall through to the bare 410',
    '  }',
    '  return new Response(null, { status: 410, headers });',
    '}',
    '',
    'export const config = {',
    `  matcher: ${arr(matcher.map((m) => JSON.stringify(m)))}`,
    '};',
    ''
  );

  return { file: 'middleware.ts', content: lines.join('\n'), metrics: { matcher: matcher.length, canonical: reg.canonicalPaths.length } };
}

/* ------------------------------------------------------------------ */
/* public/_redirects (portable 301 set) + Netlify/CF variants          */
/* ------------------------------------------------------------------ */

function redirectsBody({ includeGone, includeQuery, queryDrop }) {
  const lines = [];
  const dynamic = [];
  const staticRules = [];

  for (const rule of aliasExact) {
    if (rule.from === rule.to) continue;
    staticRules.push(`${rule.from} ${rule.to} 301`);
  }
  // file-shaped variants of real pages: literal rules (hosts parse placeholders per segment)
  for (const rule of [...cleanUrlLiteral, ...canonicalHtmlVariants]) {
    staticRules.push(`${rule.from} ${rule.to} 301`);
  }
  for (const rule of cleanUrlPattern.filter((r) => r.hosts.includes('redirects'))) {
    // whole-segment placeholder only (Netlify + Cloudflare Pages requirement)
    dynamic.push(`${rule.from} ${rule.to} 301`);
  }
  for (const rule of sortPrefixes(reg.prefix)) {
    if (isFragment(rule.from)) {
      dynamic.push(`${rule.from}:id ${rule.to} 301`);
    } else {
      dynamic.push(`${rule.from}/* ${rule.splat ? `${rule.to}/:splat` : rule.to} 301`);
    }
  }

  if (includeQuery) {
    for (const rule of reg.byChannel.strict.query) {
      const source = `${rule.path}?${rule.key}${rule.value !== undefined && rule.value !== null ? `=${rule.value}` : ''}`;
      const destination = rule.samePath && queryDrop ? `${rule.to}?` : rule.to;
      staticRules.push(`${source} ${destination} 301`);
    }
  }

  lines.push(...staticRules);
  if (dynamic.length) {
    lines.push('');
    lines.push('# dynamic (single-splat) rules — keep after the static set (first match wins)');
    lines.push(...dynamic);
  }
  if (includeGone) {
    lines.push('');
    lines.push('# retired surfaces — real 410 (no successor page).');
    for (const rule of reg.goneExact) lines.push(`${rule.from} /410 410`);
    for (const rule of reg.gonePrefix) {
      lines.push(`${isFragment(rule.from) ? `${rule.from}:id` : `${rule.from}/*`} /410 410`);
    }
  }
  return { lines, staticCount: staticRules.length, dynamicCount: dynamic.length };
}

function buildRedirects() {
  const { lines, staticCount, dynamicCount } = redirectsBody({ includeGone: false, includeQuery: false });
  const content = [
    '# ZIAA URL alias rules — GENERATED by scripts/build-alias-rules.mjs from scripts/alias-registry.mjs.',
    '# Do not edit by hand. Hosts: Netlify and Cloudflare Pages (`_redirects`), where both answer 301.',
    '# Retired surfaces (410) and query-string facets are not portable: see deploy/netlify/_redirects,',
    '# deploy/cloudflare-pages/functions/_middleware.js and middleware.ts.',
    `# Rules: ${staticCount} static + ${dynamicCount} dynamic.`,
    '',
    ...lines,
    ''
  ].join('\n');
  return { file: 'public/_redirects', content, metrics: { staticCount, dynamicCount } };
}

function buildNetlify() {
  const { lines, staticCount, dynamicCount } = redirectsBody({ includeGone: true, includeQuery: true, queryDrop: true });
  const content = [
    '# ZIAA URL alias rules — NETLIFY FLAVOUR (GENERATED by scripts/build-alias-rules.mjs).',
    '# Netlify is the one host in play that can answer 410 and match query strings in _redirects.',
    '# Apply by pointing the publish directory at dist/ with this file as public/_redirects, or copy it over.',
    '# Same-path facet rules end their destination with `?` so the query string is dropped (no self-redirect).',
    `# Rules: ${staticCount} static + ${dynamicCount} dynamic.`,
    '',
    ...lines,
    ''
  ].join('\n');
  return { file: 'deploy/netlify/_redirects', content };
}

function buildCfFunction() {
  const rows = (list) => `[\n${list.map((r) => `  ${r}`).join(',\n')}\n]`;
  const exact = rows([
    ...aliasExact
      .filter((r) => r.from !== r.to)
      .map((r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}]`),
    ...cleanUrlLiteral
      .filter((r) => r.hosts.includes('config'))
      .map((r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}]`)
  ]);
  const prefixes = rows(
    sortPrefixes(reg.prefix).map(
      (r) => `[${JSON.stringify(r.from)}, ${JSON.stringify(r.to)}, ${r.splat ? '"1"' : '""'}]`
    )
  );
  const goneExact = rows(reg.goneExact.map((r) => JSON.stringify(r.from)));
  const gonePrefix = rows(
    reg.gonePrefix.map((r) => `[${JSON.stringify(r.from)}, ${r.from.endsWith('-') ? '"fragment"' : '"segment"'}]`)
  );
  const canonical = rows(reg.canonicalPaths.map((p2) => JSON.stringify(p2)));
  const query = rows(
    reg.query.map(
      (r) =>
        `[${JSON.stringify(r.path)}, ${JSON.stringify(r.key)}, ${r.value === undefined || r.value === null ? 'null' : JSON.stringify(String(r.value))}, ${JSON.stringify(r.to)}]`
    )
  );

  const content = `/**
 * ZIAA alias middleware — Cloudflare Pages Function (GENERATED by scripts/build-alias-rules.mjs).
 *
 * Cloudflare Pages \`_redirects\` can only answer 3xx and 200, so the parts of the alias
 * registry that need a different answer live here: the retired surfaces (real 410), the
 * query-string facets (\`?discipline=\`, \`?tab=\`, …) and the case fold that turns a printed
 * accession (PROT-001) into its canonical URL. Activate by placing this file at
 * \`functions/_middleware.js\` in the Pages project; the module never throws and always
 * falls through to the asset server when it does not recognise the path.
 */
const ALIASES = ${exact};

const PREFIXES = ${prefixes};

const GONE_EXACT = ${goneExact};

const GONE_PREFIX = ${gonePrefix};

const QUERY = ${query};

const CANONICAL = ${canonical};

const CANONICAL_SET = new Set(CANONICAL);
const EXACT = new Map(ALIASES);
const PREFIX_SORTED = [...PREFIXES].sort((a, b) => b[0].length - a[0].length);

const stripSlash = (p) => (p.length > 1 ? p.replace(/\\/+$/, '') : p);
const fold = (target) => {
  const lower = target.toLowerCase();
  return lower !== target && CANONICAL_SET.has(lower) ? lower : target;
};

function exactAlias(path) {
  const direct = EXACT.get(path);
  if (direct) return direct;
  const lower = path.toLowerCase();
  return lower === path ? undefined : EXACT.get(lower);
}

function prefixAlias(path) {
  const probes = path.toLowerCase() === path ? [path] : [path, path.toLowerCase()];
  for (const probe of probes) {
    for (const [from, to, splat] of PREFIX_SORTED) {
      const fragment = from.endsWith('-');
      const match = fragment ? probe.startsWith(from) : probe.startsWith(from + '/');
      if (!match) continue;
      const rest = splat ? probe.slice(from.length) : '';
      return fold(to + rest);
    }
  }
  return undefined;
}

function queryAlias(url) {
  for (const [path, key, value, to] of QUERY) {
    if (url.pathname !== path) continue;
    if (!url.searchParams.has(key)) continue;
    if (value !== null && url.searchParams.get(key) !== value) continue;
    return to;
  }
  return undefined;
}

export async function onRequest(context) {
  try {
    const { request, next } = context;
    const url = new URL(request.url);
    const path = stripSlash(url.pathname);

    const exact = exactAlias(path);
    if (exact && exact !== path) return Response.redirect(url.origin + exact, 301);

    const prefix = prefixAlias(path);
    if (prefix && prefix !== path) return Response.redirect(url.origin + prefix, 301);

    const lower = path.toLowerCase();
    if (lower !== path && CANONICAL_SET.has(lower)) return Response.redirect(url.origin + lower, 301);

    const facet = queryAlias(url);
    if (facet) return Response.redirect(url.origin + facet, 301);

    const gone = (l) =>
      GONE_EXACT.includes(l) || GONE_PREFIX.some(([from, mode]) => (mode === 'fragment' ? l.startsWith(from) : l.startsWith(from + '/')));
    if (gone(path) || (lower !== path && gone(lower))) return goneResponse(context, url);
  } catch {
    // fall through: a broken alias rule must never take the archive offline
  }

  return context.next();
}

async function goneResponse(context, url) {
  const headers = {
    'Cache-Control': 'public, max-age=3600',
    'X-Robots-Tag': 'noindex',
    'Content-Type': 'text/html; charset=utf-8'
  };
  try {
    const assets = context.env?.ASSETS;
    const surface = assets ? await assets.fetch(new URL('/410', url.origin)) : null;
    if (surface && surface.ok) return new Response(await surface.text(), { status: 410, headers });
  } catch {
    // fall through to the bare 410
  }
  return new Response(null, { status: 410, headers });
}
`;
  return { file: 'deploy/cloudflare-pages/functions/_middleware.js', content };
}

/* ------------------------------------------------------------------ */
/* Headers policy                                                      */
/* ------------------------------------------------------------------ */

function buildHeaders() {
  const path = resolve(root, 'public/_headers');
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const order = [];
  const blocks = new Map();
  let parsedKeys = 0;

  // The `_headers` format is line-based (no blank line required between blocks):
  // an unindented line opens a source, indented `Key: value` lines configure it.
  for (const raw of existing.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      const match = line.match(/^\s*([^:]+):\s*(.*)$/);
      if (match && order.length) {
        blocks.get(order[order.length - 1]).set(match[1].trim(), match[2].trim());
        parsedKeys += 1;
      }
      continue;
    }
    const source = line.trim();
    if (!blocks.has(source)) {
      blocks.set(source, new Map());
      order.push(source);
    }
  }

  for (const rule of reg.headers) {
    if (!blocks.has(rule.source)) {
      blocks.set(rule.source, new Map());
      order.push(rule.source);
    }
    const values = blocks.get(rule.source);
    for (const [key, value] of Object.entries(rule.headers)) if (!values.has(key)) values.set(key, value);
  }

  const emittedKeys = [...blocks.values()].reduce((total, values) => total + values.size, 0);
  if (existing && emittedKeys < parsedKeys) {
    throw new Error(`refusing to write _headers: parsed ${parsedKeys} keys but would emit ${emittedKeys}`);
  }

  const content =
    order
      .map((source) => [`${source}`, ...[...blocks.get(source)].map(([key, value]) => `  ${key}: ${value}`)].join('\n'))
      .join('\n') + '\n';
  return { file: 'public/_headers', content, metrics: { sources: order.length, keys: emittedKeys } };
}

/* ------------------------------------------------------------------ */
/* Machine-readable + client tables                                    */
/* ------------------------------------------------------------------ */

function buildAliasesJson() {
  const provenance = {};
  for (const rule of [...reg.exact, ...reg.prefix, ...reg.goneExact, ...reg.gonePrefix, ...reg.query]) {
    if (rule.provenance) provenance[rule.class] = rule.provenance;
  }
  const json = {
    $comment: 'ZIAA URL alias registry — GENERATED by scripts/build-alias-rules.mjs; edit scripts/alias-registry.mjs',
    origin: CANONICAL_ORIGIN,
    policy: {
      moved: '301 — the address moved to a living canonical successor',
      gone: '410 — the surface served content and is permanently withdrawn; there is no successor',
      untouched: 'an address not listed here is either a canonical page (200) or unknown (404)'
    },
    counts: reg.counts,
    hosts: {
      vercel: 'vercel.json redirects (308 on the wire) + middleware.ts (literal 301/410)',
      netlify: 'public/_redirects (301) and deploy/netlify/_redirects (301 + 410 + query facets)',
      cloudflarePages: 'public/_redirects (301) + optional deploy/cloudflare-pages/functions/_middleware.js (301/410/query)',
      selfHosted: 'deploy/nginx-aliases.conf, deploy/apache-aliases.conf',
      inApp: 'src/routes/aliases.generated.json (client rescue table)'
    },
    provenance,
    exact: reg.exact.map(({ from, to, class: cls, status }) => ({ from, to, class: cls, status })),
    prefix: reg.prefix.map(({ from, to, splat, class: cls, status }) => ({ from, to, splat: splat === true, class: cls, status })),
    gone: [
      ...reg.goneExact.map((r) => ({ from: r.from, mode: 'exact', class: r.class, status: 410 })),
      ...reg.gonePrefix.map((r) => ({ from: r.from, mode: 'prefix', class: r.class, status: 410 }))
    ],
    query: reg.query.map(({ path, key, value, to, class: cls, samePath }) => ({
      path,
      key,
      value: value ?? null,
      to,
      class: cls,
      status: 301,
      samePath: samePath === true
    })),
    canonicalPaths: reg.canonicalPaths,
    satellites: reg.satellites
  };
  return { file: 'public/aliases.json', content: `${JSON.stringify(json, null, 2)}\n` };
}

function buildClientTable() {
  const fileLike = (p) => /\.(html|xml|txt|json|webmanifest)$/.test(p);
  const keep = (r) => r.class !== 'cleanurl' && r.class !== 'case-fold' && !fileLike(r.from);
  const json = {
    _generated: 'scripts/build-alias-rules.mjs — edit scripts/alias-registry.mjs',
    origin: CANONICAL_ORIGIN,
    counts: reg.counts,
    exact: reg.exact.filter(keep).map(({ from, to, class: cls, status }) => ({ from, to, class: cls, status })),
    prefix: reg.prefix.map(({ from, to, splat, class: cls, status }) => ({ from, to, splat, class: cls, status })),
    goneExact: reg.goneExact.map(({ from, class: cls }) => ({ from, class: cls, status: 410 })),
    gonePrefix: reg.gonePrefix.map(({ from, class: cls }) => ({ from, class: cls, status: 410 })),
    query: reg.query
      .filter((q) => !q.samePath)
      .map(({ path, key, value, to, class: cls }) => ({ path, key, value: value ?? null, to, class: cls, status: 301 })),
    satellites: reg.satellites,
    canonicalPaths: reg.canonicalPaths
  };
  return { file: 'src/routes/aliases.generated.json', content: `${JSON.stringify(json, null, 2)}\n` };
}

/* ------------------------------------------------------------------ */
/* Self-hosted mirrors                                                 */
/* ------------------------------------------------------------------ */

function buildNginx() {
  const lines = [
    '# ZIAA URL aliases — nginx (GENERATED by scripts/build-alias-rules.mjs).',
    '# Include inside the server{} block that serves the archive:',
    '#   include /etc/nginx/snippets/ziaa-aliases.conf;',
    '# nginx matches locations case-sensitively, so the accession case folds below are exact.',
    '',
    '# exact permanent aliases',
    ...aliasExact.filter((r) => r.from !== r.to).map((r) => `location = ${r.from} { return 301 ${r.to}; }`),
    '',
    '# cleanUrl variants of real pages',
    ...reg.cleanUrl
      .filter((r) => !r.from.includes(':id'))
      .map((r) => `location = ${r.from} { return 301 ${r.to}; }`),
    '',
    '# accession case folding (uppercase citations → canonical lowercase URLs)',
    ...reg.caseFold.map((r) => `location = ${r.from} { return 301 ${r.to}; }`),
    '',
    '# prefix trees',
    ...sortPrefixes(reg.prefix).map((r) =>
      r.splat
        ? `location ^~ ${r.from}/ { rewrite ^${r.from}/(.*)$ ${r.to}/$1 permanent; }`
        : `location ^~ ${r.from}/ { return 301 ${r.to}; }`
    ),
    ...sortPrefixes(reg.prefix)
      .filter((r) => isFragment(r.from))
      .map((r) => `location ^~ ${r.from} { return 301 ${r.to}; }`),
    '',
    '# retired surfaces (real 410)',
    ...reg.goneExact.map((r) => `location = ${r.from} { return 410; }`),
    ...reg.gonePrefix.map((r) => `location ^~ ${r.from} { return 410; }`),
    '',
    '# query-string facets collapse onto their canonical page',
    ...reg.query
      .filter((q) => q.value)
      .map((q) => `if ($arg_${q.key} = "${q.value}") { return 301 ${q.to}; }`),
    ...reg.query
      .filter((q) => !q.value)
      .map((q) => `if ($arg_${q.key}) { return 301 ${q.to}; }`),
    '',
    '# cleanUrl patterns for detail pages (single segment)',
    ...reg.cleanUrl
      .filter((r) => r.from.includes(':id'))
      .map((r) => `location ~ ^${r.from.replace(':id', '([^/]+)').replace(/\./g, '\\.')}$ { return 301 ${r.to.replace(':id', '$1')}; }`),
    ''
  ];
  return { file: 'deploy/nginx-aliases.conf', content: lines.join('\n') };
}

function buildApache() {
  const lines = [
    '# ZIAA URL aliases — Apache httpd 2.4 (GENERATED by scripts/build-alias-rules.mjs).',
    '# Drop into the vhost configuration; needs mod_alias + mod_rewrite.',
    '',
    'RedirectEngine on',
    '',
    '# exact permanent aliases',
    ...aliasExact.filter((r) => r.from !== r.to).map((r) => `Redirect 301 ${r.from} ${r.to}`),
    '',
    '# cleanUrl variants of real pages',
    ...reg.cleanUrl.filter((r) => !r.from.includes(':id')).map((r) => `Redirect 301 ${r.from} ${r.to}`),
    '',
    '# accession case folding',
    ...reg.caseFold.map((r) => `Redirect 301 ${r.from} ${r.to}`),
    '',
    '# prefix trees',
    ...sortPrefixes(reg.prefix).map((r) =>
      r.splat ? `RedirectMatch 301 ^${r.from}/(.*)$ ${r.to}/$1` : `RedirectMatch 301 ^${r.from}(/|$) ${r.to}`
    ),
    ...sortPrefixes(reg.prefix)
      .filter((r) => isFragment(r.from))
      .map((r) => `RedirectMatch 301 ^${r.from}.*$ ${r.to}`),
    '',
    '# retired surfaces (real 410)',
    ...reg.goneExact.map((r) => `Redirect gone ${r.from}`),
    ...reg.gonePrefix.map((r) => `RedirectMatch gone ^${r.from}(/|$)`),
    '',
    '# cleanUrl patterns for detail pages',
    ...reg.cleanUrl
      .filter((r) => r.from.includes(':id'))
      .map((r) => `RedirectMatch 301 ^${r.from.replace(':id', '([^/]+)').replace(/\./g, '\\.')}$ ${r.to.replace(':id', '$1')}`),
    '',
    '# query-string facets collapse onto their canonical page',
    ...reg.query.flatMap((q) => {
      const matcher = q.value ? encodeURIComponent(q.value).replace(/%20/g, '[ +]') : '[^&]*';
      return [
        `RewriteCond %{QUERY_STRING} (^|&)${q.key}=${matcher}($|&)`,
        `RewriteRule ^${q.path}$ ${q.to}? [R=301,L]`
      ];
    }),
    ''
  ];
  return { file: 'deploy/apache-aliases.conf', content: lines.join('\n') };
}

function buildBulkCsv() {
  const rows = ['source,destination,status,caseSensitive,preserveQueryParams'];
  for (const rule of aliasExact) {
    if (rule.from === rule.to) continue;
    // caseSensitive=true keeps a lowercase canonical request from matching its own uppercase rule.
    rows.push(`${rule.from},${rule.to},301,true,false`);
  }
  for (const rule of reg.caseFold) rows.push(`${rule.from},${rule.to},301,true,false`);
  return { file: 'deploy/vercel-bulk-redirects.csv', content: `${rows.join('\n')}\n` };
}

/* ------------------------------------------------------------------ */
/* Documentation                                                       */
/* ------------------------------------------------------------------ */

function classSummary() {
  const tally = new Map();
  const bump = (cls, status) => {
    const key = `${cls}|${status}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  };
  reg.exact.forEach((r) => r.class !== 'cleanurl' && r.class !== 'case-fold' && bump(r.class, r.status));
  reg.cleanUrl.forEach((r) => bump(r.class, 301));
  reg.caseFold.forEach((r) => bump(r.class, 301));
  reg.prefix.forEach((r) => bump(r.class, r.status));
  reg.query.forEach((r) => bump(r.class, 301));
  reg.goneExact.forEach((r) => bump(r.class, 410));
  reg.gonePrefix.forEach((r) => bump(r.class, 410));
  return [...tally.entries()].map(([key, count]) => {
    const [cls, status] = key.split('|');
    return { class: cls, status: Number(status), count };
  });
}

function buildLedger() {
  const summary = classSummary().sort((a, b) => (a.class === b.class ? a.status - b.status : a.class.localeCompare(b.class)));
  const examples = (list, n = 4) =>
    list
      .slice(0, n)
      .map((r) =>
        r.key
          ? `\`${r.path}?${r.key}${r.value ? `=${r.value}` : ''}\``
          : `\`${(r.from ?? r.path ?? '?').replace(/:id\b/, '<id>')}\``
      )
      .join(', ');
  const L = [];
  L.push('# URL Alias Ledger — Zazie Institute of Applied Anomalies');
  L.push('');
  L.push('*Generated by `npm run build:aliases` from `scripts/alias-registry.mjs` — do not edit by hand.*');
  L.push('');
  L.push(
    'Every historical, internal, alias, cleanUrl, faceting and satellite-fossil address that has ever resolved for this'
  );
  L.push(
    'institution is declared once, with its provenance, and then emitted into the host configurations. Old URLs keep'
  );
  L.push('working — with a real status code — because the rules live in the deployment config, not in a client redirect.');
  L.push('');
  L.push(`Canonical origin: ${CANONICAL_ORIGIN} · rules in force: ${reg.counts.exact} exact / ${reg.counts.prefix} prefix / ${reg.counts.gone} gone / ${reg.counts.query} query / ${reg.counts.caseFold} case folds / ${reg.counts.cleanUrl} cleanUrl variants.`);
  L.push('');
  L.push('## Rule classes in force');
  L.push('');
  L.push('| class | status | rules | examples |');
  L.push('| --- | --- | --- | --- |');
  for (const row of summary) {
    const sample =
      row.status === 410
        ? examples(reg.goneExact.filter((r) => r.class === row.class).concat(reg.gonePrefix.filter((r) => r.class === row.class)))
        : examples([
            ...reg.exact.filter((r) => r.class === row.class),
            ...reg.prefix.filter((r) => r.class === row.class),
            ...reg.cleanUrl.filter((r) => r.class === row.class),
            ...reg.query.filter((r) => r.class === row.class)
          ]);
    L.push(`| \`${row.class}\` | ${row.status} | ${row.count} | ${sample || '—'} |`);
  }
  L.push('');
  L.push('## What each class means');
  L.push('');
  L.push('| class | provenance |');
  L.push('| --- | --- |');
  for (const [cls, provenance] of [
    ['vocabulary-drift', PROVENANCE.drift],
    ['hash-tab-leftover', PROVENANCE.hashTabs],
    ['predecessor / predecessor-accession / predecessor-identity', PROVENANCE.predecessor],
    ['predecessor-identity', PROVENANCE.identity],
    ['satellite-name / satellite-fossil', PROVENANCE.satellites],
    ['convention-alias', PROVENANCE.convention],
    ['cleanurl', PROVENANCE.cleanUrls],
    ['case-fold', PROVENANCE.caseFold],
    ['facet-leftover', PROVENANCE.facets],
    ['retired-programme', PROVENANCE.predecessorCatchAll],
    ['retired-documentation', PROVENANCE.predecessorDocs],
    ['retired-surface', PROVENANCE.gone]
  ]) {
    L.push(`| \`${cls}\` | ${provenance} |`);
  }
  L.push('');
  L.push('## Host matrix — where each rule is enforced');
  L.push('');
  L.push('| host / artifact | expresses | notes |');
  L.push('| --- | --- | --- |');
  L.push('| `vercel.json` (Vercel) | 308 for every moved address, query facets via `has` | Vercel configuration redirects cannot answer 301 or 410 — `permanent: true` is 308, which is permanently equivalent |');
  L.push('| `middleware.ts` (Vercel Routing Middleware) | literal **301** and **410** | Vercel Routing Middleware works with any framework and is picked up from the project root by the file convention (no `vercel.json` entry needed; `proxy.entrypoint` is the explicit alternative). It sees every page-shaped request (static assets excluded), redirects only when a rule names an existing canonical page, and falls through on any error. |');
  L.push('| `public/_redirects` (Netlify, Cloudflare Pages) | 301 for the portable set | the file that ships inside `dist/`; no query matching, no 410 |');
  L.push('| `deploy/netlify/_redirects` | 301 + **410** + query facets | Netlify-only powers; deploy in place of the portable file on Netlify |');
  L.push('| `deploy/cloudflare-pages/functions/_middleware.js` | literal **301/410** + query facets + case folding | Cloudflare Pages `_redirects` cannot express 410, match queries or fold case |');
  L.push('| `deploy/nginx-aliases.conf`, `deploy/apache-aliases.conf` | literal 301/410 + query facets | for any self-hosted mirror of the archive |');
  L.push('| `deploy/vercel-bulk-redirects.csv` | literal 301 incl. uppercase accessions | `vercel redirects upload` (Pro/Enterprise); case-sensitive matching |');
  L.push('| `public/aliases.json` | machine-readable registry | served noindex for agents, auditors and LLM grounding |');
  L.push('');
  L.push('## Standing decisions');
  L.push('');
  L.push('1. **410 means retired, not missing.** It is used only for surfaces that served content and are permanently withdrawn (`/exhibitions*`, `/EXHIB-*`, `/archives/*`, `/timeline/*`, `/policies/*`, unknown `/people/*`, `/search/*`, `/apps`). Unknown addresses keep returning 404.');
  L.push('2. **Accession case folding is not a config redirect.** Under case-insensitive source matching (`caseSensitive` defaults to `false` on Vercel bulk redirects) a lowercase canonical request would match its own uppercase rule and loop. Case folding is therefore enforced by `middleware.ts`, the Cloudflare Pages Function, the server configs and the case-sensitive bulk CSV, plus the client resolver.');
  L.push('3. **Same-path query rules never reach `vercel.json` or the portable `_redirects`.** A host that preserves the query string would loop; the strict channels and the Netlify variant drop it explicitly.');
  L.push('4. **Nothing under `/apps/` is redirected.** `/apps/void-oculus/index.html` is the embedded instrument runtime, referenced by `src/pages/VoidOculusPage.tsx`; only `/apps` itself is retired.');
  L.push('5. **The canonical tag stays the last word.** Every alias target is a real prerendered page with a self-canonical `<link>`; aliases are additive, never an alternative to the canonical URL.');
  L.push('6. **Surfaces that cannot carry a canonical tag get one in the header.** `/papers/*` (PDF dossiers) and `/apps/void-oculus/*` (the embedded instrument runtime) are declared canonical to their corpus/instrument page with `Link: <…>; rel="canonical"` in `vercel.json` and `public/_headers`.');
  L.push('');
  L.push('## How this is verified');
  L.push('');
  L.push('`npm run audit:aliases` (part of `npm run audit`) runs after every build and fails the build when:');
  L.push('');
  L.push('1. the host artifacts drift from the registry (`build-alias-rules.mjs --check`);');
  L.push('2. an alias target does not resolve to a page or file inside `dist/`;');
  L.push('3. an alias would shadow a canonical page, or a redirect would chain into another rule;');
  L.push('4. a canonical page would be intercepted by the middleware matcher (all ' + String(reg.canonicalPaths.length) + ' canonical paths are replayed through it);');
  L.push('5. the answer produced by `middleware.ts` and by the Cloudflare Pages Function differs from the registry for a table of historical addresses;');
  L.push('6. `dist/` is missing the host files, or the sitemap lists an alias or 410 surface;');
  L.push('7. a host limit is exceeded (Vercel 2,048 rules, Cloudflare Pages 2,000 static + 100 dynamic).');
  L.push('');
  L.push('## Evidence reviewed (2026-09-16)');
  L.push('');
  L.push('| source | what it yielded |');
  L.push('| --- | --- |');
  L.push('| Wayback CDX (`zazieinstitute.org`, domain match) | exactly one capture — `http://zazieinstitute.org/` 301 (2026-09-14). No path history: the domain predates the archive; nothing to mine, so the predecessor repository and the in-repo citations carry the load. |');
  L.push('| Git history of this repository | a single squashed commit, so no route vocabulary survives in the log; the earlier vocabulary was read from `vercel.json`, `public/_redirects`, `src/App.tsx` and `SEO_SITEMAP_AUDIT.md`. |');
  L.push('| Old sitemaps | the repository ships one sitemap and it describes the current manifest (`scripts/prerender.mjs` regenerates it every build). The predecessor published none — it was a Cloudflare Pages SPA with a `/* /index.html 200` catch-all — which is exactly why the retired surfaces below are withdrawn with 410 instead of being left as soft 200s. |');
  L.push('| Predecessor repository `zazieproductions/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY` | 13 routes (`/prototypes`, `/patents`, `/instruments`, `/logs`, `/papers`, `/people`, `/exhibitions`, `/timeline`, `/search`, `/policies`, …) + accessions `ZIAA-PROTO-*` (12), `ZIAA-PAT-*` (3), `ZIAA-PAPER-*` (4), `PERSON-*` (6), `EXHIB-*` (3), `ZIAA-LOG-YYYY.MM.DD` (5) + `/archives/*.pdf` documentation URLs. |');
  L.push('| Satellite repositories (`void-oculus`, `spectra-lab`, `SYNTHESIS-SIGNAL`, `Electromagnetic-Spectrum-Emotion-Web-Instrument`, `interference-archive`, `vortex-av-engine`, planned `ziaa-dsp`) | the origins in `deploy/satellite-canonicalization.md`; none of them mentions ZIAA or `zazieinstitute.org`, so they are inbound surfaces to canonicalise, not sources of historical paths. |');
  L.push('| `gh search/code q=zazieinstitute` | 21 files, all inside this repository — confirms that no other repository of the account links to the domain, so the alias surface below is complete. |');
  L.push('| `Comprehensive-Backlink-Tracker` exports | external destinations only (linktr.ee, Bandcamp, YouTube); no `zazieinstitute.org` inbound paths. |');
  L.push('');
  L.push('## Adding a rule');
  L.push('');
  L.push('1. Add it to `scripts/alias-registry.mjs` with a `class` and a `provenance` string.');
  L.push('2. Run `npm run build:aliases` (regenerates every artifact above).');
  L.push('3. Run `npm run audit` — `scripts/audit-aliases.mjs` fails if a target does not resolve in `dist/`, if a rule shadows a canonical page, if a rule chains into another rule, or if any host artifact drifts from the registry.');
  L.push('');
  return { file: 'URL_ALIAS_LEDGER.md', content: L.join('\n') };
}

function buildDeployReadme() {
  const L = [];
  L.push('# Generated routing artifacts');
  L.push('');
  L.push('Everything in this directory is generated from `scripts/alias-registry.mjs` by');
  L.push('`scripts/build-alias-rules.mjs`. Edit the registry, run `npm run build:aliases`, and every');
  L.push('artifact below changes together. `URL_ALIAS_LEDGER.md` is the human-readable companion.');
  L.push('');
  L.push('| artifact | host | expresses | how to apply |');
  L.push('| --- | --- | --- | --- |');
  L.push('| `../vercel.json` | Vercel | 308 redirects + canonical headers + query facets | deploy as-is (already in the repository root) |');
  L.push('| `../middleware.ts` | Vercel | literal 301 + 410 (page-shaped requests only) | deploy as-is; delete the file to disable |');
  L.push('| `../public/_redirects` | Netlify, Cloudflare Pages | portable 301 set | ships inside `dist/` automatically |');
  L.push('| `netlify/_redirects` | Netlify | 301 + 410 + query facets | copy over `public/_redirects` before deploying to Netlify |');
  L.push('| `cloudflare-pages/functions/_middleware.js` | Cloudflare Pages | 301/410 + query facets + case folding | move to `functions/_middleware.js` in the Pages project |');
  L.push('| `nginx-aliases.conf` | nginx | 301 + 410 + case fold + facets | `include` inside the `server{}` block |');
  L.push('| `apache-aliases.conf` | Apache 2.4 | 301 + 410 + case fold + facets | include in the vhost (mod_alias + mod_rewrite) |');
  L.push('| `vercel-bulk-redirects.csv` | Vercel CLI | literal 301s, case-sensitive | `vercel redirects upload deploy/vercel-bulk-redirects.csv` |');
  L.push('| `satellite-canonicalization.md` | other origins | cross-origin 301s | paste the one-liner into each satellite repository |');
  L.push('');
  L.push('Counts: ' +
    `${reg.counts.exact} exact aliases, ${reg.counts.prefix} prefix trees, ${reg.counts.gone} retired surfaces (410), ` +
    `${reg.counts.query} facet rules, ${reg.counts.caseFold} accession case folds, ${reg.counts.cleanUrl} cleanUrl variants.`);
  L.push('');
  L.push('## Why three different status codes');
  L.push('');
  L.push('- **301** is the honest code for a moved address and is what the portable rules, the middleware, Netlify and the server configs answer.');
  L.push('- **308** is what Vercel configuration redirects can answer; the platform treats it as permanently equivalent to 301.');
  L.push('- **410** tells crawlers the address served content and is permanently withdrawn. Vercel and Cloudflare Pages cannot express it in a config file, so `middleware.ts` (Vercel) and the Pages Function (Cloudflare) carry it.');
  L.push('');
  return { file: 'deploy/README.md', content: L.join('\n') };
}

function buildSatellites() {
  const L = [];
  L.push('# Cross-origin canonicalisation — the other origins already in this repository');
  L.push('');
  L.push('These origins serve ZIAA work but are not the canonical origin. They live in other repositories,');
  L.push('so their host rules cannot be written from this one: the rows below are generated from');
  L.push('`scripts/alias-registry.mjs` and ready to paste into each satellite repository.');
  L.push('');
  L.push('| origin | canonical target | rule (`_redirects`) | evidence |');
  L.push('| --- | --- | --- | --- |');
  for (const s of reg.satellites) {
    L.push(`| ${s.origin} | ${s.target} | \`/* ${s.target} 301\` | ${s.evidence}${s.hosts.includes('planned') ? ' — planned, not yet published' : ''} |`);
  }
  L.push('');
  L.push('GitHub Pages itself cannot serve status codes. Where a satellite is hosted on GitHub Pages, the');
  L.push('canonical link belongs in the page `<head>` and in the README:');
  L.push('');
  L.push('```html');
  L.push(`<link rel="canonical" href="${CANONICAL_ORIGIN}/void-oculus">`);
  L.push('```');
  L.push('');
  L.push('This build also canonicalises itself client-side: if `zazieinstitute.org` is ever served from one of');
  L.push('these origins, `src/routes/aliasResolver.ts` hands the visitor to the institutional origin on load.');
  L.push('');
  return { file: 'deploy/satellite-canonicalization.md', content: L.join('\n') };
}

/* ------------------------------------------------------------------ */
/* Emit                                                                 */
/* ------------------------------------------------------------------ */

const outputs = [
  buildVercel(),
  buildMiddleware(),
  buildRedirects(),
  buildHeaders(),
  buildAliasesJson(),
  buildClientTable(),
  buildNetlify(),
  buildCfFunction(),
  buildNginx(),
  buildApache(),
  buildBulkCsv(),
  buildDeployReadme(),
  buildSatellites(),
  buildLedger()
];

const problems = [];
const metrics = {};
for (const out of outputs) {
  metrics[out.file] = { ...(out.metrics ?? {}), bytes: out.content.length };
  if (out.file === 'vercel.json') {
    const count = JSON.parse(out.content).redirects.length;
    metrics[out.file].redirects = count;
    if (count > LIMITS.vercelRedirects) problems.push(`vercel.json has ${count} redirects > ${LIMITS.vercelRedirects}`);
  }
  if (out.file === 'middleware.ts' && out.metrics?.matcher > LIMITS.matcherEntries) {
    problems.push(`middleware matcher has ${out.metrics.matcher} entries > ${LIMITS.matcherEntries}`);
  }
}

const portable = metrics['public/_redirects'] ?? {};
if ((portable.staticCount ?? 0) > LIMITS.cfStatic) problems.push(`_redirects static rules ${portable.staticCount} > ${LIMITS.cfStatic}`);
if ((portable.dynamicCount ?? 0) > LIMITS.cfDynamic) problems.push(`_redirects dynamic rules ${portable.dynamicCount} > ${LIMITS.cfDynamic}`);

let changed = 0;
for (const out of outputs) {
  const abs = resolve(root, out.file);
  mkdirSync(dirname(abs), { recursive: true });
  const before = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  if (before === out.content) continue;
  changed += 1;
  if (check) problems.push(`out of date: ${out.file}`);
  else writeFileSync(abs, out.content);
}

console.log(
  `[aliases] ${reg.counts.exact} exact / ${reg.counts.prefix} prefix / ${reg.counts.gone} gone(410) / ` +
    `${reg.counts.query} query / ${reg.counts.caseFold} case-fold / ${reg.counts.cleanUrl} cleanUrl ` +
    `→ vercel ${metrics['vercel.json'].redirects}, matcher ${metrics['middleware.ts'].matcher}, ` +
    `_redirects ${portable.staticCount}+${portable.dynamicCount}` +
    (check ? ` · ${changed} file(s) out of date` : ` · ${changed} file(s) written`)
);
if (problems.length) {
  for (const p of problems) console.error('  ERROR', p);
  process.exit(1);
}
if (!check && changed === 0) console.log('[aliases] all artifacts already current');
