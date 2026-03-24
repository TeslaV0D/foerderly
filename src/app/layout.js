import './globals.css';
import { IBM_Plex_Sans } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';
import WebsiteSchema from './components/WebsiteSchema';
import CommandPalette from './components/CommandPalette';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  // ─── Basis ───
  title: {
    default: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    template: '%s | Förderly',
  },
  description:
    'Finde in Sekunden die passenden Förderprogramme für dein Unternehmen. Über 2.000 Programme von Bund, Ländern und EU – kostenlos, ohne Anmeldung.',
  keywords: [
    'Fördermittel',
    'Förderprogramme',
    'Zuschuss',
    'Gründer',
    'Startup Förderung',
    'KMU Förderung',
    'KfW Kredit',
    'BAFA Zuschuss',
    'EXIST Stipendium',
    'Förderdatenbank',
    'Gründungszuschuss',
    'Landesförderung',
    'EU Förderung',
    'Startup finanzieren',
    'Fördermittel Deutschland',
  ],

  // ─── Canonical ───
  alternates: {
    canonical: 'https://foerderly.com',
  },

  // ─── Open Graph ───
  openGraph: {
    title: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    description:
      'Finde in Sekunden die passenden Förderprogramme. Bund, Länder und EU – alles an einem Ort. Kostenlos, ohne Anmeldung.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://foerderly.com',
    siteName: 'Förderly',
  },

  // ─── Twitter Cards ───
  twitter: {
    card: 'summary',
    title: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    description:
      'Über 2.000 Förderprogramme von Bund, Ländern und EU. Kostenlos durchsuchen.',
  },

  // ─── Robots ───
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ─── Weitere Meta ───
  metadataBase: new URL('https://foerderly.com'),
  authors: [{ name: 'Förderly' }],
  creator: 'Förderly',
  publisher: 'Förderly',
  category: 'finance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={ibmPlexSans.variable} suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* JSON-LD Structured Data (global) */}
        <WebsiteSchema />

        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
          {/* Cmd+K Global Search */}
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
