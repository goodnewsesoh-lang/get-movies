import { supabase } from './supabaseClient.js';

export async function fetchHealthChecks() {
  const { data, error } = await supabase
    .from('health_checks')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function markCheckDone(key) {
  const { error } = await supabase
    .from('health_checks')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
}

export async function clearCheck(key) {
  const { error } = await supabase.from('health_checks').update({ last_checked_at: null }).eq('key', key);
  if (error) throw error;
}

export async function fetchPendingRecommendations() {
  const { count, error } = await supabase
    .from('recommendations')
    .select('id', { count: 'exact', head: true })
    .eq('approved', false);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchContentCounts() {
  const [all, published] = await Promise.all([
    supabase.from('movies').select('id', { count: 'exact', head: true }),
    supabase.from('movies').select('id', { count: 'exact', head: true }).eq('published', true),
  ]);
  return { total: all.count ?? 0, published: published.count ?? 0 };
}
