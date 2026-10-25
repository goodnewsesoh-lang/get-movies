import { Link } from 'react-router-dom';

export default function MovieFinder() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <span className="inline-block mb-4 text-xs font-medium text-violet-bright bg-violet-dim/40 border border-violet/40 rounded-full px-3 py-1">
        Coming soon
      </span>
      <h1 className="text-3xl text-bone mb-3">Movie Finder</h1>
      <p className="text-mute mb-8">
        Can't remember a movie's name? Soon you'll be able to describe a scene and we'll help you find it.
      </p>
      <Link
        to="/"
        className="inline-block bg-violet hover:bg-violet-bright transition-colors text-bone px-5 py-2.5 rounded-lg text-sm font-medium"
      >
        Back to home
      </Link>
    </div>
  );
}
