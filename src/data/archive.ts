import rawData from './archiveData.json';
import {
  ArchiveDatabase,
  Prototype,
  Patent,
  LabLog,
  Revision,
  Monograph,
  FailedIncident,
  Personnel,
  FieldSite
} from './types';

export const archiveData = rawData as unknown as ArchiveDatabase;

export const prototypes: Prototype[] = archiveData.prototypes;
export const patents: Patent[] = archiveData.patents;
export const labLogs: LabLog[] = archiveData.labLogs;
export const revisions: Revision[] = archiveData.revisions;
export const monographs: Monograph[] = archiveData.monographs;
export const failures: FailedIncident[] = archiveData.failures;
export const personnel: Personnel[] = archiveData.personnel;
export const fieldSites: FieldSite[] = archiveData.fieldSites;

export const disciplines: string[] = archiveData.disciplines;
export const clearances = archiveData.clearances;
export const statuses = archiveData.statuses;
export const researchers = archiveData.researchers;
export const facilities = archiveData.facilities;

export const archiveStats = {
  totalPrototypes: prototypes.length,
  totalPatents: patents.length,
  totalLogs: labLogs.length,
  totalRevisions: revisions.length,
  totalFailures: failures.length,
  totalMonographs: monographs.length,
  totalPersonnel: personnel.length,
  totalFieldSites: fieldSites.length,
  operationalYears: '2021 – 2026',
  divisionOf: 'Zazie Productions LLC'
};

export function getPrototypeById(id: string): Prototype | undefined {
  return prototypes.find(p => p.id === id);
}

export function getPatentById(id: string): Patent | undefined {
  return patents.find(p => p.id === id);
}

export function getLabLogById(id: string): LabLog | undefined {
  return labLogs.find(l => l.id === id);
}

export function getFailureById(id: string): FailedIncident | undefined {
  return failures.find(f => f.id === id);
}

export function getPersonnelById(id: string): Personnel | undefined {
  return personnel.find(p => p.id === id);
}

export function getFieldSiteById(id: string): FieldSite | undefined {
  return fieldSites.find(s => s.id === id);
}

export function getMonographById(id: string): Monograph | undefined {
  return monographs.find(m => m.id === id);
}

export function searchArchive(query: string) {
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

  const matchedPrototypes = prototypes.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.codeName.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q) ||
    p.discipline.toLowerCase().includes(q) ||
    p.abstract.toLowerCase().includes(q) ||
    p.technicalSummary.toLowerCase().includes(q)
  );

  const matchedPatents = patents.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.patentNumber.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q) ||
    p.abstract.toLowerCase().includes(q) ||
    p.primaryDiscipline.toLowerCase().includes(q)
  );

  const matchedLogs = labLogs.filter(l =>
    l.id.toLowerCase().includes(q) ||
    l.summary.toLowerCase().includes(q) ||
    l.tags.some(t => t.toLowerCase().includes(q)) ||
    l.facility.toLowerCase().includes(q)
  );

  const matchedFailures = failures.filter(f =>
    f.id.toLowerCase().includes(q) ||
    f.projectCode.toLowerCase().includes(q) ||
    f.projectTitle.toLowerCase().includes(q) ||
    f.summary.toLowerCase().includes(q)
  );

  const matchedPersonnel = personnel.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q) ||
    p.specialization.toLowerCase().includes(q)
  );

  return {
    prototypes: matchedPrototypes,
    patents: matchedPatents,
    logs: matchedLogs,
    failures: matchedFailures,
    personnel: matchedPersonnel
  };
}
