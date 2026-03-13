-- Förderly: Unique constraint für Scraper-Upsert
-- Im Supabase SQL Editor ausführen

-- Unique constraint auf url_quelle (für upsert)
ALTER TABLE programme ADD CONSTRAINT programme_url_quelle_unique UNIQUE (url_quelle);
