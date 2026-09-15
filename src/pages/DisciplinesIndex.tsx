import React from 'react';
import { Link } from 'react-router-dom';
import { archiveStats } from '../data/archive';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, organizationSchema } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageHeader } from '../components/PageHeader';
import { DISCIPLINE_SLUGS } from '../seo/site';

const DISCIPLINE_INDEX_META: Record<string, { summary: string; countLabel: string }> = {
  'applied-anomalies': { summary: 'Nonlinear feedback, hysteresis and perceptual anomalies as instruments.', countLabel: 'Founding Division' },
  'experimental-audio-systems': { summary: 'Custom synthesis hardware and spatial diffusion systems.', countLabel: 'Hard Systems' },
  'computational-creativity': { summary: 'Autonomous agents and neural latent composition.', countLabel: 'Generative Agents' },
  'speculative-engineering': { summary: 'Design-fiction hardware kept open via defensive publication.', countLabel: 'Counterfactuals' },
  'perceptual-interfaces': { summary: 'Haptic and whole-body listening surfaces.', countLabel: 'Embodied Interfaces' },
  'generative-software': { summary: 'Real-time DSP, ambisonics and live-coding engines.', countLabel: 'Soft Instruments' },
  'signal-archaeology': { summary: 'Optical recovery of fragile historical sound carriers.', countLabel: 'Media Forensics' },
  'acoustic-architecture': { summary: 'Resonant vaults, domes and kilometre-scale listening arrays.', countLabel: 'Spatial Architecture' }
};

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Research Divisions', path: '/disciplines' }
];

export const DisciplinesIndex: React.FC = () => {
  const disciplineEntries = Object.entries(DISCIPLINE_SLUGS) as [string, string][];

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title="Research Divisions & Interdisciplinary Studios (8 Laboratories)"
        description="The 8 research divisions of the Zazie Institute of Applied Anomalies: Applied Anomalies, Experimental Audio Systems, Computational Creativity, Speculative Engineering, Perceptual Interfaces, Generative Software, Signal Archaeology and Acoustic Architecture — with prototypes, patents and monographs per division."
        path="/disciplines"
        keywords={['ZIAA research divisions', 'interdisciplinary studios', 'experimental audio research lab', 'applied anomalies institute', ...Object.keys(DISCIPLINE_SLUGS)]}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          organizationSchema(),
          collectionPageSchema({
            name: 'ZIAA Research Divisions & Interdisciplinary Studios',
            description: 'Eight canonical research divisions of the Zazie Institute of Applied Anomalies, each with a curated prototype and patent cluster, editorial overview and FAQ for AI-Overview and PAA surfaces.',
            path: '/disciplines',
            about: ['experimental technology', 'audio research', 'computational creativity', 'speculative engineering'],
            items: disciplineEntries.map(([name, slug]) => ({
              name: `${name} — ZIAA Research Division`,
              path: `/disciplines/${slug}`
            })),
            maxItems: 20
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="RESEARCH DIVISIONS"
        kicker="8 INTERDISCIPLINARY LABORATORIES · 2021–2026"
        title={<>Research Divisions & Interdisciplinary Studios (8 Laboratories)</>}
        lede="Each division is a durable topical hub: one canonical URL, one long-form editorial, one FAQ, and a complete cluster of prototypes and speculative patents — engineered to accumulate authority for long-tail academic queries while routing both humans and crawlers deep into the archive."
        aside={
          <div className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2.5 border border-[#1b2636] rounded-md shrink-0">
            <div className="text-white font-bold">{disciplineEntries.length} Divisions · {archiveStats.totalPrototypes} Prototypes</div>
            <div className="text-[11px] text-zinc-400">Canonical hubs for entity & topic authority</div>
          </div>
        }
      />

      <section aria-labelledby="divisions-grid" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1b2636] pb-3">
          <h2 id="divisions-grid" className="text-sm font-bold text-white tracking-wide">
            Browse by research division — every hub is crawlable, citable and interlinked
          </h2>
          <p className="text-[11px] font-mono text-zinc-400">Hover for editorial · Click for full dossier</p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Research divisions">
          {disciplineEntries.map(([name, slug]) => {
            const meta = DISCIPLINE_INDEX_META[slug];
            return (
              <li key={slug}>
                <Link
                  to={`/disciplines/${slug}`}
                  className="block h-full p-5 bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/70 rounded-xl transition-all group shadow-md hover:shadow-[#dfb76c]/5"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-[#dfb76c] leading-snug">{name}</h3>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0c1420] border border-[#233347] text-cyan-300">
                      {meta.countLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{meta.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">/disciplines/{slug}</span>
                    <span className="text-[#dfb76c] group-hover:underline flex items-center gap-1">Enter division <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="pt-4 border-t border-[#1b2636] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#03060a] border border-[#1b2738] rounded-lg">
            <div className="text-[11px] font-mono font-bold text-[#dfb76c] uppercase">For crawlers</div>
            <p className="text-zinc-400 mt-1 leading-relaxed">One canonical URL per division eliminates parameter-faceting dilution (formerly ?discipline=…). Each hub is in the sitemap with changefreq weekly and maximal internal link equity.</p>
          </div>
          <div className="p-3 bg-[#03060a] border border-[#1b2738] rounded-lg">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">For humans</div>
            <p className="text-zinc-400 mt-1 leading-relaxed">Long-form editorial, playable prototypes and cross-linked patents — designed for dwell time, not doorway-page thinness. Every card links with descriptive anchor text.</p>
          </div>
          <div className="p-3 bg-[#03060a] border border-[#1b2738] rounded-lg">
            <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">For AI Overviews</div>
            <p className="text-zinc-400 mt-1 leading-relaxed">FAQPage + ResearchProject + CollectionPage JSON-LD per division targets People Also Ask and LLM citation surfaces without cloaking.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="cite-hubs" className="bg-[#05080f] border border-[#1b2738] rounded-xl p-6 space-y-3">
        <h2 id="cite-hubs" className="text-sm font-bold text-white">Why divisions exist — and why they’re not filters</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Earlier the archive exposed disciplines only as <code className="px-1.5 py-0.5 bg-[#0c1420] border border-[#1b2738] rounded text-xs font-mono text-cyan-300">?discipline=</code> query-state on <code className="text-zinc-200">/prototypes</code>. That saved sitemap hygiene but forfeited the strongest topical signal academic search rewards: a dedicated, editorially-maintained landing page per research area with stable H1, lede and citation graph. The SEO_SITEMAP_AUDIT flagged this as the primary gap. This index and its 8 children close it without doorway inflation — each page is a legitimate institutional division, not a search-spawned faceted duplicate.
        </p>
        <p className="text-xs font-mono text-zinc-500">
          See also: <Link to="/about" className="text-[#dfb76c] hover:underline">About the Institute — mission & fact sheet</Link> ·{' '}
          <Link to="/prototypes" className="text-cyan-400 hover:underline">Prototype archive ({archiveStats.totalPrototypes})</Link> ·{' '}
          <Link to="/monographs" className="text-violet-300 hover:underline">Transactions & monographs</Link>
        </p>
      </section>

      <nav aria-label="Primary archive" className="flex flex-wrap gap-2 text-xs font-mono justify-center">
        <Link to="/prototypes" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Prototypes</Link>
        <Link to="/patents" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Patents</Link>
        <Link to="/research-notes" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Research Notes</Link>
        <Link to="/field-stations" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Field Stations</Link>
        <Link to="/fellows" className="px-3 py-1.5 bg-[#05080f] border border-[#1b2738] hover:border-[#dfb76c] rounded text-zinc-300">Fellows</Link>
      </nav>
    </div>
  );
};

export default DisciplinesIndex;
