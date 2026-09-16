/**
 * Vite plugin: makes `npm run dev` and `npm run preview` answer historical URLs
 * the way the deployed hosts do.
 *
 *   /logs/LOG-001            → 301 /research-notes/log-001
 *   /prototypes/ZIAA-PROTO-3 → 301 /prototypes
 *   /exhibitions             → 410 (the Gone surface)
 *   /prototypes?status=…     → 301 /prototypes
 *
 * Vite internals (/@vite, /@fs, /src, /node_modules, HMR) never match a registry
 * rule, so this layer only touches paths that are alias-shaped.
 */
import { resolveAlias } from './lib/static-server.mjs';

const GONE_BODY = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><title>410 · Permanently Withdrawn</title></head>
<body style="font-family:ui-monospace,monospace;background:#030508;color:#d4d4d8;padding:2rem">
<h1 style="font-size:1.1rem">410 — this address is permanently withdrawn</h1>
<p>No successor page exists. <a style="color:#dfb76c" href="/410">Open the Withdrawn surface</a>
or <a style="color:#dfb76c" href="/">return to the archive</a>.</p>
</body></html>`;

function aliasMiddleware() {
  return (req, res, next) => {
    if (!req.url) return next();
    const [rawPath, search = ''] = req.url.split('?');
    const path = decodeURIComponent(rawPath.split('#')[0]);
    const decision = resolveAlias(path, { search: search ? `?${search}` : '', channel: 'strict' });

    if (decision.kind === 'redirect') {
      res.statusCode = decision.status;
      res.setHeader('Location', decision.to);
      res.setHeader('Cache-Control', 'no-store');
      return res.end();
    }
    if (decision.kind === 'gone') {
      res.statusCode = 410;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex');
      return res.end(GONE_BODY);
    }
    return next();
  };
}

export function aliasRouting() {
  return {
    name: 'ziaa-alias-routing',
    configureServer(server) {
      server.middlewares.use(aliasMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(aliasMiddleware());
    }
  };
}

export default aliasRouting;
