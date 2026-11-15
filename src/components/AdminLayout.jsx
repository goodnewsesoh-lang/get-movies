import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUnreadCount } from '../lib/messages.js';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/titles', label: 'Manage Titles' },
  { to: '/admin/titles/new', label: 'Add Title' },
  { to: '/admin/collections', label: 'Collections' },
  { to: '/admin/home-order', label: 'Homepage Order' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/recommendations', label: 'Recommendations' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/popup', label: 'Welcome Pop-up' },
  { to: '/admin/bot-status', label: 'Bot Status' },
  { to: '/admin/security', label: 'Security & Health' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchUnreadCount().then(setUnread);
  }, []);

  const logout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="md:w-48 shrink-0">
        <p className="text-lg text-bone mb-4">Admin</p>
        <nav className="flex md:flex-col gap-2 flex-wrap">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `text-sm px-3 py-2 rounded-lg ${
                  isActive ? 'bg-violet/20 text-violet-bright' : 'text-mute hover:text-bone hover:bg-panel'
                }`
              }
            >
              {l.label}
              {l.to === '/admin/messages' && unread > 0 && (
                <span className="ml-2 text-[10px] bg-violet text-bone rounded-full px-1.5 py-0.5">{unread}</span>
              )}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="text-sm px-3 py-2 rounded-lg text-mute hover:text-bone hover:bg-panel text-left"
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
