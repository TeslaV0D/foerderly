import Link from 'next/link';

export const metadata = {
  title: 'Impressum – Förderly',
  description: 'Impressum und Anbieterkennzeichnung gemäß § 5 TMG.',
};

export default function Impressum() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Suche
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-display text-3xl text-stone-900 mb-8">Impressum</h1>

        <div className="prose prose-stone prose-sm max-w-none space-y-6">

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Angaben gemäß § 5 TMG</h2>
            <p className="text-stone-600 leading-relaxed">
              {/* ========== HIER DEINE DATEN EINTRAGEN ========== */}
              <strong>[VORNAME NACHNAME]</strong><br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Kontakt</h2>
            <p className="text-stone-600 leading-relaxed">
              E-Mail: <a href="mailto:[DEINE-EMAIL]" className="text-green-700 hover:text-green-800">[DEINE-EMAIL]</a>
            </p>
            {/*
              Falls du eine Telefonnummer angeben möchtest (optional, aber empfohlen):
              <p className="text-stone-600">Telefon: [DEINE TELEFONNUMMER]</p>
            */}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p className="text-stone-600 leading-relaxed">
              [VORNAME NACHNAME]<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">EU-Streitschlichtung</h2>
            <p className="text-stone-600 leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Haftung für Inhalte</h2>
            <p className="text-stone-600 leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Haftung für Links</h2>
            <p className="text-stone-600 leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
              mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Hinweis zu Förderprogrammen</h2>
            <p className="text-stone-600 leading-relaxed">
              Die auf dieser Website dargestellten Informationen zu Förderprogrammen basieren auf
              öffentlich zugänglichen Daten der Förderdatenbank des Bundes (foerderdatenbank.de) und
              weiteren offiziellen Quellen. Wir bemühen uns um Richtigkeit und Aktualität der
              Informationen, übernehmen jedoch keine Gewähr für Vollständigkeit, Richtigkeit oder
              Aktualität der dargestellten Förderprogramme. Die Informationen stellen keine Beratung
              dar. Für verbindliche Auskünfte wenden Sie sich bitte direkt an den jeweiligen Fördergeber.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800 mb-2">Urheberrecht</h2>
            <p className="text-stone-600 leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
