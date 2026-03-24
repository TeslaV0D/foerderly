// src/app/components/FilterSidebar.js
// Fix 3: cursor-pointer auf alle Buttons, Selects, Inputs
// Fix 9: Sidebar sticky auf Desktop
'use client';

import { useState, useRef, useEffect } from 'react';
import { BUNDESLAENDER, PHASEN, GROESSEN } from '@/lib/constants';

const BRANCHEN_OPTIONS = [
  { slug: '', label: 'Alle Branchen' },
  { slug: 'digitalisierung', label: 'Digitalisierung' },
  { slug: 'energie-umwelt', label: 'Energie & Umwelt' },
  { slug: 'forschung-entwicklung', label: 'Forschung & Entwicklung' },
  { slug: 'gesundheit-medizin', label: 'Gesundheit & Medizin' },
  { slug: 'handwerk', label: 'Handwerk' },
  { slug: 'handel', label: 'Handel' },
  { slug: 'it-software', label: 'IT & Software' },
  { slug: 'kreativwirtschaft', label: 'Kreativwirtschaft' },
  { slug: 'produktion-industrie', label: 'Produktion & Industrie' },
  { slug: 'sozialunternehmen', label: 'Sozialunternehmen' },
  { slug: 'bildung', label: 'Bildung' },
];

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
      {/* Fix 3: cursor-pointer */}
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

export default function FilterSidebar({ filters, onChange, onSearch, loading }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'q').length;

  function handleChange(key, value) {
    onChange({ ...filters, [key]: value || '' });
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

  const branchenOptions = BRANCHEN_OPTIONS.map(b => ({ value: b.slug, label: b.label }));

  const filterContent = (
    <div className="space-y-4">
      <CustomSelect label="Bundesland" value={filters.bundesland} options={bundeslandOptions}
        onChange={(v) => handleChange('bundesland', v)} placeholder="Alle Bundesländer" />
      <CustomSelect label="Phase" value={filters.phase} options={phasenOptions}
        onChange={(v) => handleChange('phase', v)} placeholder="Alle Phasen" />
      <CustomSelect label="Unternehmensgröße" value={filters.groesse} options={groessenOptions}
        onChange={(v) => handleChange('groesse', v)} placeholder="Alle Größen" />
      <CustomSelect label="Branche" value={filters.branche} options={branchenOptions}
        onChange={(v) => handleChange('branche', v)} placeholder="Alle Branchen" />

      {activeFilterCount > 0 && (
        <button
          onClick={() => onChange({ bundesland: '', phase: '', groesse: '', branche: '', q: filters.q })}
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
      {/* ─── Desktop Sidebar – Fix 9: sticky ─── */}
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
            {/* Fix 3: cursor-pointer auf Input */}
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleChange('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Förderprogramm suchen..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl cursor-text"
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
