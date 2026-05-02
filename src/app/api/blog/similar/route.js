import { NextResponse } from 'next/server';
import { getPostBySlug, similarPosts } from '@/lib/blogDb';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const limit = Math.min(10, Math.max(1, parseInt(url.searchParams.get('limit') || '5', 10) || 5));
  if (!slug) return NextResponse.json({ error: 'Slug fehlt' }, { status: 400 });

  try {
    const post = await getPostBySlug(slug);
    if (!post) return NextResponse.json([]);
    const similar = await similarPosts({
      slug,
      hashtags: post.hashtags || [],
      branchen: post.branchen || [],
      limit,
    });
    return NextResponse.json(similar);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Fehler' }, { status: 500 });
  }
}
