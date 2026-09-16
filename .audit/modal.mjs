process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const W = Number(process.env.W || 390);
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 900 });
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
// open prototypes tab, then first card
await page.evaluate(() => { const b = Array.from(document.querySelectorAll('nav button')).find(x => x.textContent.includes('PROTOTYPES')); if (b) b.click(); });
await new Promise(r => setTimeout(r, 1200));
await page.evaluate(() => { const cards = document.querySelectorAll('main div[class*="cursor-pointer"]'); if (cards[0]) cards[0].click(); });
await new Promise(r => setTimeout(r, 1500));
const res = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right <= vw + 1) return;
    let p = el.parentElement, clipped = false;
    while (p && p !== document.documentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== 'visible') { clipped = true; break; } p = p.parentElement; }
    if (clipped) return;
    offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,100), right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent||'').trim().slice(0,40) });
  });
  const modal = document.querySelector('.fixed.inset-0');
  const modalBox = modal ? modal.querySelector('div') : null;
  const tbl = modal ? modal.querySelector('table') : null;
  const modalScroller = modal ? modal.querySelector('.overflow-y-auto') : null;
  return { vw, docSW: document.documentElement.scrollWidth, modalOpen: !!modal,
    modalRect: modalBox ? (r => ({ w: Math.round(r.width), h: Math.round(r.height) }))(modalBox.getBoundingClientRect()) : null,
    contentScroll: modalScroller ? { sw: modalScroller.scrollWidth, cw: modalScroller.clientWidth } : null,
    tableW: tbl ? Math.round(tbl.getBoundingClientRect().width) : null,
    offenders: offenders.slice(0, 20) };
});
console.log(JSON.stringify(res, null, 1));
await page.screenshot({ path: `.audit/out/modal-${W}.png` });
await browser.close();
