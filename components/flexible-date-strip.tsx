"use client";

const dates = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"];

export function FlexibleDateStrip({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  return <div className="date-strip" aria-label="Flexible departure dates">
    {dates.map((date) => {
      const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
      return <button key={date} type="button" className="date-option" aria-pressed={selectedDate === date} onClick={() => onSelect(date)}>{label}</button>;
    })}
  </div>;
}
