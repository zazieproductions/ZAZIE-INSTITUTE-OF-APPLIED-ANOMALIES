import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, Volume2, Clock, Award } from 'lucide-react';
import { InstitutionalCrest } from './InstitutionalCrest';
import { ENTITY } from '../seo/site';
import { NAV_ITEMS, type NavItem } from '../routes/nav';

interface HeaderProps {
  onOpenSearch: () => void;
  isAudioPlaying?: boolean;
}

const toneClasses = (tone: NavItem['tone'], active: boolean) => {
  if (active) {
    switch (tone) {
      case 'alert': return 'bg-red-950/80 text-red-200 border-b-2 border-red-500 font-bold shadow-sm';
      case 'cyan': return 'bg-cyan-950/80 text-cyan-200 border-b-2 border-cyan-400 font-bold shadow-sm';
      case 'violet': return 'bg-violet-950/80 text-violet-200 border-b-2 border-violet-400 font-bold shadow-sm';
      default: return 'bg-[#121926] text-[#dfb76c] border-b-2 border-[#dfb76c] font-bold shadow-sm';
    }
  }
  switch (tone) {
    case 'alert': return 'text-red-300/90 hover:text-red-200 hover:bg-red-950/30';
    case 'cyan': return 'text-cyan-300/90 hover:text-cyan-200 hover:bg-cyan-950/30';
    case 'violet': return 'text-violet-300/90 hover:text-violet-200 hover:bg-violet-950/30';
    default: return 'text-zinc-300 hover:text-zinc-100 hover:bg-[#090f17]';
  }
};

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, isAudioPlaying = false }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // The masthead is the page's H1 only on the home page; elsewhere each page owns its H1.
  const MastheadTag: React.ElementType = isHome ? 'h1' : 'p';

  return (
    <header className="bg-[#03060a] border-b border-[#253245]/70 sticky top-0 z-40 text-zinc-300 shadow-xl shadow-black/50">
      {/* Top registry strip */}
      <div className="flex flex-wrap items-center justify-between px-3 md:px-6 py-1.5 bg-[#020407] border-b border-[#1b2533] text-[10.5px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#dfb76c] font-medium tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#d4af37]" aria-hidden="true" />
            <span>{ENTITY.name.toUpperCase()}</span>
          </span>
          <span className="hidden lg:inline text-zinc-600" aria-hidden="true">|</span>
          <span className="hidden lg:inline text-zinc-300">
            INDEPENDENT CREATIVE-TECHNOLOGY RESEARCH INITIATIVE · EXPERIMENTAL AUDIO & SPECULATIVE ENGINEERING
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          {isAudioPlaying && (
            <div
              role="status"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 animate-pulse"
            >
              <Volume2 className="w-3 h-3" aria-hidden="true" />
              <span>AUDIO ENGINE ACTIVE</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3 h-3 text-[#dfb76c]" aria-hidden="true" />
            <time suppressHydrationWarning>{currentTime || '—— UTC'}</time>
          </div>
          <span className="hidden sm:inline text-zinc-600" aria-hidden="true">·</span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#0a121e] border border-[#23354d] text-cyan-300 font-semibold">
            STATUS: ACTIVE ARCHIVE
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="flex items-center justify-between gap-3 px-3 md:px-6 py-3 border-b border-[#1f2b3c]/60 bg-gradient-to-r from-[#03060a] via-[#050a12] to-[#03060a]">
        <Link to="/" className="flex items-center gap-3.5 min-w-0 group" aria-label="Zazie Institute of Applied Anomalies — home">
          <div className="relative">
            <InstitutionalCrest size={46} variant="gold" className="transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full blur-sm pointer-events-none" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MastheadTag className="text-base md:text-lg font-bold tracking-wide text-white font-serif truncate">
                ZAZIE INSTITUTE OF APPLIED ANOMALIES
              </MastheadTag>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#dfb76c] bg-[#161309] border border-[#8c6d31]/60 rounded">
                ZIAA
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2 font-serif">
              <span>Independent Research &amp; Creative-Technology Initiative</span>
              <span className="text-zinc-600 hidden md:inline" aria-hidden="true">·</span>
              <span className="hidden md:inline italic text-[#c5a059]">Applied Anomalies, Audio Technology &amp; Speculative Systems</span>
              <span className="text-zinc-600 hidden lg:inline" aria-hidden="true">·</span>
              <span className="hidden lg:inline text-emerald-300 font-mono text-[10.5px]">Archive Cycle 2021–2026</span>
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#070e17] hover:bg-[#0c1827] border border-[#2b3e58] hover:border-[#dfb76c]/80 text-zinc-200 rounded-md text-xs transition-all shadow-md group shrink-0"
          aria-label="Open archive search (Ctrl+K)"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Search className="w-3.5 h-3.5 text-[#dfb76c] group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span className="font-serif tracking-wider hidden sm:inline">Archive Search</span>
          <kbd className="hidden md:inline text-[9.5px] bg-[#020509] px-1.5 py-0.5 rounded border border-[#1b2636] text-zinc-400 font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Primary navigation */}
      <nav aria-label="Primary" className="flex items-center overflow-x-auto px-2 md:px-5 py-1 gap-1 text-[11.5px] scrollbar-none bg-[#020407]">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-2 font-serif tracking-wider ${toneClasses(item.tone, isActive)}`
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive
                        ? item.tone === 'alert'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-[#251e0e] text-[#f5d78e] border border-[#8c6d31]/50'
                        : 'bg-[#090f17] text-zinc-400 border border-[#162233]'
                    }`}
                    aria-label={`${item.count} records`}
                  >
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
