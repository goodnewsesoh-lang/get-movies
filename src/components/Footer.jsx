import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteSettings } from '../lib/settings.js';

const socialIcons = {
  facebook_url: 'Facebook',
  whatsapp_url: 'WhatsApp',
  telegram_url: 'Telegram',
  instagram_url: 'Instagram',
  tiktok_url: 'TikTok',
  youtube_url: 'YouTube',
  x_url: 'X',
};

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const activeSocials = settings
    ? Object.entries(socialIcons).filter(([key]) => settings[key])
    : [];

  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div>
          <p className="font-display text-lg font-semibold text-bone">
            Get <span className="text-violet-bright">Movies</span>
          </p>
          <p className="text-sm text-mute mt-2 max-w-xs">
            Bringing you latest movie updates and recommendations.
          </p>
          {activeSocials.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {activeSocials.map(([key, label]) => (
                
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-mute hover:text-violet-bright border border-line rounded-full px-3 py-1"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
          <Link to="/movies" className="hover:text-bone">Movies</Link>
          <Link to="/tv-shows" className="hover:text-bone">TV Shows</Link>
          <Link to="/genres" className="hover:text-bone">Genres</Link>
          <Link to="/announcements" className="hover:text-bone">Announcements</Link>
          <Link to="/about" className="hover:text-bone">About</Link>
          <Link to="/contact" className="hover:text-bone">Contact</Link>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8 text-xs text-mute">
        © {new Date().getFullYear()} Get Movies. All rights reserved.
      </div>
    </footer>
  );
}
