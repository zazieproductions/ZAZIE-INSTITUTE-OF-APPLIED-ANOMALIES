import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const container = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Production HTML is prerendered, so hydrate its actual element markup. The
// unbuilt Vite shell contains only the <!--app-html--> comment, which makes
// hasChildNodes() true even though there is nothing to hydrate. Fall back to a
// clean client render for that shell instead of triggering a hydration error.
if (container.firstElementChild !== null) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
