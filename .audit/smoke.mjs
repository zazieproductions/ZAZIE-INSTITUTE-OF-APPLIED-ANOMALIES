process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4300';
const IGNORE = /jsdelivr|rrweb|favicon|ERR_CONNECTION_CLOSED|Failed to fetch/i;
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const out = [];
async function open(path, w = 390, h = 844) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => { if (!IGNORE.test(String(e))) errs.push('PAGEERROR: ' + e); });
  const t0 = Date.now();
  // Directory-style prerender output resolves with a trailing slash.
  const url = path === '/' || path.includes('.') ? path : path.replace(/\/$/, '') + '/';
  await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500));
  return { page, errs, t0 };
}

// 1. deep link to a dossier
{
  const { page, errs } = await open('/prototypes/PROT-001');
  const dialog = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return d ? (d.innerText || '').slice(0, 90).replace(/\s+/g, ' ') : null;
  });
  out.push(['deep-link dossier', dialog ? 'OK: ' + dialog : 'FAIL (no dialog)', errs]);
  await page.close();
}

// 2. catalogue lists actually populate (lazy data)
{
  const { page, errs } = await open('/prototypes');
  const info = await page.evaluate(() => ({
    rows: document.querySelectorAll('article, li, [data-record]').length,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 80),
    card: (document.body.innerText.match(/PROT-\d+/g) || []).length
  }));
  out.push(['prototypes list', JSON.stringify(info), errs]);
  await page.close();
}

// 3. global search: type, select, verify modal + reset on close
{
  const { page, errs } = await open('/');
  await page.click('button[aria-label^="Open archive search"]');
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.type('PROT-040');
  await new Promise(r => setTimeout(r, 900));
  const found = await page.evaluate(() => ({
    open: !!document.querySelector('[role="dialog"]'),
    hits: (document.body.innerText.match(/PROT-040/g) || []).length
  }));
  // click first result
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b => /PROT-040/.test(b.innerText));
    if (btns[0]) { btns[0].click(); return true; } return false;
  });
  await new Promise(r => setTimeout(r, 1500));
  const after = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return { dialog: d ? (d.innerText || '').slice(0, 60).replace(/\s+/g,' ') : null, searching: !!document.querySelector('input[type="search"], input[placeholder*="Search" i]') };
  });
  out.push(['search flow', JSON.stringify({ ...found, clicked, after }), errs]);
  await page.close();
}

// 4. unknown route -> branded 404 UI
{
  const { page, errs } = await open('/this/does/not/exist');
  const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 120));
  out.push(['404 view', txt, errs]);
  await page.close();
}

// 5. unknown record id -> clear message, no crash
{
  const { page, errs } = await open('/prototypes/PROT-999');
  const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 140));
  out.push(['missing record', txt, errs]);
  await page.close();
}

// 6. tablet + desktop content check
for (const [path, w] of [['/monographs', 768], ['/synthesis-signal', 1440], ['/acoustic-bench', 768]]) {
  const { page, errs } = await open(path, w, 900);
  const info = await page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, text: document.body.innerText.replace(/\s+/g,' ').length }));
  out.push([`${w}px ${path}`, JSON.stringify(info), errs]);
  await page.close();
}

for (const [name, val, errs] of out) {
  console.log(`\n### ${name}\n  ${val}\n  console errors: ${errs.length ? JSON.stringify(errs.slice(0,3)) : 'none'}`);
}
await browser.close();
