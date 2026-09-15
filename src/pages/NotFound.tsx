import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../seo/Seo';
import { InstitutionalCrest } from '../components/InstitutionalCrest';
import { NAV_ITEMS } from '../routes/nav';
import { Search, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => (
  <div className="font-serif">
    <Seo
      title="Record Not Found (404)"
      description="The requested ZIAA archive record does not exist or has been moved. Browse prototypes, patents, research notes and monographs from the Zazie Institute of Applied Anomalies."
      path="/404"
      noindex
    />
    <section className="mx-auto max-w-2xl text-center bg-[#05080f] border border-[#213045] rounded-xl p-8 md:p-12 space-y-5 shadow-2xl">
      <div className="flex justify-center"><InstitutionalCrest size={72} variant="monochrome" /></div>
      <p className="archival-stamp archival-stamp-red text-[9.5px] font-mono mx-auto">ARCHIVE LOOKUP FAILED · HTTP 404</p>
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Record Not Found</h1>
      <p className="text-sm text-zinc-300 leading-relaxed">
        No entry in the Zazie Institute of Applied Anomalies archive matches this address. The record may have been
        superseded, moved to a canonical URL, or never accessioned.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link to="/" className="px-4 py-2 bg-[#dfb76c] hover:bg-[#ebd097] text-[#05080f] font-bold text-xs rounded">
          Return to Archive Overview
        </Link>
        <Link to="/search" className="px-4 py-2 bg-[#091322] hover:bg-[#0f1d33] border border-[#3b5373] text-zinc-200 font-bold text-xs rounded inline-flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#dfb76c]" aria-hidden="true" /> Search the Archive
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

export default NotFound;
