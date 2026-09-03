import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <p className="font-display text-lg font-semibold text-bone">
            Get <span className="text-violet-bright">Movies</span>
          </p>
          <p className="text-sm text-mute mt-2 max-w-xs">
            Bringing you latest movie updates and recommendations.
          </p>
        </div>
        <nav className="flex gap-6 text-sm text-mute">
          <Link to="/movies" className="hover:text-bone">Movies</Link>
          <Link to="/tv-shows" className="hover:text-bone">TV Shows</Link>
          <Link to="/genres" className="hover:text-bone">Genres</Link>
          <Link to="/admin/login" className="hover:text-bone">Admin</Link>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8 text-xs text-mute">
        © {new Date().getFullYear()} Get Movies. All rights reserved.
      </div>
    </footer>
  );
        }
