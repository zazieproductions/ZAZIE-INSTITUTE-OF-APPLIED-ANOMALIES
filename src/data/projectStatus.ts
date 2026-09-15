import { Prototype, Patent, FailedIncident, Monograph, FieldSite, LabLog } from './types';

export type ProjectStatusLabel =
  | 'Operational'
  | 'Prototype'
  | 'Experimental'
  | 'Speculative'
  | 'Artistic Research'
  | 'Design Fiction';

export const ALL_PROJECT_STATUSES: ProjectStatusLabel[] = [
  'Operational',
  'Prototype',
  'Experimental',
  'Speculative',
  'Artistic Research',
  'Design Fiction'
];

export const STATUS_DESCRIPTIONS: Record<ProjectStatusLabel, { description: string; scope: string }> = {
  'Operational': {
    description: 'Active functional system or interactive DSP software currently executable in studio or browser environments.',
    scope: 'Working interactive code, audio engine, or deployed bench hardware.'
  },
  'Prototype': {
    description: 'Physical computing apparatus, benchtop hardware rig, or preliminary software build undergoing active iteration.',
    scope: 'Benchtop proof-of-concept; non-commercial experimental construct.'
  },
  'Experimental': {
    description: 'Empirical bench investigation probing acoustic thresholds, non-linear hysteresis, or signal boundaries.',
    scope: 'Laboratory exploration; non-standard physical or acoustic setup.'
  },
  'Speculative': {
    description: 'Theoretical engineering inquiry, hypothetical transducer topology, or forward-looking architectural concept.',
    scope: 'Conceptual engineering formulation; exploratory thought experiment.'
  },
  'Artistic Research': {
    description: 'Creative practice investigation addressing computational aesthetics, psychoacoustics, or sonic spatialization.',
    scope: 'Interdisciplinary artistic methodology; creative technology inquiry.'
  },
  'Design Fiction': {
    description: 'Diegetic artifact, narrative technological extrapolation, or simulated institutional dossier exploring technological futures.',
    scope: 'Narrative worldbuilding and speculative design artifact.'
  }
};

/**
 * Deterministically resolve the Project Status Label for a Prototype.
 */
export function getPrototypeStatusLabel(p: Prototype): ProjectStatusLabel {
  // Live interactive tools
  if (
    p.id === 'PROT-161' ||
    p.id === 'PROT-001' ||
    p.id === 'PROT-012' ||
    p.id === 'PROT-025' ||
    p.id === 'PROT-038' ||
    p.id === 'PROT-050' ||
    p.id === 'PROT-080' ||
    p.id === 'PROT-100'
  ) {
    return 'Operational';
  }

  if (p.status === 'ARCHIVED_SUPERSEDED') {
    return 'Design Fiction';
  }
  if (p.status === 'CONTAINED_HAZARD') {
    return 'Experimental';
  }

  const num = parseInt(p.id.replace(/[^0-9]/g, '') || '0', 10);

  if (p.discipline === 'Speculative Engineering') {
    return num % 2 === 0 ? 'Speculative' : 'Design Fiction';
  }
  if (p.discipline === 'Computational Creativity') {
    return num % 2 === 0 ? 'Artistic Research' : 'Prototype';
  }
  if (p.discipline === 'Generative Software') {
    return num % 3 === 0 ? 'Operational' : 'Artistic Research';
  }
  if (p.discipline === 'Applied Anomalies') {
    return num % 2 === 0 ? 'Experimental' : 'Prototype';
  }
  if (p.discipline === 'Perceptual Interfaces' || p.discipline === 'Experimental Audio Systems') {
    return num % 4 === 0 ? 'Operational' : 'Prototype';
  }
  if (p.discipline === 'Signal Archaeology') {
    return num % 2 === 0 ? 'Artistic Research' : 'Experimental';
  }
  if (p.discipline === 'Acoustic Architecture') {
    return num % 2 === 0 ? 'Speculative' : 'Experimental';
  }

  return 'Prototype';
}

/**
 * Deterministically resolve status for Patents (speculative technical filings).
 */
export function getPatentStatusLabel(p: Patent): ProjectStatusLabel {
  const num = parseInt(p.id.replace(/[^0-9]/g, '') || '0', 10);
  if (num % 3 === 0) return 'Design Fiction';
  return 'Speculative';
}

/**
 * Deterministically resolve status for Black Vault Failures.
 */
export function getFailureStatusLabel(f: FailedIncident): ProjectStatusLabel {
  const num = parseInt(f.id.replace(/[^0-9]/g, '') || '0', 10);
  return num % 2 === 0 ? 'Design Fiction' : 'Experimental';
}

/**
 * Deterministically resolve status for Monographs.
 */
export function getMonographStatusLabel(m: Monograph): ProjectStatusLabel {
  const num = parseInt(m.id.replace(/[^0-9]/g, '') || '0', 10);
  return num % 2 === 0 ? 'Artistic Research' : 'Speculative';
}

/**
 * Deterministically resolve status for Field Sites.
 */
export function getFieldSiteStatusLabel(s: FieldSite): ProjectStatusLabel {
  const num = parseInt(s.id.replace(/[^0-9]/g, '') || '0', 10);
  if (num % 3 === 0) return 'Operational';
  return num % 2 === 0 ? 'Artistic Research' : 'Experimental';
}

/**
 * Deterministically resolve status for Lab Logs.
 */
export function getLabLogStatusLabel(l: LabLog): ProjectStatusLabel {
  return l.anomalyAlert ? 'Experimental' : 'Artistic Research';
}
