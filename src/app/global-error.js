'use client';

/**
 * SICHERHEIT: Globale Fehlerseite
 * Zeigt eine benutzerfreundliche Meldung.
 * Keine Stacktraces, keine internen Details.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="de">
      <body className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-stone-800 mb-2">
            Ein Fehler ist aufgetreten
          </h1>
          <p className="text-sm text-stone-500 mb-6">
            Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex px-5 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
