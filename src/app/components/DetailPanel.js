'use client';

import { useEffect, useRef } from 'react';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';

export default function DetailPanel({ programm, onClose }) {
  const panelRef = useRef(null);

  // ESC zum Schließen
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!programm) return null;

  const art = FOERDERARTEN[programm.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programm.volumen_min_eur || programm.volumen_max_eur;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium badge-${programm.foerderart}`}>
            {art.emoji} {art.label}
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          {/* Titel */}
          <div>
            {programm.kurzname && programm.kurzname !== programm.name && (
              <p className="text-sm font-semibold text-green-700 mb-1">{programm.kurzname}</p>
            )}
            <h2 className="text-xl font-bold text-stone-900 leading-snug">
              {programm.name}
            </h2>
            <p className="text-sm text-stone-500 mt-1.5">{programm.foerdergeber}</p>
          </div>

          {/* Fördervolumen */}
          {hasVolumen && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-medium text-green-600 mb-1">Förderhöhe</p>
              <p className="text-2xl font-bold text-green-800">
                {programm.volumen_min_eur === programm.volumen_max_eur
                  ? formatEuro(programm.volumen_max_eur)
                  : `${formatEuro(programm.volumen_min_eur)} – ${formatEuro(programm.volumen_max_eur)}`
                }
              </p>
              {programm.eigenanteil_prozent > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Eigenanteil: {programm.eigenanteil_prozent}%
                </p>
              )}
            </div>
          )}

          {/* Beschreibung */}
          {programm.beschreibung && (
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Beschreibung</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {programm.beschreibung}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Förderart */}
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-500 mb-0.5">Förderart</p>
              <p className="text-sm font-medium text-stone-800">{art.emoji} {art.label}</p>
            </div>

            {/* Eigenanteil */}
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-500 mb-0.5">Eigenanteil</p>
              <p className="text-sm font-medium text-stone-800">
                {programm.eigenanteil_prozent > 0 ? `${programm.eigenanteil_prozent}%` : 'Keiner'}
              </p>
            </div>
          </div>

          {/* Bundesländer */}
          {programm.bundeslaender?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Fördergebiet</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.bundeslaender.map(bl => (
                  <span key={bl} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                    {bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phasen */}
          {programm.phasen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Geeignete Unternehmensphasen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.phasen.map(ph => (
                  <span key={ph} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-medium">
                    {PHASEN[ph] || ph}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Größen */}
          {programm.groessen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Unternehmensgrößen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.groessen.map(gr => (
                  <span key={gr} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-medium">
                    {GROESSEN[gr] || gr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Branchen */}
          {programm.branchen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">Branchen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.branchen.map(br => (
                  <span key={br.slug || br.name} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                    {br.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Datenstand */}
          {programm.aktualisiert_am && (
            <p className="text-xs text-stone-400">
              Datenstand: {programm.aktualisiert_am}
            </p>
          )}
        </div>

        {/* Sticky Footer: Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-5 py-4 flex gap-3">
          {programm.url_antrag && (
            <a
              href={programm.url_antrag}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Zum Antrag
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {programm.url_quelle && (
            <a
              href={programm.url_quelle}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
            >
              Quelle
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
