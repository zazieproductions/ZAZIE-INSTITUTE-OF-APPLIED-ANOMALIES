import React, { useState } from 'react';
import { monographs } from '../data/archive';
import { Monograph } from '../data/types';
import { BookOpen, FileText, Share2, Award, Terminal } from 'lucide-react';

export const Monographs: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(monographs[0]?.id || '');
  const activeMonograph = monographs.find(m => m.id === selectedId) || monographs[0];

  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h1 className="text-base font-bold text-white tracking-wider">
            ZIAA LONGFORM TECHNICAL ESSAYS & MONOGRAPHS ({monographs.length} VOLUMES)
          </h1>
        </div>
        <p className="text-zinc-400 text-[11px] mt-1">
          Peer-reviewed mathematical treatises on non-Hermitian phononics, colloidal ferrofluids, neolithic phonograms, and bone conduction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Monograph Index (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {monographs.map(m => {
            const isSelected = m.id === selectedId;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#080f14] border-emerald-500 shadow-sm'
                    : 'bg-[#05080c] border-emerald-950/80 hover:border-zinc-700'
                }`}
              >
                <div className="text-[10px] text-zinc-500 mb-1">{m.volume}</div>
                <div className="text-zinc-200 font-bold text-xs mb-1">{m.title}</div>
                <div className="text-[10px] text-emerald-400">{m.author}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{m.date}</div>
              </div>
            );
          })}
        </div>

        {/* Right Longform Essay Reading Pane (8 cols) */}
        <div className="lg:col-span-8 bg-[#05080c] border border-emerald-950 rounded-lg p-6 space-y-5">
          {activeMonograph ? (
            <>
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                  {activeMonograph.volume} · {activeMonograph.date}
                </div>
                <h2 className="text-lg font-bold text-white">{activeMonograph.title}</h2>
                <div className="text-zinc-400 text-xs mt-1">
                  Primary Investigator: <span className="text-zinc-200">{activeMonograph.author}</span>
                  {activeMonograph.coAuthors && activeMonograph.coAuthors.length > 0 && (
                    <span> · Co-Authors: <span className="text-zinc-300">{activeMonograph.coAuthors.join(', ')}</span></span>
                  )}
                </div>
              </div>

              {/* Abstract */}
              <div className="p-4 bg-[#030508] border-l-2 border-emerald-500 rounded text-zinc-300 leading-relaxed text-xs">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  MONOGRAPH ABSTRACT
                </div>
                <p>{activeMonograph.abstract}</p>
              </div>

              {/* Theorems */}
              {activeMonograph.keyTheorems && activeMonograph.keyTheorems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    KEY THEOREMS & BOUNDARY MATHEMATICS
                  </div>
                  {activeMonograph.keyTheorems.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#03060a] border border-cyan-950/70 rounded text-cyan-200/90 text-xs">
                      {t}
                    </div>
                  ))}
                </div>
              )}

              {/* Longform Sections */}
              <div className="space-y-4 pt-2 border-t border-emerald-950/80">
                {activeMonograph.sections && activeMonograph.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-bold text-zinc-200 text-sm">{sec.heading}</h3>
                    <p className="text-zinc-400 leading-relaxed text-xs whitespace-pre-line">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
