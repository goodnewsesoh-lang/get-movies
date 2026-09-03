import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { searchTmdb, getTmdbGenres, mapTmdbResultToDraft, tmdbPosterUrl } from '../../lib/tmdb.js';
import { createTitle, updateTitle, fetchTitleById, uploadImage } from '../../lib/titles.js';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchTitleById(id).then((t) => setForm({ ...emptyForm, ...t, rating: t.rating ?? '' }));
    }
  }, [id, isEdit]);

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
      setError('TMDB search failed — check your API token in src/config.js');
    }
  };

  const applyTmdbResult = (result) => {
    const draft = mapTmdbResultToDraft(result, form.type, tmdbGenreLookup);
    setForm((f) => ({ ...f, ...draft }));
    setTmdbResults([]);
    setTmdbQuery('');
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
      setError('Image upload failed — check your Supabase Storage bucket is set up.');
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      rating: form.rating === '' ? null : Number(form.rating),
    };
    try {
      if (isEdit) {
        await updateTitle(id, payload);
      } else {
        await createTitle(payload);
      }
      navigate('/admin/titles');
    } catch (err) {
      setError(err.message);
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

        {tmdbResults.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            {tmdbResults.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => applyTmdbResult(r)}
                className="text-left"
              >
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
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-5 max-w-2xl">
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

        <button
          disabled={saving}
          className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add title'}
        </button>
      </form>
    </AdminLayout>
  );
  }
