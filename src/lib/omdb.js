import { OMDB_API_KEY } from '../config.js';

export async function fetchOmdbRatings(imdbId) {
  if (!imdbId) return null;
  const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.Response === 'False') return null;

  const ratings = data.Ratings || [];
  const find = (source) => ratings.find((r) => r.Source === source)?.Value ?? null;

  return {
    imdb_rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : find('Internet Movie Database'),
    rotten_tomatoes_rating: find('Rotten Tomatoes'),
    metacritic_rating: find('Metacritic'),
  };
}
