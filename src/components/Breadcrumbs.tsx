import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { Crumb } from '../seo/schema';

interface BreadcrumbsProps {
  crumbs: Crumb[];
  className?: string;
}

/** Visible breadcrumb trail; the matching BreadcrumbList JSON-LD is emitted by <Seo>. */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs, className = '' }) => (
  <nav aria-label="Breadcrumb" className={`font-mono text-[11px] text-zinc-400 ${className}`}>
    <ol className="flex flex-wrap items-center gap-1.5">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <li key={c.path} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-zinc-600" aria-hidden="true" />}
            {last ? (
              <span aria-current="page" className="text-[#dfb76c] truncate max-w-[60vw]">
                {c.name}
              </span>
            ) : (
              <Link
                to={c.path}
                className="hover:text-white transition-colors flex items-center gap-1 truncate max-w-[40vw]"
              >
                {i === 0 && <Home className="w-3 h-3" aria-hidden="true" />}
                <span>{c.name}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
