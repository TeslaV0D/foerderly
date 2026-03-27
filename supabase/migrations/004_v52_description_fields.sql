-- ═══════════════════════════════════════════
-- Förderly v5.2 Migration
-- Neue Spalten: description_short, description_full
-- Idempotent: Kann mehrfach ausgeführt werden
-- ═══════════════════════════════════════════

-- 1. description_short (max 300 Zeichen Kurzbeschreibung)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programme'
      AND column_name = 'description_short'
  ) THEN
    ALTER TABLE public.programme
      ADD COLUMN description_short TEXT DEFAULT NULL;
    RAISE NOTICE 'Column description_short added';
  ELSE
    RAISE NOTICE 'Column description_short already exists';
  END IF;
END $$;

-- 2. description_full (unbegrenzte Vollbeschreibung)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programme'
      AND column_name = 'description_full'
  ) THEN
    ALTER TABLE public.programme
      ADD COLUMN description_full TEXT DEFAULT NULL;
    RAISE NOTICE 'Column description_full added';
  ELSE
    RAISE NOTICE 'Column description_full already exists';
  END IF;
END $$;

-- 3. Backfill: Kopiere bestehende beschreibung in description_full
-- (nur bei Programmen die noch kein description_full haben)
UPDATE public.programme
SET description_full = beschreibung
WHERE description_full IS NULL
  AND beschreibung IS NOT NULL;

-- 4. Backfill: Generiere description_short aus beschreibung
-- (Smart-Cut bei Satzende, max 300 Zeichen)
UPDATE public.programme
SET description_short = CASE
  WHEN beschreibung IS NULL THEN NULL
  WHEN LENGTH(beschreibung) <= 300 THEN beschreibung
  ELSE LEFT(beschreibung, GREATEST(
    -- Finde letzten Punkt vor 300 Zeichen
    NULLIF(LENGTH(SUBSTRING(LEFT(beschreibung, 300) FROM '.*\.')), 0),
    -- Fallback: schneide bei 297 und füge ... an
    297
  )) || CASE
    WHEN LENGTH(SUBSTRING(LEFT(beschreibung, 300) FROM '.*\.')) > 0 THEN ''
    ELSE '...'
  END
END
WHERE description_short IS NULL
  AND beschreibung IS NOT NULL;

-- 5. Update Full-Text Search um description_full einzubeziehen
-- Drop and recreate the generated column
ALTER TABLE public.programme
  DROP COLUMN IF EXISTS fts;

ALTER TABLE public.programme
  ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german',
      COALESCE(name, '') || ' ' ||
      COALESCE(kurzname, '') || ' ' ||
      COALESCE(description_full, beschreibung, '') || ' ' ||
      COALESCE(foerdergeber, '')
    )
  ) STORED;

-- 6. Re-create GIN index
DROP INDEX IF EXISTS idx_programme_fts;
CREATE INDEX idx_programme_fts ON public.programme USING GIN (fts);

-- 7. Comment
COMMENT ON COLUMN public.programme.description_short IS 'Kurzbeschreibung (max ~300 Zeichen), für Search-Cards';
COMMENT ON COLUMN public.programme.description_full IS 'Vollständige Beschreibung ohne Zeichenlimit, für Detail-Page';

-- Done
SELECT 'v5.2 migration complete' AS status;
