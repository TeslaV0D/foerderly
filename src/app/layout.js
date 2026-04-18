// src/app/layout.js
import './globals.css';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
import WebsiteSchema from './components/WebsiteSchema';
import CommandPalette from './components/CommandPalette';
import PageLoader from './components/PageLoader';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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

  metadataBase: new URL('https://foerderly.com'),
  authors: [{ name: 'Förderly' }],
  creator: 'Förderly',
  publisher: 'Förderly',
  category: 'finance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <WebsiteSchema />

        <div className="mesh" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>

        <ErrorBoundary>{children}</ErrorBoundary>
        <CommandPalette />
      </body>
    </html>
  );
}
