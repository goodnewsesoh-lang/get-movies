import { useEffect, useState } from 'react';
import {
  fetchSimilarTitles,
  addSimilarTitle,
  removeSimilarTitle,
  findMoviesByTmdbIds,
} from '../lib/similarTitles.js';
import { fetchTmdbSimilar, tmdbPosterUrl } from '../lib/tmdb.js';
import { fetchAllTitlesForAdmin, updateTitle } from '../lib/titles.js';
import { importAndLinkSimilar } from '../lib/importTitle.js';

export default function SimilarTitlesPicker({ movieId, tmdbId, type }) {
  const [similar, setSimilar] = useState([]);
  const [suggestions, setSuggestions] = useState(null); // { inLibrary: [...], missing: [...] }
  const [allMovies, setAllMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [publishNew, setPublishNew] = useState(false); // false = add as draft
  const [adding, setAdding] = useState({}); // tmdb id -> true while importing
  const [notice, setNotice] = useState('');

  const load = () => fetchSimilarTitles(movieId).then(setSimilar);

  useEffect(() => {
    if (movieId) load();
    fetchAllTitlesForAdmin().then(setAllMovies).catch(() => {});
  }, [movieId]);

  const runSuggest = async () => {
    if (!tmdbId) return;
    const results = await fetchTmdbSimilar(tmdbId, type);
    const ids = results.map((r) => r.id);
    const owned = await findMoviesByTmdbIds(ids);
    const ownedTmdbIds = new Set(owned.map((m) => m.tmdb_id));
    setSuggestions({
      inLibrary: owned.filter((m) => !similar.find((s) => s.id === m.id)),
      missing: results.filter((r) => !ownedTmdbIds.has(r.id)),
    });
  };

  const addExisting = async (movie) => {
    await addSimilarTitle(movieId, movie.id, similar.length);
    setSuggestions((s) => s && { ...s, inLibrary: s.inLibrary.filter((m) => m.id !== movie.id) });
    load();
  };

  const addMissing = async (r) => {
    setNotice('');
    setAdding((a) => ({ ...a, [r.id]: true }));
    try {
      const outcome = await importAndLinkSimilar(movieId, r, type, publishNew, similar.length);
      setSuggestions((s) => s && { ...s, missing: s.missing.filter((m) => m.id !== r.id) });
      await load();
      const name = r.title || r.name;
      const warn = outcome.warnings.length ? ` (${outcome.warnings.join(' ')})` : '';
      setNotice(
        outcome.alreadyExisted
          ? `"${name}" was already in your library, so it was linked as similar.`
          : `Added "${name}" as ${publishNew ? 'published' : 'a draft'} and linked it as similar.${warn}`
      );
    } catch (err) {
      setNotice(`Could not add "${r.title || r.name}": ${err.message}`);
    } finally {
      setAdding((a) => ({ ...a, [r.id]: false }));
    }
  };

  const publishDraft = async (m) => {
    setNotice('');
    try {
      await updateTitle(m.id, { published: true });
      setNotice(`"${m.title}" is now published.`);
      await load();
    } catch (err) {
      setNotice(`Could not publish "${m.title}": ${err.message}`);
    }
  };

  const remove = async (movieIdToRemove) => {
    await removeSimilarTitle(movieId, movieIdToRemove);
    load();
  };

  const availableMovies = allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) &&
      m.id !== movieId &&
      !similar.find((s) => s.id === m.id)
  );

  return (
    <div>
      <h2 className="font-display text-xl text-bone mb-3">Similar Movies</h2>

      <div className="space-y-2 mb-4">
        {similar.map((m) => (
          <div key={m.id} className="flex items-center gap-3 bg-panel border border-line rounded-lg px-3 py-2">
            {m.poster_url && <img src={m.poster_url} alt="" className="w-8 h-11 object-cover rounded" />}
            <span className="text-bone text-sm flex-1">
              {m.title}
              {m.published === false && (
                <span className="ml-2 text-[10px] text-mute border border-line rounded-full px-2 py-0.5">Draft</span>
              )}
            </span>
            {m.published === false && (
              <button type="button" onClick={() => publishDraft(m)} className="text-violet-bright text-xs mr-1">
                Publish
              </button>
            )}
            <button onClick={() => remove(m.id)} className="text-red-400 text-xs">Remove</button>
          </div>
        ))}
        {similar.length === 0 && <p className="text-mute text-sm">No similar titles picked yet.</p>}
      </div>

      {tmdbId && (
        <label className="flex items-center gap-2 text-xs text-mute mb-2">
          <input type="checkbox" checked={publishNew} onChange={(e) => setPublishNew(e.target.checked)} />
          Publish new titles straight away (leave unticked to add them as drafts)
        </label>
      )}

      {tmdbId && (
        <button
          type="button"
          onClick={runSuggest}
          className="bg-panel2 border border-line text-bone px-3 py-1.5 rounded-lg text-sm mb-4"
        >
          Suggest similar titles from TMDB
        </button>
      )}

      {notice && <p className="text-sm text-bone bg-panel border border-line rounded-lg px-3 py-2 mb-3">{notice}</p>}

      {suggestions && (
        <div className="mb-4 space-y-4">
          {suggestions.inLibrary.length > 0 && (
            <div>
              <p className="text-sm text-mute mb-2">In your library — tap to add</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.inLibrary.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addExisting(m)}
                    className="flex items-center gap-2 bg-panel2 border border-line rounded-lg px-2 py-1 hover:border-violet"
                  >
                    {m.poster_url && <img src={m.poster_url} alt="" className="w-6 h-8 object-cover rounded" />}
                    <span className="text-xs text-bone">{m.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.missing.length > 0 && (
            <div>
              <p className="text-sm text-mute mb-2">Not in your library yet. Tap Add to import the full title and link it.</p>
              <div className="space-y-2">
                {suggestions.missing.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 bg-ink border border-line rounded-lg px-2 py-1.5">
                    {r.poster_path && <img src={tmdbPosterUrl(r.poster_path, 'w92')} alt="" className="w-8 h-11 object-cover rounded" />}
                    <span className="text-sm text-bone flex-1">{r.title || r.name}</span>
                    <button
                      type="button"
                      disabled={adding[r.id]}
                      onClick={() => addMissing(r)}
                      className="bg-violet text-bone text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {adding[r.id] ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <label className="block text-sm text-mute mb-1">Or search your own library</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your movies/shows…"
        className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-bone mb-2"
      />
      {query && (
        <div className="max-h-48 overflow-y-auto space-y-1 border border-line rounded-lg p-2">
          {availableMovies.slice(0, 20).map((m) => (
            <button
              key={m.id}
              onClick={() => addExisting(m)}
              className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-panel2"
            >
              {m.poster_url && <img src={m.poster_url} alt="" className="w-8 h-11 object-cover rounded" />}
              <span className="text-bone text-sm">{m.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
  }
