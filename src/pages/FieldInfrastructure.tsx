import React from 'react';
import { Link } from 'react-router-dom';
import { loadFieldSites, recordPath, archiveStats } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { SubterraneanArraySchematic } from '../components/TechnicalSchematics';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { MapPin, ArrowRight } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Field Stations', path: '/field-stations' }
];

export const FieldInfrastructure: React.FC = () => {
  const fieldSites = useCollection(loadFieldSites);
  const description = `${archiveStats.totalFieldSites} ZIAA field stations and sound observatories: desert acoustic sanctuaries, sub-glacial hydrophone arrays, subterranean reverberation vaults and coastal listening pavilions gathering acoustic and electromagnetic telemetry.`;

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title={`Field Stations & Sound Observatories (${archiveStats.totalFieldSites} Sites)`}
        description={description}
        path="/field-stations"
        keywords={['field recording', 'sound observatory', 'acoustic architecture', 'listening station', 'hydrophone array']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Field Stations & Sound Observatories',
            description,
            path: '/field-stations',
            about: ['sound technology', 'audio research'],
            items: fieldSites.map(s => ({ name: `${s.codename} — ${s.name}`, path: recordPath('site', s.id) }))
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="DISTRIBUTED FIELD STATIONS"
        kicker="REMOTE LISTENING POSTS & ACOUSTIC OBSERVATORIES"
        title={<>Distributed Field Stations &amp; Sound Observatories ({fieldSites.length} Stations)</>}
        lede="Remote desert acoustic sanctuaries, sub-glacial hydrophone arrays, subterranean reverberation vaults and coastal listening pavilions where ZIAA gathers environmental acoustic and electromagnetic telemetry for its research notes and prototypes."
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
            Network Status: <strong className="text-amber-400 font-bold">{fieldSites.length} Active Stations</strong>
          </p>
        }
      />

      <figure className="m-0">
        <SubterraneanArraySchematic codeName="FACILITY-7-SEISMIC" />
        <figcaption className="sr-only">Schematic of the FACILITY-7 subterranean seismic and acoustic sensor array.</figcaption>
      </figure>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Field stations">
        {fieldSites.map(s => (
          <li key={s.id}>
            <Link
              to={recordPath('site', s.id)}
              className="h-full bg-[#05080f] border border-[#1c2a3b] hover:border-amber-500/80 p-5 rounded-xl transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-amber-400 font-mono font-bold text-xs tracking-wider">{s.codename}</span>
                    <h2 className="text-zinc-100 font-bold text-base mt-1 group-hover:text-amber-200">{s.name}</h2>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#161208] text-amber-300 border border-amber-800">{s.activeStatus}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mb-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>{s.location}</span>
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-3">{s.description}</p>
                <dl className="space-y-1 text-xs font-mono text-zinc-400 border-t border-[#172333] pt-2.5 mb-2">
                  <div><dt className="inline">CHANNELS: </dt><dd className="inline text-emerald-400 font-bold">{s.channelCount} Transducers</dd></div>
                  <div><dt className="inline">BANDWIDTH: </dt><dd className="inline text-cyan-400">{s.frequencyRange}</dd></div>
                  <div><dt className="inline">FOOTPRINT: </dt><dd className="inline text-zinc-300">{s.physicalFootprint}</dd></div>
                </dl>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-[#172333] text-xs font-mono text-zinc-400">
                <span>COORD: {s.coordinates}</span>
                <span className="text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>VIEW STATION</span>
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

export default FieldInfrastructure;
