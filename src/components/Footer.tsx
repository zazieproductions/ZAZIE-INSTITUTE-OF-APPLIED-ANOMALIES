import React from 'react';
import { Shield, Terminal, Radio, Lock } from 'lucide-react';
import { archiveStats } from '../data/archive';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030508] border-t border-emerald-950/80 p-5 font-mono text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ZAZIE INSTITUTE OF APPLIED ANOMALIES (ZIAA)</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Autonomous Acoustic R&D Division of Zazie Productions LLC · Operational Five-Year Record (2021 – 2026)
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">
            128 Prototype Systems · 86 Speculative Patent Dossiers · 264 Lab Logs · 18 Contained Black Vault Incidents
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>CLASSIFICATION: 4-DELTA</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>RUBIDIUM 10MHz ATOMIC SYNC</span>
          </div>
          <div className="text-zinc-600">
            SHA-256 VAULT BUS VERIFIED
          </div>
        </div>
      </div>
    </footer>
  );
};
