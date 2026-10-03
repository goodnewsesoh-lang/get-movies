import { createClient } from '@supabase/supabase-js';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

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

async function tmdbExtras(tmdbId, type) {
  const endpoint = type === 'tv' ? 'tv' : 'movie';
  const [detailsRes, creditsRes, imagesRes, videosRes] = await Promise.all([
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/credits`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/images`, { headers: tmdbHeaders() }),
    fetch(`${TMDB_BASE}/${endpoint}/${tmdbId}/videos`, { headers: tmdbHeaders() }),
  ]);
  const details = detailsRes.ok ? await detailsRes.json() : {};
  const credits = creditsRes.ok ? await creditsRes.json() : { crew: [], cast: [] };
  const images = imagesRes.ok ? await imagesRes.json() : { backdrops: [] };
  const videos = videosRes.ok ? await videosRes.json() : { results: [] };

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
  };
}

async function saveExtras(supabase, movieId, extras) {
  await supabase.from('movies').update({
    runtime: extras.runtime,
    director: extras.director,
    country: extras.country,
    languages: extras.languages,
    writers: extras.writers,
    producers: extras.producers,
    trailer_url: extras.trailerUrl || undefined,
  }).eq('id', movieId);

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
  for (const img of extras.galleryImages) {
    await supabase.from('screenshots').insert({ movie_id: movieId, image_url: img });
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

  let processed = 0;
  const errors = [];

  try {
    const nowIso = new Date().toISOString();
    await supabase.from('movies').update({ published: true }).eq('published', false).lte('scheduled_at', nowIso).not('scheduled_at', 'is', null);
    await supabase.from('announcements').update({ published: true }).eq('published', false).lte('scheduled_at', nowIso).not('scheduled_at', 'is', null);

    const { data: noTmdb } = await supabase
      .from('movies')
      .select('id, title, type, year')
      .is('tmdb_id', null)
      .limit(6);

    for (const movie of noTmdb ?? []) {
      try {
        const match = await tmdbSearch(movie.title, movie.type, movie.year);
        if (!match) {
          errors.push(`No TMDB match for "${movie.title}"`);
          continue;
        }
        const extras = await tmdbExtras(match.id, movie.type);
        await supabase.from('movies').update({ tmdb_id: match.id }).eq('id', movie.id);
        await saveExtras(supabase, movie.id, extras);
        processed++;
      } catch (e) {
        errors.push(`${movie.title}: ${e.message}`);
      }
    }

    const { data: missingExtras } = await supabase
      .from('movies')
      .select('id, tmdb_id, type')
      .not('tmdb_id', 'is', null)
      .is('director', null)
      .limit(6);

    for (const movie of missingExtras ?? []) {
      try {
        const extras = await tmdbExtras(movie.tmdb_id, movie.type);
        await saveExtras(supabase, movie.id, extras);
        processed++;
      } catch (e) {
        errors.push(`Movie #${movie.id}: ${e.message}`);
      }
    }

    const total = (noTmdb?.length ?? 0) + (missingExtras?.length ?? 0);

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
      last_message: `Processed ${processed} of ${total} title(s).`,
    }).eq('id', 1);

    return res.status(200).json({ processed, total, errors });
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
