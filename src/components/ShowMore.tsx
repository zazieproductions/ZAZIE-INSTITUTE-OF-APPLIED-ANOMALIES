import React from 'react';

export const ShowMoreButton: React.FC<{
  remaining: number;
  onMore: () => void;
  onAll: () => void;
  label: string;
}> = ({ remaining, onMore, onAll, label }) => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4 font-mono text-xs no-print">
    <button
      type="button"
      onClick={onMore}
      className="px-4 py-2 rounded border border-[#dfb76c]/60 text-[#dfb76c] hover:bg-[#dfb76c]/10 transition-colors"
    >
      Load more {label} ({remaining} remaining)
    </button>
    <button type="button" onClick={onAll} className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4">
      Show all
    </button>
  </div>
);
