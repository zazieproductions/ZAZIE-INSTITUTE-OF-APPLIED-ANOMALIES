process.env.LD_LIBRARY_PATH = '/tmp/al2023/lib:' + (process.env.LD_LIBRARY_PATH || '');
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args.filter(a=>a!=='--single-process'),'--no-sandbox'], headless: 'shell' });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
page.on('pageerror', e => { if (!/Failed to fetch/.test(String(e))) console.log('  PAGEERROR:', String(e).slice(0,200)); });
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 1200));

// open via button
await page.click('button[aria-label="Open the archive search"]');
await new Promise(r => setTimeout(r, 1500));
console.log('dialog open:', await page.evaluate(() => !!document.querySelector('[role="dialog"]')));
await page.keyboard.type('PLASMA');
await new Promise(r => setTimeout(r, 800));
console.log('results:', await page.evaluate(() => (document.querySelector('[role="dialog"]').innerText.match(/PROT-\d+|PAT-\d+/g) || []).slice(0,4)));

// click the first result row
const clicked = await page.evaluate(() => {
  const row = document.querySelector('[role="dialog"] [role="button"]');
  if (!row) return null;
  row.click();
  return row.innerText.slice(0, 40).replace(/\s+/g, ' ');
});
await new Promise(r => setTimeout(r, 2000));
console.log('clicked row:', clicked);
console.log('dossier:', await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  return d ? (d.innerText || '').slice(0, 60).replace(/\s+/g, ' ') : null;
}));
console.log('url:', await page.evaluate(() => location.pathname));

// Escape closes + clears
await page.keyboard.press('Escape');
await new Promise(r => setTimeout(r, 800));
console.log('after esc, dialogs:', await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length), 'url:', await page.evaluate(() => location.pathname));

// reopen: query must be empty (fresh state)
await page.click('button[aria-label="Open the archive search"]');
await new Promise(r => setTimeout(r, 1200));
console.log('reopened input value:', await page.evaluate(() => document.querySelector('[role="dialog"] input').value));
// backdrop click closes
await page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); d.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
await new Promise(r => setTimeout(r, 600));
console.log('after backdrop click, dialogs:', await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length));

// keyboard shortcut route
await page.keyboard.down('Meta'); await page.keyboard.press('k'); await page.keyboard.up('Meta');
await new Promise(r => setTimeout(r, 900));
console.log('after cmd+k, dialogs:', await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length), 'value:', await page.evaluate(() => { const i = document.querySelector('[role="dialog"] input'); return i ? JSON.stringify(i.value) : null; }));
await browser.close();
