import { archiveStats } from '../data/archive';

export interface NavItem {
  to: string;
  label: string;
  count?: number;
  tone?: 'default' | 'alert' | 'cyan' | 'violet' | 'signal';
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'OVERVIEW' },
  { to: '/prototypes', label: 'PROTOTYPES', count: archiveStats.totalPrototypes },
  { to: '/patents', label: 'SPECULATIVE PATENTS', count: archiveStats.totalPatents },
  { to: '/research-notes', label: 'RESEARCH NOTES', count: archiveStats.totalLogs },
  { to: '/monographs', label: 'MONOGRAPHS', count: archiveStats.totalMonographs },
  { to: '/acoustic-bench', label: 'ACOUSTIC BENCH' },
  { to: '/spectra-lab', label: 'SPECTRA//LAB', tone: 'cyan' },
  { to: '/void-oculus', label: 'VOID//OCULUS', tone: 'violet' },
  { to: '/synthesis-signal', label: 'SYNTHESIS//SIGNAL', tone: 'signal' },
  { to: '/field-stations', label: 'FIELD STATIONS', count: archiveStats.totalFieldSites },
  { to: '/post-mortems', label: 'ANOMALY POST-MORTEMS', count: archiveStats.totalFailures, tone: 'alert' },
  { to: '/fellows', label: 'FELLOWS & INVENTORS', count: archiveStats.totalPersonnel },
  { to: '/system-audit', label: 'SYSTEM AUDIT', count: archiveStats.totalRevisions },
  { to: '/about', label: 'ABOUT ZIAA' }
];

