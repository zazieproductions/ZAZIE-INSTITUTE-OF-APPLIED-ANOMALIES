import React from 'react';
import { Shield, Radio, Lock, Award, Scale, AlertTriangle } from 'lucide-react';
import { archiveStats } from '../data/archive';
import { InstitutionalCrest } from './InstitutionalCrest';

interface FooterProps {
  onNavigateLegal?: (section: 'status' | 'disclaimer' | 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateLegal }) => {
  const handleLegalClick = (e: React.MouseEvent, section: 'status' | 'disclaimer' | 'terms' | 'privacy', hash: string) => {
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(section);
    } else {
      window.location.hash = hash;
    }
  };

  return (
    <footer className="bg-[#020407] border-t border-[#1b2533] p-6 md:p-8 text-zinc-400 text-xs font-serif shadow-inner">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Upper Row: Emblem & Mission */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-[#141d29] pb-6">
          <div className="flex items-center gap-4">
            <InstitutionalCrest size={52} variant="gold" />
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                <span>ZAZIE INSTITUTE OF APPLIED ANOMALIES (ZIAA)</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#161309] border border-[#8c6d31] text-[#dfb76c]">
                  EST. 2021
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Creative-Technology Initiative & Speculative Engineering Division of <strong>Zazie Productions LLC</strong>
              </div>
              <div className="text-xs text-[#c5a059] italic mt-0.5">
                "Applied Anomalies · Experimental Systems · Audio Technology · Computational Creativity"
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-[#dfb76c]" />
              <span>ARCHIVE STATUS: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-cyan-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>OPEN SOUND CONTROL / DANTE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-emerald-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SYSTEM LEDGER VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Institutional Holdings & Counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-[#141d29] pb-6">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
              CURATED ARCHIVAL HOLDINGS
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Permanent repository maintaining <strong className="text-zinc-200">{archiveStats.totalPrototypes} Prototype Systems</strong>,{' '}
              <strong className="text-zinc-200">{archiveStats.totalPatents} Speculative Patents</strong>,{' '}
              <strong className="text-zinc-200">{archiveStats.totalLogs} Research Notes</strong>, and{' '}
              <strong className="text-zinc-200">{archiveStats.totalMonographs} Working Monographs</strong>.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
              RESEARCH INITIATIVE FOCUS
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Dedicated to applied anomalies, physical computing, modular audio technology, computational creativity, 
              and interdisciplinary invention across software and hardware.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
              OPEN RESEARCH & ARCHIVE ACCESS
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Open research archive for creative technologists, sound artists, acoustic engineers, and speculative designers. 
              Direct inquiries to the Directorate of Research, Zazie Productions LLC.
            </p>
          </div>
        </div>

        {/* SUBTLE BUT HIGHLY READABLE INSTITUTIONAL & LEGAL DISCLAIMER BOX */}
        <div className="bg-[#05080e] border border-[#1b2a3c] rounded-xl p-4 md:p-5 space-y-3.5 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#131f2d] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#dfb76c]" />
              <span>Institutional Status Notice & Research Disclaimers</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              MANDATORY PUBLIC DISCLOSURE · ZAZIE PRODUCTIONS LLC
            </span>
          </div>

          <p className="text-[11.5px] text-zinc-300 leading-relaxed">
            The <strong>Zazie Institute of Applied Anomalies (ZIAA)</strong> is an independent experimental and creative 
            research initiative operated as an R&D division of <strong>Zazie Productions LLC</strong>. ZIAA is <strong>not</strong> an 
            accredited university, college, degree-granting academic institution, government body, or standards organization. 
            Archival records, speculative patents, lab logs, and technical monographs encompass <em>experimental research, 
            artistic research, speculative engineering, prototypes, design fiction, fictionalized institutional lore, and 
            Alternate Reality Game (ARG) worldbuilding elements</em>. Unless explicitly certified otherwise, materials are not 
            peer-reviewed academic findings, issued governmental patents, or professional engineering certifications. All internal project 
            codes (<code className="text-cyan-300 font-mono text-[10.5px]">PROT-*</code>), patent serials (<code className="text-cyan-300 font-mono text-[10.5px]">PAT-*</code>), 
            and technical memoranda represent ZIAA’s own internal classifications.
          </p>

          {/* Quick Nav Links to 4 Legal Pages */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-[#131f2d] text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Legal & Disclosures:
            </span>

            <a
              href="#institutional-status"
              onClick={e => handleLegalClick(e, 'status', '#institutional-status')}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-[#dfb76c] transition-colors group"
            >
              <Award className="w-3.5 h-3.5 text-[#dfb76c] group-hover:scale-110 transition-transform" />
              <span className="underline decoration-zinc-600 hover:decoration-[#dfb76c]">Institutional Status Notice</span>
            </a>

            <a
              href="#disclaimer"
              onClick={e => handleLegalClick(e, 'disclaimer', '#disclaimer')}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors group"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-zinc-600 hover:decoration-amber-400">Research & Speculation Disclaimer</span>
            </a>

            <a
              href="#terms"
              onClick={e => handleLegalClick(e, 'terms', '#terms')}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-cyan-400 transition-colors group"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-zinc-600 hover:decoration-cyan-400">Terms of Use</span>
            </a>

            <a
              href="#privacy"
              onClick={e => handleLegalClick(e, 'privacy', '#privacy')}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 transition-colors group"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-zinc-600 hover:decoration-emerald-400">Privacy Policy</span>
            </a>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <div>
            © 2021–2026 Zazie Institute of Applied Anomalies. R&D Division of Zazie Productions LLC. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span title="Internal digital art archival cataloging identifier">INTERNAL DOI: 10.1088/ZIAA</span>
            <span>·</span>
            <span title="Simulated institutional publication catalog series">INTERNAL ISSN: 2834-9180</span>
            <span>·</span>
            <span>METADATA PROTOCOL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
