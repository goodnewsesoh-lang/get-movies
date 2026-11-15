import { useEffect, useState } from 'react';
import { Spinner } from './States.jsx';

function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function Group({ label, providers, link }) {
  if (!providers || providers.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-xs text-mute uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => (
          <a
            key={p.id}
            href={link || 'https://www.justwatch.com'}
            target="_blank"
            rel="noreferrer"
            title={p.name}
            className="flex items-center gap-2 bg-panel border border-line rounded-lg px-2.5 py-1.5 hover:border-violet/60 transition-colors"
          >
            {p.logo && <img src={p.logo} alt="" loading="lazy" className="w-7 h-7 rounded-md" />}
            <span className="text-bone text-xs">{p.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function WhereToWatch({ tmdbId, type }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = (country) => {
    setLoading(true);
    setFailed(false);
    const qs = new URLSearchParams({ id: String(tmdbId), type });
    if (country) qs.set('country', country);
    fetch(`/api/watch?${qs.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      })
      .then(setData)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tmdbId) load();
  }, [tmdbId, type]);

  if (!tmdbId) return null;

  const hasAny =
    data && (data.stream.length || data.free.length || data.rent.length || data.buy.length);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl text-bone">Where to Watch</h2>
        {data && data.available.length > 0 && (
          <select
            value={data.country}
            onChange={(e) => load(e.target.value)}
            className="bg-panel border border-line rounded-lg px-3 py-1.5 text-sm text-bone max-w-[200px]"
          >
            {!data.available.includes(data.country) && (
              <option value={data.country}>{countryName(data.country)}</option>
            )}
            {[...data.available]
              .sort((a, b) => countryName(a).localeCompare(countryName(b)))
              .map((c) => (
                <option key={c} value={c}>
                  {countryName(c)}
                </option>
              ))}
          </select>
        )}
      </div>

      {loading && <Spinner size={28} className="py-4" />}

      {!loading && failed && (
        <p className="text-mute text-sm">Couldn't load streaming information right now.</p>
      )}

      {!loading && !failed && data && !hasAny && (
        <p className="text-mute text-sm">
          Not available to stream, rent or buy in {countryName(data.country)} yet. New releases can take a while to
          appear.
        </p>
      )}

      {!loading && !failed && hasAny && (
        <>
          <Group label="Stream" providers={data.stream} link={data.link} />
          <Group label="Free" providers={data.free} link={data.link} />
          <Group label="Rent" providers={data.rent} link={data.link} />
          <Group label="Buy" providers={data.buy} link={data.link} />
          {data.stream.length > 0 && (
            <p className="text-mute text-xs mb-2">
              Many streaming apps let subscribers download titles for offline viewing inside their own app.
            </p>
          )}
        </>
      )}

      <p className="text-mute text-xs mt-4">
        Streaming availability data from{' '}
        <a href="https://www.justwatch.com" target="_blank" rel="noreferrer" className="text-violet-bright">
          JustWatch
        </a>
        .
      </p>
    </section>
  );
}
