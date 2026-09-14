import React from 'react';

interface CrestProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'emerald' | 'monochrome';
}

export const InstitutionalCrest: React.FC<CrestProps> = ({
  className = '',
  size = 48,
  variant = 'gold'
}) => {
  const strokeColor =
    variant === 'gold' ? '#d4af37' : variant === 'emerald' ? '#34d399' : '#a1a1aa';
  const accentColor =
    variant === 'gold' ? '#f59e0b' : variant === 'emerald' ? '#10b981' : '#71717a';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Official Insignia of the Zazie Institute of Applied Anomalies"
    >
      {/* Outer Decorative Ring */}
      <circle cx="50" cy="50" r="47" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="3 1.5" />
      <circle cx="50" cy="50" r="44" stroke={strokeColor} strokeWidth="0.8" opacity="0.8" />
      <circle cx="50" cy="50" r="39" stroke={strokeColor} strokeWidth="0.6" opacity="0.6" />

      {/* Circular Inscription Path (Text in circle) */}
      <path
        id="crestCircle"
        d="M 50,50 m -41.5,0 a 41.5,41.5 0 1,1 83,0 a 41.5,41.5 0 1,1 -83,0"
        fill="none"
      />
      <text fill={strokeColor} fontSize="4.2" letterSpacing="0.18em" fontWeight="600" opacity="0.85">
        <textPath href="#crestCircle" startOffset="50%" textAnchor="middle">
          INSTITUTUM ANOMALIARUM APPLICATARUM · MMXXI
        </textPath>
      </text>

      {/* Central Heraldic Shield */}
      <path
        d="M 32 30 Q 50 27 68 30 V 54 Q 68 70 50 78 Q 32 70 32 54 Z"
        fill="#04070b"
        stroke={strokeColor}
        strokeWidth="1.4"
      />

      {/* Internal Shield Cross Division */}
      <line x1="50" y1="30" x2="50" y2="78" stroke={strokeColor} strokeWidth="0.6" strokeDasharray="1.5 1" opacity="0.7" />
      <line x1="32" y1="50" x2="68" y2="50" stroke={strokeColor} strokeWidth="0.6" strokeDasharray="1.5 1" opacity="0.7" />

      {/* Quadrant 1: Acoustic Waveform */}
      <path
        d="M 36 41 Q 40 34 43 41 T 47 41"
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M 37 44 Q 41 38 43 44 T 46 44"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.7"
        opacity="0.6"
      />

      {/* Quadrant 2: Astrolabe / Calipers */}
      <circle cx="59" cy="40" r="4.5" stroke={accentColor} strokeWidth="0.8" fill="none" />
      <line x1="59" y1="35.5" x2="59" y2="44.5" stroke={accentColor} strokeWidth="0.6" />
      <line x1="54.5" y1="40" x2="63.5" y2="40" stroke={accentColor} strokeWidth="0.6" />

      {/* Quadrant 3: Phonon / Atomic Orbit */}
      <ellipse cx="41" cy="60" rx="5" ry="2.2" transform="rotate(-30 41 60)" stroke={accentColor} strokeWidth="0.7" fill="none" />
      <ellipse cx="41" cy="60" rx="5" ry="2.2" transform="rotate(30 41 60)" stroke={accentColor} strokeWidth="0.7" fill="none" />
      <circle cx="41" cy="60" r="1" fill={accentColor} />

      {/* Quadrant 4: Classical Monograph & Quill */}
      <path
        d="M 54 57 L 64 57 L 62 65 L 54 65 Z"
        fill="none"
        stroke={accentColor}
        strokeWidth="0.8"
      />
      <line x1="64" y1="56" x2="56" y2="67" stroke={strokeColor} strokeWidth="0.8" />

      {/* Laurel Branches (Left & Right) */}
      <path
        d="M 27 64 C 23 54 24 38 31 31"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
        opacity="0.85"
      />
      <circle cx="25" cy="58" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="24" cy="50" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="25" cy="42" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="28" cy="35" r="1" fill={strokeColor} opacity="0.8" />

      <path
        d="M 73 64 C 77 54 76 38 69 31"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
        opacity="0.85"
      />
      <circle cx="75" cy="58" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="76" cy="50" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="75" cy="42" r="1" fill={strokeColor} opacity="0.8" />
      <circle cx="72" cy="35" r="1" fill={strokeColor} opacity="0.8" />

      {/* Bottom Latin Banner */}
      <path
        d="M 26 80 Q 50 85 74 80 L 72 87 Q 50 91 28 87 Z"
        fill="#080c12"
        stroke={strokeColor}
        strokeWidth="0.9"
      />
      <text
        x="50"
        y="85.5"
        textAnchor="middle"
        fill={strokeColor}
        fontSize="3.2"
        fontWeight="bold"
        letterSpacing="0.1em"
      >
        AUDITUS INAUDITI
      </text>
    </svg>
  );
};
