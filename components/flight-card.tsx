import Link from "next/link";
import type { Flight } from "@/data/flights";
import { durationBetween, formatFlightTime, formatMoney } from "@/lib/search";

export function FlightCard({ flight }: { flight: Flight }) {
  return <article className="card flight-card">
    <div>
      <div className="route">{flight.origin} <span aria-hidden="true">→</span> {flight.destination}</div>
      <div className="time">Departs {formatFlightTime(flight.departureAt)} · Arrives {formatFlightTime(flight.arrivalAt)}</div>
    </div>
    <div className="meta">{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`} · {durationBetween(flight.departureAt, flight.arrivalAt)}</div>
    <div className="fare">{formatMoney(flight.fareCents)}<small>per traveler</small><Link className="button" href={`/checkout/${flight.id}`}>Select flight</Link></div>
  </article>;
}
