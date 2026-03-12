import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'foerderprogramme.json');

let _cache = null;

function loadData() {
  if (_cache) return _cache;
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    _cache = JSON.parse(raw);
    return _cache;
  } catch (err) {
    console.error('Daten nicht gefunden. Bitte "npm run seed" ausführen.', err.message);
    return { programme: [], branchen: [] };
  }
}

export function sucheForederungen({ bundesland, phase, groesse, branche, suchbegriff, page = 1, limit = 20 }) {
  const data = loadData();
  let results = data.programme.filter(p => p.aktiv && p.status === 'aktiv');

  if (bundesland) {
    results = results.filter(p =>
      p.bundeslaender.includes(bundesland) ||
      p.bundeslaender.includes('BUND') ||
      p.bundeslaender.includes('EU')
    );
  }

  if (phase) {
    results = results.filter(p => p.phasen.includes(phase));
  }

  if (groesse) {
    results = results.filter(p => p.groessen.includes(groesse));
  }

  if (branche) {
    results = results.filter(p =>
      p.branchen.some(b => b.slug === branche || b.slug === 'branchenuebergreifend')
    );
  }

  if (suchbegriff) {
    const q = suchbegriff.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.beschreibung.toLowerCase().includes(q) ||
      (p.kurzname && p.kurzname.toLowerCase().includes(q))
    );
  }

  if (bundesland) {
    results.sort((a, b) => {
      const aExact = a.bundeslaender.includes(bundesland) ? 1 : 0;
      const bExact = b.bundeslaender.includes(bundesland) ? 1 : 0;
      return bExact - aExact;
    });
  }

  const total = results.length;
  const offset = (page - 1) * limit;
  const paged = results.slice(offset, offset + limit);

  return { ergebnisse: paged, total };
}

export function getProgrammById(id) {
  const data = loadData();
  return data.programme.find(p => p.id === id) || null;
}

export function getMeta() {
  const data = loadData();
  const branchen = data.branchen || [];
  const total = data.programme.filter(p => p.aktiv && p.status === 'aktiv').length;

  const blCounts = {};
  data.programme.forEach(p => {
    if (!p.aktiv || p.status !== 'aktiv') return;
    p.bundeslaender.forEach(bl => {
      blCounts[bl] = (blCounts[bl] || 0) + 1;
    });
  });

  const bundeslaender_counts = Object.entries(blCounts).map(([bundesland, anzahl]) => ({
    bundesland, anzahl,
  }));

  return { branchen, bundeslaender_counts, total };
}
