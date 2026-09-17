import React, { Suspense, lazy } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, softwareAppSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Loading } from '../components/Loading';

// The instrument ships its own audio engine, fonts and canvas renderer:
// loaded on demand so the archive shell stays light.
const EmotionSpectrumInstrument = lazy(() =>
  import('../instruments/emotion-spectrum/EmotionSpectrumInstrument')
);

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'EMOTION//SPECTRUM', path: '/emotion-spectrum' }
];
const DESCRIPTION =
  'EMOTION//SPECTRUM is a browser instrument from the Zazie Institute of Applied Anomalies: twelve bands of the electromagnetic spectrum mapped to sixty emotional states, each with its own synthesis timbre, played live on a ribbon or as a gliding theremin voice.';

import {
  Cpu, ExternalLink, Radio, Waves, Piano, Infinity as InfinityIcon,
  Repeat, Activity, Zap, BookOpen, Terminal, Keyboard, SlidersHorizontal, Github
} from 'lucide-react';

export const EmotionSpectrumPage: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      <Seo
        title="EMOTION//SPECTRUM - Electromagnetic Emotion Instrument"
        description={DESCRIPTION}
        path="/emotion-spectrum"
        keywords={['electromagnetic spectrum', 'emotion instrument', 'Web Audio API', 'generative music', 'theremin', 'creative coding', 'sound and emotion']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          softwareAppSchema({
            path: '/emotion-spectrum',
            name: 'EMOTION//SPECTRUM Electromagnetic Emotion Instrument',
            description: DESCRIPTION,
            category: 'MultimediaApplication',
            features: [
              '12 electromagnetic bands mapped to 60 emotional states',
              'Playable spectrum ribbon with QWERTY keyboard row',
              'Continuous theremin mode with configurable portamento',
              'Drone latch and arpeggiator (90–450 ms per step)',
              'Per-band timbre: oscillator stack, detune, lowpass, resonance, attack/release',
              'Studio bus: convolution reverb, feedback delay, waveshaper drive, compressor',
              'Realtime analyser aurora and oscilloscope on Canvas 2D',
              'Local-only processing - no audio leaves the browser'
            ]
          })
        ]}
      />
      {/* Header */}
      <header className="relative bg-gradient-to-b from-[#0b0817] via-[#070512] to-[#050409] border border-[#3d3358] rounded-xl p-6 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8a7bff]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff4d9d]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-3"><Breadcrumbs crumbs={CRUMBS} /></div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] bg-[#8a7bff]/10 border border-[#8a7bff]/30 text-[#b7a8ff] tracking-widest">
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
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3 flex-wrap">
                <span className="bg-gradient-to-r from-[#6d5bd6] via-[#ff9d3d] to-[#5be0e0] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(138,123,255,0.45)]">EMOTION</span>
                <span className="text-[#444]">//</span>
                <span className="text-[#b7a8ff]">SPECTRUM</span>
                <span className="text-sm font-normal text-zinc-400 ml-2">- Electromagnetic Emotion Instrument</span>
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed font-serif">
                A playable browser instrument in which twelve bands of the electromagnetic spectrum are treated as
                twelve emotional regions - from long, grounding radio waves to short, transcendent gamma. Each band
                owns a timbre, a colour, and five emotions; the whole spectrum is a ribbon you can press, sweep or
                glide across. Recovered from <span className="text-[#dfb76c]">zazieproductions/Electromagnetic-Spectrum-Emotion-Web-Instrument</span> and
                integrated as an interactive laboratory module. The mapping is poetic, not physical - but the coupling
                between each band's data and its audio behaviour is strict and testable.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="https://github.com/zazieproductions/Electromagnetic-Spectrum-Emotion-Web-Instrument"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#151515] border border-[#333] hover:border-[#8a7bff] text-[#aaa] hover:text-[#b7a8ff] rounded text-xs flex items-center gap-2 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  View Original Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="px-3 py-1.5 bg-[#05080c] border border-[#1a1f33] text-[#7d8aa6] rounded text-xs flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  React 19 + TypeScript • Web Audio API • Canvas 2D
                </div>
              </div>

              <p className="text-[11px] text-amber-200/80 border border-amber-800/40 bg-amber-950/20 rounded px-3 py-2 leading-relaxed">
                <Zap className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-300" aria-hidden="true" />
                Audio notice: the instrument starts silent and only sounds after a click or key press (browser autoplay
                policy). Begin with a low Master level - sustained voices, the drone latch and the theremin can hold
                notes for several seconds.
              </p>
            </div>

            <div className="lg:w-80 p-4 bg-[#06040d]/80 border border-[#3d3358] rounded-lg space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-[#b7a8ff] font-bold flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> Core Systems Manifest
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-center gap-2"><Radio className="w-3 h-3 text-[#6d5bd6]" /> 12 EM bands, Radio → Gamma (60 emotions)</li>
                <li className="flex items-center gap-2"><Piano className="w-3 h-3 text-[#ff9d3d]" /> Ribbon mode - press &amp; drag playable cells</li>
                <li className="flex items-center gap-2"><Waves className="w-3 h-3 text-[#4d9dff]" /> Theremin mode - one continuous gliding voice</li>
                <li className="flex items-center gap-2"><InfinityIcon className="w-3 h-3 text-[#4dd97a]" /> Drone latch - hold emotions as sustained voices</li>
                <li className="flex items-center gap-2"><Repeat className="w-3 h-3 text-[#ffd93d]" /> Arpeggiator - 90–450 ms step sequencing</li>
                <li className="flex items-center gap-2"><SlidersHorizontal className="w-3 h-3 text-[#e05b5b]" /> Lab knobs: Master, Reverb, Delay, Drive, Glide/Rate</li>
                <li className="flex items-center gap-2"><Activity className="w-3 h-3 text-[#5be0e0]" /> Analyser aurora + oscilloscope (Canvas 2D)</li>
                <li className="flex items-center gap-2"><Keyboard className="w-3 h-3 text-[#c46bff]" /> A–L / Q–P keyboard row with ◄ ► shift</li>
              </ul>
              <div className="pt-2 border-t border-[#241c3d] text-[10px] text-zinc-400 leading-relaxed">
                <span className="text-[#dfb76c]">Design direction:</span> treats the scientific continuum of the EM
                spectrum as an intimate emotional body. Every band couples its wavelength, colour and emotion family
                to a deterministic synthesis patch - the fiction is enforced by the data model itself.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* The Interactive Lab */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#8a7bff] animate-pulse shadow-[0_0_8px_#8a7bff]" aria-hidden="true" />
            <span className="font-bold tracking-widest text-white">INTERACTIVE LABORATORY INSTANCE // ZIAA-SPEC-162</span>
            <span className="px-2 py-0.5 rounded bg-[#0a1a14] border border-emerald-800/50 text-emerald-300 text-[10px]">WEBAUDIO • CANVAS 2D • LOCAL PROCESSING ONLY</span>
          </div>
          <div className="text-[10px] text-zinc-400 hidden md:block">
            Power on → press or sweep the ribbon → latch drones → sequence with the arp → or glide the theremin
          </div>
        </div>

        <Suspense fallback={<Loading />}>
          <EmotionSpectrumInstrument />
        </Suspense>
      </div>

      {/* Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#b7a8ff] tracking-widest uppercase flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> How To Use
          </h2>
          <ol className="text-[11px] text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Press <span className="text-[#b7a8ff]">POWER ON</span> to wake the audio engine (autoplay policy)</li>
            <li>In <span className="text-white">Ribbon</span> mode, press or drag across the spectrum cells - left is low and grounding, right is high and transcendent</li>
            <li>Scroll the ribbon horizontally to reach higher bands, or play the <span className="text-white">A–L / Q–P</span> keys (◄ ► shift the keyboard window)</li>
            <li>Toggle <span className="text-[#4dd97a]">Drone</span> and click emotions to latch sustained voices; add <span className="text-[#ffd93d]">Arp</span> to sequence them</li>
            <li>Switch to <span className="text-[#4d9dff]">Theremin</span> to glide one continuous voice across the whole spectrum; shape it with the Glide knob</li>
            <li>Use <span className="text-white">Master / Reverb / Delay / Drive</span> for the studio bus; <span className="text-white">Panic</span> silences everything instantly</li>
          </ol>
        </div>

        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#4d9dff] tracking-widest uppercase flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Technical Integration Notes
          </h2>
          <div className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
            <p>The original prototype is a React 19 + TypeScript + Vite single-page instrument. This integration:</p>
            <ul className="space-y-1 list-disc list-inside text-zinc-400">
              <li>Ports the module tree verbatim into <code className="text-[#dfb76c]">src/instruments/emotion-spectrum/</code> - audio engine, band/emotion data model and state machine unchanged</li>
              <li>Rebuilds the full-viewport shell as a bounded panel: start overlay and atmosphere are panel-local, the archive chrome stays reachable</li>
              <li>Guards the QWERTY mapping so archive search and text fields keep focus; voices auto-silence when leaving the laboratory</li>
              <li>Self-hosts the Unbounded display face via <code className="text-[#ffb7d5]">@fontsource/unbounded</code>, matching the archive's font convention</li>
              <li>Local-only processing - synthesis, analysis and interaction never leave the browser</li>
              <li>Integrated into the ZIAA archive at <code className="text-[#b7a8ff]">EMOTION//SPECTRUM</code></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#05080c] border border-[#1a1f33] rounded-lg p-4 space-y-2">
          <h2 className="text-xs font-bold text-[#ff9d3d] tracking-widest uppercase flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Signal Chain & Archive Context
          </h2>
          <div className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
            <p>Per voice: stacked detuned oscillators → per-band lowpass + ADSR → dry bus → waveshaper drive → compressor → master, with parallel <span className="text-white">convolution reverb</span> and <span className="text-white">feedback delay</span> sends scaled by each band's “space” character.</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Playable range ≈ 65 Hz – 1.2 kHz across a pentatonic-safe field</li>
              <li>Theremin portamento configurable to 400 ms</li>
              <li>Renderers: 96-bar mirrored analyser aurora + dual oscilloscope trace</li>
              <li>Status: working prototype, single-page instrument, deployable</li>
            </ul>
            <p className="pt-2 border-t border-[#1a1f33] text-zinc-400">
              Within ZIAA, this prototype is classified as <span className="text-[#dfb76c]">PROT-162 // EMOTION-SPECTRUM</span> - an affective acoustics and human-interface study, complementary to <span className="text-[#7ffbe6]">SYNTHESIS//SIGNAL</span>, <span className="text-cyan-300">SPECTRA//LAB</span> and the <span className="text-emerald-300">ACOUSTIC BENCH</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionSpectrumPage;
