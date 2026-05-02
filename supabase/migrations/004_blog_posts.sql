-- Migration: Blog-System (blog_posts + Storage Bucket)
-- Erstellt: 2026-05-02

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  branchen TEXT[] DEFAULT '{}',
  themen TEXT[] DEFAULT '{}',
  featured_image TEXT,
  author TEXT DEFAULT 'Förderly Team',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('published')) DEFAULT 'published',
  seo_description TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_hashtags ON blog_posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_blog_branchen ON blog_posts USING GIN(branchen);
CREATE INDEX IF NOT EXISTS idx_blog_themen ON blog_posts USING GIN(themen);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "blog_posts_service_write" ON blog_posts;
CREATE POLICY "blog_posts_service_write" ON blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage Bucket für Blog-Bilder (Public Read, Service-Role Write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
CREATE POLICY "blog_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "blog_images_service_write" ON storage.objects;
CREATE POLICY "blog_images_service_write" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'blog-images')
  WITH CHECK (bucket_id = 'blog-images');
