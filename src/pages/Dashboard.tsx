import React from 'react';
import { Link } from 'react-router-dom';
import { archiveStats, featured, facilities, disciplines, recordPath, monographPath } from '../data/archive';
import { disciplinePath } from '../seo/site';
import { NetworkGraph } from '../components/NetworkGraph';
import { AcousticBench } from '../components/AcousticBench';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { Seo } from '../seo/Seo';
import { ENTITY } from '../seo/site';
import { organizationSchema, websiteSchema } from '../seo/schema';
import {
  Activity, Cpu, FileText, AlertTriangle, ArrowRight, Layers, Radio, Zap, BookOpen, Users, MapPin
} from 'lucide-react';

const DISCIPLINE_SUMMARIES: Record<string, string> = {
  'Applied Anomalies': 'Nonlinear acoustic feedback, physical hysteresis, room boundary reflections, and perceptual edge cases.',
  'Experimental Audio Systems': 'Custom analog/digital synthesis hardware, wave-terrain modeling, physical resonators, and reactive audio devices.',
  'Computational Creativity': 'Autonomous musical agents, real-time procedural scores, neural audio resynthesis, and generative polyphony.',
  'Speculative Engineering': 'Design fiction hardware, multi-head tape transports, kinetic percussion automata, and experimental lutherie.',
  'Perceptual Interfaces': 'Tactile acoustic floor arrays, motorized haptic controllers, spatial gesture tracking, and microtonal touch surfaces.',
  'Generative Software': 'Low-latency DSP audio worklets, ambisonic spatialization engines, WebAssembly tools, and live-coding systems.',
  'Signal Archaeology': 'Non-contact optical laser scanning of historical records, magnetic media recovery, and atmospheric VLF listening.',
  'Acoustic Architecture': 'Multichannel spatial speaker domes, subterranean resonant vaults, site-specific sound installations, and field stations.'
};

const METRICS = [
  { to: '/prototypes', label: 'PROTOTYPES', value: archiveStats.totalPrototypes, sub: 'Hardware & Software', Icon: Cpu, color: 'text-white', hover: 'hover:border-[#dfb76c]', icon: 'text-[#dfb76c]' },
  { to: '/patents', label: 'PATENTS', value: archiveStats.totalPatents, sub: 'Speculative Dossiers', Icon: FileText, color: 'text-cyan-300', hover: 'hover:border-cyan-400', icon: 'text-cyan-400' },
  { to: '/research-notes', label: 'RESEARCH NOTES', value: archiveStats.totalLogs, sub: 'Field & Bench Notes', Icon: Activity, color: 'text-emerald-400', hover: 'hover:border-emerald-400', icon: 'text-emerald-400' },
  { to: '/monographs', label: 'MONOGRAPHS', value: archiveStats.totalMonographs, sub: 'Research Treatises', Icon: BookOpen, color: 'text-[#f5d78e]', hover: 'hover:border-[#dfb76c]', icon: 'text-[#dfb76c]' },
  { to: '/fellows', label: 'FELLOWS', value: archiveStats.totalPersonnel, sub: 'Inventors & Artists', Icon: Users, color: 'text-violet-300', hover: 'hover:border-violet-400', icon: 'text-violet-400' },
  { to: '/field-stations', label: 'FIELD STATIONS', value: archiveStats.totalFieldSites, sub: 'Listening Stations', Icon: MapPin, color: 'text-amber-400', hover: 'hover:border-amber-400', icon: 'text-amber-400' },
  { to: '/post-mortems', label: 'POST-MORTEMS', value: archiveStats.totalFailures, sub: 'Anomaly Case Studies', Icon: AlertTriangle, color: 'text-red-400', hover: 'hover:border-red-500', icon: 'text-red-400' },
  { to: '/system-audit', label: 'SYSTEM AUDIT', value: archiveStats.totalRevisions, sub: 'Versioned Commits', Icon: Layers, color: 'text-indigo-300', hover: 'hover:border-indigo-400', icon: 'text-indigo-400' }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 font-serif">
      <Seo
        description={`${ENTITY.name} (ZIAA): independent research & creative-technology archive of ${archiveStats.totalPrototypes} experimental prototypes, ${archiveStats.totalPatents} speculative patents, ${archiveStats.totalLogs} research notes and ${archiveStats.totalMonographs} monographs on audio technology, computational creativity and speculative engineering.`}
        path="/"
        keywords={[...ENTITY.fields, 'ZIAA', 'Zazie Institute']}
        jsonLd={[organizationSchema(), websiteSchema()]}
      />

      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="relative bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none hidden md:block" aria-hidden="true">
          <InstitutionalCrest size={380} variant="gold" decorative />
        </div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="archival-stamp font-mono text-[9.5px]">CREATIVE-TECHNOLOGY INITIATIVE // ARCHIVE</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#162233] text-cyan-300 border border-cyan-800/60">
                RESEARCH CYCLE 2021–2026
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                DSP BENCH &amp; AUDIO ENGINE ONLINE
              </span>
            </div>

            <h2 id="hero-heading" className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Applied Anomalies, Experimental Audio Technology &amp; Speculative Engineering
            </h2>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              The <strong className="text-white font-semibold">Zazie Institute of Applied Anomalies (ZIAA)</strong> is an
              independent interdisciplinary research and creative-technology initiative. Founded in 2021 as the
              speculative engineering division of <span className="text-[#dfb76c] font-medium">Zazie Productions LLC</span>,
              the Institute designs experimental sound systems, tangible perceptual interfaces, computational creativity
              software, and site-specific acoustic instruments — and publishes the prototypes, research notes and
              monographs in this open archive.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/monographs" className="px-4 py-2 bg-[#dfb76c] hover:bg-[#ebd097] text-[#05080f] font-bold text-xs rounded transition-all shadow-md flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Read Working Monographs</span>
              </Link>
              <Link to="/prototypes" className="px-4 py-2 bg-[#091322] hover:bg-[#0f1d33] border border-[#3b5373] text-zinc-200 font-bold text-xs rounded transition-all flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                <span>Explore {archiveStats.totalPrototypes} Prototypes</span>
              </Link>
              <Link to="/acoustic-bench" className="px-4 py-2 bg-[#0d1f18] hover:bg-[#142e24] border border-emerald-700/80 text-emerald-300 font-bold text-xs rounded transition-all flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Open the Acoustic Bench</span>
              </Link>
              <Link to="/about" className="px-4 py-2 text-zinc-300 hover:text-white text-xs underline underline-offset-4 decoration-zinc-600">
                About the Institute
              </Link>
            </div>
          </div>

          <div className="p-4 bg-[#020509]/80 border border-[#26374d] rounded-lg text-center space-y-2 shrink-0 lg:w-72">
            <div className="flex justify-center">
              <InstitutionalCrest size={72} variant="gold" />
            </div>
            <div className="text-xs font-bold text-white tracking-wider">ZIAA · EST. 2021</div>
            <p className="text-[11px] text-[#c5a059] italic">“{ENTITY.tagline}”</p>
            <p className="text-[10px] text-zinc-300 leading-normal border-t border-[#1b2636] pt-2">
              Documenting physical prototypes, custom audio software, speculative patent disclosures, and field
              recordings developed across 2021–2026.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Archive holdings" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        {METRICS.map(m => (
          <Link
            key={m.to}
            to={m.to}
            className={`p-3 bg-[#050911] border border-[#213045] ${m.hover} rounded-lg transition-all group`}
          >
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>{m.label}</span>
              <m.Icon className={`w-3 h-3 ${m.icon}`} aria-hidden="true" />
            </div>
            <div className={`text-2xl font-bold ${m.color} mt-1`}>{m.value}</div>
            <div className="text-[9.5px] text-zinc-400 mt-0.5">{m.sub}</div>
          </Link>
        ))}
      </section>

      {/* Disciplines */}
      <section aria-labelledby="disciplines-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#1b2636] pb-3">
          <div>
            <div className="archival-stamp text-[9px] font-mono mb-1">RESEARCH INITIATIVE</div>
            <h2 id="disciplines-heading" className="text-lg font-bold text-white tracking-wide">
              Interdisciplinary Research Divisions &amp; Studios
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            {disciplines.length} Research Clusters · Audio Engineering, Creative Coding &amp; Speculative Prototyping
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {disciplines.map(d => (
            <li key={d}>
              <Link
                to={disciplinePath(d)}
                className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg transition-all group"
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-zinc-200 group-hover:text-[#dfb76c] transition-colors">{d}</h3>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0c1420] border border-[#233347] text-cyan-300">
                    {featured.disciplineCounts[d] ?? 0} Prototypes
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {DISCIPLINE_SUMMARIES[d] ?? 'Applied investigations, software synthesis, and experimental acoustic design.'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Acoustic bench preview */}
      <section aria-labelledby="bench-heading" className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#213045] pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
            <h2 id="bench-heading" className="font-bold text-white text-sm tracking-wider uppercase font-serif">
              Live Acoustic Calibration Bench &amp; Oscilloscope
            </h2>
          </div>
          <Link to="/acoustic-bench" className="text-xs text-[#dfb76c] hover:underline flex items-center gap-1 font-mono">
            <span>Open Dedicated Test Bench</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
        <AcousticBench compact />
      </section>

      {/* Monographs */}
      <section aria-labelledby="monographs-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
            <h2 id="monographs-heading" className="font-bold text-white text-sm tracking-wider uppercase">
              Recent Research Monographs &amp; Treatises
            </h2>
          </div>
          <Link to="/monographs" className="text-zinc-300 hover:text-[#dfb76c] text-xs flex items-center gap-1 font-mono">
            <span>View All {archiveStats.totalMonographs} Volumes</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.monographs.map(m => (
            <li key={m.id}>
              <Link
                to={monographPath(m.id)}
                className="h-full p-4 bg-[#03060a] border border-[#1b2636] hover:border-[#dfb76c]/70 rounded-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] text-[#c5a059] font-mono tracking-wider mb-1">{m.volume}</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#dfb76c] transition-colors leading-snug">{m.title}</h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">{m.abstract}</p>
                </div>
                <div className="pt-3 border-t border-[#16202e] mt-3 flex items-center justify-between text-[10.5px] text-zinc-400 font-mono">
                  <span>{m.author}</span>
                  <span className="text-cyan-400 group-hover:underline">Read Treatise →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Prototypes + notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-labelledby="flagship-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
              <h2 id="flagship-heading" className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                Flagship Acoustic Prototypes
              </h2>
            </div>
            <Link to="/prototypes" className="text-zinc-300 hover:text-[#dfb76c] text-xs flex items-center gap-1 font-mono">
              <span>View All {archiveStats.totalPrototypes}</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-2.5">
            {featured.prototypes.map(p => (
              <li key={p.id}>
                <Link
                  to={recordPath('prototype', p.id)}
                  className="block p-3.5 bg-[#03060a] border border-[#1b2636] hover:border-[#dfb76c]/70 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#dfb76c] text-xs">
                        {p.id}: {p.codeName}
                      </h3>
                      <div className="text-[11.5px] text-zinc-300 font-medium mt-0.5">{p.title}</div>
                    </div>
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#0b1522] text-cyan-300 border border-cyan-800/60 shrink-0">
                      {p.clearance}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{p.abstract}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10.5px] text-zinc-400 font-mono">
                    <span>BW: <span className="text-cyan-400">{p.operationalBandwidth}</span></span>
                    <span aria-hidden="true">·</span>
                    <span>LEAD: <span className="text-zinc-300">{p.leadResearcher}</span></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="notes-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <h2 id="notes-heading" className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                Latest Research Notes &amp; Lab Telemetry
              </h2>
            </div>
            <Link to="/research-notes" className="text-zinc-300 hover:text-emerald-400 text-xs flex items-center gap-1 font-mono">
              <span>View All {archiveStats.totalLogs} Notes</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-2.5">
            {featured.logs.map(log => (
              <li key={log.id}>
                <Link
                  to={recordPath('log', log.id)}
                  className="block p-3.5 bg-[#03060a] border border-[#1b2636] hover:border-emerald-600/70 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center text-[10.5px] font-mono mb-1">
                    <span className="text-emerald-400 font-bold">{log.id}</span>
                    <time dateTime={log.timestamp} className="text-zinc-400">{log.displayDate}</time>
                  </div>
                  <h3 className="text-zinc-200 group-hover:text-emerald-300 font-medium text-xs leading-snug">{log.summary}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10.5px] text-zinc-400 font-mono">
                    <span className="text-cyan-400">{log.facility}</span>
                    <span aria-hidden="true">·</span>
                    <span>SPL: {log.splDecibels} dB</span>
                    <span aria-hidden="true">·</span>
                    <span>Flux: {log.magneticFluxMicroTesla} μT</span>
                    {log.anomalyAlert && (
                      <span className="px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-bold">
                        ANOMALY DETECTED
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Knowledge graph */}
      <NetworkGraph />

      {/* Curated deep archive — descriptive internal linking to high-value, otherwise underlinked dossiers */}
      <section aria-labelledby="deep-archive-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <div>
            <div className="archival-stamp text-[9px] font-mono mb-1">CURATED READING PATHS</div>
            <h2 id="deep-archive-heading" className="text-lg font-bold text-white tracking-wide">From the laboratory archives — curated deep reading</h2>
          </div>
          <Link to="/about" className="text-xs font-mono text-zinc-400 hover:text-[#dfb76c]">About the Institute →</Link>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          The cards above surface flagship prototypes and the most recent research notes. The dossiers below are longer-run investigations — signal archaeology of archival audio, perceptual-interface acoustics, material hysteresis and remote field listening — that live on deeper pages and are now cross-linked with descriptive titles so both readers and crawlers can discover them without relying on paged browsing.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <nav aria-labelledby="deep-proto-heading">
            <h3 id="deep-proto-heading" className="text-[11px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">Signal archaeology & material-acoustics prototypes</h3>
            <ul className="space-y-2">
              <li>
                <Link to={recordPath('prototype', 'PROT-025')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group">
                  <span className="font-mono font-bold text-[#dfb76c] group-hover:text-white">PROT-025 · OPTICAL-SCANNER</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Non-contact laser profilometer for historical grooved audio carriers — Signal Archaeology</span>
                </Link>
              </li>
              <li>
                <Link to={recordPath('prototype', 'PROT-026')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group">
                  <span className="font-mono font-bold text-[#dfb76c] group-hover:text-white">PROT-026 · VLF-RECEIVER</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Wideband VLF inductive loop receiver for natural atmospheric radio listening</span>
                </Link>
              </li>
              <li>
                <Link to={recordPath('prototype', 'PROT-030')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group">
                  <span className="font-mono font-bold text-[#dfb76c] group-hover:text-white">PROT-030 · SUBTERRANEAN-VAULT</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Underground resonant vault with 18.4 s natural reverberation — Acoustic Architecture</span>
                </Link>
              </li>
              <li><Link to="/prototypes" className="text-[#dfb76c] hover:underline font-mono text-[11px]">Browse all 160 prototypes →</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="deep-patent-heading">
            <h3 id="deep-patent-heading" className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider mb-2">Speculative patents & monographs</h3>
            <ul className="space-y-2">
              <li>
                <Link to={recordPath('patent', 'PAT-2024-004')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/60 rounded group">
                  <span className="font-mono font-bold text-cyan-400 group-hover:text-white">PAT-2024-004</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Continuous multi-head magnetic tape transport with modulated thermal bias — Speculative Engineering</span>
                </Link>
              </li>
              <li>
                <Link to={monographPath('ESSAY-2023-02')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/60 rounded group">
                  <span className="font-mono font-bold text-cyan-400 group-hover:text-white">ESSAY-2023-02</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Media archaeology of inscribed sound — optical reconstruction of fragile historical recordings</span>
                </Link>
              </li>
              <li>
                <Link to={monographPath('ESSAY-2024-03')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/60 rounded group">
                  <span className="font-mono font-bold text-cyan-400 group-hover:text-white">ESSAY-2024-03</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Spatial psychoacoustics and missing fundamentals — perceptual illusions in generative composition</span>
                </Link>
              </li>
              <li><Link to="/monographs" className="text-cyan-400 hover:underline font-mono text-[11px]">Read all 8 treatises →</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="deep-field-heading">
            <h3 id="deep-field-heading" className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">Field listening stations & fellows</h3>
            <ul className="space-y-2">
              <li>
                <Link to={recordPath('site', 'SITE-07')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-amber-500/60 rounded group">
                  <span className="font-mono font-bold text-amber-400 group-hover:text-white">SITE-07 · ARASHIYAMA</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Kyoto bamboo-canopy listening post — distributed acoustic observatory</span>
                </Link>
              </li>
              <li>
                <Link to={recordPath('site', 'SITE-01')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-amber-500/60 rounded group">
                  <span className="font-mono font-bold text-amber-400 group-hover:text-white">SITE-01 · MOJAVE DESERT</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Mojave Desert acoustic sanctuary — 32-channel ground-plane array</span>
                </Link>
              </li>
              <li>
                <Link to={recordPath('personnel', 'FELLOW-001')} className="block p-2.5 bg-[#03060a] border border-[#1b2738] hover:border-violet-400/60 rounded group">
                  <span className="font-mono font-bold text-violet-300 group-hover:text-white">FELLOW-001 · Dr. V. Aris Thorne</span>
                  <span className="block text-zinc-300 mt-0.5 leading-snug">Director of Research — acoustic feedback dynamics & speculative sound hardware</span>
                </Link>
              </li>
              <li className="flex gap-3 font-mono text-[11px]">
                <Link to="/field-stations" className="text-amber-400 hover:underline">All field stations →</Link>
                <Link to="/fellows" className="text-violet-300 hover:underline">All fellows →</Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      {/* Facilities */}
      <section aria-labelledby="facilities-heading" className="bg-[#05080f] border border-[#213045] rounded-xl p-5">
        <h2 id="facilities-heading" className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-3">
          Distributed Research Studios &amp; Remote Field Stations
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {facilities.slice(0, 4).map(fac => (
            <li key={fac} className="p-3 bg-[#03060a] border border-[#1b2636] rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-zinc-200">{fac}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" aria-hidden="true" />
              </div>
              <div className="text-[10.5px] font-mono text-zinc-400 mt-1">STATUS: OPERATIONAL</div>
              <div className="text-[10.5px] font-mono text-emerald-300 mt-0.5">AUDIO NETWORK: DANTE STREAMING</div>
            </li>
          ))}
        </ul>
        <Link to="/field-stations" className="inline-flex items-center gap-1 mt-3 text-xs font-mono text-[#dfb76c] hover:underline">
          All {archiveStats.totalFieldSites} field stations <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
