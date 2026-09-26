import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TrailerModal from './TrailerModal.jsx';

export default function FeaturedCarousel({ titles }) {
  const [index, setIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (titles.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % titles.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [titles.length]);

  if (!titles.length) return null;
  const featured = titles[index];

  return (
    <section className="relative min-h-[46vh] sm:min-h-[55vh] md:min-h-[70vh] flex items-end overflow-hidden">
      {featured.backdrop_url && (
        <img
          key={featured.id}
          src={featured.backdrop_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 pb-6 sm:pb-10 md:pb-14 flex flex-col md:flex-row gap-4 md:gap-6 items-end w-full">
        {featured.poster_url && (
          <img
            src={featured.poster_url}
            alt={featured.title}
            className="hidden md:block w-44 rounded-xl border border-line shadow-glow"
          />
        )}
        <div className="max-w-xl flex-1">
          <p className="text-violet-bright text-[11px] sm:text-xs font-medium tracking-wide mb-1.5 sm:mb-2">Featured</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl text-bone leading-tight">{featured.title}</h1>
          <p className="text-mute mt-2 sm:mt-3 text-xs sm:text-sm">
            {featured.year}
            {featured.rating != null ? ` · ★ ${featured.rating}` : ''}
            {featured.genres?.length ? ` · ${featured.genres.slice(0, 3).join(', ')}` : ''}
          </p>
          <p className="text-bone/90 mt-2 sm:mt-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">{featured.overview}</p>
          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-6">
            {featured.trailer_url && (
              <button
                onClick={() => setShowTrailer(true)}
                className="bg-violet hover:bg-violet-bright transition-colors text-bone px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium"
              >
                Watch trailer
              </button>
            )}
            <Link
              to={`/title/${featured.id}`}
              className="bg-panel hover:bg-panel2 border border-line transition-colors text-bone px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium"
            >
              View details
            </Link>
          </div>

          {titles.length > 1 && (
            <div className="flex gap-1.5 sm:gap-2 mt-4 sm:mt-8">
              {titles.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${t.title}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 sm:w-6 bg-violet-bright' : 'w-1.5 bg-mute/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showTrailer && featured.trailer_url && (
        <TrailerModal url={featured.trailer_url} onClose={() => setShowTrailer(false)} />
      )}
    </section>
  );
}
