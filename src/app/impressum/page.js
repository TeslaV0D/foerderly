import Header from '../components/Header';
import Footer from '../components/Footer';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

export const metadata = {
  title: 'Impressum',
  description: 'Impressum und Anbieterkennzeichnung gemäß § 5 TMG für Förderly.',
  alternates: { canonical: 'https://foerderly.com/impressum' },
  robots: { index: true, follow: true },
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
        <h1
          style={{
            fontSize: 'clamp(32px, 4.5vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            color: 'var(--text)',
            marginBottom: 32,
          }}
        >
          Impressum
        </h1>

        <article
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}
        >
          <Section title="Angaben gemäß § 5 TMG">
            <strong>Anton Mishchenko</strong>
            <br />
            Augartenweg 16
            <br />
            87437 Kempten (Allgäu)
            <br />
            Deutschland
          </Section>

          <Section title="Kontakt">
            E-Mail:{' '}
            <a href="mailto:anton.mischenko321@proton.me" style={{ color: 'var(--accent)' }}>
              anton.mischenko321@proton.me
            </a>
          </Section>

          <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
            Anton Mishchenko
            <br />
            Augartenweg 16
            <br />
            87437 Kempten (Allgäu)
          </Section>

          <Section title="EU-Streitschlichtung">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </Section>

          <Section title="Haftung für Inhalte">
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p style={{ marginTop: 12 }}>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </Section>

          <Section title="Haftung für Links">
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
            <p style={{ marginTop: 12 }}>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
              nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </Section>

          <Section title="Hinweis zu Förderprogrammen">
            Die auf dieser Website dargestellten Informationen zu Förderprogrammen basieren auf öffentlich zugänglichen Daten der
            Förderdatenbank des Bundes (foerderdatenbank.de) und weiteren offiziellen Quellen. Wir bemühen uns um Richtigkeit und
            Aktualität der Informationen, übernehmen jedoch keine Gewähr für Vollständigkeit, Richtigkeit oder Aktualität der
            dargestellten Förderprogramme. Die Informationen stellen keine Beratung dar. Für verbindliche Auskünfte wenden Sie sich bitte
            direkt an den jeweiligen Fördergeber.
          </Section>

          <Section title="Urheberrecht">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </Section>
        </article>

        <Footer />
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '-0.3px',
          color: 'var(--text)',
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--muted)' }}>{children}</div>
    </section>
  );
}
