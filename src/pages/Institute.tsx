import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { ENTITY, absoluteUrl } from '../seo/site';
import { breadcrumbSchema, organizationSchema } from '../seo/schema';
import { INSTITUTE_PAGE, IDS, institutionalGraph } from '../seo/graph';
import { departments, programs, grants, courses, termSet, institute, recordPath } from '../data/archive';
import type { Department } from '../data/types';
import { PageHeader } from '../components/PageHeader';
import { Building2, FlaskConical, Landmark, GraduationCap, Radio, BookMarked, Database } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'The Institute', path: INSTITUTE_PAGE }
];

const divisions = departments.filter(d => d.kind === 'division');
const departmentList = departments.filter(d => d.kind === 'department');
const byId = new Map(departments.map(d => [d.id, d]));
/** Anchor text should read as a person's name, not as an internal record id. */
const nameOf = (id: string) => institute.personnelNames[id] ?? id;

const STATUS_TONE: Record<string, string> = {
  ACTIVE: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70',
  COMPLETED: 'bg-[#0f1725] text-zinc-300 border-[#2b3e58]',
  WINDING_DOWN: 'bg-[#1a1508] text-amber-300 border-amber-800/70',
  SUSPENDED: 'bg-red-950/60 text-red-300 border-red-800/70',
  CLOSED_REPORTED: 'bg-[#0f1725] text-zinc-300 border-[#2b3e58]'
};

const DepartmentCard: React.FC<{ d: Department }> = ({ d }) => {
  const works = institute.departmentWorks[d.id];
  return (
    <li id={`department-${d.slug}`} className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
        <h3 className="text-zinc-100 font-bold text-base">{d.name}</h3>
        <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0c1827] border border-[#223b5c] text-cyan-300">
          {d.code}
        </span>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{d.mission}</p>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-mono mb-3">
        <div className="bg-[#020509] border border-[#16233a] rounded px-2 py-1.5">
          <dt className="text-zinc-500 uppercase tracking-wider text-[8.5px]">Prototypes</dt>
          <dd className="text-[#dfb76c] font-bold">{works?.prototypeCount ?? 0}</dd>
        </div>
        <div className="bg-[#020509] border border-[#16233a] rounded px-2 py-1.5">
          <dt className="text-zinc-500 uppercase tracking-wider text-[8.5px]">Patents</dt>
          <dd className="text-cyan-300 font-bold">{works?.patentCount ?? 0}</dd>
        </div>
        <div className="bg-[#020509] border border-[#16233a] rounded px-2 py-1.5">
          <dt className="text-zinc-500 uppercase tracking-wider text-[8.5px]">Research notes</dt>
          <dd className="text-emerald-300 font-bold">{works?.logCount ?? 0}</dd>
        </div>
        <div className="bg-[#020509] border border-[#16233a] rounded px-2 py-1.5">
          <dt className="text-zinc-500 uppercase tracking-wider text-[8.5px]">Fellows</dt>
          <dd className="text-violet-300 font-bold">{works?.fellowIds.length ?? 0}</dd>
        </div>
      </dl>
      <p className="text-[10.5px] font-mono text-zinc-400">
        Head:{' '}
        <Link to={recordPath('personnel', d.headId)} className="text-[#dfb76c] hover:underline">
          {nameOf(d.headId)}
        </Link>
        <span className="text-zinc-600"> · </span>
        Home: <span className="text-zinc-300">{d.homeFacility}</span>
      </p>
      <ul className="flex flex-wrap gap-1.5 mt-3" aria-label={`${d.name} focus areas`}>
        {d.focusAreas.map(f => (
          <li key={f} className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#0a1119] border border-[#1e2f47] text-zinc-400">
            {f}
          </li>
        ))}
      </ul>
    </li>
  );
};

export const Institute: React.FC = () => {
  const description = `Institutional structure of the ${ENTITY.name} (ZIAA): ${institute.counts.divisions} research divisions, ${institute.counts.departments} departments, ${institute.counts.programs} research programmes, ${institute.counts.grants} internal funding allocations, ${institute.counts.courses} internal seminars and ${institute.counts.facilities} research facilities.`;

  return (
    <div className="space-y-8 font-serif pb-16">
      <Seo
        title="The Institute: Divisions, Programmes & Funding"
        description={description}
        path={INSTITUTE_PAGE}
        keywords={[
          'ZIAA departments',
          'research divisions',
          'applied anomalies research',
          'experimental audio research institute',
          'research programmes',
          ...ENTITY.fields.slice(0, 4)
        ]}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          organizationSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': IDS.institutePage,
            url: IDS.institutePage,
            name: `The ${ENTITY.name} — Institutional Structure`,
            description,
            isPartOf: { '@id': IDS.website },
            publisher: { '@id': IDS.organization },
            about: { '@id': IDS.organization },
            mainEntity: { '@id': IDS.organization }
          },
          ...institutionalGraph()
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="INSTITUTIONAL STRUCTURE"
        kicker="DIVISIONS · DEPARTMENTS · PROGRAMMES · FUNDING · FACILITIES"
        title={`The ${ENTITY.name}`}
        lede={`How the Institute is organised: ${institute.counts.divisions} research divisions containing ${institute.counts.departments} departments, ${institute.counts.programs} research programmes, ${institute.counts.grants} internal funding allocations, ${institute.counts.courses} internal seminars, ${institute.counts.facilities} research facilities and a ${termSet.terms.length}-term controlled vocabulary indexing the whole archive.`}
        aside={
          <p className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2 border border-[#1b2636] rounded-md shrink-0">
            Registry cycle:{' '}
            <strong className="text-[#dfb76c] font-bold">
              {ENTITY.founded}–2026
            </strong>
          </p>
        }
      />

      {/* ---------------- Divisions ---------------- */}
      <section aria-labelledby="divisions-heading" className="space-y-3">
        <h2 id="divisions-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
          Research Divisions
        </h2>
        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-4" aria-label="Research divisions">
          {divisions.map(dv => (
            <li key={dv.id} id={`division-${dv.slug}`} className="bg-[#060a12] border border-[#213045] p-5 rounded-xl scroll-mt-24">
              <span className="text-[9.5px] font-mono text-zinc-500">{dv.code}</span>
              <h3 className="text-zinc-100 font-bold text-base mt-1 mb-2">{dv.name}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{dv.mission}</p>
              <p className="text-[10.5px] font-mono text-zinc-400 mb-2">
                Home: <span className="text-zinc-300">{dv.homeFacility}</span>
              </p>
              <ul className="space-y-1" aria-label="Departments in this division">
                {(dv.departmentIds ?? []).map(id => {
                  const sub = byId.get(id);
                  return sub ? (
                    <li key={id}>
                      <a href={`#department-${sub.slug}`} className="text-[11px] text-[#dfb76c] hover:underline">
                        {sub.name}
                      </a>
                    </li>
                  ) : null;
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Departments ---------------- */}
      <section aria-labelledby="departments-heading" className="space-y-3">
        <h2 id="departments-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          Departments ({departmentList.length})
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Departments">
          {departmentList.map(d => (
            <DepartmentCard key={d.id} d={d} />
          ))}
        </ul>
      </section>

      {/* ---------------- Programmes ---------------- */}
      <section aria-labelledby="programs-heading" className="space-y-3">
        <h2 id="programs-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          Research Programmes ({programs.length})
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Research programmes">
          {programs.map(p => {
            const dept = byId.get(p.departmentId);
            const funding = grants.filter(g => g.programIds.includes(p.id));
            return (
              <li key={p.id} id={`program-${p.id.toLowerCase()}`} className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="text-zinc-100 font-bold text-sm leading-snug">{p.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono border ${STATUS_TONE[p.status]}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{p.description}</p>
                <dl className="text-[10.5px] font-mono text-zinc-400 space-y-1">
                  <div>
                    <dt className="inline text-zinc-500">Code: </dt>
                    <dd className="inline text-zinc-300">{p.code}</dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Department: </dt>
                    <dd className="inline">
                      {dept ? (
                        <a href={`#department-${dept.slug}`} className="text-[#dfb76c] hover:underline">
                          {dept.name}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Principal investigator: </dt>
                    <dd className="inline">
                      <Link to={recordPath('personnel', p.principalInvestigatorId)} className="text-[#dfb76c] hover:underline">
                        {nameOf(p.principalInvestigatorId)}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Dates: </dt>
                    <dd className="inline text-zinc-300">
                      {p.startDate} → {p.endDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Funding: </dt>
                    <dd className="inline">
                      {funding.length === 0 ? (
                        <span className="text-zinc-500">internally funded</span>
                      ) : (
                        funding.map((g, i) => (
                          <React.Fragment key={g.id}>
                            {i > 0 && ', '}
                            <a href={`#grant-${g.id.toLowerCase()}`} className="text-emerald-300 hover:underline">
                              {g.code}
                            </a>
                          </React.Fragment>
                        ))
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- Funding ---------------- */}
      <section aria-labelledby="grants-heading" className="space-y-3">
        <h2 id="grants-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-300" aria-hidden="true" />
          Internal Funding Allocations ({grants.length})
        </h2>
        <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
          All allocations are internal to the Institute or to its legal parent, {ENTITY.legalParent}. The Institute
          asserts no external or governmental funding relationship.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Funding allocations">
          {grants.map(g => (
            <li key={g.id} id={`grant-${g.id.toLowerCase()}`} className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <h3 className="text-zinc-100 font-bold text-sm leading-snug">{g.name}</h3>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono border ${STATUS_TONE[g.status]}`}>
                  {g.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{g.description}</p>
              <dl className="text-[10.5px] font-mono text-zinc-400 space-y-1">
                <div>
                  <dt className="inline text-zinc-500">Code: </dt>
                  <dd className="inline text-zinc-300">{g.code}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">Amount: </dt>
                  <dd className="inline text-[#dfb76c] font-bold">
                    {g.amount.toLocaleString('en-US')} {g.currency}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">Funder: </dt>
                  <dd className="inline text-zinc-300">{g.funderName}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">Period: </dt>
                  <dd className="inline text-zinc-300">
                    {g.periodStart} → {g.periodEnd}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">Funds: </dt>
                  <dd className="inline">
                    {g.programIds.map((id, i) => (
                      <React.Fragment key={id}>
                        {i > 0 && ', '}
                        <a href={`#program-${id.toLowerCase()}`} className="text-emerald-300 hover:underline">
                          {id}
                        </a>
                      </React.Fragment>
                    ))}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Seminars ---------------- */}
      <section aria-labelledby="courses-heading" className="space-y-3">
        <h2 id="courses-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-violet-300" aria-hidden="true" />
          Internal Seminars ({courses.length})
        </h2>
        <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
          Non-accredited internal training delivered to fellows. The Institute is not an accredited awarding body and
          confers no qualifications; see the{' '}
          <Link to="/legal/institutional-status" className="text-[#dfb76c] hover:underline">
            institutional status disclosure
          </Link>
          .
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Internal seminars">
          {courses.map(c => {
            const dept = byId.get(c.departmentId);
            return (
              <li key={c.id} id={`course-${c.id.toLowerCase()}`} className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="text-zinc-100 font-bold text-sm leading-snug">{c.title}</h3>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#0c1827] border border-[#223b5c] text-cyan-300">
                    {c.courseCode}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{c.description}</p>
                <dl className="text-[10.5px] font-mono text-zinc-400 space-y-1">
                  <div>
                    <dt className="inline text-zinc-500">Level: </dt>
                    <dd className="inline text-zinc-300">{c.educationalLevel}</dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Department: </dt>
                    <dd className="inline">
                      {dept ? (
                        <a href={`#department-${dept.slug}`} className="text-[#dfb76c] hover:underline">
                          {dept.name}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Instructor: </dt>
                    <dd className="inline">
                      <Link to={recordPath('personnel', c.instructorId)} className="text-[#dfb76c] hover:underline">
                        {nameOf(c.instructorId)}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Delivery: </dt>
                    <dd className="inline text-zinc-300">
                      {c.instances.map((i, n) => (
                        <span key={n} id={`course-${c.id.toLowerCase()}-i${n + 1}`} className="scroll-mt-24">
                          {n > 0 && ' · '}
                          {i.courseMode}, {i.startDate}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
                <ul className="flex flex-wrap gap-1.5 mt-3" aria-label={`${c.title} syllabus`}>
                  {c.syllabusSections.map(s => (
                    <li key={s.name} className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#0a1119] border border-[#1e2f47] text-zinc-400">
                      {s.name}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- Facilities ---------------- */}
      <section aria-labelledby="facilities-heading" className="space-y-3">
        <h2 id="facilities-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" aria-hidden="true" />
          Research Facilities ({institute.facilities.length})
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Research facilities">
          {institute.facilities.map(f => {
            const meta = institute.facilityWorks[f.slug];
            return (
              <li key={f.slug} id={`facility-${f.slug}`} className="bg-[#05080f] border border-[#1c2a3b] p-4 rounded-xl scroll-mt-24">
                <h3 className="text-zinc-100 font-bold text-xs leading-snug mb-2">{f.name}</h3>
                <dl className="text-[10px] font-mono text-zinc-400 space-y-0.5">
                  <div>
                    <dt className="inline text-zinc-500">Notes: </dt>
                    <dd className="inline text-emerald-300">{meta?.logCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="inline text-zinc-500">Fellows: </dt>
                    <dd className="inline text-violet-300">{meta?.fellowIds.length ?? 0}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- Vocabulary ---------------- */}
      <section aria-labelledby="vocabulary-heading" className="space-y-3">
        <h2 id="vocabulary-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          Controlled Research Vocabulary
        </h2>
        <div id="vocabulary" className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
          <h3 className="text-zinc-100 font-bold text-sm mb-2">{termSet.name}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">{termSet.description}</p>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {termSet.terms.map(t => {
              const dept = byId.get(t.departmentId);
              return (
                <div key={t.termCode} id={`term-${t.termCode.toLowerCase()}`} className="scroll-mt-24">
                  <dt className="text-[11px] font-mono text-[#dfb76c]">
                    {t.termCode} — {t.name}
                  </dt>
                  <dd className="text-[10.5px] text-zinc-400 leading-relaxed">
                    {t.description}
                    {dept && (
                      <>
                        {' '}
                        <a href={`#department-${dept.slug}`} className="text-zinc-500 hover:text-zinc-300 underline">
                          {dept.alternateName}
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ---------------- Catalogue ---------------- */}
      <section aria-labelledby="catalogue-heading" className="space-y-3">
        <h2 id="catalogue-heading" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          Archive Catalogue
        </h2>
        <div id="catalog" className="bg-[#05080f] border border-[#1c2a3b] p-5 rounded-xl scroll-mt-24">
          <p id="dataset-archive" className="text-xs text-zinc-400 leading-relaxed mb-3">
            The archive is published as static, fully prerendered HTML with machine-readable structured data on every
            page. Two machine-readable distributions ship alongside it: the research-notes feed and the canonical URL
            index.
          </p>
          <ul className="text-[11px] font-mono space-y-1">
            <li>
              <a href={absoluteUrl('/feed.xml')} className="text-emerald-300 hover:underline">
                /feed.xml
              </a>{' '}
              <span className="text-zinc-500">— RSS, newest 50 research notes</span>
            </li>
            <li>
              <a href={absoluteUrl('/sitemap.xml')} className="text-emerald-300 hover:underline">
                /sitemap.xml
              </a>{' '}
              <span className="text-zinc-500">— canonical URL index</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Institute;
