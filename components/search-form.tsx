"use client";

import { useState } from "react";

export function SearchForm({ onSearch }: { onSearch: (origin: string, destination: string, date: string) => void }) {
  const [origin, setOrigin] = useState("SFO");
  const [destination, setDestination] = useState("JFK");
  const [date, setDate] = useState("2026-09-04");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(origin, destination, date);
  }

  return (
    <form className="card search-card" onSubmit={submit}>
      <div className="search-fields">
        <label>From<input value={origin} onChange={(event) => setOrigin(event.target.value)} aria-label="Origin airport" required /></label>
        <label>To<input value={destination} onChange={(event) => setDestination(event.target.value)} aria-label="Destination airport" required /></label>
        <label>Departure<input type="date" value={date} onChange={(event) => setDate(event.target.value)} min="2026-09-01" max="2026-09-07" required /></label>
        <button className="button" type="submit">Search flights</button>
      </div>
    </form>
  );
}
