// src/app/search/page.js
import Link from 'next/link';
import { searchProgrammes } from '@/lib/search';
import { logSearchQuery } from '@/lib/queryLogger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedFilters from '../components/AdvancedFilters';
import ResultCard from '../components/ResultCard';

export const dynamic = 'force-dynamic';

const PER_PAGE = 20;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q;
  const page = parseInt(sp?.page) || 1;

  const title = q
    ? `Suche: "${q}" – Förderly`
    : page > 1
      ? `Förderprogramme Seite ${page} – Förderly`
      : 'Förderprogramme suchen – Förderly';

  return {
    title,
    description: `Finde passende Förderprogramme. ${q ? `Suche: ${q}. ` : ''}Über 2.000 Programme von Bund, Ländern und EU.`,
    robots: { index: true, follow: true },
  };
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp?.page) || 1);

  const filters = {
    bundesland: sp?.bundesland || '',
    phase: sp?.phase || '',
    groesse: sp?.groesse || '',
    branchen: sp?.branchen || '',
    branche: sp?.branche || '',
    foerderart: sp?.foerderart || '',
    q: sp?.q || '',
    sortBy: sp?.sortBy || '',
    sortDir: sp?.sortDir || '',
    minVolumen: sp?.minVolumen || '',
    maxVolumen: sp?.maxVolumen || '',
  };

  const { ergebnisse, total } = await searchProgrammes({
    ...filters,
    page,
    limit: PER_PAGE,
  });

  logSearchQuery(filters.q, filters, total);

  const totalPages = Math.ceil(total / PER_PAGE);

  function buildUrl(overrides = {}) {
    const params = new URLSearchParams();
    const merged = { ...filters, ...overrides };
    for (const [key, val] of Object.entries(merged)) {
      if (val) params.set(key, val);
    }
    return `/search?${params.toString()}`;
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <AdvancedFilters currentFilters={filters} />

        <div className="flex items-center justify-between mb-5 mt-5">
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{total}</span>
            {' '}Programm{total !== 1 ? 'e' : ''}
            {totalPages > 1 && (
              <span style={{ color: 'var(--muted)' }}> · Seite {page}/{totalPages}</span>
            )}
          </p>
        </div>

        {ergebnisse.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: 20,
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {ergebnisse.map((prog, i) => (
              <ResultCard key={prog.id} programme={prog} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 8 }}>
              Keine Programme gefunden
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 360, margin: '0 auto 20px' }}>
              Versuche andere Filter oder entferne Einschränkungen.
            </p>
            <Link href="/search" className="btn-ghost">
              Alle Filter zurücksetzen
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center"
            style={{ gap: 6 }}
            aria-label="Seitennavigation"
          >
            {page > 1 && (
              <Link href={buildUrl({ page: page - 1 })} className="pill">
                ‹ Zurück
              </Link>
            )}
            {getPageNumbers(page, totalPages).map((p) => (
              <Link
                key={p}
                href={buildUrl({ page: p })}
                className={`pill${p === page ? ' pill-active' : ''}`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={buildUrl({ page: page + 1 })} className="pill">
                Weiter ›
              </Link>
            )}
          </nav>
        )}

        <Footer />
      </div>
    </main>
  );
}

function getPageNumbers(current, total) {
  const pages = [];
  const maxVisible = 7;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}
