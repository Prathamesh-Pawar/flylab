import { getFlight } from "@/lib/search";

export type BookingInput = { flightId: string; travelerName: string; travelerEmail: string };
export type DemoBooking = BookingInput & { bookingReference: string; operationId: string; amountCents: number };

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(8, "0");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createBookingReference(flightId: string, travelerEmail: string): string {
  return `FLB-${stableHash(`${flightId}:${normalizeEmail(travelerEmail)}`).slice(-7)}`;
}

export function createBookingOperationId(flightId: string, travelerEmail: string): string {
  return `op-${stableHash(`${flightId}:${normalizeEmail(travelerEmail)}`).toLowerCase().slice(-8)}`;
}

export function completeDemoBooking(input: BookingInput): DemoBooking {
  const flight = getFlight(input.flightId);
  if (!flight) throw new Error("Selected flight is unavailable.");
  const email = normalizeEmail(input.travelerEmail);
  if (!input.travelerName.trim() || !email.includes("@")) throw new Error("Enter a traveler name and valid email.");
  return {
    ...input,
    travelerName: input.travelerName.trim(),
    travelerEmail: email,
    bookingReference: createBookingReference(input.flightId, email),
    operationId: createBookingOperationId(input.flightId, email),
    amountCents: flight.fareCents
  };
}
