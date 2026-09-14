import React, { useState, useMemo } from 'react';
import { patents, disciplines } from '../data/archive';
import { Patent } from '../data/types';
import { Search, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

interface PatentDossiersProps {
  onSelectPatent: (id: string) => void;
}

export const PatentDossiers: React.FC<PatentDossiersProps> = ({ onSelectPatent }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return patents.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.patentNumber.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.inventors.some(inv => inv.toLowerCase().includes(q));

      const matchesDiscipline = selectedDiscipline === 'ALL' || p.primaryDiscipline === selectedDiscipline;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesDiscipline && matchesStatus;
    });
  }, [search, selectedDiscipline, selectedStatus]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(patents.map(p => p.status)));
  }, []);

  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#05080c] border border-cyan-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-wider">
              SPECULATIVE PATENT STUDY DOSSIERS ({patents.length} DOSSIERS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Clearly fictional legal patent disclosures, claims schedules, prior art critiques, and non-Hermitian boundary mathematics filed by ZIAA.
          </p>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          Showing <span className="text-cyan-400 font-bold">{filtered.length}</span> of {patents.length} Patents
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#04070a] border border-cyan-950 p-3 rounded-lg space-y-3">
        <div className="flex items-center gap-2 bg-[#020406] border border-cyan-900/60 px-3 py-1.5 rounded">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patent number, title, inventor, claims, or abstract keywords..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">DISCIPLINE</label>
            <select
              value={selectedDiscipline}
              onChange={e => setSelectedDiscipline(e.target.value)}
              className="w-full bg-[#080d14] border border-cyan-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">ALL DISCIPLINES</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">LEGAL STATUS</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#080d14] border border-cyan-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">ALL STATUSES</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map(pat => (
          <div
            key={pat.id}
            onClick={() => onSelectPatent(pat.id)}
            className="bg-[#05080c] border border-cyan-950/70 hover:border-cyan-500/70 p-4 rounded-lg cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-cyan-400 font-bold text-xs tracking-wider group-hover:text-cyan-300">
                    {pat.patentNumber}
                  </span>
                  <div className="text-zinc-200 font-semibold text-xs mt-0.5">
                    {pat.title}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {pat.status}
                </span>
              </div>

              <div className="text-[10px] text-zinc-500 mb-2">
                Filing Date: <span className="text-zinc-300">{pat.filingDate}</span> · Assignee: <span className="text-zinc-400">{pat.assignee}</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                {pat.abstract}
              </p>

              {/* Claims summary snippet */}
              <div className="p-2 bg-[#020406] border border-cyan-950/60 rounded text-[10px] text-zinc-400 mb-2">
                <span className="text-cyan-400 font-bold">PRIMARY CLAIM: </span>
                {pat.independentClaims && pat.independentClaims[0] ? (
                  <span className="line-clamp-2">{pat.independentClaims[0]}</span>
                ) : (
                  <span>Acoustic waveguide system with phase velocity control.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cyan-950/60 text-[10px]">
              <span className="text-zinc-500">
                Inventors: <span className="text-zinc-300">{pat.inventors.join(', ')}</span>
              </span>
              <span className="text-cyan-400 group-hover:underline">
                VIEW DOSSIER →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
