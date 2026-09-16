process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const width = Number(process.env.W || 390);
const tabLabel = process.env.TAB || null;
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
if (tabLabel) {
  await page.evaluate(lbl => { const b = Array.from(document.querySelectorAll('nav button')).find(x => x.textContent.includes(lbl)); if (b) b.click(); }, tabLabel);
  await new Promise(r => setTimeout(r, 3000));
}
const out = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const scrollers = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') ) {
      const r = el.getBoundingClientRect();
      if (el.scrollWidth > el.clientWidth + 2 && r.right <= vw + 1) scrollers.push({ cls: (el.className||'').toString().slice(0,70), sw: el.scrollWidth, cw: el.clientWidth, text: (el.textContent||'').trim().slice(0,40) });
    }
  });
  const offending = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right <= vw + 1) return;
    const chain = [];
    let p = el.parentElement, clipped = false;
    while (p && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      chain.push(p.tagName.toLowerCase() + '[' + cs.overflowX + ']');
      if (cs.overflowX !== 'visible') { clipped = true; break; }
      p = p.parentElement;
    }
    if (clipped) return;
    offending.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,110), right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent||'').trim().slice(0,45) });
  });
  return { vw, docSW: document.documentElement.scrollWidth, bodySW: document.body.scrollWidth, offending: offending.slice(0,25), scrollers: scrollers.slice(0,10) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
