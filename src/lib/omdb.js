import { supabase } from './supabaseClient.js';

// Critic scores come through our own server function (/api/omdb), which holds the private key.
export async function fetchOmdbRatings(imdbId) {
  if (!imdbId) return null;
  let token = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token ?? null;
  } catch {
    token = null;
  }
  if (!token) return null;
  const res = await fetch(`/api/omdb?i=${encodeURIComponent(imdbId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
