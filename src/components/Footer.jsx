import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteSettings } from '../lib/settings.js';

const socials = [
  { key: 'whatsapp_url', label: 'WhatsApp' },
  { key: 'telegram_url', label: 'Telegram' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'tiktok_url', label: 'TikTok' },
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'x_url', label: 'X' },
];

const exploreLinks = [
  { to: '/tv-shows', label: 'TV Shows' },
  { to: '/movies', label: 'Movies' },
  { to: '/genres/Animation', label: 'Animations' },
];

const featureLinks = [
  { to: '/recommend', label: 'Recommend a Movie' },
  { to: '/movie-finder', label: 'Movie Finder', badge: 'Soon' },
  { to: '/contact', label: 'Contact' },
];

const termsLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/dmca', label: 'DMCA' },
  { to: '/terms', label: 'Terms' },
];

function SocialIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'Facebook':
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg {...common}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      );
    case 'Telegram':
      return (
        <svg {...common}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'TikTok':
      return (
        <svg {...common}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'WhatsApp':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <g transform="translate(6.5 6.5) scale(0.45)" strokeWidth="3">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </g>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>
      );
  }
}

function FooterColumn({ heading, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wider uppercase text-bone mb-3">{heading}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-mute hover:text-bone transition-colors">
              {l.label}
            </Link>
            {l.badge && (
              <span className="ml-2 text-[10px] text-violet-bright border border-violet/40 rounded-full px-2 py-0.5">
                {l.badge}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const activeSocials = settings ? socials.filter((s) => settings[s.key]) : [];

  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <img src="/logo-full.png" alt="Get Movies" className="h-10 w-auto" />
        <p className="text-sm text-mute mt-3 max-w-xs">
          Bringing you latest movie updates and recommendations.
        </p>

        {activeSocials.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5">
            {activeSocials.map((s) => (
              <a
                key={s.key}
                href={settings[s.key]}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                title={s.label}
                className="w-10 h-10 rounded-full border border-line bg-panel flex items-center justify-center text-bone hover:border-violet hover:text-violet-bright transition-colors"
              >
                <SocialIcon name={s.label} />
              </a>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <FooterColumn heading="Explore" links={exploreLinks} />
          <FooterColumn heading="Features" links={featureLinks} />
          <FooterColumn heading="Terms" links={termsLinks} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8 text-xs text-mute space-y-1">
        <p>© {new Date().getFullYear()} Get Movies. All rights reserved.</p>
        <p>This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
      </div>
    </footer>
  );
}
