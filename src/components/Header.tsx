import React from 'react';
import { Search, Activity, Shield, Terminal, Volume2 } from 'lucide-react';
import { archiveStats } from '../data/archive';

export type TabKey =
  | 'dashboard'
  | 'prototypes'
  | 'patents'
  | 'logs'
  | 'bench'
  | 'spectra'
  | 'infrastructure'
  | 'monographs'
  | 'vault'
  | 'personnel'
  | 'audit';

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
  const tabs: Array<{ key: TabKey; label: string; count?: number; alert?: boolean }> = [
    { key: 'dashboard', label: 'TELEMETRY' },
    { key: 'prototypes', label: 'PROTOTYPES', count: archiveStats.totalPrototypes },
    { key: 'patents', label: 'PATENTS', count: archiveStats.totalPatents },
    { key: 'logs', label: 'LAB LOGS', count: archiveStats.totalLogs },
    { key: 'bench', label: 'TEST BENCH' },
    { key: 'spectra', label: 'SPECTRA//LAB' },
    { key: 'infrastructure', label: 'FIELD SITES', count: archiveStats.totalFieldSites },
    { key: 'monographs', label: 'MONOGRAPHS' },
    { key: 'vault', label: 'BLACK VAULT', count: archiveStats.totalFailures, alert: true },
    { key: 'personnel', label: 'PERSONNEL', count: archiveStats.totalPersonnel },
    { key: 'audit', label: 'AUDIT', count: archiveStats.totalRevisions }
  ];

  return (
    <header className="bg-[#040608] border-b border-emerald-950/80 sticky top-0 z-40 font-mono text-zinc-300">
      {/* Top Banner / Ticker */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2 border-b border-emerald-950/60 text-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="font-bold tracking-widest text-emerald-400 text-sm">
              ZIAA
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-500">|</span>
          <span className="hidden sm:inline text-zinc-400 text-[11px] tracking-wider">
            ZAZIE INSTITUTE OF APPLIED ANOMALIES
          </span>
          <span className="hidden lg:inline px-1.5 py-0.5 rounded text-[9.5px] bg-zinc-900 border border-zinc-800 text-zinc-400">
            R&D // ZAZIE PRODUCTIONS LLC
          </span>
        </div>

        {/* Global Controls & Search */}
        <div className="flex items-center gap-3">
          {isAudioPlaying && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>RF/AUDIO ACTIVE</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-500">
            <span>NETWORK: ENCRYPTED</span>
            <span>·</span>
            <span>CLEARANCE: LEVEL-4</span>
          </div>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1 bg-[#090d12] hover:bg-[#0e141c] border border-emerald-900/60 hover:border-emerald-500/60 text-zinc-300 rounded text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">OMNISearch</span>
            <kbd className="hidden sm:inline text-[9px] bg-zinc-900 px-1 py-0.2 rounded border border-zinc-800 text-zinc-400">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center overflow-x-auto px-2 md:px-4 py-1 gap-1 text-[11px] scrollbar-none bg-[#030507]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 font-medium ${
                isActive
                  ? tab.alert
                    ? 'bg-red-950 text-red-300 border border-red-700 font-bold shadow-sm'
                    : tab.key === 'spectra'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow-sm'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold shadow-sm'
                  : tab.alert
                  ? 'text-red-400/80 hover:text-red-300 hover:bg-red-950/30'
                  : tab.key === 'spectra'
                  ? 'text-cyan-400/90 hover:text-cyan-300 hover:bg-cyan-950/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1 py-0.2 rounded text-[9px] ${
                    isActive
                      ? tab.alert
                        ? 'bg-red-900 text-red-200'
                        : 'bg-emerald-900 text-emerald-200'
                      : 'bg-zinc-900 text-zinc-500'
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
