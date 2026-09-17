import React from 'react';
import { Link } from 'react-router-dom';
import { AcousticBench } from '../components/AcousticBench';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, softwareAppSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Zap, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Acoustic Bench', path: '/acoustic-bench' }
];

const DESCRIPTION =
  'Browser-based Web Audio DSP workstation from the Zazie Institute of Applied Anomalies: binaural synthesis, FM modulation, resonant filtering, cavitation noise, real-time oscilloscope and 64-band spectrum analysis, with presets for 48 ZIAA prototypes.';

export const AcousticBenchPage: React.FC = () => (
  <div className="space-y-6 font-mono text-xs">
    <Seo
      title="Acoustic Bench - Interactive Web Audio DSP Workstation"
      description={DESCRIPTION}
      path="/acoustic-bench"
      keywords={['web audio', 'DSP workstation', 'binaural synthesis', 'oscilloscope', 'spectrum analyser', 'creative tools']}
      jsonLd={[
        breadcrumbSchema(CRUMBS),
        softwareAppSchema({
          path: '/acoustic-bench',
          name: 'ZIAA Acoustic Synthesis Test Bench',
          description: DESCRIPTION,
          category: 'MultimediaApplication',
          features: ['Binaural oscillator pair', 'FM modulation', 'Resonant biquad filter', 'Cavitation noise generator', 'Time-domain oscilloscope', '64-band spectral analyser', 'Prototype presets']
        })
      ]}
    />

    <header className="bg-[#05080c] border border-emerald-950 p-4 rounded-lg space-y-3">
      <Breadcrumbs crumbs={CRUMBS} />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <h1 className="text-base font-bold text-white tracking-wider">ACOUSTIC BENCH - INTERACTIVE DSP WORKSTATION</h1>
          </div>
          <p className="text-zinc-300 text-[11px] mt-1 max-w-3xl leading-relaxed">
            Real-time Web Audio synthesis engine for auditioning ZIAA prototype acoustic profiles: binaural carriers, FM
            modulation, resonant filtering and cavitation noise with an oscilloscope and 64-band spectral display. Sound
            starts only when you press <strong className="text-emerald-300">Commence Test</strong>.
          </p>
        </div>
        <Link
          to="/spectra-lab"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-800 bg-cyan-950/40 text-cyan-300 hover:text-white hover:border-cyan-400 font-bold transition-colors shrink-0"
        >
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          <span>OPEN SPECTRA//LAB</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </header>

    <AcousticBench />

    <section aria-labelledby="bench-notes" className="bg-[#04070d] border border-[#213045] rounded-xl p-5 font-serif text-sm text-zinc-300 space-y-2">
      <h2 id="bench-notes" className="text-white font-bold text-base">About the Acoustic Bench</h2>
      <p>
        The bench is the same engine that renders each prototype’s acoustic signature inside its archive dossier. Every
        preset is derived from a prototype’s recorded audio profile (carrier frequency, modulation rate, filter type and
        binaural offset), making it a listening companion to the <Link to="/prototypes" className="text-[#dfb76c] underline underline-offset-2">prototype archive</Link> and
        the <Link to="/research-notes" className="text-[#dfb76c] underline underline-offset-2">research notes</Link>.
      </p>
    </section>
  </div>
);

export default AcousticBenchPage;
