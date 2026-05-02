import Link from 'next/link';

function formatDate(iso) {
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

const CHIP_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 9px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
};

export default function BlogCard({ post, index = 0 }) {
  if (!post) return null;
  const date = formatDate(post.published_at);
  const allTags = [
    ...(post.hashtags || []).slice(0, 3).map((t) => ({ kind: 'h', label: `#${t}` })),
    ...(post.branchen || []).slice(0, 2).map((t) => ({ kind: 'b', label: t })),
    ...(post.themen || []).slice(0, 2).map((t) => ({ kind: 't', label: t })),
  ].slice(0, 5);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="result-card animate-card-in"
      style={{
        animationDelay: `${Math.min(index, 12) * 60}ms`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: 28,
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition:
          'transform 0.35s cubic-bezier(0.2,0.8,0.2,1), border-color 0.25s, box-shadow 0.35s, background 0.25s',
        height: '100%',
      }}
    >
      {post.featured_image && (
        <div
          style={{
            margin: '-28px -28px 20px -28px',
            height: 180,
            background: `var(--bg3) center/cover no-repeat url("${post.featured_image}")`,
            borderBottom: '1px solid var(--border2)',
          }}
          aria-hidden="true"
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{date}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {post.author || 'Förderly Team'}
        </span>
      </div>

      <h3
        style={{
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: '-0.4px',
          lineHeight: 1.25,
          color: 'var(--text)',
          marginBottom: 10,
        }}
      >
        {post.title}
      </h3>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--muted)',
          marginBottom: 16,
          flex: 1,
        }}
      >
        {post.excerpt}
      </p>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
          {allTags.map((tag, i) => {
            const palette =
              tag.kind === 'h'
                ? { bg: 'color-mix(in oklch, oklch(0.72 0.16 240) 18%, transparent)', fg: 'oklch(0.78 0.14 240)', bd: 'color-mix(in oklch, oklch(0.72 0.16 240) 35%, transparent)' }
                : tag.kind === 'b'
                ? { bg: 'color-mix(in oklch, var(--accent) 12%, transparent)', fg: 'var(--accent)', bd: 'color-mix(in oklch, var(--accent) 30%, transparent)' }
                : { bg: 'color-mix(in oklch, oklch(0.78 0.14 75) 14%, transparent)', fg: 'oklch(0.84 0.16 75)', bd: 'color-mix(in oklch, oklch(0.78 0.14 75) 32%, transparent)' };
            return (
              <span
                key={`${tag.kind}-${i}`}
                style={{
                  ...CHIP_BASE,
                  background: palette.bg,
                  color: palette.fg,
                  border: `1px solid ${palette.bd}`,
                }}
              >
                {tag.label}
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}
