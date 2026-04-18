'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import ResultCard from './ResultCard';

const QUICK_FILTERS = [
  { label: 'Alle', href: '/search' },
  { label: 'Startups', href: '/search?phase=gruendung' },
  { label: 'Forschung', href: '/search?branchen=forschung-entwicklung' },
  { label: 'Digitalisierung', href: '/search?branchen=digitalisierung' },
  { label: 'Klimaschutz', href: '/search?branchen=energie-umwelt' },
  { label: 'Soziales', href: '/search?branchen=sozialunternehmen' },
  { label: 'EU-Programme', href: '/search?bundesland=BUND' },
];

export default function LandingClient({ recommended = [] }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSearch(e) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12">
        {/* Hero */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: '0.1s', textAlign: 'left', marginBottom: 56 }}
        >
          {/* Label pill with pulsing dot */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 100,
              background: 'color-mix(in oklch, var(--accent) 10%, transparent)',
              border: '1px solid color-mix(in oklch, var(--accent) 25%, transparent)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            2.000+ aktive Förderprogramme
          </div>

          <h1
            style={{
              fontSize: 'clamp(40px, 5.5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-2px',
              lineHeight: 1.05,
              color: 'var(--text)',
              maxWidth: 720,
              marginBottom: 20,
            }}
          >
            Finde die <span className="gradient-text">richtige Förderung</span><br />
            in Sekunden.
          </h1>

          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              color: 'var(--muted)',
              maxWidth: 520,
              marginBottom: 32,
              lineHeight: 1.55,
            }}
          >
            Über 2.000 Förderprogramme von Bund, Ländern und EU. Kostenlos, ohne
            Anmeldung, DSGVO-konform.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ maxWidth: 680 }}>
            <div
              className="search-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg2)',
                border: '1.5px solid var(--border)',
                borderRadius: 14,
                padding: '6px 6px 6px 18px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: 'var(--muted)', flexShrink: 0, transition: 'color 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="z.B. KfW Kredit, EXIST, Digitalbonus…"
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  caretColor: 'var(--accent)',
                  fontSize: 15,
                  padding: '14px 4px',
                  fontFamily: 'inherit',
                  boxShadow: 'none',
                  textOverflow: 'ellipsis',
                }}
              />
              <span
                className="hidden sm:inline-flex"
                style={{
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--muted)',
                  marginRight: 4,
                }}
              >
                ⌘K
              </span>
              <button type="submit" className="btn-accent">
                Suchen
              </button>
            </div>
          </form>

          <style>{`
            .search-bar:focus-within {
              border-color: color-mix(in oklch, var(--accent) 60%, transparent);
              box-shadow: 0 0 0 4px color-mix(in oklch, var(--accent) 10%, transparent),
                          0 4px 24px oklch(0 0 0 / 0.3);
            }
            .search-bar:focus-within .search-icon { color: var(--accent); }
            .search-bar input[type="text"] {
              background: transparent !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 14px 4px !important;
              min-width: 0 !important;
            }
            .search-bar input[type="text"]:focus {
              border: none !important;
              box-shadow: none !important;
            }
          `}</style>

          {/* Filter pills */}
          <div
            className="flex flex-wrap"
            style={{ gap: 8, marginTop: 28 }}
          >
            {QUICK_FILTERS.map((f, i) => (
              <Link key={f.label} href={f.href} className={`pill${i === 0 ? ' pill-active' : ''}`}>
                <span className="pill-dot" />
                {f.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended programmes */}
        {recommended.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: 'var(--text)',
                }}
              >
                Empfohlene Programme
              </h2>
              <Link
                href="/search"
                className="section-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s, gap 0.2s',
                }}
              >
                Alle ansehen
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <style>{`
              .section-link:hover { color: var(--accent); gap: 8px; }
            `}</style>

            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              }}
            >
              {recommended.map((p, i) => (
                <ResultCard key={p.id} programme={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Bundesland Quick Links */}
        <section style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 20,
            }}
          >
            Förderungen nach Bundesland
          </h2>
          <div className="flex flex-wrap justify-center" style={{ gap: 8 }}>
            {[
              ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'],
              ['BB', 'Brandenburg'], ['HB', 'Bremen'], ['HH', 'Hamburg'],
              ['HE', 'Hessen'], ['MV', 'Meck.-Vorp.'], ['NI', 'Niedersachsen'],
              ['NW', 'NRW'], ['RP', 'Rheinland-Pfalz'], ['SL', 'Saarland'],
              ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'], ['SH', 'Schleswig-H.'],
              ['TH', 'Thüringen'],
            ].map(([code, name]) => (
              <Link
                key={code}
                href={`/search?bundesland=${code}`}
                className="pill"
                style={{ fontSize: 12 }}
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
