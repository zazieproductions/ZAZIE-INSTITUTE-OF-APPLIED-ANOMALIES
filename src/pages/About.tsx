import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { ENTITY, FOUNDER, disciplinePath } from '../seo/site';
import { aboutPageSchema, breadcrumbSchema, founderPersonSchema, organizationSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { archiveStats, disciplines, facilities, recordPath, monographPath } from '../data/archive';
import { CANONICAL, FOUNDER_STATEMENT, prestigeLead, prestigeDescriptionLong, instituteAtAGlance, STATUS_ANSWER } from '../seo/canonicalFacts';
import { Cpu, FileText, Activity, BookOpen, Users, MapPin, AlertTriangle, Layers, Mail, ArrowRight, BookMarked, Quote } from 'lucide-react';

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
    a: 'Yes. The Acoustic Bench, SPECTRA//LAB, SYNTHESIS//SIGNAL, EMOTION//SPECTRUM and VOID//OCULUS run entirely in the browser using the Web Audio API, Canvas and WebGL, with no account or download required.'
  },
  {
    q: 'How do I cite an archive record?',
    a: 'Every record page includes a “Cite” action that copies a formatted citation containing the record identifier, title, the Institute as publisher and the canonical URL. The Institute’s full citation policy, with APA, BibTeX and Chicago templates, is published at /cite.'
  },
  {
    q: 'Is the Zazie Institute a real university? Is it accredited?',
    a: STATUS_ANSWER.short
  },
  {
    q: 'Who founded the Zazie Institute of Applied Anomalies?',
    a: 'ZIAA was founded by Zazie Kanwar-Torge in 2021 in the Mojave Basin, California. Zazie Kanwar-Torge is the founder and owner of Zazie Productions LLC, which operates the Institute as its research division, and serves as the Institute’s founder and director.'
  },
  {
    q: 'Who operates the Zazie Institute of Applied Anomalies?',
    a: 'ZIAA is operated by Zazie Productions LLC — founded and owned by Zazie Kanwar-Torge — as its research division. It was founded in 2021 in the Mojave Basin, California, and its research cycle has run from 2021 through 2026 under the direction of its founder and founding researchers.'
  }
];

export const About: React.FC = () => (
  <div className="space-y-6 font-serif">
      <Seo
        title="About the Institute"
        description={`About the ${ENTITY.name} (ZIAA): independent research institute founded by Zazie Kanwar-Torge and operated by Zazie Productions LLC.`}
        path="/about"
        keywords={['about ZIAA', 'Zazie Institute', 'Zazie Kanwar-Torge', 'Zazie Kanwar-Torge ZIAA', 'Zazie Productions LLC founder', 'independent research institute', 'applied anomalies', 'experimental audio research', ...ENTITY.fields]}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          aboutPageSchema('/about'),
          organizationSchema({ description: prestigeLead(archiveStats) }),
          founderPersonSchema(),
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
            {prestigeLead(archiveStats)}
          </p>
        </div>
      </div>
    </header>

    {/* Institute at a glance — the count-bearing canonical facts, machine- and human-readable */}
    <section aria-labelledby="at-a-glance" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="at-a-glance" className="text-lg font-bold text-white">The Institute at a glance</h2>
        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Research cycle {archiveStats.operationalYears}</span>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {instituteAtAGlance(archiveStats).map(item => (
          <Link
            key={item.label}
            to={item.to}
            className="p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group block"
          >
            <dt className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 group-hover:text-[#dfb76c] flex items-center gap-1.5">
              <BookMarked className="w-3 h-3" aria-hidden="true" /> {item.label}
            </dt>
            <dd className="text-2xl font-mono font-bold text-white mt-1.5">{item.value}</dd>
          </Link>
        ))}
      </dl>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
        {prestigeDescriptionLong(archiveStats)}
      </p>
    </section>

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
          <strong className="text-zinc-100">{ENTITY.legalParent}</strong>, founded and owned by{' '}
          <Link to="/founder" className="text-[#dfb76c] hover:underline font-bold">Zazie Kanwar-Torge</Link>,
          the Institute&apos;s founder and director. Its archive spans the {archiveStats.operationalYears}{' '}
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
              <Link to={disciplinePath(d)} className="flex items-center gap-1.5 text-zinc-200 hover:text-[#dfb76c]">
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
          <div><dt className="text-zinc-400">Founded</dt><dd className="text-zinc-100">{ENTITY.founded} — {CANONICAL.foundingLocation}</dd></div>
          <div><dt className="text-zinc-400">Founder &amp; director</dt><dd className="text-zinc-100"><Link to="/founder" className="text-[#dfb76c] hover:underline">{FOUNDER.name}</Link></dd></div>
          <div><dt className="text-zinc-400">Founding researchers</dt><dd className="text-zinc-100">{CANONICAL.founders.join(', ')}</dd></div>
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

    <section aria-labelledby="founder-ownership" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="founder-ownership" className="text-lg font-bold text-white">Founder &amp; Ownership</h2>
      <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
        {FOUNDER_STATEMENT}
      </p>
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <Link to="/founder" className="px-3 py-1.5 bg-[#0a121e] border border-[#dfb76c]/60 hover:border-[#dfb76c] rounded text-[#dfb76c]">Zazie Kanwar-Torge — founder bio →</Link>
        <Link to="/legal/institutional-status" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Institutional Status notice</Link>
        <Link to="/legal/trademarks" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Trademarks &amp; IP Notice</Link>
      </div>
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

    <section aria-labelledby="featured-dossiers" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="featured-dossiers" className="text-lg font-bold text-white">Representative technical dossiers — descriptive reading</h2>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
        Three representative dossiers from the Institute&apos;s longest-running lines of work — optical recovery of
        historical audio carriers, whole-body tactile listening, and autonomous generative composition. Each is linked
        to its division hub and to the Transactions volume that treats the same method.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <li className="h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#dfb76c]">PROT-025 — Signal Archaeology · prototype dossier</div>
            <div className="font-bold text-zinc-100 mt-1">Non-contact laser profilometer for historical grooved audio carriers</div>
            <div className="text-zinc-400 mt-1.5 leading-relaxed">Optical scanning and artifact-isolation techniques for fragile recordings.</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
            <Link to={recordPath('prototype', 'PROT-025')} className="text-[#dfb76c] hover:underline">View PROT-025 dossier →</Link>
            <span className="text-zinc-600">·</span>
            <Link to={monographPath('ESSAY-2023-02')} className="text-cyan-400 hover:underline">ESSAY-2023-02: media archaeology of inscribed sound →</Link>
          </div>
        </li>
        <li className="h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#dfb76c]">PROT-017 — Perceptual Interfaces · tactile acoustics</div>
            <div className="font-bold text-zinc-100 mt-1">128-point tactile somatosensory floor array for whole-body listening</div>
            <div className="text-zinc-400 mt-1.5 leading-relaxed">Psychoacoustic research on vibrotactile spatialisation and whole-body perception.</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
            <Link to={recordPath('prototype', 'PROT-017')} className="text-[#dfb76c] hover:underline">View PROT-017 dossier →</Link>
            <span className="text-zinc-600">·</span>
            <Link to={monographPath('ESSAY-2024-03')} className="text-cyan-400 hover:underline">ESSAY-2024-03: spatial psychoacoustics →</Link>
          </div>
        </li>
        <li className="h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded group flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#dfb76c]">PROT-042 — Computational Creativity · generative software</div>
            <div className="font-bold text-zinc-100 mt-1">Real-time neural latent audio resynthesizer with multi-vector joystick</div>
            <div className="text-zinc-400 mt-1.5 leading-relaxed">Generative composition via neural audio morphing and procedural scoring.</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
            <Link to={recordPath('prototype', 'PROT-042')} className="text-[#dfb76c] hover:underline">View PROT-042 dossier →</Link>
            <span className="text-zinc-600">·</span>
            <Link to={monographPath('ESSAY-2025-05')} className="text-cyan-400 hover:underline">ESSAY-2025-05: autonomous audio agents →</Link>
          </div>
        </li>
      </ul>
      <p className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-[#1b2636]">
        Interactive instruments: <Link to="/acoustic-bench" className="text-emerald-400 hover:underline">Acoustic Bench — Web Audio DSP workstation with oscilloscope</Link> · <Link to="/spectra-lab" className="text-cyan-400 hover:underline">SPECTRA//LAB — audiovisual 64-band spectral console</Link> · <Link to="/synthesis-signal" className="text-violet-300 hover:underline">SYNTHESIS//SIGNAL — Three.js audio-reactive environment</Link> · <Link to="/emotion-spectrum" className="text-[#b7a8ff] hover:underline">EMOTION//SPECTRUM — playable electromagnetic emotion ribbon</Link>
      </p>
    </section>

    {/* Institutional reference documents — canonical definitions + citation policy */}
    <section aria-labelledby="reference-docs" className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
      <Link to="/lexicon" className="p-4 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group block">
        <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c] flex items-center gap-2"><BookMarked className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" /> Lexicon — Institutional Vocabulary</div>
        <p className="text-zinc-400 mt-1.5 leading-relaxed">Canonical definitions of the Institute&apos;s method terms — applied anomalies, signal archaeology, wave-terrain synthesis, defensive publication and more.</p>
      </Link>
      <Link to="/cite" className="p-4 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group block">
        <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c] flex items-center gap-2"><Quote className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" /> Citation Policy</div>
        <p className="text-zinc-400 mt-1.5 leading-relaxed">How to cite the archive and its records: publisher string, ISSN, and APA / BibTeX / Chicago templates for the Transactions series.</p>
      </Link>
      <Link to="/disciplines" className="p-4 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group block">
        <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c] flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" /> Research Divisions (8)</div>
        <p className="text-zinc-400 mt-1.5 leading-relaxed">Each division has a canonical hub with its research program, prototype and patent cluster, and a division-level FAQ.</p>
      </Link>
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
