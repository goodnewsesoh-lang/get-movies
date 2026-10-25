export function Spinner({ size = 40, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-4 border-line border-t-violet-bright animate-spin"
      />
    </div>
  );
}

export function LoadingGrid({ count = 10 }) {
  return <Spinner className={count <= 5 ? 'py-8' : 'py-20'} />;
}

export function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="text-center py-20 border border-dashed border-line rounded-xl">
      <p className="text-bone font-medium">{title}</p>
      {message && <p className="text-mute text-sm mt-1">{message}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong loading this page.' }) {
  return (
    <div className="text-center py-20 border border-line rounded-xl bg-panel">
      <p className="text-bone font-medium">Couldn't load this</p>
      <p className="text-mute text-sm mt-1">{message}</p>
    </div>
  );
}
