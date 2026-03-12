'use client';

import { useState, useEffect, useCallback } from 'react';
import FilterBar from './components/FilterBar';
import ResultCard from './components/ResultCard';
import DetailPanel from './components/DetailPanel';

const PER_PAGE = 20;

export default function Home() {
  const [filters, setFilters] = useState({
    bundesland: '',
    phase: '',
    groesse: '',
    branche: '',
    q: '',
  });
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgramm, setSelectedProgramm] = useState(null);

  const doSearch = useCallback(async (newPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.bundesland) params.set('bundesland', filters.bundesland);
      if (filters.phase) params.set('phase', filters.phase);
      if (filters.groesse) params.set('groesse', filters.groesse);
      if (filters.branche) params.set('branche', filters.branche);
      if (filters.q) params.set('q', filters.q);
      params.set('page', String(newPage));
      params.set('limit', String(PER_PAGE));

      const res = await fetch(`/api/foerderungen?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setResults(data.ergebnisse || []);
      setTotalCount(data.total || 0);
      setPage(newPage);
      setSearched(true);
    } catch (err) {
      console.error('Suchfehler:', err);
      setError('Fehler beim Laden der Daten.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialer Load
  useEffect(() => {
    doSearch(1);
  }, []);

  // Auto-Search bei Dropdown-Änderung → zurück auf Seite 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searched) doSearch(1);
    }, 100);
    return () => clearTimeout(timer);
  }, [filters.bundesland, filters.phase, filters.groesse, filters.branche]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const activeFilterCount = Object.values(filters).filter(v => v).length;

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    doSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-stone-900">
              Förderly
            </h1>
          </div>
          <p className="text-stone-500 text-sm sm:text-base max-w-xl">
            Finde die passenden Förderprogramme für dein Vorhaben.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onSearch={() => doSearch(1)}
          loading={loading}
          resultCount={totalCount}
        />

        {/* Ergebnisinfo */}
        {searched && !error && (
          <div className="flex items-center justify-between mt-5 mb-3">
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-900">{totalCount}</span>
              {' '}Programm{totalCount !== 1 ? 'e' : ''}
              {totalPages > 1 && (
                <span className="text-stone-400 ml-1">
                  · Seite {page} von {totalPages}
                </span>
              )}
              {activeFilterCount > 0 && (
                <span className="text-stone-400 ml-1">
                  · {activeFilterCount} Filter
                </span>
              )}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ bundesland: '', phase: '', groesse: '', branche: '', q: '' })}
                className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <p className="text-sm text-red-800 font-medium">Fehler beim Laden</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && results.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
                <div className="h-5 bg-stone-200 rounded w-20 mb-3" />
                <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-stone-100 rounded w-1/2 mb-3" />
                <div className="h-4 bg-stone-100 rounded w-full mb-1" />
                <div className="h-4 bg-stone-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Ergebnisse */}
        {!error && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
            {results.map((programm, i) => (
              <ResultCard
                key={programm.id}
                programm={programm}
                index={i}
                onClick={setSelectedProgramm}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !error && (
          <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Seitennavigation">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Vorherige Seite"
            >
              ‹
            </button>

            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  1
                </button>
                {getPageNumbers()[0] > 2 && (
                  <span className="px-2 text-stone-400 text-sm">…</span>
                )}
              </>
            )}

            {getPageNumbers().map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  p === page
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                  <span className="px-2 text-stone-400 text-sm">…</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Nächste Seite"
            >
              ›
            </button>
          </nav>
        )}

        {/* Keine Ergebnisse */}
        {searched && !error && results.length === 0 && !loading && (
          <div className="mt-10 text-center py-12">
            <div className="text-4xl sm:text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">
              Keine Programme gefunden
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mb-4">
              Versuche andere Filter oder entferne Einschränkungen.
            </p>
            <button
              onClick={() => setFilters({ bundesland: '', phase: '', groesse: '', branche: '', q: '' })}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 mb-6 sm:mb-8 pt-5 border-t border-stone-200">
          <p className="text-xs text-stone-400 max-w-lg mx-auto text-center">
            Förderly – Daten basieren auf öffentlichen Informationen der Förderdatenbank des Bundes.
            Keine Gewähr für Vollständigkeit oder Aktualität.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="/impressum" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              Impressum
            </a>
            <span className="text-stone-300">·</span>
            <a href="/datenschutz" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              Datenschutz
            </a>
          </div>
        </footer>
      </div>

      {/* Detail-Panel */}
      {selectedProgramm && (
        <DetailPanel
          programm={selectedProgramm}
          onClose={() => setSelectedProgramm(null)}
        />
      )}
    </main>
  );
}
