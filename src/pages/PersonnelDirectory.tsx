import React from 'react';
import { personnel } from '../data/archive';
import { Personnel } from '../data/types';
import { User, Shield, BookOpen, Cpu, Fingerprint, Award, ArrowRight } from 'lucide-react';

interface PersonnelDirectoryProps {
  onSelectFellow: (id: string) => void;
}

export const PersonnelDirectory: React.FC<PersonnelDirectoryProps> = ({ onSelectFellow }) => {
  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#05080f] border border-[#213045] p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp text-[9.5px] font-mono">
              THE COLLECTIVE
            </span>
            <span className="text-[10.5px] font-mono text-zinc-500">
              FELLOWS, COLLABORATORS &amp; BUILDERS
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Fellows, Artists &amp; Researchers ({personnel.length} Profiles)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            The people behind the work — instrument builders, sound artists, software poets, field recordists, 
            composers, and interdisciplinary inventors running the labs and the long-haul projects.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-zinc-400 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
          The team: <strong className="text-[#dfb76c]">{personnel.length} collaborators</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectFellow(p.id)}
            className="bg-[#05080f] border border-[#1c2a3b] hover:border-[#dfb76c]/80 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h3 className="text-white font-bold text-base group-hover:text-[#dfb76c] transition-colors">
                    {p.name}
                  </h3>
                  <div className="text-[#dfb76c] text-xs font-medium mt-0.5">
                    {p.title}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0b1522] text-cyan-300 border border-cyan-800">
                  {p.clearance}
                </span>
              </div>

              <div className="text-xs text-zinc-400 mb-2 font-mono">
                SPECIALIZATION: <span className="text-cyan-400 font-medium">{p.specialization}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">
                {p.biography}
              </p>

              <div className="space-y-1 text-xs font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-2">
                <div>FACILITY: <span className="text-zinc-200">{p.facilityAssignment}</span></div>
                <div>PROJECTS: <span className="text-emerald-400 font-bold">{p.activePrototypesCount} Active Prototypes</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#172333] text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1 text-emerald-400/90">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>VOICEPRINT VERIFIED</span>
              </span>
              <span className="text-zinc-400 group-hover:text-[#dfb76c] flex items-center gap-1">
                <span>VIEW DOSSIER</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
