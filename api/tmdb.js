import { serviceClient, isAdminRequest } from './_lib/admin.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';

// Open to visitors (actor pages only).
const PUBLIC_PATHS = [/^\/person\/\d{1,10}$/, /^\/person\/\d{1,10}\/combined_credits$/];

// Admin only (title form, similar-title suggestions, one-tap import).
const ADMIN_PATHS = [
  /^\/search\/(movie|tv)$/,
  /^\/genre\/(movie|tv)\/list$/,
  /^\/(movie|tv)\/\d{1,10}$/,
  /^\/(movie|tv)\/\d{1,10}\/(credits|images|videos|external_ids|similar)$/,
  /^\/tv\/\d{1,10}\/season\/\d{1,3}$/,
  /^\/tv\/\d{1,10}\/season\/\d{1,3}\/(credits|videos)$/,
];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const path = String(req.query.path || '');
  const isPublic = PUBLIC_PATHS.some((re) => re.test(path));
  const isAdminPath = ADMIN_PATHS.some((re) => re.test(path));
  if (!isPublic && !isAdminPath) return res.status(400).json({ error: 'Bad request' });

  if (!isPublic) {
    const supabase = serviceClient();
    if (!(await isAdminRequest(req, supabase))) return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only these search options are passed on to TMDB.
  const params = new URLSearchParams();
  if (req.query.query) params.set('query', String(req.query.query).slice(0, 200));
  if (req.query.page && /^\d{1,3}$/.test(String(req.query.page))) params.set('page', String(req.query.page));

  const upstream = await fetch(`${TMDB_BASE}${path}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}`, accept: 'application/json' },
  });
  const body = await upstream.text();

  if (isPublic && upstream.ok) {
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.status(upstream.status).setHeader('Content-Type', 'application/json').send(body);
}
