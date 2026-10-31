import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import { Spinner, EmptyState, ErrorState } from '../components/States.jsx';
import { fetchTitles, fetchAllGenres } from '../lib/titles.js';

const PAGE = 24;

export default function Genres() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('g') ?? '';
  const [genres, setGenres] = useState(null);
  const [titles, setTitles] = useState(null);
  const [limit, setLimit] = useState(PAGE);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllGenres().then(setGenres).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setLimit(PAGE);
    setTitles(null);
  }, [selected]);

  useEffect(() => {
    let active = true;
    setError(null);
    fetchTitles({ genre: selected || undefined, sort: 'rating', limit })
      .then((t) => {
        if (active) setTitles(t);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [selected, limit]);

  const choose = (g) => setParams(g ? { g } : {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-bone mb-6">Genres</h1>

      {genres === null && !error && <Spinner className="py-6" />}

      {genres && (
        <div className="flex flex-wrap gap-3 mb-8">
          {['', ...genres].map((g) => {
            const isActive = g === selected;
            return (
              <button
                key={g || 'all'}
                onClick={() => choose(g)}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  isActive
                    ? 'bg-violet border-violet text-bone'
                    : 'bg-panel border-line text-bone hover:border-violet hover:text-violet-bright'
                }`}
              >
                {g || 'All'}
              </button>
            );
          })}
        </div>
      )}

      <h2 className="text-xl text-bone mb-4">{selected || 'Suggested picks'}</h2>

      {error && <ErrorState message={error} />}
      {!error && titles === null && <Spinner className="py-20" />}
      {!error && titles && titles.length === 0 && (
        <EmptyState title="Nothing here yet" message="No published titles in this genre yet." />
      )}
      {!error && titles && titles.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {titles.map((t) => (
              <TitleCard key={t.id} title={t} />
            ))}
          </div>
          {titles.length >= limit && (
            <div className="text-center mt-8">
              <button
                onClick={() => setLimit((l) => l + PAGE)}
                className="bg-panel border border-line hover:border-violet text-bone px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
