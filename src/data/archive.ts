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

// Synthetic integration for SYNTHESIS-SIGNAL external prototype recovery
const synthesisSignalPrototype: Prototype = {
  id: 'PROT-161',
  codeName: 'SYNTHESIS-SIGNAL',
  title: 'Browser-Based Audiovisual Signal Laboratory with FFT-Driven Three.js Geometry',
  discipline: 'Computational Creativity',
  year: 2026,
  status: 'ACTIVE_BENCH',
  clearance: '2-BETA',
  leadResearcher: 'Zazie Productions R&D',
  abstract: 'Browser-based audiovisual instrument that transforms uploaded audio into reactive 3D composition, live spectral analysis, and oscilloscope visualization. Combines Web Audio API with Three.js to create a creative-technology interface inspired by modular synthesis, node-based media systems, and professional audiovisual software.',
  technicalSummary: 'SYNTHESIS-SIGNAL implements 2048-point FFT analysis, procedural torus-knot geometry with audio-responsive vertex displacement, 3000-particle field with bass/mid/treble color mapping, frequency spectrum analyzer, time-domain oscilloscope, transport controls, visual parameter controls for geometric complexity and displacement, node-editor-inspired interface with project hierarchy and modulation routing, and performance readouts. Single-file deployable architecture for GitHub Pages compatibility. Integrated into ZIAA as interactive laboratory module with React + Three.js ES modules.',
  dimensions: 'Browser viewport • Responsive grid: 280px + 1fr + 320px / 40px + canvas + 240px',
  powerConsumption: 'WebGL2 + WebAudio • GPU accelerated • ~12-35% CPU simulated',
  operationalBandwidth: '20 Hz – 20 kHz (FFT 2048 bins)',
  signalToNoise: 'Local processing only • No server transmission',
  primaryTransducer: 'File input (MP3/WAV) → Web Audio AnalyserNode → Three.js BufferGeometry',
  computationalCore: 'Three.js r128 → three@latest, Web Audio API, Canvas 2D, Tailwind CSS',
  interfaceProtocols: [
    'Web Audio API (AnalyserNode)',
    'Three.js WebGLRenderer',
    'Canvas 2D Spectrum & Oscilloscope',
    'File API (AudioBuffer decoding)'
  ],
  billOfMaterials: [
    {
      item: 'TorusKnotGeometry Wireframe Module',
      supplier: 'Three.js',
      partNumber: 'THREE-TORUS-KNOT-150-16',
      tolerance: '±0.01 displacement'
    },
    {
      item: 'Particle Field System',
      supplier: 'ZIAA Integration',
      partNumber: 'ZIAA-PART-3000-ADDITIVE',
      tolerance: '3,000 particles spherical distribution'
    },
    {
      item: '2048-Point FFT Analyzer',
      supplier: 'Web Audio API',
      partNumber: 'ANALYSER-2048-SMOOTH-0.85',
      tolerance: 'Bass/Mid/Treble band averaging'
    },
    {
      item: 'Modulation Matrix Interface',
      supplier: 'ZIAA Frontend',
      partNumber: 'MATRIX-8x4-32-ROUTES',
      tolerance: 'Interactive toggle'
    }
  ],
  schematicType: 'signal-flow',
  audioProfile: {
    presetName: 'SYNTHESIS-SIGNAL // REACTIVE LAB PROFILE',
    carrierFreq: 220,
    modFreq: 4.2,
    waveform: 'sine',
    filterType: 'bandpass',
    filterCutoff: 1200,
    resonance: 6.5,
    noiseLevel: 0.18,
    binauralDelta: 2.5,
    harmonicScatter: 0.55,
    description: 'FFT-driven audiovisual profile: bass drives displacement, mid drives rotation, treble drives hue.'
  },
  linkedPatents: [],
  linkedLogs: [],
  fieldDeployments: ['SPECTRA//LAB Workstation', 'Acoustic Bench', 'SYNTHESIS//SIGNAL Dedicated Tab'],
  hazardWarnings: [
    'High-frequency visual strobing possible with extreme displacement settings.',
    'Audio file decoding uses local memory - large files may impact performance.'
  ],
  revisionCount: 3
};

const basePrototypes = archiveData.prototypes as Prototype[];
export const prototypes: Prototype[] = basePrototypes.some(p => p.id === 'PROT-161') 
  ? basePrototypes 
  : [...basePrototypes, synthesisSignalPrototype];

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
