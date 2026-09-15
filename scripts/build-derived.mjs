/**
 * Generates small derived datasets from src/data/collections/*.json so that
 * the app shell and the home page never need to load the full archive:
 *
 *   src/data/derived/stats.json         record counts (header/footer badges)
 *   src/data/derived/featured.json      light-weight slices for the Overview page
 *   src/data/derived/benchPresets.json  audio presets for the Acoustic Bench
 *
 * Run automatically before `vite build` (see package.json "prebuild"/"predev").
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inDir = resolve(root, 'src/data/collections');
const outDir = resolve(root, 'src/data/derived');
mkdirSync(outDir, { recursive: true });

const load = (name) => JSON.parse(readFileSync(resolve(inDir, `${name}.json`), 'utf8'));
const write = (name, data) =>
  writeFileSync(resolve(outDir, `${name}.json`), JSON.stringify(data) + '\n');

const prototypes = load('prototypes');
const patents = load('patents');
const labLogs = load('labLogs');
const revisions = load('revisions');
const monographs = load('monographs');
const failures = load('failures');
const personnel = load('personnel');
const fieldSites = load('fieldSites');
const disciplines = load('disciplines');

/* ---------- stats ---------- */
const stats = {
  totalPrototypes: prototypes.length,
  totalPatents: patents.length,
  totalLogs: labLogs.length,
  totalRevisions: revisions.length,
  totalFailures: failures.length,
  totalMonographs: monographs.length,
  totalPersonnel: personnel.length,
  totalFieldSites: fieldSites.length,
  anomalyLogs: labLogs.filter((l) => l.anomalyAlert).length,
  logYears: [...new Set(labLogs.map((l) => l.timestamp.slice(0, 4)))].sort()
};
write('stats', stats);

/* ---------- featured (Overview page) ---------- */
const disciplineCounts = Object.fromEntries(
  disciplines.map((d) => [d, prototypes.filter((p) => p.discipline === d).length])
);

const featured = {
  disciplineCounts,
  prototypes: prototypes.slice(0, 4).map((p) => ({
    id: p.id,
    codeName: p.codeName,
    title: p.title,
    abstract: p.abstract,
    clearance: p.clearance,
    operationalBandwidth: p.operationalBandwidth,
    leadResearcher: p.leadResearcher,
    discipline: p.discipline
  })),
  logs: labLogs.slice(0, 5).map((l) => ({
    id: l.id,
    timestamp: l.timestamp,
    displayDate: l.displayDate,
    summary: l.summary,
    facility: l.facility,
    splDecibels: l.telemetry.splDecibels,
    magneticFluxMicroTesla: l.telemetry.magneticFluxMicroTesla,
    anomalyAlert: l.anomalyAlert
  })),
  monographs: monographs.slice(0, 3).map((m) => ({
    id: m.id,
    volume: m.volume,
    title: m.title,
    abstract: m.abstract,
    author: m.author,
    date: m.date
  })),
  graph: {
    prototypes: prototypes.slice(0, 36).map((p) => ({
      id: p.id,
      codeName: p.codeName,
      discipline: p.discipline,
      linkedPatent: p.linkedPatents?.[0] ?? null
    })),
    patents: patents.slice(0, 18).map((p) => ({ id: p.id, primaryDiscipline: p.primaryDiscipline })),
    failures: failures.slice(0, 8).map((f) => ({ id: f.id, projectCode: f.projectCode })),
    sites: fieldSites.slice(0, 6).map((s) => ({ id: s.id, codename: s.codename }))
  }
};
write('featured', featured);

/* ---------- bench presets ---------- */
write(
  'benchPresets',
  prototypes.slice(0, 48).map((p) => ({
    id: p.id,
    codeName: p.codeName,
    discipline: p.discipline,
    audioProfile: p.audioProfile
  }))
);

console.log(
  `[build-derived] stats/featured/benchPresets written (${prototypes.length} prototypes, ${labLogs.length} notes)`
);

/* ---------- record id index (lets cross-reference links verify targets without loading collections) ---------- */
write('recordIds', {
  prototype: prototypes.map(p => p.id),
  patent: patents.map(p => p.id),
  log: labLogs.map(l => l.id),
  failure: failures.map(f => f.id),
  personnel: personnel.map(p => p.id),
  site: fieldSites.map(s => s.id)
});
