import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllAnnouncementsForAdmin, deleteAnnouncement, updateAnnouncement } from '../../lib/announcements.js';

export default function Announcements() {
  const [posts, setPosts] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => fetchAllAnnouncementsForAdmin().then(setPosts);

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await deleteAnnouncement(id);
    setConfirmId(null);
    load();
  };

  const toggle = async (p, field) => {
    await updateAnnouncement(p.id, { [field]: !p[field] });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-bone">Announcements</h1>
        <Link
          to="/admin/announcements/new"
          className="bg-violet hover:bg-violet-bright text-bone px-4 py-2 rounded-lg text-sm"
        >
          New Post
        </Link>
      </div>

      {posts === null && <p className="text-mute">Loading…</p>}
      {posts && posts.length === 0 && <p className="text-mute text-sm">No announcements yet.</p>}

      <div className="space-y-2">
        {posts?.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3">
            <span className="text-bone text-sm font-medium flex-1 min-w-[120px]">{p.title}</span>

            <button
              onClick={() => toggle(p, 'published')}
              className={`text-xs px-2 py-1 rounded-full border ${
                p.published ? 'border-violet text-violet-bright' : 'border-line text-mute'
              }`}
            >
              {p.published ? 'Published' : 'Draft'}
            </button>

            <button
              onClick={() => toggle(p, 'show_on_homepage')}
              className={`text-xs px-2 py-1 rounded-full border ${
                p.show_on_homepage ? 'border-violet text-violet-bright' : 'border-line text-mute'
              }`}
            >
              {p.show_on_homepage ? 'On homepage' : 'Not on homepage'}
            </button>

            <Link to={`/admin/announcements/${p.id}/edit`} className="text-violet-bright text-xs">
              Edit
            </Link>

            {confirmId === p.id ? (
              <span className="text-xs">
                <button onClick={() => remove(p.id)} className="text-red-400 mr-2">Confirm</button>
                <button onClick={() => setConfirmId(null)} className="text-mute">Cancel</button>
              </span>
            ) : (
              <button onClick={() => setConfirmId(p.id)} className="text-red-400 text-xs">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
