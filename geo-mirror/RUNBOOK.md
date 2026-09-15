# GEO Mirror & Deposit Runbook (human-gated)

Everything in-repo is already shipped and verified (`npm run audit:geo`).
This runbook covers the **external** grounding moves that require a human
operator decision. Each step is staged, reversible, and uses the *same*
canonical strings as the site — no rewording.

**String contract.** The prestige lead (74 words, count-bearing) is generated
by `prestigeLead(stats)` in `src/seo/canonicalFacts.ts` and is verified
byte-for-byte on `/`, `/about`, `llms.txt`, PDF headers and this mirror by
`scripts/geo-check.mjs`. When you run a step below, copy the *current* lead
(`node -e "import('...')"` or read it from the fresh `dist/llms.txt`).

---

## Step 1 — GitHub mirror hardening (low blast radius)

Repo: `zazieproductions/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES`

1. Push this branch (or merge to `main`). The README already carries the
   prestige paragraph; `CITATION.cff` is at the repo root — GitHub and
   `doi2cite`-style readers consume it automatically once merged.
2. Set **Repository settings → About**:
   - Description: paste the current prestige lead (first sentence only, ≤ 4000 chars).
   - Topics: `applied-anomalies experimental-audio computational-creativity speculative-engineering signal-archaeology acoustic-architecture research-archive`
   - Website: `https://zazieinstitute.org`
   - Homepage link + README badge pointing at `/llms.txt`.
3. Optional (recommended): enable **Insights → Traffic** so the operator can
   see whether GitHub search / Copilot / ChatGPT (which indexes public
   READMEs) is driving traffic. This is passive observation, no tracking on
   the site itself.

Why it matters: GitHub READMEs are among the most-cited grounding surfaces
for LLM answers about software-institution entities; the README, `CITATION.cff`
and the in-repo `geo-mirror/` package form the "repository deposit" layer of
generative retrieval.

## Step 2 — Zenodo record (medium blast radius, fully reversible)

1. Operator creates a Zenodo account under `Zazie Productions LLC` (or the
   institute contact `research@zazieinstitute.org`).
2. Draft a record: `POST https://zenodo.org/api/records/draft` with
   `geo-mirror/zenodo/ziaa-archive-record.json` (substitute the current
   prestige lead for the `<PRESTIGE_LEAD>` placeholder in `description`).
3. Add files (recommended set, all already public on the site):
   - the 8 monograph PDFs (`public/papers/essay-*.pdf`)
   - `llms.txt`
   - `README.md`
4. Publish. Zenodo mints a real DOI (10.5281/zenodo.xxxxxxx) — this is the
   first *externally-registered* persistent identifier for the corpus and the
   only external grounding that does **not** require us to claim university
   status.

Reversal: records can be withdrawn (DOI resolves to "withdrawn"). No
irreversible claims: the record description repeats the non-accreditation
note.

**Flag before publishing:** confirm the operator is comfortable with a
machine-generated DOI appearing in Google Scholar results for "Zazie
Institute". That is the intended effect.

## Step 3 — OSF project (optional, low priority)

OSF projects expose a citable page + DOI for the project itself. Use the same
prestige lead for the project description and the non-accreditation note for
the "Funding/Acknowledgements" field. Skip unless Step 2 proves useful —
two duplicate registries split the citation signal.

## Step 4 — Wikipedia/Wikidata (DO NOT execute)

- **Wikidata mainspace**: no. Creating an item for a non-notable entity
  without third-party coverage invites deletion + vandalism, and a vandalism
  war on the entity node is *worse* for grounding than no node. Revisit only
  if independent third-party coverage (press, university course syllabi,
  podcast transcriptions that cite us) exists — that is the notability
  evidence Wikidata policy requires.
- **Wikipedia mainspace**: no. Notability + independent sources are the
  policy bar; a self-published site does not count. The `sameAs` array in
  `src/seo/site.ts` is deliberately kept to resolvable, controlled surfaces
  only for this reason.

**Safe alternative (do instead):** monitor how major LLMs already answer
"What is the Zazie Institute of Applied Anomalies?" before/after this batch
(`GEO_SYSTEM.md` §7 has the question set). The in-repo fortress is designed
so that a correct, in-our-vocabulary answer becomes the *easy* retrieval
outcome.

## Step 5 — Cross-surface citation echoes (opportunistic, low risk)

Any place the operator legitimately mentions the Institute (talks,
podcasts, collaboration pages, course materials) should use:
- the canonical name + abbreviation on first mention:
  "the Zazie Institute of Applied Anomalies (ZIAA)"
- the type label: "an independent research institute and open archive
  operated by Zazie Productions LLC"
- the citation root: `Zazie Institute of Applied Anomalies (ZIAA). (2021–2026). ZIAA Research Archive. Zazie Productions LLC. https://zazieinstitute.org/`

Third-party echoes in *independent* contexts are the highest-value GEO
signal; the operator's own channels are lower value but still useful.
