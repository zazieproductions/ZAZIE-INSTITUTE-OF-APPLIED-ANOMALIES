import React from 'react';

/** Route-level suspense fallback. Height is reserved to limit layout shift. */
export const Loading: React.FC<{ label?: string }> = ({ label = 'Retrieving archive records' }) => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-zinc-400"
  >
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
      {label}…
    </span>
  </div>
);
