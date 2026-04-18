'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  BUNDESLAENDER,
  PHASEN,
  GROESSEN,
  FOERDERARTEN,
  BRANCHEN_OPTIONS,
  formatEuro,
} from '@/lib/constants';

const BRANCHE_LABEL = Object.fromEntries(BRANCHEN_OPTIONS.map((b) => [b.slug, b.label]));

export default function ActiveFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips = [];

  const bundesland = searchParams.get('bundesland') || '';
  if (bundesland) {
    chips.push({
      key: `bundesland:${bundesland}`,
      label: BUNDESLAENDER[bundesland] || bundesland,
      remove: () => removeParam('bundesland'),
    });
  }

  const foerderart = searchParams.get('foerderart') || '';
  if (foerderart) {
    const fa = FOERDERARTEN[foerderart];
    chips.push({
      key: `foerderart:${foerderart}`,
      label: fa ? `${fa.emoji} ${fa.label}` : foerderart,
      remove: () => removeParam('foerderart'),
    });
  }

  const phase = searchParams.get('phase') || '';
  if (phase) {
    chips.push({
      key: `phase:${phase}`,
      label: PHASEN[phase] || phase,
      remove: () => removeParam('phase'),
    });
  }

  const groesse = searchParams.get('groesse') || '';
  if (groesse) {
    chips.push({
      key: `groesse:${groesse}`,
      label: GROESSEN[groesse] || groesse,
      remove: () => removeParam('groesse'),
    });
  }

  const branchenCsv = searchParams.get('branchen') || '';
  const branchen = branchenCsv.split(',').filter(Boolean);
  for (const slug of branchen) {
    chips.push({
      key: `branche:${slug}`,
      label: BRANCHE_LABEL[slug] || slug,
      remove: () => removeBranche(slug),
    });
  }

  const branche = searchParams.get('branche') || '';
  if (branche) {
    chips.push({
      key: `branche-single:${branche}`,
      label: BRANCHE_LABEL[branche] || branche,
      remove: () => removeParam('branche'),
    });
  }

  const minVolumen = searchParams.get('minVolumen') || '';
  if (minVolumen) {
    chips.push({
      key: `minVolumen:${minVolumen}`,
      label: `ab ${formatEuro(Number(minVolumen))}`,
      remove: () => removeParam('minVolumen'),
    });
  }

  const maxVolumen = searchParams.get('maxVolumen') || '';
  if (maxVolumen) {
    chips.push({
      key: `maxVolumen:${maxVolumen}`,
      label: `bis ${formatEuro(Number(maxVolumen))}`,
      remove: () => removeParam('maxVolumen'),
    });
  }

  if (chips.length === 0) return null;

  function pushParams(next) {
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  }

  function removeParam(key) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    pushParams(next);
  }

  function removeBranche(slug) {
    const next = new URLSearchParams(searchParams.toString());
    const remaining = branchen.filter((s) => s !== slug);
    if (remaining.length) next.set('branchen', remaining.join(','));
    else next.delete('branchen');
    pushParams(next);
  }

  function clearAll() {
    const next = new URLSearchParams(searchParams.toString());
    const keysToRemove = [
      'bundesland', 'foerderart', 'phase', 'groesse',
      'branchen', 'branche', 'minVolumen', 'maxVolumen',
    ];
    for (const k of keysToRemove) next.delete(k);
    pushParams(next);
  }

  return (
    <div className="chips-row">
      {chips.map((c) => (
        <span key={c.key} className="chip">
          <span className="chip__label">{c.label}</span>
          <button
            type="button"
            className="chip__remove"
            onClick={c.remove}
            aria-label={`Filter "${c.label}" entfernen`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </span>
      ))}
      <button type="button" className="chips-clear" onClick={clearAll}>
        Alle zurücksetzen
      </button>

      <style>{`
        .chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          margin-bottom: 16px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 6px 5px 12px;
          font-size: 12px;
          font-weight: 500;
          background: color-mix(in oklch, var(--accent) 14%, transparent);
          border: 1px solid color-mix(in oklch, var(--accent) 35%, transparent);
          color: color-mix(in oklch, var(--accent) 92%, var(--text));
          border-radius: 100px;
        }
        .chip__label {
          white-space: nowrap;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chip__remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 50%;
          color: inherit;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.15s, background 0.15s;
        }
        .chip__remove:hover {
          opacity: 1;
          background: color-mix(in oklch, var(--accent) 25%, transparent);
        }
        .chips-clear {
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          font-family: inherit;
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--muted);
          border-radius: 100px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .chips-clear:hover { color: var(--text); border-color: var(--border); }
      `}</style>
    </div>
  );
}
