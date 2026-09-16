process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
for (const path of ['/prototypes/PROT-001', '/prototypes/PROT-999', '/nonexistent-section']) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  const url = path === '/' || path.includes('.') ? path : path.replace(/\/$/, '') + '/';
  await page.goto(BASE + url, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));
  const info = await page.evaluate(() => ({
    dialog: document.querySelector('[role="dialog"]') ? (document.querySelector('[role="dialog"]').innerText || '').slice(0, 70).replace(/\s+/g,' ') : null,
    notCatalogued: /RECORD NOT CATALOGUED/i.test(document.body.innerText),
    notFound: /(SECTION NOT FOUND|404|NOT CATALOGUED IN THE ZIAA)/i.test(document.body.innerText),
    h1: (document.body.innerText.match(/\n[^\n]{0,60}\n/) || [''])[0].trim(),
    bodySnippet: document.body.innerText.replace(/\s+/g,' ').slice(300, 700)
  }));
  console.log('\n==', path, JSON.stringify(info, null, 1), 'errs:', errs.length);
  await page.close();
}
await browser.close();
