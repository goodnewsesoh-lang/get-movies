function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com.*(?:\?v=|\/embed\/|\/v\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

export default function TrailerModal({ url, onClose }) {
  const embedUrl = toEmbedUrl(url);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl aspect-video bg-panel rounded-xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-bone bg-ink/70 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Close trailer"
        >
          ✕
        </button>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Trailer"
            allow="autoplay; fullscreen"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute text-sm px-6 text-center">
            This trailer link isn't a recognized YouTube or Vimeo URL.
          </div>
        )}
      </div>
    </div>
  );
}
