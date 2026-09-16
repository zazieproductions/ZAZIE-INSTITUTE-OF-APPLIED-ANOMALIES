import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { CANONICAL, CITATION, recordCitation, STATUS_ANSWER } from '../seo/canonicalFacts';
import { breadcrumbSchema, founderPersonSchema, organizationSchema, faqPageSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE_URL } from '../seo/site';
import { Copy, Check, BookOpen } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Citation Policy', path: '/cite' }
];

type Style = 'apa' | 'bibtex' | 'chicago';
const STYLES: { id: Style; label: string }[] = [
  { id: 'apa', label: 'APA' },
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'chicago', label: 'Chicago' }
];

/** Worked examples — real records, stable accessions. */
const MONO = {
  identifier: 'ESSAY-2022-01',
  title: 'Nonlinear Acoustic Feedback in Architectural Spaces: Harnessing Resonant Anomalies for Generative Sound Systems',
  authors: ['Dr. V. A. Thorne', 'Soren Lindqvist', 'Elena Mstislav'],
  year: '2022',
  url: `${SITE_URL}/monographs/essay-2022-01`,
  container: 'ZIAA Transactions on Applied Anomalies & Experimental Systems, Volume IV, Issue 1'
};
const PROTO = {
  identifier: 'PROT-001',
  title: 'FEEDBACK-RES — Self-Regulating Acoustic Feedback Resonator with Optical Hysteresis',
  authors: ['Dr. V. A. Thorne'],
  year: '2021',
  url: `${SITE_URL}/prototypes/prot-001`
};

const FAQ = [
  {
    q: 'How do I cite a ZIAA monograph?',
    a: 'Cite it by title, authors, volume, year and canonical URL under /monographs/. The Transactions series carries ISSN 2834-9180 (online). A formatted citation in APA, BibTeX or Chicago is available on every monograph page.'
  },
  {
    q: 'Are ZIAA monographs peer-reviewed?',
    a: 'Monographs are reviewed by the Institute’s fellow panel before accession. ZIAA is an independent research institute; it is not an accredited university, and its review process is the Institute’s own, as described in the institutional status notice.'
  },
  {
    q: 'Can I cite a prototype or a patent dossier?',
    a: 'Yes. Every record — prototype, defensive disclosure, research note, post-mortem, fellow profile or field station — has a canonical URL and a “Cite” action that produces a formatted citation with the record’s stable accession identifier.'
  },
  {
    q: 'Is the Zazie Institute accredited or affiliated with a university?',
    a: STATUS_ANSWER.short
  }
];

const CopyRow: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-[#dfb76c] rounded transition-colors"
      aria-live="polite"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

export const CitePolicy: React.FC = () => {
  return (
    <div className="space-y-6 font-serif">
      <Seo
        title="Citation Policy — How to Cite the Archive"
        description={`Citation policy of the Zazie Institute of Applied Anomalies (ZIAA): publisher string, ISSN, and APA, BibTeX and Chicago templates for citing the Institute, its monographs and individual archive records.`}
        path="/cite"
        keywords={['cite ZIAA', 'ZIAA citation', 'how to cite Zazie Institute', 'ZIAA ISSN', 'BibTeX ZIAA', 'academic citation archive']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          organizationSchema(),
          founderPersonSchema(),
          faqPageSchema(FAQ)
        ]}
      />

      <header className="bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 space-y-4">
        <Breadcrumbs crumbs={CRUMBS} />
        <div className="space-y-3 max-w-3xl">
          <span className="archival-stamp font-mono text-[9.5px]">CITATION POLICY</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            Citation Policy — How to Cite the Institute and Its Records
          </h1>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            The archive is maintained as a permanent, citable research record. This page publishes the Institute&apos;s
            preferred citation forms: the publisher string, the Transactions series identifiers, and formatted templates
            for citing the Institute as a corpus, a monograph, or an individual record.
          </p>
        </div>
      </header>

      {/* Citing the Institute */}
      <section aria-labelledby="cite-institute" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
        <h2 id="cite-institute" className="text-lg font-bold text-white">Citing the Institute</h2>
        <div className="p-4 bg-[#03060a] border border-[#1b2738] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Root citation (APA)</span>
            <CopyRow text={CITATION.rootCitation} />
          </div>
          <code className="block font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{CITATION.rootCitation}</code>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The Institute was founded by <Link to="/founder" className="text-[#dfb76c] hover:underline">Zazie Kanwar-Torge</Link>,
          founder and owner of {CANONICAL.legalParent}, which holds all trademarks and copyrights in the archive — see the{' '}
          <Link to="/legal/trademarks" className="text-[#dfb76c] hover:underline">Trademarks &amp; IP Notice</Link>.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-[#03060a] border border-[#1b2738] rounded-lg"><dt className="text-zinc-400">Publisher string</dt><dd className="text-zinc-100 mt-1">{CITATION.publisher}</dd></div>
          <div className="p-3.5 bg-[#03060a] border border-[#1b2738] rounded-lg"><dt className="text-zinc-400">Series</dt><dd className="text-zinc-100 mt-1">{CITATION.journalTitle}</dd></div>
          <div className="p-3.5 bg-[#03060a] border border-[#1b2738] rounded-lg"><dt className="text-zinc-400">ISSN (online)</dt><dd className="text-zinc-100 mt-1">{CITATION.issnForm}</dd></div>
          <div className="p-3.5 bg-[#03060a] border border-[#1b2738] rounded-lg"><dt className="text-zinc-400">Archive URL</dt><dd className="text-zinc-100 mt-1">{CANONICAL.url}</dd></div>
        </dl>
      </section>

      {/* Citing a monograph */}
      <section aria-labelledby="cite-mono" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="cite-mono" className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" /> Citing a monograph (worked example)
          </h2>
          <Link to={MONO.url.replace(SITE_URL, '')} className="text-xs font-mono text-[#dfb76c] hover:underline">ESSAY-2022-01 dossier →</Link>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Worked example from the Transactions series. The same format applies to every volume; each monograph page
          provides its own formatted citation in all three styles, and its PDF carries matching title, author and
          subject metadata.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {STYLES.map(s => (
            <div key={s.id} className="p-4 bg-[#03060a] border border-[#1b2738] rounded-lg flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-cyan-300">{s.label}</span>
                <CopyRow text={recordCitation(MONO, s.id)} />
              </div>
              <code className="font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap flex-1">{recordCitation(MONO, s.id)}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Citing a record */}
      <section aria-labelledby="cite-record" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
        <h2 id="cite-record" className="text-lg font-bold text-white">Citing individual records</h2>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">{CITATION.howToCiteNote}</p>
        <div className="p-4 bg-[#03060a] border border-[#1b2738] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Record citation example (APA) — {PROTO.identifier}</span>
            <CopyRow text={recordCitation(PROTO, 'apa')} />
          </div>
          <code className="block font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{recordCitation(PROTO, 'apa')}</code>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
          PDF-bearing surfaces (monographs and defensive disclosures) additionally expose Scholar-style citation
          metadata — <code className="text-cyan-300 font-mono">citation_title</code>,{' '}
          <code className="text-cyan-300 font-mono">citation_author</code>,{' '}
          <code className="text-cyan-300 font-mono">citation_pdf_url</code> and{' '}
          <code className="text-cyan-300 font-mono">citation_issn</code> — alongside the record&apos;s JSON-LD.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl border-l-2 border-[#23354d] pl-3">
          {CITATION.statusNote} See the{' '}
          <Link to="/legal/institutional-status" className="text-[#dfb76c] hover:underline">Institutional Status notice</Link>.
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="cite-faq" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
        <h2 id="cite-faq" className="text-lg font-bold text-white">Citation questions</h2>
        <dl className="space-y-4 text-sm">
          {FAQ.map(f => (
            <div key={f.q} className="border-l-2 border-[#dfb76c]/60 pl-4">
              <dt className="font-bold text-zinc-100">{f.q}</dt>
              <dd className="text-zinc-300 leading-relaxed mt-1">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Institute reference" className="flex flex-wrap gap-2 text-xs font-mono justify-center">
        <Link to="/about" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">About the Institute</Link>
        <Link to="/lexicon" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Lexicon</Link>
        <Link to="/monographs" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Monographs</Link>
        <Link to="/legal/institutional-status" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Institutional Status</Link>
      </nav>
    </div>
  );
};

export default CitePolicy;
