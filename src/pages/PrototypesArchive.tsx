import React, { useState, useMemo } from 'react';
import { prototypes, disciplines, clearances, statuses } from '../data/archive';
import { Prototype } from '../data/types';
import { audioEngine } from '../audio/audioEngine';
import { StatusBadge } from '../components/StatusBadge';
import { getPrototypeStatusLabel, ALL_PROJECT_STATUSES } from '../data/projectStatus';
import { Search, Play, Square, ArrowRight, Tag } from 'lucide-react';

interface PrototypesArchiveProps {
  onSelectPrototype: (id: string) => void;
}

export const PrototypesArchive: React.FC<PrototypesArchiveProps> = ({ onSelectPrototype }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>('ALL');
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

      const projectStatus = getPrototypeStatusLabel(p);
      const matchesProjectStatus = selectedProjectStatus === 'ALL' || projectStatus === selectedProjectStatus;

      return matchesSearch && matchesDiscipline && matchesStatus && matchesClearance && matchesYear && matchesProjectStatus;
    });
  }, [search, selectedDiscipline, selectedStatus, selectedClearance, selectedYear, selectedProjectStatus]);

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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prototypes.forEach(p => {
      const s = getPrototypeStatusLabel(p);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6 font-serif">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              PROTOTYPE ARCHIVE
            </span>
            <span className="text-[10.5px] font-mono text-zinc-400">
              CREATIVE-TECHNOLOGY SPECIFICATION REGISTRY
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Experimental Prototypes & Instrument Systems ({prototypes.length} Records)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Complete five-year archive (2021–2026) of custom physical computing instruments, tactile perceptual interfaces, 
            DSP software engines, and speculative acoustic hardware.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3 py-2 border border-[#1b2636] rounded-md shrink-0">
          Showing <span className="text-[#dfb76c] font-bold">{filtered.length}</span> of {prototypes.length} Prototypes
        </div>
      </div>

      {/* Quick Status Classification Pills Row */}
      <div className="p-3.5 bg-[#03060c] border border-[#1a2638] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <Tag className="w-3.5 h-3.5 text-[#dfb76c]" />
          <span className="uppercase font-bold tracking-wider text-zinc-300">Project Classification:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedProjectStatus('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
              selectedProjectStatus === 'ALL'
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            ALL ({prototypes.length})
          </button>
          {ALL_PROJECT_STATUSES.map(s => {
            const isSelected = selectedProjectStatus === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedProjectStatus(isSelected ? 'ALL' : s)}
                className={`flex items-center gap-1 transition-all ${isSelected ? 'ring-1 ring-[#dfb76c] rounded' : 'opacity-85 hover:opacity-100'}`}
              >
                <StatusBadge label={s} size="xs" showPrefix={false} />
                <span className="text-[9px] font-mono text-zinc-500">({statusCounts[s] || 0})</span>
              </button>
            );
          })}
        </div>

        <span className="text-[9.5px] text-zinc-500 italic hidden xl:inline">
          * Internal ZIAA research taxonomy — not external credentials
        </span>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-[#dfb76c] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by accession ID, codename, title, researcher, or abstract keywords..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs font-mono">
              CLEAR
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">DISCIPLINE</label>
            <select
              value={selectedDiscipline}
              onChange={e => setSelectedDiscipline(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]"
            >
              <option value="ALL">ALL DISCIPLINES ({disciplines.length})</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">PROJECT STATUS</label>
            <select
              value={selectedProjectStatus}
              onChange={e => setSelectedProjectStatus(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]"
            >
              <option value="ALL">ALL STATUSES ({ALL_PROJECT_STATUSES.length})</option>
              {ALL_PROJECT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">ARCHIVE STATE</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]"
            >
              <option value="ALL">ALL STATES</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">CLEARANCE</label>
            <select
              value={selectedClearance}
              onChange={e => setSelectedClearance(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]"
            >
              <option value="ALL">ALL CLEARANCES</option>
              {clearances.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">YEAR</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const isThisPlaying = playingId === p.id;
          const statusLabel = getPrototypeStatusLabel(p);
          return (
            <div
              key={p.id}
              onClick={() => onSelectPrototype(p.id)}
              className="bg-[#05080f] border border-[#1c2a3b] hover:border-[#dfb76c]/80 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-md hover:shadow-[#dfb76c]/5"
            >
              <div>
                {/* Top ID & Badges */}
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div>
                    <div className="text-[#dfb76c] font-bold text-xs tracking-wider group-hover:text-white font-mono">
                      {p.id} // {p.codeName}
                    </div>
                    <div className="text-zinc-100 font-bold text-sm mt-0.5 line-clamp-1">
                      {p.title}
                    </div>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-mono bg-[#0b1522] text-zinc-400 border border-zinc-800">
                    {p.clearance}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mb-2.5">
                  <StatusBadge label={statusLabel} size="xs" />
                </div>

                {/* Abstract snippet */}
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">
                  {p.abstract}
                </p>

                {/* Specs pill badges */}
                <div className="space-y-1.5 text-[10.5px] font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">DISCIPLINE:</span>
                    <span className="text-cyan-400 font-medium truncate max-w-[180px]">{p.discipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">BANDWIDTH:</span>
                    <span className="text-zinc-300">{p.operationalBandwidth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TRANSDUCER:</span>
                    <span className="text-zinc-400 truncate max-w-[170px]">{p.primaryTransducer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">INVESTIGATOR:</span>
                    <span className="text-zinc-300 truncate max-w-[170px]">{p.leadResearcher}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#172333]">
                <button
                  onClick={e => handleToggleAudio(e, p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all shadow-sm ${
                    isThisPlaying
                      ? 'bg-red-500 text-black shadow-[0_0_10px_#ef4444]'
                      : 'bg-[#0f1d2e] hover:bg-[#182b40] border border-[#2b415e] text-cyan-300'
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
                      <Play className="w-3 h-3 fill-current text-cyan-400" />
                      <span>AUDITION</span>
                    </>
                  )}
                </button>

                <span className="text-xs font-mono text-zinc-400 group-hover:text-[#dfb76c] flex items-center gap-1">
                  <span>OPEN DOSSIER</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-zinc-400 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No experimental prototypes match the selected query. Please refine your filter parameters.
        </div>
      )}
    </div>
  );
};
