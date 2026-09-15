/**
 * Single source of truth for the ZIAA entity vocabulary.
 * Every title, description, breadcrumb, Open Graph tag and JSON-LD block
 * derives from these constants so the entity is described consistently.
 */
export const SITE_URL = 'https://zazieinstitute.org';

export const ENTITY = {
  name: 'Zazie Institute of Applied Anomalies',
  abbreviation: 'ZIAA',
  legalParent: 'Zazie Productions LLC',
  founded: '2021',
  type: 'Independent interdisciplinary research and creative-technology initiative',
  tagline: 'Applied Anomalies · Experimental Systems · Audio Technology · Computational Creativity',
  shortDescription:
    'The Zazie Institute of Applied Anomalies (ZIAA) is an independent interdisciplinary research and creative-technology initiative focused on applied anomalies, experimental audio systems, computational creativity, speculative engineering, prototypes, software and research notes.',
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
    'interdisciplinary research'
  ],
  email: 'research@zazieinstitute.org',
  logoPath: '/brand/ziaa-crest-512.png',
  ogImagePath: '/brand/og-default.png',
  themeColor: '#030508'
} as const;

/** "Page Title · ZIAA" pattern. Keep the entity out of the page-specific half. */
/**
 * @param pageTitle  descriptive part; may be clipped to fit the budget
 * @param keep       identifier part (record id, codename) that is never clipped, e.g. "PAT-2021-001"
 */
export function buildTitle(pageTitle?: string, keep?: string): string {
  if (!pageTitle) return `${ENTITY.name} (ZIAA) — Experimental Research & Creative Technology`;
  const tail = keep ? ` (${keep})` : '';
  // Title budget ≈ 70 chars: full brand suffix when it fits, short "· ZIAA" suffix otherwise,
  // clipping the page part at a word boundary if it is still too long. H1s keep the full title.
  const full = `${pageTitle}${tail} · ${ENTITY.abbreviation} — ${ENTITY.name}`;
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
  return `${cut.slice(0, at > max - 30 ? at : max - 1).replace(/[,;:\-–—(\s]+$/, '')}…`;
}
