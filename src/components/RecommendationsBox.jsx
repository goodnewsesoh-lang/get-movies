import { useEffect, useState } from 'react';
import { fetchApprovedRecommendations, submitRecommendation } from '../lib/recommendations.js';

const LIMIT_KEY = 'gm_rec_times';
const MAX_PER_DAY = 3;
const MIN_GAP_MS = 30000;

function recentSubmissions() {
  try {
    const all = JSON.parse(localStorage.getItem(LIMIT_KEY) || '[]');
    const dayAgo = Date.now() - 86400000;
    return all.filter((t) => t > dayAgo);
  } catch {
    return [];
  }
}

function rememberSubmission() {
  try {
    localStorage.setItem(LIMIT_KEY, JSON.stringify([...recentSubmissions(), Date.now()]));
  } catch {
    // storage may be blocked; the server rules still apply
  }
}

export default function RecommendationsBox() {
  const [list, setList] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const load = () => fetchApprovedRecommendations().then(setList).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const text = message.trim();
    if (!text) return;

    if (trap) {
      setDone(true);
      setMessage('');
      return;
    }

    if (/(https?:\/\/|www\.)/i.test(text)) {
      setError("Please don't include links in your recommendation.");
      return;
    }

    const recent = recentSubmissions();
    if (recent.length >= MAX_PER_DAY) {
      setError("You've sent a few recommendations today. Please try again tomorrow.");
      return;
    }
    if (recent.length > 0 && Date.now() - Math.max(...recent) < MIN_GAP_MS) {
      setError('Please wait a moment before sending another one.');
      return;
    }

    setSubmitting(true);
    try {
      await submitRecommendation(name.trim(), text);
      rememberSubmission();
      setMessage('');
      setName('');
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch {
      setError('Could not submit right now. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl text-bone mb-2">Got a Recommendation?</h2>
      <p className="text-mute text-sm mb-5">
        Drop a movie or show you think others should watch. Approved picks show up below.
      </p>

      <form onSubmit={submit} className="bg-panel border border-line rounded-xl p-4 mb-6 max-w-xl">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Your name (optional)"
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone mb-3"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. You should add 'Arcane'. It's incredible"
          rows={3}
          maxLength={500}
          required
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-bone"
        />
        <p className="text-mute text-xs text-right mt-1 mb-3">{message.length}/500</p>

        <input
          type="text"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
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
