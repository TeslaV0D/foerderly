'use client';

import Link from 'next/link';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';
import DeadlineIndicator from './DeadlineIndicator';

export default function ComparisonTable({ programmes }) {
  if (!programmes?.length) return null;

  const rows = [
    {
      label: 'Förderart',
      render: (p) => {
        const a = FOERDERARTEN[p.foerderart] || FOERDERARTEN.zuschuss;
        return `${a.emoji} ${a.label}`;
      },
    },
    { label: 'Fördergeber', render: (p) => p.foerdergeber || '–' },
    {
      label: 'Förderhöhe',
      render: (p) => {
        if (!p.volumen_max_eur) return '–';
        return p.volumen_min_eur === p.volumen_max_eur
          ? formatEuro(p.volumen_max_eur)
          : `${formatEuro(p.volumen_min_eur)} – ${formatEuro(p.volumen_max_eur)}`;
      },
    },
    { label: 'Eigenanteil', render: (p) => (p.eigenanteil_prozent > 0 ? `${p.eigenanteil_prozent}%` : 'Keiner') },
    { label: 'Förderquote', render: (p) => (p.foerderquote ? `bis ${p.foerderquote}%` : '–') },
    { label: 'Antragsfrist', render: (p) => p.antragsfrist || 'Keine Frist' },
    { label: 'Bearbeitungszeit', render: (p) => p.bearbeitungszeit || '–' },
    {
      label: 'Fördergebiet',
      render: (p) =>
        (p.bundeslaender || [])
          .map((bl) => (bl === 'BUND' ? 'Bundesweit' : BUNDESLAENDER[bl] || bl))
          .join(', ') || '–',
    },
    { label: 'Phasen', render: (p) => (p.phasen || []).map((ph) => PHASEN[ph] || ph).join(', ') || '–' },
    { label: 'Größen', render: (p) => (p.groessen || []).map((gr) => GROESSEN[gr] || gr).join(', ') || '–' },
    { label: 'Branchen', render: (p) => (p.branchen || []).map((b) => b.name).join(', ') || '–' },
    { label: 'Zielgruppen', render: (p) => (p.zielgruppen_erweitert || []).join(', ') || '–' },
  ];

  const cellPad = '14px 16px';

  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: cellPad,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                  width: 160,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: 'var(--bg2)',
                  borderBottom: '1px solid var(--border2)',
                }}
              >
                Merkmal
              </th>
              {programmes.map((prog) => (
                <th
                  key={prog.id}
                  style={{
                    padding: cellPad,
                    textAlign: 'left',
                    minWidth: 220,
                    background: 'var(--bg3)',
                    borderBottom: '1px solid var(--border2)',
                  }}
                >
                  <Link
                    href={`/programme/${prog.id}`}
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    {prog.kurzname && (
                      <span
                        className="gradient-text"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        {prog.kurzname}
                      </span>
                    )}
                    <span
                      className="line-clamp-2"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '-0.2px',
                        color: 'var(--text)',
                      }}
                    >
                      {prog.name}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => {
              const rowBg = i % 2 === 0 ? 'transparent' : 'color-mix(in oklch, var(--bg3) 50%, transparent)';
              return (
                <tr key={row.label} style={{ background: rowBg }}>
                  <td
                    style={{
                      padding: cellPad,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)',
                      borderBottom: '1px solid var(--border2)',
                    }}
                  >
                    {row.label}
                  </td>
                  {programmes.map((prog) => (
                    <td
                      key={prog.id}
                      style={{
                        padding: cellPad,
                        fontSize: 13,
                        color: 'var(--text)',
                        borderBottom: '1px solid var(--border2)',
                        verticalAlign: 'top',
                      }}
                    >
                      {row.label === 'Antragsfrist' ? (
                        <DeadlineIndicator antragsfrist={prog.antragsfrist} hatDeadline={prog.hat_deadline} />
                      ) : (
                        row.render(prog)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr>
              <td
                style={{
                  padding: cellPad,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  background: 'var(--bg2)',
                }}
              />
              {programmes.map((prog) => (
                <td key={prog.id} style={{ padding: cellPad }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link href={`/programme/${prog.id}`} className="btn-ghost" style={{ fontSize: 12 }}>
                      Details
                    </Link>
                    {prog.url_antrag && (
                      <a
                        href={prog.url_antrag}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-accent"
                        style={{ fontSize: 12 }}
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
    </div>
  );
}
