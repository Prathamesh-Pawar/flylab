"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeDemoBooking } from "@/lib/booking";
import { emitClientObservation } from "@/lib/telemetry";
import { SeatBundleOffer } from "@/components/seat-bundle-offer";

export function TravelerForm({ flightId }: { flightId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const booking = completeDemoBooking({ flightId, travelerName: String(form.get("name") ?? ""), travelerEmail: String(form.get("email") ?? "") });
      emitClientObservation({ provider: "posthog", kind: "event", name: "booking_completed", operationId: booking.operationId, flightId, attributes: { bookingReference: booking.bookingReference } });
      emitClientObservation({ provider: "cloudwatch", kind: "log", name: "demo_booking_confirmed", operationId: booking.operationId, flightId, attributes: { reservationId: booking.bookingReference, amountCents: booking.amountCents } });
      emitClientObservation({ provider: "cloudwatch", kind: "metric", name: "DemoBookingCompleted", operationId: booking.operationId, flightId, value: 1, unit: "Count", attributes: { route: "/checkout/[flightId]" } });
      router.push(`/booking/${booking.bookingReference}?flightId=${encodeURIComponent(flightId)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete your demo booking.");
    }
  }

  return <form className="card panel" onSubmit={submit}>
    <p className="eyebrow">TRAVELER AND PAYMENT</p>
    <h1>Traveler details</h1>
    <p className="intro">This is a demo journey. Nothing is charged or reserved.</p>
    <div className="form-grid">
      <label className="wide">Full name<input name="name" autoComplete="name" placeholder="Avery Chen" required /></label>
      <label className="wide">Email<input name="email" type="email" autoComplete="email" placeholder="avery@example.com" required /></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="415 555 0123" required /></label>
      <label>Payment card<input name="card" inputMode="numeric" autoComplete="cc-number" pattern="[0-9 ]{12,19}" placeholder="4242 4242 4242 4242" required /></label>
    </div>
    <SeatBundleOffer flightId={flightId} />
    <p className="payment-note">Demo payment only. You may use any 12–19 digit number; no payment details are retained.</p>
    <p className="error" aria-live="polite">{message}</p>
    <button className="button" type="submit">Complete demo booking</button>
  </form>;
}
