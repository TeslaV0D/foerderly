'use client';

/**
 * Custom Error Page (Next.js App Router)
 * Fängt serverseitige und clientseitige Fehler ab.
 * SICHERHEIT: Keine internen Details an den User.
 */
export default function Error({ reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">
          Ein Fehler ist aufgetreten
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht,
          laden Sie die Seite neu.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-medium rounded-lg transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
