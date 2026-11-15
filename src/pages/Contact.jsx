import { useEffect, useState } from 'react';
import { fetchSiteSettings } from '../lib/settings.js';
import { submitMessage } from '../lib/messages.js';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP, SUPPORT_WHATSAPP_DISPLAY } from '../lib/siteInfo.js';

const LIMIT_KEY = 'gm_contact_times';
const MAX_PER_DAY = 3;
const MIN_GAP_MS = 60000;
const LINK_PATTERN = /(https?:\/\/|www\.)/i;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function recentSends() {
  try {
    const all = JSON.parse(localStorage.getItem(LIMIT_KEY) || '[]');
    const dayAgo = Date.now() - 86400000;
    return all.filter((t) => t > dayAgo);
  } catch {
    return [];
  }
}

function rememberSend() {
  try {
    localStorage.setItem(LIMIT_KEY, JSON.stringify([...recentSends(), Date.now()]));
  } catch {
    // storage may be blocked; the server rules still apply
  }
}

const isUrl = (v) => /^https?:\/\//i.test(String(v || '').trim());

function whatsappHref(value) {
  const v = String(value || '').trim();
  if (!v) return null;
  if (isUrl(v)) return v;
  let digits = v.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `234${digits.slice(1)}`;
  return digits ? `https://wa.me/${digits}` : null;
}

function telegramHref(value) {
  const v = String(value || '').trim();
  if (!v) return null;
  if (isUrl(v)) return v;
  return `https://t.me/${v.replace(/^@/, '')}`;
}

function Icon({ name }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'user') {
    return (
      <svg {...p}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (name === 'mail') {
    return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }
  if (name === 'chat') {
    return (
      <svg {...p}>
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
      </svg>
    );
  }
  if (name === 'send') {
    return (
      <svg {...p}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    );
  }
  return null;
}

const labelClass = 'block text-[11px] font-semibold tracking-wider uppercase text-mute mb-1.5';
const inputClass =
  'w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-3 text-sm text-bone placeholder:text-mute focus:border-violet outline-none';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const emailValue = settings?.contact_email || SUPPORT_EMAIL;
  const whatsappRaw = settings?.contact_whatsapp || SUPPORT_WHATSAPP;
  const whatsappLabel = settings?.contact_whatsapp
    ? isUrl(settings.contact_whatsapp)
      ? 'Chat on WhatsApp'
      : settings.contact_whatsapp
    : SUPPORT_WHATSAPP_DISPLAY;
  const telegramRaw = settings?.contact_telegram || '';
  const telegramLabel = isUrl(telegramRaw) ? 'Message on Telegram' : telegramRaw;

  const methods = [
    { label: 'Email', value: emailValue, href: `mailto:${emailValue}`, icon: 'mail', external: false },
    { label: 'WhatsApp', value: whatsappLabel, href: whatsappHref(whatsappRaw), icon: 'chat', external: true },
    { label: 'Telegram', value: telegramLabel, href: telegramHref(telegramRaw), icon: 'send', external: true },
  ].filter((m) => m.href);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (trap) {
      setSent(true);
      return;
    }

    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!n) return setError('Please enter your name.');
    if (!EMAIL_PATTERN.test(em)) return setError('Please enter a valid email address.');
    if (msg.length < 5) return setError('Please write a little more in your message.');
    if (LINK_PATTERN.test(msg)) return setError("Please don't include links in your message.");

    const recent = recentSends();
    if (recent.length >= MAX_PER_DAY) {
      return setError("You've sent a few messages today. Please try again tomorrow, or reach us on WhatsApp.");
    }
    if (recent.length > 0 && Date.now() - Math.max(...recent) < MIN_GAP_MS) {
      return setError('Please wait a minute before sending another message.');
    }

    setSending(true);
    try {
      await submitMessage(n, em, msg);
      rememberSend();
      setName('');
      setEmail('');
      setMessage('');
      setSent(true);
    } catch {
      setError('Could not send right now. Please try again later, or use WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl text-bone mb-2">Contact Us</h1>
      <p className="text-mute mb-8">Have a question, suggestion or request? Reach us any of these ways.</p>

      <div className="grid gap-3 sm:grid-cols-3 mb-10">
        {methods.map((m) => (
          <a
            key={m.label}
            href={m.href}
            target={m.external ? '_blank' : undefined}
            rel={m.external ? 'noreferrer' : undefined}
            className="flex items-center gap-3 bg-panel border border-line rounded-xl px-4 py-3 hover:border-violet/60 transition-colors"
          >
            <span className="text-violet-bright">
              <Icon name={m.icon} />
            </span>
            <span className="min-w-0">
              <span className="block text-mute text-xs">{m.label}</span>
              <span className="block text-bone text-sm truncate">{m.value}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6">
        <h2 className="text-xl text-bone mb-1">Send us a message</h2>
        <p className="text-mute text-sm mb-5">We'll reply by email or WhatsApp.</p>

        {sent ? (
          <div className="text-center py-8">
            <p className="text-bone font-medium">Thanks! Your message has been sent.</p>
            <p className="text-mute text-sm mt-1">We'll get back to you as soon as we can.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-5 bg-panel2 border border-line hover:border-violet text-bone px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute">
                  <Icon name="user" />
                </span>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute">
                  <Icon name="mail" />
                </span>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-mute">
                  <Icon name="chat" />
                </span>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="How can we help you?"
                  className={`${inputClass} resize-y`}
                />
              </div>
              <p className="text-mute text-xs text-right mt-1">{message.length}/2000</p>
            </div>

            <input
              type="text"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              disabled={sending}
              className="w-full bg-violet hover:bg-violet-bright transition-colors text-bone py-3 rounded-lg text-sm font-semibold tracking-wider uppercase disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
