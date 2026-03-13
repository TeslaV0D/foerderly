import './globals.css';
import { IBM_Plex_Sans } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: 'Förderly – Fördermittel für dein Vorhaben',
  description: 'Finde in Sekunden die passenden Förderprogramme für dein Unternehmen. Über 2.000 Programme von Bund, Ländern und EU.',
  openGraph: {
    title: 'Förderly – Fördermittel für dein Vorhaben',
    description: 'Finde in Sekunden die passenden Förderprogramme. Bund, Länder und EU – alles an einem Ort.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://foerderly.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={ibmPlexSans.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
