import { Link } from 'react-router-dom';

export default function AnnouncementSpotlight({ post }) {
  if (!post) return null;
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
          <Link to={`/announcements/${post.slug}`} className="text-violet-bright text-sm mt-4 inline-block">
            See more →
          </Link>
        </div>
        {post.images?.[0] && (
          <img src={post.images[0]} alt="" className="w-full h-48 md:h-full object-cover" />
        )}
      </div>
    </section>
  );
}
