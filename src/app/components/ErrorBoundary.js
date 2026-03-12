'use client';

import { Component } from 'react';

/**
 * SICHERHEIT: Error Boundary
 * Fängt unerwartete Fehler im Frontend ab und zeigt eine
 * benutzerfreundliche Nachricht statt eines weißen Screens.
 * Keine internen Details werden dem User angezeigt.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Intern loggen – NICHT an den User zeigen
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">
              Etwas ist schiefgelaufen
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
