import { useEffect, useState } from 'react';
import TitleCard from '../components/TitleCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import { LoadingGrid, EmptyState, ErrorState } from '../components/States.jsx';
import { fetchTitles, fetchAllGenres } from '../lib/titles.js';

export default function Browse({ type, heading }) {
  const [titles, setTitles] = useState(null);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ genre: '', year: '', sort: 'newest' });

  useEffect(() => {
    fetchAllGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    setTitles(null);
    setError(null);
    fetchTitles({
      type,
      genre: filters.genre || undefined,
      year: filters.year || undefined,
      sort: filters.sort,
    })
      .then(setTitles)
      .catch((e) => setError(e.message));
  }, [type, filters]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-bone mb-6">{heading}</h1>
      <FilterBar genres={genres} filters={filters} onChange={setFilters} />

      {error && <ErrorState message={error} />}
      {!error && titles === null && <LoadingGrid />}
      {!error && titles && titles.length === 0 && (
        <EmptyState title="No titles match yet" message="Try a different genre or year." />
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
