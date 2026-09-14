import React, { useState, useMemo } from 'react';
import { patents, disciplines } from '../data/archive';
import { Patent } from '../data/types';
import { Search, FileText, ExternalLink, ShieldCheck, Scale, Award, ArrowRight } from 'lucide-react';

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
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              SPECULATIVE IP
            </span>
            <span className="text-[10.5px] font-mono text-zinc-500">
              PATENTS, PROVISIONALS &amp; IDEA DISCLOSURES
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Speculative Patents &amp; Idea Dossiers ({patents.length} Filings)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Defensive filings, concept disclosures, and imaginary intellectual property — each one a thought experiment 
            about a technology that could exist, or almost does, maintained by the ZIAA legal &amp; research office.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
          Showing <span className="text-cyan-400 font-bold">{filtered.length}</span> of {patents.length} Patents
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by serial number, inventor, title, or concept keywords..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs font-mono">
              CLEAR
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">DISCIPLINE</label>
            <select
              value={selectedDiscipline}
              onChange={e => setSelectedDiscipline(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">ALL DISCIPLINES ({disciplines.length})</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">LEGAL STATUS</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">ALL LEGAL STATUSES</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectPatent(p.id)}
            className="bg-[#05080f] border border-[#1c2a3b] hover:border-cyan-500/80 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <div className="text-cyan-400 font-mono font-bold text-xs tracking-wider group-hover:text-cyan-300">
                    {p.patentNumber} // {p.id}
                  </div>
                  <div className="text-zinc-100 font-bold text-base mt-1">
                    {p.title}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#091522] text-cyan-300 border border-cyan-800">
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4">
                {p.abstract}
              </p>

              {/* Primary Claim Preview */}
              {p.independentClaims && p.independentClaims.length > 0 && (
                <div className="p-3 bg-[#020509] border-l-2 border-cyan-500 rounded text-xs text-zinc-300 mb-3 font-mono">
                  <span className="text-cyan-400 font-bold">INDEPENDENT CLAIM: </span>
                  <span className="italic line-clamp-2">{p.independentClaims[0]}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#172333] flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-3">
                <span>FILED: {p.filingDate}</span>
                <span>·</span>
                <span>DISCIPLINE: <strong className="text-zinc-300 font-normal">{p.primaryDiscipline}</strong></span>
              </div>
              <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                <span>VIEW LEGAL DOSSIER</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-zinc-400 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No patent dossiers found matching query parameters.
        </div>
      )}
    </div>
  );
};
