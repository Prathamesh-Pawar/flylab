# FlightLab architecture

FlightLab is a compact Next.js App Router application built to be a victim app
for Opssemble. It has no account system, data store, airline inventory API, or
payment processor.

```text
Browser search and checkout UI
  -> deterministic search and booking libraries
  -> structured /api/telemetry runtime records

Opssemble / Fake Operations MCP
  -> demo-data/scenarios provider observations
```

The app flow is `/` → `/checkout/[flightId]` → `/booking/[bookingId]`.
`data/flights.ts` is the only source of flight inventory. `lib/booking.ts`
normalizes traveler email and derives a deterministic booking reference and
operation ID, which makes demo sessions and provider observations easy to
correlate without storing traveler data.

The telemetry endpoint only writes structured observations to the running
server's standard output. A local collector may ingest them, but FlightLab does
not retain them. Fixture reads belong to the Fake Operations MCP; they must not
be performed by planner-facing application code.
