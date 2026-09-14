import React from 'react';
import {
  archiveStats,
  prototypes,
  patents,
  labLogs,
  failures,
  fieldSites,
  facilities
} from '../data/archive';
import { NetworkGraph } from '../components/NetworkGraph';
import { AcousticBench } from '../components/AcousticBench';
import {
  Activity,
  Cpu,
  FileText,
  AlertTriangle,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Radio,
  Clock,
  Terminal,
  Zap
} from 'lucide-react';

interface DashboardProps {
  onSelectTab: (tab: any) => void;
  onSelectRecord: (type: any, id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTab,
  onSelectRecord
}) => {
  const latestLogs = labLogs.slice(0, 5);
  const featuredPrototypes = prototypes.slice(0, 4);
  const recentFailures = failures.slice(0, 3);

  return (
    <div className="space-y-6 font-mono">
      {/* Hero Welcome / Clandestine Lab Dossier Banner */}
      <div className="relative bg-[#05080c] border border-emerald-950/90 rounded-lg p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-bold tracking-widest uppercase">
                ZAZIE INSTITUTE OF APPLIED ANOMALIES // ARCHIVE PORTAL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE CYCLE 2021–2026
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              Autonomous Laboratory for Experimental Acoustics & Speculative Patents
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
              Established in 2021 as the clandestine R&D division of <span className="text-zinc-200">Zazie Productions LLC</span>.
              Investigating non-Hermitian phononics, colloidal ferrofluid transduction, signal archaeology of vitrified ceramics,
              perceptual cranial bone conduction, sub-audible infrasound waveguides, and public listening infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onSelectTab('bench')}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              <span>TEST BENCH AUDIO</span>
            </button>
            <button
              onClick={() => onSelectTab('spectra')}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>SPECTRA//LAB WORKSTATION</span>
            </button>
          </div>
        </div>

        {/* Five-Year Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-emerald-950/70 text-xs">
          <div
            onClick={() => onSelectTab('prototypes')}
            className="p-2.5 bg-[#030508] border border-emerald-950/80 rounded hover:border-emerald-600/60 cursor-pointer transition-colors"
          >
            <div className="text-zinc-500 text-[10px] flex items-center justify-between">
              <span>PROTOTYPES</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">128</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">8 Disciplines</div>
          </div>

          <div
            onClick={() => onSelectTab('patents')}
            className="p-2.5 bg-[#030508] border border-emerald-950/80 rounded hover:border-cyan-600/60 cursor-pointer transition-colors"
          >
            <div className="text-zinc-500 text-[10px] flex items-center justify-between">
              <span>PATENT DOSSIERS</span>
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-1">86</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Speculative Claims</div>
          </div>

          <div
            onClick={() => onSelectTab('logs')}
            className="p-2.5 bg-[#030508] border border-emerald-950/80 rounded hover:border-emerald-600/60 cursor-pointer transition-colors"
          >
            <div className="text-zinc-500 text-[10px] flex items-center justify-between">
              <span>LAB LOGS</span>
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-1">264</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Sensor Telemetry</div>
          </div>

          <div
            onClick={() => onSelectTab('vault')}
            className="p-2.5 bg-[#030508] border border-red-950/80 rounded hover:border-red-600/60 cursor-pointer transition-colors"
          >
            <div className="text-red-400/80 text-[10px] flex items-center justify-between">
              <span>BLACK VAULT</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400 mt-1">18</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Catastrophic Failures</div>
          </div>

          <div
            onClick={() => onSelectTab('infrastructure')}
            className="p-2.5 bg-[#030508] border border-emerald-950/80 rounded hover:border-amber-600/60 cursor-pointer transition-colors"
          >
            <div className="text-zinc-500 text-[10px] flex items-center justify-between">
              <span>FIELD SITES</span>
              <Compass className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">12</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Global Listening</div>
          </div>

          <div
            onClick={() => onSelectTab('audit')}
            className="p-2.5 bg-[#030508] border border-emerald-950/80 rounded hover:border-violet-600/60 cursor-pointer transition-colors"
          >
            <div className="text-zinc-500 text-[10px] flex items-center justify-between">
              <span>AUDIT COMMITS</span>
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-xl font-bold text-violet-400 mt-1">110</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Revision History</div>
          </div>
        </div>
      </div>

      {/* Embedded Test Bench Preview */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span className="font-bold text-emerald-400 tracking-wider">LIVE ACOUSTIC BENCH & SIMULATOR</span>
          <button
            onClick={() => onSelectTab('bench')}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
          >
            <span>Open Dedicated Test Station</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <AcousticBench />
      </div>

      {/* Interactive Taxonomy & Knowledge Graph */}
      <NetworkGraph
        onSelectRecord={(type, id) => onSelectRecord(type, id)}
      />

      {/* Two Column Grid: Featured Prototypes & Latest Lab Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Prototype Systems */}
        <div className="bg-[#05080c] border border-emerald-950/80 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-emerald-950/70 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-emerald-400 text-xs tracking-wider">
                FLAGSHIP ACOUSTIC PROTOTYPES
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('prototypes')}
              className="text-zinc-400 hover:text-emerald-400 text-xs flex items-center gap-1"
            >
              <span>View All 128</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {featuredPrototypes.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectRecord('prototype', p.id)}
                className="p-3 bg-[#030508] border border-emerald-950/70 hover:border-emerald-600/70 rounded cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white group-hover:text-emerald-300">
                      {p.id}: {p.codeName}
                    </span>
                    <div className="text-[11px] text-zinc-300 font-medium mt-0.5">
                      {p.title}
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {p.clearance}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.abstract}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                  <span>BW: <span className="text-cyan-400">{p.operationalBandwidth}</span></span>
                  <span>·</span>
                  <span>LEAD: <span className="text-zinc-400">{p.leadResearcher}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Lab Telemetry Stream */}
        <div className="bg-[#05080c] border border-emerald-950/80 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-emerald-950/70 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-emerald-400 text-xs tracking-wider">
                CHRONOLOGICAL LAB LOG STREAM
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('logs')}
              className="text-zinc-400 hover:text-emerald-400 text-xs flex items-center gap-1"
            >
              <span>View All 264 Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {latestLogs.map(log => (
              <div
                key={log.id}
                onClick={() => onSelectRecord('log', log.id)}
                className="p-3 bg-[#030508] border border-emerald-950/70 hover:border-emerald-600/70 rounded cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-emerald-400 font-bold">{log.id}</span>
                  <span className="text-zinc-500">{log.displayDate}</span>
                </div>
                <div className="text-zinc-200 group-hover:text-emerald-300 font-medium">
                  {log.summary}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-zinc-400">
                  <span className="text-cyan-400">{log.facility}</span>
                  <span>·</span>
                  <span>SPL: {log.telemetry.splDecibels} dB</span>
                  <span>·</span>
                  <span>Flux: {log.telemetry.magneticFluxMicroTesla} μT</span>
                  {log.anomalyAlert && (
                    <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800 rounded font-bold">
                      ANOMALY
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Status Strip */}
      <div className="bg-[#05080c] border border-emerald-950/80 rounded-lg p-4">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">
          INSTITUTIONAL FACILITY STATUS & CONTAINMENT LEVELS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {facilities.slice(0, 4).map((fac, idx) => (
            <div key={idx} className="p-2.5 bg-[#030508] border border-emerald-950 rounded">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">{fac}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">STATUS: OPERATIONAL</div>
              <div className="text-[10px] text-emerald-400/90 mt-0.5">CONTAINMENT: NOMINAL</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
