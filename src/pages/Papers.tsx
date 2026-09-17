import React from 'react';
import { Link } from 'react-router-dom';
import { loadMonographs, loadPatents, monographPath, recordPath } from '../data/archive';
import { useCollection } from '../lib/useCollection';
import { Seo } from '../seo/Seo';
import { breadcrumbSchema, collectionPageSchema, datasetSchema } from '../seo/schema';
import { PageHeader } from '../components/PageHeader';
import { FileText, Download, BookOpen } from 'lucide-react';

const CRUMBS = [
  { name: 'ZIAA', path: '/' },
  { name: 'Papers', path: '/papers' }
];

export const Papers: React.FC = () => {
  const monographs = useCollection(loadMonographs);
  const patents = useCollection(loadPatents);

  return (
    <div className="space-y-6 font-serif">
      <Seo
        title="Research Papers & Archival PDFs (108 Documents)"
        description="The ZIAA papers corpus: 8 Transactions monographs and 100 speculative patent defensive disclosures, each with a canonical HTML dossier and a citable PDF. ISSN 2834-9180 (online)."
        path="/papers"
        keywords={['ZIAA papers', 'research PDFs', 'monographs PDF', 'defensive publication PDF', 'citation_pdf_url', 'Scholar']}
        jsonLd={[
          breadcrumbSchema(CRUMBS),
          collectionPageSchema({
            name: 'ZIAA Archival Papers - Monographs & Defensive Publications',
            description: '108 archival PDFs: 8 Transactions monographs and 100 speculative patent disclosures, each with a persistent HTML dossier and a byte-identical PDF carrying matching title, author and subject metadata.',
            path: '/papers',
            about: ['scholarly communication', 'open research', 'defensive publication'],
            items: [
              ...monographs.map(m => ({ name: `${m.id} - ${m.title}`, path: monographPath(m.id) })),
              ...patents.slice(0, 30).map(p => ({ name: `${p.id} - ${p.title}`, path: recordPath('patent', p.id) }))
            ],
            maxItems: 50
          }),
          datasetSchema({
            path: '/papers',
            name: 'ZIAA Papers Corpus - PDFs and Citation Graph',
            description: 'The ZIAA papers corpus as a machine-readable dataset: 108 PDFs (8 Transactions monographs + 100 defensive disclosures) with Scholar-style citation metadata and matching HTML dossiers.',
            keywords: ['papers', 'PDF', 'citation', 'Scholar', 'defensive publication'],
            distributionUrl: 'https://zazieinstitute.org/papers/essay-2022-01.pdf'
          })
        ]}
      />

      <PageHeader
        crumbs={CRUMBS}
        stamp="PAPERS & CITATION CORPUS"
        kicker="108 ARCHIVAL PDFs - HTML DOSSIER + BYTE-IDENTICAL PDF FOR SCHOLAR"
        title={<>Research Papers & Archival PDFs (108 Documents)</>}
        lede="Every monograph and speculative patent in the ZIAA archive exists as a canonical HTML dossier (with JSON-LD and citation_* meta) and as a byte-identical PDF served as application/pdf at /papers/<id>.pdf. The PDF is the Scholar surface; the HTML is the human surface. Both share one canonical and one citation identifier."
        aside={
          <div className="text-right text-xs font-mono text-zinc-300 bg-[#020509] px-3.5 py-2.5 border border-[#1b2636] rounded-md shrink-0">
            <div className="text-white font-bold">8 Monographs · 100 Patents</div>
            <div className="text-[11px] text-zinc-400">PDFs at /papers/*.pdf · 200 as application/pdf</div>
          </div>
        }
      />

      <section aria-labelledby="monograph-pdfs" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1b2636] pb-3">
          <BookOpen className="w-4 h-4 text-[#dfb76c]" aria-hidden="true" />
          <h2 id="monograph-pdfs" className="text-sm font-bold text-white tracking-wide">Peer-reviewed monographs - Transactions (8) - HTML + PDF</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">Peer-reviewed working papers (ISSN 2834-9180). Each entry links to the HTML dossier (with ScholarlyArticle + citation_* meta) and to the PDF that the meta’s <code className="px-1 py-0.5 bg-[#0c1420] border border-[#1b2738] rounded text-cyan-300">citation_pdf_url</code> points to. The PDF 200s as <code className="text-cyan-300">application/pdf</code> and is cacheable 7 days.</p>
        <ul className="space-y-2.5" aria-label="Monograph PDFs">
          {monographs.map(m => (
            <li key={m.id} className="bg-[#03060a] border border-[#1b2738] hover:border-[#dfb76c]/60 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-[#dfb76c] group-hover:text-white">{m.id}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0c1420] border border-[#233347] text-cyan-300 rounded">{m.volume}</span>
                  <span className="text-[11px] font-mono text-zinc-500">{m.date}</span>
                </div>
                <Link to={monographPath(m.id)} className="text-sm font-bold text-zinc-100 group-hover:text-[#dfb76c] leading-snug hover:underline">{m.title}</Link>
                <div className="text-xs text-zinc-400 mt-1">{m.author}{m.coAuthors?.length ? `, ${m.coAuthors.join(', ')}` : ''}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={monographPath(m.id)} className="px-3 py-1.5 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-zinc-300 rounded-md text-xs font-mono">HTML dossier</Link>
                <a href={`/papers/${m.id.toLowerCase()}.pdf`} className="px-3 py-1.5 bg-[#dfb76c] hover:bg-[#ebd097] text-black font-bold rounded-md text-xs font-mono flex items-center gap-1.5" download>
                  <Download className="w-3.5 h-3.5" aria-hidden="true" /> PDF
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="patent-pdfs" className="bg-[#05080f] border border-[#213045] rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1b2636] pb-3">
          <FileText className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <h2 id="patent-pdfs" className="text-sm font-bold text-white tracking-wide">Speculative patent disclosures - defensive publications (100) - HTML + PDF</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">Defensive publications written in patent register (abstract, claims, prior-art critique, counsel memo). Each has an HTML dossier and a PDF at <code className="text-cyan-300">/papers/pat-*.pdf</code> referenced by <code className="px-1 py-0.5 bg-[#0c1420] border border-[#1b2738] rounded text-cyan-300">citation_pdf_url</code> on the patent page. The PDF is the Scholar-indexable artifact; the HTML is the citation landing.</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[32rem] overflow-auto pr-1" aria-label="Patent PDFs">
          {patents.map(p => (
            <li key={p.id} className="bg-[#03060a] border border-[#1b2738] hover:border-cyan-500/50 rounded-lg p-3.5 flex flex-col justify-between gap-2 group">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400 group-hover:text-white">{p.id}</span>
                  <span className="text-[10px] font-mono px-1 py-0.5 bg-[#0b1522] border border-cyan-800/50 text-cyan-300 rounded">{p.patentNumber}</span>
                </div>
                <Link to={recordPath('patent', p.id)} className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 leading-snug line-clamp-2 hover:underline">{p.title}</Link>
                <div className="text-[11px] font-mono text-zinc-500 mt-1 truncate">{p.inventors.join(', ')} · {p.filingDate}</div>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-[#1b2738]">
                <Link to={recordPath('patent', p.id)} className="flex-1 text-center px-2 py-1 bg-[#09121d] hover:bg-[#122238] border border-[#263c59] text-zinc-300 rounded text-xs font-mono">HTML</Link>
                <a href={`/papers/${p.id.toLowerCase()}.pdf`} className="flex-1 text-center px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-xs font-mono flex items-center justify-center gap-1" download><Download className="w-3 h-3" aria-hidden="true" /> PDF</a>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-[#1b2636]">All PDFs are generated by <code className="text-zinc-300">scripts/build-pdfs.mjs</code> from the same JSON that feeds the HTML dossiers - no divergence between surfaces. See <Link to="/legal/disclaimer" className="text-[#dfb76c] hover:underline">disclaimer</Link> for patent status.</p>
      </section>

      <section aria-labelledby="how-to-cite" className="bg-[#05080f] border border-[#1b2738] rounded-xl p-5 space-y-3">
        <h2 id="how-to-cite" className="text-sm font-bold text-white">How to cite - Scholar-compatible</h2>
        <p className="text-xs text-zinc-300 leading-relaxed">Each HTML dossier emits Highwire Press meta: <code className="text-cyan-300">citation_title, citation_author, citation_publication_date, citation_journal_title, citation_volume, citation_pdf_url, citation_publisher, dc.identifier</code>. The <code className="text-cyan-300">citation_pdf_url</code> is the PDF listed above (200 as <code className="text-cyan-300">application/pdf</code>). The PDF’s own <code className="text-zinc-400">Info</code> dictionary mirrors the same title/author/subject. No meta is emitted on logs, prototypes or post-mortems - only on surfaces that actually have a PDF artifact.</p>
        <p className="text-[11px] font-mono text-zinc-500">BibTeX/APA/IEEE on each dossier’s “Cite” button generates the same identifier and canonical URL used in the meta. For monographs the journal is <em className="text-zinc-400">ZIAA Transactions on Applied Anomalies & Experimental Systems, ISSN 2834-9180</em>.</p>
      </section>
    </div>
  );
};

export default Papers;
