import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTitles } from '../lib/titles.js';

export default function SearchBox({ className = '', inputClassName = '', onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTitles({ search: query.trim(), limit: 6 }).then(setResults).catch(() => {});
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setOpen(false);
    onNavigate?.();
  };

  const goToTitle = (id) => {
    navigate(`/title/${id}`);
    setQuery('');
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submitSearch}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          type="text"
          placeholder="Search titles, genres, years"
          className={inputClassName}
        />
      </form>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-panel border border-line rounded-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => goToTitle(r.id)}
              className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-panel2"
            >
              {r.poster_url ? (
                <img src={r.poster_url} alt="" className="w-8 h-11 object-cover rounded" />
              ) : (
                <div className="w-8 h-11 bg-panel2 rounded shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-bone text-sm truncate">{r.title}</p>
                <p className="text-mute text-xs">{r.year}{r.type === 'tv' ? ' · TV' : ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
