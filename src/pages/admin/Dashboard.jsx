import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAdminStats } from '../../lib/titles.js';

const statCards = [
  { key: 'total', label: 'Total titles' },
  { key: 'movies', label: 'Movies' },
  { key: 'tvShows', label: 'TV shows' },
  { key: 'featured', label: 'Featured' },
  { key: 'published', label: 'Published' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
        {statCards.map((c) => (
          <div key={c.key} className="bg-panel border border-line rounded-xl p-4">
            <p className="text-2xl font-semibold text-bone">{stats ? stats[c.key] : '—'}</p>
            <p className="text-xs text-mute mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg text-bone mb-3">Recently added</h2>
      <div className="space-y-2">
        {stats?.recent?.map((t) => (
          <Link
            key={t.id}
            to={`/admin/titles/${t.id}/edit`}
            className="flex items-center justify-between bg-panel border border-line rounded-lg px-4 py-3 hover:border-violet/60"
          >
            <span className="text-bone text-sm">{t.title}</span>
            <span className="text-mute text-xs">{t.type === 'tv' ? 'TV' : 'Movie'} · {t.year}</span>
          </Link>
        ))}
        {stats && stats.recent.length === 0 && (
          <p className="text-mute text-sm">No titles added yet.</p>
        )}
      </div>
    </AdminLayout>
  );
  }
