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

// Production HTML is prerendered, so we hydrate. In dev the root is empty.
// The document shell keeps a <!--app-html--> comment inside #root, so
// hasChildNodes() is true even when nothing was prerendered — hydrating a
// comment-only container throws (React error #418). Only hydrate when real
// prerendered markup (an element) is present; otherwise client-render.
const hasPrerenderedMarkup = container.firstElementChild !== null;
if (hasPrerenderedMarkup) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
