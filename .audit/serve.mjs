/**
 * Minimal static server that mirrors how the archive is deployed:
 *   - cleanUrls             : /prototypes -> dist/prototypes/index.html
 *   - trailingSlash: false  : both /prototypes and /prototypes/ resolve
 *   - 404.html              : unknown paths return the prerendered not-found page
 *
 * `vite preview` does none of the three (it falls back to dist/index.html), which
 * makes a correctly prerendered site look like it has a hydration mismatch. This
 * server exists so the audit harness measures the site as visitors get it.
 *
 *   node .audit/serve.mjs [port]      # default 4300
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.argv[2] || 4300);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

const isFile = p => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

/** Resolve a request path to a file the way the CDN does. */
const resolvePath = urlPath => {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '');
  if (clean === '') return { file: path.join(DIST, 'index.html'), status: 200 };

  const rel = clean.replace(/^\/+/, '');
  const direct = path.join(DIST, rel);
  for (const candidate of [direct, `${direct}.html`, path.join(direct, 'index.html')]) {
    if (candidate.startsWith(DIST) && isFile(candidate)) return { file: candidate, status: 200 };
  }
  const notFound = path.join(DIST, '404.html');
  return { file: isFile(notFound) ? notFound : path.join(DIST, 'index.html'), status: 404 };
};

http
  .createServer((req, res) => {
    const { file, status } = resolvePath(req.url || '/');
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('read error');
        return;
      }
      const headers = {
        'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
        'Content-Length': body.length
      };
      if (status === 200 && file.includes(`${path.sep}assets${path.sep}`)) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      }
      res.writeHead(status, headers);
      res.end(body);
    });
  })
  .listen(PORT, '0.0.0.0', () => console.log(`static server on http://0.0.0.0:${PORT} serving ${DIST}`));
