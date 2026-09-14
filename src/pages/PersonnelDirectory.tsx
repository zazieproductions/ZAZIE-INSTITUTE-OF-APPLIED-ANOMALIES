import React from 'react';
import { personnel } from '../data/archive';
import { Personnel } from '../data/types';
import { User, Shield, BookOpen, Cpu, Fingerprint } from 'lucide-react';

interface PersonnelDirectoryProps {
  onSelectFellow: (id: string) => void;
}

export const PersonnelDirectory: React.FC<PersonnelDirectoryProps> = ({ onSelectFellow }) => {
  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="bg-[#05080c] border border-emerald-950 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h1 className="text-base font-bold text-white tracking-wider">
            ZIAA FELLOWS & SENIOR RESEARCH DIRECTORY ({personnel.length} PROFILES)
          </h1>
        </div>
        <p className="text-zinc-400 text-[11px] mt-1">
          Acousticians, phononic physicists, signal archaeologists, psychoacousticians, and material scientists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectFellow(p.id)}
            className="bg-[#05080c] border border-emerald-950/80 hover:border-emerald-600/70 p-4 rounded-lg cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h3 className="text-white font-bold text-sm group-hover:text-emerald-300">
                    {p.name}
                  </h3>
                  <div className="text-emerald-400 text-[11px] font-medium mt-0.5">
                    {p.title}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {p.clearance}
                </span>
              </div>

              <div className="text-[10px] text-zinc-400 mb-2">
                SPECIALIZATION: <span className="text-cyan-400">{p.specialization}</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                {p.biography}
              </p>

              <div className="space-y-1 text-[10px] text-zinc-500 border-t border-emerald-950/60 pt-2 mb-2">
                <div>FACILITY: <span className="text-zinc-300">{p.facilityAssignment}</span></div>
                <div>PROJECTS: <span className="text-emerald-400 font-bold">{p.activePrototypesCount} Active Prototypes</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-950/60 text-[10px]">
              <span className="text-zinc-600 font-mono">VOICEPRINT VERIFIED</span>
              <span className="text-emerald-400 group-hover:underline">VIEW DOSSIER →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
