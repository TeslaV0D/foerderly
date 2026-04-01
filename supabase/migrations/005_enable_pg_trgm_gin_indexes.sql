-- Migration 005: Enable pg_trgm extension + GIN indexes for short-token search
-- Problem: German FTS stemming drops tokens like "IT", "KI", "AI", "ERP"
-- Solution: Trigram-based GIN indexes enable fast ILIKE fallback for short queries

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_programme_name_trgm 
  ON programme USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_programme_kurzname_trgm 
  ON programme USING gin (kurzname gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_programme_beschreibung_trgm 
  ON programme USING gin (beschreibung gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_programme_description_short_trgm 
  ON programme USING gin (description_short gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_programme_foerdergeber_trgm 
  ON programme USING gin (foerdergeber gin_trgm_ops);
