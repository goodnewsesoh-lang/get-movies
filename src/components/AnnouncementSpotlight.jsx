import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AnnouncementSpotlight({ posts }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!posts || posts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, 11000);
    return () => clearInterval(timer);
  }, [posts]);

  if (!posts || posts.length === 0) return null;
  const post = posts[index];
  const previewText = post.excerpt || post.content || '';

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl text-bone mb-4">Announcement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-panel border border-line rounded-xl overflow-hidden">
        <div className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg text-bone mb-2">{post.title}</h3>
            <p className="text-bone/90 text-sm line-clamp-4">{previewText}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Link to={`/announcements/${post.slug}`} className="text-violet-bright text-sm">
              See more →
            </Link>
            {posts.length > 1 && (
              <div className="flex gap-1.5">
                {posts.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${p.title}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-5 bg-violet-bright' : 'w-1.5 bg-mute/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {post.images?.[0] && (
          <img src={post.images[0]} alt="" className="w-full h-48 md:h-full object-cover" />
        )}
      </div>
    </section>
  );
}
