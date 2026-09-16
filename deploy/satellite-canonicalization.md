# Cross-origin canonicalisation — the other origins already in this repository

These origins serve ZIAA work but are not the canonical origin. They live in other repositories,
so their host rules cannot be written from this one: the rows below are generated from
`scripts/alias-registry.mjs` and ready to paste into each satellite repository.

| origin | canonical target | rule (`_redirects`) | evidence |
| --- | --- | --- | --- |
| https://zazieproductions.github.io/void-oculus/ | https://zazieinstitute.org/void-oculus | `/* https://zazieinstitute.org/void-oculus 301` | GitHub Pages built from main; the repository README links the demo |
| https://zazieproductions.github.io/interference-archive/ | https://zazieinstitute.org/disciplines/signal-archaeology | `/* https://zazieinstitute.org/disciplines/signal-archaeology 301` | GitHub Pages built from main; link in the repository README |
| https://zazieproductions.github.io/vortex-av-engine/ | https://zazieinstitute.org/disciplines/computational-creativity | `/* https://zazieinstitute.org/disciplines/computational-creativity 301` | GitHub Pages configured from main; link in the repository README |
| https://zazieproductions.github.io/spectra-lab/ | https://zazieinstitute.org/spectra-lab | `/* https://zazieinstitute.org/spectra-lab 301` | the repository README documents publishing the root from main — planned, not yet published |
| https://zazieproductions.github.io/SYNTHESIS-SIGNAL/ | https://zazieinstitute.org/synthesis-signal | `/* https://zazieinstitute.org/synthesis-signal 301` | the repository README documents publishing the root from main — planned, not yet published |
| https://zazieproductions.github.io/ziaa-dsp/ | https://zazieinstitute.org/disciplines/generative-software | `/* https://zazieinstitute.org/disciplines/generative-software 301` | BLACK_HAT_SEO_ARCHITECT_PLAYBOOK.md §4 — planned GitHub Pages satellite — planned, not yet published |
| https://ziaa.pages.dev/ | https://zazieinstitute.org/ | `/* https://zazieinstitute.org/ 301` | wrangler.toml name="ziaa" of the predecessor Cloudflare Pages project — planned, not yet published |

GitHub Pages itself cannot serve status codes. Where a satellite is hosted on GitHub Pages, the
canonical link belongs in the page `<head>` and in the README:

```html
<link rel="canonical" href="https://zazieinstitute.org/void-oculus">
```

This build also canonicalises itself client-side: if `zazieinstitute.org` is ever served from one of
these origins, `src/routes/aliasResolver.ts` hands the visitor to the institutional origin on load.
