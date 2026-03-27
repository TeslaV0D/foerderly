// src/lib/constants.js
// v5.2: Vollständige Branchen-Liste (16 Kategorien)

export const BUNDESLAENDER = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern',
  BE: 'Berlin',
  BB: 'Brandenburg',
  HB: 'Bremen',
  HH: 'Hamburg',
  HE: 'Hessen',
  MV: 'Mecklenburg-Vorpommern',
  NI: 'Niedersachsen',
  NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz',
  SL: 'Saarland',
  SN: 'Sachsen',
  ST: 'Sachsen-Anhalt',
  SH: 'Schleswig-Holstein',
  TH: 'Thüringen',
};

export const PHASEN = {
  ideation: 'Idee / Vorgründung',
  gruendung: 'Gründung (0–1 Jahr)',
  fruehphase: 'Frühphase (1–3 Jahre)',
  wachstum: 'Wachstum (3–5 Jahre)',
  etabliert: 'Etabliert (5+ Jahre)',
};

export const GROESSEN = {
  solo: 'Einzelunternehmer/in',
  mikro: 'Mikro (1–9 Mitarbeiter)',
  klein: 'Klein (10–49 Mitarbeiter)',
  mittel: 'Mittel (50–249 Mitarbeiter)',
};

export const FOERDERARTEN = {
  zuschuss: { label: 'Zuschuss', color: '#16a34a', emoji: '💰' },
  kredit: { label: 'Kredit', color: '#2563eb', emoji: '🏦' },
  buergschaft: { label: 'Bürgschaft', color: '#7c3aed', emoji: '🛡️' },
  beteiligung: { label: 'Beteiligung', color: '#ea580c', emoji: '🤝' },
  beratung: { label: 'Beratung', color: '#0891b2', emoji: '💡' },
  steuerlich: { label: 'Steuerlich', color: '#4f46e5', emoji: '📋' },
};

// v5: Datenqualität Labels
export const DATENQUALITAET = {
  vollstaendig: { label: 'Vollständig', icon: '✓' },
  unvollstaendig: { label: 'Teilweise', icon: '◐' },
  minimal: { label: 'Minimal', icon: '○' },
};

// v5.2: Vollständige Branchen-Liste (16 Kategorien, Multi-Select-fähig)
export const BRANCHEN_OPTIONS = [
  { slug: 'bauwesen-immobilien', label: 'Bauwesen & Immobilien' },
  { slug: 'bildung', label: 'Bildung' },
  { slug: 'branchenuebergreifend', label: 'Branchenübergreifend' },
  { slug: 'digitalisierung', label: 'Digitalisierung' },
  { slug: 'energie-umwelt', label: 'Energie & Umwelt' },
  { slug: 'forschung-entwicklung', label: 'Forschung & Entwicklung' },
  { slug: 'gesundheit-medizin', label: 'Gesundheit & Medizin' },
  { slug: 'handel', label: 'Handel' },
  { slug: 'handwerk', label: 'Handwerk' },
  { slug: 'it-software', label: 'IT & Software' },
  { slug: 'kreativwirtschaft', label: 'Kreativwirtschaft' },
  { slug: 'landwirtschaft', label: 'Landwirtschaft' },
  { slug: 'mobilitaet-logistik', label: 'Mobilität & Logistik' },
  { slug: 'produktion-industrie', label: 'Produktion & Industrie' },
  { slug: 'sozialunternehmen', label: 'Sozialunternehmen' },
  { slug: 'tourismus-gastro', label: 'Tourismus & Gastro' },
];

export function formatEuro(amount) {
  if (!amount) return '–';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
