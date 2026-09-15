import React from 'react';
import { failures } from '../data/archive';
import { FailedIncident } from '../data/types';
import { StatusBadge } from '../components/StatusBadge';
import { getFailureStatusLabel } from '../data/projectStatus';
import { AlertTriangle, ShieldAlert, Skull, Flame, FileWarning, ArrowRight, Info } from 'lucide-react';

interface BlackVaultFailuresProps {
  onSelectFailure: (id: string) => void;
}

export const BlackVaultFailures: React.FC<BlackVaultFailuresProps> = ({ onSelectFailure }) => {
  return (
    <div className="space-y-6 font-serif">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#0a0404] border border-red-950/80 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="archival-stamp archival-stamp-red text-[9.5px] font-mono">
              ANOMALY POST-MORTEMS
            </span>
            <span className="text-[10.5px] font-mono text-red-400/80">
              SPECULATIVE ENGINEERING ARCHIVE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-red-300 tracking-wide">
            Experimental Anomalies & System Post-Mortems ({failures.length} Records)
          </h1>
          <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
            Detailed case studies of prototype feedback cascades, mechanical fatigue, algorithmic drift, 
            and physical acoustic boundaries encountered during experimental testing.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-red-400 bg-[#140505] px-3.5 py-2 border border-red-900/60 rounded-md shrink-0">
          Status: <strong className="text-red-300 font-bold">{failures.length} Documented Post-Mortems</strong>
        </div>
      </div>

      {/* Mandatory Design Fiction Disclaimer */}
      <div className="bg-[#0f0404] border border-red-900/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Info className="w-4 h-4 text-red-400 shrink-0" />
          <span className="leading-relaxed">
            <strong className="text-red-300">Narrative Scope:</strong> Post-mortem failure dossiers represent 
            <strong> design fiction</strong> and ARG worldbuilding case studies examining theoretical failure thresholds.
          </span>
        </div>
        <a
          href="#disclaimer"
          className="text-red-400 hover:underline font-mono text-[11px] whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <span>Speculation Disclaimer</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {failures.map(f => (
          <div
            key={f.id}
            onClick={() => onSelectFailure(f.id)}
            className="bg-[#070303] border border-red-950 hover:border-red-600/80 p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="text-red-400 font-mono font-bold text-xs tracking-wider group-hover:text-red-300">
                    {f.id} // {f.projectCode}
                  </span>
                  <div className="text-zinc-100 font-bold text-base mt-1">
                    {f.projectTitle}
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-red-950 text-red-300 border border-red-800">
                  {f.hazardClassification}
                </span>
              </div>

              <div className="mb-2">
                <StatusBadge label={getFailureStatusLabel(f)} size="xs" />
              </div>

              <div className="text-xs text-zinc-400 font-mono mb-2">
                DATE: <span className="text-zinc-300">{f.incidentDate}</span> · LEAD INVESTIGATOR: <span className="text-zinc-200">{f.leadInvestigator}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">
                {f.summary}
              </p>

              <div className="space-y-1 text-xs font-mono text-zinc-400 border-t border-red-950/60 pt-2.5 mb-2">
                <div>DECOMMISSION: <span className="text-red-400 font-bold">{f.decommissionStatus}</span></div>
                <div>SALVAGED: <span className="text-zinc-300">{f.salvagedComponents.join(', ')}</span></div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-red-950/60 flex items-center justify-between text-xs font-mono text-red-400/90">
              <span>ROOT CAUSE AUDITED</span>
              <span className="group-hover:underline flex items-center gap-1 text-red-300">
                <span>VIEW AUTOPSY DOSSIER</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
