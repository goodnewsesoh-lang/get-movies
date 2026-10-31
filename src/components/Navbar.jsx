import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SearchBox from './SearchBox.jsx';

const items = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/movies', label: 'Movies', icon: 'movies' },
  { to: '/tv-shows', label: 'TV Shows', icon: 'tv' },
  { to: '/genres', label: 'Genres', icon: 'genres' },
  { to: '/announcements', label: 'Announcements', icon: 'bell' },
  { to: '/recommend', label: 'Recommend a Movie', icon: 'heart' },
  { to: '/movie-finder', label: 'Movie Finder', icon: 'find', badge: 'Soon' },
  { to: '/about', label: 'About', icon: 'info' },
  { to: '/contact', label: 'Contact', icon: 'mail' },
];

function Icon({ name }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...p}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case 'movies':
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
        </svg>
      );
    case 'tv':
      return (
        <svg {...p}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 3l4 4 4-4" />
        </svg>
      );
    case 'genres':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...p}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...p}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      );
    case 'find':
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'info':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-bone p-2 -ml-2"
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/" className="shrink-0">
              <img src="/logo-full.png" alt="Get Movies" className="h-7 sm:h-8 md:h-10 w-auto" />
            </Link>
          </div>

          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="text-bone p-2 -mr-2"
            aria-label="Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </div>

        {searchOpen && (
          <div className="border-t border-line px-4 py-3 bg-ink">
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <SearchBox
                className="flex-1"
                inputClassName="w-full rounded-full bg-panel border border-line px-4 py-2 text-sm text-bone placeholder:text-mute focus:border-violet outline-none"
                autoFocus
                onNavigate={() => setSearchOpen(false)}
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="text-mute hover:text-bone p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      <div className={`fixed inset-0 z-50 ${menuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!menuOpen}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          aria-label="Menu"
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] bg-panel border-r border-line flex flex-col transition-transform duration-200 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-line">
            <span className="text-lg font-semibold text-bone">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              aria-label="Close menu"
              className="text-bone p-2 -mr-2"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                tabIndex={menuOpen ? 0 : -1}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-violet/20 text-violet-bright' : 'text-bone hover:bg-panel2'
                  }`
                }
              >
                <Icon name={it.icon} />
                <span className="flex-1">{it.label}</span>
                {it.badge && (
                  <span className="text-[10px] text-violet-bright border border-violet/40 rounded-full px-2 py-0.5">
                    {it.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
