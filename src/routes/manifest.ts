/**
 * Enumerates every canonical URL on the site. Used by:
 *   - scripts/prerender.mjs  → one static HTML file per URL
 *   - scripts/prerender.mjs  → sitemap.xml
 * Data is read directly from the collection JSON so the manifest is exhaustive.
 */
import prototypes from '../data/collections/prototypes.json';
import patents from '../data/collections/patents.json';
import labLogs from '../data/collections/labLogs.json';
import monographs from '../data/collections/monographs.json';
import failures from '../data/collections/failures.json';
import personnel from '../data/collections/personnel.json';
import fieldSites from '../data/collections/fieldSites.json';

export interface RouteEntry {
  path: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: number;
  lastmod?: string;
  /** Excluded from sitemap (but still prerendered), e.g. search & 404. */
  noindex?: boolean;
}

const lower = (s: string) => s.toLowerCase();
const LAST_LOG = [...labLogs].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))[0]?.timestamp.slice(0, 10);

// Discipline slug helpers — must mirror src/seo/site.ts DISCIPLINE_SLUGS
const disciplineSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const disciplinesList: string[] = [...new Set(prototypes.map(p => p.discipline))].sort();
// Per-discipline lastmod: newest patent filingDate or prototype year in cluster, clamped in prerender
const disciplineLastmod = (discipline: string): string | undefined => {
  const protoYears = prototypes.filter(p => p.discipline === discipline).map(p => `${p.year}-12-31`);
  const patentDates = patents.filter(p => p.primaryDiscipline === discipline).map(p => p.filingDate);
  const candidates = [...protoYears, ...patentDates].sort();
  return candidates.at(-1);
};

export const STATIC_ROUTES: RouteEntry[] = [
  { path: '/', changefreq: 'weekly', priority: 1.0, lastmod: LAST_LOG },
  { path: '/about', changefreq: 'monthly', priority: 0.9 },
  { path: '/prototypes', changefreq: 'weekly', priority: 0.9 },
  { path: '/patents', changefreq: 'monthly', priority: 0.8 },
  { path: '/research-notes', changefreq: 'weekly', priority: 0.8, lastmod: LAST_LOG },
  { path: '/monographs', changefreq: 'monthly', priority: 0.8 },
  { path: '/acoustic-bench', changefreq: 'monthly', priority: 0.7 },
  { path: '/spectra-lab', changefreq: 'monthly', priority: 0.7 },
  { path: '/void-oculus', changefreq: 'monthly', priority: 0.6 },
  { path: '/synthesis-signal', changefreq: 'monthly', priority: 0.7 },
  { path: '/emotion-spectrum', changefreq: 'monthly', priority: 0.7 },
  { path: '/legal/institutional-status', changefreq: 'yearly', priority: 0.4 },
  { path: '/legal/disclaimer', changefreq: 'yearly', priority: 0.4 },
  { path: '/legal/terms', changefreq: 'yearly', priority: 0.3 },
  { path: '/legal/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/field-stations', changefreq: 'monthly', priority: 0.7 },
  { path: '/post-mortems', changefreq: 'monthly', priority: 0.7 },
  { path: '/fellows', changefreq: 'monthly', priority: 0.7 },
  { path: '/system-audit', changefreq: 'weekly', priority: 0.5 },
  // Institutional reference surfaces — lexicon (DefinedTermSet) + citation policy
  { path: '/lexicon', changefreq: 'monthly', priority: 0.7 },
  { path: '/cite', changefreq: 'yearly', priority: 0.6 },
  // Topical authority hubs — one canonical landing per research division (fixes §4 audit gap)
  { path: '/disciplines', changefreq: 'weekly', priority: 0.8 },
  ...disciplinesList.map(d => ({
    path: `/disciplines/${disciplineSlug(d)}`,
    changefreq: 'weekly' as const,
    priority: 0.8,
    lastmod: disciplineLastmod(d)
  })),
  // Heterogeneous academic surface — papers corpus (HTML index for 108 PDFs)
  { path: '/papers', changefreq: 'monthly', priority: 0.8 },
  { path: '/search', changefreq: 'yearly', priority: 0.1, noindex: true },
  { path: '/404', changefreq: 'yearly', priority: 0.0, noindex: true },
  // Gone surface for retired addresses (HTTP 410) — see scripts/alias-registry.mjs
  { path: '/410', changefreq: 'yearly', priority: 0.0, noindex: true }
];

export const DYNAMIC_ROUTES: RouteEntry[] = [
  ...prototypes.map(p => ({ path: `/prototypes/${lower(p.id)}`, changefreq: 'monthly' as const, priority: 0.7 })),
  ...patents.map(p => ({ path: `/patents/${lower(p.id)}`, changefreq: 'yearly' as const, priority: 0.6, lastmod: p.filingDate })),
  ...labLogs.map(l => ({ path: `/research-notes/${lower(l.id)}`, changefreq: 'yearly' as const, priority: 0.5, lastmod: l.timestamp.slice(0, 10) })),
  ...monographs.map(m => ({ path: `/monographs/${lower(m.id)}`, changefreq: 'yearly' as const, priority: 0.8, lastmod: m.date })),
  ...failures.map(f => ({ path: `/post-mortems/${lower(f.id)}`, changefreq: 'yearly' as const, priority: 0.5, lastmod: f.incidentDate })),
  ...personnel.map(p => ({ path: `/fellows/${lower(p.id)}`, changefreq: 'monthly' as const, priority: 0.6 })),
  ...fieldSites.map(s => ({ path: `/field-stations/${lower(s.id)}`, changefreq: 'yearly' as const, priority: 0.6 }))
];

export const ROUTE_MANIFEST: RouteEntry[] = [...STATIC_ROUTES, ...DYNAMIC_ROUTES];
