'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/search', label: 'Suche' },
    { href: '/quellen', label: 'Quellen' },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--border-default)',
        background: theme === 'dark'
          ? 'rgba(24, 24, 31, 0.85)'
          : 'rgba(255, 255, 255, 0.85)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-shadow duration-300 group-hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text">Förderly</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href === '/search' && pathname.startsWith('/search'));
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-muted)' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Cmd+K hint + Theme toggle */}
        <div className="flex items-center gap-2">
          {/* Cmd+K Shortcut Hint (desktop) */}
          <button
            onClick={() => {
              // Trigger CommandPalette via keyboard event
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
            }}
            title="Schnellsuche öffnen (Cmd+K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <kbd className="text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>⌘K</kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            aria-label={theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" style={{ color: 'var(--accent-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" style={{ color: 'var(--accent-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
