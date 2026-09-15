export type LegalSectionKey = 'status' | 'disclaimer' | 'terms' | 'privacy';

/** URL slug ↔ section key. Each section is its own indexable page under /legal/. */
export const LEGAL_SLUGS: Record<LegalSectionKey, string> = {
  status: 'institutional-status',
  disclaimer: 'disclaimer',
  terms: 'terms',
  privacy: 'privacy'
};
export const legalPath = (key: LegalSectionKey) => `/legal/${LEGAL_SLUGS[key]}`;
