'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Cmd+K Global Search Modal
 * Öffnet mit Cmd/Ctrl+K, navigiert zu /search?q=...
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/foerderungen?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setResults(data.ergebnisse || []);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback((path) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === 0 || results.length === 0) {
        // Go to search page
        navigate(`/search?q=${encodeURIComponent(query)}`);
      } else {
        const prog = results[selectedIndex - 1];
        if (prog) navigate(`/programme/${prog.id}`);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl animate-fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Förderprogramm suchen..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.length >= 2 && (
            <button
              onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors"
              style={{
                color: 'var(--text-secondary)',
                background: selectedIndex === 0 ? 'var(--accent-muted)' : 'transparent',
              }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Alle Ergebnisse für &quot;{query}&quot;</span>
            </button>
          )}

          {loading && (
            <div className="px-4 py-6 text-center">
              <div className="inline-block animate-spin w-5 h-5 border-2 rounded-full" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--accent-text)' }} />
            </div>
          )}

          {!loading && results.map((prog, i) => (
            <button
              key={prog.id}
              onClick={() => navigate(`/programme/${prog.id}`)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors"
              style={{
                background: selectedIndex === i + 1 ? 'var(--accent-muted)' : 'transparent',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span className="text-sm mt-0.5">📋</span>
              <div className="min-w-0">
                <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                  {prog.kurzname && prog.kurzname !== prog.name ? `${prog.kurzname} – ` : ''}
                  {prog.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {prog.foerdergeber}
                </p>
              </div>
            </button>
          ))}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Keine Ergebnisse gefunden
            </p>
          )}

          {query.length < 2 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Tippe mindestens 2 Zeichen zum Suchen
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex items-center gap-4 text-[10px]"
          style={{ borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          <span>↑↓ navigieren</span>
          <span>↵ öffnen</span>
          <span>esc schließen</span>
        </div>
      </div>
    </div>
  );
}
