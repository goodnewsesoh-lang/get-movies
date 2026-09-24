import { supabase } from './supabaseClient.js';

export async function fetchScreenshots(movieId) {
  const { data, error } = await supabase
    .from('screenshots')
    .select('*')
    .eq('movie_id', movieId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addScreenshot(movieId, imageUrl, position = 0) {
  const { error } = await supabase
    .from('screenshots')
    .insert({ movie_id: movieId, image_url: imageUrl, position });
  if (error) throw error;
}

export async function removeScreenshot(id) {
  const { error } = await supabase.from('screenshots').delete().eq('id', id);
  if (error) throw error;
  }
