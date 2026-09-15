/** Minimal static server mirroring production routing (clean URLs, 404.html). For local preview only. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
const dist = resolve(import.meta.dirname, '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path !== '/' && path.endsWith('/')) { res.writeHead(308, { Location: path.slice(0, -1) }); return res.end(); }
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  let status = 200;
  if (!existsSync(file)) { file = join(dist, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(+(process.env.PORT || 4173), '0.0.0.0', () => console.log('serving dist on', process.env.PORT || 4173));
