import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadLabLogs, facilities, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { Search, ArrowRight, AlertTriangle } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Research Notes', path: '/research-notes' }
];

export const LabLogsStream: React.FC = () => {
  const labLogs = useCollection(loadLabLogs);
  const [search, setSearch] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return labLogs.filter(l => {
      const matchesSearch =
        !q ||
        l.id.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q));
      return matchesSearch && (selectedFacility === 'ALL' || l.facility === selectedFacility) && (!anomalyOnly || l.anomalyAlert);
    });
  }, [labLogs, search, selectedFacility, anomalyOnly]);

  const displayedLogs = filtered.slice(0, visibleCount);
  const description = `${archiveStats.totalLogs} chronological research notes and lab telemetry records (2021–2026) from the Zazie Institute of Applied Anomalies: bench calibrations, field recordings, anomaly events and environmental sensor data.`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Research Notes & Lab Telemetry (${archiveStats.totalLogs} Records)`}
        description={description}
        path="/research-notes"
        keywords={['research notes', 'lab logs', 'acoustic telemetry', 'field recordings', 'experimental audio research']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Research Notes & Lab Telemetry Stream',
            description,
            path: '/research-notes',
            about: ['audio research', 'experimental technology'],
            items: labLogs.map(l => ({ name: `${l.id}: ${l.summary}`, path: recordPath('log', l.id) }))
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="RESEARCH NOTES & FIELD LOGS"
        kicker="CHRONOLOGICAL ENGINEERING STREAM"
        tone="emerald"
        title={<>Research Notes &amp; Lab Telemetry Stream ({labLogs.length} Records)</>}
        lede="Chronological research notes from ZIAA studios and field stations: bench calibrations, DSP firmware sessions, site listening logs and confirmed anomaly events, each with environmental telemetry (SPL, magnetic flux, mains drift, spectral coherence)."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3 py-2 border border-[#1b2636] rounded-md shrink-0" aria-live="polite">
            <span className="text-emerald-400 font-bold">{archiveStats.anomalyLogs}</span> anomaly events ·{' '}
            <span className="text-[#dfb76c] font-bold">{filtered.length}</span> matching
          </p>
        }
      />

      <section aria-label="Filter research notes" className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search research notes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by note ID, author, summary keywords, or tags…"
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-zinc-400 hover:text-white text-xs font-mono">CLEAR</button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <label htmlFor="f-facility" className="text-zinc-400 uppercase tracking-wider text-[10px] font-bold">Facility:</label>
            <select id="f-facility" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)} className="bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500">
              <option value="ALL">ALL FACILITIES ({facilities.length})</option>
              {facilities.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button
            type="button"
            aria-pressed={anomalyOnly}
            onClick={() => setAnomalyOnly(v => !v)}
            className={`px-3 py-1.5 rounded font-bold border transition-all flex items-center gap-1.5 text-xs ${
              anomalyOnly ? 'bg-red-950 text-red-200 border-red-600 shadow-[0_0_8px_#ef4444]' : 'bg-[#070e17] text-zinc-300 border-[#1e2f44] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
            <span>ANOMALOUS EVENTS ONLY</span>
          </button>
        </div>
      </section>

      <ol className="space-y-3" aria-label="Research notes">
        {displayedLogs.map(log => (
          <li key={log.id}>
            <article className="p-4 bg-[#05080f] border border-[#1c2a3b] hover:border-emerald-500/80 rounded-xl transition-all group shadow-sm hover:shadow-emerald-950/20">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-emerald-400 font-bold text-xs tracking-wider">{log.id}</span>
                  <span className="text-zinc-600 font-mono" aria-hidden="true">·</span>
                  <span className="text-xs font-mono text-cyan-300">{log.facility}</span>
                  {log.anomalyAlert && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-red-950 text-red-300 border border-red-700 font-bold">ANOMALY</span>
                  )}
                </div>
                <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                  <time dateTime={log.timestamp}>{log.displayDate}</time>
                  <span className="text-zinc-600" aria-hidden="true">·</span>
                  <span className="text-zinc-300">{log.author}</span>
                </div>
              </div>

              <h2 className="text-zinc-200 text-sm leading-relaxed mb-3 font-medium">
                <Link to={recordPath('log', log.id)} className="hover:text-emerald-300">{log.summary}</Link>
              </h2>

              <dl className="p-2.5 bg-[#020509] border border-[#141f2e] rounded-lg flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <div><dt className="inline">TEMP: </dt><dd className="inline text-zinc-200">{log.telemetry.ambientTempC}°C</dd></div>
                <div><dt className="inline">SPL: </dt><dd className="inline text-emerald-400">{log.telemetry.splDecibels} dB</dd></div>
                <div><dt className="inline">HUMIDITY: </dt><dd className="inline text-cyan-400">{log.telemetry.relativeHumidityPct}%</dd></div>
                <div><dt className="inline">FLUX: </dt><dd className="inline text-violet-400">{log.telemetry.magneticFluxMicroTesla} μT</dd></div>
                <div><dt className="inline">MAINS: </dt><dd className="inline text-amber-400">{log.telemetry.mainsDriftHz} Hz</dd></div>
                <div><dt className="inline">COHERENCE: </dt><dd className="inline text-emerald-300">{log.telemetry.spectralCoherence}</dd></div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#141f2e] text-[11px] font-mono text-zinc-400">
                <ul className="flex flex-wrap items-center gap-1.5" aria-label="Tags">
                  {log.tags.map(t => (
                    <li key={t} className="px-1.5 py-0.5 bg-[#08101a] border border-[#1a2838] rounded text-zinc-400">#{t}</li>
                  ))}
                </ul>
                <Link to={recordPath('log', log.id)} className="text-emerald-400 hover:underline flex items-center gap-1">
                  <span>FULL TELEMETRY NOTE</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ol>

      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 40)}
            className="px-6 py-2.5 bg-[#091322] hover:bg-[#0f1d33] border border-[#2b3e58] hover:border-[#dfb76c] text-[#dfb76c] rounded-lg font-mono text-xs transition-all shadow-md"
          >
            Load 40 More Notes (Showing {visibleCount} of {filtered.length})
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-16 text-center text-zinc-300 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No research notes match the current filters.
        </p>
      )}
    </div>
  );
};

export default LabLogsStream;
