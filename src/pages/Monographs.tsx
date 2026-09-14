import React, { useState } from 'react';
import { monographs } from '../data/archive';
import { Monograph } from '../data/types';
import { BookOpen, FileText, Share2, Award, Printer, Copy, Check, ExternalLink, Bookmark } from 'lucide-react';

export const Monographs: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(monographs[0]?.id || '');
  const [citationModalOpen, setCitationModalOpen] = useState<boolean>(false);
  const [citationFormat, setCitationFormat] = useState<'bibtex' | 'apa' | 'ieee' | 'chicago'>('bibtex');
  const [copied, setCopied] = useState<boolean>(false);

  const activeMonograph = monographs.find(m => m.id === selectedId) || monographs[0];

  const getCitationText = (m: Monograph, fmt: string) => {
    const authors = [m.author, ...(m.coAuthors || [])].join(', ');
    const year = m.date.substring(0, 4);
    const doi = `10.1088/ziaa.${year}.${m.id.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    if (fmt === 'apa') {
      return `${authors}. (${year}). ${m.title}. ${m.volume}, ZIAA Press. https://doi.org/${doi}`;
    } else if (fmt === 'ieee') {
      return `${authors}, "${m.title}," ${m.volume}, Zazie Institute of Applied Anomalies, ${year}, doi: ${doi}.`;
    } else if (fmt === 'chicago') {
      return `${authors}. "${m.title}." ${m.volume} (ZIAA Archive, ${year}). https://doi.org/${doi}.`;
    } else {
      // BibTeX
      const citeKey = `${m.author.split(' ').pop()?.toLowerCase() || 'ziaa'}${year}${m.id.replace(/[^0-9]/g, '')}`;
      return `@article{${citeKey},
  author = {${authors}},
  title = {${m.title}},
  journal = {${m.volume}},
  year = {${year}},
  publisher = {Zazie Institute of Applied Anomalies},
  doi = {${doi}},
  url = {https://archive.ziaa.internal/monographs/${m.id}}
}`;
    }
  };

  const copyCitation = () => {
    if (!activeMonograph) return;
    const txt = getCitationText(activeMonograph, citationFormat);
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Formal Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              PEER-REVIEWED MONOGRAPHS
            </span>
            <span className="text-[10.5px] font-mono text-zinc-400">
              ISSN: 2834-9180 (Online) · OPEN RESEARCH
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            ZIAA Transactions on Applied Anomalies & Experimental Systems
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Peer-reviewed working papers, research monographs, and theoretical treatises on audio technology, 
            computational creativity, speculative engineering, and interdisciplinary invention ({monographs.length} Volumes).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setCitationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-[#dfb76c] rounded-md transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Cite Treatise</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-zinc-300 rounded-md transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Monograph Index (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
            Publication Index ({monographs.length} Volumes)
          </div>
          {monographs.map(m => {
            const isSelected = m.id === selectedId;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#091322] border-[#dfb76c] shadow-md shadow-[#dfb76c]/5'
                    : 'bg-[#04070d] border-[#1b2636] hover:border-zinc-600'
                }`}
              >
                <div className="text-[10px] font-mono text-[#c5a059] mb-1">{m.volume}</div>
                <div className="text-white font-bold text-sm mb-1.5 leading-snug">{m.title}</div>
                <div className="text-xs text-emerald-400/90">{m.author}</div>
                <div className="text-[10.5px] font-mono text-zinc-500 mt-2 flex justify-between items-center">
                  <span>{m.date}</span>
                  <span className="text-zinc-600 font-mono text-[9.5px]">DOI: 10.1088/ziaa</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Longform Essay Reading Pane (8 cols) */}
        <div className="lg:col-span-8 bg-[#04070d] border border-[#213045] rounded-xl p-6 md:p-8 space-y-6 shadow-xl">
          {activeMonograph ? (
            <>
              {/* Journal Masthead Header */}
              <div className="border-b border-[#1b2636] pb-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#c5a059]">
                  <span className="archival-stamp font-mono text-[9.5px]">
                    OFFICIAL PEER-REVIEWED TREATISE
                  </span>
                  <span>{activeMonograph.volume} · Published {activeMonograph.date}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {activeMonograph.title}
                </h2>

                <div className="text-sm text-zinc-300 pt-1">
                  Primary Investigator: <strong className="text-[#dfb76c] font-medium">{activeMonograph.author}</strong>
                  {activeMonograph.coAuthors && activeMonograph.coAuthors.length > 0 && (
                    <span className="text-zinc-400"> · Co-Authors: {activeMonograph.coAuthors.join(', ')}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 pt-1">
                  <span>Accession DOI: <span className="text-cyan-400 underline">10.1088/ziaa.2026.{activeMonograph.id.toLowerCase()}</span></span>
                  <span>·</span>
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
                  {activeMonograph.abstract}
                </p>
              </div>

              {/* Mathematical Theorems & Boundary Equations */}
              {activeMonograph.keyTheorems && activeMonograph.keyTheorems.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>KEY THEOREMS & BOUNDARY EQUATIONS</span>
                  </div>
                  {activeMonograph.keyTheorems.map((t, idx) => (
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
                {activeMonograph.sections && activeMonograph.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h3 className="text-base font-bold text-[#dfb76c] tracking-wide border-b border-[#16212e] pb-1">
                      {sec.heading}
                    </h3>
                    <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line text-justify">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Academic References / Bibliography */}
              {activeMonograph.references && activeMonograph.references.length > 0 && (
                <div className="pt-6 border-t border-[#1b2636] space-y-2">
                  <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    References & Primary Citations
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 font-mono">
                    {activeMonograph.references.map((ref, idx) => (
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
                  ARCHIVAL SPECIMEN // ZIEE PUBLICATIONS DIVISION
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>PERMANENT PRESERVATION RECORD</span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Citation Generator Modal */}
      {citationModalOpen && activeMonograph && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#05080f] border border-[#2b3e58] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1b2636] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#dfb76c]" />
                <h3 className="text-base font-bold text-white font-serif">
                  Cite This Academic Treatise
                </h3>
              </div>
              <button
                onClick={() => setCitationModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 text-xs font-mono border-b border-[#1b2636] pb-2">
              {(['bibtex', 'apa', 'ieee', 'chicago'] as const).map(fmt => (
                <button
                  key={fmt}
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
              {getCitationText(activeMonograph, citationFormat)}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-zinc-500 font-mono">
                DOI registered under CrossRef / ZIAA prefix
              </span>
              <button
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
