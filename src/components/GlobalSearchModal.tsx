import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchArchive, recordPath, type SearchResults } from '../data/archive';
import { Search, X, FileText, Cpu, AlertTriangle, User, Activity, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Row {
  id: string;
  to: string;
  title: string;
  sub: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      searchArchive(query).then(r => live && setResults(r));
    }, 120);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query]);

  if (!isOpen) return null;

  const groups: { title: string; Icon: React.ElementType; color: string; rows: Row[] }[] = results
    ? [
        { title: 'Prototypes', Icon: Cpu, color: 'text-emerald-400', rows: results.prototypes.slice(0, 5).map(p => ({ id: p.id, to: recordPath('prototype', p.id), title: `${p.id}: ${p.codeName}`, sub: p.title })) },
        { title: 'Speculative Patents', Icon: FileText, color: 'text-cyan-400', rows: results.patents.slice(0, 4).map(p => ({ id: p.id, to: recordPath('patent', p.id), title: p.patentNumber, sub: p.title })) },
        { title: 'Research Notes', Icon: Activity, color: 'text-emerald-300', rows: results.logs.slice(0, 4).map(l => ({ id: l.id, to: recordPath('log', l.id), title: `${l.id} · ${l.displayDate}`, sub: l.summary })) },
        { title: 'Anomaly Post-Mortems', Icon: AlertTriangle, color: 'text-red-400', rows: results.failures.slice(0, 3).map(f => ({ id: f.id, to: recordPath('failure', f.id), title: `${f.id} // ${f.projectCode}`, sub: f.projectTitle })) },
        { title: 'Fellows', Icon: User, color: 'text-[#dfb76c]', rows: results.personnel.slice(0, 3).map(p => ({ id: p.id, to: recordPath('personnel', p.id), title: p.name, sub: p.title })) }
      ]
    : [];
  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Archive search"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#070a0e] border border-emerald-900/80 rounded-lg shadow-2xl overflow-hidden font-mono text-zinc-300 flex flex-col max-h-[80vh]"
      >
        <form
          role="search"
          onSubmit={e => {
            e.preventDefault();
            onClose();
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
          className="flex items-center px-4 py-3 bg-[#040608] border-b border-emerald-950"
        >
          <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-3" aria-hidden="true" />
          <label htmlFor="omni-search" className="sr-only">Search the archive</label>
          <input
            id="omni-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search prototypes, speculative patents, research notes, post-mortems, fellows…"
            className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-sm"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-white mr-2" aria-label="Clear search">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={onClose} className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded" aria-label="Close search">
            ESC
          </button>
        </form>

        <div className="overflow-y-auto p-4 space-y-4 text-xs divide-y divide-emerald-950/60">
          {results && total === 0 ? (
            <p className="py-8 text-center text-zinc-400">No matching records found for “{query}”.</p>
          ) : (
            groups
              .filter(g => g.rows.length > 0)
              .map(g => (
                <section key={g.title} className="pt-2 first:pt-0" aria-label={g.title}>
                  <h2 className={`text-[10px] font-bold ${g.color} uppercase tracking-wider mb-2 flex items-center gap-1.5`}>
                    <g.Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{g.title} ({g.rows.length})</span>
                  </h2>
                  <ul className="space-y-1.5">
                    {g.rows.map(r => (
                      <li key={r.id}>
                        <Link
                          to={r.to}
                          onClick={onClose}
                          className="p-2 bg-[#04070a] hover:bg-emerald-950/40 border border-emerald-950/70 hover:border-emerald-600/60 rounded flex justify-between items-center transition-colors group"
                        >
                          <span className="min-w-0">
                            <span className="block font-bold text-white group-hover:text-emerald-300">{r.title}</span>
                            <span className="block text-[11px] text-zinc-400 truncate">{r.sub}</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#030508] border-t border-emerald-950/80 text-[10px] text-zinc-400 flex justify-between items-center">
          <span>Full-text lookup across the ZIAA 2021–2026 archive</span>
          <Link to={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} className="text-emerald-400 hover:underline">
            Open full results page →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
