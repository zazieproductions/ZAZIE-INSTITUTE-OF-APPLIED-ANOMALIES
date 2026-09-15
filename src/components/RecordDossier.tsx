import React from 'react';
import { Link } from 'react-router-dom';
import type { Prototype, Patent, FailedIncident, Personnel, FieldSite, LabLog } from '../data/types';
import { TechnicalSchematics } from './TechnicalSchematics';
import { AcousticBench } from './AcousticBench';
import { recordPath, hasRecord } from '../data/archive';
import { humanize } from '../lib/format';
import { ShieldAlert } from 'lucide-react';

/** Inline link to another archive record; falls back to plain text when the referenced record is not in the archive. */
const RecordLink: React.FC<{ type: Parameters<typeof recordPath>[0]; id: string; className: string }> = ({ type, id, className }) =>
  hasRecord(type, id) ? (
    <Link to={recordPath(type, id)} className={className}>{id}</Link>
  ) : (
    <span className="text-zinc-400" title="Referenced record is not held in the public archive">{id}</span>
  );

// Sub-component: Prototype Dossier
export const PrototypeDossier: React.FC<{ p: Prototype }> = ({ p }) => (
  <div className="space-y-6">
    {/* Title & Metadata Strip */}
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-emerald-400 text-lg font-bold">
          {p.id}: {p.codeName}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
          CLEARANCE: {p.clearance}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700">
          STATUS: {humanize(p.status)}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700">
          YEAR: {p.year}
        </span>
      </div>
      <p className="text-zinc-200 text-sm font-semibold">{p.title}</p>
      <div className="text-zinc-400 text-[11px] mt-1">
        Discipline: <span className="text-cyan-400">{p.discipline}</span> · Lead Researcher: <span className="text-zinc-200">{p.leadResearcher}</span>
      </div>
    </div>

    {/* Abstract & Technical Summary */}
    <div className="space-y-3 bg-[#04070a] border border-emerald-950/80 p-4 rounded-md">
      <div>
        <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
          OPERATIONAL ABSTRACT
        </h2>
        <p className="text-zinc-300 leading-relaxed">{p.abstract}</p>
      </div>

      <div className="pt-2 border-t border-emerald-950/60">
        <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
          TECHNICAL SUMMARY & TRANSDUCTION DYNAMICS
        </h2>
        <p className="text-zinc-300 leading-relaxed">{p.technicalSummary}</p>
      </div>
    </div>

    {/* Technical Specifications Grid */}
    <div>
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        ENGINEERING SPECIFICATIONS
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-[#04070a] border border-emerald-950/60 rounded">
          <div className="text-zinc-400 text-[10px]">DIMENSIONS</div>
          <div className="text-zinc-200 font-bold mt-0.5">{p.dimensions}</div>
        </div>
        <div className="p-2.5 bg-[#04070a] border border-emerald-950/60 rounded">
          <div className="text-zinc-400 text-[10px]">OPERATIONAL BANDWIDTH</div>
          <div className="text-cyan-400 font-bold mt-0.5">{p.operationalBandwidth}</div>
        </div>
        <div className="p-2.5 bg-[#04070a] border border-emerald-950/60 rounded">
          <div className="text-zinc-400 text-[10px]">POWER CONSUMPTION</div>
          <div className="text-amber-400 font-bold mt-0.5">{p.powerConsumption}</div>
        </div>
        <div className="p-2.5 bg-[#04070a] border border-emerald-950/60 rounded">
          <div className="text-zinc-400 text-[10px]">SIGNAL-TO-NOISE</div>
          <div className="text-emerald-400 font-bold mt-0.5">{p.signalToNoise}</div>
        </div>
      </div>
    </div>

    {/* Transducer & Computational Core */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-[#04070a] border border-emerald-950/60 rounded">
        <div className="text-zinc-400 text-[10px] uppercase">PRIMARY TRANSDUCER</div>
        <div className="text-emerald-300 font-bold mt-1">{p.primaryTransducer}</div>
      </div>
      <div className="p-3 bg-[#04070a] border border-emerald-950/60 rounded">
        <div className="text-zinc-400 text-[10px] uppercase">COMPUTATIONAL CORE / DSP</div>
        <div className="text-violet-300 font-bold mt-1">{p.computationalCore}</div>
      </div>
    </div>

    {/* Vector Technical Schematic Diagram */}
    <div>
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        VECTOR TECHNICAL SCHEMATIC // BLUEPRINT
      </h2>
      <TechnicalSchematics type={p.schematicType} codeName={p.codeName} />
    </div>

    {/* Interactive Acoustic Bench (Audio Simulator for this prototype) */}
    <div>
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        PLAYABLE PROTOTYPE ACOUSTIC EMISSION BENCH
      </h2>
      <AcousticBench initialProfile={p.audioProfile} initialPrototype={p} compact />
    </div>

    {/* Bill of Materials */}
    {p.billOfMaterials && p.billOfMaterials.length > 0 && (
      <div>
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          BILL OF MATERIALS (BOM) & COMPONENT TOLERANCES
        </h2>
        <div className="border border-emerald-950 rounded overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#030508] border-b border-emerald-950 text-zinc-400">
              <tr>
                <th className="p-2">Component</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Part No.</th>
                <th className="p-2">Tolerance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/50 bg-[#04070a]">
              {p.billOfMaterials.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-950/20">
                  <td className="p-2 text-zinc-200">{item.item}</td>
                  <td className="p-2 text-zinc-400">{item.supplier}</td>
                  <td className="p-2 text-cyan-400 font-mono">{item.partNumber}</td>
                  <td className="p-2 text-emerald-400">{item.tolerance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Hazard Warnings & Field Deployments */}
    {p.hazardWarnings && p.hazardWarnings.length > 0 && (
      <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-md">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          <h2>BENCH &amp; FIELD OPERATION NOTES</h2>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-300">
          {p.hazardWarnings.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Interconnected Cross References */}
    <div className="pt-3 border-t border-emerald-950 flex flex-wrap gap-4 text-xs">
      {p.linkedPatents && p.linkedPatents.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">SPECULATIVE PATENTS:</span>
          {p.linkedPatents.map(patId => (
            <RecordLink key={patId} type="patent" id={patId} className="text-cyan-400 underline hover:text-cyan-300" />
          ))}
        </div>
      )}

      {p.linkedLogs && p.linkedLogs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">TELEMETRY LOGS:</span>
          {p.linkedLogs.map(logId => (
            <RecordLink key={logId} type="log" id={logId} className="text-emerald-400 underline hover:text-emerald-300" />
          ))}
        </div>
      )}

      {p.fieldDeployments && p.fieldDeployments.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">FIELD SITES:</span>
          <span className="text-amber-400">{p.fieldDeployments.join(', ')}</span>
        </div>
      )}
    </div>
  </div>
);

// Sub-component: Patent Dossier
export const PatentDossier: React.FC<{ p: Patent }> = ({ p }) => (
  <div className="space-y-6">
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-cyan-400 text-lg font-bold">
          {p.patentNumber}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
          STATUS: {humanize(p.status)}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700">
          FILING: <time dateTime={p.filingDate}>{p.filingDate}</time>
        </span>
      </div>
      <p className="text-zinc-100 text-sm font-semibold">{p.title}</p>
      <div className="text-zinc-400 text-[11px] mt-1">
        Assignee: <span className="text-zinc-200">{p.assignee}</span> · Inventors: <span className="text-emerald-400">{p.inventors.join(', ')}</span>
      </div>
    </div>

    {/* Abstract */}
    <div className="bg-[#04070a] border border-cyan-950/80 p-4 rounded-md">
      <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
        PATENT ABSTRACT & METHOD DISCLOSURE
      </h2>
      <p className="text-zinc-300 leading-relaxed">{p.abstract}</p>
    </div>

    {/* Independent & Dependent Claims */}
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
        LEGAL CLAIMS SCHEDULE
      </h2>
      <div className="space-y-2 bg-[#04070a] border border-cyan-950/60 p-3 rounded">
        {p.independentClaims && p.independentClaims.map((claim, idx) => (
          <div key={idx} className="text-zinc-200 leading-relaxed pb-2 border-b border-zinc-800/60 last:border-none">
            {claim}
          </div>
        ))}
        {p.dependentClaims && p.dependentClaims.map((claim, idx) => (
          <div key={idx} className="text-zinc-400 text-[11px] pl-4 border-l-2 border-cyan-800 leading-relaxed">
            {claim}
          </div>
        ))}
      </div>
    </div>

    {/* Technical Diagram */}
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        PATENT EXHIBIT // {p.schematicFocus}
      </div>
      <TechnicalSchematics type={p.schematicDiagramType} codeName={p.id} />
    </div>

    {/* Prior Art Critique & Legal Memo */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-[#04070a] border border-zinc-800 rounded">
        <h2 className="text-zinc-400 text-[10px] uppercase font-bold mb-1">PRIOR ART CRITIQUE</h2>
        <p className="text-zinc-300 text-[11px] leading-relaxed">{p.priorArtCritique}</p>
      </div>
      <div className="p-3 bg-[#080d14] border border-cyan-950 rounded">
        <h2 className="text-cyan-400 text-[10px] uppercase font-bold mb-1">COUNSEL MEMO</h2>
        <p className="text-cyan-200/90 text-[11px] leading-relaxed">{p.legalCounselMemo}</p>
      </div>
    </div>

    {/* Physical Anomalies & Linked Prototypes */}
    {p.physicalAnomalies && p.physicalAnomalies.length > 0 && (
      <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded">
        <div className="text-amber-400 font-bold mb-1 text-[10px] uppercase">
          REPORTED PHYSICAL ACOUSTIC ANOMALIES
        </div>
        <ul className="list-disc list-inside space-y-1 text-amber-200/90 text-[11px]">
          {p.physicalAnomalies.map((anom, i) => (
            <li key={i}>{anom}</li>
          ))}
        </ul>
      </div>
    )}

    {p.linkedPrototypes && p.linkedPrototypes.length > 0 && (
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <span className="text-zinc-400">ASSOCIATED PROTOTYPES:</span>
        {p.linkedPrototypes.map(protId => (
          <RecordLink key={protId} type="prototype" id={protId} className="text-emerald-400 underline hover:text-emerald-300" />
        ))}
      </div>
    )}
  </div>
);

// Sub-component: Black Vault Failure Dossier
export const FailureDossier: React.FC<{ f: FailedIncident }> = ({ f }) => (
  <div className="space-y-5">
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-red-400 text-lg font-bold">{f.id}</span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800">
          HAZARD: {f.hazardClassification}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700">
          STATUS: {f.decommissionStatus}
        </span>
        <span className="text-zinc-400 text-[11px]">INCIDENT DATE: <time dateTime={f.incidentDate}>{f.incidentDate}</time></span>
      </div>
      <p className="text-zinc-100 text-base font-semibold">
        {f.projectCode}: {f.projectTitle}
      </p>
      <div className="text-zinc-400 text-[11px] mt-0.5">
        Lead Investigator: <span className="text-zinc-200">{f.leadInvestigator}</span>
      </div>
    </div>

    <div className="p-3.5 bg-red-950/20 border border-red-900/60 rounded">
      <h2 className="text-red-400 font-bold uppercase text-[10px] mb-1">INCIDENT NARRATIVE</h2>
      <p className="text-zinc-200 leading-relaxed text-xs">{f.incidentNarrative}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-[#04070a] border border-zinc-800 rounded">
        <h2 className="text-zinc-400 text-[10px] uppercase font-bold mb-1">ROOT CAUSE ANALYSIS</h2>
        <p className="text-zinc-300 leading-relaxed text-xs">{f.rootCauseAnalysis}</p>
      </div>

      <div className="p-3 bg-[#04070a] border border-zinc-800 rounded">
        <h2 className="text-zinc-400 text-[10px] uppercase font-bold mb-1">CONTAINMENT PROTOCOL</h2>
        <p className="text-zinc-300 leading-relaxed text-xs">{f.containmentProtocol}</p>
      </div>
    </div>

    {f.salvagedComponents && f.salvagedComponents.length > 0 && (
      <div>
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          SALVAGED / REASSIGNED HARDWARE
        </h2>
        <div className="flex flex-wrap gap-2">
          {f.salvagedComponents.map((c, i) => (
            <span key={i} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 text-xs">
              {c}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Sub-component: Personnel Dossier
export const PersonnelDossier: React.FC<{ p: Personnel }> = ({ p }) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-lg font-bold">{p.name}</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
            {p.clearance}
          </span>
        </div>
        <div className="text-zinc-300 font-semibold">{p.title}</div>
        <div className="text-cyan-400 text-xs mt-0.5">Specialization: {p.specialization}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
      <div className="p-2.5 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">FACILITY ASSIGNMENT</div>
        <div className="text-zinc-200 mt-0.5 font-bold">{p.facilityAssignment}</div>
      </div>
      <div className="p-2.5 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">ACTIVE PROTOTYPES</div>
        <div className="text-emerald-400 mt-0.5 font-bold">{p.activePrototypesCount} Projects</div>
      </div>
      <div className="p-2.5 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">JOINED INSTITUTE</div>
        <div className="text-zinc-200 mt-0.5 font-bold">{p.joinedYear}</div>
      </div>
    </div>

    <div className="p-3.5 bg-[#04070a] border border-zinc-800 rounded leading-relaxed text-zinc-300">
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
        CURRICULUM & BIOGRAPHY
      </h2>
      <p>{p.biography}</p>
    </div>

    {p.selectedPublications && p.selectedPublications.length > 0 && (
      <div>
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          SELECTED SCIENTIFIC PUBLICATIONS
        </h2>
        <ul className="space-y-1.5">
          {p.selectedPublications.map((pub, idx) => (
            <li key={idx} className="p-2 bg-zinc-900/60 border border-zinc-800/60 rounded text-zinc-300 text-xs">
              {pub}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="p-2.5 bg-[#030508] border border-zinc-900 rounded text-[10px] text-zinc-400 font-mono">
      VOICEPRINT RECOGNITION HASH: {p.voiceprintHash}
    </div>
  </div>
);

// Sub-component: Field Site Dossier
export const FieldSiteDossier: React.FC<{ s: FieldSite }> = ({ s }) => (
  <div className="space-y-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-400 text-lg font-bold">{s.codename}</span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
          STATUS: {s.activeStatus}
        </span>
      </div>
      <p className="text-zinc-100 text-base font-semibold">{s.name}</p>
      <div className="text-zinc-400 text-xs mt-0.5">
        Location: <span className="text-zinc-200">{s.location}</span> · Coordinates: <span className="text-cyan-400">{s.coordinates}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">CHANNELS</div>
        <div className="text-emerald-400 font-bold mt-0.5">{s.channelCount} Transducers</div>
      </div>
      <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">FREQUENCY RANGE</div>
        <div className="text-cyan-400 font-bold mt-0.5">{s.frequencyRange}</div>
      </div>
      <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">ESTABLISHED</div>
        <div className="text-zinc-200 font-bold mt-0.5">{s.establishedYear}</div>
      </div>
      <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
        <div className="text-zinc-400 text-[10px]">FOOTPRINT</div>
        <div className="text-zinc-200 font-bold mt-0.5">{s.physicalFootprint}</div>
      </div>
    </div>

    <div className="p-3 bg-[#04070a] border border-zinc-800 rounded text-zinc-300 leading-relaxed text-xs">
      <h2 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
        FACILITY INFRASTRUCTURE OVERVIEW
      </h2>
      <p>{s.description}</p>
    </div>

    <div className="p-3 bg-[#04070a] border border-zinc-800 rounded text-zinc-300 leading-relaxed text-xs">
      <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
        PUBLIC ACCESS & LISTENING PROTOCOL
      </h2>
      <p>{s.publicAccessProtocol}</p>
    </div>

    {s.instrumentationList && s.instrumentationList.length > 0 && (
      <div>
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          DEPLOYED INSTRUMENTATION CLUSTER
        </h2>
        <ul className="space-y-1">
          {s.instrumentationList.map((inst, i) => (
            <li key={i} className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 text-xs">
              {inst}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Sub-component: Lab Log Dossier
export const LabLogDossier: React.FC<{ l: LabLog }> = ({ l }) => (
  <div className="space-y-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-400 text-lg font-bold">{l.id}</span>
        <time dateTime={l.timestamp} className="text-zinc-400 text-xs">{l.displayDate}</time>
        {l.anomalyAlert && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 font-bold animate-pulse">
            ANOMALY CONFIRMED
          </span>
        )}
      </div>
      <div className="text-zinc-300 font-semibold">{l.summary}</div>
      <div className="text-zinc-400 text-xs mt-0.5">
        Facility: <span className="text-cyan-400">{l.facility}</span> · Author: <span className="text-zinc-200">{l.author}</span> (Clearance {l.clearance})
      </div>
    </div>

    {/* Environmental Telemetry Sensors */}
    <div>
      <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        TELEMETRY SENSOR MATRIX READOUT
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">AMBIENT TEMP</div>
          <div className="text-zinc-200 font-bold mt-0.5">{l.telemetry.ambientTempC}°C</div>
        </div>
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">SOUND PRESSURE</div>
          <div className="text-emerald-400 font-bold mt-0.5">{l.telemetry.splDecibels} dB SPL</div>
        </div>
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">REL HUMIDITY</div>
          <div className="text-cyan-400 font-bold mt-0.5">{l.telemetry.relativeHumidityPct}%</div>
        </div>
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">MAG FLUX</div>
          <div className="text-violet-400 font-bold mt-0.5">{l.telemetry.magneticFluxMicroTesla} μT</div>
        </div>
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">MAINS DRIFT</div>
          <div className="text-amber-400 font-bold mt-0.5">{l.telemetry.mainsDriftHz} Hz</div>
        </div>
        <div className="p-2 bg-[#04070a] border border-zinc-800 rounded">
          <div className="text-zinc-400 text-[10px]">COHERENCE</div>
          <div className="text-emerald-300 font-bold mt-0.5">{l.telemetry.spectralCoherence}</div>
        </div>
      </div>
    </div>

    {/* Log Body */}
    <div className="p-4 bg-[#030508] border border-zinc-800 rounded font-mono text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
      {l.logBody}
    </div>

    {/* Equipment links */}
    {l.equipmentIds && l.equipmentIds.length > 0 && (
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <span className="text-zinc-400">ASSOCIATED EQUIPMENT:</span>
        {l.equipmentIds.map(eq => (
          <RecordLink key={eq} type="prototype" id={eq} className="text-emerald-400 underline hover:text-emerald-300 text-xs" />
        ))}
      </div>
    )}
  </div>
);
