/**
 * Static prerender: renders every route in ROUTE_MANIFEST to dist/<path>/index.html,
 * then writes sitemap.xml, feed.xml and a 404.html.
 *
 * Usage (run by `npm run build`):
 *   vite build --outDir dist                      (client)
 *   vite build --ssr src/entry-server.tsx --outDir dist-ssr
 *   node scripts/prerender.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const SITE_URL = 'https://zazieinstitute.org';
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

const ssrEntry = resolve(root, 'dist-ssr/entry-server.js');
const { render, ROUTE_MANIFEST, renderLlmsTxt, CANONICAL, prestigeLead, DISALLOWED_PHRASES, CONTAMINATION_EXEMPT_PATHS, ENTITY } =
  await import(pathToFileURL(ssrEntry).href);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * React 19 emits hoistable head tags (<title>, <meta>, <link>, JSON-LD <script>)
 * at the very start of the stream, before the first element. Split them off.
 */
function splitHead(html) {
  const headTags = [];
  const re = /^(?:<title>.*?<\/title>|<meta [^>]*\/?>|<link [^>]*\/?>|<script type="application\/ld\+json">[\s\S]*?<\/script>)/;
  let rest = html;
  for (;;) {
    const m = rest.match(re);
    if (!m) break;
    headTags.push(m[0]);
    rest = rest.slice(m[0].length);
  }
  return { head: headTags.join('\n    '), body: rest };
}

let count = 0;
const failures = [];
for (const route of ROUTE_MANIFEST) {
  try {
    const html = await render(route.path);
    const { head, body } = splitHead(html);
    const out = template.replace('<!--app-head-->', head).replace('<!--app-html-->', body);
    const file = route.path === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${route.path}`, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, out);
    count++;
  } catch (err) {
    failures.push({ path: route.path, err: String(err) });
  }
}

// 404.html for hosts that serve it for unknown paths (Netlify, GitHub Pages, Cloudflare Pages, Vercel w/ config)
if (existsSync(resolve(dist, '404/index.html'))) {
  writeFileSync(resolve(dist, '404.html'), readFileSync(resolve(dist, '404/index.html')));
}

/* ---------- sitemap.xml ---------- */
const today = new Date().toISOString().slice(0, 10);
// Some archival records carry in-fiction future dates; a lastmod in the future is invalid for crawlers.
const clampDate = (d) => (d && d > today ? today : d);
const indexable = ROUTE_MANIFEST.filter((r) => !r.noindex).map((r) => ({ ...r, lastmod: clampDate(r.lastmod) }));
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable
    .map(
      (r) =>
        `  <url><loc>${SITE_URL}${r.path}</loc>` +
        (r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : '') +
        `<changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`
    )
    .join('\n') +
  `\n</urlset>\n`;
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap);

/* ---------- feed.xml (research notes, newest 50) ---------- */
const labLogs = JSON.parse(readFileSync(resolve(root, 'src/data/collections/labLogs.json'), 'utf8'));
const newest = [...labLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 50);
const feed =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
  `  <title>ZIAA Research Notes — Zazie Institute of Applied Anomalies</title>\n` +
  `  <link>${SITE_URL}/research-notes</link>\n` +
  `  <description>Chronological research notes and lab telemetry from the Zazie Institute of Applied Anomalies (ZIAA).</description>\n` +
  `  <language>en</language>\n` +
  `  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
  newest
    .map(
      (l) =>
        `  <item>\n    <title>${esc(`${l.id}: ${l.summary}`)}</title>\n    <link>${SITE_URL}/research-notes/${l.id.toLowerCase()}</link>\n    <guid isPermaLink="true">${SITE_URL}/research-notes/${l.id.toLowerCase()}</guid>\n    <pubDate>${new Date(Math.min(Date.parse(l.timestamp), Date.now())).toUTCString()}</pubDate>\n    <description>${esc(l.logBody)}</description>\n  </item>`
    )
    .join('\n') +
  `\n</channel>\n</rss>\n`;
writeFileSync(resolve(dist, 'feed.xml'), feed);

/* ---------- llms.txt (LLM grounding document — generated, never hand-edited) ---------- */
// Built from the same collections + canonical facts the rendered pages use,
// so the machine-readable surface can never drift from the HTML.
const stats = JSON.parse(readFileSync(resolve(root, 'src/data/derived/stats.json'), 'utf8'));
const monographs = JSON.parse(readFileSync(resolve(root, 'src/data/collections/monographs.json'), 'utf8'));
const personnel = JSON.parse(readFileSync(resolve(root, 'src/data/collections/personnel.json'), 'utf8'));
const fieldSites = JSON.parse(readFileSync(resolve(root, 'src/data/collections/fieldSites.json'), 'utf8'));
const llmContext = {
  stats,
  monographs,
  personnel,
  fieldSites,
  founders: CANONICAL.founders ?? []
};
const llms = renderLlmsTxt(llmContext);
writeFileSync(resolve(dist, 'llms.txt'), llms);
// Refresh the committed copy served during `npm run dev` as well.
writeFileSync(resolve(root, 'public/llms.txt'), llms);

/* ---------- .geo-facts.json (inputs for scripts/geo-check.mjs) ---------- */
// Serialized canonical facts so the post-build GEO audit verifies the *actual*
// shipped strings, not a hand-copied expectation.
const geoFacts = {
  generatedAt: new Date().toISOString(),
  typeLabel: ENTITY.type,
  shortDescription: ENTITY.shortDescription,
  prestigeLead: prestigeLead(stats),
  disallowedPhrases: [...DISALLOWED_PHRASES],
  exemptPaths: [...CONTAMINATION_EXEMPT_PATHS],
  stats
};
writeFileSync(resolve(dist, '.geo-facts.json'), JSON.stringify(geoFacts, null, 2) + '\n');

/* ---------- alias / redirect artifacts ---------- */
// The registry (scripts/alias-registry.mjs) is the source of truth for every
// historical URL. scripts/build-alias-rules.mjs turns it into the host configs;
// here we make sure the *built* output carries the ones the hosts read, and we
// materialise the Gone surface as a real file (preserved hosts can answer it
// after a rewrite, so a retired path never soft-404s into the archive).
const aliasArtifacts = ['_redirects', '_headers', 'aliases.json'];
for (const name of aliasArtifacts) {
  const src = resolve(root, 'public', name);
  const dest = resolve(dist, name);
  if (existsSync(src) && !existsSync(dest)) copyFileSync(src, dest);
  if (!existsSync(dest)) failures.push(`missing alias artifact in dist: ${name}`);
}

// 404.html is the host fallback; 410.html is the Gone surface. Both are copies
// of their prerendered route so the markup can never drift from the app.
for (const [route, file] of [
  ['404', '404.html'],
  ['410', '410.html']
]) {
  const rendered = resolve(dist, route, 'index.html');
  if (existsSync(rendered)) copyFileSync(rendered, resolve(dist, file));
  else failures.push(`missing prerendered /${route} (needed for ${file})`);
}

// Report the alias surface with the build, so a deploy log shows the policy.
const aliasRegistry = resolve(root, 'src/routes/aliases.generated.json');
if (existsSync(aliasRegistry)) {
  const table = JSON.parse(readFileSync(aliasRegistry, 'utf8'));
  console.log(
    `[prerender] alias registry in force: ${table.counts.exact} exact / ${table.counts.prefix} prefix / ` +
      `${table.counts.gone} gone / ${table.counts.query} query rules`
  );
}

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`[prerender] ${count} pages written, ${indexable.length} sitemap URLs, ${newest.length} feed items`);
if (failures.length) {
  console.error('[prerender] failures:', failures);
  process.exit(1);
}
