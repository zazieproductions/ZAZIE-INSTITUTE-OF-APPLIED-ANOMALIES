import { useState } from 'react';

/**
 * Progressive list disclosure: render `initial` items up front (small DOM,
 * fast first paint), reveal the rest on demand. Resets when the filtered set
 * changes (tracked via the "previous items" pattern, no effect needed). Full
 * record link lists for crawlers live in each page's index <nav>.
 */
export function useShowMore<T>(items: T[], initial = 30, step = 30) {
  const [state, setState] = useState({ items, limit: initial });
  const limit = state.items === items ? state.limit : initial;
  const setLimit = (next: number) => setState({ items, limit: next });
  return {
    visible: items.slice(0, limit),
    hasMore: items.length > limit,
    remaining: items.length - limit,
    showMore: () => setLimit(limit + step),
    showAll: () => setLimit(items.length)
  };
}
