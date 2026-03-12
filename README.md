# Förderly – MVP

Finde in Sekunden die passenden Förderprogramme für dein Vorhaben.

**Live:** [https://foerderly.com](https://foerderly.com)

## Schnellstart

```bash
npm install
npm run seed   # Optional: Datenbank mit 55 Programmen füllen
npm run dev    # Entwicklungsserver starten
```

Dann öffne **http://localhost:3000** im Browser.

## Features

- **5 Filter:** Bundesland, Phase, Größe, Branche, Stichwortsuche
- **1.400+ echte Förderprogramme** aus Bund, Ländern und EU
- **Pagination:** 20 Ergebnisse pro Seite
- **Detailansicht** mit Slide-over Panel
- **Mobile-optimiert** mit einklappbaren Filtern
- **DSGVO-konform:** Keine Cookies, kein Tracking, Self-hosted Fonts
- **Security:** CSP, Rate-Limiting, Input-Validierung, URL-Whitelist

## Tech-Stack

- Next.js 15 + React + Tailwind CSS
- JSON-basierte Daten (Migration zu Supabase geplant)
- Vercel Hosting

## Projektstruktur

```
src/
├── app/
│   ├── api/foerderungen/route.js   ← Such-API mit Pagination
│   ├── api/meta/route.js           ← Metadaten-API
│   ├── components/                 ← FilterBar, ResultCard, DetailPanel
│   ├── impressum/page.js
│   ├── datenschutz/page.js
│   ├── layout.js                   ← Self-hosted IBM Plex Sans
│   └── page.js                     ← Hauptseite mit Pagination
├── lib/
│   ├── db.js                       ← JSON-Datenbanklogik
│   ├── sanitize.js                 ← Input-Validierung
│   ├── rateLimit.js                ← 60 Req/Min pro IP
│   ├── logger.js                   ← DSGVO-konformes Logging
│   ├── urlValidator.js             ← URL-Whitelist
│   └── constants.js                ← Labels, Enums
└── data/foerderprogramme.json      ← Förderprogramme
```
