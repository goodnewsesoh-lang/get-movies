import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import { LoadingGrid, EmptyState, ErrorState } from '../components/States.jsx';
import { fetchTitles } from '../lib/titles.js';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [titles, setTitles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) {
      setTitles([]);
      return;
    }
    setTitles(null);
    fetchTitles({ search: q, limit: 100 })
      .then(setTitles)
      .catch((e) => setError(e.message));
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-bone mb-2">Search results</h1>
      <p className="text-mute mb-6">for "{q}"</p>

      {error && <ErrorState message={error} />}
      {!error && titles === null && <LoadingGrid />}
      {!error && titles && titles.length === 0 && (
        <EmptyState title="No matches" message="Try a different title, genre, or year." />
      )}
      {!error && titles && titles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {titles.map((t) => (
            <TitleCard key={t.id} title={t} />
          ))}
        </div>
      )}
    </div>
  );
  }
