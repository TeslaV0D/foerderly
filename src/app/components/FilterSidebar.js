'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, BRANCHEN_OPTIONS } from '@/lib/constants';
import Select from './Select';

const STICKY_TOP = 73;

export default function FilterSidebar({ currentFilters, total }) {
  const router = useRouter();
  const [localQ, setLocalQ] = useState(currentFilters.q || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setLocalQ(currentFilters.q || '');
  }, [currentFilters.q]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
    setMobileOpen(false);
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
    setMobileOpen(false);
  }

  const activeCount = Object.entries(currentFilters)
    .filter(([k, v]) => v && !['q', 'sortBy', 'sortDir', 'datenqualitaet', 'page'].includes(k))
    .length;

  const panelBody = (
    <>
      <form onSubmit={handleSearch}>
        <Label>Suche</Label>
        <div className="filter-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Programm, Stichwort…"
            aria-label="Suche"
          />
          <button type="submit" className="btn-accent filter-search__submit" aria-label="Suchen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
            </svg>
          </button>
        </div>
      </form>

      <FilterGroup>
        <Label>Förderart</Label>
        <Select
          value={currentFilters.foerderart}
          onChange={(v) => applyFilters({ foerderart: v })}
          options={[
            { value: '', label: 'Alle Arten' },
            ...Object.entries(FOERDERARTEN).map(([k, v]) => ({ value: k, label: `${v.emoji} ${v.label}` })),
          ]}
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Bundesland</Label>
        <Select
          value={currentFilters.bundesland}
          onChange={(v) => applyFilters({ bundesland: v })}
          options={[
            { value: '', label: 'Alle Bundesländer' },
            ...Object.entries(BUNDESLAENDER).map(([k, v]) => ({ value: k, label: v })),
          ]}
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Phase</Label>
        <Select
          value={currentFilters.phase}
          onChange={(v) => applyFilters({ phase: v })}
          options={[
            { value: '', label: 'Alle Phasen' },
            ...Object.entries(PHASEN).map(([k, v]) => ({ value: k, label: v })),
          ]}
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Unternehmensgröße</Label>
        <Select
          value={currentFilters.groesse}
          onChange={(v) => applyFilters({ groesse: v })}
          options={[
            { value: '', label: 'Alle Größen' },
            ...Object.entries(GROESSEN).map(([k, v]) => ({ value: k, label: v })),
          ]}
        />
      </FilterGroup>

      <FilterGroup>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Label style={{ margin: 0 }}>Branchen</Label>
          {selectedBranchen.length > 0 && <span className="pill-count">{selectedBranchen.length}</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {BRANCHEN_OPTIONS.filter((b) => b.slug !== 'branchenuebergreifend').map((b) => {
            const isSelected = selectedBranchen.includes(b.slug);
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => toggleBranche(b.slug)}
                className={`pill${isSelected ? ' pill-active' : ''}`}
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <span className="pill-dot" />
                {b.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={resetAll}
          className="btn-ghost"
          style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
        >
          Alle Filter zurücksetzen ({activeCount})
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="filter-sidebar-desktop">
        <div
          className="filter-sidebar-desktop__panel"
          style={{
            position: 'sticky',
            top: STICKY_TOP,
            maxHeight: `calc(100vh - ${STICKY_TOP + 16}px)`,
            overflowY: 'auto',
            background: 'var(--bg2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: 20,
          }}
        >
          {panelBody}
        </div>
      </aside>

      {/* Mobile: trigger button */}
      <div className="filter-sidebar-mobile-trigger">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter{activeCount > 0 ? ` (${activeCount})` : ''}
          {typeof total === 'number' && (
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>{total} Treffer</span>
          )}
        </button>
      </div>

      {/* Mobile: drawer */}
      {mobileOpen && (
        <div
          className="filter-sidebar-drawer-wrap"
          role="dialog"
          aria-modal="true"
          aria-label="Filter und Sortierung"
        >
          <div
            className="filter-sidebar-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="filter-sidebar-drawer">
            <div className="filter-sidebar-drawer__header">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', margin: 0 }}>
                Filter & Sortierung
              </h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Schließen"
                className="filter-sidebar-drawer__close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <div className="filter-sidebar-drawer__body">{panelBody}</div>
          </div>
        </div>
      )}

      <style>{`
        .filter-sidebar-desktop { display: none; }
        .filter-sidebar-mobile-trigger {
          display: block;
          margin-bottom: 16px;
          position: sticky;
          top: var(--header-height, 57px);
          z-index: 30;
          padding: 8px 0;
          background: color-mix(in oklch, var(--bg) 92%, transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        @media (min-width: 1024px) {
          .filter-sidebar-desktop { display: block; }
          .filter-sidebar-mobile-trigger { display: none; }
        }

        .filter-search {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px 4px 4px 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: var(--muted);
        }
        .filter-search:focus-within {
          border-color: color-mix(in oklch, var(--accent) 60%, transparent);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 10%, transparent);
          color: var(--accent);
        }
        .filter-search input[type="text"] {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          color: var(--text) !important;
          caret-color: var(--accent) !important;
          font-size: 13px !important;
          padding: 8px 4px !important;
          outline: none !important;
          font-family: inherit;
        }
        .filter-search input[type="text"]:focus {
          border: none !important;
          box-shadow: none !important;
        }
        .filter-search__submit {
          padding: 7px 10px !important;
          border-radius: 8px !important;
          flex-shrink: 0;
        }

        .filter-sidebar-drawer-wrap {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
        }
        .filter-sidebar-backdrop {
          position: absolute;
          inset: 0;
          background: color-mix(in oklch, var(--bg) 65%, transparent);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out both;
        }
        .filter-sidebar-drawer {
          position: relative;
          width: min(420px, 100vw);
          height: 100vh;
          max-height: 100vh;
          background: var(--bg2);
          border-left: 1px solid var(--border2);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .filter-sidebar-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border2);
          background: var(--bg2);
          flex-shrink: 0;
        }
        .filter-sidebar-drawer__close {
          background: var(--bg3);
          border: 1px solid var(--border2);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--muted);
          transition: color 0.18s, border-color 0.18s;
        }
        .filter-sidebar-drawer__close:hover {
          color: var(--text);
          border-color: var(--border);
        }
        .filter-sidebar-drawer__body {
          padding: 20px;
          overflow-y: auto;
          flex: 1 1 auto;
        }
      `}</style>
    </>
  );
}

function FilterGroup({ children }) {
  return <div style={{ marginTop: 18 }}>{children}</div>;
}

function Label({ children, style }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--muted)',
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </label>
  );
}

