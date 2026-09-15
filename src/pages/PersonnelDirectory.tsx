import React from 'react';
import { Link } from 'react-router-dom';
import { loadPersonnel, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, collectionDatasetSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { Fingerprint, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Fellows & Inventors', path: '/fellows' }
];

export const PersonnelDirectory: React.FC = () => {
  const personnel = useCollection(loadPersonnel);
  const description = `${archiveStats.totalPersonnel} fellows, creative technologists, DSP architects, acoustic engineers, instrument builders and speculative designers directing research at the Zazie Institute of Applied Anomalies (ZIAA).`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Fellows, Technologists & Speculative Inventors (${archiveStats.totalPersonnel} Profiles)`}
        description={description}
        path="/fellows"
        keywords={['creative technologists', 'sound artists', 'acoustic engineers', 'research fellows', 'ZIAA fellows']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Fellows & Inventors Directory',
            description,
            path: '/fellows',
            about: ['interdisciplinary research', 'computational creativity'],
            items: personnel.map(p => ({ name: `${p.name} — ${p.title}`, path: recordPath('personnel', p.id) }))
          }),
          collectionDatasetSchema({
            path: '/fellows',
            name: 'ZIAA fellows and inventors',
            description,
            count: personnel.length,
            variables: ['Name and role', 'Specialisation', 'Clearance tier', 'Facility assignment', 'Selected publications']
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="INTERDISCIPLINARY FELLOWS & INVENTORS"
        kicker="CREATIVE TECHNOLOGISTS & RESEARCHERS"
        title={<>Fellows, Technologists &amp; Speculative Inventors ({personnel.length} Profiles)</>}
        lede="Creative technologists, DSP software architects, acoustic engineers, instrument builders and speculative designers directing research initiatives at the Zazie Institute of Applied Anomalies."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
            Total Fellows: <strong className="text-[#dfb76c]">{personnel.length} Core Researchers</strong>
          </p>
        }
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Fellows">
        {personnel.map(p => (
          <li key={p.id}>
            <Link
              to={recordPath('personnel', p.id)}
              className="h-full bg-[#05080f] border border-[#1c2a3b] hover:border-[#dfb76c]/80 p-5 rounded-xl transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h2 className="text-white font-bold text-base group-hover:text-[#dfb76c] transition-colors">{p.name}</h2>
                    <p className="text-[#dfb76c] text-xs font-medium mt-0.5">{p.title}</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0b1522] text-cyan-300 border border-cyan-800">{p.clearance}</span>
                </div>
                <p className="text-xs text-zinc-400 mb-2 font-mono">
                  SPECIALIZATION: <span className="text-cyan-400 font-medium">{p.specialization}</span>
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">{p.biography}</p>
                <dl className="space-y-1 text-xs font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-2">
                  <div><dt className="inline">FACILITY: </dt><dd className="inline text-zinc-200">{p.facilityAssignment}</dd></div>
                  <div><dt className="inline">PROJECTS: </dt><dd className="inline text-emerald-400 font-bold">{p.activePrototypesCount} Active Prototypes</dd></div>
                </dl>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-[#172333] text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-300">
                  <Fingerprint className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>VOICEPRINT VERIFIED</span>
                </span>
                <span className="group-hover:text-[#dfb76c] flex items-center gap-1">
                  <span>VIEW PROFILE</span>
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

export default PersonnelDirectory;
