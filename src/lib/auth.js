import crypto from 'node:crypto';

/**
 * Admin-Session-Auth via signiertem HMAC-Token in HTTP-Only Cookie.
 * Token-Format:  base64url(payloadJson) + '.' + base64url(hmacSha256(payloadJson, secret))
 */

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('Kein Server-Secret konfiguriert');
  }
  return secret;
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(payloadStr) {
  return b64url(
    crypto.createHmac('sha256', getSecret()).update(payloadStr).digest()
  );
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function createSessionToken() {
  const payload = {
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    csrf: crypto.randomBytes(24).toString('hex'),
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64url(payloadStr);
  const sig = sign(payloadB64);
  return { token: `${payloadB64}.${sig}`, csrf: payload.csrf, exp: payload.exp };
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payloadB64);
  if (!timingSafeEqualStr(sig, expected)) return null;

  let payload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf-8'));
  } catch {
    return null;
  }
  if (!payload?.exp || Date.now() > payload.exp) return null;
  return payload;
}

export function verifyAdminPassword(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (typeof input !== 'string') return false;
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function buildSessionCookie(token, exp) {
  const maxAge = Math.max(0, Math.floor((exp - Date.now()) / 1000));
  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ].join('; ');
}

export function buildLogoutCookie() {
  return [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=0'].join(
    '; '
  );
}

export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export function requireAdmin(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return { ok: false, error: 'Nicht autorisiert' };
  }
  const csrfHeader = request.headers.get('x-csrf-token');
  if (!csrfHeader || !timingSafeEqualStr(csrfHeader, session.csrf)) {
    return { ok: false, error: 'Ungültiger CSRF-Token' };
  }
  return { ok: true, session };
}
