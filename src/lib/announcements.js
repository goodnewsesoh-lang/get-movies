import { supabase } from './supabaseClient.js';

export async function fetchPublishedAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchHomepageAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .eq('show_on_homepage', true)
    .order('created_at', { ascending: false })
    .limit(3);
  if (error) throw error;
  return data ?? [];
}

export async function fetchAnnouncementBySlug(slug) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAllAnnouncementsForAdmin() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAnnouncementById(id) {
  const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createAnnouncement(payload) {
  const { data, error } = await supabase.from('announcements').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAnnouncement(id, payload) {
  const { data, error } = await supabase.from('announcements').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}
