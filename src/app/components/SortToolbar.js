'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Select from './Select';

const SORT_OPTIONS = [
  { value: '', label: 'Standard' },
  { value: 'volumen_desc', label: 'Höchste Förderung' },
  { value: 'volumen_asc', label: 'Niedrigste Förderung' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'aktualisiert_desc', label: 'Neueste zuerst' },
];

export default function SortToolbar({ total, currentPage, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get('sortBy') || '';
  const sortDir = searchParams.get('sortDir') || '';
  const currentValue = sortBy && sortDir ? `${sortBy}_${sortDir}` : '';

  function onChange(value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const [sb, sd] = value.split('_');
      params.set('sortBy', sb);
      params.set('sortDir', sd);
    } else {
      params.delete('sortBy');
      params.delete('sortDir');
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  }

  return (
    <div className="sort-toolbar">
      <p className="sort-toolbar__count">
        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{total}</span>
        {' '}Programm{total !== 1 ? 'e' : ''}
        {totalPages > 1 && (
          <span style={{ color: 'var(--muted)' }}> · Seite {currentPage}/{totalPages}</span>
        )}
      </p>
      <div className="sort-toolbar__select">
        <Select
          value={currentValue}
          options={SORT_OPTIONS}
          onChange={onChange}
          ariaLabel="Sortierung"
          placeholder="Sortierung"
        />
      </div>

      <style>{`
        .sort-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .sort-toolbar__count {
          font-size: 14px;
          color: var(--muted);
          margin: 0;
        }
        .sort-toolbar__select {
          width: 220px;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .sort-toolbar__select { width: 100%; }
        }
      `}</style>
    </div>
  );
}
