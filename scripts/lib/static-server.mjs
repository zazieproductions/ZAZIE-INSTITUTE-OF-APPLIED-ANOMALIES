/**
 * Static routing mirror — the decisions the production hosts make, in Node, so
 * `npm run dev`, `npm run preview` and `node scripts/serve-dist.mjs` answer
 * historical URLs exactly the way Vercel + middleware.ts do.
 *
 * Order of operations (shared with scripts/audit-aliases.mjs):
 *   1. alias registry (301 moved / 410 retired)          scripts/alias-registry.mjs
 *   2. trailing-slash normalisation → 308                (vercel trailingSlash:false)
 *   3. cleanUrl file resolution                          (dist/<path>.html or <path>/index.html)
 *   4. error surface                                     dist/404.html
 *
 * Query-string facets are answered here too (they are the one class that needs
 * the request's search string), matching the strict channel of the registry.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { registry, resolveAlias, expandAliasRules } from '../alias-registry.mjs';

export const { canonicalPaths, counts } = registry();
export { registry, resolveAlias, expandAliasRules };

const stripSlash = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json'
};

const BARE = {
  _redirects: 'text/plain; charset=utf-8',
  _headers: 'text/plain; charset=utf-8',
  llms: 'text/plain; charset=utf-8',
  LICENSE: 'text/plain; charset=utf-8'
};

export const contentType = (file) => {
  const name = file.slice(file.lastIndexOf('/') + 1);
  return BARE[name] ?? TYPES[name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''] ?? 'application/octet-stream';
};

/** Resolve a canonical pathname to a file inside dist (cleanUrl semantics). */
export function resolveFile(dist, pathname) {
  const clean = stripSlash(pathname);
  // A real file at the literal path wins first (assets, PDFs, the embedded app,
  // aliases.json); cleanUrl resolution follows.
  if (clean !== '/') {
    const literal = join(dist, clean.slice(1));
    if (existsSync(literal) && statSync(literal).isFile()) return literal;
  }
  const candidates =
    clean === '/' ? ['index.html'] : [`${clean.slice(1)}.html`, join(clean.slice(1), 'index.html')];
  for (const rel of candidates) {
    const file = join(dist, rel);
    if (existsSync(file)) return file;
  }
  return null;
}

/**
 * One request → one decision. Returns:
 *   { kind: 'redirect', status, location, class }  301/308
 *   { kind: 'gone', status: 410, location: '/410' } retired surface
 *   { kind: 'file', status: 200, file }             a real page or asset
 *   { kind: 'error', status: 404, file }            the 404 surface
 */
export function routeRequest(dist, pathname, search = '') {
  const alias = resolveAlias(pathname, { search, channel: 'strict' });
  if (alias.kind === 'redirect') {
    return { kind: 'redirect', status: alias.status, location: alias.to, class: alias.class };
  }
  if (alias.kind === 'gone') {
    return { kind: 'gone', status: 410, location: '/410', file: resolveFile(dist, '/410') ?? join(dist, '410.html') };
  }

  // Trailing slash: the hosts normalise with a permanent redirect (Vercel
  // trailingSlash:false; Netlify pretty URLs; Cloudflare Pages auto-trailing-slash).
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const target = stripSlash(pathname);
    if (resolveFile(dist, target)) {
      return { kind: 'redirect', status: 308, location: `${target}${search}`, class: 'trailing-slash' };
    }
  }

  const file = resolveFile(dist, pathname);
  if (file) return { kind: 'file', status: 200, file };

  return { kind: 'error', status: 404, file: resolveFile(dist, '/404') ?? join(dist, '404.html') };
}

export const read = (file) => readFileSync(file, 'utf8');
