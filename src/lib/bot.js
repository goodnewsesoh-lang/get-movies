import { supabase } from './supabaseClient.js';

export async function fetchBotStatus() {
  const { data, error } = await supabase.from('bot_status').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function fetchRecentJobs(limit = 20) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function runMaintenanceNow() {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch('/api/cron/maintenance', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to trigger maintenance run');
  return res.json();
}
