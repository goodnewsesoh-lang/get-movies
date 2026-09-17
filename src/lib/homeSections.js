import { supabase } from './supabaseClient.js';

export async function fetchEnabledHomeSections() {
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .eq('enabled', true)
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllHomeSectionsForAdmin() {
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateHomeSection(id, payload) {
  const { error } = await supabase.from('home_sections').update(payload).eq('id', id);
  if (error) throw error;
    }
