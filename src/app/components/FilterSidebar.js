// src/app/components/FilterSidebar.js
// v6: Branchen as multi-select CustomSelect (5th filter, visually consistent)
'use client';

import { useState, useRef, useEffect } from 'react';
import { BUNDESLAENDER, PHASEN, GROESSEN, BRANCHEN_OPTIONS } from '@/lib/constants';

function CustomSelect({ label, value, options, onChange, placeholder = 'Alle' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative">
      <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-xl transition-all text-left cursor-pointer"
        style={{
          background: 'var(--bg-elevated)',
          border: open ? '1px solid var(--accent-solid)' : '1px solid var(--border-default)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-muted)' : 'none',
        }}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl py-1.5 shadow-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer"
              style={{
                color: opt.value === value ? 'var(--accent-text)' : 'var(--text-secondary)',
                background: opt.value === value ? 'var(--accent-muted)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.target.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Multi-Select dropdown for Branchen
 * Looks identical to CustomSelect but allows multiple selections
 */
function MultiSelect({ label, selected = [], options, onChange, placeholder = 'Alle Branchen' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedCount = selected.length;
  const displayLabel = selectedCount === 0
    ? placeholder
    : selectedCount === 1
      ? options.find(o => o.value === selected[0])?.label || placeholder
      : `${selectedCount} ausgewählt`;

  function toggleValue(val) {
    if (!val) {
      onChange([]);
      return;
    }
    const newSelected = selected.includes(val)
      ? selected.filter(s => s !== val)
      : [...selected, val];
    onChange(newSelected);
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
        {selectedCount > 0 && (
          <span
            className="ml-1.5 inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}
          >
            {selectedCount}
          </span>
        )}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-xl transition-all text-left cursor-pointer"
        style={{
          background: 'var(--bg-elevated)',
          border: open ? '1px solid var(--accent-solid)' : selectedCount > 0 ? '1px solid rgba(52,211,153,0.25)' : '1px solid var(--border-default)',
          color: selectedCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-muted)' : 'none',
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl py-1.5 shadow-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          {/* "Alle" reset option */}
          <button
            type="button"
            onClick={() => { onChange([]); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer"
            style={{
              color: selectedCount === 0 ? 'var(--accent-text)' : 'var(--text-secondary)',
              background: selectedCount === 0 ? 'var(--accent-muted)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedCount > 0) e.target.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              if (selectedCount > 0) e.target.style.background = 'transparent';
            }}
          >
            {placeholder}
          </button>

          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleValue(opt.value)}
                className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer flex items-center gap-2"
                style={{
                  color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)',
                  background: isSelected ? 'var(--accent-muted)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.target.style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.target.style.background = isSelected ? 'var(--accent-muted)' : 'transparent';
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: isSelected ? 'var(--accent-text)' : 'var(--border-default)',
                    background: isSelected ? 'var(--accent-text)' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#0f0f13" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onSearch, loading }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'q').length;

  function handleChange(key, value) {
    onChange({ ...filters, [key]: value || '' });
  }

  // Parse branchen from comma-separated string
  const selectedBranchen = (filters.branchen || filters.branche || '').split(',').filter(Boolean);

  function handleBranchenChange(newSelected) {
    const value = newSelected.join(',');
    onChange({ ...filters, branchen: value, branche: '' });
  }

  const bundeslandOptions = [
    { value: '', label: 'Alle Bundesländer' },
    ...Object.entries(BUNDESLAENDER).map(([key, name]) => ({ value: key, label: name })),
  ];

  const phasenOptions = [
    { value: '', label: 'Alle Phasen' },
    ...Object.entries(PHASEN).map(([key, label]) => ({ value: key, label })),
  ];

  const groessenOptions = [
    { value: '', label: 'Alle Größen' },
    ...Object.entries(GROESSEN).map(([key, label]) => ({ value: key, label })),
  ];

  const branchenSelectOptions = BRANCHEN_OPTIONS
    .filter(b => b.slug !== 'branchenuebergreifend')
    .map(b => ({ value: b.slug, label: b.label }));

  const filterContent = (
    <div className="space-y-4">
      <CustomSelect label="Bundesland" value={filters.bundesland} options={bundeslandOptions}
        onChange={(v) => handleChange('bundesland', v)} placeholder="Alle Bundesländer" />
      <CustomSelect label="Phase" value={filters.phase} options={phasenOptions}
        onChange={(v) => handleChange('phase', v)} placeholder="Alle Phasen" />
      <CustomSelect label="Unternehmensgröße" value={filters.groesse} options={groessenOptions}
        onChange={(v) => handleChange('groesse', v)} placeholder="Alle Größen" />
      <MultiSelect
        label="Branchen"
        selected={selectedBranchen}
        options={branchenSelectOptions}
        onChange={handleBranchenChange}
        placeholder="Alle Branchen"
      />

      {activeFilterCount > 0 && (
        <button
          onClick={() => onChange({ bundesland: '', phase: '', groesse: '', branchen: '', branche: '', q: filters.q })}
          className="w-full text-xs py-2 rounded-xl transition-all cursor-pointer"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          Filter zurücksetzen ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar – sticky ─── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div
          className="sticky rounded-2xl p-5"
          style={{
            top: 'calc(var(--header-height, 57px) + 1.5rem)',
            maxHeight: 'calc(100vh - var(--header-height, 57px) - 3rem)',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Filter
          </h3>
          {filterContent}
        </div>
      </aside>

      {/* ─── Mobile ─── */}
      <div className="lg:hidden mb-4">
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleChange('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Förderprogramm suchen..."
              className="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-xl cursor-text"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={onSearch}
              disabled={loading}
              className="px-5 py-2.5 font-medium text-sm rounded-xl transition-all shrink-0 disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mt-3 flex items-center gap-2 text-sm transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Filter {activeFilterCount > 0 ? `(${activeFilterCount} aktiv)` : 'anzeigen'}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="rounded-2xl p-4 mb-3 animate-fade-up"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            {filterContent}
            <button
              onClick={() => { onSearch(); setMobileOpen(false); }}
              className="mt-4 w-full py-2.5 text-sm font-medium rounded-xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
            >
              Filter anwenden
            </button>
          </div>
        )}
      </div>
    </>
  );
}
