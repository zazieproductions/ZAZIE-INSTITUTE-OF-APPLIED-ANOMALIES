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

export interface ArchiveDatabase {
  prototypes: Prototype[];
  patents: Patent[];
  labLogs: LabLog[];
  revisions: Revision[];
  monographs: Monograph[];
  failures: FailedIncident[];
  personnel: Personnel[];
  fieldSites: FieldSite[];
  disciplines: string[];
  clearances: SecurityClearance[];
  statuses: PrototypeStatus[];
  researchers: string[];
  facilities: string[];
}
