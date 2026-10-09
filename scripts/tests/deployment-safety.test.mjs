import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dist = resolve(root, 'dist');
const PAGES_PROJECT = 'zazie-institute-of-applied-anomalies';

test('Cloudflare Pages publishes the existing project from the prerendered dist directory', () => {
  const config = readFileSync(resolve(root, 'wrangler.toml'), 'utf8');
  assert.match(config, new RegExp(`^name\\s*=\\s*["']${PAGES_PROJECT}["']`, 'm'));
  assert.match(config, /^pages_build_output_dir\s*=\s*["']\.?\/dist["']/m);
});

test('static-host redirects do not use a catch-all that can capture built assets', () => {
  const redirectLines = readFileSync(resolve(root, 'public/_redirects'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'));
  assert.ok(
    redirectLines.every((line) => line.trim().split(/\s+/)[0] !== '/*'),
    'unmatched requests should use the host-native 404.html behavior, not a wildcard rewrite'
  );
});

test('production build ships rendered homepage markup and a top-level 404 page', {
  skip: !existsSync(resolve(dist, 'index.html'))
}, () => {
  const home = readFileSync(resolve(dist, 'index.html'), 'utf8');
  assert.doesNotMatch(home, /<!--app-(?:head|html)-->/, 'prerender template placeholders must be replaced');
  assert.doesNotMatch(home, /\/src\/entry-client\.tsx/, 'production HTML must not point to raw TSX');
  assert.match(home, /<main[^>]*id="main-content"/, 'homepage should contain server-rendered application content');
  assert.ok(existsSync(resolve(dist, '404.html')), 'host-native 404 document must be present');

  const assets = [...home.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)(?:[?#][^"]*)?"/g)]
    .map((match) => match[1]);
  assert.ok(assets.some((asset) => asset.endsWith('.js')), 'production HTML should reference a bundled client script');
  assert.ok(assets.some((asset) => asset.endsWith('.css')), 'production HTML should reference a bundled stylesheet');
  for (const asset of assets) {
    assert.ok(existsSync(resolve(dist, asset.slice(1))), `missing deployed asset: ${asset}`);
  }
});
