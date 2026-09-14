import React from 'react';
import { Shield, Terminal, Radio, Lock, Award, BookOpen, ExternalLink, Globe } from 'lucide-react';
import { archiveStats } from '../data/archive';
import { InstitutionalCrest } from './InstitutionalCrest';

export const Footer: React.FC = () => {
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
                A creative-technology workshop for experimental audio, speculative instruments &amp; interdisciplinary invention — a division of <strong>Zazie Productions LLC</strong>
              </div>
              <div className="text-xs text-[#c5a059] italic mt-0.5">
                "Auditus Inauditi · Veritas Occultorum" — Hearing the Unheard, Disclosing the Hidden
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-[#dfb76c]" />
              <span>CLASSIFICATION: 4-DELTA</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-zinc-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>RUBIDIUM 10MHz ATOMIC SYNC</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#070d14] border border-[#1b2c40] text-zinc-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHA-256 VAULT BUS VERIFIED</span>
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
              Permanent collection of <strong className="text-zinc-200">{archiveStats.totalPrototypes} working prototypes</strong>,{' '}
              <strong className="text-zinc-200">{archiveStats.totalPatents} speculative patents</strong>,{' '}
              <strong className="text-zinc-200">{archiveStats.totalLogs} research notes &amp; lab journals</strong>, and{' '}
              <strong className="text-zinc-200">{archiveStats.totalMonographs} peer-reviewed essays &amp; monographs</strong>.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
              LINES OF INQUIRY
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Experimental audio, computational creativity, speculative engineering, site-specific installations, esoteric software, 
              and generative systems. Field recordings stream over open audio networks from observatories on three continents.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
              ARCHIVE ACCESS
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Open to fellow artists, researchers, and curious builders by inquiry. Write to the Office of the Registrar, ZIAA Brussels / Salton Sink.
            </p>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <div>
            © 2021–2026 Zazie Institute of Applied Anomalies. R&D Division of Zazie Productions LLC.
          </div>
          <div className="flex items-center gap-4">
            <span>DOI: 10.1088/ZIAA</span>
            <span>·</span>
            <span>ISSN: 2834-9180</span>
            <span>·</span>
            <span>PERMANENT ARCHIVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
