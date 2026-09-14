import React, { useState, useMemo } from 'react';
import { prototypes, disciplines, clearances, statuses } from '../data/archive';
import { Prototype } from '../data/types';
import { audioEngine } from '../audio/audioEngine';
import { Search, Play, Square, Cpu, Sliders, Filter, Sparkles, Volume2 } from 'lucide-react';

interface PrototypesArchiveProps {
  onSelectPrototype: (id: string) => void;
}

export const PrototypesArchive: React.FC<PrototypesArchiveProps> = ({ onSelectPrototype }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedClearance, setSelectedClearance] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return prototypes.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.codeName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.leadResearcher.toLowerCase().includes(q);

      const matchesDiscipline = selectedDiscipline === 'ALL' || p.discipline === selectedDiscipline;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchesClearance = selectedClearance === 'ALL' || p.clearance === selectedClearance;
      const matchesYear = selectedYear === 'ALL' || p.year.toString() === selectedYear;

      return matchesSearch && matchesDiscipline && matchesStatus && matchesClearance && matchesYear;
    });
  }, [search, selectedDiscipline, selectedStatus, selectedClearance, selectedYear]);

  const handleToggleAudio = (e: React.MouseEvent, p: Prototype) => {
    e.stopPropagation();
    if (playingId === p.id) {
      audioEngine.stop();
      setPlayingId(null);
    } else {
      audioEngine.playProfile(p.audioProfile);
      setPlayingId(p.id);
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h1 className="text-base font-bold text-white tracking-wider">
              PROTOTYPE CLASSIFIED REGISTRY ({prototypes.length} RECORDS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Complete five-year inventory (2021–2026) of experimental transducers, acoustic resonators, and material interfaces.
          </p>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          Showing <span className="text-emerald-400 font-bold">{filtered.length}</span> of {prototypes.length} Prototypes
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#04070a] border border-emerald-950 p-3 rounded-lg space-y-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-[#020406] border border-emerald-900/60 px-3 py-1.5 rounded">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by prototype ID, codename, title, researcher, or abstract keywords..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs">
              CLEAR
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">DISCIPLINE</label>
            <select
              value={selectedDiscipline}
              onChange={e => setSelectedDiscipline(e.target.value)}
              className="w-full bg-[#080d14] border border-emerald-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL DISCIPLINES ({disciplines.length})</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">STATUS</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#080d14] border border-emerald-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL STATUSES</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">SECURITY CLEARANCE</label>
            <select
              value={selectedClearance}
              onChange={e => setSelectedClearance(e.target.value)}
              className="w-full bg-[#080d14] border border-emerald-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL CLEARANCES</option>
              {clearances.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] block mb-1">YEAR</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-[#080d14] border border-emerald-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL YEARS (2021–2026)</option>
              {['2021', '2022', '2023', '2024', '2025', '2026'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prototype Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(p => {
          const isThisPlaying = playingId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPrototype(p.id)}
              className="bg-[#05080c] border border-emerald-950/80 hover:border-emerald-600/70 p-3.5 rounded-lg cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-emerald-950/30"
            >
              <div>
                {/* Top ID & Badges */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <div className="text-emerald-400 font-bold text-xs tracking-wider group-hover:text-emerald-300">
                      {p.id} // {p.codeName}
                    </div>
                    <div className="text-zinc-200 font-semibold text-xs mt-0.5 line-clamp-1">
                      {p.title}
                    </div>
                  </div>

                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9.5px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {p.clearance}
                  </span>
                </div>

                {/* Abstract snippet */}
                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                  {p.abstract}
                </p>

                {/* Specs pill badges */}
                <div className="space-y-1 text-[10px] text-zinc-500 border-t border-emerald-950/60 pt-2 mb-3">
                  <div className="flex justify-between">
                    <span>DISCIPLINE:</span>
                    <span className="text-cyan-400 font-medium">{p.discipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BANDWIDTH:</span>
                    <span className="text-zinc-300">{p.operationalBandwidth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSDUCER:</span>
                    <span className="text-zinc-400 truncate max-w-[160px]">{p.primaryTransducer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YEAR:</span>
                    <span className="text-zinc-400">{p.year}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-950/80">
                <button
                  onClick={e => handleToggleAudio(e, p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                    isThisPlaying
                      ? 'bg-red-500 text-black shadow-[0_0_8px_#ef4444]'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                  }`}
                  title="Audition synthesized acoustic signature"
                >
                  {isThisPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>HALT</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>AUDITION</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-zinc-500 group-hover:text-emerald-400">
                  OPEN DOSSIER →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-zinc-500 bg-[#040608] border border-emerald-950 rounded-lg">
          No prototypes found matching the selected filter criteria.
        </div>
      )}
    </div>
  );
};
