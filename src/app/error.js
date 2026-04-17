'use client';

export default function Error({ reset }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ padding: 24, position: 'relative', zIndex: 10 }}
    >
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h1
          className="gradient-text"
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-1px',
            marginBottom: 10,
          }}
        >
          Ein Fehler ist aufgetreten
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            marginBottom: 24,
            lineHeight: 1.55,
          }}
        >
          Bitte versuchen Sie es erneut. Wenn das Problem weiterhin besteht, laden Sie die Seite neu.
        </p>
        <div className="flex justify-center" style={{ gap: 10 }}>
          <button onClick={() => reset()} className="btn-accent">
            Erneut versuchen
          </button>
          <a href="/" className="btn-ghost">
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
