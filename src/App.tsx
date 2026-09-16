import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loading } from './components/Loading';
import { Dashboard } from './pages/Dashboard';
import { audioEngine } from './audio/audioEngine';
import { CLIENT_ALIAS_ROUTES, resolveAliasWithQuery, resolveSatelliteOrigin } from './routes/aliasResolver';

/* Route-level code splitting: each section (and its data) is its own chunk. */
const About = lazy(() => import('./pages/About'));
const PrototypesArchive = lazy(() => import('./pages/PrototypesArchive'));
const PatentDossiers = lazy(() => import('./pages/PatentDossiers'));
const LabLogsStream = lazy(() => import('./pages/LabLogsStream'));
const Monographs = lazy(() => import('./pages/Monographs'));
const AcousticBenchPage = lazy(() => import('./pages/AcousticBenchPage'));
const SpectraLabPage = lazy(() => import('./pages/SpectraLabPage'));
const VoidOculusPage = lazy(() => import('./pages/VoidOculusPage'));
const SynthesisSignalPage = lazy(() => import('./pages/SynthesisSignalPage'));
const EmotionSpectrumPage = lazy(() => import('./pages/EmotionSpectrumPage'));
const LegalDisclosuresPage = lazy(() => import('./pages/LegalDisclosuresPage'));
const FieldInfrastructure = lazy(() => import('./pages/FieldInfrastructure'));
const BlackVaultFailures = lazy(() => import('./pages/BlackVaultFailures'));
const PersonnelDirectory = lazy(() => import('./pages/PersonnelDirectory'));
const AuditRevisions = lazy(() => import('./pages/AuditRevisions'));
const RecordPage = lazy(() => import('./pages/RecordPage'));
const DisciplineHub = lazy(() => import('./pages/DisciplineHub'));
const DisciplinesIndex = lazy(() => import('./pages/DisciplinesIndex'));
const Papers = lazy(() => import('./pages/Papers'));
const Lexicon = lazy(() => import('./pages/Lexicon'));
const CitePolicy = lazy(() => import('./pages/CitePolicy'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Gone = lazy(() => import('./pages/Gone'));
const GlobalSearchModal = lazy(() => import('./components/GlobalSearchModal'));

/** Restore top-of-page on navigation (SPA default keeps scroll position). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

/**
 * Legacy hash/tab URLs (#prototypes, ?tab=vault) → canonical paths.
 * Mirrors the hash-tab-leftover rules in scripts/alias-registry.mjs (host config
 * answers /?tab=… with a real 301 where the host can match query strings).
 */
const LEGACY_TABS: Record<string, string> = {
  dashboard: '/',
  prototypes: '/prototypes',
  patents: '/patents',
  logs: '/research-notes',
  bench: '/acoustic-bench',
  spectra: '/spectra-lab',
  oculus: '/void-oculus',
  infrastructure: '/field-stations',
  monographs: '/monographs',
  vault: '/post-mortems',
  personnel: '/fellows',
  audit: '/system-audit'
};

function LegacyRedirect({ tab }: { tab: string }) {
  return <Navigate to={LEGACY_TABS[tab] ?? '/'} replace />;
}

/**
 * Catch-all rescue: a path the router does not declare is offered to the alias
 * registry before it becomes a 404. This is what keeps historical URLs working
 * on hosts that cannot express the rule (query facets, retired subpaths, and
 * satellites serving this same build).
 */
function AliasRescue() {
  const { pathname, search } = useLocation();
  const resolution = resolveAliasWithQuery(pathname, search);
  if (resolution.kind === 'permanent') {
    const keepQuery = resolution.via === 'case-fold' ? search : '';
    return <Navigate to={`${resolution.to}${keepQuery}`} replace />;
  }
  if (resolution.kind === 'gone') return <Navigate to="/410" replace />;
  return <NotFound />;
}

/**
 * Satellite origins already named in this repository (GitHub Pages demos of the
 * predecessor and of the ported instruments) are not canonical: if this build is
 * served from one, hand the visitor to the institution's origin. The host rules
 * for those origins are generated in deploy/satellite-canonicalization.md.
 */
function SatelliteOriginCanonicalizer() {
  useEffect(() => {
    const fix = resolveSatelliteOrigin(window.location.href);
    if (fix) window.location.replace(fix.to);
  }, []);
  return null;
}

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const location = useLocation();

  useEffect(() => audioEngine.subscribe(playing => setIsAudioPlaying(playing)), []);

  // Legacy hash-tab support (#logs etc.)
  const legacyHash = location.hash.replace('#', '');
  if (location.pathname === '/' && legacyHash && LEGACY_TABS[legacyHash]) {
    return <LegacyRedirect tab={legacyHash} />;
  }

  return (
    <div className="min-h-screen bg-[#030508] text-zinc-300 flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:bg-[#dfb76c] focus:text-black focus:font-bold focus:rounded"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <SatelliteOriginCanonicalizer />

      <Header onOpenSearch={() => setSearchOpen(true)} isAudioPlaying={isAudioPlaying} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 outline-none">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />

            <Route path="/prototypes" element={<PrototypesArchive />} />
            <Route path="/prototypes/:id" element={<RecordPage type="prototype" />} />

            <Route path="/patents" element={<PatentDossiers />} />
            <Route path="/patents/:id" element={<RecordPage type="patent" />} />

            <Route path="/research-notes" element={<LabLogsStream />} />
            <Route path="/research-notes/:id" element={<RecordPage type="log" />} />

            <Route path="/monographs" element={<Monographs />} />
            <Route path="/monographs/:id" element={<Monographs />} />

            <Route path="/acoustic-bench" element={<AcousticBenchPage />} />
            <Route path="/spectra-lab" element={<SpectraLabPage />} />
            <Route path="/void-oculus" element={<VoidOculusPage />} />
            <Route path="/synthesis-signal" element={<SynthesisSignalPage />} />
            <Route path="/emotion-spectrum" element={<EmotionSpectrumPage />} />
            <Route path="/legal" element={<Navigate to="/legal/institutional-status" replace />} />
            <Route path="/legal/:section" element={<LegalDisclosuresPage />} />

            <Route path="/field-stations" element={<FieldInfrastructure />} />
            <Route path="/field-stations/:id" element={<RecordPage type="site" />} />

            <Route path="/post-mortems" element={<BlackVaultFailures />} />
            <Route path="/post-mortems/:id" element={<RecordPage type="failure" />} />

            <Route path="/fellows" element={<PersonnelDirectory />} />
            <Route path="/fellows/:id" element={<RecordPage type="personnel" />} />

            <Route path="/system-audit" element={<AuditRevisions />} />
            <Route path="/disciplines" element={<DisciplinesIndex />} />
            <Route path="/disciplines/:slug" element={<DisciplineHub />} />
            <Route path="/lexicon" element={<Lexicon />} />
            <Route path="/cite" element={<CitePolicy />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Historical / alias vocabulary, generated from scripts/alias-registry.mjs
                so the client can never drift from vercel.json + public/_redirects. */}
            {CLIENT_ALIAS_ROUTES.map(rule => (
              <Route key={rule.from} path={rule.from} element={<Navigate to={rule.to} replace />} />
            ))}
            <Route path="/logs/:id" element={<RecordPage type="log" redirectTo="/research-notes" />} />
            <Route path="/personnel/:id" element={<RecordPage type="personnel" redirectTo="/fellows" />} />
            <Route path="/410" element={<Gone />} />
            <Route path="*" element={<AliasRescue />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {searchOpen && (
        <Suspense fallback={null}>
          <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
