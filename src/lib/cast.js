import { supabase } from './supabaseClient.js';

export async function fetchCastForMovie(movieId) {
  const { data, error } = await supabase
    .from('cast_members')
    .select('*')
    .eq('movie_id', movieId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Wipes and re-saves the cast list for a movie — called automatically after TMDB import.
export async function replaceCastForMovie(movieId, castArray) {
  await supabase.from('cast_members').delete().eq('movie_id', movieId);
  if (castArray.length === 0) return;
  const rows = castArray.map((c, i) => ({
    movie_id: movieId,
    tmdb_person_id: c.tmdb_person_id,
    name: c.name,
    character_name: c.character,
    profile_url: c.profile_url,
    position: i,
  }));
  const { error } = await supabase.from('cast_members').insert(rows);
  if (error) throw error;
}
