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

export async function fetchTmdbExtras(tmdbId, type = 'movie') {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const [detailsRes, creditsRes, imagesRes, videosRes, externalRes] = await Promise.all([
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/credits`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/images`, { headers }),
    fetch(`${BASE_URL}/${endpoint}/${tmdbId}/videos`, { headers }),
    type === 'tv' ? fetch(`${BASE_URL}/tv/${tmdbId}/external_ids`, { headers }) : Promise.resolve(null),
  ]);
  if (!detailsRes.ok) throw new Error('TMDB details fetch failed');

  const details = await detailsRes.json();
  const credits = creditsRes.ok ? await creditsRes.json() : { crew: [], cast: [] };
  const images = imagesRes.ok ? await imagesRes.json() : { backdrops: [] };
  const videos = videosRes.ok ? await videosRes.json() : { results: [] };
  const external = externalRes && externalRes.ok ? await externalRes.json() : null;

  const imdbId = type === 'tv' ? external?.imdb_id ?? null : details.imdb_id ?? null;

  const crew = credits.crew ?? [];
  const director = crew.find((c) => c.job === 'Director')?.name ?? null;
  const writers = crew.filter((c) => c.department === 'Writing').map((c) => c.name);
  const producers = crew.filter((c) => c.job === 'Producer').map((c) => c.name);

  const cast = (credits.cast ?? []).slice(0, 12).map((c) => ({
    tmdb_person_id: c.id,
    name: c.name,
    character: c.character,
    profile_url: c.profile_path ? `${IMG_BASE}/w300${c.profile_path}` : null,
  }));

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
    cast,
    imdbId,
  };
}

export async function fetchTmdbSimilar(tmdbId, type = 'movie') {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const res = await fetch(`${BASE_URL}/${endpoint}/${tmdbId}/similar`, { headers });
  if (!res.ok) throw new Error('TMDB similar fetch failed');
  const data = await res.json();
  return data.results ?? [];
}

export async function fetchTmdbPerson(personId) {
  const [detailsRes, creditsRes] = await Promise.all([
    fetch(`${BASE_URL}/person/${personId}`, { headers }),
    fetch(`${BASE_URL}/person/${personId}/combined_credits`, { headers }),
  ]);
  if (!detailsRes.ok) throw new Error('TMDB person fetch failed');

  const details = await detailsRes.json();
  const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };

  const filmography = (credits.cast ?? [])
    .filter((c) => c.poster_path)
    .sort((a, b) => (b.release_date || b.first_air_date || '').localeCompare(a.release_date || a.first_air_date || ''))
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      title: c.title || c.name,
      poster_url: tmdbPosterUrl(c.poster_path),
      year: (c.release_date || c.first_air_date || '').slice(0, 4),
      character: c.character,
    }));

  return {
    name: details.name,
    bio: details.biography || 'No biography available.',
    profile_url: details.profile_path ? `${IMG_BASE}/w300${details.profile_path}` : null,
    birthday: details.birthday,
    place_of_birth: details.place_of_birth,
    filmography,
  };
}

// The list of seasons for a TV series (used to fill the Season dropdown).
export async function fetchTmdbSeasonList(seriesId) {
  const res = await fetch(`${BASE_URL}/tv/${seriesId}`, { headers });
  if (!res.ok) throw new Error('TMDB series fetch failed');
  const data = await res.json();
  return {
    id: seriesId,
    name: data.name,
    seasons: (data.seasons ?? [])
      .filter((s) => s.season_number >= 1)
      .map((s) => ({
        season_number: s.season_number,
        air_date: s.air_date,
        episode_count: s.episode_count,
      })),
  };
}

// Everything for ONE season: its own date, poster, overview, trailer, cast and episode stills.
export async function fetchTmdbSeasonData(seriesId, seasonNumber) {
  const base = `${BASE_URL}/tv/${seriesId}`;
  const get = (path) => fetch(`${base}${path}`, { headers });

  const [
    seriesRes,
    seasonRes,
    seasonCreditsRes,
    seasonVideosRes,
    seriesCreditsRes,
    seriesVideosRes,
    seriesImagesRes,
    externalRes,
  ] = await Promise.all([
    get(''),
    get(`/season/${seasonNumber}`),
    get(`/season/${seasonNumber}/credits`),
    get(`/season/${seasonNumber}/videos`),
    get('/credits'),
    get('/videos'),
    get('/images'),
    get('/external_ids'),
  ]);

  if (!seriesRes.ok || !seasonRes.ok) throw new Error('TMDB season fetch failed');

  const read = async (res, fallback) => (res.ok ? res.json() : fallback);

  const series = await seriesRes.json();
  const season = await seasonRes.json();
  const seasonCredits = await read(seasonCreditsRes, { cast: [], crew: [] });
  const seasonVideos = await read(seasonVideosRes, { results: [] });
  const seriesCredits = await read(seriesCreditsRes, { cast: [], crew: [] });
  const seriesVideos = await read(seriesVideosRes, { results: [] });
  const seriesImages = await read(seriesImagesRes, { backdrops: [] });
  const external = await read(externalRes, {});

  const episodes = season.episodes ?? [];

  const crewList = (seasonCredits.crew?.length ? seasonCredits.crew : seriesCredits.crew) ?? [];
  const castList = (seasonCredits.cast?.length ? seasonCredits.cast : seriesCredits.cast) ?? [];

  const director = crewList.find((c) => c.job === 'Director')?.name ?? null;
  const writers = [...new Set(crewList.filter((c) => c.department === 'Writing').map((c) => c.name))];
  const producers = [...new Set(crewList.filter((c) => c.job === 'Producer').map((c) => c.name))];

  const cast = castList.slice(0, 12).map((c) => ({
    tmdb_person_id: c.id,
    name: c.name,
    character: c.character,
    profile_url: c.profile_path ? `${IMG_BASE}/w300${c.profile_path}` : null,
  }));

  const pickTrailer = (videos) => {
    const results = videos?.results ?? [];
    return (
      results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
      results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
      results.find((v) => v.site === 'YouTube') ??
      null
    );
  };
  const trailer = pickTrailer(seasonVideos) ?? pickTrailer(seriesVideos);

  const stills = episodes
    .filter((e) => e.still_path)
    .slice(0, 8)
    .map((e) => tmdbBackdropUrl(e.still_path, 'w780'));
  const fallbackBackdrops = (seriesImages.backdrops ?? [])
    .slice(0, 8)
    .map((b) => tmdbBackdropUrl(b.file_path));

  const rounded = (v) => (v && Number(v) > 0 ? Number(Number(v).toFixed(1)) : null);

  const episodeCount =
    episodes.length ||
    (series.seasons ?? []).find((s) => s.season_number === Number(seasonNumber))?.episode_count ||
    null;

  const draft = {
    tmdb_id: Number(seriesId),
    series_tmdb_id: Number(seriesId),
    season_number: Number(seasonNumber),
    episode_count: episodeCount,
    title: `${series.name}: Season ${seasonNumber}`,
    year: season.air_date ? season.air_date.slice(0, 4) : '',
    release_date: season.air_date || '',
    overview: season.overview || series.overview || '',
    rating: rounded(season.vote_average) ?? rounded(series.vote_average),
    genres: (series.genres ?? []).map((g) => g.name),
    poster_url: tmdbPosterUrl(season.poster_path || series.poster_path),
    backdrop_url: tmdbBackdropUrl(series.backdrop_path),
  };

  const extras = {
    runtime: episodes.find((e) => e.runtime)?.runtime ?? series.episode_run_time?.[0] ?? null,
    country: series.production_countries?.[0]?.name ?? null,
    languages: series.spoken_languages?.map((l) => l.english_name).filter(Boolean) ?? [],
    director,
    writers,
    producers,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    cast,
    galleryImages: stills.length ? stills : fallbackBackdrops,
    imdbId: external?.imdb_id ?? null,
  };

  return { draft, extras };
}
