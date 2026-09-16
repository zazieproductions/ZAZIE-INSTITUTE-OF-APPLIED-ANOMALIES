import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * Status panels for the archive shell. Currently the section ErrorBoundary's
 * recoverable failure panel: a broken module degrades to a clear, on-brand
 * message instead of a blank page.
 */

export const PanelShell: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'error' | 'empty';
  className?: string;
}> = ({ children, tone = 'neutral', className = '' }) => {
  const border =
    tone === 'error' ? 'border-red-950/80 bg-[#0a0405]' : 'border-[#213045] bg-[#05080f]';
  return (
    <div className={`rounded-xl border ${border} p-6 text-center shadow-lg ${className}`}>
      {children}
    </div>
  );
};

/** Loading state used while a heavy lab console / page chunk is fetched. */

export const ErrorPanel: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  detail?: string;
}> = ({
  title = 'THIS ARCHIVE SECTION FAILED TO LOAD',
  message = 'The requested module could not be resolved. The rest of the archive is unaffected and remains available.',
  onRetry,
  onBack,
  detail
}) => (
  <PanelShell tone="error" className="font-serif">
    <div className="flex justify-center text-red-400 mb-3">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <div className="text-sm font-bold text-red-200 tracking-wide uppercase">{title}</div>
    <p className="text-xs text-zinc-400 mt-1.5 max-w-lg mx-auto leading-relaxed">{message}</p>
    {detail && (
      <p className="mt-3 text-[10.5px] font-mono text-zinc-500 break-words max-w-lg mx-auto">{detail}</p>
    )}
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-red-950/60 hover:bg-red-900/70 border border-red-800 text-red-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY</span>
        </button>
      )}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-[#091322] hover:bg-[#0f1d33] border border-[#2b3e58] text-zinc-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO OVERVIEW</span>
        </button>
      )}
    </div>
  </PanelShell>
);
