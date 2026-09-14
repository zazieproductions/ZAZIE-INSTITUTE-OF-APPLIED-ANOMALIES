import React, { useState } from 'react';
import { revisions } from '../data/archive';
import { Revision } from '../data/types';
import { GitCommit, Search, Terminal, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export const AuditRevisions: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(40);

  const filtered = revisions.filter(r => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.commitHash.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.targetRecord.toLowerCase().includes(q) ||
      r.message.toLowerCase().includes(q) ||
      r.changeType.toLowerCase().includes(q)
    );
  });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              CHANGE LOG
            </span>
            <span className="text-[10.5px] font-mono text-zinc-500">
              WHAT WE TWEAKED, WHEN
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Archive Revision History ({revisions.length} Entries)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            A running commit log of revisions to the archive — schematic changes, parameter tweaks, newly added 
            field recordings, essays, and prototypes, signed off by the editorial group.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
          Showing <span className="text-violet-400 font-bold">{Math.min(visibleCount, filtered.length)}</span> of {filtered.length} Commits
        </div>
      </div>

      <div className="bg-[#04070d] border border-[#213045] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by hash, author, record, or note..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs font-mono">
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayed.map((r, idx) => (
          <div
            key={idx}
            className="p-4 bg-[#05080f] border border-[#1c2a3b] hover:border-violet-500/80 rounded-xl transition-all shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                <span className="text-violet-400 font-bold">commit {r.commitHash}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{r.timestamp.replace('T', ' ').substring(0, 19)} UTC</span>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-400 font-semibold">{r.targetRecord}</span>
              </div>
              <div className="text-sm text-zinc-200 group-hover:text-white transition-colors">
                {r.message}
              </div>
            </div>

            <div className="flex sm:flex-col items-end gap-1.5 shrink-0 text-xs font-mono">
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#110c1c] text-violet-300 border border-violet-900/60 font-semibold">
                {r.changeType}
              </span>
              <span className="text-zinc-500 text-[10.5px]">{r.author}</span>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount(prev => prev + 40)}
            className="px-6 py-2.5 bg-[#091322] hover:bg-[#0f1d33] border border-[#2b3e58] hover:border-violet-400 text-violet-300 rounded-lg font-mono text-xs transition-all shadow-md"
          >
            Load 40 more entries (showing {visibleCount} of {filtered.length})
          </button>
        </div>
      )}
    </div>
  );
};
