import { NextResponse } from 'next/server';
import { getMeta } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logRequest, logError } from '@/lib/logger';

export async function GET(request) {
  const start = Date.now();
  const ip = getClientIp(request);

  const rl = rateLimit(ip, 60, 60000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const meta = getMeta();

    logRequest({ method: 'GET', path: '/api/meta', status: 200, durationMs: Date.now() - start, ip });

    return NextResponse.json(meta, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/meta' });
    logRequest({ method: 'GET', path: '/api/meta', status: 500, durationMs: Date.now() - start, ip });

    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
