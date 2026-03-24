import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

// ─── JSON Fallback ───
const DATA_PATH = path.join(process.cwd(), 'data', 'foerderprogramme.json');
let _jsonCache = null;

function loadJsonData() {
  if (_jsonCache) return _jsonCache;
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    _jsonCache = JSON.parse(raw);
    return _jsonCache;
  } catch {
    return { programme: [], branchen: [] };
  }
}

// ─── Supabase Query ───
async function searchSupabase({ bundesland, phase, groesse, branche, foerderart, suchbegriff, sortBy, sortDir, page = 1, limit = 20, minVolumen, maxVolumen, hatDeadline, datenqualitaet }) {
  let query = supabase
    .from('programme')
    .select('*', { count: 'exact' })
    .eq('aktiv', true)
    .eq('status', 'aktiv');

  if (bundesland) {
    query = query.or(`bundeslaender.cs.{${bundesland}},bundeslaender.cs.{BUND}`);
  }
  if (phase) query = query.contains('phasen', [phase]);
  if (groesse) query = query.contains('groessen', [groesse]);
  if (branche) {
    query = query.or(`branchen.cs.[{"slug":"${branche}"}],branchen.cs.[{"slug":"branchenuebergreifend"}]`);
  }
  if (foerderart) query = query.eq('foerderart', foerderart);

  // v5 Advanced Filter
  if (minVolumen) query = query.gte('volumen_max_eur', parseInt(minVolumen));
  if (maxVolumen) query = query.lte('volumen_max_eur', parseInt(maxVolumen));
  if (hatDeadline === 'true') query = query.eq('hat_deadline', true);
  if (datenqualitaet) query = query.eq('datenqualitaet', datenqualitaet);

  if (suchbegriff) {
    const tsQuery = suchbegriff.split(/\s+/).filter(Boolean).join(' & ');
    query = query.textSearch('fts', tsQuery, { config: 'german' });
  }

  // Sortierung
  const validSorts = {
    'volumen_desc': { column: 'volumen_max_eur', ascending: false },
    'volumen_asc': { column: 'volumen_max_eur', ascending: true },
    'name_asc': { column: 'name', ascending: true },
    'name_desc': { column: 'name', ascending: false },
    'aktualisiert_desc': { column: 'aktualisiert_am', ascending: false },
    'aktualisiert_asc': { column: 'aktualisiert_am', ascending: true },
  };

  const sortKey = sortBy && sortDir ? `${sortBy}_${sortDir}` : null;
  const sort = validSorts[sortKey];

  if (sort) {
    query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
  } else {
    query = query.order('volumen_max_eur', { ascending: false, nullsFirst: true });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('[Supabase] Query error:', error.message);
    throw error;
  }

  return { ergebnisse: data || [], total: count || 0 };
}

// ─── JSON Fallback Query ───
function searchJson({ bundesland, phase, groesse, branche, foerderart, suchbegriff, page = 1, limit = 20 }) {
  const data = loadJsonData();
  let results = data.programme.filter(p => p.aktiv && p.status === 'aktiv');

  if (bundesland) {
    results = results.filter(p =>
      p.bundeslaender.includes(bundesland) ||
      p.bundeslaender.includes('BUND') ||
      p.bundeslaender.includes('EU')
    );
  }
  if (phase) results = results.filter(p => p.phasen.includes(phase));
  if (groesse) results = results.filter(p => p.groessen.includes(groesse));
  if (branche) {
    results = results.filter(p =>
      p.branchen.some(b => b.slug === branche || b.slug === 'branchenuebergreifend')
    );
  }
  if (foerderart) results = results.filter(p => p.foerderart === foerderart);
  if (suchbegriff) {
    const q = suchbegriff.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.beschreibung?.toLowerCase().includes(q) ||
      (p.kurzname && p.kurzname.toLowerCase().includes(q))
    );
  }

  const total = results.length;
  const offset = (page - 1) * limit;
  const paged = results.slice(offset, offset + limit);

  return { ergebnisse: paged, total };
}

// ─── Public API ───
export async function sucheForederungen(filters) {
  if (supabase) {
    try {
      return await searchSupabase(filters);
    } catch (err) {
      console.warn('[DB] Supabase failed, falling back to JSON:', err.message);
      return searchJson(filters);
    }
  }
  return searchJson(filters);
}

export async function getMeta() {
  if (supabase) {
    try {
      const { data: branchen } = await supabase
        .from('branchen')
        .select('*')
        .order('name');

      const { count: total } = await supabase
        .from('programme')
        .select('*', { count: 'exact', head: true })
        .eq('aktiv', true)
        .eq('status', 'aktiv');

      return { branchen: branchen || [], total: total || 0 };
    } catch {
      // Fallback
    }
  }

  const data = loadJsonData();
  return {
    branchen: data.branchen || [],
    total: data.programme.filter(p => p.aktiv && p.status === 'aktiv').length,
  };
}
