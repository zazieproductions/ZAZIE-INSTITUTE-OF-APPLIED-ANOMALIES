import React, { useState } from 'react';
import { revisions } from '../data/archive';
import { Revision } from '../data/types';
import { GitCommit, Search, Terminal, Clock, CheckCircle } from 'lucide-react';

export const AuditRevisions: React.FC = () => {
  const [search, setSearch] = useState<string>('');

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

  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#05080c] border border-violet-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <h1 className="text-base font-bold text-white tracking-wider">
              CRYPTOGRAPHIC REVISION AUDIT & REVISION LOG ({revisions.length} COMMITS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Tamper-evident record of schematic changes, acoustic parameter modifications, and security classification adjustments.
          </p>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          Showing <span className="text-violet-400 font-bold">{filtered.length}</span> commits
        </div>
      </div>

      <div className="bg-[#04070a] border border-violet-950 p-3 rounded-lg">
        <div className="flex items-center gap-2 bg-[#020406] border border-violet-900/60 px-3 py-1.5 rounded">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commits by hash, author, target prototype/patent, or commit message..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs"
          />
        </div>
      </div>

      <div className="bg-[#05080c] border border-violet-950 rounded-lg overflow-hidden divide-y divide-violet-950/60">
        {filtered.map(r => (
          <div key={r.commitHash} className="p-3 hover:bg-violet-950/15 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-violet-400 font-bold font-mono">commit {r.commitHash}</span>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {r.changeType}
                </span>
                <span className="text-emerald-400 font-bold">{r.targetRecord}</span>
              </div>
              <div className="text-zinc-200 text-xs">{r.message}</div>
            </div>

            <div className="text-right text-[10px] text-zinc-500 shrink-0">
              <div>Author: <span className="text-zinc-300">{r.author}</span></div>
              <div className="text-zinc-500">{r.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
