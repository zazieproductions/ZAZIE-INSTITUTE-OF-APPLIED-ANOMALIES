process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const block = process.env.BLOCK === '1';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
const W = Number(process.env.W || 390);
await page.setViewport({ width: W, height: W >= 1024 ? 900 : 844, deviceScaleFactor: 1, isMobile: process.env.MOBILE === '1', hasTouch: process.env.MOBILE === '1' });
if (block) {
  await page.setRequestInterception(true);
  page.on('request', r => (/woff2?$/.test(r.url()) ? r.abort() : r.continue()));
}
const client = await page.createCDPSession();
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: 400000 });
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.evaluateOnNewDocument(() => {
  window.__cls = 0;
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto(BASE + '/', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 5000));
console.log(`W=${W}`, block ? 'WOFF BLOCKED' : 'fonts on', 'CLS =', await page.evaluate(() => +window.__cls.toFixed(4)));
await browser.close();
