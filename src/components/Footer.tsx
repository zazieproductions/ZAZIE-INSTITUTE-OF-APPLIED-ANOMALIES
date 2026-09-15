import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Radio, Lock, Mail } from 'lucide-react';
import { archiveStats } from '../data/archive';
import { InstitutionalCrest } from './InstitutionalCrest';
import { ENTITY } from '../seo/site';

const ARCHIVE_LINKS = [
  { to: '/prototypes', label: `Prototypes (${archiveStats.totalPrototypes})` },
  { to: '/patents', label: `Speculative Patents (${archiveStats.totalPatents})` },
  { to: '/research-notes', label: `Research Notes (${archiveStats.totalLogs})` },
  { to: '/monographs', label: `Monographs (${archiveStats.totalMonographs})` },
  { to: '/post-mortems', label: `Anomaly Post-Mortems (${archiveStats.totalFailures})` },
  { to: '/system-audit', label: `System Audit Ledger (${archiveStats.totalRevisions})` }
];
const INSTITUTE_LINKS = [
  { to: '/about', label: 'About the Institute' },
  { to: '/fellows', label: `Fellows & Inventors (${archiveStats.totalPersonnel})` },
  { to: '/field-stations', label: `Field Stations (${archiveStats.totalFieldSites})` },
  { to: '/search', label: 'Archive Search' }
];
const TOOL_LINKS = [
  { to: '/acoustic-bench', label: 'Acoustic Bench (Web Audio DSP)' },
  { to: '/spectra-lab', label: 'SPECTRA//LAB Audiovisual Console' },
  { to: '/void-oculus', label: 'VOID//OCULUS Spatial Canvas' },
  { to: '/synthesis-signal', label: 'SYNTHESIS//SIGNAL Audio-Reactive 3D' }
];
const LEGAL_LINKS = [
  { to: '/legal/institutional-status', label: 'Institutional Status' },
  { to: '/legal/disclaimer', label: 'Research & Speculation Disclaimer' },
  { to: '/legal/terms', label: 'Terms of Use' },
  { to: '/legal/privacy', label: 'Privacy Policy' }
];

const LinkColumn: React.FC<{ title: string; links: { to: string; label: string }[] }> = ({ title, links }) => (
  <nav aria-label={title}>
    <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">{title}</h2>
    <ul className="space-y-1.5">
      {links.map(l => (
        <li key={l.to}>
          <Link to={l.to} className="text-zinc-300 hover:text-white hover:underline underline-offset-2 transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020407] border-t border-[#1b2533] p-6 md:p-8 text-zinc-400 text-xs font-serif shadow-inner">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Emblem & mission */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-[#141d29] pb-6">
          <div className="flex items-center gap-4">
            <InstitutionalCrest size={52} variant="gold" />
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                <span>{ENTITY.name.toUpperCase()} ({ENTITY.abbreviation})</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#161309] border border-[#8c6d31] text-[#dfb76c]">
                  EST. {ENTITY.founded}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Independent interdisciplinary research &amp; creative-technology initiative · a research division of{' '}
                <strong className="text-zinc-200">{ENTITY.legalParent}</strong>
              </p>
              <p className="text-xs text-[#c5a059] italic mt-0.5">“{ENTITY.tagline}”</p>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-3 text-xs font-mono" aria-label="Archive status">
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" />
              <span>ARCHIVE STATUS: ACTIVE</span>
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-cyan-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>OPEN SOUND CONTROL / DANTE</span>
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-emerald-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>SYSTEM LEDGER VERIFIED</span>
            </li>
          </ul>
        </div>

        {/* Site map & focus */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs border-b border-[#141d29] pb-6">
          <LinkColumn title="Archive Holdings" links={ARCHIVE_LINKS} />
          <LinkColumn title="Institute" links={INSTITUTE_LINKS} />
          <LinkColumn title="Interactive Instruments" links={TOOL_LINKS} />
          <div>
            <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">Research Focus</h2>
            <p className="text-zinc-300 leading-relaxed">
              Applied anomalies, experimental audio systems, computational creativity, speculative engineering,
              creative tools, prototypes, software and interdisciplinary invention — documented as an open research
              archive for creative technologists, sound artists, acoustic engineers and speculative designers.
            </p>
            <a
              href={`mailto:${ENTITY.email}`}
              className="mt-2 inline-flex items-center gap-1.5 text-[#dfb76c] hover:text-white font-mono text-[11px]"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              {ENTITY.email}
            </a>
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <p>
            © {ENTITY.founded}–2026 {ENTITY.name}. A research division of {ENTITY.legalParent}.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="text-zinc-300 hover:text-white hover:underline underline-offset-2">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-4xl">
          {ENTITY.abbreviation} is an independent research and creative-technology initiative and is not an accredited
          university, government agency or standards body. Archive records document experimental research, artistic
          research, speculative engineering and design fiction; speculative patents are internal disclosures, not issued
          patents. See the <Link to="/legal/disclaimer" className="text-[#dfb76c] hover:underline">full disclaimer</Link>.
        </p>
      </div>
    </footer>
  );
};
