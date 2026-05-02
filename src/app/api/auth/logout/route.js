import { NextResponse } from 'next/server';
import { buildLogoutCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', buildLogoutCookie());
  return res;
}
