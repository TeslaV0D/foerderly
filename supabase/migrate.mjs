/**
 * FÖRDERLY – JSON → Supabase Migration
 * 
 * Importiert foerderprogramme.json in die Supabase-Datenbank.
 * 
 * Voraussetzungen:
 *   1. Schema in Supabase SQL Editor ausgeführt (supabase/schema.sql)
 *   2. .env.local mit SUPABASE_URL und SUPABASE_SERVICE_KEY
 * 
 * Ausführen:
 *   node supabase/migrate.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, '..', 'data', 'foerderprogramme.json');

// ─── Config ───
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Fehlende Umgebungsvariablen!');
  console.error('   Setze SUPABASE_URL und SUPABASE_SERVICE_KEY in .env.local');
  console.error('   Oder übergib sie direkt:');
  console.error('   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node supabase/migrate.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('\n════════════════════════════════════════');
  console.log('  FÖRDERLY – Migration JSON → Supabase');
  console.log('════════════════════════════════════════\n');

  // Load JSON
  console.log('📄 Lade JSON...');
  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(raw);
  const programmes = data.programme;
  console.log(`   ${programmes.length} Programme geladen\n`);

  // Transform for Supabase (remove id, let DB auto-generate)
  const rows = programmes.map(p => ({
    name: p.name,
    kurzname: p.kurzname || null,
    beschreibung: p.beschreibung || null,
    foerdergeber: p.foerdergeber || null,
    foerderart: p.foerderart || 'zuschuss',
    volumen_min_eur: p.volumen_min_eur || 0,
    volumen_max_eur: p.volumen_max_eur || 0,
    eigenanteil_prozent: p.eigenanteil_prozent || 0,
    status: p.status || 'aktiv',
    antragsfrist: p.antragsfrist || null,
    url_antrag: p.url_antrag || null,
    url_quelle: p.url_quelle || null,
    quelle: 'foerderdatenbank',
    bundeslaender: p.bundeslaender || [],
    phasen: p.phasen || [],
    groessen: p.groessen || [],
    branchen: p.branchen || [],
    aktiv: p.aktiv !== false,
    aktualisiert_am: p.aktualisiert_am || new Date().toISOString().split('T')[0],
  }));

  // Clear existing data
  console.log('🗑️  Lösche bestehende Daten...');
  const { error: deleteError } = await supabase
    .from('programme')
    .delete()
    .gte('id', 0);

  if (deleteError) {
    console.error('❌ Fehler beim Löschen:', deleteError.message);
    console.error('   Stell sicher, dass das Schema ausgeführt wurde (supabase/schema.sql)');
    process.exit(1);
  }

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  console.log(`📥 Importiere ${rows.length} Programme in Batches à ${BATCH_SIZE}...\n`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data: result, error } = await supabase
      .from('programme')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += result.length;
      process.stdout.write(`   ✅ ${inserted}/${rows.length} Programme importiert\r`);
    }
  }

  console.log('\n');

  // Verify
  const { count } = await supabase
    .from('programme')
    .select('*', { count: 'exact', head: true });

  console.log('════════════════════════════════════════');
  console.log(`  ✅ Migration abgeschlossen!`);
  console.log(`  📊 ${count} Programme in Supabase`);
  console.log(`  ❌ ${errors} Fehler`);
  console.log('════════════════════════════════════════\n');
}

migrate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
