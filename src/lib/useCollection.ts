import { use } from 'react';

/**
 * Suspense-friendly accessor for lazily loaded collections.
 * The loader functions memoise their promise, so `use()` receives a stable
 * thenable on every render (required by React).
 */
export function useCollection<T>(loader: () => Promise<T>): T {
  return use(loader());
}
