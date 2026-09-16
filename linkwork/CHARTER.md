# THE CITATION ORGAN — CONTAINMENT CHARTER

**Instrument:** CIT-01 · **Custodian:** Zazie Productions LLC · **Status:** RATIFIED, BINDING ON THE MACHINERY

> This charter is not advice. Every section marked **[ENFORCED]** is implemented
> in `linkwork/lib/audit.mjs` and fails the build on violation. The organ does
> not ship wounded.

---

## §0 — Premise

The Institute studies anomalies. CIT-01 is an anomaly the Institute applies to
itself: a tiered citation apparatus — sediment (tier 3) → pipes (tier 2) →
vessels (tier 1) → the reservoir (`zazieinstitute.org`) — grown as a work of
institutional satire. The grey in this machine is **structural**: it is a
deliberate, disclosed, reversible link scheme among properties the operator
owns, built in full knowledge that search engines discourage such schemes.
The grey is **never** a deception practiced on a human reader. Every surface
names the Institute, cites real records, and carries the non-accreditation
disclaimer. The paperwork of legitimacy is the sculpture; this charter is
part of the paperwork.

## §1 — Scale caps **[ENFORCED — C1]**

| Tier | Name | Cap |
|------|------|-----|
| 1 | Vessels (study satellites) | **3** |
| 2 | Pipes (feeders) | **8** |
| 3 | Sediment (citation cards) | **16** |

Twenty-seven surfaces is a *piece*, not a farm. Exceeding the caps requires
amending this charter **and** the auditor's C1 constants in the same commit.
The diff is the confession.

## §2 — Ownership; no third-party automation **[ENFORCED — C4]**

1. Every node is hosted on a domain or platform account **owned or controlled
   by the operator** (`spec.hosts` + private `spec.local.json` overlay).
2. The organ emits links only to: ledgered nodes, the reservoir
   (`zazieinstitute.org`), or archival deposit hosts on the allowlist
   (`web.archive.org`, `archive.org`, `zenodo.org`, `doi.org`).
3. **The organ will never, in any version:**
   - post, comment, register accounts, or otherwise automate against any
     third-party platform, forum, blog, or wiki;
   - purchase links, trade links, or place links on sites the operator does
     not control;
   - inject links into pages it does not author;
   - touch any surface a person did not choose to visit.
4. Out-reach (broken-link emails, moderator-approved wiki edits) is **out of
   scope for the machinery**. It is human work under the main playbook §5, kept
   out of the organ so the organ remains a pure, auditable object.

## §3 — Zero network **[ENFORCED — C9]**

The machinery contains no network or subprocess capability. It reads the
archive collections, writes static files, and exits. Deployment is a human
being following the `DEPLOY.md` generated into each node. The auditor scans
the machinery's own source for network/subprocess APIs and fails on any hit.

## §4 — Staging and drip **[ENFORCED — C5]**

1. Each node carries a go-live date in the spec. Before go-live it ships with
   `robots: noindex, nofollow` **and** a visible STAGED banner.
2. Cadence ≤ ~3 nodes/week; the full 21-node organism unfurls over ~9 weeks.
3. Never announce, submit, or list a staged node. Accelerating the drip
   beyond charter cadence is a C1-class violation of spirit even if C1 passes.

## §5 — Footprint hygiene **[ENFORCED — C3, C6, C7, C8, C11]**

- **Anchors:** brand/url/long-tail/generic budget held to ±6pp (§5.1 of the
  main playbook); slot semantics are natural — naked URLs point at the root,
  brand phrases at identity surfaces, long-tails at topical records.
- **No reciprocals, no self-links, no duplicate edges.**
- **Template drift:** pairwise 4-gram similarity across *different* nodes
  ≤ 0.35. Five archetype chromes, five palettes, three font stacks, varied
  provenance footers. No two properties ship the same fingerprint.
- **Surface hygiene:** the machinery's vocabulary ("tier", "backlink",
  "SEO", "PBN", "cloaking"…) never appears on a generated surface. The
  confession lives in this repository, not in the pages.
- **One host account per vessel family.** No shared analytics, fonts, or
  third-party scripts on any node. Nodes are never cross-promoted from
  personal accounts.
- **Provenance on every page:** each surface names the Institute and carries
  the not-an-accredited-institution disclaimer, in varied phrasing.

## §6 — Reversibility **[ENFORCED by `decommission`]**

One command (`linkwork.mjs decommission [--node ID]`) replaces any or all
nodes with honest tombstones — `noindex`, canonical to the archive, a short
note that the study concluded — plus a disavow scaffold and a report. The
organ must remain unwindable in an afternoon. If a search engine ever
manual-actions the reservoir, decommission **is the next act of the piece**:
the machine that grew the evidence of legitimacy files its own demolition
permit with equal grace.

## §7 — Demo discipline **[ENFORCED — amber]**

Hosts unresolved from `spec.local.json` keep their `.invalid` placeholders
and flag the build DEMO MODE. In demo mode: generate, audit, study the plate,
deploy **nothing**.

## §8 — Proportionality

The reservoir already deserves to rank: 683 real records, defensive
disclosures, instruments, an ISSN. CIT-1 exists because the *gap between the
archive's quality and its obscurity* is itself an anomaly worth staging. If
the day comes when the organ's contribution is negligible against the
archive's own gravity — decommission it and keep the plate.
