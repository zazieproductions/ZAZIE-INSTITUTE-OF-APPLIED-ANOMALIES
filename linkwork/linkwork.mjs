#!/usr/bin/env node
/**
 * CIT-01 "THE CITATION ORGAN" — tiered-link machinery.
 *
 *   node linkwork/linkwork.mjs build        grow the organ (spec → sites + ledger + chart)
 *   node linkwork/linkwork.mjs audit        enforce the CHARTER (exit 1 on any RED)
 *   node linkwork/linkwork.mjs schedule     drip calendar (table + ICS)
 *   node linkwork/linkwork.mjs status       what is live / staged / upcoming today
 *   node linkwork/linkwork.mjs graph        redraw the schematic only
 *   node linkwork/linkwork.mjs decommission kill switch (tombstones + disavow scaffold)
 *
 * Flags: --epoch YYYY-MM-DD (schedule origin, default today)
 *        --today YYYY-MM-DD (audit clock override)
 *        --out DIR          (default linkwork/out/sites)
 *        --node ID          (decommission single node)
 *
 * The organ never touches the network. Deployment is a human, on a schedule.
 * See CHARTER.md for the containment rules this CLI enforces.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadSpec, CHARTER_CAPS } from './lib/spec.mjs';
import { buildGraph } from './lib/topology.mjs';
import { renderSite, renderTombstone } from './lib/render.mjs';
import { drawOrgan } from './lib/svg.mjs';
import { audit } from './lib/audit.mjs';
import { loadArchive } from './lib/archive.mjs';
import { rng } from './lib/rng.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = HERE; // the linkwork/ directory
const OUT = path.join(DIR, 'out');
const DEFAULT_SITES = path.join(OUT, 'sites');

const arg = (name, fallback = undefined) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const cmd = process.argv[2] || 'help';
const todayISO = () => new Date().toISOString().slice(0, 10);

function prepare(spec, epoch) {
  const graph = buildGraph(spec, epoch);
  // Assign unique card records (no two cards cite the same archive record).
  const rand = rng(`cit-01/cards/${spec.seed}/${epoch}`);
  const cards = graph.nodes.filter((n) => n.tier === 3);
  const pool = rand.shuffle(loadArchive().records).slice(0, cards.length);
  cards.forEach((c, i) => {
    c.cardRecord = pool[i].id;
  });
  return graph;
}

function writeLedger(spec, graph, epoch, today, files) {
  fs.mkdirSync(OUT, { recursive: true });
  // buildId is deterministic: same spec + seed + epoch + clock → same id.
  const buildId = crypto
    .createHash('sha256')
    .update(`${spec.organ}|${spec.seed}|${epoch}|${today}|${graph.edges.length}`)
    .digest('hex')
    .slice(0, 12);
  const ledger = {
    organ: spec.organ,
    name: spec.name,
    seed: spec.seed,
    epoch,
    today,
    buildId,
    demoMode: spec.demoMode,
    counts: {
      nodes: graph.nodes.length,
      byTier: {
        vessels: graph.nodes.filter((n) => n.tier === 1).length,
        pipes: graph.nodes.filter((n) => n.tier === 2).length,
        sediment: graph.nodes.filter((n) => n.tier === 3).length,
      },
      edges: graph.edges.length,
      subjectBound: graph.subjectBound.length,
      pages: files.filter((f) => f.path.endsWith('.html')).length,
    },
    distribution: graph.distribution,
    nodes: graph.nodes.map((n) => ({
      id: n.id, tier: n.tier, title: n.title, voice: n.voice, archetype: n.archetype,
      url: n.url, host: spec.hosts[n.hostToken], goLive: n.goLive,
      stagedAtBuild: n.goLive > today,
      inner: (n.inner || []).map((p) => ({ slug: p.slug, record: p.record, title: p.title })),
    })),
    edges: graph.edges.map((e) => ({
      from: e.from, to: e.to, page: e.page || 'index',
      anchorClass: e.anchorClass || null,
      anchor: e.anchor, targetUrl: e.targetUrl, targetPath: e.targetPath || null,
      rel: e.rel || null, external: Boolean(e.external),
    })),
    files,
  };
  fs.writeFileSync(path.join(OUT, 'ledger.json'), JSON.stringify(ledger, null, 2));
  return ledger;
}

/* ------------------------------------------------------------------ */

if (cmd === 'build') {
  const spec = loadSpec();
  const epoch = arg('epoch', todayISO());
  const today = arg('today', todayISO());
  const outDir = arg('out', DEFAULT_SITES);
  fs.rmSync(outDir, { recursive: true, force: true });
  const graph = prepare(spec, epoch);
  const files = renderSite(graph, spec, { outDir, epoch, today });
  const ledger = writeLedger(spec, graph, epoch, today, files);
  fs.writeFileSync(path.join(OUT, 'organ-chart.svg'), drawOrgan(graph, { epoch, seed: spec.seed }));
  const result = audit({ spec, graph, ledger, outDir, today });
  console.log(`CIT-01 build — epoch ${epoch}, clock ${today}`);
  console.log(`  nodes: ${ledger.counts.nodes} (${ledger.counts.byTier.vessels}V/${ledger.counts.byTier.pipes}P/${ledger.counts.byTier.sediment}S) · edges: ${ledger.counts.edges} · subject-bound: ${ledger.counts.subjectBound} · pages: ${ledger.counts.pages}`);
  console.log(`  anchor distribution: ${Object.entries(ledger.distribution).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(' · ')}`);
  console.log(`  files → ${path.relative(process.cwd(), outDir)} · ledger → linkwork/out/ledger.json · plate → linkwork/out/organ-chart.svg`);
  for (const f of result.ambers) console.log(`  [AMBER][${f.id}] ${f.msg}`);
  if (!result.ok) {
    for (const f of result.reds) console.error(`  [RED][${f.id}] ${f.msg}`);
    console.error(`AUDIT FAILED — ${result.reds.length} red finding(s). The organ does not ship wounded.`);
    process.exit(1);
  }
  console.log('  audit: clean. The organ is contained.');
  if (ledger.demoMode) console.log('  DEMO MODE: hosts are placeholders — deploy nothing (CHARTER §7).');
} else if (cmd === 'audit') {
  const spec = loadSpec();
  const ledger = JSON.parse(fs.readFileSync(path.join(OUT, 'ledger.json'), 'utf8'));
  const today = arg('today', todayISO());
  const outDir = arg('out', DEFAULT_SITES);
  const graph = buildGraph(spec, ledger.epoch);
  const result = audit({ spec, graph, ledger, outDir, today });
  for (const f of result.findings) console.log(`[${f.severity}][${f.id}] ${f.msg}`);
  console.log(result.ok ? `AUDIT CLEAN — ${result.ambers.length} amber, 0 red.` : `AUDIT FAILED — ${result.reds.length} red.`);
  process.exit(result.ok ? 0 : 1);
} else if (cmd === 'schedule' || cmd === 'status') {
  const spec = loadSpec();
  const epoch = arg('epoch', todayISO());
  const today = arg('today', todayISO());
  const graph = prepare(spec, epoch);
  const rows = [...graph.nodes].sort((a, b) => a.goLive.localeCompare(b.goLive));
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`CIT-01 drip schedule — epoch ${epoch} — clock ${today}\n`);
  console.log(`${pad('GO-LIVE', 12)}${pad('NODE', 7)}${pad('TIER', 6)}${pad('TITLE', 42)}STATE`);
  let live = 0, staged = 0;
  for (const n of rows) {
    const state = n.goLive <= today ? 'LIVE' : 'STAGED';
    if (state === 'LIVE') live++; else staged++;
    const warn = state === 'STAGED' ? '' : '';
    console.log(`${pad(n.goLive, 12)}${pad(n.id, 7)}${pad(n.tier, 6)}${pad(n.title.slice(0, 40), 42)}${state}${warn}`);
  }
  console.log(`\n${live} live · ${staged} staged · cadence ≈ ${(staged ? (60 / staged) : 0).toFixed(1)} d/node · charter caps ${CHARTER_CAPS.tier1}/${CHARTER_CAPS.tier2}/${CHARTER_CAPS.tier3}`);
  if (cmd === 'schedule') {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ZIAA//CIT-01//EN',
      ...rows.map((n) =>
        ['BEGIN:VEVENT', `UID:${n.id}@cit-01.ziaa`, `DTSTAMP:${today.replace(/-/g, '')}T000000Z`, `DTSTART;VALUE=DATE:${n.goLive.replace(/-/g, '')}`, `SUMMARY:ANNEX GO-LIVE — ${n.title} (${n.id})`, 'DESCRIPTION:Manual deploy per linkwork out/sites DEPLOY.md. Never announce a staged node.', 'END:VEVENT'].join('\r\n')
      ),
      'END:VCALENDAR',
    ].join('\r\n');
    fs.writeFileSync(path.join(OUT, 'schedule.ics'), ics + '\r\n');
    console.log(`\nICS written → linkwork/out/schedule.ics`);
  }
} else if (cmd === 'graph') {
  const spec = loadSpec();
  const epoch = arg('epoch', JSON.parse(fs.readFileSync(path.join(OUT, 'ledger.json'), 'utf8')).epoch);
  const graph = prepare(spec, epoch);
  fs.writeFileSync(path.join(OUT, 'organ-chart.svg'), drawOrgan(graph, { epoch, seed: spec.seed }));
  console.log('plate redrawn → linkwork/out/organ-chart.svg');
} else if (cmd === 'decommission') {
  const spec = loadSpec();
  const ledger = JSON.parse(fs.readFileSync(path.join(OUT, 'ledger.json'), 'utf8'));
  const today = arg('today', todayISO());
  const outDir = arg('out', DEFAULT_SITES);
  const only = arg('node');
  const targets = ledger.nodes.filter((n) => !only || n.id === only);
  if (!targets.length) {
    console.error(`no such node: ${only}`);
    process.exit(1);
  }
  const report = { decommissionedAt: new Date().toISOString(), today, nodes: [], urls: [] };
  for (const n of targets) {
    const html = renderTombstone(n, { today });
    const dir = path.join(outDir, n.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    report.nodes.push({ id: n.id, url: n.url, replaced: 'tombstone (noindex, canonical → zazieinstitute.org)' });
    report.urls.push(n.url);
    console.log(`  tombstoned ${n.id} — ${n.url}`);
  }
  fs.writeFileSync(path.join(OUT, 'decommission-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(OUT, 'disavow-scaffold.txt'),
    `# Disavow scaffold for decommissioned CIT-01 surfaces.\n# Upload to search-console disavow tooling ONLY if a manual action ever cites these.\n${report.urls.map((u) => `# ${u}`).join('\n')}\n`
  );
  console.log(`kill switch executed — ${targets.length} node(s). Report → linkwork/out/decommission-report.json`);
  console.log('Per CHARTER §6: tombstones are honest, noindexed, and canonical to the archive.');
} else {
  console.log(`CIT-01 "The Citation Organ" — tiered-link machinery

  build         grow the organ from spec.linkwork.json
  audit         enforce the charter (exit 1 on red)
  schedule      drip calendar + ICS      [--epoch YYYY-MM-DD]
  status        live/staged today
  graph         redraw schematic plate
  decommission  kill switch              [--node ID]

Flags: --epoch · --today · --out · --node
Doctrine: linkwork/CHARTER.md — self-owned surfaces only · zero network · drip only · reversible.`);
}
