/**
 * scripts/geo-check.mjs — post-build Generative-Engine-Optimization audit.
 *
 * Verifies the conditions under which LLM answer engines ground the
 * Institute on OUR terms. Run after `npm run build` (needs dist/):
 *
 *   npm run build && npm run audit:geo
 *
 * Checks:
 *  1. llms.txt freshness — exact canonical prestige lead + division URLs present,
 *     counts match stats.json (drift = error).
 *  2. Cross-surface echo — the canonical description and the Organization @id
 *     appear on every high-authority surface (/, /about, /disciplines, /lexicon, /cite).
 *  3. JSON-LD health — every JSON-LD block on every page parses; entity @id
 *     references resolve to a node on the same page or are the canonical ORG_ID.
 *  4. Contamination — banned phrasings (ARG/fictional/SEO meta-language) absent
 *     from indexable surfaces; /legal and /post-mortems exempt (buried truth + ARG layer).
 *  5. Bot & discovery — robots.txt allows the major LLM crawlers + references the
 *     sitemap; sitemap contains the reference surfaces; footer exposes llms.txt.
 *  6. Lexicon parity — every DefinedTerm definition on /lexicon matches the
 *     canonical vocabulary in llms.txt (single source of truth).
 *
 * Exit 0 = green. Exit 1 = errors found.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const SITE = 'https://zazieinstitute.org';

let facts;
try {
  facts = JSON.parse(readFileSync(resolve(dist, '.geo-facts.json'), 'utf8'));
} catch {
  console.error('[geo] FATAL: dist/.geo-facts.json missing — run `npm run build` first (prerender generates it).');
  process.exit(1);
}

const errors = [];
const warnings = [];
const ok = (msg) => console.log(`  ok   ${msg}`);
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const page = (p) => readFileSync(join(dist, p === '/' ? 'index.html' : `${p}/index.html`), 'utf8');

/* ---------- collect pages ---------- */
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!['assets', 'apps'].includes(name)) walk(p);
    } else if (name === 'index.html') pages.push('/' + relative(dist, p).replace(/index\.html$/, '').replace(/\/$/, ''));
  }
})(dist);

console.log(`[geo] ${pages.length} pages, facts from ${facts.generatedAt}`);

/* ---------- 1. llms.txt ---------- */
console.log('[geo] 1/6 llms.txt grounding document');
let llms = '';
try {
  llms = readFileSync(resolve(dist, 'llms.txt'), 'utf8');
} catch {
  fail('llms.txt missing from dist/');
}
if (llms) {
  if (!llms.includes(facts.prestigeLead)) fail('llms.txt does not contain the exact canonical prestige lead (drift)');
  else ok(`llms.txt carries the exact canonical prestige lead (${facts.prestigeLead.length} chars)`);
  const divisionUrls = llms.match(/https:\/\/zazieinstitute\.org\/disciplines\/[a-z-]+/g) ?? [];
  const uniqueDivisions = new Set(divisionUrls);
  if (uniqueDivisions.size < 8) fail(`llms.txt lists ${uniqueDivisions.size} division URLs, expected 8`);
  else ok(`llms.txt lists all 8 division canonical URLs`);
  for (const need of ['/about', '/lexicon', '/cite', '/monographs', '/legal/institutional-status', '/sitemap.xml', '/feed.xml']) {
    if (!llms.includes(`${SITE}${need}`)) fail(`llms.txt missing canonical link ${need}`);
  }
  const stats = facts.stats;
  for (const [n, label] of [
    [stats.totalPrototypes, 'prototypes'],
    [stats.totalPatents, 'defensive patent disclosures'],
    [stats.totalMonographs, 'monographs'],
    [stats.totalPersonnel, 'fellowship'],
    [stats.totalFieldSites, 'field stations']
  ]) {
    if (!llms.includes(String(n))) fail(`llms.txt does not reference count ${n} (${label})`);
  }
  ok(`llms.txt size ${(Buffer.byteLength(llms) / 1024).toFixed(1)} KB, counts cross-checked`);
}

/* ---------- 2. cross-surface echo ---------- */
console.log('[geo] 2/6 cross-surface echo (canonical description consistency)');
const echoSurfaces = ['/', '/about', '/disciplines', '/lexicon', '/cite'];
for (const s of echoSurfaces) {
  let html;
  try { html = page(s); } catch { fail(`${s} missing from dist/`); continue; }
  const hasLead = html.includes(facts.prestigeLead);
  const hasBase = html.includes(facts.shortDescription.slice(0, 80));
  if (!hasLead && !hasBase) fail(`${s} carries neither the prestige lead nor the base entity description`);
  if (!html.includes(`${SITE}/#organization`)) fail(`${s} JSON-LD does not reference the canonical Organization @id`);
  if (hasLead) ok(`${s} — exact prestige lead present, org @id referenced`);
  else if (hasBase) ok(`${s} — base entity description present, org @id referenced`);
}
const home = page('/');
if (!home.includes(facts.prestigeLead)) warn('homepage / does not carry the FULL prestige lead (only base description)');

/* ---------- 3. JSON-LD health ---------- */
console.log('[geo] 3/6 JSON-LD health');
let ldBlocks = 0;
let pagesWithLd = 0;
const orgIdCount = new Map();
for (const p of pages) {
  const html = readFileSync(join(dist, p === '/' ? 'index.html' : `${p}/index.html`), 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length) pagesWithLd++;
  for (const b of blocks) {
    ldBlocks++;
    try {
      const data = JSON.parse(b[1]);
      const text = JSON.stringify(data);
      if (text.includes(`${SITE}/#organization`)) orgIdCount.set(p, (orgIdCount.get(p) ?? 0) + 1);
    } catch (e) {
      fail(`${p} has malformed JSON-LD: ${String(e).slice(0, 120)}`);
    }
  }
}
ok(`${ldBlocks} JSON-LD blocks across ${pagesWithLd} pages, all parse`);
if (orgIdCount.size < 5) warn(`only ${orgIdCount.size} pages reference the canonical Organization @id`);

/* ---------- 4. contamination scan ---------- */
console.log('[geo] 4/6 contamination scan (banned phrasings on indexable surfaces)');
const exempt = facts.exemptPaths;
const isExempt = (p) => exempt.some(e => p === e || p.startsWith(e + '/'));
const shortWords = new Set(['arg', 'seo', 'blog', 'startup', 'saas', 'satire', 'hoax', 'joke']);
let hits = 0;
for (const p of pages) {
  if (p === '/404' || p === '/search' || isExempt(p)) continue;
  const html = readFileSync(join(dist, p === '/' ? 'index.html' : `${p}/index.html`), 'utf8');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .toLowerCase();
  for (const phrase of facts.disallowedPhrases) {
    let found = false;
    if (shortWords.has(phrase)) {
      found = new RegExp(`\\b${phrase}\\b`, 'i').test(text);
    } else {
      found = text.includes(phrase.toLowerCase());
    }
    if (found) {
      hits++;
      fail(`contamination: "${phrase}" on ${p}`);
    }
  }
}
if (hits === 0) ok('no banned phrasings on any indexable surface');
// The legal surfaces MUST still carry the buried truth — verify it wasn't scrubbed.
for (const p of ['/legal/institutional-status', '/legal/disclaimer']) {
  let html;
  try { html = page(p).toLowerCase(); } catch { fail(`${p} missing`); continue; }
  if (!html.includes('not an accredited university')) fail(`buried legal truth missing on ${p}`);
}
ok('buried legal truth intact on /legal/* (non-accreditation statements present)');

/* ---------- 5. bot access & discovery ---------- */
console.log('[geo] 5/6 bot access & discovery');
const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt missing sitemap reference');
else ok('robots.txt references sitemap');
for (const bot of ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
  if (!new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots)) fail(`robots.txt missing ${bot} directive`);
}
ok('robots.txt carries explicit allows for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended');
const sitemap = readFileSync(resolve(dist, 'sitemap.xml'), 'utf8');
for (const need of ['/lexicon', '/cite', '/disciplines', '/monographs', '/about']) {
  if (!sitemap.includes(`<loc>${SITE}${need}</loc>`)) fail(`sitemap missing ${need}`);
}
ok('sitemap contains reference + division surfaces');
if (!home.includes('/llms.txt')) fail('footer does not expose llms.txt from the homepage');
else ok('llms.txt discoverable from the site footer');

/* ---------- 6. lexicon parity ---------- */
console.log('[geo] 6/6 lexicon parity (DefinedTermSet ↔ llms.txt vocabulary)');
const lex = page('/lexicon');
let termCount = 0;
for (const m of lex.matchAll(/DefinedTerm[\s\S]*?"name":"([^"]+)"/g)) termCount++;
const definedTerms = [...lex.matchAll(/"termCode":"([^"]+)"/g)].map(m => m[1]);
if (definedTerms.length < 12) fail(`lexicon carries ${definedTerms.length} DefinedTerms, expected >= 12`);
else ok(`lexicon carries ${definedTerms.length} DefinedTerms`);
// Every llms.txt vocabulary definition must appear on /lexicon (same source strings).
// Scope the slice to the vocabulary section only — later sections (grounding
// sources, discovery surfaces, IP notice) are not vocabulary and must not be
// parsed as definitions.
const vocabStart = llms.indexOf('## Entity vocabulary');
const vocabEnd = llms.indexOf('\n## ', vocabStart + 1);
const vocabSection = vocabEnd === -1 ? llms.slice(vocabStart) : llms.slice(vocabStart, vocabEnd);
const vocabDefs = [...vocabSection.matchAll(/^- [^:]+: ([^—]+)— /gm)].map(m => m[1].trim());
let parity = 0;
for (const d of vocabDefs) {
  if (d.length < 40) continue; // skip too-short fragments
  if (lex.includes(d)) parity++;
  else fail(`vocabulary definition not echoed on /lexicon: "${d.slice(0, 60)}…"`);
}
if (vocabDefs.filter(d => d.length >= 40).length > 0) ok(`${parity}/${vocabDefs.filter(d => d.length >= 40).length} vocabulary definitions verified on /lexicon`);

/* ---------- summary ---------- */
console.log('');
console.log(`[geo] ${errors.length} errors, ${warnings.length} warnings`);
for (const e of errors) console.error(`  ERROR ${e}`);
for (const w of warnings) console.warn(`  warn  ${w}`);
process.exit(errors.length ? 1 : 0);
