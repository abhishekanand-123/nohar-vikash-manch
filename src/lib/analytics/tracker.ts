import type { AnalyticsEventPayload } from "./types";
import { hasAnalyticsConsent } from "./consent";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "nv_analytics_vid";
const SESSION_KEY = "nv_analytics_sid";

let currentPagePath = "/";

export function setCurrentAnalyticsPath(path: string): void {
  currentPagePath = path || "/";
}

export function getCurrentAnalyticsPath(): string {
  return currentPagePath;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId(): string {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = randomId();
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  } catch {
    return randomId();
  }
}

function getSessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = randomId();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return randomId();
  }
}

function deviceType(): string {
  const ua = navigator.userAgent || "";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function browserLabel(): string {
  const ua = navigator.userAgent || "";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Other";
}

const queue: AnalyticsEventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_MS = 4500;
const MAX_BATCH = 18;

function ingestUrl(): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/functions/v1/analytics-ingest`;
}

function publishableKey(): string | null {
  return (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? null;
}

function analyticsGloballyDisabled(): boolean {
  return import.meta.env.VITE_ANALYTICS_ENABLED === "false";
}

export function trackAnalyticsEvent(payload: AnalyticsEventPayload): void {
  if (analyticsGloballyDisabled()) return;
  if (!hasAnalyticsConsent()) return;

  const enriched: AnalyticsEventPayload = {
    ...payload,
    pagePath: payload.pagePath ?? currentPagePath,
    occurredAt: payload.occurredAt ?? new Date().toISOString(),
  };

  queue.push(enriched);
  if (queue.length >= MAX_BATCH) {
    void flushAnalyticsQueue();
  } else {
    scheduleFlush();
  }
}

function scheduleFlush(): void {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushAnalyticsQueue();
  }, FLUSH_MS);
}

export async function flushAnalyticsQueue(useKeepalive = false): Promise<void> {
  if (analyticsGloballyDisabled() || !hasAnalyticsConsent()) {
    queue.length = 0;
    return;
  }

  if (queue.length === 0) return;

  const url = ingestUrl();
  const key = publishableKey();
  const batch = queue.splice(0, queue.length);
  const events = batch.map((e) => ({
    type: e.type,
    pagePath: e.pagePath,
    sectionId: e.sectionId,
    videoId: e.videoId,
    occurredAt: e.occurredAt,
    durationMs: e.durationMs,
    metadata: e.metadata ?? {},
  }));

  let edgeOk = false;
  if (url && key && typeof fetch !== "undefined") {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({
          consent: true,
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          deviceType: deviceType(),
          browser: browserLabel(),
          events,
        }),
        keepalive: useKeepalive,
      });
      edgeOk = res.ok;
    } catch {
      edgeOk = false;
    }
  }

  if (edgeOk) return;

  const { data, error } = await supabase.rpc("analytics_submit_batch", {
    p_events: events,
    p_visitor_id: getVisitorId(),
    p_session_id: getSessionId(),
    p_device_type: deviceType(),
    p_browser: browserLabel(),
  });

  const payload = data as { ok?: boolean; error?: string; inserted?: number } | null;
  if (error) {
    console.warn("analytics_submit_batch RPC error", error.message, error);
    queue.unshift(...batch);
    return;
  }
  if (!payload?.ok) {
    console.warn("analytics_submit_batch declined", payload?.error ?? payload);
    queue.unshift(...batch);
  }
}

export function initAnalyticsLifecycle(): () => void {
  const onHide = () => {
    void flushAnalyticsQueue(true);
  };
  const onVis = () => {
    if (document.visibilityState === "hidden") onHide();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", onHide);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", onHide);
  };
}

const sectionViewed = new Set<string>();

export function trackSectionViewOnce(sectionId: string): void {
  const key = `${currentPagePath}::${sectionId}`;
  if (sectionViewed.has(key)) return;
  sectionViewed.add(key);
  trackAnalyticsEvent({ type: "section_view", sectionId, pagePath: currentPagePath });
}

export function trackSectionTime(sectionId: string, durationMs: number): void {
  if (durationMs < 800) return;
  trackAnalyticsEvent({
    type: "section_time",
    sectionId,
    pagePath: currentPagePath,
    durationMs: Math.round(durationMs),
  });
}
