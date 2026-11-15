import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout.jsx';
import { Spinner } from '../../components/States.jsx';
import { fetchBotStatus, fetchRecentJobs } from '../../lib/bot.js';
import { fetchUnreadCount } from '../../lib/messages.js';
import {
  fetchHealthChecks,
  markCheckDone,
  clearCheck,
  fetchPendingRecommendations,
  fetchContentCounts,
} from '../../lib/health.js';

const PROJECT = 'btskbdoaujpzgjjjuhgb';
const quickLinks = [
  { label: 'Supabase Security Advisor', href: `https://supabase.com/dashboard/project/${PROJECT}/advisors/security` },
  { label: 'Supabase Users list', href: `https://supabase.com/dashboard/project/${PROJECT}/auth/users` },
  { label: 'Supabase API keys', href: `https://supabase.com/dashboard/project/${PROJECT}/settings/api-keys` },
  { label: 'GitHub security alerts', href: 'https://github.com/goodnewsesoh-lang/get-movies/security' },
  { label: 'Vercel logs', href: 'https://vercel.com/get-movies/get-movies/logs' },
  { label: 'Vercel deployments', href: 'https://vercel.com/get-movies/get-movies/deployments' },
];

const MONTHLY_DAYS = 35;
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null);

function Dot({ ok }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-orange-500'}`} />;
}

export default function SecurityHealth() {
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [pending, setPending] = useState(0);
  const [counts, setCounts] = useState(null);
  const [checks, setChecks] = useState(null);

  const load = async () => {
    const [b, j, u, p, c, k] = await Promise.allSettled([
      fetchBotStatus(),
      fetchRecentJobs(30),
      fetchUnreadCount(),
      fetchPendingRecommendations(),
      fetchContentCounts(),
      fetchHealthChecks(),
    ]);
    setBot(b.status === 'fulfilled' ? b.value : null);
    setJobs(j.status === 'fulfilled' ? j.value : []);
    setUnread(u.status === 'fulfilled' ? u.value : 0);
    setPending(p.status === 'fulfilled' ? p.value : 0);
    setCounts(c.status === 'fulfilled' ? c.value : null);
    setChecks(k.status === 'fulfilled' ? k.value : null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const tick = async (key) => {
    await markCheckDone(key);
    load();
  };

  const untick = async (key) => {
    await clearCheck(key);
    load();
  };

  const botHealthy = bot?.last_run_at
    ? Date.now() - new Date(bot.last_run_at).getTime() < 26 * 3600 * 1000
    : false;

  const weekAgo = Date.now() - 7 * 86400000;
  const recent = jobs.filter((j) => new Date(j.started_at).getTime() > weekAgo);
  const failedRuns = recent.filter((j) => j.status === 'failed');
  const warningRuns = recent.filter((j) => j.status === 'done_with_errors');

  const monthly = (checks ?? []).filter((c) => c.kind === 'monthly');
  const once = (checks ?? []).filter((c) => c.kind === 'once');
  const overdue = monthly.filter((c) => {
    const d = daysSince(c.last_checked_at);
    return d === null || d > MONTHLY_DAYS;
  });

  const attention = [];
  if (!botHealthy) attention.push('The bot has not run in the last day.');
  if (failedRuns.length > 0) attention.push(`${failedRuns.length} failed bot run(s) this week.`);
  if (overdue.length > 0) attention.push(`${overdue.length} monthly check(s) are due.`);

  if (loading) {
    return (
      <AdminLayout>
        <Spinner className="py-20" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl text-bone mb-4">Security &amp; Health</h1>

      <div
        className={`flex items-start gap-3 rounded-xl border p-4 mb-6 ${
          attention.length === 0 ? 'border-green-500/40 bg-green-500/5' : 'border-orange-500/40 bg-orange-500/5'
        }`}
      >
        <Dot ok={attention.length === 0} />
        <div>
          <p className="text-bone text-sm font-medium">
            {attention.length === 0 ? 'All good' : `${attention.length} thing(s) need attention`}
          </p>
          {attention.map((a) => (
            <p key={a} className="text-mute text-xs mt-1">
              {a}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="bg-panel border border-line rounded-xl p-4">
          <p className="text-xs text-mute uppercase tracking-wide mb-2">Bot</p>
          <p className="text-bone text-sm flex items-center gap-2">
            <Dot ok={botHealthy} />
            {botHealthy ? 'Active' : 'Not running'}
          </p>
          <p className="text-mute text-xs mt-2">
            {bot?.last_run_at ? `Last ran ${new Date(bot.last_run_at).toLocaleString()}` : 'Never run yet'}
          </p>
          {bot?.last_message && <p className="text-mute text-xs mt-1">{bot.last_message}</p>}
          <Link to="/admin/bot-status" className="text-violet-bright text-xs inline-block mt-3">
            Open Bot Status
          </Link>
        </div>

        <div className="bg-panel border border-line rounded-xl p-4">
          <p className="text-xs text-mute uppercase tracking-wide mb-2">Bot runs, last 7 days</p>
          <p className="text-bone text-sm flex items-center gap-2">
            <Dot ok={failedRuns.length === 0} />
            {failedRuns.length} failed
          </p>
          <p className="text-mute text-xs mt-2">{warningRuns.length} finished with warnings</p>
          {failedRuns[0]?.error_message && (
            <p className="text-red-400 text-xs mt-2 break-words">{failedRuns[0].error_message.slice(0, 160)}</p>
          )}
        </div>

        <Link to="/admin/recommendations" className="bg-panel border border-line rounded-xl p-4 hover:border-violet/60 transition-colors">
          <p className="text-xs text-mute uppercase tracking-wide mb-2">Recommendations waiting</p>
          <p className="text-bone text-2xl">{pending}</p>
        </Link>

        <Link to="/admin/messages" className="bg-panel border border-line rounded-xl p-4 hover:border-violet/60 transition-colors">
          <p className="text-xs text-mute uppercase tracking-wide mb-2">Unread messages</p>
          <p className="text-bone text-2xl">{unread}</p>
        </Link>

        {counts && (
          <div className="bg-panel border border-line rounded-xl p-4 sm:col-span-2">
            <p className="text-xs text-mute uppercase tracking-wide mb-2">Titles</p>
            <p className="text-bone text-sm">
              {counts.total} total · {counts.published} published · {counts.total - counts.published} draft
            </p>
          </div>
        )}
      </div>

      <h2 className="text-lg text-bone mb-3">Monthly checklist</h2>
      {checks === null && (
        <p className="text-mute text-sm mb-6">
          The checklist table isn't set up yet. Run the SQL step for this page in the Supabase SQL Editor.
        </p>
      )}
      <div className="space-y-2 mb-8">
        {monthly.map((c) => {
          const d = daysSince(c.last_checked_at);
          const due = d === null || d > MONTHLY_DAYS;
          return (
            <div key={c.key} className="bg-panel border border-line rounded-lg px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-1">
                  <Dot ok={!due} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-bone text-sm">{c.label}</p>
                  <p className="text-mute text-xs mt-1">
                    {d === null
                      ? 'Never checked'
                      : `Last checked ${d === 0 ? 'today' : `${d} day(s) ago`} (${new Date(c.last_checked_at).toLocaleDateString()})`}
                  </p>
                </div>
                <button onClick={() => tick(c.key)} className="text-violet-bright text-xs shrink-0">
                  Done today
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {once.length > 0 && (
        <>
          <h2 className="text-lg text-bone mb-3">One-time jobs</h2>
          <div className="space-y-2 mb-8">
            {once.map((c) => (
              <div key={c.key} className="bg-panel border border-line rounded-lg px-4 py-3 flex items-start gap-3">
                <span className="mt-1">
                  <Dot ok={Boolean(c.last_checked_at)} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-bone text-sm">{c.label}</p>
                  <p className="text-mute text-xs mt-1">
                    {c.last_checked_at
                      ? `Done on ${new Date(c.last_checked_at).toLocaleDateString()}`
                      : 'Not done yet'}
                  </p>
                </div>
                {c.last_checked_at ? (
                  <button onClick={() => untick(c.key)} className="text-mute text-xs shrink-0">
                    Undo
                  </button>
                ) : (
                  <button onClick={() => tick(c.key)} className="text-violet-bright text-xs shrink-0">
                    Mark done
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-lg text-bone mb-3">Shortcuts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {quickLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="bg-panel border border-line rounded-lg px-4 py-3 text-sm text-bone hover:border-violet/60 transition-colors"
          >
            {l.label} ↗
          </a>
        ))}
      </div>

      <p className="text-mute text-xs">
        This page can only see your own site, so Supabase, GitHub and Vercel have shortcuts, and the checklist is where
        you record that you looked.
      </p>
    </AdminLayout>
  );
}
