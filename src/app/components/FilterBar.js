'use client';

import { useState } from 'react';
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

export default function FilterBar({ filters, onChange, onSearch, loading }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'q').length;

  function handleChange(key, value) {
    onChange({ ...filters, [key]: value || '' });
  }

  return (
    <div className="rounded-2xl overflow-hidden glow-accent" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      {/* Search field */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Förderprogramm suchen..."
            className="flex-1 px-4 py-2.5 text-sm"
            style={{ '::placeholder': { color: 'var(--text-muted)' } }}
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className="px-5 sm:px-6 py-2.5 font-medium text-sm rounded-xl transition-all shrink-0 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
              color: '#0f0f13',
            }}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mx-1" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span className="hidden sm:inline">Suchen</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mt-3 flex items-center gap-2 text-sm transition-colors sm:hidden"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Filter {activeFilterCount > 0 ? `(${activeFilterCount} aktiv)` : 'anzeigen'}
        </button>
      </div>

      {/* Filters */}
      <div
        className={`px-4 sm:px-5 pb-4 sm:pb-5 pt-4 ${filtersOpen ? 'block' : 'hidden'} sm:block`}
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Bundesland</label>
            <select value={filters.bundesland} onChange={(e) => handleChange('bundesland', e.target.value)} className="w-full px-3 py-2.5 text-sm">
              <option value="">Alle</option>
              {Object.entries(BUNDESLAENDER).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Phase</label>
            <select value={filters.phase} onChange={(e) => handleChange('phase', e.target.value)} className="w-full px-3 py-2.5 text-sm">
              <option value="">Alle Phasen</option>
              {Object.entries(PHASEN).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Größe</label>
            <select value={filters.groesse} onChange={(e) => handleChange('groesse', e.target.value)} className="w-full px-3 py-2.5 text-sm">
              <option value="">Alle Größen</option>
              {Object.entries(GROESSEN).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Branche</label>
            <select value={filters.branche} onChange={(e) => handleChange('branche', e.target.value)} className="w-full px-3 py-2.5 text-sm">
              {BRANCHEN_OPTIONS.map(({ slug, label }) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => { onSearch(); setFiltersOpen(false); }}
          className="mt-3 w-full py-2.5 text-sm font-medium rounded-xl sm:hidden"
          style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
        >
          Filter anwenden
        </button>
      </div>
    </div>
  );
}
