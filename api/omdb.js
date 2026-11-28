import { serviceClient, isAdminRequest } from './_lib/admin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const imdbId = String(req.query.i || '');
  if (!/^tt\d{5,10}$/.test(imdbId)) return res.status(400).json({ error: 'Bad request' });

  const supabase = serviceClient();
  if (!(await isAdminRequest(req, supabase))) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.OMDB_API_KEY) return res.status(200).json(null);

  const upstream = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`);
  res.setHeader('Cache-Control', 'no-store');
  if (!upstream.ok) return res.status(200).json(null);
  const data = await upstream.json();
  if (data.Response === 'False') return res.status(200).json(null);

  const ratings = data.Ratings || [];
  const find = (source) => ratings.find((r) => r.Source === source)?.Value ?? null;
  return res.status(200).json({
    imdb_rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : find('Internet Movie Database'),
    rotten_tomatoes_rating: find('Rotten Tomatoes'),
    metacritic_rating: find('Metacritic'),
  });
}
