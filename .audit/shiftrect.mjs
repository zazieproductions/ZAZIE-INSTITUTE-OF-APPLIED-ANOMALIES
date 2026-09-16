process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const W = Number(process.env.W || 390);
const block = process.env.BLOCK === '1';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 844, deviceScaleFactor: 1 });
if (block) { await page.setRequestInterception(true); page.on('request', r => (/woff2?$/.test(r.url()) ? r.abort() : r.continue())); }
const client = await page.createCDPSession();
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: 400000 });
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluateOnNewDocument(() => {
  window.__t = [];
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__t.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources||[]).map(x => ({ n: x.node ? x.node.tagName + '.' + String(x.node.className||'').slice(0,34) : '?', prev: [Math.round(x.previousRect.x),Math.round(x.previousRect.y),Math.round(x.previousRect.width),Math.round(x.previousRect.height)], cur: [Math.round(x.currentRect.x),Math.round(x.currentRect.y),Math.round(x.currentRect.width),Math.round(x.currentRect.height)] })) }); }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto(process.env.URL || (BASE + '/'), { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 6000));
const t = await page.evaluate(() => window.__t);
for (const e of t) { console.log('shift', e.v, 'at', e.t + 'ms'); for (const s of e.src.slice(0, 5)) console.log('   ', s.n, 'prev', JSON.stringify(s.prev), '-> cur', JSON.stringify(s.cur)); }
await browser.close();
