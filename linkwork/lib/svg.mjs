/**
 * CIT-01 // schematic.
 * Draws the organ: a hydraulic schematic of directed citation. Committed
 * to the repository as the piece's own plate — the machinery's self-portrait.
 * Deterministic: same ledger, same drawing.
 */
import { SUBJECT } from './archive.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function drawOrgan(graph, { epoch, seed }) {
  const W = 1280;
  const H = 960;
  const band = (tier) => ({ 3: { y: 700, label: 'SEDIMENT — citation cards (tier 3)' }, 2: { y: 470, label: 'PIPES — feeders (tier 2)' }, 1: { y: 240, label: 'VESSELS — study satellites (tier 1)' } })[tier];
  const subjectY = 92;

  const tierNodes = (t) => graph.nodes.filter((n) => n.tier === t);
  const pos = new Map();
  const place = (t, y) => {
    const ns = tierNodes(t);
    const x0 = 150;
    const span = W - 300;
    ns.forEach((n, i) => {
      const x = ns.length === 1 ? W / 2 : x0 + (span * i) / (ns.length - 1);
      pos.set(n.id, { x, y: y + jitter(n.id) });
    });
  };
  place(3, band(3).y);
  place(2, band(2).y);
  place(1, band(1).y);
  pos.set('SUBJECT', { x: W / 2, y: subjectY });

  const lines = [];
  const nodes = [];

  // tier bands
  for (const t of [3, 2, 1]) {
    const b = band(t);
    lines.push(
      `<rect x="40" y="${b.y - 52}" width="${W - 80}" height="128" fill="none" stroke="#2a3550" stroke-width="1" stroke-dasharray="3 5"/>`,
      `<text x="52" y="${b.y - 62}" fill="#5a6b8c" font-family="ui-monospace,monospace" font-size="11" letter-spacing="2">${esc(b.label.toUpperCase())}</text>`
    );
  }

  // edges
  for (const e of graph.edges) {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) continue;
    const mx = (a.x + b.x) / 2;
    const bow = e.to === 'SUBJECT' ? -0.18 : -0.08;
    const my = (a.y + b.y) / 2 + Math.abs(a.x - b.x) * bow;
    const isSubject = e.to === 'SUBJECT';
    const color = isSubject ? '#d9a441' : '#7f92b8';
    lines.push(
      `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="${color}" stroke-width="${isSubject ? 1.8 : 1.1}" opacity="${isSubject ? 0.95 : 0.6}"/>`
    );
    // arrowhead
    const ang = Math.atan2(b.y - my, b.x - mx);
    const ax = b.x - Math.cos(ang) * 14;
    const ay = b.y - Math.sin(ang) * 14;
    lines.push(
      `<path d="M ${b.x} ${b.y} L ${ax + Math.sin(ang) * 4} ${ay - Math.cos(ang) * 4} L ${ax - Math.sin(ang) * 4} ${ay + Math.cos(ang) * 4} Z" fill="${color}"/>`
    );
  }

  // nodes
  for (const n of graph.nodes) {
    const p = pos.get(n.id);
    const r = n.tier === 1 ? 26 : n.tier === 2 ? 17 : 11;
    const fill = n.tier === 1 ? '#1b2f3a' : n.tier === 2 ? '#232b3e' : '#20263a';
    nodes.push(
      `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="#aebdd8" stroke-width="1.4"/>`,
      `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#d9a441"/>`,
      `<text x="${p.x}" y="${p.y + r + 15}" fill="#c7d3ea" font-family="ui-monospace,monospace" font-size="11" text-anchor="middle">${esc(n.id)}</text>`,
      `<text x="${p.x}" y="${p.y + r + 29}" fill="#68758f" font-family="ui-monospace,monospace" font-size="9.5" text-anchor="middle">${esc(shortTitle(n.title).toUpperCase())}</text>`
    );
  }
  const s = pos.get('SUBJECT');
  nodes.push(
    `<rect x="${s.x - 150}" y="${s.y - 30}" width="300" height="60" fill="#2b2413" stroke="#d9a441" stroke-width="1.6"/>`,
    `<text x="${s.x}" y="${s.y - 4}" fill="#e8c987" font-family="ui-monospace,monospace" font-size="13" text-anchor="middle" letter-spacing="2">RESERVOIR</text>`,
    `<text x="${s.x}" y="${s.y + 14}" fill="#a98d55" font-family="ui-monospace,monospace" font-size="10" text-anchor="middle">${esc('zazieinstitute.org — the archive itself')}</text>`
  );

  const dist = graph.distribution;
  const distText = `ANCHOR BUDGET  BRAND ${(dist.brand * 100).toFixed(0)}% · URL ${(dist.url * 100).toFixed(0)}% · LONG-TAIL ${(dist.longtail * 100).toFixed(0)}% · GENERIC ${(dist.generic * 100).toFixed(0)}%`;
  const legend = `
<text x="60" y="${H - 150}" fill="#8fa1c4" font-family="ui-monospace,monospace" font-size="11">${distText}</text>
<line x1="60" y1="${H - 132}" x2="110" y2="${H - 132}" stroke="#d9a441" stroke-width="2"/><text x="118" y="${H - 128}" fill="#68758f" font-family="ui-monospace,monospace" font-size="10">subject-bound flow (vessels only)</text>
<line x1="420" y1="${H - 132}" x2="470" y2="${H - 132}" stroke="#7f92b8" stroke-width="1.2"/><text x="478" y="${H - 128}" fill="#68758f" font-family="ui-monospace,monospace" font-size="10">inter-annex flow</text>
<text x="60" y="${H - 106}" fill="#68758f" font-family="ui-monospace,monospace" font-size="10">FLOW IS ONE-WAY, UPWARD. SEDIMENT NEVER TOUCHES THE RESERVOIR. NO RECIPROCALS. NO SELF-FLOW.</text>`;

  const titleBlock = `
<g transform="translate(${W - 330},${H - 180})">
  <rect x="0" y="0" width="290" height="140" fill="none" stroke="#3a4763" stroke-width="1"/>
  <line x1="0" y1="34" x2="290" y2="34" stroke="#3a4763" stroke-width="1"/>
  <line x1="0" y1="68" x2="290" y2="68" stroke="#3a4763" stroke-width="1"/>
  <line x1="0" y1="102" x2="290" y2="102" stroke="#3a4763" stroke-width="1"/>
  <text x="12" y="22" fill="#dfe7f5" font-family="ui-monospace,monospace" font-size="13" letter-spacing="2">ZIAA INSTRUMENT CIT-01</text>
  <text x="12" y="56" fill="#8fa1c4" font-family="ui-monospace,monospace" font-size="11">"THE CITATION ORGAN" — HYDRAULIC SCHEMATIC</text>
  <text x="12" y="90" fill="#68758f" font-family="ui-monospace,monospace" font-size="10">DRAWN ${esc(epoch)} · SEED ${esc(seed)} · SHEET 1 OF 1</text>
  <text x="12" y="124" fill="#d9a441" font-family="ui-monospace,monospace" font-size="10" letter-spacing="1.5">DO NOT SCALE · DO NOT BLAST · DRIP ONLY</text>
</g>`;

  const grid = [];
  for (let x = 0; x <= W; x += 40) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#161d2e" stroke-width="1"/>`);
  for (let y = 0; y <= H; y += 40) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#161d2e" stroke-width="1"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="CIT-01 Citation Organ schematic">
<rect width="${W}" height="${H}" fill="#0d1322"/>
${grid.join('\n')}
<text x="${W / 2}" y="44" fill="#dfe7f5" font-family="ui-monospace,monospace" font-size="19" text-anchor="middle" letter-spacing="6">THE CITATION ORGAN</text>
<text x="${W / 2}" y="66" fill="#5a6b8c" font-family="ui-monospace,monospace" font-size="11" text-anchor="middle" letter-spacing="3">SCHEMATIC OF DIRECTED CITATION · ${graph.nodes.length} ANNEXES · ${graph.edges.length} VALVES · FLOW: SEDIMENT → PIPES → VESSELS → RESERVOIR</text>
${lines.join('\n')}
${nodes.join('\n')}
${legend}
${titleBlock}
</svg>
`;
}

function shortTitle(t) {
  return t.split(/\s+/).slice(0, 3).join(' ');
}

function jitter(id) {
  let h = 0;
  for (const c of id) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return ((h % 9) - 4) * 4;
}
