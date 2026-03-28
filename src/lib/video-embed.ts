/** Normalize pasted YouTube / Vimeo URLs to a safe embed src. */
export function toEmbedUrl(raw: string): string | null {
  const u = raw.trim();
  if (!u) return null;

  if (/^https?:\/\/(www\.)?youtube\.com\/embed\//i.test(u)) return u.split("&")[0];
  if (/^https?:\/\/player\.vimeo\.com\/video\//i.test(u)) return u.split("?")[0];

  const ytWatch = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  const ytShort = u.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;

  const ytShorts = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/i);
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}`;

  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

export function parseVideoUrlLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => toEmbedUrl(line))
    .filter((url): url is string => Boolean(url));
}
