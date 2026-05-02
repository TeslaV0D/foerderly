import { NextResponse } from 'next/server';
import { latestPosts } from '@/lib/blogDb';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request) {
  const url = new URL(request.url);
  const limit = Math.min(10, Math.max(1, parseInt(url.searchParams.get('limit') || '3', 10) || 3));
  try {
    const posts = await latestPosts(limit);
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Fehler' }, { status: 500 });
  }
}
