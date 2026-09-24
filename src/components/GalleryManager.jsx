import { useEffect, useState } from 'react';
import { fetchScreenshots, addScreenshot, removeScreenshot } from '../lib/gallery.js';
import { uploadImage } from '../lib/titles.js';

export default function GalleryManager({ movieId, tmdbSuggestions = [] }) {
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = () => fetchScreenshots(movieId).then(setScreenshots);

  useEffect(() => {
    if (movieId) load();
  }, [movieId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'screenshots');
      await addScreenshot(movieId, url, screenshots.length);
      load();
    } finally {
      setUploading(false);
    }
  };

  const addFromTmdb = async (url) => {
    if (screenshots.find((s) => s.image_url === url)) return;
    await addScreenshot(movieId, url, screenshots.length);
    load();
  };

  const remove = async (id) => {
    await removeScreenshot(id);
    load();
  };

  const unusedSuggestions = tmdbSuggestions.filter(
    (url) => !screenshots.find((s) => s.image_url === url)
  );

  return (
    <div>
      <h2 className="font-display text-xl text-bone mb-3">Gallery</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        {screenshots.map((s) => (
          <div key={s.id} className="relative">
            <img src={s.image_url} alt="" className="w-28 h-16 object-cover rounded-lg border border-line" />
            <button
              onClick={() => remove(s.id)}
              className="absolute -top-1 -right-1 bg-ink border border-line rounded-full w-5 h-5 text-xs text-mute"
            >
              ✕
            </button>
          </div>
        ))}
        {screenshots.length === 0 && <p className="text-mute text-sm">No gallery images yet.</p>}
      </div>

      <label className="block text-sm text-mute mb-1">Upload your own image</label>
      <input type="file" accept="image/*" onChange={handleUpload} className="text-xs text-mute mb-4" />
      {uploading && <p className="text-xs text-violet-bright">Uploading…</p>}

      {unusedSuggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-mute mb-2">Suggested from TMDB — tap to add</p>
          <div className="flex flex-wrap gap-3">
            {unusedSuggestions.map((url) => (
              <button key={url} onClick={() => addFromTmdb(url)} className="relative">
                <img src={url} alt="" className="w-28 h-16 object-cover rounded-lg border border-line hover:border-violet" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
