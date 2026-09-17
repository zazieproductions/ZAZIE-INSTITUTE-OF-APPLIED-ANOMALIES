export const humanize = (s: string) => s.replace(/_/g, ' ');
export const titleCase = (s: string) =>
  humanize(s).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
export const isoDate = (s: string) => (s.length >= 10 ? s.slice(0, 10) : s);
/** Clip text at a word boundary (for <title>/description budgets), adding an ellipsis when cut. */
export const clip = (s: string, max: number) => {
  const t = s.trim().replace(/\.{3}$|…$/, '');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[,;:\-–-\s]+$/, '')}…`;
};
