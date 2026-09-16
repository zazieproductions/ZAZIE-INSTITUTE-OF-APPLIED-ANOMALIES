/**
 * CIT-01 // archive interface.
 * Reads the Institute's collection JSON (same source of truth as
 * src/routes/manifest.ts) and derives canonical zazieinstitute.org URLs.
 * The organ may only cite records that actually exist in the archive.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const COLLECTIONS = path.join(REPO, 'src', 'data', 'collections');

const lower = (s) => s.toLowerCase();

/** Canonical subject — the organ's reservoir. */
export const SUBJECT = {
  url: 'https://zazieinstitute.org',
  name: 'Zazie Institute of Applied Anomalies',
  abbreviation: 'ZIAA',
};

/** Mirror of src/seo/site.ts DISCIPLINE_SLUGS. */
const DISCIPLINE_SLUGS = {
  'Applied Anomalies': 'applied-anomalies',
  'Experimental Audio Systems': 'experimental-audio-systems',
  'Computational Creativity': 'computational-creativity',
  'Speculative Engineering': 'speculative-engineering',
  'Perceptual Interfaces': 'perceptual-interfaces',
  'Generative Software': 'generative-software',
  'Signal Archaeology': 'signal-archaeology',
  'Acoustic Architecture': 'acoustic-architecture',
};

export const disciplinePath = (name) =>
  `/disciplines/${DISCIPLINE_SLUGS[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

let CACHE = null;

export function loadArchive() {
  if (CACHE) return CACHE;
  const read = (f) => JSON.parse(fs.readFileSync(path.join(COLLECTIONS, `${f}.json`), 'utf8'));
  const prototypes = read('prototypes');
  const patents = read('patents');
  const labLogs = read('labLogs');
  const monographs = read('monographs');
  const failures = read('failures');
  const personnel = read('personnel');
  const fieldSites = read('fieldSites');

  const records = [];
  const firstWords = (s, n) =>
    String(s || '').replace(/\s+/g, ' ').trim().split(' ').slice(0, n).join(' ');
  const add = (rec, section, extra = {}) => {
    records.push({
      id: rec.id,
      section,
      path: `/${section}/${lower(rec.id)}`,
      title: rec.title || rec.name || (rec.projectTitle) || (rec.summary ? firstWords(rec.summary, 9) : rec.id),
      discipline: rec.discipline || rec.primaryDiscipline || null,
      year: rec.year || (rec.filingDate || rec.date || rec.timestamp || rec.incidentDate || '').slice(0, 4) || null,
      abstract: rec.abstract || rec.summary || rec.description || null,
      ...extra,
    });
  };
  prototypes.forEach((p) => add(p, 'prototypes', { codeName: p.codeName }));
  patents.forEach((p) => add(p, 'patents'));
  labLogs.forEach((l) => add(l, 'research-notes', { logDate: l.displayDate || l.timestamp }));
  monographs.forEach((m) => add(m, 'monographs'));
  failures.forEach((f) => add(f, 'post-mortems', { hazard: f.hazardClassification }));
  personnel.forEach((p) =>
    records.push({
      id: p.id,
      section: 'fellows',
      path: `/fellows/${lower(p.id)}`,
      title: p.name || p.title || p.id,
      discipline: null,
      year: null,
      abstract: p.bio || p.biography || p.title || null,
      role: p.title || p.role || null,
    })
  );
  fieldSites.forEach((s) =>
    records.push({
      id: s.id,
      section: 'field-stations',
      path: `/field-stations/${lower(s.id)}`,
      title: s.name || s.title || s.id,
      discipline: null,
      year: null,
      abstract: s.description || s.summary || null,
      location: s.location || s.region || null,
    })
  );

  const disciplines = [...new Set(prototypes.map((p) => p.discipline))].sort();

  // Static hub surfaces the organ may cite.
  const hubs = [
    { path: '/', title: `${SUBJECT.name} — Research Archive`, kind: 'root' },
    { path: '/about', title: 'About the Institute', kind: 'about' },
    { path: '/disciplines', title: 'Research Divisions', kind: 'hub' },
    ...disciplines.map((d) => ({
      path: disciplinePath(d),
      title: `${d} — Research Division`,
      kind: 'discipline',
      discipline: d,
    })),
    { path: '/prototypes', title: 'Prototype Register', kind: 'collection' },
    { path: '/patents', title: 'Defensive Patent Register', kind: 'collection' },
    { path: '/research-notes', title: 'Research Notes', kind: 'collection' },
    { path: '/monographs', title: 'ZIAA Transactions', kind: 'collection' },
    { path: '/field-stations', title: 'Field Stations', kind: 'collection' },
    { path: '/post-mortems', title: 'Anomaly Post-Mortems', kind: 'collection' },
    { path: '/fellows', title: 'Fellowship', kind: 'collection' },
    { path: '/lexicon', title: 'Institutional Lexicon', kind: 'reference' },
    { path: '/system-audit', title: 'System Audit', kind: 'reference' },
  ];

  const byPath = new Map([...hubs.map((h) => ({ ...h, url: SUBJECT.url + h.path })), ...records.map((r) => ({ ...r, url: SUBJECT.url + r.path }))].map((x) => [x.path, x]));

  CACHE = { prototypes, patents, labLogs, monographs, failures, personnel, fieldSites, records, hubs, disciplines, byPath };
  return CACHE;
}

/** Resolve a subject-surface spec ({section, id} | {hub}) to a canonical record. */
export function resolveSurface(spec) {
  const a = loadArchive();
  if (spec.hub) {
    const h = a.hubs.find((h) => h.path === spec.hub);
    if (!h) throw new Error(`Unknown hub surface: ${spec.hub}`);
    return h;
  }
  const rec = a.records.find((r) => r.section === spec.section && r.id.toUpperCase() === spec.id.toUpperCase());
  if (!rec) throw new Error(`Unknown record surface: ${spec.section}/${spec.id}`);
  return rec;
}

/** Every valid subject path (for audit). */
export function allSubjectPaths() {
  const a = loadArchive();
  return new Set([...a.hubs.map((h) => h.path), ...a.records.map((r) => r.path)]);
}
