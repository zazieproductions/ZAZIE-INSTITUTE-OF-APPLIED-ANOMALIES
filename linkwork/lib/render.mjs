/**
 * CIT-01 // renderer.
 * Five archetype chromes (dossier, notebook, index-card, catalogue,
 * field-report) so no two annexes share a template fingerprint.
 * Self-contained HTML: system fonts, inline CSS, zero third-party requests.
 *
 * Staging is physical: a node whose go-live date is in the future ships
 * with robots noindex,nofollow AND a visible STAGED banner. The auditor
 * fails the build if a future-dated surface could ever be indexed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { composePage, pageDescription, stripTags } from './content.mjs';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PALETTES = {
  paper: { bg: '#f5f1e8', ink: '#1e2124', rule: '#b5ad9c', accent: '#7a2e2e', panel: '#efe9db' },
  bone: { bg: '#ece9e1', ink: '#22262a', rule: '#a9a396', accent: '#2e4a5a', panel: '#e3ded2' },
  manila: { bg: '#e9ddc4', ink: '#26221a', rule: '#b3a179', accent: '#833c1f', panel: '#e0d1b0' },
  sage: { bg: '#edf0e4', ink: '#232823', rule: '#a8b298', accent: '#3d5a3d', panel: '#e2e8d4' },
  slate: { bg: '#212528', ink: '#e8e4da', rule: '#4a5158', accent: '#c9a86a', panel: '#2a2f33' },
};
const FONTS = {
  serif: `Iowan Old Style, Palatino Linotype, Palatino, Georgia, 'Times New Roman', serif`,
  mono: `ui-monospace, 'Cascadia Mono', 'SF Mono', Menlo, Consolas, monospace`,
  sans: `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
};

function archetypeDesign(archetype, r) {
  const pick = (arr) => arr[Math.floor(r.next() * arr.length)];
  switch (archetype) {
    case 'dossier':
      return { palette: pick(['paper', 'bone', 'sage']), font: FONTS.serif, chrome: 'dossier' };
    case 'notebook':
      return { palette: pick(['paper', 'bone']), font: FONTS.mono, chrome: 'notebook' };
    case 'index-card':
      return { palette: pick(['manila', 'paper', 'bone']), font: FONTS.serif, chrome: 'index-card' };
    case 'catalogue':
      return { palette: pick(['bone', 'sage', 'paper']), font: FONTS.sans, chrome: 'catalogue' };
    case 'field-report':
      return { palette: pick(['paper', 'manila', 'slate']), font: FONTS.mono, chrome: 'field-report' };
    default:
      return { palette: 'paper', font: FONTS.serif, chrome: 'dossier' };
  }
}

function cssFor({ palette, font, chrome }) {
  const c = PALETTES[palette];
  const common = `:root{--bg:${c.bg};--ink:${c.ink};--rule:${c.rule};--accent:${c.accent};--panel:${c.panel}}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:${font};line-height:1.6;font-size:17px}
.wrap{max-width:46rem;margin:0 auto;padding:3rem 1.4rem 4rem}
a{color:var(--accent);text-underline-offset:2px}
a:hover{text-decoration-thickness:2px}
.kicker{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75;margin-bottom:.9rem}
h1{font-size:1.9rem;line-height:1.15;margin:.2rem 0 .6rem;font-weight:700}
.subtitle{font-style:italic;opacity:.85;margin-bottom:2rem}
section{margin:2.2rem 0}
h2{font-size:1.02rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.8rem;padding-bottom:.35rem;border-bottom:1px solid var(--rule)}
p{margin:0 0 1rem}
ul.entries,ul.log,ol.citations{list-style:none;margin:0 0 1rem}
ul.entries li,ul.log li{padding:.55rem 0;border-bottom:1px dotted var(--rule)}
.stamp{font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;opacity:.7;display:inline-block;margin-right:.5rem}
.register{background:var(--panel);padding:1.2rem 1.4rem;border:1px solid var(--rule)}
.register h2{border:none;padding:0;margin-bottom:.6rem}
ol.citations li{padding:.45rem 0;border-bottom:1px dotted var(--rule)}
ol.citations .note{display:block;font-size:.82rem;opacity:.72}
.closer{font-style:italic;opacity:.8;margin-top:2.4rem}
footer{margin-top:3.5rem;padding-top:1.2rem;border-top:1px solid var(--rule);font-size:.85rem;opacity:.85}
footer .fine{opacity:.75;font-size:.78rem;margin-top:.35rem}
.staged{background:var(--accent);color:var(--bg);text-align:center;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;padding:.45rem 1rem}
table.ledger-table{width:100%;border-collapse:collapse;font-size:.9rem;margin:0 0 1rem}
table.ledger-table th{text-align:left;border-bottom:2px solid var(--rule);padding:.4rem .5rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}
table.ledger-table td{border-bottom:1px dotted var(--rule);padding:.4rem .5rem;vertical-align:top}`;
  const chromeCss = {
    dossier: `.wrap{padding-top:4rem}h1{font-weight:400}header{text-align:center;margin-bottom:1rem}header .kicker{margin-bottom:.4rem}`,
    notebook: `body{background-image:repeating-linear-gradient(0deg,transparent,transparent 31px,${c.rule}33 31px,${c.rule}33 32px)}h1{font-size:1.5rem}header{border-left:3px solid var(--accent);padding-left:1rem}`,
    'index-card': `.wrap{max-width:34rem;margin-top:4rem;background:var(--panel);border:1px solid var(--rule);border-radius:4px;box-shadow:2px 3px 0 #0002;padding:2.4rem 2.2rem}.kicker{color:var(--accent)}h1{font-size:1.45rem}.subtitle{font-size:.95rem}`,
    catalogue: `body{font-size:16px}header{border-bottom:3px double var(--rule);padding-bottom:1.2rem;margin-bottom:1rem}h1{font-size:1.6rem}`,
    'field-report': `.kicker{color:var(--accent)}h1{font-size:1.4rem;text-transform:uppercase;letter-spacing:.04em}header{border:1px solid var(--rule);padding:1.2rem;margin-bottom:1.5rem}.stamp{background:var(--rule);padding:0 .3rem}`,
  };
  return `<style>${common}${chromeCss[chrome] || ''}</style>`;
}

const FOOTER_LINES = [
  'An independent study annex of the Zazie Institute of Applied Anomalies — zazieinstitute.org',
  'A study annex of the Zazie Institute of Applied Anomalies. The archive lives at zazieinstitute.org.',
  'Maintained beside the Zazie Institute of Applied Anomalies archive — zazieinstitute.org',
  'One of several study annexes kept by the Zazie Institute of Applied Anomalies · zazieinstitute.org',
  'An annex of the Zazie Institute of Applied Anomalies; canonical records at zazieinstitute.org',
];
const FINE_PRINT = [
  'Institute disclaimers apply. This annex is not an accredited institution and asserts no credential; records cited here are maintained canonically in the ZIAA Research Archive.',
  'Not an accredited institution; no credential is asserted. Canonical records live in the ZIAA Research Archive.',
  'The Institute’s legal notices apply throughout. Canonical copies of every cited record are kept in the ZIAA Research Archive.',
  'An unaccredited study surface. Whatever is cited here canonically lives in the ZIAA Research Archive.',
];

function provenanceFooter(r) {
  const line = FOOTER_LINES[Math.floor(r.next() * FOOTER_LINES.length)];
  const fine = FINE_PRINT[Math.floor(r.next() * FINE_PRINT.length)];
  return `<footer>
<p>${line}</p>
<p class="fine">${fine}</p>
</footer>`;
}

function head({ title, description, canonical, staged, goLive, css }) {
  const robots = staged ? 'noindex, nofollow' : 'index, follow';
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'ZIAA Study Annexes' },
  };
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="${robots}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${css ? `<style>${css}</style>` : ''}
</head>`;
}

function shell({ node, design, pageKey, composed, page, staged, innerNav, r }) {
  const { masthead } = composed;
  const banner = staged
    ? `<div class="staged">STAGED · NOT YET ANNOUNCED · GO-LIVE ${esc(node.goLive)}</div>`
    : '';
  const nav = innerNav?.length
    ? `<nav class="innernav"><p>${innerNav
        .map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`)
        .join(' · ')}</p></nav>`
    : '';
  return `<!doctype html>
<html lang="en">
${head({
    title: composed.title,
    description: pageDescription(node, pageKey, composed),
    canonical: page.url,
    staged,
    goLive: node.goLive,
    css: cssFor(design),
  })}
<body>
${banner}
<div class="wrap">
<header>
<p class="kicker">${esc(masthead.kicker)}</p>
<h1>${esc(composed.title)}</h1>
<p class="subtitle">${esc(masthead.subtitle)}</p>
</header>
${nav}
<main>
${composed.bodyHtml}
</main>
${provenanceFooter(r)}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Site emitter                                                        */
/* ------------------------------------------------------------------ */

export function renderSite(graph, spec, { outDir, epoch, today }) {
  const files = [];
  const write = (rel, content) => {
    const abs = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    files.push({ path: rel, bytes: Buffer.byteLength(content), sha256: crypto.createHash('sha256').update(content).digest('hex').slice(0, 16) });
  };

  for (const node of graph.nodes) {
    const r = { next: (() => { let s = 0; for (const ch of node.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0; const f = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; return f; })() };
    const design = archetypeDesign(node.archetype, r);
    const staged = node.goLive > today;
    const base = node.path ? `${node.url}/${node.path}` : node.url;

    // Vessel inner pages first (nav needs them)
    const innerNav = (node.inner || []).map((p) => ({
      href: `${base}/${p.slug}`,
      label: shortLabel(p.title),
    }));
    const pages = [{ key: 'index', url: base }, ...(node.inner || []).map((p) => ({ key: p.slug, url: `${base}/${p.slug}` }))];

    for (const page of pages) {
      const pageEdges = graph.outEdges.get(node.id).filter((e) => (e.page || 'index') === page.key);
      const composed = composePage(node, page.key, pageEdges, spec.seed, epoch);
      const html = shell({ node, design, pageKey: page.key, composed, page, staged, innerNav: page.key === 'index' ? innerNav : innerNav.filter((n) => !n.href.endsWith(page.key)), r });
      write(`${node.id}/${page.key === 'index' ? 'index.html' : `${page.key}.html`}`, html);
    }

    write(`${node.id}/robots.txt`, robotsTxt(base, node));
    write(`${node.id}/sitemap.xml`, sitemapXml(pages, today));
    write(
      `${node.id}/DEPLOY.md`,
      deployReadme(node, spec, staged)
    );
  }
  return files;
}

function shortLabel(t) {
  const words = t.split(/\s+/);
  return words.slice(0, 4).join(' ') + (words.length > 4 ? ' …' : '');
}

function robotsTxt(base, node) {
  return `# ${node.title} — study annex. Staging enforced by meta robots before ${node.goLive}.
User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

function sitemapXml(pages, today) {
  const urls = pages
    .map((p) => `  <url><loc>${esc(p.url)}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function deployReadme(node, spec, staged) {
  const host = spec.hosts[node.hostToken];
  return `# DEPLOY — ${node.title} (${node.id})

- Tier: ${node.tier} · Voice: ${node.voice} · Archetype: ${node.archetype}
- Declared host: \`${host}\`
- Declared URL: ${node.url}
- GO-LIVE: **${node.goLive}** ${staged ? '→ CURRENTLY STAGED (noindex). Do not announce before go-live.' : '→ live per schedule.'}

## Procedure
1. Upload the contents of this folder to the declared host (manual step — the organ never touches the network, CHARTER §3).
2. Verify the rendered page shows NO \`STAGED\` banner and \`robots\` is \`index, follow\` only on/after the go-live date.
3. Before go-live, either hold the upload or accept noindex protection. Never announce a staged node.
4. Log the deployment in the custody ledger (out/ledger.json → deployedAt).

## Fingerprint hygiene (CHARTER §5)
- One host account per vessel family; never co-host two nodes on one account/IP.
- Do not add analytics, fonts, or any third-party script to this node.
- Do not cross-link this node from your personal accounts.
`;
}

/* ------------------------------------------------------------------ */
/* Tombstone renderer (decommission)                                   */
/* ------------------------------------------------------------------ */

export function renderTombstone(node, { today }) {
  const base = node.url;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Study concluded — ${esc(node.title)}</title>
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="12; url=https://zazieinstitute.org/">
<link rel="canonical" href="https://zazieinstitute.org/">
</head>
<body style="font-family:Georgia,serif;background:#f5f1e8;color:#1e2124">
<div style="max-width:40rem;margin:8rem auto;padding:0 1.4rem">
<h1>Study concluded.</h1>
<p>This study annex closed on ${esc(today)}. Its materials were absorbed into the
<a href="https://zazieinstitute.org/">Zazie Institute of Applied Anomalies Research Archive</a>,
where the canonical records are maintained.</p>
<p style="opacity:.7;font-style:italic">You will be redirected presently. Nothing here was ever urgent.</p>
</div>
</body>
</html>
`;
  return html;
}
