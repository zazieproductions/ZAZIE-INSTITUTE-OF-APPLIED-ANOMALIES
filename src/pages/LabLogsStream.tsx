import React, { useState, useMemo } from 'react';
import { labLogs, facilities } from '../data/archive';
import { LabLog } from '../data/types';
import { Search, Activity, ShieldAlert, Radio, Filter, Clock, ArrowRight, AlertTriangle } from 'lucide-react';

interface LabLogsStreamProps {
  onSelectLog: (id: string) => void;
}

export const LabLogsStream: React.FC<LabLogsStreamProps> = ({ onSelectLog }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(40);

  const filtered = useMemo(() => {
    return labLogs.filter(l => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.id.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q));

      const matchesFacility = selectedFacility === 'ALL' || l.facility === selectedFacility;
      const matchesAnomaly = !anomalyOnly || l.anomalyAlert;

      return matchesSearch && matchesFacility && matchesAnomaly;
    });
  }, [search, selectedFacility, anomalyOnly]);

  const displayedLogs = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              THE LAB JOURNAL
            </span>
            <span className="text-[10.5px] font-mono text-zinc-500">
              DATED ENTRIES FROM THE BENCH
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Research Notes, Lab Journals &amp; Field Logs ({labLogs.length} Entries)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Dated notes from the workbench, late-night sessions, field trips, and the occasional anomaly — 
            temperature, sound level, humidity, and electromagnetic conditions logged alongside the writing.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
          Showing <span className="text-emerald-400 font-bold">{Math.min(visibleCount, filtered.length)}</span> of {filtered.length} Matches ({labLogs.length} Total)
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#04070d] border border-[#213045] p-4 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center gap-2.5 bg-[#020509] border border-[#23354d] px-3.5 py-2 rounded-lg">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes by ID, author, keyword, or tag..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs md:text-sm font-serif"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs font-mono">
              CLEAR
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px] font-bold">FACILITY:</span>
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              className="bg-[#070e17] border border-[#1e2f44] text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL FACILITIES ({facilities.length})</option>
              {facilities.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAnomalyOnly(!anomalyOnly)}
            className={`px-3 py-1.5 rounded font-bold border transition-all flex items-center gap-1.5 text-xs ${
              anomalyOnly
                ? 'bg-red-950 text-red-200 border-red-600 shadow-[0_0_8px_#ef4444]'
                : 'bg-[#070e17] text-zinc-400 border-[#1e2f44] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>ANOMALOUS EVENTS ONLY</span>
          </button>
        </div>
      </div>

      {/* Stream Cards */}
      <div className="space-y-3">
        {displayedLogs.map(log => (
          <div
            key={log.id}
            onClick={() => onSelectLog(log.id)}
            className="p-4 bg-[#05080f] border border-[#1c2a3b] hover:border-emerald-500/80 rounded-xl cursor-pointer transition-all group shadow-sm hover:shadow-emerald-950/20"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-emerald-400 font-bold text-xs tracking-wider group-hover:text-emerald-300">
                  {log.id}
                </span>
                <span className="text-zinc-600 font-mono">·</span>
                <span className="text-xs font-mono text-cyan-300">{log.facility}</span>
                {log.anomalyAlert && (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-red-950 text-red-300 border border-red-700 font-bold animate-pulse">
                    ANOMALY
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>{log.displayDate}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300">{log.author}</span>
              </div>
            </div>

            <p className="text-zinc-200 text-sm leading-relaxed mb-3">
              {log.summary}
            </p>

            {/* Telemetry Readout Strip */}
            <div className="p-2.5 bg-[#020509] border border-[#141f2e] rounded-lg flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
              <div>TEMP: <strong className="text-zinc-200 font-normal">{log.telemetry.ambientTempC}°C</strong></div>
              <div>SPL: <strong className="text-emerald-400 font-normal">{log.telemetry.splDecibels} dB</strong></div>
              <div>HUMIDITY: <strong className="text-cyan-400 font-normal">{log.telemetry.relativeHumidityPct}%</strong></div>
              <div>FLUX: <strong className="text-violet-400 font-normal">{log.telemetry.magneticFluxMicroTesla} μT</strong></div>
              <div>MAINS: <strong className="text-amber-400 font-normal">{log.telemetry.mainsDriftHz} Hz</strong></div>
              <div>COHERENCE: <strong className="text-emerald-300 font-normal">{log.telemetry.spectralCoherence}</strong></div>
            </div>

            {/* Tags and Equipment */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#141f2e] text-[11px] font-mono text-zinc-500">
              <div className="flex flex-wrap items-center gap-1.5">
                {log.tags.map((t, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-[#08101a] border border-[#1a2838] rounded text-zinc-400">
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-emerald-400/80 group-hover:underline flex items-center gap-1">
                <span>READ FULL ENTRY</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount(prev => prev + 40)}
            className="px-6 py-2.5 bg-[#091322] hover:bg-[#0f1d33] border border-[#2b3e58] hover:border-[#dfb76c] text-[#dfb76c] rounded-lg font-mono text-xs transition-all shadow-md"
          >
            Load 40 more entries (showing {visibleCount} of {filtered.length})
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-zinc-400 bg-[#04070d] border border-[#213045] rounded-xl font-serif">
          No notes match the current search. Try another keyword.
        </div>
      )}
    </div>
  );
};
