import { supabase } from './supabaseClient.js';
import { createTitle } from './titles.js';
import { addScreenshot } from './gallery.js';
import { replaceCastForMovie } from './cast.js';
import { addSimilarTitle } from './similarTitles.js';
import { fetchOmdbRatings } from './omdb.js';
import { getTmdbGenres, mapTmdbResultToDraft, fetchTmdbExtras } from './tmdb.js';

// Imports ONE TMDB title (whole movie, or whole TV series) into your library
// with poster, overview, cast, director, gallery, trailer and critic scores.
// If the title is already in your library, it is reused and nothing is overwritten.
// Returns { movie, alreadyExisted, warnings }.
export async function importTmdbTitle(result, type, published = false) {
  const warnings = [];

  // 1. Already in the library? Reuse it, never create a duplicate.
  const { data: existing, error: existingError } = await supabase
    .from('movies')
    .select('*')
    .eq('tmdb_id', result.id)
    .eq('type', type)
    .is('season_number', null)
    .limit(1);
  if (existingError) throw existingError;
  if (existing && existing.length > 0) {
    return { movie: existing[0], alreadyExisted: true, warnings };
  }

  // 2. Basic details
  const genreList = await getTmdbGenres(type).catch(() => []);
  const genreLookup = Object.fromEntries(genreList.map((g) => [g.id, g.name]));
  const draft = mapTmdbResultToDraft(result, type, genreLookup);

  // 3. Extras (a bonus: if they fail we still import the basics)
  let extras = null;
  try {
    extras = await fetchTmdbExtras(result.id, type);
  } catch {
    warnings.push('Could not load cast, gallery and trailer.');
  }

  // 4. Critic scores (also a bonus)
  let omdb = null;
  if (extras?.imdbId) {
    try {
      omdb = await fetchOmdbRatings(extras.imdbId);
    } catch {
      omdb = null;
    }
  }

  const payload = {
    type,
    title: draft.title,
    year: draft.year ? Number(draft.year) : null,
    release_date: draft.release_date || null,
    overview: draft.overview || null,
    rating: draft.rating,
    genres: draft.genres,
    poster_url: draft.poster_url,
    backdrop_url: draft.backdrop_url,
    tmdb_id: draft.tmdb_id,
    featured: false,
    published,
    trailer_url: extras?.trailerUrl || null,
    imdb_id: extras?.imdbId || null,
    imdb_rating: omdb?.imdb_rating || null,
    rotten_tomatoes_rating: omdb?.rotten_tomatoes_rating || null,
    metacritic_rating: omdb?.metacritic_rating || null,
    runtime: extras?.runtime ?? null,
    director: extras?.director ?? null,
    country: extras?.country ?? null,
    languages: extras?.languages ?? [],
    writers: extras?.writers ?? [],
    producers: extras?.producers ?? [],
    season_number: null,
    series_tmdb_id: null,
    episode_count: null,
    extras_checked_at: extras ? new Date().toISOString() : null,
    omdb_checked_at: extras?.imdbId ? new Date().toISOString() : null,
  };

  const movie = await createTitle(payload);

  // 5. Gallery and cast (best effort, the title already exists)
  if (extras) {
    try {
      const images = extras.galleryImages ?? [];
      for (let i = 0; i < images.length; i++) {
        await addScreenshot(movie.id, images[i], i);
      }
    } catch {
      warnings.push('Some gallery images could not be saved.');
    }
    try {
      await replaceCastForMovie(movie.id, extras.cast ?? []);
    } catch {
      warnings.push('Cast could not be saved.');
    }
  }

  return { movie, alreadyExisted: false, warnings };
}

// Imports the title and links it as "similar" to the movie being edited.
export async function importAndLinkSimilar(parentMovieId, result, type, published, position) {
  const outcome = await importTmdbTitle(result, type, published);
  await addSimilarTitle(parentMovieId, outcome.movie.id, position);
  return outcome;
}
