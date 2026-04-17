import Header from '../components/Header';
import SkeletonCard from '../components/SkeletonCard';

export default function Loading() {
  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <div
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            height: 60,
          }}
        />
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
