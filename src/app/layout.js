// src/app/layout.js
// Fix 12: Favicon-Icons registriert, Tab-Title Format
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
  title: {
    default: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    template: 'Förderly – %s',
  },
  description:
    'Finde in Sekunden die passenden Förderprogramme für dein Unternehmen. Über 2.000 Programme von Bund, Ländern und EU – kostenlos, ohne Anmeldung.',
  keywords: [
    'Fördermittel', 'Förderprogramme', 'Zuschuss', 'Gründer',
    'Startup Förderung', 'KMU Förderung', 'KfW Kredit', 'BAFA Zuschuss',
    'EXIST Stipendium', 'Förderdatenbank', 'Gründungszuschuss',
    'Landesförderung', 'EU Förderung', 'Startup finanzieren',
    'Fördermittel Deutschland',
  ],

  alternates: { canonical: 'https://foerderly.com' },

  openGraph: {
    title: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    description: 'Finde in Sekunden die passenden Förderprogramme. Bund, Länder und EU – alles an einem Ort.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://foerderly.com',
    siteName: 'Förderly',
  },

  twitter: {
    card: 'summary',
    title: 'Förderly – Fördermittel für Gründer, Startups & KMU',
    description: 'Über 2.000 Förderprogramme von Bund, Ländern und EU. Kostenlos durchsuchen.',
  },

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

  // Fix 12: Favicon-Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },

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
        <WebsiteSchema />
        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
