import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal.jsx';
import TitleCard from '../components/TitleCard.jsx';
import { ErrorState } from '../components/States.jsx';
import { fetchTitleById } from '../lib/titles.js';
import { fetchScreenshots } from '../lib/gallery.js';
import { fetchSimilarTitles } from '../lib/similarTitles.js';

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
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setTitle(null);
    setError(null);
    fetchTitleById(id)
      .then((t) => {
        setTitle(t);
        fetchScreenshots(t.id).then(setGallery);
        fetchSimilarTitles(t.id).then(setSimilar);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="max-w-4xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!title) return <div className="max-w-4xl mx-auto px-4 py-16 text-mute">Loading…</div>;

  const runtimeLabel = title.runtime ? `${Math.floor(title.runtime / 60)}h ${title.runtime % 60}m` : null;

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
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
        }
