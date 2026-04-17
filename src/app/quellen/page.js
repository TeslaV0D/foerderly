import Header from '../components/Header';
import Footer from '../components/Footer';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import FAQSchema from '../components/FAQSchema';

export const metadata = {
  title: 'Förderquellen – Förderdatenbanken, Landesförderbanken & EU-Programme',
  description:
    'Alle Förderquellen auf einen Blick: Förderdatenbank des Bundes, KfW, BAFA, EXIST, 16 Landesförderbanken und EU-Programme wie EIC Accelerator und Horizon Europe.',
  alternates: {
    canonical: 'https://foerderly.com/quellen',
  },
  openGraph: {
    title: 'Förderquellen – Förderdatenbanken, Landesförderbanken & EU-Programme',
    description:
      'Übersicht aller Förderquellen: Bund, Landesförderbanken und EU-Programme. Direkt zu den Originalseiten.',
    url: 'https://foerderly.com/quellen',
  },
};

const BREADCRUMBS = [
  { name: 'Startseite', url: 'https://foerderly.com' },
  { name: 'Quellen', url: 'https://foerderly.com/quellen' },
];

const FAQS = [
  {
    question: 'Was ist die Förderdatenbank des Bundes?',
    answer:
      'Die Förderdatenbank des Bundes (foerderdatenbank.de) ist die zentrale Anlaufstelle für über 2.000 Förderprogramme von Bund, Ländern und der EU. Sie wird vom Bundesministerium für Wirtschaft und Klimaschutz (BMWK) betrieben.',
  },
  {
    question: 'Welche Förderprogramme gibt es für Gründer?',
    answer:
      'Zu den wichtigsten Programmen zählen das EXIST-Gründerstipendium (bis 3.000 EUR/Monat), der Gründungszuschuss der Arbeitsagentur, der KfW-StartGeld-Kredit (bis 125.000 EUR) und zahlreiche Landesprogramme wie das Gründerstipendium NRW oder BayTOU in Bayern.',
  },
  {
    question: 'Was ist der Unterschied zwischen Zuschuss und Förderkredit?',
    answer:
      'Ein Zuschuss ist Geld, das nicht zurückgezahlt werden muss. Ein Förderkredit ist ein zinsgünstiges Darlehen, das zurückgezahlt werden muss – aber oft mit besseren Konditionen als Bankkredite, z.B. KfW-Kredite mit Haftungsfreistellung.',
  },
  {
    question: 'Was macht die KfW Bankengruppe?',
    answer:
      'Die KfW (Kreditanstalt für Wiederaufbau) ist Deutschlands größte Förderbank. Sie vergibt zinsgünstige Kredite für Gründungen, Innovationen, Energieeffizienz und Wohnungsbau – z.B. den ERP-Gründerkredit StartGeld bis 125.000 EUR.',
  },
  {
    question: 'Welche EU-Förderprogramme gibt es für Startups?',
    answer:
      'Die wichtigsten sind der EIC Accelerator (bis 2,5 Mio. EUR Zuschuss + 15 Mio. EUR Eigenkapital), Horizon Europe für Forschungsprojekte, Eurostars für internationale F&E-Kooperationen und der ESF Plus für Beschäftigung und Bildung.',
  },
  {
    question: 'Was ist BAFA-Beratungsförderung?',
    answer:
      'Das BAFA (Bundesamt für Wirtschaft und Ausfuhrkontrolle) fördert Unternehmensberatungen für KMU. Junge Unternehmen bis 2 Jahre erhalten bis 80% der Beratungskosten erstattet, Bestandsunternehmen bis 50%.',
  },
];

const QUELLEN = {
  bund: {
    title: 'Bund',
    desc: 'Zentrale Förderstellen des Bundes',
    sources: [
      { name: 'Förderdatenbank des Bundes', url: 'https://www.foerderdatenbank.de', desc: 'Über 2.000 Programme von Bund, Ländern und EU – die zentrale Anlaufstelle.', tag: 'Hauptquelle' },
      { name: 'KfW Bankengruppe', url: 'https://www.kfw.de', desc: 'Förderkredite und Zuschüsse für Gründung, Innovation, Energie und Wohnen.' },
      { name: 'BAFA', url: 'https://www.bafa.de', desc: 'Zuschüsse für Beratung, Energie, Außenwirtschaft und Innovation.' },
      { name: 'EXIST – Gründungsförderung', url: 'https://www.exist.de', desc: 'Stipendien und Forschungstransfer für Gründungen aus der Wissenschaft.' },
      { name: 'ZIM – Innovationsprogramm Mittelstand', url: 'https://www.zim.de', desc: 'F&E-Förderung für KMU: Einzelprojekte, Kooperationen, Netzwerke.' },
      { name: 'Bundesagentur für Arbeit', url: 'https://www.arbeitsagentur.de', desc: 'Gründungszuschuss und Einstiegsgeld für Gründungen aus der Arbeitslosigkeit.' },
    ],
  },
  laender: {
    title: 'Landesförderbanken',
    desc: 'Jedes Bundesland hat eine eigene Förderbank mit regionalen Programmen',
    sources: [
      { name: 'LfA Förderbank Bayern', url: 'https://www.lfa.de', region: 'BY' },
      { name: 'L-Bank Baden-Württemberg', url: 'https://www.l-bank.de', region: 'BW' },
      { name: 'IBB Investitionsbank Berlin', url: 'https://www.ibb.de', region: 'BE' },
      { name: 'ILB Brandenburg', url: 'https://www.ilb.de', region: 'BB' },
      { name: 'BAB Bremer Aufbau-Bank', url: 'https://www.bab-bremen.de', region: 'HB' },
      { name: 'IFB Hamburg', url: 'https://www.ifbhh.de', region: 'HH' },
      { name: 'WIBank Hessen', url: 'https://www.wibank.de', region: 'HE' },
      { name: 'LFI Mecklenburg-Vorpommern', url: 'https://www.lfi-mv.de', region: 'MV' },
      { name: 'NBank Niedersachsen', url: 'https://www.nbank.de', region: 'NI' },
      { name: 'NRW.BANK', url: 'https://www.nrwbank.de', region: 'NW' },
      { name: 'ISB Rheinland-Pfalz', url: 'https://www.isb.rlp.de', region: 'RP' },
      { name: 'SIKB Saarland', url: 'https://www.sikb.de', region: 'SL' },
      { name: 'SAB Sachsen', url: 'https://www.sab.sachsen.de', region: 'SN' },
      { name: 'IB Sachsen-Anhalt', url: 'https://www.ib-sachsen-anhalt.de', region: 'ST' },
      { name: 'IB.SH Schleswig-Holstein', url: 'https://www.ib-sh.de', region: 'SH' },
      { name: 'TAB Thüringen', url: 'https://www.aufbaubank.de', region: 'TH' },
    ],
  },
  eu: {
    title: 'EU-Programme',
    desc: 'Europäische Förderprogramme für Innovation, Forschung und Entwicklung',
    sources: [
      { name: 'EIC Accelerator', url: 'https://eic.ec.europa.eu', desc: 'Bis 2,5 Mio. EUR Zuschuss + 15 Mio. EUR Eigenkapital für hochinnovative Startups.' },
      { name: 'Horizon Europe', url: 'https://www.horizont-europa.de', desc: 'Größtes Forschungs- und Innovationsprogramm der EU.' },
      { name: 'ESF Plus', url: 'https://www.esf.de', desc: 'Förderprogramme für Beschäftigung, Bildung und soziale Integration.' },
      { name: 'Eurostars', url: 'https://www.eurostars-eureka.eu', desc: 'Internationale F&E-Kooperationen für KMU.' },
      { name: 'EU-Förderprogramme Übersicht', url: 'https://commission.europa.eu/funding-tenders/find-funding/eu-funding-programmes_en', desc: 'Vollständige Übersicht aller EU-Förderprogramme.' },
    ],
  },
};

export default function Quellen() {
  return (
    <main className="min-h-screen relative z-10">
      {/* Structured Data */}
      <BreadcrumbSchema items={BREADCRUMBS} />
      <FAQSchema faqs={FAQS} />

      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <h1
          style={{
            fontSize: 'clamp(32px, 4.5vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          Förder<span className="gradient-text">quellen</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            fontWeight: 300,
            color: 'var(--muted)',
            marginBottom: 48,
            maxWidth: 560,
            lineHeight: 1.55,
          }}
        >
          Alle Quellen und Förderinstitutionen auf einen Blick. Direkt zu den Originalseiten.
        </p>

        {Object.entries(QUELLEN).map(([key, section]) => (
          <section key={key} style={{ marginBottom: 48 }}>
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: 'var(--text)',
                  marginBottom: 6,
                }}
              >
                {section.title}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>{section.desc}</p>
            </div>

            <div
              className={key === 'laender' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 sm:grid-cols-2'}
              style={{ gap: 14 }}
            >
              {section.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quellen-card"
                  style={{
                    background: 'var(--bg2)',
                    border: '1.5px solid var(--border2)',
                    borderRadius: 'var(--radius)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                        {source.name}
                      </h3>
                      {source.tag && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 100,
                            background: 'color-mix(in oklch, var(--accent) 14%, transparent)',
                            color: 'var(--accent)',
                            flexShrink: 0,
                          }}
                        >
                          {source.tag}
                        </span>
                      )}
                      {source.region && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 100,
                            background: 'color-mix(in oklch, var(--accent2) 14%, transparent)',
                            color: 'var(--accent2)',
                            flexShrink: 0,
                          }}
                        >
                          {source.region}
                        </span>
                      )}
                    </div>
                    {source.desc && (
                      <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--muted)' }}>{source.desc}</p>
                    )}
                  </div>
                  <div
                    className="quellen-arrow"
                    style={{
                      marginTop: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      transition: 'gap 0.2s',
                    }}
                  >
                    Zur Website
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        <style>{`
          .quellen-card:hover { border-color: color-mix(in oklch, var(--accent) 35%, var(--border2)); transform: translateY(-2px); }
          .quellen-card:hover .quellen-arrow { gap: 8px; }
        `}</style>

        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'var(--text)',
              marginBottom: 16,
            }}
          >
            Häufige Fragen zu Fördermitteln
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group"
                style={{
                  background: 'var(--bg2)',
                  border: '1.5px solid var(--border2)',
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    listStyle: 'none',
                  }}
                >
                  {faq.question}
                  <svg
                    className="group-open:rotate-180"
                    style={{ color: 'var(--muted)', flexShrink: 0, transition: 'transform 0.2s' }}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
