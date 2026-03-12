'use client';

/**
 * Custom Error Page (Next.js App Router)
 * Fängt serverseitige und clientseitige Fehler ab.
 * SICHERHEIT: Keine internen Details an den User.
 */
export default function Error({ reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Ein Fehler ist aufgetreten
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht,
          laden Sie die Seite neu.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
