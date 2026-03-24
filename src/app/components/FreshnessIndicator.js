'use client';

/**
 * Daten-Freshness-Indicator
 * Zeigt an wie aktuell die Programm-Daten sind.
 */
export default function FreshnessIndicator({ date }) {
  if (!date) return null;

  const updated = new Date(date);
  const now = new Date();
  const daysAgo = Math.floor((now - updated) / (1000 * 60 * 60 * 24));

  let label, color;
  if (daysAgo <= 7) {
    label = 'Aktuell';
    color = '#6ee7b7';
  } else if (daysAgo <= 30) {
    label = `Vor ${daysAgo} Tagen`;
    color = '#fbbf24';
  } else if (daysAgo <= 90) {
    label = `Vor ${Math.floor(daysAgo / 7)} Wochen`;
    color = '#fb923c';
  } else {
    label = `Vor ${Math.floor(daysAgo / 30)} Monaten`;
    color = '#f87171';
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      Datenstand: {label}
    </span>
  );
}
