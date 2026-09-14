import React from 'react';
import { Eye, ExternalLink, Maximize2, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

/**
 * The VOID//OCULUS prototype is intentionally kept in an isolated document.
 * It is a zero-dependency canvas with its own global state, keyboard shortcuts,
 * animations, and localStorage session, so an iframe keeps it from colliding
 * with the Institute archive shell while preserving the complete experience.
 */
export const VoidOculusPage: React.FC = () => {
  return (
    <div className="space-y-4 font-mono">
      <section className="rounded-xl border border-[#352067] bg-gradient-to-br from-[#090611] via-[#07080f] to-[#04100e] p-4 md:p-5 shadow-lg shadow-violet-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="archival-stamp border-violet-500/60 text-violet-300">
                <Eye className="h-3 w-3" />
                OCULAR PROTOTYPE
              </span>
              <StatusBadge label="Operational" size="xs" />
              <span className="text-[10px] tracking-wider text-zinc-500">VOID-OCULUS / EMBEDDED RUNTIME</span>
            </div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-white md:text-2xl">
              VOID//OCULUS — THE CANVAS IS AN EYE
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-400 md:text-sm">
              A spatial thinking surface that looks back at you. Pan and zoom the infinite board, link research cards,
              summon new notes and eyes, edit text in place, and search the seeded field without leaving the Institute archive.
            </p>
          </div>

          <a
            href="/void-oculus/index.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-violet-500/60 bg-violet-950/30 px-3 py-2 text-xs font-bold tracking-wide text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-900/40 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            OPEN FULL WINDOW
            <ExternalLink className="h-3 w-3 text-violet-400" />
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#241a3c] pt-3 text-[10px] text-zinc-500 sm:grid-cols-3">
          <div><span className="text-emerald-400">●</span> 8,000 × 6,000 PX SPATIAL BOARD</div>
          <div><span className="text-cyan-400">●</span> PROCEDURAL EYES + GLOWING LINKS</div>
          <div><span className="text-amber-400">●</span> LOCAL SESSION PERSISTENCE ENABLED</div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#263044] bg-[#020305] p-1.5 shadow-2xl shadow-black/40">
        <iframe
          title="VOID//OCULUS interactive spatial canvas"
          src="/void-oculus/index.html"
          className="block w-full border-0 bg-[#0a0a0b]"
          style={{ height: 'min(78vh, 920px)', minHeight: '620px' }}
        />
        <div className="flex flex-col gap-2 border-t border-[#1c2635] bg-[#05080d] px-3 py-2 text-[10px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            EMBEDDED STATIC ARTIFACT · NO NETWORK SERVICE REQUIRED
          </span>
          <span className="text-zinc-600">MIT LICENSE · ZAZIE PRODUCTIONS / VOID-OCULUS</span>
        </div>
      </section>
    </div>
  );
};
