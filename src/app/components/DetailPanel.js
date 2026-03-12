'use client';

import { useEffect, useRef } from 'react';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';

export default function DetailPanel({ programm, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
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
      <div className="absolute inset-0 animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />

      {/* Panel */}
      <div ref={panelRef} className="relative w-full max-w-lg overflow-y-auto animate-slide-in" style={{ background: 'var(--bg-secondary)', boxShadow: '-20px 0 60px -12px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium badge-${programm.foerderart}`}>
            {art.emoji} {art.label}
          </span>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl transition-colors" style={{ color: 'var(--text-muted)' }} aria-label="Schließen">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          <div>
            {programm.kurzname && programm.kurzname !== programm.name && (
              <p className="text-sm font-semibold mb-1 gradient-text">{programm.kurzname}</p>
            )}
            <h2 className="text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{programm.name}</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>{programm.foerdergeber}</p>
          </div>

          {/* Funding amount */}
          {hasVolumen && (
            <div className="rounded-2xl p-4" style={{ background: 'var(--accent-muted)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-text)' }}>Förderhöhe</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-text)' }}>
                {programm.volumen_min_eur === programm.volumen_max_eur
                  ? formatEuro(programm.volumen_max_eur)
                  : `${formatEuro(programm.volumen_min_eur)} – ${formatEuro(programm.volumen_max_eur)}`}
              </p>
              {programm.eigenanteil_prozent > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Eigenanteil: {programm.eigenanteil_prozent}%</p>
              )}
            </div>
          )}

          {/* Description */}
          {programm.beschreibung && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Beschreibung</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{programm.beschreibung}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Förderart</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{art.emoji} {art.label}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Eigenanteil</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {programm.eigenanteil_prozent > 0 ? `${programm.eigenanteil_prozent}%` : 'Keiner'}
              </p>
            </div>
          </div>

          {/* Bundesländer */}
          {programm.bundeslaender?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Fördergebiet</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.bundeslaender.map(bl => (
                  <span key={bl} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }}>
                    {bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phasen */}
          {programm.phasen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Geeignete Phasen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.phasen.map(ph => (
                  <span key={ph} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                    {PHASEN[ph] || ph}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Größen */}
          {programm.groessen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Unternehmensgrößen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.groessen.map(gr => (
                  <span key={gr} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6' }}>
                    {GROESSEN[gr] || gr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Branchen */}
          {programm.branchen?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Branchen</h3>
              <div className="flex flex-wrap gap-1.5">
                {programm.branchen.map(br => (
                  <span key={br.slug || br.name} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {br.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {programm.aktualisiert_am && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Datenstand: {programm.aktualisiert_am}</p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 px-5 py-4 flex gap-3" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-default)' }}>
          {programm.url_antrag && (
            <a href={programm.url_antrag} target="_blank" rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}>
              Zum Antrag
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {programm.url_quelle && (
            <a href={programm.url_quelle} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              Quelle
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
