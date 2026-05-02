import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    csrf: session.csrf,
    exp: session.exp,
  });
}
