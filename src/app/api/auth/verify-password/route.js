import { NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  createSessionToken,
  buildSessionCookie,
} from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    console.warn('[admin-login] rate-limited', { ip });
    return NextResponse.json(
      { error: 'Zu viele Versuche. Bitte später erneut versuchen.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const password = body?.password;
  if (typeof password !== 'string' || password.length < 4) {
    return NextResponse.json({ error: 'Passwort fehlt' }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    console.warn('[admin-login] failed', { ip });
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  const { token, csrf, exp } = createSessionToken();
  console.info('[admin-login] success', { ip });

  const res = NextResponse.json({ success: true, csrf });
  res.headers.append('Set-Cookie', buildSessionCookie(token, exp));
  return res;
}
