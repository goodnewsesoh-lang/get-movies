import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllCollectionsForAdmin, deleteCollection, updateCollection } from '../../lib/collections.js';

export default function Collections() {
  const [collections, setCollections] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => fetchAllCollectionsForAdmin().then(setCollections);

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await deleteCollection(id);
    setConfirmId(null);
    load();
  };

  const toggle = async (c, field) => {
    await updateCollection(c.id, { [field]: !c[field] });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-bone">Collections</h1>
        <Link
          to="/admin/collections/new"
          className="bg-violet hover:bg-violet-bright text-bone px-4 py-2 rounded-lg text-sm"
        >
          New Collection
        </Link>
      </div>

      {collections === null && <p className="text-mute">Loading…</p>}

      {collections && collections.length === 0 && (
        <p className="text-mute text-sm">No collections yet — create your first one.</p>
      )}

      <div className="space-y-2">
        {collections?.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3">
            <span className="text-bone text-sm font-medium flex-1 min-w-[120px]">{c.name}</span>

            <button
              onClick={() => toggle(c, 'published')}
              className={`text-xs px-2 py-1 rounded-full border ${
                c.published ? 'border-violet text-violet-bright' : 'border-line text-mute'
              }`}
            >
              {c.published ? 'Published' : 'Draft'}
            </button>

            <button
              onClick={() => toggle(c, 'show_on_homepage')}
              className={`text-xs px-2 py-1 rounded-full border ${
                c.show_on_homepage ? 'border-violet text-violet-bright' : 'border-line text-mute'
              }`}
            >
              {c.show_on_homepage ? 'On homepage' : 'Hidden from homepage'}
            </button>

            <Link to={`/admin/collections/${c.id}/edit`} className="text-violet-bright text-xs">
              Edit
            </Link>

            {confirmId === c.id ? (
              <span className="text-xs">
                <button onClick={() => remove(c.id)} className="text-red-400 mr-2">Confirm</button>
                <button onClick={() => setConfirmId(null)} className="text-mute">Cancel</button>
              </span>
            ) : (
              <button onClick={() => setConfirmId(c.id)} className="text-red-400 text-xs">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
