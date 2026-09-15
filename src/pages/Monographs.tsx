import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { loadMonographs, monographPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import type { Monograph } from '../data/types';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, creativeWorkSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE_URL } from '../seo/site';
import { Share2, Award, Printer, Copy, Check, Bookmark } from 'lucide-react';

const BASE_CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Monographs', path: '/monographs' }
];

export const Monographs: React.FC = () => {
  const monographs = useCollection(loadMonographs);
  const { id } = useParams<{ id?: string }>();
  const [citationModalOpen, setCitationModalOpen] = useState<boolean>(false);
  const [citationFormat, setCitationFormat] = useState<'bibtex' | 'apa' | 'ieee' | 'chicago'>('bibtex');
  const [copied, setCopied] = useState<boolean>(false);

  const active = id ? monographs.find(m => m.id.toLowerCase() === id.toLowerCase()) : undefined;
  if (id && !active) return <Navigate to="/404" replace />;
  if (id && active && id !== active.id.toLowerCase()) return <Navigate to={monographPath(active.id)} replace />;
  // /monographs (index) displays the first volume but keeps its own URL & metadata.
  const shown: Monograph = active ?? monographs[0];
  const selectedId = shown.id;
  const isIndex = !active;
  const crumbs = isIndex ? BASE_CRUMBS : [...BASE_CRUMBS, { name: shown.title, path: monographPath(shown.id) }];
  const indexDescription = `${archiveStats.totalMonographs} peer-reviewed working monographs from the Zazie Institute of Applied Anomalies on audio technology, computational creativity, speculative engineering and interdisciplinary invention.`;

  const getCitationText = (m: Monograph, fmt: string) => {
    const authors = [m.author, ...(m.coAuthors || [])].join(', ');
    const year = m.date.substring(0, 4);
    const url = `${SITE_URL}${monographPath(m.id)}`;

    if (fmt === 'apa') {
      return `${authors}. (${year}). ${m.title}. ${m.volume}, ZIAA Press. ${url}`;
    } else if (fmt === 'ieee') {
      return `${authors}, "${m.title}," ${m.volume}, Zazie Institute of Applied Anomalies, ${year}. [Online]. Available: ${url}`;
    } else if (fmt === 'chicago') {
      return `${authors}. "${m.title}." ${m.volume} (ZIAA Archive, ${year}). ${url}.`;
    } else {
      // BibTeX
      const citeKey = `${m.author.split(' ').pop()?.toLowerCase() || 'ziaa'}${year}${m.id.replace(/[^0-9]/g, '')}`;
      return `@article{${citeKey},
  author = {${authors}},
  title = {${m.title}},
  journal = {${m.volume}},
  year = {${year}},
  publisher = {Zazie Institute of Applied Anomalies},
  url = {${SITE_URL}${monographPath(m.id)}}
}`;
    }
  };

  const copyCitation = () => {
    if (!shown) return;
    const txt = getCitationText(shown, citationFormat);
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-serif">
      {isIndex ? (
        <Seo
          title={`Research Monographs & Treatises (${archiveStats.totalMonographs} Volumes)`}
          description={indexDescription}
          path="/monographs"
          keywords={['research monographs', 'working papers', 'audio technology research', 'computational creativity', 'speculative engineering']}
          jsonLd={[
            breadcrumbSchema(crumbs),
            collectionPageSchema({
              name: 'ZIAA Transactions on Applied Anomalies & Experimental Systems',
              description: indexDescription,
              path: '/monographs',
              about: ['audio research', 'computational creativity', 'speculative engineering'],
              items: monographs.map(m => ({ name: m.title, path: monographPath(m.id) }))
            })
          ]}
        />
      ) : (
        <Seo
          title={shown.title}
          titleId={shown.id}
          description={`${shown.abstract} — ${shown.volume}, by ${[shown.author, ...(shown.coAuthors || [])].join(', ')}.`}
          path={monographPath(shown.id)}
          type="article"
          publishedTime={shown.date}
          keywords={['monograph', 'ZIAA', shown.volume]}
          jsonLd={[
            breadcrumbSchema(crumbs),
            creativeWorkSchema({
              type: 'ScholarlyArticle',
              path: monographPath(shown.id),
              name: shown.title,
              description: shown.abstract,
              identifier: shown.id,
              datePublished: shown.date,
              authors: [shown.author, ...(shown.coAuthors || [])],
              keywords: ['applied anomalies', 'experimental audio', 'speculative engineering'],
              extra: {
                isPartOf: { '@type': 'PublicationVolume', name: shown.volume },
                pageStart: undefined,
                articleSection: shown.sections?.map(s => s.heading),
                citation: shown.references
              }
            })
          ]}
        />
      )}

      {/* Formal Header Banner */}
      <header className="bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg space-y-3">
        <Breadcrumbs crumbs={crumbs} />
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              PEER-REVIEWED MONOGRAPHS
            </span>
            <span className="text-[10.5px] font-mono text-zinc-400">
              ISSN: 2834-9180 (Online) · OPEN RESEARCH
            </span>
          </div>
          {isIndex ? (
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              ZIAA Transactions on Applied Anomalies &amp; Experimental Systems
            </h1>
          ) : (
            <p className="text-xl md:text-2xl font-bold text-white tracking-wide">
              ZIAA Transactions on Applied Anomalies &amp; Experimental Systems
            </p>
          )}
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Peer-reviewed working papers, research monographs, and theoretical treatises on audio technology,
            computational creativity, speculative engineering, and interdisciplinary invention ({monographs.length} Volumes).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setCitationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-[#dfb76c] rounded-md transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Cite Treatise</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-zinc-300 rounded-md transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Monograph Index (4 cols) */}
        <nav aria-label="Publication index" className="lg:col-span-4 space-y-2.5">
          <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider px-1">
            Publication Index ({monographs.length} Volumes)
          </h2>
          {monographs.map(m => {
            const isSelected = m.id === selectedId;
            return (
              <Link
                key={m.id}
                to={monographPath(m.id)}
                aria-current={isSelected ? 'page' : undefined}
                className={`block p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#091322] border-[#dfb76c] shadow-md shadow-[#dfb76c]/5'
                    : 'bg-[#04070d] border-[#1b2636] hover:border-zinc-600'
                }`}
              >
                <div className="text-[10px] font-mono text-[#c5a059] mb-1">{m.volume}</div>
                <div className="text-white font-bold text-sm mb-1.5 leading-snug">{m.title}</div>
                <div className="text-xs text-emerald-300">{m.author}</div>
                <div className="text-[10.5px] font-mono text-zinc-400 mt-2 flex justify-between items-center">
                  <time dateTime={m.date}>{m.date}</time>
                  <span className="text-zinc-500 font-mono text-[9.5px]">{m.id}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Right Longform Essay Reading Pane (8 cols) */}
        <article className="lg:col-span-8 bg-[#04070d] border border-[#213045] rounded-xl p-6 md:p-8 space-y-6 shadow-xl">
          {shown ? (
            <>
              {/* Journal Masthead Header */}
              <div className="border-b border-[#1b2636] pb-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#c5a059]">
                  <span className="archival-stamp font-mono text-[9.5px]">
                    OFFICIAL PEER-REVIEWED TREATISE
                  </span>
                  <span>{shown.volume} · Published <time dateTime={shown.date}>{shown.date}</time></span>
                </div>

                {isIndex ? (
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                    <Link to={monographPath(shown.id)} className="hover:text-[#dfb76c]">{shown.title}</Link>
                  </h2>
                ) : (
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">{shown.title}</h1>
                )}

                <div className="text-sm text-zinc-300 pt-1">
                  Primary Investigator: <strong className="text-[#dfb76c] font-medium">{shown.author}</strong>
                  {shown.coAuthors && shown.coAuthors.length > 0 && (
                    <span className="text-zinc-400"> · Co-Authors: {shown.coAuthors.join(', ')}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 pt-1">
                  <span>Accession: <span className="text-cyan-400">{shown.id}</span></span>
                  <span aria-hidden="true">·</span>
                  <span>Review Committee: Certified Unanimous</span>
                </div>
              </div>

              {/* Abstract Callout Box */}
              <div className="p-5 bg-[#060a12] border-l-4 border-[#dfb76c] rounded-r-lg text-zinc-200 leading-relaxed text-sm shadow-inner">
                <div className="text-[10.5px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-[#dfb76c]" />
                  <span>MONOGRAPH ABSTRACT & THESIS</span>
                </div>
                <p className="italic text-zinc-300 leading-relaxed">
                  {shown.abstract}
                </p>
              </div>

              {/* Mathematical Theorems & Boundary Equations */}
              {shown.keyTheorems && shown.keyTheorems.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>KEY THEOREMS & BOUNDARY EQUATIONS</span>
                  </div>
                  {shown.keyTheorems.map((t, idx) => (
                    <div key={idx} className="math-block text-xs md:text-sm">
                      <div className="text-[10px] font-mono text-[#c5a059] not-italic mb-1">
                        FORMULATION [{idx + 1}.1]
                      </div>
                      <div className="text-zinc-100">{t}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Longform Academic Sections */}
              <div className="space-y-6 pt-4 border-t border-[#1b2636]">
                {shown.sections && shown.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h2 className="text-base font-bold text-[#dfb76c] tracking-wide border-b border-[#16212e] pb-1">
                      {sec.heading}
                    </h2>
                    <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line text-justify">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Academic References / Bibliography */}
              {shown.references && shown.references.length > 0 && (
                <div className="pt-6 border-t border-[#1b2636] space-y-2">
                  <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    References &amp; Primary Citations
                  </h2>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 font-mono">
                    {shown.references.map((ref, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {ref}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Institutional Sign-off Footer */}
              <div className="p-4 bg-[#030509] border border-[#1b2636] rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500 font-mono">
                <div>
                  ARCHIVAL SPECIMEN // ZIAA PUBLICATIONS DIVISION
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>PERMANENT PRESERVATION RECORD</span>
                </div>
              </div>
            </>
          ) : null}
        </article>
      </div>

      {/* Citation Generator Modal */}
      {citationModalOpen && shown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cite-heading">
          <div className="bg-[#05080f] border border-[#2b3e58] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#dfb76c]" />
                <h2 id="cite-heading" className="text-base font-bold text-white font-serif">
                  Cite This Academic Treatise
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCitationModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
                aria-label="Close citation dialog"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 text-xs font-mono border-b border-[#1b2636] pb-2">
              {(['bibtex', 'apa', 'ieee', 'chicago'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  aria-pressed={citationFormat === fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`px-3 py-1 rounded text-xs uppercase ${
                    citationFormat === fmt
                      ? 'bg-[#dfb76c] text-black font-bold'
                      : 'text-zinc-400 hover:text-white bg-[#0a121e]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="p-3.5 bg-[#020407] border border-[#1b2636] rounded-lg font-mono text-xs text-zinc-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {getCitationText(shown, citationFormat)}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-zinc-400 font-mono">
                ZIAA archival citation
              </span>
              <button
                type="button"
                onClick={copyCitation}
                className="px-4 py-2 bg-[#dfb76c] hover:bg-[#ebd097] text-black font-bold text-xs rounded flex items-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Citation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monographs;
