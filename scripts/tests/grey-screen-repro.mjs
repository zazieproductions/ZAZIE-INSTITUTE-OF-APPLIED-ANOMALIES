/**
 * Grey-screen regression harness (real headless Chromium, same @sparticuz/chromium
 * setup as the .audit/* scripts).
 *
 * The 2026-10 outage: the production host served the repository's un-built
 * document shell, whose module script points at /src/entry-client.tsx (served
 * as application/octet-stream, so the app never booted) and whose #root only
 * holds the <!--app-html--> comment — a dark, empty page. Two properties must
 * hold for the site to survive that failure mode:
 *
 *   1. The prerendered build (dist/) must hydrate with zero browser errors.
 *   2. The un-prerendered shell (vite build without prerender) must fall back
 *      to a clean client render — src/entry-client.tsx only hydrates when real
 *      prerendered markup (an element) is inside #root, never a comment.
 *
 * Usage:
 *   node scripts/serve-dist.mjs                 # production build on :4173
 *   node scripts/tests/grey-screen-repro.mjs /  # check the prerendered build
 *
 *   npx vite build --outDir /tmp/shell --emptyOutDir && cp -r public/* /tmp/shell/
 *   BASE_URL=http://127.0.0.1:<port> node scripts/tests/grey-screen-repro.mjs /
 *
 * Exits non-zero if the page renders no visible content.
 */
if (fs.existsSync('/tmp/al2023/lib')) {
  // Headless Chromium runtime libraries (extracted from @sparticuz/chromium's
  // al2023.tar.br) — only present in some sandboxes; harmless elsewhere.
  process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
}
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const routePath = process.argv[2] || '/';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT = path.resolve('.audit/out');
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: [...chromium.args.filter((a) => a !== '--single-process'), '--no-sandbox'],
  headless: 'shell'
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const logs = [];
  page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });

  const url = routePath === '/' ? BASE + '/' : BASE + routePath;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  const report = await page.evaluate(() => {
    const root = document.getElementById('root');
    const text = (root?.innerText || '').replace(/\s+/g, ' ').trim();
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const main = document.querySelector('main');
    return {
      title: document.title,
      rootChildCount: root?.childElementCount ?? null,
      rootTextLength: text.length,
      rootTextPreview: text.slice(0, 200),
      mainTextLength: (main?.innerText || '').length,
      bodyBg,
      hasVisibleContent: text.length > 50
    };
  });

  const shot = path.join(OUT, `grey-screen-${routePath.replace(/\W+/g, '_') || 'home'}.png`);
  await page.screenshot({ path: shot, fullPage: false });

  console.log(JSON.stringify(report, null, 2));
  console.log('screenshot:', shot);
  console.log('--- browser logs ---');
  for (const l of logs) console.log(l);

  if (!report.hasVisibleContent) {
    console.error('FAIL: #root has no visible content — this is the grey screen.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
