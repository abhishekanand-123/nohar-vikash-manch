interface VideoEmbedProps {
  embedUrl?: string | null;
  fileUrl?: string | null;
  title: string;
  className?: string;
}

export default function VideoEmbed({ embedUrl, fileUrl, title, className = "" }: VideoEmbedProps) {
  const file = fileUrl?.trim();
  const embed = embedUrl?.trim();

  if (file) {
    return (
      <div className={`relative aspect-video w-full min-w-0 overflow-hidden rounded-xl bg-black shadow-card ring-1 ring-border ${className}`}>
        <video
          src={file}
          controls
          className="absolute inset-0 h-full w-full object-contain"
          preload="metadata"
          playsInline
        />
      </div>
    );
  }

  if (embed) {
    return (
      <div className={`relative aspect-video w-full min-w-0 overflow-hidden rounded-xl bg-black shadow-card ring-1 ring-border ${className}`}>
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return null;
}
