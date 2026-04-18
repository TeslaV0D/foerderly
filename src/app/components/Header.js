'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Entdecken' },
  { href: '/search', label: 'Programme' },
  { href: '/quellen', label: 'Quellen' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isLinkActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href === '/search') return pathname.startsWith('/search');
    if (href === '/quellen') return pathname.startsWith('/quellen');
    return pathname === href;
  };

  return (
    <header
      className="animate-fade-down"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'color-mix(in oklch, var(--bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border2)',
      }}
    >
      <style>{`
        .header-logo .logo-mark {
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .header-logo:hover .logo-mark {
          transform: rotate(8deg) scale(1.1);
        }
        .nav-link {
          padding: 8px 16px;
          border-radius: 10px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
        }
        .nav-link:hover { color: var(--text); background: var(--bg3); }
        .nav-link.active { color: var(--text); }

        .palette-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 10px;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--muted);
          font-size: 12px;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s;
          font-family: inherit;
        }
        .palette-trigger:hover { color: var(--text); border-color: var(--border); }
        .palette-trigger kbd {
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 6px;
          background: var(--bg2);
          border: 1px solid var(--border);
          font-size: 10px;
          font-family: inherit;
          color: var(--muted);
        }

        .hamburger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .hamburger-btn:hover { border-color: var(--border); }

        .mobile-menu-backdrop {
          position: fixed;
          inset: 0;
          background: color-mix(in oklch, var(--bg) 70%, transparent);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 45;
          animation: fadeIn 0.18s ease-out;
        }
        .mobile-menu-panel {
          position: fixed;
          left: 0;
          right: 0;
          top: var(--header-height);
          z-index: 46;
          background: var(--bg2);
          border-bottom: 1px solid var(--border2);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: slideDown 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .mobile-menu-panel .nav-link {
          padding: 14px 16px;
          font-size: 16px;
        }
        .mobile-menu-search {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 10px;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
        }
        .mobile-menu-search:hover { border-color: var(--border); }
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Desktop-only: show nav + palette trigger; hide hamburger */
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }
        /* Mobile-only: hide nav + palette trigger */
        @media (max-width: 767.98px) {
          .desktop-only { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div
            className="logo-mark"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg)',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '-0.5px',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            F
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Förderly
          </span>
        </Link>

        {/* Nav — desktop only */}
        <nav className="desktop-only" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link${isLinkActive(href) ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Spacer for mobile to push hamburger right */}
        <div className="mobile-only" style={{ flex: 1 }} />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="palette-trigger desktop-only"
            onClick={() =>
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
            }
            title="Schnellsuche öffnen (Strg+K)"
            aria-label="Schnellsuche öffnen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <kbd>Strg+K</kbd>
          </button>

          <button
            type="button"
            className="hamburger-btn mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="mobile-menu-backdrop mobile-only"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-menu-panel mobile-only" role="dialog" aria-label="Hauptmenü">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${isLinkActive(href) ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/search"
              className="mobile-menu-search"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Suchen
            </Link>
          </div>
        </>
      )}
    </header>
  );
}
