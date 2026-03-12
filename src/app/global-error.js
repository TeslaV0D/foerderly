'use client';

/**
 * SICHERHEIT: Globale Fehlerseite
 * Zeigt eine benutzerfreundliche Meldung.
 * Keine Stacktraces, keine internen Details.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="de">
      <body className="min-h-screen flex items-center justify-center  p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Ein Fehler ist aufgetreten
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
