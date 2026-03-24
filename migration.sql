-- =============================================
-- FÖRDERLY – Migration v5.1
-- 11 neue Spalten + Indizes + Constraints + scraper_errors
-- IDEMPOTENT: Kann mehrfach ausgeführt werden
-- =============================================

-- ─── 1. Neue Spalten zur programme-Tabelle ───

-- antragsfrist: Flexibler Text statt DATE ("31.12.2026", "laufend", NULL)
-- Falls antragsfrist als DATE existiert → umwandeln
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programme' AND column_name = 'antragsfrist' AND data_type = 'date'
  ) THEN
    ALTER TABLE programme ALTER COLUMN antragsfrist TYPE TEXT USING
      CASE WHEN antragsfrist IS NOT NULL THEN TO_CHAR(antragsfrist, 'DD.MM.YYYY') ELSE NULL END;
  END IF;
END $$;

-- Falls antragsfrist gar nicht existiert
ALTER TABLE programme ADD COLUMN IF NOT EXISTS antragsfrist TEXT;

ALTER TABLE programme ADD COLUMN IF NOT EXISTS hat_deadline BOOLEAN DEFAULT false;
ALTER TABLE programme ADD COLUMN IF NOT EXISTS rechtsgrundlagen TEXT[] DEFAULT '{}';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS foerderquote INTEGER;
ALTER TABLE programme ADD COLUMN IF NOT EXISTS bearbeitungszeit TEXT;
ALTER TABLE programme ADD COLUMN IF NOT EXISTS besonderheiten TEXT[] DEFAULT '{}';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS kontakte JSONB DEFAULT '[]';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS datenqualitaet TEXT DEFAULT 'minimal';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS zielgruppen_erweitert TEXT[] DEFAULT '{}';
ALTER TABLE programme ADD COLUMN IF NOT EXISTS finanzierungsform_erweitert TEXT[] DEFAULT '{}';

-- ─── 2. Indizes für schnellere Abfragen ───

CREATE INDEX IF NOT EXISTS idx_programme_antragsfrist ON programme (antragsfrist) WHERE antragsfrist IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programme_hat_deadline ON programme (hat_deadline) WHERE hat_deadline = true;
CREATE INDEX IF NOT EXISTS idx_programme_foerderquote ON programme (foerderquote DESC) WHERE foerderquote IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programme_datenqualitaet ON programme (datenqualitaet);

-- GIN-Indizes für Array-Felder (Full-Text-Suche / @> Operator)
CREATE INDEX IF NOT EXISTS idx_programme_rechtsgrundlagen ON programme USING GIN (rechtsgrundlagen);
CREATE INDEX IF NOT EXISTS idx_programme_besonderheiten ON programme USING GIN (besonderheiten);
CREATE INDEX IF NOT EXISTS idx_programme_zielgruppen ON programme USING GIN (zielgruppen_erweitert);
CREATE INDEX IF NOT EXISTS idx_programme_finanzierungsform ON programme USING GIN (finanzierungsform_erweitert);

-- ─── 3. Constraints für Datenvalidierung ───

-- foerderquote muss zwischen 1-100 sein (wenn nicht NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_foerderquote_range'
  ) THEN
    ALTER TABLE programme ADD CONSTRAINT chk_foerderquote_range
      CHECK (foerderquote IS NULL OR (foerderquote >= 1 AND foerderquote <= 100));
  END IF;
END $$;

-- ─── 4. Volltextsuche aktualisieren (mehr Felder) ───

-- fts-Column neu erstellen mit erweiterten Feldern
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

-- ─── 5. scraper_errors Tabelle ───

CREATE TABLE IF NOT EXISTS scraper_errors (
  id BIGSERIAL PRIMARY KEY,
  url TEXT,
  error_type TEXT,
  error_message TEXT,
  phase TEXT,  -- 'fetch' | 'detail' | 'upsert'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraper_errors ENABLE ROW LEVEL SECURITY;

-- Policy idempotent: erst droppen wenn existiert
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Server insert scraper_errors' AND tablename = 'scraper_errors'
  ) THEN
    DROP POLICY "Server insert scraper_errors" ON scraper_errors;
  END IF;
END $$;

CREATE POLICY "Server insert scraper_errors" ON scraper_errors
  FOR INSERT WITH CHECK (true);

-- ─── 6. search_queries Tabelle (falls noch nicht existiert) ───

CREATE TABLE IF NOT EXISTS search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT,
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Server insert only' AND tablename = 'search_queries'
  ) THEN
    DROP POLICY "Server insert only" ON search_queries;
  END IF;
END $$;

CREATE POLICY "Server insert only" ON search_queries
  FOR INSERT WITH CHECK (true);

-- ─── FERTIG ───
-- Migration ist idempotent und kann beliebig oft ausgeführt werden.
