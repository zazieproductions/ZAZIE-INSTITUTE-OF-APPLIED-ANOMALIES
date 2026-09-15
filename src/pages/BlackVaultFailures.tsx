import React from 'react';
import { Link } from 'react-router-dom';
import { loadFailures, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, collectionDatasetSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Anomaly Post-Mortems', path: '/post-mortems' }
];

export const BlackVaultFailures: React.FC = () => {
  const failures = useCollection(loadFailures);
  const description = `${archiveStats.totalFailures} anomaly post-mortems from the Zazie Institute of Applied Anomalies: case studies of prototype feedback cascades, mechanical fatigue, algorithmic drift and acoustic boundary failures, with root-cause analysis and containment protocols.`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Anomaly Post-Mortems & Failure Case Studies (${archiveStats.totalFailures} Records)`}
        description={description}
        path="/post-mortems"
        keywords={['failure analysis', 'post-mortem', 'acoustic feedback', 'experimental systems', 'root cause analysis']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Anomaly Post-Mortems',
            description,
            path: '/post-mortems',
            about: ['experimental technology', 'speculative engineering'],
            items: failures.map(f => ({ name: `${f.id}: ${f.projectTitle}`, path: recordPath('failure', f.id) }))
          }),
          collectionDatasetSchema({
            path: '/post-mortems',
            name: 'ZIAA anomaly post-mortems',
            description,
            count: failures.length,
            variables: ['Incident identifier and date', 'Project code and title', 'Hazard classification', 'Root-cause analysis', 'Containment protocol and decommission status']
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="ANOMALY POST-MORTEMS"
        kicker="SPECULATIVE ENGINEERING FAILURE ARCHIVE"
        tone="red"
        title={<>Experimental Anomalies &amp; System Post-Mortems ({failures.length} Records)</>}
        lede="Detailed case studies of prototype feedback cascades, mechanical fatigue, algorithmic drift and physical acoustic boundaries encountered during ZIAA experimental testing — each with incident narrative, root-cause analysis, containment protocol and salvaged hardware."
        aside={
          <p className="text-right text-xs font-mono text-red-300 bg-[#140505] px-3.5 py-2 border border-red-900/60 rounded-md shrink-0">
            <strong className="font-bold">{failures.length}</strong> Documented Post-Mortems
          </p>
        }
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Post-mortem records">
        {failures.map(f => (
          <li key={f.id}>
            <Link
              to={recordPath('failure', f.id)}
              className="h-full bg-[#070303] border border-red-950 hover:border-red-600/80 p-5 rounded-xl transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-red-400 font-mono font-bold text-xs tracking-wider">{f.id} // {f.projectCode}</span>
                    <h2 className="text-zinc-100 font-bold text-base mt-1 group-hover:text-red-200">{f.projectTitle}</h2>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-red-950 text-red-300 border border-red-800">{f.hazardClassification}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mb-2">
                  DATE: <time dateTime={f.incidentDate} className="text-zinc-300">{f.incidentDate}</time> · LEAD INVESTIGATOR: <span className="text-zinc-200">{f.leadInvestigator}</span>
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">{f.summary}</p>
                <dl className="space-y-1 text-xs font-mono text-zinc-400 border-t border-red-950/60 pt-2.5 mb-2">
                  <div><dt className="inline">DECOMMISSION: </dt><dd className="inline text-red-400 font-bold">{f.decommissionStatus}</dd></div>
                  <div><dt className="inline">SALVAGED: </dt><dd className="inline text-zinc-300">{f.salvagedComponents.join(', ')}</dd></div>
                </dl>
              </div>
              <div className="pt-2.5 border-t border-red-950/60 flex items-center justify-between text-xs font-mono text-red-300">
                <span>ROOT CAUSE AUDITED</span>
                <span className="group-hover:underline flex items-center gap-1">
                  <span>VIEW POST-MORTEM</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlackVaultFailures;
