-- =============================================
-- FÖRDERLY – Supabase Schema
-- =============================================

-- Förderprogramme Haupttabelle
CREATE TABLE IF NOT EXISTS programme (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  kurzname TEXT,
  beschreibung TEXT,
  foerdergeber TEXT,
  foerderart TEXT DEFAULT 'zuschuss',
  volumen_min_eur INTEGER DEFAULT 0,
  volumen_max_eur INTEGER DEFAULT 0,
  eigenanteil_prozent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'aktiv',
  antragsfrist DATE,
  url_antrag TEXT,
  url_quelle TEXT,
  quelle TEXT DEFAULT 'foerderdatenbank',
  bundeslaender TEXT[] DEFAULT '{}',
  phasen TEXT[] DEFAULT '{}',
  groessen TEXT[] DEFAULT '{}',
  branchen JSONB DEFAULT '[]',
  aktiv BOOLEAN DEFAULT true,
  aktualisiert_am DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für die häufigsten Filter-Queries
CREATE INDEX IF NOT EXISTS idx_programme_aktiv ON programme (aktiv, status);
CREATE INDEX IF NOT EXISTS idx_programme_bundeslaender ON programme USING GIN (bundeslaender);
CREATE INDEX IF NOT EXISTS idx_programme_phasen ON programme USING GIN (phasen);
CREATE INDEX IF NOT EXISTS idx_programme_groessen ON programme USING GIN (groessen);
CREATE INDEX IF NOT EXISTS idx_programme_foerderart ON programme (foerderart);
CREATE INDEX IF NOT EXISTS idx_programme_branchen ON programme USING GIN (branchen);
CREATE INDEX IF NOT EXISTS idx_programme_volumen ON programme (volumen_max_eur DESC);

-- Volltextsuche
ALTER TABLE programme ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('german', coalesce(name, '') || ' ' || coalesce(kurzname, '') || ' ' || coalesce(beschreibung, '') || ' ' || coalesce(foerdergeber, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_programme_fts ON programme USING GIN (fts);

-- Updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_updated_at ON programme;
CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON programme
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security aktivieren (Supabase Best Practice)
ALTER TABLE programme ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key kann lesen)
CREATE POLICY "Public read access" ON programme
  FOR SELECT USING (true);

-- Branchen-Referenztabelle (optional, für UI)
CREATE TABLE IF NOT EXISTS branchen (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

INSERT INTO branchen (id, name, slug) VALUES
  (1, 'Digitalisierung', 'digitalisierung'),
  (2, 'Energie & Umwelt', 'energie-umwelt'),
  (3, 'Forschung & Entwicklung', 'forschung-entwicklung'),
  (4, 'Gesundheit & Medizin', 'gesundheit-medizin'),
  (5, 'Handwerk', 'handwerk'),
  (6, 'Handel', 'handel'),
  (7, 'IT & Software', 'it-software'),
  (8, 'Kreativwirtschaft', 'kreativwirtschaft'),
  (9, 'Landwirtschaft', 'landwirtschaft'),
  (10, 'Mobilität & Logistik', 'mobilitaet-logistik'),
  (11, 'Produktion & Industrie', 'produktion-industrie'),
  (12, 'Sozialunternehmen', 'sozialunternehmen'),
  (13, 'Tourismus & Gastro', 'tourismus-gastro'),
  (14, 'Bildung', 'bildung'),
  (15, 'Bauwesen & Immobilien', 'bauwesen-immobilien'),
  (16, 'Branchenübergreifend', 'branchenuebergreifend')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE branchen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read branchen" ON branchen FOR SELECT USING (true);
