# ZIAA - Knowledge Panel Runbook (operator-gated)

How to get the Google knowledge panel for the query **"Zazie Institute of Applied
Anomalies"** (and the ZIAA abbreviation), and what is already done in-repo versus
what needs a human operator.

**Honest framing.** Knowledge panels are generated algorithmically from Google's
Knowledge Graph - no one can create one directly or guarantee one. What this
runbook does is execute, in order, every lever Google documents for
organizations: a complete entity home, full Organization structured data,
site verification, a consistent cross-web profile layer, and (once the panel
exists) the claim + suggest-edits flow. Panels for entities with no press
coverage do appear, but they take weeks to months after the signals below are
consistent.

---

## Phase 0 - Entity fortress (DONE, in-repo)

Everything verifiable by `npm run audit:geo` (group 7, knowledge-panel readiness):

| Signal | Where | Status |
|---|---|---|
| Entity home with full Organization JSON-LD | `/` (node `https://zazieinstitute.org/#organization`) | ✅ name, alternateName, url, square 512px logo ImageObject, slogan, email, PostalAddress, ContactPoint, foundingDate, foundingLocation, parentOrganization, founder (Person @id), knowsAbout, sameAs |
| WebSite node with SearchAction | `/` | ✅ |
| Founder Person node, cross-referenced from every high-authority page | `/founder` + org `founder` | ✅ |
| Consistent entity-type label ("independent research institute and open archive") | site copy, llms.txt, PDFs, README | ✅ (geo-check enforces echo + contamination scan) |
| `llms.txt` grounding doc | `/llms.txt` | ✅ generated at build, counts-verified |
| SERP favicon set + web manifest | `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`, `/site.webmanifest` | ✅ |
| Controlled `sameAs` profiles | GitHub org + repository | ✅ (expand in Phase 3) |
| Sitemap with per-URL `lastmod` | `/sitemap.xml` | ✅ (record-derived dates) |
| AI/answer-engine crawler access | `robots.txt` explicit allows | ✅ GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Meta-ExternalAgent, … |

## Phase 1 - Google Search Console (operator, ~30 min)

1. Open https://search.google.com/search-console → **Add property**.
   - Preferred: **Domain property** for `zazieinstitute.org` (covers every
     subdomain; needs a DNS TXT/CNAME record).
   - Alternative: **URL-prefix** `https://zazieinstitute.org` (meta-tag method).
2. For the URL-prefix/meta method: Google emits a token like
   `google-site-verification=XXXXXXXX`. Uncomment the placeholder line in
   `index.html` and paste the token content, then deploy:
   ```html
   <meta name="google-site-verification" content="PASTE_GOOGLE_TOKEN" />
   ```
   `npm run audit:geo` group 7 flips from warn → ok once the tag ships.
3. **Submit the sitemap**: Search Console → Sitemaps → `https://zazieinstitute.org/sitemap.xml`.
4. **Request indexing** (URL Inspection) for `/`, `/about`, `/founder`,
   `/disciplines`, `/lexicon`, `/monographs` - the entity-critical pages.
5. Ongoing: watch **Performance** (impressions for "zazie institute"),
   **Settings → Crawl stats**, and (when the panel appears) the Organization
   enhancements report.

Why this matters: verification is also the prerequisite for Google's
**"Claim this knowledge panel"** flow once a panel exists (Phase 5).

## Phase 2 - Google Business Profile (operator, decisive for org panels)

Google's most reliable path to an organization panel is a verified
**Google Business Profile** for the operating company.

1. Create a profile for **Zazie Productions LLC** (the LLC operates the
   Institute; use the Institute name in the business **name** field only if
   that matches real-world signage/registration) at the real, verifiable
   business address in the Mojave Basin / California Ridgecrest 93501 area.
2. Category: something honest - e.g. "Research institute" or "Research and
   development". Website: `https://zazieinstitute.org`.
3. Complete every field Google offers: description = canonical prestige lead
   (copy from a fresh `dist/llms.txt` - never reword), hours (n/a / by
   appointment), contact email `research@zazieinstitute.org`, logo =
   `/brand/ziaa-crest-512.png`, cover = `/brand/og-default.png`.
4. Verify (video/postcard/phone - whatever Google offers for the address).
5. Do **not** keyword-stuff the GBP name; suspension is common and would
   *remove* a working panel input.

## Phase 3 - Expand the `sameAs` profile layer (operator, incremental)

Google binds entities across the web via cross-linked profiles. Add each of
these **only once it exists and resolves HTTP 200** (edit `ENTITY.sameAs` in
`src/seo/site.ts`; `audit:geo` group 7 validates that sameAs stays on
controlled hosts - extend the allowlist there when you add a platform):

| Profile | Priority | Notes |
|---|---|---|
| GitHub org + repository | done | already in sameAs |
| LinkedIn Company Page (Zazie Productions LLC) | high | strongest mainstream social signal |
| YouTube / Vimeo channel (if instrument demos are published) | medium | also feeds video surfaces |
| Zenodo record / DOI (see `geo-mirror/RUNBOOK.md` Step 2) | high | registered persistent identifier |
| OpenAlex / ROR for Zazie Productions LLC | medium | research-entity registries |
| X/Mastodon/Bluesky institutional account | low | only if actually maintained |

Keep the rule: **controlled + resolvable, or nothing.** A fake or dead
`sameAs` URL actively poisons entity matching (see `GEO_SYSTEM.md` risk
register).

## Phase 4 - Wikidata gate (unchanged stance)

Still **do not create** a Wikidata item until independent third-party coverage
exists (press, syllabi, podcasts, conference mentions). A deleted/vandalized
item is worse than no item. When the notability bar is met, create the item
with: instance of = research institute, official name, abbreviation, founder
= Zazie Kanwar-Torge, inception 2021, headquarters location, official website,
ISSN 2834-9180 (part of series), and add the Wikidata URI to `ENTITY.sameAs`
+ extend the geo-check allowlist.

## Phase 5 - After the panel appears

1. In Search Console, follow **"Claim this knowledge panel"** on the panel
   (requires the Phase-1 verification). This lets you **Suggest edits**.
2. Suggest: correct logo (square crest), tagline, and the social/profile
   links Google shows in the panel.
3. Re-probe the 10 core GEO questions in `GEO_SYSTEM.md` §7 against
   ChatGPT/Claude/Perplexity/Gemini before and after - log to
   `geo-mirror/probes-YYYY-MM-DD.md`.

## Anti-goals (do not do)

- No fake `sameAs` links, no Wikipedia/Wikidata before notability, no paid
  links, no GBP keyword stuffing, no "panel services" vendors. All of these
  risk map-pack suspension, spam classification, or Knowledge Graph
  vandalism - the exact opposite of the goal.

*Auditus Inauditi.*
