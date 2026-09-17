import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { ENTITY, FOUNDER, SITE_URL } from '../seo/site';
import { FOUNDER_STATEMENT, TRADEMARK_NOTICE, STATUS_ANSWER } from '../seo/canonicalFacts';
import { breadcrumbSchema, founderPersonSchema, organizationSchema, faqPageSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { archiveStats } from '../data/archive';
import { Award, Building2, Scale, Mail, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Founder', path: '/founder' }
];

const FAQ = [
  {
    q: 'Who is Zazie Kanwar-Torge?',
    a: 'Zazie Kanwar-Torge is the founder and owner of Zazie Productions LLC and the founder and director of the Zazie Institute of Applied Anomalies (ZIAA), the independent research institute and open archive the company operates from the Mojave Basin, California.'
  },
  {
    q: 'Who founded the Zazie Institute of Applied Anomalies?',
    a: 'The Zazie Institute of Applied Anomalies (ZIAA) was founded by Zazie Kanwar-Torge in 2021 in the Mojave Basin, California, and has been operated since as the research division of Zazie Productions LLC.'
  },
  {
    q: 'Who owns Zazie Productions LLC?',
    a: 'Zazie Productions LLC is a private company founded and owned by Zazie Kanwar-Torge. The company funds, owns and governs all Institute operations, publications, prototypes and workspaces.'
  },
  {
    q: 'Who holds the trademarks and copyrights in ZIAA materials?',
    a: 'All Institute names, marks, crests and instrument titles are common-law trademarks of Zazie Productions LLC, and all archive materials are copyright © 2021–2026 Zazie Productions LLC. The full mark schedule is published at /legal/trademarks.'
  },
  {
    q: 'How do I contact Zazie Kanwar-Torge or the Institute?',
    a: 'Research, partnership, licensing and verification inquiries are directed to the Institute’s administration at research@zazieinstitute.org. See the Institutional Status notice for the full organizational record.'
  }
];

export const Founder: React.FC = () => (
  <div className="space-y-6 font-serif">
    <Seo
      title="Zazie Kanwar-Torge - Founder & Director"
      description="Zazie Kanwar-Torge is the founder and owner of Zazie Productions LLC and the founder and director of the Zazie Institute of Applied Anomalies (ZIAA)."
      path="/founder"
      keywords={[
        'Zazie Kanwar-Torge',
        'Zazie Kanwar-Torge ZIAA',
        'Zazie Kanwar-Torge Zazie Productions',
        'founder Zazie Institute of Applied Anomalies',
        'Zazie Productions LLC founder',
        'ZIAA director',
        'Zazie Kanwar-Torge founder'
      ]}
      jsonLd={[
        breadcrumbSchema(CRUMBS),
        founderPersonSchema(),
        organizationSchema(),
        faqPageSchema(FAQ)
      ]}
    />

    <header className="relative bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 overflow-hidden shadow-2xl space-y-4">
      <Breadcrumbs crumbs={CRUMBS} />
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <InstitutionalCrest size={96} variant="gold" className="shrink-0" />
        <div className="space-y-3">
          <span className="archival-stamp font-mono text-[9.5px]">INSTITUTIONAL LEADERSHIP</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            Zazie Kanwar-Torge
          </h1>
          <p className="text-sm text-[#dfb76c] font-medium">
            Founder &amp; Director, {ENTITY.name} ({ENTITY.abbreviation}) · Founder &amp; Owner, {ENTITY.legalParent}
          </p>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-3xl">
            {FOUNDER_STATEMENT}
          </p>
        </div>
      </div>
    </header>

    <section aria-labelledby="mandate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4 text-sm text-zinc-300 leading-relaxed">
        <h2 id="mandate" className="text-lg font-bold text-white">Leadership &amp; mandate</h2>
        <p>
          <strong className="text-zinc-100">Zazie Kanwar-Torge</strong> founded the {ENTITY.name} ({ENTITY.abbreviation}) in{' '}
          {ENTITY.founded} in the Mojave Basin, California, as the research division of{' '}
          <strong className="text-zinc-100">{ENTITY.legalParent}</strong>. As founder and director, {FOUNDER.name} sets
          the Institute&apos;s research program across its eight divisions - applied anomalies, experimental audio
          systems, computational creativity, speculative engineering, perceptual interfaces, generative software,
          signal archaeology and acoustic architecture - and directs the {archiveStats.operationalYears} research cycle
          documented in this archive.
        </p>
        <p>
          The archive {FOUNDER.name} established now holds {archiveStats.totalPrototypes} prototypes,{' '}
          {archiveStats.totalPatents} defensive patent disclosures, {archiveStats.totalLogs} research notes,{' '}
          {archiveStats.totalMonographs} monographs, {archiveStats.totalFieldSites} field stations and a fellowship of{' '}
          {archiveStats.totalPersonnel} researchers - published as a permanent, citable record under the Institute&apos;s{' '}
          <Link to="/cite" className="text-[#dfb76c] hover:underline">citation policy</Link>.
        </p>
        <h2 className="text-lg font-bold text-white pt-2">Ownership &amp; intellectual property</h2>
        <p>
          {ENTITY.legalParent}, founded and owned by {FOUNDER.name}, holds all rights in the Institute&apos;s names,
          marks, archive and instruments. Institute designations such as {TRADEMARK_NOTICE.marks.slice(0, 6).join('™, ')}™
          are trademarks of {ENTITY.legalParent}, and all archive materials are copyright {TRADEMARK_NOTICE.copyright} The
          complete mark schedule and usage terms are published in the{' '}
          <Link to="/legal/trademarks" className="text-[#dfb76c] hover:underline">Trademarks &amp; Intellectual Property Notice</Link>,
          and the organizational record in the{' '}
          <Link to="/legal/institutional-status" className="text-[#dfb76c] hover:underline">Institutional Status notice</Link>.
        </p>
      </div>

      <aside className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4 text-xs">
        <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider">Founder fact sheet</h2>
        <dl className="space-y-2.5 font-mono">
          <div><dt className="text-zinc-400">Name</dt><dd className="text-zinc-100">{FOUNDER.name}</dd></div>
          <div><dt className="text-zinc-400">Role</dt><dd className="text-zinc-100">{FOUNDER.shortRole}</dd></div>
          <div><dt className="text-zinc-400">Company</dt><dd className="text-zinc-100">{ENTITY.legalParent} (founder &amp; owner)</dd></div>
          <div><dt className="text-zinc-400">Institute</dt><dd className="text-zinc-100">{ENTITY.name} ({ENTITY.abbreviation})</dd></div>
          <div><dt className="text-zinc-400">Founded</dt><dd className="text-zinc-100">{ENTITY.founded} - Mojave Basin, California</dd></div>
          <div><dt className="text-zinc-400">Research cycle</dt><dd className="text-zinc-100">{archiveStats.operationalYears}</dd></div>
          <div>
            <dt className="text-zinc-400">Research inquiries</dt>
            <dd><a href={`mailto:${ENTITY.email}`} className="text-[#dfb76c] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" aria-hidden="true" />{ENTITY.email}</a></dd>
          </div>
        </dl>
        <h2 className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider pt-2">Records naming {FOUNDER.name}</h2>
        <ul className="space-y-1.5">
          <li><Link to="/about" className="text-zinc-300 hover:text-[#dfb76c] inline-flex items-center gap-1.5"><Award className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" /> About the Institute</Link></li>
          <li><Link to="/legal/institutional-status" className="text-zinc-300 hover:text-[#dfb76c] inline-flex items-center gap-1.5"><Building2 className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" /> Institutional Status notice</Link></li>
          <li><Link to="/legal/trademarks" className="text-zinc-300 hover:text-[#dfb76c] inline-flex items-center gap-1.5"><Scale className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" /> Trademarks &amp; IP Notice</Link></li>
          <li><Link to="/cite" className="text-zinc-300 hover:text-[#dfb76c] inline-flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" /> Citation Policy</Link></li>
        </ul>
      </aside>
    </section>

    <section aria-labelledby="founded-operates" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="founded-operates" className="text-lg font-bold text-white">What {FOUNDER.name} founded and operates</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <li>
          <Link to="/" className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group">
            <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c]">The Research Archive</div>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">The permanent public record of the Institute: prototypes, disclosures, notes and monographs.</p>
          </Link>
        </li>
        <li>
          <Link to="/disciplines" className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group">
            <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c]">Eight Research Divisions</div>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">The Institute&apos;s topical hubs, from applied anomalies to acoustic architecture.</p>
          </Link>
        </li>
        <li>
          <Link to="/monographs" className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group">
            <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c]">ZIAA Transactions Series</div>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">{archiveStats.totalMonographs} monograph volumes with citable dossiers and PDFs.</p>
          </Link>
        </li>
        <li>
          <Link to="/acoustic-bench" className="block h-full p-3.5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-lg group">
            <div className="font-bold text-zinc-100 group-hover:text-[#dfb76c]">Browser Instruments</div>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">Acoustic Bench, SPECTRA//LAB, VOID//OCULUS and SYNTHESIS//SIGNAL - no account required.</p>
          </Link>
        </li>
      </ul>
      <p className="text-[11px] text-zinc-500 font-mono border-t border-[#1b2636] pt-3">
        Canonical Person page: {SITE_URL}{FOUNDER.path} · Entity node: {SITE_URL}/founder#person
      </p>
    </section>

    <section aria-labelledby="founder-faq" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
      <h2 id="founder-faq" className="text-lg font-bold text-white">Founder questions</h2>
      <dl className="space-y-4 text-sm">
        {FAQ.map(f => (
          <div key={f.q} className="border-l-2 border-[#dfb76c]/60 pl-4">
            <dt className="font-bold text-zinc-100">{f.q}</dt>
            <dd className="text-zinc-300 leading-relaxed mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-[#23354d] pl-3">
        {STATUS_ANSWER.short}
      </p>
    </section>
  </div>
);

export default Founder;
