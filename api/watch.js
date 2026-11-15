const TMDB_BASE = 'https://api.themoviedb.org/3';

function simplify(list) {
  const seen = new Set();
  const out = [];
  for (const p of list || []) {
    if (seen.has(p.provider_id)) continue;
    seen.add(p.provider_id);
    out.push({
      id: p.provider_id,
      name: p.provider_name,
      logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
    });
  }
  return out;
}

export default async function handler(req, res) {
  const { id, type } = req.query;
  const country = String(req.query.country || '').toUpperCase();

  if (!/^\d{1,10}$/.test(String(id || '')) || !['movie', 'tv'].includes(type)) {
    return res.status(400).json({ error: 'Bad request' });
  }
  if (country && !/^[A-Z]{2}$/.test(country)) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const detected = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  const chosen = country || (/^[A-Z]{2}$/.test(detected) ? detected : 'NG');

  try {
    const r = await fetch(`${TMDB_BASE}/${type}/${id}/watch/providers`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: 'application/json',
      },
    });
    if (!r.ok) return res.status(502).json({ error: 'Could not load providers' });

    const data = await r.json();
    const results = data.results || {};
    const entry = results[chosen] || null;

    res.setHeader(
      'Cache-Control',
      country ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'private, max-age=600'
    );

    return res.status(200).json({
      country: chosen,
      available: Object.keys(results).sort(),
      link: entry?.link || null,
      stream: simplify(entry?.flatrate),
      free: simplify([...(entry?.free || []), ...(entry?.ads || [])]),
      rent: simplify(entry?.rent),
      buy: simplify(entry?.buy),
    });
  } catch {
    return res.status(502).json({ error: 'Could not load providers' });
  }
}
