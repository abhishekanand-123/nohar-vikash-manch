import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

interface EventCountdownProps {
  showHeading?: boolean;
}

function getCurrentLang(): "hi" | "en" | "mai" {
  if (typeof window === "undefined") return "hi";
  const local = localStorage.getItem("user_selected_lang");
  if (local && ["hi", "en", "mai"].includes(local)) return local as "hi" | "en" | "mai";

  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = match[1].split("/");
    const lang = parts[parts.length - 1];
    if (["hi", "en", "mai"].includes(lang)) return lang as "hi" | "en" | "mai";
  }
  return "hi";
}

const LABELS = {
  hi: {
    days: "दिन",
    hrs: "घंटे",
    min: "मिनट",
    sec: "सेकंड",
    countdown: "काउंटडाउन",
    fallback: "उत्सव काउंटडाउन",
    noEvent: "कोई आगामी कार्यक्रम उपलब्ध नहीं है।",
  },
  mai: {
    days: "दिन",
    hrs: "घंटा",
    min: "मिनट",
    sec: "सेकंड",
    countdown: "उल्टी गिनती",
    fallback: "पर्व उल्टी गिनती",
    noEvent: "आगामी कार्यक्रमक कोनो तिथि उपलब्ध नहि अछि।",
  },
  en: {
    days: "Days",
    hrs: "Hours",
    min: "Mins",
    sec: "Secs",
    countdown: "Countdown",
    fallback: "Festival Countdown",
    noEvent: "No upcoming event date available yet.",
  },
};

export default function EventCountdown({ showHeading = true }: EventCountdownProps) {
  const [target, setTarget] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("Upcoming Event");
  const [diff, setDiff] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });
  const [hasEvent, setHasEvent] = useState(false);
  const [lang, setLang] = useState<"hi" | "en" | "mai">("hi");

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
    setLang(getCurrentLang());

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

  const l = LABELS[lang] || LABELS.hi;

  const units = [
    { label: l.days, value: diff.days },
    { label: l.hrs, value: diff.hrs },
    { label: l.min, value: diff.min },
    { label: l.sec, value: diff.sec },
  ];

  const headingText = hasEvent ? `${eventTitle} ${l.countdown}` : l.fallback;

  return (
    <div className="notranslate w-full select-none" translate="no">
      {showHeading && (
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <p className="text-center text-[12px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-primary leading-tight px-1 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-base select-none" aria-hidden="true">
              🪔
            </span>
            <span className="font-bold">{headingText}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u, idx) => (
          <div key={idx} className="text-center">
            <div
              className="text-2xl sm:text-3xl font-bold text-accent tabular-nums font-display leading-none select-none tracking-tight"
            >
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5 font-semibold">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {!hasEvent && <p className="text-center text-xs text-muted-foreground mt-4">{l.noEvent}</p>}
    </div>
  );
}
