import React from 'react';
import { ENTITY, FOUNDER, COPYRIGHT_NOTICE, absoluteUrl, buildTitle, snippet } from './site';
import { CITATION } from './canonicalFacts';

export interface SeoProps {
  /** Page-specific title (entity suffix is appended automatically; may be clipped to the SERP budget). */
  title?: string;
  /** Short identifier appended in parentheses and never clipped (keeps titles unique), e.g. "PROT-001". */
  titleId?: string;
  description: string;
  /** Canonical path, e.g. "/prototypes/prot-001". */
  path: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** One or more JSON-LD objects. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  keywords?: string[];
  /** Google Scholar / Open Graph academic citation meta (Highwire Press tags). */
  citation?: {
    title?: string;
    authors?: string[];
    publicationDate?: string;
    journalTitle?: string;
    volume?: string;
    issn?: string;
    pdfUrl?: string;
    doi?: string;
  };
  /** Additional <link> tags (e.g. alternate, scholar). */
  extraLinks?: { rel: string; href: string; type?: string; title?: string }[];
}

/**
 * Declarative document metadata. React 19 hoists <title>, <meta> and <link>
 * elements into <head> during both server prerendering and client rendering,
 * so every route ships a complete, unique head without a helmet library.
 */
export const Seo: React.FC<SeoProps> = ({
  title,
  titleId,
  description,
  path,
  type = 'website',
  image = ENTITY.ogImagePath,
  imageAlt = `${ENTITY.name} (${ENTITY.abbreviation}) institutional crest`,
  noindex = false,
  publishedTime,
  modifiedTime,
  jsonLd,
  keywords,
  citation,
  extraLinks
}) => {
  const fullTitle = buildTitle(title, titleId);
  // Social cards have a larger budget than SERP titles: keep the full page title there.
  const socialTitle = title ? `${title}${titleId ? ` (${titleId})` : ''} · ${ENTITY.abbreviation}` : fullTitle;
  const desc = snippet(description);
  const canonical = absoluteUrl(path);
  const img = absoluteUrl(image);
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Authorship & rights - every page attributes the legal founder and rights holder. */}
      <meta name="author" content={FOUNDER.name} />
      <meta name="copyright" content={COPYRIGHT_NOTICE} />
      <meta name="publisher" content={`${ENTITY.name} (${ENTITY.abbreviation}) - ${ENTITY.legalParent}`} />
      <link rel="author" href={absoluteUrl(FOUNDER.path)} />

      <meta property="og:site_name" content={`${ENTITY.name} (${ENTITY.abbreviation})`} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* Google Scholar / Highwire Press - citation hacking surface for academic indexes */}
      {citation?.title && <meta name="citation_title" content={citation.title} />}
      {citation?.authors?.map(a => (
        <meta key={a} name="citation_author" content={a} />
      ))}
      {citation?.publicationDate && <meta name="citation_publication_date" content={citation.publicationDate} />}
      {citation?.journalTitle && <meta name="citation_journal_title" content={citation.journalTitle} />}
      {citation?.volume && <meta name="citation_volume" content={citation.volume} />}
      {citation?.pdfUrl && <meta name="citation_pdf_url" content={citation.pdfUrl} />}
      {citation?.doi && <meta name="citation_doi" content={citation.doi} />}
      {citation && <meta name="citation_publisher" content={CITATION.publisher} />}
      {citation?.issn && <meta name="citation_issn" content={citation.issn} />}
      {citation && <meta name="citation_language" content="en" />}
      {citation && <meta name="dc.identifier" content={canonical} />}
      {/* Extra links (sitemap hints, scholar alternates) */}
      {extraLinks?.map((l, i) => (
        <link key={i} rel={l.rel} href={l.href} type={l.type} title={l.title} />
      ))}

      {ld.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON-LD is data, not executable code; escape "<" to prevent breakout.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
};
