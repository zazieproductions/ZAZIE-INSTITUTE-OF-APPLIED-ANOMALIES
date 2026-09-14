import React, { useState } from 'react';
import { AcousticBench } from '../components/AcousticBench';
import { SpectraLabConsole } from '../components/SpectraLabConsole';
import { Activity, Zap, Layers, Sparkles } from 'lucide-react';

export const AcousticBenchPage: React.FC = () => {
  const [activeWorkstation, setActiveWorkstation] = useState<'bench' | 'spectra'>('bench');

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header with Workstation Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-wider">
              SOUND LAB — INSTRUMENT TEST STATIONS
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Real-time synthesis, audio analysis, and playable prototypes you can audition in the browser.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[#020406] p-1 rounded border border-emerald-950">
          <button
            onClick={() => setActiveWorkstation('bench')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeWorkstation === 'bench'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>TEST BENCH V4.1</span>
          </button>
          <button
            onClick={() => setActiveWorkstation('spectra')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeWorkstation === 'spectra'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SPECTRA//LAB (KAIROS)</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Render */}
      {activeWorkstation === 'bench' ? (
        <div className="space-y-4">
          <AcousticBench />
        </div>
      ) : (
        <div className="space-y-4">
          <SpectraLabConsole />
        </div>
      )}
    </div>
  );
};
