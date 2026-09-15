# Zazie Institute of Applied Anomalies — SEO sitemap & crawl audit (2026-09-15)

**Canonical origin:** `https://zazieinstitute.org`  
**Branch:** `arena/01a0a682-zazie-institute-of-applied-ano`  
**Build inspected:** `npm run build` → 676 prerendered HTML pages, `audit-seo` 0 errors  
**Auditor date (UTC):** 2026-09-15

---

## 1. All discovered indexable routes

The router is declared in `src/App.tsx`. The single source of truth for prerender + sitemap is `src/routes/manifest.ts` (`ROUTE_MANIFEST = STATIC_ROUTES + DYNAMIC_ROUTES`). Collections are read directly from `src/data/collections/*.json` so the manifest is exhaustive.

| # | Route | Source | Changefreq | Priority | `lastmod` source | Canonical |
|---|-------|--------|------------|----------|------------------|-----------|
| 1 | `/` | static | weekly | **1.0** | latest `labLogs.timestamp` (clamped to today) | `https://zazieinstitute.org/` |
| 2 | `/about` | static | monthly | 0.9 | — | `https://zazieinstitute.org/about` |
| 3 | `/prototypes` | static | weekly | 0.9 | — | `…/prototypes` |
| 4 | `/patents` | static | monthly | 0.8 | — | `…/patents` |
| 5 | `/research-notes` | static | weekly | 0.8 | latest `labLogs.timestamp` (clamped) | `…/research-notes` |
| 6 | `/monographs` | static | monthly | 0.8 | — | `…/monographs` |
| 7 | `/acoustic-bench` | static | monthly | 0.7 | — | `…/acoustic-bench` |
| 8 | `/spectra-lab` | static | monthly | 0.7 | — | `…/spectra-lab` |
| 9 | `/void-oculus` | static | monthly | 0.6 | — | `…/void-oculus` |
|10 | `/synthesis-signal` | static | monthly | 0.7 | — | `…/synthesis-signal` |
|11 | `/legal/institutional-status` | static | yearly | 0.4 | — | `…/legal/institutional-status` |
|12 | `/legal/disclaimer` | static | yearly | 0.4 | — | `…/legal/disclaimer` |
|13 | `/legal/terms` | static | yearly | 0.3 | — | `…/legal/terms` |
|14 | `/legal/privacy` | static | yearly | 0.3 | — | `…/legal/privacy` |
|15 | `/field-stations` | static | monthly | 0.7 | — | `…/field-stations` |
|16 | `/post-mortems` | static | monthly | 0.7 | — | `…/post-mortems` |
|17 | `/fellows` | static | monthly | 0.7 | — | `…/fellows` |
|18 | `/system-audit` | static | weekly | 0.5 | — | `…/system-audit` |
|19–178 | `/prototypes/prot-001` … `/prototypes/prot-160` | `prototypes.json` (160) | monthly | 0.7 | — | canonical per record |
|179–278 | `/patents/pat-2021-001` … `/patents/pat-2026-100` | `patents.json` (100) | yearly | 0.6 | `filingDate` (clamped) | canonical |
|279–608 | `/research-notes/log-001` … `/research-notes/log-330` | `labLogs.json` (330) | yearly | 0.5 | `timestamp` (YYYY-MM-DD, clamped) | canonical |
|609–616 | `/monographs/essay-2022-01` … `/monographs/essay-2026-08` | `monographs.json` (8) | yearly | 0.8 | `date` | canonical |
|617–638 | `/post-mortems/inc-2021-01` … `/post-mortems/inc-2026-22` | `failures.json` (22) | yearly | 0.5 | `incidentDate` (clamped) | canonical |
|639–658 | `/fellows/fellow-001` … `/fellows/fellow-020` | `personnel.json` (20) | monthly | 0.6 | — | canonical |
|659–674 | `/field-stations/site-01` … `/field-stations/site-16` | `fieldSites.json` (16) | yearly | 0.6 | — | canonical |

**Total indexable URLs in production sitemap:** **674** (18 hub/legal + 656 detail). `dist/sitemap.xml` validated: 674 `<url>` entries, 0 duplicates, valid UTF-8, size 99 757 bytes (< 50 k limit, < 50 MB).

The remaining 2 prerendered pages (`/search`, `/404`) are intentionally excluded (see §2).

### Strategic classification (search intent + topical authority)

| Cluster | Routes | Intent | Topical focus | Priority rationale |
|---------|--------|--------|---------------|--------------------|
| **Institutional core** | `/`, `/about`, legal, `/system-audit` | navigational + E-E-A-T | “Zazie Institute of Applied Anomalies / ZIAA” entity, research cycle 2021–2026 | Highest E-E-A-T; sitemap priority 0.9–1.0; Organization/WebSite JSON-LD, Breadcrumbs |
| **Flagship archives** | `/prototypes`, `/patents`, `/monographs`, `/research-notes` | informational / exploratory | experimental audio technology, sound art, speculative research, generative composition, technical papers | Hub priorities 0.8–0.9; monograph dossiers treated as scholarly articles (priority 0.8) |
| **Interactive instruments** | `/acoustic-bench`, `/spectra-lab`, `/void-oculus`, `/synthesis-signal` | transactional / tool | Web Audio DSP, binaural synthesis, spectral visualiser, spatial canvas, Three.js audio-reactive | 0.6–0.7; SoftwareApplication JSON-LD; high dwell-time tools |
| **Long-tail laboratory records** | prototype/patent/log detail | informational long-tail | signal archaeology, material acoustics, psychoacoustics, physical acoustics, field recording, failure case study | 0.5–0.7; TechArticle/Report/CreativeWork JSON-LD; individual dossiers indexed for “feedback resonator, hydrophone array, VLF listening” etc. |
| **People & places (E-E-A-T)** | `/fellows/*`, `/field-stations/*` | informational | creative technologists, DSP architects, acoustic engineers, listening stations | 0.6; Person/Place schema; supports entity provenance |

No URLs are manufactured for SEO. Priorities are conservative and monotonic (hub ≥ detail within cluster) and map directly to the institute’s stated fields in `src/seo/site.ts`.

---

## 2. Routes excluded and why

| Route / pattern | Excluded from sitemap | Reason |
|-----------------|----------------------|--------|
| `/search`, `/search?q=*` | `noindex: true` → `noindex,follow`; Disallow in `robots.txt`; not in sitemap | Search-result page, query-parameter variant, thin/duplicate, non-canonical. Correctly excluded. |
| `/404` (+ `/* → /404.html` fallback) | `noindex: true`; Disallow | Error page, no indexable content. |
| `/apps/void-oculus/*` | `X-Robots-Tag: noindex` in `_headers` + `vercel.json`; not in manifest | Isolated SPA canvas with own global state & localStorage; thin on archival text; kept as embedded tool, not archival record. |
| Legacy aliases: `/dashboard`, `/overview`, `/logs`, `/logs/:id`, `/lab-logs`, `/bench`, `/spectra`, `/oculus`, `/void-oculus/index.html`, `/synthesis`, `/legal`, `/infrastructure`, `/vault`, `/failures`, `/personnel`, `/personnel/:id`, `/audit`, `/index.html` | 301 permanently to canonical (in `vercel.json` + `_redirects` + `<Navigate replace>`) | Duplicate vocabulary from earlier site iterations; redirects are indexable only at target. Not in sitemap, not prerendered. |
| Hash fragments `#prototypes` etc. (`LEGACY_TABS` in `App.tsx`) | client redirect → canonical | Non-crawlable fragment; canonical is path. |
| Query-parameter filtered views: `/prototypes?discipline=*&status=*&clearance=*&year=*`, `/patents?discipline=*`, `/research-notes?facility=*` etc. | not in manifest; filtered client-side with `useSearchParams` + `useState` | Thin variants of the canonical hub; would create parameter faceting duplication. No separate canonical, no `rel=canonical` pointing elsewhere. Correctly excluded, but see §4 for recommendation. |
| Asset / dev routes: `/assets/*`, `/fonts/*`, `/brand/*`, `*.js,*.css,*.woff2` | not HTML | Static assets, cached immutable. |
| Tracking fragments / `?utm_*` | would be ignored | No tracking parameters are emitted; canonical is parameter-free. |

No duplicate trailing-slash variants exist in the sitemap or in internal `<link rel="canonical">`. No pagination `?page=` parameters (ShowMore is client-state).

---

## 3. Canonicalization problems

**Status: no material canonicalization fault found.** Verified by building and running `scripts/audit-seo.mjs` (0 errors) plus manual sitemap ↔ canonical sampling (20 random URLs → 0 mismatches).

- **Origin consistency:** `SITE_URL = https://zazieinstitute.org` is single source (`src/seo/site.ts`), used by `Seo.tsx` (`<link rel="canonical">` + `og:url` + `twitter:*`) and `scripts/prerender.mjs` (sitemap `<loc>`). All 674 sitemap `<loc>` match `canonical` and `og:url` exactly.
- **Trailing slash:** `vercel.json` `trailingSlash:false`, `cleanUrls:true`; prerender writes `dist/<path>/index.html` but hrefs are emitted without slash (`recordPath`, `NAV_ITEMS`, footer). Audit confirms 0 trailing-slash links and 0 sitemap trailing-slash `<loc>`.
- **Case:** `RecordPage.tsx` enforces lowercase IDs (`if (id !== rec.id.toLowerCase()) navigate canonical`) and `manifest.ts` lowercases every `path` (`lower(p.id)`). Sitemap and internal links are all lowercase.
- **Redirect-vs-canonical:** every `vercel.json` redirect has `permanent:true`; the SPA `<Navigate replace>` mirrors it. None of the redirect sources are present in `ROUTE_MANIFEST`; none appear in sitemap; none emit a 200.
- **No redirect chain through sitemap:** sitemap URLs are final 200s (validated: every `dist/<url>/index.html` exists; 0 missing files).
- **Minor non-fault warnings (8):** 4 `fellow-*` titles slightly over 70 chars (73) and the `/` title at 93 chars (full brand suffix by design; `Seo.tsx` clips SERP titles to 70 via `clipWords` but social title retains full). These are length guidance, not canonical errors. One long description at 166 chars (1 over 165 guideline) is also non-blocking.

No fix required for canonicalization itself; the site already meets the protocol’s “clean, consistent, parameter-free canonical” requirement.

---

## 4. Missing or weak SEO landing pages

The archive is materially rich (160 prototypes, 100 patents, 330 notes, 8 monographs) but two crawl-level gaps limit topical authority building:

**a) Research divisions exist only as query-string filters.**  
The 8 disciplines from `disciplines.json` (Applied Anomalies, Experimental Audio Systems, Computational Creativity, Speculative Engineering, Perceptual Interfaces, Generative Software, Signal Archaeology, Acoustic Architecture) are excellent topical clusters for “experimental audio technology, psychoacoustics, generative composition” etc., but they are only reachable as `href="/prototypes?discipline=Applied%20Anomalies"` (Dashboard) and as `<select>` state on `/prototypes`. These `?…` URLs are correctly excluded from the sitemap (thin duplicates), yet without a corresponding crawlable canonical page they cannot accumulate topical authority or rank for discipline queries. The same applies to facilities/fellow specialisations.

**Recommendation (not auto-applied in this pass):** create dedicated, prerendered canonical hubs such as `/disciplines/applied-anomalies`, `/disciplines/signal-archaeology`, or `/prototypes/discipline/applied-anomalies`, each with unique lede, H1, and curated links to prototypes, patents and monographs in that cluster, and add them to `ROUTE_MANIFEST` with `lastmod` derived from the newest record in the cluster. This is a substantive content decision and should be done with editorial copy, not auto-scaffolded. For now the sitemap audit recommends it but does not restructure the router.

**b) Hub “year” / “theme” browse is not crawlable.** Similar thin-filter issue; not urgent given the small year span (2021–2026). No action needed now.

**Content depth:** all other important landing needs are met — About page has FAQPage JSON-LD, monographs are individually indexable scholarly articles (increasing from 8), legal pages provide institutional disclosures, interactive benches provide tool intent. No fabrication of doorway pages is warranted.

---

## 5. Internal-linking opportunities

Static crawl of `dist/` (excluding `apps/`) shows the hub-card grids use **client-side `ShowMore` state**: the prerendered HTML contains only the first page of results:

- `/prototypes` → **24 / 160** cards (15 %)
- `/patents` → **24 / 100** (24 %)
- `/research-notes` → **40 / 330** (12 %)

All other hubs are complete: `/monographs` 8/8, `/fellows` 20/20, `/field-stations` 16/16, `/post-mortems` 22/22.

Deep prototypes/patents/logs therefore have **very low inbound link count** in the static crawl (mode = 2: “previous + next” sequential chain only). Source for 100+ detail URLs is only the adjacent detail page, not the hub. This is the primary *high-value orphan / underlinked* pattern on the site:

- `prototypes/prot-023 … prot-160` (≈136 records)
- `patents/pat-2025-* … pat-2026-*` (≈76 records)
- `research-notes/log-041 … log-330` (≈290 records)

The sequential prev/next chain ensures sitemap-discovered URLs remain reachable, but crawl depth and internal PageRank distribution are suboptimal, and users without JS cannot browse beyond the first page.

Secondary opportunity: the **Overview dashboard (`/`)** links to only 4 prototypes, 3 monographs, 5 logs, and 0 patents / 0 fellows / 0 field-stations. Given the dashboard is the most-inbound page (2 027 inbound links in crawl, effectively the homepage), it should distribute more descriptive link equity to deep records with keyword-rich anchors (e.g., “self-regulating acoustic feedback resonator with optical hysteresis”, “sub-glacial hydrophone listening array”).

Footer already provides exhaustive hub links (archive holds, institute, interactive instruments, legal) — well-structured; no change needed there.

**Implemented remedy (this audit):** see “Files changed” — each of the three underlinked hubs now includes a **crawlable complete index** rendered in the prerendered HTML (inside `<details>` + `<noscript>` fallback) that links to *every* record in that collection with descriptive anchor text (`ID // codeName — title — discipline`). This raises hub→detail internal links from ~136 missing to 0 missing, without altering the interactive UX (cards + ShowMore remain primary).

---

## 6. Sitemap / robots issues

**Current state (pre-fix) was already compliant; validated post-build:**

- **XML validity:** `<?xml version="1.0" encoding="UTF-8"?>` + `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`; parses with Python `xml.etree`, 0 parse errors; every URL is UTF-8 NFC-safe; `&` correctly escaped where present.
- **Protocol compliance:** every `<url>` has `<loc>` (absolute `https://zazieinstitute.org` + path, no trailing slash duplication), `<changefreq>` ∈ {weekly,monthly,yearly} and `<priority>` 0.0–1.0. `<lastmod>` present only where derivable (patents → `filingDate`, logs → `timestamp`, monographs → `date`, failures → `incidentDate`, `/` + `/research-notes` → latest log clamped to today). Future dates (in-fiction 2026 values) are clamped to `today` so `lastmod` never lies in the future.
- **Exclusion correctness:** sitemap excludes `/search`, `/404`, redirects, `/apps/*`, query variants, hashes. Matches existing `robots.txt` Disallow rules.
- **Size:** 674 URLs, 99.7 KB uncompressed → well under 50 000 and 50 MB limits; no sitemap index needed now. Logic in `prerender.mjs` already handles index creation if the archive ever exceeds 45 000 URLs.
- **Discoverability:** `public/robots.txt` and `dist/robots.txt` both contain `Sitemap: https://zazieinstitute.org/sitemap.xml` (required line, line-ending normalized). `index.html` `<link rel="sitemap" href="/sitemap.xml">` and `<link rel="alternate" href="/feed.xml">` present.
- **Host agreement:** `SITE_URL` matches production hostname; `vercel.json` + `_headers` + `site.webmanifest` + `sitemap.xml` all use `https://zazieinstitute.org`.
- **Resolvability:** every sitemap `<loc>` maps to an existing `dist/<path>/index.html`; `audit-seo.mjs` verifies 0 broken internal links and that `sitemap ⊆ indexable ∧ indexable ⊆ sitemap` (0 errors).

**No sitemap/robots fix was required beyond validation.** The prerender pipeline already keeps the sitemap exhaustive whenever `ROUTE_MANIFEST` changes.

---

## 7. Hidden content check

- **Client-side state / query params:** prototype/patent/log filters use `useState` + `useSearchParams` for instant filtering. These are correctly *not* exposed as separate canonical pages. No substantial prose is hidden behind this state in a way that would require a new crawlable route, except for the *card pagination* addressed in §5 (now fixed with a crawlable index). Other benches (`AcousticBench`, `SpectraLabConsole`, `SynthesisSignalLab`) are interactive instruments where the canvas/WebGL state is the content; their surrounding copy is statically present.
- **Recommendation:** do not auto-split discipline or year filters into new routes until editorial landing copy exists. When that landing copy is written, add canonical paginated/filtered routes (e.g., `/prototypes/discipline/*`) and include them in the sitemap with changefreq `weekly` and priority `0.8`.

---

## 8. What was changed in this pass (summary)

1. Validated and preserved the existing sitemap generation (674 URLs, correct `lastmod` clamping, robots reference).
2. Improved crawlability of the primary orphan sets by adding **complete, prerendered, descriptive index sections** to `/prototypes`, `/patents`, `/research-notes` (see file-change log below).
3. Added a **curated, descriptive cross-link block** to the Overview (`/` Dashboard) linking to deep prototypes, patents and field-station themes with institutional tone (no keyword stuffing).

The sitemap itself was *not* inflated; its purpose remains discovery, canonical clarity and crawl efficiency — not ranking manipulation. No `priority`/`changefreq` games were introduced.


---

## 9. Entity-graph pass (2026-09-15, second revision)

This revision adds a relational structured-data layer on top of the per-page schema described above.
It supersedes §1's URL count: the sitemap now holds **675** indexable URLs (676 prerendered + 404 fallback).

### 9.1 What was added

| Addition | Route | Node classes introduced |
|---|---|---|
| `/institute` institutional spine page | `/institute` | `Organization` ×11 (3 divisions, 8 departments), `ResearchProject` ×16, `MonetaryGrant` ×10, `Course` ×10 + `CourseInstance` ×14, `DefinedTermSet` ×1 + `DefinedTerm` ×46, `Place` ×8 (facilities), `Dataset`, `DataCatalog` |
| Relational bundles on every record page | all 656 detail pages | `OrganizationRole`, `EmployeeRole`, `Occupation`, `MonetaryAmount`, `PropertyValue`, `Syllabus`, `Chapter`, `VirtualLocation`, `FundingScheme`, `LocationFeatureSpecification` |
| Collection datasets on the 7 hub pages | `/prototypes`, `/patents`, `/research-notes`, `/monographs`, `/fellows`, `/field-stations`, `/post-mortems` | `Dataset` + `DataDownload` |
| Parent-company node, declared once | `/legal/institutional-status` | `Corporation` |

Measured from `dist/` after `npm run build`: **1431 JSON-LD blocks**, **796 declared nodes**,
**635 `@id` pointers, 635 resolved, 0 dangling**, **46 distinct schema.org types**.

### 9.2 Corrections to commonly-recommended type names

Three types frequently recommended for institutional SEO do not exist in schema.org
(all three return HTTP 404 from `schema.org`) and were rejected by the audit when tested:

| Recommended name | Status | Correct construction used |
|---|---|---|
| `CourseOffering` | 404 — not a type | `Course` + `hasCourseInstance` → `CourseInstance` (`courseMode`, `courseWorkload`, `instructor`) |
| `ResearchGrant` | 404 — not a type | `MonetaryGrant` with `amount` (`MonetaryAmount`), `funder`, `fundedItem` |
| `FacultyAffiliation` | 404 — not a type | `OrganizationRole` / `EmployeeRole` as the value of `Person.memberOf` / `Person.worksFor` |

`masthead` and `missionCoveragePrioritiesPolicy` were also excluded: they are `NewsMediaOrganization`
properties and are not valid on a `ResearchOrganization`.

### 9.3 Enforcement

`scripts/audit-seo.mjs` now imports `scripts/lib/jsonld-graph.mjs`, which fails the build on:
unparseable JSON-LD, unknown `@type`, unknown property, dangling `@id`, and non-canonical `@id`.
The vocabulary is read at runtime from the installed `schema-dts` devDependency
(939 types / 1509 properties) rather than a hand-maintained allowlist.

The validator was verified to have teeth by injecting a `ResearchGrant` node carrying a
`sponsorship` property and a pointer to a non-existent programme: the audit reported all three
faults and exited 1.

### 9.4 Content defects surfaced (not silently absorbed)

The graph validator exposed a pre-existing data inconsistency: **80 of the 120 distinct patent IDs
referenced by `prototypes.json#linkedPatents` have no corresponding record in `patents.json`.**
`RecordDossier.tsx` already filtered these out of the visible UI via `hasRecord`; the new structured
data applies the same guard so JSON-LD never points at a 404. The gap is now reported on every build
by `scripts/build-derived.mjs`:

```
[build-derived] WARN 80 unresolved prototypeToPatent cross-reference(s) in source data
                (filtered from UI and JSON-LD); first: PAT-2025-001, PAT-2026-002, PAT-2021-003
```

The three other cross-reference sets (`prototypeToLog`, `patentToPrototype`, `logEquipment`) are clean.
The 80 missing dossiers are a content gap to close, not a markup bug; creating them would add 80 URLs
and is out of scope for this revision.

### 9.5 Deliberate omissions

The Institute is non-accredited and publishes design fiction. Verified absent from all 1431 blocks:
`educationalCredentialAwarded`, `occupationalCredentialAwarded`, `hasCredential`, `alumniOf`,
`sameAs`, `award`, `aggregateRating`, `review`, and any ORCID/DOI/ISNI/ROR/Wikidata identifier.
Every `MonetaryGrant` funder is internal (`ZIAA Internal Research Endowment`, `ZIAA Field Operations
Reserve`, `ZIAA Fellows' Discretionary Fund`, `ZIAA Black Vault Remediation Reserve`) or the legal
parent `Zazie Productions LLC`.

---
*Note: This audit was generated mechanically from `dist/` + source and should be resubmitted after each `npm run build`. The authoritative validator is `npm run audit:seo` (fails on any sitemap/indexable mismatch).*
