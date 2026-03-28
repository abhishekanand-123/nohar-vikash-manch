const CONSENT_KEY = "nv_analytics_consent";

export type AnalyticsConsent = "accepted" | "rejected" | null;

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function setAnalyticsConsent(value: "accepted" | "rejected"): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "accepted";
}
