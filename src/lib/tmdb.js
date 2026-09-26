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
  const genreNames = genreIds.map((id) => genreLookup?.[id]).filter(Boolean);

  return {
    tmdb_id: result.id,
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

// Fetches director, writers, producers, runtime, country, languages, extra backdrop images, and a trailer URL.
export async function fetchTmdbExtras(tmdbId, type = 'movie') {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const [detailsRes, creditsRes, imagesRes, videosRes] = await Promise.all([
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/credits`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/images`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/videos`, { headers }),
  ]);
  if (!detailsRes.ok) throw new Error('TMDB details fetch failed');

  const details = await detailsRes.json();
  const credits = creditsRes.ok ? await creditsRes.json() : { crew: [] };
  const images = imagesRes.ok ? await imagesRes.json() : { backdrops: [] };
  const videos = videosRes.ok ? await videosRes.json() : { results: [] };

  const crew = credits.crew ?? [];
  const director = crew.find((c) => c.job === 'Director')?.name ?? null;
  const writers = crew.filter((c) => c.department === 'Writing').map((c) => c.name);
  const producers = crew.filter((c) => c.job === 'Producer').map((c) => c.name);

  const results = videos.results ?? [];
  const trailer =
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    results.find((v) => v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  return {
    runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
    country: details.production_countries?.[0]?.name ?? null,
    languages: details.spoken_languages?.map((l) => l.english_name).filter(Boolean) ?? [],
    director,
    writers,
    producers,
    galleryImages: (images.backdrops ?? []).slice(0, 8).map((b) => tmdbBackdropUrl(b.file_path)),
    trailerUrl,
  };
}

// Fetches TMDB's "similar titles" list for suggesting matches against your own library.
export async function fetchTmdbSimilar(tmdbId, type = 'movie') {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const res = await fetch(`${BASE_URL}/${endpoint}/${tmdbId}/similar`, { headers });
  if (!res.ok) throw new Error('TMDB similar fetch failed');
  const data = await res.json();
  return data.results ?? [];
                                             }
