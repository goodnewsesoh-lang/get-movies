import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteSettings } from '../lib/settings.js';
import { fetchTitles } from '../lib/titles.js';
import { fetchCollectionItems } from '../lib/collections.js';
import CountdownTimer from './CountdownTimer.jsx';

const DISMISS_KEY = 'gm_popup_dismissed_at';

const clamp = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

function dismissedRecently(hours) {
  try {
    const last = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return last > 0 && Date.now() - last < hours * 3600000;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage may be blocked
  }
}

async function loadTitles(cfg) {
  const count = clamp(cfg.popup_count, 3, 12, 8);
  let list = [];
  if (cfg.popup_source === 'featured') {
    list = await fetchTitles({ featuredOnly: true, limit: count * 2 });
  } else if (cfg.popup_source === 'collection' && cfg.popup_collection_id) {
    list = await fetchCollectionItems(cfg.popup_collection_id, count * 2);
  } else {
    list = await fetchTitles({ sort: 'newest', limit: count * 2 });
  }
  return list.filter((t) => t.poster_url).slice(0, count);
}

export default function WelcomePopup({ config = null, onClose = null }) {
  const preview = Boolean(config);
  const [cfg, setCfg] = useState(config);
  const [titles, setTitles] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [empty, setEmpty] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    if (preview) return;
    fetchSiteSettings().then(setCfg).catch(() => {});
  }, [preview]);

  useEffect(() => {
    if (!cfg) return;
    if (!preview && (!cfg.popup_enabled || dismissedRecently(clamp(cfg.popup_repeat_hours, 1, 168, 24)))) {
      return;
    }

    let cancelled = false;
    let timer;
    loadTitles(cfg)
      .then((list) => {
        if (cancelled) return;
        if (list.length === 0) {
          if (preview) {
            setEmpty(true);
            setOpen(true);
          }
          return;
        }
        setTitles(list);
        setIndex(0);
        const delay = preview ? 0 : clamp(cfg.popup_delay_seconds, 0, 30, 4) * 1000;
        timer = setTimeout(() => setOpen(true), delay);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cfg, preview]);

  const close = () => {
    setOpen(false);
    if (preview) onClose?.();
    else rememberDismiss();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const count = titles.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  if (!open) return null;

  const closeButton = (
    <button
      onClick={close}
      aria-label="Close"
      className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-bone hover:bg-panel2"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );

  if (empty) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={close}>
        <div
          className="w-full max-w-sm bg-panel border border-line rounded-2xl p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-bone">Nothing to show yet</p>
            {closeButton}
          </div>
          <p className="text-mute text-sm">
            This source has no published titles with posters. Pick a different source or add titles to it.
          </p>
        </div>
      </div>
    );
  }

  const t = titles[index];
  if (!t) return null;

  const locked = t.unlock_at && new Date(t.unlock_at) > new Date();
  const meta = [
    t.year,
    Number(t.rating) > 0 ? `★ ${t.rating}` : null,
    t.genres?.length ? t.genres.slice(0, 2).join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Recommended for you"
    >
      <div
        className="w-full max-w-sm md:max-w-md bg-panel border border-line rounded-2xl overflow-hidden shadow-glow"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (dx < -50) next();
          else if (dx > 50) prev();
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-line">
          <p className="text-sm font-semibold text-bone">{cfg?.popup_title || 'Picked for you'}</p>
          {closeButton}
        </div>

        <Link
          to={`/title/${t.id}`}
          onClick={(e) => {
            if (preview) {
              e.preventDefault();
              return;
            }
            rememberDismiss();
            setOpen(false);
          }}
          className="flex gap-4 p-4"
        >
          <div className="relative w-32 shrink-0">
            <img
              src={t.poster_url}
              alt={t.title}
              className={`w-full aspect-[2/3] object-cover rounded-xl border border-line ${locked ? 'blur-sm' : ''}`}
            />
            {locked && (
              <span className="absolute inset-x-0 bottom-2 mx-auto w-fit text-[10px] text-bone bg-violet/90 rounded-full px-2 py-0.5">
                Coming Soon
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-violet-bright uppercase tracking-wide">
              {t.type === 'tv' ? 'TV Show' : 'Movie'}
            </p>
            <h3 className="text-bone font-semibold leading-snug line-clamp-2 mt-0.5">{t.title}</h3>
            {meta && <p className="text-mute text-xs mt-1">{meta}</p>}
            <p className="text-bone/80 text-xs mt-2 line-clamp-4">
              {locked ? (
                <>
                  Unlocks in <CountdownTimer target={t.unlock_at} />
                </>
              ) : (
                t.overview
              )}
            </p>
            <span className="inline-block mt-3 text-xs bg-violet text-bone rounded-lg px-3 py-1.5">
              View details
            </span>
          </div>
        </Link>

        {count > 1 && (
          <div className="flex items-center justify-between px-4 pb-4">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-10 h-10 rounded-full border border-line text-bone hover:border-violet flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              {titles.map((item, i) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-violet-bright' : 'w-1.5 bg-mute/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next"
              className="w-10 h-10 rounded-full border border-line text-bone hover:border-violet flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
