process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const PATHS = (process.env.PATHS || '/prototypes/prot-999,/prototypes/PROT-001').split(',');
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
for (const p of PATHS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(BASE + p, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  const info = await page.evaluate(() => ({
    status: document.title,
    dialog: !!document.querySelector('[role="dialog"]'),
    h1: (document.querySelector('h1') || {}).textContent?.slice(0, 60) || '',
    msg: (document.body.innerText.match(/(not found|no entry|no record|no matching)[^\n]{0,80}/i) || [''])[0],
    links: document.querySelectorAll('a[href^="/prototypes/"]').length
  }));
  console.log(p.padEnd(24), JSON.stringify(info));
  await page.close();
}
await browser.close();
