'use client';

/**
 * Parse antragsfrist (DD.MM.YYYY or "laufend") and return urgency status.
 * Pure function — usable from both client and server contexts.
 */
export function getDeadlineStatus(antragsfrist) {
  if (!antragsfrist) return { urgency: 'none', daysLeft: null, isLaufend: false };

  const isLaufend = antragsfrist === 'laufend';
  if (isLaufend) return { urgency: 'laufend', daysLeft: null, isLaufend: true };

  const parts = antragsfrist.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!parts) return { urgency: 'none', daysLeft: null, isLaufend: false };

  const deadline = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  let urgency = 'green';
  if (daysLeft < 0) urgency = 'expired';
  else if (daysLeft <= 30) urgency = 'red';
  else if (daysLeft <= 90) urgency = 'yellow';

  return { urgency, daysLeft, isLaufend: false };
}

const STYLES = {
  expired: { background: 'color-mix(in oklch, oklch(0.65 0.22 25) 14%, transparent)', color: 'oklch(0.78 0.18 25)' },
  red:     { background: 'color-mix(in oklch, oklch(0.65 0.22 25) 14%, transparent)', color: 'oklch(0.78 0.18 25)' },
  yellow:  { background: 'color-mix(in oklch, oklch(0.78 0.16 80) 14%, transparent)', color: 'oklch(0.85 0.16 85)' },
  green:   { background: 'color-mix(in oklch, var(--accent) 14%, transparent)',       color: 'var(--accent)' },
  laufend: { background: 'color-mix(in oklch, var(--accent) 14%, transparent)',       color: 'var(--accent)' },
  none:    { background: 'var(--bg3)', color: 'var(--muted)' },
};

export default function DeadlineIndicator({ antragsfrist, hatDeadline, small = false }) {
  if (!antragsfrist) return null;
  const { urgency, daysLeft, isLaufend } = getDeadlineStatus(antragsfrist);
  const style = STYLES[urgency] || STYLES.none;

  if (small) {
    if (!hatDeadline) return null;
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={style}>
        {urgency === 'expired'
          ? '⏰ Abgelaufen'
          : daysLeft !== null
            ? `📅 ${daysLeft}d`
            : `📅 ${antragsfrist}`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium" style={style}>
      {isLaufend ? (
        <>✅ Laufend (keine Frist)</>
      ) : urgency === 'expired' ? (
        <>⏰ Frist abgelaufen ({antragsfrist})</>
      ) : daysLeft !== null ? (
        <>📅 {antragsfrist} ({daysLeft} Tage)</>
      ) : (
        <>📅 {antragsfrist}</>
      )}
    </span>
  );
}
