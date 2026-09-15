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

/* =====================================================================
   INSTITUTIONAL SPINE
   Pre-resolved edges for the schema.org entity graph (src/seo/graph.ts).

   Every Person, Place and Department reference in the JSON-LD is resolved
   here, at build time, from the collections themselves. Nothing is guessed:
   if a name or facility string does not resolve, the build fails loudly
   rather than emitting a dangling @id.
   ===================================================================== */

const departments = load('departments');
const programs = load('programs');
const grants = load('grants');
const courses = load('courses');
const terms = load('terms');

/** "Studio A (Anechoic Chamber & Spatial Stage)" -> "studio-a" */
const facilitySlug = (f) =>
  f
    .split('(')[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Person names carry typographic and ASCII apostrophes; normalise before joining. */
const normName = (n) => n.replace(/[\u2018\u2019\u02BC']/g, "'").trim();

const personnelByNorm = new Map(personnel.map((p) => [normName(p.name), p]));
const resolvePerson = (name, context) => {
  const hit = personnelByNorm.get(normName(name));
  if (!hit) throw new Error(`[institute] unresolved person "${name}" (${context})`);
  return hit;
};

const facilities = [...new Set([...personnel.map((p) => p.facilityAssignment), ...labLogs.map((l) => l.facility)])];
const deptById = new Map(departments.map((d) => [d.id, d]));
const deptByDiscipline = new Map(
  departments.filter((d) => d.kind === 'department' && d.discipline).map((d) => [d.discipline, d.id])
);

/* --- referential integrity: fail the build rather than emit a dangling @id --- */
const assertPerson = (id, context) => {
  if (!personnel.some((p) => p.id === id)) throw new Error(`[institute] unknown personnel id "${id}" (${context})`);
};
const assertDept = (id, context) => {
  if (!deptById.has(id)) throw new Error(`[institute] unknown department id "${id}" (${context})`);
};
for (const d of departments) {
  assertPerson(d.headId, `${d.id} head`);
  if (!facilities.includes(d.homeFacility)) {
    throw new Error(`[institute] ${d.id} homeFacility "${d.homeFacility}" is not a known facility`);
  }
  if (d.divisionId) assertDept(d.divisionId, `${d.id} division`);
  for (const sub of d.departmentIds ?? []) assertDept(sub, `${d.id} member`);
}
const programById = new Map(programs.map((p) => [p.id, p]));
for (const p of programs) {
  assertPerson(p.principalInvestigatorId, `${p.id} PI`);
  p.coInvestigatorIds.forEach((c) => assertPerson(c, `${p.id} co-I`));
  assertDept(p.departmentId, `${p.id} department`);
}
for (const g of grants) {
  for (const pid of g.programIds) {
    if (!programById.has(pid)) throw new Error(`[institute] grant ${g.id} funds unknown program "${pid}"`);
  }
}
for (const c of courses) {
  assertPerson(c.instructorId, `${c.id} instructor`);
  assertDept(c.departmentId, `${c.id} department`);
  for (const inst of c.instances) {
    if (inst.facility !== null && !facilities.includes(inst.facility)) {
      throw new Error(`[institute] ${c.id} instance facility "${inst.facility}" is not a known facility`);
    }
  }
}
for (const t of terms.terms) assertDept(t.departmentId, `term ${t.termCode}`);

/* Departmental membership is explicit data, so validate it exhaustively:
   every fellow in exactly one department, and every head inside their own. */
const membership = new Map();
for (const d of departments.filter((x) => x.kind === 'department')) {
  if (!Array.isArray(d.fellowIds) || d.fellowIds.length === 0) {
    throw new Error(`[institute] ${d.id} has no explicit fellowIds`);
  }
  if (!d.fellowIds.includes(d.headId)) {
    throw new Error(`[institute] ${d.id} head ${d.headId} is not listed in its own fellowIds`);
  }
  for (const fid of d.fellowIds) {
    assertPerson(fid, `${d.id} membership`);
    if (membership.has(fid)) {
      throw new Error(`[institute] ${fid} is in both ${membership.get(fid)} and ${d.id}; membership must be unambiguous`);
    }
    membership.set(fid, d.id);
  }
}
for (const p of personnel) {
  if (!membership.has(p.id)) throw new Error(`[institute] fellow ${p.id} is not in any department`);
}

/* --- per-department holdings (capped; full lists stay on the collection hubs) --- */
const CAP = { prototype: 12, patent: 8, monograph: 8, failure: 6 };
const departmentWorks = Object.fromEntries(
  departments
    .filter((d) => d.kind === 'department')
    .map((d) => {
      const dProt = prototypes.filter((p) => p.discipline === d.discipline);
      const dPat = patents.filter((p) => p.primaryDiscipline === d.discipline);
      return [
        d.id,
        {
          prototypes: dProt.slice(0, CAP.prototype).map((p) => p.id),
          prototypeCount: dProt.length,
          patents: dPat.slice(0, CAP.patent).map((p) => p.id),
          patentCount: dPat.length,
          monographs: monographs.slice(0, CAP.monograph).map((m) => m.id),
          monographCount: monographs.length,
          failures: failures.slice(0, CAP.failure).map((f) => f.id),
          failureCount: failures.length,
          logCount: labLogs.filter((l) => {
            const lead = personnelByNorm.get(normName(l.author));
            return lead ? (d.fellowIds ?? []).includes(lead.id) : false;
          }).length,
          fellowIds: d.fellowIds ?? []
        }
      ];
    })
);

/* --- per-fellow authored work, for Person -> CreativeWork back-links --- */
const fellowWorks = Object.fromEntries(
  personnel.map((p) => {
    const mine = (arr, pred) => arr.filter(pred).map((x) => x.id);
    return [
      p.id,
      {
        prototypes: mine(prototypes, (x) => normName(x.leadResearcher) === normName(p.name)),
        patents: mine(patents, (x) => x.inventors.some((i) => normName(i) === normName(p.name))),
        monographs: mine(monographs, (x) =>
          [x.author, ...(x.coAuthors ?? [])].some((a) => normName(a) === normName(p.name))
        ),
        failures: mine(failures, (x) => normName(x.leadInvestigator) === normName(p.name)),
        logCount: labLogs.filter((l) => normName(l.author) === normName(p.name)).length,
        leadsProgramIds: programs.filter((pr) => pr.principalInvestigatorId === p.id).map((pr) => pr.id),
        coProgramIds: programs.filter((pr) => pr.coInvestigatorIds.includes(p.id)).map((pr) => pr.id),
        instructsCourseIds: courses.filter((c) => c.instructorId === p.id).map((c) => c.id)
      }
    ];
  })
);

/* --- facility activity, for Place -> Record back-links --- */
const facilityWorks = Object.fromEntries(
  facilities.map((f) => [
    facilitySlug(f),
    {
      name: f,
      logCount: labLogs.filter((l) => l.facility === f).length,
      prototypes: prototypes.filter((p) => (p.fieldDeployments ?? []).includes(f)).slice(0, 8).map((p) => p.id),
      fellowIds: personnel.filter((p) => p.facilityAssignment === f).map((p) => p.id)
    }
  ])
);

/* --- discipline -> department, and name -> person, lookup tables --- */
const disciplineDept = Object.fromEntries(deptByDiscipline);
const personnelByName = Object.fromEntries([...personnelByNorm].map(([k, v]) => [k, v.id]));

write('institute', {
  facilities: facilities.map((f) => ({ name: f, slug: facilitySlug(f) })),
  disciplineDept,
  personnelByName,
  personnelNames: Object.fromEntries(personnel.map((p) => [p.id, p.name])),
  departmentWorks,
  fellowWorks,
  facilityWorks,
  counts: {
    divisions: departments.filter((d) => d.kind === 'division').length,
    departments: departments.filter((d) => d.kind === 'department').length,
    programs: programs.length,
    grants: grants.length,
    courses: courses.length,
    courseInstances: courses.reduce((n, c) => n + c.instances.length, 0),
    terms: terms.terms.length,
    facilities: facilities.length
  }
});

/* Cross-reference integrity: the collections cite records that may not exist.
   The UI and the JSON-LD both filter these out, but the gap is reported here
   so the underlying content issue stays visible. */
const protIds = new Set(prototypes.map((p) => p.id));
const patIds = new Set(patents.map((p) => p.id));
const logIds = new Set(labLogs.map((l) => l.id));
const unresolved = {
  prototypeToPatent: [...new Set(prototypes.flatMap((p) => p.linkedPatents ?? []))].filter((id) => !patIds.has(id)),
  prototypeToLog: [...new Set(prototypes.flatMap((p) => p.linkedLogs ?? []))].filter((id) => !logIds.has(id)),
  patentToPrototype: [...new Set(patents.flatMap((p) => p.linkedPrototypes ?? []))].filter((id) => !protIds.has(id)),
  logEquipment: [...new Set(labLogs.flatMap((l) => l.equipmentIds ?? []))].filter((id) => !protIds.has(id))
};
for (const [kind, missing] of Object.entries(unresolved)) {
  if (missing.length) {
    console.warn(
      `[build-derived] WARN ${missing.length} unresolved ${kind} cross-reference(s) in source data ` +
        `(filtered from UI and JSON-LD); first: ${missing.slice(0, 3).join(', ')}`
    );
  }
}

console.log(
  `[build-derived] institute spine: ${departments.length} orgs, ${programs.length} programs, ` +
    `${grants.length} grants, ${courses.length} courses, ${terms.terms.length} terms, ${facilities.length} facilities`
);

