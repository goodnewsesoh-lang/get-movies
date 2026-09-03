import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/tv-shows', label: 'TV Shows' },
  { to: '/genres', label: 'Genres' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl font-semibold text-bone shrink-0">
          Get <span className="text-violet-bright">Movies</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-violet-bright' : 'text-mute hover:text-bone'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="hidden md:block relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search titles, genres, years"
            className="w-56 rounded-full bg-panel border border-line px-4 py-2 text-sm text-bone placeholder:text-mute focus:border-violet outline-none"
          />
        </form>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-bone p-2 -mr-2"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line px-4 py-4 space-y-4 bg-ink">
          <form onSubmit={submitSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search titles, genres, years"
              className="w-full rounded-full bg-panel border border-line px-4 py-2 text-sm text-bone placeholder:text-mute focus:border-violet outline-none"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-base ${isActive ? 'text-violet-bright' : 'text-bone'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
  }
