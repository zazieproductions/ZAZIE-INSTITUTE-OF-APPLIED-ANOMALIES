import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dist = resolve(root, 'dist');
const site = 'https://zazieinstitute.org';
const monographs = JSON.parse(readFileSync(resolve(root, 'src/data/collections/monographs.json'), 'utf8'));
const patents = JSON.parse(readFileSync(resolve(root, 'src/data/collections/patents.json'), 'utf8'));
const publications = [
  ...monographs.map((record) => ({ ...record, section: 'monographs' })),
  ...patents.map((record) => ({ ...record, section: 'patents' }))
];
const hasBuiltPages = publications.some(({ id, section }) =>
  existsSync(resolve(dist, section, id.toLowerCase(), 'index.html'))
);

const escapeRegExp = (value) => value.replaceAll('.', '\\.');
const contentType = (rule, name) => rule?.headers?.find(({ key }) => key.toLowerCase() === name.toLowerCase())?.value;
const hasMeta = (html, name, content) =>
  new RegExp(`<meta name="${name}" content="${escapeRegExp(content)}"\\s*/?>`).test(html);

test('every monograph and patent has a paired PDF with its canonical URL and stable identifier', () => {
  const identifiers = new Set();

  for (const record of publications) {
    const id = record.id;
    const slug = id.toLowerCase();
    const canonicalUrl = `${site}/${record.section}/${slug}`;
    const pdfPath = resolve(root, 'public/papers', `${slug}.pdf`);

    assert.ok(!identifiers.has(id), `duplicate publication identifier: ${id}`);
    identifiers.add(id);
    assert.ok(existsSync(pdfPath), `missing PDF for ${id}`);

    const pdf = readFileSync(pdfPath);
    assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-', `${id} is not a PDF`);
    const rawPdf = pdf.toString('latin1');
    assert.ok(rawPdf.includes(id), `${id} is not recorded in its PDF metadata`);
    assert.ok(rawPdf.includes(canonicalUrl), `${id} canonical URL is not recorded in its PDF metadata`);
  }

  assert.equal(identifiers.size, monographs.length + patents.length);
});

test('built HTML dossiers publish matching citation metadata and PDF bytes', { skip: !hasBuiltPages }, () => {
  for (const record of publications) {
    const id = record.id;
    const slug = id.toLowerCase();
    const canonicalUrl = `${site}/${record.section}/${slug}`;
    const pdfUrl = `${site}/papers/${slug}.pdf`;
    const htmlPath = resolve(dist, record.section, slug, 'index.html');
    const publicPdfPath = resolve(root, 'public/papers', `${slug}.pdf`);
    const distPdfPath = resolve(dist, 'papers', `${slug}.pdf`);

    assert.ok(existsSync(htmlPath), `missing canonical HTML dossier for ${id}`);
    const html = readFileSync(htmlPath, 'utf8');
    assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1, `${id} should have one canonical URL`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${escapeRegExp(canonicalUrl)}"`), `${id} canonical URL mismatch`);
    assert.ok(hasMeta(html, 'citation_identifier', id), `${id} citation identifier missing`);
    assert.ok(hasMeta(html, 'citation_pdf_url', pdfUrl), `${id} Scholar PDF URL mismatch`);
    assert.ok(hasMeta(html, 'dc.identifier', canonicalUrl), `${id} Dublin Core identifier mismatch`);

    const graph = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    assert.ok(
      graph.some((node) => node.identifier === id && node.url === canonicalUrl),
      `${id} JSON-LD does not share the dossier URL and citation identifier`
    );
    if (record.section === 'monographs') {
      assert.ok(html.includes(`[${id}]`), `${id} visible monograph citation omits its archive identifier`);
    } else {
      assert.ok(graph.some((node) => node.alternateName === record.patentNumber), `${id} JSON-LD omits the patent serial`);
    }

    assert.ok(existsSync(distPdfPath), `missing built PDF for ${id}`);
    assert.deepEqual(
      readFileSync(distPdfPath),
      readFileSync(publicPdfPath),
      `${id} PDF changed while being copied into the built site`
    );
  }
});

test('all hosting and local preview configurations serve papers as application/pdf', () => {
  const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
  const vercelPdfRule = vercel.headers.find(({ source }) => source === '/papers/(.*)');
  assert.equal(contentType(vercelPdfRule, 'Content-Type'), 'application/pdf');

  const cloudflareHeaders = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  assert.match(cloudflareHeaders, /^\/papers\/\*\s*\n\s+Content-Type: application\/pdf$/m);

  const staticServer = readFileSync(resolve(root, 'scripts/serve-dist.mjs'), 'utf8');
  assert.match(staticServer, /['"]\.pdf['"]\s*:\s*['"]application\/pdf['"]/);
});

test('the papers page introduces the two surfaces in reader-facing language', { skip: !hasBuiltPages }, () => {
  const papersIndex = readFileSync(resolve(dist, 'papers/index.html'), 'utf8');
  assert.match(papersIndex, /reader-facing record/);
  assert.match(papersIndex, /stable archive identifier/);
  assert.doesNotMatch(papersIndex, /citation_\*|&lt;id&gt;|byte-identical PDF served as application\/pdf/);
});
