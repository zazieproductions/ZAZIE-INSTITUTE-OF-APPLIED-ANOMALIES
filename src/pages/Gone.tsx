import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { NAV_ITEMS } from '../routes/nav';
import { Link2Off, ArrowRight } from 'lucide-react';

/**
 * Gone surface (HTTP 410). Reached when a retired ZIAA address — one that
 * served content and was permanently withdrawn — is requested. Unlike /404 this
 * page must never invite a re-crawl: the path is deliberately not replaced.
 *
 * Hosts with 410 support answer these paths directly (see public/_redirects and
 * deploy/*). Hosts without it (Vercel configuration redirects cannot express
 * 410) fall through to the error surface, and the alias resolver routes known
 * retired paths here so the visitor at least gets the honest explanation.
 */
export const Gone: React.FC = () => (
  <div className="font-serif">
    <Seo
      title="Record Withdrawn (410)"
      description="This ZIAA address is permanently withdrawn. The record it served has been retired from the Zazie Institute of Applied Anomalies archive and has no successor page."
      path="/410"
      noindex
    />
    <section className="mx-auto max-w-2xl text-center bg-[#05080f] border border-[#213045] rounded-xl p-8 md:p-12 space-y-5 shadow-2xl">
      <div className="flex justify-center"><InstitutionalCrest size={72} variant="monochrome" /></div>
      <p className="archival-stamp archival-stamp-red text-[9.5px] font-mono mx-auto">RECORD WITHDRAWN · HTTP 410</p>
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Permanently Withdrawn</h1>
      <p className="text-sm text-zinc-300 leading-relaxed">
        This address served a ZIAA record that has since been retired from the archive. It has no successor page and
        will not be reinstated — unlike a moved record, no permanent redirect applies. The surviving holdings are
        listed below.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link to="/" className="px-4 py-2 bg-[#dfb76c] hover:bg-[#ebd097] text-[#05080f] font-bold text-xs rounded">
          Return to Archive Overview
        </Link>
        <Link to="/monographs" className="px-4 py-2 bg-[#091322] hover:bg-[#0f1d33] border border-[#3b5373] text-zinc-200 font-bold text-xs rounded inline-flex items-center gap-2">
          <Link2Off className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" /> Surviving Publications
        </Link>
      </div>
      <nav aria-label="Archive sections" className="pt-4 border-t border-[#1b2636]">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-mono">
          {NAV_ITEMS.filter(n => n.to !== '/').map(n => (
            <li key={n.to}>
              <Link to={n.to} className="text-zinc-300 hover:text-[#dfb76c] inline-flex items-center gap-1">
                {n.label} <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  </div>
);

export default Gone;
