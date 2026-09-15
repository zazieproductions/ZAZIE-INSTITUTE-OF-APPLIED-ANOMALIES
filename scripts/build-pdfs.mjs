/**
 * Industrial document engine — generates heterogeneous academic surfaces as real PDFs.
 * Reads src/data/collections/monographs.json and patents.json and emits
 * public/papers/*.pdf that Scholar can crawl via citation_pdf_url.
 * Each PDF is a legitimate archival artifact (title, authors, abstract, body, refs, canonical).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import PDFDocument from 'pdfkit';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'public/papers');
mkdirSync(outDir, { recursive: true });

const SITE = 'https://zazieinstitute.org';

function genMonographPDF(m) {
  const id = m.id.toLowerCase();
  const path = join(outDir, `${id}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 64, bottom: 64, left: 64, right: 64 }, info: {
    Title: m.title,
    Author: [m.author, ...(m.coAuthors || [])].join(', '),
    Subject: m.abstract.slice(0, 200),
    Keywords: 'ZIAA, applied anomalies, experimental audio',
    Creator: 'ZIAA Archive / build-pdfs.mjs',
    Producer: 'PDFKit'
  }});
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  const done = new Promise(res => doc.on('end', () => res(Buffer.concat(chunks))));

  // Header — institutional
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#8c6d31')
    .text('ZAZIE INSTITUTE OF APPLIED ANOMALIES — ZIAA', { align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor('#666')
    .text('Independent interdisciplinary research & creative-technology initiative — Zazie Productions LLC', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(6).fillColor('#999')
    .text(`${m.volume}  •  ISSN 2834-9180 (Online)  •  OPEN RESEARCH`, { align: 'center' });
  doc.moveDown(0.8);
  doc.strokeColor('#d4af37').lineWidth(0.5).moveTo(64, doc.y).lineTo(531, doc.y).stroke();
  doc.moveDown(1.2);

  // Title
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#05080f')
    .text(m.title, { align: 'left' });
  doc.moveDown(0.6);
  doc.font('Helvetica').fontSize(9).fillColor('#333')
    .text(`Author: ${m.author}${m.coAuthors?.length ? `  •  Co-authors: ${m.coAuthors.join(', ')}` : ''}`);
  doc.font('Helvetica').fontSize(8).fillColor('#666')
    .text(`Published: ${m.date}   •   Accession: ${m.id}   •   Canonical: ${SITE}/monographs/${id}`);
  doc.moveDown(1);

  // Abstract
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#8c6d31').text('ABSTRACT');
  doc.font('Helvetica-Oblique').fontSize(8).fillColor('#222')
    .text(m.abstract, { align: 'justify' });
  doc.moveDown(0.8);

  // Theorems
  if (m.keyTheorems?.length) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a5a7a').text('KEY THEOREMS & BOUNDARY EQUATIONS');
    m.keyTheorems.forEach((t, i) => {
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#8c6d31').text(`Formulation [${i+1}.1]`, { continued: false });
      doc.font('Helvetica').fontSize(8).fillColor('#222').text(t, { align: 'justify' });
      doc.moveDown(0.4);
    });
    doc.moveDown(0.4);
  }

  // Sections
  m.sections?.forEach(sec => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#05080f').text(sec.heading);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(8).fillColor('#222').text(sec.content, { align: 'justify' });
    doc.moveDown(0.8);
  });

  // References
  if (m.references?.length) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text('REFERENCES & PRIMARY CITATIONS');
    m.references.forEach((r, i) => {
      doc.font('Helvetica').fontSize(7).fillColor('#555').text(`${i+1}. ${r}`, { align: 'left' });
      doc.moveDown(0.2);
    });
    doc.moveDown(0.8);
  }

  // Footer — archival
  doc.font('Helvetica').fontSize(6).fillColor('#999')
    .text(`Archival specimen — ZIAA Publications Division  •  ${SITE}/monographs/${id}  •  Permanent preservation record — Cite as: ${m.author} et al., "${m.title}," ${m.volume}, ZIAA Press, ${m.date.slice(0,4)}.`, { align: 'center' });

  doc.end();
  return done.then(buf => {
    writeFileSync(path, buf);
    return { id, bytes: buf.length };
  });
}

function genPatentPDF(p) {
  const id = p.id.toLowerCase();
  const path = join(outDir, `${id}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 64, bottom: 64, left: 64, right: 64 }, info: {
    Title: p.title,
    Author: p.inventors.join(', '),
    Subject: p.abstract.slice(0, 200),
    Creator: 'ZIAA Archive / build-pdfs.mjs',
  }});
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  const done = new Promise(res => doc.on('end', () => res(Buffer.concat(chunks))));

  doc.font('Helvetica-Bold').fontSize(7).fillColor('#8c6d31').text('ZAZIE INSTITUTE OF APPLIED ANOMALIES — SPECULATIVE PATENT DISCLOSURE', { align: 'center' });
  doc.font('Helvetica').fontSize(6).fillColor('#666').text('Defensive publication — design-fiction hardware disclosure, not an issued patent  •  ZIAA Open Research Charter', { align: 'center' });
  doc.moveDown(0.4);
  doc.strokeColor('#d4af37').lineWidth(0.5).moveTo(64, doc.y).lineTo(531, doc.y).stroke();
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0a4a6a').text(p.patentNumber);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#05080f').text(p.title);
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(8).fillColor('#333')
    .text(`Filing: ${p.filingDate}  •  Status: ${p.status.replace(/_/g,' ')}  •  Discipline: ${p.primaryDiscipline}`);
  doc.font('Helvetica').fontSize(8).fillColor('#333')
    .text(`Inventors: ${p.inventors.join(', ')}  •  Assignee: ${p.assignee}`);
  doc.font('Helvetica').fontSize(7).fillColor('#666')
    .text(`Canonical: ${SITE}/patents/${id}`);
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(8).fillColor('#8c6d31').text('ABSTRACT & METHOD DISCLOSURE');
  doc.font('Helvetica').fontSize(8).fillColor('#222').text(p.abstract, { align: 'justify' });
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text('INDEPENDENT CLAIMS');
  p.independentClaims?.forEach(c => {
    doc.font('Helvetica').fontSize(7).fillColor('#222').text(c, { align: 'justify' });
    doc.moveDown(0.3);
  });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text('DEPENDENT CLAIMS');
  p.dependentClaims?.forEach(c => {
    doc.font('Helvetica').fontSize(7).fillColor('#222').text(c, { align: 'justify' });
    doc.moveDown(0.3);
  });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text('PRIOR-ART CRITIQUE');
  doc.font('Helvetica').fontSize(7).fillColor('#222').text(p.priorArtCritique, { align: 'justify' });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text('COUNSEL MEMO');
  doc.font('Helvetica-Oblique').fontSize(7).fillColor('#555').text(p.legalCounselMemo, { align: 'justify' });
  doc.moveDown(0.8);
  doc.font('Helvetica').fontSize(6).fillColor('#999')
    .text(`Defensive publication — disclosed to prevent predatory encumbrance  •  ${SITE}/patents/${id}  •  See /legal/disclaimer`, { align: 'center' });

  doc.end();
  return done.then(buf => {
    writeFileSync(path, buf);
    return { id, bytes: buf.length };
  });
}

const monographs = JSON.parse(readFileSync(resolve(root, 'src/data/collections/monographs.json'), 'utf8'));
const patents = JSON.parse(readFileSync(resolve(root, 'src/data/collections/patents.json'), 'utf8'));

const monoResults = [];
for (const m of monographs) {
  // eslint-disable-next-line no-await-in-loop
  monoResults.push(await genMonographPDF(m));
}
const patResults = [];
for (const p of patents) {
  // eslint-disable-next-line no-await-in-loop
  patResults.push(await genPatentPDF(p));
}

console.log(`[build-pdfs] ${monoResults.length} monograph PDFs, ${patResults.length} patent PDFs → public/papers/ (${monoResults.reduce((a,b)=>a+b.bytes,0)+patResults.reduce((a,b)=>a+b.bytes,0)} bytes total)`);
