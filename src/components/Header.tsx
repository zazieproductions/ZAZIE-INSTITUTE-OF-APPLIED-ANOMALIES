import React, { useState, useEffect } from 'react';
import { Search, Volume2, Clock, Award, Shield } from 'lucide-react';
import { archiveStats } from '../data/archive';
import { InstitutionalCrest } from './InstitutionalCrest';

export type TabKey =
  | 'dashboard'
  | 'prototypes'
  | 'patents'
  | 'logs'
  | 'bench'
  | 'spectra'
  | 'synthesis'
  | 'oculus'
  | 'infrastructure'
  | 'monographs'
  | 'vault'
  | 'audit'
  | 'legal'
  | 'institutional-status'
  | 'disclaimer'
  | 'terms'
  | 'privacy';

interface HeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenSearch: () => void;
  isAudioPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  isAudioPlaying = false
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: Array<{ key: TabKey; label: string; count?: number; alert?: boolean; subtitle?: string; isLegal?: boolean }> = [
    { key: 'dashboard', label: 'OVERVIEW' },
    { key: 'prototypes', label: 'PROTOTYPES', count: archiveStats.totalPrototypes },
    { key: 'patents', label: 'SPECULATIVE PATENTS', count: archiveStats.totalPatents },
    { key: 'logs', label: 'RESEARCH NOTES', count: archiveStats.totalLogs },
    { key: 'monographs', label: 'MONOGRAPHS', count: archiveStats.totalMonographs },
    { key: 'bench', label: 'ACOUSTIC BENCH' },
    { key: 'spectra', label: 'SPECTRA//LAB' },
    { key: 'synthesis', label: 'SYNTHESIS//SIGNAL' },
    { key: 'oculus', label: 'VOID//OCULUS' },
    { key: 'infrastructure', label: 'FIELD STATIONS', count: archiveStats.totalFieldSites },
    { key: 'vault', label: 'ANOMALY POST-MORTEMS', count: archiveStats.totalFailures, alert: true },
    { key: 'audit', label: 'SYSTEM AUDIT', count: archiveStats.totalRevisions },
    { key: 'legal', label: 'DISCLOSURES & LEGAL', isLegal: true }
  ];

  const isLegalActive =
    activeTab === 'legal' ||
    activeTab === 'institutional-status' ||
    activeTab === 'disclaimer' ||
    activeTab === 'terms' ||
    activeTab === 'privacy';

  return (
    <header className="bg-[#03060a] border-b border-[#253245]/70 sticky top-0 z-40 text-zinc-300 shadow-xl shadow-black/50">
      {/* Top Academic Registry Strip */}
      <div className="flex flex-wrap items-center justify-between px-3 md:px-6 py-1.5 bg-[#020407] border-b border-[#1b2533] text-[10.5px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#dfb76c] font-medium tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>ZAZIE INSTITUTE OF APPLIED ANOMALIES</span>
          </span>
          <span className="hidden lg:inline text-zinc-600">|</span>
          <span className="hidden lg:inline text-zinc-300">
            CREATIVE-TECHNOLOGY INITIATIVE · SPECULATIVE ENGINEERING & EXPERIMENTAL AUDIO
          </span>
          <span className="hidden xl:inline text-zinc-600">|</span>
          <button
            onClick={() => onSelectTab('institutional-status')}
            className="hidden xl:inline text-zinc-400 hover:text-[#dfb76c] transition-colors underline decoration-zinc-700 font-mono"
            title="View Institutional Status Notice"
          >
            NOT ACCREDITED / EXPERIMENTAL R&D
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          {isAudioPlaying && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>AUDIO ENGINE ACTIVE</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3 h-3 text-[#dfb76c]" />
            <span>{currentTime || '2026-09-14 20:58:00 UTC'}</span>
          </div>

          <span className="hidden sm:inline text-zinc-600">·</span>
          <button
            onClick={() => onSelectTab('legal')}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0b1320] hover:bg-[#142338] border border-[#23354d] hover:border-[#dfb76c] text-[#dfb76c] font-semibold transition-colors"
            title="View Institutional Disclosures & Guardrails"
          >
            <Shield className="w-3 h-3 text-[#dfb76c]" />
            <span>DISCLOSURES</span>
          </button>
        </div>
      </div>

      {/* Main Prestigious Masthead */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-[#1f2b3c]/60 bg-gradient-to-r from-[#03060a] via-[#050a12] to-[#03060a]">
        {/* Heraldry and Title */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="relative group">
            <InstitutionalCrest size={46} variant="gold" className="transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full blur-sm pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-wide text-white font-serif">
                ZAZIE INSTITUTE OF APPLIED ANOMALIES
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#dfb76c] bg-[#161309] border border-[#8c6d31]/60 rounded">
                CREATIVE TECH LAB
              </span>
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-2 font-serif">
              <span>Research Division of Zazie Productions LLC</span>
              <span className="text-zinc-600">·</span>
              <span className="hidden md:inline italic text-[#c5a059]">Applied Anomalies, Audio Technology & Speculative Systems</span>
              <span className="text-zinc-600 hidden md:inline">·</span>
              <span className="text-emerald-400/90 font-mono text-[10.5px]">Archive Cycle (2021–2026)</span>
            </div>
          </div>
        </div>

        {/* Global Controls & OMNISearch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#070e17] hover:bg-[#0c1827] border border-[#2b3e58] hover:border-[#dfb76c]/80 text-zinc-200 rounded-md text-xs transition-all shadow-md group"
          >
            <Search className="w-3.5 h-3.5 text-[#dfb76c] group-hover:scale-110 transition-transform" />
            <span className="font-serif tracking-wider">Archive Search</span>
            <kbd className="hidden sm:inline text-[9.5px] bg-[#020509] px-1.5 py-0.5 rounded border border-[#1e2e42] text-zinc-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Primary Scholarly Tabs Navigation */}
      <nav className="flex items-center overflow-x-auto px-2 md:px-5 py-1 gap-1 text-[11.5px] scrollbar-none bg-[#020407]">
        {tabs.map(tab => {
          const isActive = tab.isLegal ? isLegalActive : activeTab === tab.key;
          const isSynthesis = tab.key === 'synthesis';
          const isSpectra = tab.key === 'spectra';
          const isOculus = tab.key === 'oculus';
          const isLegal = tab.isLegal;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-2 font-serif tracking-wider ${
                isActive
                  ? tab.alert
                    ? 'bg-red-950/80 text-red-200 border-b-2 border-red-500 font-bold shadow-sm'
                    : isSynthesis
                    ? 'bg-[#0a1214] text-[#00ffcc] border-b-2 border-[#00ffcc] font-bold shadow-[0_0_12px_rgba(0,255,204,0.25)]'
                    : isOculus
                    ? 'bg-violet-950/80 text-violet-200 border-b-2 border-violet-400 font-bold shadow-sm'
                    : isSpectra
                    ? 'bg-cyan-950/80 text-cyan-200 border-b-2 border-cyan-400 font-bold shadow-sm'
                    : isLegal
                    ? 'bg-[#181d29] text-[#e0b96e] border-b-2 border-[#dfb76c] font-bold shadow-sm'
                    : 'bg-[#121926] text-[#dfb76c] border-b-2 border-[#dfb76c] font-bold shadow-sm'
                  : tab.alert
                  ? 'text-red-400/80 hover:text-red-200 hover:bg-red-950/30'
                  : isSynthesis
                  ? 'text-[#00ffcc]/70 hover:text-[#00ffcc] hover:bg-[#00ffcc]/10 border border-transparent hover:border-[#00ffcc]/30'
                  : isOculus
                  ? 'text-violet-400/80 hover:text-violet-200 hover:bg-violet-950/30'
                  : isSpectra
                  ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/30'
                  : isLegal
                  ? 'text-zinc-400 hover:text-[#dfb76c] hover:bg-[#0d1420]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#090f17]'
              }`}
            >
              {isLegal && <Shield className="w-3 h-3 text-[#dfb76c]" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive
                      ? tab.alert
                        ? 'bg-red-900 text-red-200'
                        : 'bg-[#251e0e] text-[#f5d78e] border border-[#8c6d31]/50'
                      : 'bg-[#090f17] text-zinc-500 border border-[#162233]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
