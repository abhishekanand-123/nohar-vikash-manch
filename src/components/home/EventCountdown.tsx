import { useState, useEffect } from "react";

function getNextRamnavami(): Date {
  const now = new Date();
  // Approximate Ramnavami 2027: April 6
  const dates = [
    new Date("2026-03-27T00:00:00+05:30"),
    new Date("2027-04-06T00:00:00+05:30"),
  ];
  for (const d of dates) {
    if (d > now) return d;
  }
  return dates[dates.length - 1];
}

export default function EventCountdown() {
  const target = getNextRamnavami();
  const [diff, setDiff] = useState(getTimeDiff());

  function getTimeDiff() {
    const ms = target.getTime() - Date.now();
    if (ms <= 0) return { days: 0, hrs: 0, min: 0, sec: 0 };
    return {
      days: Math.floor(ms / 86400000),
      hrs: Math.floor((ms % 86400000) / 3600000),
      min: Math.floor((ms % 3600000) / 60000),
      sec: Math.floor((ms % 60000) / 1000),
    };
  }

  useEffect(() => {
    const id = setInterval(() => setDiff(getTimeDiff()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: diff.days },
    { label: "Hrs", value: diff.hrs },
    { label: "Min", value: diff.min },
    { label: "Sec", value: diff.sec },
  ];

  return (
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
  );
}
