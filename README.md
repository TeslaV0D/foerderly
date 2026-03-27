# Förderly – Fördermittel für Gründer, Startups & KMU

**Finde in Sekunden die passenden Förderprogramme für dein Vorhaben.**

Förderly aggregiert über 2.000 Förderprogramme von Bund, Ländern und EU und macht sie über eine moderne Suchoberfläche zugänglich – kostenlos, ohne Anmeldung, ohne Tracking.

**Live:** [https://foerderly.com](https://foerderly.com)

---

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Features](#features)
- [Tech-Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Scraper](#scraper)
- [Datenbank](#datenbank)
- [Deployment](#deployment)
- [Umgebungsvariablen](#umgebungsvariablen)
- [SEO & Schema](#seo--schema)
- [Datenschutz & Sicherheit](#datenschutz--sicherheit)
- [Roadmap](#roadmap)
- [Lizenz](#lizenz)

---

## Über das Projekt

Wer in Deutschland ein Unternehmen gründet oder ein bestehendes Unternehmen weiterentwickeln will, steht vor einem unübersichtlichen Förderdschungel. Hunderte Programme von Bund, Ländern und EU – verteilt über dutzende Portale, in Behördendeutsch verfasst, schwer zu filtern.

Förderly löst dieses Problem: Die Plattform scrapt die Förderdatenbank des BMWK (foerderdatenbank.de), strukturiert die Daten und macht sie über eine intuitive Suchoberfläche zugänglich. Kein Login, keine Cookies, keine Werbung.

## Features

- **Intelligente Suche** mit Volltextsuche (PostgreSQL tsvector, deutsche Sprachkonfiguration)
- **Multi-Filter-System** – Bundesland, Unternehmensphase, Größe, Branchen (Multi-Select), Förderart, Deadline
- **Sortierung** nach Förderhöhe, Name oder Aktualität
- **Detail-Ansichten** mit vollständiger Programmbeschreibung, Zielgruppen, Besonderheiten, Kontaktdaten und ähnlichen Programmen
- **Vergleichstool** zum direkten Vergleich mehrerer Programme
- **Automatischer Scraper** – läuft wöchentlich via GitHub Actions und aktualisiert die Datenbank
- **Dark/Light Mode** mit System-Erkennung
- **Mobile-optimiert** – responsive Design ab 320px
- **SEO-optimiert** – dynamische Sitemap, JSON-LD Schemas (BreadcrumbList, FAQPage, WebSite), OpenGraph/Twitter Cards, ISR mit täglichem Revalidate
- **Kommandopalette** (Cmd+K / Ctrl+K) für Schnellsuche
- **DSGVO-konform** – keine Cookies, kein Tracking, keine Drittanbieter-Fonts (self-hosted IBM Plex Sans)

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS |
| Backend | Supabase (PostgreSQL), Row Level Security |
| Scraper | Python 3.12, BeautifulSoup4, lxml |
| Hosting | Vercel (Frontend), Supabase Cloud (Datenbank) |
| CI/CD | GitHub Actions (Scraper Schedule) |
| Fonts | IBM Plex Sans (self-hosted via next/font) |

## Projektstruktur

```
foerderly/
├── .github/
│   └── workflows/
│       └── scraper.yml              ← GitHub Actions Workflow (wöchentlich)
├── data/
│   └── foerderprogramme.json        ← JSON-Backup (wird vom Scraper generiert)
├── public/
│   ├── favicon.ico / favicon.svg    ← Favicons
│   ├── apple-touch-icon.png
│   └── robots.txt                   ← Crawler-Steuerung
├── src/
│   ├── app/
│   │   ├── api/                     ← API-Routes (falls benötigt)
│   │   ├── compare/                 ← Vergleichstool
│   │   ├── components/              ← Alle UI-Komponenten
│   │   │   ├── AdvancedFilters.js   ← Such- und Filter-Panel
│   │   │   ├── CommandPalette.js    ← Cmd+K Schnellsuche
│   │   │   ├── ContactWidget.js     ← Kontaktdaten-Anzeige
│   │   │   ├── DeadlineIndicator.js ← Frist-Anzeige
│   │   │   ├── FilterSidebar.js     ← Sidebar-Filter (Legacy)
│   │   │   ├── Header.js            ← Navigation + Theme Toggle
│   │   │   ├── Footer.js            ← Footer mit Links
│   │   │   ├── ResultCard.js        ← Programm-Karte (Client)
│   │   │   ├── ShareButtons.js      ← Social Sharing
│   │   │   ├── SimilarProgrammes.js ← Ähnliche Programme
│   │   │   ├── ThemeProvider.js      ← Dark/Light Mode
│   │   │   └── ...                  ← Schema-Komponenten etc.
│   │   ├── datenschutz/             ← Datenschutzerklärung
│   │   ├── impressum/               ← Impressum
│   │   ├── programme/
│   │   │   └── [id]/page.js         ← Detail-Seite (ISR)
│   │   ├── quellen/                 ← Quellen-Seite mit FAQ
│   │   ├── search/page.js           ← Suchseite (SSR)
│   │   ├── globals.css              ← CSS Variables, Themes, Animations
│   │   ├── layout.js                ← Root Layout, Metadata, Fonts
│   │   ├── page.js                  ← Landing Page
│   │   └── sitemap.js               ← Dynamische Sitemap
│   └── lib/
│       ├── constants.js             ← Filter-Labels, Branchen, formatEuro()
│       ├── search.js                ← Supabase-Queries (SSR)
│       ├── db.js                    ← Legacy DB-Logik
│       ├── sanitize.js              ← Input-Validierung
│       ├── rateLimit.js             ← Rate Limiting
│       ├── queryLogger.js           ← Suchstatistiken
│       └── supabase.js              ← Supabase Client
├── supabase/
│   ├── schema.sql                   ← Initiales DB-Schema
│   ├── 002_unique_url.sql           ← URL-Unique-Constraint
│   ├── 003_v5_fields.sql            ← v5 Felder (11 neue Spalten)
│   └── migrations/
│       └── 004_v52_description_fields.sql ← v5.2 Migration
├── scraper.py                       ← Haupt-Scraper (Python)
├── requirements.txt                 ← Python Dependencies
├── package.json                     ← Node.js Dependencies
├── tailwind.config.js               ← Tailwind Konfiguration
├── next.config.js                   ← Next.js Konfiguration
└── README.md                        ← Diese Datei
```

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+ (empfohlen: 20 LTS)
- npm oder yarn
- Python 3.10+ (für den Scraper)
- Ein Supabase-Projekt (kostenloser Tier reicht)

### Setup

```bash
# 1. Repository klonen
git clone https://github.com/TeslaV0D/foerderly.git
cd foerderly

# 2. Node-Dependencies installieren
npm install

# 3. Umgebungsvariablen einrichten (siehe Abschnitt unten)
cp .env.example .env.local
# → Supabase URL und Anon Key eintragen

# 4. Datenbank-Migrationen ausführen (in Supabase SQL Editor)
# → supabase/schema.sql
# → supabase/002_unique_url.sql
# → supabase/003_v5_fields.sql
# → supabase/migrations/004_v52_description_fields.sql

# 5. Entwicklungsserver starten
npm run dev
```

Die App ist dann unter **http://localhost:3000** erreichbar.

### Befehle

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver (Hot Reload) |
| `npm run build` | Production Build |
| `npm run start` | Production Server lokal |
| `npm run lint` | ESLint ausführen |

## Scraper

Der Scraper ist ein Python-Script, das die Förderdatenbank des BMWK (foerderdatenbank.de) scrapt und die Daten in Supabase schreibt.

### Funktionsweise

Der Scraper arbeitet in drei Phasen:

**Phase 1 – URL-Sammlung:** Iteriert über alle 17 Bundesländer (+bundesweit), folgt den Vorwärts-Buttons der Paginierung und sammelt alle einzigartigen Programm-URLs. Die Session-basierte Paginierung von foerderdatenbank.de erfordert, dass die URLs der Vorwärts-Buttons direkt verwendet werden.

**Phase 2 – Detail-Parsing:** Ruft jede Detail-Seite ab und extrahiert strukturierte Daten – Name, Fördergeber, Förderart, Beschreibung (Kurztext + Volltext), Fördervolumen, Antragsfrist, Förderquote, Rechtsgrundlagen, Kontaktdaten, Besonderheiten. Erkennt automatisch Branchen, Zielgruppen und Finanzierungsformen per Keyword-Matching.

**Phase 3 – Export:** Schreibt alle Programme per Upsert in Supabase (Deduplizierung über `url_quelle`). Programme, die nicht mehr in der Quelle vorhanden sind, werden automatisch deaktiviert. Ein JSON-Backup wird parallel erstellt.

### Schedule

Der Scraper läuft automatisch via GitHub Actions:

- **Wann:** Jeden Dienstag um 04:00 CET (03:00 UTC)
- **Dauer:** ca. 60–90 Minuten für alle ~2.000 Programme
- **Manueller Trigger:** Über die GitHub Actions UI möglich (`workflow_dispatch`)

### Lokaler Testlauf

```bash
# Python-Dependencies installieren
pip install -r requirements.txt

# Testlauf (nur 5 Programme)
python scraper.py --test

# Nur JSON-Export (ohne Supabase)
python scraper.py --json-only

# Vollständiger Lauf mit JSON-Backup
python scraper.py --json-backup
```

Für den Supabase-Export müssen die Umgebungsvariablen `SUPABASE_URL` und `SUPABASE_SERVICE_KEY` gesetzt sein.

### Error Handling

- Exponential Backoff bei Timeouts (5s → 10s → 20s → max 120s)
- Rate-Limit-Handling (HTTP 429: Wartezeit 60s × Versuch)
- HTTP 403: URL wird übersprungen (kein Retry)
- Skip-not-Abort: Einzelne fehlerhafte Programme stoppen nicht den gesamten Lauf
- Fallback auf Listendaten wenn Detail-Parsing fehlschlägt
- Error-Log wird in Supabase und als CSV gespeichert

## Datenbank

### Schema

Die Haupttabelle `programme` enthält alle Förderprogramme mit folgenden Kernfeldern:

| Feld | Typ | Beschreibung |
|---|---|---|
| `name` | TEXT | Offizieller Programmname |
| `kurzname` | TEXT | Kurzbezeichnung (falls vorhanden) |
| `beschreibung` | TEXT | Beschreibung (Legacy, backward-compatible) |
| `description_short` | TEXT | Kurzbeschreibung (max ~300 Zeichen, für Search-Cards) |
| `description_full` | TEXT | Vollständige Beschreibung (ohne Zeichenlimit) |
| `foerdergeber` | TEXT | Fördergeber (z.B. "Bundesministerium für Wirtschaft und Klimaschutz") |
| `foerderart` | TEXT | zuschuss, kredit, buergschaft, beteiligung, beratung, steuerlich |
| `volumen_max_eur` | INT | Maximales Fördervolumen in Euro |
| `bundeslaender` | TEXT[] | Verfügbare Bundesländer |
| `branchen` | JSONB | Zugeordnete Branchen [{id, name, slug}] |
| `phasen` | TEXT[] | Geeignete Unternehmensphasen |
| `groessen` | TEXT[] | Geeignete Unternehmensgrößen |
| `zielgruppen_erweitert` | TEXT[] | Erkannte Zielgruppen |
| `antragsfrist` | DATE | Antragsfrist (falls vorhanden) |
| `foerderquote` | SMALLINT | Förderquote in Prozent (1–100) |
| `kontakte` | JSONB | Kontaktdaten [{typ, wert}] |
| `url_quelle` | TEXT | Original-URL auf foerderdatenbank.de (UNIQUE) |
| `fts` | TSVECTOR | Volltextindex (deutsch, generated) |

Zusätzliche Tabellen: `branchen` (16 Kategorien), `scraper_errors` (Fehlerprotokoll), `search_queries` (Suchstatistiken).

### Migrationen

Migrationen werden im Supabase SQL Editor ausgeführt. Die Reihenfolge:

1. `supabase/schema.sql` – Grundschema
2. `supabase/002_unique_url.sql` – Unique Constraint
3. `supabase/003_v5_fields.sql` – v5 Felder (11 Spalten, GIN Index, Branchen-Tabelle)
4. `supabase/migrations/004_v52_description_fields.sql` – v5.2 Felder (description_short/full, FTS Update)

Alle Migrationen sind idempotent und können mehrfach ausgeführt werden.

## Deployment

### Frontend (Vercel)

Das Frontend wird automatisch über Vercel deployed:

1. Push auf `main` → Vercel baut und deployed automatisch
2. Pull Requests bekommen Preview Deployments
3. ISR (Incremental Static Regeneration) für Detail-Seiten mit 24h Revalidation
4. Statische Generierung der Top 100 Programme beim Build

### Scraper (GitHub Actions)

Der Scraper läuft als GitHub Actions Workflow:

1. Wöchentlich automatisch (Dienstag 04:00 CET)
2. Manuell über die Actions-UI triggern
3. JSON-Backup wird als Artifact gespeichert (30 Tage)
4. Error-Log wird als CSV-Artifact gespeichert

## Umgebungsvariablen

Das Projekt benötigt folgende Umgebungsvariablen. Diese werden **niemals** im Repository gespeichert, da es öffentlich ist.

### Frontend (Vercel Environment Variables)

| Variable | Beschreibung | Wo setzen |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL | Vercel Dashboard → Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (öffentlich, RLS-geschützt) | Vercel Dashboard → Settings → Environment Variables |

### Scraper (GitHub Secrets)

| Variable | Beschreibung | Wo setzen |
|---|---|---|
| `SUPABASE_URL` | Supabase Projekt-URL | GitHub → Settings → Secrets and Variables → Actions |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key (voller Zugriff) | GitHub → Settings → Secrets and Variables → Actions |

### Lokale Entwicklung

Erstelle eine `.env.local` Datei im Projektroot (diese ist in `.gitignore`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

## SEO & Schema

Förderly implementiert umfangreiche SEO-Optimierungen:

- **Dynamische Sitemap** (`/sitemap.xml`) mit allen aktiven Programmen
- **robots.txt** für Crawler-Steuerung
- **JSON-LD Schemas:** WebSite (mit SearchAction), BreadcrumbList, FAQPage (auf /quellen), GovernmentService (pro Programm)
- **OpenGraph & Twitter Cards** für Social Sharing
- **Canonical URLs** auf allen Seiten
- **ISR** (Incremental Static Regeneration) mit 24h Revalidation
- **Statische Generierung** der Top 100 Programme beim Build
- **Meta-Tags** mit dynamischen Titeln und Beschreibungen

## Datenschutz & Sicherheit

- **Keine Cookies** – weder eigene noch Drittanbieter
- **Kein Tracking** – kein Google Analytics, keine Pixel
- **Self-hosted Fonts** – IBM Plex Sans via next/font (kein Google Fonts CDN)
- **Content Security Policy** (CSP) über next.config.js
- **Rate Limiting** auf API-Routes
- **Input-Validierung** und URL-Whitelisting
- **Row Level Security** (RLS) in Supabase – nur Lesezugriff über Anon Key
- **Alle Secrets** ausschließlich in Vercel/GitHub Environment Variables

## Roadmap

- [ ] Vergleichstool erweitern (Drag & Drop, Export)
- [ ] Weitere Filterkategorien (Fördergebiet-Karte, Deadline-Range)
- [ ] Sortierung nach Antragsfristen
- [ ] Benachrichtigungen bei neuen Programmen (optional, Opt-in)
- [ ] Erweiterte Statistiken und Dashboards
- [ ] Google Search Console Integration und Monitoring

## Lizenz

Dieses Projekt ist aktuell nicht unter einer Open-Source-Lizenz veröffentlicht. Alle Rechte vorbehalten.

Die Daten der Förderprogramme stammen von [foerderdatenbank.de](https://www.foerderdatenbank.de) (BMWK) und unterliegen deren Nutzungsbedingungen.

---

**Erstellt von** [Anton Mishchenko](https://foerderly.com/impressum)
