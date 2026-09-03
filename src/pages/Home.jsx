import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TitleRow from '../components/TitleRow.jsx';
import TrailerModal from '../components/TrailerModal.jsx';
import { fetchTitles } from '../lib/titles.js';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [latestMovies, setLatestMovies] = useState(null);
  const [latestTv, setLatestTv] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetchTitles({ featuredOnly: true, limit: 1 }).then((r) => setFeatured(r[0] ?? null));
    fetchTitles({ type: 'movie', sort: 'newest', limit: 12 }).then(setLatestMovies);
    fetchTitles({ type: 'tv', sort: 'newest', limit: 12 }).then(setLatestTv);
    fetchTitles({ sort: 'rating', limit: 12 }).then(setRecommended);
  }, []);

  return (
    <div>
      {featured && (
        <section className="relative min-h-[70vh] flex items-end overflow-hidden">
          {featured.backdrop_url && (
            <img
              src={featured.backdrop_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />

          <div className="relative max-w-6xl mx-auto px-4 pb-14 flex flex-col md:flex-row gap-6 items-end">
            {featured.poster_url && (
              <img
                src={featured.poster_url}
                alt={featured.title}
                className="hidden md:block w-44 rounded-xl border border-line shadow-glow"
              />
            )}
            <div className="max-w-xl">
              <p className="text-violet-bright text-xs font-medium tracking-wide mb-2">Featured</p>
              <h1 className="font-display text-4xl md:text-5xl text-bone leading-tight">
                {featured.title}
              </h1>
              <p className="text-mute mt-3 text-sm">
                {featured.year}
                {featured.rating != null ? ` · ★ ${featured.rating}` : ''}
                {featured.genres?.length ? ` · ${featured.genres.slice(0, 3).join(', ')}` : ''}
              </p>
              <p className="text-bone/90 mt-4 line-clamp-3">{featured.overview}</p>
              <div className="flex gap-3 mt-6">
                {featured.trailer_url && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="bg-violet hover:bg-violet-bright transition-colors text-bone px-5 py-2.5 rounded-lg text-sm font-medium"
                  >
                    Watch trailer
                  </button>
                )}
                <Link
                  to={`/title/${featured.id}`}
                  className="bg-panel hover:bg-panel2 border border-line transition-colors text-bone px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <TitleRow heading="Latest Movies" titles={latestMovies} />
      <TitleRow heading="Latest TV Shows" titles={latestTv} />
      <TitleRow heading="Recommended For You" titles={recommended} />

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-display text-2xl text-bone mb-4">Browse by Genre</h2>
        <div className="flex flex-wrap gap-3">
          {['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Fantasy', 'Crime', 'Documentary'].map((g) => (
            <Link
              key={g}
              to={`/genres/${encodeURIComponent(g)}`}
              className="px-4 py-2 rounded-full bg-panel border border-line text-sm text-bone hover:border-violet hover:text-violet-bright transition-colors"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      {showTrailer && featured?.trailer_url && (
        <TrailerModal url={featured.trailer_url} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  );
}
