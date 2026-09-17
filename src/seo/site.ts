/**
 * Single source of truth for the ZIAA entity vocabulary.
 * Every title, description, breadcrumb, Open Graph tag and JSON-LD block
 * derives from these constants so the entity is described consistently.
 */
export const SITE_URL = 'https://zazieinstitute.org';

/**
 * Legal founder & owner - the real-world person search engines must associate
 * with the Institute and its operating company. Single source of truth for the
 * name string; every visible credit, meta tag and Person JSON-LD node derives
 * from here so Google merges signals onto one entity.
 */
export const FOUNDER = {
  name: 'Zazie Kanwar-Torge',
  givenName: 'Zazie',
  familyName: 'Kanwar-Torge',
  /** Canonical bio page - the Person entity's crawlable home. */
  path: '/founder',
  jobTitle: 'Founder of Zazie Productions LLC; Founder & Director of the Zazie Institute of Applied Anomalies',
  shortRole: 'Founder & Director',
  description:
    'Zazie Kanwar-Torge is the founder and owner of Zazie Productions LLC and the founder and director of the Zazie Institute of Applied Anomalies (ZIAA), the independent research institute and open archive the company operates from the Mojave Basin, California.'
} as const;

/** Canonical @id of the founder's Person node - referenced by every schema. */
export const FOUNDER_ID = `${SITE_URL}/founder#person`;

/**
 * Trademark portfolio - common-law marks owned by Zazie Productions LLC
 * (founded and owned by Zazie Kanwar-Torge). Displayed with ™ across legal
 * surfaces, the footer and the masthead; the full notice lives at
 * /legal/trademarks. Never render these with ® (no registration is claimed).
 */
export const TRADEMARK_OWNER = 'Zazie Productions LLC';
export const COPYRIGHT_NOTICE = '© 2021–2026 Zazie Productions LLC. All rights reserved.';
export const TRADEMARK_MARKS = [
  'Zazie Institute of Applied Anomalies',
  'ZIAA',
  'Zazie Productions',
  'Auditus Inauditi',
  'ZIAA Transactions',
  'Acoustic Bench',
  'SPECTRA//LAB',
  'VOID//OCULUS',
  'SYNTHESIS//SIGNAL',
  'EMOTION//SPECTRUM',
  'Black Vault',
  'Anomaly Post-Mortem',
  'System Audit Ledger',
  'ZIAA Institutional Crest'
] as const;

export const ENTITY = {
  name: 'Zazie Institute of Applied Anomalies',
  abbreviation: 'ZIAA',
  legalParent: 'Zazie Productions LLC',
  founded: '2021',
  foundingLocation: 'Mojave Basin, California, USA',
  /** Canonical entity-type label - kept in sync with src/seo/canonicalFacts.ts. */
  type: 'Independent research institute and open research archive',
  tagline: 'Applied Anomalies · Experimental Systems · Audio Technology · Computational Creativity',
  /**
   * Canonical entity description (no counts - count-bearing variants are
   * produced by canonicalFacts.prestigeLead(stats) and must stay consistent
   * with this base string; scripts/geo-check.mjs enforces the overlap).
   */
  shortDescription:
    'The Zazie Institute of Applied Anomalies (ZIAA) is an independent research institute and open archive, founded in 2021 in the Mojave Basin, California, and operated by Zazie Productions LLC. Organized into eight research divisions, the Institute develops experimental sound technology, perceptual interfaces and computational instruments, and publishes its work as a permanent, citable research archive.',
  // Expanded topical cluster for entity disambiguation and long-tail capture -
  // maps to knowsAbout / about / keywords across every schema.
  fields: [
    'experimental technology',
    'audio research',
    'computational creativity',
    'speculative engineering',
    'creative tools',
    'prototypes',
    'software',
    'digital art',
    'sound technology',
    'interdisciplinary research',
    'psychoacoustics',
    'spatial audio',
    'physical computing',
    'material acoustics',
    'signal archaeology',
    'generative composition',
    'acoustic architecture',
    'haptic interfaces',
    'field recording',
    'binaural synthesis'
  ],
  // sameAs - ONLY resolvable, controlled surfaces. No Wikipedia/Wikidata/ROR until they exist and resolve 200.
  // Entity vandalism via fake sameAs poisons the graph; maintain hygiene until notability is earned.
  // Knowledge-panel guidance: every URL here should be a profile Google can
  // associate with the org (see KNOWLEDGE_PANEL_RUNBOOK.md before adding one).
  sameAs: [
    'https://github.com/zazieproductions',
    'https://github.com/zazieproductions/ZAZIE-INSTITUTE-OF-APPLIED-ANOMALIES'
  ],
  founders: ['Dr. V. Aris Thorne', 'Elena Mstislav', 'Dr. Tamsin Callow'],
  foundingDateISO: '2021-01-15',
  address: {
    streetAddress: 'Research Division, Zazie Productions LLC',
    addressLocality: 'Mojave Basin',
    addressRegion: 'CA',
    postalCode: '93501',
    addressCountry: 'US'
  },
  email: 'research@zazieinstitute.org',
  logoPath: '/brand/ziaa-crest-512.png',
  ogImagePath: '/brand/og-default.png',
  themeColor: '#030508'
} as const;

// Canonical discipline vocabulary - single source for nav, sitemap, schema, internal anchoring.
export const DISCIPLINE_SLUGS: Record<string, string> = {
  'Applied Anomalies': 'applied-anomalies',
  'Experimental Audio Systems': 'experimental-audio-systems',
  'Computational Creativity': 'computational-creativity',
  'Speculative Engineering': 'speculative-engineering',
  'Perceptual Interfaces': 'perceptual-interfaces',
  'Generative Software': 'generative-software',
  'Signal Archaeology': 'signal-archaeology',
  'Acoustic Architecture': 'acoustic-architecture'
} as const;

export const disciplinePath = (name: string) =>
  `/disciplines/${DISCIPLINE_SLUGS[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

export const disciplineBySlug = (slug: string) =>
  (Object.entries(DISCIPLINE_SLUGS) as [string, string][]).find(([, s]) => s === slug)?.[0] as string | undefined;

/** "Page Title · ZIAA" pattern. Keep the entity out of the page-specific half. */
/**
 * @param pageTitle  descriptive part; may be clipped to fit the budget
 * @param keep       identifier part (record id, codename) that is never clipped, e.g. "PAT-2021-001"
 */
export function buildTitle(pageTitle?: string, keep?: string): string {
  if (!pageTitle) return `${ENTITY.name} (${ENTITY.abbreviation}) - Research Archive`;
  const tail = keep ? ` (${keep})` : '';
  // Title budget ≈ 70 chars: full brand suffix when it fits, short "· ZIAA" suffix otherwise,
  // clipping the page part at a word boundary if it is still too long. H1s keep the full title.
  const full = `${pageTitle}${tail} · ${ENTITY.abbreviation} - ${ENTITY.name}`;
  if (full.length <= 70) return full;
  const short = `${tail} · ${ENTITY.abbreviation}`;
  return `${clipWords(pageTitle, 70 - short.length)}${short}`;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Trim descriptions to a search-snippet-friendly length without cutting words. */
export function snippet(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function clipWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${cut.slice(0, at > max - 30 ? at : max - 1).replace(/[,;:–(\s-]+$/, '')}…`;
}
