/**
 * SICHERHEIT: Input-Validierung & Sanitierung
 * Whitelist-Ansatz für alle Filter-Parameter.
 */

const VALID_BUNDESLAENDER = [
  'BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV',
  'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH',
];

const VALID_PHASEN = [
  'ideation', 'gruendung', 'fruehphase', 'wachstum', 'etabliert',
];

const VALID_GROESSEN = [
  'solo', 'mikro', 'klein', 'mittel',
];

// Branche-Slugs: nur Kleinbuchstaben, Ziffern und Bindestriche
const BRANCHE_REGEX = /^[a-z0-9-]{1,50}$/;

// Suchbegriff: alphanumerisch + deutsche Umlaute + Leerzeichen + Bindestriche
const SEARCH_REGEX = /[^\w\süöäÜÖÄß\-.,]/g;
const MAX_SEARCH_LENGTH = 100;

/**
 * Validiert und sanitiert alle Filter-Parameter aus der URL.
 * Gibt nur sichere, geprüfte Werte zurück.
 */
export function sanitizeFilters(searchParams) {
  const raw = {
    bundesland: searchParams.get('bundesland') || '',
    phase: searchParams.get('phase') || '',
    groesse: searchParams.get('groesse') || '',
    branche: searchParams.get('branche') || '',
    q: searchParams.get('q') || '',
    limit: searchParams.get('limit') || '20',
    page: searchParams.get('page') || '1',
  };

  return {
    bundesland: VALID_BUNDESLAENDER.includes(raw.bundesland) ? raw.bundesland : undefined,
    phase: VALID_PHASEN.includes(raw.phase) ? raw.phase : undefined,
    groesse: VALID_GROESSEN.includes(raw.groesse) ? raw.groesse : undefined,
    branche: BRANCHE_REGEX.test(raw.branche) ? raw.branche : undefined,
    suchbegriff: sanitizeSearchTerm(raw.q),
    limit: sanitizeLimit(raw.limit),
    page: sanitizePage(raw.page),
  };
}

function sanitizeSearchTerm(input) {
  if (!input || typeof input !== 'string') return undefined;
  const cleaned = input
    .slice(0, MAX_SEARCH_LENGTH)
    .replace(SEARCH_REGEX, '')
    .trim();
  return cleaned || undefined;
}

function sanitizeLimit(input) {
  const num = parseInt(input, 10);
  if (isNaN(num)) return 20;
  return Math.min(Math.max(num, 1), 100);
}

function sanitizePage(input) {
  const num = parseInt(input, 10);
  if (isNaN(num)) return 1;
  return Math.max(num, 1);
}
