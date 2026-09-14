import React from 'react';
import { fieldSites } from '../data/archive';
import { FieldSite } from '../data/types';
import { StatusBadge } from '../components/StatusBadge';
import { getFieldSiteStatusLabel } from '../data/projectStatus';
import { SubterraneanArraySchematic } from '../components/TechnicalSchematics';
import { Compass, Radio, MapPin, Layers, Server, ArrowRight, Info } from 'lucide-react';

interface FieldInfrastructureProps {
  onSelectSite: (id: string) => void;
}

export const FieldInfrastructure: React.FC<FieldInfrastructureProps> = ({ onSelectSite }) => {
  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              DISTRIBUTED FIELD STATIONS
            </span>
            <span className="text-[10.5px] font-mono text-zinc-400">
              REMOTE LISTENING POSTS & ACOUSTIC OBSERVATORIES
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Distributed Field Stations & Sound Observatories ({fieldSites.length} Stations)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Remote desert acoustic sanctuaries, sub-glacial hydrophone arrays, subterranean reverberation vaults, 
            and coastal listening pavilions gathering environmental acoustic and electromagnetic telemetry.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
          Network Status: <strong className="text-amber-400 font-bold">{fieldSites.length} Active Stations</strong>
        </div>
      </div>

      {/* Field Site Notice */}
      <div className="bg-[#03060c] border border-[#1e2a3b] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Info className="w-4 h-4 text-[#dfb76c] shrink-0" />
          <span className="leading-relaxed">
            <strong className="text-white">Classification Notice:</strong> Field observatories and seismic listening arrays represent 
            <strong> artistic research</strong> installations and speculative environmental sound stations.
          </span>
        </div>
        <a
          href="#disclaimer"
          className="text-[#dfb76c] hover:underline font-mono text-[11px] whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <span>Research Disclaimer</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Subterranean Blueprint Feature */}
      <SubterraneanArraySchematic codeName="FACILITY-7-SEISMIC" />

      {/* Field Site Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldSites.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSite(s.id)}
            className="bg-[#05080f] border border-[#1c2a3b] hover:border-amber-500/80 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-amber-400 font-mono font-bold text-xs tracking-wider group-hover:text-amber-300">
                    {s.codename}
                  </span>
                  <div className="text-zinc-100 font-bold text-base mt-1">
                    {s.name}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#161208] text-amber-300 border border-amber-800">
                  {s.activeStatus}
                </span>
              </div>

              <div className="mb-2">
                <StatusBadge label={getFieldSiteStatusLabel(s)} size="xs" />
              </div>

              <div className="text-xs text-zinc-400 font-mono mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{s.location}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">
                {s.description}
              </p>

              <div className="space-y-1 text-xs font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-2">
                <div>CHANNELS: <span className="text-emerald-400 font-bold">{s.channelCount} Transducers</span></div>
                <div>BANDWIDTH: <span className="text-cyan-400">{s.frequencyRange}</span></div>
                <div>FOOTPRINT: <span className="text-zinc-300">{s.physicalFootprint}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#172333] text-xs font-mono text-zinc-500">
              <span>COORD: {s.coordinates}</span>
              <span className="text-amber-400/90 group-hover:underline flex items-center gap-1">
                <span>VIEW FACILITY SPEC</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

