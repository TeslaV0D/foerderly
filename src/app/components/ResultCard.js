'use client';

import { BUNDESLAENDER, FOERDERARTEN, formatEuro } from '@/lib/constants';

export default function ResultCard({ programm, index, onClick }) {
  const art = FOERDERARTEN[programm.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programm.volumen_min_eur || programm.volumen_max_eur;

  return (
    <button
      type="button"
      onClick={() => onClick(programm)}
      className="animate-fade-up card-hover bg-white rounded-xl border border-stone-200 p-4 sm:p-5 text-left w-full transition-all hover:border-green-200"
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
    >
      {/* Top row: Badge + Volumen */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium badge-${programm.foerderart}`}>
          {art.emoji} {art.label}
        </span>
        {hasVolumen && (
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded shrink-0">
            {programm.volumen_min_eur === programm.volumen_max_eur
              ? formatEuro(programm.volumen_max_eur)
              : `bis ${formatEuro(programm.volumen_max_eur)}`
            }
          </span>
        )}
      </div>

      {/* Titel */}
      <h3 className="text-base font-semibold text-stone-900 mb-1 leading-snug line-clamp-2">
        {programm.kurzname && programm.kurzname !== programm.name && (
          <span className="text-green-700">{programm.kurzname} – </span>
        )}
        {programm.name}
      </h3>

      {/* Fördergeber */}
      <p className="text-xs text-stone-500 mb-2.5">
        {programm.foerdergeber}
      </p>

      {/* Beschreibung */}
      <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-2">
        {programm.beschreibung}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {programm.bundeslaender?.slice(0, 3).map(bl => (
          <span key={bl} className="text-[11px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
            {bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)}
          </span>
        ))}
        {programm.eigenanteil_prozent > 0 && (
          <span className="text-[11px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
            {programm.eigenanteil_prozent}% Eigenanteil
          </span>
        )}
      </div>

      {/* "Mehr erfahren" hint */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs font-medium text-green-700">Details ansehen</span>
        <svg className="w-3.5 h-3.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
