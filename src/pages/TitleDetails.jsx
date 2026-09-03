import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal.jsx';
import { ErrorState } from '../components/States.jsx';
import { fetchTitleById } from '../lib/titles.js';

export default function TitleDetails() {
  const { id } = useParams();
  const [title, setTitle] = useState(null);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setTitle(null);
    setError(null);
    fetchTitleById(id).then(setTitle).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="max-w-4xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!title) return <div className="max-w-4xl mx-auto px-4 py-16 text-mute">Loading…</div>;

  return (
    <div>
      <div className="relative h-[45vh] min-h-[280px] w-full overflow-hidden">
        {title.backdrop_url && (
          <img src={title.backdrop_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={title.poster_url}
            alt={title.title}
            className="w-40 md:w-56 rounded-xl border border-line shrink-0 self-start shadow-glow"
          />
          <div className="pt-2 md:pt-24">
            {title.featured && (
              <span className="inline-block mb-2 text-xs font-medium text-violet-bright bg-violet-dim/40 border border-violet/40 rounded-full px-3 py-1">
                Featured
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl text-bone">{title.title}</h1>
            <p className="text-mute mt-2 text-sm">
              {title.year}
              {title.rating != null ? ` · ★ ${title.rating}` : ''}
              {title.platform ? ` · ${title.platform}` : ''}
            </p>
            {title.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {title.genres.map((g) => (
                  <span key={g} className="text-xs text-bone bg-panel border border-line rounded-full px-3 py-1">
                    {g}
                  </span>
                ))}
              </div>
            )}
            <p className="text-bone/90 mt-5 max-w-2xl leading-relaxed">{title.overview}</p>

            {title.trailer_url && (
              <button
                onClick={() => setShowTrailer(true)}
                className="mt-6 inline-flex items-center gap-2 bg-violet hover:bg-violet-bright transition-colors text-bone px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Watch trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {showTrailer && <TrailerModal url={title.trailer_url} onClose={() => setShowTrailer(false)} />}
    </div>
  );
}
