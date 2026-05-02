import { NextResponse } from 'next/server';
import { getPostBySlug, incrementViewCount } from '@/lib/blogDb';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: 'Slug fehlt' }, { status: 400 });
  try {
    const post = await getPostBySlug(slug);
    if (!post) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    incrementViewCount(post.id).catch(() => {});
    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Fehler' }, { status: 500 });
  }
}
