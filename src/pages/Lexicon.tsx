import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { VOCABULARY, type VocabTerm } from '../seo/canonicalFacts';
import { SITE_URL } from '../seo/site';
import { breadcrumbSchema, definedTermSetSchema, organizationSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BookMarked } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Lexicon', path: '/lexicon' }
];

const CATEGORIES: VocabTerm['category'][] = [
  'Discipline',
  'Method & apparatus',
  'Series & identifiers',
  'Instruments & stations'
];

const CATEGORY_NOTES: Record<VocabTerm['category'], string> = {
  Discipline:
    'The eight research divisions are the Institute’s primary topical units. Each has a canonical hub, a research program, and a complete cluster of prototypes and defensive disclosures.',
  'Method & apparatus':
    'Method terms used across the archive’s dossiers, research notes and monographs. Definitions are normative for the Institute’s documentation and for external citation of its work.',
  'Series & identifiers':
    'The Institute’s publication series and internal classification systems. Identifiers are stable accession keys designed for citation; their status as internal archival classifications is disclosed in the institutional status notice.',
  'Instruments & stations':
    'Named apparatus of the Institute: field stations, listening spaces and the browser-based research instruments that host the archive’s playable acoustic profiles.'
};

export const Lexicon: React.FC = () => {
  const terms = VOCABULARY;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title="Lexicon - Institutional Vocabulary"
        description={`Institutional lexicon of the Zazie Institute of Applied Anomalies (ZIAA): canonical definitions of the Institute's research divisions, method terms, publication series and named apparatus.`}
        path="/lexicon"
        keywords={['ZIAA lexicon', 'applied anomalies definition', 'signal archaeology definition', 'wave-terrain synthesis', 'defensive publication', 'institute terminology']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          definedTermSetSchema({
            path: '/lexicon',
            name: 'ZIAA Institutional Lexicon',
            description:
              'Canonical definitions of the terminology used by the Zazie Institute of Applied Anomalies: research divisions, method terms, publication series and named apparatus. Each term carries its canonical URL in the archive.',
            terms: terms.map(t => ({ term: t.term, definition: t.definition, url: t.url }))
          }),
          organizationSchema()
        ]}
      />

      <header className="bg-gradient-to-b from-[#060a12] via-[#05080f] to-[#03060a] border border-[#2b3d54] rounded-xl p-6 md:p-8 space-y-4">
        <Breadcrumbs crumbs={CRUMBS} />
        <div className="space-y-3 max-w-3xl">
          <span className="archival-stamp font-mono text-[9.5px]">INSTITUTIONAL LEXICON</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            Lexicon - Institutional Vocabulary of the Institute
          </h1>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            The Zazie Institute of Applied Anomalies works with a controlled technical vocabulary. This lexicon
            publishes the canonical definition of each term as used in the Institute&apos;s dossiers, research notes and
            monographs, with a link to the archival record where the term is documented in full.
          </p>
        </div>
      </header>

      {CATEGORIES.map(category => {
        const inCategory = terms.filter(t => t.category === category);
        if (inCategory.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`lex-${category.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-4">
            <div className="border-b border-[#1b2636] pb-3">
              <h2 id={`lex-${category.toLowerCase().replace(/[^a-z]+/g, '-')}`} className="text-lg font-bold text-white">{category}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1.5 max-w-3xl">{CATEGORY_NOTES[category]}</p>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inCategory.map(t => (
                <div key={t.term} className="p-4 bg-[#03060a] border border-[#1b2738] rounded-lg">
                  <dt className="text-sm font-bold text-[#dfb76c] flex items-center gap-2">
                    <BookMarked className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {t.term}
                  </dt>
                  <dd className="text-xs text-zinc-300 leading-relaxed mt-2">{t.definition}</dd>
                  <dd>
                    <Link to={t.url.slice(SITE_URL.length)} className="inline-flex items-center gap-1 mt-2.5 font-mono text-[10.5px] text-cyan-300 hover:text-white hover:underline">
                      Canonical record →
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      <section aria-labelledby="lex-usage" className="bg-[#05080f] border border-[#213045] rounded-xl p-6 space-y-3">
        <h2 id="lex-usage" className="text-sm font-bold text-white">Using the Institute&apos;s terminology</h2>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
          When citing ZIAA work, use the terms defined here in their canonical form. Division names, series titles and
          apparatus names are stable designations maintained by the Institute; the archive&apos;s{' '}
          <Link to="/cite" className="text-[#dfb76c] hover:underline">citation policy</Link> specifies how records
          should be cited, and the <Link to="/about" className="text-[#dfb76c] hover:underline">Institutional Status notice</Link>{' '}
          documents the classification of the Institute&apos;s internal identifiers.
        </p>
      </section>

      <nav aria-label="Institute reference" className="flex flex-wrap gap-2 text-xs font-mono justify-center">
        <Link to="/about" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">About the Institute</Link>
        <Link to="/cite" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Citation Policy</Link>
        <Link to="/disciplines" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Research Divisions</Link>
        <Link to="/monographs" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Monographs</Link>
      </nav>
    </div>
  );
};

export default Lexicon;
