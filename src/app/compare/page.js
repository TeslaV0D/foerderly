import Link from 'next/link';
import { getProgrammesByIds } from '@/lib/search';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Förderprogramme vergleichen',
    description:
      'Vergleiche verschiedene Förderprogramme nebeneinander – Förderhöhe, Eigenanteil, Förderart und mehr.',
    robots: { index: false, follow: true },
  };
}

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams;
  const idsParam = sp?.ids || '';
  const ids = idsParam.split(',').filter(Boolean).slice(0, 4);

  if (ids.length === 0) {
    return (
      <main className="min-h-screen relative z-10">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <EmptyState />
          <Footer />
        </div>
      </main>
    );
  }

  const programmes = await getProgrammesByIds(ids);

  if (programmes.length === 0) {
    return (
      <main className="min-h-screen relative z-10">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <EmptyState message="Die ausgewählten Programme wurden nicht gefunden." />
          <Footer />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <Link href="/search" className="btn-ghost" style={{ marginBottom: 20 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Suche
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            Förderprogramme <span className="gradient-text">vergleichen</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            {programmes.length} Programm{programmes.length !== 1 ? 'e' : ''} im Vergleich
          </p>
        </div>

        <ComparisonTable programmes={programmes} />

        <Footer />
      </div>
    </main>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--text)',
          marginBottom: 10,
        }}
      >
        Förderprogramme vergleichen
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--muted)',
          maxWidth: 420,
          margin: '0 auto 24px',
          lineHeight: 1.55,
        }}
      >
        {message ||
          'Wähle auf der Suchseite Programme zum Vergleichen aus. Du kannst bis zu 4 Programme nebeneinander vergleichen.'}
      </p>
      <Link href="/search" className="btn-accent">
        Zur Programmsuche
      </Link>
    </div>
  );
}
