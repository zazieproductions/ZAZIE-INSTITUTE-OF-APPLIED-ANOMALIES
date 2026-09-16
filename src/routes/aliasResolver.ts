/**
 * Client-side alias rescue.
 *
 * Host config (vercel.json / _redirects / nginx) is the primary mechanism and
 * answers with a real 3xx before the app ever boots. This module is the safety
 * net for the cases a host config cannot express:
 *
 *   - hosts that ignore query-string rules (`/?tab=vault`, `?discipline=…`)
 *   - case-folded URLs on case-sensitive hosts (`/Spectra-Lab`)
 *   - prefix trees no host rule caught (`/interference-archive/browse`)
 *   - retired surfaces on hosts with no 410 support (resolved to /410)
 *   - the same archive served from a satellite origin (GitHub Pages), which is
 *     canonicalised to zazieinstitute.org on load
 *
 * The table is generated (src/routes/aliases.generated.json) from
 * scripts/alias-registry.mjs, so this file never disagrees with the host config.
 */
import table from './aliases.generated.json';

type ExactRule = { from: string; to: string; class: string; status: number };
type PrefixRule = { from: string; to: string; splat: boolean; class: string; status: number };
type SatelliteOrigin = { origin: string; target: string; evidence: string };

const exact = table.exact as ExactRule[];
const prefix = table.prefix as PrefixRule[];
const goneExact = table.goneExact as { from: string; class: string; status: number }[];
const gonePrefix = table.gonePrefix as { from: string; class: string; status: number }[];
export const CANONICAL_PATHS = new Set<string>(table.canonicalPaths as string[]);

/** Alias routes the client router can answer itself (mirrors public/_redirects). */
export const CLIENT_ALIAS_ROUTES = exact;

export type AliasResolution =
  | { kind: 'permanent'; to: string; via: 'exact' | 'prefix' | 'case-fold'; rule: string; source: string }
  | { kind: 'gone'; rule: string; source: string; class: string }
  | { kind: 'none' };

const EXACT = new Map(exact.map((r) => [r.from, r]));

/** Trim the trailing slash the way the hosts do (vercel trailingSlash:false). */
function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '') || '/';
  return pathname;
}

function matchPrefix(pathname: string, rule: PrefixRule): { to: string } | null {
  const from = normalize(rule.from);
  if (pathname === from) return { to: rule.to };
  if (!pathname.startsWith(`${from}/`)) return null;
  if (!rule.splat) return { to: rule.to };
  return { to: `${rule.to}${pathname.slice(from.length)}` };
}

/**
 * Resolve a pathname against the registry.
 * Order mirrors the host rules: exact → case fold → prefix → gone.
 */
export function resolveAlias(pathname: string): AliasResolution {
  const path = normalize(pathname || '/');

  const hit = EXACT.get(path);
  if (hit) return { kind: 'permanent', to: hit.to, via: 'exact', rule: hit.class, source: path };

  const lower = path.toLowerCase();
  if (lower !== path && CANONICAL_PATHS.has(lower)) {
    return { kind: 'permanent', to: lower, via: 'case-fold', rule: 'case-fold', source: path };
  }

  for (const rule of prefix) {
    const m = matchPrefix(path, rule);
    if (m) return { kind: 'permanent', to: m.to, via: 'prefix', rule: rule.class, source: path };
  }

  for (const rule of goneExact) {
    if (path === normalize(rule.from)) return { kind: 'gone', rule: rule.from, source: path, class: rule.class };
  }
  for (const rule of gonePrefix) {
    const from = normalize(rule.from);
    if (path === from || path.startsWith(`${from}/`)) {
      return { kind: 'gone', rule: rule.from, source: path, class: rule.class };
    }
  }

  return { kind: 'none' };
}

/**
 * Same as resolveAlias, but also folds legacy query-string views
 * (`?tab=…`, `?discipline=…`) onto their canonical pages.
 */
export function resolveAliasWithQuery(pathname: string, search: string): AliasResolution {
  const direct = resolveAlias(pathname);
  if (direct.kind !== 'none' || !search) return direct;

  const params = new URLSearchParams(search);
  for (const [key, value] of params.entries()) {
    const candidate = value ? `${pathname}?${key}=${value}` : `${pathname}?${key}`;
    const exactHit = table.query.find(
      (q) => q.path === normalize(pathname) && q.key === key && (q.value ?? '') === value
    );
    if (exactHit) return { kind: 'permanent', to: exactHit.to, via: 'exact', rule: exactHit.class, source: candidate };
    const keyHit = table.query.find((q) => q.path === normalize(pathname) && q.key === key && !q.value);
    if (keyHit) return { kind: 'permanent', to: keyHit.to, via: 'exact', rule: keyHit.class, source: candidate };
  }
  return { kind: 'none' };
}

/**
 * Satellite origins (GitHub Pages demos and the predecessor Cloudflare Pages
 * project) that already appear in this repository. They are not canonical:
 * the archive answers on zazieinstitute.org.
 */
export const SATELLITE_ORIGINS = table.satellites as SatelliteOrigin[];

/** Resolve a full href from a satellite origin, e.g. a GitHub Pages project page. */
export function resolveSatelliteOrigin(href: string): { to: string; origin: string } | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.host.toLowerCase();
  for (const entry of SATELLITE_ORIGINS) {
    let base: URL;
    try {
      base = new URL(entry.origin);
    } catch {
      continue;
    }
    if (host !== base.host.toLowerCase()) continue;
    const basePath = base.pathname.replace(/\/$/, '');
    if (basePath && !url.pathname.startsWith(basePath)) continue;
    const rest = basePath ? url.pathname.slice(basePath.length).replace(/\/$/, '') : '';
    const target = `${entry.target.replace(/\/$/, '')}${rest}` || entry.target;
    return { to: target || '/', origin: entry.origin };
  }
  return null;
}

export const ALIAS_COUNTS = table.counts ?? {
  exact: exact.length,
  prefix: prefix.length,
  gone: goneExact.length + gonePrefix.length
};
