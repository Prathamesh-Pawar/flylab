import { describe, expect, it } from "vitest";
import { getFlight, searchFlights } from "@/lib/search";

describe("searchFlights", () => {
  it("returns the six deterministic SFO to JFK flights", () => {
    expect(searchFlights({ origin: "sfo", destination: "JFK", departureDate: "2026-09-04" })).toHaveLength(6);
  });

  it("does not invent unsupported routes or flight IDs", () => {
    expect(searchFlights({ origin: "SFO", destination: "LHR" })).toEqual([]);
    expect(getFlight("missing")).toBeUndefined();
  });
});
