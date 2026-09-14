import React from 'react';
import { SchematicType } from '../data/types';

interface SchematicProps {
  type: SchematicType;
  codeName?: string;
  className?: string;
}

export const TechnicalSchematics: React.FC<SchematicProps> = ({
  type,
  codeName = 'SYSTEM',
  className = ''
}) => {
  switch (type) {
    case 'cross-section':
      return <CrossSectionSchematic codeName={codeName} className={className} />;
    case 'signal-flow':
      return <SignalFlowSchematic codeName={codeName} className={className} />;
    case 'polar-directivity':
      return <PolarDirectivitySchematic codeName={codeName} className={className} />;
    case 'resonator-cavity':
      return <ResonatorCavitySchematic codeName={codeName} className={className} />;
    case 'subterranean-array':
      return <SubterraneanArraySchematic codeName={codeName} className={className} />;
    default:
      return <SignalFlowSchematic codeName={codeName} className={className} />;
  }
};

export const CrossSectionSchematic: React.FC<{ codeName?: string; className?: string }> = ({
  codeName = 'TRANSDUCER-CORE',
  className = ''
}) => (
  <div className={`relative bg-[#05070a] border border-emerald-950/80 rounded-md p-4 font-mono text-xs overflow-hidden ${className}`}>
    <div className="flex justify-between items-center mb-2 border-b border-emerald-950/60 pb-1.5 text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">FIG 1.1 // AXIAL CROSS-SECTION ELEVATION</span>
      </div>
      <span className="text-[10px] text-zinc-500">REF: {codeName}-SEC-A</span>
    </div>

    <svg viewBox="0 0 680 340" className="w-full h-auto text-emerald-400/90 drop-shadow-sm select-none">
      <defs>
        <pattern id="grid-cs" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="0.5" />
        </pattern>
        <pattern id="hatch-cs" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(52, 211, 153, 0.25)" strokeWidth="1" />
        </pattern>
        <linearGradient id="core-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="680" height="340" fill="url(#grid-cs)" />

      {/* Axis guidelines */}
      <line x1="40" y1="170" x2="640" y2="170" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="6,4" strokeWidth="0.8" />
      <line x1="340" y1="30" x2="340" y2="310" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="6,4" strokeWidth="0.8" />
      <text x="345" y="42" fill="#34d399" fontSize="9" opacity="0.6">CL (CENTERLINE 0.00)</text>

      {/* Outer Pressure Vessel / Structural Sleeve */}
      <rect x="140" y="70" width="400" height="200" rx="4" fill="none" stroke="#059669" strokeWidth="1.8" />
      <rect x="120" y="90" width="20" height="160" fill="url(#hatch-cs)" stroke="#059669" strokeWidth="1.2" />
      <rect x="540" y="90" width="20" height="160" fill="url(#hatch-cs)" stroke="#059669" strokeWidth="1.2" />

      {/* Internal Acoustic Resonator Core */}
      <rect x="180" y="110" width="320" height="120" fill="url(#core-glow)" stroke="#34d399" strokeWidth="1.5" />

      {/* Vitreous / Piezo Element Core Stack */}
      <rect x="260" y="125" width="160" height="90" fill="#042f2e" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />
      <line x1="300" y1="125" x2="300" y2="215" stroke="#34d399" strokeWidth="1" />
      <line x1="340" y1="125" x2="340" y2="215" stroke="#34d399" strokeWidth="1.2" />
      <line x1="380" y1="125" x2="380" y2="215" stroke="#34d399" strokeWidth="1" />

      {/* Hydraulic Pre-stress Clamps */}
      <path d="M 140 100 L 180 120 L 180 220 L 140 240 Z" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.2" />
      <path d="M 540 100 L 500 120 L 500 220 L 540 240 Z" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.2" />

      {/* Dimension Callout Lines & Tolerances */}
      <line x1="140" y1="52" x2="540" y2="52" stroke="#6ee7b7" strokeWidth="0.9" markerEnd="url(#arrow)" />
      <line x1="140" y1="48" x2="140" y2="68" stroke="#6ee7b7" strokeWidth="0.8" />
      <line x1="540" y1="48" x2="540" y2="68" stroke="#6ee7b7" strokeWidth="0.8" />
      <text x="340" y="47" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="bold">400.00 mm ±0.02 [PRIMARY CAVITY]</text>

      {/* Vertical dimension callout */}
      <line x1="585" y1="70" x2="585" y2="270" stroke="#6ee7b7" strokeWidth="0.9" />
      <line x1="575" y1="70" x2="595" y2="70" stroke="#6ee7b7" strokeWidth="0.8" />
      <line x1="575" y1="270" x2="595" y2="270" stroke="#6ee7b7" strokeWidth="0.8" />
      <text x="592" y="174" fill="#6ee7b7" fontSize="9">200.0 mm DIA</text>

      {/* Piezoceramic Ring Labels */}
      <circle cx="340" cy="170" r="18" fill="none" stroke="#00f0ff" strokeWidth="1.4" strokeDasharray="2,2" />
      <line x1="355" y1="160" x2="430" y2="85" stroke="#00f0ff" strokeWidth="0.8" />
      <circle cx="430" cy="85" r="2.5" fill="#00f0ff" />
      <text x="438" y="88" fill="#00f0ff" fontSize="9">PZT-8 MULTILAYER RING ARRAY</text>

      {/* Hydrostatic Seal Callout */}
      <line x1="130" y1="170" x2="70" y2="230" stroke="#f59e0b" strokeWidth="0.8" />
      <circle cx="70" cy="230" r="2.5" fill="#f59e0b" />
      <text x="70" y="244" fill="#f59e0b" fontSize="9">O-RING SEAL (450 MPa)</text>

      {/* Boundary acoustic damping */}
      <path d="M 210 110 Q 230 140 210 170 Q 190 200 210 230" fill="none" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3,3" />
      <path d="M 470 110 Q 450 140 470 170 Q 490 200 470 230" fill="none" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3,3" />

      {/* Technical corner annotations */}
      <text x="18" y="22" fill="#059669" fontSize="8.5">SCALE 1:2.5 METRIC</text>
      <text x="18" y="325" fill="#059669" fontSize="8.5">ZIAA SPECIFICATION DOCUMENT 884-A</text>
      <text x="520" y="325" fill="#059669" fontSize="8.5">ALL DIMENSIONS IN MM</text>
    </svg>
  </div>
);

export const SignalFlowSchematic: React.FC<{ codeName?: string; className?: string }> = ({
  codeName = 'DSP-MATRIX',
  className = ''
}) => (
  <div className={`relative bg-[#05070a] border border-emerald-950/80 rounded-md p-4 font-mono text-xs overflow-hidden ${className}`}>
    <div className="flex justify-between items-center mb-2 border-b border-emerald-950/60 pb-1.5 text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">FIG 2.4 // TOPOLOGICAL SIGNAL ROUTING & DSP BUS</span>
      </div>
      <span className="text-[10px] text-zinc-500">BUS: {codeName}-FLOW</span>
    </div>

    <svg viewBox="0 0 680 340" className="w-full h-auto text-emerald-400 drop-shadow-sm select-none">
      <defs>
        <pattern id="grid-sf" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="680" height="340" fill="url(#grid-sf)" />

      {/* Block 1: Transducer Input Differential Stage */}
      <rect x="40" y="120" width="105" height="70" rx="3" fill="#071318" stroke="#06b6d4" strokeWidth="1.4" />
      <text x="92" y="145" textAnchor="middle" fill="#22d3ee" fontSize="9.5" fontWeight="bold">JFET DIFF AMP</text>
      <text x="92" y="162" textAnchor="middle" fill="#67e8f9" fontSize="8">LSK489 ULTRA-LN</text>
      <text x="92" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7.5">0.8 nV/√Hz</text>

      {/* Line 1 -> 2 */}
      <line x1="145" y1="155" x2="195" y2="155" stroke="#22d3ee" strokeWidth="1.5" />
      <polygon points="195,155 187,150 187,160" fill="#22d3ee" />

      {/* Block 2: Analog Bandpass / Notch Filter */}
      <rect x="195" y="120" width="115" height="70" rx="3" fill="#071318" stroke="#06b6d4" strokeWidth="1.4" />
      <text x="252" y="145" textAnchor="middle" fill="#22d3ee" fontSize="9.5" fontWeight="bold">ANOMALY FILTER</text>
      <text x="252" y="162" textAnchor="middle" fill="#67e8f9" fontSize="8">STATE-VARIABLE</text>
      <text x="252" y="176" textAnchor="middle" fill="#94a3b8" fontSize="7.5">Q = 14.5 (ACTIVE)</text>

      {/* Line 2 -> 3 */}
      <line x1="310" y1="155" x2="360" y2="155" stroke="#22d3ee" strokeWidth="1.5" />
      <polygon points="360,155 352,150 352,160" fill="#22d3ee" />

      {/* Block 3: Central FPGA / ARM DSP Matrix */}
      <rect x="360" y="80" width="140" height="150" rx="4" fill="#041a1c" stroke="#10b981" strokeWidth="1.8" />
      <rect x="375" y="95" width="110" height="28" fill="#062e2c" stroke="#34d399" strokeWidth="1" />
      <text x="430" y="113" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="bold">ZIAA DSP CORE</text>
      <text x="430" y="145" textAnchor="middle" fill="#a7f3d0" fontSize="8.5">HAMILTONIAN</text>
      <text x="430" y="160" textAnchor="middle" fill="#a7f3d0" fontSize="8.5">SCATTERING MATRIX</text>
      <text x="430" y="180" textAnchor="middle" fill="#6ee7b7" fontSize="8">48 kHz / 32-BIT FLT</text>
      <text x="430" y="200" textAnchor="middle" fill="#38bdf8" fontSize="7.5">LATENCY: 1.2 ms</text>

      {/* Feedback Loop Path */}
      <path d="M 430 230 L 430 280 L 252 280 L 252 190" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4,3" />
      <polygon points="252,190 247,198 257,198" fill="#f59e0b" />
      <text x="340" y="274" textAnchor="middle" fill="#fbbf24" fontSize="8">PHASE VELOCITY FEEDBACK (Δθ &lt; 0.05°)</text>

      {/* Outputs */}
      <line x1="500" y1="125" x2="560" y2="125" stroke="#10b981" strokeWidth="1.5" />
      <polygon points="560,125 552,120 552,130" fill="#10b981" />
      <rect x="560" y="95" width="95" height="55" rx="3" fill="#031f18" stroke="#10b981" strokeWidth="1.4" />
      <text x="607" y="120" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">AES67 STREAM</text>
      <text x="607" y="136" textAnchor="middle" fill="#6ee7b7" fontSize="7.5">CH 1-64 (DANTE)</text>

      <line x1="500" y1="185" x2="560" y2="185" stroke="#a855f7" strokeWidth="1.5" />
      <polygon points="560,185 552,180 552,190" fill="#a855f7" />
      <rect x="560" y="165" width="95" height="55" rx="3" fill="#190d29" stroke="#a855f7" strokeWidth="1.4" />
      <text x="607" y="190" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontWeight="bold">OPTICAL FIBER</text>
      <text x="607" y="206" textAnchor="middle" fill="#c084fc" fontSize="7.5">SHA-256 VAULT BUS</text>

      {/* Clock Sync input */}
      <line x1="430" y1="20" x2="430" y2="80" stroke="#ef4444" strokeWidth="1.2" />
      <polygon points="430,80 425,72 435,72" fill="#ef4444" />
      <text x="430" y="32" textAnchor="middle" fill="#f87171" fontSize="8">RUBIDIUM 10 MHz ATOMIC CLOCK</text>

      {/* Input transducer label */}
      <line x1="40" y1="155" x2="15" y2="155" stroke="#06b6d4" strokeWidth="1.2" />
      <text x="15" y="142" fill="#22d3ee" fontSize="8">ANALOG IN</text>
    </svg>
  </div>
);

export const PolarDirectivitySchematic: React.FC<{ codeName?: string; className?: string }> = ({
  codeName = 'BEAM-ARRAY',
  className = ''
}) => (
  <div className={`relative bg-[#05070a] border border-emerald-950/80 rounded-md p-4 font-mono text-xs overflow-hidden ${className}`}>
    <div className="flex justify-between items-center mb-2 border-b border-emerald-950/60 pb-1.5 text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
        <span className="text-violet-400 font-bold uppercase tracking-wider text-[11px]">FIG 3.2 // POLAR RADIATION DIRECTIVITY & NULL LOBES</span>
      </div>
      <span className="text-[10px] text-zinc-500">POLAR: {codeName}</span>
    </div>

    <svg viewBox="0 0 680 340" className="w-full h-auto text-emerald-400 select-none">
      <defs>
        <radialGradient id="polar-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1035" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#0d0717" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#05070a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center of polar coordinate system at (340, 170) */}
      <circle cx="340" cy="170" r="140" fill="url(#polar-radial)" stroke="#3730a3" strokeWidth="1" strokeDasharray="4,4" />
      <circle cx="340" cy="170" r="105" fill="none" stroke="#312e81" strokeWidth="0.8" />
      <circle cx="340" cy="170" r="70" fill="none" stroke="#312e81" strokeWidth="0.8" />
      <circle cx="340" cy="170" r="35" fill="none" stroke="#312e81" strokeWidth="0.8" />
      <circle cx="340" cy="170" r="3" fill="#c084fc" />

      {/* Radial axes */}
      <line x1="200" y1="170" x2="480" y2="170" stroke="#4c1d95" strokeWidth="0.8" />
      <line x1="340" y1="30" x2="340" y2="310" stroke="#4c1d95" strokeWidth="0.8" />
      <line x1="241" y1="71" x2="439" y2="269" stroke="#4c1d95" strokeWidth="0.6" strokeDasharray="2,2" />
      <line x1="439" y1="71" x2="241" y2="269" stroke="#4c1d95" strokeWidth="0.6" strokeDasharray="2,2" />

      {/* Degree Markers */}
      <text x="340" y="24" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold">0° (FORWARD AXIS)</text>
      <text x="495" y="173" fill="#c084fc" fontSize="8.5">90°</text>
      <text x="340" y="325" textAnchor="middle" fill="#c084fc" fontSize="8.5">180°</text>
      <text x="175" y="173" fill="#c084fc" fontSize="8.5">270°</text>

      {/* dB Rings Labels */}
      <text x="345" y="73" fill="#818cf8" fontSize="7.5">-6 dB</text>
      <text x="345" y="108" fill="#818cf8" fontSize="7.5">-12 dB</text>
      <text x="345" y="143" fill="#818cf8" fontSize="7.5">-24 dB</text>

      {/* Acoustic radiation lobe (Cardioid with anomalous narrow hyper-cardioid forward lobe) */}
      <path
        d="M 340 38 
           C 400 45, 460 90, 440 145 
           C 425 185, 370 195, 340 170 
           C 310 195, 255 185, 240 145 
           C 220 90, 280 45, 340 38 Z"
        fill="rgba(192, 132, 252, 0.15)"
        stroke="#c084fc"
        strokeWidth="2"
      />

      {/* Infrasonic rear cancellation null lobe */}
      <path
        d="M 340 170 
           C 355 180, 370 230, 340 260 
           C 310 230, 325 180, 340 170 Z"
        fill="rgba(56, 189, 248, 0.12)"
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeDasharray="4,2"
      />

      {/* Legends & annotations */}
      <rect x="520" y="40" width="140" height="95" fill="#070a12" stroke="#4c1d95" strokeWidth="1" rx="3" />
      <text x="530" y="58" fill="#e0e7ff" fontSize="8.5" fontWeight="bold">FREQUENCY RESPONSE</text>
      <line x1="530" y1="72" x2="555" y2="72" stroke="#c084fc" strokeWidth="2" />
      <text x="562" y="75" fill="#c084fc" fontSize="7.5">14.2 Hz Fundamental</text>
      <line x1="530" y1="88" x2="555" y2="88" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
      <text x="562" y="91" fill="#38bdf8" fontSize="7.5">Phase-Null Boundary</text>
      <text x="530" y="112" fill="#94a3b8" fontSize="7.5">Front-to-Back: &gt; 38.4 dB</text>
      <text x="530" y="125" fill="#94a3b8" fontSize="7.5">Null Depth: -44.1 dB</text>
    </svg>
  </div>
);

export const ResonatorCavitySchematic: React.FC<{ codeName?: string; className?: string }> = ({
  codeName = 'CAVITY-RESONANCE',
  className = ''
}) => (
  <div className={`relative bg-[#05070a] border border-emerald-950/80 rounded-md p-4 font-mono text-xs overflow-hidden ${className}`}>
    <div className="flex justify-between items-center mb-2 border-b border-emerald-950/60 pb-1.5 text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">FIG 4.3 // NON-HERMITIAN WAVEGUIDE & STANDING WAVE VELOCITY</span>
      </div>
      <span className="text-[10px] text-zinc-500">NODE: {codeName}-CAV</span>
    </div>

    <svg viewBox="0 0 680 340" className="w-full h-auto text-emerald-400 select-none">
      <defs>
        <linearGradient id="waveguide-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Waveguide Main Tube */}
      <rect x="60" y="100" width="560" height="120" rx="6" fill="url(#waveguide-grad)" stroke="#d97706" strokeWidth="1.8" />

      {/* Internal Acoustic Baffles & Loss Cavities */}
      <rect x="180" y="100" width="14" height="65" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
      <rect x="260" y="155" width="14" height="65" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
      <rect x="340" y="100" width="14" height="65" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
      <rect x="420" y="155" width="14" height="65" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />

      {/* Standing Wave Pressure Curves (Sine standing wave) */}
      <path
        d="M 60 160 Q 130 90, 200 160 T 340 160 T 480 160 T 620 160"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.2"
      />
      <path
        d="M 60 160 Q 130 230, 200 160 T 340 160 T 480 160 T 620 160"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="1.4"
        strokeDasharray="4,4"
      />

      {/* Velocity Node Callouts */}
      <circle cx="200" cy="160" r="4" fill="#ef4444" />
      <circle cx="340" cy="160" r="4" fill="#10b981" />
      <circle cx="480" cy="160" r="4" fill="#00f0ff" />

      <line x1="340" y1="160" x2="340" y2="60" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
      <text x="340" y="52" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">EXCEPTIONAL POINT (EP) DEGENERACY</text>
      <text x="340" y="248" textAnchor="middle" fill="#f59e0b" fontSize="8.5">UNIDIRECTIONAL SOUND ABSORPTION ZONE</text>

      {/* Drive Actuator left */}
      <rect x="35" y="125" width="25" height="70" fill="#b45309" stroke="#f59e0b" strokeWidth="1.2" />
      <text x="25" y="165" fill="#fbbf24" fontSize="8" textAnchor="middle" transform="rotate(-90 25 165)">PIEZO DRIVE</text>

      {/* Non-reflecting anechoic termination right */}
      <polygon points="620,100 655,160 620,220" fill="#042f2e" stroke="#10b981" strokeWidth="1.2" />
      <text x="662" y="163" fill="#10b981" fontSize="8">PERFECTLY MATCHED LAYER</text>

      {/* Boundary parameters */}
      <text x="70" y="295" fill="#78716c" fontSize="8">COUPLING COEFFICIENT κ = 0.822</text>
      <text x="320" y="295" fill="#78716c" fontSize="8">LOSS PARAMETER γ = 1.414 rad/s</text>
      <text x="530" y="295" fill="#78716c" fontSize="8">HAMILTONIAN DET = 0</text>
    </svg>
  </div>
);

export const SubterraneanArraySchematic: React.FC<{ codeName?: string; className?: string }> = ({
  codeName = 'SEISMIC-GRID',
  className = ''
}) => (
  <div className={`relative bg-[#05070a] border border-emerald-950/80 rounded-md p-4 font-mono text-xs overflow-hidden ${className}`}>
    <div className="flex justify-between items-center mb-2 border-b border-emerald-950/60 pb-1.5 text-zinc-400">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">FIG 5.1 // GEOLOGICAL BOREHOLE STRATA & GEOPHONE TOPOLOGY</span>
      </div>
      <span className="text-[10px] text-zinc-500">FACILITY: {codeName}</span>
    </div>

    <svg viewBox="0 0 680 340" className="w-full h-auto text-emerald-400 select-none">
      {/* Surface Terrain */}
      <path d="M 40 70 Q 180 65, 340 72 T 640 68 L 640 320 L 40 320 Z" fill="#051014" stroke="#047857" strokeWidth="1.2" />

      {/* Strata Layers */}
      <line x1="40" y1="130" x2="640" y2="130" stroke="#065f46" strokeWidth="0.8" strokeDasharray="6,3" />
      <text x="50" y="122" fill="#059669" fontSize="8">ALLUVIAL SILT LAYER (0 to -45m)</text>

      <line x1="40" y1="210" x2="640" y2="210" stroke="#065f46" strokeWidth="0.8" strokeDasharray="6,3" />
      <text x="50" y="202" fill="#059669" fontSize="8">FRACTURED HYDROTHERMAL BASALT (-45m to -220m)</text>
      <text x="50" y="280" fill="#047857" fontSize="8">DEEP CRYSTALLINE GRANITE BASEMENT (-220m to -480m)</text>

      {/* Surface Listening Pavilion */}
      <rect x="300" y="45" width="80" height="25" fill="#064e3b" stroke="#34d399" strokeWidth="1.4" rx="2" />
      <polygon points="340,30 290,45 390,45" fill="#022c22" stroke="#34d399" strokeWidth="1.2" />
      <text x="340" y="60" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold">LISTENING PAVILION</text>

      {/* Central Borehole Casing */}
      <rect x="334" y="70" width="12" height="230" fill="#0f291e" stroke="#10b981" strokeWidth="1.2" />

      {/* Sensor Pod 1 (-60m) */}
      <circle cx="340" cy="140" r="9" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
      <line x1="349" y1="140" x2="420" y2="140" stroke="#34d399" strokeWidth="1" />
      <text x="428" y="143" fill="#a7f3d0" fontSize="8">GEOPHONE POD 01 [-60m] 0.05 Hz</text>

      {/* Sensor Pod 2 (-180m) */}
      <circle cx="340" cy="220" r="9" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
      <line x1="349" y1="220" x2="420" y2="220" stroke="#34d399" strokeWidth="1" />
      <text x="428" y="223" fill="#a7f3d0" fontSize="8">HYDROTHERMAL PROBE [-180m] 142°C</text>

      {/* Sensor Pod 3 (-290m) */}
      <circle cx="340" cy="290" r="9" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
      <line x1="349" y1="290" x2="420" y2="290" stroke="#34d399" strokeWidth="1" />
      <text x="428" y="293" fill="#a7f3d0" fontSize="8">DEEP BOREHOLE TRIAXIAL GEOPHONE [-290m]</text>

      {/* Seismic Wavefront Dispersion Arcs */}
      <path d="M 340 290 Q 240 230, 160 290" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,2" />
      <path d="M 340 290 Q 200 200, 100 290" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="4,2" />
      <text x="170" y="260" fill="#fbbf24" fontSize="7.5">MICRO-SEISMIC P-WAVE DISPERSION</text>
    </svg>
  </div>
);
