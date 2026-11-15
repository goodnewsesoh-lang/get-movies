import { supabase } from './supabaseClient.js';

export async function submitMessage(name, email, message) {
  const { error } = await supabase.from('messages').insert({ name, email, message });
  if (error) throw error;
}

export async function fetchMessagesForAdmin() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchUnreadCount() {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) return 0;
  return count ?? 0;
}

export async function setMessageRead(id, isRead) {
  const { error } = await supabase.from('messages').update({ is_read: isRead }).eq('id', id);
  if (error) throw error;
}

export async function deleteMessage(id) {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}
