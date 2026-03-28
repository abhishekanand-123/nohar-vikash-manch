import { useEffect, useRef, type ReactNode } from "react";
import { useAnalyticsAllowed } from "@/contexts/AnalyticsConsentContext";
import { trackSectionTime, trackSectionViewOnce } from "@/lib/analytics/tracker";

interface SectionTrackerProps {
  sectionId: string;
  children: ReactNode;
  className?: string;
  /** Intersection ratio (0–1) to count as “seen” */
  threshold?: number;
}

export default function SectionTracker({ sectionId, children, className, threshold = 0.35 }: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visibleSince = useRef<number | null>(null);
  const accumulatedMs = useRef(0);
  const seenRef = useRef(false);
  const analyticsAllowed = useAnalyticsAllowed();

  useEffect(() => {
    seenRef.current = false;
    accumulatedMs.current = 0;
    visibleSince.current = null;
  }, [sectionId]);

  useEffect(() => {
    if (!analyticsAllowed) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && e.intersectionRatio >= threshold) {
          if (!seenRef.current) {
            seenRef.current = true;
            trackSectionViewOnce(sectionId);
          }
          if (visibleSince.current === null) visibleSince.current = performance.now();
        } else if (visibleSince.current !== null) {
          accumulatedMs.current += performance.now() - visibleSince.current;
          visibleSince.current = null;
        }
      },
      { threshold: [0, threshold, 0.5] }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (visibleSince.current !== null) {
        accumulatedMs.current += performance.now() - visibleSince.current;
      }
      trackSectionTime(sectionId, accumulatedMs.current);
    };
  }, [sectionId, threshold, analyticsAllowed]);

  return (
    <div ref={ref} className={className} data-analytics-section={sectionId}>
      {children}
    </div>
  );
}
