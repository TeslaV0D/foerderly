import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Förderquellen – Förderly',
  description: 'Übersicht aller Förderquellen: Bund, Landesförderbanken und EU-Programme.',
};

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
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Förderquellen
        </h2>
        <p className="text-sm sm:text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
          Alle Quellen und Förderinstitutionen auf einen Blick. Direkt zu den Originalseiten.
        </p>

        {Object.entries(QUELLEN).map(([key, section]) => (
          <section key={key} className="mb-12">
            <div className="mb-5">
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {section.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{section.desc}</p>
            </div>

            <div className={`grid gap-3 ${key === 'laender' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {section.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {source.name}
                      </h4>
                      {source.tag && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ background: 'var(--accent-muted)', color: 'var(--accent-text)' }}>
                          {source.tag}
                        </span>
                      )}
                      {source.region && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }}>
                          {source.region}
                        </span>
                      )}
                    </div>
                    {source.desc && (
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {source.desc}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-text)' }}>
                    Zur Website
                    <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        <Footer />
      </div>
    </main>
  );
}
