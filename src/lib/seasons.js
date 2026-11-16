import { supabase } from './supabaseClient.js';

// Is this season of this series already in the library?
export async function findSeasonEntry(seriesTmdbId, seasonNumber) {
  const { data, error } = await supabase
    .from('movies')
    .select('id, title')
    .eq('series_tmdb_id', seriesTmdbId)
    .eq('season_number', seasonNumber)
    .maybeSingle();
  if (error) return null;
  return data;
}

// Other published entries of the same series (other seasons, plus the whole-series entry)
export async function fetchSeasonSiblings(title) {
  const seriesId = title.series_tmdb_id ?? (title.type === 'tv' ? title.tmdb_id : null);
  if (!seriesId) return [];

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('published', true)
    .eq('type', 'tv')
    .or(`series_tmdb_id.eq.${seriesId},and(tmdb_id.eq.${seriesId},season_number.is.null)`)
    .neq('id', title.id)
    .order('season_number', { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data ?? [];
}
