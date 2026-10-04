import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer.jsx';

export default function TitleCard({ title }) {
  const {
    id,
    title: name,
    year,
    rating,
    type,
    poster_url,
    genres = [],
    unlock_at,
  } = title;

  const isLocked = unlock_at && new Date(unlock_at) > new Date();

  return (
    <Link
      to={`/title/${id}`}
      className="group block rounded-xl overflow-hidden bg-panel border border-line hover:border-violet/60 transition-colors"
    >
      <div className="relative aspect-[2/3] bg-panel2 overflow-hidden">
        {poster_url ? (
          <img
            src={poster_url}
            alt={name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04] ${isLocked ? 'blur-sm' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute text-sm px-3 text-center">
            No poster yet
          </div>
        )}
        {isLocked ? (
          <div className="absolute inset-0 bg-ink/50 flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-bone bg-violet/90 rounded-full px-2 py-0.5">Coming Soon</span>
            <span className="text-[11px] text-bone bg-ink/80 rounded-full px-2 py-0.5">
              <CountdownTimer target={unlock_at} compact />
            </span>
          </div>
        ) : (
          typeof rating === 'number' && (
            <span className="absolute top-2 right-2 rounded-md bg-ink/80 backdrop-blur px-1.5 py-0.5 text-xs font-medium text-bone border border-line">
              {rating.toFixed(1)}
            </span>
          )
        )}
        <span className="absolute top-2 left-2 rounded-md bg-violet/90 px-1.5 py-0.5 text-[11px] font-medium text-bone">
          {type === 'tv' ? 'TV' : 'Movie'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-bone leading-snug line-clamp-2">{name}</h3>
        <p className="text-xs text-mute mt-1">
          {isLocked ? 'Releasing soon' : year}
          {!isLocked && genres.length ? ` · ${genres.slice(0, 2).join(', ')}` : ''}
        </p>
      </div>
    </Link>
  );
}
