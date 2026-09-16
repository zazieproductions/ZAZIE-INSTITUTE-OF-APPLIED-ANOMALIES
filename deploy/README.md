# Generated routing artifacts

Everything in this directory is generated from `scripts/alias-registry.mjs` by
`scripts/build-alias-rules.mjs`. Edit the registry, run `npm run build:aliases`, and every
artifact below changes together. `URL_ALIAS_LEDGER.md` is the human-readable companion.

| artifact | host | expresses | how to apply |
| --- | --- | --- | --- |
| `../vercel.json` | Vercel | 308 redirects + canonical headers + query facets | deploy as-is (already in the repository root) |
| `../middleware.ts` | Vercel | literal 301 + 410 (page-shaped requests only) | deploy as-is; delete the file to disable |
| `../public/_redirects` | Netlify, Cloudflare Pages | portable 301 set | ships inside `dist/` automatically |
| `netlify/_redirects` | Netlify | 301 + 410 + query facets | copy over `public/_redirects` before deploying to Netlify |
| `cloudflare-pages/functions/_middleware.js` | Cloudflare Pages | 301/410 + query facets + case folding | move to `functions/_middleware.js` in the Pages project |
| `nginx-aliases.conf` | nginx | 301 + 410 + case fold + facets | `include` inside the `server{}` block |
| `apache-aliases.conf` | Apache 2.4 | 301 + 410 + case fold + facets | include in the vhost (mod_alias + mod_rewrite) |
| `vercel-bulk-redirects.csv` | Vercel CLI | literal 301s, case-sensitive | `vercel redirects upload deploy/vercel-bulk-redirects.csv` |
| `satellite-canonicalization.md` | other origins | cross-origin 301s | paste the one-liner into each satellite repository |

Counts: 794 exact aliases, 39 prefix trees, 10 retired surfaces (410), 130 facet rules, 656 accession case folds, 116 cleanUrl variants.

## Why three different status codes

- **301** is the honest code for a moved address and is what the portable rules, the middleware, Netlify and the server configs answer.
- **308** is what Vercel configuration redirects can answer; the platform treats it as permanently equivalent to 301.
- **410** tells crawlers the address served content and is permanently withdrawn. Vercel and Cloudflare Pages cannot express it in a config file, so `middleware.ts` (Vercel) and the Pages Function (Cloudflare) carry it.
