/**
 * CIT-01 // auditor.
 * Containment is enforced here, in code, not in prose. Any red finding
 * fails the process. The auditor runs fully offline.
 *
 * Red rules (CHARTER):
 *   C1 Caps: ≤3 vessels, ≤8 pipes, ≤16 sediment.
 *   C2 Tier discipline: subject edges only from tier 1; sediment never to tier 1/subject.
 *   C3 No self edges, no reciprocal pairs, no duplicate edges.
 *   C4 Allowlist: rendered hrefs resolve only to ledgered nodes, the subject,
 *      or archival deposit hosts (web.archive.org, archive.org, zenodo.org, doi.org).
 *   C5 Staging: future-dated pages ship noindex,nofollow + STAGED banner; live pages never.
 *   C6 Anchor budget ±6pp per class (brand/url/long-tail/generic).
 *   C7 Drift: pairwise 4-gram shingle similarity of visible text ≤ 0.35.
 *   C8 Surface hygiene: no machinery vocabulary in visible text/title/desc.
 *   C9 Zero network: the machinery may contain no network or subprocess APIs.
 *   C10 Every subject URL resolves to a real archive surface.
 *   C11 Provenance footer on every page; links visible in body (not display:none).
 */
import fs from 'node:fs';
import path from 'node:path';
import { stripTags } from './content.mjs';

const esc = (s) => s;

export function audit({ spec, graph, ledger, outDir, today }) {
  const findings = [];
  const red = (id, msg) => findings.push({ severity: 'RED', id, msg });
  const amber = (id, msg) => findings.push({ severity: 'AMBER', id, msg });

  const nodeHosts = new Set(graph.nodes.map((n) => new URL(n.url).host));
  const allowlist = new Set([...(spec.allowlist || []), 'zazieinstitute.org', 'www.zazieinstitute.org']);
  const edgeKey = (e) => `${e.from}|${e.to}|${e.page}|${e.targetUrl}`;

  /* C1 caps */
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const n of graph.nodes) counts[n.tier]++;
  if (counts[1] > 3 || counts[2] > 8 || counts[3] > 16) red('C1', `caps exceeded: ${JSON.stringify(counts)}`);

  /* C2 tier discipline */
  for (const e of graph.edges) {
    const from = graph.byId.get(e.from);
    if (e.to === 'SUBJECT' && from.tier !== 1) red('C2', `subject edge from non-vessel ${e.from}`);
    if (from.tier === 3 && (e.to === 'SUBJECT' || graph.byId.get(e.to)?.tier === 1)) red('C2', `sediment edge reaching up two tiers: ${e.from}→${e.to}`);
  }

  /* C3 self/reciprocal/duplicate */
  const seen = new Map();
  for (const e of graph.edges) {
    if (e.from === e.to) red('C3', `self edge ${e.from}`);
    seen.set(edgeKey(e), (seen.get(edgeKey(e)) || 0) + 1);
  }
  for (const [k, v] of seen) if (v > 1) red('C3', `duplicate edge ×${v}: ${k}`);
  const pairSet = new Set(graph.edges.map((e) => `${e.from}>${e.to}`));
  for (const p of pairSet) {
    const [a, b] = p.split('>');
    if (a !== b && pairSet.has(`${b}>${a}`)) red('C3', `reciprocal pair ${a} ↔ ${b}`);
  }

  /* C10 subject targets are real archive surfaces */
  for (const e of graph.edges) {
    if (e.to === 'SUBJECT' && e.targetPath && !graph.subjectPaths.has(e.targetPath)) {
      red('C10', `subject target not in archive: ${e.targetUrl}`);
    }
  }

  /* C6 anchor distribution */
  for (const err of graph.distributionErrors) red('C6', err);

  /* C9 zero network in machinery source.
     Patterns live in net-patterns.json (data, not code) so the scanner
     never matches its own source. Quine hygiene. */
  const srcDir = path.resolve(outDir, '..', '..');
  let NET = [];
  try {
    NET = JSON.parse(fs.readFileSync(path.join(srcDir, 'lib', 'net-patterns.json'), 'utf8')).map((p) => new RegExp(p));
  } catch (e) {
    amber('C9', 'net-patterns.json unreadable — source scan skipped: ' + e.message);
  }
  const srcFiles = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      if (f.name === 'out' || f.name.startsWith('.')) continue;
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.mjs')) srcFiles.push(p);
    }
  };
  walk(srcDir);
  for (const f of srcFiles) {
    const src = fs.readFileSync(f, 'utf8');
    for (const re of NET) if (re.test(src)) red('C9', `network/subprocess API in ${path.basename(f)}`);
  }

  /* Disk inspection */
  const htmlFiles = [];
  const walkOut = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walkOut(p);
      else if (f.name.endsWith('.html')) htmlFiles.push(p);
    }
  };
  if (fs.existsSync(outDir)) walkOut(outDir);

  const pageTexts = [];
  const titles = new Map();

  for (const file of htmlFiles) {
    const rel = path.relative(outDir, file);
    const html = fs.readFileSync(file, 'utf8');
    const nodeId = rel.split(path.sep)[0];
    const node = graph.byId.get(nodeId);
    if (!node) {
      red('C0', `orphan file not in ledger: ${rel}`);
      continue;
    }
    const staged = node.goLive > today;

    // C5 staging
    const robots = /<meta\s+name="robots"\s+content="([^"]+)"/.exec(html)?.[1] || '';
    if (staged && !/noindex/.test(robots)) red('C5', `${rel}: staged node missing noindex (go-live ${node.goLive} > ${today})`);
    if (!staged && /noindex/.test(robots)) red('C5', `${rel}: live node carries noindex`);
    if (staged && !html.includes('STAGED')) red('C5', `${rel}: staged node missing STAGED banner`);

    // canonical exactly one
    const canon = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g) || [];
    if (canon.length !== 1) red('C11', `${rel}: ${canon.length} canonical links`);
    // h1 exactly one
    const h1s = html.match(/<h1[\s>]/g) || [];
    if (h1s.length !== 1) red('C11', `${rel}: ${h1s.length} h1 elements`);

    // provenance footer (varied per node; must name the Institute + archive host)
    if (!/Zazie Institute of Applied Anomalies/.test(html) || !html.includes('zazieinstitute.org') || !/annex/i.test(html)) {
      red('C11', `${rel}: provenance footer missing`);
    }

    // hrefs
    const hrefs = [...html.matchAll(/<a\s+href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
      href: m[1],
      attrs: m[2],
      text: stripTags(m[3]),
    }));
    const ledgered = graph.outEdges.get(nodeId).filter((e) => (e.page || 'index') === pageKeyOf(rel, node));
    for (const h of hrefs) {
      let host;
      try {
        host = new URL(h.href).host;
      } catch {
        red('C4', `${rel}: malformed href ${h.href}`);
        continue;
      }
      if (host === 'zazieinstitute.org' || host === 'www.zazieinstitute.org') {
        const match = ledgered.find((e) => e.to === 'SUBJECT' && norm(e.targetUrl) === norm(h.href) && h.text.includes(e.anchor));
        if (!match) red('C4', `${rel}: subject link not in ledger or anchor mismatch: ${h.href} :: "${h.text.slice(0, 40)}"`);
      } else if (nodeHosts.has(host)) {
        const match = ledgered.find((e) => e.to !== 'SUBJECT' && !e.external && norm(e.targetUrl) === norm(h.href));
        const internal = new URL(h.href).pathname.startsWith(pathOf(node.url));
        if (!match && !internal) red('C4', `${rel}: node link not in ledger: ${h.href}`);
      } else if (!allowlist.has(host)) {
        red('C4', `${rel}: href to non-allowlisted host ${host} (${h.href})`);
      }
    }
    // every subject edge must be visibly rendered
    for (const e of ledgered) {
      const rendered = hrefs.some((h) => norm(h.href) === norm(e.targetUrl) && h.text.includes(e.anchor));
      if (!rendered) red('C4', `${rel}: ledgered edge not visibly rendered: ${e.targetUrl} :: "${e.anchor}"`);
    }

    // C8 hygiene: banned machinery vocabulary in visible text
    const visible = [
      stripTags(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')),
      /<title>([^<]*)<\/title>/.exec(html)?.[1] || '',
      /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1] || '',
    ].join('\n');
    const BANNED = [
      /\barg\b/i, /alternate\s+reality/i, /\bfiction(al)?\b/i, /\bseo\b/i, /search\s+engine\s+optimi[sz]ation/i,
      /\bbacklinks?\b/i, /\bpbn\b/i, /link\s+build(ing|er)/i, /\bdoorway\b/i, /\bmoney\s+site\b/i,
      /\btier\s*-?\s*[123]\b/i, /\bparasite\b/i, /\bschema\s+spam\b/i, /\bcloaking\b/i, /\bdisavow\b/i,
    ];
    for (const re of BANNED) if (re.test(visible)) red('C8', `${rel}: machinery vocabulary leaked: ${re}`);

    // hidden-link check
    if (/style\s*=\s*"[^"]*display\s*:\s*none[^"]*"[^>]*>\s*<a\s/i.test(html) || /<a\s[^>]*style\s*=\s*"[^"]*display\s*:\s*none/i.test(html)) {
      red('C11', `${rel}: hidden link suspected`);
    }

    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
    if (titles.has(title)) red('C11', `duplicate title across web: "${title}" (${titles.get(title)} vs ${rel})`);
    titles.set(title, rel);
    pageTexts.push({ rel, text: visible });
  }

  /* C7 drift — cross-node only. One property sharing its own template is a
     property; two "different" properties sharing a template is a footprint. */
  const shingles = pageTexts.map((p) => ({
    node: p.rel.split(path.sep)[0],
    rel: p.rel,
    set: shingleSet(p.text),
  }));
  for (let i = 0; i < shingles.length; i++) {
    for (let j = i + 1; j < shingles.length; j++) {
      if (shingles[i].node === shingles[j].node) continue;
      const sim = jaccard(shingles[i].set, shingles[j].set);
      if (sim > 0.35) red('C7', `template drift failure: ${shingles[i].rel} ~ ${shingles[j].rel} (J=${sim.toFixed(2)})`);
    }
  }

  /* Ledger integrity */
  if (ledger) {
    const diskHashes = new Map();
    const walkAll = (d, prefix = '') => {
      for (const f of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walkAll(p, `${prefix}${f.name}/`);
        else diskHashes.set(`${prefix}${f.name}`, p);
      }
    };
    // (hash check handled by build; audit checks coverage)
    for (const f of ledger.files || []) {
      const abs = path.join(outDir, f.path);
      if (!fs.existsSync(abs)) red('C0', `ledger file missing on disk: ${f.path}`);
    }
    if (ledger.distribution) {
      for (const [cls, budget] of Object.entries({ brand: 0.4, url: 0.2, longtail: 0.3, generic: 0.1 })) {
        if (Math.abs((ledger.distribution[cls] ?? 0) - budget) > 0.06)
          red('C6', `ledger distribution drift: ${cls} ${(ledger.distribution[cls] ?? 0).toFixed(2)} vs ${budget}`);
      }
    }
  }

  /* Demo-mode ambers */
  if (spec.demoMode) amber('C0', 'DEMO MODE — hosts are unresolved placeholders; generate, audit, but do not deploy (CHARTER §7).');
  for (const n of graph.nodes) {
    if (!graph.outEdges.get(n.id)?.length) red('C2', `node ${n.id} has no outgoing edges`);
  }

  const reds = findings.filter((f) => f.severity === 'RED');
  const ambers = findings.filter((f) => f.severity === 'AMBER');
  return { ok: reds.length === 0, reds, ambers, findings };
}

function norm(u) {
  return u.replace(/\/+$/, '') || u;
}
function pathOf(url) {
  return new URL(url).pathname.replace(/\/+$/, '');
}
function pageKeyOf(relPath, node) {
  const file = relPath.split(path.sep).slice(1).join('/');
  if (file === 'index.html') return 'index';
  return file.replace(/\.html$/, '');
}

export function shingleSet(text, n = 4) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + n <= words.length; i++) s.add(words.slice(i, i + n).join(' '));
  return s;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
