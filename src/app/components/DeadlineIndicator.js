'use client';

import { getDeadlineStatus } from '@/lib/deadline';

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
