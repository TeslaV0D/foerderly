/**
 * Custom 404 Page
 * Zeigt eine benutzerfreundliche Fehlermeldung ohne interne Details.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">404</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Seite nicht gefunden
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}
