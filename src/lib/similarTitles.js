import { supabase } from './supabaseClient.js';

export async function fetchSimilarTitles(movieId) {
  const { data, error } = await supabase
    .from('similar_titles')
    .select('position, movies:similar_movie_id(*)')
    .eq('movie_id', movieId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.movies).filter(Boolean);
}

export async function addSimilarTitle(movieId, similarMovieId, position = 0) {
  const { error } = await supabase
    .from('similar_titles')
    .insert({ movie_id: movieId, similar_movie_id: similarMovieId, position });
  if (error) throw error;
}

export async function removeSimilarTitle(movieId, similarMovieId) {
  const { error } = await supabase
    .from('similar_titles')
    .delete()
    .eq('movie_id', movieId)
    .eq('similar_movie_id', similarMovieId);
  if (error) throw error;
}

// Finds which TMDB tmdb_id values already exist in your own movies table.
export async function findMoviesByTmdbIds(tmdbIds) {
  if (tmdbIds.length === 0) return [];
  const { data, error } = await supabase.from('movies').select('*').in('tmdb_id', tmdbIds);
  if (error) throw error;
  return data ?? [];
  }
