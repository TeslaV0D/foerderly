import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import { listPosts } from '@/lib/blogDb';

export const revalidate = 60;

export const metadata = {
  title: 'Blog – Aktuelle Beiträge zu Förderprogrammen',
  description:
    'News, Tipps und Hintergrund-Wissen rund um Fördermittel, KfW, BAFA, EU-Programme und Startup-Finanzierung.',
  alternates: { canonical: 'https://foerderly.com/blog' },
  openGraph: {
    title: 'Förderly Blog',
    description: 'Aktuelle Beiträge zu Förderprogrammen für Gründer, Startups und KMU.',
    url: 'https://foerderly.com/blog',
    type: 'website',
  },
};

const PAGE_SIZE = 10;

export default async function BlogIndexPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  let data = { posts: [], total: 0, page, limit: PAGE_SIZE, pages: 1 };
  try {
    data = await listPosts({ page, limit: PAGE_SIZE });
  } catch {
    data = { posts: [], total: 0, page, limit: PAGE_SIZE, pages: 1 };
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
        <section className="animate-fade-up" style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-1.6px',
              lineHeight: 1.05,
              color: 'var(--text)',
              marginBottom: 14,
            }}
          >
            Blog
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 600, lineHeight: 1.55 }}>
            Aktuelle Beiträge zu Fördermitteln, KfW-Programmen, EU-Förderungen und mehr.
          </p>
        </section>

        {data.posts.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              borderRadius: 16,
              color: 'var(--muted)',
            }}
          >
            Noch keine Beiträge veröffentlicht.
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              }}
            >
              {data.posts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {data.pages > 1 && (
              <nav
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 48,
                }}
              >
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}`}
                    className="pill"
                    style={{ fontSize: 13 }}
                  >
                    ← Zurück
                  </Link>
                )}
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Seite {page} von {data.pages}
                </span>
                {page < data.pages && (
                  <Link
                    href={`/blog?page=${page + 1}`}
                    className="pill"
                    style={{ fontSize: 13 }}
                  >
                    Weiter →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
