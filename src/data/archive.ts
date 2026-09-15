/**
 * Archive data access layer.
 *
 * Only the tiny derived datasets (`stats`, `featured`, `benchPresets`) are
 * imported statically, so the app shell stays light. Full collections are
 * loaded lazily per route via the `load*` functions, which Vite splits into
 * separate chunks.
 */
import type {
  Prototype,
  Patent,
  LabLog,
  Revision,
  Monograph,
  FailedIncident,
  Personnel,
  FieldSite,
  Department,
  Program,
  Grant,
  Course,
  TermSet,
  SecurityClearance,
  PrototypeStatus,
  AudioProfile
} from './types';
import statsJson from './derived/stats.json';
import featuredJson from './derived/featured.json';
import benchPresetsJson from './derived/benchPresets.json';
import disciplinesJson from './collections/disciplines.json';
import clearancesJson from './collections/clearances.json';
import statusesJson from './collections/statuses.json';
import facilitiesJson from './collections/facilities.json';
import recordIdsJson from './derived/recordIds.json';
import departmentsJson from './collections/departments.json';
import programsJson from './collections/programs.json';
import grantsJson from './collections/grants.json';
import coursesJson from './collections/courses.json';
import termsJson from './collections/terms.json';
import instituteJson from './derived/institute.json';

export interface ArchiveStats {
  totalPrototypes: number;
  totalPatents: number;
  totalLogs: number;
  totalRevisions: number;
  totalFailures: number;
  totalMonographs: number;
  totalPersonnel: number;
  totalFieldSites: number;
  anomalyLogs: number;
  logYears: string[];
}

export interface FeaturedPrototype {
  id: string;
  codeName: string;
  title: string;
  abstract: string;
  clearance: string;
  operationalBandwidth: string;
  leadResearcher: string;
  discipline: string;
}
export interface FeaturedLog {
  id: string;
  timestamp: string;
  displayDate: string;
  summary: string;
  facility: string;
  splDecibels: number;
  magneticFluxMicroTesla: number;
  anomalyAlert: boolean;
}
export interface FeaturedMonograph {
  id: string;
  volume: string;
  title: string;
  abstract: string;
  author: string;
  date: string;
}
export interface FeaturedData {
  disciplineCounts: Record<string, number>;
  prototypes: FeaturedPrototype[];
  logs: FeaturedLog[];
  monographs: FeaturedMonograph[];
  graph: {
    prototypes: { id: string; codeName: string; discipline: string; linkedPatent: string | null }[];
    patents: { id: string; primaryDiscipline: string }[];
    failures: { id: string; projectCode: string }[];
    sites: { id: string; codename: string }[];
  };
}
export interface BenchPreset {
  id: string;
  codeName: string;
  discipline: string;
  audioProfile: AudioProfile;
}

export const archiveStats: ArchiveStats & { operationalYears: string; divisionOf: string } = {
  ...(statsJson as ArchiveStats),
  operationalYears: '2021 – 2026',
  divisionOf: 'Zazie Productions LLC'
};
export const featured = featuredJson as FeaturedData;
export const benchPresets = benchPresetsJson as BenchPreset[];
export const disciplines = disciplinesJson as string[];
export const clearances = clearancesJson as SecurityClearance[];
export const statuses = statusesJson as PrototypeStatus[];
export const facilities = facilitiesJson as string[];

/* ---------- institutional spine (small, statically imported: the SEO graph needs it everywhere) ---------- */
export const departments = departmentsJson as Department[];
export const programs = programsJson as Program[];
export const grants = grantsJson as Grant[];
export const courses = coursesJson as Course[];
export const termSet = termsJson as TermSet;

export interface InstituteIndex {
  facilities: { name: string; slug: string }[];
  disciplineDept: Record<string, string>;
  personnelByName: Record<string, string>;
  /** Personnel id → display name. */
  personnelNames: Record<string, string>;
  departmentWorks: Record<
    string,
    {
      prototypes: string[];
      prototypeCount: number;
      patents: string[];
      patentCount: number;
      monographs: string[];
      monographCount: number;
      failures: string[];
      failureCount: number;
      logCount: number;
      fellowIds: string[];
    }
  >;
  fellowWorks: Record<
    string,
    {
      prototypes: string[];
      patents: string[];
      monographs: string[];
      failures: string[];
      logCount: number;
      leadsProgramIds: string[];
      coProgramIds: string[];
      instructsCourseIds: string[];
    }
  >;
  facilityWorks: Record<
    string,
    { name: string; logCount: number; prototypes: string[]; fellowIds: string[] }
  >;
  counts: {
    divisions: number;
    departments: number;
    programs: number;
    grants: number;
    courses: number;
    courseInstances: number;
    terms: number;
    facilities: number;
  };
}
export const institute = instituteJson as InstituteIndex;

/** Normalises the typographic apostrophes that appear in some personnel names. */
export const normaliseName = (name: string) => name.replace(/[\u2018\u2019\u02BC']/g, "'").trim();

/* ---------- lazy collection loaders (one chunk per collection) ---------- */
const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, loader: () => Promise<{ default: unknown }>): Promise<T> {
  if (!cache.has(key)) cache.set(key, loader().then(m => m.default as T));
  return cache.get(key) as Promise<T>;
}

export const loadPrototypes = () => once<Prototype[]>('prototypes', () => import('./collections/prototypes.json'));
export const loadPatents = () => once<Patent[]>('patents', () => import('./collections/patents.json'));
export const loadLabLogs = () => once<LabLog[]>('labLogs', () => import('./collections/labLogs.json'));
export const loadRevisions = () => once<Revision[]>('revisions', () => import('./collections/revisions.json'));
export const loadMonographs = () => once<Monograph[]>('monographs', () => import('./collections/monographs.json'));
export const loadFailures = () => once<FailedIncident[]>('failures', () => import('./collections/failures.json'));
export const loadPersonnel = () => once<Personnel[]>('personnel', () => import('./collections/personnel.json'));
export const loadFieldSites = () => once<FieldSite[]>('fieldSites', () => import('./collections/fieldSites.json'));

export type RecordType = 'prototype' | 'patent' | 'log' | 'failure' | 'personnel' | 'site';
export type ArchiveRecord = Prototype | Patent | LabLog | FailedIncident | Personnel | FieldSite;

export async function getRecord(type: RecordType, id: string): Promise<ArchiveRecord | undefined> {
  switch (type) {
    case 'prototype': return (await loadPrototypes()).find(p => p.id === id);
    case 'patent': return (await loadPatents()).find(p => p.id === id);
    case 'log': return (await loadLabLogs()).find(l => l.id === id);
    case 'failure': return (await loadFailures()).find(f => f.id === id);
    case 'personnel': return (await loadPersonnel()).find(p => p.id === id);
    case 'site': return (await loadFieldSites()).find(s => s.id === id);
  }
}

/** Canonical URL path for a record (used by links, breadcrumbs, sitemap). */
export const RECORD_BASE: Record<RecordType, string> = {
  prototype: '/prototypes',
  patent: '/patents',
  log: '/research-notes',
  failure: '/post-mortems',
  personnel: '/fellows',
  site: '/field-stations'
};
export const recordPath = (type: RecordType, id: string) => `${RECORD_BASE[type]}/${id.toLowerCase()}`;
export const monographPath = (id: string) => `/monographs/${id.toLowerCase()}`;

const RECORD_IDS: Record<RecordType, Set<string>> = Object.fromEntries(
  Object.entries(recordIdsJson as Record<RecordType, string[]>).map(([k, v]) => [k, new Set(v)])
) as Record<RecordType, Set<string>>;
/** Synchronous existence check for a record id (cross-reference links, sitemap integrity). */
export const hasRecord = (type: RecordType, id: string) => RECORD_IDS[type].has(id);

export interface SearchResults {
  prototypes: Prototype[];
  patents: Patent[];
  logs: LabLog[];
  failures: FailedIncident[];
  personnel: Personnel[];
}

export async function searchArchive(query: string): Promise<SearchResults> {
  const [prototypes, patents, labLogs, failures, personnel] = await Promise.all([
    loadPrototypes(), loadPatents(), loadLabLogs(), loadFailures(), loadPersonnel()
  ]);
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      prototypes: prototypes.slice(0, 6),
      patents: patents.slice(0, 4),
      logs: labLogs.slice(0, 4),
      failures: failures.slice(0, 3),
      personnel: personnel.slice(0, 3)
    };
  }
  const has = (...fields: (string | undefined)[]) => fields.some(f => f && f.toLowerCase().includes(q));
  return {
    prototypes: prototypes.filter(p => has(p.id, p.codeName, p.title, p.discipline, p.abstract, p.technicalSummary)),
    patents: patents.filter(p => has(p.id, p.patentNumber, p.title, p.primaryDiscipline, p.abstract)),
    logs: labLogs.filter(l => has(l.id, l.summary, l.logBody, l.author, l.facility) || l.tags.some(t => t.toLowerCase().includes(q))),
    failures: failures.filter(f => has(f.id, f.projectCode, f.projectTitle, f.summary)),
    personnel: personnel.filter(p => has(p.id, p.name, p.title, p.specialization))
  };
}
