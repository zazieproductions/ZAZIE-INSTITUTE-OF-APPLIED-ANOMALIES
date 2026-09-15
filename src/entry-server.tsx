import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';

/**
 * Renders one route to static HTML. React 19 emits hoistable <title>/<meta>/
 * <link> elements first, followed by the application markup; the prerender
 * script splits them into <head> and <body>.
 */
// eslint-disable-next-line react-refresh/only-export-components -- server entry, not a component module
export async function render(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
  return new Response(prelude).text();
}

export { ROUTE_MANIFEST } from './routes/manifest';
// Re-exported for scripts/prerender.mjs so llms.txt is always generated from
// the same canonical facts the rendered pages emit (no drift between the
// machine-readable grounding document and the HTML).
// eslint-disable-next-line react-refresh/only-export-components -- server entry, not a component module
export { renderLlmsTxt, CANONICAL, prestigeLead, DISALLOWED_PHRASES, CONTAMINATION_EXEMPT_PATHS, type LlmContext } from './seo/canonicalFacts';
export { ENTITY } from './seo/site';
