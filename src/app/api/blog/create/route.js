import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { createPost } from '@/lib/blogDb';
import { logError } from '@/lib/logger';

export const runtime = 'nodejs';

const HASHTAG_RE = /^[a-z0-9-]{2,20}$/;

function clean(arr, { max = 10, minLen = 2, maxLen = 30, lower = false, slug = false } = {}) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .map((s) => (lower ? s.toLowerCase() : s))
    .filter((s) => s.length >= minLen && s.length <= maxLen)
    .filter((s) => (slug ? HASHTAG_RE.test(s) : true))
    .slice(0, max);
}

function validateUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(`blog-create:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate-Limit erreicht' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const errors = [];
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 10 || title.length > 150) errors.push('Title muss 10-150 Zeichen haben');

  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : '';
  if (excerpt.length < 50 || excerpt.length > 180) errors.push('Excerpt muss 50-180 Zeichen haben');

  const content = typeof body.content === 'string' ? body.content : '';
  if (content.length < 200 || content.length > 50000)
    errors.push('Content muss 200-50.000 Zeichen haben');

  const seoDescription =
    typeof body.seo_description === 'string' ? body.seo_description.trim() : '';
  if (seoDescription && (seoDescription.length < 50 || seoDescription.length > 160))
    errors.push('SEO-Description muss 50-160 Zeichen haben');

  const featuredImage = body.featured_image ? validateUrl(body.featured_image) : null;
  if (body.featured_image && !featuredImage) errors.push('Ungültige Featured-Image-URL');

  const hashtags = clean(body.hashtags, {
    max: 10,
    minLen: 2,
    maxLen: 20,
    lower: true,
    slug: true,
  });
  const branchen = clean(body.branchen, { max: 5, minLen: 2, maxLen: 40 });
  const themen = clean(body.themen, { max: 5, minLen: 2, maxLen: 40 });

  if (errors.length) {
    return NextResponse.json({ error: errors.join(' · ') }, { status: 400 });
  }

  try {
    const result = await createPost({
      title,
      excerpt,
      content,
      hashtags,
      branchen,
      themen,
      featured_image: featuredImage,
      seo_description: seoDescription || null,
    });
    console.info('[blog-create] success', { ip, slug: result.slug });
    return NextResponse.json({ success: true, slug: result.slug, id: result.id }, { status: 201 });
  } catch (err) {
    logError(err, { route: 'blog-create' });
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
