'use client';

/**
 * Kontakt-Widget für die Detail-Seite.
 * Zeigt E-Mail, Telefon und Links.
 */
export default function ContactWidget({ kontakte }) {
  if (!kontakte?.length) return null;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Kontakt
      </h3>
      <div className="space-y-2.5">
        {kontakte.map((kontakt, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-sm mt-0.5">
              {kontakt.typ === 'email' ? '📧' : kontakt.typ === 'telefon' ? '📞' : '🔗'}
            </span>
            <div className="min-w-0">
              {kontakt.typ === 'email' ? (
                <a
                  href={`mailto:${kontakt.wert}`}
                  className="text-sm break-all transition-colors"
                  style={{ color: 'var(--accent-text)' }}
                >
                  {kontakt.wert}
                </a>
              ) : kontakt.typ === 'telefon' ? (
                <a
                  href={`tel:${kontakt.wert.replace(/\s/g, '')}`}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--accent-text)' }}
                >
                  {kontakt.wert}
                </a>
              ) : (
                <a
                  href={kontakt.wert}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm break-all transition-colors"
                  style={{ color: 'var(--accent-text)' }}
                >
                  {new URL(kontakt.wert).hostname}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
