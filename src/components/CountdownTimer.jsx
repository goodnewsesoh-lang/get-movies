import { useEffect, useState } from 'react';

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ target, compact = false }) {
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (!remaining) return <span>Unlocking…</span>;

  if (compact) {
    return <span>{remaining.days}d {remaining.hours}h</span>;
  }

  return (
    <span>
      {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </span>
  );
}
