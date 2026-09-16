/**
 * Local preview server for dist/ — mirrors production routing.
 *
 * Real status codes are served for the historical surface:
 *   301  moved addresses (the alias registry)
 *   308  trailing-slash / cleanUrl normalisation
 *   410  retired surfaces (/exhibitions, /archives/*, old accession ids …)
 *   404  the archive's own error page
 *
 * Usage: npm run build && node scripts/serve-dist.mjs   (PORT env overrides 4173)
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { routeRequest, contentType, counts } from './lib/static-server.mjs';

const dist = resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 4173);

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('[serve-dist] dist/ is empty — run `npm run build` first.');
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const decision = routeRequest(dist, decodeURIComponent(url.pathname), url.search);

  if (decision.kind === 'redirect') {
    res.writeHead(decision.status, { Location: decision.location, 'Cache-Control': 'no-store' });
    return res.end();
  }

  const file =
    decision.kind === 'gone' || decision.kind === 'error'
      ? decision.file
      : decision.kind === 'file'
        ? decision.file
        : resolve(dist, '404.html');

  const body = readFileSync(file);
  res.writeHead(decision.status ?? 404, {
    'Content-Type': contentType(file),
    ...(decision.kind === 'gone' ? { 'X-Robots-Tag': 'noindex' } : {})
  });
  res.end(body);
}).listen(port, '0.0.0.0', () => {
  console.log(`[serve-dist] http://localhost:${port} — alias registry: ${counts.exact} exact / ${counts.prefix} prefix / ${counts.gone} gone(410)`);
});
