import Link from 'next/link';
import { BUNDESLAENDER, FOERDERARTEN, formatEuro } from '@/lib/constants';
import { getDeadlineStatus } from './DeadlineIndicator';

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

  if (isLaufend) return { label: 'Laufend', dotColor: 'var(--accent)', textColor: 'var(--text)' };
  if (urgency === 'expired') return { label: 'Abgelaufen', dotColor: 'oklch(0.7 0.2 25)', textColor: 'var(--muted)' };
  if (urgency === 'red') return { label: `${daysLeft}d`, dotColor: 'oklch(0.7 0.2 25)', textColor: 'var(--text)' };
  if (urgency === 'yellow') return { label: `${daysLeft}d`, dotColor: 'oklch(0.85 0.16 85)', textColor: 'var(--text)' };
  if (urgency === 'green') return { label: 'Offen', dotColor: 'var(--accent)', textColor: 'var(--text)' };
  return { label: 'Offen', dotColor: 'var(--accent)', textColor: 'var(--text)' };
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
      className="result-card animate-fade-up"
      style={{
        '--card-accent': accentVar,
        animationDelay: `${Math.min(index, 10) * 70}ms`,
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
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s, box-shadow 0.25s',
        height: '100%',
      }}
    >
      <style>{`
        .result-card:hover {
          transform: translateY(-4px) scale(1.005);
          border-color: color-mix(in oklch, var(--card-accent) 45%, transparent);
          box-shadow:
            0 0 0 1px color-mix(in oklch, var(--card-accent) 15%, transparent),
            0 16px 48px oklch(0 0 0 / 0.4);
        }
        .result-card:hover .result-card__title { color: var(--card-accent); }
        .result-card:hover .result-card__arrow {
          background: var(--card-accent);
          color: var(--bg);
          transform: translate(2px, -2px);
        }
        .result-card:hover .result-card__icon-area {
          background: color-mix(in oklch, var(--card-accent) 18%, transparent);
        }
      `}</style>

      {/* Eyebrow row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className={tagClass}>{art.label}</span>
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
            transition: 'background 0.2s, color 0.2s, transform 0.2s',
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
          transition: 'background 0.25s',
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
          transition: 'color 0.2s',
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
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: status.dotColor,
              boxShadow: `0 0 6px ${status.dotColor}`,
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
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
