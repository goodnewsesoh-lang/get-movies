import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchSiteSettings, updateSiteSettings } from '../../lib/settings.js';

const socialFields = [
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'whatsapp_url', label: 'WhatsApp Channel' },
  { key: 'telegram_url', label: 'Telegram' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'tiktok_url', label: 'TikTok' },
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'x_url', label: 'X / Twitter' },
];

const contactFields = [
  { key: 'contact_email', label: 'Email address' },
  { key: 'contact_whatsapp', label: 'WhatsApp number or link' },
  { key: 'contact_telegram', label: 'Telegram handle or link' },
];

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSiteSettings().then(setForm).catch((e) => setError(e.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { id, ...payload } = form;
      await updateSiteSettings(payload);
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
        <p className="text-mute">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-2">Settings</h1>
      <p className="text-mute text-sm mb-6">
        Leave anything blank and it won't show on the website.
      </p>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-6 max-w-xl">
        <div>
          <h2 className="font-display text-lg text-bone mb-3">Social links</h2>
          <div className="space-y-3">
            {socialFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm text-mute mb-1">{f.label}</label>
                <input
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder="https://…"
                  className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-bone mb-3">Contact details</h2>
          <div className="space-y-3">
            {contactFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm text-mute mb-1">{f.label}</label>
                <input
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            disabled={saving}
            className="bg-violet hover:bg-violet-bright transition-colors text-bone px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved && <span className="text-sm text-violet-bright">Saved</span>}
        </div>
      </form>
    </AdminLayout>
  );
}
