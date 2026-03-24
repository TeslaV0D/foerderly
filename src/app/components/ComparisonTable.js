'use client';

import Link from 'next/link';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';
import DataQualityBadge from './DataQualityBadge';
import DeadlineIndicator from './DeadlineIndicator';

/**
 * Vergleichstabelle für bis zu 4 Programme
 */
export default function ComparisonTable({ programmes }) {
  if (!programmes?.length) return null;

  const rows = [
    { label: 'Förderart', render: (p) => { const a = FOERDERARTEN[p.foerderart] || FOERDERARTEN.zuschuss; return `${a.emoji} ${a.label}`; } },
    { label: 'Fördergeber', render: (p) => p.foerdergeber || '–' },
    { label: 'Förderhöhe', render: (p) => {
      if (!p.volumen_max_eur) return '–';
      return p.volumen_min_eur === p.volumen_max_eur
        ? formatEuro(p.volumen_max_eur)
        : `${formatEuro(p.volumen_min_eur)} – ${formatEuro(p.volumen_max_eur)}`;
    }},
    { label: 'Eigenanteil', render: (p) => p.eigenanteil_prozent > 0 ? `${p.eigenanteil_prozent}%` : 'Keiner' },
    { label: 'Förderquote', render: (p) => p.foerderquote ? `bis ${p.foerderquote}%` : '–' },
    { label: 'Antragsfrist', render: (p) => p.antragsfrist || 'Keine Frist' },
    { label: 'Bearbeitungszeit', render: (p) => p.bearbeitungszeit || '–' },
    { label: 'Fördergebiet', render: (p) => (p.bundeslaender || []).map(bl => bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)).join(', ') || '–' },
    { label: 'Phasen', render: (p) => (p.phasen || []).map(ph => PHASEN[ph] || ph).join(', ') || '–' },
    { label: 'Größen', render: (p) => (p.groessen || []).map(gr => GROESSEN[gr] || gr).join(', ') || '–' },
    { label: 'Branchen', render: (p) => (p.branchen || []).map(b => b.name).join(', ') || '–' },
    { label: 'Zielgruppen', render: (p) => (p.zielgruppen_erweitert || []).join(', ') || '–' },
    { label: 'Datenqualität', render: (p) => p.datenqualitaet || 'minimal', isComponent: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header mit Programm-Namen */}
        <thead>
          <tr>
            <th className="text-left p-3 text-xs font-medium w-40 sticky left-0 z-10"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
              Merkmal
            </th>
            {programmes.map(prog => (
              <th key={prog.id} className="p-3 text-left min-w-[200px]"
                style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
                <Link href={`/programme/${prog.id}`} className="block">
                  {prog.kurzname && (
                    <span className="text-xs font-semibold gradient-text block mb-0.5">
                      {prog.kurzname}
                    </span>
                  )}
                  <span className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {prog.name}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)' }}>
              <td className="p-3 text-xs font-medium sticky left-0 z-10"
                style={{ color: 'var(--text-muted)', background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-card)' }}>
                {row.label}
              </td>
              {programmes.map(prog => (
                <td key={prog.id} className="p-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {row.label === 'Datenqualität' ? (
                    <DataQualityBadge quality={prog.datenqualitaet} />
                  ) : row.label === 'Antragsfrist' ? (
                    <DeadlineIndicator antragsfrist={prog.antragsfrist} hatDeadline={prog.hat_deadline} />
                  ) : (
                    row.render(prog)
                  )}
                </td>
              ))}
            </tr>
          ))}

          {/* CTA Row */}
          <tr>
            <td className="p-3 sticky left-0 z-10" style={{ background: 'var(--bg-primary)' }} />
            {programmes.map(prog => (
              <td key={prog.id} className="p-3">
                <div className="flex gap-2">
                  <Link
                    href={`/programme/${prog.id}`}
                    className="text-xs font-medium px-3 py-2 rounded-lg"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}
                  >
                    Details
                  </Link>
                  {prog.url_antrag && (
                    <a
                      href={prog.url_antrag}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium px-3 py-2 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
                    >
                      Antrag →
                    </a>
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
