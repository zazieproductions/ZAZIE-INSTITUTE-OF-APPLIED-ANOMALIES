/**
 * CIT-01 // anchor allocation.
 * Every edge the organ emits carries an anchor drawn from a budgeted class
 * distribution (BLACK_HAT_SEO_ARCHITECT_PLAYBOOK §5.1):
 *   brand 40% · url 20% · long-tail 30% · generic 10%
 * Zero exact-match "money" anchors — there is no money keyword; this is topical.
 * The allocator is deterministic per (seed, edge-list) and the auditor holds
 * the realized distribution to a ±6pp tolerance per class.
 */

export const ANCHOR_BUDGET = { brand: 0.4, url: 0.2, longtail: 0.3, generic: 0.1 };
export const ANCHOR_TOLERANCE = 0.06;

const GENERIC = ['the archive', 'research dossier', 'full record', 'documentation', 'the register', 'the Institute'];

/**
 * Assign anchor classes to subject-bound edges so the realized distribution
 * matches the budget as closely as integer counts allow (largest-remainder).
 */
export function assignAnchorClasses(edges, rand) {
  const n = edges.length;
  const exact = Object.entries(ANCHOR_BUDGET).map(([cls, p]) => [cls, p * n]);
  const floors = exact.map(([cls, v]) => [cls, Math.floor(v)]);
  let remainder = n - floors.reduce((s, [, v]) => s + v, 0);
  const byFrac = [...exact]
    .sort((a, b) => (b[1] % 1) - (a[1] % 1))
    .map(([cls]) => cls);
  const counts = Object.fromEntries(floors);
  for (let i = 0; i < remainder; i++) counts[byFrac[i % byFrac.length]] += 1;

  const classes = [];
  for (const [cls, c] of Object.entries(counts)) for (let i = 0; i < c; i++) classes.push(cls);
  const shuffled = rand.shuffle(classes);
  edges.forEach((e, i) => {
    e.anchorClass = shuffled[i];
  });
  return edges;
}

/** Materialize the anchor text for one edge given its resolved target. */
export function anchorText(cls, target, rand) {
  const t = target.title || target.id;
  switch (cls) {
    case 'brand':
      return rand.pick([
        'Zazie Institute of Applied Anomalies',
        'ZIAA Research Archive',
        'the ZIAA open archive',
        "the Institute's research archive",
        'Zazie Institute',
      ]);
    case 'url':
      return rand.pick(['zazieinstitute.org', 'https://zazieinstitute.org', 'www.zazieinstitute.org', 'zazieinstitute.org/archive']);
    case 'generic':
      return rand.pick(GENERIC);
    case 'longtail':
      return longTail(t, target, rand);
    default:
      throw new Error(`Unknown anchor class: ${cls}`);
  }
}

/**
 * Derive a topical long-tail phrase from a record title — the leading
 * content words, lowercased, occasionally paired with a division or
 * register qualifier. Never more than 7 words; never ALL CAPS; no stuffing.
 */
export function longTail(title, target, rand) {
  const stop = new Set([
    'a','an','the','of','for','with','and','or','in','on','at','to','from','by','via','using','under','without','its',
  ]);
  const words = title
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && !stop.has(w.toLowerCase()));
  const take = Math.min(words.length, rand.int(4, 7));
  const phrase = words.slice(0, take).join(' ').toLowerCase();
  const qualifiers = [];
  if (target?.discipline) qualifiers.push(target.discipline.toLowerCase());
  if (target?.section === 'patents') qualifiers.push('defensive disclosure');
  if (target?.section === 'monographs') qualifiers.push('monograph');
  if (target?.section === 'field-stations') qualifiers.push('field station');
  if (target?.section === 'prototypes') qualifiers.push('prototype dossier');
  if (qualifiers.length && rand.chance(0.45)) return `${phrase} — ${rand.pick(qualifiers)}`;
  return phrase;
}

/** Descriptive anchor for node-bound edges (vessel/pipe/card titles). */
export function descriptiveAnchor(nodeTitle, rand) {
  const trimmed = nodeTitle.replace(/^(the|a|an)\s+/i, '').replace(/\s+/g, ' ').trim();
  const forms = [trimmed, trimmed.toLowerCase(), `${trimmed.toLowerCase()} — study annex`];
  return rand.pick(forms);
}

/** Class distribution of a realized edge list. */
export function realizedDistribution(edges) {
  const dist = { brand: 0, url: 0, longtail: 0, generic: 0 };
  for (const e of edges) if (dist[e.anchorClass] !== undefined) dist[e.anchorClass] += 1;
  const n = edges.length || 1;
  return Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v / n]));
}
