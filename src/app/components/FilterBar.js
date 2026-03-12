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

const selectClass = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 text-sm appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center]";

export default function FilterBar({ filters, onChange, onSearch, loading, resultCount }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'q').length;

  function handleChange(key, value) {
    onChange({ ...filters, [key]: value || '' });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Suchfeld – immer sichtbar */}
      <div className="p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Förderprogramm suchen..."
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 text-sm placeholder:text-stone-400"
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-stone-400 text-white font-medium text-sm rounded-lg transition-colors shrink-0"
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

        {/* Filter-Toggle für Mobile */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mt-3 flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 transition-colors sm:hidden"
        >
          <svg className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Filter {activeFilterCount > 0 ? `(${activeFilterCount} aktiv)` : 'anzeigen'}
        </button>
      </div>

      {/* Filter – auf Mobile collapsible, auf Desktop immer sichtbar */}
      <div className={`border-t border-stone-100 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 ${filtersOpen ? 'block' : 'hidden'} sm:block`}>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Bundesland</label>
            <select
              value={filters.bundesland}
              onChange={(e) => handleChange('bundesland', e.target.value)}
              className={selectClass}
            >
              <option value="">Alle</option>
              {Object.entries(BUNDESLAENDER).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Phase</label>
            <select
              value={filters.phase}
              onChange={(e) => handleChange('phase', e.target.value)}
              className={selectClass}
            >
              <option value="">Alle Phasen</option>
              {Object.entries(PHASEN).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Größe</label>
            <select
              value={filters.groesse}
              onChange={(e) => handleChange('groesse', e.target.value)}
              className={selectClass}
            >
              <option value="">Alle Größen</option>
              {Object.entries(GROESSEN).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Branche</label>
            <select
              value={filters.branche}
              onChange={(e) => handleChange('branche', e.target.value)}
              className={selectClass}
            >
              {BRANCHEN_OPTIONS.map(({ slug, label }) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick-Apply auf Mobile */}
        <button
          onClick={() => { onSearch(); setFiltersOpen(false); }}
          className="mt-3 w-full py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg sm:hidden"
        >
          Filter anwenden
        </button>
      </div>
    </div>
  );
}
