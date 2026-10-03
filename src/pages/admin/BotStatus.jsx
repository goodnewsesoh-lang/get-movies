import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchBotStatus, fetchRecentJobs, runMaintenanceNow } from '../../lib/bot.js';

export default function BotStatus() {
  const [status, setStatus] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    fetchBotStatus().then(setStatus).catch(() => {});
    fetchRecentJobs().then(setJobs).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const isHealthy = status?.last_run_at
    ? Date.now() - new Date(status.last_run_at).getTime() < 26 * 60 * 60 * 1000
    : false;

  const runNow = async () => {
    setRunning(true);
    setError(null);
    try {
      await runMaintenanceNow();
      setTimeout(load, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-6">Bot Status</h1>

      <div className="flex items-center gap-3 bg-panel border border-line rounded-xl p-4 mb-6">
        <span className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-orange-500'}`} />
        <div className="flex-1">
          <p className="text-bone text-sm font-medium">{isHealthy ? 'Active' : 'Not running'}</p>
          <p className="text-mute text-xs mt-0.5">
            {status?.last_run_at ? `Last ran ${new Date(status.last_run_at).toLocaleString()}` : 'Never run yet'}
          </p>
          {status?.last_message && <p className="text-mute text-xs mt-1">{status.last_message}</p>}
        </div>
        <button
          onClick={runNow}
          disabled={running}
          className="bg-violet hover:bg-violet-bright text-bone px-4 py-2 rounded-lg text-sm disabled:opacity-60"
        >
          {running ? 'Running…' : 'Run now'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <h2 className="font-display text-lg text-bone mb-3">Activity Log</h2>
      <div className="space-y-2">
        {jobs?.map((j) => (
          <div key={j.id} className="bg-panel border border-line rounded-lg px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-bone">{j.job_type}</span>
              <span className={`text-xs ${j.status === 'done' ? 'text-violet-bright' : j.status === 'failed' ? 'text-red-400' : 'text-mute'}`}>
                {j.status}
              </span>
            </div>
            <p className="text-mute text-xs mt-1">
              {new Date(j.started_at).toLocaleString()} · {j.processed_count ?? 0}/{j.total_count ?? 0} processed
            </p>
            {j.error_message && <p className="text-red-400 text-xs mt-1">{j.error_message}</p>}
          </div>
        ))}
        {jobs && jobs.length === 0 && <p className="text-mute text-sm">No runs yet.</p>}
      </div>
    </AdminLayout>
  );
      }
