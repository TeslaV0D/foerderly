/**
 * SICHERHEIT: API-Request-Logging
 * Loggt Requests ohne sensitive Daten zu leaken.
 */

/**
 * Loggt einen API-Request (serverseitig).
 */
export function logRequest({ method, path, status, durationMs, ip }) {
  const entry = {
    ts: new Date().toISOString(),
    method,
    path: path?.slice(0, 200),
    status,
    ms: durationMs,
    ip: anonymizeIp(ip),
  };

  if (status >= 500) {
    console.error('[API:ERROR]', JSON.stringify(entry));
  } else if (status >= 400) {
    console.warn('[API:WARN]', JSON.stringify(entry));
  }
  // 2xx/3xx nur in Development loggen
  else if (process.env.NODE_ENV !== 'production') {
    console.log('[API:OK]', JSON.stringify(entry));
  }
}

/**
 * Loggt einen Fehler serverseitig (Details bleiben intern).
 */
export function logError(error, context = {}) {
  console.error('[ERROR]', JSON.stringify({
    ts: new Date().toISOString(),
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    ...context,
  }));
}

/**
 * IP-Adresse teilweise anonymisieren (letztes Oktett entfernen).
 * DSGVO-konform: Keine vollständige IP speichern.
 */
function anonymizeIp(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  // IPv4: letzte Zahl ersetzen
  if (ip.includes('.')) {
    return ip.replace(/\.\d+$/, '.xxx');
  }
  // IPv6: letzte Gruppe ersetzen
  if (ip.includes(':')) {
    return ip.replace(/:[^:]+$/, ':xxxx');
  }
  return 'unknown';
}
