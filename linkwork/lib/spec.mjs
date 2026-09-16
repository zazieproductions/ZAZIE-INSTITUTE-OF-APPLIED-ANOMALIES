/**
 * CIT-01 // spec loader + charter invariants.
 * The spec (spec.linkwork.json) declares vessels, pipes and sediment;
 * this module validates it against the hard caps in CHARTER.md before
 * anything is grown. Operator-specific hosts live in spec.local.json
 * (gitignored); unresolved tokens mean DEMO MODE — build, audit, but do not deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');

export const CHARTER_CAPS = { tier1: 3, tier2: 8, tier3: 16 };

export function loadSpec() {
  const spec = JSON.parse(fs.readFileSync(path.join(DIR, 'spec.linkwork.json'), 'utf8'));

  // Optional operator overlay (real domains, real accounts). Never committed.
  const localPath = path.join(DIR, 'spec.local.json');
  const local = fs.existsSync(localPath) ? JSON.parse(fs.readFileSync(localPath, 'utf8')) : {};
  spec.hosts = { ...(spec.hosts || {}), ...(local.hosts || {}) };

  validate(spec);
  spec.demoMode = Object.values(spec.hosts).some((v) => v.startsWith('%') && v.endsWith('%'));
  return spec;
}

export function hostValue(spec, token) {
  const v = spec.hosts?.[token];
  if (!v) throw new Error(`Host token "${token}" has no entry in spec.hosts or spec.local.json`);
  return v;
}

export function nodeUrl(spec, node) {
  const host = hostValue(spec, node.hostToken);
  const base = `https://${host}`;
  const p = node.path ? `/${node.path.replace(/\/+$/, '')}` : '';
  return `${base}${p}`;
}

function validate(spec) {
  const errs = [];
  const counts = { 1: 0, 2: 0, 3: 0 };
  const ids = new Set();
  for (const n of spec.nodes) {
    counts[n.tier] = (counts[n.tier] || 0) + 1;
    if (ids.has(n.id)) errs.push(`duplicate node id ${n.id}`);
    ids.add(n.id);
    if (!n.hostToken) errs.push(`node ${n.id} missing hostToken`);
    if (!n.voice) errs.push(`node ${n.id} missing voice`);
    if (typeof n.offsetDays !== 'number') errs.push(`node ${n.id} missing offsetDays`);
  }
  if (counts[1] > CHARTER_CAPS.tier1) errs.push(`tier-1 cap exceeded: ${counts[1]} > ${CHARTER_CAPS.tier1} (CHARTER §1)`);
  if (counts[2] > CHARTER_CAPS.tier2) errs.push(`tier-2 cap exceeded: ${counts[2]} > ${CHARTER_CAPS.tier2} (CHARTER §1)`);
  if (counts[3] > CHARTER_CAPS.tier3) errs.push(`tier-3 cap exceeded: ${counts[3]} > ${CHARTER_CAPS.tier3} (CHARTER §1)`);
  for (const e of spec.explicitEdges || []) {
    if (!ids.has(e.from)) errs.push(`explicit edge references unknown source node: ${JSON.stringify(e)}`);
    if (e.to !== 'EXTERNAL' && !ids.has(e.to)) errs.push(`explicit edge references unknown target node: ${JSON.stringify(e)}`);
    if (e.to === 'EXTERNAL' && !e.href) errs.push(`external edge missing href: ${JSON.stringify(e)}`);
  }
  if (errs.length) throw new Error('SPEC INVALID:\n  - ' + errs.join('\n  - '));
  return spec;
}

/** go-live date for a node, given the organ epoch (ISO date string). */
export function goLiveDate(spec, node, epoch) {
  const d = new Date(`${epoch}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + node.offsetDays);
  return d.toISOString().slice(0, 10);
}
