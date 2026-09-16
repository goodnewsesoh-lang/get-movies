import { supabase } from './supabaseClient.js';

export async function fetchHomepageCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('published', true)
    .eq('show_on_homepage', true)
    .order('homepage_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCollectionBySlug(slug) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchCollectionItems(collectionId, limit = null) {
  let query = supabase
    .from('collection_items')
    .select('position, movies(*)')
    .eq('collection_id', collectionId)
    .order('position', { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => row.movies).filter(Boolean);
}

export async function fetchAllCollectionsForAdmin() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('homepage_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCollectionById(id) {
  const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createCollection(payload) {
  const { data, error } = await supabase.from('collections').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCollection(id, payload) {
  const { data, error } = await supabase.from('collections').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(id) {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw error;
}

export async function addMovieToCollection(collectionId, movieId, position = 0) {
  const { error } = await supabase
    .from('collection_items')
    .insert({ collection_id: collectionId, movie_id: movieId, position });
  if (error) throw error;
}

export async function removeMovieFromCollection(collectionId, movieId) {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('movie_id', movieId);
  if (error) throw error;
}

export async function reorderCollectionItem(collectionId, movieId, position) {
  const { error } = await supabase
    .from('collection_items')
    .update({ position })
    .eq('collection_id', collectionId)
    .eq('movie_id', movieId);
  if (error) throw error;
         }
