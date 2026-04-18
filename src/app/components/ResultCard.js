import Link from 'next/link';
import { BUNDESLAENDER, FOERDERARTEN, formatEuro } from '@/lib/constants';
import { getDeadlineStatus } from '@/lib/deadline';

const ACCENT_BY_FOERDERART = {
  zuschuss: 'green',
  kredit: 'green',
  buergschaft: 'violet',
  beteiligung: 'violet',
};

function getDescription(programme) {
  if (programme.description_short) return programme.description_short;
  if (!programme.beschreibung) return null;
  if (programme.beschreibung.length <= 140) return programme.beschreibung;
  return programme.beschreibung.slice(0, 140).replace(/\s+\S*$/, '') + '…';
}

function getStatusBadge(programme) {
  const { urgency, daysLeft, isLaufend } = getDeadlineStatus(programme.antragsfrist);

  if (isLaufend) return { label: 'Laufend', dotColor: 'var(--accent)', textColor: 'var(--text)', pulse: true };
  if (urgency === 'expired') return { label: 'Abgelaufen', dotColor: 'oklch(0.7 0.2 25)', textColor: 'var(--muted)', pulse: false };
  if (urgency === 'red') return { label: `${daysLeft}d`, dotColor: 'oklch(0.7 0.2 25)', textColor: 'var(--text)', pulse: true };
  if (urgency === 'yellow') return { label: `${daysLeft}d`, dotColor: 'oklch(0.85 0.16 85)', textColor: 'var(--text)', pulse: false };
  if (urgency === 'green') return { label: 'Offen', dotColor: 'var(--accent)', textColor: 'var(--text)', pulse: true };
  return { label: 'Offen', dotColor: 'var(--accent)', textColor: 'var(--text)', pulse: true };
}

export default function ResultCard({ programme, programm, index = 0 }) {
  const p = programme || programm;
  if (!p) return null;

  const art = FOERDERARTEN[p.foerderart] || FOERDERARTEN.zuschuss;
  const accentVariant = ACCENT_BY_FOERDERART[p.foerderart] || 'green';
  const accentVar = accentVariant === 'violet' ? 'var(--accent2)' : 'var(--accent)';
  const description = getDescription(p);
  const status = getStatusBadge(p);
  const tagClass = accentVariant === 'violet' ? 'tag-violet' : 'tag-green';
  const bundesland = (p.bundeslaender || [])[0];
  const bundeslandLabel = bundesland === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bundesland] || bundesland);

  return (
    <Link
      href={`/programme/${p.id}`}
      className="result-card animate-card-in"
      style={{
        '--card-accent': accentVar,
        animationDelay: `${Math.min(index, 12) * 60}ms`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: 28,
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition:
          'transform 0.35s cubic-bezier(0.2,0.8,0.2,1), border-color 0.25s, box-shadow 0.35s, background 0.25s',
        height: '100%',
      }}
    >
      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-in {
          animation: card-in 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--card-accent) 45%, transparent); }
          50%      { box-shadow: 0 0 0 6px color-mix(in oklch, var(--card-accent) 0%, transparent); }
        }
        .result-card__status--pulse .result-card__status-dot {
          animation: badge-pulse 2s ease-in-out infinite;
        }

        .result-card__sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            600px circle at var(--mx, 50%) var(--my, 0%),
            color-mix(in oklch, var(--card-accent) 10%, transparent),
            transparent 45%
          );
          transition: opacity 0.35s;
        }
        .result-card:hover .result-card__sheen { opacity: 1; }

        .result-card:hover {
          transform: translateY(-6px) scale(1.008);
          border-color: color-mix(in oklch, var(--card-accent) 55%, transparent);
          background: color-mix(in oklch, var(--card-accent) 3%, var(--bg2));
          box-shadow:
            0 0 0 1px color-mix(in oklch, var(--card-accent) 18%, transparent),
            0 20px 52px oklch(0 0 0 / 0.45),
            0 0 40px color-mix(in oklch, var(--card-accent) 12%, transparent);
        }
        .result-card:hover .result-card__title {
          color: var(--card-accent);
          transform: translateX(2px);
        }
        .result-card:hover .result-card__arrow {
          background: var(--card-accent);
          color: var(--bg);
          transform: translate(3px, -3px) rotate(-8deg);
          box-shadow: 0 6px 18px color-mix(in oklch, var(--card-accent) 40%, transparent);
        }
        .result-card:hover .result-card__icon-area {
          background: color-mix(in oklch, var(--card-accent) 24%, transparent);
          transform: scale(1.08) rotate(-4deg);
        }
        .result-card:hover .result-card__tag {
          transform: translateY(-1px);
        }
        .result-card:hover .result-card__stat-value {
          color: var(--card-accent);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-card-in,
          .result-card__status--pulse .result-card__status-dot {
            animation: none !important;
          }
          .result-card,
          .result-card * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      <span className="result-card__sheen" aria-hidden="true" />

      {/* Eyebrow row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className={`${tagClass} result-card__tag`} style={{ transition: 'transform 0.25s cubic-bezier(0.2,0.8,0.2,1)' }}>
          {art.label}
        </span>
        <span
          className="result-card__arrow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'var(--bg3)',
            color: 'var(--muted)',
            transition: 'background 0.25s, color 0.25s, transform 0.3s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.3s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </div>

      {/* Icon area */}
      <div
        className="result-card__icon-area"
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: `color-mix(in oklch, ${accentVar} 12%, transparent)`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          marginTop: 18,
          transition: 'background 0.3s, transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
          transformOrigin: 'center',
        }}
        aria-hidden="true"
      >
        {art.emoji}
      </div>

      {/* Title */}
      <h3
        className="result-card__title line-clamp-2"
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
          marginTop: 16,
          lineHeight: 1.25,
          transition: 'color 0.25s, transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {p.kurzname && p.kurzname !== p.name ? `${p.kurzname} – ${p.name}` : p.name}
      </h3>

      {/* Fördergeber (small label) */}
      {p.foerdergeber && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, fontWeight: 500 }}>
          {p.foerdergeber}
        </p>
      )}

      {/* Description */}
      <div style={{ flexGrow: 1, marginTop: 12 }}>
        {description ? (
          <p
            className="line-clamp-2"
            style={{ fontSize: 14, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.55 }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {/* Meta row */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 18 }}>
          {p.volumen_max_eur > 0 && (
            <Stat label="Bis zu" value={formatEuro(p.volumen_max_eur)} />
          )}
          {bundeslandLabel && (
            <Stat label="Region" value={bundeslandLabel} />
          )}
          {!p.volumen_max_eur && p.foerderquote > 0 && (
            <Stat label="Förderquote" value={`${p.foerderquote}%`} />
          )}
        </div>

        <span
          className={`result-card__status${status.pulse ? ' result-card__status--pulse' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 100,
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            fontSize: 11,
            fontWeight: 600,
            color: status.textColor,
          }}
        >
          <span
            className="result-card__status-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: status.dotColor,
              boxShadow: `0 0 6px ${status.dotColor}`,
              '--card-accent': status.dotColor,
            }}
          />
          {status.label}
        </span>
      </div>
    </Link>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span className="result-card__stat-value" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', transition: 'color 0.25s' }}>{value}</span>
    </div>
  );
}
