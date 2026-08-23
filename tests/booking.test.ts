import { describe, expect, it } from "vitest";
import { completeDemoBooking, createBookingReference } from "@/lib/booking";

describe("booking references", () => {
  it("is stable for a flight ID and normalized email", () => {
    expect(createBookingReference("FL-204", "Avery@Example.com ")).toBe(createBookingReference("FL-204", "avery@example.com"));
  });

  it("creates one deterministic operation ID for a valid demo booking", () => {
    const booking = completeDemoBooking({ flightId: "FL-204", travelerName: "Avery Chen", travelerEmail: "avery@example.com" });
    expect(booking.bookingReference).toMatch(/^FLB-[A-Z0-9]{7}$/);
    expect(booking.operationId).toMatch(/^op-[a-z0-9]{8}$/);
    expect(booking.amountCents).toBe(42800);
  });

  it("creates a different operation ID for a retry", () => {
    const input = { flightId: "FL-204", travelerName: "Avery Chen", travelerEmail: "avery@example.com" };
    expect(completeDemoBooking(input).operationId).not.toBe(completeDemoBooking(input, 1).operationId);
  });
});
