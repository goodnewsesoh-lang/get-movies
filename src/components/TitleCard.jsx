import { Link } from 'react-router-dom';

export default function TitleCard({ title }) {
  const {
    id,
    title: name,
    year,
    rating,
    type,
    poster_url,
    genres = [],
  } = title;

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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute text-sm px-3 text-center">
            No poster yet
          </div>
        )}
        {typeof rating === 'number' && (
          <span className="absolute top-2 right-2 rounded-md bg-ink/80 backdrop-blur px-1.5 py-0.5 text-xs font-medium text-bone border border-line">
            {rating.toFixed(1)}
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-violet/90 px-1.5 py-0.5 text-[11px] font-medium text-bone">
          {type === 'tv' ? 'TV' : 'Movie'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-bone leading-snug line-clamp-2">{name}</h3>
        <p className="text-xs text-mute mt-1">
          {year}
          {genres.length ? ` · ${genres.slice(0, 2).join(', ')}` : ''}
        </p>
      </div>
    </Link>
  );
  }
