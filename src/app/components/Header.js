'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Suche' },
    { href: '/quellen', label: 'Quellen' },
  ];

  return (
    <header className="border-b" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-shadow duration-300 group-hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' }}
          >
            <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">Förderly</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
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
      </div>
    </header>
  );
}
