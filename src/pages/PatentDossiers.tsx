import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadPatents, disciplines, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, collectionDatasetSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { humanize } from '../lib/format';
import { useShowMore } from '../lib/useShowMore';
import { ShowMoreButton } from '../components/ShowMore';
import { Search, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Speculative Patents', path: '/patents' }
];

export const PatentDossiers: React.FC = () => {
  const patents = useCollection(loadPatents);
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patents.filter(p => {
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.patentNumber.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.inventors.some(inv => inv.toLowerCase().includes(q));
      return matchesSearch && (selectedDiscipline === 'ALL' || p.primaryDiscipline === selectedDiscipline) && (selectedStatus === 'ALL' || p.status === selectedStatus);
    });
  }, [patents, search, selectedDiscipline, selectedStatus]);

  const pager = useShowMore(filtered, 24, 24);

  const uniqueStatuses = useMemo(() => Array.from(new Set(patents.map(p => p.status))), [patents]);
  const description = `${archiveStats.totalPatents} speculative patent dossiers and defensive disclosures from the Zazie Institute of Applied Anomalies: claims, prior-art critiques and exhibits for experimental audio, perceptual-interface and speculative-engineering inventions.`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Speculative Patents & Defensive Disclosures (${archiveStats.totalPatents} Dossiers)`}
        description={description}
        path="/patents"
        keywords={['speculative patents', 'defensive publication', 'design fiction', 'speculative engineering', 'audio inventions']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Speculative Patent Dossiers',
            description,
            path: '/patents',
            about: ['speculative engineering', 'experimental technology'],
            items: patents.map(p => ({ name: `${p.patentNumber} — ${p.title}`, path: recordPath('patent', p.id) }))
          }),
          collectionDatasetSchema({
            path: '/patents',
            name: 'ZIAA speculative patent dossiers',
            description,
            count: patents.length,
            variables: ['Patent number and filing date', 'Independent and dependent claims', 'Inventorship and assignee', 'Prior-art critique', 'Linked prototypes']
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="SPECULATIVE ENGINEERING PATENTS"
        kicker="DEFENSIVE DISCLOSURES & TECHNICAL INVENTIONS"
        tone="cyan"
        title={<>Speculative Patents &amp; Defensive Disclosures ({patents.length} Dossiers)</>}
        lede="Design-fiction patent dossiers documenting ZIAA inventions in experimental audio, perceptual interfaces and speculative engineering. Each dossier records claims, prior-art critique, exhibits and linked prototypes. These are creative-technology disclosures, not legal filings."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3 py-2 border border-[#1b2636] rounded-md shrink-0" aria-live="polite">
            Showing <span className="text-cyan-400 font-bold">{filtered.length}</span> of {patents.length} Dossiers
          </p>
        }
      />

      <section aria-label="Filter patents" className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search speculative patents"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by serial number, inventor, title, or claim keywords…"
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && <button type="button" onClick={() => setSearch('')} className="text-zinc-400 hover:text-white text-xs font-mono">CLEAR</button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label htmlFor="p-discipline" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Discipline</label>
            <select id="p-discipline" value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-cyan-500">
              <option value="ALL">ALL DISCIPLINES ({disciplines.length})</option>
              {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="p-status" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Disclosure Status</label>
            <select id="p-status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-cyan-500">
              <option value="ALL">ALL STATUSES</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>
        </div>
      </section>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Patent dossiers">
        {pager.visible.map(p => (
          <li key={p.id}>
            <Link
              to={recordPath('patent', p.id)}
              className="h-full bg-[#05080f] border border-[#1c2a3b] hover:border-cyan-500/80 p-5 rounded-xl transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <div className="text-cyan-400 font-mono font-bold text-xs tracking-wider">{p.patentNumber} // {p.id}</div>
                    <h2 className="text-zinc-100 font-bold text-base mt-1 group-hover:text-cyan-200">{p.title}</h2>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#091522] text-cyan-300 border border-cyan-800">{humanize(p.status)}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4">{p.abstract}</p>
                {p.independentClaims?.[0] && (
                  <p className="p-3 bg-[#020509] border-l-2 border-cyan-500 rounded text-xs text-zinc-300 mb-3 font-mono">
                    <span className="text-cyan-400 font-bold">INDEPENDENT CLAIM: </span>
                    <span className="italic line-clamp-2">{p.independentClaims[0]}</span>
                  </p>
                )}
              </div>
              <div className="pt-3 border-t border-[#172333] flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
                <div className="flex items-center gap-3">
                  <span>FILED: <time dateTime={p.filingDate}>{p.filingDate}</time></span>
                  <span aria-hidden="true">·</span>
                  <span>DISCIPLINE: <strong className="text-zinc-300 font-normal">{p.primaryDiscipline}</strong></span>
                </div>
                <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                  <span>VIEW DOSSIER</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {pager.hasMore && <ShowMoreButton remaining={pager.remaining} onMore={pager.showMore} onAll={pager.showAll} label="patents" />}

      {/* Crawlable complete index — every speculative patent dossier linked with defensive-disclosure title for discovery without paging. */}
      <section aria-labelledby="complete-patent-index" className="bg-[#05080f] border border-[#1b2738] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="complete-patent-index" className="text-sm font-bold text-white tracking-wide">Complete patent index — all defensive disclosures, crawlable</h2>
          <p className="text-[11px] font-mono text-zinc-400">All {patents.length} dossiers · ordered by filing date</p>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The dossiers above are paged for reading; the index below exposes the entire speculative-patent file as plain links so every audio-invention disclosure — from hysteresis limiters to hydrophone arrays — is discoverable in the static crawl.
        </p>
        <details className="group/details">
          <summary className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#091322] hover:bg-[#122238] border border-[#2b3e58] rounded-md text-xs font-mono text-cyan-300 cursor-pointer select-none list-none">
            <span aria-hidden="true" className="transition-transform group-open/details:rotate-90">▸</span>
            Expand complete index ({patents.length} dossiers)
          </summary>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {[...patents].sort((a, b) => a.filingDate.localeCompare(b.filingDate)).map(p => (
              <Link
                key={p.id}
                to={recordPath('patent', p.id)}
                className="block px-3 py-2 bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/60 rounded text-xs group/link"
              >
                <span className="font-mono font-bold text-cyan-400 group-hover/link:text-white">{p.patentNumber}</span>
                <span className="text-zinc-600 font-mono"> · {p.id} · </span>
                <span className="font-semibold text-zinc-200 group-hover/link:text-white line-clamp-1">{p.title}</span>
                <span className="block text-[11px] text-zinc-400 truncate mt-0.5">{p.primaryDiscipline} — filed {p.filingDate}</span>
              </Link>
            ))}
          </div>
        </details>
        <noscript>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {[...patents].sort((a, b) => a.filingDate.localeCompare(b.filingDate)).map(p => (
              <li key={p.id}>
                <Link to={recordPath('patent', p.id)} className="block px-3 py-2 bg-[#03060a] border border-[#1b2738] rounded text-xs">
                  <span className="font-mono font-bold text-cyan-400">{p.patentNumber}</span>
                  <span className="block text-[11px] text-zinc-400 truncate">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </noscript>
      </section>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-zinc-300 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No patent dossiers match the current filters.
        </p>
      )}
    </div>
  );
};

export default PatentDossiers;
