/**
 * SICHERHEIT: URL-Validierung für externe Links
 * Whitelist-Ansatz: Nur bekannte, vertrauenswürdige Domains.
 */

const ALLOWED_DOMAINS = [
  // Bund
  'foerderdatenbank.de',
  'kfw.de',
  'bafa.de',
  'exist.de',
  'arbeitsagentur.de',
  'zim.de',
  'bmwk.de',
  'bmwi.de',
  'bmbf.de',
  'bmf.de',
  'bmuv.de',
  'innovation-beratung-foerderung.de',
  'mein-mikrokredit.de',
  'invest-wagniskapital.de',
  'bescheinigung-forschungszulage.de',
  'kmu-innovativ.de',
  'umweltinnovationsprogramm.de',
  // Bayern
  'stmwi.bayern.de',
  'digitalbonus.bayern',
  'gruenderland.bayern',
  'baystartup.de',
  'bayern.de',
  // NRW
  'nrwbank.de',
  'gruenderstipendium.nrw',
  'mittelstand-innovativ-digital.nrw',
  // Berlin
  'berlin.de',
  'ibb-business-team.de',
  // Baden-Württemberg
  'l-bank.de',
  'startupbw.de',
  'innovationsgutschein.de',
  // Niedersachsen
  'nbank.de',
  // Sachsen
  'sab.sachsen.de',
  // Hessen
  'wibank.de',
  'digitalstrategie.hessen.de',
  // Hamburg
  'ifbhh.de',
  'kreativgesellschaft.org',
  // Schleswig-Holstein
  'mbg-sh.de',
  // Thüringen
  'aufbaubank.de',
  // Brandenburg
  'ilb.de',
  // Mecklenburg-Vorpommern
  'wm.mv-regierung.de',
  // EU
  'eic.ec.europa.eu',
  'ec.europa.eu',
  'eurostars-eureka.eu',
  // Allgemein
  'bundesanzeiger.de',
  'gesetze-im-internet.de',
];

/**
 * Prüft ob eine URL zu einer vertrauenswürdigen Domain gehört.
 * Nur HTTPS ist erlaubt.
 */
export function isAllowedUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    // Nur HTTPS erlauben
    if (parsed.protocol !== 'https:') return false;
    // Domain gegen Whitelist prüfen
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Filtert eine URL: gibt sie zurück wenn erlaubt, sonst null.
 */
export function sanitizeUrl(url) {
  return isAllowedUrl(url) ? url : null;
}
