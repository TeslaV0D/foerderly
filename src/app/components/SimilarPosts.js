'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function SimilarPosts({ currentSlug, limit = 5 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/blog/similar?slug=${encodeURIComponent(currentSlug)}&limit=${limit}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentSlug, limit]);

  if (loading) return null;
  if (!posts.length) return null;

  return (
    <section style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid var(--border2)' }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          marginBottom: 24,
          color: 'var(--text)',
        }}
      >
        Ähnliche Beiträge
      </h2>
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 20,
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              borderRadius: 14,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {formatDate(p.published_at)}
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: 'var(--text)' }}>
              {p.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'var(--muted)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {p.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
