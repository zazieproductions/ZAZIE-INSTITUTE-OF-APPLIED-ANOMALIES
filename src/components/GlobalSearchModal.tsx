import React, { useState, useEffect, useRef } from 'react';
import { searchArchive } from '../data/archive';
import { StatusBadge } from './StatusBadge';
import { getPrototypeStatusLabel, getPatentStatusLabel } from '../data/projectStatus';
import { Search, X, FileText, Cpu, AlertTriangle, User } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (type: 'prototype' | 'patent' | 'failure' | 'personnel' | 'site' | 'log', id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchArchive(query);
  const totalResults =
    results.prototypes.length +
    results.patents.length +
    results.logs.length +
    results.failures.length +
    results.personnel.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#070a0e] border border-emerald-900/80 rounded-lg shadow-2xl overflow-hidden font-mono text-zinc-300 flex flex-col max-h-[80vh]">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 bg-[#040608] border-b border-emerald-950">
          <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search prototypes, speculative patents, research notes, post-mortems, fellows..."
            className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-500 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 text-xs divide-y divide-emerald-950/60">
          {totalResults === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Prototypes */}
              {results.prototypes.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>PROTOTYPES ({results.prototypes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.prototypes.slice(0, 5).map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectRecord('prototype', p.id);
                          onClose();
                        }}
                        className="p-2 bg-[#04070a] hover:bg-emerald-950/40 border border-emerald-950/70 hover:border-emerald-600/60 rounded cursor-pointer flex justify-between items-center transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-emerald-300">
                              {p.id}: {p.codeName}
                            </span>
                            <StatusBadge label={getPrototypeStatusLabel(p)} size="xs" />
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-lg">
                            {p.title}
                          </div>
                        </div>
                        <span className="text-[10px] text-cyan-400 shrink-0 ml-2">
                          {p.discipline}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patents */}
              {results.patents.length > 0 && (
                <div className="pt-3">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>SPECULATIVE PATENTS ({results.patents.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.patents.slice(0, 4).map(pat => (
                      <div
                        key={pat.id}
                        onClick={() => {
                          onSelectRecord('patent', pat.id);
                          onClose();
                        }}
                        className="p-2 bg-[#04070a] hover:bg-cyan-950/40 border border-cyan-950/70 hover:border-cyan-600/60 rounded cursor-pointer flex justify-between items-center transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white group-hover:text-cyan-300">
                              {pat.patentNumber}
                            </span>
                            <StatusBadge label={getPatentStatusLabel(pat)} size="xs" />
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-lg">
                            {pat.title}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                          {pat.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomaly Post-Mortems */}
              {results.failures.length > 0 && (
                <div className="pt-3">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ANOMALY POST-MORTEMS ({results.failures.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.failures.slice(0, 3).map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onSelectRecord('failure', f.id);
                          onClose();
                        }}
                        className="p-2 bg-[#04070a] hover:bg-red-950/40 border border-red-950/70 hover:border-red-600/60 rounded cursor-pointer flex justify-between items-center transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-red-300">
                            {f.projectCode}: {f.projectTitle}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-lg">
                            {f.summary}
                          </div>
                        </div>
                        <span className="text-[10px] text-red-400 shrink-0 ml-2">
                          {f.hazardClassification}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fellows & Personnel */}
              {results.personnel.length > 0 && (
                <div className="pt-3">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>RESEARCH FELLOWS ({results.personnel.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.personnel.slice(0, 3).map(per => (
                      <div
                        key={per.id}
                        onClick={() => {
                          onSelectRecord('personnel', per.id);
                          onClose();
                        }}
                        className="p-2 bg-[#04070a] hover:bg-amber-950/40 border border-amber-950/70 hover:border-amber-600/60 rounded cursor-pointer flex justify-between items-center transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-300">
                            {per.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-lg">
                            {per.title} · {per.specialization}
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 shrink-0 ml-2">
                          {per.clearance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#030508] border-t border-emerald-950/80 text-[10px] text-zinc-500 flex justify-between items-center">
          <span>Search query active across entire ZIAA 2021–2026 database</span>
          <span>Click entry to open classified dossier</span>
        </div>
      </div>
    </div>
  );
};
