/**
 * FÖRDERLY – Vergleichs-Seite
 * /compare?ids=123,456,789
 *
 * Bis zu 4 Programme nebeneinander vergleichen.
 * SSR – kein Caching nötig.
 */

import Link from 'next/link';
import { getProgrammesByIds } from '@/lib/search';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  return {
    title: 'Förderprogramme vergleichen',
    description: 'Vergleiche verschiedene Förderprogramme nebeneinander – Förderhöhe, Eigenanteil, Förderart und mehr.',
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/search" className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>
              ← Zurück zur Suche
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Förderprogramme vergleichen
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {programmes.length} Programme im Vergleich
            </p>
          </div>
        </div>

        <ComparisonTable programmes={programmes} />

        <Footer />
      </div>
    </main>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">⚖️</div>
      <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Förderprogramme vergleichen
      </h1>
      <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
        {message || 'Wähle auf der Suchseite Programme zum Vergleichen aus. Du kannst bis zu 4 Programme nebeneinander vergleichen.'}
      </p>
      <Link
        href="/search"
        className="inline-block px-6 py-3 text-sm font-medium rounded-xl"
        style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
      >
        Zur Programmsuche
      </Link>
    </div>
  );
}
