import Header from '../components/Header';
import SkeletonCard from '../components/SkeletonCard';

export default function Loading() {
  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6 search-layout-loading">
        <aside className="search-loading-sidebar">
          <div
            style={{
              background: 'var(--bg2)',
              border: '1.5px solid var(--border2)',
              borderRadius: 'var(--radius)',
              padding: 20,
              height: 560,
            }}
          />
        </aside>
        <div className="search-loading-main">
          <div
            style={{
              background: 'var(--bg2)',
              border: '1.5px solid var(--border)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 20,
              height: 44,
            }}
            className="search-loading-mobile-trigger"
          />
          <div
            style={{
              display: 'grid',
              gap: 20,
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .search-layout-loading { display: block; }
        .search-loading-sidebar { display: none; }
        .search-loading-main { min-width: 0; }
        @media (min-width: 1024px) {
          .search-layout-loading {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 28px;
            align-items: start;
          }
          .search-loading-sidebar { display: block; }
          .search-loading-mobile-trigger { display: none; }
        }
      `}</style>
    </main>
  );
}
