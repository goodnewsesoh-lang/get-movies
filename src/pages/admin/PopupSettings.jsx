import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import WelcomePopup from '../../components/WelcomePopup.jsx';
import { fetchSiteSettings, updateSiteSettings } from '../../lib/settings.js';
import { fetchAllCollectionsForAdmin } from '../../lib/collections.js';

const defaults = {
  popup_enabled: false,
  popup_source: 'newest',
  popup_collection_id: '',
  popup_count: 8,
  popup_delay_seconds: 4,
  popup_repeat_hours: 24,
  popup_title: 'Picked for you',
};

function fromRow(row) {
  const out = { ...defaults };
  Object.keys(defaults).forEach((k) => {
    if (row && row[k] !== undefined && row[k] !== null) out[k] = row[k];
  });
  return out;
}

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
};

const fieldClass = 'w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm';

export default function PopupSettings() {
  const [form, setForm] = useState(null);
  const [collections, setCollections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then((row) => setForm(fromRow(row)))
      .catch((e) => setError(e.message));
    fetchAllCollectionsForAdmin().then(setCollections).catch(() => {});
  }, []);

  const set = (key, value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (form.popup_source === 'collection' && !form.popup_collection_id) {
      setError('Please choose a collection, or pick a different source.');
      return;
    }

    setSaving(true);
    try {
      await updateSiteSettings({
        popup_enabled: form.popup_enabled,
        popup_source: form.popup_source,
        popup_collection_id:
          form.popup_source === 'collection' && form.popup_collection_id ? form.popup_collection_id : null,
        popup_count: clampNum(form.popup_count, 3, 12, 8),
        popup_delay_seconds: clampNum(form.popup_delay_seconds, 0, 30, 4),
        popup_repeat_hours: clampNum(form.popup_repeat_hours, 1, 168, 24),
        popup_title: (form.popup_title || '').trim().slice(0, 40) || 'Picked for you',
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <AdminLayout>
        {error ? <p className="text-sm text-red-400">{error}</p> : <p className="text-mute">Loading…</p>}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl text-bone mb-2">Welcome Pop-up</h1>
      <p className="text-mute text-sm mb-6">
        A small window on the homepage that shows recommendations. Visitors can swipe or tap the arrows, tap a title to
        open it, and close it with the X.
      </p>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-5 max-w-xl">
        <label className="flex items-center gap-3 text-sm text-bone">
          <input
            type="checkbox"
            checked={form.popup_enabled}
            onChange={(e) => set('popup_enabled', e.target.checked)}
          />
          Show the pop-up on the homepage
        </label>

        <div>
          <label className="block text-sm text-mute mb-1">Which titles to show</label>
          <select
            value={form.popup_source}
            onChange={(e) => set('popup_source', e.target.value)}
            className={fieldClass}
          >
            <option value="newest">My newest titles</option>
            <option value="featured">My Featured titles</option>
            <option value="collection">A collection I choose</option>
          </select>
        </div>

        {form.popup_source === 'collection' && (
          <div>
            <label className="block text-sm text-mute mb-1">Collection</label>
            <select
              value={form.popup_collection_id || ''}
              onChange={(e) => set('popup_collection_id', e.target.value)}
              className={fieldClass}
            >
              <option value="">Choose a collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.published ? '' : ' (draft)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-mute mb-1">How many (3–12)</label>
            <input
              type="number"
              min="3"
              max="12"
              value={form.popup_count}
              onChange={(e) => set('popup_count', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Delay (seconds)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={form.popup_delay_seconds}
              onChange={(e) => set('popup_delay_seconds', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm text-mute mb-1">Again after (hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={form.popup_repeat_hours}
              onChange={(e) => set('popup_repeat_hours', e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-mute mb-1">Heading (up to 40 characters)</label>
          <input
            value={form.popup_title}
            maxLength={40}
            onChange={(e) => set('popup_title', e.target.value)}
            className={fieldClass}
          />
        </div>

        <p className="text-mute text-xs">
          Visitors see it once, then it stays away for the hours you set. It only appears on the homepage, and titles
          without a poster are skipped.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={saving}
            className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="bg-panel border border-line hover:border-violet text-bone px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Preview
          </button>
          {saved && <span className="text-sm text-violet-bright">Saved</span>}
        </div>
      </form>

      {preview && (
        <WelcomePopup
          config={{ ...form, popup_collection_id: form.popup_collection_id || null }}
          onClose={() => setPreview(false)}
        />
      )}
    </AdminLayout>
  );
}
