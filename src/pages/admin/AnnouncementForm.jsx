import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  createAnnouncement,
  updateAnnouncement,
  fetchAnnouncementById,
} from '../../lib/announcements.js';
import { uploadImage } from '../../lib/titles.js';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  images: [],
  published: true,
  featured: false,
  show_on_homepage: false,
};

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AnnouncementForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchAnnouncementById(id).then((p) => setForm({ ...emptyForm, ...p, images: p.images ?? [] }));
    }
  }, [id, isEdit]);

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : slugify(title) }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'announcements');
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateAnnouncement(id, form);
      } else {
        await createAnnouncement(form);
      }
      navigate('/admin/announcements');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">{isEdit ? 'Edit post' : 'New post'}</h1>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm text-mute mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
          <label className="block text-sm text-mute mb-1">Short preview (shown on homepage/list)</label>
          <textarea
            rows={2}
            value={form.excerpt || ''}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Full content</label>
          <textarea
            rows={10}
            value={form.content || ''}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone"
          />
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Images</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.images.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-line" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-1 -right-1 bg-ink border border-line rounded-full w-5 h-5 text-xs text-mute"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-mute" />
          {uploading && <p className="text-xs text-violet-bright mt-1">Uploading…</p>}
        </div>

        <div className="flex flex-wrap gap-6">
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
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Pinned
          </label>
        </div>

        <button
          disabled={saving}
          className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
        </button>
      </form>
    </AdminLayout>
  );
}
