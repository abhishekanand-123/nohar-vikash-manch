import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

interface EventCountdownProps {
  showHeading?: boolean;
}

function getLanguage(): "hi" | "mai" | "en" {
  if (typeof window === "undefined") return "hi";
  const local = localStorage.getItem("user_selected_lang");
  if (local === "mai" || local === "en" || local === "hi") return local;

  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = match[1].split("/");
    const lang = parts[parts.length - 1];
    if (lang === "mai" || lang === "en" || lang === "hi") return lang;
  }
  return "hi";
}

const TRANSLATIONS = {
  hi: {
    days: "दिन",
    hrs: "घंटे",
    min: "मिनट",
    sec: "सेकंड",
    defaultTitle: "उत्सव काउंटडाउन",
    suffix: "काउंटडाउन",
    noEvent: "कोई आगामी कार्यक्रम उपलब्ध नहीं है।",
  },
  mai: {
    days: "दिन",
    hrs: "घंटा",
    min: "मिनिट",
    sec: "सेकेण्ड",
    defaultTitle: "उत्सव / पावनि काउंटडाउन",
    suffix: "काउंटडाउन",
    noEvent: "कोनो आगाँ कार्यक्रम उपलब्ध नहि अछि।",
  },
  en: {
    days: "Days",
    hrs: "Hours",
    min: "Mins",
    sec: "Secs",
    defaultTitle: "Event Countdown",
    suffix: "Countdown",
    noEvent: "No upcoming event available.",
  },
};

export default function EventCountdown({ showHeading = true }: EventCountdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [target, setTarget] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("दीवाली");
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
        setEventTitle(upcoming.title || "दीवाली");
        setHasEvent(true);
      } else {
        setHasEvent(false);
      }
    }

    loadUpcomingEvent();
  }, []);

  useEffect(() => {
    if (containerRef.current && !shadowRef.current) {
      try {
        shadowRef.current = containerRef.current.attachShadow({ mode: "open" });
      } catch {
        shadowRef.current = containerRef.current.shadowRoot;
      }
    }
  }, []);

  useEffect(() => {
    function render() {
      if (!shadowRef.current) return;
      const lang = getLanguage();
      const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;
      const diff = getTimeDiff(target);
      const days = String(diff.days).padStart(2, "0");
      const hrs = String(diff.hrs).padStart(2, "0");
      const min = String(diff.min).padStart(2, "0");
      const sec = String(diff.sec).padStart(2, "0");

      const titleText = hasEvent ? `${eventTitle} ${t.suffix}` : t.defaultTitle;

      const headingHtml = showHeading
        ? `<div class="heading-row">
            <span class="emoji">🪔</span>
            <span class="title">${titleText}</span>
          </div>`
        : "";

      const noEventHtml = !hasEvent
        ? `<div class="no-event">${t.noEvent}</div>`
        : "";

      shadowRef.current.innerHTML = `
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: inherit;
          }
          :host {
            display: block;
            width: 100%;
          }
          .container {
            width: 100%;
            user-select: none;
          }
          .heading-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-bottom: 12px;
          }
          .emoji {
            font-size: 1.1rem;
            line-height: 1;
          }
          .title {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #15803d;
            text-align: center;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            align-items: center;
          }
          .unit-card {
            text-align: center;
          }
          .num {
            font-size: 1.75rem;
            font-weight: 800;
            line-height: 1;
            color: #ea580c;
            font-variant-numeric: tabular-nums;
            letter-spacing: -0.02em;
          }
          @media (min-width: 640px) {
            .num {
              font-size: 2rem;
            }
          }
          .label {
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-top: 6px;
          }
          .no-event {
            text-align: center;
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 12px;
          }
        </style>
        <div class="container notranslate" translate="no">
          ${headingHtml}
          <div class="grid">
            <div class="unit-card">
              <div class="num">${days}</div>
              <div class="label">${t.days}</div>
            </div>
            <div class="unit-card">
              <div class="num">${hrs}</div>
              <div class="label">${t.hrs}</div>
            </div>
            <div class="unit-card">
              <div class="num">${min}</div>
              <div class="label">${t.min}</div>
            </div>
            <div class="unit-card">
              <div class="num">${sec}</div>
              <div class="label">${t.sec}</div>
            </div>
          </div>
          ${noEventHtml}
        </div>
      `;
    }

    render();
    const id = setInterval(render, 1000);
    return () => clearInterval(id);
  }, [target, eventTitle, hasEvent, showHeading]);

  return (
    <div
      ref={containerRef}
      className="skiptranslate notranslate w-full select-none"
      translate="no"
    />
  );
}
