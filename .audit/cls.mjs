process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const W = Number(process.env.W || 390);
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 844, deviceScaleFactor: 1 });
const client = await page.createCDPSession();
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: 400000 });
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluateOnNewDocument(() => {
  window.__cls = { total: 0, entries: [] };
  new PerformanceObserver(l => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__cls.total += e.value;
      window.__cls.entries.push({
        value: +e.value.toFixed(4), t: Math.round(e.startTime),
        sources: (e.sources || []).map(s => ({
          tag: s.node && s.node.tagName ? s.node.tagName.toLowerCase() : '?',
          cls: s.node && s.node.className ? String(s.node.className).slice(0, 60) : '',
          text: s.node && s.node.textContent ? String(s.node.textContent).trim().slice(0, 40) : ''
        }))
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
  window.__lt = { count: 0, total: 0, max: 0, items: [] };
  new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__lt.count++; window.__lt.total += e.duration; window.__lt.max = Math.max(window.__lt.max, Math.round(e.duration)); if (window.__lt.items.length < 6) window.__lt.items.push(Math.round(e.duration)); } }).observe({ type: 'longtask', buffered: true });
  window.__lcp = {};
  new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__lcp = { t: Math.round(e.startTime), el: (e.element && e.element.tagName + '.' + String(e.element.className||'').slice(0,50)) || e.url }; } }).observe({ type: 'largest-contentful-paint', buffered: true });
});
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 5000));
const dump = await page.evaluate(() => ({
  cls: window.__cls,
  lcp: window.__lcp,
  longTasks: window.__lt,
  fonts: document.fonts.status,
  resources: performance.getEntriesByType('resource').filter(r => /\.(js|css|woff2?)$/.test(r.name)).map(r => ({ n: r.name.split('/').pop(), kb: Math.round((r.encodedBodySize || 0) / 1024), t: Math.round(r.startTime) })),
  nav: (() => { const n = performance.getEntriesByType('navigation')[0]; const f = performance.getEntriesByName('first-contentful-paint')[0]; return { fcp: f && Math.round(f.startTime), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) }; })()
}));
console.log('CLS', dump.cls.total.toFixed(4), 'entries', dump.cls.entries.length, '| LCP', dump.lcp.t + 'ms', dump.lcp.el);
{
  const g = {};
  for (const e of dump.cls.entries) {
    const k = e.sources.map(x => (x.text || x.tag).slice(0, 22)).join('|') || '(unknown)';
    g[k] = (g[k] || 0) + e.value;
  }
  for (const [k, v] of Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 6)) console.log('   shift', v.toFixed(4), k);
  console.log('   shift times:', dump.cls.entries.map(e => e.t).join(','));
}
console.log('FCP', dump.nav.fcp, 'DCL', dump.nav.dcl, 'LOAD', dump.nav.load);
console.log('long tasks:', dump.longTasks.count, 'total', Math.round(dump.longTasks.total) + 'ms', 'max', dump.longTasks.max + 'ms');
const byType = { js: 0, css: 0, font: 0 };
for (const r of dump.resources) { if (r.n.endsWith('.js')) byType.js += r.kb; else if (r.n.endsWith('.css')) byType.css += r.kb; else byType.font += r.kb; }
console.log('bytes at 6s (kb):', JSON.stringify(byType));
console.log('js order:', dump.resources.filter(r => r.n.endsWith('.js')).map(r => r.n + '@' + r.t).join(' '));
await browser.close();
