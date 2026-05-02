import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/blogDb';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10) || 10));

  try {
    const data = await listPosts({ page, limit });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Fehler' }, { status: 500 });
  }
}
