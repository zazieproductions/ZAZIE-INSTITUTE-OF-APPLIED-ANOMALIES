import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, founderPersonSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ENTITY, FOUNDER } from '../seo/site';
import { TRADEMARK_NOTICE } from '../seo/canonicalFacts';
import {
  Scale,
  Lock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Printer,
  Award,
  BadgeCheck
} from 'lucide-react';

import { LEGAL_SLUGS, legalPath, type LegalSectionKey } from '../routes/legal';

const SEO: Record<LegalSectionKey, { title: string; description: string }> = {
  status: {
    title: 'Institutional Status & Organizational Notice',
    description: 'Institutional status of the Zazie Institute of Applied Anomalies (ZIAA): an independent, non-accredited research and creative-technology initiative operated by Zazie Productions LLC. Legal structure and governance disclosures.'
  },
  disclaimer: {
    title: 'Research & Speculation Disclaimer',
    description: 'Disclaimer for ZIAA materials: experimental research, artistic research, speculative engineering, design fiction and ARG elements published by the Zazie Institute of Applied Anomalies are not peer-reviewed findings or issued patents.'
  },
  terms: {
    title: 'Terms of Use',
    description: 'Terms of use for zazieinstitute.org: archival access licence, intellectual property in ZIAA prototypes, dossiers and software, and limitations of liability for the Zazie Institute of Applied Anomalies.'
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy for zazieinstitute.org: ZIAA instruments process audio and files locally in the browser, collect no telemetry and store session data only on your device. Data protection notice from Zazie Productions LLC.'
  },
  trademarks: {
    title: 'Trademarks & IP Notice',
    description: 'Trademark and copyright notice for the Zazie Institute of Applied Anomalies (ZIAA): all Institute names, marks and crests are trademarks of Zazie Productions LLC, founded by Zazie Kanwar-Torge. Full mark schedule.'
  }
};

export const LegalDisclosuresPage: React.FC = () => {
  const { section = 'institutional-status' } = useParams<{ section: string }>();
  const activeSection = (Object.keys(LEGAL_SLUGS) as LegalSectionKey[]).find(k => LEGAL_SLUGS[k] === section);
  if (!activeSection) return <Navigate to="/404" replace />;
  const meta = SEO[activeSection];
  const crumbs = [
    { name: 'ZIAA', path: '/' },
    { name: 'Legal & Disclosures', path: legalPath('status') },
    { name: meta.title, path: legalPath(activeSection) }
  ];

  const handlePrint = () => {
    window.print();
  };

  const sections: Array<{
    key: LegalSectionKey;
    label: string;
    code: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      key: 'status',
      label: 'Institutional Status',
      code: 'ZIAA-DISCL-001-INST',
      icon: Award,
      description: 'Entity legal structure, non-accredited status & governance disclosures.'
    },
    {
      key: 'disclaimer',
      label: 'Research / Speculation Disclaimer',
      code: 'ZIAA-DISCL-002-RSPEC',
      icon: AlertTriangle,
      description: 'Experimental research, speculative engineering, ARG & worldbuilding scope.'
    },
    {
      key: 'terms',
      label: 'Terms of Use',
      code: 'ZIAA-DISCL-003-TERMS',
      icon: Scale,
      description: 'Archival access license, intellectual property & liability limitations.'
    },
    {
      key: 'privacy',
      label: 'Privacy Policy',
      code: 'ZIAA-DISCL-004-PRIV',
      icon: Lock,
      description: 'Client-side local processing, zero-telemetry & data protection notice.'
    },
    {
      key: 'trademarks',
      label: 'Trademarks & IP',
      code: 'ZIAA-DISCL-005-TM',
      icon: BadgeCheck,
      description: 'Trademark schedule, copyright notice & permitted-use terms. Owner: Zazie Productions LLC.'
    }
  ];

  return (
    <article className="space-y-8 font-serif text-zinc-300 max-w-5xl mx-auto pb-16">
      <Seo
        title={`${meta.title} - Legal & Disclosures`}
        description={meta.description}
        path={legalPath(activeSection)}
        jsonLd={[
          breadcrumbSchema(crumbs),
          founderPersonSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: meta.title,
            description: meta.description,
            url: `https://zazieinstitute.org${legalPath(activeSection)}`,
            isPartOf: { '@type': 'WebSite', url: 'https://zazieinstitute.org/', name: ENTITY.name },
            publisher: { '@type': 'Organization', name: ENTITY.legalParent },
            copyrightHolder: { '@type': 'Organization', name: ENTITY.legalParent },
            copyrightYear: '2021-2026',
            author: { '@type': 'Person', name: FOUNDER.name, url: `https://zazieinstitute.org${FOUNDER.path}` }
          }
        ]}
      />
      {/* Top Banner / Masthead */}
      <header className="bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none">
          <InstitutionalCrest size={320} variant="gold" decorative />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Breadcrumbs crumbs={crumbs} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="archival-stamp font-mono text-[9px]">
                OFFICIAL DISCLOSURE REGISTRY
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#162233] text-cyan-300 border border-cyan-800/60">
                AUDITED 2026 CYCLE
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#161309] border border-[#8c6d31]/60 text-[#dfb76c]">
                PUBLIC ACCESS RECORD
              </span>
            </div>

            <p className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">Legal, Institutional &amp; Speculative Disclosures</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{meta.title}</h1>

            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Mandatory disclosures regarding the institutional status, experimental research scope, speculative 
              worldbuilding content, access conditions, and privacy policies governing{' '}
              <strong className="text-zinc-200">zazieinstitute.org</strong> and the{' '}
              <strong className="text-[#dfb76c]">Zazie Institute of Applied Anomalies (ZIAA)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#070e17] hover:bg-[#0c1827] border border-[#2b3e58] text-[#dfb76c] text-xs font-mono transition-colors"
              title="Print disclosure document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Record</span>
            </button>
          </div>
        </div>

        {/* Global Summary Notice Box */}
        <div className="mt-6 p-4 rounded-lg bg-[#020509]/90 border border-[#213045] text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#dfb76c] font-bold font-mono text-[11px] tracking-wider uppercase">
            <Info className="w-4 h-4 text-[#dfb76c] shrink-0" />
            <span>Essential Institutional Notice (Summary)</span>
          </div>
          <p className="text-zinc-300 leading-relaxed text-xs">
            The <strong>Zazie Institute of Applied Anomalies (ZIAA)</strong> is an independent experimental and creative 
            research initiative operated as an R&D division of <strong>Zazie Productions LLC</strong>. 
            ZIAA is <strong>not</strong> an accredited university, college, government agency, or standards organization. 
            Materials published across this repository encompass experimental research, artistic research, speculative engineering, 
            prototypes, design fiction, fictionalized institutional lore, and Alternate Reality Game (ARG) elements. 
            Unless explicitly stated otherwise, ZIAA materials are not peer-reviewed academic findings, issued governmental patents, 
            or professional certifications. All internal codes, report serials, and speculative patent claim schedules 
            represent ZIAA's internal classifications.
          </p>
        </div>
      </header>

      {/* Section navigation */}
      <nav aria-label="Disclosure documents" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {sections.map(s => {
          const isActive = activeSection === s.key;
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={legalPath(s.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between group ${
                isActive
                  ? 'bg-[#0a121e] border-[#dfb76c] shadow-[0_0_15px_rgba(223,183,108,0.15)] ring-1 ring-[#dfb76c]/40'
                  : 'bg-[#04070d] border-[#1b2738] hover:border-[#2b3d54] hover:bg-[#060c14]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[9px] font-mono tracking-wider ${isActive ? 'text-[#dfb76c]' : 'text-zinc-400'}`}>
                    {s.code}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#dfb76c]' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                </div>
                <div className={`text-xs font-bold font-serif ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                  {s.label}
                </div>
              </div>
              <p className="text-[10.5px] text-zinc-400 group-hover:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {s.description}
              </p>
            </Link>
          );
        })}
      </nav>

      {/* Main Document Content Container */}
      <div className="bg-[#05080f] border border-[#213045] rounded-xl p-6 md:p-10 shadow-xl space-y-10">
        {/* DOCUMENT VIEW 1: INSTITUTIONAL STATUS */}
        {activeSection === 'status' && (
          <section className="space-y-8 animate-fadeIn">
            {/* Document Header */}
            <div className="border-b border-[#1b2636] pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400">
                <span>DOCUMENT NO: ZIAA-DISCL-001-INST</span>
                <span>REVISION: 2026.09-FINAL</span>
                <span>AUTHORITY: ZAZIE PRODUCTIONS LLC</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Institutional Status & Organizational Notice
              </h2>
              <div className="text-xs text-[#c5a059] italic font-serif">
                Mandatory disclosure regarding organizational identity, non-accredited status, non-governmental nature, and research mandate.
              </div>
            </div>

            {/* Section 1: Entity Structure */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                1. Legal Entity & Operating Structure
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                The <strong>Zazie Institute of Applied Anomalies (ZIAA)</strong> is an independent experimental creative
                research initiative and speculative engineering laboratory operated as an internal research and development
                division of <strong>Zazie Productions LLC</strong>, a private commercial limited liability entity
                founded and owned by <strong>Zazie Kanwar-Torge</strong> (<Link to="/founder" className="text-[#dfb76c] hover:underline">founder bio</Link>).
              </p>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                ZIAA was established in 2021 to advance interdisciplinary investigations in modular audio systems,
                computational creativity, physical computing, tactile perceptual interfaces, psychoacoustics, and speculative design.
                All operations, publications, codebases, hardware prototypes, and physical workspaces are funded, owned,
                and governed directly under the auspices of Zazie Productions LLC.
              </p>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                All Institute names, marks, crests and instrument titles are common-law trademarks of{' '}
                <strong>Zazie Productions LLC</strong>, and all archive materials are copyright{' '}
                <strong>{TRADEMARK_NOTICE.copyright}</strong> The complete mark schedule is published in the{' '}
                <Link to={legalPath('trademarks')} className="text-[#dfb76c] hover:underline">Trademarks &amp; Intellectual Property Notice</Link>.
              </p>
            </div>

            {/* Section 2: Non-Accreditation Disclosures */}
            <div className="space-y-4 bg-[#020509] border border-[#1b2636] p-5 rounded-lg">
              <h3 className="text-sm font-bold font-mono text-red-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                2. Explicit Non-Affiliation & Non-Accreditation Declarations
              </h3>

              <div className="space-y-3 text-xs md:text-sm text-zinc-300 leading-relaxed">
                <div className="border-l-2 border-[#8c6d31] pl-3.5 py-0.5">
                  <strong className="text-zinc-100 block mb-0.5">Not an Accredited Academic Institution:</strong>
                  ZIAA is <strong>not</strong> an accredited university, college, polytechnic, conservatory, or degree-granting 
                  educational institution. It does not hold accreditation from the United States Department of Education, the 
                  Council for Higher Education Accreditation (CHEA), or any international higher-education accrediting commission. 
                  Archival references to "fellows," "chairs," "faculties," "departments," "dissertations," or "monographs" are 
                  artistic-institutional design concepts and creative categorizations, not accredited academic degrees or credentials.
                </div>

                <div className="border-l-2 border-[#8c6d31] pl-3.5 py-0.5">
                  <strong className="text-zinc-100 block mb-0.5">Not a Government Body or Military Bureau:</strong>
                  ZIAA is <strong>not</strong> a municipal, state, federal, or international governmental department, bureau, 
                  agency, or armed forces affiliate. Any thematic designations of "clearance levels" (e.g., 1-ALPHA, 2-BETA, 
                  3-GAMMA, 4-DELTA, BLACK-BOX), "restricted archives," "containment zones," or "regulatory post-mortems" 
                  are diegetic worldbuilding elements designed to frame creative technological artifacts.
                </div>

                <div className="border-l-2 border-[#8c6d31] pl-3.5 py-0.5">
                  <strong className="text-zinc-100 block mb-0.5">Not a Standards Organization:</strong>
                  ZIAA does <strong>not</strong> function as an official standards-development organization (SDO) or regulatory 
                  authority. ZIAA does not certify, issue, or enforce engineering, communications, or safety standards (such as 
                  IEEE, ISO, NIST, IEC, ANSI, or ITU). All technical specifications and protocols published herein are exploratory 
                  design specifications for experimental prototypes.
                </div>
              </div>
            </div>

            {/* Section 3: Archival Numbering and Bibliographic Conventions */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                3. Archival Classifications & Bibliographic Markers
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                All accession codes, prototype serial numbers (e.g., <code className="text-cyan-300 font-mono text-xs">PROT-001</code> through{' '}
                <code className="text-cyan-300 font-mono text-xs">PROT-161</code>), report codes, speculative patent dossiers 
                (e.g., <code className="text-cyan-300 font-mono text-xs">PAT-2021-001</code>), lab log identifiers 
                (<code className="text-emerald-300 font-mono text-xs">LOG-001</code>), and commit hashes are <strong>internal ZIAA classifications</strong>. 
                They serve as organizational tools for creative practice and do not confer external legal status or governmental recognition.
              </p>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Bibliographic notations formatted according to standard scholarly structures (including simulated DOI numbers 
                such as <code className="text-zinc-400 font-mono text-xs">10.1088/ZIAA</code>, simulated ISSN markers, or BibTeX/APA citation schemes) 
                are provided to facilitate artistic documentation, digital curation, and archival citation within our creative community. 
                They do not denote external indexing in Crossref, PubMed, IEEE Xplore, or the Library of Congress unless accompanied by external verification.
              </p>
            </div>

            {/* Section 4: Governance & Direct Inquiries */}
            <div className="space-y-3 border-t border-[#1b2636] pt-6">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                4. Administrative & Inquiries Channel
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Official corporate, research partnership, licensing, or verification inquiries should be directed to the corporate administration:
              </p>
              <div className="p-4 rounded-lg bg-[#020509] border border-[#1b2636] font-mono text-xs text-zinc-300 space-y-1">
                <div className="text-white font-bold">ZAZIE PRODUCTIONS LLC</div>
                <div>Founder &amp; Owner: Zazie Kanwar-Torge</div>
                <div>Directorate of Administration & Legal Affairs</div>
                <div className="text-zinc-400">Initiative: Zazie Institute of Applied Anomalies (ZIAA)</div>
                <div className="text-cyan-400">Web: zazieinstitute.org · zazieproductions.com</div>
              </div>
            </div>
          </section>
        )}

        {/* DOCUMENT VIEW 2: RESEARCH / SPECULATION DISCLAIMER */}
        {activeSection === 'disclaimer' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#1b2636] pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400">
                <span>DOCUMENT NO: ZIAA-DISCL-002-RSPEC</span>
                <span>SCOPE: SITE-WIDE DISCLOSURE</span>
                <span>STATUS: ACTIVE MANDATORY</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Research, Speculation & Worldbuilding Disclaimer
              </h2>
              <div className="text-xs text-[#c5a059] italic font-serif">
                Explicit classification of artistic research, speculative engineering, design fiction, and absence of external certifications.
              </div>
            </div>

            {/* Section 1: Multidisciplinary Scope */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                1. Nature of Site Holdings & Content Disciplines
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Visitors to <strong>zazieinstitute.org</strong> are advised that materials throughout this archive represent 
                an intentional continuum of functional technical prototyping, artistic exploration, and creative worldbuilding. 
                Materials on this site may contain:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Experimental Research
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Custom analog/digital audio circuits, C++ DSP firmware, acoustic test measurements, and benchtop hardware rigs 
                    developed in exploratory studio sessions.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Artistic Research
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Interdisciplinary creative practice in psychoacoustics, algorithmic composition, spatialized sound, 
                    and tactile human-machine performance surfaces.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-[#dfb76c] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#dfb76c]" />
                    Speculative Engineering
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hypothetical acoustic transducers, exploratory signal topologies, and conceptual instruments designed 
                    to probe technological and perceptual edge conditions.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Prototypes
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Working bench models, proof-of-concept interactive software (such as SYNTHESIS-SIGNAL), 
                    and physical instruments at varying degrees of completion.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    Design Fiction
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Diegetic artifacts, counterfactual technical documentation, and speculative narratives examining 
                    unrealized or alternative paths of sound technology.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#020509] border border-[#1b2636] space-y-1.5">
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ARG & Fictionalized Institutional Materials
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Alternate Reality Game (ARG) elements, anomaly post-mortems (the Black Vault), simulated internal clearances, 
                    and narrative institutional framing.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Absence of Peer Review and Patent Validation */}
            <div className="space-y-4 bg-[#020509] border border-[#1b2636] p-5 rounded-lg">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#dfb76c] shrink-0" />
                2. Non-Peer-Reviewed & Non-Patent Notice
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Unless explicitly and formally certified otherwise in an executed legal agreement:
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-zinc-300 list-disc list-inside">
                <li>
                  <strong className="text-white">Not Peer-Reviewed Academic Research:</strong> ZIAA materials have not been 
                  vetted, peer-reviewed, or published through certified academic science or engineering journals.
                </li>
                <li>
                  <strong className="text-white">Not Issued Government Patents:</strong> Documents classified under "Speculative Patents" 
                  are internal technical descriptions, defensive disclosures, and conceptual design fictions. They are <strong>not</strong> issued 
                  letters patent granted by the United States Patent and Trademark Office (USPTO), the European Patent Office (EPO), 
                  WIPO, or any sovereign patent registry.
                </li>
                <li>
                  <strong className="text-white">Not Professional Certifications:</strong> Materials do not constitute licensed engineering 
                  evaluations, regulatory safety listings (e.g. UL, CE, FCC), or certified acoustic standards.
                </li>
                <li>
                  <strong className="text-white">Not Externally Validated Scientific Findings:</strong> Theoretical assertions regarding 
                  "acoustic anomalies," "room hysteresis," or "sub-audible standing waves" represent exploratory creative models 
                  rather than validated consensus physics.
                </li>
              </ul>
            </div>

            {/* Section 3: Internal Identifiers */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                3. Internal Project Classifications
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                All internal project numbers, report numbers, technical memoranda, archive accession codes, and failure case numbers 
                are <strong>ZIAA’s own internal classifications</strong>. They establish an internal curatorial index for creative projects, 
                artistic assets, and narrative dossiers, and do not convey official regulatory or third-party status.
              </p>
            </div>

            {/* Section 4: Physical Safety and Reproduction Warning */}
            <div className="space-y-3 border-t border-[#1b2636] pt-6">
              <h3 className="text-sm font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                4. Physical Safety & Laboratory Recreation Disclaimer
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Schematic drawings, block diagrams, frequency specifications, and narrative incident post-mortems are works 
                of creative design and conceptual prototyping. <strong>Do not interpret speculative schematics or narrative warning tags 
                as certified instructions for hazardous physical builds.</strong>
              </p>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                High acoustic output (SPL), resonant electrical feedback, high-voltage amplifier rails, and laser scanning rigs 
                can produce serious physical, hearing, and electrical hazards. Zazie Productions LLC and ZIAA expressly disclaim all 
                responsibility or liability for any third-party attempt to assemble, power, or deploy physical apparatuses described herein.
              </p>
            </div>
          </section>
        )}

        {/* DOCUMENT VIEW 3: TERMS OF USE */}
        {activeSection === 'terms' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#1b2636] pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400">
                <span>DOCUMENT NO: ZIAA-DISCL-003-TERMS</span>
                <span>EFFECTIVE: SEPTEMBER 2026</span>
                <span>JURISDICTION: CALIFORNIA, USA</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Archival Terms of Access & Use
              </h2>
              <div className="text-xs text-[#c5a059] italic font-serif">
                Legal terms governing digital access, permitted non-commercial research, intellectual property, and warranty limitations.
              </div>
            </div>

            {/* Section 1: Agreement to Terms */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                1. Acceptance of Terms
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                By accessing, browsing, reading, or interacting with <strong>zazieinstitute.org</strong>, its online DSP modules, 
                prototype catalogues, speculative patent dossiers, and related digital assets, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Use, the Institutional Status Notice, and the Research / Speculation Disclaimer.
              </p>
            </div>

            {/* Section 2: Permitted Non-Commercial License */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                2. Limited License & Permitted Uses
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Zazie Productions LLC grants you a limited, non-exclusive, revocable, non-transferable license to access, view, 
                and interact with the archive for personal, educational, scholarly, artistic, and non-commercial research purposes.
              </p>
              <div className="space-y-2 text-xs md:text-sm text-zinc-400 pl-4 border-l border-[#23354d]">
                <p>• You may cite or reference individual archival records using the provided citation strings for academic review, criticism, or creative discussion.</p>
                <p>• You may not mirror, scrape at scale, reproduce, or commercially distribute substantial portions of the archive without prior written consent from Zazie Productions LLC.</p>
                <p>• You may not attempt to disrupt or bypass digital security, rate limits, or network services supporting the archive.</p>
              </div>
            </div>

            {/* Section 3: Intellectual Property */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                3. Intellectual Property Rights
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                All original text, technical dossiers, design fiction narratives, heraldic crests, 3D models, user interface designs,
                and custom DSP synthesis implementations are the proprietary intellectual property of <strong>Zazie Productions LLC</strong>
                (founded and owned by <strong>Zazie Kanwar-Torge</strong>), all rights reserved under United States and international
                copyright law. Copyright {TRADEMARK_NOTICE.copyright}
              </p>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Institute designations - including {TRADEMARK_NOTICE.marks.slice(0, 8).join('™, ')}™ - are common-law
                trademarks of Zazie Productions LLC. The full mark schedule, ownership record and permitted-use terms are
                published in the <Link to={legalPath('trademarks')} className="text-[#dfb76c] hover:underline">Trademarks &amp; Intellectual Property Notice</Link>,
                which forms part of these Terms.
              </p>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Open-source libraries incorporated into web workstations (such as Three.js, React, Tailwind CSS, Lucide icons, and Web Audio API interfaces) 
                remain the copyrighted property of their respective creators under their applicable open-source licenses.
              </p>
            </div>

            {/* Section 4: Interactive Workstations & Audio Safety */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                4. Interactive Tools & Audio Safety
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Interactive workstations (including SYNTHESIS-SIGNAL, SpectraLab, and Acoustic Bench) produce real-time synthesized 
                audio and reactive visual animations via Web Audio and WebGL.
              </p>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Users are solely responsible for setting appropriate speaker or headphone volume before triggering synthesized sound. 
                Certain interactive visual modules may generate rapid flashing or strobing effects at high displacement levels; 
                individuals with photosensitivity should exercise caution.
              </p>
            </div>

            {/* Section 5: Warranty Disclaimer & Liability Limitations */}
            <div className="space-y-3 bg-[#020509] border border-[#1b2636] p-5 rounded-lg">
              <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">
                5. Complete Disclaimer of Warranties & Limitation of Liability
              </h3>
              <p className="text-[11.5px] font-mono text-zinc-400 leading-relaxed uppercase">
                THE SITE, ARCHIVE, AND ALL MATERIALS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                OR NON-INFRINGEMENT.
              </p>
              <p className="text-[11.5px] font-mono text-zinc-400 leading-relaxed uppercase">
                IN NO EVENT SHALL ZAZIE PRODUCTIONS LLC, ITS OFFICERS, EMPLOYEES, CONTRACTORS, OR FELLOWS BE LIABLE FOR ANY DIRECT, 
                INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF DATA, ACOUSTIC DISCOMFORT, HARDWARE MALFUNCTION, 
                OR SYSTEM INTERRUPTIONS) ARISING OUT OF OR IN CONNECTION WITH ACCESS TO OR RELIANCE UPON THIS ARCHIVE.
              </p>
            </div>

            {/* Section 6: Governing Law */}
            <div className="space-y-3 border-t border-[#1b2636] pt-6 text-xs text-zinc-400">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider">
                6. Governing Law & Jurisdiction
              </h3>
              <p className="leading-relaxed">
                These Terms of Use shall be construed in accordance with and governed by the laws of the State of California, United States, 
                without giving effect to any principles of conflicts of law.
              </p>
            </div>
          </section>
        )}

        {/* DOCUMENT VIEW 4: PRIVACY POLICY */}
        {activeSection === 'privacy' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#1b2636] pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400">
                <span>DOCUMENT NO: ZIAA-DISCL-004-PRIV</span>
                <span>EFFECTIVE: SEPTEMBER 2026</span>
                <span>STANDARD: ZERO-TELEMETRY ETHOS</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Institutional Privacy & Client Data Protection Policy
              </h2>
              <div className="text-xs text-[#c5a059] italic font-serif">
                Minimal collection ethos, client-side local audio processing, zero biometric telemetry, and data privacy rights.
              </div>
            </div>

            {/* Section 1: Privacy Commitment */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                1. Privacy Architecture & Minimal Telemetry Ethos
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                The Zazie Institute of Applied Anomalies operates on a strict principle of <strong>data minimization</strong>. 
                We believe that research archives, creative computing tools, and speculative design works must be accessible 
                without user tracking, account walls, or commercial surveillance.
              </p>
            </div>

            {/* Section 2: Data We Do NOT Collect */}
            <div className="space-y-3 bg-[#020509] border border-[#1b2636] p-5 rounded-lg">
              <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                2. Information We Do Not Collect
              </h3>
              <div className="space-y-3 text-xs md:text-sm text-zinc-300">
                <p>
                  <strong className="text-white">No User Accounts or Passwords:</strong> Browsing dossiers, examining patents, 
                  reading monographs, or using interactive test benches requires no account creation, email registration, or credentials.
                </p>
                <p>
                  <strong className="text-white">No Audio File Uploads:</strong> When you drag-and-drop or select an audio file 
                  in SYNTHESIS-SIGNAL or the Acoustic Bench, the audio is decoded and processed <strong>entirely in local client memory</strong> via 
                  the Web Audio API. <em>No audio waveforms, filenames, or acoustic data are ever transmitted to or stored on ZIAA remote servers.</em>
                </p>
                <p>
                  <strong className="text-white">No Biometric or Surveillance Data:</strong> Thematic references in archival records 
                  to "voiceprint hashes," "ambient sensor telemetry," or "clearance verification" are narrative ARG worldbuilding elements. 
                  The site does not record your voice, access camera devices, or collect biometric signals.
                </p>
                <p>
                  <strong className="text-white">No Cross-Site Commercial Ad Trackers:</strong> We do not deploy third-party advertising cookies, 
                  retargeting pixels, or behavioral tracking networks.
                </p>
              </div>
            </div>

            {/* Section 3: Data Processed Locally */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                3. Client-Side Storage & Operational State
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                The site may store transient non-personally-identifiable state in your browser's <code className="text-cyan-300 font-mono text-xs">localStorage</code> or <code className="text-cyan-300 font-mono text-xs">sessionStorage</code>. 
                This is strictly utilized to preserve functional user preferences across page views:
              </p>
              <ul className="text-xs md:text-sm text-zinc-400 list-disc list-inside space-y-1 pl-3">
                <li>Audio playback mute state and volume settings</li>
                <li>Archive filter states (e.g. active discipline or status filters)</li>
                <li>Recent accession search queries</li>
                <li>Visual workspace theme and render preferences</li>
              </ul>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mt-2">
                This data stays on your local device and can be cleared at any time via your browser's cache or storage settings.
              </p>
            </div>

            {/* Section 4: Standard Infrastructure Logs */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                4. Routine Technical Infrastructure Logs
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Like all web hosting environments, our servers temporarily record basic connection metadata (such as IP address, 
                user-agent string, HTTP request URI, and timestamp) solely for network routing, security filtering, and DDoS prevention. 
                These technical logs are automatically cycled and are never correlated with personal user profiles.
              </p>
            </div>

            {/* Section 5: Privacy Inquiries */}
            <div className="space-y-3 border-t border-[#1b2636] pt-6">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                5. Privacy Inquiries & Exercising Rights
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                For questions regarding data practices or to submit an inquiry regarding information rights, contact:
              </p>
              <div className="p-4 rounded-lg bg-[#020509] border border-[#1b2636] font-mono text-xs text-zinc-300 space-y-1">
                <div className="text-white font-bold">ZAZIE PRODUCTIONS LLC - DATA GOVERNANCE</div>
                <div>Attention: Directorate of Privacy & Digital Ethics</div>
                <div className="text-zinc-400">Initiative: Zazie Institute of Applied Anomalies</div>
                <div className="text-cyan-400">URL: zazieinstitute.org</div>
              </div>
            </div>
          </section>
        )}

        {/* DOCUMENT VIEW 5: TRADEMARKS & INTELLECTUAL PROPERTY */}
        {activeSection === 'trademarks' && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#1b2636] pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-zinc-400">
                <span>DOCUMENT NO: ZIAA-DISCL-005-TM</span>
                <span>EFFECTIVE: SEPTEMBER 2026</span>
                <span>OWNER: ZAZIE PRODUCTIONS LLC</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Trademarks &amp; Intellectual Property Notice
              </h2>
              <div className="text-xs text-[#c5a059] italic font-serif">
                Ownership record, trademark schedule, copyright notice and permitted-use terms for all Institute marks and materials.
              </div>
            </div>

            {/* Section 1: Ownership */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                1. Ownership of Marks &amp; Materials
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                All trademarks, service marks, trade names, crests, logotypes and instrument titles associated with the{' '}
                <strong>Zazie Institute of Applied Anomalies (ZIAA)</strong> are owned by{' '}
                <strong>Zazie Productions LLC</strong>, a private company founded and owned by{' '}
                <strong>Zazie Kanwar-Torge</strong> (<Link to="/founder" className="text-[#dfb76c] hover:underline">founder bio</Link>),
                who is also the founder and director of the Institute. All archive text, technical dossiers, software,
                recordings, 3D models and interface designs are copyright{' '}
                <strong>{TRADEMARK_NOTICE.copyright}</strong>
              </p>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                The marks below are common-law trademarks asserted through continuous use in commerce since 2021. No
                registration with any trademark office is claimed by the ™ designation; it denotes ownership and active
                use by Zazie Productions LLC.
              </p>
            </div>

            {/* Section 2: Mark schedule */}
            <div className="space-y-3 bg-[#020509] border border-[#1b2636] p-5 rounded-lg">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[#dfb76c] shrink-0" />
                2. Trademark Schedule
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Each of the following is a trademark™ of <strong>Zazie Productions LLC</strong>. The schedule is
                non-exhaustive: any Institute name, crest, instrument title or series designation appearing on this
                site is claimed as a mark of the company whether or not it appears below.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {TRADEMARK_NOTICE.marks.map(mark => (
                  <li key={mark} className="flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#04070d] border border-[#1b2738] font-mono text-xs">
                    <span className="text-zinc-100">{mark}<span className="text-[#dfb76c]">™</span></span>
                    <span className="text-[10px] text-zinc-400 shrink-0">ZAZIE PRODUCTIONS LLC</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The ZIAA Institutional Crest™ (all variants: gold, monochrome, favicon, og-default) and the motto{' '}
                <em>Auditus Inauditi™</em> (‘hearing the unheard’) are likewise marks of Zazie Productions LLC.
              </p>
            </div>

            {/* Section 3: Copyright */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                3. Copyright Notice
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                {TRADEMARK_NOTICE.copyright} All original text, technical dossiers, design fiction narratives,
                heraldic crests, 3D models, user interface designs, custom DSP synthesis implementations, recordings
                and PDFs on zazieinstitute.org are the proprietary property of Zazie Productions LLC under United States
                and international copyright law. Open-source libraries incorporated into web workstations remain the
                property of their respective creators under their applicable licenses.
              </p>
            </div>

            {/* Section 4: Permitted use */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                4. Permitted Use of Marks
              </h3>
              <div className="space-y-2 text-xs md:text-sm text-zinc-400 pl-4 border-l border-[#23354d]">
                <p>• You may refer to Institute marks by name for nominative purposes - citation, criticism, review, scholarship and factual reporting - without implying endorsement, affiliation or sponsorship.</p>
                <p>• You may reproduce the provided citation strings, which name the Institute and its series as publisher, in academic and editorial contexts per the <Link to="/cite" className="text-[#dfb76c] hover:underline">Citation Policy</Link>.</p>
                <p>• You may not use any Institute mark as a business, product or service name, nor in any manner likely to cause confusion as to source or authorization.</p>
                <p>• You may not reproduce the ZIAA Institutional Crest™, logotypes or instrument artwork except as rendered incidentally by normal browsing, without prior written consent from Zazie Productions LLC.</p>
                <p>• Commercial, merchandising or co-branding uses of any mark require a written licence. Direct requests to the administration channel below.</p>
              </div>
            </div>

            {/* Section 5: Enforcement & contact */}
            <div className="space-y-3 border-t border-[#1b2636] pt-6">
              <h3 className="text-sm font-bold font-mono text-[#dfb76c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />
                5. Enforcement &amp; Licensing Inquiries
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Zazie Productions LLC enforces its marks against confusing, misleading or dilutive use. To report
                misuse or to request a licence, contact the corporate administration:
              </p>
              <div className="p-4 rounded-lg bg-[#020509] border border-[#1b2636] font-mono text-xs text-zinc-300 space-y-1">
                <div className="text-white font-bold">ZAZIE PRODUCTIONS LLC - INTELLECTUAL PROPERTY</div>
                <div>Founder &amp; Owner: Zazie Kanwar-Torge</div>
                <div className="text-zinc-400">Initiative: Zazie Institute of Applied Anomalies (ZIAA)</div>
                <div className="text-cyan-400">Web: zazieinstitute.org · zazieproductions.com</div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Certifications & Archival Stamp */}
      <div className="p-5 rounded-xl bg-[#03060a] border border-[#1a2536] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <InstitutionalCrest size={32} variant="gold" />
          <div>
            <div className="text-zinc-300 font-bold text-[11px]">
              ZAZIE PRODUCTIONS LLC // LEGAL REGISTRY
            </div>
            <div className="text-[10px] text-zinc-400">
              {TRADEMARK_NOTICE.copyright} Audited Repository Cycle 2021–2026 · All marks ™ of {ENTITY.legalParent}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span>RECORD: VERIFIED</span>
          <span>·</span>
          <span>DISCLOSURE LEVEL: PUBLIC</span>
          <span>·</span>
          <span className="text-[#dfb76c]">STATUS: FULL COMPLIANCE</span>
        </div>
      </div>
    </article>
  );
};

export default LegalDisclosuresPage;
