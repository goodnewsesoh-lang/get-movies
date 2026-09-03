export function LoadingGrid({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-panel border border-line animate-pulse">
          <div className="aspect-[2/3] bg-panel2" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-panel2 rounded w-3/4" />
            <div className="h-2.5 bg-panel2 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
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
