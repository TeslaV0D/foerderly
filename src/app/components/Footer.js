import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 mb-8 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <p className="text-xs max-w-lg mx-auto text-center" style={{ color: 'var(--text-muted)' }}>
        Förderly – Daten basieren auf öffentlichen Informationen der Förderdatenbank des Bundes.
        Keine Gewähr für Vollständigkeit oder Aktualität.
      </p>
      <div className="flex items-center justify-center gap-4 mt-3">
        <Link href="/impressum" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
          Impressum
        </Link>
        <span style={{ color: 'var(--border-default)' }}>·</span>
        <Link href="/datenschutz" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
          Datenschutz
        </Link>
        <span style={{ color: 'var(--border-default)' }}>·</span>
        <Link href="/quellen" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
          Quellen
        </Link>
      </div>
    </footer>
  );
}
