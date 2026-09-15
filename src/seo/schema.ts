/**
 * schema.org JSON-LD builders. Every graph node references the same
 * Organization @id so search engines merge signals onto one entity.
 */
import { ENTITY, SITE_URL, absoluteUrl } from './site';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERIODICAL_ID = `${SITE_URL}/#transactions-series`;

export const organizationSchema = (opts?: { description?: string }) => ({
  '@context': 'https://schema.org',
  '@type': ['ResearchOrganization', 'Organization'],
  '@id': ORG_ID,
  name: ENTITY.name,
  alternateName: [ENTITY.abbreviation, 'Zazie Institute', 'ZIAA Archive'],
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl(ENTITY.logoPath),
    width: 512,
    height: 512,
    caption: `${ENTITY.name} institutional crest`
  },
  image: absoluteUrl(ENTITY.ogImagePath),
  description: opts?.description ?? ENTITY.shortDescription,
  slogan: ENTITY.tagline,
  email: ENTITY.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: ENTITY.address?.streetAddress,
    addressLocality: ENTITY.address?.addressLocality,
    addressRegion: ENTITY.address?.addressRegion,
    postalCode: ENTITY.address?.postalCode,
    addressCountry: ENTITY.address?.addressCountry
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'research inquiries',
    email: ENTITY.email,
    availableLanguage: 'English'
  },
  foundingDate: ENTITY.foundingDateISO ?? ENTITY.founded,
  foundingLocation: {
    '@type': 'Place',
    name: ENTITY.foundingLocation ?? 'California, USA',
    address: ENTITY.address
  },
  parentOrganization: {
    '@type': 'Organization',
    name: ENTITY.legalParent,
    url: absoluteUrl('/legal/institutional-status')
  },
  founder: ENTITY.founders.map((n: string) => ({
    '@type': 'Person',
    name: n,
    affiliation: { '@id': ORG_ID }
  })),
  knowsAbout: [...ENTITY.fields],
  areaServed: 'Worldwide',
  ...(ENTITY.sameAs.length ? { sameAs: [...ENTITY.sameAs] } : {})
});

/** The ZIAA Transactions monograph series as a Periodical node (ISSN-carrying). */
export const periodicalSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Periodical',
  '@id': PERIODICAL_ID,
  name: 'ZIAA Transactions on Applied Anomalies & Experimental Systems',
  alternateName: ['ZIAA Transactions', 'Transactions (ZIAA)'],
  issn: '2834-9180',
  url: `${SITE_URL}/monographs`,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
  description:
    'The monograph series of the Zazie Institute of Applied Anomalies: working treatises on applied anomalies, experimental audio systems, computational creativity and speculative engineering, reviewed by the fellow panel. Eight volumes, 2022–2026.'
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: `${ENTITY.name} (${ENTITY.abbreviation})`,
  description: ENTITY.shortDescription,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

export interface Crumb {
  name: string;
  path: string;
}

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path)
  }))
});

export const collectionPageSchema = (opts: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
  about?: string[];
  maxItems?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${absoluteUrl(opts.path)}#collection`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  isPartOf: { '@id': WEBSITE_ID },
  publisher: { '@id': ORG_ID },
  about: opts.about,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: opts.items.length,
    itemListElement: opts.items.slice(0, opts.maxItems ?? 50).map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path)
    }))
  }
});

// Discipline hub — single-typed ResearchProject (no dual-typing appetite)
export const researchProjectSchema = (opts: {
  path: string;
  name: string;
  description: string;
  keywords: string[];
  parentOrgId?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ResearchProject',
  '@id': `${absoluteUrl(opts.path)}#research-project`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  keywords: opts.keywords.join(', '),
  isPartOf: { '@id': WEBSITE_ID },
  parentOrganization: { '@id': opts.parentOrgId ?? ORG_ID },
  sponsor: { '@id': ORG_ID },
  funder: { '@id': ORG_ID }
});

export const faqPageSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
});

export const itemListSchema = (opts: { path: string; items: { name: string; path: string }[] }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${absoluteUrl(opts.path)}#itemlist`,
  url: absoluteUrl(opts.path),
  numberOfItems: opts.items.length,
  itemListElement: opts.items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: absoluteUrl(it.path)
  }))
});

export const aboutPageSchema = (path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: absoluteUrl(path),
  name: `About the ${ENTITY.name}`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  mainEntity: { '@id': ORG_ID }
});

/** DefinedTerm + DefinedTermSet for the institutional lexicon. */
export const definedTermSchema = (opts: { term: string; definition: string; url: string }) => ({
  '@type': 'DefinedTerm',
  name: opts.term,
  inDefinedTermSet: `${absoluteUrl('/lexicon')}#terms`,
  termCode: opts.term.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: opts.definition,
  url: opts.url
});

export const definedTermSetSchema = (opts: {
  path: string;
  name: string;
  description: string;
  terms: { term: string; definition: string; url: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${absoluteUrl(opts.path)}#terms`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  isPartOf: { '@id': WEBSITE_ID },
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
  hasDefinedTerm: opts.terms.map(t => definedTermSchema(t))
});

/** Scholarly monograph: ScholarlyArticle bound to the Transactions periodical. */
export const monographSchema = (opts: {
  path: string;
  id: string;
  title: string;
  abstract: string;
  date: string;
  authors: string[];
  volume: string;
  keywords?: string[];
  sections?: string[];
}) => ({
  ...creativeWorkSchema({
    type: 'ScholarlyArticle',
    path: opts.path,
    name: opts.title,
    headline: opts.title,
    description: opts.abstract,
    identifier: opts.id,
    datePublished: opts.date,
    authors: opts.authors,
    keywords: opts.keywords,
    extra: {
      issn: '2834-9180',
      articleSection: opts.sections,
      reviewAspect: 'peer review by the ZIAA fellow panel'
    }
  }),
  isPartOf: {
    '@type': 'PublicationIssue',
    name: opts.volume,
    isPartOf: { '@id': PERIODICAL_ID }
  }
});

/** Generic creative-work node for prototypes, patents, notes, reports. */
export const creativeWorkSchema = (opts: {
  type: 'TechArticle' | 'ScholarlyArticle' | 'Report' | 'CreativeWork' | 'SoftwareSourceCode';
  path: string;
  name: string;
  headline?: string;
  description: string;
  identifier: string;
  datePublished?: string;
  dateModified?: string;
  authors?: string[];
  keywords?: string[];
  additionalType?: string;
  genre?: string;
  extra?: Record<string, unknown>;
}) => ({
  '@context': 'https://schema.org',
  '@type': opts.type,
  '@id': `${absoluteUrl(opts.path)}#work`,
  url: absoluteUrl(opts.path),
  mainEntityOfPage: absoluteUrl(opts.path),
  name: opts.name,
  headline: opts.headline ?? opts.name,
  description: opts.description,
  identifier: opts.identifier,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  inLanguage: 'en',
  isPartOf: { '@id': WEBSITE_ID },
  publisher: { '@id': ORG_ID },
  sourceOrganization: { '@id': ORG_ID },
  author: opts.authors?.map(a => ({ '@type': 'Person', name: a })),
  keywords: opts.keywords?.join(', '),
  additionalType: opts.additionalType,
  genre: opts.genre,
  image: absoluteUrl(ENTITY.ogImagePath),
  ...opts.extra
});

export const personSchema = (opts: {
  path: string;
  name: string;
  jobTitle: string;
  description: string;
  knowsAbout: string[];
  worksFor?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${absoluteUrl(opts.path)}#person`,
  url: absoluteUrl(opts.path),
  mainEntityOfPage: absoluteUrl(opts.path),
  name: opts.name,
  jobTitle: opts.jobTitle,
  description: opts.description,
  knowsAbout: opts.knowsAbout,
  disambiguatingDescription: `${ENTITY.abbreviation} fellow — ${opts.jobTitle} at the ${ENTITY.name} (ZIAA)`,
  affiliation: { '@id': ORG_ID },
  worksFor: { '@id': ORG_ID },
  memberOf: { '@id': ORG_ID }
});

export const placeSchema = (opts: {
  path: string;
  name: string;
  alternateName: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  '@id': `${absoluteUrl(opts.path)}#place`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  alternateName: opts.alternateName,
  description: opts.description,
  address: opts.address,
  geo:
    opts.latitude !== undefined && opts.longitude !== undefined
      ? { '@type': 'GeoCoordinates', latitude: opts.latitude, longitude: opts.longitude }
      : undefined,
  containedInPlace: undefined,
  publicAccess: false,
  isAccessibleForFree: false,
  maintainer: { '@id': ORG_ID }
});

export const softwareAppSchema = (opts: {
  path: string;
  name: string;
  description: string;
  category: string;
  features: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${absoluteUrl(opts.path)}#app`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  applicationCategory: opts.category,
  operatingSystem: 'Any (modern web browser)',
  browserRequirements: 'Requires JavaScript and the Web Audio API',
  featureList: opts.features.join(', '),
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': ORG_ID },
  creator: { '@id': ORG_ID }
});

export const datasetSchema = (opts: {
  path: string;
  name: string;
  description: string;
  keywords: string[];
  distributionUrl?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  '@id': `${absoluteUrl(opts.path)}#dataset`,
  url: absoluteUrl(opts.path),
  name: opts.name,
  description: opts.description,
  keywords: opts.keywords.join(', '),
  creator: { '@id': ORG_ID },
  publisher: { '@id': ORG_ID },
  distribution: opts.distributionUrl
    ? {
        '@type': 'DataDownload',
        contentUrl: opts.distributionUrl,
        encodingFormat: 'application/json'
      }
    : undefined,
  isAccessibleForFree: true,
  license: `${SITE_URL}/legal/terms`
});

/** Parse `35°00'42.1"N 115°28'19.4"W` into decimal degrees. */
export function parseDms(coords: string): { latitude: number; longitude: number } | undefined {
  const re = /(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])/;
  const m = coords.match(re);
  if (!m) return undefined;
  const toDec = (d: string, mi: string, s: string, hemi: string) => {
    const v = Number(d) + Number(mi) / 60 + Number(s) / 3600;
    return hemi === 'S' || hemi === 'W' ? -v : v;
  };
  return {
    latitude: Number(toDec(m[1], m[2], m[3], m[4]).toFixed(6)),
    longitude: Number(toDec(m[5], m[6], m[7], m[8]).toFixed(6))
  };
}
