import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import GalleryManager from '../../components/GalleryManager.jsx';
import SimilarTitlesPicker from '../../components/SimilarTitlesPicker.jsx';
import {
  searchTmdb,
  getTmdbGenres,
  mapTmdbResultToDraft,
  tmdbPosterUrl,
  fetchTmdbExtras,
  fetchTmdbSeasonList,
  fetchTmdbSeasonData,
} from '../../lib/tmdb.js';
import { fetchOmdbRatings } from '../../lib/omdb.js';
import { createTitle, updateTitle, fetchTitleById, uploadImage } from '../../lib/titles.js';
import { replaceCastForMovie } from '../../lib/cast.js';
import {
  fetchAllCollectionsForAdmin,
  fetchCollectionIdsForMovie,
  syncMovieCollections,
} from '../../lib/collections.js';
import { findSeasonEntry } from '../../lib/seasons.js';

const emptyForm = {
  title: '',
  type: 'movie',
  year: '',
  release_date: '',
  genres: [],
  rating: '',
  platform: '',
  overview: '',
  poster_url: '',
  backdrop_url: '',
  trailer_url: '',
  featured: false,
  published: true,
  hide_from_main: false,
  scheduled_at: '',
  unlock_at: '',
  tmdb_id: null,
  imdb_id: '',
  imdb_rating: '',
  rotten_tomatoes_rating: '',
  metacritic_rating: '',
  runtime: '',
  director: '',
  country: '',
  languages: [],
  writers: [],
  producers: [],
  season_number: '',
  series_tmdb_id: null,
  episode_count: '',
};

export default function TitleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [genreQuery, setGenreQuery] = useState('');
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbGenreLookup, setTmdbGenreLookup] = useState({});
  const [galleryFromTmdb, setGalleryFromTmdb] = useState([]);
  const [pendingCast, setPendingCast] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [seasonChoice, setSeasonChoice] = useState('');
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [allCollections, setAllCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetchTitleById(id).then((t) =>
        setForm({
          ...emptyForm,
          ...t,
          rating: t.rating ?? '',
          runtime: t.runtime ?? '',
          languages: t.languages ?? [],
          writers: t.writers ?? [],
          producers: t.producers ?? [],
          scheduled_at: t.scheduled_at ? t.scheduled_at.slice(0, 16) : '',
          unlock_at: t.unlock_at ? t.unlock_at.slice(0, 16) : '',
          season_number: t.season_number ?? '',
          episode_count: t.episode_count ?? '',
        })
      );
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchAllCollectionsForAdmin().then(setAllCollections).catch(() => {});
    if (isEdit) {
      fetchCollectionIdsForMovie(id).then(setSelectedCollections).catch(() => {});
    }
  }, [id, isEdit]);

  const toggleCollection = (collectionId) =>
    setSelectedCollections((list) =>
      list.includes(collectionId) ? list.filter((c) => c !== collectionId) : [...list, collectionId]
    );

  useEffect(() => {
    getTmdbGenres(form.type)
      .then((list) => {
        const lookup = {};
        list.forEach((g) => (lookup[g.id] = g.name));
        setTmdbGenreLookup(lookup);
      })
      .catch(() => {});
  }, [form.type]);

  const runTmdbSearch = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    try {
      const results = await searchTmdb(tmdbQuery.trim(), form.type);
      setTmdbResults(results.slice(0, 6));
    } catch {
      setError('TMDB search failed. Make sure you are signed in and TMDB_TOKEN is set in Vercel.');
    }
  };

  const fillOmdb = async (imdbId) => {
    if (!imdbId) return;
    const omdb = await fetchOmdbRatings(imdbId);
    if (omdb) {
      setForm((f) => ({
        ...f,
        imdb_rating: omdb.imdb_rating || '',
        rotten_tomatoes_rating: omdb.rotten_tomatoes_rating || '',
        metacritic_rating: omdb.metacritic_rating || '',
      }));
    }
  };

  // Load the whole movie or whole series
  const loadWholeSeries = async (result) => {
    const draft = mapTmdbResultToDraft(result, form.type, tmdbGenreLookup);
    setForm((f) => ({ ...f, ...draft, season_number: '', series_tmdb_id: null, episode_count: '' }));

    setLoadingExtras(true);
    try {
      const extras = await fetchTmdbExtras(result.id, form.type);
      setForm((f) => ({
        ...f,
        runtime: extras.runtime ?? '',
        director: extras.director ?? '',
        country: extras.country ?? '',
        languages: extras.languages ?? [],
        writers: extras.writers ?? [],
        producers: extras.producers ?? [],
        trailer_url: extras.trailerUrl || f.trailer_url,
        imdb_id: extras.imdbId || '',
        imdb_rating: '',
        rotten_tomatoes_rating: '',
        metacritic_rating: '',
      }));
      setGalleryFromTmdb(extras.galleryImages ?? []);
      setPendingCast(extras.cast ?? []);
      await fillOmdb(extras.imdbId);
    } catch {
      // extras are a bonus, don't block the form if they fail
    } finally {
      setLoadingExtras(false);
    }
  };

  // Load one season of a series as its own entry
  const loadSeason = async (seriesId, seasonNumber) => {
    setLoadingExtras(true);
    setError(null);
    try {
      const { draft, extras } = await fetchTmdbSeasonData(seriesId, seasonNumber);
      setForm((f) => ({
        ...f,
        ...draft,
        runtime: extras.runtime ?? '',
        director: extras.director ?? '',
        country: extras.country ?? '',
        languages: extras.languages ?? [],
        writers: extras.writers ?? [],
        producers: extras.producers ?? [],
        trailer_url: extras.trailerUrl || '',
        imdb_id: extras.imdbId || '',
        imdb_rating: '',
        rotten_tomatoes_rating: '',
        metacritic_rating: '',
      }));
      setGalleryFromTmdb(extras.galleryImages ?? []);
      setPendingCast(extras.cast ?? []);
      await fillOmdb(extras.imdbId);
    } catch {
      setError('Could not load that season from TMDB.');
    } finally {
      setLoadingExtras(false);
    }
  };

  const applyTmdbResult = async (result) => {
    setTmdbResults([]);
    setTmdbQuery('');
    setLastResult(result);
    setSeasonChoice('');
    setSeriesInfo(null);
    if (form.type === 'tv') {
      fetchTmdbSeasonList(result.id).then(setSeriesInfo).catch(() => {});
    }
    await loadWholeSeries(result);
  };

  const chooseSeason = async (value) => {
    setSeasonChoice(value);
    if (!lastResult) return;
    if (value === '') {
      await loadWholeSeries(lastResult);
      return;
    }
    await loadSeason(lastResult.id, Number(value));
  };

  const addGenre = () => {
    const g = genreQuery.trim();
    if (g && !form.genres.includes(g)) {
      setForm((f) => ({ ...f, genres: [...f.genres, g] }));
    }
    setGenreQuery('');
  };

  const removeGenre = (g) => {
    setForm((f) => ({ ...f, genres: f.genres.filter((x) => x !== g) }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, field === 'poster_url' ? 'posters' : 'backdrops');
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      setError('Image upload failed. Check your Supabase Storage bucket is set up.');
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const isTv = form.type === 'tv';
    const isSeason = isTv && form.season_number !== '' && form.season_number != null;

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      rating: form.rating === '' ? null : Number(form.rating),
      runtime: form.runtime === '' ? null : Number(form.runtime),
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      unlock_at: form.unlock_at ? new Date(form.unlock_at).toISOString() : null,
      season_number: isSeason ? Number(form.season_number) : null,
      episode_count: isTv && form.episode_count !== '' && form.episode_count != null ? Number(form.episode_count) : null,
      series_tmdb_id: isSeason ? form.series_tmdb_id ?? form.tmdb_id ?? null : null,
    };

    try {
      if (payload.season_number != null && payload.series_tmdb_id) {
        const existing = await findSeasonEntry(payload.series_tmdb_id, payload.season_number);
        if (existing && String(existing.id) !== String(id)) {
          setError(`Season ${payload.season_number} of this series is already in your library as "${existing.title}".`);
          return;
        }
      }

      let savedId = id;
      if (isEdit) {
        await updateTitle(id, payload);
      } else {
        const created = await createTitle(payload);
        savedId = created.id;
      }
      if (pendingCast.length > 0) {
        await replaceCastForMovie(savedId, pendingCast);
      }
      await syncMovieCollections(savedId, selectedCollections);
      if (!isEdit) {
        navigate(`/admin/titles/${savedId}/edit`);
        return;
      }
      navigate('/admin/titles');
    } catch (err) {
      if (String(err.message).includes('movies_season_unique')) {
        setError('That season of this series is already in your library.');
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">{isEdit ? 'Edit title' : 'Add title'}</h1>

      <div className="bg-panel border border-line rounded-xl p-4 mb-6">
        <p className="text-sm text-mute mb-2">Look up on TMDB to auto-fill (optional)</p>
        <form onSubmit={runTmdbSearch} className="flex gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone"
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
          </select>
          <input
            value={tmdbQuery}
            onChange={(e) => setTmdbQuery(e.target.value)}
            placeholder="Search TMDB by title…"
            className="flex-1 bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone"
          />
          <button className="bg-violet hover:bg-violet-bright text-bone px-4 py-2 rounded-lg text-sm">
            Search
          </button>
        </form>

        {loadingExtras && <p className="text-xs text-violet-bright mt-2">Fetching extra details…</p>}

        {tmdbResults.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            {tmdbResults.map((r) => (
              <button type="button" key={r.id} onClick={() => applyTmdbResult(r)} className="text-left">
                <img
                  src={tmdbPosterUrl(r.poster_path, 'w200')}
                  alt=""
                  className="rounded-lg aspect-[2/3] object-cover w-full border border-line hover:border-violet"
                />
                <p className="text-xs text-mute mt-1 line-clamp-2">{r.title || r.name}</p>
              </button>
            ))}
          </div>
        )}

        {seriesInfo && seriesInfo.seasons.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm text-mute mb-1">What are you adding from "{seriesInfo.name}"?</label>
            <select
              value={seasonChoice}
              onChange={(e) => chooseSeason(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone"
            >
              <option value="">The whole series</option>
              {seriesInfo.seasons.map((s) => (
                <option key={s.season_number} value={s.season_number}>
                  Season {s.season_number}
                  {s.air_date ? ` · ${s.air_date}` : ' · date not set'}
                  {s.episode_count ? ` · ${s.episode_count} episodes` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-mute mt-1">
              Pick a season to add it on its own, with its own poster, overview, date, trailer and cast.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-5 max-w-2xl mb-10">
        <div>
          <label className="block text-sm text-mute mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Release date</label>
            <input
              type="date"
              value={form.release_date || ''}
              onChange={(e) => setForm((f) => ({ ...f, release_date: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
        </div>

        {form.type === 'tv' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mute mb-1">Season number</label>
              <input
                type="number"
                min="1"
                value={form.season_number}
                onChange={(e) => setForm((f) => ({ ...f, season_number: e.target.value }))}
                placeholder="Empty = whole series"
                className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
              />
            </div>
            <div>
              <label className="block text-sm text-mute mb-1">Episodes</label>
              <input
                type="number"
                min="0"
                value={form.episode_count}
                onChange={(e) => setForm((f) => ({ ...f, episode_count: e.target.value }))}
                className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Runtime (minutes)</label>
            <input
              type="number"
              value={form.runtime}
              onChange={(e) => setForm((f) => ({ ...f, runtime: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Director</label>
            <input
              value={form.director || ''}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Country</label>
            <input
              value={form.country || ''}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Languages (comma separated)</label>
            <input
              value={(form.languages || []).join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Writers (comma separated)</label>
            <input
              value={(form.writers || []).join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, writers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Producers (comma separated)</label>
            <input
              value={(form.producers || []).join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, producers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Genres</label>
          <div className="flex gap-2 mb-2">
            <input
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
              placeholder="Type a genre and press Enter"
              className="flex-1 bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
            <button type="button" onClick={addGenre} className="bg-panel2 border border-line text-bone px-3 rounded-lg text-sm">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.genres.map((g) => (
              <span key={g} className="text-xs bg-panel2 border border-line text-bone rounded-full px-3 py-1">
                {g} <button type="button" onClick={() => removeGenre(g)} className="text-mute ml-1">✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Rating (0–10)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Streaming platform</label>
            <input
              value={form.platform || ''}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              placeholder="e.g. Netflix"
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">IMDb rating</label>
            <input
              value={form.imdb_rating || ''}
              onChange={(e) => setForm((f) => ({ ...f, imdb_rating: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Rotten Tomatoes</label>
            <input
              value={form.rotten_tomatoes_rating || ''}
              onChange={(e) => setForm((f) => ({ ...f, rotten_tomatoes_rating: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Metacritic</label>
            <input
              value={form.metacritic_rating || ''}
              onChange={(e) => setForm((f) => ({ ...f, metacritic_rating: e.target.value }))}
              className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Overview</label>
          <textarea
            rows={4}
            value={form.overview || ''}
            onChange={(e) => setForm((f) => ({ ...f, overview: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Trailer URL (YouTube or Vimeo)</label>
          <input
            value={form.trailer_url || ''}
            onChange={(e) => setForm((f) => ({ ...f, trailer_url: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Poster</label>
            {form.poster_url && <img src={form.poster_url} alt="" className="w-24 rounded-lg mb-2 border border-line" />}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'poster_url')} className="text-xs text-mute" />
            {uploading === 'poster_url' && <p className="text-xs text-violet-bright mt-1">Uploading…</p>}
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Backdrop</label>
            {form.backdrop_url && <img src={form.backdrop_url} alt="" className="w-40 rounded-lg mb-2 border border-line" />}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'backdrop_url')} className="text-xs text-mute" />
            {uploading === 'backdrop_url' && <p className="text-xs text-violet-bright mt-1">Uploading…</p>}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Published
          </label>
        </div>

        <div className="bg-panel border border-line rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm text-bone mb-1">Add to collections</p>
            {allCollections.length === 0 && <p className="text-xs text-mute">You have no collections yet.</p>}
            <div className="flex flex-wrap gap-2">
              {allCollections.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border cursor-pointer ${
                    selectedCollections.includes(c.id) ? 'border-violet text-violet-bright' : 'border-line text-mute'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedCollections.includes(c.id)}
                    onChange={() => toggleCollection(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={Boolean(form.hide_from_main)}
              onChange={(e) => setForm((f) => ({ ...f, hide_from_main: e.target.checked }))}
            />
            Hide from the main homepage rows
          </label>
          <p className="text-xs text-mute">
            When ticked, this title stays out of Newest Movies, Newest TV and Top Rated on the homepage. It still shows in its collections, in search and on its own page.
          </p>
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Schedule for later (optional)</label>
          <input
            type="datetime-local"
            value={form.scheduled_at || ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                scheduled_at: e.target.value,
                published: e.target.value ? false : f.published,
              }))
            }
            className="w-full max-w-xs bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
          <p className="text-xs text-mute mt-1">Leave blank to publish immediately based on the toggle above. Setting a time automatically unchecks Published, and it flips on by itself once that time passes.</p>
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Coming Soon: unlock date/time (optional)</label>
          <input
            type="datetime-local"
            value={form.unlock_at || ''}
            onChange={(e) => setForm((f) => ({ ...f, unlock_at: e.target.value }))}
            className="w-full max-w-xs bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
          <p className="text-xs text-mute mt-1">If set, this title shows a locked "Coming Soon" card with a countdown until this time, even while Published is on.</p>
        </div>

        <button
          disabled={saving}
          className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add title'}
        </button>
      </form>

      {isEdit && (
        <div className="max-w-2xl space-y-10">
          <GalleryManager movieId={Number(id)} tmdbSuggestions={galleryFromTmdb} />
          <SimilarTitlesPicker movieId={Number(id)} tmdbId={form.tmdb_id} type={form.type} />
        </div>
      )}
    </AdminLayout>
  );
}
