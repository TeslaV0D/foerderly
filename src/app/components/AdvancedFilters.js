'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, BRANCHEN_OPTIONS } from '@/lib/constants';

export default function AdvancedFilters({ currentFilters }) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQ, setLocalQ] = useState(currentFilters.q || '');

  const selectedBranchen = (currentFilters.branchen || '').split(',').filter(Boolean);

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

  function toggleBranche(slug) {
    const current = new Set(selectedBranchen);
    if (current.has(slug)) current.delete(slug);
    else current.add(slug);
    applyFilters({ branchen: [...current].join(','), branche: '' });
  }

  function resetAll() {
    setLocalQ('');
    router.push('/search');
  }

  const activeCount = Object.entries(currentFilters)
    .filter(([k, v]) => v && !['q', 'sortBy', 'sortDir', 'datenqualitaet', 'page'].includes(k))
    .length;

  return (
    <div className="space-y-3">
      <form
        onSubmit={handleSearch}
        style={{
          background: 'var(--bg2)',
          border: '1.5px solid var(--border)',
          borderRadius: 14,
          padding: 14,
        }}
      >
        <div className="flex gap-2 items-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--muted)', marginLeft: 6, flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Förderprogramm suchen..."
            className="flex-1 min-w-0 px-2 py-2.5 text-sm rounded-xl"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              caretColor: 'var(--accent)',
              fontSize: 15,
              outline: 'none',
              boxShadow: 'none',
            }}
          />
          <button type="submit" className="btn-accent shrink-0">
            Suchen
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-ghost mt-3"
          style={{ fontSize: 12 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter {activeCount > 0 ? `(${activeCount})` : ''}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transition: 'transform 0.2s', transform: showAdvanced ? 'rotate(180deg)' : 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </form>

      {showAdvanced && (
        <div
          className="animate-fade-up"
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 16,
            padding: 20,
          }}
        >
          {/* Standard filter selects */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          </div>

          {/* Branchen as pills */}
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                }}
              >
                Branchen
              </span>
              {selectedBranchen.length > 0 && (
                <span className="pill-count">{selectedBranchen.length}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {BRANCHEN_OPTIONS.filter((b) => b.slug !== 'branchenuebergreifend').map((b) => {
                const isSelected = selectedBranchen.includes(b.slug);
                return (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => toggleBranche(b.slug)}
                    className={`pill${isSelected ? ' pill-active' : ''}`}
                  >
                    <span className="pill-dot" />
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort + reset */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid var(--border2)' }}>
            <FilterSelect
              label=""
              inline
              value={currentFilters.sortBy && currentFilters.sortDir ? `${currentFilters.sortBy}_${currentFilters.sortDir}` : ''}
              onChange={(v) => {
                const [sortBy, sortDir] = v ? v.split('_') : ['', ''];
                applyFilters({ sortBy, sortDir });
              }}
              options={[
                { value: '', label: 'Sortierung: Standard' },
                { value: 'volumen_desc', label: 'Höchste Förderung' },
                { value: 'volumen_asc', label: 'Niedrigste Förderung' },
                { value: 'name_asc', label: 'Name A-Z' },
                { value: 'aktualisiert_desc', label: 'Neueste zuerst' },
              ]}
            />

            {activeCount > 0 && (
              <button onClick={resetAll} className="btn-accent" style={{ marginLeft: 'auto' }}>
                Alle zurücksetzen ({activeCount})
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
        <label
          className="block mb-1.5"
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--muted)',
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl appearance-none cursor-pointer"
        style={{
          minWidth: inline ? '180px' : undefined,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
