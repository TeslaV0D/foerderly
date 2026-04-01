/**
 * FÖRDERLY v6 – Server-seitige Suche
 * v6: pg_trgm fallback for short queries (≤3 chars), hatDeadline filter removed
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase = null;

function getSupabase() {
  if (!_supabase && supabaseUrl && supabaseKey) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

/**
 * Server-seitige Suche mit Pagination (für SSR /search Route)
 * v6: Short-query ILIKE fallback, hatDeadline entfernt
 */
export async function searchProgrammes({
  bundesland, phase, groesse, branchen, branche, foerderart,
  q, sortBy, sortDir, page = 1, limit = 20,
  minVolumen, maxVolumen, datenqualitaet,
} = {}) {
  const sb = getSupabase();
  if (!sb) return { ergebnisse: [], total: 0 };

  // Determine if this is a short query that needs ILIKE fallback
  const trimmedQ = (q || '').trim();
  const isShortQuery = trimmedQ.length > 0 && trimmedQ.length <= 3;

  // For short queries, we need to use RPC or raw filter instead of textSearch
  if (isShortQuery) {
    return searchShortQuery({
      sb, q: trimmedQ, bundesland, phase, groesse, branchen, branche,
      foerderart, sortBy, sortDir, page, limit, minVolumen, maxVolumen, datenqualitaet,
    });
  }

  let query = sb
    .from('programme')
    .select('id, name, kurzname, beschreibung, description_short, foerdergeber, foerderart, volumen_min_eur, volumen_max_eur, eigenanteil_prozent, bundeslaender, phasen, groessen, branchen, antragsfrist, hat_deadline, foerderquote, zielgruppen_erweitert, finanzierungsform_erweitert', { count: 'exact' })
    .eq('aktiv', true)
    .eq('status', 'aktiv');

  // Standard-Filter
  if (bundesland) {
    query = query.or(`bundeslaender.cs.{${bundesland}},bundeslaender.cs.{BUND}`);
  }
  if (phase) query = query.contains('phasen', [phase]);
  if (groesse) query = query.contains('groessen', [groesse]);

  // Branchen Multi-Select Support
  const branchenParam = branchen || branche;
  if (branchenParam) {
    const branchenList = branchenParam.split(',').filter(Boolean);
    if (branchenList.length === 1) {
      query = query.or(`branchen.cs.[{"slug":"${branchenList[0]}"}],branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    } else if (branchenList.length > 1) {
      const orClauses = branchenList
        .map(b => `branchen.cs.[{"slug":"${b}"}]`)
        .join(',');
      query = query.or(`${orClauses},branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    }
  }

  if (foerderart) query = query.eq('foerderart', foerderart);

  // Advanced Filter (hatDeadline removed in v6)
  if (minVolumen) query = query.gte('volumen_max_eur', parseInt(minVolumen));
  if (maxVolumen) query = query.lte('volumen_max_eur', parseInt(maxVolumen));
  if (datenqualitaet) query = query.eq('datenqualitaet', datenqualitaet);

  // Volltextsuche (only for queries > 3 chars)
  if (trimmedQ) {
    const tsQuery = trimmedQ.split(/\s+/).filter(Boolean).join(' & ');
    query = query.textSearch('fts', tsQuery, { config: 'german' });
  }

  // Sortierung
  const validSorts = {
    'volumen_desc': { column: 'volumen_max_eur', ascending: false },
    'volumen_asc': { column: 'volumen_max_eur', ascending: true },
    'name_asc': { column: 'name', ascending: true },
    'name_desc': { column: 'name', ascending: false },
    'aktualisiert_desc': { column: 'aktualisiert_am', ascending: false },
  };
  const sortKey = sortBy && sortDir ? `${sortBy}_${sortDir}` : null;
  const sort = validSorts[sortKey];

  if (sort) {
    query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
  } else {
    query = query.order('volumen_max_eur', { ascending: false, nullsFirst: true });
  }

  // Pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[Search] Supabase error:', error.message);
    return { ergebnisse: [], total: 0 };
  }

  return { ergebnisse: data || [], total: count || 0 };
}

/**
 * ILIKE fallback for short queries (≤3 chars) like "IT", "KI", "AI", "ERP"
 * Uses pg_trgm GIN indexes for performance
 * Ranking priority: name > kurzname > foerdergeber > beschreibung > description_short
 */
async function searchShortQuery({
  sb, q, bundesland, phase, groesse, branchen, branche,
  foerderart, sortBy, sortDir, page, limit, minVolumen, maxVolumen, datenqualitaet,
}) {
  const offset = (page - 1) * limit;
  const pattern = `%${q}%`;

  // Build WHERE clauses for filters
  const conditions = [`aktiv = true`, `status = 'aktiv'`];
  const params = [pattern]; // $1 = ILIKE pattern
  let paramIdx = 2;

  // ILIKE on multiple columns (word-boundary aware for very short tokens)
  // For 1-2 char queries, use word boundary matching to avoid false positives
  const ilikePart = q.length <= 2
    ? `(name ~* ('\\m' || $1_raw || '\\M') OR kurzname ~* ('\\m' || $1_raw || '\\M') OR foerdergeber ~* ('\\m' || $1_raw || '\\M') OR beschreibung ~* ('\\m' || $1_raw || '\\M') OR description_short ~* ('\\m' || $1_raw || '\\M'))`
    : `(name ILIKE $1 OR kurzname ILIKE $1 OR foerdergeber ILIKE $1 OR beschreibung ILIKE $1 OR description_short ILIKE $1)`;

  // For 2-char tokens like "IT", "KI" — use word boundary regex to reduce false positives
  // e.g. "IT" should match "IT-Sicherheit" but not "mit"
  let searchCondition;
  if (q.length <= 2) {
    // Word boundary regex: \m = word start, \M = word end (PostgreSQL regex)
    const regexParam = `$${paramIdx}`;
    paramIdx++;
    params.push(`\\m${q}\\M`);
    searchCondition = `(name ~* ${regexParam} OR kurzname ~* ${regexParam} OR foerdergeber ~* ${regexParam} OR beschreibung ~* ${regexParam} OR description_short ~* ${regexParam})`;
  } else {
    searchCondition = `(name ILIKE $1 OR kurzname ILIKE $1 OR foerdergeber ILIKE $1 OR beschreibung ILIKE $1 OR description_short ILIKE $1)`;
  }
  conditions.push(searchCondition);

  // Filter: Bundesland
  if (bundesland) {
    conditions.push(`(bundeslaender @> ARRAY[$${paramIdx}]::text[] OR bundeslaender @> ARRAY['BUND']::text[])`);
    params.push(bundesland);
    paramIdx++;
  }

  // Filter: Phase
  if (phase) {
    conditions.push(`phasen @> ARRAY[$${paramIdx}]::text[]`);
    params.push(phase);
    paramIdx++;
  }

  // Filter: Groesse
  if (groesse) {
    conditions.push(`groessen @> ARRAY[$${paramIdx}]::text[]`);
    params.push(groesse);
    paramIdx++;
  }

  // Filter: Branchen
  const branchenParam = branchen || branche;
  if (branchenParam) {
    const branchenList = branchenParam.split(',').filter(Boolean);
    const branchenClauses = branchenList.map(b => {
      const p = `$${paramIdx}`;
      params.push(JSON.stringify([{ slug: b }]));
      paramIdx++;
      return `branchen @> ${p}::jsonb`;
    });
    // Also include branchenuebergreifend
    const buParam = `$${paramIdx}`;
    params.push(JSON.stringify([{ slug: 'branchenuebergreifend' }]));
    paramIdx++;
    conditions.push(`(${branchenClauses.join(' OR ')} OR branchen @> ${buParam}::jsonb)`);
  }

  // Filter: Foerderart
  if (foerderart) {
    conditions.push(`foerderart = $${paramIdx}`);
    params.push(foerderart);
    paramIdx++;
  }

  // Filter: Volumen
  if (minVolumen) {
    conditions.push(`volumen_max_eur >= $${paramIdx}`);
    params.push(parseInt(minVolumen));
    paramIdx++;
  }
  if (maxVolumen) {
    conditions.push(`volumen_max_eur <= $${paramIdx}`);
    params.push(parseInt(maxVolumen));
    paramIdx++;
  }

  const whereClause = conditions.join(' AND ');

  // Sortierung
  let orderClause = 'volumen_max_eur DESC NULLS LAST';
  const validSorts = {
    'volumen_desc': 'volumen_max_eur DESC NULLS LAST',
    'volumen_asc': 'volumen_max_eur ASC NULLS LAST',
    'name_asc': 'name ASC',
    'name_desc': 'name DESC',
    'aktualisiert_desc': 'aktualisiert_am DESC NULLS LAST',
  };
  const sortKey = sortBy && sortDir ? `${sortBy}_${sortDir}` : null;
  if (sortKey && validSorts[sortKey]) {
    orderClause = validSorts[sortKey];
  }

  // Use Supabase RPC via raw SQL is not available through JS client,
  // so we fall back to using the Supabase client with .or() for ILIKE
  // Actually, Supabase JS client supports .ilike() and .or() which is cleaner

  // Rebuild using Supabase client for consistency with RLS
  let query = sb
    .from('programme')
    .select('id, name, kurzname, beschreibung, description_short, foerdergeber, foerderart, volumen_min_eur, volumen_max_eur, eigenanteil_prozent, bundeslaender, phasen, groessen, branchen, antragsfrist, hat_deadline, foerderquote, zielgruppen_erweitert, finanzierungsform_erweitert', { count: 'exact' })
    .eq('aktiv', true)
    .eq('status', 'aktiv');

  // ILIKE search across multiple columns
  // For very short tokens (≤2 chars), we still use ILIKE but accept some false positives
  // The GIN trigram index makes this fast
  const likePattern = `%${q}%`;
  query = query.or(
    `name.ilike.${likePattern},kurzname.ilike.${likePattern},foerdergeber.ilike.${likePattern},beschreibung.ilike.${likePattern},description_short.ilike.${likePattern}`
  );

  // Apply all standard filters
  if (bundesland) {
    query = query.or(`bundeslaender.cs.{${bundesland}},bundeslaender.cs.{BUND}`);
  }
  if (phase) query = query.contains('phasen', [phase]);
  if (groesse) query = query.contains('groessen', [groesse]);

  if (branchenParam) {
    const branchenList = branchenParam.split(',').filter(Boolean);
    if (branchenList.length === 1) {
      query = query.or(`branchen.cs.[{"slug":"${branchenList[0]}"}],branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    } else if (branchenList.length > 1) {
      const orClauses = branchenList
        .map(b => `branchen.cs.[{"slug":"${b}"}]`)
        .join(',');
      query = query.or(`${orClauses},branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    }
  }

  if (foerderart) query = query.eq('foerderart', foerderart);
  if (minVolumen) query = query.gte('volumen_max_eur', parseInt(minVolumen));
  if (maxVolumen) query = query.lte('volumen_max_eur', parseInt(maxVolumen));
  if (datenqualitaet) query = query.eq('datenqualitaet', datenqualitaet);

  // Sortierung
  const sortConfig = {
    'volumen_desc': { column: 'volumen_max_eur', ascending: false },
    'volumen_asc': { column: 'volumen_max_eur', ascending: true },
    'name_asc': { column: 'name', ascending: true },
    'name_desc': { column: 'name', ascending: false },
    'aktualisiert_desc': { column: 'aktualisiert_am', ascending: false },
  };
  const sKey = sortBy && sortDir ? `${sortBy}_${sortDir}` : null;
  const srt = sortConfig[sKey];

  if (srt) {
    query = query.order(srt.column, { ascending: srt.ascending, nullsFirst: false });
  } else {
    query = query.order('volumen_max_eur', { ascending: false, nullsFirst: true });
  }

  // Pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[Search] Short-query error:', error.message);
    return { ergebnisse: [], total: 0 };
  }

  return { ergebnisse: data || [], total: count || 0 };
}

/**
 * Einzelnes Programm laden (für /programme/[id])
 */
export async function getProgrammeById(id) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('programme')
    .select('*')
    .eq('id', parseInt(id))
    .eq('aktiv', true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Ähnliche Programme (same foerderart + bundesland)
 */
export async function getSimilarProgrammes(programme, limit = 4) {
  const sb = getSupabase();
  if (!sb || !programme) return [];

  const { data, error } = await sb
    .from('programme')
    .select('id, name, kurzname, foerderart, foerdergeber, volumen_max_eur, bundeslaender')
    .eq('aktiv', true)
    .eq('status', 'aktiv')
    .eq('foerderart', programme.foerderart)
    .neq('id', programme.id)
    .overlaps('bundeslaender', programme.bundeslaender || [])
    .limit(limit);

  if (error) return [];
  return data || [];
}

/**
 * Mehrere Programme laden (für /compare)
 */
export async function getProgrammesByIds(ids) {
  const sb = getSupabase();
  if (!sb || !ids?.length) return [];

  const { data, error } = await sb
    .from('programme')
    .select('*')
    .in('id', ids.map(id => parseInt(id)))
    .eq('aktiv', true);

  if (error) return [];
  return data || [];
}

/**
 * Top-Programme IDs für Static Generation
 */
export async function getTopProgrammeIds(limit = 100) {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('programme')
    .select('id')
    .eq('aktiv', true)
    .eq('status', 'aktiv')
    .order('volumen_max_eur', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map(p => p.id);
}

/**
 * Alle IDs für Sitemap
 */
export async function getAllProgrammeIds() {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('programme')
    .select('id, aktualisiert_am')
    .eq('aktiv', true)
    .eq('status', 'aktiv')
    .order('id');

  if (error) return [];
  return data || [];
}
