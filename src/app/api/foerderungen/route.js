import { NextResponse } from 'next/server';
import { sucheForederungen } from '@/lib/db';
import { sanitizeFilters } from '@/lib/sanitize';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logRequest, logError } from '@/lib/logger';
import { sanitizeUrl } from '@/lib/urlValidator';

export async function GET(request) {
  const start = Date.now();
  const ip = getClientIp(request);

  // Rate-Limiting: 60 Requests/Minute pro IP
  const rl = rateLimit(ip, 60, 60000);
  if (!rl.allowed) {
    logRequest({ method: 'GET', path: '/api/foerderungen', status: 429, durationMs: Date.now() - start, ip });
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Input-Validierung: Whitelist-basiert
    const filters = sanitizeFilters(searchParams);

    const { ergebnisse, total } = sucheForederungen(filters);

    // URL-Validierung: nur erlaubte Domains in der Ausgabe
    const safeErgebnisse = ergebnisse.map(p => ({
      ...p,
      url_antrag: sanitizeUrl(p.url_antrag),
      url_quelle: sanitizeUrl(p.url_quelle),
    }));

    logRequest({ method: 'GET', path: '/api/foerderungen', status: 200, durationMs: Date.now() - start, ip });

    return NextResponse.json({
      ergebnisse: safeErgebnisse,
      total,
      anzahl: safeErgebnisse.length,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rl.remaining),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logError(error, { endpoint: '/api/foerderungen', ip });
    logRequest({ method: 'GET', path: '/api/foerderungen', status: 500, durationMs: Date.now() - start, ip });

    // SICHERHEIT: Keine internen Details an den Client!
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}

// Nur GET erlauben
export async function POST() {
  return NextResponse.json({ error: 'Methode nicht erlaubt' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Methode nicht erlaubt' }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Methode nicht erlaubt' }, { status: 405 });
}
