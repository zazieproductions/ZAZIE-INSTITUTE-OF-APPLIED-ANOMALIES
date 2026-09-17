import React from 'react';
import { Link } from 'react-router-dom';
import { SpectraLabConsole } from '../components/SpectraLabConsole';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, softwareAppSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Activity, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'SPECTRA//LAB', path: '/spectra-lab' }
];

const DESCRIPTION =
  'SPECTRA//LAB is the Zazie Institute of Applied Anomalies’ audiovisual DSP console: a volumetric spectral field canvas, particle physics, 64-band FFT analysis, an 8×8 modulation matrix and automated parameter curves running entirely in the browser.';

export const SpectraLabPage: React.FC = () => (
  <div className="space-y-4">
    <Seo
      title="SPECTRA//LAB - Audiovisual DSP Console"
      description={DESCRIPTION}
      path="/spectra-lab"
      keywords={['audiovisual', 'spectral visualiser', 'FFT', 'generative visuals', 'creative coding', 'computational creativity']}
      jsonLd={[
        breadcrumbSchema(CRUMBS),
        softwareAppSchema({
          path: '/spectra-lab',
          name: 'SPECTRA//LAB Audiovisual DSP Console',
          description: DESCRIPTION,
          category: 'MultimediaApplication',
          features: ['Volumetric spectral field canvas', 'Particle physics renderer', '64-band FFT analysis', '8x8 modulation matrix', 'Automated parameter curves', 'Spectrogram']
        })
      ]}
    />

    <header className="bg-[#05080c] border border-cyan-950 p-4 rounded-lg space-y-3">
      <Breadcrumbs crumbs={CRUMBS} />
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            <h1 className="text-base font-bold text-white tracking-wider">SPECTRA//LAB - AUDIOVISUAL DSP WORKSTATION</h1>
          </div>
          <p className="text-zinc-300 text-xs mt-1 max-w-3xl leading-relaxed">
            Volumetric spectral field canvas, particle physics, 64-band FFT analysis, 8×8 mod matrix, and automated
            parameter curves - a computational-creativity instrument from the ZIAA Generative Software studio.
          </p>
        </div>
        <Link
          to="/acoustic-bench"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:text-white hover:border-emerald-400 font-bold text-xs font-mono transition-colors shrink-0"
        >
          <Activity className="w-3.5 h-3.5" aria-hidden="true" />
          <span>OPEN ACOUSTIC BENCH</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </header>

    <SpectraLabConsole />
  </div>
);

export default SpectraLabPage;
