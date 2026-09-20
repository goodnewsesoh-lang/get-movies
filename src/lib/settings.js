import { supabase } from './supabaseClient.js';

export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function updateSiteSettings(payload) {
  const { data, error } = await supabase.from('site_settings').update(payload).eq('id', 1).select().single();
  if (error) throw error;
  return data;
}
