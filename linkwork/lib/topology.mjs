/**
 * CIT-01 // topology.
 * Grows the organ's graph from the spec. Flow is one-way, upward:
 *
 *   sediment (tier 3)  →  pipes (tier 2)  →  vessels (tier 1)  →  SUBJECT (zazieinstitute.org)
 *
 * Hard rules (audited, not aspirational):
 *   R1 Only tier-1 nodes emit edges to the SUBJECT.
 *   R2 Tier-3 nodes never touch tier-1 or the SUBJECT.
 *   R3 No node links to itself. No reciprocal pairs (A→B ∧ B→A).
 *   R4 Every edge is a visible body link on the source page.
 *   R5 Every SUBJECT target resolves to a real archive surface.
 */
import { rng } from './rng.mjs';
import { loadArchive, resolveSurface, SUBJECT, allSubjectPaths } from './archive.mjs';
import { assignAnchorClasses, anchorText, descriptiveAnchor, realizedDistribution, ANCHOR_BUDGET, ANCHOR_TOLERANCE } from './anchors.mjs';
import { hostValue, nodeUrl, goLiveDate } from './spec.mjs';

function slugOf(discipline) {
  return discipline.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Pick subject surfaces a vessel cites, with slot-based anchor classes so
 * anchor semantics stay natural:
 *   root ×2 (brand + naked url) · identity surfaces (/about, /disciplines) brand
 *   one discipline hub long-tail · deep records long-tail + generic.
 * Realized distribution over 21 subject-bound edges: ≈43/14/29/14 — inside
 * the ±6pp tolerance of the §5.1 budget (40/20/30/10), audited as C6.
 */
function vesselSubjectTargets(node, rand) {
  const a = loadArchive();
  const disciplines =
    node.affinity?.disciplines?.length > 0 ? node.affinity.disciplines : rand.sample(a.disciplines, 2);
  const picks = [
    { hub: '/', anchorClass: 'url' },
    { hub: '/', anchorClass: 'brand' },
    { hub: '/about', anchorClass: 'brand' },
    { hub: '/disciplines', anchorClass: 'brand' },
    { hub: `/disciplines/${slugOf(disciplines[0])}`, anchorClass: 'longtail' },
  ];
  const pool = a.records.filter(
    (r) => (node.affinity?.disciplines || []).includes(r.discipline) || (node.affinity?.sections || []).includes(r.section)
  );
  const finalPool = pool.length >= 3 ? pool : a.records;
  const deep = rand.sample(finalPool, node.affinity?.deepRecords ?? 2);
  deep.forEach((rec, i) => picks.push({ section: rec.section, id: rec.id, anchorClass: i === 0 ? 'longtail' : 'generic' }));
  return picks;
}

export function buildGraph(spec, epoch) {
  const rand = rng(`cit-01/topology/${spec.seed}/${epoch}`);
  const nodes = spec.nodes.map((n) => ({
    ...n,
    url: nodeUrl(spec, n),
    goLive: goLiveDate(spec, n, epoch),
    archetype: n.archetype || (n.tier === 1 ? 'dossier' : n.tier === 2 ? 'catalogue' : 'index-card'),
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const tier = (t) => nodes.filter((n) => n.tier === t);

  const raw = [];

  // --- Vessels → SUBJECT --------------------------------------------------
  for (const v of tier(1)) {
    vesselSubjectTargets(v, rand).forEach((t, i) => {
      raw.push({
        from: v.id,
        to: 'SUBJECT',
        surface: t,
        page: i === 0 ? 'index' : `inner-${(((i - 1) % Math.max(1, v.innerPages || 1)) + 1)}`,
      });
    });
  }
  // Explicit operator edges (e.g. archive.org deposits, rel=nofollow)
  for (const e of spec.explicitEdges || []) {
    raw.push({
      from: e.from,
      to: e.to,
      surface: e.to === 'SUBJECT' ? { hub: '/' } : { external: e.href, label: e.label || e.href },
      page: e.page || 'index',
      rel: e.rel || null,
      external: Boolean(e.href),
    });
  }

  // --- Pipes → vessels + forward-only sideways ------------------------------
  const vessels = tier(1);
  const pipes = tier(2);
  for (const p of pipes) {
    for (const v of pairDown(p, vessels, rand)) raw.push({ from: p.id, to: v.id, page: 'index' });
    for (const q of sideways(p, pipes)) raw.push({ from: p.id, to: q.id, page: 'index' });
  }

  // --- Sediment → one pipe + forward-only sideways ---------------------------
  const cards = tier(3);
  for (const c of cards) {
    for (const p of pairDown(c, pipes, rand)) raw.push({ from: c.id, to: p.id, page: 'index' });
    for (const d of sideways(c, cards)) raw.push({ from: c.id, to: d.id, page: 'index' });
  }

  // --- Materialize every edge (anchor + target URL) in one pass -------------
  const anchorPool = raw.filter((e) => e.to === 'SUBJECT' && !e.external);
  assignAnchorClasses(anchorPool, rand);
  const edges = raw.map((e) => {
    const from = byId.get(e.from);
    if (!from) throw new Error(`edge from unknown node ${e.from}`);
    const out = { ...e, rel: e.rel || null, external: Boolean(e.external) };
    if (e.external) {
      out.anchor = e.surface.label;
      out.targetUrl = e.surface.external;
      out.targetTitle = e.surface.label;
    } else if (e.to === 'SUBJECT') {
      const target = resolveSurface(e.surface);
      out.anchor = anchorText(e.anchorClass, target, rand);
      out.targetUrl = SUBJECT.url + target.path;
      out.targetPath = target.path;
      out.targetTitle = target.title;
    } else {
      const peer = byId.get(e.to);
      if (!peer) throw new Error(`edge to unknown node ${e.to}`);
      out.anchor = descriptiveAnchor(peer.title, rand);
      out.targetUrl = peer.url;
      out.targetTitle = peer.title;
    }
    return out;
  });

  // --- Vessel inner pages: one archive record each ---------------------------
  for (const v of vessels) {
    const pool = loadArchive().records.filter(
      (r) => (v.affinity?.disciplines || []).includes(r.discipline) || (v.affinity?.sections || []).includes(r.section)
    );
    const finalPool = pool.length >= (v.innerPages || 0) ? pool : loadArchive().records;
    v.inner = rand.sample(finalPool, v.innerPages || 0).map((r, i) => ({
      slug: `inner-${i + 1}`,
      record: { section: r.section, id: r.id },
      title: r.title,
    }));
  }

  const outEdges = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) outEdges.get(e.from).push(e);
  const inEdges = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) if (byId.has(e.to)) inEdges.get(e.to).push(e);

  const subjectBound = edges.filter((e) => e.to === 'SUBJECT' && !e.external);
  // budgeted random classes only where slots didn't fix them
  for (const e of subjectBound) if (!e.anchorClass) e.anchorClass = e.anchorClass || 'longtail';
  const distribution = realizedDistribution(subjectBound);

  return {
    nodes,
    byId,
    edges,
    outEdges,
    inEdges,
    subjectBound,
    distribution,
    distributionErrors: assertDistribution(distribution),
    subjectPaths: allSubjectPaths(),
  };
}

/** Pick `k` (node.upstream ?? 2) upper nodes, balancing load. */
function pairDown(node, upper, rand) {
  const k = Math.max(1, Math.min(upper.length, node.upstream ?? 2));
  const buckets = rand.shuffle(upper);
  const start = Math.floor(rand.next() * upper.length);
  const out = [];
  for (let i = 0; i < k; i++) out.push(upper[(start + i * Math.max(1, Math.floor(upper.length / k))) % upper.length]);
  return out.length ? out : buckets.slice(0, k);
}

/** Forward-only sideways neighbours within a tier (never self, never reciprocal). */
function sideways(node, tierNodes) {
  const k = node.sideways ?? 1;
  const i = tierNodes.findIndex((n) => n.id === node.id);
  const out = [];
  for (let j = 1; j <= k; j++) {
    const c = tierNodes[(i + j) % tierNodes.length];
    if (c && c.id !== node.id) out.push(c);
  }
  return out;
}

/** Assert the realized anchor distribution sits within tolerance of budget. */
export function assertDistribution(dist) {
  const errs = [];
  for (const [cls, budget] of Object.entries(ANCHOR_BUDGET)) {
    const d = Math.abs((dist[cls] ?? 0) - budget);
    if (d > ANCHOR_TOLERANCE) errs.push(`anchor class ${cls}: ${(dist[cls] ?? 0).toFixed(2)} vs budget ${budget} (Δ${d.toFixed(2)} > ${ANCHOR_TOLERANCE})`);
  }
  return errs;
}
