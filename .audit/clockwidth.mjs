process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const W = Number(process.env.W || 1440), URLP = process.env.URLP || '/';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__w = [];
  document.addEventListener('DOMContentLoaded', () => {
    const id = setInterval(() => {
      const t = document.querySelector('header time');
      if (t) window.__w.push([Math.round(performance.now()), +t.getBoundingClientRect().width.toFixed(2), t.textContent.trim().slice(0, 24)]);
    }, 100);
    setTimeout(() => clearInterval(id), 6000);
  });
});
await page.goto('http://127.0.0.1:4173' + URLP, { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 7000));
const w = await page.evaluate(() => window.__w);
const uniq = [...new Set(w.map(x => x[1]))];
console.log(URLP, 'time-element widths seen:', uniq.join(', '), '| samples', w.length);
await browser.close();
