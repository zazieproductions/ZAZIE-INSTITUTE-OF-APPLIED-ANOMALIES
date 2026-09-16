process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const W = Number(process.env.W || 1440);
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: W >= 1024 ? 900 : 844, deviceScaleFactor: 1 });
const client = await page.createCDPSession();
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: 400000 });
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluateOnNewDocument(() => {
  window.__ev = [];
  const mark = (name) => window.__ev.push({ name, t: Math.round(performance.now()) });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') mark('FCP'); }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) mark('LCP'); }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ev.push({ name: 'SHIFT:' + e.value.toFixed(3), t: Math.round(e.startTime) }); }).observe({ type: 'layout-shift', buffered: true });
  document.addEventListener('DOMContentLoaded', () => {
    const m = document.querySelector('main');
    let last = -1;
    const id = setInterval(() => {
      const h = m ? Math.round(m.getBoundingClientRect().height) : -1;
      if (h !== last) { last = h; window.__ev.push({ name: 'mainH=' + h, t: Math.round(performance.now()) }); }
    }, 40);
    setTimeout(() => clearInterval(id), 7000);
  });
});
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 7500));
const ev = await page.evaluate(() => window.__ev);
for (const e of ev) console.log(String(e.t).padStart(6), e.name);
await browser.close();
