import React, { useState, useMemo } from 'react';
import { useShowMore } from '../lib/useShowMore';
import { ShowMoreButton } from '../components/ShowMore';
import { Link, useSearchParams } from 'react-router-dom';
import { loadPrototypes, disciplines, clearances, statuses, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import type { Prototype } from '../data/types';
import { audioEngine } from '../audio/audioEngine';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, collectionDatasetSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { humanize } from '../lib/format';
import { Search, Play, Square, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Prototypes', path: '/prototypes' }
];

export const PrototypesArchive: React.FC = () => {
  const prototypes = useCollection(loadPrototypes);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const selectedDiscipline = params.get('discipline') ?? 'ALL';
  const selectedStatus = params.get('status') ?? 'ALL';
  const selectedClearance = params.get('clearance') ?? 'ALL';
  const selectedYear = params.get('year') ?? 'ALL';
  const [playingId, setPlayingId] = useState<string | null>(null);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'ALL') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prototypes.filter(p => {
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.codeName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.leadResearcher.toLowerCase().includes(q);
      return (
        matchesSearch &&
        (selectedDiscipline === 'ALL' || p.discipline === selectedDiscipline) &&
        (selectedStatus === 'ALL' || p.status === selectedStatus) &&
        (selectedClearance === 'ALL' || p.clearance === selectedClearance) &&
        (selectedYear === 'ALL' || p.year.toString() === selectedYear)
      );
    });
  }, [prototypes, search, selectedDiscipline, selectedStatus, selectedClearance, selectedYear]);

  const pager = useShowMore(filtered, 24, 24);

  const handleToggleAudio = (e: React.MouseEvent, p: Prototype) => {
    e.preventDefault();
    e.stopPropagation();
    if (playingId === p.id) {
      audioEngine.stop();
      setPlayingId(null);
    } else {
      audioEngine.playProfile(p.audioProfile);
      setPlayingId(p.id);
    }
  };

  const years = useMemo(() => Array.from(new Set(prototypes.map(p => p.year))).sort(), [prototypes]);
  const description = `Archive of ${archiveStats.totalPrototypes} experimental prototypes from the Zazie Institute of Applied Anomalies (ZIAA): physical-computing instruments, DSP audio software, perceptual interfaces and speculative acoustic hardware, 2021–2026.`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Experimental Prototypes & Instrument Systems (${archiveStats.totalPrototypes} Records)`}
        description={description}
        path="/prototypes"
        keywords={['experimental prototypes', 'audio hardware', 'DSP software', 'creative technology', 'ZIAA prototypes']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Prototype Archive',
            description,
            path: '/prototypes',
            about: ['experimental technology', 'audio research', 'prototypes'],
            items: prototypes.map(p => ({ name: `${p.id} ${p.codeName} — ${p.title}`, path: recordPath('prototype', p.id) }))
          }),
          collectionDatasetSchema({
            path: '/prototypes',
            name: 'ZIAA prototype archive',
            description,
            count: prototypes.length,
            variables: ['Prototype identifier and codename', 'Discipline and year', 'Status and clearance tier', 'Technical specification and bill of materials', 'Linked patents, notes and field deployments']
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="PROTOTYPE ARCHIVE"
        kicker="CREATIVE-TECHNOLOGY SPECIFICATION REGISTRY"
        title={<>Experimental Prototypes &amp; Instrument Systems ({prototypes.length} Records)</>}
        lede="Complete five-year archive (2021–2026) of ZIAA physical-computing instruments, tactile perceptual interfaces, DSP software engines and speculative acoustic hardware. Each record links to its full technical dossier, schematic, bill of materials and playable acoustic profile."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3 py-2 border border-[#1b2636] rounded-md shrink-0" aria-live="polite">
            Showing <span className="text-[#dfb76c] font-bold">{filtered.length}</span> of {prototypes.length} Prototypes
          </p>
        }
      />

      {/* Filters */}
      <section aria-label="Filter prototypes" className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-[#dfb76c] shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search prototypes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, code name, title, abstract, or lead researcher…"
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-zinc-400 hover:text-white text-xs font-mono">
              CLEAR
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label htmlFor="f-discipline" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Discipline</label>
            <select id="f-discipline" value={selectedDiscipline} onChange={e => setFilter('discipline', e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]">
              <option value="ALL">ALL DISCIPLINES ({disciplines.length})</option>
              {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-status" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Status</label>
            <select id="f-status" value={selectedStatus} onChange={e => setFilter('status', e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]">
              <option value="ALL">ALL STATUSES</option>
              {statuses.map(s => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-clearance" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Clearance</label>
            <select id="f-clearance" value={selectedClearance} onChange={e => setFilter('clearance', e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]">
              <option value="ALL">ALL CLEARANCES</option>
              {clearances.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-year" className="text-zinc-400 text-[10px] block mb-1 uppercase tracking-wider font-bold">Year</label>
            <select id="f-year" value={selectedYear} onChange={e => setFilter('year', e.target.value)} className="w-full bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-2 focus:outline-none focus:border-[#dfb76c]">
              <option value="ALL">2021–2026</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Cards */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Prototype records">
        {pager.visible.map(p => {
          const isThisPlaying = playingId === p.id;
          return (
            <li key={p.id} className="bg-[#05080f] border border-[#1c2a3b] hover:border-[#dfb76c]/80 rounded-xl transition-all flex flex-col justify-between group shadow-md hover:shadow-[#dfb76c]/5">
              <Link to={recordPath('prototype', p.id)} className="block p-4 pb-0 flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <div className="text-[#dfb76c] font-bold text-xs tracking-wider group-hover:text-white font-mono">
                      {p.id} // {p.codeName}
                    </div>
                    <h2 className="text-zinc-100 font-bold text-sm mt-0.5 line-clamp-1">{p.title}</h2>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0b1522] text-cyan-300 border border-cyan-800/60">
                    {p.clearance}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">{p.abstract}</p>
                <dl className="space-y-1.5 text-[10.5px] font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-3">
                  <div className="flex justify-between gap-2"><dt className="text-zinc-400">DISCIPLINE:</dt><dd className="text-cyan-400 font-medium truncate">{p.discipline}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-zinc-400">BANDWIDTH:</dt><dd className="text-zinc-300">{p.operationalBandwidth}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-zinc-400">TRANSDUCER:</dt><dd className="text-zinc-300 truncate max-w-[170px]">{p.primaryTransducer}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-zinc-400">INVESTIGATOR:</dt><dd className="text-zinc-300 truncate max-w-[170px]">{p.leadResearcher}</dd></div>
                </dl>
              </Link>
              <div className="flex items-center justify-between px-4 pb-4 pt-2.5 border-t border-[#172333]">
                <button
                  type="button"
                  onClick={e => handleToggleAudio(e, p)}
                  aria-pressed={isThisPlaying}
                  aria-label={`${isThisPlaying ? 'Stop' : 'Audition'} acoustic signature of ${p.codeName}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all shadow-sm ${
                    isThisPlaying ? 'bg-red-500 text-black shadow-[0_0_10px_#ef4444]' : 'bg-[#0f1d2e] hover:bg-[#182b40] border border-[#2b415e] text-cyan-300'
                  }`}
                >
                  {isThisPlaying ? <Square className="w-3 h-3 fill-current" aria-hidden="true" /> : <Play className="w-3 h-3 fill-current text-cyan-400" aria-hidden="true" />}
                  <span>{isThisPlaying ? 'HALT' : 'AUDITION'}</span>
                </button>
                <Link to={recordPath('prototype', p.id)} className="text-xs font-mono text-zinc-300 hover:text-[#dfb76c] flex items-center gap-1">
                  <span>OPEN DOSSIER</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {pager.hasMore && <ShowMoreButton remaining={pager.remaining} onMore={pager.showMore} onAll={pager.showAll} label="prototypes" />}

      {/* Crawlable complete index — every prototype dossier is linked in the prerendered HTML so deep signal-archaeology, perceptual-interface and acoustic-architecture instruments are discoverable without client-side paging. */}
      <section aria-labelledby="complete-prototype-index" className="bg-[#05080f] border border-[#1b2738] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="complete-prototype-index" className="text-sm font-bold text-white tracking-wide">Complete prototype index — every record, crawlable</h2>
          <p className="text-[11px] font-mono text-zinc-400">All {prototypes.length} dossiers · grouped alphabetically by accession</p>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The card grid above is paged for interactive browsing; the index below lists the full five-year archive as plain, crawlable links. Every dossier — including deeply archived signal-archaeology, generative-software and acoustic-bench instruments — is reachable in a single crawl with descriptive anchor text.
        </p>
        <details className="group/details">
          <summary className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#091322] hover:bg-[#122238] border border-[#2b3e58] rounded-md text-xs font-mono text-[#dfb76c] cursor-pointer select-none list-none">
            <span aria-hidden="true" className="transition-transform group-open/details:rotate-90">▸</span>
            Expand complete A–Z index ({prototypes.length} records)
          </summary>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...prototypes].sort((a, b) => a.id.localeCompare(b.id)).map(p => (
              <Link
                key={p.id}
                to={recordPath('prototype', p.id)}
                className="block px-3 py-2 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded text-xs group/link"
              >
                <span className="font-mono font-bold text-[#dfb76c] group-hover/link:text-white">{p.id}</span>
                <span className="text-zinc-600 font-mono"> · </span>
                <span className="font-semibold text-zinc-200 group-hover/link:text-white">{p.codeName}</span>
                <span className="block text-[11px] text-zinc-400 truncate mt-0.5">{p.title} — {p.discipline}</span>
              </Link>
            ))}
          </div>
        </details>
        <noscript>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...prototypes].sort((a, b) => a.id.localeCompare(b.id)).map(p => (
              <li key={p.id}>
                <Link to={recordPath('prototype', p.id)} className="block px-3 py-2 bg-[#03060a] border border-[#1b2738] rounded text-xs">
                  <span className="font-mono font-bold text-[#dfb76c]">{p.id} — {p.codeName}</span>
                  <span className="block text-[11px] text-zinc-400 truncate">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </noscript>
      </section>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-zinc-300 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No experimental prototypes match the selected query. Please refine your filter parameters.
        </p>
      )}
    </div>
  );
};

export default PrototypesArchive;
