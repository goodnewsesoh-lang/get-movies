import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllGenres } from '../lib/titles.js';
import { EmptyState, ErrorState } from '../components/States.jsx';

export default function Genres() {
  const [genres, setGenres] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllGenres().then(setGenres).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-bone mb-6">Genres</h1>

      {error && <ErrorState message={error} />}
      {!error && genres === null && <p className="text-mute">Loading genres…</p>}
      {!error && genres && genres.length === 0 && (
        <EmptyState title="No genres yet" message="Genres appear once titles are published." />
      )}
      {!error && genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {genres.map((g) => (
            <Link
              key={g}
              to={`/genres/${encodeURIComponent(g)}`}
              className="px-4 py-2 rounded-full bg-panel border border-line text-sm text-bone hover:border-violet hover:text-violet-bright transition-colors"
            >
              {g}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
    }
