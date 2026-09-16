process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const PORT = process.env.PORT || 4173;
const RAW = (process.env.ROUTES || '/,/prototypes,/patents,/research-notes,/monographs,/acoustic-bench,/spectra-lab,/synthesis-signal,/void-oculus,/field-stations,/post-mortems,/system-audit,/fellows,/disciplines,/papers,/search,/about').split(',');
const TRAIL = process.env.TRAIL !== '0';
const ROUTES = RAW.map(r => TRAIL && r !== '/' && !r.endsWith('//') ? (r.endsWith('/') ? r : r + '/') : r);
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
for (const r of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).split('\n')[0].slice(0, 90)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION|Failed to fetch|rrweb/i.test(m.text())) errs.push('C: ' + m.text().split('\n')[0].slice(0, 90)); });
  await page.goto('http://127.0.0.1:' + PORT + r, { waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(x => setTimeout(x, 2500));
  console.log(r.padEnd(18), errs.length ? errs.length + ' ERRORS: ' + errs[0] : 'clean');
  await page.close();
}
await browser.close();
