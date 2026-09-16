import React from 'react';
import { ErrorPanel } from './StatusPanels';

interface Props {
  children: React.ReactNode;
  /** Changing this value clears a previously caught error (e.g. on tab change). */
  resetKey?: string;
  onBack?: () => void;
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time failures in a single archive section so a broken module
 * (WebGL unavailable, a missing record, a failed chunk download) degrades to a
 * clear message instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error) {
    // Keep the diagnostic in the console for maintainers, but never rely on it
    // as the only signal — the UI below explains the failure to the user.
    console.error('[ZIAA] Section render failure:', error);
  }

  render() {
    if (this.state.error) {
      const isChunkError = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
        this.state.error.message || ''
      );
      return (
        <ErrorPanel
          title={this.props.label ?? 'THIS ARCHIVE SECTION FAILED TO LOAD'}
          message={
            isChunkError
              ? 'A required archive module could not be downloaded. This is usually a temporary network problem — retry, or reload the page.'
              : 'An unexpected fault occurred while rendering this record. Other archive sections remain fully available.'
          }
          detail={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
          onBack={this.props.onBack}
        />
      );
    }
    return this.props.children;
  }
}
