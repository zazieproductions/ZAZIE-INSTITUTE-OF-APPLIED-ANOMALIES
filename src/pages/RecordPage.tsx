import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  loadPrototypes, loadPatents, loadLabLogs, loadFailures, loadPersonnel, loadFieldSites,
  recordPath, RECORD_BASE, type RecordType
} from '../data/archive';
import { useCollection } from '../lib/useCollection';
import type { Prototype, Patent, LabLog, FailedIncident, Personnel, FieldSite } from '../data/types';
import { Seo } from '../seo/Seo';
import { ENTITY, SITE_URL } from '../seo/site';
import { breadcrumbSchema, creativeWorkSchema, personSchema, placeSchema, parseDms, type Crumb } from '../seo/schema';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import {
  PrototypeDossier, PatentDossier, LabLogDossier, FailureDossier, PersonnelDossier, FieldSiteDossier
} from '../components/RecordDossier';
import { humanize } from '../lib/format';
import { Printer, Share2, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface RecordPageProps {
  type: RecordType;
  /** When set, the page is a legacy alias: redirect to the canonical base. */
  redirectTo?: string;
}

const SECTION_NAMES: Record<RecordType, string> = {
  prototype: 'Prototypes',
  patent: 'Speculative Patents',
  log: 'Research Notes',
  failure: 'Anomaly Post-Mortems',
  personnel: 'Fellows & Inventors',
  site: 'Field Stations'
};

const LOADERS = {
  prototype: loadPrototypes,
  patent: loadPatents,
  log: loadLabLogs,
  failure: loadFailures,
  personnel: loadPersonnel,
  site: loadFieldSites
} as const;

type AnyRecord = Prototype | Patent | LabLog | FailedIncident | Personnel | FieldSite;

interface Meta {
  title: string;
  titleId: string;
  heading: string;
  description: string;
  jsonLd: Record<string, unknown>;
  ogType: 'article' | 'profile' | 'website';
  published?: string;
  keywords: string[];
  citation?: { title: string; authors: string[]; publicationDate: string; journalTitle?: string; pdfUrl?: string };
}

function buildMeta(type: RecordType, rec: AnyRecord, path: string): Meta {
  switch (type) {
    case 'prototype': {
      const p = rec as Prototype;
      return {
        title: p.title, titleId: p.id,
        heading: p.title,
        description: `${p.codeName} (${p.id}) - ${p.discipline} prototype, ${p.year}. ${p.abstract}`,
        ogType: 'article',
        published: `${p.year}-01-01`,
        keywords: [p.discipline, p.codeName, 'experimental prototype', 'ZIAA'],
        jsonLd: creativeWorkSchema({
          type: 'TechArticle',
          path,
          name: `${p.id} ${p.codeName} - ${p.title}`,
          headline: p.title,
          description: p.abstract,
          identifier: p.id,
          datePublished: `${p.year}-01-01`,
          authors: [p.leadResearcher],
          keywords: [p.discipline, ...p.interfaceProtocols],
          genre: 'Experimental prototype specification',
          extra: {
            about: { '@type': 'Product', name: `${p.codeName} (${p.id})`, description: p.technicalSummary, category: p.discipline },
            proficiencyLevel: 'Expert',
            dependencies: p.computationalCore
          }
        })
      };
    }
    case 'patent': {
      const p = rec as Patent;
      return {
        title: p.title, titleId: p.id,
        heading: p.title,
        description: `Speculative patent ${p.patentNumber} (${humanize(p.status).toLowerCase()}, filed ${p.filingDate}) - ${p.abstract}`,
        ogType: 'article',
        published: p.filingDate,
        keywords: [p.primaryDiscipline, 'speculative patent', 'defensive disclosure', 'ZIAA'],
        citation: { title: p.title, authors: p.inventors, publicationDate: p.filingDate.replace(/-/g, '/'), journalTitle: 'ZIAA Speculative Patent Disclosures', pdfUrl: `${SITE_URL}/papers/${p.id.toLowerCase()}.pdf` },
        jsonLd: creativeWorkSchema({
          type: 'CreativeWork',
          path,
          name: `${p.patentNumber} - ${p.title}`,
          description: p.abstract,
          identifier: p.patentNumber,
          datePublished: p.filingDate,
          authors: p.inventors,
          keywords: [p.primaryDiscipline],
          additionalType: 'https://schema.org/TechArticle',
          genre: 'Speculative patent disclosure (design fiction)',
          extra: { copyrightHolder: { '@type': 'Organization', name: p.assignee }, creativeWorkStatus: humanize(p.status) }
        })
      };
    }
    case 'log': {
      const l = rec as LabLog;
      return {
        title: l.summary.replace(/^\[[A-Z_]+\]\s*/, ''), titleId: l.id,
        heading: l.summary,
        description: `Research note ${l.id} (${l.displayDate}, ${l.facility}, ${l.author}): ${l.logBody}`,
        ogType: 'article',
        published: l.timestamp,
        keywords: [...l.tags, l.facility, 'research note'],
        jsonLd: creativeWorkSchema({
          type: 'Report',
          path,
          name: `${l.id}: ${l.summary}`,
          description: l.logBody,
          identifier: l.id,
          datePublished: l.timestamp,
          authors: [l.author],
          keywords: l.tags,
          genre: 'Laboratory research note',
          extra: { locationCreated: { '@type': 'Place', name: l.facility } }
        })
      };
    }
    case 'failure': {
      const f = rec as FailedIncident;
      return {
        title: `${f.projectTitle} post-mortem`, titleId: f.projectCode,
        heading: `${f.projectCode}: ${f.projectTitle}`,
        description: `Anomaly post-mortem ${f.id} (${f.incidentDate}, ${f.hazardClassification}): ${f.summary}`,
        ogType: 'article',
        published: f.incidentDate,
        keywords: ['post-mortem', 'failure analysis', f.hazardClassification, 'ZIAA'],
        jsonLd: creativeWorkSchema({
          type: 'Report',
          path,
          name: `${f.id} - ${f.projectTitle} post-mortem`,
          description: f.summary,
          identifier: f.id,
          datePublished: f.incidentDate,
          authors: [f.leadInvestigator],
          keywords: [f.hazardClassification, 'root cause analysis'],
          genre: 'Anomaly post-mortem case study'
        })
      };
    }
    case 'personnel': {
      const p = rec as Personnel;
      return {
        // Title budget: name + record id only; the job title rides in the H1,
        // description and Person schema (disambiguatingDescription).
        title: p.name, titleId: p.id,
        heading: p.name,
        description: `${p.name}, ${p.title} at the Zazie Institute of Applied Anomalies. Specialisation: ${p.specialization}. ${p.biography}`,
        ogType: 'profile',
        keywords: [p.specialization, 'research fellow', 'creative technologist', 'ZIAA'],
        jsonLd: personSchema({
          path,
          name: p.name,
          jobTitle: p.title,
          description: p.biography,
          knowsAbout: [p.specialization, ...ENTITY.fields.slice(0, 4)]
        })
      };
    }
    case 'site': {
      const s = rec as FieldSite;
      const geo = parseDms(s.coordinates);
      return {
        title: `${s.name} field station`, titleId: s.codename,
        heading: s.name,
        description: `${s.codename} - ZIAA field station in ${s.location}, established ${s.establishedYear}. ${s.description}`,
        ogType: 'website',
        keywords: ['field station', 'sound observatory', s.location, 'ZIAA'],
        jsonLd: placeSchema({
          path,
          name: s.name,
          alternateName: s.codename,
          description: s.description,
          address: s.location,
          latitude: geo?.latitude,
          longitude: geo?.longitude
        })
      };
    }
  }
}

export const RecordPage: React.FC<RecordPageProps> = ({ type, redirectTo }) => {
  const { id = '' } = useParams<{ id: string }>();
  const records = useCollection(LOADERS[type] as () => Promise<AnyRecord[]>);
  const [copied, setCopied] = useState(false);

  if (redirectTo) return <Navigate to={`${redirectTo}/${id.toLowerCase()}`} replace />;

  const idx = records.findIndex(r => r.id.toLowerCase() === id.toLowerCase());
  const rec = records[idx];
  if (!rec) return <Navigate to="/404" replace />;

  const canonical = recordPath(type, rec.id);
  // Enforce lowercase canonical URLs.
  if (id !== rec.id.toLowerCase()) return <Navigate to={canonical} replace />;

  const meta = buildMeta(type, rec, canonical);
  const crumbs: Crumb[] = [
    { name: 'ZIAA', path: '/' },
    { name: SECTION_NAMES[type], path: RECORD_BASE[type] },
    { name: rec.id, path: canonical }
  ];
  const prev = records[idx - 1];
  const next = records[idx + 1];

  const copyCitation = () => {
    const citation = `${ENTITY.name}. (2026). Archival Record ${rec.id}: ${meta.heading}. ${ENTITY.abbreviation} Research Archive, ${ENTITY.legalParent}. ${SITE_URL}${canonical}`;
    navigator.clipboard?.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="font-serif text-zinc-300 space-y-5">
      <Seo
        title={meta.title}
        titleId={meta.titleId}
        description={meta.description}
        path={canonical}
        type={meta.ogType}
        publishedTime={meta.published}
        keywords={meta.keywords}
        citation={meta.citation}
        jsonLd={[breadcrumbSchema(crumbs), meta.jsonLd]}
      />

      <header className="bg-[#060910] border border-[#2b3e58] rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#03060a] border-b border-[#1b2636] space-y-3">
          <Breadcrumbs crumbs={crumbs} />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <InstitutionalCrest size={34} variant="gold" decorative />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-[#c5a059] uppercase tracking-widest flex items-center gap-1.5">
                  <span>{ENTITY.abbreviation} ARCHIVE RECORD</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-400">{SECTION_NAMES[type].toUpperCase()}</span>
                </p>
                <div className="text-sm font-bold text-white tracking-wider flex flex-wrap items-center gap-2">
                  <span className="font-mono">{rec.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-[#0c1827] border border-[#223b5c] text-cyan-300 uppercase">{type}</span>
                  <span className="hidden sm:inline-block archival-stamp text-[8.5px] font-mono py-0.5">VERIFIED RECORD</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={copyCitation}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-[#dfb76c] rounded transition-colors"
                aria-live="polite"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{copied ? 'Citation copied' : 'Cite'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                aria-label="Print record (PDF)"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">{meta.heading}</h1>
        </div>
      </header>

      <div className="bg-[#060910] border border-[#2b3e58] rounded-xl p-6 text-xs shadow-xl modal-print">
        {type === 'prototype' && <PrototypeDossier p={rec as Prototype} />}
        {type === 'patent' && <PatentDossier p={rec as Patent} />}
        {type === 'log' && <LabLogDossier l={rec as LabLog} />}
        {type === 'failure' && <FailureDossier f={rec as FailedIncident} />}
        {type === 'personnel' && <PersonnelDossier p={rec as Personnel} />}
        {type === 'site' && <FieldSiteDossier s={rec as FieldSite} />}
      </div>

      <nav aria-label="Adjacent records" className="flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono no-print">
        {prev ? (
          <Link to={recordPath(type, prev.id)} className="flex items-center gap-1.5 text-zinc-300 hover:text-[#dfb76c]">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Previous: {prev.id}
          </Link>
        ) : <span />}
        <Link to={RECORD_BASE[type]} className="text-[#dfb76c] hover:underline">All {SECTION_NAMES[type]}</Link>
        {next ? (
          <Link to={recordPath(type, next.id)} className="flex items-center gap-1.5 text-zinc-300 hover:text-[#dfb76c]">
            Next: {next.id} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        ) : <span />}
      </nav>

      <footer className="px-5 py-2.5 bg-[#040608] border border-emerald-950/80 rounded-lg text-[10px] text-zinc-400 flex flex-col sm:flex-row justify-between gap-1 font-mono">
        <span>RESEARCH &amp; PROTOTYPE ARCHIVE // {ENTITY.name.toUpperCase()}</span>
        <span>Canonical: {SITE_URL}{canonical}</span>
      </footer>
    </article>
  );
};

export default RecordPage;
