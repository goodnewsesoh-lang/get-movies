import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TitleCard from '../components/TitleCard.jsx';
import { LoadingGrid, EmptyState, ErrorState } from '../components/States.jsx';
import { fetchCollectionBySlug, fetchCollectionItems } from '../lib/collections.js';

export default function CollectionDetail() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [titles, setTitles] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCollection(null);
    setTitles(null);
    setError(null);
    fetchCollectionBySlug(slug)
      .then((c) => {
        setCollection(c);
        return fetchCollectionItems(c.id);
      })
      .then(setTitles)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="max-w-6xl mx-auto px-4 py-16"><ErrorState message="Collection not found." /></div>;

  return (
    <div>
      {collection?.banner_url && (
        <div className="relative h-[35vh] min-h-[220px] w-full overflow-hidden">
          <img src={collection.banner_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl text-bone mb-2">{collection?.name ?? 'Loading…'}</h1>
        {collection?.description && <p className="text-mute mb-6 max-w-2xl">{collection.description}</p>}

        {titles === null && <LoadingGrid />}
        {titles && titles.length === 0 && <EmptyState title="Nothing in this collection yet" />}
        {titles && titles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {titles.map((t) => (
              <TitleCard key={t.id} title={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
  }
