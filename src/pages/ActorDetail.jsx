import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTmdbPerson } from '../lib/tmdb.js';
import { ErrorState } from '../components/States.jsx';

export default function ActorDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPerson(null);
    setError(null);
    fetchTmdbPerson(id).then(setPerson).catch(() => setError('Could not load this person.'));
  }, [id]);

  if (error) return <div className="max-w-3xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!person) return <div className="max-w-3xl mx-auto px-4 py-16 text-mute">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        {person.profile_url && (
          <img src={person.profile_url} alt={person.name} className="w-32 sm:w-40 rounded-xl border border-line shrink-0" />
        )}
        <div>
          <h1 className="font-display text-3xl text-bone mb-2">{person.name}</h1>
          {person.birthday && <p className="text-mute text-sm">Born {person.birthday}{person.place_of_birth ? ` · ${person.place_of_birth}` : ''}</p>}
          <p className="text-bone/90 mt-4 leading-relaxed">{person.bio}</p>
        </div>
      </div>

      {person.filmography.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-bone mb-4">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {person.filmography.map((f) => (
              <div key={f.id} className="bg-panel border border-line rounded-xl overflow-hidden">
                {f.poster_url && <img src={f.poster_url} alt={f.title} className="w-full aspect-[2/3] object-cover" />}
                <div className="p-2">
                  <p className="text-bone text-xs font-medium line-clamp-1">{f.title}</p>
                  <p className="text-mute text-[11px]">{f.year}{f.character ? ` · ${f.character}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
