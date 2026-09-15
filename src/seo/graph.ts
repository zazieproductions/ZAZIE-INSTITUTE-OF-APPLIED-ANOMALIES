/**
 * Institutional entity graph — the @id registry and node builders.
 *
 * EVERY entity in the Institute's structured data gets one stable, absolute
 * @id here. Cross-page relationships are then expressed as `{ "@id": ... }`
 * pointers rather than nested duplicates, so a crawler that reads any single
 * page can resolve the whole institution:
 *
 *   Person ──memberOf──▶ Department ──parentOrganization──▶ Division ──▶ Organization
 *      │                     │
 *      ├──author──▶ TechArticle ◀──fundedItem── MonetaryGrant ◀──funding── ResearchProject
 *      └──instructor──▶ Course ──provider──▶ Organization
 *
 * Contract enforced by `npm run audit:seo`:
 *   1. every @id referenced anywhere in dist/ is declared on some page in dist/
 *      (no dangling pointers);
 *   2. every @type is a real schema.org type and every property a real
 *      schema.org property (validated against the schema-dts vocabulary).
 *
 * All spine nodes (divisions, departments, programmes, grants, courses, terms,
 * facilities) are DECLARED on /institute, which is why that page ships the
 * full graph while other pages only reference into it.
 */
import { ENTITY, SITE_URL, absoluteUrl } from './site';
import {
  departments,
  programs,
  grants,
  courses,
  termSet,
  institute,
  hasRecord,
  normaliseName,
  recordPath,
  monographPath
} from '../data/archive';
import type { RecordType } from '../data/archive';
import type { Department, Program, Grant, Course, DefinedTermEntry } from '../data/types';

export const INSTITUTE_PAGE = '/institute';

/* ============================ @id registry ============================ */

/** Fragment-anchored nodes all live on /institute so each has a real, crawlable URL. */
const spineId = (fragment: string) => `${SITE_URL}${INSTITUTE_PAGE}#${fragment}`;

export const IDS = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  parentCompany: `${SITE_URL}/legal/institutional-status#zazie-productions-llc`,
  institutePage: absoluteUrl(INSTITUTE_PAGE),
  vocabulary: spineId('vocabulary'),
  catalog: spineId('catalog'),
  archiveDataset: spineId('dataset-archive'),
  division: (slug: string) => spineId(`division-${slug}`),
  department: (slug: string) => spineId(`department-${slug}`),
  facility: (slug: string) => spineId(`facility-${slug}`),
  program: (id: string) => spineId(`program-${id.toLowerCase()}`),
  grant: (id: string) => spineId(`grant-${id.toLowerCase()}`),
  course: (id: string) => spineId(`course-${id.toLowerCase()}`),
  courseInstance: (id: string, n: number) => spineId(`course-${id.toLowerCase()}-i${n + 1}`),
  term: (termCode: string) => spineId(`term-${termCode.toLowerCase()}`),
  /** Collection hub nodes live on their own hub pages. */
  collection: (path: string) => `${absoluteUrl(path)}#collection`,
  dataset: (path: string) => `${absoluteUrl(path)}#dataset`
} as const;

/** Node ids that already exist on record pages (declared there, referenced from the spine). */
export const RECORD_IDS = {
  work: (path: string) => `${absoluteUrl(path)}#work`,
  person: (path: string) => `${absoluteUrl(path)}#person`,
  place: (path: string) => `${absoluteUrl(path)}#place`,
  app: (path: string) => `${absoluteUrl(path)}#app`,
  prototype: (id: string) => RECORD_IDS.work(recordPath('prototype', id)),
  patent: (id: string) => RECORD_IDS.work(recordPath('patent', id)),
  log: (id: string) => RECORD_IDS.work(recordPath('log', id)),
  failure: (id: string) => RECORD_IDS.work(recordPath('failure', id)),
  monograph: (id: string) => RECORD_IDS.work(monographPath(id)),
  fellow: (id: string) => RECORD_IDS.person(recordPath('personnel', id)),
  site: (id: string) => RECORD_IDS.place(recordPath('site', id))
} as const;

/* ============================ resolvers ============================ */

const deptById = new Map(departments.map(d => [d.id, d]));
export const getDepartment = (id: string) => deptById.get(id);

/** Discipline string (as used on prototypes/patents) → department @id. */
export const departmentIdForDiscipline = (discipline: string): string | undefined => {
  const deptId = institute.disciplineDept[discipline];
  return deptId ? IDS.department(deptById.get(deptId)!.slug) : undefined;
};

/** Personnel name (any apostrophe style) → that person's @id. */
export const personIdForName = (name: string): string | undefined => {
  const id = institute.personnelByName[normaliseName(name)];
  return id ? RECORD_IDS.fellow(id) : undefined;
};

/** Facility string (as used on logs/prototypes/personnel) → Place @id. */
export const facilityIdForName = (facility: string): string | undefined => {
  const hit = institute.facilities.find(f => f.name === facility);
  return hit ? IDS.facility(hit.slug) : undefined;
};

const slugOfFacility = (facility: string) => institute.facilities.find(f => f.name === facility)?.slug;

/**
 * Departments a fellow belongs to, from explicit membership data.
 * Returns at most one department by construction (enforced at build time).
 */
export const departmentsForFellow = (fellowId: string): Department[] =>
  departments.filter(d => d.kind === 'department' && (d.fellowIds ?? []).includes(fellowId));

/* ============================ node builders ============================ */

const ref = (id: string) => ({ '@id': id });
const refs = (ids: (string | undefined)[]) =>
  ids.filter((x): x is string => Boolean(x)).map(ref);

/**
 * Reference a record only if a record page actually exists for it.
 *
 * The source collections contain cross-references to records that were never
 * created (e.g. prototypes citing patent numbers outside the 100 published
 * dossiers). RecordDossier.tsx already guards the visible UI with `hasRecord`;
 * structured data must describe the same reality the page renders, or the
 * graph would point at URLs that 404. Unresolved references are counted and
 * reported by scripts/build-derived.mjs rather than dropped silently.
 */
const recordRefs = (type: RecordType, ids: string[]) =>
  ids.filter(id => hasRecord(type, id)).map(id => ref(RECORD_IDS.work(recordPath(type, id))));

export const departmentNode = (d: Department) => {
  const isDivision = d.kind === 'division';
  const works = d.kind === 'department' ? institute.departmentWorks[d.id] : undefined;
  const subDepartments = (d.departmentIds ?? [])
    .map(id => deptById.get(id))
    .filter((x): x is Department => Boolean(x));
  const homeFacility = facilityIdForName(d.homeFacility);

  return {
    '@type': 'Organization',
    '@id': isDivision ? IDS.division(d.slug) : IDS.department(d.slug),
    name: d.name,
    alternateName: d.alternateName,
    url: absoluteUrl(`${INSTITUTE_PAGE}#${isDivision ? 'division' : 'department'}-${d.slug}`),
    description: d.mission,
    identifier: { '@type': 'PropertyValue', propertyID: 'ZIAA organizational code', value: d.code },
    foundingDate: String(d.establishedYear),
    parentOrganization: isDivision
      ? ref(IDS.organization)
      : ref(IDS.division(deptById.get(d.divisionId!)!.slug)),
    subOrganization: isDivision ? subDepartments.map(s => ref(IDS.department(s.slug))) : undefined,
    knowsAbout: d.focusAreas,
    location: homeFacility ? ref(homeFacility) : undefined,
    member: refs((works?.fellowIds ?? []).map(id => RECORD_IDS.fellow(id))),
    makesOffer: isDivision
      ? undefined
      : refs(courses.filter(c => c.departmentId === d.id).map(c => IDS.course(c.id))),
    isPartOf: ref(IDS.organization)
  };
};

export const facilityNode = (slug: string) => {
  const meta = institute.facilityWorks[slug];
  if (!meta) return undefined;
  return {
    '@type': 'Place',
    '@id': IDS.facility(slug),
    name: meta.name,
    url: absoluteUrl(`${INSTITUTE_PAGE}#facility-${slug}`),
    containedInPlace: ref(IDS.organization),
    containsPlace: undefined,
    publicAccess: false,
    maintainer: ref(IDS.organization),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Research notes recorded here', value: meta.logCount },
      { '@type': 'PropertyValue', name: 'Prototypes deployed here', value: meta.prototypes.length }
    ],
    subjectOf: refs(meta.prototypes.map(id => RECORD_IDS.prototype(id)))
  };
};

export const programNode = (p: Program) => {
  const dept = deptById.get(p.departmentId);
  const funding = grants.filter(g => g.programIds.includes(p.id));
  return {
    '@type': 'ResearchProject',
    '@id': IDS.program(p.id),
    url: absoluteUrl(`${INSTITUTE_PAGE}#program-${p.id.toLowerCase()}`),
    name: p.title,
    alternateName: p.code,
    description: p.description,
    identifier: { '@type': 'PropertyValue', propertyID: 'ZIAA programme code', value: p.code },
    startDate: p.startDate,
    endDate: p.endDate,
    knowsAbout: p.keywords,
    parentOrganization: ref(dept ? IDS.department(dept.slug) : IDS.organization),
    funder: refs(funding.map(g => IDS.grant(g.id))),
    funding: refs(funding.map(g => IDS.grant(g.id))),
    member: [ref(RECORD_IDS.fellow(p.principalInvestigatorId)), ...p.coInvestigatorIds.map(id => ref(RECORD_IDS.fellow(id)))],
    about: refs(
      dept ? [IDS.collection('/prototypes'), IDS.collection('/patents'), IDS.collection('/research-notes')] : []
    )
  };
};

/**
 * Modelled as schema.org MonetaryGrant.
 * `ResearchGrant` is not a schema.org type (it 404s); MonetaryGrant is the
 * correct node and `additionalType` carries the finer distinction.
 */
export const grantNode = (g: Grant) => ({
  '@type': 'MonetaryGrant',
  '@id': IDS.grant(g.id),
  url: absoluteUrl(`${INSTITUTE_PAGE}#grant-${g.id.toLowerCase()}`),
  name: g.name,
  description: g.description,
  identifier: { '@type': 'PropertyValue', propertyID: 'ZIAA grant code', value: g.code },
  amount: { '@type': 'MonetaryAmount', currency: g.currency, value: g.amount },
  startDate: g.periodStart,
  endDate: g.periodEnd,
  // The parent company is declared once, on /legal/institutional-status; everything
  // else is an internal fund described inline (no @id, so no duplicate declaration).
  funder:
    g.funderKind === 'parent'
      ? ref(IDS.parentCompany)
      : { '@type': 'FundingScheme', name: g.funderName, description: g.description },
  fundedItem: refs(g.programIds.map(id => IDS.program(id)))
});

export const courseNode = (c: Course) => {
  const dept = deptById.get(c.departmentId);
  return {
    '@type': 'Course',
    '@id': IDS.course(c.id),
    url: absoluteUrl(`${INSTITUTE_PAGE}#course-${c.id.toLowerCase()}`),
    name: c.title,
    courseCode: c.courseCode,
    description: c.description,
    inLanguage: 'en',
    educationalLevel: c.educationalLevel,
    occupationalCategory: c.occupationalCategory,
    timeRequired: c.timeRequired,
    provider: ref(IDS.organization),
    sourceOrganization: ref(IDS.organization),
    about: dept ? ref(IDS.department(dept.slug)) : undefined,
    coursePrerequisites: c.prerequisites,
    teaches: c.teaches,
    assesses: c.assesses,
    syllabusSections: {
      '@type': 'Syllabus',
      hasPart: c.syllabusSections.map(s => ({
        '@type': 'Chapter',
        name: s.name,
        description: s.description
      }))
    },
    hasCourseInstance: c.instances.map((inst, i) => ({
      '@type': 'CourseInstance',
      '@id': IDS.courseInstance(c.id, i),
      name: `${c.title} — ${inst.courseMode} cohort`,
      courseMode: inst.courseMode,
      startDate: inst.startDate,
      endDate: inst.endDate,
      courseWorkload: inst.workload,
      instructor: ref(RECORD_IDS.fellow(c.instructorId)),
      location: inst.facility
        ? ref(facilityIdForName(inst.facility) ?? IDS.organization)
        : { '@type': 'VirtualLocation', name: 'Delivered remotely', url: absoluteUrl(`${INSTITUTE_PAGE}#course-${c.id.toLowerCase()}`) },
      offers: { '@type': 'Offer', category: 'Free', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      organizer: dept ? ref(IDS.department(dept.slug)) : undefined
    }))
  };
};

export const termNode = (t: DefinedTermEntry) => {
  const dept = deptById.get(t.departmentId);
  return {
    '@type': 'DefinedTerm',
    '@id': IDS.term(t.termCode),
    termCode: t.termCode,
    name: t.name,
    description: t.description,
    url: absoluteUrl(`${INSTITUTE_PAGE}#term-${t.termCode.toLowerCase()}`),
    inDefinedTermSet: ref(IDS.vocabulary),
    about: dept ? ref(IDS.department(dept.slug)) : undefined
  };
};

export const vocabularyNode = () => ({
  '@type': 'DefinedTermSet',
  '@id': IDS.vocabulary,
  name: termSet.name,
  alternateName: termSet.alternateName,
  description: termSet.description,
  url: absoluteUrl(`${INSTITUTE_PAGE}#vocabulary`),
  inLanguage: termSet.inLanguage,
  identifier: { '@type': 'PropertyValue', propertyID: 'ZIAA vocabulary code', value: termSet.code },
  publisher: ref(IDS.organization),
  hasDefinedTerm: termSet.terms.map(termNode)
});

/** The archive as a machine-readable Dataset. Distribution points at files that actually ship. */
export const archiveDatasetNode = () => ({
  '@type': 'Dataset',
  '@id': IDS.archiveDataset,
  name: `${ENTITY.name} — research archive`,
  description: `${ENTITY.shortDescription} Machine-readable records for ${institute.counts.facilities} facilities, ${institute.counts.departments} departments, ${institute.counts.programs} research programmes and the full prototype, patent, research-note and monograph holdings.`,
  url: absoluteUrl('/'),
  inLanguage: 'en',
  creator: ref(IDS.organization),
  publisher: ref(IDS.organization),
  maintainer: ref(IDS.organization),
  includedInDataCatalog: ref(IDS.catalog),
  variableMeasured: [
    'Prototype specification and status',
    'Speculative patent claims and prior art',
    'Research-note narrative and environmental telemetry',
    'Anomaly post-mortem root-cause analysis',
    'Fellow specialisation and clearance tier'
  ],
  measurementTechnique: 'Direct transcription from the Institute revision ledger, verified against record checksums',
  spatialCoverage: { '@type': 'Place', name: 'ZIAA studios and remote field stations', containedInPlace: ref(IDS.organization) },
  temporalCoverage: `${ENTITY.founded}/2026`,
  license: absoluteUrl('/legal/terms'),
  distribution: [
    {
      '@type': 'DataDownload',
      encodingFormat: 'application/rss+xml',
      contentUrl: absoluteUrl('/feed.xml'),
      name: 'Research notes feed (newest 50)'
    },
    {
      '@type': 'DataDownload',
      encodingFormat: 'application/xml',
      contentUrl: absoluteUrl('/sitemap.xml'),
      name: 'Canonical URL index'
    }
  ]
});

export const catalogNode = () => ({
  '@type': 'DataCatalog',
  '@id': IDS.catalog,
  name: `${ENTITY.abbreviation} Archive Catalogue`,
  description: 'Index of the Institute\u2019s published research collections and their machine-readable descriptions.',
  url: absoluteUrl(INSTITUTE_PAGE),
  publisher: ref(IDS.organization),
  dataset: [
    ref(IDS.archiveDataset),
    ref(IDS.dataset('/prototypes')),
    ref(IDS.dataset('/patents')),
    ref(IDS.dataset('/research-notes')),
    ref(IDS.dataset('/monographs')),
    ref(IDS.dataset('/fellows')),
    ref(IDS.dataset('/field-stations')),
    ref(IDS.dataset('/post-mortems'))
  ]
});

/* ============================ graphs ============================ */

/**
 * The complete institutional spine. Declared in full on /institute so that
 * every @id referenced from any other page resolves somewhere in the crawl.
 */
export function institutionalGraph(): Record<string, unknown>[] {
  const nodes: (Record<string, unknown> | undefined)[] = [
    ...departments.map(departmentNode),
    ...institute.facilities.map(f => facilityNode(f.slug)),
    ...programs.map(programNode),
    ...grants.map(grantNode),
    ...courses.map(courseNode),
    vocabularyNode(),
    catalogNode(),
    archiveDatasetNode()
  ];
  return nodes.filter((x): x is Record<string, unknown> => Boolean(x));
}

/**
 * Lightweight spine for the home page: the org, its divisions and departments,
 * and the collections they publish. Full detail stays on /institute.
 */
export function homeGraph(): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [
    ...departments.filter(d => d.kind === 'division').map(departmentNode),
    ...departments.filter(d => d.kind === 'department').map(departmentNode),
    catalogNode()
  ];
  return nodes;
}

/** Number of distinct entity nodes the Institute publishes, for the audit report. */
export const SPINE_NODE_COUNT =
  departments.length + institute.facilities.length + programs.length + grants.length + courses.length + 3;

export { slugOfFacility };

/* =====================================================================
   RELATION BUNDLES
   Property sets spread into a record's node so that each record points
   outward at the institution (department, facility, person, vocabulary,
   related records) instead of describing itself in isolation.

   Every value below is derived from a real field on the record itself —
   no relationship here is asserted that the source data does not contain.
   ===================================================================== */

/** @ids of the DefinedTerms owned by a department — the `about`/`knowsAbout` targets. */
export const termIdsForDepartment = (deptId: string): string[] =>
  termSet.terms.filter(t => t.departmentId === deptId).map(t => IDS.term(t.termCode));

/** @ids of grants that reach a department through any programme it runs. */
export const grantIdsForDepartment = (deptId: string): string[] => {
  const deptPrograms = new Set(programs.filter(p => p.departmentId === deptId).map(p => p.id));
  return grants.filter(g => g.programIds.some(id => deptPrograms.has(id))).map(g => IDS.grant(g.id));
};

const firstDefined = (...ids: (string | undefined)[]) => ids.find(Boolean);

/**
 * Outward-pointing properties for a prototype dossier.
 * Draws on `discipline`, `leadResearcher`, `linkedPatents`, `linkedLogs`,
 * `fieldDeployments` and `interfaceProtocols`.
 */
export function prototypeRelations(opts: {
  discipline: string;
  leadResearcher: string;
  linkedPatents: string[];
  linkedLogs: string[];
  fieldDeployments: string[];
}) {
  const deptId = institute.disciplineDept[opts.discipline];
  return {
    sourceOrganization: deptId ? ref(IDS.department(deptById.get(deptId)!.slug)) : undefined,
    about: refs(deptId ? termIdsForDepartment(deptId) : []),
    creator: refs([personIdForName(opts.leadResearcher)]),
    funding: refs(deptId ? grantIdsForDepartment(deptId) : []),
    locationCreated: refs([firstDefined(facilityIdForName(opts.fieldDeployments[0] ?? ''))]),
    mentions: [
      ...recordRefs('patent', opts.linkedPatents),
      ...recordRefs('log', opts.linkedLogs)
    ],
    isPartOf: [ref(IDS.website), ...(deptId ? [ref(IDS.department(deptById.get(deptId)!.slug))] : [])]
  };
}

/** Outward-pointing properties for a speculative patent dossier. */
export function patentRelations(opts: {
  primaryDiscipline: string;
  inventors: string[];
  linkedPrototypes: string[];
}) {
  const deptId = institute.disciplineDept[opts.primaryDiscipline];
  return {
    sourceOrganization: deptId ? ref(IDS.department(deptById.get(deptId)!.slug)) : undefined,
    about: refs(deptId ? termIdsForDepartment(deptId) : []),
    creator: refs(opts.inventors.map(personIdForName)),
    funding: refs(deptId ? grantIdsForDepartment(deptId) : []),
    mentions: recordRefs('prototype', opts.linkedPrototypes),
    isPartOf: [ref(IDS.website), ...(deptId ? [ref(IDS.department(deptById.get(deptId)!.slug))] : [])]
  };
}

/**
 * Outward-pointing properties for a research note.
 *
 * The department is resolved from the AUTHOR, not from the facility: several
 * departments share one studio, so facility would pick an arbitrary one of
 * them, whereas the author maps to exactly one department.
 */
export function logRelations(opts: { author: string; facility: string; equipmentIds: string[] }) {
  const authorId = institute.personnelByName[normaliseName(opts.author)];
  const depts = authorId ? departmentsForFellow(authorId) : [];
  const deptId = depts[0]?.id;
  return {
    sourceOrganization: deptId ? ref(IDS.department(deptById.get(deptId)!.slug)) : undefined,
    about: refs(deptId ? termIdsForDepartment(deptId) : []),
    creator: refs([personIdForName(opts.author)]),
    locationCreated: refs([firstDefined(facilityIdForName(opts.facility))]),
    mentions: recordRefs('prototype', opts.equipmentIds),
    isPartOf: [ref(IDS.website), ...depts.map(d => ref(IDS.department(d.slug)))]
  };
}

/**
 * Outward-pointing properties for an anomaly post-mortem.
 * Incidents carry their own project codes rather than programme ids, so the
 * only programme asserted here is the standing post-mortem programme that
 * actually produces these records.
 */
export function failureRelations(opts: { leadInvestigator: string }) {
  const deptId = 'DEPT-APPLIED-ANOMALIES';
  return {
    sourceOrganization: ref(IDS.department(deptById.get(deptId)!.slug)),
    about: [ref(IDS.program('PRG-POSTMORTEM-PROGRAMME')), ref(IDS.program('PRG-CONTAINMENT'))],
    creator: refs([personIdForName(opts.leadInvestigator)]),
    isPartOf: [ref(IDS.website), ref(IDS.department(deptById.get(deptId)!.slug))]
  };
}

/** Outward-pointing properties for a monograph. */
export function monographRelations(opts: { author: string; coAuthors: string[]; citations: string[] }) {
  const people = [opts.author, ...opts.coAuthors].map(personIdForName);
  return {
    creator: refs(people),
    citation: opts.citations,
    publisher: ref(IDS.organization),
    sourceOrganization: ref(IDS.organization),
    inDefinedTermSet: ref(IDS.vocabulary),
    isPartOf: ref(IDS.website)
  };
}

/**
 * Relational properties for a fellow's Person node.
 *
 * Note on direction: schema.org has no Person→authored-work property, so
 * authorship is expressed canonically as `CreativeWork.creator → Person`
 * on the work's own page. The Person node instead carries the structural
 * edges — role in department, occupation, funding, vocabulary and colleagues.
 */
export function fellowRelations(fellowId: string, opts: { title: string; joinedYear: number; specialization: string }) {
  const depts = departmentsForFellow(fellowId);
  const works = institute.fellowWorks[fellowId];
  const divisions = [...new Set(depts.map(d => d.divisionId!))].map(id => deptById.get(id)!);
  const allPrograms = [...(works?.leadsProgramIds ?? []), ...(works?.coProgramIds ?? [])];
  const grants_ = grants.filter(g => g.programIds.some(id => allPrograms.includes(id)));
  const colleagues = [
    ...new Set(depts.flatMap(d => institute.departmentWorks[d.id]?.fellowIds ?? []).filter(id => id !== fellowId))
  ];
  const terms = [...new Set(depts.flatMap(d => termIdsForDepartment(d.id)))];

  const roles: Record<string, unknown>[] = depts.map(d => ({
    '@type': 'OrganizationRole',
    roleName: d.headId === fellowId ? 'Head of Department' : 'Research Fellow',
    startDate: String(opts.joinedYear),
    memberOf: ref(IDS.department(d.slug))
  }));
  roles.push(
    ...divisions.map(d => ({
      '@type': 'OrganizationRole',
      roleName: 'Fellow',
      startDate: String(opts.joinedYear),
      memberOf: ref(IDS.division(d.slug))
    }))
  );

  return {
    memberOf: roles,
    worksFor: {
      '@type': 'EmployeeRole',
      roleName: opts.title,
      startDate: String(opts.joinedYear),
      worksFor: ref(IDS.organization)
    },
    affiliation: ref(IDS.organization),
    hasOccupation: {
      '@type': 'Occupation',
      name: opts.title,
      skills: [opts.specialization],
      occupationLocation: refs([...new Set(depts.map(d => facilityIdForName(d.homeFacility)))]),
      estimatedSalary: undefined
    },
    knowsAbout: refs(terms),
    funding: refs(grants_.map(g => IDS.grant(g.id))),
    funder: refs(grants_.map(g => IDS.grant(g.id))),
    colleague: refs(colleagues.map(id => RECORD_IDS.fellow(id))),
    makesOffer: refs((works?.instructsCourseIds ?? []).map(id => IDS.course(id))),
    performerIn: undefined,
    workLocation: refs([...new Set(depts.map(d => facilityIdForName(d.homeFacility)))])
  };
}

/** Outward-pointing properties for a field station Place node. */
export function siteRelations(opts: {
  channelCount: number;
  frequencyRange: string;
  physicalFootprint: string;
  instrumentationList: string[];
}) {
  return {
    maintainer: ref(IDS.department(deptById.get('DEPT-SIGNAL-ARCHAEOLOGY')!.slug)),
    containedInPlace: ref(IDS.organization),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Channel count', value: opts.channelCount },
      { '@type': 'PropertyValue', name: 'Frequency range', value: opts.frequencyRange },
      { '@type': 'PropertyValue', name: 'Physical footprint', value: opts.physicalFootprint }
    ],
    amenityFeature: opts.instrumentationList.map(i => ({
      '@type': 'LocationFeatureSpecification',
      name: i,
      value: true
    }))
  };
}

/** Outward-pointing properties for a published browser instrument. */
export function instrumentRelations(departmentSlug: string) {
  return {
    creator: ref(IDS.department(departmentSlug)),
    publisher: ref(IDS.organization),
    sourceOrganization: ref(IDS.department(departmentSlug)),
    isPartOf: ref(IDS.department(departmentSlug))
  };
}

/**
 * The parent company, declared once on /legal/institutional-status and
 * referenced by id everywhere else.
 */
export const parentCompanyNode = () => ({
  '@type': ['Organization', 'Corporation'],
  '@id': IDS.parentCompany,
  name: ENTITY.legalParent,
  url: absoluteUrl('/legal/institutional-status'),
  description: `Legal parent and operator of the ${ENTITY.name}. Publishes the Institute's research archive at ${SITE_URL}.`,
  subOrganization: ref(IDS.organization),
  owns: ref(IDS.organization)
});
