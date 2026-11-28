import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const STOPWORDS = new Set(
  (
    'a about above after again against all also am an and any are as at be because been before being below between both ' +
    'but by can could did do does doing down during each few for from further had has have having he her here hers him his ' +
    'how i if in into is it its just me more most my no nor not now of off on once only or other our out over own same she ' +
    'should so some such than that the their theirs them then there these they this those through to too under until up very ' +
    'was we were what when where which while who whom why will with would you your yours movie film show series scene ' +
    'remember saw seen watched watch name called title something someone think thing things like one two where about'
  ).split(' ')
);

function extractKeywords(text) {
  const words = (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 12);
}

const BLOCKED = /(https?:\/\/|www\.|@\S+\.\S+)/i;

function clientIpHash(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  return crypto.createHash('sha256').update(`${ip}|${process.env.CRON_SECRET || 'gm'}`).digest('hex');
}

export default async function handler(req, res) {
  const service = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  res.setHeader('Cache-Control', 'no-store');

  // Recent searches by other visitors (only ones that found something)
  if (req.method === 'GET') {
    const { data } = await service
      .from('finder_searches')
      .select('query')
      .gt('result_count', 0)
      .order('created_at', { ascending: false })
      .limit(60);
    const seen = new Set();
    const recent = [];
    for (const row of data ?? []) {
      const q = String(row.query || '').trim();
      const key = q.toLowerCase();
      if (!q || seen.has(key) || BLOCKED.test(q) || /\d{6,}/.test(q)) continue;
      seen.add(key);
      recent.push(q.length > 90 ? `${q.slice(0, 87)}…` : q);
      if (recent.length >= 8) break;
    }
    return res.status(200).json({ recent });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const q = String(body.q || '').trim().slice(0, 500);

  // Hidden field that only bots fill in
  if (body.website) return res.status(200).json({ keywords: [], results: [] });

  if (q.length < 3) return res.status(400).json({ error: 'Please type a few words about the movie.' });
  if (BLOCKED.test(q)) return res.status(400).json({ error: 'Please describe the movie in words, without links or email addresses.' });

  const ipHash = clientIpHash(req);
  const minuteAgo = new Date(Date.now() - 60000).toISOString();
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const [{ count: lastMinute }, { count: lastDay }] = await Promise.all([
    service.from('finder_searches').select('*', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', minuteAgo),
    service.from('finder_searches').select('*', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', dayAgo),
  ]);
  if ((lastMinute ?? 0) >= 5 || (lastDay ?? 0) >= 60) {
    return res.status(429).json({ error: 'You are searching very fast. Please wait a minute and try again.' });
  }

  const words = extractKeywords(q);
  let results = [];
  if (words.length > 0) {
    const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await anon.rpc('find_titles', { words, lim: 40 });
    if (error) return res.status(500).json({ error: 'Search is not available right now.' });
    results = (data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      year: m.year,
      overview: m.overview ? String(m.overview).slice(0, 320) : '',
      poster_url: m.poster_url,
      genres: m.genres ?? [],
      rating: m.rating,
    }));
  }

  // Keep the search so the public "recent searches" list is never empty (no phone-number-like text)
  if (!/\d{6,}/.test(q)) {
    await service.from('finder_searches').insert({ query: q, result_count: results.length, ip_hash: ipHash });
  }

  return res.status(200).json({ keywords: words, results });
}
