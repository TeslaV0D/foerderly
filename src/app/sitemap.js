import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://foerderly.com';

/**
 * FÖRDERLY – Dynamische Sitemap v2
 * Enthält jetzt auch /programme/[id] und /search URLs.
 */
export default async function sitemap() {
  // ─── Statische Seiten ───
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/quellen`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/impressum`,
      lastModified: new Date('2026-03-12'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/datenschutz`,
      lastModified: new Date('2026-03-12'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ─── Dynamische Programme-Detail-Seiten ───
  let detailPages = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('programme')
        .select('id, aktualisiert_am')
        .eq('aktiv', true)
        .eq('status', 'aktiv')
        .order('id', { ascending: true })
        .limit(10000);

      if (!error && data) {
        detailPages = data.map(p => ({
          url: `${BASE_URL}/programme/${p.id}`,
          lastModified: p.aktualisiert_am
            ? new Date(p.aktualisiert_am)
            : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch (err) {
    console.error('[Sitemap] Supabase-Fehler:', err.message);
  }

  return [...staticPages, ...detailPages];
}
