import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

interface EventCountdownProps {
  showHeading?: boolean;
}

export default function EventCountdown({ showHeading = true }: EventCountdownProps) {
  const [target, setTarget] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("दीवाली");
  const [diff, setDiff] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });
  const [hasEvent, setHasEvent] = useState(false);

  function getTimeDiff(targetDate: Date | null) {
    if (!targetDate) return { days: 0, hrs: 0, min: 0, sec: 0 };
    const ms = targetDate.getTime() - Date.now();
    if (ms <= 0) return { days: 0, hrs: 0, min: 0, sec: 0 };
    return {
      days: Math.floor(ms / 86400000),
      hrs: Math.floor((ms % 86400000) / 3600000),
      min: Math.floor((ms % 3600000) / 60000),
      sec: Math.floor((ms % 60000) / 1000),
    };
  }

  useEffect(() => {
    async function loadUpcomingEvent() {
      const today = new Date().toISOString();
      const { data } = await supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1);

      const upcoming = (data as Event[] | null)?.[0];
      if (upcoming?.date) {
        const targetDate = new Date(upcoming.date);
        setTarget(targetDate);
        setEventTitle(upcoming.title);
        setHasEvent(true);
        setDiff(getTimeDiff(targetDate));
      } else {
        setHasEvent(false);
      }
    }

    loadUpcomingEvent();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setDiff(getTimeDiff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "दिन", value: diff.days },
    { label: "घंटे", value: diff.hrs },
    { label: "मिनट", value: diff.min },
    { label: "सेकंड", value: diff.sec },
  ];

  return (
    <div className="skiptranslate notranslate w-full select-none" translate="no">
      {showHeading && (
        <div className="skiptranslate notranslate flex items-center justify-center mb-3 sm:mb-4" translate="no">
          <p className="skiptranslate notranslate text-center text-[12px] sm:text-xs font-semibold tracking-wider text-primary leading-tight px-1 flex items-center justify-center gap-1.5" translate="no">
            <span className="skiptranslate notranslate text-base select-none" aria-hidden="true" translate="no">
              🪔
            </span>
            <span className="skiptranslate notranslate font-bold text-primary" translate="no">
              {hasEvent ? `${eventTitle} काउंटडाउन` : "उत्सव काउंटडाउन"}
            </span>
          </p>
        </div>
      )}
      <div className="skiptranslate notranslate grid grid-cols-4 gap-2 sm:gap-3" translate="no">
        {units.map((u, idx) => (
          <div key={idx} className="skiptranslate notranslate text-center" translate="no">
            <div
              className="skiptranslate notranslate text-2xl sm:text-3xl font-bold text-accent tabular-nums font-display leading-none select-none tracking-tight"
              translate="no"
            >
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="skiptranslate notranslate text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5 font-semibold" translate="no">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {!hasEvent && (
        <p className="skiptranslate notranslate text-center text-xs text-muted-foreground mt-4" translate="no">
          कोई आगामी कार्यक्रम उपलब्ध नहीं है।
        </p>
      )}
    </div>
  );
}
