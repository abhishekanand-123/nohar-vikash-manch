import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  flushAnalyticsQueue,
  getCurrentAnalyticsPath,
  setCurrentAnalyticsPath,
  initAnalyticsLifecycle,
  trackAnalyticsEvent,
} from "@/lib/analytics/tracker";
import { useAnalyticsAllowed } from "@/contexts/AnalyticsConsentContext";

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const analyticsAllowed = useAnalyticsAllowed();
  const pageEnterAt = useRef<number>(Date.now());
  const prevPath = useRef<string | null>(null);

  useEffect(() => initAnalyticsLifecycle(), []);

  useEffect(() => {
    if (!analyticsAllowed) {
      prevPath.current = null;
      return;
    }

    const path = `${location.pathname}${location.search || ""}`;
    setCurrentAnalyticsPath(path);
    const now = Date.now();

    if (prevPath.current != null && prevPath.current !== path) {
      const spent = now - pageEnterAt.current;
      trackAnalyticsEvent({
        type: "page_leave",
        pagePath: prevPath.current,
        durationMs: spent,
      });
      void flushAnalyticsQueue();
    }

    prevPath.current = path;
    pageEnterAt.current = now;
    trackAnalyticsEvent({ type: "page_view", pagePath: path });
  }, [location.pathname, location.search, analyticsAllowed]);

  useEffect(() => {
    if (!analyticsAllowed) return;

    const onDocClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("[data-analytics-click]");
      if (!el) return;
      const label = el.getAttribute("data-analytics-click") || "unknown";
      let sectionId = el.getAttribute("data-analytics-section");
      if (!sectionId) {
        sectionId = el.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") ?? undefined;
      }
      trackAnalyticsEvent({
        type: "click_event",
        pagePath: getCurrentAnalyticsPath(),
        sectionId: sectionId || undefined,
        metadata: { label, tag: el.tagName.toLowerCase() },
      });
    };

    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [location.pathname, analyticsAllowed]);

  return <>{children}</>;
}
