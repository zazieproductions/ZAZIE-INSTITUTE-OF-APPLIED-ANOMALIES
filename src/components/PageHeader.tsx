import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import type { Crumb } from '../seo/schema';

interface PageHeaderProps {
  stamp: string;
  kicker?: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  crumbs: Crumb[];
  aside?: React.ReactNode;
  tone?: 'gold' | 'red' | 'cyan' | 'violet' | 'emerald';
}

const toneBorder: Record<NonNullable<PageHeaderProps['tone']>, string> = {
  gold: 'border-[#213045]',
  red: 'border-red-950',
  cyan: 'border-cyan-950',
  violet: 'border-[#352067]',
  emerald: 'border-emerald-950'
};

/** Consistent section header: breadcrumbs → stamp → single H1 → lede. */
export const PageHeader: React.FC<PageHeaderProps> = ({ stamp, kicker, title, lede, crumbs, aside, tone = 'gold' }) => (
  <header className={`bg-[#05080f] border ${toneBorder[tone]} p-5 rounded-xl shadow-lg space-y-3`}>
    <Breadcrumbs crumbs={crumbs} />
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`archival-stamp text-[9.5px] font-mono ${tone === 'red' ? 'archival-stamp-red' : tone === 'emerald' ? 'archival-stamp-emerald' : ''}`}>
            {stamp}
          </span>
          {kicker && <span className="text-[10.5px] font-mono text-zinc-400">{kicker}</span>}
        </div>
        <h1 className={`text-xl md:text-2xl font-bold tracking-wide ${tone === 'red' ? 'text-red-300' : 'text-white'}`}>{title}</h1>
        <p className="text-zinc-300 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">{lede}</p>
      </div>
      {aside}
    </div>
  </header>
);
