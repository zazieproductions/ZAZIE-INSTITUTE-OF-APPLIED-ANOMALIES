process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const W = Number(process.env.W || 1440);
const FIX = process.env.FIX || '';           // CSS injected at document-start
const FIX_LATE = process.env.FIX_LATE || ''; // CSS injected after load (control)
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 900 });
const client = await page.createCDPSession();
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 400000, uploadThroughput: 400000 });
await client.send('Emulation.setCPUThrottlingRate', { rate: 2 });
await page.evaluateOnNewDocument((css, cssLate) => {
  window.__vit = { cls: 0, samples: [] };
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vit.cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
  if (css) {
    const add = () => { const s = document.createElement('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s); };
    if (document.documentElement) add(); else document.addEventListener('readystatechange', add, { once: true });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const id = setInterval(() => {
      const d = document.documentElement;
      window.__vit.samples.push([Math.round(performance.now()), d.clientWidth, d.scrollHeight]);
    }, 120);
    setTimeout(() => clearInterval(id), 7000);
  });
  if (cssLate) document.addEventListener('load', () => { const s = document.createElement('style'); s.textContent = cssLate; document.head.appendChild(s); });
}, FIX, FIX_LATE);
await page.goto(BASE + '/', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 8000));
const v = await page.evaluate(() => window.__vit);
let prev = null; const timeline = [];
for (const [t, w, h] of v.samples) { const k = w + 'x' + h; if (k !== prev) { timeline.push(`${t}ms w=${w} h=${h}`); prev = k; } }
console.log(`W=${W} fix=${JSON.stringify(FIX)} CLS=${v.cls.toFixed(4)}`);
console.log('  timeline:', timeline.join(' | '));
await browser.close();
