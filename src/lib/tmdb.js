import { TMDB_READ_ACCESS_TOKEN } from '../config.js';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const headers = {
  Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
  accept: 'application/json',
};

export async function searchTmdb(query, type = 'movie') {
  const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
  const res = await fetch(`${BASE_URL}/${endpoint}?query=${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error('TMDB search failed');
  const data = await res.json();
  return data.results ?? [];
}

export async function getTmdbGenres(type = 'movie') {
  const endpoint = type === 'tv' ? 'genre/tv/list' : 'genre/movie/list';
  const res = await fetch(`${BASE_URL}/${endpoint}`, { headers });
  if (!res.ok) throw new Error('TMDB genre list failed');
  const data = await res.json();
  return data.genres ?? [];
}

export function tmdbPosterUrl(path, size = 'w500') {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

export function tmdbBackdropUrl(path, size = 'original') {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

export function mapTmdbResultToDraft(result, type, genreLookup) {
  const genreIds = result.genre_ids ?? [];
  const genreNames = genreIds
    .map((id) => genreLookup?.[id])
    .filter(Boolean);

  return {
    title: type === 'tv' ? result.name : result.title,
    year: (type === 'tv' ? result.first_air_date : result.release_date)?.slice(0, 4) ?? '',
    release_date: type === 'tv' ? result.first_air_date : result.release_date ?? '',
    overview: result.overview ?? '',
    rating: result.vote_average ? Number(result.vote_average.toFixed(1)) : null,
    genres: genreNames,
    poster_url: tmdbPosterUrl(result.poster_path),
    backdrop_url: tmdbBackdropUrl(result.backdrop_path),
  };
  }
