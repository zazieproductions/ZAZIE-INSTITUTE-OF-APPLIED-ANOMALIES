import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const icons = ['/favicon.ico', '/favicon-16.png', '/favicon-32.png', '/favicon.svg', '/apple-touch-icon.png'];
function check(file, assetRoot) {
  const head = readFileSync(file, 'utf8').split('</head>')[0];
  for (const icon of icons) {
    assert.ok(head.includes(`href="${icon}"`), `${file}: missing global ${icon}`);
    assert.ok(existsSync(resolve(assetRoot, `.${icon}`)), `Missing asset: ${icon}`);
  }
  assert.match(head, /rel="icon"[^>]*href="\/favicon.svg"[^>]*type="image\/svg\+xml"/);
}

test('main shell and standalone instrument retain the same tab branding', () => {
  check(resolve(root, 'index.html'), resolve(root, 'public'));
  check(resolve(root, 'public/apps/void-oculus/index.html'), resolve(root, 'public'));
});

test('all built HTML pages retain tab branding', { skip: !existsSync(resolve(root, 'dist')) }, () => {
  const dist = resolve(root, 'dist');
  for (const file of readdirSync(dist, { recursive: true })) {
    if (file.endsWith('.html')) check(resolve(dist, file), dist);
  }
});
