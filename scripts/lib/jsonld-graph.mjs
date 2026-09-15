/**
 * JSON-LD entity-graph validator.
 *
 * Reads every prerendered page in dist/, extracts all JSON-LD blocks and
 * checks the Institute's structured data as a single graph rather than as
 * per-page fragments:
 *
 *   1. every block parses as JSON;
 *   2. every @type is a real schema.org type;
 *   3. every property is a real schema.org property;
 *   4. every @id pointer resolves to a node declared somewhere in dist/
 *      (this is what makes the graph self-referential rather than decorative);
 *   5. every @id is absolute and on the canonical origin.
 *
 * The vocabulary is derived at runtime from the installed `schema-dts`
 * devDependency, so it tracks schema.org instead of drifting from a
 * hand-maintained allowlist.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const SITE = 'https://zazieinstitute.org';

/** Types and properties taken straight from the generated schema.org typings. */
export function loadVocabulary(root) {
  const dts = resolve(root, 'node_modules/schema-dts/dist/schema.d.ts');
  if (!existsSync(dts)) {
    throw new Error(
      'schema-dts not installed — run `npm install` so the graph audit can validate against the schema.org vocabulary.'
    );
  }
  const src = readFileSync(dts, 'utf8');
  const types = new Set([...src.matchAll(/"@type": "([A-Za-z]+)";/g)].map(m => m[1]));
  const props = new Set([...src.matchAll(/^[ \t]+"([a-zA-Z]+)"\??:/gm)].map(m => m[1]));
  if (types.size < 500 || props.size < 500) {
    throw new Error(`schema.org vocabulary looks incomplete (${types.size} types, ${props.size} properties)`);
  }
  return { types, props };
}

function listPages(dir, dist) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!['assets', 'apps'].includes(name)) out.push(...listPages(p, dist));
    } else if (name === 'index.html') out.push(p);
  }
  return out;
}

/** Pulls raw JSON-LD payloads out of a prerendered document. */
function extractBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
}

const JSONLD_KEYS = new Set(['@context', '@id', '@type', '@graph', '@vocab', '@language', '@value', '@list', '@set']);

/**
 * Walks a parsed JSON-LD value, recording declarations (nodes with an @id and
 * a @type) separately from bare `{ "@id": … }` pointers.
 */
function walk(node, ctx, path) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, ctx, `${path}[${i}]`));
    return;
  }
  if (node === null || typeof node !== 'object') return;

  const keys = Object.keys(node);
  for (const k of keys) {
    if (k.startsWith('@')) continue;
    // Action constraint properties ("query-input") are schema.org-suffixed.
    const base = k.replace(/-(input|output)$/, '');
    if (!ctx.props.has(base)) ctx.unknownProps.add(`${k} (at ${path})`);
    walk(node[k], ctx, `${path}.${k}`);
  }

  const types = node['@type'];
  if (types !== undefined) {
    for (const t of Array.isArray(types) ? types : [types]) {
      if (typeof t !== 'string') continue;
      if (!ctx.types.has(t)) ctx.unknownTypes.add(`${t} (at ${path})`);
      else ctx.typesUsed.add(t);
    }
  }

  const id = node['@id'];
  if (typeof id === 'string') {
    if (!id.startsWith(SITE)) {
      ctx.badIds.add(`${id} (at ${path})`);
    } else {
      const isDeclaration = types !== undefined && keys.some(k => !JSONLD_KEYS.has(k));
      if (isDeclaration) ctx.declared.set(id, path);
      else ctx.referenced.add(id);
    }
  }
}

export function auditGraph(root) {
  const dist = resolve(root, 'dist');
  const vocab = loadVocabulary(root);
  const pages = listPages(dist, dist);

  const ctx = {
    types: vocab.types,
    props: vocab.props,
    declared: new Map(),
    referenced: new Set(),
    unknownTypes: new Set(),
    unknownProps: new Set(),
    badIds: new Set(),
    typesUsed: new Set()
  };
  const errors = [];
  const perPage = new Map();
  let blocks = 0;

  for (const file of pages) {
    const url = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\/$/, '');
    const html = readFileSync(file, 'utf8');
    const found = extractBlocks(html);
    blocks += found.length;
    let pageNodes = 0;

    found.forEach((raw, i) => {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        errors.push(`[${url}] JSON-LD block ${i} does not parse: ${err.message}`);
        return;
      }
      const before = ctx.declared.size;
      const nodes = parsed['@graph'] ? parsed['@graph'] : parsed;
      walk(nodes, ctx, `${url}#${i}`);
      pageNodes += ctx.declared.size - before;
    });

    // noindex pages (/404) are outside the entity graph by design; the
    // per-page SEO audit already covers their other requirements.
    const noindex = /name="robots" content="noindex/.test(html);
    if (found.length === 0 && !noindex) errors.push(`[${url}] no JSON-LD block found`);
    perPage.set(url, pageNodes);
  }

  // @id closure: every pointer must be declared somewhere in the crawl.
  const dangling = [...ctx.referenced].filter(id => !ctx.declared.has(id)).sort();
  for (const id of dangling) errors.push(`dangling @id reference (never declared in dist/): ${id}`);

  for (const t of [...ctx.unknownTypes].sort()) errors.push(`unknown schema.org type: ${t}`);
  for (const p of [...ctx.unknownProps].sort()) errors.push(`unknown schema.org property: ${p}`);
  for (const id of [...ctx.badIds].sort()) errors.push(`@id is not on the canonical origin: ${id}`);

  const edges = [...ctx.referenced].filter(id => ctx.declared.has(id)).length;
  const roots = perPage.size;

  return {
    errors,
    stats: {
      pages: pages.length,
      blocks,
      declaredNodes: ctx.declared.size,
      referencedIds: ctx.referenced.size,
      resolvedEdges: edges,
      dangling: dangling.length,
      typesUsed: ctx.typesUsed.size,
      pagesWithNodes: roots,
      vocabulary: { types: vocab.types.size, props: vocab.props.size }
    },
    declared: ctx.declared,
    referenced: ctx.referenced
  };
}
