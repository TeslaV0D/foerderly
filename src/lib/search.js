/**
 * FÖRDERLY v5.2 – Server-seitige Suche
 * Updates: Branchen Multi-Select, description_short/full Felder
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
 * v5.2: branchen als Multi-Select (kommasepariert), description_short/full
 */
export async function searchProgrammes({
  bundesland, phase, groesse, branchen, branche, foerderart,
  q, sortBy, sortDir, page = 1, limit = 20,
  minVolumen, maxVolumen, hatDeadline, datenqualitaet,
} = {}) {
  const sb = getSupabase();
  if (!sb) return { ergebnisse: [], total: 0 };

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

  // v5.2: Branchen Multi-Select Support
  // branchen kommt als kommaseparierter String: "it-software,digitalisierung"
  const branchenParam = branchen || branche;
  if (branchenParam) {
    const branchenList = branchenParam.split(',').filter(Boolean);
    if (branchenList.length === 1) {
      query = query.or(`branchen.cs.[{"slug":"${branchenList[0]}"}],branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    } else if (branchenList.length > 1) {
      // Multi-Select: Programm muss mindestens eine der gewählten Branchen haben
      const orClauses = branchenList
        .map(b => `branchen.cs.[{"slug":"${b}"}]`)
        .join(',');
      query = query.or(`${orClauses},branchen.cs.[{"slug":"branchenuebergreifend"}]`);
    }
  }

  if (foerderart) query = query.eq('foerderart', foerderart);

  // v5 Advanced Filter
  if (minVolumen) query = query.gte('volumen_max_eur', parseInt(minVolumen));
  if (maxVolumen) query = query.lte('volumen_max_eur', parseInt(maxVolumen));
  if (hatDeadline === 'true') query = query.eq('hat_deadline', true);
  if (datenqualitaet) query = query.eq('datenqualitaet', datenqualitaet);

  // Volltextsuche
  if (q) {
    const tsQuery = q.split(/\s+/).filter(Boolean).join(' & ');
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
 * Einzelnes Programm laden (für /programme/[id])
 * v5.2: Holt auch description_short und description_full
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
