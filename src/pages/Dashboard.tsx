import React from 'react';
import {
  archiveStats,
  prototypes,
  patents,
  labLogs,
  failures,
  fieldSites,
  facilities,
  disciplines,
  personnel,
  monographs
} from '../data/archive';
import { NetworkGraph } from '../components/NetworkGraph';
import { AcousticBench } from '../components/AcousticBench';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
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
  Zap,
  Award,
  BookOpen,
  Users,
  MapPin,
  CheckCircle2,
  ExternalLink
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
  const featuredMonographs = monographs.slice(0, 3);

  const disciplineSummaries: Record<string, string> = {
    'Applied Anomalies': 'Nonlinear acoustic feedback, physical hysteresis, room boundary reflections, and perceptual edge cases.',
    'Experimental Audio Systems': 'Custom analog/digital synthesis hardware, wave-terrain modeling, physical resonators, and reactive audio devices.',
    'Computational Creativity': 'Autonomous musical agents, real-time procedural scores, neural audio resynthesis, and generative polyphony.',
    'Speculative Engineering': 'Design fiction hardware, multi-head tape transports, kinetic percussion automata, and experimental lutherie.',
    'Perceptual Interfaces': 'Tactile acoustic floor arrays, motorized haptic controllers, spatial gesture tracking, and microtonal touch surfaces.',
    'Generative Software': 'Low-latency DSP audio worklets, ambisonic spatialization engines, WebAssembly tools, and live-coding systems.',
    'Signal Archaeology': 'Non-contact optical laser scanning of historical records, magnetic media recovery, and atmospheric VLF listening.',
    'Acoustic Architecture': 'Multichannel spatial speaker domes, subterranean resonant vaults, site-specific sound installations, and field stations.'
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Hero Welcome / Prestigious Research Directorate Banner */}
      <div className="relative bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 overflow-hidden shadow-2xl">
        {/* Background Subtle Watermark Crest */}
        <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none">
          <InstitutionalCrest size={380} variant="gold" />
        </div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="archival-stamp font-mono text-[9.5px]">
                CREATIVE-TECHNOLOGY INITIATIVE // ARCHIVE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#162233] text-cyan-300 border border-cyan-800/60">
                RESEARCH CYCLE 2021–2026
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                DSP BENCH & AUDIO ENGINE ONLINE
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Creative-Technology Initiative for Applied Anomalies & Speculative Systems
            </h1>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              Official research archives of the <strong className="text-white font-semibold">Zazie Institute of Applied Anomalies (ZIAA)</strong>. 
              Founded in 2021 as the interdisciplinary creative-technology and speculative engineering division of 
              <span className="text-[#dfb76c] font-medium"> Zazie Productions LLC</span>, the Institute develops experimental sound systems, 
              tangible perceptual interfaces, computational creativity software, and site-specific acoustic instruments.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('monographs')}
                className="px-4 py-2 bg-[#dfb76c] hover:bg-[#ebd097] text-[#05080f] font-bold text-xs rounded transition-all shadow-md flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Working Monographs</span>
              </button>
              <button
                onClick={() => onSelectTab('prototypes')}
                className="px-4 py-2 bg-[#091322] hover:bg-[#0f1d33] border border-[#3b5373] text-zinc-200 font-bold text-xs rounded transition-all flex items-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explore {archiveStats.totalPrototypes} Prototypes</span>
              </button>
              <button
                onClick={() => onSelectTab('bench')}
                className="px-4 py-2 bg-[#0d1f18] hover:bg-[#142e24] border border-emerald-700/80 text-emerald-300 font-bold text-xs rounded transition-all flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>DSP Acoustic Test Bench</span>
              </button>
            </div>
          </div>

          {/* Institutional Heraldry Seal Card */}
          <div className="p-4 bg-[#020509]/80 border border-[#26374d] rounded-lg text-center space-y-2 shrink-0 lg:w-72">
            <div className="flex justify-center">
              <InstitutionalCrest size={72} variant="gold" />
            </div>
            <div className="text-xs font-bold text-white tracking-wider">
              ZAZIE PRODUCTIONS R&D
            </div>
            <div className="text-[11px] text-[#c5a059] italic">
              "Applied Anomalies · Experimental Systems · Speculative Engineering"
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal border-t border-[#1b2636] pt-2">
              Documenting physical prototypes, custom audio software, speculative patent disclosures, and field recordings developed across 2021–2026.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Statistics Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        <div
          onClick={() => onSelectTab('prototypes')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-[#dfb76c] rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>PROTOTYPES</span>
            <Cpu className="w-3 h-3 text-[#dfb76c]" />
          </div>
          <div className="text-2xl font-bold text-white group-hover:text-[#dfb76c] mt-1">
            {archiveStats.totalPrototypes}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Active Hardware & Code</div>
        </div>

        <div
          onClick={() => onSelectTab('patents')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-cyan-400 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>PATENTS</span>
            <FileText className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 group-hover:text-cyan-200 mt-1">
            {archiveStats.totalPatents}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Speculative Dossiers</div>
        </div>

        <div
          onClick={() => onSelectTab('logs')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-emerald-400 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>RESEARCH LOGS</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 mt-1">
            {archiveStats.totalLogs}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Field & Bench Notes</div>
        </div>

        <div
          onClick={() => onSelectTab('monographs')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-[#dfb76c] rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>MONOGRAPHS</span>
            <BookOpen className="w-3 h-3 text-[#dfb76c]" />
          </div>
          <div className="text-2xl font-bold text-[#f5d78e] group-hover:text-white mt-1">
            {archiveStats.totalMonographs}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Research Treatises</div>
        </div>

        <div
          onClick={() => onSelectTab('personnel')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-violet-400 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>FELLOWS</span>
            <Users className="w-3 h-3 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-violet-300 group-hover:text-violet-200 mt-1">
            {archiveStats.totalPersonnel}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Inventors & Artists</div>
        </div>

        <div
          onClick={() => onSelectTab('infrastructure')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-amber-400 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>FIELD SITES</span>
            <MapPin className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 group-hover:text-amber-300 mt-1">
            {archiveStats.totalFieldSites}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Listening Stations</div>
        </div>

        <div
          onClick={() => onSelectTab('vault')}
          className="p-3 bg-[#050911] border border-red-950/80 hover:border-red-500 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>POST-MORTEMS</span>
            <AlertTriangle className="w-3 h-3 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 group-hover:text-red-300 mt-1">
            {archiveStats.totalFailures}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Anomaly Case Studies</div>
        </div>

        <div
          onClick={() => onSelectTab('audit')}
          className="p-3 bg-[#050911] border border-[#213045] hover:border-indigo-400 rounded-lg cursor-pointer transition-all group"
        >
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>SYSTEM AUDIT</span>
            <Layers className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 group-hover:text-indigo-200 mt-1">
            {archiveStats.totalRevisions}
          </div>
          <div className="text-[9.5px] text-zinc-500 mt-0.5">Versioned Commits</div>
        </div>
      </div>

      {/* Institutional Faculties & Scientific Divisions */}
      <div className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#1b2636] pb-3">
          <div>
            <div className="archival-stamp text-[9px] font-mono mb-1">
              RESEARCH INITIATIVE
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Interdisciplinary Research Divisions & Studios
            </h2>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            8 Research Clusters · Integrating Audio Engineering, Creative Coding & Speculative Prototyping
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {disciplines.map((d) => {
            const count = prototypes.filter(p => p.discipline === d).length;
            const desc = disciplineSummaries[d] || 'Applied investigations, software synthesis, and experimental acoustic design.';
            return (
              <div
                key={d}
                onClick={() => onSelectTab('prototypes')}
                className="p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-zinc-200 group-hover:text-[#dfb76c] transition-colors">
                    {d}
                  </span>
                  <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#0c1420] border border-[#233347] text-cyan-300">
                    {count} Prototypes
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Sound Wave Acoustic Bench Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#213045] pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#dfb76c] animate-pulse" />
            <h2 className="font-bold text-white text-sm tracking-wider uppercase font-serif">
              Live Acoustic Calibration Bench & Oscilloscope
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('bench')}
            className="text-xs text-[#dfb76c] hover:underline flex items-center gap-1 font-mono"
          >
            <span>Open Dedicated Test Bench</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <AcousticBench compact={true} />
      </div>

      {/* Featured Monographs & Publications */}
      <div className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#dfb76c]" />
            <h3 className="font-bold text-white text-sm tracking-wider uppercase">
              Recent Scientific Monographs & Treatises ({monographs.length} Volumes)
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('monographs')}
            className="text-zinc-400 hover:text-[#dfb76c] text-xs flex items-center gap-1 font-mono"
          >
            <span>View All Volumes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMonographs.map(m => (
            <div
              key={m.id}
              onClick={() => onSelectTab('monographs')}
              className="p-4 bg-[#03060a] border border-[#1b2636] hover:border-[#dfb76c]/70 rounded-lg cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] text-[#c5a059] font-mono tracking-wider mb-1">
                  {m.volume}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#dfb76c] transition-colors leading-snug">
                  {m.title}
                </h4>
                <div className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {m.abstract}
                </div>
              </div>
              <div className="pt-3 border-t border-[#16202e] mt-3 flex items-center justify-between text-[10.5px] text-zinc-500 font-mono">
                <span>{m.author}</span>
                <span className="text-cyan-400 group-hover:underline">Read Treatise →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Flagship Prototypes and Lab Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flagship Prototypes */}
        <div className="bg-[#05080f] border border-[#213045] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#dfb76c]" />
              <h3 className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                FLAGSHIP ACOUSTIC PROTOTYPES
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('prototypes')}
              className="text-zinc-400 hover:text-[#dfb76c] text-xs flex items-center gap-1 font-mono"
            >
              <span>View All {archiveStats.totalPrototypes}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {featuredPrototypes.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectRecord('prototype', p.id)}
                className="p-3.5 bg-[#03060a] border border-[#1b2636] hover:border-[#dfb76c]/70 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white group-hover:text-[#dfb76c] text-xs">
                      {p.id}: {p.codeName}
                    </span>
                    <div className="text-[11.5px] text-zinc-300 font-medium mt-0.5">
                      {p.title}
                    </div>
                  </div>
                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#0b1522] text-cyan-300 border border-cyan-800/60">
                    {p.clearance}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {p.abstract}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10.5px] text-zinc-500 font-mono">
                  <span>BW: <span className="text-cyan-400">{p.operationalBandwidth}</span></span>
                  <span>·</span>
                  <span>LEAD: <span className="text-zinc-300">{p.leadResearcher}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Lab Telemetry Stream */}
        <div className="bg-[#05080f] border border-[#213045] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                CHRONOLOGICAL LAB TELEMETRY STREAM
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('logs')}
              className="text-zinc-400 hover:text-emerald-400 text-xs flex items-center gap-1 font-mono"
            >
              <span>View All {archiveStats.totalLogs} Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {latestLogs.map(log => (
              <div
                key={log.id}
                onClick={() => onSelectRecord('log', log.id)}
                className="p-3.5 bg-[#03060a] border border-[#1b2636] hover:border-emerald-600/70 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-center text-[10.5px] font-mono mb-1">
                  <span className="text-emerald-400 font-bold">{log.id}</span>
                  <span className="text-zinc-500">{log.displayDate}</span>
                </div>
                <div className="text-zinc-200 group-hover:text-emerald-300 font-medium text-xs leading-snug">
                  {log.summary}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10.5px] text-zinc-400 font-mono">
                  <span className="text-cyan-400">{log.facility}</span>
                  <span>·</span>
                  <span>SPL: {log.telemetry.splDecibels} dB</span>
                  <span>·</span>
                  <span>Flux: {log.telemetry.magneticFluxMicroTesla} μT</span>
                  {log.anomalyAlert && (
                    <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800 rounded font-bold">
                      ANOMALY DETECTED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities & Observatories Status Strip */}
      <div className="bg-[#05080f] border border-[#213045] rounded-xl p-5">
        <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
          DISTRIBUTED RESEARCH STUDIOS & REMOTE FIELD STATIONS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {facilities.slice(0, 4).map((fac, idx) => (
            <div key={idx} className="p-3 bg-[#03060a] border border-[#1b2636] rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">{fac}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>
              <div className="text-[10.5px] font-mono text-zinc-400 mt-1">STATUS: OPERATIONAL</div>
              <div className="text-[10.5px] font-mono text-emerald-400/90 mt-0.5">AUDIO NETWORK: DANTE STREAMING</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
