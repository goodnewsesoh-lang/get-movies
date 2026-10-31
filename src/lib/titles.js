import { supabase } from './supabaseClient.js';
import { canonicalGenre, genreVariants } from './genres.js';

const TABLE = 'movies';

// Public-facing query: only published titles, with optional filters.
export async function fetchTitles({
  type,
  genre,
  year,
  sort = 'newest',
  search,
  featuredOnly = false,
  limit = 60,
} = {}) {
  let query = supabase.from(TABLE).select('*').eq('published', true);

  if (type) query = query.eq('type', type);
  if (year) query = query.eq('year', year);
  if (featuredOnly) query = query.eq('featured', true);
  if (genre) query = query.overlaps('genres', genreVariants(genre));
  if (search) query = query.ilike('title', `%${search}%`);

  query =
    sort === 'rating'
      ? query.order('rating', { ascending: false, nullsFirst: false })
      : query.order('created_at', { ascending: false });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchTitleById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function fetchAllGenres() {
  const { data, error } = await supabase.from(TABLE).select('genres').eq('published', true);
  if (error) throw error;
  const seen = new Map();
  (data ?? []).forEach((row) =>
    (row.genres ?? []).forEach((g) => {
      const canon = canonicalGenre(g);
      if (!canon) return;
      const key = canon.toLowerCase();
      if (!seen.has(key)) seen.set(key, canon);
    })
  );
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

// ── Admin-only operations (require an authenticated session; enforced by RLS) ──

export async function fetchAllTitlesForAdmin() {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTitle(payload) {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateTitle(id, payload) {
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTitle(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function uploadImage(file, folder) {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('movies-posters').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('movies-posters').getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchAdminStats() {
  const all = await fetchAllTitlesForAdmin();
  return {
    total: all.length,
    movies: all.filter((t) => t.type === 'movie').length,
    tvShows: all.filter((t) => t.type === 'tv').length,
    featured: all.filter((t) => t.featured).length,
    published: all.filter((t) => t.published).length,
    recent: all.slice(0, 5),
  };
}
