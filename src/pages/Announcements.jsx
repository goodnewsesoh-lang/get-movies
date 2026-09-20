import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedAnnouncements } from '../lib/announcements.js';
import { EmptyState, ErrorState } from '../components/States.jsx';

export default function Announcements() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedAnnouncements().then(setPosts).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-bone mb-6">Announcements</h1>

      {error && <ErrorState message={error} />}
      {!error && posts === null && <p className="text-mute">Loading…</p>}
      {!error && posts && posts.length === 0 && <EmptyState title="No announcements yet" />}

      <div className="space-y-6">
        {posts?.map((p) => (
          <Link
            key={p.id}
            to={`/announcements/${p.slug}`}
            className="block bg-panel border border-line rounded-xl p-5 hover:border-violet/60 transition-colors"
          >
            {p.images?.[0] && (
              <img src={p.images[0]} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
            )}
            <h2 className="font-display text-xl text-bone mb-2">{p.title}</h2>
            {p.excerpt && <p className="text-mute text-sm line-clamp-3">{p.excerpt}</p>}
            <p className="text-violet-bright text-sm mt-3">Read more →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
