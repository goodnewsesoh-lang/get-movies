import { useEffect, useState } from 'react';
import { fetchApprovedRecommendations, submitRecommendation } from '../lib/recommendations.js';

export default function RecommendationsBox() {
  const [list, setList] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const load = () => fetchApprovedRecommendations().then(setList).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRecommendation(name.trim(), message.trim());
      setMessage('');
      setName('');
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch {
      setError('Could not submit right now — try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="font-display text-2xl text-bone mb-2">Got a Recommendation?</h2>
      <p className="text-mute text-sm mb-5">Drop a movie or show you think others should watch. Approved picks show up below.</p>

      <form onSubmit={submit} className="bg-panel border border-line rounded-xl p-4 mb-6 max-w-xl">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone mb-3"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. You should add 'Arcane' — it's incredible"
          rows={3}
          required
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        {done && <p className="text-violet-bright text-xs mb-2">Thanks! Your recommendation is awaiting review.</p>}
        <button
          disabled={submitting}
          className="bg-violet hover:bg-violet-bright text-bone px-4 py-2 rounded-lg text-sm disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Submit'}
        </button>
      </form>

      {list && list.length > 0 && (
        <div className="space-y-3 max-w-xl">
          {list.map((r) => (
            <div key={r.id} className="bg-panel border border-line rounded-lg px-4 py-3">
              <p className="text-bone text-sm">{r.message}</p>
              <p className="text-mute text-xs mt-1">— {r.name || 'Anonymous'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
