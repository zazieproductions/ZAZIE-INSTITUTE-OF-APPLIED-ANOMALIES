process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const W = Number(process.env.W || 390);
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: 900 });
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
await page.evaluate(() => { const b = Array.from(document.querySelectorAll('nav button')).find(x => x.textContent.includes('PROTOTYPES')); if (b) b.click(); });
await new Promise(r => setTimeout(r, 1200));
await page.evaluate(() => { const cards = document.querySelectorAll('main div[class*="cursor-pointer"]'); if (cards[0]) cards[0].click(); });
await new Promise(r => setTimeout(r, 1200));
console.log(JSON.stringify(await page.evaluate(() => {
  const modal = document.querySelector('.fixed.inset-0');
  const header = modal.querySelector('.flex.items-center.justify-between');
  const btns = Array.from(header.querySelectorAll('button')).map(b => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), title: b.getAttribute('title') }; });
  const headerRect = header.getBoundingClientRect();
  // scroll through modal content and count overflowing scroll containers
  const scrollers = Array.from(modal.querySelectorAll('*')).filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0).map(el => ({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), sw: el.scrollWidth, cw: el.clientWidth }));
  return { headerW: Math.round(headerRect.width), vw: document.documentElement.clientWidth, btns, scrollers: scrollers.slice(0,10) };
}), null, 1));
await browser.close();
