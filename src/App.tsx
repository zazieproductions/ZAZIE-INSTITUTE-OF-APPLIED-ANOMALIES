import React, { useState, useEffect } from 'react';
import { Header, TabKey } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { PrototypesArchive } from './pages/PrototypesArchive';
import { PatentDossiers } from './pages/PatentDossiers';
import { LabLogsStream } from './pages/LabLogsStream';
import { AcousticBenchPage } from './pages/AcousticBenchPage';
import { SpectraLabConsole } from './components/SpectraLabConsole';
import { SynthesisSignalPage } from './pages/SynthesisSignalPage';
import { FieldInfrastructure } from './pages/FieldInfrastructure';
import { Monographs } from './pages/Monographs';
import { BlackVaultFailures } from './pages/BlackVaultFailures';
import { AuditRevisions } from './pages/AuditRevisions';
import { VoidOculusPage } from './pages/VoidOculusPage';
import { LegalDisclosuresPage, LegalSectionKey } from './pages/LegalDisclosuresPage';
import { StatusBadge } from './components/StatusBadge';
import { DossierModal } from './components/DossierModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import {
  getPrototypeById,
  getPatentById,
  getLabLogById,
  getFailureById,
  getFieldSiteById
} from './data/archive';
import { audioEngine } from './audio/audioEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Dossier modal state
  const [dossierOpen, setDossierOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<any>('prototype');

  useEffect(() => {
    const unsub = audioEngine.subscribe(playing => {
      setIsAudioPlaying(playing);
    });
    return () => {
      unsub();
    };
  }, []);

  // Listen for direct URL hash navigation (e.g. #disclaimer, #terms, #privacy, #institutional-status)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#institutional-status' || hash === '#status-notice' || hash === '#institutional') {
        setActiveTab('institutional-status');
      } else if (hash === '#disclaimer' || hash === '#research-disclaimer' || hash === '#speculation-disclaimer') {
        setActiveTab('disclaimer');
      } else if (hash === '#terms' || hash === '#terms-of-use') {
        setActiveTab('terms');
      } else if (hash === '#privacy' || hash === '#privacy-policy') {
        setActiveTab('privacy');
      } else if (hash === '#legal' || hash === '#disclosures') {
        setActiveTab('legal');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openDossier = (type: any, id: string) => {
    let rec: any = null;
    if (type === 'prototype') rec = getPrototypeById(id);
    else if (type === 'patent') rec = getPatentById(id);
    else if (type === 'log') rec = getLabLogById(id);
    else if (type === 'failure') rec = getFailureById(id);
    else if (type === 'site') rec = getFieldSiteById(id);

    if (rec) {
      setSelectedRecord(rec);
      setSelectedRecordType(type);
      setDossierOpen(true);
    }
  };

  const isLegalTab = ['legal', 'institutional-status', 'disclaimer', 'terms', 'privacy'].includes(activeTab);

  const getLegalInitialSection = (): LegalSectionKey => {
    if (activeTab === 'institutional-status') return 'status';
    if (activeTab === 'disclaimer') return 'disclaimer';
    if (activeTab === 'terms') return 'terms';
    if (activeTab === 'privacy') return 'privacy';
    return 'status';
  };

  const handleFooterLegalNavigate = (section: 'status' | 'disclaimer' | 'terms' | 'privacy') => {
    const mapping: Record<string, TabKey> = {
      status: 'institutional-status',
      disclaimer: 'disclaimer',
      terms: 'terms',
      privacy: 'privacy'
    };
    setActiveTab(mapping[section] || 'legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030508] text-zinc-300 flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
        isAudioPlaying={isAudioPlaying}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectTab={setActiveTab}
            onSelectRecord={openDossier}
          />
        )}

        {activeTab === 'prototypes' && (
          <PrototypesArchive
            onSelectPrototype={id => openDossier('prototype', id)}
          />
        )}

        {activeTab === 'patents' && (
          <PatentDossiers
            onSelectPatent={id => openDossier('patent', id)}
          />
        )}

        {activeTab === 'logs' && (
          <LabLogsStream
            onSelectLog={id => openDossier('log', id)}
          />
        )}

        {activeTab === 'bench' && (
          <AcousticBenchPage />
        )}

        {activeTab === 'spectra' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#05080c] border border-cyan-950 p-4 rounded-lg">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h1 className="text-base font-bold text-white tracking-wider">
                    SPECTRA//LAB — AUDIOVISUAL DSP WORKSTATION
                  </h1>
                  <StatusBadge label="Operational" size="xs" />
                </div>
                <p className="text-zinc-400 text-xs mt-1">
                  Volumetric spectral field canvas, particle physics, 64-band FFT analysis, 8x8 mod matrix, and automated parameter curves.
                </p>
              </div>
            </div>
            <SpectraLabConsole />
          </div>
        )}

        {activeTab === 'synthesis' && (
          <SynthesisSignalPage />
        )}

        {activeTab === 'oculus' && (
          <VoidOculusPage />
        )}

        {activeTab === 'infrastructure' && (
          <FieldInfrastructure
            onSelectSite={id => openDossier('site', id)}
          />
        )}

        {activeTab === 'monographs' && (
          <Monographs />
        )}

        {activeTab === 'vault' && (
          <BlackVaultFailures
            onSelectFailure={id => openDossier('failure', id)}
          />
        )}

        {activeTab === 'audit' && (
          <AuditRevisions />
        )}

        {isLegalTab && (
          <LegalDisclosuresPage
            initialSection={getLegalInitialSection()}
            onSelectSection={sec => {
              const tabMap: Record<LegalSectionKey, TabKey> = {
                status: 'institutional-status',
                disclaimer: 'disclaimer',
                terms: 'terms',
                privacy: 'privacy'
              };
              setActiveTab(tabMap[sec]);
            }}
            onReturnToArchive={() => {
              setActiveTab('dashboard');
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        )}
      </main>

      {/* Footer with subtle and readable legal disclaimer */}
      <Footer onNavigateLegal={handleFooterLegalNavigate} />

      {/* Classified Dossier Modal */}
      <DossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        record={selectedRecord}
        recordType={selectedRecordType}
        onNavigateRecord={(type, id) => openDossier(type, id)}
      />

      {/* Global OMNISearch Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectRecord={(type, id) => openDossier(type, id)}
      />
    </div>
  );
}

export default App;
