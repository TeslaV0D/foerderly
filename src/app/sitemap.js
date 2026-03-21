import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://foerderly.com';

/**
 * FÖRDERLY – Dynamische Sitemap
 * Generiert /sitemap.xml automatisch via Next.js App Router.
 * Lädt alle aktiven Programme aus Supabase.
 * Fallback: nur statische Seiten falls DB nicht erreichbar.
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
      url: `${BASE_URL}/quellen`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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

  // ─── Dynamische Programme aus Supabase ───
  let programmePages = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Alle aktiven Programme laden (url_quelle als canonical URL)
      const { data, error } = await supabase
        .from('programme')
        .select('id, url_quelle, aktualisiert_am')
        .eq('aktiv', true)
        .eq('status', 'aktiv')
        .order('id', { ascending: true })
        .limit(10000);

      if (!error && data) {
        programmePages = data
          .filter(p => p.url_quelle)
          .map(p => ({
            url: p.url_quelle,
            lastModified: p.aktualisiert_am
              ? new Date(p.aktualisiert_am)
              : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          }));
      }
    }
  } catch (err) {
    // Fallback: nur statische Seiten ausliefern (kein Crash)
    console.error('[Sitemap] Supabase-Fehler:', err.message);
  }

  return [...staticPages, ...programmePages];
}
