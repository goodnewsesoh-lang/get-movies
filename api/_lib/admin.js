import { createClient } from '@supabase/supabase-js';

export function serviceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// True only when the request carries a signed-in session whose user is on the admins list.
export async function isAdminRequest(req, supabase) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return false;
  const { data } = await supabase.auth.getUser(header.slice(7));
  if (!data?.user) return false;
  const { data: row } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle();
  return Boolean(row);
}
