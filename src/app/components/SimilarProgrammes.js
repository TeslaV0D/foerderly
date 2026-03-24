'use client';

import Link from 'next/link';
import { FOERDERARTEN, formatEuro } from '@/lib/constants';

/**
 * Ähnliche Programme Widget (Sidebar der Detail-Seite)
 */
export default function SimilarProgrammes({ programmes, currentId }) {
  if (!programmes?.length) return null;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Ähnliche Programme
      </h3>
      <div className="space-y-3">
        {programmes.filter(p => p.id !== currentId).slice(0, 4).map(prog => {
          const art = FOERDERARTEN[prog.foerderart] || FOERDERARTEN.zuschuss;
          return (
            <Link
              key={prog.id}
              href={`/programme/${prog.id}`}
              className="block rounded-xl p-3 transition-all"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium badge-${prog.foerderart}`}>
                  {art.emoji} {art.label}
                </span>
                {prog.volumen_max_eur > 0 && (
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--accent-text)' }}>
                    {formatEuro(prog.volumen_max_eur)}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium line-clamp-2 mt-1" style={{ color: 'var(--text-primary)' }}>
                {prog.kurzname || prog.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {prog.foerdergeber}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
