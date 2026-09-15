import React, { Suspense, lazy } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, softwareAppSchema } from '../seo/schema';
import { instrumentRelations } from '../seo/graph';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loading } from '../components/Loading';

// Three.js + WebGL scene: loaded on demand so the archive shell stays light.
const SynthesisSignalLab = lazy(() => import('../components/SynthesisSignalLab').then(m => ({ default: m.SynthesisSignalLab })));

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'SYNTHESIS//SIGNAL', path: '/synthesis-signal' }
];
const DESCRIPTION =
  'SYNTHESIS//SIGNAL is a browser-based audiovisual instrument from the Zazie Institute of Applied Anomalies: uploaded audio drives a reactive Three.js composition, 2048-point FFT spectrum analyser and oscilloscope, all processed locally.';

import { 
  Cpu, ExternalLink, Box, Waves, FileAudio, 
  Layers, Activity, Zap, BookOpen, Terminal,
  Radio, Eye, Github
} from 'lucide-react';

export const SynthesisSignalPage: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      <Seo
        title="SYNTHESIS//SIGNAL — Audio-Reactive 3D Visualiser"
        description={DESCRIPTION}
        path="/synthesis-signal"
        keywords={['audio visualizer', 'Three.js', 'Web Audio API', 'FFT spectrum analyser', 'creative coding', 'computational creativity']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          softwareAppSchema({
            path: '/synthesis-signal',
            name: 'SYNTHESIS//SIGNAL Audiovisual Environment',
            description: DESCRIPTION,
            category: 'MultimediaApplication',
            features: ['MP3/WAV input', '2048-point FFT', 'Reactive torus-knot geometry', 'Particle field', 'Spectrum analyser', 'Oscilloscope', 'Local-only processing'],
            extra: instrumentRelations('generative-software')
          })        ]}
      />
      {/* Header */}
      <header className="relative bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00ffcc]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff00ff]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mb-3"><Breadcrumbs crumbs={CRUMBS} /></div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] tracking-widest">
              EXTERNAL PROTOTYPE RECOVERY
            </span>
            <StatusBadge label="Operational" size="xs" />
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#161309] border border-[#8c6d31]/60 text-[#dfb76c] tracking-widest">
              INTEGRATION STATUS: ACTIVE
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#0a1a14] border border-emerald-800/60 text-emerald-300 tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              INTERACTIVE LAB ONLINE
            </span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="font-mono">SYNTH</span><span className="text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]">ESIS</span>
                <span className="text-[#444]">//</span>
                <span className="text-[#ff00ff]">SIGNAL</span>
                <span className="text-sm font-normal text-zinc-400 ml-2">— Audiovisual Environment</span>
              </h1>
              
              <p className="text-sm text-zinc-300 leading-relaxed font-serif">
                Browser-based audiovisual instrument that transforms uploaded audio into a reactive 3D composition, 
                live spectral analysis, and oscilloscope visualization. Recovered from <span className="text-[#dfb76c]">zazieproductions/SYNTHESIS-SIGNAL</span> and 
                integrated as an interactive laboratory module. Combines Web Audio API with Three.js to create a 
                creative-technology interface inspired by modular synthesis, node-based media systems, and professional 
                audiovisual software.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="https://github.com/zazieproductions/SYNTHESIS-SIGNAL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#151515] border border-[#333] hover:border-[#00ffcc] text-[#aaa] hover:text-[#00ffcc] rounded text-xs flex items-center gap-2 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  View Original Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="px-3 py-1.5 bg-[#05080c] border border-[#1a1f33] text-[#7d8aa6] rounded text-xs flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Single-file deployable • No build process • GitHub Pages compatible
                </div>
              </div>
            </div>

            <div className="lg:w-80 p-4 bg-[#020509]/80 border border-[#26374d] rounded-lg space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-[#00ffcc] font-bold flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> Core Systems Manifest
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-center gap-2"><FileAudio className="w-3 h-3 text-[#facc15]" /> Audio-file input (MP3/WAV)</li>
                <li className="flex items-center gap-2"><Activity className="w-3 h-3 text-[#00ffcc]" /> Web Audio 2048-point FFT</li>
                <li className="flex items-center gap-2"><Box className="w-3 h-3 text-[#ff00ff]" /> Reactive Three.js torus-knot geometry</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-[#facc15]" /> Particle-field visualization (3K particles)</li>
                <li className="flex items-center gap-2"><Waves className="w-3 h-3 text-cyan-400" /> Frequency spectrum analyzer</li>
                <li className="flex items-center gap-2"><Radio className="w-3 h-3 text-emerald-400" /> Time-domain oscilloscope</li>
                <li className="flex items-center gap-2"><Layers className="w-3 h-3 text-violet-400" /> Node-editor-inspired interface</li>
                <li className="flex items-center gap-2"><Eye className="w-3 h-3 text-[#dfb76c]" /> Transport + visual parameter controls</li>
              </ul>
              <div className="pt-2 border-t border-[#1b2636] text-[10px] text-zinc-400 leading-relaxed">
                <span className="text-[#dfb76c]">Design direction:</span> Treats audio analysis as expressive visual material rather than background effect. Interface borrows from DAWs, modular patching, VJ software, and realtime graphics workstations.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* The Interactive Lab */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" aria-hidden="true" />
            <span className="font-bold tracking-widest text-white">INTERACTIVE LABORATORY INSTANCE // ZIAA-SYNTH-161</span>
            <span className="px-2 py-0.5 rounded bg-[#0a1a14] border border-emerald-800/50 text-emerald-300 text-[10px]">WEBGL2 • WEBAUDIO • LOCAL PROCESSING ONLY</span>
          </div>
          <div className="text-[10px] text-zinc-400 hidden md:block">
            Upload MP3/WAV → Play → Modulate Complexity/Displacement → Observe FFT-driven geometry
          </div>
        </div>
        
        <Suspense fallback={<Loading />}>
          <SynthesisSignalLab />
        </Suspense>
      </div>

      {/* Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#00ffcc] tracking-widest uppercase flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> How To Use
          </h2>
          <ol className="text-[11px] text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Load an MP3 or WAV file using <span className="text-white">Source Input</span> panel</li>
            <li>Press <span className="text-[#00ffcc]">PLAY</span> to activate audio-reactive environment</li>
            <li>Adjust <span className="text-[#00ffcc]">Complexity</span> and <span className="text-[#ff00ff]">Displacement</span> to warp geometry</li>
            <li>Toggle <span className="text-[#facc15]">Modulation Matrix</span> cells to simulate routing</li>
            <li>Switch geometry type (KNOT/TORUS/ICO) for different topologies</li>
            <li>Observe spectrum analyzer and oscilloscope in bottom workspace</li>
          </ol>
        </div>

        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#ff00ff] tracking-widest uppercase flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Technical Integration Notes
          </h2>
          <div className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
            <p>Original prototype was a single <code className="px-1 py-0.5 bg-[#111] border border-[#333] rounded text-[#00ffcc]">index.html</code> file with Tailwind CDN and Three.js r128 global. This integration:</p>
            <ul className="space-y-1 list-disc list-inside text-zinc-400">
              <li>Ported to React + TypeScript with <code className="text-[#dfb76c]">three@latest</code> ES modules</li>
              <li>Preserved 2048-point FFT, torus-knot displacement, 3K particle field</li>
              <li>Added ZIAA archival framing, transport progress, and geometry switching</li>
              <li>Local-only processing — uploaded files never leave browser</li>
              <li>Integrated into the ZIAA archive at <code className="text-[#00ffcc]">SYNTHESIS//SIGNAL</code></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#facc15] tracking-widest uppercase flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Roadmap & Archive Context
          </h2>
          <div className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
            <p>From original repository roadmap:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Microphone and live-input support</li>
              <li>Exportable stills and video capture</li>
              <li>MIDI mapping</li>
              <li>Additional geometry modes</li>
              <li>Configurable FFT resolution</li>
            </ul>
            <p className="pt-2 border-t border-[#1a1f33] text-zinc-400">
              Within ZIAA, this prototype is classified as <span className="text-[#dfb76c]">PROT-161 // SYNTHESIS-SIGNAL</span> — a computational creativity and audiovisual DSP workstation, complementary to existing <span className="text-cyan-300">SPECTRA//LAB</span> and <span className="text-emerald-300">ACOUSTIC BENCH</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthesisSignalPage;
