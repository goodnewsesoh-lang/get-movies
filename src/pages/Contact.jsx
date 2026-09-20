import { useEffect, useState } from 'react';
import { fetchSiteSettings } from '../lib/settings.js';

export default function Contact() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const methods = [
    { label: 'Email', value: settings?.contact_email, href: settings?.contact_email ? `mailto:${settings.contact_email}` : null },
    { label: 'WhatsApp', value: settings?.contact_whatsapp, href: settings?.contact_whatsapp },
    { label: 'Telegram', value: settings?.contact_telegram, href: settings?.contact_telegram },
  ].filter((m) => m.value);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-bone mb-4">Contact Get Movies</h1>
      <p className="text-mute mb-8">Got a question, suggestion, or request? Reach out here.</p>

      {methods.length === 0 && <p className="text-mute text-sm">Contact details coming soon.</p>}

      <div className="space-y-3">
       {methods.map((m) => (
            
              key={m.label}
            href={m.href}
            target="_blank"
            rel="noreferrer"
            className="block bg-panel border border-line rounded-lg px-4 py-3 hover:border-violet/60 transition-colors"
          >
            <span className="text-mute text-xs">{m.label}</span>
            <p className="text-bone text-sm">{m.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
