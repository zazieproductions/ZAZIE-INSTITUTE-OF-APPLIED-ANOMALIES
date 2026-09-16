/**
 * ZIAA responsive + reliability audit harness.
 * Runs Chromium (sparticuz headless shell) against a URL and reports:
 *  - console errors / page errors / failed requests
 *  - horizontal overflow (page level + offending elements)
 *  - small tap targets
 *  - text clipped / tiny font sizes
 *  - key perf metrics (FCP, LCP, CLS, long tasks)
 *  - screenshots per viewport
 */
process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib' + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const OUT = path.resolve('.audit/out');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
};

/* Routes of the v2 architecture (react-router). */
const TABS = [
  ['/', 'OVERVIEW'],
  ['/prototypes', 'PROTOTYPES'],
  ['/patents', 'SPECULATIVE PATENTS'],
  ['/research-notes', 'RESEARCH NOTES'],
  ['/monographs', 'MONOGRAPHS'],
  ['/acoustic-bench', 'ACOUSTIC BENCH'],
  ['/spectra-lab', 'SPECTRA//LAB'],
  ['/synthesis-signal', 'SYNTHESIS//SIGNAL'],
  ['/void-oculus', 'VOID//OCULUS'],
  ['/field-stations', 'FIELD STATIONS'],
  ['/post-mortems', 'ANOMALY POST-MORTEMS'],
  ['/system-audit', 'SYSTEM AUDIT'],
  ['/fellows', 'FELLOWS'],
  ['/disciplines', 'DIVISIONS'],
  ['/papers', 'PAPERS'],
  ['/search', 'SEARCH'],
  ['/about', 'ABOUT']
];

const IGNORE_URL = /designarena\.ai|fonts\.googleapis\.com|fonts\.gstatic\.com|googlevideo|localhost:3000/;

const only = process.argv[2] ? process.argv[2].split(',') : null;
const onlyVp = process.argv[3] ? process.argv[3].split(',') : null;

const collect = () => {
  const res = { overflow: null, smallTargets: [], tinyText: [], issues: [] };
  const vw = window.innerWidth;
  const de = document.documentElement;
  res.overflow = {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    overflows: de.scrollWidth > de.clientWidth + 1
  };
  if (res.overflow.overflows) {
    const offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.right > vw + 1.5 || r.left < -1.5) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 140),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 60)
        });
      }
    });
    // keep the outermost/shortest list: dedupe by text
    const seen = new Set();
    res.overflow.offenders = offenders.filter(o => {
      const k = o.tag + o.text + o.width;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 25);
  }
  // tap targets
  document.querySelectorAll('button, a, [role="button"], select, input[type="checkbox"], input[type="radio"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (r.height < 24 || r.width < 24) {
      res.smallTargets.push({
        tag: el.tagName.toLowerCase(),
        w: Math.round(r.width),
        h: Math.round(r.height),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 45),
        cls: (el.className || '').toString().slice(0, 90)
      });
    }
  });
  res.smallTargets = res.smallTargets.slice(0, 30);
  // tiny text
  const seenT = new Set();
  document.querySelectorAll('body *').forEach(el => {
    if (!el.childNodes.length) return;
    const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 10.5) {
      const key = el.tagName + (el.className || '').toString().slice(0, 50);
      if (seenT.has(key)) return;
      seenT.add(key);
      res.tinyText.push({ fs: +fs.toFixed(1), text: el.textContent.trim().slice(0, 45), cls: (el.className || '').toString().slice(0, 80) });
    }
  });
  res.tinyText = res.tinyText.slice(0, 25);
  // clipped text (overflow hidden with scrollWidth > clientWidth)
  const clipped = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.overflowX === 'visible' && cs.overflowY === 'visible') return;
    if (el.scrollWidth > el.clientWidth + 4 && el.clientWidth > 0 && cs.overflowX === 'hidden' && el.children.length === 0) {
      clipped.push({
        text: (el.textContent || '').trim().slice(0, 50),
        cls: (el.className || '').toString().slice(0, 80),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      });
    }
  });
  res.clipped = clipped.slice(0, 15);
  return res;
};

const perfSnapshot = () => new Promise(resolve => {
  const out = { fcp: null, lcp: null, cls: 0, longTasks: 0, longTaskTime: 0, domNodes: 0 };
  try {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcp) out.fcp = Math.round(fcp.startTime);
    const nav = performance.getEntriesByType('navigation')[0];
    out.domContentLoaded = nav ? Math.round(nav.domContentLoadedEventEnd) : null;
    out.loadEvent = nav ? Math.round(nav.loadEventEnd) : null;
    out.domNodes = document.getElementsByTagName('*').length;
    out.transferKB = Math.round(performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0) / 1024);
    out.byType = {};
    performance.getEntriesByType('resource').forEach(r => {
      const ext = (r.name.split('?')[0].split('.').pop() || '').slice(0, 5);
      out.byType[ext] = Math.round(((out.byType[ext] || 0) + (r.transferSize || 0) / 1024));
    });
  } catch (e) { /* ignore */ }
  resolve(out);
});

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: [...chromium.args.filter(a => a !== '--single-process'), '--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  headless: 'shell',
  protocolTimeout: 120000
});

const report = {};
for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  if (onlyVp && !onlyVp.includes(vpName)) continue;
  const page = await browser.newPage();
  await page.setViewport(vp);
  const errors = [];
  const failed = [];
  page.on('console', m => {
    if (m.type() === 'error') {
      const t = m.text();
      if (!IGNORE_URL.test(t)) errors.push(t.slice(0, 400));
    }
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 400)));
  page.on('requestfailed', r => {
    if (!IGNORE_URL.test(r.url())) failed.push(r.url().slice(0, 160) + ' :: ' + (r.failure()?.errorText || ''));
  });

  report[vpName] = { tabs: {}, errors, failed };

  for (const [key, label] of TABS) {
    if (only && !only.includes(key)) continue;
    // v2 routes are real URLs, so each section is opened directly (this also
    // exercises the exact deep-link path a visitor or crawler would take).
    // Directory-style prerender output needs the trailing slash: without it the
    // preview server falls back to dist/index.html and React sees the wrong page.
    const url = key === '/' ? key : key.replace(/\/$/, '') + '/';
    await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await new Promise(r => setTimeout(r, key === '/synthesis-signal' || key === '/spectra-lab' ? 3500 : 1200));
    let tab = {};
    try { tab = await page.evaluate(collect); } catch (e) { tab = { error: String(e) }; }
    try { tab.perf = await page.evaluate(perfSnapshot); } catch (e) { /* ignore */ }
    report[vpName].tabs[key] = tab;
    const slug = key === '/' ? 'dashboard' : key.replace(/^\//, '').replace(/\//g, '-');
    await page.screenshot({ path: path.join(OUT, `${vpName}-${slug}.png`), fullPage: false });
  }
  await page.close();
}

// Perf run: cold mobile load of dashboard with CPU/network throttle
try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORTS.mobile);
  const client = await page.createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluateOnNewDocument(() => {
    window.__vit = { lcp: 0, cls: 0, lcpEl: '', lt: 0, ltMax: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__vit.lcp = Math.round(e.startTime); window.__vit.lcpEl = (e.element && (e.element.tagName + '.' + (e.element.className || '').toString().slice(0, 40))) || e.url || ''; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.hadRecentInput) window.__vit.cls += e.value; } }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__vit.lt += 1; window.__vit.ltMax = Math.max(window.__vit.ltMax, Math.round(e.duration)); } }).observe({ type: 'longtask', buffered: true });
  });
  const t0 = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 90000 });
  const loadMs = Date.now() - t0;
  await new Promise(r => setTimeout(r, 4000));
  const vit = await page.evaluate(() => window.__vit);
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null, transferKB: Math.round(performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0) / 1024) };
  });
  report.perfMobileThrottled = { ...vit, ...nav, wallLoadMs: loadMs };
  await page.screenshot({ path: path.join(OUT, 'mobile-throttled-dashboard.png') });
  await page.close();
} catch (e) {
  report.perfMobileThrottled = { error: String(e) };
}

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await browser.close();
