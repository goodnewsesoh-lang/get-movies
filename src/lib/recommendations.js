import { supabase } from './supabaseClient.js';

export async function fetchApprovedRecommendations(limit = 20) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function submitRecommendation(name, message) {
  const { error } = await supabase.from('recommendations').insert({ name: name || null, message });
  if (error) throw error;
}

export async function fetchAllRecommendationsForAdmin() {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveRecommendation(id) {
  const { error } = await supabase.from('recommendations').update({ approved: true }).eq('id', id);
  if (error) throw error;
}

export async function deleteRecommendation(id) {
  const { error } = await supabase.from('recommendations').delete().eq('id', id);
  if (error) throw error;
}
