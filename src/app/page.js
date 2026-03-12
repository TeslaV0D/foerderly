'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
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

  useEffect(() => { doSearch(1); }, []);

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
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />

      {/* Hero area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-2">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Förderprogramme finden
        </h2>
        <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
          Durchsuche über 1.400 Programme von Bund, Ländern und EU.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onSearch={() => doSearch(1)}
          loading={loading}
          resultCount={totalCount}
        />

        {/* Result info */}
        {searched && !error && (
          <div className="flex items-center justify-between mt-6 mb-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{totalCount}</span>
              {' '}Programm{totalCount !== 1 ? 'e' : ''}
              {totalPages > 1 && (
                <span style={{ color: 'var(--text-muted)' }}> · Seite {page} von {totalPages}</span>
              )}
              {activeFilterCount > 0 && (
                <span style={{ color: 'var(--text-muted)' }}> · {activeFilterCount} Filter</span>
              )}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ bundesland: '', phase: '', groesse: '', branche: '', q: '' })}
                className="text-xs underline underline-offset-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-sm font-medium" style={{ color: '#fca5a5' }}>Fehler beim Laden</p>
            <p className="text-sm mt-1" style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && results.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                <div className="skeleton h-5 w-20 mb-3" />
                <div className="skeleton h-5 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2 mb-3" />
                <div className="skeleton h-4 w-full mb-1" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!error && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            {results.map((programm, i) => (
              <ResultCard key={programm.id} programm={programm} index={i} onClick={setSelectedProgramm} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !error && (
          <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Seitennavigation">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              ‹
            </button>

            {getPageNumbers()[0] > 1 && (
              <>
                <button onClick={() => handlePageChange(1)} className="px-3 py-2 text-sm rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>1</button>
                {getPageNumbers()[0] > 2 && <span className="px-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>…</span>}
              </>
            )}

            {getPageNumbers().map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className="px-3 py-2 text-sm rounded-xl transition-all"
                style={{
                  background: p === page ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' : 'var(--bg-card)',
                  border: p === page ? 'none' : '1px solid var(--border-default)',
                  color: p === page ? '#0f0f13' : 'var(--text-secondary)',
                  fontWeight: p === page ? '600' : '400',
                }}
              >
                {p}
              </button>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="px-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>…</span>}
                <button onClick={() => handlePageChange(totalPages)} className="px-3 py-2 text-sm rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>{totalPages}</button>
              </>
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              ›
            </button>
          </nav>
        )}

        {/* No results */}
        {searched && !error && results.length === 0 && !loading && (
          <div className="mt-10 text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Keine Programme gefunden</h3>
            <p className="text-sm max-w-sm mx-auto mb-4" style={{ color: 'var(--text-secondary)' }}>
              Versuche andere Filter oder entferne Einschränkungen.
            </p>
            <button
              onClick={() => setFilters({ bundesland: '', phase: '', groesse: '', branche: '', q: '' })}
              className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}

        <Footer />
      </div>

      {/* Detail Panel */}
      {selectedProgramm && (
        <DetailPanel programm={selectedProgramm} onClose={() => setSelectedProgramm(null)} />
      )}
    </main>
  );
}
