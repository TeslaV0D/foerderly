import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ padding: 24, position: 'relative', zIndex: 10 }}
    >
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div
          className="gradient-text"
          style={{
            fontSize: 'clamp(72px, 14vw, 120px)',
            fontWeight: 800,
            letterSpacing: '-4px',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: 'var(--text)',
            marginBottom: 10,
          }}
        >
          Seite nicht gefunden
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            marginBottom: 24,
            lineHeight: 1.55,
          }}
        >
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link href="/" className="btn-accent">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
