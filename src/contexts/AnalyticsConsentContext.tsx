import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAnalyticsConsent, hasAnalyticsConsent } from "@/lib/analytics/consent";

const AnalyticsConsentContext = createContext<{
  analyticsAllowed: boolean;
  refreshConsent: () => void;
} | null>(null);

export function AnalyticsConsentProvider({ children }: { children: ReactNode }) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(() => hasAnalyticsConsent());

  const refreshConsent = useCallback(() => {
    setAnalyticsAllowed(hasAnalyticsConsent());
  }, []);

  useEffect(() => {
    const onChange = () => refreshConsent();
    window.addEventListener("nv-analytics-consent-changed", onChange);
    return () => window.removeEventListener("nv-analytics-consent-changed", onChange);
  }, [refreshConsent]);

  const value = useMemo(() => ({ analyticsAllowed, refreshConsent }), [analyticsAllowed, refreshConsent]);

  return <AnalyticsConsentContext.Provider value={value}>{children}</AnalyticsConsentContext.Provider>;
}

export function useAnalyticsAllowed(): boolean {
  return useContext(AnalyticsConsentContext)?.analyticsAllowed ?? false;
}

export function notifyAnalyticsConsentChanged(): void {
  window.dispatchEvent(new Event("nv-analytics-consent-changed"));
}
