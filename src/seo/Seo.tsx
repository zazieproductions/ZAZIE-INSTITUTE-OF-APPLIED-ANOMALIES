import React from 'react';
import { ENTITY, absoluteUrl, buildTitle, snippet } from './site';

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
  keywords
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
