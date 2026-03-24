'use client';

/**
 * Deadline-Indikator: zeigt Antragsfrist visuell an.
 * Rot bei < 30 Tage, Gelb bei < 90 Tage, Grün bei "laufend".
 */
export default function DeadlineIndicator({ antragsfrist, hatDeadline, small = false }) {
  if (!antragsfrist) return null;

  const isLaufend = antragsfrist === 'laufend';

  // Versuche Datum zu parsen (DD.MM.YYYY)
  let daysLeft = null;
  let urgency = 'none'; // none | green | yellow | red

  if (!isLaufend) {
    const parts = antragsfrist.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (parts) {
      const deadline = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
      const now = new Date();
      daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) urgency = 'expired';
      else if (daysLeft <= 30) urgency = 'red';
      else if (daysLeft <= 90) urgency = 'yellow';
      else urgency = 'green';
    }
  }

  const styles = {
    expired: { background: 'rgba(239,68,68,0.1)', color: '#f87171' },
    red: { background: 'rgba(239,68,68,0.1)', color: '#f87171' },
    yellow: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
    green: { background: 'rgba(52,211,153,0.1)', color: '#6ee7b7' },
    none: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
  };

  const style = styles[urgency] || styles.none;

  if (small) {
    if (!hatDeadline && isLaufend) return null;
    if (!hatDeadline) return null;
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={style}>
        {urgency === 'expired' ? '⏰ Abgelaufen' :
         daysLeft !== null ? `📅 ${daysLeft}d` :
         `📅 ${antragsfrist}`}
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
