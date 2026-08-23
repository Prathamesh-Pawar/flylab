import type { Flight } from "@/data/flights";
import { durationBetween, formatFlightTime, formatMoney } from "@/lib/search";

export function FareSummary({ flight }: { flight: Flight }) {
  return <aside className="card panel" aria-label="Fare summary">
    <p className="eyebrow">YOUR TRIP</p>
    <h2>{flight.origin} <span aria-hidden="true">→</span> {flight.destination}</h2>
    <div className="summary-row"><span>Flight</span><strong>{flight.id}</strong></div>
    <div className="summary-row"><span>Departure</span><strong>{formatFlightTime(flight.departureAt)}</strong></div>
    <div className="summary-row"><span>Duration</span><strong>{durationBetween(flight.departureAt, flight.arrivalAt)}</strong></div>
    <div className="summary-row"><span>Stops</span><strong>{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}</strong></div>
    <div className="summary-row total"><span>Demo total</span><span>{formatMoney(flight.fareCents)}</span></div>
  </aside>;
}
