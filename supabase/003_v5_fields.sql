-- =============================================
-- FÖRDERLY – Schema Migration v5
-- Neue Felder für erweiterte Programm-Daten
-- =============================================

-- Neue Spalten zur programme-Tabelle
ALTER TABLE programme ADD COLUMN IF NOT EXISTS hat_deadline BOOLEAN DEFAULT false;
ALTER TABLE programme ADD COLUMN IF NOT EXISTS rechtsgrundlagen TEXT[] DEFAULT '{}';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS foerderquote INTEGER;  -- 1-100, NULL = unbekannt
ALTER TABLE programme ADD COLUMN IF NOT EXISTS bearbeitungszeit TEXT;  -- z.B. "4-6 Wochen"
ALTER TABLE programme ADD COLUMN IF NOT EXISTS besonderheiten TEXT[] DEFAULT '{}';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS kontakte JSONB DEFAULT '[]';
-- kontakte Format: [{"typ": "email"|"telefon"|"link", "wert": "..."}]
ALTER TABLE programme ADD COLUMN IF NOT EXISTS zielgruppen_erweitert TEXT[] DEFAULT '{}';
-- z.B. ["frauen", "forschung", "kultur", "behinderte", "migranten"]
ALTER TABLE programme ADD COLUMN IF NOT EXISTS finanzierungsform_erweitert TEXT[] DEFAULT '{}';
-- z.B. ["mezzanine", "wandeldarlehen", "verbundfinanzierung"]
ALTER TABLE programme ADD COLUMN IF NOT EXISTS datenqualitaet TEXT DEFAULT 'minimal';
-- "vollstaendig" | "unvollstaendig" | "minimal"

-- antragsfrist existiert schon als DATE, ändern auf TEXT für flexiblere Werte
-- ("31.12.2026", "laufend", NULL)
ALTER TABLE programme ALTER COLUMN antragsfrist TYPE TEXT USING
  CASE
    WHEN antragsfrist IS NOT NULL THEN TO_CHAR(antragsfrist, 'DD.MM.YYYY')
    ELSE NULL
  END;

-- Indexes für neue Filter
CREATE INDEX IF NOT EXISTS idx_programme_hat_deadline ON programme (hat_deadline) WHERE hat_deadline = true;
CREATE INDEX IF NOT EXISTS idx_programme_datenqualitaet ON programme (datenqualitaet);
CREATE INDEX IF NOT EXISTS idx_programme_zielgruppen ON programme USING GIN (zielgruppen_erweitert);
CREATE INDEX IF NOT EXISTS idx_programme_foerderquote ON programme (foerderquote) WHERE foerderquote IS NOT NULL;

-- Volltextsuche aktualisieren (mehr Felder einbeziehen)
-- Erst alte Column droppen, dann neu erstellen
ALTER TABLE programme DROP COLUMN IF EXISTS fts;
ALTER TABLE programme ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german',
      coalesce(name, '') || ' ' ||
      coalesce(kurzname, '') || ' ' ||
      coalesce(beschreibung, '') || ' ' ||
      coalesce(foerdergeber, '') || ' ' ||
      coalesce(bearbeitungszeit, '') || ' ' ||
      coalesce(array_to_string(besonderheiten, ' '), '') || ' ' ||
      coalesce(array_to_string(zielgruppen_erweitert, ' '), '') || ' ' ||
      coalesce(array_to_string(rechtsgrundlagen, ' '), '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_programme_fts ON programme USING GIN (fts);

-- Query-Log Tabelle für Search Analytics (Punkt 9)
CREATE TABLE IF NOT EXISTS search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT,
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kein RLS nötig (nur Server-seitig geschrieben)
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Nur Insert erlauben (kein Read via anon key)
CREATE POLICY "Server insert only" ON search_queries
  FOR INSERT WITH CHECK (true);

-- Scraper Error-Log Tabelle (Punkt 5)
CREATE TABLE IF NOT EXISTS scraper_errors (
  id BIGSERIAL PRIMARY KEY,
  url TEXT,
  error_type TEXT,
  error_message TEXT,
  phase TEXT,  -- 'collect' | 'detail' | 'upsert'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraper_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Server insert scraper_errors" ON scraper_errors
  FOR INSERT WITH CHECK (true);
