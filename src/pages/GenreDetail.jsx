import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import { LoadingGrid, EmptyState, ErrorState } from '../components/States.jsx';
import { fetchTitles } from '../lib/titles.js';

export default function GenreDetail() {
  const { name } = useParams();
  const [titles, setTitles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitles(null);
    fetchTitles({ genre: name, sort: 'newest', limit: 100 })
      .then(setTitles)
      .catch((e) => setError(e.message));
  }, [name]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-bone mb-6">{name}</h1>

      {error && <ErrorState message={error} />}
      {!error && titles === null && <LoadingGrid />}
      {!error && titles && titles.length === 0 && (
        <EmptyState title="Nothing in this genre yet" />
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
