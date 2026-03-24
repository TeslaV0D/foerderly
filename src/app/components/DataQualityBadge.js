'use client';

/**
 * Datenqualitäts-Badge
 * Zeigt visuell an wie vollständig die Programm-Daten sind.
 */
export default function DataQualityBadge({ quality, small = false }) {
  const config = {
    vollstaendig: { label: 'Vollständig', color: '#6ee7b7', bg: 'rgba(52,211,153,0.1)', icon: '✓' },
    unvollstaendig: { label: 'Teilweise', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: '◐' },
    minimal: { label: 'Minimal', color: '#6a6a78', bg: 'var(--bg-elevated)', icon: '○' },
  };

  const c = config[quality] || config.minimal;

  if (small) {
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-md"
        style={{ background: c.bg, color: c.color }}
        title={`Datenqualität: ${c.label}`}
      >
        {c.icon}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      {c.icon} {c.label}
    </span>
  );
}
