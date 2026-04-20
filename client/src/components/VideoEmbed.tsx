'use client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,   // ✅ Shorts supported
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function parseDriveId(url: string): string | null {
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

export function detectVideoProvider(url: string): 'youtube' | 'drive' | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('drive.google.com')) return 'drive';
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VideoEmbedProps {
  url: string;
  provider?: 'youtube' | 'drive' | null;
  className?: string;
  title?: string;
}

export default function VideoEmbed({
  url,
  provider,
  className = '',
  title = 'Project Video',
}: VideoEmbedProps) {
  const p = provider || detectVideoProvider(url);

  let embedUrl = '';

  if (p === 'youtube') {
    const id = parseYouTubeId(url);
    if (!id) return null;
    // Shorts are auto-normalized to standard embed — no special handling needed
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    embedUrl = [
      `https://www.youtube.com/embed/${id}`,
      `?rel=0`,
      `&modestbranding=1`,
      `&enablejsapi=1`,
      origin ? `&origin=${encodeURIComponent(origin)}` : '',
    ].join('');
  } else if (p === 'drive') {
    const id = parseDriveId(url);
    if (!id) return null;
    embedUrl = `https://drive.google.com/file/d/${id}/preview`;
  } else {
    return null;
  }

  const blockContext = (e: React.MouseEvent) => e.preventDefault();

  return (
    // `media-protected` applies CSS shield; `select-none` prevents text selection around iframe
    <div
      className={`media-protected relative w-full aspect-video rounded-2xl overflow-hidden bg-black select-none ${className}`}
      onContextMenu={blockContext}
    >
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
        // Note: sandbox and referrerPolicy removed temporarily to troubleshoot "Error 153"
      />
    </div>
  );
}
