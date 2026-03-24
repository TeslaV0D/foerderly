'use client';

/**
 * FÖRDERLY – Landing Page (/)
 *
 * Vereinfacht: Hero + Quick-Filter → leitet auf /search weiter.
 * Die eigentliche Suche passiert jetzt SSR auf /search.
 * Bestehende /api/foerderungen API bleibt als Fallback.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Finde deine{' '}
            <span className="gradient-text">Förderung</span>
            <br />
            in Sekunden
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
            Über 2.000 Förderprogramme von Bund, Ländern und EU.
            Kostenlos, ohne Anmeldung, DSGVO-konform.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div
              className="flex gap-2 rounded-2xl p-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="z.B. KfW Kredit, EXIST, Digitalbonus..."
                className="flex-1 px-4 py-3 text-sm rounded-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                className="px-8 py-3 font-semibold text-sm rounded-xl transition-all shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
                  color: '#0f0f13',
                }}
              >
                Suchen
              </button>
            </div>
          </form>

          {/* Keyboard hint */}
          <p className="text-xs mt-3 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            oder drücke{' '}
            <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
              ⌘K
            </kbd>
            {' '}für die Schnellsuche
          </p>
        </div>

        {/* Quick Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          <QuickCard
            emoji="🎯"
            label="Zuschüsse"
            desc="Nicht rückzahlbar"
            onClick={() => router.push('/search?foerderart=zuschuss')}
          />
          <QuickCard
            emoji="🏦"
            label="Kredite"
            desc="Zinsgünstig"
            onClick={() => router.push('/search?foerderart=kredit')}
          />
          <QuickCard
            emoji="🚀"
            label="Startups"
            desc="Gründungsphase"
            onClick={() => router.push('/search?phase=gruendung')}
          />
          <QuickCard
            emoji="💻"
            label="Digital"
            desc="IT & Software"
            onClick={() => router.push('/search?branche=digitalisierung')}
          />
        </div>

        {/* Bundesland Quick Links */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
            FÖRDERUNGEN NACH BUNDESLAND
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'],
              ['BB', 'Brandenburg'], ['HB', 'Bremen'], ['HH', 'Hamburg'],
              ['HE', 'Hessen'], ['MV', 'Meck.-Vorp.'], ['NI', 'Niedersachsen'],
              ['NW', 'NRW'], ['RP', 'Rheinland-Pfalz'], ['SL', 'Saarland'],
              ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'], ['SH', 'Schleswig-H.'],
              ['TH', 'Thüringen'],
            ].map(([code, name]) => (
              <button
                key={code}
                onClick={() => router.push(`/search?bundesland=${code}`)}
                className="px-3 py-1.5 text-xs rounded-lg transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          <StatCard value="2.000+" label="Programme" />
          <StatCard value="16" label="Bundesländer" />
          <StatCard value="6" label="Förderarten" />
        </div>

        <Footer />
      </div>
    </main>
  );
}

function QuickCard({ emoji, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </button>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold gradient-text">{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
