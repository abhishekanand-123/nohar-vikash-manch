import { useEffect, useRef, useState } from "react";
import { useAnalyticsAllowed } from "@/contexts/AnalyticsConsentContext";
import { getCurrentAnalyticsPath, trackAnalyticsEvent } from "@/lib/analytics/tracker";

interface VideoEmbedProps {
  embedUrl?: string | null;
  fileUrl?: string | null;
  title: string;
  className?: string;
  /** DB id for analytics (page + video mapping on server) */
  videoId?: string | null;
}

export default function VideoEmbed({
  embedUrl,
  fileUrl,
  title,
  className = "",
  videoId: analyticsVideoId,
}: VideoEmbedProps) {
  const file = fileUrl?.trim();
  const embed = embedUrl?.trim();
  const analyticsAllowed = useAnalyticsAllowed();
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const viewSent = useRef(false);
  /** Last sampled currentTime (seconds) while playing — avoids losing watch time when timeupdate gaps > 3s */
  const lastSampleCt = useRef(0);
  const watchMsBucket = useRef(0);
  const lastSeekTs = useRef(0);

  const vid = analyticsVideoId?.trim() || null;

  useEffect(() => {
    if (!analyticsAllowed || !vid || !containerRef.current) return;
    const root = containerRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !viewSent.current) {
          viewSent.current = true;
          trackAnalyticsEvent({
            type: "video_view",
            videoId: vid,
            pagePath: getCurrentAnalyticsPath(),
            metadata: { title },
          });
        }
      },
      { threshold: 0.2 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [analyticsAllowed, vid, title]);

  useEffect(() => {
    const v = videoEl;
    if (!analyticsAllowed || !vid || !v) return;

    const flushWatch = (final = false) => {
      const ms = Math.round(watchMsBucket.current);
      watchMsBucket.current = 0;
      if (ms < 1 && !final) return;
      if (ms < 1 && final) return;
      trackAnalyticsEvent({
        type: "video_watch_time",
        videoId: vid,
        pagePath: getCurrentAnalyticsPath(),
        durationMs: ms,
        metadata: { title, currentTime: v.currentTime, duration: v.duration || null },
      });
    };

    const baseline = () => {
      lastSampleCt.current = v.currentTime;
    };

    const onPlay = () => {
      baseline();
      trackAnalyticsEvent({
        type: "video_play",
        videoId: vid,
        pagePath: getCurrentAnalyticsPath(),
        metadata: { title, t: v.currentTime },
      });
    };

    const onPlaying = () => {
      baseline();
    };

    const onPause = () => {
      flushWatch(true);
      trackAnalyticsEvent({
        type: "video_pause",
        videoId: vid,
        pagePath: getCurrentAnalyticsPath(),
        metadata: { title, t: v.currentTime },
      });
    };

    const onSeeked = () => {
      const now = Date.now();
      if (now - lastSeekTs.current < 400) return;
      lastSeekTs.current = now;
      baseline();
      trackAnalyticsEvent({
        type: "video_seek",
        videoId: vid,
        pagePath: getCurrentAnalyticsPath(),
        metadata: { title, t: v.currentTime },
      });
    };

    const onTimeUpdate = () => {
      if (v.paused || v.seeking) return;
      const ct = v.currentTime;
      let deltaSec = ct - lastSampleCt.current;
      if (deltaSec < 0) {
        baseline();
        return;
      }
      if (deltaSec > 25) deltaSec = 25;
      watchMsBucket.current += deltaSec * 1000;
      lastSampleCt.current = ct;
      if (watchMsBucket.current >= 4000) flushWatch();
    };

    const onEnded = () => {
      flushWatch(true);
      const dur = v.duration || 0;
      const pct = dur > 0 ? Math.round((v.currentTime / dur) * 1000) / 10 : null;
      trackAnalyticsEvent({
        type: "video_ended",
        videoId: vid,
        pagePath: getCurrentAnalyticsPath(),
        metadata: { title, duration: dur },
      });
      if (dur > 0 && v.currentTime / dur >= 0.9) {
        trackAnalyticsEvent({
          type: "video_complete",
          videoId: vid,
          pagePath: getCurrentAnalyticsPath(),
          metadata: { title, percent: pct },
        });
      }
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);

    return () => {
      flushWatch(true);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [analyticsAllowed, vid, title, videoEl]);

  if (file) {
    return (
      <div ref={containerRef} className={`relative aspect-video w-full min-w-0 overflow-hidden rounded-xl bg-black shadow-card ring-1 ring-border ${className}`}>
        <video
          ref={setVideoEl}
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
      <div ref={containerRef} className={`relative aspect-video w-full min-w-0 overflow-hidden rounded-xl bg-black shadow-card ring-1 ring-border ${className}`}>
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
