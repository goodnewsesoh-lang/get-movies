import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel.jsx';
import TitleRow from '../components/TitleRow.jsx';
import { fetchTitles } from '../lib/titles.js';
import { fetchHomepageCollections, fetchCollectionItems } from '../lib/collections.js';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [latestMovies, setLatestMovies] = useState(null);
  const [latestTv, setLatestTv] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionTitles, setCollectionTitles] = useState({});

  useEffect(() => {
    fetchTitles({ featuredOnly: true, limit: 10 }).then(setFeatured);
    fetchTitles({ type: 'movie', sort: 'newest', limit: 12 }).then(setLatestMovies);
    fetchTitles({ type: 'tv', sort: 'newest', limit: 12 }).then(setLatestTv);

    fetchHomepageCollections().then(async (cols) => {
      setCollections(cols);
      const entries = await Promise.all(
        cols.map(async (c) => [c.id, await fetchCollectionItems(c.id, 12)])
      );
      setCollectionTitles(Object.fromEntries(entries));
    });
  }, []);

  return (
    <div>
      {featured && featured.length > 0 && <FeaturedCarousel titles={featured} />}

      <TitleRow heading="Latest Movies" titles={latestMovies} />
      <TitleRow heading="Latest TV Shows" titles={latestTv} />

      {collections.map((c) => {
        const titles = collectionTitles[c.id];
        if (titles && titles.length === 0) return null;
        return (
          <div key={c.id}>
            <TitleRow heading={c.name} titles={titles ?? null} />
            {titles && titles.length > 0 && (
              <div className="max-w-6xl mx-auto px-4 -mt-6 pb-6">
                <Link to={`/collections/${c.slug}`} className="text-sm text-violet-bright hover:underline">
                  View more →
                </Link>
              </div>
            )}
          </div>
        );
      })}

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
    </div>
  );
}
