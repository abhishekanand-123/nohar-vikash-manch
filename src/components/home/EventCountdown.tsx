import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

interface EventCountdownProps {
  showHeading?: boolean;
}

export default function EventCountdown({ showHeading = true }: EventCountdownProps) {
  const [target, setTarget] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("Upcoming Event");
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
    { label: "Days", value: diff.days },
    { label: "Hrs", value: diff.hrs },
    { label: "Min", value: diff.min },
    { label: "Sec", value: diff.sec },
  ];

  return (
    <>
      {showHeading && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-base">🪔</span>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
            {hasEvent ? `${eventTitle} Countdown` : "Festival Countdown"}
          </p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-4">
        {units.map((u) => (
          <div key={u.label} className="text-center">
            <div className="text-2xl font-bold text-accent tabular-nums font-display">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {!hasEvent && <p className="text-center text-xs text-muted-foreground mt-4">No upcoming event date available yet.</p>}
    </>
  );
}
