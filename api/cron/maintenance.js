import { createClient } from '@supabase/supabase-js';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const TIME_BUDGET_MS = 45000;

function tmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    accept: 'application/json',
  };
}

function backdropUrl(path, size = 'original') {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

async function tmdbSearch(title, type, year) {
  const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
  const res = await fetch(`${TMDB_BASE}/${endpoint}?query=${encodeURIComponent(title)}`, { headers: tmdbHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.results ?? [];
  if (results.length === 0) return null;
  if (year) {
    const withYear = results.find((r) => {
      const ry = (type === 'tv' ? r.first_air_date : r.release_date)?.slice(0, 4);
      return ry && Math.abs(Number(ry) - Number(year)) <= 1;
    });
    if (withYear) return withYear;
  }
  return results[0];
}

async function tmdbImdbId(tmdbId, type) {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const res = await fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/external_ids`, { headers: tmdbHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  return data.imdb_id || null;
}

async function tmdbExtras(tmdbId, type) {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const [detailsRes, creditsRes, imagesRes, videosRes, externalRes] = await Promise.all([
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/credits`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/images`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/videos`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/external_ids`, { headers: tmdbHeaders() }),
  ]);
  const details = detailsRes.ok ? await detailsRes.json() : {};
  const credits = creditsRes.ok ? await creditsRes.json() : { crew: [], cast: [] };
  const images = imagesRes.ok ? await imagesRes.json() : { backdrops: [] };
  const videos = videosRes.ok ? await videosRes.json() : { results: [] };
  const external = externalRes.ok ? await externalRes.json() : {};

  const imdbId = external?.imdb_id || details.imdb_id || null;

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

  return {
    runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
    country: details.production_countries?.[0]?.name ?? null,
    languages: details.spoken_languages?.map((l) => l.english_name).filter(Boolean) ?? [],
    director,
    writers,
    producers,
    galleryImages: (images.backdrops ?? []).slice(0, 8).map((b) => backdropUrl(b.file_path)),
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    cast,
    imdbId,
  };
}

// Returns an object (possibly with empty fields) when OMDb answered,
// null when the lookup could not be done, and throws when the daily limit is hit.
async function fetchOmdb(imdbId) {
  if (!imdbId || !process.env.OMDB_API_KEY) return null;
  const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.Response === 'False') {
    if (String(data.Error || '').toLowerCase().includes('limit')) {
      throw new Error('OMDb daily limit reached');
    }
    return {};
  }
  const ratings = data.Ratings || [];
  const find = (source) => ratings.find((r) => r.Source === source)?.Value ?? null;
  return {
    imdb_rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : find('Internet Movie Database'),
    rotten_tomatoes_rating: find('Rotten Tomatoes'),
    metacritic_rating: find('Metacritic'),
  };
}

async function safeOmdb(imdbId) {
  try {
    return await fetchOmdb(imdbId);
  } catch {
    return null;
  }
}

async function saveExtras(supabase, movieId, extras, omdb) {
  const nowIso = new Date().toISOString();

  const { data: current } = await supabase.from('movies').select('trailer_url').eq('id', movieId).single();

  const update = {
    runtime: extras.runtime ?? undefined,
    director: extras.director ?? undefined,
    country: extras.country ?? undefined,
    languages: extras.languages.length ? extras.languages : undefined,
    writers: extras.writers.length ? extras.writers : undefined,
    producers: extras.producers.length ? extras.producers : undefined,
    imdb_id: extras.imdbId || undefined,
    extras_checked_at: nowIso,
  };
  if (!current?.trailer_url && extras.trailerUrl) update.trailer_url = extras.trailerUrl;
  if (omdb) {
    update.imdb_rating = omdb.imdb_rating || undefined;
    update.rotten_tomatoes_rating = omdb.rotten_tomatoes_rating || undefined;
    update.metacritic_rating = omdb.metacritic_rating || undefined;
    update.omdb_checked_at = nowIso;
  }
  await supabase.from('movies').update(update).eq('id', movieId);

  if (extras.cast.length > 0) {
    await supabase.from('cast_members').delete().eq('movie_id', movieId);
    await supabase.from('cast_members').insert(
      extras.cast.map((c, i) => ({
        movie_id: movieId,
        tmdb_person_id: c.tmdb_person_id,
        name: c.name,
        character_name: c.character,
        profile_url: c.profile_url,
        position: i,
      }))
    );
  }

  const { data: existing } = await supabase.from('screenshots').select('image_url').eq('movie_id', movieId);
  const have = new Set((existing ?? []).map((r) => r.image_url));
  const fresh = extras.galleryImages.filter((u) => u && !have.has(u));
  if (fresh.length > 0) {
    await supabase.from('screenshots').insert(
      fresh.map((u, i) => ({ movie_id: movieId, image_url: u, position: have.size + i }))
    );
  }
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  let isAdmin = false;
  if (!isCron && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const supabasePublic = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data } = await supabasePublic.auth.getUser(token);
    isAdmin = Boolean(data?.user);
  }

  if (!isCron && !isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: job } = await supabase
    .from('jobs')
    .insert({ job_type: 'maintenance', status: 'running' })
    .select()
    .single();

  const startedAt = Date.now();
  const timeLeft = () => Date.now() - startedAt < TIME_BUDGET_MS;

  let processed = 0;
  let scoresFound = 0;
  let total = 0;
  const errors = [];

  try {
    const nowIso = new Date().toISOString();
    await supabase.from('movies').update({ published: true }).eq('published', false).lte('scheduled_at', nowIso).not('scheduled_at', 'is', null);
    await supabase.from('announcements').update({ published: true }).eq('published', false).lte('scheduled_at', nowIso).not('scheduled_at', 'is', null);

    // Pass 1: titles with no TMDB match saved yet
    const { data: noTmdb } = await supabase
      .from('movies')
      .select('id, title, type, year')
      .is('tmdb_id', null)
      .is('extras_checked_at', null)
      .limit(5);
    total += noTmdb?.length ?? 0;

    for (const movie of noTmdb ?? []) {
      if (!timeLeft()) break;
      try {
        const match = await tmdbSearch(movie.title, movie.type, movie.year);
        if (!match) {
          errors.push(`No TMDB match for "${movie.title}"`);
          await supabase.from('movies').update({ extras_checked_at: new Date().toISOString() }).eq('id', movie.id);
          continue;
        }
        const extras = await tmdbExtras(match.id, movie.type);
        const omdb = await safeOmdb(extras.imdbId);
        await supabase.from('movies').update({ tmdb_id: match.id }).eq('id', movie.id);
        await saveExtras(supabase, movie.id, extras, omdb);
        if (omdb && (omdb.imdb_rating || omdb.rotten_tomatoes_rating || omdb.metacritic_rating)) scoresFound++;
        processed++;
      } catch (e) {
        errors.push(`${movie.title}: ${e.message}`);
      }
    }

    // Pass 2: titles with a TMDB id but no details yet
    const { data: missingExtras } = await supabase
      .from('movies')
      .select('id, tmdb_id, type')
      .not('tmdb_id', 'is', null)
      .is('director', null)
      .is('extras_checked_at', null)
      .limit(5);
    total += missingExtras?.length ?? 0;

    for (const movie of missingExtras ?? []) {
      if (!timeLeft()) break;
      try {
        const extras = await tmdbExtras(movie.tmdb_id, movie.type);
        const omdb = await safeOmdb(extras.imdbId);
        await saveExtras(supabase, movie.id, extras, omdb);
        if (omdb && (omdb.imdb_rating || omdb.rotten_tomatoes_rating || omdb.metacritic_rating)) scoresFound++;
        processed++;
      } catch (e) {
        errors.push(`Movie #${movie.id}: ${e.message}`);
      }
    }

    // Pass 3: older titles that still have no critic scores
    if (!process.env.OMDB_API_KEY) {
      errors.push('OMDB_API_KEY is not set in Vercel, so critic scores were skipped');
    } else {
      const { data: needScores } = await supabase
        .from('movies')
        .select('id, tmdb_id, type, imdb_id')
        .not('tmdb_id', 'is', null)
        .is('omdb_checked_at', null)
        .is('imdb_rating', null)
        .is('rotten_tomatoes_rating', null)
        .is('metacritic_rating', null)
        .limit(25);
      total += needScores?.length ?? 0;

      for (const movie of needScores ?? []) {
        if (!timeLeft()) break;
        try {
          const imdbId = movie.imdb_id || (await tmdbImdbId(movie.tmdb_id, movie.type));
          const omdb = await fetchOmdb(imdbId);
          const update = { omdb_checked_at: new Date().toISOString() };
          if (imdbId) update.imdb_id = imdbId;
          if (omdb) {
            update.imdb_rating = omdb.imdb_rating || undefined;
            update.rotten_tomatoes_rating = omdb.rotten_tomatoes_rating || undefined;
            update.metacritic_rating = omdb.metacritic_rating || undefined;
            if (omdb.imdb_rating || omdb.rotten_tomatoes_rating || omdb.metacritic_rating) scoresFound++;
          }
          await supabase.from('movies').update(update).eq('id', movie.id);
          processed++;
        } catch (e) {
          errors.push(`Scores for movie #${movie.id}: ${e.message}`);
          if (String(e.message).includes('limit')) break;
        }
      }
    }

    await supabase.from('jobs').update({
      status: errors.length > 0 ? 'done_with_errors' : 'done',
      processed_count: processed,
      total_count: total,
      error_message: errors.length > 0 ? errors.join(' | ') : null,
      finished_at: new Date().toISOString(),
    }).eq('id', job.id);

    await supabase.from('bot_status').update({
      last_run_at: new Date().toISOString(),
      last_status: errors.length > 0 ? 'warning' : 'ok',
      last_message: `Processed ${processed} of ${total} title(s). Critic scores found for ${scoresFound}.`,
    }).eq('id', 1);

    return res.status(200).json({ processed, total, scoresFound, errors });
  } catch (e) {
    await supabase.from('jobs').update({
      status: 'failed',
      error_message: e.message,
      finished_at: new Date().toISOString(),
    }).eq('id', job.id);
    await supabase.from('bot_status').update({
      last_run_at: new Date().toISOString(),
      last_status: 'error',
      last_message: e.message,
    }).eq('id', 1);
    return res.status(500).json({ error: e.message });
  }
}
