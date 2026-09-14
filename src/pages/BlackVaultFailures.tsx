import React from 'react';
import { failures } from '../data/archive';
import { FailedIncident } from '../data/types';
import { AlertTriangle, ShieldAlert, Skull, Flame, FileWarning } from 'lucide-react';

interface BlackVaultFailuresProps {
  onSelectFailure: (id: string) => void;
}

export const BlackVaultFailures: React.FC<BlackVaultFailuresProps> = ({ onSelectFailure }) => {
  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 bg-[#080404] border border-red-950 p-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-base font-bold text-red-400 tracking-wider">
              THE BLACK VAULT // CONTAINED HAZARDS & CATASTROPHIC FAILURES ({failures.length} INCIDENTS)
            </h1>
          </div>
          <p className="text-zinc-400 text-[11px] mt-1">
            Forensic autopsies of acoustic resonant runaways, 168 dB concrete fractures, structural cavitations, and decommissioned experiments.
          </p>
        </div>

        <div className="text-right text-[11px] text-red-400/80">
          CLEARANCE: BLACK-BOX
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {failures.map(f => (
          <div
            key={f.id}
            onClick={() => onSelectFailure(f.id)}
            className="bg-[#070303] border border-red-950/80 hover:border-red-600/80 p-4 rounded-lg cursor-pointer transition-all flex flex-col justify-between group shadow-sm shadow-red-950/20"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-red-400 font-bold text-xs tracking-wider group-hover:text-red-300">
                    {f.id} // {f.projectCode}
                  </span>
                  <div className="text-zinc-200 font-semibold text-xs mt-0.5">
                    {f.projectTitle}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800">
                  {f.hazardClassification}
                </span>
              </div>

              <div className="text-[10px] text-zinc-500 mb-2">
                DATE: {f.incidentDate} · INVESTIGATOR: <span className="text-zinc-300">{f.leadInvestigator}</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3 mb-3">
                {f.summary}
              </p>

              <div className="p-2.5 bg-[#030101] border border-red-950/60 rounded text-[10px] text-red-300/80 space-y-1 mb-2">
                <div>STATUS: <span className="text-red-400 font-bold">{f.decommissionStatus}</span></div>
                <div className="line-clamp-2">ROOT CAUSE: {f.rootCauseAnalysis}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-red-950/60 text-[10px]">
              <span className="text-zinc-600">FORENSIC DISSECTION</span>
              <span className="text-red-400 group-hover:underline">VIEW AUTOPSY →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
