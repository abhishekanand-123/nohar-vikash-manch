import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics/consent";
import { notifyAnalyticsConsentChanged } from "@/contexts/AnalyticsConsentContext";
import { Button } from "@/components/ui/button";

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = getAnalyticsConsent();
    setOpen(c === null);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-card/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-label="Privacy and analytics"
    >
      <div className="container mx-auto max-w-4xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use privacy-friendly, first-party analytics (hashed IP, no selling of data) to improve the site. Accept to
          allow usage and video statistics, or choose essential only to disable tracking.
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAnalyticsConsent("rejected");
              notifyAnalyticsConsentChanged();
              setOpen(false);
            }}
          >
            Essential only
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAnalyticsConsent("accepted");
              notifyAnalyticsConsentChanged();
              setOpen(false);
            }}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
