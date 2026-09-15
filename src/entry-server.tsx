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
