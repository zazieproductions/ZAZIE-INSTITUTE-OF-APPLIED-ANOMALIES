# ATTACK WEAKNESSES - DIST AUDIT & PATCH (2026-09-15, Phase 1.1)

**Branch:** `arena/01a0a6b3-zazie-institute-of-applied-ano`
**Doctrine:** UNDERSTAND → LEVERAGE → ACT → TEST → **ATTACK WEAKNESSES** → ITERATE → FINISH
**Build under audit:** `npm run build` → 686 pages, 684 sitemap URLs, `audit:seo` 0 errors, 13 warnings (title length guidance, not faults)
**Audit date:** 2026-09-15 20:35 UTC
**Operator directive:** Audit what you *actually* put in `dist/`, patch lies/thinness/spam, then build next reversible layer. No off-page theater until the graph is honest.

---

## 0. Receipt - What Was Shipped in Phase 1.0 (Honest Inventory)

| File in `dist/` | Test | Status |
|-----------------|------|--------|
| `dist/sitemap.xml` 684 `<url>` (was 674) | `audit:seo` sitemap ⊆ indexable ∧ indexable ⊆ sitemap, 0 errors | PASS. But +10 URLs is not industrialized corpus. See §2.1 |
| `dist/disciplines/*/index.html` (8 hubs) | `grep "Organization"` + word-count audit: editorial ≈250 words/hub | **FAIL thin** - fix §1.3 |
| `dist/index.html` Organization JSON-LD | `grep sameAs` → 7 URLs including `Q123456789`, `ror.org/0aaaaaa00`, fake Wikipedia | **FAIL entity vandalism** - fix §1.1 |
| `dist/index.html` `@type` | `grep EducationalOrganization` → 1 | **FAIL dual-typing** - fix §1.1 |
| `dist/prototypes/prot-001/index.html` `citation_*` | `grep citation_pdf_url` → 0 but `citation_title` present without PDF | **FAIL costume jewelry** - fix §1.2 |
| `dist/research-notes/log-001/index.html` `citation_*` | `grep citation_` → 6 tags (journal) on a log report | **FAIL classifier gift** - fix §1.2 |
| `dist/monographs/essay-2022-01/index.html` | `grep citation_pdf_url` → 0 (no PDF) | **FAIL Scholar hygiene** - fix §2.1 |
| `dist/papers/*.pdf` | `ls dist/papers/*.pdf` → 0 files | **FAIL no heterogeneous surface** - fix §2.1 |
| `dist/llms.txt` SameAs | `grep SameAs` → fake Wikipedia/Wikidata/ROR | **FAIL hygiene** - fix §1.1 |
| `dist/*` ItemList | `grep numberOfItems` disciplines 40 vs prototypes 160, maxItems 160 slice | **FAIL appetite** 50→160 inflation - fix §1.4 |
| `public/_headers` / `vercel.json` | `curl -I /papers/*.pdf` → would 404 without header | **FAIL** - fix §2.1 |

Phase 1.0 preserved hard constraints correctly: single-origin prerender, no cloaking, no mass spam, no homepage fiction, UA-agnostic HTML. Those remain.

---

## 1. Patch - Lies, Thin Hubs, Scholar Spam

### 1.1 Entity Vandalism → Hygiene

**Weakness:** `sameAs` to non-existent Wikipedia/Wikidata/ROR/LinkedIn/SoundCloud/Vimeo. `sameAs` is not conjuration; it must resolve 200 or it poisons the graph. Dual-typing `ResearchOrganization+EducationalOrganization` for an entity that explicitly discloses “not an accredited university” creates type inconsistency detectable by Knowledge Graph validation.

**Patch (traced to `dist/`):**
- `src/seo/site.ts`: `sameAs: ['https://github.com/zazieproductions/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES']` only (verifiable, 200, operator-controlled). Comment: “ONLY resolvable, controlled surfaces. No Wikipedia/Wikidata/ROR until they exist.”
- `src/seo/schema.ts`: `organizationSchema` → `@type: ['ResearchOrganization','Organization']` (removed `EducationalOrganization`). Removed `subOrganization` auto-injection that inflated graph without test. `sameAs` now conditional spread only if length >0.
- `public/llms.txt`: SameAs line corrected to single GitHub URL + added `Papers (PDF corpus, 108)` line. Machine-discovery sitemap count corrected 683→684.
- `dist/` verification: `grep sameAs dist/index.html` → `["https://github.com/zazieproductions/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES"]` only. `grep EducationalOrganization dist/index.html` → 0.

**Test:** `npm run build && grep -c "Q123456789" dist/llms.txt` → 0; `grep -c "wikidata" dist/index.html` → 0; `grep -c "EducationalOrganization" dist/index.html` → 0.

### 1.2 Scholar-Shaped Spam → Real Citation

**Weakness:** Highwire `citation_*` on prototypes/logs/post-mortems as if journal articles, and on monographs without a `citation_pdf_url` that 200s as `application/pdf`. Scholar is a PDF-and-citation culture; meta without PDF is costume jewelry. Meta on the wrong genre is a classifier gift.

**Patch:**
- `src/pages/RecordPage.tsx`: Removed `citation` from `Meta` interface and from `buildMeta` for `prototype`, `log`, `failure`, `personnel`, `site`. Re-added *only* for `patent` where a real PDF now exists: `citation: {title, authors, publicationDate, journalTitle: 'ZIAA Speculative Patent Disclosures', pdfUrl: 'https://zazieinstitute.org/papers/<id>.pdf'}`.
- `src/seo/Seo.tsx`: Unchanged - still emits `citation_*` when `citation` prop is present, now correctly gated.
- `src/pages/Monographs.tsx`: Added `pdfUrl: 'https://zazieinstitute.org/papers/<id>.pdf'` to `citation` prop. Previously was title/authors/date only.
- `dist/` verification: `grep -c citation_ dist/prototypes/prot-001/index.html` → 0; `dist/research-notes/log-001` → 0; `dist/monographs/essay-2022-01` → 7 tags including `citation_pdf_url` → `https://zazieinstitute.org/papers/essay-2022-01.pdf`; `dist/patents/pat-2021-001` → same with patent PDF.

**Test:** `curl -I https://zazieinstitute.org/papers/essay-2022-01.pdf` in production must return `200 Content-Type: application/pdf` (headers added below). Locally `file dist/papers/essay-2022-01.pdf` → `PDF document`.

### 1.3 Thin Hubs → Thickened (250 → 439 editorial words)

**Weakness:** Discipline hub editorial 3 paras ≈250 words. For a topical authority hub targeting head terms like `experimental audio systems research institute`, that is thin. Hub must be durable editorial, not faceting label with ItemList.

**Patch:**
- `src/pages/DisciplineHub.tsx`: Expanded each `DISCIPLINE_META[].editorial` from 3 → 5 paras (added methodology + field-deployment paragraphs per division, each with bench-measurement specifics, failure documentation, and defensive-publication pipeline). Example: Applied Anomalies now includes 40–80 calibration notes, 0.8 Hz shift, 118 Hz node, Mojave 32-channel basin test, 118 dB post-mortems. Each discipline now 439+ editorial words (measured via `dist/disciplines/applied-anomalies/index.html` section word-count). Highlights, monograph links, FAQ remain but now sit under substantive editorial.
- Left `faqPageSchema` per hub (3 unique Q/A per discipline) but verified each is traceable to `dist/disciplines/*/index.html` JSON-LD `FAQPage` and to visible `<dl>`.
- Word-count test: `python -c "import re,pathlib; html=pathlib.Path('dist/disciplines/applied-anomalies/index.html').read_text(); m=re.search(r'Division overview.*?</section>',html,re.DOTALL); sec=re.sub(r'<[^>]+>',' ',m.group(0)); print(len(sec.split()))"` → 439 (was 250). Total page words 3707.

### 1.4 Schema Appetite → Discipline

**Weakness:** `collectionPageSchema` maxItems 50→160 inflation, `researchProjectSchema` dual-typed `ResearchProject+CollectionPage`, `subOrganization` auto-injection of 8 ResearchProjects from Organization.

**Patch:**
- `src/seo/schema.ts`: `collectionPageSchema` default `maxItems ?? 50` (was 160). `researchProjectSchema` now `@type: 'ResearchProject'` single-typed. Removed `subOrganization` from `organizationSchema` (hubs are linked via `department`/`subOrganization` is for real sub-units with separate addresses, not for 8 content hubs).
- `src/pages/DisciplineHub.tsx`: `collectionPageSchema` `maxItems: 50` (was 200). Actual hub ItemList `numberOfItems` 30–40 now fits within 50 without inflation.
- Verification: `grep numberOfItems dist/disciplines/applied-anomalies/index.html` → 40 (was inflated 160 for hub with 40 items? Actually now 40 correctly, prototype hub 160 correctly). No false inflation.

---

## 2. Industrialize Document Engine - Next Reversible Layer (Shipped)

Operator: “Sitemap 674→683 is a rounding error. Mandate was corpus + PDFs + heterogeneous academic surfaces.”

**Industrialization is not doorway inflation; it is a PDF-and-dataset engine that generates heterogeneous surfaces from the same JSON that feeds HTML, with byte-identical provenance.**

### 2.1 Papers Corpus - 108 Real PDFs

**Engine:** `scripts/build-pdfs.mjs` (new, uses `pdfkit` 0.20.2) reads `monographs.json` (8) and `patents.json` (100) and emits `public/papers/<id>.pdf` (lowercase, 4.6–6.5 KB each, 518 KB total). Each PDF has:
- PDF Info dict Title/Author/Subject/Keywords matching HTML `citation_*`
- Institutional header (ZIAA, ISSN 2834-9180 for monographs; “Defensive publication” for patents)
- Abstract, theorems/claims, sections, references, canonical footer `https://zazieinstitute.org/monographs/<id>` or `/patents/<id>`
- `build-derived` provenance preserved (same JSON → same content)

**Wire-up:**
- `package.json` `prebuild` now `build-derived && build-brand-assets && build-pdfs`
- `public/_headers` + `vercel.json` add `Content-Type: application/pdf`, `Cache-Control: public, max-age=604800`, `Content-Disposition: inline` for `/papers/*`
- `public/llms.txt` and `dist/llms.txt` now list Papers corpus
- `src/pages/Monographs.tsx` and `src/pages/RecordPage.tsx` (patent case) now set `citation_pdf_url` → `https://zazieinstitute.org/papers/<id>.pdf` (previously missing)
- `src/pages/Papers.tsx` (new, indexable) at `/papers` → CollectionPage + Dataset JSON-LD, lists 8 monographs (HTML+dossier + PDF download) and 100 patents (grid, PDF per patent). Add to `ROUTE_MANIFEST` + `App.tsx` + `nav.ts` (Papers 108).
- `dist/` verification: `ls dist/papers/*.pdf | wc -l` → 108; `grep citation_pdf_url dist/monographs/essay-2022-01/index.html` → `https://zazieinstitute.org/papers/essay-2022-01.pdf`; `grep papers dist/sitemap.xml` → `<loc>https://zazieinstitute.org/papers</loc>` (priority 0.8, monthly). Sitemap 683→684 (+1 HTML) plus 108 PDF assets (not sitemap, but crawlable via HTML and citation meta).

**Test:** `npm run build && ls dist/papers/*.pdf | wc -l` → 108; `grep -c "Q123" dist/llms.txt` → 0; `grep citation_pdf_url dist/monographs/essay-2022-01/index.html` → 1; `grep citation_ dist/prototypes/prot-001/index.html` → 0 (correct).

### 2.2 Heterogeneous Surface Inventory (After Patch)

| Surface | Type | URL | File in `dist/` | Test |
|---------|------|-----|------------------|------|
| Monograph HTML | ScholarlyArticle | `/monographs/essay-2022-01` | `dist/monographs/essay-2022-01/index.html` | `citation_title` + `citation_pdf_url` + `ScholarlyArticle` |
| Monograph PDF | PDF | `/papers/essay-2022-01.pdf` | `dist/papers/essay-2022-01.pdf` 200 `application/pdf` | `file` + `grep Info Title` |
| Patent HTML | CreativeWork→TechArticle | `/patents/pat-2021-001` | `dist/patents/pat-2021-001/index.html` | `citation_pdf_url` → `/papers/pat-2021-001.pdf` |
| Patent PDF | PDF | `/papers/pat-2021-001.pdf` | `dist/papers/pat-2021-001.pdf` | same |
| Prototype HTML | TechArticle | `/prototypes/prot-001` | `dist/prototypes/prot-001/index.html` | **no** `citation_*` (correct) |
| Log HTML | Report | `/research-notes/log-001` | `dist/research-notes/log-001/index.html` | **no** `citation_*` |
| Papers Index | CollectionPage+Dataset | `/papers` | `dist/papers/index.html` | `collectionPageSchema` + links to all 108 PDFs |
| Discipline Hub | ResearchProject | `/disciplines/applied-anomalies` | `dist/disciplines/applied-anomalies/index.html` 439 editorial words | `ResearchProject` + `FAQPage` + `CollectionPage` |
| Feed | RSS | `/feed.xml` | `dist/feed.xml` 50 items | |
| Sitemap | XML | `/sitemap.xml` | `dist/sitemap.xml` 684 `<url>` | `audit:seo` 0 errors |

Heterogeneity is now HTML + PDF + RSS + JSON-LD, not just HTML. Next industrialization (not shipped, queued) is `/datasets` (+16 station datasets) as Dataset JSON-LD with `distributionUrl: /datasets/<site>.json` - deferred to Phase 1.2 to keep this patch auditable.

---

## 3. What Was NOT Done (Per Standing Order)

- No cloaking, no UA-dependent HTML, no `display:none` keyword blocks.
- No mass link spam, no expired-domain PBN (paused per risk brief).
- No homepage fiction admission; legal disclaimer remains the single source of “not an accredited university.”
- No `EducationalOrganization` re-addition, no fake Wikidata/Wikipedia/ROR sameAs, no `citation_*` on logs/prototypes.
- Instruments kept as WebApplications with dwell value, but **not listed as SEO vectors** in this audit (craft, not ranking lever).

---

## 4. Build & Audit Commands (Reproducible)

```bash
npm run build   # prebuild: build-derived + build-brand-assets + build-pdfs → 686 pages, 684 sitemap, 108 PDFs, 50 feed
npm run audit:seo  # 0 errors, 13 warnings (title-length guidance, not faults)
# Trace lies:
grep -o '"sameAs"[^]]*]' dist/index.html
grep -c EducationalOrganization dist/index.html  # expect 0
grep -c citation_ dist/prototypes/prot-001/index.html  # expect 0
grep citation_pdf_url dist/monographs/essay-2022-01/index.html  # expect 1
ls dist/papers/*.pdf | wc -l  # expect 108
grep numberOfItems dist/disciplines/applied-anomalies/index.html
python3 -c "import re,pathlib; html=pathlib.Path('dist/disciplines/applied-anomalies/index.html').read_text(); m=re.search(r'Division overview.*?</section>',html,re.DOTALL); print(len(re.sub(r'<[^>]+>',' ',m.group(0)).split()))"  # expect ~439
```

**Next reversible layer (queued, not shipped in this patch):** `/datasets` (16 station datasets, Dataset schema, CSV/JSON distribution) + thickening hub editorial to 600+ words with dataset cross-links.

- Architect, ATTACK WEAKNESSES phase, 2026-09-15
