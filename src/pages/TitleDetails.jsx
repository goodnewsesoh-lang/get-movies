import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal.jsx';
import TitleCard from '../components/TitleCard.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import { ErrorState } from '../components/States.jsx';
import { fetchTitleById } from '../lib/titles.js';
import { fetchScreenshots } from '../lib/gallery.js';
import { fetchSimilarTitles } from '../lib/similarTitles.js';
import { fetchCastForMovie } from '../lib/cast.js';

function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <p className="text-xs text-mute uppercase tracking-wide">{label}</p>
      <p className="text-bone text-sm mt-0.5">{Array.isArray(value) ? value.join(', ') : value}</p>
    </div>
  );
}

export default function TitleDetails() {
  const { id } = useParams();
  const [title, setTitle] = useState(null);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [cast, setCast] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setTitle(null);
    setError(null);
    fetchTitleById(id)
      .then((t) => {
        setTitle(t);
        fetchScreenshots(t.id).then(setGallery);
        fetchSimilarTitles(t.id).then(setSimilar);
        fetchCastForMovie(t.id).then(setCast);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="max-w-4xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!title) return <div className="max-w-4xl mx-auto px-4 py-16 text-mute">Loading…</div>;

  const isLocked = title.unlock_at && new Date(title.unlock_at) > new Date();
  const runtimeLabel = title.runtime ? `${Math.floor(title.runtime / 60)}h ${title.runtime % 60}m` : null;

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <img
          src={title.poster_url}
          alt={title.title}
          className="w-48 mx-auto rounded-xl border border-line shadow-glow mb-6 blur-sm"
        />
        <span className="inline-block mb-3 text-xs font-medium text-violet-bright bg-violet-dim/40 border border-violet/40 rounded-full px-3 py-1">
          Coming Soon
        </span>
        <h1 className="font-display text-3xl text-bone mb-2">{title.title}</h1>
        <p className="text-mute text-sm mb-6">{title.year}{title.genres?.length ? ` · ${title.genres.slice(0, 3).join(', ')}` : ''}</p>
        <p className="text-bone text-lg font-medium">
          Unlocks in <CountdownTimer target={title.unlock_at} />
        </p>
      </div>
    );
  }

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
          <div className="pt-2 md:pt-24 flex-1">
            {title.featured && (
              <span className="inline-block mb-2 text-xs font-medium text-violet-bright bg-violet-dim/40 border border-violet/40 rounded-full px-3 py-1">
                Featured
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl text-bone">{title.title}</h1>
            <p className="text-mute mt-2 text-sm">
              {title.year}
              {title.rating != null ? ` · ★ ${title.rating}` : ''}
              {runtimeLabel ? ` · ${runtimeLabel}` : ''}
              {title.platform ? ` · ${title.platform}` : ''}
            </p>

            {(title.imdb_rating || title.rotten_tomatoes_rating || title.metacritic_rating) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {title.imdb_rating && (
                  <span className="text-xs text-bone bg-panel border border-line rounded-full px-3 py-1">IMDb {title.imdb_rating}</span>
                )}
                {title.rotten_tomatoes_rating && (
                  <span className="text-xs text-bone bg-panel border border-line rounded-full px-3 py-1">RT {title.rotten_tomatoes_rating}</span>
                )}
                {title.metacritic_rating && (
                  <span className="text-xs text-bone bg-panel border border-line rounded-full px-3 py-1">Metacritic {title.metacritic_rating}</span>
                )}
              </div>
            )}

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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-w-xl">
              <InfoRow label="Director" value={title.director} />
              <InfoRow label="Release date" value={title.release_date} />
              <InfoRow label="Country" value={title.country} />
              <InfoRow label="Languages" value={title.languages} />
              <InfoRow label="Writers" value={title.writers} />
              <InfoRow label="Producers" value={title.producers} />
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-bone mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {cast.map((c) => (
                <Link key={c.id} to={`/actor/${c.tmdb_person_id}`} className="shrink-0 w-24 text-center snap-start">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-panel border border-line mx-auto mb-2">
                    {c.profile_url ? (
                      <img src={c.profile_url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mute text-xs">No photo</div>
                    )}
                  </div>
                  <p className="text-bone text-xs font-medium line-clamp-1">{c.name}</p>
                  {c.character_name && <p className="text-mute text-[11px] line-clamp-1">{c.character_name}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-bone mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((s) => (
                <button key={s.id} onClick={() => setLightbox(s.image_url)}>
                  <img
                    src={s.image_url}
                    alt=""
                    className="w-full aspect-video object-cover rounded-lg border border-line hover:border-violet/60 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-bone mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similar.map((t) => (
                <TitleCard key={t.id} title={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showTrailer && <TrailerModal url={title.trailer_url} onClose={() => setShowTrailer(false)} />}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
