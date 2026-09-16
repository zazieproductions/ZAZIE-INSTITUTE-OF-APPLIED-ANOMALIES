# CIT-01 — "THE CITATION ORGAN"

**A tiered-link machine, built as an artwork.**
Department of Applied Visibility · Zazie Institute of Applied Anomalies

```
sediment (tier 3)  →  pipes (tier 2)  →  vessels (tier 1)  →  RESERVOIR
  12 citation cards      6 feeders           3 study satellites    zazieinstitute.org
```

---

## What this is (three readings, all true)

**1. The satire.** An institute that studies anomalies discovers an anomaly in
itself — the gap between what its archive deserves and what the world can see
of it — and responds the only way an institute knows how: it builds an
instrument, writes a charter, files the paperwork, and ships the paperwork
alongside the machine. The Institute's defensive-patent reflex, clearance
fetish, and post-mortem liturgy are all applied, with total sincerity, to the
least dignified activity on the internet: search-engine link scheming. The
deadpan *is* the joke. If you have to explain to anyone why a fictional
institute has an SEO division, the explanation is the piece.

**2. The machinery.** Under the art direction this is a real, working
tiered-link system of the classic grey-hat shape — feeder properties propping
up satellites propping up the money site — with every classical failure mode
engineered *away* in code: template fingerprints, anchor stuffing, link
blasts, orphaned deindextension, unrecoverable footprints. It is honest about
what it is: a link scheme, knowingly operated against search-engine guidance,
on properties the operator owns, with no third-party automation of any kind.
The containment rules live in [`CHARTER.md`](./CHARTER.md) and are enforced by
the auditor, not by hope.

**3. The confession.** Everything the surfaces hide, the repository shows.
The ledger (`out/ledger.json`) records every edge with its anchor and target.
The plate (`out/organ-chart.svg`) is the machine's self-portrait, drawn to
engineering-drawing conventions, stamped DO NOT SCALE · DO NOT BLAST · DRIP
ONLY. If the piece is ever "discovered," the discovery is the press release:
the audit trail is the exhibit.

## Reality check (what is genuinely true)

- Every record cited on every generated page **exists** in the archive; every
  reservoir link resolves to a real URL derived from the same collections that
  build the site's sitemap (audited as C10).
- Every generated page discloses that it is a study annex of ZIAA and carries
  the non-accreditation disclaimer (audited as C11).
- The machinery makes **zero network calls** (audited as C9). It grows static
  files; a human deploys them.

## Quickstart

```bash
node linkwork/linkwork.mjs build      # grow: sites + ledger + schematic plate
node linkwork/linkwork.mjs audit      # enforce the charter (exit 1 on red)
node linkwork/linkwork.mjs schedule   # drip calendar → out/schedule.ics
node linkwork/linkwork.mjs status     # live / staged today
node linkwork/linkwork.mjs graph      # redraw the plate
node linkwork/linkwork.mjs decommission            # kill switch (all nodes)
node linkwork/linkwork.mjs decommission --node C-04
```

Determinism: same spec + seed + epoch + clock ⇒ byte-identical sites. The
organ is reproducible evidence.

## File map

```
linkwork/
  ORGAN.md               ← this placard
  CHARTER.md             ← containment rules (auditor-enforced)
  spec.linkwork.json     ← the declarative topology (nodes, tiers, drip offsets)
  spec.local.json        ← your real hosts (gitignored; absent = DEMO MODE)
  linkwork.mjs           ← CLI
  lib/
    topology.mjs         ← graph grower; tier discipline R1–R5
    anchors.mjs          ← anchor budget allocator (§5.1 ratios)
    content.mjs          ← ten in-universe voices; citation registers
    render.mjs           ← five archetype chromes; staged robots logic
    audit.mjs            ← C1–C11 containment auditor
    svg.mjs              ← the hydraulic schematic plate
    archive.mjs          ← reads src/data/collections; derives real URLs
    rng.mjs              ← seeded entropy (no Math.random in the organ)
  out/
    ledger.json          ← committed machine state: every node, edge, hash
    organ-chart.svg      ← committed plate (the piece's self-portrait)
    schedule.ics         ← drip calendar
    sites/               ← deployable static trees (gitignored)
```

## Deploying (the human parts)

1. Create `linkwork/spec.local.json` with your real hosts:

   ```json
   { "hosts": {
       "DOMAIN_V01": "your-registered-domain.net",
       "GHPAGES_MAIN": "your-org.github.io",
       "DOMAIN_V03": "another-registered-domain.net",
       "...": "one token per hostToken in spec.linkwork.json"
   } }
   ```

2. `node linkwork/linkwork.mjs build` — the DEMO MODE amber must clear.
3. Follow each node's `DEPLOY.md`: manual upload to its declared host, no
   analytics, no third-party scripts, never cross-promote from personal
   accounts.
4. Keep the appointments in `out/schedule.ics`. **Never announce a staged
   node.**
5. To retire the piece: `decommission`. Tombstones are honest, noindexed, and
   canonical to the archive. The plate stays in the repo.

## Adding voices / nodes

Voices live in `lib/content.mjs` (`VOICES` registry). A new voice is a
function returning `{masthead, sections, closer}` from seeded randomness and
real archive records — then declare nodes using it in `spec.linkwork.json`.
The auditor will hold any new node to the same caps, drift, anchor, and
hygiene rules. Sediment past 16 requires amending the charter in the same
commit — the diff is the confession.
