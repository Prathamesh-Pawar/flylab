import Link from "next/link";
import { getFlight, formatMoney } from "@/lib/search";

export default async function BookingPage({ params, searchParams }: { params: Promise<{ bookingId: string }>; searchParams: Promise<{ flightId?: string }> }) {
  const [{ bookingId }, { flightId }] = await Promise.all([params, searchParams]);
  const flight = flightId ? getFlight(flightId) : undefined;
  return <section className="page"><article className="card confirmation">
    <div className="check" aria-hidden="true">✓</div>
    <p className="eyebrow">DEMO BOOKING CONFIRMED</p>
    <h1 className="title">You&apos;re all set.</h1>
    <p>Your confirmation reference is deterministic for this flight and email. It does not represent a real ticket.</p>
    <div className="reference" aria-label={`Booking reference ${bookingId}`}>{bookingId}</div>
    {flight && <p>{flight.origin} to {flight.destination} · {flight.id} · {formatMoney(flight.fareCents)} demo total</p>}
    <Link className="button secondary" href="/">Search another flight</Link>
  </article></section>;
}
