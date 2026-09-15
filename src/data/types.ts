export type SecurityClearance = '1-ALPHA' | '2-BETA' | '3-GAMMA' | '4-DELTA' | 'BLACK-BOX';

export type PrototypeStatus = 
  | 'ACTIVE_BENCH' 
  | 'FIELD_DEPLOYED' 
  | 'RESTRICTED_EVAL' 
  | 'ARCHIVED_SUPERSEDED' 
  | 'CONTAINED_HAZARD';

export type SchematicType = 
  | 'cross-section' 
  | 'signal-flow' 
  | 'polar-directivity' 
  | 'resonator-cavity' 
  | 'subterranean-array';

export interface AudioProfile {
  presetName: string;
  carrierFreq: number;
  modFreq: number;
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  filterType: 'lowpass' | 'bandpass' | 'notch' | 'highpass';
  filterCutoff: number;
  resonance: number;
  noiseLevel: number;
  binauralDelta: number;
  harmonicScatter: number;
  description: string;
}

export interface BillOfMaterialItem {
  item: string;
  supplier: string;
  partNumber: string;
  tolerance: string;
}

export interface Prototype {
  id: string;
  codeName: string;
  title: string;
  discipline: string;
  year: number;
  status: PrototypeStatus;
  clearance: SecurityClearance;
  leadResearcher: string;
  abstract: string;
  technicalSummary: string;
  dimensions: string;
  powerConsumption: string;
  operationalBandwidth: string;
  signalToNoise: string;
  primaryTransducer: string;
  computationalCore: string;
  interfaceProtocols: string[];
  billOfMaterials: BillOfMaterialItem[];
  schematicType: SchematicType;
  audioProfile: AudioProfile;
  linkedPatents: string[];
  linkedLogs: string[];
  fieldDeployments: string[];
  hazardWarnings: string[];
  revisionCount: number;
}

export interface Patent {
  id: string;
  patentNumber: string;
  title: string;
  filingDate: string;
  status: string;
  primaryDiscipline: string;
  inventors: string[];
  assignee: string;
  abstract: string;
  independentClaims: string[];
  dependentClaims: string[];
  priorArtCritique: string;
  legalCounselMemo: string;
  schematicFocus: string;
  schematicDiagramType: SchematicType;
  linkedPrototypes: string[];
  physicalAnomalies: string[];
}

export interface LogTelemetry {
  ambientTempC: number;
  splDecibels: number;
  relativeHumidityPct: number;
  magneticFluxMicroTesla: number;
  mainsDriftHz: number;
  spectralCoherence: number;
}

export interface LabLog {
  id: string;
  timestamp: string;
  displayDate: string;
  author: string;
  facility: string;
  clearance: SecurityClearance;
  tags: string[];
  telemetry: LogTelemetry;
  summary: string;
  logBody: string;
  equipmentIds: string[];
  anomalyAlert: boolean;
}

export interface Revision {
  commitHash: string;
  timestamp: string;
  author: string;
  targetRecord: string;
  changeType: string;
  message: string;
}

export interface MonographSection {
  heading: string;
  content: string;
}

export interface Monograph {
  id: string;
  title: string;
  author: string;
  coAuthors: string[];
  date: string;
  volume: string;
  abstract: string;
  keyTheorems: string[];
  sections: MonographSection[];
  references?: string[];
  primarySchematic?: string;
}

export interface FailedIncident {
  id: string;
  projectCode: string;
  projectTitle: string;
  year: number;
  leadInvestigator: string;
  hazardClassification: string;
  incidentDate: string;
  summary: string;
  incidentNarrative: string;
  rootCauseAnalysis: string;
  containmentProtocol: string;
  decommissionStatus: string;
  salvagedComponents: string[];
}

export interface Personnel {
  id: string;
  name: string;
  title: string;
  specialization: string;
  clearance: SecurityClearance;
  joinedYear: number;
  facilityAssignment: string;
  biography: string;
  selectedPublications: string[];
  activePrototypesCount: number;
  voiceprintHash: string;
}

export interface FieldSite {
  id: string;
  name: string;
  codename: string;
  location: string;
  coordinates: string;
  establishedYear: number;
  activeStatus: string;
  channelCount: number;
  frequencyRange: string;
  physicalFootprint: string;
  description: string;
  publicAccessProtocol: string;
  instrumentationList: string[];
}

/* ---------- institutional spine (schema.org entity graph) ---------- */

/** A research division or department. `kind` decides which schema.org node it becomes. */
export interface Department {
  id: string;
  kind: 'division' | 'department';
  code: string;
  /** URL-safe identifier; also the fragment used for the node's @id. */
  slug: string;
  name: string;
  alternateName: string;
  /** Set on divisions. */
  departmentIds?: string[];
  /** Set on departments. */
  divisionId?: string;
  /** Maps 1:1 onto a value of `Prototype.discipline`. */
  discipline?: string;
  establishedYear: number;
  /** Personnel id of the department or division head. */
  headId: string;
  /**
   * Explicit departmental membership. Deliberately NOT derived from facility
   * assignment: two departments can share a home facility, and inferring
   * membership from that would assert affiliations the data does not state.
   */
  fellowIds?: string[];
  homeFacility: string;
  mission: string;
  focusAreas: string[];
}

export type GrantStatus = 'ACTIVE' | 'CLOSED_REPORTED';
export type FunderKind = 'parent' | 'endowment' | 'reserve' | 'discretionary';

/**
 * An internal funding allocation. Modelled as schema.org MonetaryGrant.
 * Funders are deliberately internal to the Institute and its parent company;
 * no external or real-world funding body is asserted.
 */
export interface Grant {
  id: string;
  code: string;
  name: string;
  funderName: string;
  funderKind: FunderKind;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: GrantStatus;
  description: string;
  programIds: string[];
}

export type ProgramStatus = 'ACTIVE' | 'COMPLETED' | 'WINDING_DOWN' | 'SUSPENDED';

/** A research programme. Modelled as schema.org ResearchProject. */
export interface Program {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  principalInvestigatorId: string;
  coInvestigatorIds: string[];
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  description: string;
  keywords: string[];
  /** Record collections this programme is expected to produce. */
  outputTypes: string[];
}

export interface CourseInstanceData {
  startDate: string;
  endDate: string;
  courseMode: 'onsite' | 'online' | 'blended';
  /** Null for fully online delivery. */
  facility: string | null;
  /** ISO 8601 duration, e.g. "PT16H". */
  workload: string;
}

export interface SyllabusSection {
  name: string;
  description: string;
}

/**
 * An internal, non-accredited seminar. Modelled as schema.org Course.
 * `educationalCredentialAwarded` is intentionally never set: the Institute
 * is non-accredited and awards no credentials (see /legal/institutional-status).
 */
export interface Course {
  id: string;
  courseCode: string;
  title: string;
  departmentId: string;
  instructorId: string;
  educationalLevel: string;
  timeRequired: string;
  occupationalCategory: string;
  description: string;
  prerequisites: string[];
  teaches: string[];
  assesses: string[];
  syllabusSections: SyllabusSection[];
  instances: CourseInstanceData[];
}

export interface DefinedTermEntry {
  termCode: string;
  name: string;
  departmentId: string;
  description: string;
}

/** The Institute's controlled vocabulary, plus its terms. */
export interface TermSet {
  id: string;
  code: string;
  name: string;
  alternateName: string;
  description: string;
  inLanguage: string;
  terms: DefinedTermEntry[];
}

export interface ArchiveDatabase {
  prototypes: Prototype[];
  patents: Patent[];
  labLogs: LabLog[];
  revisions: Revision[];
  monographs: Monograph[];
  failures: FailedIncident[];
  personnel: Personnel[];
  fieldSites: FieldSite[];
  departments: Department[];
  programs: Program[];
  grants: Grant[];
  courses: Course[];
  terms: TermSet;
  disciplines: string[];
  clearances: SecurityClearance[];
  statuses: PrototypeStatus[];
  researchers: string[];
  facilities: string[];
}
