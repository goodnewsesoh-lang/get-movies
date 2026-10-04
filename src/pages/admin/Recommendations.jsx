import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllRecommendationsForAdmin, approveRecommendation, deleteRecommendation } from '../../lib/recommendations.js';

export default function Recommendations() {
  const [list, setList] = useState(null);

  const load = () => fetchAllRecommendationsForAdmin().then(setList);

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await approveRecommendation(id);
    load();
  };
  const remove = async (id) => {
    await deleteRecommendation(id);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">Recommendations</h1>
      {list === null && <p className="text-mute">Loading…</p>}
      {list && list.length === 0 && <p className="text-mute text-sm">Nothing submitted yet.</p>}
      <div className="space-y-2">
        {list?.map((r) => (
          <div key={r.id} className="bg-panel border border-line rounded-lg px-4 py-3">
            <p className="text-bone text-sm">{r.message}</p>
            <p className="text-mute text-xs mt-1">— {r.name || 'Anonymous'} · {new Date(r.created_at).toLocaleString()}</p>
            <div className="flex gap-3 mt-2">
              {!r.approved ? (
                <button onClick={() => approve(r.id)} className="text-violet-bright text-xs">Approve</button>
              ) : (
                <span className="text-xs text-mute">Approved</span>
              )}
              <button onClick={() => remove(r.id)} className="text-red-400 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
