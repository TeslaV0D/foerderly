import Header from '../components/Header';
import Footer from '../components/Footer';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

export const metadata = {
  title: 'Datenschutzerklärung',
  description:
    'Datenschutzerklärung gemäß DSGVO für Förderly. Keine Cookies, kein Tracking, keine Nutzerkonten.',
  alternates: { canonical: 'https://foerderly.com/datenschutz' },
  robots: { index: true, follow: true },
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
        <h1
          style={{
            fontSize: 'clamp(32px, 4.5vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          Datenschutz<span className="gradient-text">erklärung</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Stand: April 2026</p>

        <article
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}
        >
          <Section title="1. Datenschutz auf einen Blick">
            <SubHeading>Allgemeine Hinweise</SubHeading>
            <P>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie
              diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </P>

            <SubHeading>Datenerfassung auf dieser Website</SubHeading>
            <P>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
              <br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt
              „Hinweis zur verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
            </P>
            <P>
              <strong>Wie erfassen wir Ihre Daten?</strong>
              <br />
              Diese Website speichert keine personenbezogenen Daten. Wir verwenden keine Cookies, kein Tracking, keine Analytics und
              keine Nutzerkonten. Ihre Suchanfragen werden ausschließlich in Echtzeit verarbeitet und nicht gespeichert.
            </P>
            <P>
              Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische
              Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </P>
            <P>
              <strong>Wofür nutzen wir Ihre Daten?</strong>
              <br />
              Die technischen Daten werden erhoben, um die fehlerfreie Bereitstellung der Website sicherzustellen. Eine Auswertung dieser
              Daten zu Marketingzwecken findet nicht statt.
            </P>
          </Section>

          <Section title="2. Hosting">
            <P>Wir hosten die Inhalte unserer Website bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</P>
            <P>
              Wenn Sie unsere Website besuchen, erfasst Vercel als Hoster verschiedene Logfiles inklusive Ihrer IP-Adressen. Details
              entnehmen Sie der Datenschutzerklärung von Vercel:{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)' }}
              >
                https://vercel.com/legal/privacy-policy
              </a>
            </P>
            <P>
              Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Die Datenübertragung in die USA wird auf
              die Standardvertragsklauseln der EU-Kommission gestützt.
            </P>
          </Section>

          <Section title="3. Allgemeine Hinweise und Pflichtinformationen">
            <SubHeading>Hinweis zur verantwortlichen Stelle</SubHeading>
            <P>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</P>
            <P>
              <strong>Anton Mishchenko</strong>
              <br />
              Augartenweg 16
              <br />
              87437 Kempten (Allgäu)
              <br />
              Deutschland
              <br />
              <br />
              E-Mail: anton.mischenko321@proton.me
            </P>

            <SubHeading>Widerruf Ihrer Einwilligung zur Datenverarbeitung</SubHeading>
            <P>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte
              Einwilligung jederzeit widerrufen.
            </P>

            <SubHeading>Beschwerderecht bei der zuständigen Aufsichtsbehörde</SubHeading>
            <P>
              Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde zu.
            </P>

            <SubHeading>Auskunft, Löschung und Berichtigung</SubHeading>
            <P>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft
              und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
            </P>
          </Section>

          <Section title="4. Datenerfassung auf dieser Website">
            <SubHeading>Server-Log-Dateien</SubHeading>
            <P>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser
              automatisch an uns übermittelt. Dies sind: Browsertyp und -version, verwendetes Betriebssystem, Referrer URL, Hostname des
              zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
            </P>
            <P>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung erfolgt auf Grundlage von
              Art. 6 Abs. 1 lit. f DSGVO.
            </P>

            <SubHeading>Cookies</SubHeading>
            <P>
              Diese Website verwendet keine Cookies. Es werden keine Tracking-Cookies, Analyse-Cookies oder sonstige Cookies auf Ihrem
              Gerät gespeichert.
            </P>

            <SubHeading>Analyse-Tools und Tracking</SubHeading>
            <P>Diese Website verwendet keine Analyse-Tools oder Tracking-Dienste.</P>

            <SubHeading>Suchanfragen</SubHeading>
            <P>
              Wenn Sie die Suchfunktion auf unserer Website nutzen, werden Ihre Filtereinstellungen und Suchbegriffe ausschließlich in
              Echtzeit verarbeitet. Diese Daten werden nicht gespeichert, nicht protokolliert und nicht an Dritte weitergegeben.
            </P>
          </Section>

          <Section title="5. Externe Links">
            <P>
              Unsere Website enthält Links zu externen Websites. Beim Anklicken dieser Links verlassen Sie unsere Website. Wir haben
              keinen Einfluss auf die Datenverarbeitungspraktiken dieser externen Anbieter.
            </P>
          </Section>

          <Section title="6. Schriftarten">
            <P>
              Diese Website verwendet die Schriftart „Plus Jakarta Sans". Die Schriftart wird über next/font lokal eingebunden – es
              findet keine Verbindung zu externen Servern wie Google Fonts statt.
            </P>
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
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.4px',
          color: 'var(--text)',
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </section>
  );
}

function SubHeading({ children }) {
  return (
    <h3
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text)',
        marginTop: 8,
        marginBottom: 0,
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }) {
  return <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--muted)' }}>{children}</p>;
}
