'use client';

import { useEffect, useRef, useState } from 'react';

export default function Select({ value, options, onChange, placeholder = 'Auswählen…', ariaLabel }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === (value || ''));
  const triggerLabel = selected ? selected.label : placeholder;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="cs-wrap">
      <button
        type="button"
        className={`cs-trigger${open ? ' cs-trigger--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={`cs-trigger__label${selected && selected.value ? '' : ' cs-trigger__label--placeholder'}`}>
          {triggerLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="cs-chevron"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="cs-menu" role="listbox" ref={listRef}>
          {options.map((opt) => {
            const isSelected = opt.value === (value || '');
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`cs-option${isSelected ? ' cs-option--active' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <style>{`
        .cs-wrap {
          position: relative;
          width: 100%;
        }
        .cs-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          font-size: 13px;
          font-family: inherit;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s;
          text-align: left;
        }
        .cs-trigger:hover { border-color: color-mix(in oklch, var(--border) 70%, var(--text)); }
        .cs-trigger--open {
          border-color: color-mix(in oklch, var(--accent) 60%, transparent);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 10%, transparent);
        }
        .cs-trigger__label {
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cs-trigger__label--placeholder { color: var(--muted); }
        .cs-chevron {
          color: var(--muted);
          flex-shrink: 0;
          transition: transform 0.18s;
        }
        .cs-trigger--open .cs-chevron { transform: rotate(180deg); }

        .cs-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 30;
          margin: 0;
          padding: 4px;
          list-style: none;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          box-shadow: 0 12px 32px -8px color-mix(in oklch, black 60%, transparent);
          max-height: 280px;
          overflow-y: auto;
          animation: csFadeIn 0.14s ease-out;
        }
        @keyframes csFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          padding: 9px 10px;
          font-size: 13px;
          font-family: inherit;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition: background 0.12s, color 0.12s;
        }
        .cs-option:hover { background: var(--bg3); }
        .cs-option--active {
          background: color-mix(in oklch, var(--accent) 14%, transparent);
          color: color-mix(in oklch, var(--accent) 90%, var(--text));
        }
        .cs-option--active:hover {
          background: color-mix(in oklch, var(--accent) 20%, transparent);
        }
      `}</style>
    </div>
  );
}
