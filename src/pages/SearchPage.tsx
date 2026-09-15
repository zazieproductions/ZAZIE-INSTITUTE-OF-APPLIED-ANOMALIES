import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchArchive, recordPath, type SearchResults } from '../data/archive';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { Search } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Search', path: '/search' }
];

export const SearchPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<SearchResults | null>(null);

  useEffect(() => {
    let live = true;
    searchArchive(q).then(r => live && setResults(r));
    return () => {
      live = false;
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(input.trim() ? { q: input.trim() } : {});
  };

  const total = results
    ? results.prototypes.length + results.patents.length + results.logs.length + results.failures.length + results.personnel.length
    : 0;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={q ? `Search results for “${q}”` : 'Archive Search'}
        description="Search the Zazie Institute of Applied Anomalies archive: prototypes, speculative patents, research notes, anomaly post-mortems and fellows."
        path="/search"
        noindex
        jsonLd={breadcrumbSchema(CRUMBS)}
      />
      <PageHeader
        crumbs={CRUMBS}
        stamp="ARCHIVE SEARCH"
        kicker="FULL-TEXT LOOKUP ACROSS ALL HOLDINGS"
        title="Search the ZIAA Archive"
        lede="Query prototypes, speculative patents, research notes, anomaly post-mortems and fellows by identifier, title, keyword, author or tag."
      />

      <form role="search" onSubmit={submit} className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
        <Search className="w-4 h-4 text-[#dfb76c] shrink-0" aria-hidden="true" />
        <label htmlFor="site-search" className="sr-only">Search query</label>
        <input
          id="site-search"
          name="q"
          type="search"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. feedback resonator, PROT-042, Thorne, hydrophone…"
          className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-sm"
        />
        <button type="submit" className="px-3 py-1.5 bg-[#dfb76c] text-black font-bold text-xs rounded font-mono">SEARCH</button>
      </form>

      {results && (
        <div className="space-y-6" aria-live="polite">
          <p className="text-xs font-mono text-zinc-400">
            {q ? `${total} result${total === 1 ? '' : 's'} for “${q}”` : 'Featured records'}
          </p>
          <ResultGroup title="Prototypes" items={results.prototypes.map(p => ({ id: p.id, to: recordPath('prototype', p.id), title: `${p.id}: ${p.codeName}`, sub: p.title }))} />
          <ResultGroup title="Speculative Patents" items={results.patents.map(p => ({ id: p.id, to: recordPath('patent', p.id), title: p.patentNumber, sub: p.title }))} />
          <ResultGroup title="Research Notes" items={results.logs.map(l => ({ id: l.id, to: recordPath('log', l.id), title: `${l.id} · ${l.displayDate}`, sub: l.summary }))} />
          <ResultGroup title="Anomaly Post-Mortems" items={results.failures.map(f => ({ id: f.id, to: recordPath('failure', f.id), title: `${f.id} // ${f.projectCode}`, sub: f.projectTitle }))} />
          <ResultGroup title="Fellows" items={results.personnel.map(p => ({ id: p.id, to: recordPath('personnel', p.id), title: p.name, sub: p.title }))} />
        </div>
      )}
    </div>
  );
};

const ResultGroup: React.FC<{ title: string; items: { id: string; to: string; title: string; sub: string }[] }> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={`grp-${title}`}>
      <h2 id={`grp-${title}`} className="text-[10px] font-mono font-bold text-[#dfb76c] uppercase tracking-wider mb-2">
        {title} ({items.length})
      </h2>
      <ul className="space-y-1.5">
        {items.slice(0, 25).map(it => (
          <li key={it.id}>
            <Link to={it.to} className="block p-3 bg-[#04070a] hover:bg-[#0a121e] border border-[#1b2636] hover:border-[#dfb76c]/60 rounded">
              <div className="font-bold text-white text-sm">{it.title}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{it.sub}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SearchPage;
