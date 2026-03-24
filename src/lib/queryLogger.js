/**
 * FÖRDERLY – Search Query Logger
 * Loggt Suchanfragen in Supabase für Analytics.
 * Keine personenbezogenen Daten (DSGVO-konform).
 */

import { createClient } from '@supabase/supabase-js';

let _sb = null;

function getSb() {
  if (!_sb) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) _sb = createClient(url, key);
  }
  return _sb;
}

/**
 * Loggt eine Suchanfrage (async, fire-and-forget).
 * Blockt NICHT den Request.
 */
export function logSearchQuery(query, filters, resultCount) {
  // Fire-and-forget: kein await, kein catch nach außen
  try {
    const sb = getSb();
    if (!sb) return;

    // Nur nicht-leere Queries loggen
    if (!query && !Object.values(filters || {}).some(Boolean)) return;

    sb.from('search_queries')
      .insert({
        query: query?.slice(0, 200) || null,
        filters: filters || {},
        result_count: resultCount || 0,
      })
      .then(() => {})
      .catch(() => {});
  } catch {
    // Silent fail – Logging darf nie die App crashen
  }
}
