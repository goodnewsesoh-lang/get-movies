import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/States.jsx';

const PAGE_SIZE = 10;
const EXAMPLES = ['astronaut stranded alone in space', 'toys that come to life', 'detective murder mystery on an island'];

export default function MovieFinder() {
  const [text, setText] = useState('');
  const [honey, setHoney] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [results, setResults] = useState([]);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch('/api/find')
      .then((r) => (r.ok ? r.json() : { recent: [] }))
      .then((d) => setRecent(d.recent ?? []))
      .catch(() => {});
  }, []);

  const search = async (query) => {
    const q = (query ?? text).trim();
    setError('');
    if (q.length < 3) {
      setError('Please type a few words about the movie.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, website: honey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setKeywords(data.keywords ?? []);
      setResults(data.results ?? []);
      setShown(PAGE_SIZE);
      setSearched(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (q) => {
    setText(q);
    search(q);
  };

  const suggestions = recent.length > 0 ? recent : EXAMPLES;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl text-bone mb-2">Movie Finder</h1>
      <p className="text-mute text-sm mb-6">
        Can't remember the name? Describe what you remember: the story, the characters, a scene. We search the titles in our library.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="space-y-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="Example: a girl and her brother go on a quest in a magical forest with a talking animal"
          className="w-full bg-panel border border-line rounded-lg px-3 py-2.5 text-bone text-sm"
        />
        <input
          type="text"
          name="website"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <button
            disabled={loading}
            className="bg-violet hover:bg-violet-bright transition-colors text-bone px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Searching…' : 'Find movie'}
          </button>
          <span className="text-xs text-mute">{text.length}/500</span>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <p className="text-xs text-mute mt-3">Searching with a picture is coming later.</p>

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {!loading && searched && (
        <section className="mt-8">
          {keywords.length > 0 && (
            <div className="mb-5">
              <p className="text-sm text-mute mb-2">Key words we searched for</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <span key={k} className="text-xs text-violet-bright border border-violet/40 rounded-full px-3 py-1">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="bg-panel border border-line rounded-xl p-5 text-sm text-mute">
              <p className="text-bone mb-1">No match yet.</p>
              <p>
                Try different or more specific words, such as the setting, the job of a character, or what happens at the
                end. You can also <Link to="/recommend" className="text-violet-bright">recommend a movie</Link> for us to add.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-mute mb-3">
                {results.length} possible {results.length === 1 ? 'match' : 'matches'}, best first
              </p>
              <div className="space-y-3">
                {results.slice(0, shown).map((m) => (
                  <Link
                    key={m.id}
                    to={`/title/${m.id}`}
                    className="flex gap-4 bg-panel border border-line hover:border-violet/60 transition-colors rounded-xl p-3"
                  >
                    <div className="w-24 sm:w-28 shrink-0 aspect-[2/3] bg-panel2 rounded-lg overflow-hidden">
                      {m.poster_url && <img src={m.poster_url} alt={m.title} loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-bone text-base">{m.title}</h2>
                      <p className="text-xs text-mute mt-0.5">
                        {[m.type === 'tv' ? 'TV' : 'Movie', m.year, (m.genres ?? []).slice(0, 3).join(', ')]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p
                        className="text-sm text-bone/80 mt-2"
                        style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {m.overview}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {shown < results.length ? (
                <button
                  onClick={() => setShown((n) => n + PAGE_SIZE)}
                  className="mt-4 w-full bg-panel2 border border-line text-bone rounded-lg py-2.5 text-sm"
                >
                  Show more
                </button>
              ) : (
                <p className="text-center text-xs text-mute mt-5">No more results</p>
              )}
            </>
          )}
        </section>
      )}

      <section className="mt-10">
        <p className="text-sm text-mute mb-2">{recent.length > 0 ? 'Recent searches by other visitors' : 'Try one of these'}</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((q) => (
            <button
              key={q}
              onClick={() => useSuggestion(q)}
              className="text-xs text-bone bg-panel border border-line hover:border-violet rounded-full px-3 py-1.5 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
