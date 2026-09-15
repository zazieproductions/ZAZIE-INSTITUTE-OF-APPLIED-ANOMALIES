import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { ENTITY } from '../seo/site';
import { aboutPageSchema, breadcrumbSchema, organizationSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { archiveStats, disciplines, facilities } from '../data/archive';
import { Cpu, FileText, Activity, BookOpen, Users, MapPin, AlertTriangle, Layers, Mail, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'About', path: '/about' }
];

const HOLDINGS = [
  { to: '/prototypes', label: 'Experimental prototypes', count: archiveStats.totalPrototypes, Icon: Cpu, blurb: 'Physical-computing instruments, DSP software engines and speculative acoustic hardware, each with schematic, bill of materials and playable acoustic profile.' },
  { to: '/patents', label: 'Speculative patents', count: archiveStats.totalPatents, Icon: FileText, blurb: 'Design-fiction patent dossiers and defensive disclosures documenting inventions, claims and prior-art critique.' },
  { to: '/research-notes', label: 'Research notes', count: archiveStats.totalLogs, Icon: Activity, blurb: 'Chronological bench and field notes with environmental telemetry from studios and remote stations.' },
  { to: '/monographs', label: 'Monographs', count: archiveStats.totalMonographs, Icon: BookOpen, blurb: 'Long-form working papers on applied anomalies, audio technology and computational creativity.' },
  { to: '/fellows', label: 'Fellows & inventors', count: archiveStats.totalPersonnel, Icon: Users, blurb: 'Creative technologists, DSP architects, acoustic engineers and speculative designers.' },
  { to: '/field-stations', label: 'Field stations', count: archiveStats.totalFieldSites, Icon: MapPin, blurb: 'Listening posts and sound observatories gathering acoustic and electromagnetic data.' },
  { to: '/post-mortems', label: 'Anomaly post-mortems', count: archiveStats.totalFailures, Icon: AlertTriangle, blurb: 'Failure case studies with root-cause analysis and containment protocols.' },
  { to: '/system-audit', label: 'System audit ledger', count: archiveStats.totalRevisions, Icon: Layers, blurb: 'Version-controlled changelog of firmware, DSP and documentation revisions.' }
];

const FAQ = [
  {
    q: 'What is the Zazie Institute of Applied Anomalies?',
    a: 'ZIAA is an independent, interdisciplinary research and creative-technology initiative. It operates as the speculative engineering and experimental audio division of Zazie Productions LLC and publishes its prototypes, research notes, software and monographs as an open archive.'
  },
  {
    q: 'What does “applied anomalies” mean?',
    a: 'Applied anomalies are edge-case physical, acoustic and computational phenomena — feedback, hysteresis, resonance, perceptual illusions — treated not as defects but as design material for instruments, interfaces and software.'
  },
  {
    q: 'Are the speculative patents real legal filings?',
    a: 'No. The patent dossiers are creative-technology disclosures written in the register of patent literature. They document inventions and design fiction for research purposes and do not constitute legal patent filings.'
  },
  {
    q: 'Can I use the interactive instruments?',
    a: 'Yes. The Acoustic Bench, SPECTRA//LAB, SYNTHESIS//SIGNAL and VOID//OCULUS run entirely in the browser using the Web Audio API, Canvas and WebGL, with no account or download required.'
  },
  {
    q: 'How do I cite an archive record?',
    a: 'Every record page includes a “Cite” action that copies a formatted citation containing the record identifier, title, the Institute as publisher and the canonical URL.'
  }
];

export const About: React.FC = () => (
  <div className="space-y-6 font-serif">
    <Seo
      title="About the Institute"
      description={`About the ${ENTITY.name} (ZIAA): an independent interdisciplinary research and creative-technology initiative founded in 2021, working across experimental audio, computational creativity, speculative engineering, prototypes, software and digital art.`}
      path="/about"
      keywords={['about ZIAA', 'Zazie Institute', 'independent research initiative', 'creative technology lab', ...ENTITY.fields]}
      jsonLd={[
        breadcrumbSchema(CRUMBS),
        aboutPageSchema('/about'),
        organizationSchema(),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        }
      ]}
    />

    <header className="relative bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 overflow-hidden shadow-2xl space-y-4">
      <Breadcrumbs crumbs={CRUMBS} />
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <InstitutionalCrest size={96} variant="gold" className="shrink-0" />
        <div className="space-y-3">
          <span className="archival-stamp font-mono text-[9.5px]">INSTITUTIONAL PROFILE</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            About the Zazie Institute of Applied Anomalies
          </h1>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-3xl">
            The <strong className="text-white">Zazie Institute of Applied Anomalies (ZIAA)</strong> is an{' '}
            {ENTITY.type.toLowerCase()} founded in {ENTITY.founded}. It investigates applied anomalies, experimental
            audio systems, computational creativity and speculative engineering, and publishes the resulting
            prototypes, research notes, software and monographs as an open research archive.
          </p>
        </div>
      </div>
    </header>

    <section aria-labelledby="mission" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4 text-sm text-zinc-300 leading-relaxed">
        <h2 id="mission" className="text-lg font-bold text-white">Mission &amp; Method</h2>
        <p>
          ZIAA treats anomalies — acoustic feedback, material hysteresis, perceptual edge cases, algorithmic drift — as
          design material rather than defects. Research moves between bench, field and code: instruments are built,
          measured in studios and remote listening stations, documented in research notes, and reflected upon in
          monographs. Software prototypes are released as browser-native creative tools so the work can be heard and
          used, not only read.
        </p>
        <p>
          The Institute operates as the research and creative-technology division of{' '}
          <strong className="text-zinc-100">{ENTITY.legalParent}</strong>. Its archive spans the {archiveStats.operationalYears}{' '}
          research cycle and is maintained as a permanent, citable record.
        </p>
        <h2 className="text-lg font-bold text-white pt-2">Primary Fields</h2>
        <ul className="flex flex-wrap gap-2 font-mono text-[11px]">
          {ENTITY.fields.map(f => (
            <li key={f} className="px-2.5 py-1 rounded bg-[#0a121e] border border-[#23354d] text-cyan-300">{f}</li>
          ))}
        </ul>
        <h2 className="text-lg font-bold text-white pt-2">Research Divisions</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {disciplines.map(d => (
            <li key={d}>
              <Link to={`/prototypes?discipline=${encodeURIComponent(d)}`} className="flex items-center gap-1.5 text-zinc-200 hover:text-[#dfb76c]">
                <ArrowRight className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" /> {d}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <aside className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4 text-xs">
        <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider">Fact Sheet</h2>
        <dl className="space-y-2.5 font-mono">
          <div><dt className="text-zinc-400">Name</dt><dd className="text-zinc-100">{ENTITY.name}</dd></div>
          <div><dt className="text-zinc-400">Abbreviation</dt><dd className="text-zinc-100">{ENTITY.abbreviation}</dd></div>
          <div><dt className="text-zinc-400">Type</dt><dd className="text-zinc-100">{ENTITY.type}</dd></div>
          <div><dt className="text-zinc-400">Founded</dt><dd className="text-zinc-100">{ENTITY.founded}</dd></div>
          <div><dt className="text-zinc-400">Parent organisation</dt><dd className="text-zinc-100">{ENTITY.legalParent}</dd></div>
          <div><dt className="text-zinc-400">Research cycle</dt><dd className="text-zinc-100">{archiveStats.operationalYears}</dd></div>
          <div><dt className="text-zinc-400">Motto</dt><dd className="text-zinc-100 italic">Auditus Inauditi — hearing the unheard</dd></div>
          <div>
            <dt className="text-zinc-400">Research inquiries</dt>
            <dd><a href={`mailto:${ENTITY.email}`} className="text-[#dfb76c] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" aria-hidden="true" />{ENTITY.email}</a></dd>
          </div>
        </dl>
        <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider pt-2">Studios &amp; Stations</h2>
        <ul className="space-y-1 text-zinc-300">
          {facilities.map(f => <li key={f}>{f}</li>)}
        </ul>
      </aside>
    </section>

    <section aria-labelledby="holdings" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="holdings" className="text-lg font-bold text-white">Archive Holdings</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {HOLDINGS.map(h => (
          <li key={h.to}>
            <Link to={h.to} className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-100 group-hover:text-[#dfb76c]">{h.label}</h3>
                <h.Icon className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" />
              </div>
              <div className="text-2xl font-mono font-bold text-white mt-1">{h.count}</div>
              <p className="text-zinc-400 mt-1.5 leading-relaxed">{h.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="faq" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="faq" className="text-lg font-bold text-white">Frequently Asked Questions</h2>
      <dl className="space-y-4 text-sm">
        {FAQ.map(f => (
          <div key={f.q} className="border-l-2 border-[#dfb76c]/60 pl-4">
            <dt className="font-bold text-zinc-100">{f.q}</dt>
            <dd className="text-zinc-300 leading-relaxed mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  </div>
);

export default About;
