import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/titles', label: 'Manage Titles' },
  { to: '/admin/titles/new', label: 'Add Title' },
];

export default function AdminLayout({ children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="md:w-48 shrink-0">
        <p className="font-display text-lg text-bone mb-4">Admin</p>
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
