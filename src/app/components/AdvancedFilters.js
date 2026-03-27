// src/app/components/AdvancedFilters.js
// v5.2: Branchen Multi-Select (Checkboxes), "bis zu" Volumen-Display
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, BRANCHEN_OPTIONS } from '@/lib/constants';

export default function AdvancedFilters({ currentFilters }) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBranchen, setShowBranchen] = useState(false);
  const [localQ, setLocalQ] = useState(currentFilters.q || '');

  // Parse branchen from comma-separated string to array
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
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    const newValue = [...current].join(',');
    applyFilters({ branchen: newValue, branche: '' });
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
      <form onSubmit={handleSearch}
        className="rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Förderprogramm suchen..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 text-sm rounded-xl cursor-text"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            className="px-4 sm:px-6 py-2.5 font-medium text-sm rounded-xl transition-all shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
          >
            Suchen
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-2 w-full sm:w-auto px-3 py-2 text-sm rounded-xl transition-all cursor-pointer"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
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

          {/* v5.2: Branchen Multi-Select */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setShowBranchen(!showBranchen)}
              className="flex items-center gap-2 text-sm cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Branchen
              </span>
              {selectedBranchen.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                  {selectedBranchen.length}
                </span>
              )}
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showBranchen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showBranchen && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {BRANCHEN_OPTIONS.map((b) => {
                  const isSelected = selectedBranchen.includes(b.slug);
                  return (
                    <label
                      key={b.slug}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all"
                      style={{
                        background: isSelected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                        border: isSelected ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
                        color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBranche(b.slug)}
                        className="rounded cursor-pointer accent-emerald-500"
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span className="truncate">{b.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sortierung + Extras */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
          minWidth: inline ? '170px' : undefined,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
