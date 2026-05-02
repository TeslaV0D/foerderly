import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';

const POST_FIELDS_LIST =
  'id, title, slug, excerpt, hashtags, branchen, themen, featured_image, published_at, author';
const POST_FIELDS_FULL =
  'id, title, slug, content, excerpt, hashtags, branchen, themen, featured_image, published_at, updated_at, author, seo_description, view_count';

function client() {
  if (!supabase) throw new Error('Supabase nicht konfiguriert');
  return supabase;
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function ensureUniqueSlug(baseSlug) {
  const c = client();
  let slug = baseSlug || 'beitrag';
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const { data, error } = await c
      .from('blog_posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return candidate;
    suffix++;
    if (suffix > 50) return `${slug}-${Date.now()}`;
  }
}

export async function listPosts({ page = 1, limit = 10 } = {}) {
  const c = client();
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count, error } = await c
    .from('blog_posts')
    .select(POST_FIELDS_LIST, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    posts: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.max(1, Math.ceil((count || 0) / limit)),
  };
}

export async function latestPosts(limit = 3) {
  const c = client();
  const { data, error } = await c
    .from('blog_posts')
    .select(POST_FIELDS_LIST)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getPostBySlug(slug) {
  const c = client();
  const { data, error } = await c
    .from('blog_posts')
    .select(POST_FIELDS_FULL)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function incrementViewCount(id) {
  if (!supabaseAdmin || !id) return;
  try {
    const { data: cur } = await supabaseAdmin
      .from('blog_posts')
      .select('view_count')
      .eq('id', id)
      .maybeSingle();
    const next = (cur?.view_count || 0) + 1;
    await supabaseAdmin
      .from('blog_posts')
      .update({ view_count: next })
      .eq('id', id);
  } catch {
    // soft-fail – view count is non-critical
  }
}

export async function similarPosts({ slug, hashtags = [], branchen = [], limit = 5 }) {
  const c = client();
  let query = c
    .from('blog_posts')
    .select('id, title, slug, excerpt, hashtags, branchen, published_at')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(limit * 3);

  const filters = [];
  if (hashtags?.length) filters.push(`hashtags.ov.{${hashtags.map((h) => `"${h}"`).join(',')}}`);
  if (branchen?.length) filters.push(`branchen.ov.{${branchen.map((b) => `"${b}"`).join(',')}}`);
  if (filters.length) query = query.or(filters.join(','));

  const { data, error } = await query;
  if (error) throw error;

  const scored = (data || []).map((p) => {
    const hOverlap = (p.hashtags || []).filter((h) => hashtags.includes(h)).length;
    const bOverlap = (p.branchen || []).filter((b) => branchen.includes(b)).length;
    return { post: p, score: hOverlap * 2 + bOverlap };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export async function createPost(input) {
  if (!supabaseAdmin) throw new Error('Supabase Admin nicht konfiguriert');

  const baseSlug = slugify(input.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const row = {
    title: input.title,
    slug,
    content: input.content,
    excerpt: input.excerpt,
    hashtags: input.hashtags || [],
    branchen: input.branchen || [],
    themen: input.themen || [],
    featured_image: input.featured_image || null,
    seo_description: input.seo_description || null,
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(row)
    .select('id, slug')
    .single();
  if (error) throw error;
  return data;
}

export async function uploadBlogImage(file, fileName) {
  if (!supabaseAdmin) throw new Error('Supabase Admin nicht konfiguriert');
  const datePart = new Date().toISOString().slice(0, 10);
  const safe = String(fileName)
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80);
  const path = `${datePart}/${Date.now()}-${safe}`;
  const { error } = await supabaseAdmin.storage
    .from('blog-images')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from('blog-images').getPublicUrl(path);
  return { path, url: data.publicUrl };
}
