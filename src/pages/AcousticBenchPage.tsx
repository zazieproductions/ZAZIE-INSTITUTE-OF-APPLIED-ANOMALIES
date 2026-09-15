import React, { useState } from 'react';
import { AcousticBench } from '../components/AcousticBench';
import { SpectraLabConsole } from '../components/SpectraLabConsole';
import { SynthesisSignalLab } from '../components/SynthesisSignalLab';
import { StatusBadge } from '../components/StatusBadge';
import { Activity, Zap, Layers, Sparkles, Box } from 'lucide-react';

export const AcousticBenchPage: React.FC = () => {
  const [activeWorkstation, setActiveWorkstation] = useState<'bench' | 'spectra' | 'synthesis'>('bench');

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header with Workstation Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-wider">
              INTERACTIVE DSP ACOUSTIC WORKSTATIONS
            </h1>
            <StatusBadge label="Operational" size="xs" />
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Real-time DSP synthesis engines, acoustic oscilloscope profiling, harmonic analysis, and interactive parameter modulation.
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
            <span>ACOUSTIC BENCH</span>
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
            <span>SPECTRA//LAB</span>
          </button>
          <button
            onClick={() => setActiveWorkstation('synthesis')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeWorkstation === 'synthesis'
                ? 'bg-[#00ffcc] text-black shadow-[0_0_12px_rgba(0,255,204,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>SYNTHESIS//SIGNAL</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Render */}
      {activeWorkstation === 'bench' ? (
        <div className="space-y-4">
          <AcousticBench />
        </div>
      ) : activeWorkstation === 'spectra' ? (
        <div className="space-y-4">
          <SpectraLabConsole />
        </div>
      ) : (
        <div className="space-y-4">
          <SynthesisSignalLab />
        </div>
      )}
    </div>
  );
};
