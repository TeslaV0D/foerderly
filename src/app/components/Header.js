'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Entdecken' },
  { href: '/search', label: 'Programme' },
  { href: '/quellen', label: 'Quellen' },
];

export default function Header() {
  const pathname = usePathname();

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

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = href === '/'
              ? pathname === '/'
              : pathname === href || (href === '/search' && pathname.startsWith('/search')) || (href === '/quellen' && pathname.startsWith('/quellen'));
            return (
              <Link key={href} href={href} className={`nav-link${isActive ? ' active' : ''}`}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="palette-trigger hidden sm:inline-flex"
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
        </div>
      </div>
    </header>
  );
}
