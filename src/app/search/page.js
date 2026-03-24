// src/app/search/page.js
// Fix 4: Min 800ms Loading-Animation
// Fix 5: Loading-Status sichtbar
// Fix 6: DataQualityBadge entfernt aus Import/Render
// Fix 7: Datenqualität-Filter entfernt
// Fix 9: FilterSidebar sticky (via FilterSidebar.js)

import Link from 'next/link';
import { searchProgrammes } from '@/lib/search';
import { logSearchQuery } from '@/lib/queryLogger';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedFilters from '../components/AdvancedFilters';
import DeadlineIndicator from '../components/DeadlineIndicator';
import { BUNDESLAENDER, FOERDERARTEN, formatEuro } from '@/lib/constants';

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

  // Fix 7: datenqualitaet Filter entfernt
  const filters = {
    bundesland: sp?.bundesland || '',
    phase: sp?.phase || '',
    groesse: sp?.groesse || '',
    branche: sp?.branche || '',
    foerderart: sp?.foerderart || '',
    q: sp?.q || '',
    sortBy: sp?.sortBy || '',
    sortDir: sp?.sortDir || '',
    minVolumen: sp?.minVolumen || '',
    maxVolumen: sp?.maxVolumen || '',
    hatDeadline: sp?.hatDeadline || '',
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

        <div className="flex items-center justify-between mb-4 mt-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span>
            {' '}Programm{total !== 1 ? 'e' : ''}
            {totalPages > 1 && (
              <span style={{ color: 'var(--text-muted)' }}> · Seite {page}/{totalPages}</span>
            )}
          </p>
        </div>

        {ergebnisse.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {ergebnisse.map((prog, i) => (
              <SearchResultCard key={prog.id} programme={prog} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Keine Programme gefunden
            </h3>
            <p className="text-sm max-w-sm mx-auto mb-4" style={{ color: 'var(--text-secondary)' }}>
              Versuche andere Filter oder entferne Einschränkungen.
            </p>
            <Link
              href="/search"
              className="px-4 py-2.5 text-sm font-medium rounded-xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Alle Filter zurücksetzen
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Seitennavigation">
            {page > 1 && (
              <Link href={buildUrl({ page: page - 1 })} className="px-3 py-2 text-sm rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                ‹ Zurück
              </Link>
            )}
            {getPageNumbers(page, totalPages).map(p => (
              <Link key={p} href={buildUrl({ page: p })} className="px-3 py-2 text-sm rounded-xl transition-all"
                style={{
                  background: p === page ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' : 'var(--bg-card)',
                  border: p === page ? 'none' : '1px solid var(--border-default)',
                  color: p === page ? '#0f0f13' : 'var(--text-secondary)',
                  fontWeight: p === page ? '600' : '400',
                }}>
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={buildUrl({ page: page + 1 })} className="px-3 py-2 text-sm rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
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

// Fix 6: DataQualityBadge komplett entfernt
function SearchResultCard({ programme, index }) {
  const art = FOERDERARTEN[programme.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programme.volumen_min_eur || programme.volumen_max_eur;

  return (
    <Link
      href={`/programme/${programme.id}`}
      className="card p-4 sm:p-5 block animate-fade-up flex flex-col h-full"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium badge-${programme.foerderart}`}>
          {art.emoji} {art.label}
        </span>
        {hasVolumen && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
            {programme.volumen_min_eur === programme.volumen_max_eur
              ? formatEuro(programme.volumen_max_eur)
              : `bis ${formatEuro(programme.volumen_max_eur)}`}
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold mb-1 leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {programme.kurzname && programme.kurzname !== programme.name && (
          <span className="gradient-text">{programme.kurzname} – </span>
        )}
        {programme.name}
      </h3>

      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{programme.foerdergeber}</p>

      <div className="flex-grow">
        {programme.beschreibung && (
          <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {programme.beschreibung}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {programme.bundeslaender?.slice(0, 3).map(bl => (
            <span key={bl} className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }}>
              {bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl)}
            </span>
          ))}
          <DeadlineIndicator antragsfrist={programme.antragsfrist} hatDeadline={programme.hat_deadline} small />
        </div>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>Details ansehen</span>
        <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
