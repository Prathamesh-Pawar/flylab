import { flights, type Flight } from "@/data/flights";

export type SearchInput = { origin: string; destination: string; departureDate?: string };

export function searchFlights(input: SearchInput): Flight[] {
  const origin = input.origin.trim().toUpperCase();
  const destination = input.destination.trim().toUpperCase();
  if (origin !== "SFO" || destination !== "JFK") return [];
  // The demo inventory is intentionally a compact seven-day flexible-date view.
  // Each date offers the same six deterministic SFO → JFK choices.
  return flights;
}

export function getFlight(flightId: string): Flight | undefined {
  return flights.find((flight) => flight.id === flightId);
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function formatFlightTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(new Date(iso));
}

export function durationBetween(departureAt: string, arrivalAt: string): string {
  const minutes = Math.round((new Date(arrivalAt).getTime() - new Date(departureAt).getTime()) / 60_000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
