'use client';

import { BUNDESLAENDER, FOERDERARTEN, formatEuro } from '@/lib/constants';

export default function ResultCard({ programm, index, onClick }) {
  const art = FOERDERARTEN[programm.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programm.volumen_min_eur || programm.volumen_max_eur;

  return (
    <button
      type="button"
      onClick={() => onClick(programm)}
      className="card animate-fade-up p-4 sm:p-5 text-left w-full"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium badge-${programm.foerderart}`}>
          {art.emoji} {art.label}
        </span>
        {hasVolumen && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
            {programm.volumen_min_eur === programm.volumen_max_eur
              ? formatEuro(programm.volumen_max_eur)
              : `bis ${formatEuro(programm.volumen_max_eur)}`}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold mb-1 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {programm.kurzname && programm.kurzname !== programm.name && (
          <span className="gradient-text">{programm.kurzname} – </span>
        )}
        {programm.name}
      </h3>

      {/* Fördergeber */}
      <p className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>
        {programm.foerdergeber}
      </p>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {programm.beschreibung}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {programm.bundeslaender?.slice(0, 3).map(bl => (
          <span key={bl} className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }}>
            {bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)}
          </span>
        ))}
        {programm.eigenanteil_prozent > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
            {programm.eigenanteil_prozent}% Eigenanteil
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>Details ansehen</span>
        <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
