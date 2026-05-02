'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const FIELD_STYLE = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
};

const HELP_STYLE = { fontSize: 11, color: 'var(--muted)', marginTop: 4 };

function CharCounter({ value, min, max }) {
  const len = value?.length || 0;
  const isOk = len >= (min || 0) && len <= (max || Infinity);
  return (
    <span
      style={{
        fontSize: 11,
        color: isOk ? 'var(--muted)' : 'oklch(0.85 0.18 25)',
        marginLeft: 8,
      }}
    >
      {len}
      {max ? `/${max}` : ''}
    </span>
  );
}

export default function BlogForm({ csrfToken }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [branchen, setBranchen] = useState('');
  const [themen, setThemen] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  function parseList(s) {
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function insertAtCursor(text) {
    const ta = contentRef.current;
    if (!ta) {
      setContent((v) => v + text);
      return;
    }
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Datei zu groß (max 5MB)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/blog/upload', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload fehlgeschlagen');
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, '');
      insertAtCursor(`\n![${alt}](${data.url})\n`);
    } catch {
      setError('Netzwerkfehler beim Upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        hashtags: parseList(hashtags).map((h) => h.toLowerCase()),
        branchen: parseList(branchen),
        themen: parseList(themen),
        featured_image: featuredImage.trim() || null,
        seo_description: seoDescription.trim() || null,
      };
      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler beim Speichern');
        return;
      }
      router.push(`/blog/${data.slug}`);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSubmitting(false);
    }
  }

  const previewHtml = useMemo(() => {
    if (!showPreview) return '';
    const lines = content.split('\n');
    return lines
      .map((l) => {
        if (l.startsWith('# ')) return `<h2>${l.slice(2)}</h2>`;
        if (l.startsWith('## ')) return `<h3>${l.slice(3)}</h3>`;
        if (l.startsWith('### ')) return `<h4>${l.slice(4)}</h4>`;
        if (l.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
          const m = l.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
          return `<img src="${m[2]}" alt="${m[1]}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
        }
        if (!l.trim()) return '<br/>';
        return `<p>${l}</p>`;
      })
      .join('');
  }, [content, showPreview]);

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={LABEL_STYLE}>
          Title <CharCounter value={title} min={10} max={150} />
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          required
          style={FIELD_STYLE}
          placeholder="z.B. Die 5 wichtigsten KfW-Programme für Startups"
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>
          Excerpt <CharCounter value={excerpt} min={50} max={180} />
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={180}
          required
          rows={2}
          style={{ ...FIELD_STYLE, resize: 'vertical' }}
          placeholder="Kurzbeschreibung für Listenansicht (50-180 Zeichen)"
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>
          Content (Markdown) <CharCounter value={content} min={200} max={50000} />
        </label>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 8,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 13,
              cursor: uploading ? 'wait' : 'pointer',
            }}
          >
            {uploading ? 'Lädt hoch…' : '📷 Bild einfügen'}
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor('\n## Überschrift\n')}
            style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor('**fett**')}
            style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor('[Link](https://)')}
            style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            🔗 Link
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor('\n- Punkt 1\n- Punkt 2\n')}
            style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            • Liste
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            style={{ padding: '8px 14px', background: showPreview ? 'var(--accent)' : 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: showPreview ? 'var(--bg)' : 'var(--text)', fontSize: 13, cursor: 'pointer', marginLeft: 'auto' }}
          >
            {showPreview ? 'Editor' : '👁 Vorschau'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        {showPreview ? (
          <div
            style={{
              minHeight: 320,
              padding: 16,
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={18}
            style={{ ...FIELD_STYLE, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 13, lineHeight: 1.6, resize: 'vertical' }}
            placeholder="Markdown-Inhalt … z.B.&#10;&#10;## Einleitung&#10;Lorem ipsum **wichtig** …&#10;&#10;![Bild](https://...)"
          />
        )}
        <div style={HELP_STYLE}>
          Markdown: # Überschrift, **fett**, *kursiv*, [Link](url), ![Alt](url), &gt; Zitat, ```Code```
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div>
          <label style={LABEL_STYLE}>Hashtags (komma-separiert)</label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            style={FIELD_STYLE}
            placeholder="kfw, zuschuss, startup"
          />
          <div style={HELP_STYLE}>Max. 10, je 2-20 Zeichen, lowercase, a-z 0-9 -</div>
        </div>
        <div>
          <label style={LABEL_STYLE}>Branchen (komma-separiert)</label>
          <input
            type="text"
            value={branchen}
            onChange={(e) => setBranchen(e.target.value)}
            style={FIELD_STYLE}
            placeholder="IT, Handwerk"
          />
          <div style={HELP_STYLE}>Max. 5, frei eintragbar</div>
        </div>
        <div>
          <label style={LABEL_STYLE}>Themen (komma-separiert)</label>
          <input
            type="text"
            value={themen}
            onChange={(e) => setThemen(e.target.value)}
            style={FIELD_STYLE}
            placeholder="Gründung, Digitalisierung"
          />
          <div style={HELP_STYLE}>Max. 5, frei eintragbar</div>
        </div>
      </div>

      <div>
        <label style={LABEL_STYLE}>Featured Image URL (optional)</label>
        <input
          type="url"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          style={FIELD_STYLE}
          placeholder="https://..."
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>
          SEO Description <CharCounter value={seoDescription} min={50} max={160} />
        </label>
        <input
          type="text"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          maxLength={160}
          style={FIELD_STYLE}
          placeholder="50-160 Zeichen für Suchmaschinen-Snippet"
        />
      </div>

      {error && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'color-mix(in oklch, oklch(0.7 0.2 25) 12%, transparent)',
            border: '1px solid color-mix(in oklch, oklch(0.7 0.2 25) 30%, transparent)',
            color: 'oklch(0.85 0.18 25)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => router.push('/blog')}
          style={{
            padding: '12px 22px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--muted)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px 22px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 10,
            color: 'var(--bg)',
            fontWeight: 700,
            fontSize: 14,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Veröffentliche…' : 'Veröffentlichen'}
        </button>
      </div>
    </form>
  );
}
