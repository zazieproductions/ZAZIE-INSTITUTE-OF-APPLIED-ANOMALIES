import React, { useState, useMemo } from 'react';
import { labLogs, facilities } from '../data/archive';
import { LabLog } from '../data/types';
import { Search, Activity, ShieldAlert, Radio, Filter, Clock } from 'lucide-react';

interface LabLogsStreamProps {
  onSelectLog: (id: string) => void;
}

export const LabLogsStream: React.FC<LabLogsStreamProps> = ({ onSelectLog }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);

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

  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-wider">
              TELEMETRY SENSOR LAB LOGS ({labLogs.length} LOGS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Real-time chronological telemetry entries, ambient temperatures, acoustic sound pressure levels, magnetic flux, and anomaly flags.
          </p>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          Showing <span className="text-emerald-400 font-bold">{filtered.length}</span> of {labLogs.length} Logs
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#04070a] border border-emerald-950 p-3 rounded-lg space-y-3">
        <div className="flex items-center gap-2 bg-[#020406] border border-emerald-900/60 px-3 py-1.5 rounded">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs by ID, author, observation summary, or tags..."
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">FACILITY:</span>
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              className="bg-[#080d14] border border-emerald-950 text-zinc-200 rounded p-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">ALL FACILITIES</option>
              {facilities.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAnomalyOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded font-bold border transition-colors flex items-center gap-1.5 ${
              anomalyOnly
                ? 'bg-red-950 text-red-300 border-red-700 shadow-sm shadow-red-900/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ANOMALIES CONFIRMED ONLY</span>
          </button>
        </div>
      </div>

      {/* Logs Stream */}
      <div className="space-y-2">
        {filtered.map(log => (
          <div
            key={log.id}
            onClick={() => onSelectLog(log.id)}
            className="bg-[#05080c] border border-emerald-950/70 hover:border-emerald-600/70 p-3.5 rounded-lg cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold group-hover:text-emerald-300">
                  {log.id}
                </span>
                <span className="text-zinc-500 text-[10px]">{log.displayDate}</span>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {log.facility}
                </span>
                {log.anomalyAlert && (
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-red-950 text-red-300 border border-red-800 font-bold animate-pulse">
                    ANOMALY FLAGGED
                  </span>
                )}
              </div>

              <div className="text-zinc-200 text-xs font-medium">
                {log.summary}
              </div>

              <div className="text-[10px] text-zinc-400">
                Investigator: <span className="text-zinc-300">{log.author}</span> · Tags: {log.tags.join(', ')}
              </div>
            </div>

            {/* Environmental Sensors Mini-Strip */}
            <div className="flex items-center gap-3 shrink-0 text-[10px] bg-[#020406] px-3 py-1.5 rounded border border-emerald-950/60 text-zinc-400">
              <div>SPL: <span className="text-emerald-400 font-bold">{log.telemetry.splDecibels} dB</span></div>
              <div>TEMP: <span className="text-zinc-200">{log.telemetry.ambientTempC}°C</span></div>
              <div>FLUX: <span className="text-violet-400">{log.telemetry.magneticFluxMicroTesla} μT</span></div>
              <div>COH: <span className="text-cyan-400">{log.telemetry.spectralCoherence}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
