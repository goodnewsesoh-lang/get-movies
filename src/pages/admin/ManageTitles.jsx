import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllTitlesForAdmin, deleteTitle, updateTitle } from '../../lib/titles.js';

export default function ManageTitles() {
  const [titles, setTitles] = useState(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = () => fetchAllTitlesForAdmin().then(setTitles);

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await deleteTitle(id);
    setConfirmId(null);
    load();
  };

  const toggle = async (t, field) => {
    await updateTitle(t.id, { [field]: !t[field] });
    load();
  };

  const filtered = (titles ?? []).filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
    const matchesType = !typeFilter || t.type === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <h1 className="font-display text-2xl text-bone flex-1">Manage Titles</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="bg-panel border border-line rounded-lg px-3 py-2 text-sm text-bone"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-panel border border-line rounded-lg px-3 py-2 text-sm text-bone"
        >
          <option value="">All types</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>
      </div>

      {titles === null && <p className="text-mute">Loading…</p>}

      {titles && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-mute border-b border-line">
                <th className="py-2 pr-3">Poster</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3">Rating</th>
                <th className="py-2 pr-3">Published</th>
                <th className="py-2 pr-3">Featured</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-line/60">
                  <td className="py-2 pr-3">
                    {t.poster_url ? (
                      <img src={t.poster_url} alt="" className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-panel2 rounded" />
                    )}
                  </td>
                  <td className="py-2 pr-3 text-bone">{t.title}</td>
                  <td className="py-2 pr-3 text-mute">{t.type === 'tv' ? 'TV' : 'Movie'}</td>
                  <td className="py-2 pr-3 text-mute">{t.year}</td>
                  <td className="py-2 pr-3 text-mute">{t.rating ?? '—'}</td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => toggle(t, 'published')}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        t.published ? 'border-violet text-violet-bright' : 'border-line text-mute'
                      }`}
                    >
                      {t.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => toggle(t, 'featured')}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        t.featured ? 'border-violet text-violet-bright' : 'border-line text-mute'
                      }`}
                    >
                      {t.featured ? 'Featured' : 'Not featured'}
                    </button>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <Link to={`/admin/titles/${t.id}/edit`} className="text-violet-bright text-xs mr-3">
                      Edit
                    </Link>
                    {confirmId === t.id ? (
                      <span className="text-xs">
                        <button onClick={() => remove(t.id)} className="text-red-400 mr-2">Confirm</button>
                        <button onClick={() => setConfirmId(null)} className="text-mute">Cancel</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmId(t.id)} className="text-red-400 text-xs">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-mute text-sm py-6">No titles match.</p>}
        </div>
      )}
    </AdminLayout>
  );
        }
