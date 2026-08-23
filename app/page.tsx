"use client";

import { useState } from "react";
import { FlightCard } from "@/components/flight-card";
import { SearchForm } from "@/components/search-form";
import { searchFlights } from "@/lib/search";

export default function SearchPage() {
  const [query, setQuery] = useState({ origin: "SFO", destination: "JFK", date: "2026-09-04" });
  const results = searchFlights({ origin: query.origin, destination: query.destination, departureDate: query.date });
  const supported = query.origin.trim().toUpperCase() === "SFO" && query.destination.trim().toUpperCase() === "JFK";
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${query.date}T12:00:00Z`));
  return <section className="page">
    <p className="eyebrow">FLIGHT SEARCH</p>
    <h1 className="title">Book a demo flight</h1>
    <p className="intro">FlightLab supports one deterministic route: San Francisco (SFO) to New York (JFK).</p>
    <SearchForm onSearch={(origin, destination, date) => setQuery({ origin, destination, date })} />
    {!supported && <p className="notice" role="status">This demo only has flights from SFO to JFK. Update the airports to view the available options.</p>}
    <div className="results-heading"><div><p className="eyebrow">AVAILABLE FLIGHTS</p><h2>SFO <span aria-hidden="true">→</span> JFK</h2></div><p className="result-count">{results.length} result{results.length === 1 ? "" : "s"} for {dateLabel}</p></div>
    <div className="flight-list">{results.map((flight) => <FlightCard key={flight.id} flight={flight} />)}</div>
  </section>;
}
