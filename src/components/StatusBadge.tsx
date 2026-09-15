import React from 'react';
import { ProjectStatusLabel, STATUS_DESCRIPTIONS } from '../data/projectStatus';
import { Activity, Cpu, Sparkles, Compass, Lightbulb, BookOpen, Layers } from 'lucide-react';

interface StatusBadgeProps {
  label: ProjectStatusLabel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPrefix?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  size = 'sm',
  showIcon = true,
  showPrefix = true,
  className = ''
}) => {
  const meta = STATUS_DESCRIPTIONS[label] || {
    description: 'Internal ZIAA research classification.',
    scope: 'Experimental research record.'
  };

  const getStyle = (status: ProjectStatusLabel) => {
    switch (status) {
      case 'Operational':
        return {
          container: 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
          dot: 'bg-emerald-400 animate-pulse',
          icon: Activity
        };
      case 'Prototype':
        return {
          container: 'bg-cyan-950/60 border-cyan-700/70 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
          dot: 'bg-cyan-400',
          icon: Cpu
        };
      case 'Experimental':
        return {
          container: 'bg-amber-950/60 border-amber-700/70 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
          dot: 'bg-amber-400',
          icon: Sparkles
        };
      case 'Speculative':
        return {
          container: 'bg-[#181308] border-[#8c6d31]/80 text-[#e2ba70] shadow-[0_0_8px_rgba(223,183,108,0.15)]',
          dot: 'bg-[#dfb76c]',
          icon: Lightbulb
        };
      case 'Artistic Research':
        return {
          container: 'bg-purple-950/60 border-purple-700/70 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
          dot: 'bg-purple-400',
          icon: BookOpen
        };
      case 'Design Fiction':
        return {
          container: 'bg-[#0f1218] border-zinc-700/70 text-zinc-300 shadow-[0_0_8px_rgba(113,113,122,0.15)]',
          dot: 'bg-zinc-400',
          icon: Layers
        };
      default:
        return {
          container: 'bg-zinc-900 border-zinc-700 text-zinc-300',
          dot: 'bg-zinc-400',
          icon: Compass
        };
    }
  };

  const style = getStyle(label);
  const IconComponent = style.icon;

  const sizeClasses = {
    xs: 'text-[8.5px] px-1.5 py-0.5 gap-1',
    sm: 'text-[9.5px] px-2 py-0.5 gap-1.5',
    md: 'text-[10.5px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2'
  }[size];

  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  }[size];

  const iconSize = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded border font-mono font-medium tracking-wider select-none transition-colors ${style.container} ${sizeClasses} ${className}`}
      title={`[ZIAA Classification: ${label}] ${meta.description} — ${meta.scope}`}
    >
      <span className={`rounded-full shrink-0 ${dotSize} ${style.dot}`} />
      {showIcon && <IconComponent className={`shrink-0 ${iconSize}`} />}
      <span className="uppercase font-semibold">
        {showPrefix && <span className="opacity-70 mr-1">STATUS:</span>}
        {label}
      </span>
    </span>
  );
};
