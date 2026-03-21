import Header from '../components/Header';
import Footer from '../components/Footer';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

export const metadata = {
  title: 'Impressum',
  description: 'Impressum und Anbieterkennzeichnung gemäß § 5 TMG für Förderly.',
  alternates: {
    canonical: 'https://foerderly.com/impressum',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const BREADCRUMBS = [
  { name: 'Startseite', url: 'https://foerderly.com' },
  { name: 'Impressum', url: 'https://foerderly.com/impressum' },
];

export default function Impressum() {
  return (
    <main className="min-h-screen relative z-10">
      <BreadcrumbSchema items={BREADCRUMBS} />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Impressum</h1>

        <div className="space-y-6">

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Angaben gemäß § 5 TMG</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <strong>Anton Mishchenko</strong><br />
              Augartenweg 16<br />
              87437 Kempten (Allgäu)<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Kontakt</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              E-Mail: <a href="mailto:anton.mischenko321@proton.me" className="text-[var(--accent-text)] hover:text-[var(--accent-text)]">anton.mischenko321@proton.me</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Anton Mishchenko<br />
              Augartenweg 16<br />
              87437 Kempten (Allgäu)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">EU-Streitschlichtung</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-text)]">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Haftung für Inhalte</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Haftung für Links</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Hinweis zu Förderprogrammen</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die auf dieser Website dargestellten Informationen zu Förderprogrammen basieren auf
              öffentlich zugänglichen Daten der Förderdatenbank des Bundes (foerderdatenbank.de) und
              weiteren offiziellen Quellen. Wir bemühen uns um Richtigkeit und Aktualität der
              Informationen, übernehmen jedoch keine Gewähr für Vollständigkeit, Richtigkeit oder
              Aktualität der dargestellten Förderprogramme. Die Informationen stellen keine Beratung
              dar. Für verbindliche Auskünfte wenden Sie sich bitte direkt an den jeweiligen Fördergeber.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Urheberrecht</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

        </div>
        <Footer />
      </div>
    </main>
  );
}
