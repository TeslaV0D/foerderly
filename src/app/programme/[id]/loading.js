import Header from '../../components/Header';
import SkeletonCard from '../../components/SkeletonCard';

export default function Loading() {
  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <SkeletonCard variant="detail" />
      </div>
    </main>
  );
}
