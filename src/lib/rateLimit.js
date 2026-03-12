/**
 * SICHERHEIT: Rate-Limiting für API-Endpunkte
 * In-Memory Rate-Limiter (ausreichend für MVP/Serverless).
 * 
 * Default: 60 Requests pro Minute pro IP.
 */

const store = new Map();

// Alte Einträge regelmäßig aufräumen (Memory Leak Prevention)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 Minuten
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Prüft ob ein Request durchgelassen wird.
 * @param {string} ip - Client-IP
 * @param {number} limit - Max. Requests im Zeitfenster
 * @param {number} windowMs - Zeitfenster in ms
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(ip, limit = 60, windowMs = 60000) {
  cleanup();

  const now = Date.now();
  const key = `rl:${ip}`;
  let record = store.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }

  record.count++;
  store.set(key, record);

  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.resetAt,
  };
}

/**
 * Extrahiert die Client-IP aus dem Request.
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
