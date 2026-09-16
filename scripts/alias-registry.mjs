/**
 * ZIAA URL ALIAS REGISTRY — the single source of truth for every historical,
 * internal, alias, cleanUrl-variant, faceting-leftover and satellite-fossil
 * path that must resolve on the institutional origin.
 *
 * Each rule carries a class, a provenance string and a host channel set:
 *
 *   class       which era / mechanism produced the old URL
 *   provenance  the artifact that proves the old URL existed (file, document,
 *               host config, satellite repository)
 *   status      301 (moved to a living successor) or 410 (served content,
 *               permanently withdrawn, no successor)
 *   hosts       which generated artifact may carry the rule —
 *                 config     vercel.json redirects       (308 on the wire)
 *                 redirects  public/_redirects            (301 on the wire)
 *                 strict     _redirects variants, nginx/apache, middleware,
 *                            Cloudflare Pages Functions, the local mirror
 *
 * Honesty rules
 *   1. 410 is only used where content really served and is really withdrawn.
 *      Paths that never existed fall through to the 404 surface.
 *   2. Rules whose destination path equals their source path are excluded from
 *      `config` and `redirects`: a host that preserves the query string would
 *      redirect such a URL to itself forever. They are carried by `strict`
 *      channels (server configs, middleware, the local mirror), which can drop
 *      the query inside one response.
 *   3. Case folding of accession ids (`/prototypes/PROT-001`) is NOT emitted to
 *      `config`/`redirects` either: under case-insensitive source matching a
 *      lowercase canonical request would match its own uppercase rule. It is
 *      carried by `strict` channels and by the operator-facing bulk-redirect CSV
 *      (caseSensitive=true).
 *   4. Nothing under /apps/void-oculus/ is ever redirected: that path is the
 *      embedded instrument runtime, not a page.
 *
 * Consumers (all generated, never hand-edited):
 *   scripts/build-alias-rules.mjs → vercel.json, public/_redirects,
 *        public/_headers, public/aliases.json, src/routes/aliases.generated.json,
 *        deploy/* (netlify, cloudflare-pages, nginx, apache, middleware, CSV),
 *        URL_ALIAS_LEDGER.md
 *   scripts/lib/static-server.mjs → local mirror of production routing
 *   scripts/dev-aliases.mjs       → `npm run dev` / `npm run preview` mirror
 *   scripts/audit-aliases.mjs     → registry ↔ host config ↔ dist audit
 *   src/routes/aliasResolver.ts   → client rescue (generated from the same table)
 *
 * Adding a rule: add it here with provenance, run `npm run build:aliases`,
 * then `npm run audit`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const load = (name) => JSON.parse(readFileSync(resolve(root, `src/data/collections/${name}.json`), 'utf8'));

export const CANONICAL_ORIGIN = 'https://zazieinstitute.org';
export const STATUS_PERMANENT = 301;
export const STATUS_GONE = 410;

/* ------------------------------------------------------------------ */
/* Provenance                                                          */
/* ------------------------------------------------------------------ */

export const PROVENANCE = {
  drift:
    'earlier iterations of this repository — vercel.json + public/_redirects redirect set and src/App.tsx <Navigate> pairs (pre-2026-09-15)',
  hashTabs:
    'src/App.tsx LEGACY_TABS — the hash/tab navigation of the first static build (#vault, ?tab=vault)',
  predecessor:
    'github.com/zazieproductions/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY — the Cloudflare Pages predecessor (wrangler.toml name="ziaa"), its src/App.tsx route table and its src/data/*.ts accessions',
  predecessorDocs:
    'github.com/zazieproductions/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY — src/data/exhibitions.ts documentationUrls',
  predecessorCatchAll:
    'the predecessor deployed `/* /index.html 200`, so every one of its URLs answered 200 through the SPA shell — including paths that never had a route. The named ones are withdrawn here (410) instead of being left to drift.',
  cleanUrls: 'vercel.json cleanUrls:true + trailingSlash:false; scripts/prerender.mjs writes dist/<path>/index.html',
  facets:
    'SEO_SITEMAP_AUDIT.md §2/§4 faceting leftovers — query-string views of the hubs (src/pages/PrototypesArchive.tsx reads ?discipline/?status/?clearance/?year)',
  satellites:
    'satellite repositories of the zazieproductions account ported into the archive: void-oculus, spectra-lab, SYNTHESIS-SIGNAL, Electromagnetic-Spectrum-Emotion-Web-Instrument, interference-archive, vortex-av-engine',
  satelliteNames:
    'repository names cited inside this repository — src/components/SynthesisSignalLab.tsx, src/pages/SynthesisSignalPage.tsx, src/pages/EmotionSpectrumPage.tsx, src/seo/site.ts (sameAs) and BLACK_HAT_SEO_ARCHITECT_PLAYBOOK.md §4 (planned ziaa-dsp GitHub Pages satellite)',
  convention:
    'addresses that feed readers, crawlers and link checkers probe for a website; index.html advertises /feed.xml and /sitemap.xml as the machine surfaces',
  gone: 'retired surfaces — content served, then withdrawn, with no successor page (410 is the honest signal; a 404 would invite re-crawling)',
  identity:
    'provable identity, verified by name equality between the predecessor accessions and the modern personnel register',
  caseFold:
    'accession ids are printed uppercase on the records themselves (PROT-001, PAT-2021-001, LOG-001); RecordPage.tsx already canonicalises the lowercase form client-side',
  shadowNote: 'canonicalisation of the file URL of an existing page (cleanUrls / trailingSlash policy)'
};

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

const collections = () => ({
  prototypes: load('prototypes'),
  patents: load('patents'),
  labLogs: load('labLogs'),
  monographs: load('monographs'),
  failures: load('failures'),
  personnel: load('personnel'),
  fieldSites: load('fieldSites'),
  disciplines: load('disciplines')
});

/** Canonical static surfaces — mirror of src/routes/manifest.ts STATIC_ROUTES. */
export const CANONICAL_STATIC_PATHS = [
  '/',
  '/about',
  '/prototypes',
  '/patents',
  '/research-notes',
  '/monographs',
  '/acoustic-bench',
  '/spectra-lab',
  '/void-oculus',
  '/synthesis-signal',
  '/emotion-spectrum',
  '/legal/institutional-status',
  '/legal/disclaimer',
  '/legal/terms',
  '/legal/privacy',
  '/field-stations',
  '/post-mortems',
  '/fellows',
  '/system-audit',
  '/lexicon',
  '/cite',
  '/disciplines',
  '/papers',
  '/search',
  '/404',
  '/410'
];

/** Sections that own detail pages, with the client record type. */
export const RECORD_SECTIONS = [
  { path: '/prototypes', collection: 'prototypes', type: 'prototype' },
  { path: '/patents', collection: 'patents', type: 'patent' },
  { path: '/research-notes', collection: 'labLogs', type: 'log' },
  { path: '/monographs', collection: 'monographs', type: 'monograph' },
  { path: '/post-mortems', collection: 'failures', type: 'failure' },
  { path: '/fellows', collection: 'personnel', type: 'personnel' },
  { path: '/field-stations', collection: 'fieldSites', type: 'site' }
];

export const disciplineSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/* ------------------------------------------------------------------ */
/* Rule tables                                                         */
/* ------------------------------------------------------------------ */

const ALL = ['config', 'redirects', 'strict'];

/** Exact 301 aliases: from → to. */
export const EXACT_ALIASES = [
  /* --- vocabulary drift inside this repository --- */
  { from: '/dashboard', to: '/', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/overview', to: '/', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/logs', to: '/research-notes', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/lab-logs', to: '/research-notes', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/bench', to: '/acoustic-bench', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/spectra', to: '/spectra-lab', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/oculus', to: '/void-oculus', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/synthesis', to: '/synthesis-signal', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/spectrum', to: '/emotion-spectrum', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/infrastructure', to: '/field-stations', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/vault', to: '/post-mortems', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/failures', to: '/post-mortems', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/personnel', to: '/fellows', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/audit', to: '/system-audit', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/legal', to: '/legal/institutional-status', class: 'vocabulary-drift', provenance: PROVENANCE.drift },

  /* --- superceded file URLs of real pages (cleanUrls) --- */
  { from: '/index.html', to: '/', class: 'cleanurl', provenance: PROVENANCE.cleanUrls },
  { from: '/void-oculus/index.html', to: '/void-oculus', class: 'cleanurl', provenance: PROVENANCE.cleanUrls },

  /* --- predecessor (ZIAA Laboratory) vocabulary --- */
  { from: '/people', to: '/fellows', class: 'predecessor', provenance: PROVENANCE.predecessor },
  { from: '/policies', to: '/legal/institutional-status', class: 'predecessor', provenance: PROVENANCE.predecessor },
  { from: '/timeline', to: '/about', class: 'predecessor', provenance: PROVENANCE.predecessor },
  { from: '/instruments', to: '/prototypes', class: 'predecessor', provenance: PROVENANCE.predecessor },

  /* predecessor personnel register: 6 accessions, 5 re-accessioned without a
     provable identity, one provable match (PERSON-003 ≡ FELLOW-001). */
  { from: '/people/PERSON-001', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/people/PERSON-002', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/people/PERSON-003', to: '/fellows/fellow-001', class: 'predecessor-identity', provenance: `${PROVENANCE.identity} — PERSON-003 "Aris Thorne" ≡ FELLOW-001 "Dr. V. Aris Thorne"` },
  { from: '/people/PERSON-004', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/people/PERSON-005', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/people/PERSON-006', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },

  /* --- satellite repository names (cited in-repo, never routes on this origin) --- */
  { from: '/SYNTHESIS-SIGNAL', to: '/synthesis-signal', class: 'satellite-name', provenance: PROVENANCE.satelliteNames },
  { from: '/Electromagnetic-Spectrum-Emotion-Web-Instrument', to: '/emotion-spectrum', class: 'satellite-name', provenance: PROVENANCE.satelliteNames },
  { from: '/electromagnetic-spectrum-emotion-web-instrument', to: '/emotion-spectrum', class: 'satellite-name', provenance: PROVENANCE.satelliteNames },
  { from: '/interference-archive', to: '/disciplines/signal-archaeology', class: 'satellite-name', provenance: `${PROVENANCE.satellites} — no accession on this origin; routed to the nearest research division` },
  { from: '/vortex-av-engine', to: '/disciplines/computational-creativity', class: 'satellite-name', provenance: `${PROVENANCE.satellites} — no accession on this origin; routed to the nearest research division` },
  { from: '/ziaa-dsp', to: '/disciplines/generative-software', class: 'satellite-name', provenance: PROVENANCE.satelliteNames },
  { from: '/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY', to: '/', class: 'satellite-name', provenance: PROVENANCE.predecessor },
  { from: '/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES', to: '/', class: 'satellite-name', provenance: 'repository name of this archive, probed as a path' },
  { from: '/ziaa', to: '/', class: 'satellite-name', provenance: 'abbreviation + Cloudflare Pages project name ("ziaa") probed as a path' },
  { from: '/ziaa-lab', to: '/', class: 'satellite-name', provenance: PROVENANCE.predecessor },
  { from: '/laboratory', to: '/', class: 'satellite-name', provenance: PROVENANCE.predecessor },

  /* --- machine surfaces probed by readers and crawlers --- */
  { from: '/feed', to: '/feed.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/rss', to: '/feed.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/rss.xml', to: '/feed.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/atom.xml', to: '/feed.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/index.xml', to: '/feed.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/sitemap', to: '/sitemap.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/sitemap_index.xml', to: '/sitemap.xml', class: 'convention-alias', provenance: PROVENANCE.convention },
  { from: '/sitemap-index.xml', to: '/sitemap.xml', class: 'convention-alias', provenance: PROVENANCE.convention }
];

/** Prefix trees. splat:true re-appends the remainder, splat:false collapses. */
export const PREFIX_ALIASES = [
  /* --- vocabulary drift --- */
  { from: '/logs', to: '/research-notes', splat: true, class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/lab-logs', to: '/research-notes', splat: true, class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/personnel', to: '/fellows', splat: true, class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/bench', to: '/acoustic-bench', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/spectra', to: '/spectra-lab', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/oculus', to: '/void-oculus', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/synthesis', to: '/synthesis-signal', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/spectrum', to: '/emotion-spectrum', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/infrastructure', to: '/field-stations', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/vault', to: '/post-mortems', splat: true, class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/failures', to: '/post-mortems', splat: true, class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/dashboard', to: '/', class: 'vocabulary-drift', provenance: PROVENANCE.drift },
  { from: '/overview', to: '/', class: 'vocabulary-drift', provenance: PROVENANCE.drift },

  /* --- predecessor vocabulary ---
     Only the accession family is routed: an unproven /people/<something>
     never had a record, so it is withdrawn (410) rather than "moved". */
  { from: '/people/PERSON-', to: '/fellows', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/instruments', to: '/prototypes', class: 'predecessor', provenance: PROVENANCE.predecessor },

  /* --- predecessor accession families (the records were re-accessioned:
         measured title similarity to the modern series is ≤ 0.55, so the
         section hub is the honest permanent target, not a guessed record) --- */
  { from: '/prototypes/ZIAA-PROTO-', to: '/prototypes', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/prototypes/ziaa-proto-', to: '/prototypes', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/patents/ZIAA-PAT-', to: '/patents', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/patents/ziaa-pat-', to: '/patents', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/papers/ZIAA-PAPER-', to: '/papers', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/papers/ziaa-paper-', to: '/papers', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/logs/ZIAA-LOG-', to: '/research-notes', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/research-notes/ZIAA-LOG-', to: '/research-notes', class: 'predecessor-accession', provenance: PROVENANCE.predecessor },
  { from: '/ZIAA-PROTO-', to: '/prototypes', class: 'predecessor-accession', provenance: `${PROVENANCE.predecessor}; bare ids appear in citations of the predecessor accessions` },
  { from: '/ZIAA-PAT-', to: '/patents', class: 'predecessor-accession', provenance: `${PROVENANCE.predecessor}; bare ids appear in citations of the predecessor accessions` },
  { from: '/ZIAA-PAPER-', to: '/papers', class: 'predecessor-accession', provenance: `${PROVENANCE.predecessor}; bare ids appear in citations of the predecessor accessions` },
  { from: '/ZIAA-LOG-', to: '/research-notes', class: 'predecessor-accession', provenance: `${PROVENANCE.predecessor}; bare ids appear in citations of the predecessor accessions` },

  /* --- satellite fossils: any path below a satellite slug is that instrument --- */
  { from: '/void-oculus', to: '/void-oculus', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/spectra-lab', to: '/spectra-lab', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/synthesis-signal', to: '/synthesis-signal', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/emotion-spectrum', to: '/emotion-spectrum', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/acoustic-bench', to: '/acoustic-bench', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/interference-archive', to: '/disciplines/signal-archaeology', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/vortex-av-engine', to: '/disciplines/computational-creativity', class: 'satellite-fossil', provenance: PROVENANCE.satellites },
  { from: '/ziaa-dsp', to: '/disciplines/generative-software', class: 'satellite-fossil', provenance: PROVENANCE.satelliteNames },
  { from: '/ZAZIE-INSTITUTE-APPLIED-ANOMALIES-LABORATORY', to: '/', class: 'satellite-fossil', provenance: PROVENANCE.predecessor },
  { from: '/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES', to: '/', class: 'satellite-fossil', provenance: 'repository name of this archive, probed as a path' },
  { from: '/ziaa-lab', to: '/', class: 'satellite-fossil', provenance: PROVENANCE.predecessor },
  { from: '/laboratory', to: '/', class: 'satellite-fossil', provenance: PROVENANCE.predecessor }
];

/**
 * Withdrawn surfaces (410). Only paths that really served content:
 * the predecessor's SPA shell answered 200 for every one of them.
 */
export const GONE_RULES = [
  { from: '/exhibitions', mode: 'prefix', class: 'retired-programme', provenance: PROVENANCE.predecessor },
  { from: '/exhibitions', mode: 'exact', class: 'retired-programme', provenance: PROVENANCE.predecessorCatchAll },
  { from: '/EXHIB-', mode: 'prefix', class: 'retired-programme', provenance: `${PROVENANCE.predecessor} — exhibition accessions EXHIB-2023-C / EXHIB-2024-B / EXHIB-2025-A` },
  { from: '/archives', mode: 'exact', class: 'retired-documentation', provenance: `${PROVENANCE.predecessorDocs} — the catalog/vault-log directory was never published on this origin` },
  { from: '/archives', mode: 'prefix', class: 'retired-documentation', provenance: `${PROVENANCE.predecessorDocs} — catalog and vault-log PDFs referenced but never published on this origin` },
  { from: '/timeline', mode: 'prefix', class: 'retired-surface', provenance: PROVENANCE.predecessorCatchAll },
  { from: '/policies', mode: 'prefix', class: 'retired-surface', provenance: PROVENANCE.predecessorCatchAll },
  { from: '/people', mode: 'prefix', class: 'retired-surface', provenance: PROVENANCE.predecessorCatchAll },
  { from: '/search', mode: 'prefix', class: 'retired-surface', provenance: PROVENANCE.predecessorCatchAll },
  { from: '/apps', mode: 'exact', class: 'retired-surface', provenance: 'public/apps/ holds exactly one accessioned runtime (/apps/void-oculus/)' }
];

/* ------------------------------------------------------------------ */
/* Query-string canonicalisation                                       */
/* ------------------------------------------------------------------ */

const ALL_CHANNELS = ['config', 'redirects', 'strict'];
const STRICT_ONLY = ['strict'];

/** Facets whose canonical successor is a different path: safe for every host. */
export function buildQueryRules() {
  const rules = [];
  const push = (rule) => rules.push(rule);
  const disciplines = collections().disciplines;

  // 1. Current vocabulary: /prototypes?discipline=<name|slug> → division hub.
  for (const name of disciplines) {
    const slug = disciplineSlug(name);
    const values = [...new Set([name, name.toLowerCase(), slug, slug.replace(/-/g, ' '), encodeURIComponent(name)])];
    for (const value of values) {
      for (const path of ['/prototypes', '/patents']) {
        push({
          path,
          key: 'discipline',
          value,
          to: `/disciplines/${slug}`,
          class: 'facet-leftover',
          provenance: PROVENANCE.facets,
          hosts: ALL_CHANNELS
        });
      }
    }
  }

  // 2. Predecessor vocabulary: /prototypes?division=<division> (PrototypeIndex.tsx).
  const divisionTargets = {
    'Perceptual Interfaces': '/disciplines/perceptual-interfaces',
    'Signal Archaeology': '/disciplines/signal-archaeology',
    'Material Acoustics': '/disciplines',
    'Generative Systems': '/disciplines',
    'Spatial Infrastructures': '/disciplines'
  };
  for (const [division, to] of Object.entries(divisionTargets)) {
    for (const value of [...new Set([division, division.toLowerCase(), encodeURIComponent(division)])]) {
      for (const path of ['/prototypes', '/patents']) {
        push({
          path,
          key: 'division',
          value,
          to,
          class: 'facet-leftover',
          provenance: `${PROVENANCE.predecessor} — src/pages/PrototypeIndex.tsx reads ?division=`,
          hosts: ALL_CHANNELS
        });
      }
    }
  }

  // 3. Legacy hash-tab navigation: /?tab=<key> → canonical section.
  const tabs = {
    dashboard: '/',
    prototypes: '/prototypes',
    patents: '/patents',
    logs: '/research-notes',
    bench: '/acoustic-bench',
    spectra: '/spectra-lab',
    oculus: '/void-oculus',
    infrastructure: '/field-stations',
    monographs: '/monographs',
    vault: '/post-mortems',
    personnel: '/fellows',
    audit: '/system-audit'
  };
  for (const [value, to] of Object.entries(tabs)) {
    push({ path: '/', key: 'tab', value, to, class: 'hash-tab-leftover', provenance: PROVENANCE.hashTabs, hosts: ALL_CHANNELS });
  }
  push({ path: '/', key: 'tab', to: '/', class: 'hash-tab-leftover', provenance: PROVENANCE.hashTabs, hosts: ALL_CHANNELS });

  // 4. Same-path facet collapse — strict channels only (see honesty rule 2).
  for (const path of ['/prototypes', '/patents', '/research-notes']) {
    for (const key of ['discipline', 'primaryDiscipline', 'disciplineSlug', 'division']) {
      push({ path, key, to: path === '/prototypes' ? '/prototypes' : path, class: 'facet-leftover', provenance: PROVENANCE.facets, hosts: STRICT_ONLY, samePath: true });
    }
  }
  for (const key of ['status', 'clearance', 'year']) {
    push({ path: '/prototypes', key, to: '/prototypes', class: 'facet-leftover', provenance: PROVENANCE.facets, hosts: STRICT_ONLY, samePath: true });
  }
  for (const key of ['facility', 'author', 'tag', 'tags']) {
    push({ path: '/research-notes', key, to: '/research-notes', class: 'facet-leftover', provenance: PROVENANCE.facets, hosts: STRICT_ONLY, samePath: true });
  }
  for (const [path, key] of [['/papers', 'id'], ['/patents', 'id'], ['/monographs', 'id'], ['/fellows', 'id']]) {
    push({ path, key, to: path, class: 'facet-leftover', provenance: `${PROVENANCE.predecessor} — src/pages/{Papers,PatentOffice}.tsx selected a record with ?id=`, hosts: STRICT_ONLY, samePath: true });
  }
  return rules;
}

/* ------------------------------------------------------------------ */
/* Patterns: cleanUrl variants + accession case folding                */
/* ------------------------------------------------------------------ */

/** Which artifacts may carry case-folding rules (see honesty rule 3). */
const CASE_FOLD_HOSTS = ['strict', 'csv', 'middleware'];

export function buildCaseFoldRules() {
  const { prototypes, patents, labLogs, monographs, failures, personnel, fieldSites } = collections();
  const rules = [];
  const add = (section, rows) => {
    for (const row of rows) {
      if (row.id === row.id.toLowerCase()) continue;
      rules.push({
        from: `${section}/${row.id}`,
        to: `${section}/${row.id.toLowerCase()}`,
        class: 'case-fold',
        provenance: PROVENANCE.caseFold,
        hosts: CASE_FOLD_HOSTS
      });
    }
  };
  add('/prototypes', prototypes);
  add('/patents', patents);
  add('/research-notes', labLogs);
  add('/monographs', monographs);
  add('/post-mortems', failures);
  add('/fellows', personnel);
  add('/field-stations', fieldSites);
  return rules;
}

/** Which artifacts may carry cleanUrl-pattern rules (see honesty rule 2). */
const CLEANURL_HOSTS = ['config', 'redirects', 'strict'];

/**
 * CleanUrl variants. `shape` selects the matched form; detail sections are
 * emitted as one pattern rule per section, static pages as literal rules.
 */
export function buildCleanUrlRules() {
  const rules = [];
  const staticPages = [
    ...CANONICAL_STATIC_PATHS.filter((p) => p !== '/' && p !== '/404' && p !== '/410'),
    ...collections().disciplines.map((name) => `/disciplines/${disciplineSlug(name)}`)
  ];
  const sections = RECORD_SECTIONS.map((s) => s.path);

  const push = (from, to, hostSet) =>
    rules.push({
      from,
      to,
      class: 'cleanurl',
      provenance: PROVENANCE.cleanUrls,
      pattern: true,
      hosts: hostSet
    });

  for (const page of staticPages) {
    push(`${page}/index.html`, page, CLEANURL_HOSTS);
    push(`${page}.html`, page, ['redirects', 'strict']);
    push(`${page}/`, page, ['strict']);
  }
  push('/index.html', '/', CLEANURL_HOSTS);
  push('/void-oculus/index.html', '/void-oculus', CLEANURL_HOSTS);
  for (const section of sections) {
    push(`${section}/:id/index.html`, `${section}/:id`, CLEANURL_HOSTS);
    push(`${section}/:id.html`, `${section}/:id`, ['redirects', 'strict', 'middleware']);
    push(`${section}/:id/`, `${section}/:id`, ['strict', 'middleware']);
  }
  return rules;
}

/* ------------------------------------------------------------------ */
/* Header (canonical) policy                                           */
/* ------------------------------------------------------------------ */

export const HEADER_RULES = [
  {
    source: '/search',
    headers: { 'X-Robots-Tag': 'noindex, follow' },
    provenance: 'search results are query-dependent; the page declares noindex and is excluded from the sitemap'
  },
  { source: '/404', headers: { 'X-Robots-Tag': 'noindex' }, provenance: 'error surface' },
  { source: '/410', headers: { 'X-Robots-Tag': 'noindex' }, provenance: 'gone surface' },
  {
    source: '/aliases.json',
    headers: {
      'X-Robots-Tag': 'noindex',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    },
    provenance: 'machine-readable alias registry'
  },
  {
    source: '/_redirects',
    headers: { 'X-Robots-Tag': 'noindex', 'Content-Type': 'text/plain; charset=utf-8' },
    provenance: 'host configuration artifact'
  },
  {
    source: '/_headers',
    headers: { 'X-Robots-Tag': 'noindex', 'Content-Type': 'text/plain; charset=utf-8' },
    provenance: 'host configuration artifact'
  },
  {
    source: '/papers/*',
    headers: { Link: `<${CANONICAL_ORIGIN}/papers>; rel="canonical"` },
    provenance:
      'a PDF cannot carry a <link rel=canonical>; the document corpus page is the canonical surface for every dossier, declared in the HTTP header instead'
  },
  {
    source: '/apps/void-oculus/*',
    headers: { Link: `<${CANONICAL_ORIGIN}/void-oculus>; rel="canonical"` },
    provenance: 'the embedded instrument runtime is not an indexable surface; its canonical page is /void-oculus'
  }
];

/* ------------------------------------------------------------------ */
/* Other origins already present in this repository                    */
/* ------------------------------------------------------------------ */

export const SATELLITE_ORIGINS = [
  { origin: 'https://zazieproductions.github.io/void-oculus/', target: 'https://zazieinstitute.org/void-oculus', evidence: 'GitHub Pages built from main; the repository README links the demo', hosts: ALL },
  { origin: 'https://zazieproductions.github.io/interference-archive/', target: 'https://zazieinstitute.org/disciplines/signal-archaeology', evidence: 'GitHub Pages built from main; link in the repository README', hosts: ALL },
  { origin: 'https://zazieproductions.github.io/vortex-av-engine/', target: 'https://zazieinstitute.org/disciplines/computational-creativity', evidence: 'GitHub Pages configured from main; link in the repository README', hosts: ALL },
  { origin: 'https://zazieproductions.github.io/spectra-lab/', target: 'https://zazieinstitute.org/spectra-lab', evidence: 'the repository README documents publishing the root from main', hosts: ['planned'] },
  { origin: 'https://zazieproductions.github.io/SYNTHESIS-SIGNAL/', target: 'https://zazieinstitute.org/synthesis-signal', evidence: 'the repository README documents publishing the root from main', hosts: ['planned'] },
  { origin: 'https://zazieproductions.github.io/ziaa-dsp/', target: 'https://zazieinstitute.org/disciplines/generative-software', evidence: 'BLACK_HAT_SEO_ARCHITECT_PLAYBOOK.md §4 — planned GitHub Pages satellite', hosts: ['planned'] },
  { origin: 'https://ziaa.pages.dev/', target: 'https://zazieinstitute.org/', evidence: 'wrangler.toml name="ziaa" of the predecessor Cloudflare Pages project', hosts: ['planned'] }
];

/* ------------------------------------------------------------------ */
/* Expansion + resolution                                              */
/* ------------------------------------------------------------------ */

const stripSlash = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

function channelFilter(list, channel) {
  return list.filter((r) => (r.hosts ?? ALL).includes(channel));
}

/** Expand everything into the per-channel structures hosts and audits use. */
export function expandAliasRules() {
  const caseFold = buildCaseFoldRules();
  const cleanUrl = buildCleanUrlRules();
  const query = buildQueryRules();

  const exactSource = [
    ...EXACT_ALIASES.map((r) => ({ ...r, status: STATUS_PERMANENT })),
    ...caseFold.map((r) => ({ ...r, status: STATUS_PERMANENT })),
    ...cleanUrl
      .filter((r) => !r.from.includes(':'))
      .map((r) => ({ ...r, status: STATUS_PERMANENT }))
  ];
  const exact = [];
  const seen = new Set();
  for (const rule of exactSource) {
    if (seen.has(rule.from)) continue;
    seen.add(rule.from);
    exact.push(rule);
  }

  const prefix = [];
  const seenPrefix = new Set();
  // Accession families and satellite slugs are more specific than their parents;
  // order by descending path length so first-match hosts behave like the mirror.
  const ordered = [...PREFIX_ALIASES].sort((a, b) => b.from.length - a.from.length);
  for (const rule of ordered) {
    if (seenPrefix.has(rule.from)) continue;
    seenPrefix.add(rule.from);
    prefix.push({ ...rule, status: STATUS_PERMANENT, splat: rule.splat === true });
  }

  const goneExact = GONE_RULES.filter((r) => r.mode === 'exact').map((r) => ({ ...r, status: STATUS_GONE }));
  const gonePrefix = GONE_RULES.filter((r) => r.mode === 'prefix')
    .map((r) => ({ ...r, status: STATUS_GONE }))
    .sort((a, b) => b.from.length - a.from.length);

  const sections = RECORD_SECTIONS.map((s) => ({ ...s }));
  const disciplinePaths = collections().disciplines.map((name) => `/disciplines/${disciplineSlug(name)}`);
  const canonicalPaths = [
    ...CANONICAL_STATIC_PATHS,
    ...disciplinePaths,
    ...sections.flatMap((s) => collections()[s.collection].map((row) => `${s.path}/${row.id.toLowerCase()}`))
  ];

  const byChannel = {
    config: {
      exact: channelFilter(exact, 'config').filter((r) => r.class !== 'case-fold'),
      prefix: channelFilter(prefix, 'config'),
      query: query.filter((q) => q.hosts.includes('config')),
      gone: [],
      cleanUrl: cleanUrl.filter((r) => r.hosts.includes('config'))
    },
    redirects: {
      exact: channelFilter(exact, 'redirects'),
      prefix: channelFilter(prefix, 'redirects'),
      query: query.filter((q) => q.hosts.includes('redirects')),
      gone: [],
      cleanUrl: cleanUrl.filter((r) => r.hosts.includes('redirects'))
    },
    strict: {
      exact,
      prefix,
      query,
      gone: [...goneExact, ...gonePrefix],
      cleanUrl: cleanUrl.filter((r) => r.hosts.includes('strict'))
    }
  };

  return {
    origin: CANONICAL_ORIGIN,
    exact,
    prefix,
    caseFold,
    cleanUrl,
    query,
    goneExact,
    gonePrefix,
    headers: HEADER_RULES,
    satellites: SATELLITE_ORIGINS,
    canonicalPaths,
    canonicalStaticPaths: CANONICAL_STATIC_PATHS,
    sections,
    byChannel,
    counts: {
      exact: exact.length,
      prefix: prefix.length,
      caseFold: caseFold.length,
      cleanUrl: cleanUrl.length,
      query: query.length,
      gone: goneExact.length + gonePrefix.length,
      canonical: canonicalPaths.length,
      config: byChannel.config.exact.length + byChannel.config.prefix.length + byChannel.config.query.length + byChannel.config.cleanUrl.length
    }
  };
}

let cache = null;
export function registry() {
  if (!cache) cache = expandAliasRules();
  return cache;
}

/**
 * Resolve one request. The single implementation shared by the local mirror,
 * the dev/preview plugin and the audit, so host config and app can be compared
 * against one truth.
 *
 * @param {string} pathname request path (any case, may carry a trailing slash)
 * @param {{search?: string, channel?: 'config'|'redirects'|'strict', caseFold?: boolean}} [opts]
 */
export function resolveAlias(pathname, opts = {}) {
  const { search = '', channel = 'strict', caseFold = channel === 'strict' } = opts;
  const reg = registry();
  const table = reg.byChannel[channel] ?? reg.byChannel.strict;
  const path = stripSlash(pathname);

  const hit = table.exact.find((r) => r.from === path);
  if (hit) return { kind: 'redirect', status: hit.status, to: hit.to, class: hit.class, rule: hit.from };

  if (caseFold) {
    const lower = path.toLowerCase();
    if (lower !== path && reg.canonicalPaths.includes(lower)) {
      return { kind: 'redirect', status: 301, to: lower, class: 'case-fold', rule: path };
    }
  }

  const prefixes = [...table.prefix].sort((a, b) => b.from.length - a.from.length);
  for (const rule of prefixes) {
    // A prefix ending in "-" matches an accession fragment (ZIAA-PROTO-003).
    // Every other prefix matches the *subtree* only: the root of a section is
    // the job of its exact rule, so a prefix can never redirect a real page to
    // itself.
    const fragment = rule.from.endsWith('-');
    const matches = fragment ? path.startsWith(rule.from) : path.startsWith(`${rule.from}/`);
    if (!matches) continue;
    if (!rule.splat) return { kind: 'redirect', status: rule.status, to: rule.to, class: rule.class, rule: rule.from };
    const rest = path.slice(rule.from.length);
    const rewritten = rest ? `${rule.to}${rest}` : rule.to;
    // Fold while rewriting: /logs/LOG-330 goes straight to /research-notes/log-330
    const folded = rewritten.toLowerCase();
    const to = folded !== rewritten && reg.canonicalPaths.includes(folded) ? folded : rewritten;
    return { kind: 'redirect', status: rule.status, to, class: rule.class, rule: rule.from };
  }

  for (const rule of table.gone) {
    const fragment = rule.from.endsWith('-');
    // exact rules own the root; prefix rules own the subtree (so a canonical
    // page such as /search with a query string is never swallowed).
    const matches = rule.mode === 'exact' ? path === rule.from : fragment ? path.startsWith(rule.from) : path.startsWith(`${rule.from}/`);
    if (matches) return { kind: 'gone', status: 410, to: '/410', class: rule.class, rule: rule.from };
  }

  if (search && table.query.length) {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    for (const [key, value] of params.entries()) {
      const hitRule =
        table.query.find((q) => q.path === path && q.key === key && q.value !== undefined && q.value === value) ??
        table.query.find((q) => q.path === path && q.key === key && q.value === undefined);
      if (hitRule) {
        return { kind: 'redirect', status: hitRule.status ?? 301, to: hitRule.to, class: hitRule.class, rule: `${path}?${key}` };
      }
    }
  }

  // File-shaped cleanUrl variants are matched as patterns, not literals.
  for (const r of table.cleanUrl) {
    if (!r.from.includes(':id')) continue;
    const [pre, post] = r.from.split(':id');
    if (!path.startsWith(pre) || !path.endsWith(post)) continue;
    const middle = path.slice(pre.length, path.length - post.length);
    if (!middle || middle.includes('/')) continue;
    const out = r.to.replace(':id', middle);
    if (out !== path) return { kind: 'redirect', status: 301, to: out, class: r.class, rule: r.from };
  }

  return { kind: 'none', status: 200, to: path };
}

