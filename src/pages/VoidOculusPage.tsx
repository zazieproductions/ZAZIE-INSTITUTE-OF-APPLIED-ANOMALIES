import React, { useState } from 'react';
import { Eye, ExternalLink, Maximize2, ShieldCheck, Play } from 'lucide-react';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, softwareAppSchema } from '../seo/schema';
import { instrumentRelations } from '../seo/graph';
import { Breadcrumbs } from '../components/Breadcrumbs';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'VOID//OCULUS', path: '/void-oculus' }
];

const APP_URL = '/apps/void-oculus/index.html';
const DESCRIPTION =
  'VOID//OCULUS is an infinite spatial-thinking canvas from the Zazie Institute of Applied Anomalies: an 8,000 × 6,000 px board with procedural eyes, linked research cards, in-place editing, search and local session persistence — a zero-dependency creative tool.';

/**
 * The VOID//OCULUS prototype is intentionally kept in an isolated document
 * (its own global state, keyboard shortcuts, animations and localStorage).
 * The iframe is mounted on demand so the archive shell stays light.
 */
export const VoidOculusPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  return (
    <div className="space-y-4 font-mono">
      <Seo
        title="VOID//OCULUS — Infinite Spatial Thinking Canvas"
        description={DESCRIPTION}
        path="/void-oculus"
        keywords={['spatial canvas', 'infinite whiteboard', 'creative tool', 'digital art', 'generative interface']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          softwareAppSchema({
            path: '/void-oculus',
            name: 'VOID//OCULUS Spatial Canvas',
            description: DESCRIPTION,
            category: 'DesignApplication',
            features: ['Infinite pan/zoom board', 'Procedural eye entities', 'Linked research cards', 'In-place text editing', 'Local session persistence', 'Keyboard shortcuts'],
            extra: instrumentRelations('generative-software')
          })        ]}
      />

      <header className="rounded-xl border border-[#352067] bg-gradient-to-br from-[#090611] via-[#07080f] to-[#04100e] p-4 md:p-5 shadow-lg shadow-violet-950/10 space-y-3">
        <Breadcrumbs crumbs={CRUMBS} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="archival-stamp border-violet-500/60 text-violet-300">
                <Eye className="h-3 w-3" aria-hidden="true" />
                OCULAR PROTOTYPE
              </span>
              <span className="text-[10px] tracking-wider text-zinc-400">VOID-OCULUS / EMBEDDED RUNTIME</span>
            </div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-white md:text-2xl">
              VOID//OCULUS — THE CANVAS IS AN EYE
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-300 md:text-sm">
              A spatial thinking surface that looks back at you. Pan and zoom the infinite board, link research cards,
              summon new notes and eyes, edit text in place, and search the seeded field without leaving the Institute
              archive.
            </p>
          </div>

          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-violet-500/60 bg-violet-950/30 px-3 py-2 text-xs font-bold tracking-wide text-violet-200 transition-colors hover:border-violet-300 hover:bg-violet-900/40 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            OPEN FULL WINDOW
            <ExternalLink className="h-3 w-3 text-violet-400" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <ul className="grid grid-cols-1 gap-2 border-t border-[#241a3c] pt-3 text-[10px] text-zinc-400 sm:grid-cols-3">
          <li><span className="text-emerald-400" aria-hidden="true">●</span> 8,000 × 6,000 PX SPATIAL BOARD</li>
          <li><span className="text-cyan-400" aria-hidden="true">●</span> PROCEDURAL EYES + GLOWING LINKS</li>
          <li><span className="text-amber-400" aria-hidden="true">●</span> LOCAL SESSION PERSISTENCE ENABLED</li>
        </ul>
      </header>

      <section aria-label="VOID//OCULUS canvas" className="overflow-hidden rounded-xl border border-[#263044] bg-[#020305] p-1.5 shadow-2xl shadow-black/40">
        {mounted ? (
          <iframe
            title="VOID//OCULUS interactive spatial canvas"
            src={APP_URL}
            loading="lazy"
            className="block w-full border-0 bg-[#0a0a0b]"
            style={{ height: 'min(78vh, 920px)', minHeight: '620px' }}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 bg-[#0a0a0b] text-center"
            style={{ height: 'min(78vh, 920px)', minHeight: '620px' }}
          >
            <Eye className="h-12 w-12 text-violet-400" aria-hidden="true" />
            <p className="max-w-md text-xs text-zinc-300 leading-relaxed px-4">
              The canvas runs as an embedded, self-contained application. Launch it here or open it full-window.
            </p>
            <button
              type="button"
              onClick={() => setMounted(true)}
              className="inline-flex items-center gap-2 rounded-md border border-violet-400 bg-violet-950/40 px-4 py-2 text-xs font-bold tracking-wide text-violet-100 hover:bg-violet-900/60"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              LAUNCH VOID//OCULUS
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-[#1c2635] bg-[#05080d] px-3 py-2 text-[10px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            EMBEDDED STATIC ARTIFACT · NO NETWORK SERVICE REQUIRED
          </span>
          <span className="text-zinc-500">MIT LICENSE · ZAZIE PRODUCTIONS / VOID-OCULUS</span>
        </div>
      </section>
    </div>
  );
};

export default VoidOculusPage;
