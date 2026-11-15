import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchMessagesForAdmin, setMessageRead, deleteMessage } from '../../lib/messages.js';

export default function Messages() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState(null);

  const load = () =>
    fetchMessagesForAdmin()
      .then(setList)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (m) => {
    await setMessageRead(m.id, !m.is_read);
    load();
  };

  const remove = async (id) => {
    await deleteMessage(id);
    setConfirmId(null);
    load();
  };

  const unreadCount = (list ?? []).filter((m) => !m.is_read).length;
  const shown = (list ?? []).filter((m) => filter === 'all' || !m.is_read);

  return (
    <AdminLayout>
      <h1 className="text-2xl text-bone mb-2">Messages</h1>
      <p className="text-mute text-sm mb-5">
        Messages sent from the Contact page. {unreadCount > 0 ? `${unreadCount} unread.` : 'Nothing unread.'}
      </p>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
              filter === f.key
                ? 'bg-violet border-violet text-bone'
                : 'bg-panel border-line text-bone hover:border-violet'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {list === null && !error && <p className="text-mute">Loading…</p>}
      {list && shown.length === 0 && <p className="text-mute text-sm">No messages here.</p>}

      <div className="space-y-3 max-w-2xl">
        {shown.map((m) => (
          <div
            key={m.id}
            className={`bg-panel border rounded-xl p-4 ${m.is_read ? 'border-line' : 'border-violet/60'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-bone text-sm font-medium">
                  {!m.is_read && <span className="inline-block w-2 h-2 rounded-full bg-violet-bright mr-2" />}
                  {m.name}
                </p>
                <a href={`mailto:${m.email}`} className="text-violet-bright text-xs break-all">
                  {m.email}
                </a>
              </div>
              <p className="text-mute text-xs shrink-0">{new Date(m.created_at).toLocaleString()}</p>
            </div>

            <p className="text-bone/90 text-sm mt-3 whitespace-pre-wrap break-words">{m.message}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message to Get Movies')}`}
                className="text-violet-bright"
              >
                Reply by email
              </a>
              <button onClick={() => toggleRead(m)} className="text-mute hover:text-bone">
                {m.is_read ? 'Mark as unread' : 'Mark as read'}
              </button>
              {confirmId === m.id ? (
                <span>
                  <button onClick={() => remove(m.id)} className="text-red-400 mr-2">
                    Confirm
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-mute">
                    Cancel
                  </button>
                </span>
              ) : (
                <button onClick={() => setConfirmId(m.id)} className="text-red-400">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
