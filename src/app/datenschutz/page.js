import Header from '../components/Header';
import Footer from '../components/Footer';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

export const metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung gemäß DSGVO für Förderly. Keine Cookies, kein Tracking, keine Nutzerkonten.',
  alternates: {
    canonical: 'https://foerderly.com/datenschutz',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const BREADCRUMBS = [
  { name: 'Startseite', url: 'https://foerderly.com' },
  { name: 'Datenschutz', url: 'https://foerderly.com/datenschutz' },
];

export default function Datenschutz() {
  return (
    <main className="min-h-screen relative z-10">
      <BreadcrumbSchema items={BREADCRUMBS} />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Datenschutzerklärung</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Stand: März 2026</p>

        <div className="space-y-6">

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Datenschutz auf einen Blick</h2>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Allgemeine Hinweise</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
              sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Datenerfassung auf dieser Website</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
              Kontaktdaten können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser
              Datenschutzerklärung entnehmen.
            </p>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Diese Website speichert keine personenbezogenen Daten. Wir verwenden keine Cookies,
              kein Tracking, keine Analytics und keine Nutzerkonten. Ihre Suchanfragen werden
              ausschließlich in Echtzeit verarbeitet und nicht gespeichert.
            </p>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst.
              Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit
              des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese
              Website betreten.
            </p>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Die technischen Daten werden erhoben, um die fehlerfreie Bereitstellung der Website
              sicherzustellen. Eine Auswertung dieser Daten zu Marketingzwecken findet nicht statt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Hosting</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Wir hosten die Inhalte unserer Website bei Vercel Inc., 440 N Barranca Ave #4133,
              Covina, CA 91723, USA.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Wenn Sie unsere Website besuchen, erfasst Vercel als Hoster verschiedene Logfiles
              inklusive Ihrer IP-Adressen. Details entnehmen Sie der Datenschutzerklärung von Vercel:{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-text)]">
                https://vercel.com/legal/privacy-policy
              </a>
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Allgemeine Hinweise und Pflichtinformationen</h2>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Hinweis zur verantwortlichen Stelle</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong>Anton Mishchenko</strong><br />
              Augartenweg 16<br />
              87437 Kempten (Allgäu)<br />
              Deutschland<br /><br />
              E-Mail: anton.mischenko321@proton.me
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich.
              Sie können eine bereits erteilte Einwilligung jederzeit widerrufen.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
              einer Aufsichtsbehörde zu.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Auskunft, Löschung und Berichtigung</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
              personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung
              und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Datenerfassung auf dieser Website</h2>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Server-Log-Dateien</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
              Browsertyp und -version, verwendetes Betriebssystem, Referrer URL, Hostname des
              zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Cookies</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Diese Website verwendet keine Cookies. Es werden keine Tracking-Cookies, Analyse-Cookies
              oder sonstige Cookies auf Ihrem Gerät gespeichert.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Analyse-Tools und Tracking</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Diese Website verwendet keine Analyse-Tools oder Tracking-Dienste.
            </p>

            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-1">Suchanfragen</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Wenn Sie die Suchfunktion auf unserer Website nutzen, werden Ihre Filtereinstellungen
              und Suchbegriffe ausschließlich in Echtzeit verarbeitet. Diese Daten werden nicht
              gespeichert, nicht protokolliert und nicht an Dritte weitergegeben.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Externe Links</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Unsere Website enthält Links zu externen Websites. Beim Anklicken dieser Links verlassen
              Sie unsere Website. Wir haben keinen Einfluss auf die Datenverarbeitungspraktiken
              dieser externen Anbieter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Schriftarten</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Diese Website verwendet die Schriftart „IBM Plex Sans". Die Schriftart wird lokal
              von unseren eigenen Servern geladen (Self-Hosting). Es findet keine Verbindung zu
              externen Servern wie Google statt.
            </p>
          </section>

        </div>
        <Footer />
      </div>
    </main>
  );
}
