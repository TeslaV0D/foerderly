// src/app/components/AdvancedFilters.js
// Fix 7: Datenqualität-Filter komplett entfernt
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN } from '@/lib/constants';

export default function AdvancedFilters({ currentFilters }) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQ, setLocalQ] = useState(currentFilters.q || '');

  function applyFilters(overrides = {}) {
    const params = new URLSearchParams();
    const merged = { ...currentFilters, ...overrides, page: '1' };

    for (const [key, val] of Object.entries(merged)) {
      if (val && key !== 'page') params.set(key, val);
    }

    router.push(`/search?${params.toString()}`);
  }

  function handleSearch(e) {
    e?.preventDefault();
    applyFilters({ q: localQ });
  }

  function resetAll() {
    setLocalQ('');
    router.push('/search');
  }

  // Fix 7: datenqualitaet aus activeCount entfernt
  const activeCount = Object.entries(currentFilters)
    .filter(([k, v]) => v && k !== 'q' && k !== 'sortBy' && k !== 'sortDir' && k !== 'datenqualitaet')
    .length;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch}
        className="flex gap-3 rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <input
          type="text"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Förderprogramm suchen..."
          className="flex-1 px-4 py-2.5 text-sm rounded-xl cursor-text"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          className="px-6 py-2.5 font-medium text-sm rounded-xl transition-all shrink-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
        >
          Suchen
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-2.5 text-sm rounded-xl transition-all shrink-0 cursor-pointer"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
        >
          Filter {activeCount > 0 ? `(${activeCount})` : ''}
          <svg
            className={`w-4 h-4 inline ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </form>

      {showAdvanced && (
        <div
          className="rounded-2xl p-5 animate-fade-up"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <FilterSelect
              label="Bundesland"
              value={currentFilters.bundesland}
              onChange={(v) => applyFilters({ bundesland: v })}
              options={[{ value: '', label: 'Alle' }, ...Object.entries(BUNDESLAENDER).map(([k, v]) => ({ value: k, label: v }))]}
            />
            <FilterSelect
              label="Phase"
              value={currentFilters.phase}
              onChange={(v) => applyFilters({ phase: v })}
              options={[{ value: '', label: 'Alle' }, ...Object.entries(PHASEN).map(([k, v]) => ({ value: k, label: v }))]}
            />
            <FilterSelect
              label="Größe"
              value={currentFilters.groesse}
              onChange={(v) => applyFilters({ groesse: v })}
              options={[{ value: '', label: 'Alle' }, ...Object.entries(GROESSEN).map(([k, v]) => ({ value: k, label: v }))]}
            />
            <FilterSelect
              label="Förderart"
              value={currentFilters.foerderart}
              onChange={(v) => applyFilters({ foerderart: v })}
              options={[
                { value: '', label: 'Alle' },
                ...Object.entries(FOERDERARTEN).map(([k, v]) => ({ value: k, label: `${v.emoji} ${v.label}` })),
              ]}
            />
            <FilterSelect
              label="Sortierung"
              value={currentFilters.sortBy && currentFilters.sortDir ? `${currentFilters.sortBy}_${currentFilters.sortDir}` : ''}
              onChange={(v) => {
                const [sortBy, sortDir] = v ? v.split('_') : ['', ''];
                applyFilters({ sortBy, sortDir });
              }}
              options={[
                { value: '', label: 'Standard' },
                { value: 'volumen_desc', label: 'Höchste Förderung' },
                { value: 'volumen_asc', label: 'Niedrigste Förderung' },
                { value: 'name_asc', label: 'Name A-Z' },
                { value: 'aktualisiert_desc', label: 'Neueste zuerst' },
              ]}
            />
          </div>

          {/* Fix 7: Datenqualität-Filter komplett entfernt */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={currentFilters.hatDeadline === 'true'}
                onChange={(e) => applyFilters({ hatDeadline: e.target.checked ? 'true' : '' })}
                className="rounded cursor-pointer"
              />
              Nur mit Deadline
            </label>

            {activeCount > 0 && (
              <button
                onClick={resetAll}
                className="text-xs px-3 py-1.5 rounded-lg transition-all ml-auto cursor-pointer"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
              >
                Alle zurücksetzen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, inline = false }) {
  return (
    <div className={inline ? 'inline-block' : ''}>
      {label && (
        <label className="block text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl appearance-none cursor-pointer"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          minWidth: inline ? '150px' : undefined,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
