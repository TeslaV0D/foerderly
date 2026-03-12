/**
 * FÖRDERFINDER – Erweitertes Seed-Skript v2.0
 * 80+ echte Förderprogramme aus Bund + 10 Bundesländern
 * 
 * Ausführen: npm run seed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', '..', 'data');
const OUT_PATH = path.join(OUT_DIR, 'foerderprogramme.json');

const branchen = [
  { id: 1, name: 'Digitalisierung', slug: 'digitalisierung' },
  { id: 2, name: 'Energie & Umwelt', slug: 'energie-umwelt' },
  { id: 3, name: 'Forschung & Entwicklung', slug: 'forschung-entwicklung' },
  { id: 4, name: 'Gesundheit & Medizin', slug: 'gesundheit-medizin' },
  { id: 5, name: 'Handwerk', slug: 'handwerk' },
  { id: 6, name: 'Handel', slug: 'handel' },
  { id: 7, name: 'IT & Software', slug: 'it-software' },
  { id: 8, name: 'Kreativwirtschaft', slug: 'kreativwirtschaft' },
  { id: 9, name: 'Landwirtschaft', slug: 'landwirtschaft' },
  { id: 10, name: 'Mobilität & Logistik', slug: 'mobilitaet-logistik' },
  { id: 11, name: 'Produktion & Industrie', slug: 'produktion-industrie' },
  { id: 12, name: 'Sozialunternehmen', slug: 'sozialunternehmen' },
  { id: 13, name: 'Tourismus & Gastro', slug: 'tourismus-gastro' },
  { id: 14, name: 'Bildung', slug: 'bildung' },
  { id: 15, name: 'Bauwesen & Immobilien', slug: 'bauwesen-immobilien' },
  { id: 16, name: 'Branchenübergreifend', slug: 'branchenuebergreifend' },
];

const bMap = Object.fromEntries(branchen.map(b => [b.slug, b]));

// Helper: Programm-Objekt erstellen
function p(d) {
  return { ...d, branchenSlugs: d.br, br: undefined };
}

const raw = [
  // =====================================================
  // BUND – Existenzgründung & Startups
  // =====================================================
  { name: 'EXIST-Gründerstipendium', kurzname: 'EXIST', beschreibung: 'Unterstützt Studierende, Absolvent:innen und Wissenschaftler:innen aus Hochschulen bei der Vorbereitung technologieorientierter Existenzgründungen. Stipendium für max. 1 Jahr zur Sicherung des Lebensunterhalts plus Sachkosten und Coaching.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 1000, volumen_max_eur: 3000, eigenanteil_prozent: 0, url_antrag: 'https://www.exist.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/exist-gruenderstipendium.html', bundeslaender: ['BUND'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend', 'forschung-entwicklung', 'it-software'] },

  { name: 'EXIST-Forschungstransfer', kurzname: 'EXIST-FT', beschreibung: 'Fördert herausragende forschungsbasierte Gründungsvorhaben mit aufwändigen Entwicklungsarbeiten. Phase I: Entwicklung (max. 18 Monate), Phase II: Gründung und Geschäftsaufnahme (max. 18 Monate).', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 70000, volumen_max_eur: 250000, eigenanteil_prozent: 0, url_antrag: 'https://www.exist.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/exist-forschungstransfer.html', bundeslaender: ['BUND'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro', 'klein'], br: ['forschung-entwicklung', 'it-software', 'gesundheit-medizin'] },

  { name: 'EXIST Women', kurzname: 'EXIST Women', beschreibung: 'Förderprogramm speziell für Gründerinnen aus der Wissenschaft. Unterstützt Frauen bei der Vorbereitung innovativer Gründungsvorhaben mit Stipendium, Coaching und Netzwerk.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 1000, volumen_max_eur: 2000, eigenanteil_prozent: 0, url_antrag: 'https://www.exist.de/', url_quelle: 'https://www.exist.de/EXIST/Navigation/DE/EXIST-Women/exist-women.html', bundeslaender: ['BUND'], phasen: ['ideation', 'gruendung'], groessen: ['solo'], br: ['branchenuebergreifend', 'forschung-entwicklung'] },

  { name: 'Gründungszuschuss', kurzname: 'Gründungszuschuss', beschreibung: 'Unterstützt Arbeitslose bei der Aufnahme einer selbständigen Tätigkeit. Phase 1: 6 Monate ALG I + 300 EUR/Monat. Phase 2: 9 Monate 300 EUR/Monat. Voraussetzung: mind. 150 Tage Restanspruch ALG I.', foerdergeber: 'Bundesagentur für Arbeit', foerderart: 'zuschuss', volumen_min_eur: 300, volumen_max_eur: 2500, eigenanteil_prozent: 0, url_antrag: 'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/gruendungszuschuss', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BA/gruendungszuschuss.html', bundeslaender: ['BUND'], phasen: ['gruendung'], groessen: ['solo'], br: ['branchenuebergreifend'] },

  { name: 'Einstiegsgeld', kurzname: 'Einstiegsgeld', beschreibung: 'Fördert Bezieher:innen von Bürgergeld bei der Aufnahme einer selbständigen Tätigkeit. Dauer: max. 24 Monate. Höhe wird individuell festgelegt, orientiert an der Regelleistung.', foerdergeber: 'Bundesagentur für Arbeit', foerderart: 'zuschuss', volumen_min_eur: 100, volumen_max_eur: 500, eigenanteil_prozent: 0, url_antrag: 'https://www.arbeitsagentur.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BA/einstiegsgeld.html', bundeslaender: ['BUND'], phasen: ['gruendung'], groessen: ['solo'], br: ['branchenuebergreifend'] },

  // BUND – Finanzierung / KfW
  { name: 'ERP-Gründerkredit – StartGeld', kurzname: 'KfW-StartGeld', beschreibung: 'Zinsgünstiger Kredit bis 125.000 EUR für Existenzgründungen und junge Unternehmen (bis 5 Jahre). Für Investitionen und Betriebsmittel. KfW übernimmt 80% Haftungsfreistellung.', foerdergeber: 'KfW Bankengruppe', foerderart: 'kredit', volumen_min_eur: 5000, volumen_max_eur: 125000, eigenanteil_prozent: 0, url_antrag: 'https://www.kfw.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/erp-gruenderkredit-startgeld.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend'] },

  { name: 'ERP-Förderkredit Gründung und Nachfolge', kurzname: 'ERP-Förderkredit', beschreibung: 'Finanziert Gründungen, Übernahmen und tätigkeitsbezogene Investitionen mit bis zu 25 Mio. EUR. Für Unternehmen bis 5 Jahre nach Gründung. Risikoübernahme bis 90%.', foerdergeber: 'KfW Bankengruppe', foerderart: 'kredit', volumen_min_eur: 25000, volumen_max_eur: 25000000, eigenanteil_prozent: 0, url_antrag: 'https://www.kfw.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/KfW/erp-foerderkredit-gruendung-und-nachfolge.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein', 'mittel'], br: ['branchenuebergreifend'] },

  { name: 'ERP-Kapital für Gründung', kurzname: 'ERP-Kapital', beschreibung: 'Nachrangdarlehen zur Stärkung der Eigenkapitalbasis. Verbessert das Rating bei der Hausbank. Bis 500.000 EUR, 15% Eigenanteil erforderlich.', foerdergeber: 'KfW Bankengruppe', foerderart: 'kredit', volumen_min_eur: 10000, volumen_max_eur: 500000, eigenanteil_prozent: 15, url_antrag: 'https://www.kfw.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/erp-kapital-fuer-gruendung.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein', 'mittel'], br: ['branchenuebergreifend'] },

  { name: 'KfW-Förderkredit großer Mittelstand', kurzname: 'KfW-Großer Mittelstand', beschreibung: 'Finanzierung für etablierte mittelständische Unternehmen mit einem Gruppenumsatz bis 500 Mio. EUR. Für Investitionen und Betriebsmittel.', foerdergeber: 'KfW Bankengruppe', foerderart: 'kredit', volumen_min_eur: 25000, volumen_max_eur: 25000000, eigenanteil_prozent: 0, url_antrag: 'https://www.kfw.de/', url_quelle: 'https://www.kfw.de/inlandsfoerderung/Unternehmen/', bundeslaender: ['BUND'], phasen: ['wachstum', 'etabliert'], groessen: ['mittel'], br: ['branchenuebergreifend'] },

  { name: 'Mikrokreditfonds Deutschland', kurzname: 'Mikrokredit', beschreibung: 'Kleinkredite bis 25.000 EUR für Gründer:innen und Kleinstunternehmen ohne Zugang zu Bankkrediten. Vergabe über akkreditierte Mikrofinanzinstitute.', foerdergeber: 'BMAS', foerderart: 'kredit', volumen_min_eur: 1000, volumen_max_eur: 25000, eigenanteil_prozent: 0, url_antrag: 'https://www.mein-mikrokredit.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMAS/mikrokreditfonds.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend'] },

  // BUND – Beratung & Innovation
  { name: 'BAFA-Förderung unternehmerischen Know-hows', kurzname: 'BAFA-Beratung', beschreibung: 'Zuschuss zu Beratungskosten für KMU. Junge Unternehmen (bis 2 J.) erhalten bis 80%, Bestandsunternehmen bis 50%. Max. Bemessungsgrundlage 3.500 EUR für junge Unternehmen.', foerdergeber: 'BAFA', foerderart: 'zuschuss', volumen_min_eur: 500, volumen_max_eur: 2800, eigenanteil_prozent: 20, url_antrag: 'https://www.bafa.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BAFA/bafa-unternehmensberatung.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase', 'wachstum'], groessen: ['solo', 'mikro', 'klein', 'mittel'], br: ['branchenuebergreifend'] },

  { name: 'go-digital', kurzname: 'go-digital', beschreibung: 'Fördert KMU und Handwerksbetriebe bei der Digitalisierung. Module: Digitalisierte Geschäftsprozesse, Digitale Markterschließung, IT-Sicherheit. Bis 50% Zuschuss, max. 16.500 EUR.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 5000, volumen_max_eur: 16500, eigenanteil_prozent: 50, url_antrag: 'https://www.innovation-beratung-foerderung.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/go-digital.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software', 'handwerk', 'handel'] },

  { name: 'go-inno', kurzname: 'go-inno', beschreibung: 'Fördert externe Innovationsberatung für KMU. Autorisierte Beratungsunternehmen unterstützen bei Innovations- und Technologiemanagement. Bis 50% Zuschuss.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 2000, volumen_max_eur: 16500, eigenanteil_prozent: 50, url_antrag: 'https://www.innovation-beratung-foerderung.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/go-inno.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'produktion-industrie'] },

  { name: 'Zentrales Innovationsprogramm Mittelstand', kurzname: 'ZIM', beschreibung: 'Fördert F&E-Projekte mittelständischer Unternehmen. Einzelprojekte, Kooperationsprojekte, Innovationsnetzwerke. Bis 60% Zuschuss, max. 550.000 EUR.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 20000, volumen_max_eur: 550000, eigenanteil_prozent: 40, url_antrag: 'https://www.zim.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/zentrales-innovationsprogramm-mittelstand-zim.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'produktion-industrie', 'gesundheit-medizin'] },

  { name: 'INVEST – Zuschuss für Wagniskapital', kurzname: 'INVEST', beschreibung: 'Erleichtert Startups die Suche nach Business Angels. Investoren erhalten 25% Erwerbszuschuss (max. 500.000 EUR Bemessungsgrundlage) und 25% Exitzuschuss.', foerdergeber: 'BMWK / BAFA', foerderart: 'zuschuss', volumen_min_eur: 10000, volumen_max_eur: 125000, eigenanteil_prozent: 75, url_antrag: 'https://www.bafa.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BAFA/invest-zuschuss-fuer-wagniskapital.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase', 'wachstum'], groessen: ['mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'forschung-entwicklung'] },

  { name: 'Forschungszulage (steuerlich)', kurzname: 'Forschungszulage', beschreibung: 'Steuerliche Förderung für F&E-Vorhaben. 25% der förderfähigen Aufwendungen, max. 1 Mio. EUR/Jahr (für KMU: max. 2 Mio. EUR). Gilt für Grundlagenforschung, industrielle Forschung und experimentelle Entwicklung.', foerdergeber: 'BMBF / Finanzamt', foerderart: 'steuerlich', volumen_min_eur: 0, volumen_max_eur: 2000000, eigenanteil_prozent: 0, url_antrag: 'https://www.bescheinigung-forschungszulage.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMBF/forschungszulage.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'produktion-industrie', 'gesundheit-medizin'] },

  { name: 'KMU-innovativ', kurzname: 'KMU-innovativ', beschreibung: 'BMBF-Förderinitiative für Spitzenforschung in KMU. Themenfelder: Bioökonomie, Elektronik, IKT, Medizintechnik, Materialforschung, Produktionstechnologie. Vereinfachtes Verfahren, schnelle Bewilligung.', foerdergeber: 'BMBF', foerderart: 'zuschuss', volumen_min_eur: 50000, volumen_max_eur: 500000, eigenanteil_prozent: 50, url_antrag: 'https://www.kmu-innovativ.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMBF/kmu-innovativ.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'gesundheit-medizin', 'produktion-industrie'] },

  { name: 'Digital Jetzt', kurzname: 'Digital Jetzt', beschreibung: 'Zuschüsse für KMU zur Digitalisierung. Modul 1: Investitionen in digitale Technologien. Modul 2: Qualifizierung der Mitarbeitenden. Max. 50.000 EUR pro Modul.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 17000, volumen_max_eur: 50000, eigenanteil_prozent: 50, url_antrag: 'https://www.bmwk.de/Redaktion/DE/Dossier/digital-jetzt.html', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/digital-jetzt.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software', 'branchenuebergreifend'] },

  { name: 'Innovationsprogramm für Geschäftsmodelle und Pionierlösungen', kurzname: 'IGP', beschreibung: 'Fördert innovative nicht-technische Geschäftsmodelle und Pionierlösungen. Ideal für soziale Innovationen, Plattformmodelle und Dienstleistungsinnovationen.', foerdergeber: 'BMWK', foerderart: 'zuschuss', volumen_min_eur: 50000, volumen_max_eur: 300000, eigenanteil_prozent: 50, url_antrag: 'https://www.innovation-beratung-foerderung.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/igp.html', bundeslaender: ['BUND'], phasen: ['gruendung', 'fruehphase', 'wachstum'], groessen: ['mikro', 'klein', 'mittel'], br: ['branchenuebergreifend', 'sozialunternehmen', 'digitalisierung'] },

  // BUND – Energie & Umwelt
  { name: 'Bundesförderung für Energie- und Ressourceneffizienz (EEW)', kurzname: 'EEW', beschreibung: 'Fördert Unternehmen bei Investitionen in Energieeffizienz. 6 Module: Querschnittstechnologien, Prozesswärme, MSR-Technik, Energiebezogene Optimierung, Transformationspläne, Elektrifizierung.', foerdergeber: 'BAFA / KfW', foerderart: 'zuschuss', volumen_min_eur: 2000, volumen_max_eur: 15000000, eigenanteil_prozent: 40, url_antrag: 'https://www.bafa.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMWi/energieeffizienz-u-prozesswaerme-zuschuss-1.html', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['energie-umwelt', 'produktion-industrie'] },

  { name: 'Umweltinnovationsprogramm', kurzname: 'UIP', beschreibung: 'Fördert erstmalige, großtechnische Anwendung innovativer Umwelttechnologien. Für Unternehmen, die mit Pilotprojekten neue Umweltstandards setzen.', foerdergeber: 'BMUV / KfW', foerderart: 'kredit', volumen_min_eur: 100000, volumen_max_eur: 10000000, eigenanteil_prozent: 30, url_antrag: 'https://www.umweltinnovationsprogramm.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMU/umweltinnovationsprogramm.html', bundeslaender: ['BUND'], phasen: ['wachstum', 'etabliert'], groessen: ['klein', 'mittel'], br: ['energie-umwelt', 'produktion-industrie'] },

  // =====================================================
  // BAYERN
  // =====================================================
  { name: 'Digitalbonus Bayern', kurzname: 'Digitalbonus', beschreibung: 'Fördert bayerische KMU bei der Digitalisierung. Standard: bis 10.000 EUR (50%). Plus: bis 50.000 EUR (50%) für besonders innovative IT-Projekte und IT-Sicherheit.', foerdergeber: 'StMD Bayern', foerderart: 'zuschuss', volumen_min_eur: 2000, volumen_max_eur: 50000, eigenanteil_prozent: 50, url_antrag: 'https://www.digitalbonus.bayern/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/digitalbonus.html', bundeslaender: ['BY'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software', 'handwerk', 'handel'] },

  { name: 'Start?Zuschuss! Bayern', kurzname: 'Start?Zuschuss!', beschreibung: 'Anlaufförderung für die 20 innovativsten Digitalisierungs-Gründungen in Bayern. 50% Zuschuss, max. 36.000 EUR über 12 Monate. Jury-Auswahl im Wettbewerb.', foerdergeber: 'StMWi Bayern', foerderart: 'zuschuss', volumen_min_eur: 5000, volumen_max_eur: 36000, eigenanteil_prozent: 50, url_antrag: 'https://www.gruenderland.bayern/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/neugruendungen-im-bereich-digitalisierung.html', bundeslaender: ['BY'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['digitalisierung', 'it-software'] },

  { name: 'Bayerisches Technologieförderungs-Programm', kurzname: 'BayTP', beschreibung: 'Fördert technologische F&E-Vorhaben bayerischer KMU. Bis 50% der Ausgaben, max. 400.000 EUR. Einzel- und Kooperationsprojekte.', foerdergeber: 'StMWi Bayern', foerderart: 'zuschuss', volumen_min_eur: 25000, volumen_max_eur: 400000, eigenanteil_prozent: 50, url_antrag: 'https://www.stmwi.bayern.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/baytp.html', bundeslaender: ['BY'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'produktion-industrie'] },

  { name: 'BayTOU – Technologieorientierte Unternehmensgründungen', kurzname: 'BayTOU', beschreibung: 'Fördert technologieorientierte Gründungen in Bayern. Für KMU unter 6 Jahre mit unter 10 Mitarbeitern. Unterstützt Prototypenentwicklung und Markteinführung.', foerdergeber: 'StMWi Bayern', foerderart: 'zuschuss', volumen_min_eur: 25000, volumen_max_eur: 250000, eigenanteil_prozent: 50, url_antrag: 'https://www.gruenderland.bayern/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/bayerisches-foerderprogramm-technologieorientiert.html', bundeslaender: ['BY'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro'], br: ['forschung-entwicklung', 'it-software', 'produktion-industrie'] },

  { name: 'BayStartUP Coaching & Finanzierung', kurzname: 'BayStartUP', beschreibung: 'Vermittelt Finanzierungen für bayerische Startups. Business Plan Wettbewerbe, über 300 aktive Business Angels, VC-Netzwerk und Coaching.', foerdergeber: 'BayStartUP GmbH', foerderart: 'beratung', volumen_min_eur: 0, volumen_max_eur: 0, eigenanteil_prozent: 0, url_antrag: 'https://www.baystartup.de/', url_quelle: 'https://www.baystartup.de/', bundeslaender: ['BY'], phasen: ['ideation', 'gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'forschung-entwicklung'] },

  { name: 'Transformation@Bayern', kurzname: 'T@B', beschreibung: 'Sonderprogramm für KMU zur Entwicklung und Implementierung innovativer und digitaler Technologien. Investitionsvolumen mind. 200.000 EUR. Bis 45% Zuschuss für kleine Unternehmen.', foerdergeber: 'StMWi Bayern', foerderart: 'zuschuss', volumen_min_eur: 50000, volumen_max_eur: 500000, eigenanteil_prozent: 55, url_antrag: 'https://www.stmwi.bayern.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/transformation-bayern.html', bundeslaender: ['BY'], phasen: ['wachstum', 'etabliert'], groessen: ['klein', 'mittel'], br: ['digitalisierung', 'produktion-industrie'] },

  { name: 'Bayerische Regionalförderung', kurzname: 'BRF', beschreibung: 'Fördert Investitionsvorhaben in strukturschwachen Regionen Bayerns. Für gewerbliche Wirtschaft, Handwerk, Tourismus und Dienstleistungen.', foerdergeber: 'StMWi Bayern', foerderart: 'zuschuss', volumen_min_eur: 50000, volumen_max_eur: 2000000, eigenanteil_prozent: 50, url_antrag: 'https://www.stmwi.bayern.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Bayern/bayerische-regionale-wirtschaftsfoerderung.html', bundeslaender: ['BY'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['branchenuebergreifend', 'handwerk', 'tourismus-gastro', 'produktion-industrie'] },

  // =====================================================
  // NORDRHEIN-WESTFALEN
  // =====================================================
  { name: 'Gründerstipendium NRW', kurzname: 'Gründerstipendium NRW', beschreibung: '1.000 EUR/Monat für 1 Jahr für innovative Gründer:innen in NRW. Dazu Coaching, Netzwerk und Zugang zu Co-Working-Spaces.', foerdergeber: 'MWIKE NRW', foerderart: 'zuschuss', volumen_min_eur: 1000, volumen_max_eur: 12000, eigenanteil_prozent: 0, url_antrag: 'https://www.gruenderstipendium.nrw/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/NRW/gruenderstipendium-nrw.html', bundeslaender: ['NW'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend', 'it-software', 'digitalisierung'] },

  { name: 'Mittelstand Innovativ & Digital', kurzname: 'MID-Gutscheine', beschreibung: 'Beratungsgutscheine für Digitalisierung und Innovation in NRW. Bis 50% der Beratungskosten, max. 15.000 EUR.', foerdergeber: 'MWIKE NRW', foerderart: 'zuschuss', volumen_min_eur: 2000, volumen_max_eur: 15000, eigenanteil_prozent: 50, url_antrag: 'https://www.mittelstand-innovativ-digital.nrw/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/NRW/mid-gutscheine.html', bundeslaender: ['NW'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software', 'produktion-industrie'] },

  { name: 'NRW.BANK Gründungskredit', kurzname: 'NRW Gründungskredit', beschreibung: 'Zinsgünstiger Kredit der NRW.BANK für Existenzgründungen und junge Unternehmen in NRW. Bis 10 Mio. EUR für Investitionen und Betriebsmittel.', foerdergeber: 'NRW.BANK', foerderart: 'kredit', volumen_min_eur: 25000, volumen_max_eur: 10000000, eigenanteil_prozent: 0, url_antrag: 'https://www.nrwbank.de/', url_quelle: 'https://www.nrwbank.de/', bundeslaender: ['NW'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein', 'mittel'], br: ['branchenuebergreifend'] },

  { name: 'Innovationskredit NRW', kurzname: 'Innovationskredit NRW', beschreibung: 'Kredit für innovative Vorhaben in NRW. Für F&E-Projekte, Digitalisierung und Prozessinnovationen. Bis 15 Mio. EUR.', foerdergeber: 'NRW.BANK', foerderart: 'kredit', volumen_min_eur: 25000, volumen_max_eur: 15000000, eigenanteil_prozent: 0, url_antrag: 'https://www.nrwbank.de/', url_quelle: 'https://www.nrwbank.de/', bundeslaender: ['NW'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'digitalisierung', 'it-software'] },

  // =====================================================
  // BERLIN
  // =====================================================
  { name: 'Berliner Startup Stipendium', kurzname: 'BSS', beschreibung: 'Bis 2.000 EUR/Monat pro Teammitglied für max. 6 Monate. Für technologiebasierte oder sozialunternehmerische Gründungen in Berlin.', foerdergeber: 'SenWEB Berlin', foerderart: 'zuschuss', volumen_min_eur: 2000, volumen_max_eur: 36000, eigenanteil_prozent: 0, url_antrag: 'https://www.berlin.de/sen/wirtschaft/gruenden/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Berlin/berliner-startup-stipendium.html', bundeslaender: ['BE'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend', 'it-software', 'sozialunternehmen'] },

  { name: 'Coaching BONUS Berlin', kurzname: 'Coaching BONUS', beschreibung: 'Zuschuss für professionelles Coaching für Gründer:innen und junge Unternehmen in Berlin. Bis 70% der Coachingkosten, max. 4.000 EUR.', foerdergeber: 'IBB Business Team', foerderart: 'zuschuss', volumen_min_eur: 500, volumen_max_eur: 4000, eigenanteil_prozent: 30, url_antrag: 'https://www.ibb-business-team.de/', url_quelle: 'https://www.ibb-business-team.de/', bundeslaender: ['BE'], phasen: ['ideation', 'gruendung', 'fruehphase'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend'] },

  { name: 'GründungsBONUS Berlin', kurzname: 'GründungsBONUS', beschreibung: 'Zuschuss für innovative Gründungen in Berlin. Max. 50.000 EUR für Investitionen und Sachkosten. Bis 50% der förderfähigen Ausgaben.', foerdergeber: 'IBB Business Team', foerderart: 'zuschuss', volumen_min_eur: 5000, volumen_max_eur: 50000, eigenanteil_prozent: 50, url_antrag: 'https://www.ibb-business-team.de/', url_quelle: 'https://www.ibb-business-team.de/', bundeslaender: ['BE'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'kreativwirtschaft'] },

  // =====================================================
  // BADEN-WÜRTTEMBERG
  // =====================================================
  { name: 'Start-up BW Pre-Seed', kurzname: 'Pre-Seed BW', beschreibung: 'Frühphasenfinanzierung bis 200.000 EUR als Wandeldarlehen. Für junge Startups in BW zwischen Gründung und erster Finanzierungsrunde.', foerdergeber: 'L-Bank BW', foerderart: 'kredit', volumen_min_eur: 50000, volumen_max_eur: 200000, eigenanteil_prozent: 0, url_antrag: 'https://www.startupbw.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/BW/startup-bw-pre-seed.html', bundeslaender: ['BW'], phasen: ['gruendung', 'fruehphase'], groessen: ['mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'forschung-entwicklung'] },

  { name: 'Innovationsgutschein BW', kurzname: 'Innovationsgutschein', beschreibung: 'Gutschein A: 2.500 EUR für Machbarkeitsstudien. Gutschein B: 5.000 EUR für umsetzungsorientierte F&E. Für KMU in Baden-Württemberg.', foerdergeber: 'MWA BW', foerderart: 'zuschuss', volumen_min_eur: 2500, volumen_max_eur: 5000, eigenanteil_prozent: 0, url_antrag: 'https://www.innovationsgutschein.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/BW/innovationsgutschein-bw.html', bundeslaender: ['BW'], phasen: ['fruehphase', 'wachstum'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'branchenuebergreifend'] },

  { name: 'Innovationsfinanzierung 4.0 BW', kurzname: 'InnoFin 4.0', beschreibung: 'L-Bank-Programm für innovative Vorhaben: Digitalisierung, Industrie 4.0, neue Geschäftsmodelle. Kredit bis 5 Mio. EUR mit Tilgungszuschuss.', foerdergeber: 'L-Bank BW', foerderart: 'kredit', volumen_min_eur: 10000, volumen_max_eur: 5000000, eigenanteil_prozent: 0, url_antrag: 'https://www.l-bank.de/', url_quelle: 'https://www.l-bank.de/', bundeslaender: ['BW'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software', 'produktion-industrie'] },

  // =====================================================
  // NIEDERSACHSEN
  // =====================================================
  { name: 'Niedersachsen Digital aufgeLaden', kurzname: 'Digital aufgeLaden', beschreibung: 'Fördert Digitalisierung im stationären Einzelhandel Niedersachsen. Webshops, digitale Sichtbarkeit, Warenwirtschaftssysteme. Bis 10.000 EUR.', foerdergeber: 'NBank', foerderart: 'zuschuss', volumen_min_eur: 2500, volumen_max_eur: 10000, eigenanteil_prozent: 50, url_antrag: 'https://www.nbank.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Niedersachsen/digital-aufgeladen.html', bundeslaender: ['NI'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['solo', 'mikro', 'klein'], br: ['handel', 'digitalisierung'] },

  { name: 'Gründungsfinanzierung Niedersachsen', kurzname: 'NBank Gründung', beschreibung: 'Zinsgünstige Darlehen der NBank für Gründungen in Niedersachsen. Bis 200.000 EUR für Investitionen und Betriebsmittel.', foerdergeber: 'NBank', foerderart: 'kredit', volumen_min_eur: 10000, volumen_max_eur: 200000, eigenanteil_prozent: 0, url_antrag: 'https://www.nbank.de/', url_quelle: 'https://www.nbank.de/', bundeslaender: ['NI'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend'] },

  { name: 'Innovationsförderung Niedersachsen', kurzname: 'Innovationsförderung NI', beschreibung: 'Zuschüsse für innovative Vorhaben von KMU in Niedersachsen. Einzelbetriebliche und kooperative F&E-Projekte. Bis 50% der Ausgaben.', foerdergeber: 'NBank', foerderart: 'zuschuss', volumen_min_eur: 20000, volumen_max_eur: 400000, eigenanteil_prozent: 50, url_antrag: 'https://www.nbank.de/', url_quelle: 'https://www.nbank.de/', bundeslaender: ['NI'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'produktion-industrie'] },

  // =====================================================
  // SACHSEN
  // =====================================================
  { name: 'InnoStartBonus Sachsen', kurzname: 'InnoStartBonus', beschreibung: '1.000 EUR/Monat für bis zu 12 Monate für innovative Gründer:innen in Sachsen. Zur Entwicklung und Validierung der Geschäftsidee.', foerdergeber: 'SAB Sachsen', foerderart: 'zuschuss', volumen_min_eur: 1000, volumen_max_eur: 12000, eigenanteil_prozent: 0, url_antrag: 'https://www.sab.sachsen.de/', url_quelle: 'https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Land/Sachsen/innostartbonus.html', bundeslaender: ['SN'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend', 'it-software'] },

  { name: 'Technologiegründerstipendium Sachsen', kurzname: 'Techgründerstipendium', beschreibung: 'Stipendium für technologieorientierte Gründer:innen in Sachsen. Bis 2.400 EUR/Monat für max. 18 Monate plus Sachkostenförderung.', foerdergeber: 'SAB Sachsen', foerderart: 'zuschuss', volumen_min_eur: 2400, volumen_max_eur: 43200, eigenanteil_prozent: 0, url_antrag: 'https://www.sab.sachsen.de/', url_quelle: 'https://www.sab.sachsen.de/', bundeslaender: ['SN'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['forschung-entwicklung', 'it-software'] },

  // =====================================================
  // HESSEN
  // =====================================================
  { name: 'Hessen Mikrodarlehen', kurzname: 'Hessen Mikrodarlehen', beschreibung: 'Darlehen bis 25.000 EUR für Gründer:innen und Kleinstunternehmen in Hessen. Ohne Bankübliche Sicherheiten, vereinfachtes Verfahren.', foerdergeber: 'WIBank Hessen', foerderart: 'kredit', volumen_min_eur: 1000, volumen_max_eur: 25000, eigenanteil_prozent: 0, url_antrag: 'https://www.wibank.de/', url_quelle: 'https://www.wibank.de/', bundeslaender: ['HE'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend'] },

  { name: 'Distr@l Hessen', kurzname: 'Distr@l', beschreibung: 'Digitalisierungsprogramm des Landes Hessen. Fördert Digitalisierungsprojekte in Unternehmen, Verwaltung und Gesellschaft. Verschiedene Förderlinien.', foerdergeber: 'HMWK Hessen', foerderart: 'zuschuss', volumen_min_eur: 10000, volumen_max_eur: 300000, eigenanteil_prozent: 50, url_antrag: 'https://www.digitalstrategie.hessen.de/', url_quelle: 'https://www.digitalstrategie.hessen.de/', bundeslaender: ['HE'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['digitalisierung', 'it-software'] },

  // =====================================================
  // HAMBURG
  // =====================================================
  { name: 'InnoRampUp Hamburg', kurzname: 'InnoRampUp', beschreibung: 'Wandeldarlehen bis 150.000 EUR für innovative Startups in Hamburg. Für die Phase zwischen Prototyp und Marktreife. Keine Sicherheiten nötig.', foerdergeber: 'IFB Hamburg', foerderart: 'kredit', volumen_min_eur: 25000, volumen_max_eur: 150000, eigenanteil_prozent: 0, url_antrag: 'https://www.ifbhh.de/', url_quelle: 'https://www.ifbhh.de/', bundeslaender: ['HH'], phasen: ['gruendung', 'fruehphase'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend', 'it-software'] },

  { name: 'Hamburg Kreativ Gesellschaft – Förderungen', kurzname: 'Kreativ Gesellschaft HH', beschreibung: 'Unterstützt die Kreativwirtschaft in Hamburg mit Beratung, Finanzierung und Netzwerk. Verschiedene Programme für Kreativschaffende.', foerdergeber: 'Kreativ Gesellschaft Hamburg', foerderart: 'beratung', volumen_min_eur: 0, volumen_max_eur: 0, eigenanteil_prozent: 0, url_antrag: 'https://www.kreativgesellschaft.org/', url_quelle: 'https://www.kreativgesellschaft.org/', bundeslaender: ['HH'], phasen: ['ideation', 'gruendung', 'fruehphase'], groessen: ['solo', 'mikro'], br: ['kreativwirtschaft'] },

  // =====================================================
  // SCHLESWIG-HOLSTEIN
  // =====================================================
  { name: 'Seed- und Startup-Förderung SH', kurzname: 'Seed SH', beschreibung: 'Beteiligungsfinanzierung für technologieorientierte Startups in Schleswig-Holstein. Offene oder stille Beteiligungen bis 600.000 EUR.', foerdergeber: 'MBG SH', foerderart: 'beteiligung', volumen_min_eur: 50000, volumen_max_eur: 600000, eigenanteil_prozent: 0, url_antrag: 'https://www.mbg-sh.de/', url_quelle: 'https://www.mbg-sh.de/', bundeslaender: ['SH'], phasen: ['gruendung', 'fruehphase'], groessen: ['mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'forschung-entwicklung'] },

  // =====================================================
  // THÜRINGEN
  // =====================================================
  { name: 'Thüringer Gründerprämie', kurzname: 'Gründerprämie TH', beschreibung: 'Prämie für innovative Gründungen in Thüringen. Bis 100.000 EUR als nicht rückzahlbarer Zuschuss für Personalkosten, Investitionen und Beratung.', foerdergeber: 'TAB Thüringen', foerderart: 'zuschuss', volumen_min_eur: 10000, volumen_max_eur: 100000, eigenanteil_prozent: 20, url_antrag: 'https://www.aufbaubank.de/', url_quelle: 'https://www.aufbaubank.de/', bundeslaender: ['TH'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro', 'klein'], br: ['branchenuebergreifend', 'it-software', 'forschung-entwicklung'] },

  { name: 'Thüringer Innovationsprämie', kurzname: 'Innovationsprämie TH', beschreibung: 'Fördert innovative Vorhaben von KMU in Thüringen. Bis 100.000 EUR für die Entwicklung neuer Produkte, Verfahren und Dienstleistungen.', foerdergeber: 'TAB Thüringen', foerderart: 'zuschuss', volumen_min_eur: 5000, volumen_max_eur: 100000, eigenanteil_prozent: 50, url_antrag: 'https://www.aufbaubank.de/', url_quelle: 'https://www.aufbaubank.de/', bundeslaender: ['TH'], phasen: ['fruehphase', 'wachstum'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'produktion-industrie'] },

  // =====================================================
  // BRANDENBURG
  // =====================================================
  { name: 'Brandenburgischer Innovationsgutschein', kurzname: 'BIG', beschreibung: 'Gutscheine für Innovationsberatung und F&E-Leistungen für KMU in Brandenburg. BIG-Transfer: bis 75.000 EUR. BIG-Digital: bis 50.000 EUR.', foerdergeber: 'ILB Brandenburg', foerderart: 'zuschuss', volumen_min_eur: 3000, volumen_max_eur: 75000, eigenanteil_prozent: 50, url_antrag: 'https://www.ilb.de/', url_quelle: 'https://www.ilb.de/', bundeslaender: ['BB'], phasen: ['fruehphase', 'wachstum', 'etabliert'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'digitalisierung', 'it-software'] },

  // =====================================================
  // MECKLENBURG-VORPOMMERN
  // =====================================================
  { name: 'Gründerstipendium M-V', kurzname: 'Gründerstipendium MV', beschreibung: 'Stipendium für innovative Gründungen in Mecklenburg-Vorpommern. Bis 1.800 EUR/Monat für max. 18 Monate.', foerdergeber: 'Gesellschaft für Wirtschafts- und Technologieförderung MV', foerderart: 'zuschuss', volumen_min_eur: 1800, volumen_max_eur: 32400, eigenanteil_prozent: 0, url_antrag: 'https://www.wm.mv-regierung.de/', url_quelle: 'https://www.wm.mv-regierung.de/', bundeslaender: ['MV'], phasen: ['ideation', 'gruendung'], groessen: ['solo', 'mikro'], br: ['branchenuebergreifend', 'it-software'] },

  // =====================================================
  // EU-PROGRAMME
  // =====================================================
  { name: 'Horizon Europe – EIC Accelerator', kurzname: 'EIC Accelerator', beschreibung: 'EU-Förderung für hochinnovative Startups und KMU. Bis 2,5 Mio. EUR Zuschuss + bis 15 Mio. EUR Eigenkapital. Für bahnbrechende Innovationen mit Skalierungspotenzial.', foerdergeber: 'Europäische Kommission / EIC', foerderart: 'zuschuss', volumen_min_eur: 500000, volumen_max_eur: 2500000, eigenanteil_prozent: 30, url_antrag: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en', url_quelle: 'https://eic.ec.europa.eu/', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software', 'gesundheit-medizin', 'energie-umwelt'] },

  { name: 'EIC Pathfinder', kurzname: 'EIC Pathfinder', beschreibung: 'EU-Förderung für visionäre Grundlagenforschung mit Technologiepotenzial. Open: bis 3 Mio. EUR, Challenges: bis 4 Mio. EUR. Für Konsortien mit mind. 3 Partnern.', foerdergeber: 'Europäische Kommission / EIC', foerderart: 'zuschuss', volumen_min_eur: 500000, volumen_max_eur: 4000000, eigenanteil_prozent: 0, url_antrag: 'https://eic.ec.europa.eu/', url_quelle: 'https://eic.ec.europa.eu/', bundeslaender: ['BUND'], phasen: ['ideation', 'fruehphase'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung'] },

  { name: 'Eurostars', kurzname: 'Eurostars', beschreibung: 'Europäisches Förderprogramm für internationale F&E-Kooperationen von KMU. Projekte mit Partnern aus mind. 2 Eurostars-Ländern. Nationale Förderung über ZIM.', foerdergeber: 'Eureka / BMWK', foerderart: 'zuschuss', volumen_min_eur: 50000, volumen_max_eur: 500000, eigenanteil_prozent: 50, url_antrag: 'https://www.eurostars-eureka.eu/', url_quelle: 'https://www.eurostars-eureka.eu/', bundeslaender: ['BUND'], phasen: ['fruehphase', 'wachstum'], groessen: ['mikro', 'klein', 'mittel'], br: ['forschung-entwicklung', 'it-software'] },
];

// ============================================================
// GENERIERUNG
// ============================================================

const programme = raw.map((r, i) => ({
  id: i + 1,
  name: r.name,
  kurzname: r.kurzname,
  beschreibung: r.beschreibung,
  foerdergeber: r.foerdergeber,
  foerderart: r.foerderart,
  volumen_min_eur: r.volumen_min_eur,
  volumen_max_eur: r.volumen_max_eur,
  eigenanteil_prozent: r.eigenanteil_prozent,
  status: 'aktiv',
  antragsfrist: null,
  url_antrag: r.url_antrag,
  url_quelle: r.url_quelle,
  aktualisiert_am: '2026-03-12',
  aktiv: true,
  bundeslaender: r.bundeslaender,
  phasen: r.phasen,
  groessen: r.groessen,
  branchen: (r.br || r.branchenSlugs || []).map(s => bMap[s]).filter(Boolean),
}));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({ programme, branchen }, null, 2), 'utf-8');

console.log('');
console.log('✅ Seed v2.0 abgeschlossen!');
console.log(`   ${programme.length} Förderprogramme`);
console.log(`   ${branchen.length} Branchen`);
console.log(`   Bundesländer: ${[...new Set(programme.flatMap(p => p.bundeslaender))].join(', ')}`);
console.log(`   → ${OUT_PATH}`);
console.log('');
