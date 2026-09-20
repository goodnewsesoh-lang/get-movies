import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAnnouncementBySlug } from '../lib/announcements.js';
import { ErrorState } from '../components/States.jsx';

export default function AnnouncementDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPost(null);
    setError(null);
    fetchAnnouncementBySlug(slug).then(setPost).catch(() => setError('Post not found.'));
  }, [slug]);

  if (error) return <div className="max-w-3xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-16 text-mute">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl md:text-4xl text-bone mb-4">{post.title}</h1>
      <p className="text-mute text-sm mb-8">
        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {post.images?.map((url) => (
        <img key={url} src={url} alt="" className="w-full rounded-xl mb-6" />
      ))}

      <div className="text-bone/90 leading-relaxed whitespace-pre-wrap">{post.content}</div>
    </div>
  );
}
