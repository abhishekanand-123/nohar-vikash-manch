/** Route slug stored in `videos.page_key` when placement = 'page' (must match pathname segment). */
export const PAGE_VIDEO_OPTIONS = [
  { key: "about", label: "About / हमारे बारे में" },
  { key: "festivals", label: "Festivals / त्योहार" },
  { key: "ramnavami", label: "Ram Navami / रामनवमी" },
  { key: "sports", label: "Sports / खेल" },
  { key: "gallery", label: "Gallery / गैलरी" },
  { key: "videos", label: "Videos page / वीडियो" },
  { key: "donation", label: "Donation / दान" },
] as const;

const PAGE_KEYS = new Set(PAGE_VIDEO_OPTIONS.map((o) => o.key));

/** First path segment for public pages that support page-scoped videos (not home `/`). */
export function pathnameToVideoPageKey(pathname: string): string | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg || !PAGE_KEYS.has(seg)) return null;
  return seg;
}
