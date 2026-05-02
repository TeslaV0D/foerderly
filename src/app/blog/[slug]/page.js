import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogContent from '../../components/BlogContent';
import SimilarPosts from '../../components/SimilarPosts';
import { getPostBySlug, incrementViewCount } from '@/lib/blogDb';
import { estimateReadingTime, stripMarkdown } from '@/lib/markdown';

export const revalidate = 3600;

const CHIP_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 11px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

function formatDateLong(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {}
  if (!post) return { title: 'Beitrag nicht gefunden' };

  const description =
    post.seo_description || post.excerpt || stripMarkdown(post.content).slice(0, 160);
  const url = `https://foerderly.com/blog/${post.slug}`;

  return {
    title: `${post.title} | Förderly Blog`,
    description,
    keywords: (post.hashtags || []).join(', '),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
      publishedTime: post.published_at,
      authors: [post.author || 'Förderly Team'],
    },
    twitter: {
      card: post.featured_image ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {}
  if (!post) notFound();

  // fire-and-forget view count increment
  incrementViewCount(post.id).catch(() => {});

  const date = formatDateLong(post.published_at);
  const reading = estimateReadingTime(stripMarkdown(post.content));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description || post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    image: post.featured_image || undefined,
    author: { '@type': 'Person', name: post.author || 'Förderly Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Förderly',
      url: 'https://foerderly.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://foerderly.com/blog/${post.slug}`,
    },
  };

  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12">
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/blog"
            style={{
              fontSize: 13,
              color: 'var(--muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Zurück zum Blog
          </Link>
        </div>

        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 'clamp(30px, 4.5vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-1.4px',
              lineHeight: 1.12,
              color: 'var(--text)',
              marginBottom: 16,
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            <span>{date}</span>
            <span aria-hidden="true">·</span>
            <span>{post.author || 'Förderly Team'}</span>
            <span aria-hidden="true">·</span>
            <span>{reading} min Lesezeit</span>
          </div>
        </header>

        {(post.hashtags?.length || post.branchen?.length || post.themen?.length) > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {(post.hashtags || []).map((h) => (
              <span
                key={`h-${h}`}
                style={{
                  ...CHIP_BASE,
                  background: 'color-mix(in oklch, oklch(0.72 0.16 240) 18%, transparent)',
                  color: 'oklch(0.78 0.14 240)',
                  border: '1px solid color-mix(in oklch, oklch(0.72 0.16 240) 35%, transparent)',
                }}
              >
                #{h}
              </span>
            ))}
            {(post.branchen || []).map((b) => (
              <span
                key={`b-${b}`}
                style={{
                  ...CHIP_BASE,
                  background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
                  color: 'var(--accent)',
                  border: '1px solid color-mix(in oklch, var(--accent) 30%, transparent)',
                }}
              >
                {b}
              </span>
            ))}
            {(post.themen || []).map((t) => (
              <span
                key={`t-${t}`}
                style={{
                  ...CHIP_BASE,
                  background: 'color-mix(in oklch, oklch(0.78 0.14 75) 14%, transparent)',
                  color: 'oklch(0.84 0.16 75)',
                  border: '1px solid color-mix(in oklch, oklch(0.78 0.14 75) 32%, transparent)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: 480,
              objectFit: 'cover',
              borderRadius: 16,
              border: '1px solid var(--border2)',
              marginBottom: 32,
            }}
          />
        )}

        <BlogContent content={post.content} />

        <SimilarPosts currentSlug={post.slug} limit={4} />
      </article>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
