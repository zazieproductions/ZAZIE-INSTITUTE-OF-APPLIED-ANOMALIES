import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadRevisions, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { Search } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'System Audit', path: '/system-audit' }
];

export const AuditRevisions: React.FC = () => {
  const revisions = useCollection(loadRevisions);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(40);

  const q = search.toLowerCase();
  const filtered = revisions.filter(
    r =>
      !q ||
      r.commitHash.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.targetRecord.toLowerCase().includes(q) ||
      r.message.toLowerCase().includes(q) ||
      r.changeType.toLowerCase().includes(q)
  );
  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`System Audit Ledger & Research Changelog (${archiveStats.totalRevisions} Commits)`}
        description={`Version-controlled changelog of ${archiveStats.totalRevisions} commits across ZIAA prototypes: firmware updates, DSP algorithm revisions, CAD schematics and documentation changes from the Zazie Institute of Applied Anomalies.`}
        path="/system-audit"
        jsonLd={breadcrumbSchema(CRUMBS)}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="SYSTEM ARCHITECTURE LEDGER"
        kicker="VERSION-CONTROLLED DEVELOPMENT LOG"
        tone="violet"
        title={<>System Audit Ledger &amp; Research Changelog ({revisions.length} Commits)</>}
        lede="Version-controlled repository changelog tracking prototype firmware updates, C++ DSP algorithm revisions, CAD schematics and experimental documentation across the ZIAA archive."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0" aria-live="polite">
            Showing <span className="text-violet-400 font-bold">{Math.min(visibleCount, filtered.length)}</span> of {filtered.length} Commits
          </p>
        }
      />

      <section aria-label="Search commits" className="bg-[#04070d] border border-[#213045] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search commits"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commits by hash, author, target record, or change summary…"
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && <button type="button" onClick={() => setSearch('')} className="text-zinc-400 hover:text-white text-xs font-mono">CLEAR</button>}
        </div>
      </section>

      <ol className="space-y-3" aria-label="Commit history">
        {displayed.map(r => (
          <li
            key={r.commitHash}
            className="p-4 bg-[#05080f] border border-[#1c2a3b] hover:border-violet-500/80 rounded-xl transition-all shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                <span className="text-violet-400 font-bold">commit {r.commitHash}</span>
                <span className="text-zinc-600" aria-hidden="true">·</span>
                <time className="text-zinc-400">{r.timestamp}</time>
                <span className="text-zinc-600" aria-hidden="true">·</span>
                {r.targetRecord.startsWith('PROT-') ? (
                  <Link to={recordPath('prototype', r.targetRecord)} className="text-emerald-400 font-semibold hover:underline">{r.targetRecord}</Link>
                ) : (
                  <span className="text-emerald-400 font-semibold">{r.targetRecord}</span>
                )}
              </div>
              <p className="text-sm text-zinc-200 group-hover:text-white transition-colors">{r.message}</p>
            </div>
            <div className="flex sm:flex-col items-end gap-1.5 shrink-0 text-xs font-mono">
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#110c1c] text-violet-300 border border-violet-900/60 font-semibold">{r.changeType}</span>
              <span className="text-zinc-400 text-[10.5px]">{r.author}</span>
            </div>
          </li>
        ))}
      </ol>

      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 40)}
            className="px-6 py-2.5 bg-[#091322] hover:bg-[#0f1d33] border border-[#2b3e58] hover:border-violet-400 text-violet-300 rounded-lg font-mono text-xs transition-all shadow-md"
          >
            Load 40 More Commits (Showing {visibleCount} of {filtered.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditRevisions;
