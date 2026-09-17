import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel.jsx';
import TitleRow from '../components/TitleRow.jsx';
import { fetchTitles } from '../lib/titles.js';
import { fetchHomepageCollections, fetchCollectionItems } from '../lib/collections.js';
import { fetchEnabledHomeSections } from '../lib/homeSections.js';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [sections, setSections] = useState(null);

  useEffect(() => {
    fetchTitles({ featuredOnly: true, limit: 10 }).then(setFeatured);

    (async () => {
      const [builtIn, collections] = await Promise.all([
        fetchEnabledHomeSections(),
        fetchHomepageCollections(),
      ]);

      const builtInSections = await Promise.all(
        builtIn.map(async (s) => {
          const titles =
            s.key === 'latest_movies'
              ? await fetchTitles({ type: 'movie', sort: 'newest', limit: 12 })
              : s.key === 'latest_tv'
              ? await fetchTitles({ type: 'tv', sort: 'newest', limit: 12 })
              : [];
          return { kind: 'builtin', key: s.key, label: s.label, position: s.position, titles };
        })
      );

      const collectionSections = await Promise.all(
        collections.map(async (c) => ({
          kind: 'collection',
          key: c.id,
          label: c.name,
          slug: c.slug,
          position: c.homepage_order,
          titles: await fetchCollectionItems(c.id, 12),
        }))
      );

      setSections(
        [...builtInSections, ...collectionSections].sort((a, b) => a.position - b.position)
      );
    })();
  }, []);

  return (
    <div>
      {featured && featured.length > 0 && <FeaturedCarousel titles={featured} />}

      {sections?.map((s) => {
        if (s.titles.length === 0) return null;
        return (
          <div key={s.key}>
            <TitleRow heading={s.label} titles={s.titles} />
            {s.kind === 'collection' && (
              <div className="max-w-6xl mx-auto px-4 -mt-6 pb-6">
                <Link to={`/collections/${s.slug}`} className="text-sm text-violet-bright hover:underline">
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
