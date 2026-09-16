import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  createCollection,
  updateCollection,
  fetchCollectionById,
  fetchCollectionItems,
  addMovieToCollection,
  removeMovieFromCollection,
  reorderCollectionItem,
} from '../../lib/collections.js';
import { fetchAllTitlesForAdmin, uploadImage } from '../../lib/titles.js';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  cover_url: '',
  banner_url: '',
  published: true,
  show_on_homepage: false,
  homepage_order: 0,
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CollectionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [movieQuery, setMovieQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    fetchAllTitlesForAdmin().then(setAllMovies).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchCollectionById(id).then(setForm);
      fetchCollectionItems(id).then(setItems);
    }
  }, [id, isEdit]);

  const handleNameChange = (name) => {
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, 'collections');
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateCollection(id, form);
      } else {
        const created = await createCollection(form);
        navigate(`/admin/collections/${created.id}/edit`);
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addMovie = async (movie) => {
    if (items.find((m) => m.id === movie.id)) return;
    await addMovieToCollection(id, movie.id, items.length);
    setItems((prev) => [...prev, movie]);
  };

  const removeMovie = async (movieId) => {
    await removeMovieFromCollection(id, movieId);
    setItems((prev) => prev.filter((m) => m.id !== movieId));
  };

  const moveItem = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    await Promise.all(newItems.map((m, i) => reorderCollectionItem(id, m.id, i)));
  };

  const availableMovies = allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(movieQuery.toLowerCase()) &&
      !items.find((i) => i.id === m.id)
  );

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">{isEdit ? 'Edit collection' : 'New collection'}</h1>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-5 max-w-2xl mb-10">
        <div>
          <label className="block text-sm text-mute mb-1">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Slug (used in the URL)</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mute mb-1">Cover image</label>
            {form.cover_url && <img src={form.cover_url} alt="" className="w-24 rounded-lg mb-2 border border-line" />}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover_url')} className="text-xs text-mute" />
            {uploading === 'cover_url' && <p className="text-xs text-violet-bright mt-1">Uploading…</p>}
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Banner image (optional)</label>
            {form.banner_url && <img src={form.banner_url} alt="" className="w-40 rounded-lg mb-2 border border-line" />}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} className="text-xs text-mute" />
            {uploading === 'banner_url' && <p className="text-xs text-violet-bright mt-1">Uploading…</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={form.show_on_homepage}
              onChange={(e) => setForm((f) => ({ ...f, show_on_homepage: e.target.checked }))}
            />
            Show on homepage
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-mute">Homepage order</label>
            <input
              type="number"
              value={form.homepage_order}
              onChange={(e) => setForm((f) => ({ ...f, homepage_order: Number(e.target.value) }))}
              className="w-20 bg-panel border border-line rounded-lg px-2 py-1 text-bone text-sm"
            />
          </div>
        </div>

        <button
          disabled={saving}
          className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create collection'}
        </button>
      </form>

      {isEdit && (
        <div className="max-w-2xl">
          <h2 className="font-display text-xl text-bone mb-4">Titles in this collection</h2>

          <div className="space-y-2 mb-6">
            {items.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 bg-panel border border-line rounded-lg px-3 py-2">
                {m.poster_url && <img src={m.poster_url} alt="" className="w-8 h-11 object-cover rounded" />}
                <span className="text-bone text-sm flex-1">{m.title}</span>
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-mute text-xs disabled:opacity-30">↑</button>
                <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="text-mute text-xs disabled:opacity-30">↓</button>
                <button onClick={() => removeMovie(m.id)} className="text-red-400 text-xs">Remove</button>
              </div>
            ))}
            {items.length === 0 && <p className="text-mute text-sm">No titles added yet.</p>}
          </div>

          <label className="block text-sm text-mute mb-1">Add a title</label>
          <input
            value={movieQuery}
            onChange={(e) => setMovieQuery(e.target.value)}
            placeholder="Search your movies/shows…"
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone mb-2"
          />
          {movieQuery && (
            <div className="max-h-64 overflow-y-auto space-y-1 border border-line rounded-lg p-2">
              {availableMovies.slice(0, 20).map((m) => (
                <button
                  key={m.id}
                  onClick={() => addMovie(m)}
                  className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-panel2"
                >
                  {m.poster_url && <img src={m.poster_url} alt="" className="w-8 h-11 object-cover rounded" />}
                  <span className="text-bone text-sm">{m.title}</span>
                </button>
              ))}
              {availableMovies.length === 0 && <p className="text-mute text-sm px-2">No matches.</p>}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
