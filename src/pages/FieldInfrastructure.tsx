import React from 'react';
import { fieldSites } from '../data/archive';
import { FieldSite } from '../data/types';
import { SubterraneanArraySchematic } from '../components/TechnicalSchematics';
import { Compass, Radio, MapPin, Layers, Server } from 'lucide-react';

interface FieldInfrastructureProps {
  onSelectSite: (id: string) => void;
}

export const FieldInfrastructure: React.FC<FieldInfrastructureProps> = ({ onSelectSite }) => {
  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#05080c] border border-amber-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-wider">
              FIELD SITES & PUBLIC LISTENING INFRASTRUCTURE ({fieldSites.length} INSTALLATIONS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Global subterranean seismic arrays, deep borehole listening nodes, public acoustic obelisks, and glacial hydrophone networks operated by ZIAA.
          </p>
        </div>

        <div className="text-right text-[11px] text-zinc-500">
          Global Sensor Grid // 2021–2026
        </div>
      </div>

      {/* Subterranean Blueprint Feature */}
      <SubterraneanArraySchematic codeName="FACILITY-7-SEISMIC" />

      {/* Field Site Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldSites.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSite(s.id)}
            className="bg-[#05080c] border border-amber-950/70 hover:border-amber-500/70 p-4 rounded-lg cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-amber-400 font-bold text-xs tracking-wider group-hover:text-amber-300">
                    {s.codename}
                  </span>
                  <div className="text-zinc-200 font-semibold text-xs mt-0.5">
                    {s.name}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] bg-amber-950 text-amber-300 border border-amber-800">
                  {s.activeStatus}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{s.location}</span>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono mb-2">
                COORDINATES: {s.coordinates} · EST. {s.establishedYear}
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                {s.description}
              </p>

              <div className="p-2.5 bg-[#020406] border border-amber-950/60 rounded text-[10px] text-zinc-400 space-y-1 mb-2">
                <div>CHANNELS: <span className="text-emerald-400 font-bold">{s.channelCount} Transducers</span></div>
                <div>BANDWIDTH: <span className="text-cyan-400">{s.frequencyRange}</span></div>
                <div>FOOTPRINT: <span className="text-zinc-200">{s.physicalFootprint}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-950/60 text-[10px]">
              <span className="text-zinc-500">Autonomous Operation</span>
              <span className="text-amber-400 group-hover:underline">INSPECT STATION →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
